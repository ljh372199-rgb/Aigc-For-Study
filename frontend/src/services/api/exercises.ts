import type { ExerciseResponse } from './types';
import { api } from './client';

export const exercisesApi = {
  getExercises: async (): Promise<ExerciseResponse[]> => {
    return api.get<ExerciseResponse[]>('/exercises');
  },

  getExercise: async (id: string): Promise<ExerciseResponse> => {
    return api.get<ExerciseResponse>(`/exercises/${id}`);
  },

  generateExercises: async (data: { plan_id?: string; topic: string; count: number; difficulty: string }): Promise<ExerciseResponse[]> => {
    return api.post<ExerciseResponse[]>('/exercises/generate', data);
  },

  submitExercise: async (id: string, data: { answer: string }): Promise<ExerciseResponse> => {
    return api.post<ExerciseResponse>(`/exercises/${id}/submit`, data);
  },
};
