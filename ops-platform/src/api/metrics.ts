import apiClient from './client';

export const metricsApi = {
  query: (params: {
    metric: string;
    start: number;
    end: number;
    step: string;
    filters?: Record<string, string>;
  }) => apiClient.get<any>('/metrics/query', params),
};
