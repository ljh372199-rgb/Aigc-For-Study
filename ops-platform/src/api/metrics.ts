import apiClient from './client';

export const metricsApi = {
  queryRange: (params: {
    metric: string;
    start?: number;
    end?: number;
    step?: string;
    filters?: string;
  }) => apiClient.get<any>('/metrics/query', params),
  instantQuery: (params: {
    metric: string;
    filters?: string;
  }) => apiClient.get<any>('/metrics/instant', params),
};
