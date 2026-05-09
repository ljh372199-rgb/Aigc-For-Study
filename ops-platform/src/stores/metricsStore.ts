import { create } from 'zustand';
import { metricsApi } from '../api';

interface MetricPoint {
  timestamp: number;
  value: number;
}

interface MetricData {
  metric_name: string;
  labels: Record<string, string>;
  points: MetricPoint[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

interface MetricsState {
  requestsData: MetricData[];
  latencyData: MetricData[];
  errorData: MetricData[];
  connectionsData: MetricData[];
  loading: boolean;
  error: string | null;
  timeRange: string;
  fetchMetrics: (timeRange?: string) => Promise<void>;
  setTimeRange: (range: string) => void;
}

export const useMetricsStore = create<MetricsState>((set, get) => ({
  requestsData: [],
  latencyData: [],
  errorData: [],
  connectionsData: [],
  loading: false,
  error: null,
  timeRange: '24h',
  fetchMetrics: async (timeRange) => {
    const range = timeRange || get().timeRange;
    set({ loading: true, error: null });

    try {
      const stepMap: Record<string, string> = {
        '1h': '1m',
        '6h': '5m',
        '24h': '15m',
        '7d': '1h',
        '30d': '2h',
      };

      const now = Math.floor(Date.now() / 1000);
      const rangeSeconds: Record<string, number> = {
        '1h': 3600,
        '6h': 21600,
        '24h': 86400,
        '7d': 604800,
        '30d': 2592000,
      };

      const start = now - (rangeSeconds[range] || 86400);

      const [requestsResponse, latencyResponse, errorResponse] = await Promise.all([
        metricsApi.queryRange({
          metric: 'http_requests_total',
          start,
          end: now,
          step: stepMap[range] || '15m',
        }),
        metricsApi.queryRange({
          metric: 'http_request_duration_seconds',
          start,
          end: now,
          step: stepMap[range] || '15m',
        }),
        metricsApi.queryRange({
          metric: 'http_requests_total{status=~"5.."}',
          start,
          end: now,
          step: stepMap[range] || '15m',
        }),
      ]);

      const processToChartData = (data: MetricData[]) => {
        if (!data.length) return [];
        const points = data[0].points;
        return points.map(point => ({
          time: new Date(point.timestamp * 1000).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          value: point.value,
        }));
      };

      set({
        requestsData: (requestsResponse as ApiResponse<MetricData[]>)?.data || [],
        latencyData: (latencyResponse as ApiResponse<MetricData[]>)?.data || [],
        errorData: (errorResponse as ApiResponse<MetricData[]>)?.data || [],
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      set({ error: 'Failed to fetch metrics', loading: false });
    }
  },
  setTimeRange: (timeRange) => {
    set({ timeRange });
    get().fetchMetrics(timeRange);
  },
}));
