// ============================================
// Privacidad (Ley 21.719): registro de accesos a datos personales.
// Backend: GET /api/admin/privacy/access-log
// El interceptor de `api` ya extrae response.data.
// ============================================

import api from '../../../shared/services/api';

/** entity_id de las listas y reportes, que no son de una persona concreta. */
export const COLLECTION_ID = '00000000-0000-0000-0000-000000000000';

export interface AccessLogEntry {
  id: string;
  at: string;
  entity_type: string;
  entity_id: string;
  /** null cuando quien accedió fue el propio titular (descarga de sus datos). */
  actor: { id: string; email: string; name: string } | null;
  details: {
    what?: string;
    route?: string;
    query?: Record<string, unknown>;
    entity_ref?: string;
    actor_email?: string;
    ip?: string | null;
    user_agent?: string;
    status?: number;
  } | null;
}

export interface AccessLogFilters {
  entity_id?: string;
  entity_type?: string;
  actor_id?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export async function getAccessLog(filters: AccessLogFilters = {}): Promise<AccessLogEntry[]> {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''));
  const res = (await api.get('/admin/privacy/access-log', { params })) as unknown as { data: AccessLogEntry[] };
  return res.data || [];
}
