// ============================================
// Auth Context - TypeScript con Multi-User Support
// ============================================

import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import authService, { getRedirectPath } from '../services/authService';
import type {
  AuthUser,
  AuthContextType,
  LoginResponse,
  RegisterCompanyRequest,
  RegisterCompanyResponse,
  Permission,
  UserType,
  AdminUserData,
} from '../../../types';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

// Helper para convertir UserInfo del backend a AuthUser del frontend
const mapUserInfoToAuthUser = (userInfo: LoginResponse['user_info']): AuthUser => {
  return {
    id: userInfo.user_id,
    email: userInfo.email,
    name: userInfo.name,
    companyId: userInfo.company_id,
    companyName: userInfo.company_name,
    role: userInfo.role,
    permissions: userInfo.permissions,
    isAdmin: userInfo.is_admin,
    isSuperAdmin: userInfo.is_super_admin ?? false,
    userType: userInfo.user_type,
  };
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si hay un usuario autenticado al cargar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        if (token) {
          const response = await authService.getCurrentUser();
          
          if (response && response.user_info) {
            const userData = mapUserInfoToAuthUser(response.user_info);
            setUser(userData);
          } else {
            authService.clearTokens();
          }
        }
      } catch (err) {
        console.error('Error verificando autenticación:', err);
        authService.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResponse> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authService.login(email, password);
      
      if (response.success && response.user_info) {
        const userData = mapUserInfoToAuthUser(response.user_info);
        setUser(userData);
        return response;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (
    companyData: Omit<RegisterCompanyRequest, 'adminUser'>, 
    adminUser: AdminUserData
  ): Promise<RegisterCompanyResponse> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const payload: RegisterCompanyRequest = {
        ...companyData,
        adminUser,
      };
      
      const response = await authService.register(payload);
      
      if (response.success && response.data) {
        return response;
      } else {
        throw new Error(response.message || 'Error al registrar empresa');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Error al cerrar sesión en el backend:', err);
    } finally {
      setUser(null);
      setError(null);
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const response = await authService.refreshToken();
      
      if (response && response.user_info) {
        const userData = mapUserInfoToAuthUser(response.user_info);
        setUser(userData);
      } else {
        setUser(null);
        authService.clearTokens();
      }
    } catch (err) {
      console.error('Error refreshing token:', err);
      setUser(null);
      authService.clearTokens();
    }
  }, []);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    
    // SuperAdmin tiene todos los permisos
    if (user.isSuperAdmin) return true;
    
    return user.permissions.includes(permission);
  }, [user]);

  // Verificar si el usuario tiene alguno de los permisos
  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    if (!user) return false;
    
    // SuperAdmin tiene todos los permisos
    if (user.isSuperAdmin) return true;
    
    return permissions.some(p => user.permissions.includes(p));
  }, [user]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    register,
    refreshToken,
    clearError,
    hasPermission,
    hasAnyPermission,
  }), [user, isLoading, error, login, logout, register, refreshToken, clearError, hasPermission, hasAnyPermission]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para obtener la ruta de redirección basada en el tipo de usuario
export const useAuthRedirect = (): string => {
  const { user } = useAuth();
  
  if (!user) return '/login';
  
  return getRedirectPath(user.userType);
};

// Hook para verificar tipo de usuario
export const useUserType = (): UserType | null => {
  const { user } = useAuth();
  return user?.userType ?? null;
};

// Hook para verificar si es un tipo específico de usuario
export const useIsUserType = (type: UserType): boolean => {
  const { user } = useAuth();
  return user?.userType === type;
};

export default AuthContext;
