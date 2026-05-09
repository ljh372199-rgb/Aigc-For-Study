export interface DashboardStats {
  total_requests: number;
  avg_response_time: number;
  error_rate: number;
  active_alerts: number;
  service_health: Record<string, string>;
}

export interface Alert {
  id: string;
  name?: string;
  title?: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'warning' | 'info';
  description?: string;
  status: 'firing' | 'resolved' | 'pending' | 'inhibited';
  created_at: string;
  updated_at?: string;
  service?: string;
  time?: string;
}

export interface LogEntry {
  id?: string;
  timestamp: string;
  level?: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  service?: string;
  message: string;
  stream?: Record<string, string>;
  labels?: Record<string, string>;
  details?: Record<string, unknown>;
}

export interface Service {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'degraded';
  port: number;
  endpoints: string[];
  uptime: string;
  cpu?: number;
  memory?: number;
}

export interface QueryParams {
  status?: string;
  severity?: string[];
  page?: number;
  pageSize?: number;
}
