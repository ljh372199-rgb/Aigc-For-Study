import { create } from 'zustand';
import { alertsApi } from '../api';
import type { Alert, QueryParams } from './types';

interface AlertsState {
  alerts: Alert[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  fetchAlerts: (params?: QueryParams) => Promise<void>;
  setPage: (page: number) => void;
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  alerts: [],
  total: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  fetchAlerts: async (params) => {
    set({ loading: true });
    try {
      const { page, pageSize } = get();
      const response = await alertsApi.list({ page, pageSize, ...params });
      set({
        alerts: response.data || [],
        total: response.total || 0,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },
  setPage: (page) => set({ page }),
}));
