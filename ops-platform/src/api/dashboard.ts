import apiClient from './client';

export const dashboardApi = {
  getStats: () => apiClient.get<any>('/dashboard/stats'),
  getRecentAlerts: () => apiClient.get<any>('/alerts?page=1&pageSize=5'),
  getRecentLogs: () => apiClient.get<any>('/logs?limit=10'),
};
