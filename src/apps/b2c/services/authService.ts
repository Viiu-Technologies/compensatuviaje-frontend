import type { SupabaseClient } from '@supabase/supabase-js';
import { clearAssistantHistory } from '../../../shared/utils/assistantHistory';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Cliente de Supabase - solo se crea si hay credenciales válidas Y estamos en ruta B2C.
//
// La librería se importa de forma diferida: antes se importaba arriba del todo
// y viajaba entera en el paquete inicial (auth, base de datos, storage,
// realtime), aunque fuera de las rutas B2C el cliente nunca se creaba. Además,
// la ruta se evaluaba una sola vez al cargar la página: quien entraba por el
// landing y navegaba al área B2C sin recargar se quedaba sin cliente. Ahora se
// decide en cada llamada.
let _supabaseClient: Promise<SupabaseClient | null> | null = null;
let _warned = false;
const warnOnce = (message: string) => {
  if (_warned) return;
  _warned = true;
  console.warn(message);
};

// Verificar si estamos en una ruta B2C
const isB2CRoute = (): boolean => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  return path.startsWith('/b2c') || 
         path === '/auth/callback' || 
         path === '/calculator';
};

const getSupabaseClient = (): Promise<SupabaseClient | null> => {
  // Fuera de B2C solo se crea si la persona ya inició sesión: así la portada
  // reconoce su sesión, y quien nunca entró no descarga Supabase.
  if (!isB2CRoute() && !hasStoredB2CSession()) {
    return Promise.resolve(null);
  }

  // Solo crear cliente si hay URL válida
  if (!supabaseUrl || !supabaseAnonKey) {
    warnOnce('[B2C Auth] Supabase credentials not configured');
    return Promise.resolve(null);
  }

  // Verificar que la URL sea válida
  try {
    new URL(supabaseUrl);
  } catch {
    warnOnce('[B2C Auth] Invalid Supabase URL');
    return Promise.resolve(null);
  }

  if (!_supabaseClient) {
    // Solo detectar sesión en URL en el callback de OAuth
    const isCallback = window.location.pathname === '/auth/callback';

    _supabaseClient = import('@supabase/supabase-js')
      .then(({ createClient }) =>
        createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: isCallback, // Solo en callback
          },
        }),
      )
      .catch((error) => {
        // Sin red o sin el chunk: se reintenta en la próxima llamada.
        console.error('[B2C Auth] No se pudo cargar Supabase:', error);
        _supabaseClient = null;
        return null;
      });
  }
  return _supabaseClient;
};

const API_URL = import.meta.env.VITE_APP_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface B2CUser {
  id: string;
  supabaseUid: string;
  email: string;
  nombre: string | null;
  avatarUrl: string | null;
  provider: string;
  lastLoginAt: Date;
  createdAt: Date;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: any;
}

// ── Entorno local de pruebas ────────────────────────────────────────────────
// Login B2C sin Google (ver backend/docs/entorno-local.md). Requiere
// VITE_DEV_LOGIN=true en el frontend y DEV_AUTH=true en el backend.
// Nunca en un build de producción: import.meta.env.PROD lo apaga siempre.
export const DEV_LOGIN_ENABLED =
  import.meta.env.VITE_DEV_LOGIN === 'true' && !import.meta.env.PROD;

const DEV_SESSION_KEY = 'ctv_dev_b2c_session';

