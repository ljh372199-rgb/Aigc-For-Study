import { api } from './client';
import type {
  CareerAdvice,
  GenerateCareerAdviceParams,
  AssignCareerAdviceParams,
  StudentAdvice,
  Student,
  Class,
  PaginatedResponse
} from './careerAdviceTypes';

export const careerAdviceApi = {
  generate: async (params: GenerateCareerAdviceParams): Promise<CareerAdvice> => {
    return api.post<CareerAdvice>('/career-advices/generate', params);
  },

  assign: async (params: AssignCareerAdviceParams): Promise<{ assigned_count: number }> => {
    return api.post<{ assigned_count: number }>('/career-advices/assign', params);
  },

  list: async (params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<CareerAdvice>> => {
    const queryParams = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return api.get<PaginatedResponse<CareerAdvice>>(`/career-advices${queryParams}`);
  },

  get: async (id: string): Promise<CareerAdvice> => {
    return api.get<CareerAdvice>(`/career-advices/${id}`);
  },

  update: async (id: string, data: Partial<CareerAdvice>): Promise<CareerAdvice> => {
    return api.put<CareerAdvice>(`/career-advices/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/career-advices/${id}`);
  },

  getStudents: async (adviceId: string): Promise<StudentAdvice[]> => {
    return api.get<StudentAdvice[]>(`/career-advices/${adviceId}/students`);
  },

  getClasses: async (): Promise<Class[]> => {
    return api.get<Class[]>('/classes');
  },

  getClassStudents: async (classId: string): Promise<Student[]> => {
    return api.get<Student[]>(`/classes/${classId}/students`);
  }
};
