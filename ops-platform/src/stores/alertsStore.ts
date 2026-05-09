import { create } from 'zustand';
import { alertsApi } from '../api';
import type { Alert } from './types';

interface AlertListResponse {
  items: Alert[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

interface AlertsState {
  alerts: Alert[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  fetchAlerts: (params?: { status?: string; severity?: string; page?: number; pageSize?: number }) => Promise<void>;
  setPage: (page: number) => void;
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  alerts: [],
  total: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  error: null,
  fetchAlerts: async (params) => {
    set({ loading: true, error: null });
    try {
      const { page, pageSize } = get();
      const response = await alertsApi.list({ page, pageSize, ...params });
      const data = (response as ApiResponse<AlertListResponse>)?.data;
      set({
        alerts: data?.items || data || [],
        total: data?.total || 0,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      set({ error: 'Failed to fetch alerts', loading: false });
    }
  },
  setPage: (page) => {
    set({ page });
    get().fetchAlerts();
  },
}));
