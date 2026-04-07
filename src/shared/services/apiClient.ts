// ============================================
// API Client con Interceptors - Compensa Tu Viaje
// ============================================

import type { ErrorResponse } from '../../types';

const API_URL = import.meta.env.VITE_APP_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Error codes mapping
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email o contraseña incorrectos',
  RATE_LIMIT_EXCEEDED: 'Demasiados intentos. Espera unos minutos.',
  ACCOUNT_INACTIVE: 'Tu cuenta está desactivada. Contacta al administrador.',
  INSUFFICIENT_PERMISSIONS: 'No tienes permisos para esta acción.',
  VALIDATION_ERROR: 'Por favor revisa los datos ingresados.',
  SYSTEM_ERROR: 'Error del sistema. Intenta nuevamente.',
  TOKEN_EXPIRED: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  INVALID_TOKEN: 'Token inválido. Inicia sesión nuevamente.',
  COMPANY_SUSPENDED: 'Empresa suspendida. Contacte al equipo de CompensaTuViaje.',
  USER_INACTIVE_IN_COMPANY: 'Tu cuenta está inactiva en esta empresa.',
  USER_NOT_FOUND: 'Usuario no encontrado.',
  NO_ACTIVE_COMPANIES: 'No tienes empresas activas asociadas.',
};

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Get access token from localStorage
  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Get refresh token from localStorage
  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Set tokens in localStorage
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  // Clear tokens from localStorage
  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // Subscribe to token refresh
  private subscribeTokenRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  // Notify all subscribers with new token
  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  // Refresh the access token
  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      this.clearTokens();
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/public/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return null;
      }

      const data = await response.json();
      
      if (data.success && data.access_token) {
        const nextRefreshToken = data.refresh_token || refreshToken;
        this.setTokens(data.access_token, nextRefreshToken);
        return data.access_token;
      }
      
      this.clearTokens();
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearTokens();
      return null;
    }
  }

  // Handle token refresh with queue
  private async handleTokenRefresh(): Promise<string | null> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.subscribeTokenRefresh((token: string) => {
          resolve(token);
        });
      });
    }

    this.isRefreshing = true;
    
    try {
      const newToken = await this.refreshAccessToken();
      
      if (newToken) {
        this.onTokenRefreshed(newToken);
        return newToken;
      }
      
      // Redirect to login if refresh fails
      window.location.href = '/login';
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Get error message from response
  private getErrorMessage(data: ErrorResponse): string {
    if (data.error_code && ERROR_MESSAGES[data.error_code]) {
      return ERROR_MESSAGES[data.error_code];
    }
    return data.message || data.error || 'Error desconocido';
  }

  // Main request method
  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { skipAuth = false, ...fetchConfig } = config;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchConfig.headers,
    };

    // Add auth header if not skipped
    if (!skipAuth) {
      const token = this.getAccessToken();
      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      let response = await fetch(url, {
        ...fetchConfig,
        headers,
        credentials: 'include',
      });

      // Handle 401 - Token expired
      if (response.status === 401 && !skipAuth) {
        const data = await response.json();
        
        if (data.error_code === 'TOKEN_EXPIRED') {
          const newToken = await this.handleTokenRefresh();
          
          if (newToken) {
            // Retry request with new token
            (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, {
              ...fetchConfig,
              headers,
              credentials: 'include',
            });
          }
        }
      }

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = this.getErrorMessage(data);
        const error = new Error(errorMessage) as Error & { 
          code?: string; 
          status?: number;
          data?: unknown;
        };
        error.code = data.error_code;
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión');
    }
  }

  // Convenience methods
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // Upload file (multipart/form-data)
  async upload<T>(
    endpoint: string, 
    formData: FormData, 
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const token = this.getAccessToken();
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', `${this.baseUrl}${endpoint}`);
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.withCredentials = true;
      
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            onProgress(progress);
          }
        };
      }
      
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data as T);
          } else {
            const errorMessage = this.getErrorMessage(data);
            reject(new Error(errorMessage));
          }
        } catch {
          reject(new Error('Error procesando respuesta'));
        }
      };
      
      xhr.onerror = () => {
        reject(new Error('Error de conexión'));
      };
      
      xhr.send(formData);
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_URL);

export default apiClient;
