import type { HomeworkResponse, SubmissionResponse } from './types';
import { api } from './client';

export const homeworkApi = {
  getHomework: async (): Promise<HomeworkResponse[]> => {
    return api.get<HomeworkResponse[]>('/homework');
  },

  getHomeworkById: async (id: string): Promise<HomeworkResponse> => {
    return api.get<HomeworkResponse>(`/homework/${id}`);
  },

  createHomework: async (data: {
    course_id: string;
    title: string;
    description: string;
    deadline: string;
    max_score: number;
  }): Promise<HomeworkResponse> => {
    return api.post<HomeworkResponse>('/homework', data);
  },

  submitHomework: async (id: string, data: { content: string }): Promise<SubmissionResponse> => {
    return api.post<SubmissionResponse>(`/homework/${id}/submit`, data);
  },

  getSubmissions: async (homeworkId: string): Promise<SubmissionResponse[]> => {
    return api.get<SubmissionResponse[]>(`/homework/${homeworkId}/submissions`);
  },

  gradeSubmission: async (id: string, data: { score: number; feedback: string }): Promise<SubmissionResponse> => {
    return api.put<SubmissionResponse>(`/homework/submissions/${id}/grade`, data);
  },
};
