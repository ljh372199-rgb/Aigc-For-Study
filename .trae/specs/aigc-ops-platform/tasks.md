# Aigc For Study 运维平台实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建完整的运维平台，实现对 Aigc For Study 系统的全面监控、告警、日志分析和自动化运维

**Architecture:** 基于 Prometheus + Grafana + Loki + Alertmanager 的开源监控体系，采用 Docker Compose 部署，与现有系统无缝集成

**Tech Stack:** Prometheus, Grafana, Loki, Alertmanager, Node Exporter, cAdvisor, FastAPI, Docker Compose

---

## 1. 文件结构设计

在开始实施前，先规划好需要创建和修改的文件结构：

### 1.1 新建文件清单

```
ops/
├── docker-compose.ops.yml                    # 运维服务编排
├── prometheus/
│   ├── prometheus.yml                        # Prometheus 主配置
│   └── alert_rules/
│       ├── api_alerts.yml                    # API 告警规则
│       ├── system_alerts.yml                 # 系统告警规则
│       └── container_alerts.yml              # 容器告警规则
├── grafana/
│   ├── provisioning/
│   │   ├── dashboards/
│   │   │   └── dashboards.yaml               # 仪表盘配置
│   │   └── datasources/
│   │       └── datasources.yaml              # 数据源配置
│   └── dashboards/
│       ├── overview.json                     # 系统概览仪表盘
│       ├── api_metrics.json                 # API 指标仪表盘
│       └── system_metrics.json              # 系统指标仪表盘
├── loki/
│   └── loki-config.yml                      # Loki 配置
├── alertmanager/
│   └── alertmanager.yml                      # Alertmanager 配置
└── scripts/
    ├── setup-monitoring.sh                  # 监控安装脚本
    ├── auto-recovery.py                     # 自动恢复脚本
    └── log-analyzer.py                      # 日志分析工具

backend/app/
├── core/
│   ├── metrics.py                           # Prometheus 指标定义
│   └── logging.py                           # 结构化日志配置
├── api/v1/
│   └── monitoring.py                         # 监控相关 API
└── main.py                                  # 集成监控中间件

docs/
├── 运维平台使用手册.md                        # 运维手册
├── 监控指标说明文档.md                        # 指标说明
└── 故障排查指南.md                           # 故障排查
```

### 1.2 需要修改的文件

```
backend/app/main.py                           # 添加监控中间件
backend/app/core/config.py                    # 添加监控相关配置
docker-compose.staging.yml                    # 集成运维服务
docker-compose.production.yml                 # 集成运维服务
```

---

## 2. 实施任务分解

### 阶段一：运维平台基础设施 (Task 1-5)

### Task 1: 创建运维平台目录结构和 Docker Compose 配置

**Files:**
- Create: `ops/docker-compose.ops.yml`

- [ ] **Step 1: 创建 ops 目录**

Run: `mkdir -p ops/prometheus/alert_rules ops/grafana/provisioning/dashboards ops/grafana/provisioning/datasources ops/grafana/dashboards ops/loki ops/alertmanager ops/scripts`

Expected: 目录创建成功

- [ ] **Step 2: 创建 docker-compose.ops.yml**

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:v2.48.0
    container_name: aigc-prometheus
    restart: unless-stopped
    ports:
      - "29090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./prometheus/alert_rules:/etc/prometheus/alert_rules
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
      - '--web.enable-lifecycle'
    networks:
      - aigc-network

  grafana:
    image: grafana/grafana:10.2.0
    container_name: aigc-grafana
    restart: unless-stopped
    ports:
      - "23000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
      - grafana_data:/var/lib/grafana
    networks:
      - aigc-network

  loki:
    image: grafana/loki:2.9.0
    container_name: aigc-loki
    restart: unless-stopped
    ports:
      - "23100:3100"
    volumes:
      - ./loki/loki-config.yml:/etc/loki/local-config.yaml
      - loki_data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    networks:
      - aigc-network

  promtail:
    image: grafana/promtail:2.9.0
    container_name: aigc-promtail
    restart: unless-stopped
    volumes:
      - ./loki/promtail-config.yml:/etc/promtail/config.yml
      - /var/log:/var/log
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    command: -config.file=/etc/promtail/config.yml
    networks:
      - aigc-network

  alertmanager:
    image: prom/alertmanager:v0.26.0
    container_name: aigc-alertmanager
    restart: unless-stopped
    ports:
      - "29093:9093"
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    networks:
      - aigc-network

  node-exporter:
    image: prom/node-exporter:v1.6.1
    container_name: aigc-node-exporter
    restart: unless-stopped
    ports:
      - "29100:9100"
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--path.rootfs=/rootfs'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    networks:
      - aigc-network

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.47.2
    container_name: aigc-cadvisor
    restart: unless-stopped
    ports:
      - "29180:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    networks:
      - aigc-network

volumes:
  prometheus_data:
  grafana_data:
  loki_data:
  alertmanager_data:

networks:
  aigc-network:
    external: true
```

Expected: 文件创建成功

- [ ] **Step 3: 验证文件创建**

Run: `ls -la ops/`

Expected: 显示 ops 目录结构

- [ ] **Step 4: Commit**

Run: `cd /Users/prism/Program/Aigc\ For\ Study/Aigc-For-Study && git add ops/docker-compose.ops.yml && git commit -m "feat(ops): add ops platform docker-compose configuration"`

Expected: 提交成功

---

### Task 2: 配置 Prometheus

**Files:**
- Create: `ops/prometheus/prometheus.yml`
- Create: `ops/prometheus/alert_rules/api_alerts.yml`
- Create: `ops/prometheus/alert_rules/system_alerts.yml`
- Create: `ops/prometheus/alert_rules/container_alerts.yml`

- [ ] **Step 1: 创建 Prometheus 主配置文件**

```yaml
# ops/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

rule_files:
  - "alert_rules/*.yml"

scrape_configs:
  # Prometheus 自身
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node Exporter (系统指标)
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
    relabel_configs:
      - source_labels: [__address__]
        regex: '(.*):9100'
        replacement: '${1}'
        target_label: instance

  # cAdvisor (容器指标)
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
    metrics_path: '/metrics'

  # API 服务 (自定义指标)
  - job_name: 'api'
    static_configs:
      - targets: ['api:8000']
    metrics_path: '/metrics'
    scrape_interval: 10s
```

Expected: 配置文件创建成功

- [ ] **Step 2: 创建 API 告警规则**

```yaml
# ops/prometheus/alert_rules/api_alerts.yml
groups:
  - name: api_alerts
    interval: 30s
    rules:
      # P0 - API 服务不可用
      - alert: APIServiceDown
        expr: up{job="api"} == 0
        for: 1m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "API 服务不可用"
          description: "API 服务 {{ $labels.instance }} 已经宕机超过 1 分钟"
          suggestion: "立即检查 API 服务日志，执行 docker-compose restart api"

      # P0 - API 错误率过高
      - alert: HighAPIErrorRate
        expr: |
          (
            rate(http_requests_total{status=~"5.."}[5m])
            /
            rate(http_requests_total[5m])
          ) > 0.05
        for: 5m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "API 错误率过高"
          description: "API 5xx 错误率超过 5%，当前值: {{ $value | humanizePercentage }}"
          suggestion: "检查 API 日志，定位错误原因"

      # P1 - API 响应时间过长
      - alert: HighAPILatency
        expr: |
          histogram_quantile(0.99, 
            rate(http_request_duration_seconds_bucket{job="api"}[5m])
          ) > 3
        for: 5m
        labels:
          severity: high
          team: backend
        annotations:
          summary: "API P99 响应时间过长"
          description: "API P99 响应时间超过 3 秒，当前值: {{ $value | humanizeDuration }}"
          suggestion: "检查数据库查询和 AI API 延迟"

      # P1 - API 请求量异常
      - alert: APIRequestVolumeAnomaly
        expr: |
          rate(http_requests_total{job="api"}[5m]) < 0.1
        for: 10m
        labels:
          severity: high
          team: backend
        annotations:
          summary: "API 请求量异常低"
          description: "API 请求量异常低，可能存在服务问题"
          suggestion: "检查 API 服务状态和网络连接"

      # P2 - 数据库连接池耗尽
      - alert: DatabaseConnectionPoolExhausted
        expr: |
          (
            db_connection_pool_size{state="used"}
            /
            db_connection_pool_size{state="total"}
          ) > 0.8
        for: 5m
        labels:
          severity: medium
          team: backend
        annotations:
          summary: "数据库连接池使用率过高"
          description: "数据库连接池使用率超过 80%"
          suggestion: "检查慢查询，优化数据库连接"

      # P2 - Redis 连接失败
      - alert: RedisConnectionFailed
        expr: redis_connected_clients == 0
        for: 1m
        labels:
          severity: medium
          team: backend
        annotations:
          summary: "Redis 连接失败"
          description: "Redis 连接数为 0"
          suggestion: "检查 Redis 服务状态"

      # P3 - AI API 延迟高
      - alert: HighAIAPILatency
        expr: |
          histogram_quantile(0.95,
            rate(ai_api_latency_seconds_bucket[5m])
          ) > 30
        for: 5m
        labels:
          severity: low
          team: backend
        annotations:
          summary: "AI API 延迟过高"
          description: "AI API P95 延迟超过 30 秒"
          suggestion: "检查 DeepSeek API 服务状态"
