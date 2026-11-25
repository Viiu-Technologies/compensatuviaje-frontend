// ============================================
// Piloto de empresas y equipos (backend: /admin/team)
//
// El interceptor de `api` ya extrae response.data, así que cada llamada
// devuelve directamente {success, data}.
// ============================================

import api from '../../../shared/services/api';

const BASE = '/admin/team';

export interface PilotVehicle {
  id: string;
  mode: string;
  subtype: string;
  label: string;
  plate: string | null;
  refrigerated: boolean;
  ownership: 'company' | 'third_party';
}

export interface PilotMember {
  id: string;
  email: string;
  name: string | null;
  status: 'invited' | 'active';
  company: { id: string; name: string };
  vehicle: PilotVehicle | null;
  invitedAt: string | null;
  joinedAt: string | null;
  storeAccessGrantedAt: string | null;
  lastLoginAt: string | null;
  lastTripAt: string | null;
}

export type ReportReason = 'different_vehicle' | 'wrong_data' | 'other';

export interface PilotVehicleReport {
  id: string;
  status: 'open' | 'resolved';
  reason: ReportReason;
  company: { id: string; name: string };
  member: { id: string; email: string } | null;
  assignedVehicle: PilotVehicle | null;
  actual: { mode: string | null; subtype: string | null; plate: string | null };
  note: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface PilotDiagnostic {
  id: string;
  ticket: string;
  status: 'open' | 'closed';
  user: { email: string | null; name: string | null };
  message: string;
  context: Record<string, unknown> | null;
  hasLogs: boolean;
  createdAt: string;
}

const unwrap = <T,>(res: unknown): T => {
  const body = res as { success?: boolean; data?: T; message?: string };
  if (!body?.success) throw new Error(body?.message || 'Error en la solicitud');
  return body.data as T;
};

export const getPilotMembers = async (pendingAccess = false): Promise<PilotMember[]> =>
  unwrap(await api.get(`${BASE}/members`, { params: pendingAccess ? { pendingAccess: 'true' } : {} }));

export const setStoreAccess = async (memberId: string, granted: boolean) =>
  unwrap<{ id: string; storeAccessGrantedAt: string | null }>(await api.post(`${BASE}/members/${memberId}/store-access`, { granted }));

export const getPilotVehicleReports = async (status?: 'open' | 'resolved'): Promise<PilotVehicleReport[]> =>
  unwrap(await api.get(`${BASE}/vehicle-reports`, { params: status ? { status } : {} }));

export const getPilotDiagnostics = async (status?: 'open' | 'closed'): Promise<PilotDiagnostic[]> =>
  unwrap(await api.get(`${BASE}/diagnostics`, { params: status ? { status } : {} }));

export const getDiagnosticLogsUrl = async (id: string): Promise<string | null> =>
  unwrap<{ url: string | null }>(await api.get(`${BASE}/diagnostics/${id}/logs`)).url;

export const closeDiagnostic = async (id: string) => unwrap(await api.post(`${BASE}/diagnostics/${id}/close`));
