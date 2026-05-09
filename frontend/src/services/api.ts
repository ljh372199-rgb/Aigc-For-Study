import axios from 'axios';
import type { LearningPlan, Task, Assignment } from '@/types';
export type { User, LearningPlan, Task, Exercise, Assignment, Submission, DailyCheckin, Progress } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh_token = localStorage.getItem('refresh_token');
        if (!refresh_token) {
          throw new Error('No refresh token');
        }

        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token });
        const { access_token, refresh_token: new_refresh_token } = res.data;

        localStorage.setItem('access_token', access_token);
        if (new_refresh_token) {
          localStorage.setItem('refresh_token', new_refresh_token);
        }

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.warn('Token refresh failed, continuing with current request');
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: { username: string; email: string; password: string; role: 'student' | 'teacher' }) =>
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: (refresh_token: string) => api.post('/auth/refresh', { refresh_token }),
};

export const planApi = {
  getAll: () => api.get('/learning-plans'),
  getById: (id: string) => api.get(`/learning-plans/${id}`),
  create: (data: { title: string; description: string; start_date?: string; end_date?: string; career_goal_id?: string }) => api.post('/learning-plans', data),
  update: (id: string, data: Partial<LearningPlan>) => api.put(`/learning-plans/${id}`, data),
  delete: (id: string) => api.delete(`/learning-plans/${id}`),
};

export const taskApi = {
  getAllByPlan: (planId: string) => api.get(`/plans/${planId}/tasks`),
  create: (planId: string, data: Omit<Task, 'id' | 'createdAt'>) =>
    api.post(`/plans/${planId}/tasks`, data),
  update: (planId: string, taskId: string, data: Partial<Task>) =>
    api.put(`/plans/${planId}/tasks/${taskId}`, data),
  delete: (planId: string, taskId: string) => api.delete(`/plans/${planId}/tasks/${taskId}`),
};

export const exerciseApi = {
  generate: (topic: string, difficulty: 'easy' | 'medium' | 'hard', count: number) =>
    api.post('/exercises/generate', { topic, difficulty, count }),
  getAll: () => api.get('/exercises'),
  getById: (id: string) => api.get(`/exercises/${id}`),
  submit: (id: string, answer: string) => api.post(`/exercises/${id}/submit`, { answer }),
};

export const assignmentApi = {
  getAll: () => api.get('/assignments'),
  getById: (id: string) => api.get(`/assignments/${id}`),
  create: (data: Omit<Assignment, 'id' | 'createdAt'>) => api.post('/assignments', data),
  update: (id: string, data: Partial<Assignment>) => api.put(`/assignments/${id}`, data),
  delete: (id: string) => api.delete(`/assignments/${id}`),
};

export const submissionApi = {
  getAllByAssignment: (homeworkId: string) => api.get(`/homework/${homeworkId}/submissions`),
  create: (homeworkId: string, content: string) =>
    api.post(`/homework/${homeworkId}/submit`, { content }),
  getMySubmissions: () => api.get('/homework/submissions/mine'),
};

export const checkinApi = {
  checkin: (data: { duration_minutes: number; content?: string; check_in_date?: string; plan_id?: string }) => api.post('/check-ins', data),
  getAll: (params?: { skip?: number; limit?: number; plan_id?: string; start_date?: string; end_date?: string }) => api.get('/check-ins', { params }),
  getById: (id: string) => api.get(`/check-ins/${id}`),
};

export const progressApi = {
  get: () => api.get('/progress'),
};

export const homeworkApi = {
  getAll: () => api.get('/homework'),
  getById: (id: string) => api.get(`/homework/${id}`),
  getSubmissions: (id: string) => api.get(`/homework/${id}/submissions`),
};

export const analyticsApi = {
  getTeacherStats: (id: string) => api.get(`/analytics/teacher/${id}/stats`),
};

export const careerApi = {
  getAll: () => api.get('/careers'),
  getById: (id: string) => api.get(`/careers/${id}`),
  create: (data: { name: string; description: string; skills_required: string[] }) =>
    api.post('/careers', data),
};

export const courseApi = {
  getAll: () => api.get('/courses'),
  getById: (id: string) => api.get(`/courses/${id}`),
  create: (data: { title: string; description?: string; cover_image?: string }) =>
    api.post('/courses', data),
  update: (id: string, data: Partial<{ title: string; description: string; cover_image: string }>) =>
    api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  enroll: (id: string) => api.post(`/courses/${id}/enroll`),
};

export const teacherApi = {
  getClassStats: (teacherId: string) => api.get(`/analytics/teacher/${teacherId}/class-stats`),
  getAssignmentStats: (teacherId: string) => api.get(`/analytics/teacher/${teacherId}/assignment-stats`),
};

export const lessonPlanApi = {
  getAll: () => api.get('/lesson-plans'),
  getById: (id: string) => api.get(`/lesson-plans/${id}`),
  create: (data: { title: string; subject: string; grade: string; duration: string; objectives: string; content: string; teaching_method: string }) =>
    api.post('/lesson-plans', data),
  update: (id: string, data: Partial<{ title: string; subject: string; grade: string; duration: string; objectives: string; content: string; teaching_method: string }>) =>
    api.put(`/lesson-plans/${id}`, data),
  delete: (id: string) => api.delete(`/lesson-plans/${id}`),
  generate: (title: string) => api.post('/lesson-plans/generate', { title }),
};

export const resourceApi = {
  getAll: () => api.get('/resources'),
  getById: (id: string) => api.get(`/resources/${id}`),
  create: (data: { title: string; type: string; category: string; description: string; url?: string }) =>
    api.post('/resources', data),
  update: (id: string, data: Partial<{ title: string; category: string; description: string; url?: string }>) =>
    api.put(`/resources/${id}`, data),
  delete: (id: string) => api.delete(`/resources/${id}`),
};

export const ticketApi = {
  getAll: () => api.get('/tickets'),
  getById: (id: string) => api.get(`/tickets/${id}`),
  create: (data: { title: string; description: string; category: string }) =>
    api.post('/tickets', data),
  reply: (id: string, content: string) => api.post(`/tickets/${id}/reply`, { content }),
  resolve: (id: string) => api.put(`/tickets/${id}/resolve`),
  delete: (id: string) => api.delete(`/tickets/${id}`),
};

export const classApi = {
  getAll: () => api.get('/classes'),
  getById: (id: string) => api.get(`/classes/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post('/classes', data),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.put(`/classes/${id}`, data),
  delete: (id: string) => api.delete(`/classes/${id}`),
  getStudents: (id: string) => api.get(`/classes/${id}/students`),
  getInviteCode: (id: string) => api.get(`/classes/${id}/invite-code`),
  join: (inviteCode: string) => api.post('/classes/join', { invite_code: inviteCode }),
};