```

Expected: API 告警规则创建成功

- [ ] **Step 3: 创建系统告警规则**

```yaml
# ops/prometheus/alert_rules/system_alerts.yml
groups:
  - name: system_alerts
    interval: 30s
    rules:
      # P1 - CPU 使用率过高
      - alert: HighCPUUsage
        expr: |
          100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: high
          team: ops
        annotations:
          summary: "CPU 使用率过高"
          description: "实例 {{ $labels.instance }} CPU 使用率超过 80%，当前值: {{ $value | humanize }}"
          suggestion: "检查运行中的进程，考虑扩容"

      # P2 - 内存使用率过高
      - alert: HighMemoryUsage
        expr: |
          (
            node_memory_MemTotal_bytes
            -
            node_memory_MemAvailable_bytes
          ) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: medium
          team: ops
        annotations:
          summary: "内存使用率过高"
          description: "实例 {{ $labels.instance }} 内存使用率超过 85%"
          suggestion: "检查内存泄漏，增加内存"

      # P2 - 磁盘空间不足
      - alert: DiskSpaceLow
        expr: |
          node_filesystem_avail_bytes{mountpoint="/"} 
          / node_filesystem_size_bytes{mountpoint="/"} < 0.1
        for: 5m
        labels:
          severity: medium
          team: ops
        annotations:
          summary: "根分区磁盘空间不足"
          description: "实例 {{ $labels.instance }} 根分区剩余空间不足 10%"
          suggestion: "清理日志文件，删除无用数据"

      # P2 - 磁盘 I/O 使用率高
      - alert: HighDiskIO
        expr: |
          rate(node_disk_io_time_seconds_total[5m]) * 100 > 80
        for: 5m
        labels:
          severity: medium
          team: ops
        annotations:
          summary: "磁盘 I/O 使用率过高"
          description: "实例 {{ $labels.instance }} 磁盘 I/O 使用率超过 80%"
          suggestion: "检查 I/O 密集型进程"

      # P3 - 系统负载高
      - alert: HighSystemLoad
        expr: |
          node_load1 / count(node_cpu_seconds_total{mode="idle"}) > 0.7
        for: 10m
        labels:
          severity: low
          team: ops
        annotations:
          summary: "系统负载过高"
          description: "实例 {{ $labels.instance }} 系统负载持续偏高"
          suggestion: "监控系统负载趋势"
```

Expected: 系统告警规则创建成功

- [ ] **Step 4: 创建容器告警规则**

```yaml
# ops/prometheus/alert_rules/container_alerts.yml
groups:
  - name: container_alerts
    interval: 30s
    rules:
      # P1 - 容器 CPU 使用率过高
      - alert: ContainerHighCPU
        expr: |
          rate(container_cpu_usage_seconds_total[5m]) 
          / container_spec_cpu_quota{container_label_com_docker_compose_service="api"}
          * 100 > 80
        for: 5m
        labels:
          severity: high
          team: ops
        annotations:
          summary: "容器 CPU 使用率过高"
          description: "容器 {{ $labels.container }} CPU 使用率超过限制的 80%"
          suggestion: "调整容器资源限制或扩容"

      # P2 - 容器内存使用率高
      - alert: ContainerHighMemory
        expr: |
          container_memory_usage_bytes
          / container_spec_memory_limit_bytes * 100 > 90
        for: 5m
        labels:
          severity: medium
          team: ops
        annotations:
          summary: "容器内存使用率过高"
          description: "容器 {{ $labels.container }} 内存使用率超过限制的 90%"
          suggestion: "增加容器内存限制或检查内存泄漏"

      # P2 - 容器重启频繁
      - alert: ContainerRestartingFrequently
        expr: |
          rate(container_restart_count[5m]) > 0.1
        for: 5m
        labels:
          severity: medium
          team: ops
        annotations:
          summary: "容器重启频繁"
          description: "容器 {{ $labels.container }} 频繁重启"
          suggestion: "检查容器健康状态和日志"

      # P3 - 容器网络流量异常
      - alert: ContainerNetworkAnomaly
        expr: |
          rate(container_network_receive_bytes_total[5m]) == 0
          and rate(container_network_transmit_bytes_total[5m]) == 0
        for: 10m
        labels:
          severity: low
          team: ops
        annotations:
          summary: "容器网络流量为零"
          description: "容器 {{ $labels.container }} 网络流量为零，可能存在网络问题"
          suggestion: "检查容器网络配置"
```

Expected: 容器告警规则创建成功

- [ ] **Step 5: Commit**

Run: `git add ops/prometheus/ && git commit -m "feat(ops): add Prometheus configuration and alert rules"`

Expected: 提交成功

---

### Task 3: 配置 Grafana

**Files:**
- Create: `ops/grafana/provisioning/dashboards/dashboards.yaml`
- Create: `ops/grafana/provisioning/datasources/datasources.yaml`
- Create: `ops/grafana/dashboards/overview.json`

- [ ] **Step 1: 创建仪表盘配置**

```yaml
# ops/grafana/provisioning/dashboards/dashboards.yaml
apiVersion: 1

providers:
  - name: 'Aigc For Study'
    orgId: 1
    folder: ''
    folderUid: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
```

Expected: 仪表盘配置创建成功

- [ ] **Step 2: 创建数据源配置**

```yaml
# ops/grafana/provisioning/datasources/datasources.yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    editable: false
```

Expected: 数据源配置创建成功

- [ ] **Step 3: 创建系统概览仪表盘**

```json
{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": "-- Grafana --",
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "gnetId": null,
  "graphTooltip": 0,
  "id": null,
  "links": [],
  "panels": [
    {
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "thresholds"
          },
          "mappings": [
            {
              "options": {
                "0": {
                  "text": "Down"
                },
                "1": {
                  "text": "Up"
                }
              },
              "type": "value"
            }
          ],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "red",
                "value": null
              },
              {
                "color": "green",
                "value": 1
              }
            ]
          }
        }
      },
      "gridPos": {
        "h": 4,
        "w": 4,
        "x": 0,
        "y": 0
      },
      "id": 1,
      "options": {
        "colorMode": "background",
        "graphMode": "none",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": ["lastNotNull"],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "8.0.0",
      "targets": [
        {
          "expr": "up{job='api'}",
          "refId": "A"
        }
      ],
      "title": "API 服务状态",
      "type": "stat"
    },
    {
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 10,
            "gradientMode": "none",
            "hideFrom": {
              "tooltip": false,
              "viz": false,
              "legend": false
            },
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "never",
            "spanNulls": true
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              }
            ]
          },
          "unit": "short"
        }
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 4,
        "y": 0
      },
      "id": 2,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom"
        },
        "tooltip": {
          "mode": "single"
        }
      },
      "pluginVersion": "8.0.0",
      "targets": [
        {
          "expr": "rate(http_requests_total{job='api'}[5m])",
          "legendFormat": "{{ method }} {{ endpoint }}",
          "refId": "A"
        }
      ],
      "title": "API 请求速率",
      "type": "timeseries"
    },
    {
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 10,
            "gradientMode": "none",
            "hideFrom": {
              "tooltip": false,
              "viz": false,
              "legend": false
            },
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "never",
            "spanNulls": true
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              }
            ]
          },
          "unit": "s"
        }
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 16,
        "y": 0
      },
      "id": 3,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom"
        },
        "tooltip": {
          "mode": "single"
        }
      },
      "pluginVersion": "8.0.0",
      "targets": [
        {
          "expr": "histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{job='api'}[5m]))",
          "legendFormat": "P99",
          "refId": "A"
        },
        {
          "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job='api'}[5m]))",
          "legendFormat": "P95",
          "refId": "B"
        },
        {
          "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket{job='api'}[5m]))",
          "legendFormat": "P50",
          "refId": "C"
        }
      ],
      "title": "API 响应时间",
      "type": "timeseries"
    },
    {
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 10,
            "gradientMode": "none",
            "hideFrom": {
              "tooltip": false,
              "viz": false,
              "legend": false
            },
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "never",
            "spanNulls": true
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              }
            ]
          },
          "unit": "percent"
        }
      },
      "gridPos": {
        "h": 8,
        "w": 8,
        "x": 0,
        "y": 8
      },
      "id": 4,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom"
        },
        "tooltip": {
          "mode": "single"
        }
      },
      "pluginVersion": "8.0.0",
      "targets": [
        {
          "expr": "100 - (avg by(instance) (rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
          "legendFormat": "{{ instance }}",
          "refId": "A"
        }
      ],
      "title": "CPU 使用率",
      "type": "timeseries"
    },
    {
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 10,
            "gradientMode": "none",
            "hideFrom": {
              "tooltip": false,
              "viz": false,
              "legend": false
            },
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "never",
            "spanNulls": true
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              }
            ]
          },
          "unit": "percent"
        }
      },
      "gridPos": {
        "h": 8,
        "w": 8,
        "x": 8,
        "y": 8
      },
      "id": 5,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom"
        },
        "tooltip": {
          "mode": "single"
        }
      },
      "pluginVersion": "8.0.0",
      "targets": [
        {
          "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
          "legendFormat": "{{ instance }}",
          "refId": "A"
        }
      ],
      "title": "内存使用率",
      "type": "timeseries"
    },
    {
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 10,
            "gradientMode": "none",
            "hideFrom": {
              "tooltip": false,
              "viz": false,
              "legend": false
            },
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "never",
            "spanNulls": true
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "yellow",
                "value": 80
              },
              {
                "color": "red",
                "value": 90
              }
            ]
          },
          "unit": "percent"
        }
      },
      "gridPos": {
        "h": 8,
        "w": 8,
        "x": 16,
        "y": 8
      },
      "id": 6,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom"
        },
        "tooltip": {
          "mode": "single"
        }
      },
      "pluginVersion": "8.0.0",
      "targets": [
        {
          "expr": "node_filesystem_avail_bytes{mountpoint=\"/\"} / node_filesystem_size_bytes{mountpoint=\"/\"} * 100",
          "legendFormat": "{{ instance }}",
          "refId": "A"
        }
      ],
      "title": "磁盘剩余空间",
      "type": "timeseries"
    }
  ],
  "refresh": "5s",
  "schemaVersion": 27,
  "style": "dark",
  "tags": ["aigc", "overview"],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-6h",
    "to": "now"
  },
  "timepicker": {},
  "timezone": "",
  "title": "Aigc For Study - 系统概览",
  "uid": "aigc-overview",
  "version": 1
}
```

Expected: 仪表盘 JSON 创建成功

- [ ] **Step 4: Commit**

Run: `git add ops/grafana/ && git commit -m "feat(ops): add Grafana dashboards and provisioning"`

Expected: 提交成功

---

### Task 4: 配置 Loki 和 Promtail

**Files:**
- Create: `ops/loki/loki-config.yml`
- Create: `ops/loki/promtail-config.yml`

- [ ] **Step 1: 创建 Loki 配置文件**

```yaml
# ops/loki/loki-config.yml
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    max_transfer_retries: 0
  wal:
    dir: /loki/wal
  chunk_target_size: 1048576
  chunk_idle_period: 15m
  chunk_retain_period: 30s
  max_chunk_age: 1h

