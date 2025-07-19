// Authentication service for admin login
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  expiresIn?: string;
}

export interface AdminUser {
  username: string;
  role: string;
  loginTime: string;
}

export interface VerifyResponse {
  success: boolean;
  user?: AdminUser;
}

class AuthService {
  private readonly API_BASE = '/api';

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (data.success) {
        // Store token in localStorage as backup
        if (data.token) {
          localStorage.setItem('lunastream-admin-token', data.token);
        }
        localStorage.setItem('lunastream-admin-auth', 'true');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.API_BASE}/admin/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('lunastream-admin-auth');
      localStorage.removeItem('lunastream-admin-token');
    }
  }

  async verifyToken(): Promise<VerifyResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/admin/verify`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('lunastream-admin-token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        // Token is invalid, clear local storage
        this.clearAuth();
        return { success: false };
      }
    } catch (error) {
      console.error('Token verification error:', error);
      this.clearAuth();
      return { success: false };
    }
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('lunastream-admin-auth') === 'true';
  }

  private clearAuth(): void {
    localStorage.removeItem('lunastream-admin-auth');
    localStorage.removeItem('lunastream-admin-token');
  }

  async getAdminData(): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE}/admin/data`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('lunastream-admin-token')}`,
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch admin data');
      }
    } catch (error) {
      console.error('Admin data fetch error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
