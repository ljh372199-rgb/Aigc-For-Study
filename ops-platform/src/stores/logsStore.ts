import { create } from 'zustand';
import { logsApi } from '../api';
import type { LogEntry } from './types';

interface LogQueryResponse {
  results: LogEntry[];
  total: number;
  limit: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

interface LogsState {
  logs: LogEntry[];
  total: number;
  loading: boolean;
  error: string | null;
  query: string;
  level: string;
  service: string;
  timeRange: string;
  fetchLogs: (params?: { query?: string; level?: string; service?: string; timeRange?: string }) => Promise<void>;
  setQuery: (query: string) => void;
  setLevel: (level: string) => void;
  setService: (service: string) => void;
  setTimeRange: (timeRange: string) => void;
}

export const useLogsStore = create<LogsState>((set, get) => ({
  logs: [],
  total: 0,
  loading: false,
  error: null,
  query: '*',
  level: 'ALL',
  service: 'all',
  timeRange: '1h',
  fetchLogs: async (params) => {
    set({ loading: true, error: null });
    try {
      const { query, level } = get();
      const logQuery = level !== 'ALL' ? `{level="${level}"}` : query || '*';
      const response = await logsApi.query({
        query: logQuery,
        limit: 100,
      });
      const data = (response as ApiResponse<LogQueryResponse>)?.data;
      let filteredLogs = data?.results || data || [];

      if (params?.service && params.service !== 'all') {
        filteredLogs = filteredLogs.filter(log =>
          log.service === params.service || log.stream?.service === params.service
        );
      }

      set({
        logs: filteredLogs,
        total: data?.total || filteredLogs.length,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      set({ error: 'Failed to fetch logs', loading: false });
    }
  },
  setQuery: (query) => {
    set({ query });
    get().fetchLogs({ query });
  },
  setLevel: (level) => {
    set({ level });
    get().fetchLogs({ level });
  },
  setService: (service) => {
    set({ service });
    get().fetchLogs({ service });
  },
  setTimeRange: (timeRange) => {
    set({ timeRange });
  },
}));
