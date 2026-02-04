// ============================================
// Auth Service - TypeScript
// ============================================

import apiClient from '../../../shared/services/apiClient';
import type {
  LoginRequest,
  LoginResponse,
  RegisterCompanyRequest,
  RegisterCompanyResponse,
  RefreshTokenResponse,
  UserInfo,
  UserType,
} from '../../../types';

// Determinar tipo de usuario basado en la respuesta del backend
const determineUserType = (userInfo: UserInfo): UserType => {
  // SuperAdmin
  if (userInfo.is_super_admin || userInfo.role === 'SUPERADMIN') {
    return 'superadmin';
  }
  
  // Partner (proyectos ESG)
  if (userInfo.role === 'PARTNER_ADMIN' || userInfo.role === 'PARTNER_VIEWER') {
    return 'partner';
  }
  
  // B2C (usuario individual)
  if (userInfo.role === 'B2C_USER' || !userInfo.company_id) {
    return 'b2c';
  }
  
  // B2B (empresa)
  return 'b2b';
};

// Obtener ruta de redirección según tipo de usuario
export const getRedirectPath = (userType: UserType, companyStatus?: string): string => {
  switch (userType) {
    case 'superadmin':
      return '/admin';
    
    case 'partner':
      return '/partner';
    
    case 'b2c':
      return '/calculator';
    
    case 'b2b':
      // Verificar estado de empresa para B2B
      if (companyStatus && companyStatus !== 'active') {
        return '/onboarding/status';
      }
      return '/dashboard';
    
    default:
      return '/dashboard';
  }
};

class AuthService {
  // Login de usuario
  async login(email: string, password: string, rememberMe = false): Promise<LoginResponse> {
    const payload: LoginRequest = {
      email,
      password,
      remember_me: rememberMe,
    };

    // Usar ruta pública para login
    const response = await apiClient.post<LoginResponse>(
      '/public/auth/login',
      payload,
      { skipAuth: true }
    );

    if (response.success && response.user_info) {
      console.log('Login successful, user_info:', response.user_info);

      // DEBUG: Decodificar token para verificar el rol que viene DENTRO del token
      try {
        const tokenParts = response.access_token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('🎟️ [Auth] CONTENIDO DEL TOKEN (Payload):', payload);
          console.log('👮 [Auth] Rol en el token:', payload.role);
          
          if (payload.role !== 'superadmin' && payload.role === 'SUPERADMIN') {
            console.warn('⚠️ [Auth] ALERTA: El rol en el token es SUPERADMIN (mayúsculas) pero el backend podría esperar superadmin (minúsculas).');
          }
        }
      } catch (e) {
        console.error('Error decodificando token para debug:', e);
      }

      // Agregar user_type basado en el rol
      response.user_info.user_type = determineUserType(response.user_info);
      
      // Guardar tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
    }

    return response;
  }

  // Registro de empresa (B2B)
  async register(payload: RegisterCompanyRequest): Promise<RegisterCompanyResponse> {
    return apiClient.post<RegisterCompanyResponse>(
      '/public/companies/register',
      payload,
      { skipAuth: true }
    );
  }

  // Logout
  async logout(userType?: UserType): Promise<void> {
    try {
      const token = this.getToken();
      
      if (token) {
        // Solo llamar al endpoint de logout del backend si es B2B (requiere contexto de empresa)
        if (userType === 'b2b') {
          await apiClient.post('/b2b/profile/logout', null);
        }
        // Si hay otros endpoints para otros tipos de usuario, agregarlos aquí
      }
    } catch (error) {
      console.error('Error al hacer logout en el backend:', error);
    } finally {
      // Siempre limpiar tokens locales
      this.clearTokens();
    }
  }

  // Obtener usuario actual
  async getCurrentUser(): Promise<{ success: boolean; user_info: UserInfo } | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      // Decodificar el token para obtener info básica del usuario
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const role = payload.role;
          
          // Para SuperAdmin y Partner, usamos la info del token
          // ya que no tienen endpoint /b2b/profile/me
          if (role === 'SUPERADMIN' || role === 'superadmin' || 
              role === 'PARTNER_ADMIN' || role === 'PARTNER_VIEWER') {
            console.log('[Auth] Usuario Admin/Partner detectado, usando info del token');
            
            const userInfo: UserInfo = {
              user_id: payload.userId || payload.sub || payload.id,
              email: payload.email || '',
              name: payload.name || payload.email?.split('@')[0] || '',
              role: role,
              is_super_admin: role === 'SUPERADMIN' || role === 'superadmin',
              is_admin: role === 'SUPERADMIN' || role === 'superadmin',
              permissions: payload.permissions || [],
              user_type: determineUserType({
                user_id: payload.userId,
                email: payload.email,
                name: payload.name,
                role: role,
                is_super_admin: role === 'SUPERADMIN' || role === 'superadmin',
                is_admin: false,
                permissions: [],
              }),
            };
            
            return { success: true, user_info: userInfo };
          }
        }
      } catch (decodeError) {
        console.error('Error decodificando token:', decodeError);
      }

      // Para usuarios B2B, llamar al endpoint
      const response = await apiClient.get<{ success: boolean; user_info: UserInfo }>(
        '/b2b/profile/me'
      );

      if (response.success && response.user_info) {
        // Agregar user_type
        response.user_info.user_type = determineUserType(response.user_info);
        return response;
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  // Refresh token
  async refreshToken(): Promise<RefreshTokenResponse | null> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await apiClient.post<RefreshTokenResponse>(
        '/public/auth/refresh',
        { refreshToken },
        { skipAuth: true }
      );

      if (response.success) {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        
        // Agregar user_type
        response.user_info.user_type = determineUserType(response.user_info);
      }

      return response;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearTokens();
      return null;
    }
  }

  // Recuperar contraseña
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      '/public/auth/forgot-password',
      { email },
      { skipAuth: true }
    );
  }

  // Resetear contraseña
  async resetPassword(
    token: string, 
    password: string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      '/public/auth/reset-password',
      { token, password },
      { skipAuth: true }
    );
  }

  // Cambiar contraseña (usuario autenticado)
  async changePassword(
    currentPassword: string, 
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.put<{ success: boolean; message: string }>(
      '/b2b/profile/password',
      { currentPassword, newPassword }
    );
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Limpiar tokens
  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
}

// Export singleton
const authService = new AuthService();
export default authService;
