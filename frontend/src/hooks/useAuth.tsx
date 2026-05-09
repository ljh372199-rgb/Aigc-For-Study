import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (username: string, email: string, password: string, role: 'student' | 'teacher') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const MOCK_ROLE_KEY = 'mock_role';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getErrorMessage(err: any): string {
  const detail = err.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(', ');
  }
  if (typeof detail === 'string') {
    return detail;
  }
  return err.message || '操作失败，请稍后重试';
}

function createMockUser(role: 'student' | 'teacher'): User {
  return {
    id: localStorage.getItem('user_id') || `mock-${role}`,
    username: localStorage.getItem('username') || localStorage.getItem('user_email')?.split('@')[0] || (role === 'student' ? 'Student User' : 'Teacher User'),
    email: localStorage.getItem('user_email') || `${role}@example.com`,
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const fetchUser = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const mockRole = localStorage.getItem(MOCK_ROLE_KEY) as 'student' | 'teacher' | null;
      if (mockRole) {
        const mockUser = createMockUser(mockRole);
        setState((prev) => ({ ...prev, user: mockUser, loading: false }));
        return;
      }

      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        const res = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData: User = {
          id: res.data.id,
          username: res.data.username,
          email: res.data.email,
          role: res.data.role as 'student' | 'teacher',
          createdAt: res.data.created_at,
          updatedAt: res.data.updated_at,
        };
        setState((prev) => ({ ...prev, user: userData, loading: false }));
      } else {
        setState((prev) => ({ ...prev, user: null, loading: false }));
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(MOCK_ROLE_KEY);
      setState((prev) => ({ ...prev, user: null, loading: false }));
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const refreshToken_ = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken_) return false;

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken_ });
      const { access_token, refresh_token } = res.data;
      localStorage.setItem(TOKEN_KEY, access_token);
      if (refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
      }
      return true;
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return false;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await axios.post(`${API_BASE_URL}/auth/login`, formData.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, refresh_token } = res.data;
      localStorage.setItem(TOKEN_KEY, access_token);
      if (refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
      }

      const userRes = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const userData: User = {
        id: userRes.data.id,
        username: userRes.data.username,
        email: userRes.data.email,
        role: userRes.data.role as 'student' | 'teacher',
        createdAt: userRes.data.created_at,
        updatedAt: userRes.data.updated_at,
      };

      localStorage.setItem(MOCK_ROLE_KEY, userData.role);
      localStorage.setItem('username', userData.username);
      localStorage.setItem('user_id', userData.id);
      localStorage.setItem('user_email', userData.email);
      setState((prev) => ({ ...prev, user: userData, loading: false }));
      return { success: true, user: userData };
    } catch (err: any) {
      const message = getErrorMessage(err);
      setState((prev) => ({ ...prev, loading: false, error: message }));
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string, role: 'student' | 'teacher') => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, { username, email, password, role });
      setState((prev) => ({ ...prev, loading: false }));
      return { success: true };
    } catch (err: any) {
      const message = getErrorMessage(err);
      setState((prev) => ({ ...prev, loading: false, error: message }));
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(MOCK_ROLE_KEY);
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    setState({ user: null, loading: false, error: null });
    navigate('/');
  }, [navigate]);

  const setUser = useCallback((user: User | null) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value = useMemo(() => ({
    ...state,
    login,
    register,
    logout,
    refreshToken,
    setUser,
  }), [state, login, register, logout, refreshToken, setUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
