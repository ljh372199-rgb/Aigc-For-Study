const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:38000/api/v1';

export class ApiClient {
  private getHeaders() {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async post<T>(endpoint: string, data?: object): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(res);
  }

  async postFormData<T>(endpoint: string, formData: URLSearchParams): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    return this.handleResponse(res);
  }

  async put<T>(endpoint: string, data?: object): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(res);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (res.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return this.handleResponse(res);
      }
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Error' }));
      throw new Error(err.detail || 'Request failed');
    }
    return res.json();
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        return true;
      }
    } catch (e) {
      console.error('Token refresh failed:', e);
    }
    return false;
  }
}

export const api = new ApiClient();
