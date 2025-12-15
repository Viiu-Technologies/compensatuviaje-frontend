import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay un usuario autenticado al cargar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        if (token) {
          // Verificar el token con el backend usando GET /api/auth/me
          const response = await authService.getCurrentUser();
          
          if (response && response.user_info) {
            const userData = {
              id: response.user_info.user_id,
              email: response.user_info.email,
              name: response.user_info.name,
              companyId: response.user_info.company_id,
              companyName: response.user_info.company_name,
              role: response.user_info.role,
              permissions: response.user_info.permissions,
              isAdmin: response.user_info.is_admin
            };
            console.log(response);
            console.log(userData);
            setUser(userData);
          } else {
            // Token inválido o expirado
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error('Error verificando autenticación:', err);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.login(email, password);
      
      // El backend devuelve: { success, access_token, refresh_token, user_info, meta }
      if (response.success && response.user_info) {
        // Guardar tokens
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        
        // Guardar user_info en el estado
        const userData = {
          id: response.user_info.user_id,
          email: response.user_info.email,
          name: response.user_info.name,
          companyId: response.user_info.company_id,
          companyName: response.user_info.company_name,
          role: response.user_info.role,
          permissions: response.user_info.permissions,
          isAdmin: response.user_info.is_admin
        };
        
        setUser(userData);
        return response;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al iniciar sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (companyData, adminUser) => {
    try {
      setError(null);
      setLoading(true);
      
      // El backend espera: { adminUser, ...companyData }
      const payload = {
        ...companyData,
        adminUser: adminUser
      };
      
      const response = await authService.register(payload);
      
      // El backend devuelve: { success, message, data: { company, user, nextSteps } }
      if (response.success && response.data) {
        // Después del registro, el usuario debe hacer login
        // No guardamos user en el estado aquí, solo retornamos la respuesta
        return response;
      } else {
        throw new Error(response.message || 'Error al registrar empresa');
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al registrar';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Llamar al logout del backend para invalidar el token
      await authService.logout();
    } catch (err) {
      console.error('Error al cerrar sesión en el backend:', err);
    } finally {
      // Siempre limpiar el estado local aunque falle el backend
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      setLoading(true);
      return await authService.forgotPassword(email);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setError(null);
      setLoading(true);
      return await authService.resetPassword(token, password);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    clearError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