function readDevSession(): AuthSession | null {
  if (!DEV_LOGIN_ENABLED) return null;
  try {
    const raw = localStorage.getItem(DEV_SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

function clearDevSession() {
  try {
    localStorage.removeItem(DEV_SESSION_KEY);
  } catch {
    // Sin localStorage no hay sesión de prueba que borrar.
  }
}

/** Clave donde supabase-js guarda la sesión: `sb-<ref del proyecto>-auth-token`. */
const SUPABASE_SESSION_KEY = (() => {
  try {
    return `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
  } catch {
    return null;
  }
})();

/**
 * ¿Hay una sesión de persona guardada en este navegador? Es síncrono y no carga
 * Supabase. Sin esto, fuera de /b2c la persona aparecía como no autenticada:
 * volvía a la portada, pulsaba "Entrar" y tenía que iniciar sesión otra vez
 * (lo reportaron estudiantes en las pruebas de usuario).
 */
export function hasStoredB2CSession(): boolean {
  try {
    if (SUPABASE_SESSION_KEY && localStorage.getItem(SUPABASE_SESSION_KEY) !== null) return true;
    return DEV_LOGIN_ENABLED && localStorage.getItem(DEV_SESSION_KEY) !== null;
  } catch {
    return false;
  }
}

class AuthService {
  /**
   * Entorno local: entra como persona de prueba sin pasar por Google.
   * El backend firma un token que acepta como si viniera de Supabase.
   */
  async loginAsTestUser(email?: string): Promise<B2CUser | null> {
    if (!DEV_LOGIN_ENABLED) {
      throw new Error('El login de prueba solo existe en desarrollo (VITE_DEV_LOGIN=true)');
    }
    const response = await fetch(`${API_URL}/dev/b2c-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email ? { email } : {}),
    });
    if (!response.ok) {
      throw new Error(
        response.status === 404
          ? 'El backend no tiene el login de prueba activo (DEV_AUTH=true en backend/.env)'
          : 'No se pudo iniciar la sesión de prueba'
      );
    }
    const { data } = await response.json();
    const session: AuthSession = {
      access_token: data.access_token,
      refresh_token: '',
      user: data.user,
    };
    localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(session));
    return this.getCurrentUser(session);
  }

  /**
   * Obtener la URL para iniciar login con Google
   */
  async getGoogleAuthUrl(redirectUrl?: string): Promise<string> {
    const redirect = redirectUrl || `${window.location.origin}/auth/callback`;
    
    const response = await fetch(`${API_URL}/public/b2c/auth/google-url?redirect=${encodeURIComponent(redirect)}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Error obteniendo URL de autenticación');
    }
    
    return data.data.url;
  }

  /**
   * Iniciar login con Google (redirige al usuario)
   */
  async loginWithGoogle(redirectUrl?: string): Promise<void> {
    const url = await this.getGoogleAuthUrl(redirectUrl);
    window.location.href = url;
  }

  /**
   * Manejar el callback de OAuth
   * Lee los parámetros de la URL después de que Google redirija de vuelta
   */
  async handleOAuthCallback(): Promise<B2CUser | null> {
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        console.error('[B2C Auth] Supabase not configured');
        return null;
      }

      // Supabase procesa automáticamente el callback
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      if (!data.session) return null;

      // Verificar token con nuestro backend
      const user = await this.verifyTokenWithBackend(data.session.access_token);
      
      return user;
    } catch (error) {
      console.error('Error en callback OAuth:', error);
      throw error;
    }
  }

  /**
   * Verificar token con el backend y crear/actualizar usuario
   */
  async verifyTokenWithBackend(accessToken: string): Promise<B2CUser> {
    const response = await fetch(`${API_URL}/public/b2c/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ access_token: accessToken })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Error verificando token');
    }
    
    return data.data.user;
  }

  /**
   * Obtener sesión actual de Supabase
   */
  async getSession(): Promise<AuthSession | null> {
    const devSession = readDevSession();
    if (devSession) return devSession;

    const supabase = await getSupabaseClient();
    if (!supabase) {
      // Fuera de las rutas B2C es lo normal: no hay cliente que consultar.
      return null;
    }

    
    try {
      // Timeout para evitar que se quede pegado indefinidamente
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout obteniendo sesión')), 10000)
      );

      const { data, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('❌ [AuthService] Error obteniendo sesión:', error);
        return null;
      }
      
      return data.session;
    } catch (error) {
      console.error('❌ [AuthService] Excepción en getSession:', error);
      return null;
    }
  }

  /**
   * Obtener datos del usuario actual del backend
   */
  async getCurrentUser(providedSession?: AuthSession | null): Promise<B2CUser | null> {
    try {
      const session = providedSession || await this.getSession();
      if (!session) {
        return null;
      }

      // Al recargar, un fallo pasajero (backend despertando, 5xx, red lenta o un
      // access token recién vencido) NO debe equivaler a "sin sesión": antes
      // devolvía null a la primera y la ruta protegida mandaba a /login con los
      // tokens aún guardados. Se reintenta una vez; ante un 401 se pide a
      // Supabase renovar el token antes del reintento.
      let accessToken = session.access_token;
      for (let attempt = 0; attempt < 2; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        let response: Response;
        try {
          response = await fetch(`${API_URL}/b2c/auth/me`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            signal: controller.signal
          });
        } catch (error: any) {
          console.error(
            error.name === 'AbortError'
              ? '❌ [AuthService] Timeout obteniendo usuario'
              : '❌ [AuthService] Error de red obteniendo usuario:',
            error.name === 'AbortError' ? '' : error
          );
          if (attempt === 0) continue;
          return null;
        } finally {
          clearTimeout(timeoutId);
        }

        if (response.ok) {
          const data = await response.json();
          if (!data.success) {
            console.error('❌ [AuthService] Backend error:', data.message);
            return null;
          }
          return data.data.user;
        }

        console.error('❌ [AuthService] Error response from /b2c/auth/me:', response.status);
        if (attempt === 0 && (response.status === 401 || response.status >= 500)) {
          if (response.status === 401 && !providedSession) {
            const supabase = await getSupabaseClient();
            const { data } = (await supabase?.auth.refreshSession()) ?? { data: null };
            if (data?.session) accessToken = data.session.access_token;
          }
          continue;
        }
        return null;
      }
      return null;
    } catch (error: any) {
      console.error('❌ [AuthService] Error obteniendo usuario:', error);
      return null;
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    // Primero notificar al backend
    const session = await this.getSession();
    if (session) {
      try {
        await fetch(`${API_URL}/b2c/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
      } catch (error) {
        console.error('Error notificando logout al backend:', error);
      }
    }

    clearDevSession();
    // El historial del asistente es de esta cuenta: la siguiente que entre en la
    // pestaña no debe verlo.
    clearAssistantHistory();

    // Cerrar sesión en Supabase
    const supabase = await getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }

  /**
   * Verificar si hay una sesión activa
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }

  /**
   * Obtener token de acceso actual
   */
  async getAccessToken(): Promise<string | null> {
    const session = await this.getSession();
    return session?.access_token || null;
  }

  /**
   * Escuchar cambios en el estado de autenticación
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    // La suscripción se conecta cuando el cliente termina de cargar; se
    // devuelve de inmediato la misma forma que la de Supabase para no cambiar
    // a quien la usa (AuthContext la desuscribe al desmontar).
    let subscription: { unsubscribe: () => void } | null = null;
    let cancelled = false;
    getSupabaseClient().then((supabase) => {
      if (!supabase || cancelled) return;
      subscription = supabase.auth.onAuthStateChange(callback).data.subscription;
    });
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            cancelled = true;
            subscription?.unsubscribe();
          },
        },
      },
    };
  }
}

export default new AuthService();