schema_config:
  configs:
    - from: 2026-05-01
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/index
    cache_location: /loki/index_cache
    resync_interval: 5s
  filesystem:
    directory: /loki/chunks

limits_config:
  reject_old_samples: true
  reject_old_samples_max_age: 720h
  ingestion_rate_mb: 50
  ingestion_burst_size_mb: 100

chunk_store_config:
  max_look_back_period: 720h

table_manager:
  retention_deletes_enabled: true
  retention_period: 720h

compactor:
  working_directory: /loki/compactor
  compaction_interval: 10m
  retention_enabled: true
```

Expected: Loki 配置创建成功

- [ ] **Step 2: 创建 Promtail 配置文件**

```yaml
# ops/loki/promtail-config.yml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  # Docker 容器日志
  - job_name: containers
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: container
      - source_labels: ['__meta_docker_container_log_stream']
        target_label: logstream
    pipeline_stages:
      - json:
          expressions:
            timestamp: timestamp
            level: level
            message: message
            service: service
      - labels:
          level:
          service:
          container:

  # API 应用日志
  - job_name: api
    static_configs:
      - targets:
          - localhost
        labels:
          job: api
          environment: staging
          __path__: /var/log/api/*.log
    pipeline_stages:
      - json:
          expressions:
            timestamp: timestamp
            level: level
            message: message
            service: service
            trace_id: trace_id
            user_id: user_id
      - labels:
          level:
          service:
          environment:
```

Expected: Promtail 配置创建成功

- [ ] **Step 3: Commit**

Run: `git add ops/loki/ && git commit -m "feat(ops): add Loki and Promtail configuration"`

Expected: 提交成功

---

### Task 5: 配置 Alertmanager

**Files:**
- Create: `ops/alertmanager/alertmanager.yml`

- [ ] **Step 1: 创建 Alertmanager 配置**

```yaml
# ops/alertmanager/alertmanager.yml
global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.163.com:465'
  smtp_from: 'alert@aigcstudy.com'
  smtp_auth_username: 'alert@aigcstudy.com'
  smtp_auth_password: 'your-password'
  smtp_require_tls: false

template_files:
  - '/etc/alertmanager/templates/*.tmpl'

templates:
  - '/etc/alertmanager/templates/*.tmpl'

route:
  group_by: ['alertname', 'severity', 'team']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'default'
  routes:
    # P0 严重告警 - 立即通知
    - match:
        severity: critical
      receiver: 'critical-receiver'
      group_wait: 10s
      continue: true

    # P1 高优先级告警
    - match:
        severity: high
      receiver: 'high-receiver'
      continue: true

    # 系统告警
    - match:
        team: ops
      receiver: 'ops-receiver'

    # 应用告警
    - match:
        team: backend
      receiver: 'backend-receiver'

receivers:
  # 默认接收者
  - name: 'default'
    webhook_configs:
      - url: 'http://grafana:3000/api/alertmanager/grafana/api/v2/status'
        send_resolved: true

  # 严重告警接收者
  - name: 'critical-receiver'
    webhook_configs:
      - url: 'http://ops-api:8000/webhook/alert'
        send_resolved: true
    # 可以添加邮件、钉钉等配置
    email_configs:
      - to: 'oncall@aigcstudy.com'
        headers:
          subject: '【紧急】{{ .GroupLabels.alertname }}'

  # 高优先级告警接收者
  - name: 'high-receiver'
    webhook_configs:
      - url: 'http://ops-api:8000/webhook/alert'
        send_resolved: true
    email_configs:
      - to: 'team@aigcstudy.com'

  # 运维团队接收者
  - name: 'ops-receiver'
    webhook_configs:
      - url: 'http://ops-api:8000/webhook/alert'
        send_resolved: true

  # 后端团队接收者
  - name: 'backend-receiver'
    webhook_configs:
      - url: 'http://ops-api:8000/webhook/alert'
        send_resolved: true
    email_configs:
      - to: 'backend@aigcstudy.com'

inhibit_rules:
  # 当服务宕机时，抑制该服务的其他告警
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'high'
    equal: ['alertname', 'instance']

  # 同一实例的告警互相抑制
  - source_match:
      alertname: 'HighCPUUsage'
    target_match_re:
      alertname: 'High(Memory|Disk)'
    equal: ['instance']

  # 容器告警抑制
  - source_match:
      alertname: 'ContainerDown'
    target_match_re:
      alertname: 'Container(HighCPU|HighMemory)'
    equal: ['container']
```

Expected: Alertmanager 配置创建成功

- [ ] **Step 2: 创建告警模板**

Run: `mkdir -p ops/alertmanager/templates`

```bash
# ops/alertmanager/templates/alert.tmpl
{{ define "alert.title" }}
[{{ .Status | toUpper }}] {{ .GroupLabels.alertname }}
{{ end }}

{{ define "alert.text" }}
## {{ .GroupLabels.alertname }}

**状态:** {{ .Status | toUpper }}
**级别:** {{ .GroupLabels.severity }}
**团队:** {{ .GroupLabels.team }}
**时间:** {{ .StartsAt.Format "2006-01-02 15:04:05" }}

### 详细信息

{{ range .Alerts }}
**实例:** {{ .Labels.instance }}
**描述:** {{ .Annotations.description }}
**建议:** {{ .Annotations.suggestion }}

**当前值:**
```
{{ .Annotations.query }}
```
{{ end }}

---
发送自 Aigc For Study 监控系统
{{ end }}
```

Expected: 告警模板创建成功

- [ ] **Step 3: Commit**

Run: `git add ops/alertmanager/ && git commit -m "feat(ops): add Alertmanager configuration"`

Expected: 提交成功

---

### 阶段二：应用指标集成 (Task 6-8)

### Task 6: FastAPI 指标集成

**Files:**
- Create: `backend/app/core/metrics.py`
- Modify: `backend/app/main.py:1-15` (添加导入)
- Modify: `backend/app/main.py:16-22` (添加中间件)

- [ ] **Step 1: 创建 Prometheus 指标模块**

```python
# backend/app/core/metrics.py
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import APIRouter, Response
import time
import logging

logger = logging.getLogger(__name__)

REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency in seconds',
    ['method', 'endpoint'],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

ACTIVE_REQUESTS = Gauge(
    'http_active_requests',
    'Number of active HTTP requests',
    ['method', 'endpoint']
)

DB_CONNECTION_POOL_SIZE = Gauge(
    'db_connection_pool_size',
    'Database connection pool size',
    ['state']
)

DB_QUERY_DURATION = Histogram(
    'db_query_duration_seconds',
    'Database query duration in seconds',
    ['operation', 'table'],
    buckets=[0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0, 5.0]
)

REDIS_OPERATIONS = Counter(
    'redis_operations_total',
    'Total Redis operations',
    ['operation', 'status']
)

REDIS_OPERATION_DURATION = Histogram(
    'redis_operation_duration_seconds',
    'Redis operation duration in seconds',
    ['operation'],
    buckets=[0.001, 0.005, 0.01, 0.05, 0.1, 0.5]
)

AI_API_REQUESTS = Counter(
    'ai_api_requests_total',
    'Total AI API requests',
    ['provider', 'model', 'status']
)

AI_API_LATENCY = Histogram(
    'ai_api_latency_seconds',
    'AI API request latency in seconds',
    ['provider', 'model'],
    buckets=[1, 2, 5, 10, 20, 30, 60, 120, 300]
)

AI_API_ERRORS = Counter(
    'ai_api_errors_total',
    'Total AI API errors',
    ['provider', 'model', 'error_type']
)

router = APIRouter(prefix="/metrics", tags=["监控"])

@router.get("")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

def track_request(method: str, endpoint: str, status: int, duration: float):
    """Track HTTP request metrics"""
    REQUEST_COUNT.labels(
        method=method,
        endpoint=endpoint,
        status=str(status)
    ).inc()
    
    REQUEST_LATENCY.labels(
        method=method,
        endpoint=endpoint
    ).observe(duration)

def track_db_pool(state: str, size: int):
    """Track database connection pool"""
    DB_CONNECTION_POOL_SIZE.labels(state=state).set(size)

def track_db_query(operation: str, table: str, duration: float):
    """Track database query"""
    DB_QUERY_DURATION.labels(operation=operation, table=table).observe(duration)

def track_redis(operation: str, status: str, duration: float):
    """Track Redis operations"""
    REDIS_OPERATIONS.labels(operation=operation, status=status).inc()
    REDIS_OPERATION_DURATION.labels(operation=operation).observe(duration)

def track_ai_request(provider: str, model: str, status: str, latency: float):
    """Track AI API requests"""
    AI_API_REQUESTS.labels(provider=provider, model=model, status=status).inc()
    AI_API_LATENCY.labels(provider=provider, model=model).observe(latency)

def track_ai_error(provider: str, model: str, error_type: str):
    """Track AI API errors"""
    AI_API_ERRORS.labels(provider=provider, model=model, error_type=error_type).inc()
```

Expected: metrics.py 创建成功

- [ ] **Step 2: 创建监控中间件**

```python
# backend/app/core/monitoring.py
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.metrics import track_request, ACTIVE_REQUESTS
import time
import logging

logger = logging.getLogger(__name__)

class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 跳过 metrics 端点自身
        if request.url.path.startswith("/metrics"):
            return await call_next(request)
        
        # 记录开始时间
        start_time = time.time()
        
        # 增加活跃请求计数
        method = request.method
        endpoint = self._normalize_endpoint(request.url.path)
        
        ACTIVE_REQUESTS.labels(method=method, endpoint=endpoint).inc()
        
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            status_code = 500
            logger.error(f"Request error: {e}")
        finally:
            # 减少活跃请求计数
            ACTIVE_REQUESTS.labels(method=method, endpoint=endpoint).dec()
            
            # 计算持续时间
            duration = time.time() - start_time
            
            # 记录指标
            track_request(method, endpoint, status_code, duration)
        
        return response
    
    def _normalize_endpoint(self, path: str) -> str:
        """Normalize endpoint path to avoid high cardinality"""
        parts = path.split('/')
        normalized_parts = []
        
        for i, part in enumerate(parts):
            # 替换 UUID
            if len(part) == 36 and '-' in part:
                normalized_parts.append('{id}')
            # 替换数字 ID
            elif part.isdigit():
                normalized_parts.append('{id}')
            else:
                normalized_parts.append(part)
        
        return '/'.join(normalized_parts)
```

Expected: monitoring.py 创建成功

- [ ] **Step 3: 更新 main.py 集成监控**

Read: `backend/app/main.py`

Expected: 文件内容已读取

- [ ] **Step 4: 修改 main.py 添加监控**

```python
# backend/app/main.py (完整文件)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
import app.models
from app.api.v1 import (
    auth, users, careers, learning_plan, check_ins, 
    exercises, assignments, analytics, courses, homework
)
from app.core.metrics import router as metrics_router
from app.core.monitoring import MetricsMiddleware

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Aigc For Study API - AI驱动的学习平台",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# 添加监控中间件
app.add_middleware(MetricsMiddleware)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.DEBUG else settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册 API 路由
app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(users.router, prefix="/api/v1/users", tags=["用户"])
app.include_router(careers.router, prefix="/api/v1/careers", tags=["职业目标"])
app.include_router(learning_plan.router, prefix="/api/v1/learning-plans", tags=["学习方案"])
app.include_router(check_ins.router, prefix="/api/v1/check-ins", tags=["打卡"])
app.include_router(exercises.router, prefix="/api/v1/exercises", tags=["练习题"])
app.include_router(assignments.router, prefix="/api/v1/assignments", tags=["作业"])
app.include_router(courses.router, prefix="/api/v1/courses", tags=["课程"])
app.include_router(homework.router, prefix="/api/v1/homework", tags=["作业管理"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["统计"])

# 注册监控路由
app.include_router(metrics_router)

@app.get("/")
def root():
    return {"message": "Welcome to Aigc For Study API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/health/detailed")
def detailed_health_check():
    """详细健康检查端点"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "checks": {
            "database": check_database(),
            "redis": check_redis(),
        }
    }

def check_database():
    """检查数据库连接"""
    try:
        from app.core.database import engine
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return {"status": "healthy", "latency_ms": 0}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

def check_redis():
    """检查 Redis 连接"""
    try:
        import redis
        from app.core.config import settings
        r = redis.from_url(settings.REDIS_URL)
        r.ping()
        return {"status": "healthy", "latency_ms": 0}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
```

Expected: main.py 更新成功

- [ ] **Step 5: 添加 Prometheus 依赖**

Read: `backend/requirements.txt`

Expected: 文件已读取

- [ ] **Step 6: 更新 requirements.txt**

```python
# backend/requirements.txt (添加 prometheus-client)
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
sqlalchemy==2.0.25
asyncpg==0.29.0
psycopg2-binary==2.9.9
redis==5.0.1
httpx==0.26.0
python-dotenv==1.0.0
alembic==1.13.1
prometheus-client==0.19.0
pythonjsonlogger==2.0.7
```

Expected: requirements.txt 更新成功

- [ ] **Step 7: Commit**

Run: `git add backend/app/core/metrics.py backend/app/core/monitoring.py backend/app/main.py backend/requirements.txt && git commit -m "feat(ops): add Prometheus metrics integration for FastAPI"`

Expected: 提交成功

---

### Task 7: 结构化日志配置

**Files:**
- Create: `backend/app/core/logging.py`
- Modify: `backend/app/main.py` (添加日志配置)

- [ ] **Step 1: 创建结构化日志模块**

```python
# backend/app/core/logging.py
import logging
import sys
import json
from datetime import datetime
from typing import Any, Dict
import os

class CustomJsonFormatter(logging.Formatter):
    """自定义 JSON 日志格式化器"""
    
    def __init__(self, service_name: str = "api"):
        super().__init__()
        self.service_name = service_name
        self.environment = os.getenv('APP_ENV', 'development')
    
    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'service': self.service_name,
            'environment': self.environment,
        }
        
        # 添加 trace_id (如果存在)
        if hasattr(record, 'trace_id'):
            log_data['trace_id'] = record.trace_id
        
        # 添加 user_id (如果存在)
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        
        # 添加请求信息 (如果存在)
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        
        # 添加额外字段
        if hasattr(record, 'extra'):
            log_data['extra'] = record.extra
        
        # 添加异常信息
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)

def setup_logging():
    """配置应用日志"""
    log_level = os.getenv('LOG_LEVEL', 'INFO')
    service_name = os.getenv('SERVICE_NAME', 'api')
    
    # 获取根 logger
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # 清除现有 handlers
    logger.handlers.clear()
    
    # 创建 JSON handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(getattr(logging, log_level.upper()))
    handler.setFormatter(CustomJsonFormatter(service_name))
    
    logger.addHandler(handler)
    
    # 设置第三方库日志级别
    logging.getLogger('uvicorn.access').setLevel(logging.WARNING)
    logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
    
    return logger

def get_logger(name: str) -> logging.Logger:
    """获取 logger 实例"""
    return logging.getLogger(name)
```

Expected: logging.py 创建成功

- [ ] **Step 2: 更新 main.py 集成日志**

Read: `backend/app/main.py`

Expected: 文件已读取

- [ ] **Step 3: 修改 main.py 添加日志初始化**

```python
# backend/app/main.py (在顶部添加)
from app.core.logging import setup_logging, get_logger

# 初始化日志
setup_logging()
logger = get_logger(__name__)

# ... 其余代码保持不变 ...
```

Expected: 日志初始化添加成功

- [ ] **Step 4: Commit**

Run: `git add backend/app/core/logging.py && git commit -m "feat(ops): add structured logging with JSON format"`

Expected: 提交成功

---

### Task 8: 创建监控安装脚本

**Files:**
- Create: `ops/scripts/setup-monitoring.sh`

- [ ] **Step 1: 创建监控安装脚本**

```bash
#!/bin/bash
# ops/scripts/setup-monitoring.sh

set -e

ENV=${1:-staging}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPS_DIR="$(dirname "$SCRIPT_DIR")"

echo "========================================="
echo "  Aigc For Study 运维平台安装脚本"
echo "========================================="
echo ""
echo "目标环境: $ENV"
echo "安装目录: $OPS_DIR"
echo ""

# 检查 Docker 和 Docker Compose
check_dependencies() {
    echo "[1/5] 检查依赖..."
    
    if ! command -v docker &> /dev/null; then
        echo "错误: Docker 未安装"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "错误: Docker Compose 未安装"
        exit 1
    fi
    
    echo "✓ 依赖检查通过"
}

# 创建网络
setup_network() {
    echo ""
    echo "[2/5] 创建 Docker 网络..."
    
    if ! docker network ls | grep -q "aigc-network"; then
        docker network create aigc-network
        echo "✓ 网络创建成功"
    else
        echo "✓ 网络已存在"
    fi
}

# 创建必要的目录
setup_directories() {
    echo ""
    echo "[3/5] 创建数据目录..."
    
    mkdir -p "$OPS_DIR/prometheus/data"
    mkdir -p "$OPS_DIR/grafana/data"
    mkdir -p "$OPS_DIR/loki/data"
    mkdir -p "$OPS_DIR/loki/index"
    mkdir -p "$OPS_DIR/alertmanager/data"
    
    # 设置权限
    chmod 777 "$OPS_DIR/prometheus/data"
    chmod 777 "$OPS_DIR/grafana/data"
    chmod 777 "$OPS_DIR/loki/data"
    chmod 777 "$OPS_DIR/loki/index"
    chmod 777 "$OPS_DIR/alertmanager/data"
    
    echo "✓ 目录创建成功"
}

# 启动监控服务
start_services() {
    echo ""
    echo "[4/5] 启动监控服务..."
    
    cd "$OPS_DIR"
    docker-compose -f docker-compose.ops.yml up -d
    
    echo "✓ 监控服务启动成功"
}

# 验证服务
verify_services() {
    echo ""
    echo "[5/5] 验证服务状态..."
    
    sleep 5
    
    # 检查 Prometheus
    if curl -sf http://localhost:29090/-/healthy > /dev/null; then
        echo "✓ Prometheus: 运行中"
    else
        echo "✗ Prometheus: 未运行"
    fi
    
    # 检查 Grafana
    if curl -sf http://localhost:23000/api/health > /dev/null; then
        echo "✓ Grafana: 运行中"
    else
        echo "✗ Grafana: 未运行"
    fi
    
    # 检查 Loki
    if curl -sf http://localhost:23100/ready > /dev/null; then
        echo "✓ Loki: 运行中"
    else
        echo "✗ Loki: 未运行"
    fi
    
    # 检查 Alertmanager
    if curl -sf http://localhost:29093/-/healthy > /dev/null; then
        echo "✓ Alertmanager: 运行中"
    else
        echo "✗ Alertmanager: 未运行"
    fi
}

# 显示访问信息
show_access_info() {
    echo ""
    echo "========================================="
    echo "  安装完成！"
    echo "========================================="
    echo ""
    echo "服务访问地址:"
    echo "  - Grafana:     http://localhost:23000"
    echo "  - Prometheus:  http://localhost:29090"
    echo "  - Loki:        http://localhost:23100"
    echo "  - Alertmanager: http://localhost:29093"
    echo ""
    echo "默认账号:"
    echo "  - Grafana: admin / admin"
    echo ""
    echo "常用命令:"
    echo "  - 查看日志: docker-compose -f $OPS_DIR/docker-compose.ops.yml logs -f"
    echo "  - 重启服务: docker-compose -f $OPS_DIR/docker-compose.ops.yml restart"
    echo "  - 停止服务: docker-compose -f $OPS_DIR/docker-compose.ops.yml down"
    echo ""
}

# 主函数
main() {
    check_dependencies
    setup_network
    setup_directories
    start_services
    verify_services
    show_access_info
}

main "$@"
```

Expected: 安装脚本创建成功

- [ ] **Step 2: 设置脚本执行权限**

Run: `chmod +x ops/scripts/setup-monitoring.sh`

Expected: 权限设置成功

- [ ] **Step 3: Commit**

Run: `git add ops/scripts/setup-monitoring.sh && git commit -m "feat(ops): add monitoring setup script"`

Expected: 提交成功

---

### 阶段三：自动化运维 (Task 9-11)

### Task 9: 自动恢复脚本

**Files:**
- Create: `ops/scripts/auto-recovery.py`

- [ ] **Step 1: 创建自动恢复脚本**

```python
#!/usr/bin/env python3
# ops/scripts/auto-recovery.py

import asyncio
import logging
import os
import time
from dataclasses import dataclass
from typing import Dict, List, Optional
import httpx
import redis
import docker

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class ServiceConfig:
    name: str
    container_name: str
    health_check_url: str
    port: int
    max_retries: int = 3
    retry_interval: int = 10
    health_check_timeout: int = 5

class AutoRecovery:
    def __init__(self):
        self.docker_client = docker.from_env()
        self.redis_client = redis.from_url(
            os.getenv('REDIS_URL', 'redis://localhost:6379/0')
        )
        self.check_interval = int(os.getenv('CHECK_INTERVAL', '60'))
        
        # 定义需要监控的服务
        self.services = [
            ServiceConfig(
                name='api',
                container_name='aigc-api-staging',
                health_check_url='http://localhost:38000/health',
                port=38000
            ),
            ServiceConfig(
                name='web',
                container_name='aigc-web-staging',
                health_check_url='http://localhost:38010',
                port=38010
            ),
            ServiceConfig(
                name='db',
                container_name='aigc-db-staging',
                health_check_url=None,
                port=5432
            ),
            ServiceConfig(
                name='redis',
                container_name='aigc-redis-staging',
                health_check_url=None,
                port=6379
            ),
        ]
    
    async def check_health(self, service: ServiceConfig) -> bool:
        """检查服务健康状态"""
        try:
            if service.health_check_url:
                async with httpx.AsyncClient(timeout=service.health_check_timeout) as client:
                    response = await client.get(service.health_check_url)
                    return response.status_code == 200
            else:
                # Docker 容器健康检查
                try:
                    container = self.docker_client.containers.get(service.container_name)
                    return container.status == 'running'
                except docker.errors.NotFound:
                    return False
        except Exception as e:
            logger.warning(f"Health check failed for {service.name}: {e}")
            return False
    
    def restart_container(self, service: ServiceConfig) -> bool:
        """重启容器"""
        try:
            logger.info(f"Restarting {service.name}...")
            container = self.docker_client.containers.get(service.container_name)
            container.restart()
            
            # 记录重启事件
            self.log_event('restart', service.name, 'success')
            
            return True
        except Exception as e:
            logger.error(f"Failed to restart {service.name}: {e}")
            self.log_event('restart', service.name, 'failed', str(e))
            return False
    
    def log_event(self, event_type: str, service: str, status: str, detail: str = None):
        """记录事件到 Redis"""
        event_key = f"ops:event:{service}:{int(time.time())}"
        event_data = {
            'type': event_type,
            'service': service,
            'status': status,
            'detail': detail,
            'timestamp': time.time()
        }
        
        try:
            import json
            self.redis_client.hset(event_key, mapping={
                k: json.dumps(v) if isinstance(v, dict) else str(v) 
                for k, v in event_data.items()
            })
            self.redis_client.expire(event_key, 86400 * 7)  # 保留 7 天
        except Exception as e:
            logger.error(f"Failed to log event: {e}")
    
    async def recover_service(self, service: ServiceConfig) -> bool:
        """尝试恢复服务"""
        logger.info(f"Attempting to recover {service.name}...")
        
        for attempt in range(service.max_retries):
            logger.info(f"Recovery attempt {attempt + 1}/{service.max_retries} for {service.name}")
            
            # 尝试重启
            if self.restart_container(service):
                # 等待服务启动
                await asyncio.sleep(service.retry_interval)
                
                # 验证健康状态
                if await self.check_health(service):
                    logger.info(f"Service {service.name} recovered successfully")
                    return True
            
            await asyncio.sleep(service.retry_interval)
        
        logger.error(f"Failed to recover {service.name} after {service.max_retries} attempts")
        return False
    
    async def monitor_service(self, service: ServiceConfig):
        """监控单个服务"""
        while True:
            try:
                is_healthy = await self.check_health(service)
                
                if not is_healthy:
                    logger.warning(f"Service {service.name} is unhealthy")
                    await self.recover_service(service)
                
                await asyncio.sleep(self.check_interval)
            except asyncio.CancelledError:
                logger.info(f"Monitoring cancelled for {service.name}")
                break
            except Exception as e:
                logger.error(f"Error monitoring {service.name}: {e}")
                await asyncio.sleep(self.check_interval)
    
    async def run(self):
        """运行监控"""
        logger.info("Starting auto-recovery service...")
        logger.info(f"Monitoring {len(self.services)} services")
        
        # 创建监控任务
        tasks = [
            asyncio.create_task(self.monitor_service(service))
            for service in self.services
        ]
        
        try:
            await asyncio.gather(*tasks)
        except KeyboardInterrupt:
            logger.info("Shutting down...")
            for task in tasks:
                task.cancel()

def main():
    recovery = AutoRecovery()
    asyncio.run(recovery.run())

if __name__ == '__main__':
    main()
```

Expected: auto-recovery.py 创建成功

- [ ] **Step 2: 设置脚本执行权限**

Run: `chmod +x ops/scripts/auto-recovery.py`

Expected: 权限设置成功

- [ ] **Step 3: Commit**

Run: `git add ops/scripts/auto-recovery.py && git commit -m "feat(ops): add auto-recovery script"`

Expected: 提交成功

---

### Task 10: 运维 API 服务

**Files:**
- Create: `ops/src/ops_api/`
- Create: `ops/src/ops_api/main.py`
- Create: `ops/src/ops_api/api/`
- Create: `ops/src/ops_api/api/webhooks.py`

- [ ] **Step 1: 创建运维 API 主文件**

```python
# ops/src/ops_api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.api.webhooks import router as webhook_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Aigc For Study 运维 API",
    version="1.0.0",
    description="运维平台后端 API"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(webhook_router)

@app.get("/")
def root():
    return {"message": "Aigc For Study Ops API", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

Expected: main.py 创建成功

- [ ] **Step 2: 创建 Webhook 处理模块**

```python
# ops/src/ops_api/api/webhooks.py
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
import httpx
import os

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhook", tags=["Webhooks"])

class Alert(BaseModel):
    status: str
    labels: Dict[str, str]
    annotations: Dict[str, str]
    startsAt: str
    endsAt: str
    generatorURL: Optional[str] = None

class AlertPayload(BaseModel):
    version: str
    groupKey: str
    status: str
    receiver: str
    groupLabels: Dict[str, str]
    commonLabels: Dict[str, str]
    commonAnnotations: Dict[str, str]
    externalURL: str
    alerts: List[Alert]

class WebhookResponse(BaseModel):
    received: bool
    message: str

@router.post("/alert", response_model=WebhookResponse)
async def handle_alert(payload: AlertPayload):
    """处理 Alertmanager 告警通知"""
    try:
        logger.info(f"Received alert: {payload.status} - {payload.commonLabels.get('alertname', 'unknown')}")
        
        # 处理每个告警
        for alert in payload.alerts:
            logger.info(f"Alert: {alert.labels.get('alertname')} - {alert.status}")
            
            # 记录告警到日志
            if alert.status == "firing":
                logger.warning(
                    f"FIRING: {alert.labels.get('alertname')} "
                    f"severity={alert.labels.get('severity')} "
                    f"description={alert.annotations.get('description', 'N/A')}"
                )
                
                # 可以在这里添加额外的处理逻辑
                # 例如：发送钉钉通知、创建工单等
                await send_dingtalk_notification(alert)
                
            elif alert.status == "resolved":
                logger.info(
                    f"RESOLVED: {alert.labels.get('alertname')} "
                    f"severity={alert.labels.get('severity')}"
                )
        
        return WebhookResponse(received=True, message="Alert processed successfully")
    
    except Exception as e:
        logger.error(f"Error processing alert: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def send_dingtalk_notification(alert: Alert):
    """发送钉钉通知"""
    webhook_url = os.getenv('DINGTALK_WEBHOOK_URL')
    
    if not webhook_url:
        logger.warning("DINGTALK_WEBHOOK_URL not configured")
        return
    
    try:
        # 构建消息内容
        message = {
            "msgtype": "markdown",
            "markdown": {
                "title": f"【{alert.labels.get('severity', 'info').upper()}】{alert.labels.get('alertname')}",
                "text": f"## 🚨 {alert.labels.get('alertname')}\n\n"
                       f"**级别:** {alert.labels.get('severity', 'unknown')}\n"
                       f"**团队:** {alert.labels.get('team', 'unknown')}\n\n"
                       f"**描述:** {alert.annotations.get('description', 'N/A')}\n\n"
                       f"**建议:** {alert.annotations.get('suggestion', 'N/A')}\n\n"
                       f"**实例:** {alert.labels.get('instance', 'N/A')}\n\n"
                       f"---\n发送自 Aigc For Study 监控系统"
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(webhook_url, json=message)
            response.raise_for_status()
            
        logger.info(f"Dingtalk notification sent for {alert.labels.get('alertname')}")
    
    except Exception as e:
        logger.error(f"Failed to send Dingtalk notification: {e}")

@router.post("/test")
async def test_webhook():
    """测试 Webhook"""
    return {"status": "ok", "message": "Webhook is working"}
```

Expected: webhooks.py 创建成功

- [ ] **Step 3: 创建 requirements.txt**

```python
# ops/src/ops_api/requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
httpx==0.26.0
pydantic==2.5.3
redis==5.0.1
python-dotenv==1.0.0
```

Expected: requirements.txt 创建成功

- [ ] **Step 4: Commit**

Run: `git add ops/src/ops_api/ && git commit -m "feat(ops): add ops API service for webhook handling"`

Expected: 提交成功

---

### Task 11: 更新 Docker Compose 集成运维服务

**Files:**
- Modify: `docker-compose.staging.yml` (添加运维网络和依赖)
- Modify: `docker-compose.production.yml` (添加运维网络和依赖)

- [ ] **Step 1: 更新 staging docker-compose**

Read: `docker-compose.staging.yml`

Expected: 文件已读取

- [ ] **Step 2: 修改 staging docker-compose**

```yaml
version: '3.8'

services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: aigc-api-staging
    restart: unless-stopped
    ports:
      - "38000:8000"
    environment:
      - APP_ENV=staging
      - APP_PORT=38000
      - DATABASE_URL=${DATABASE_URL:-postgresql://aigc:aigc@db:5432/aigc_staging}
      - REDIS_URL=${REDIS_URL:-redis://redis:6379/0}
      - AI_PROVIDER=${AI_PROVIDER:-deepseek}
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - DEEPSEEK_MODEL=${DEEPSEEK_MODEL:-deepseek-chat}
      - DEEPSEEK_BASE_URL=${DEEPSEEK_BASE_URL:-https://api.deepseek.com}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - LOG_LEVEL=${LOG_LEVEL:-INFO}
      - SERVICE_NAME=api
    volumes:
      - uploads_staging:/app/uploads
      - ./backend/logs:/app/logs
    depends_on:
      - db
      - redis
    networks:
      - aigc-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: aigc-web-staging
    restart: unless-stopped
    ports:
      - "38010:80"
    environment:
      - VITE_API_BASE_URL=http://124.223.78.206:38000/api/v1
      - VITE_APP_ENV=staging
    volumes:
      - uploads_staging:/app/uploads
    depends_on:
      - api
    networks:
      - aigc-network

  db:
    image: postgres:15-alpine
    container_name: aigc-db-staging
    restart: unless-stopped
    environment:
      - POSTGRES_USER=aigc
      - POSTGRES_PASSWORD=aigc
      - POSTGRES_DB=aigc_staging
    volumes:
      - postgres_data_staging:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    networks:
      - aigc-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U aigc"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: aigc-redis-staging
    restart: unless-stopped
    ports:
      - "6380:6379"
    volumes:
      - redis_data_staging:/data
    networks:
      - aigc-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data_staging:
  redis_data_staging:
  uploads_staging:

networks:
  aigc-network:
    name: aigc-network
    driver: bridge
    external: false
```

Expected: staging docker-compose 更新成功

- [ ] **Step 3: 更新 production docker-compose**

Read: `docker-compose.production.yml`

Expected: 文件已读取

- [ ] **Step 4: 修改 production docker-compose**

```yaml
version: '3.8'

services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: aigc-api-production
    restart: unless-stopped
    ports:
      - "38001:8000"
    environment:
      - APP_ENV=production
      - APP_PORT=38001
      - DATABASE_URL=${DATABASE_URL:-postgresql://aigc:aigc@db:5432/aigc_prod}
      - REDIS_URL=${REDIS_URL:-redis://redis:6379/0}
      - AI_PROVIDER=${AI_PROVIDER:-deepseek}
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - DEEPSEEK_MODEL=${DEEPSEEK_MODEL:-deepseek-chat}
      - DEEPSEEK_BASE_URL=${DEEPSEEK_BASE_URL:-https://api.deepseek.com}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - LOG_LEVEL=${LOG_LEVEL:-WARNING}
      - SERVICE_NAME=api
    volumes:
      - uploads_production:/app/uploads
      - ./backend/logs:/app/logs
    depends_on:
      - db
      - redis
    networks:
      - aigc-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: aigc-web-production
    restart: unless-stopped
    ports:
      - "38002:80"
    environment:
      - VITE_API_BASE_URL=http://124.223.78.206:38001/api/v1
      - VITE_APP_ENV=production
    volumes:
      - uploads_production:/app/uploads
    depends_on:
      - api
    networks:
      - aigc-network

  db:
    image: postgres:15-alpine
    container_name: aigc-db-production
    restart: unless-stopped
    environment:
      - POSTGRES_USER=aigc
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=aigc_prod
    volumes:
      - postgres_data_production:/var/lib/postgresql/data
    ports:
      - "5434:5432"
    networks:
      - aigc-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U aigc"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: aigc-redis-production
    restart: unless-stopped
    ports:
      - "6381:6379"
    volumes:
      - redis_data_production:/data
    networks:
      - aigc-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data_production:
  redis_data_production:
  uploads_production:

networks:
  aigc-network:
    name: aigc-network
    driver: bridge
    external: false
```

Expected: production docker-compose 更新成功

- [ ] **Step 5: Commit**

Run: `git add docker-compose.staging.yml docker-compose.production.yml && git commit -m "feat(ops): integrate with ops monitoring network"`

Expected: 提交成功

---

### 阶段四：文档编写 (Task 12-14)

### Task 12: 编写运维平台使用手册

**Files:**
- Create: `docs/运维平台使用手册.md`

- [ ] **Step 1: 创建运维手册**

```markdown
# Aigc For Study 运维平台使用手册

**版本:** v1.0
**更新日期:** 2026-05-09

---

## 1. 平台概述

### 1.1 平台功能

Aigc For Study 运维平台提供以下核心功能：

- **实时监控**: 对 API、Web、数据库、Redis 等服务进行实时监控
- **指标可视化**: 通过 Grafana 仪表盘展示系统运行状态
- **智能告警**: 多级别告警，支持钉钉、邮件等通知渠道
- **日志分析**: 集中日志收集，支持全文搜索和统计分析
- **自动恢复**: 服务异常自动检测和恢复

### 1.2 访问地址

| 服务 | 地址 | 账号 |
|------|------|------|
| Grafana | http://124.223.78.206:23000 | admin/admin |
| Prometheus | http://124.223.78.206:29090 | - |
| Loki | http://124.223.78.206:23100 | - |
| Alertmanager | http://124.223.78.206:29093 | - |

---

## 2. Grafana 仪表盘使用

### 2.1 系统概览仪表盘

访问 Grafana 后，默认显示系统概览仪表盘，包含以下信息：

- **服务状态卡片**: 显示 API、Web 等服务的实时状态
- **请求速率图**: 展示 API 请求量随时间变化
- **响应时间图**: 展示 P50/P95/P99 响应时间
- **资源使用图**: CPU、内存、磁盘使用情况

### 2.2 常用查询

#### 查看 API 请求量

```promql
rate(http_requests_total{job="api"}[5m])
```

#### 查看 P99 响应时间

```promql
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{job="api"}[5m]))
```

#### 查看错误率

```promql
(
  rate(http_requests_total{status=~"5.."}[5m])
  /
  rate(http_requests_total[5m])
) * 100
```

---

## 3. 告警管理

### 3.1 告警级别

| 级别 | 说明 | 通知方式 |
|------|------|----------|
| Critical (P0) | 服务不可用 | 钉钉 + 邮件 |
| High (P1) | 核心功能受损 | 钉钉 + 邮件 |
| Medium (P2) | 非核心异常 | 邮件 |
| Low (P3) | 轻微问题 | 仅记录 |

### 3.2 查看告警

访问 Alertmanager: http://124.223.78.206:29093

查看当前告警状态和历史告警。

### 3.3 告警处理流程

1. 收到告警通知
2. 登录 Grafana 查看相关指标
3. 查看服务日志定位问题
4. 执行恢复操作或联系开发团队
5. 在 Alertmanager 中确认告警已处理

---

## 4. 日志查询

### 4.1 访问 Loki

Grafana 中选择 Loki 数据源即可查询日志。

### 4.2 常用日志查询

#### 查询错误日志

```logql
{job="api"} |= "ERROR"
```

#### 查询特定用户日志

```logql
{job="api"} | json | user_id="user-uuid"
```

#### 查询慢请求 (> 3秒)

```logql
{job="api"} | json | duration_ms > 3000
```

#### 查询 AI API 日志

```logql
{job="api"} |= "ai_api"
```

---

## 5. 服务管理

### 5.1 服务状态检查

```bash
# 查看所有服务状态
docker-compose -f docker-compose.staging.yml ps

# 查看特定服务日志
docker-compose -f docker-compose.staging.yml logs -f api
```

### 5.2 服务重启

```bash
# 重启 API 服务
docker-compose -f docker-compose.staging.yml restart api

# 重启所有服务
docker-compose -f docker-compose.staging.yml restart
```

### 5.3 健康检查

```bash
# 检查 API 健康状态
curl http://localhost:38000/health

# 检查详细健康状态
curl http://localhost:38000/health/detailed
```

---

## 6. 故障排查

### 6.1 服务无响应

1. 检查服务状态: `docker-compose ps`
2. 查看服务日志: `docker-compose logs -f api`
3. 检查资源使用: Grafana 仪表盘
4. 重启服务: `docker-compose restart api`

### 6.2 响应时间过长

1. 检查数据库查询时间
2. 检查 AI API 延迟
3. 查看慢查询日志
4. 检查系统资源

### 6.3 告警频繁触发

1. 调整告警阈值
2. 添加告警抑制规则
3. 优化服务配置

---

## 7. 自动化运维

### 7.1 自动恢复服务

自动恢复服务会监控服务状态，异常时自动重启：

```bash
# 启动自动恢复
python ops/scripts/auto-recovery.py

# 后台运行
nohup python ops/scripts/auto-recovery.py > auto-recovery.log 2>&1 &
```

### 7.2 日志分析工具

```bash
# 分析错误日志
python ops/scripts/log-analyzer.py --level ERROR

# 分析慢请求
python ops/scripts/log-analyzer.py --slow --threshold 3000
```

---

## 8. 附录

### 8.1 常用命令

```bash
# 启动监控服务
docker-compose -f ops/docker-compose.ops.yml up -d

# 停止监控服务
docker-compose -f ops/docker-compose.ops.yml down

# 查看监控日志
docker-compose -f ops/docker-compose.ops.yml logs -f

# 重启监控服务
docker-compose -f ops/docker-compose.ops.yml restart
```

### 8.2 配置文件位置

```
ops/
├── docker-compose.ops.yml
├── prometheus/prometheus.yml
├── prometheus/alert_rules/
├── grafana/
│   ├── provisioning/
│   └── dashboards/
├── loki/
│   ├── loki-config.yml
│   └── promtail-config.yml
└── alertmanager/
    └── alertmanager.yml
```

---

**文档变更记录**

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0 | 2026-05-09 | 初始版本 | AIGC Ops Team |
```

Expected: 运维手册创建成功

- [ ] **Step 2: Commit**

Run: `git add docs/运维平台使用手册.md && git commit -m "docs(ops): add ops platform user manual"`

Expected: 提交成功

---

### Task 13: 编写监控指标说明文档

**Files:**
- Create: `docs/监控指标说明文档.md`

- [ ] **Step 1: 创建监控指标文档**

```markdown
# Aigc For Study 监控指标说明

**版本:** v1.0
**更新日期:** 2026-05-09

---

## 1. 指标概述

### 1.1 指标来源

| 来源 | 说明 | 采集方式 |
|------|------|----------|
| Node Exporter | 系统级指标 | Prometheus 自动采集 |
| cAdvisor | 容器指标 | Prometheus 自动采集 |
| FastAPI 应用 | 自定义指标 | /metrics 端点 |
| PostgreSQL | 数据库指标 | postgres_exporter |
| Redis | 缓存指标 | redis_exporter |

### 1.2 指标命名规范

所有指标遵循 Prometheus 命名规范：

```
<namespace>_<name>_<unit>_<type>
```

示例：
- `http_requests_total` - HTTP 请求总数
- `http_request_duration_seconds` - HTTP 请求持续时间
- `node_memory_usage_percent` - 节点内存使用百分比

---

## 2. 应用指标

### 2.1 HTTP 指标

#### http_requests_total

**类型:** Counter
**说明:** HTTP 请求总数
**标签:**
- `method`: GET, POST, PUT, DELETE
- `endpoint`: 请求路径
- `status`: HTTP 状态码

**示例查询:**
```promql
# 总请求量
sum(http_requests_total)

# 各状态码请求量
sum by(status) (http_requests_total)
```

#### http_request_duration_seconds

**类型:** Histogram
**说明:** HTTP 请求持续时间
**标签:**
- `method`: GET, POST, PUT, DELETE
- `endpoint`: 请求路径

**Buckets:** 0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0 秒

**示例查询:**
```promql
# P99 响应时间
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# 平均响应时间
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

#### http_active_requests

**类型:** Gauge
**说明:** 当前活跃的 HTTP 请求数
**标签:**
- `method`: GET, POST, PUT, DELETE
- `endpoint`: 请求路径

### 2.2 数据库指标

#### db_connection_pool_size

**类型:** Gauge
**说明:** 数据库连接池大小
**标签:**
- `state`: used, total, idle

#### db_query_duration_seconds

**类型:** Histogram
**说明:** 数据库查询持续时间
**标签:**
- `operation`: SELECT, INSERT, UPDATE, DELETE
- `table`: 表名

### 2.3 Redis 指标

#### redis_operations_total

**类型:** Counter
**说明:** Redis 操作总数
**标签:**
- `operation`: get, set, del, etc.
- `status`: success, error

#### redis_operation_duration_seconds

**类型:** Histogram
**说明:** Redis 操作持续时间

### 2.4 AI API 指标

#### ai_api_requests_total

**类型:** Counter
**说明:** AI API 请求总数
**标签:**
- `provider`: deepseek, openai, anthropic
- `model`: 模型名称
- `status`: success, error

#### ai_api_latency_seconds

**类型:** Histogram
**说明:** AI API 响应延迟
**标签:**
- `provider`: deepseek, openai, anthropic
- `model`: 模型名称

**Buckets:** 1, 2, 5, 10, 20, 30, 60, 120, 300 秒

#### ai_api_errors_total

**类型:** Counter
**说明:** AI API 错误总数
**标签:**
- `provider`: deepseek, openai, anthropic
- `model`: 模型名称
- `error_type`: timeout, rate_limit, invalid_request, etc.

---

## 3. 系统指标

### 3.1 CPU 指标

#### node_cpu_usage

**类型:** Gauge
**说明:** CPU 使用率 (百分比)
**计算方式:** `100 - (idle_time / total_time) * 100`

### 3.2 内存指标

#### node_memory_usage

**类型:** Gauge
**说明:** 内存使用率 (百分比)
**计算方式:** `(total - available) / total * 100`

### 3.3 磁盘指标

#### node_disk_usage

**类型:** Gauge
**说明:** 磁盘使用率 (百分比)
**标签:**
- `mountpoint`: 挂载点

### 3.4 网络指标

#### node_network_receive_bytes

**类型:** Counter
**说明:** 网络接收字节数

#### node_network_transmit_bytes

**类型:** Counter
**说明:** 网络发送字节数

---

## 4. 容器指标

### 4.1 CPU 指标

#### container_cpu_usage_seconds

**类型:** Counter
**说明:** 容器 CPU 使用秒数

### 4.2 内存指标

#### container_memory_usage_bytes

**类型:** Gauge
**说明:** 容器内存使用字节数

### 4.3 网络指标

#### container_network_receive_bytes_total

**类型:** Counter
**说明:** 容器网络接收字节数

#### container_network_transmit_bytes_total

**类型:** Counter
**说明:** 容器网络发送字节数

---

## 5. 告警阈值

### 5.1 P0 级别 (Critical)

| 指标 | 条件 | 持续时间 |
|------|------|----------|
| up{job="api"} | == 0 | 1m |
| HTTP 错误率 | > 5% | 5m |

### 5.2 P1 级别 (High)

| 指标 | 条件 | 持续时间 |
|------|------|----------|
| API P99 延迟 | > 3s | 5m |
| CPU 使用率 | > 80% | 5m |
| 内存使用率 | > 85% | 5m |

### 5.3 P2 级别 (Medium)

| 指标 | 条件 | 持续时间 |
|------|------|----------|
| 数据库连接池 | > 80% | 5m |
| 磁盘使用率 | > 90% | 5m |
| 容器内存 | > 90% 限制 | 5m |

---

## 6. 最佳实践

### 6.1 查询优化

1. 使用 rate() 函数计算速率
2. 使用 histogram_quantile() 计算分位数
3. 避免使用 `*` 查询所有指标
4. 合理使用标签过滤

### 6.2 告警优化

1. 设置合理的持续时间 (for)
2. 使用抑制规则避免告警风暴
3. 根据实际业务调整阈值
4. 定期审查告警规则

---

**文档变更记录**

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0 | 2026-05-09 | 初始版本 | AIGC Ops Team |
```

Expected: 监控指标文档创建成功

- [ ] **Step 2: Commit**

Run: `git add docs/监控指标说明文档.md && git commit -m "docs(ops): add monitoring metrics reference documentation"`

Expected: 提交成功

---

### Task 14: 编写故障排查指南

**Files:**
- Create: `docs/故障排查指南.md`

- [ ] **Step 1: 创建故障排查指南**

```markdown
# Aigc For Study 故障排查指南

**版本:** v1.0
**更新日期:** 2026-05-09

---

## 1. 常见问题快速定位

### 1.1 服务无法访问

**症状:** 无法访问 API 或 Web 服务

**排查步骤:**

1. **检查服务状态**
```bash
docker-compose -f docker-compose.staging.yml ps
```

2. **检查端口占用**
```bash
netstat -tlnp | grep 38000
```

3. **查看服务日志**
```bash
docker-compose -f docker-compose.staging.yml logs api
```

4. **检查资源使用**
- 访问 Grafana 查看 CPU、内存使用情况
- 检查磁盘空间是否充足

**常见原因:**
- 服务未启动
- 端口被占用
- 防火墙阻止
- 资源不足

### 1.2 响应时间过长

**症状:** API 响应时间超过正常范围

**排查步骤:**

1. **检查数据库性能**
```bash
# 查看慢查询
docker-compose -f docker-compose.staging.yml exec db \
  psql -U aigc -d aigc_staging -c \
  "SELECT * FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 seconds';"
```

2. **检查 Redis 状态**
```bash
docker-compose -f docker-compose.staging.yml exec redis redis-cli info
```

3. **检查 AI API 延迟**
- 在 Grafana 中查看 `ai_api_latency_seconds` 指标
- 检查 DeepSeek API 服务状态

4. **查看详细日志**
```bash
docker-compose -f docker-compose.staging.yml logs api | grep -i "slow"
```

**常见原因:**
- 数据库慢查询
- Redis 连接问题
- AI API 延迟
- 网络问题

### 1.3 告警频繁触发

**症状:** 同一告警反复触发

**排查步骤:**

1. **检查告警配置**
```bash
curl http://localhost:29093/api/v1/alerts
```

2. **查看告警历史**
- 访问 Alertmanager 查看告警历史
- 分析告警触发频率

3. **调整告警阈值**
- 编辑 `ops/prometheus/alert_rules/*.yml`
- 调整 `for` 持续时间

4. **添加告警抑制**
- 编辑 `ops/alertmanager/alertmanager.yml`
- 添加 `inhibit_rules`

**常见原因:**
- 告警阈值设置过低
- 服务不稳定
- 需要添加抑制规则

---

## 2. 数据库问题

### 2.1 连接池耗尽

**症状:** API 无法连接数据库

**排查步骤:**

1. **检查当前连接数**
```bash
docker-compose -f docker-compose.staging.yml exec db \
  psql -U aigc -d aigc_staging -c \
  "SELECT count(*) FROM pg_stat_activity;"
```

2. **查看连接池状态**
- Grafana: `db_connection_pool_size` 指标

3. **检查慢查询**
```bash
docker-compose -f docker-compose.staging.yml exec db \
  psql -U aigc -d aigc_staging -c \
  "SELECT pid, query, query_start FROM pg_stat_activity WHERE state = 'active' ORDER BY query_start;"
```

4. **杀死长时间运行的查询**
```bash
docker-compose -f docker-compose.staging.yml exec db \
  psql -U aigc -d aigc_staging -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '10 minutes';"
```

**解决方案:**
- 增加连接池大小
- 优化慢查询
- 添加连接超时

### 2.2 数据库性能下降

**症状:** 查询响应时间明显变慢

**排查步骤:**

1. **查看表大小**
```sql
SELECT table_name, pg_size_pretty(pg_total_relation_size(quote_ident(table_name)))
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;
```

2. **检查索引使用情况**
```sql
SELECT indexrelname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

3. **重建索引**
```sql
REINDEX INDEX CONCURRENTLY index_name;
```

4. **VACUUM 清理**
```bash
docker-compose -f docker-compose.staging.yml exec db \
  psql -U aigc -d aigc_staging -c "VACUUM ANALYZE;"
```

---

## 3. Redis 问题

### 3.1 连接失败

**症状:** Redis 连接错误

**排查步骤:**

1. **检查 Redis 状态**
```bash
docker-compose -f docker-compose.staging.yml exec redis redis-cli ping
```

2. **查看 Redis 日志**
```bash
docker-compose -f docker-compose.staging.yml logs redis
```

3. **检查内存使用**
```bash
docker-compose -f docker-compose.staging.yml exec redis redis-cli info memory
```

**解决方案:**
- 重启 Redis 服务
- 清理内存: `redis-cli FLUSHDB`
- 增加内存限制

### 3.2 内存不足

**症状:** Redis 报错 "OOM"

**排查步骤:**

1. **查看内存使用**
```bash
docker-compose -f docker-compose.staging.yml exec redis redis-cli info memory
```

2. **查看大 Key**
```bash
docker-compose -f docker-compose.staging.yml exec redis redis-cli \
  --bigkeys
```

3. **设置内存策略**
```bash
docker-compose -f docker-compose.staging.yml exec redis redis-cli \
  config set maxmemory-policy allkeys-lru
```

---

## 4. 监控问题

### 4.1 Prometheus 无法采集指标

**症状:** Grafana 显示 "No data"

**排查步骤:**

1. **检查 Prometheus 状态**
```bash
curl http://localhost:29090/-/healthy
```

2. **检查 target 状态**
```bash
curl http://localhost:29090/api/v1/targets
```

3. **查看 Prometheus 日志**
```bash
docker-compose -f ops/docker-compose.ops.yml logs prometheus
```

**常见原因:**
- 服务未运行
- 防火墙阻止
- 指标端点配置错误

### 4.2 告警未触发

**症状:** 服务异常但未收到告警

**排查步骤:**

1. **检查告警规则**
```bash
curl http://localhost:29090/api/v1/rules
```

2. **手动触发告警测试**
```bash
# 停止 API 服务
docker-compose -f docker-compose.staging.yml stop api

# 等待 1 分钟

# 查看告警
curl http://localhost:29090/api/v1/alerts
```

3. **检查 Alertmanager 配置**
```bash
curl http://localhost:29093/api/v1/status
```

---

## 5. 自动化恢复

### 5.1 自动恢复服务不工作

**症状:** 服务异常但未自动重启

**排查步骤:**

1. **检查自动恢复进程**
```bash
ps aux | grep auto-recovery
```

2. **查看自动恢复日志**
```bash
tail -f auto-recovery.log
```

3. **手动测试恢复**
```python
python ops/scripts/auto-recovery.py
```

### 5.2 服务重启后仍异常

**排查步骤:**

1. **检查重启原因**
```bash
docker inspect aigc-api-staging | grep -A 10 "State"
```

2. **查看完整日志**
```bash
docker-compose -f docker-compose.staging.yml logs --tail=500 api
```

3. **检查资源限制**
```bash
docker stats
```

---

## 6. 紧急处理流程

### 6.1 服务完全不可用

1. **立即行动**
   - 停止有问题服务的流量
   - 查看监控仪表盘
   - 准备回滚方案

2. **诊断问题**
   - 查看服务日志
   - 检查系统资源
   - 确认依赖服务状态

3. **执行恢复**
   - 重启服务
   - 回滚到上一个稳定版本
   - 启用备用服务

4. **后续处理**
   - 分析根本原因
   - 制定预防措施
   - 更新文档

### 6.2 数据损坏

1. **立即行动**
   - 停止写入操作
   - 备份当前数据
   - 通知相关人员

2. **恢复数据**
   - 使用最新备份恢复
   - 手动补录关键数据
   - 验证数据完整性

3. **后续处理**
   - 修复数据损坏原因
   - 加强数据校验
   - 完善备份策略

---

## 7. 联系方式

### 7.1 紧急联系人

| 角色 | 联系方式 | 职责 |
|------|----------|------|
| 值班工程师 | 待定 | 故障处理 |
| 后端负责人 | 待定 | 后端问题 |
| 运维负责人 | 待定 | 基础设施问题 |

### 7.2 外部资源

- Prometheus 文档: https://prometheus.io/docs/
- Grafana 文档: https://grafana.com/docs/
- Loki 文档: https://grafana.com/docs/loki/
- Docker 文档: https://docs.docker.com/

---

**文档变更记录**

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0 | 2026-05-09 | 初始版本 | AIGC Ops Team |
```

Expected: 故障排查指南创建成功

- [ ] **Step 2: Commit**

Run: `git add docs/故障排查指南.md && git commit -m "docs(ops): add troubleshooting guide"`

Expected: 提交成功

---

## 3. 自检清单

完成所有任务后，使用以下清单进行自检：

- [ ] 所有配置文件已创建
- [ ] 所有脚本已添加执行权限
- [ ] 所有代码已提交到 Git
- [ ] 文档已创建并提交
- [ ] Docker Compose 配置已更新
- [ ] Prometheus 告警规则已配置
- [ ] Grafana 仪表盘已创建
- [ ] Loki 日志配置已创建
- [ ] Alertmanager 告警配置已创建
- [ ] FastAPI 指标集成已完成
- [ ] 结构化日志已配置
- [ ] 自动恢复脚本已创建
- [ ] 运维 API 服务已创建
- [ ] 运维文档已编写

---

## 4. 部署验证

部署完成后，执行以下验证：

### 4.1 监控服务验证

```bash
# 1. 检查 Prometheus
curl http://localhost:29090/-/healthy

# 2. 检查 Grafana
curl http://localhost:23000/api/health

# 3. 检查 Loki
curl http://localhost:23100/ready

# 4. 检查 Alertmanager
curl http://localhost:29093/-/healthy
```

### 4.2 应用指标验证

```bash
# 1. 检查 API 指标端点
curl http://localhost:38000/metrics

# 2. 检查 Prometheus 采集
curl http://localhost:29090/api/v1/targets | grep api
```

### 4.3 告警验证

```bash
# 1. 触发测试告警
docker-compose -f docker-compose.staging.yml stop api

# 2. 等待 1 分钟

# 3. 检查告警状态
curl http://localhost:29090/api/v1/alerts

# 4. 恢复服务
docker-compose -f docker-compose.staging.yml start api
```

---

## 5. 后续维护

### 5.1 定期任务

- 每周审查告警规则
- 每月清理旧日志数据
- 每季度更新监控仪表盘
- 定期备份监控配置

### 5.2 持续优化

- 根据业务增长调整告警阈值
- 优化查询性能
- 增加新的监控指标
- 完善自动恢复策略

---

**计划完成时间:** 5 个工作日

**计划版本:** v1.0
