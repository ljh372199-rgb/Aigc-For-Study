import apiClient from './client';

export const logsApi = {
  query: (params: {
    query?: string;
    start?: number;
    end?: number;
    limit?: number;
    direction?: string;
  }) => apiClient.get<any>('/logs', params),
  getServiceLogs: (serviceName: string, params?: { limit?: number }) =>
    apiClient.get<any>(`/logs/services/${serviceName}`, params),
};
