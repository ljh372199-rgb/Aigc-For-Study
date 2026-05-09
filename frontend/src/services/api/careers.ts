import type { CareerResponse } from './types';
import { api } from './client';

export const careersApi = {
  getCareers: async (): Promise<CareerResponse[]> => {
    return api.get<CareerResponse[]>('/careers');
  },

  getCareer: async (id: string): Promise<CareerResponse> => {
    return api.get<CareerResponse>(`/careers/${id}`);
  },
};
