import { create } from 'zustand';
import { dashboardApi } from '../api';
import type { DashboardStats, Alert, LogEntry } from './types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

interface AlertListResponse {
  items: Alert[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface LogQueryResponse {
  results: LogEntry[];
  total: number;
  limit: number;
}

interface DashboardState {
  stats: DashboardStats | null;
  recentAlerts: Alert[];
  recentLogs: LogEntry[];
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  recentAlerts: [],
  recentLogs: [],
  loading: false,
  error: null,
  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const [statsResponse, alertsResponse, logsResponse] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentAlerts(),
        dashboardApi.getRecentLogs(),
      ]);

      const statsData = (statsResponse as ApiResponse<DashboardStats>)?.data;
      const alertsData = (alertsResponse as ApiResponse<AlertListResponse>)?.data;
      const logsData = (logsResponse as ApiResponse<LogQueryResponse>)?.data;

      set({
        stats: statsData || null,
        recentAlerts: alertsData?.items || alertsData || [],
        recentLogs: logsData?.results || logsData || [],
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      set({ error: 'Failed to fetch dashboard data', loading: false });
    }
  },
}));
