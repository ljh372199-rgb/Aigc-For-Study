import type { LearningPlanResponse } from './types';
import { api } from './client';

export const learningPlansApi = {
  getPlans: async (): Promise<LearningPlanResponse[]> => {
    return api.get<LearningPlanResponse[]>('/learning-plans');
  },

  getPlan: async (id: string): Promise<LearningPlanResponse> => {
    return api.get<LearningPlanResponse>(`/learning-plans/${id}`);
  },

  createPlan: async (data: { career_goal_id: string; title: string }): Promise<LearningPlanResponse> => {
    return api.post<LearningPlanResponse>('/learning-plans', data);
  },
};
