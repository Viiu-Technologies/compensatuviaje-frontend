import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import authService, { B2CUser, hasStoredB2CSession } from '../services/authService';
import { saveAuthReturnTo } from '../services/authReturnTo';

interface AuthContextType {
  user: B2CUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  /** Sale hacia Google. `returnTo`: ruta /b2c/… a la que volver después de entrar. */
  login: (returnTo?: string) => Promise<void>;
  /** Entorno local: entra como persona de prueba, sin Google. */
  loginAsTestUser: (email?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  /** Fija la persona ya verificada por el backend (callback de Google), sin pedirla otra vez. */
  setAuthenticatedUser: (user: B2CUser) => void;
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
  // Carga inicial en curso: los eventos de Supabase que llegan mientras tanto la esperan.
  const initialLoadRef        = useRef<Promise<void> | null>(null);
  // Sube cada vez que la persona se fija a mano (callback de Google). Una carga
  // que empezó antes no pisa ese valor: en el primer login, /b2c/auth/me podía
  // responder antes de que el backend creara la cuenta y dejar la sesión en null.
  const userEpochRef          = useRef(0);
  userRef.current             = user;

  // Solo importa si se está DENTRO o FUERA de B2C. Antes el efecto dependía de
  // la ruta exacta: cada cambio de página dentro de B2C deshacía la sesión y la
  // volvía a armar (/auth/me + loading=true), la ruta protegida mostraba el
  // spinner, la página se desmontaba y repetía todas sus peticiones. En la
  // prueba con estudiantes se vieron 2–3 /b2c/dashboard por segundo.
  //
  // Fuera de B2C también se arranca si hay una sesión guardada: si no, en la
  // portada y en /login la persona aparecía sin sesión y tenía que volver a
  // entrar con Google. Quien nunca inició sesión sigue sin cargar Supabase.
  const onB2C = isB2CPath(location.pathname) || hasStoredB2CSession();

  useEffect(() => {
    if (!onB2C) {
      // Fuera de B2C y sin sesión guardada: nada que consultar, solo quitar el spinner
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
      const epoch = userEpochRef.current;
      try {
        setLoading(true);
        const currentUser = await authService.getCurrentUser();
        if (mounted && epoch === userEpochRef.current) setUser(currentUser);
      } catch (error) {
        console.error('❌ [B2C AuthContext] Error cargando usuario:', error);
        if (mounted && epoch === userEpochRef.current) setUser(null);
      } finally {
        if (mounted) setLoading(false);
        initialLoadRef.current = null;
      }
    };

    initialLoadRef.current = initAuth();

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
        // Si la carga inicial sigue en curso, ese mismo /auth/me responde: no
        // se pide otra vez (Supabase emite SIGNED_IN al suscribirse).
        if (initialLoadRef.current) {
          await initialLoadRef.current;
          return;
        }
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
  // Re-run only when entering or leaving B2C (not on every page change).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onB2C]);

  const loadUser = async (session?: any) => {
    const epoch = userEpochRef.current;
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser(session);
      if (epoch === userEpochRef.current) setUser(currentUser);
    } catch (error) {
      console.error('❌ [B2C AuthContext] Error refrescando usuario:', error);
      if (epoch === userEpochRef.current) setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login       = useCallback(async (returnTo?: string) => {
    // Sin destino válido se borra el de un intento anterior.
    saveAuthReturnTo(returnTo);
    await authService.loginWithGoogle();
  }, []);
  const loginAsTestUser = useCallback(async (email?: string) => {
    const testUser = await authService.loginAsTestUser(email);
    if (!testUser) throw new Error('El backend no reconoció la sesión de prueba');
    setUser(testUser);
  }, []);
  const logout      = useCallback(async () => { await authService.logout(); setUser(null); }, []);
  const refreshUser = useCallback(async () => { await loadUser(); }, []);
  const setAuthenticatedUser = useCallback((verified: B2CUser) => {
    userEpochRef.current += 1;
    setUser(verified);
    setLoading(false);
  }, []);

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
      setAuthenticatedUser,
    }),
    [user, loading, login, loginAsTestUser, logout, refreshUser, setAuthenticatedUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
