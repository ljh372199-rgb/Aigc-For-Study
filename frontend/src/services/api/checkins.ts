import type { CheckinResponse } from './types';
import { api } from './client';

export const checkinsApi = {
  getCheckins: async (): Promise<CheckinResponse[]> => {
    return api.get<CheckinResponse[]>('/checkins');
  },

  createCheckin: async (data: { duration_minutes: number; note?: string }): Promise<CheckinResponse> => {
    return api.post<CheckinResponse>('/checkins', data);
  },
};
