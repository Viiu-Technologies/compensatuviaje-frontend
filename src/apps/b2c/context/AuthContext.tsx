import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import authService, { B2CUser } from '../services/authService';

interface AuthContextType {
  user: B2CUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  /** Entorno local: entra como persona de prueba, sin Google. */
  loginAsTestUser: (email?: string) => Promise<void>;
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

function isB2CPath(pathname: string): boolean {
  return (
    pathname.startsWith('/b2c') ||
    pathname === '/auth/callback' ||
    pathname === '/calculator'
  );
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser]       = useState<B2CUser | null>(null);
  // Start as true so B2CProtectedRoute waits before redirecting to /login
  const [loading, setLoading] = useState(true);
  const location              = useLocation();
  // Track whether Supabase has been initialized to avoid duplicate subscriptions
  const initializedRef        = useRef(false);
  // La suscripción a Supabase vive más que un render: lee la persona actual
  // desde aquí y no desde el closure.
  const userRef               = useRef<B2CUser | null>(null);
  userRef.current             = user;

  useEffect(() => {
    const onB2C = isB2CPath(location.pathname);

    if (!onB2C) {
      // Not a B2C route — nothing to do with Supabase, just stop the spinner
      setLoading(false);
      return;
    }

    // If already initialized with an active user, just clear loading
    if (initializedRef.current && user !== null) {
      setLoading(false);
      return;
    }

    // First time on a B2C route — initialize Supabase auth
    initializedRef.current = true;
    let mounted = true;

    const initAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await authService.getCurrentUser();
        if (mounted) setUser(currentUser);
      } catch (error) {
        console.error('❌ [B2C AuthContext] Error cargando usuario:', error);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Subscribe to Supabase auth events (handles token refresh automatically)
    const { data } = authService.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        // Supabase emite estos eventos también al renovar el token (cada hora)
        // y al volver a la pestaña. Antes se recargaba la persona con spinner
        // y, si el backend tardaba más de 5 s o fallaba, getCurrentUser
        // devolvía null y la sesión se cerraba sola. Si ya hay alguien
        // cargado, sus datos se actualizan en silencio y se conservan si la
        // consulta falla.
        if (userRef.current) {
          const freshUser = await authService.getCurrentUser(session);
          if (mounted && freshUser) setUser(freshUser);
        } else {
          await loadUser(session);
        }
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
      // Reset so re-entering B2C re-subscribes (e.g. after logout)
      initializedRef.current = false;
    };
  // Re-run when the route changes — covers: non-B2C → B2C navigation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const loadUser = async (session?: any) => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser(session);
      setUser(currentUser);
    } catch (error) {
      console.error('❌ [B2C AuthContext] Error refrescando usuario:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login       = useCallback(async () => { await authService.loginWithGoogle(); }, []);
  const loginAsTestUser = useCallback(async (email?: string) => {
    const testUser = await authService.loginAsTestUser(email);
    if (!testUser) throw new Error('El backend no reconoció la sesión de prueba');
    setUser(testUser);
  }, []);
  const logout      = useCallback(async () => { await authService.logout(); setUser(null); }, []);
  const refreshUser = useCallback(async () => { await loadUser(); }, []);

  // Sin memoizar, este objeto era una referencia nueva en cada render de
  // AuthProvider -- como envuelve toda la app (rutas B2C), cualquier consumidor
  // envuelto en React.memo perdia el beneficio de la memoizacion sin razon aparente.
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      login,
      loginAsTestUser,
      logout,
      refreshUser,
    }),
    [user, loading, login, loginAsTestUser, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
