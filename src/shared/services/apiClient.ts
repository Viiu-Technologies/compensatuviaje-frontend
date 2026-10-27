// ============================================
// API Client con Interceptors - Compensa Tu Viaje
// ============================================

import type { ErrorResponse } from '../../types/api.types';

import { refreshSession, redirectToLogin } from './tokenRefresh';

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

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Get access token from localStorage
  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
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

      // El cuerpo se lee una sola vez: antes se leía en el 401 y otra vez
      // abajo, y la segunda lectura fallaba con "body already used".
      let data = await response.json();

      // Access token vencido: renovar y reintentar una vez. La renovación es
      // compartida con el cliente axios (ver tokenRefresh.ts).
      if (response.status === 401 && !skipAuth && data?.error_code === 'TOKEN_EXPIRED') {
        const result = await refreshSession();

        if (result.status === 'refreshed') {
          (headers as Record<string, string>)['Authorization'] = `Bearer ${result.accessToken}`;
          response = await fetch(url, {
            ...fetchConfig,
            headers,
            credentials: 'include',
          });
          data = await response.json();
        } else if (result.status === 'expired') {
          // Solo si el backend rechazó el refresh token. Si no respondió, la
          // request falla pero la sesión sigue.
          redirectToLogin();
        }
      }

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
