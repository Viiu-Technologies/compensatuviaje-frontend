import api from '../../../shared/services/api';

/**
 * Equipo de la empresa (piloto de empresas y equipos): trabajadores invitados,
 * vehículos de trabajo, turnos y reportes de vehículo. Backend: /b2b/team.
 */

export type VehicleMode = 'car' | 'motorcycle' | 'van' | 'truck';
export type VehicleFuel = 'gasoline' | 'diesel' | 'cng' | 'hybrid' | 'electric';
export type VehicleOwnership = 'company' | 'third_party';

export interface TeamVehicle {
  id: string;
  updatedAt: string | null;
  mode: VehicleMode;
  subtype: string;
  label: string;
  plate: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  fuel: VehicleFuel | null;
  refrigerated: boolean;
  ownership: VehicleOwnership;
  photoUrl: string | null;
  notes: string | null;
  assignedTo?: { id: string; email: string }[];
}

export interface VehicleInput {
  mode: VehicleMode;
  subtype: string;
  plate?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  fuel?: VehicleFuel | null;
  refrigerated?: boolean;
  ownership?: VehicleOwnership;
  notes?: string | null;
}

export interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  status: 'invited' | 'active' | 'declined' | 'left' | 'removed';
  invitedAt: string | null;
  joinedAt: string | null;
  appAccess: 'granted' | 'pending';
  vehicle: TeamVehicle | null;
  vehicleConfirmedAt: string | null;
  openReport: { id: string; reason: ReportReason; createdAt: string } | null;
}

export type ReportReason = 'different_vehicle' | 'wrong_data' | 'other';

export interface VehicleReport {
  id: string;
  status: 'open' | 'resolved';
  reason: ReportReason;
  member: { id: string; email: string; name: string | null } | null;
  assignedVehicle: TeamVehicle | null;
  actual: { mode: VehicleMode | null; subtype: string | null; plate: string | null };
  note: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
}

export interface TeamShift {
  id: string;
  member: { id: string; email: string; name: string | null };
  vehicle: TeamVehicle | null;
  startedAt: string | null;
  endedAt: string | null;
  endReason: 'user' | 'auto_timeout' | 'left_company' | null;
  trips: number;
  appKm: number;
  odometerKm: number | null;
  differencePct: number | null;
  co2Kg: number;
  hasOdometerPhotos: boolean;
}

interface Totals {
  trips: number;
  km: number;
  co2Kg: number;
}

export interface TeamSummary {
  from: string;
  to: string;
  totals: Totals & { co2Tons: number };
  members: { invited: number; active: number };
  openVehicleReports: number;
  byMember: (Totals & { memberId: string; email: string | null; name: string | null })[];
  byVehicle: (Totals & { vehicle: TeamVehicle | null })[];
}

export interface InviteResult {
  invited: { id: string; email: string; vehicleId: string | null }[];
  skipped: { email: string | null; reason: 'invalid_email' | 'other_company' | 'already_invited' }[];
}

/** Subtipos del catálogo de factores, para elegir el tipo de vehículo. */
export interface VehicleCatalogMode {
  mode: VehicleMode;
  subtypes: { code: string; label: string }[];
}

const VEHICLE_MODES: VehicleMode[] = ['truck', 'van', 'car', 'motorcycle'];

const unwrap = <T,>(res: unknown): T => {
  const body = res as { success?: boolean; data?: T; message?: string };
  if (!body?.success) throw new Error(body?.message || 'Error en la solicitud');
  return body.data as T;
};

export const getTeamSummary = async (): Promise<TeamSummary> => unwrap(await api.get('/b2b/team/summary'));
export const getTeamMembers = async (): Promise<TeamMember[]> => unwrap(await api.get('/b2b/team/members'));
export const inviteTeamMembers = async (members: { email: string; vehicleId?: string | null }[]): Promise<InviteResult> =>
  unwrap(await api.post('/b2b/team/members', { members }));
export const assignMemberVehicle = async (memberId: string, vehicleId: string | null): Promise<TeamMember> =>
  unwrap(await api.patch(`/b2b/team/members/${memberId}`, { vehicleId }));
export const removeTeamMember = async (memberId: string) => unwrap(await api.delete(`/b2b/team/members/${memberId}`));

export const getTeamVehicles = async (): Promise<TeamVehicle[]> => unwrap(await api.get('/b2b/team/vehicles'));
export const createTeamVehicle = async (data: VehicleInput): Promise<TeamVehicle> =>
  unwrap(await api.post('/b2b/team/vehicles', data));
export const updateTeamVehicle = async (id: string, data: Partial<VehicleInput>): Promise<TeamVehicle> =>
  unwrap(await api.patch(`/b2b/team/vehicles/${id}`, data));
export const archiveTeamVehicle = async (id: string) => unwrap(await api.delete(`/b2b/team/vehicles/${id}`));

export const getVehicleReports = async (status?: 'open' | 'resolved'): Promise<VehicleReport[]> =>
  unwrap(await api.get('/b2b/team/reports', { params: status ? { status } : {} }));
export const resolveVehicleReport = async (id: string, body: { vehicleId?: string | null; resolutionNote?: string }) =>
  unwrap<{ report: VehicleReport; recalculatedTrips: number }>(await api.post(`/b2b/team/reports/${id}/resolve`, body));

export const getTeamShifts = async (): Promise<TeamShift[]> => unwrap(await api.get('/b2b/team/shifts'));

export const getVehicleCatalog = async (): Promise<VehicleCatalogMode[]> => {
  const data = unwrap<{ modes: VehicleCatalogMode[] }>(await api.get('/public/emission-factors/ground'));
  return VEHICLE_MODES.map((mode) => data.modes.find((m) => m.mode === mode)).filter(Boolean) as VehicleCatalogMode[];
};
