import { create } from 'zustand';
import { dashboardApi } from '../api';
import type { DashboardStats, Alert, LogEntry } from './types';

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
      const [stats, alerts, logs] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentAlerts(),
        dashboardApi.getRecentLogs(),
      ]);
      set({
        stats,
        recentAlerts: alerts.data || [],
        recentLogs: logs.data || [],
        loading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch dashboard data', loading: false });
    }
  },
}));
