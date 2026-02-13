import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { B2CUser } from '../services/authService';

interface AuthContextType {
  user: B2CUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<B2CUser | null>(null);
  const [loading, setLoading] = useState(false); // Cambiar a false por defecto

  // Cargar usuario al montar - SOLO en rutas B2C
  useEffect(() => {
    // Solo ejecutar lógica de Supabase si estamos en una ruta B2C
    const isB2CRoute = window.location.pathname.startsWith('/b2c') || 
                       window.location.pathname === '/auth/callback' ||
                       window.location.pathname === '/calculator';
    
    // Si no estamos en ruta B2C, no hacer nada con Supabase
    if (!isB2CRoute) {
      console.log('🚫 [B2C AuthContext] No estamos en ruta B2C, saltando inicialización de Supabase');
      return;
    }

    let mounted = true;
    
    const initAuth = async () => {
      console.log('🔄 [B2C AuthContext] Iniciando verificación de autenticación...');
      try {
        setLoading(true);
        const currentUser = await authService.getCurrentUser();
        console.log('✅ [B2C AuthContext] Usuario actual:', currentUser);
        if (mounted) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('❌ [B2C AuthContext] Error cargando usuario:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          console.log('🏁 [B2C AuthContext] Finalizando verificación (loading -> false)');
          setLoading(false);
        }
      }
    };

    initAuth();

    // Escuchar cambios de autenticación
    const { data } = authService.onAuthStateChange(async (event, session) => {
      console.log('[B2C] Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session) {
        await loadUser(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        await loadUser(session);
      }
    });

    // Cleanup subscription
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const loadUser = async (session?: any) => {
    try {
      setLoading(true);
      // Si ya tenemos la sesión del evento, la pasamos para evitar llamar a getSession de nuevo
      const currentUser = await authService.getCurrentUser(session);
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    await authService.loginWithGoogle();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: user !== null,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
