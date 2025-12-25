import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

class AuthService {
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
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error obteniendo sesión:', error);
      return null;
    }
    
    return data.session;
  }

  /**
   * Obtener datos del usuario actual del backend
   */
  async getCurrentUser(): Promise<B2CUser | null> {
    try {
      const session = await this.getSession();
      if (!session) return null;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

      const response = await fetch(`${API_URL}/b2c/auth/me`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('Error response from /b2c/auth/me:', response.status);
        return null;
      }

      const data = await response.json();
      
      if (!data.success) {
        console.error('Backend error:', data.message);
        return null;
      }
      
      return data.data.user;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Request timeout getting current user');
      } else {
        console.error('Error obteniendo usuario:', error);
      }
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

    // Cerrar sesión en Supabase
    await supabase.auth.signOut();
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
    return supabase.auth.onAuthStateChange(callback);
  }
}

export default new AuthService();
