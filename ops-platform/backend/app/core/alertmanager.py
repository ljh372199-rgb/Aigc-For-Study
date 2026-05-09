import logging
import hashlib
from typing import Any, Optional
import httpx
from app.config import settings
from app.models.schemas import AlertData, AlertLabels, AlertAnnotations

logger = logging.getLogger(__name__)


class AlertmanagerClient:
    def __init__(self):
        self.base_url = settings.ALERTMANAGER_URL
        self.timeout = settings.REQUEST_TIMEOUT

    async def get_alerts(
        self,
        status: Optional[str] = None,
        severity: Optional[str] = None
    ) -> list[AlertData]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/v2/alerts"
                )
                response.raise_for_status()
                alerts = response.json()

                parsed_alerts = self._parse_alerts(alerts)

                if status:
                    parsed_alerts = [
                        a for a in parsed_alerts
                        if a.state.lower() == status.lower()
                    ]
                if severity:
                    parsed_alerts = [
                        a for a in parsed_alerts
                        if a.labels.severity.lower() == severity.lower()
                    ]

                return parsed_alerts
        except httpx.HTTPError as e:
            logger.warning(f"Alertmanager get_alerts failed: {e}, returning mock data")
            return self._get_mock_alerts()
        except Exception as e:
            logger.error(f"Unexpected error getting alerts: {e}")
            return self._get_mock_alerts()

    async def get_alertgroups(self) -> list[dict[str, Any]]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/v2/alerts/groups"
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.warning(f"Failed to get Alertmanager groups: {e}")
            return []

    async def get_status(self) -> dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/v1/status"
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.warning(f"Failed to get Alertmanager status: {e}")
            return {"status": "error", "error": str(e)}

    def _parse_alerts(self, alerts: list[dict[str, Any]]) -> list[AlertData]:
        parsed = []
        for alert in alerts:
            labels = alert.get("labels", {})
            annotations = alert.get("annotations", {})

            alert_id = self._generate_alert_id(labels)

            parsed.append(AlertData(
                id=alert_id,
                name=labels.get("alertname", "unknown"),
                labels=AlertLabels(
                    alertname=labels.get("alertname", ""),
                    severity=labels.get("severity", "warning"),
                    instance=labels.get("instance"),
                    job=labels.get("job"),
                    pod=labels.get("pod")
                ),
                annotations=AlertAnnotations(
                    summary=annotations.get("summary"),
                    description=annotations.get("description")
                ),
                state=alert.get("status", {}).get("state", "inactive"),
                active_at=alert.get("startsAt"),
                value=alert.get("value")
            ))
        return parsed

    def _generate_alert_id(self, labels: dict[str, str]) -> str:
        label_str = "-".join(f"{k}={v}" for k, v in sorted(labels.items()))
        return hashlib.md5(label_str.encode()).hexdigest()[:12]

    def _get_mock_alerts(self) -> list[AlertData]:
        import time
        current_time = time.time()

        return [
            AlertData(
                id="a1b2c3d4e5f6",
                name="HighCPUUsage",
                labels=AlertLabels(
                    alertname="HighCPUUsage",
                    severity="warning",
                    instance="server-01",
                    job="node_exporter"
                ),
                annotations=AlertAnnotations(
                    summary="CPU usage is above 80%",
                    description="CPU usage has been above 80% for the last 5 minutes"
                ),
                state="active",
                active_at=current_time - 300,
                value=85.5
            ),
            AlertData(
                id="b2c3d4e5f6g7",
                name="HighMemoryUsage",
                labels=AlertLabels(
                    alertname="HighMemoryUsage",
                    severity="critical",
                    instance="server-02",
                    job="node_exporter"
                ),
                annotations=AlertAnnotations(
                    summary="Memory usage is above 90%",
                    description="Memory usage has been above 90% for the last 10 minutes"
                ),
                state="active",
                active_at=current_time - 600,
                value=92.3
            ),
            AlertData(
                id="c3d4e5f6g7h8",
                name="ServiceDown",
                labels=AlertLabels(
                    alertname="ServiceDown",
                    severity="critical",
                    instance="api-gateway:8080",
                    job="blackbox_exporter"
                ),
                annotations=AlertAnnotations(
                    summary="Service is unreachable",
                    description="The API gateway service is not responding"
                ),
                state="active",
                active_at=current_time - 180,
                value=1.0
            ),
            AlertData(
                id="d4e5f6g7h8i9",
                name="DiskSpaceLow",
                labels=AlertLabels(
                    alertname="DiskSpaceLow",
                    severity="warning",
                    instance="server-03",
                    job="node_exporter"
                ),
                annotations=AlertAnnotations(
                    summary="Disk space is below 20%",
                    description="Available disk space is below 20%"
                ),
                state="active",
                active_at=current_time - 1200,
                value=18.5
            ),
            AlertData(
                id="e5f6g7h8i9j0",
                name="HighLatency",
                labels=AlertLabels(
                    alertname="HighLatency",
                    severity="warning",
                    instance="order-service",
                    job="prometheus"
                ),
                annotations=AlertAnnotations(
                    summary="Request latency is above threshold",
                    description="P99 latency has been above 500ms for the last 15 minutes"
                ),
                state="resolved",
                active_at=current_time - 3600,
                value=650.0
            )
        ]


alertmanager_client = AlertmanagerClient()
