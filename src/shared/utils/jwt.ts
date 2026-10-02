/**
 * Lee el payload de un JWT sin verificarlo (la verificación es del backend).
 *
 * `atob` devuelve bytes como latin1: un nombre como "María" llegaba como
 * "MarÃa". Aquí se decodifica como UTF-8 y se acepta base64url.
 */
export const decodeJwtPayload = <T = Record<string, any>>(token: string | null | undefined): T | null => {
  try {
    const part = token?.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    return null;
  }
};
