import apiClient from './client';

export const alertsApi = {
  list: (params: {
    status?: string;
    severity?: string[];
    page?: number;
    pageSize?: number;
  }) => apiClient.get<any>('/alerts', params),
  getById: (id: string) => apiClient.get<any>(`/alerts/${id}`),
  resolve: (id: string) => apiClient.post<any>(`/alerts/${id}/resolve`),
};
