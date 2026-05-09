import type { StudentStatsResponse, TeacherStatsResponse } from './types';
import { api } from './client';

export const analyticsApi = {
  getStudentStats: async (studentId: string): Promise<StudentStatsResponse> => {
    return api.get<StudentStatsResponse>(`/analytics/students/${studentId}`);
  },

  getTeacherStats: async (teacherId: string): Promise<TeacherStatsResponse> => {
    return api.get<TeacherStatsResponse>(`/analytics/teachers/${teacherId}`);
  },
};
