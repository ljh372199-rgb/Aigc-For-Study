export interface DashboardStats {
  total_requests: number;
  avg_response_time: number;
  error_rate: number;
  active_alerts: number;
  service_health: { name: string; status: string }[];
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  status: 'firing' | 'resolved';
  created_at: string;
  service?: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  service: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface Service {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
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
