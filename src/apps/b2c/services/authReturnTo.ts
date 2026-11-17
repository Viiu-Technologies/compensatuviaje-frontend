/**
 * Página a la que volver después de entrar con Google.
 *
 * El login con Google sale del sitio y vuelve a /auth/callback, así que el
 * destino (por ejemplo /b2c/calculator?origin=SCL&destination=LIM al venir de la
 * calculadora pública) se perdía y siempre se acababa en el panel. Se guarda en
 * sessionStorage, que sobrevive a la redirección dentro de la misma pestaña.
 */

const KEY = 'ctv.authReturnTo';

/** Solo rutas internas del área de personas: nada de URLs externas ni de vuelta al login. */
const isAllowed = (path: unknown): path is string =>
  typeof path === 'string' && path.startsWith('/b2c/') && !path.startsWith('/b2c/login');

/** Guarda el destino; sin destino válido borra el anterior para no reutilizarlo. */
export function saveAuthReturnTo(path?: unknown): void {
  try {
    if (isAllowed(path)) sessionStorage.setItem(KEY, path);
    else sessionStorage.removeItem(KEY);
  } catch {
    // Sin almacenamiento se vuelve al panel.
  }
}

/** Devuelve el destino guardado (una sola vez) o null. */
export function takeAuthReturnTo(): string | null {
  try {
    const path = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return isAllowed(path) ? path : null;
  } catch {
    return null;
  }
}
