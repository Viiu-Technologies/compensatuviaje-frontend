/**
 * Historial de los asistentes (Doctor IA) en sessionStorage.
 *
 * La clave lleva el id del usuario: antes era fija ('ctv.b2c.assistant') y, si
 * alguien cerraba sesión y otra persona entraba en la misma pestaña, veía la
 * conversación anterior y además se la reenviaba al backend como historial.
 * También se borra al cerrar sesión (clearAssistantHistory), por si el id se
 * repite o el navegador es compartido.
 */

export type AssistantScope = 'b2c' | 'b2b';

interface StoredTurn {
  role: 'user' | 'model';
  content: string;
}

const PREFIX = 'ctv.assistant.';
/** Claves anteriores, sin usuario: se borran para no dejar conversaciones huérfanas. */
const LEGACY_KEYS = ['ctv.b2c.assistant', 'ctv.b2b.assistant'];
/** Turnos que se conservan; el resto no aporta contexto y engorda cada petición. */
const MAX_TURNS = 40;

/** null sin usuario: no se lee ni se guarda nada hasta saber de quién es. */
export const assistantHistoryKey = (scope: AssistantScope, userId: string | number | null | undefined): string | null =>
  userId === null || userId === undefined || userId === '' ? null : `${PREFIX}${scope}.${userId}`;

export function loadAssistantHistory<T extends StoredTurn>(key: string | null): T[] {
  if (!key) return [];
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || '[]');
    return Array.isArray(saved)
      ? saved.filter((t) => (t?.role === 'user' || t?.role === 'model') && typeof t.content === 'string')
      : [];
  } catch {
    return [];
  }
}

export function saveAssistantHistory(key: string | null, turns: StoredTurn[]): void {
  if (!key) return;
  try {
    sessionStorage.setItem(key, JSON.stringify(turns.slice(-MAX_TURNS)));
  } catch {
    // Sin almacenamiento (modo privado): la conversación dura hasta recargar.
  }
}

/** Borra el historial de todos los asistentes y usuarios de esta pestaña. Se llama al cerrar sesión. */
export function clearAssistantHistory(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith(PREFIX) || LEGACY_KEYS.includes(key))) keys.push(key);
    }
    keys.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Sin almacenamiento no hay nada que borrar.
  }
}
