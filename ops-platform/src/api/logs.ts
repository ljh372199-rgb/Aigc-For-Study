import apiClient from './client';

export const logsApi = {
  query: (params: {
    query: string;
    start: number;
    end: number;
    limit?: number;
    direction?: string;
  }) => apiClient.get<any>('/logs', params),
};
