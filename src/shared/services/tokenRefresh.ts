// ============================================
// Renovación del access token (admin, B2B y partner)
// ============================================
//
// La comparten los dos clientes HTTP (axios en api.tsx y fetch en
// apiClient.ts) y authService. Antes cada uno renovaba por su cuenta y con
// reglas distintas, y eso cerraba sesiones solas:
//
// - El cliente axios no agrupaba: si un dashboard lanzaba 8 requests y el
//   token había vencido, hacía 8 renovaciones. El backend limita
//   /auth/refresh por IP, así que a los pocos ciclos respondía 429.
// - Cualquier fallo de la renovación (429, 500, sin red) borraba la sesión y
//   mandaba a /login, aunque el refresh token siguiera siendo válido.
// - En el cliente fetch, si la renovación fallaba, las requests que
//   esperaban en cola nunca se resolvían.
//
// Ahora hay una sola renovación en curso a la vez, y la sesión solo se borra
// cuando el backend rechaza el refresh token.

import { API_URL } from '../../config/env';
import { decodeJwtPayload } from '../utils/jwt';

export type RefreshResult =
  /** `data` es la respuesta completa del backend (incluye user_info). */
  | { status: 'refreshed'; accessToken: string; refreshToken: string; data: any }
  /** El refresh token ya no sirve: hay que volver a iniciar sesión. */
  | { status: 'expired' }
  /** 429, error del servidor o sin red: la sesión sigue y se reintenta en la próxima request. */
  | { status: 'unavailable' };

let inFlight: Promise<RefreshResult> | null = null;

/**
 * Renueva el access token. Si ya hay una renovación en curso, devuelve esa
 * misma promesa en vez de lanzar otra.
 */
export function refreshSession(): Promise<RefreshResult> {
  if (!inFlight) {
    inFlight = doRefresh().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

async function doRefresh(): Promise<RefreshResult> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    return { status: 'expired' };
  }

  // Refresh token ya vencido: no hace falta preguntarle al backend, que
  // además en ese caso respondía 500 en vez de 401 y la sesión quedaba rota.
  const exp = decodeJwtPayload<{ exp?: number }>(refreshToken)?.exp;
  if (exp && exp * 1000 <= Date.now()) {
    clearSession();
    return { status: 'expired' };
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/public/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return { status: 'unavailable' };
  }

  // 400: sin refresh token válido en el cuerpo. 401: inválido, vencido o el
  // usuario ya no existe. En ambos casos la sesión terminó de verdad.
  if (response.status === 400 || response.status === 401) {
    clearSession();
    return { status: 'expired' };
  }

  if (!response.ok) {
    return { status: 'unavailable' };
  }

  const data = await response.json().catch(() => null);
  if (!data?.success || !data.access_token) {
    return { status: 'unavailable' };
  }

  // Si el backend no rota el refresh token, se mantiene el actual.
  const nextRefreshToken = data.refresh_token || refreshToken;
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', nextRefreshToken);

  return {
    status: 'refreshed',
    accessToken: data.access_token,
    refreshToken: nextRefreshToken,
    data,
  };
}

export function clearSession(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}

export function redirectToLogin(): void {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}
