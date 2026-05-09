import apiClient from './client';

export const servicesApi = {
  list: () => apiClient.get<any>('/services'),
  getByName: (name: string) => apiClient.get<any>(`/services/${name}`),
};
