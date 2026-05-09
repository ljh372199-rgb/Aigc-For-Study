import type { AuthResponse, UserResponse, RegisterRequest } from './types';
import { api } from './client';

interface MeResponse {
  data: UserResponse;
}

export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse & { user?: { id: string; username: string; email: string; role: string } }> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const res = await api.postFormData<AuthResponse>(`/auth/login`, formData);
    return {
      ...res,
      user: { id: '1', username, email: username, role: 'student' }
    };
  },

  register: async (data: RegisterRequest): Promise<UserResponse> => {
    return api.post<UserResponse>('/auth/register', data);
  },

  me: async (): Promise<MeResponse> => {
    return api.get<MeResponse>('/auth/me');
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
