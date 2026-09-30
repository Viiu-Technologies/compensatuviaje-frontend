/**
 * B2C API Service - Todas las llamadas al backend B2C
 * Usa el token de Supabase para autenticación
 */

import authService from './authService';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_API_URL || 'http://localhost:3001/api';

/**
 * Helper para obtener headers con token de Supabase
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await authService.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

/**
 * Helper para hacer requests autenticados
 */
async function authFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers as Record<string, string> },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}`);
  }
  
  return response.json();
}

/**
 * Helper para requests públicos (sin auth)
 */
async function publicFetch<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}`);
  }
  
  return response.json();
}

// ============================================
// Tipos
// ============================================

export interface B2CCalculation {
  id: string;
  originAirport: string;
  destinationAirport: string;
  date: string;
  passengers: number;
  co2Kg: number;
  co2Tons: number;
  distanceKm: number;
  serviceClass: string;
  roundTrip: boolean;
  isCompensated: boolean;
  compensatedAt: string | null;
  certificateId: string | null;
}

export interface B2CCertificate {
  id: string;
  certificateNumber: string;
  date: string;
  co2Compensated: number;      // Toneladas de CO₂ (el backend envía tonsCompensated del certificado)
  unitsFinanced?: number;      // Unidades físicas congeladas (Ej: 50 árboles)
  impactUnit?: string | null;  // Nombre de la unidad (Ej: "árboles")
  project: string;
  flightRoute?: string | null;
  status: 'verified' | 'pending' | string;
  equivalencies: {
    trees: number;
    water: number;
  };
  nftTxHash?: string | null;
  nftTokenId?: string | null;
  pdfUrl?: string | null;
}

export interface B2CProject {
  id: string;
  name: string;
  code: string;
  projectType: string;
  description: string | null;
  country: string;
  region: string | null;
  status: string;
  providerOrganization: string;
  certification: string | null;
  pricePerTonCLP: number;
  capacityTotal: number;
  capacitySold: number;
  monthlyStockApproved: number;
  monthlyStockRemaining: number;
  availableUnits: number;
  isSoldOut: boolean;
  progress: number;
  coBenefits: any;
  // Unidades físicas (Enfoque B)
  impact_unit: string | null;          // Ej: "árboles", "paneles", "m3"
  carbon_capture_per_unit: number | null; // kg de CO2 capturado por unidad
  partner: { name: string; logoUrl: string | null } | null;
  metrics: { name: string; value: number; date: string }[];
  transparencyUrl: string | null;
  createdAt: string;
  // Evidence & AI evaluation
  photos: { url: string; thumbnailUrl: string | null }[];
  veritasAI: {
    finalScore: number | null;
    level: string | null;
    reportMarkdown: string | null;
  } | null;
}

export interface MonthlyEvolutionItem {
  month: string;
  year: number;
  emissions: number;
  compensated: number;
}

export interface EmissionCategoryItem {
  id: string;
  name: string;
  percentage: number;
  tons: number;
  color: string;
  icon?: string;
}

export interface RecentTripItem {
  id: string;
  origin: string;
  destination: string;
  date: string;
  co2Tons: number;
  isCompensated: boolean;
  routeType: 'Internacional' | 'Nacional' | null;
  transportMode: string;
}

export interface NextAchievementItem {
  title: string;
  targetDescription: string;
  targetKg: number;
  currentKg: number;
  progressPercentage: number;
  remainingKg: number;
}

export type DashboardPeriod = '30d' | '90d' | '1y' | 'all';

export interface DashboardData {
  user: {
    nombre: string;
    email: string;
    avatarUrl: string | null;
    memberSince: string;
  };
  stats: {
    totalFlights: number;
    totalEmissionsKg: number;
    totalEmissionsTons: number;
    totalCompensatedKg: number;
    totalCompensatedTons: number;
    totalPendingKg: number;
    totalPendingTons: number;
    certificatesCount: number;
    treesEquivalent: number;
    compensationRate: number;
    /** null cuando no hay período anterior con el que comparar. */
    emissionsDeltaPercentage: number | null;
    flightsDeltaCount: number | null;
    pendingRate: number;
    /** Historial completo, independiente del período elegido. */
    lifetimeEmissionsKg: number;
    lifetimeCompensatedKg: number;
    lifetimeCompensationRate: number;
  };
  recentFlights: {
    id: string;
    origin: string;
    destination: string;
    date: string;
    co2Tons: number;
    isCompensated: boolean;
    routeType?: string | null;
    transportMode?: string;
  }[];
  recentTrips: RecentTripItem[];
  recentCertificates: {
    id: string;
    number: string;
    date: string;
    tons: number;
    project: string;
  }[];
  monthlyEvolution: MonthlyEvolutionItem[];
  emissionsByCategory: EmissionCategoryItem[];
  /** null cuando ya alcanzó el nivel máximo. */
  nextAchievement: NextAchievementItem | null;
  planetEquivalent: {
    treesCount: number;
    periodText: string;
  };
}

/**
 * Niveles de logro: los de B2CAchievementsPage y shareService.js. Semilla se
 * obtiene con la primera compensación (allí, 0,001 kg); aquí 1 kg para que la
 * barra de progreso no salte de 0 a 100 %.
 */
const ACHIEVEMENT_LEVELS = [
  { title: 'Semilla Climática', targetKg: 1, targetDescription: 'Compensa tu primer vuelo' },
  { title: 'Viajero Consciente', targetKg: 1000, targetDescription: 'Compensa 1 tCO₂e' },
  { title: 'Guardián del Clima', targetKg: 5000, targetDescription: 'Compensa 5 tCO₂e' },
];

const CATEGORY_COLORS: Record<string, string> = {
  international: '#046302',
  national: '#93DC88',
};

/** Próximo nivel según lo compensado en todo el historial; null si ya tiene el máximo. */
function nextAchievementFor(compensatedKg: number): NextAchievementItem | null {
  const next = ACHIEVEMENT_LEVELS.find((level) => compensatedKg < level.targetKg);
  if (!next) return null;
  const currentKg = Math.round(compensatedKg);
  return {
    ...next,
    currentKg,
    progressPercentage: Math.min(100, Math.round((compensatedKg / next.targetKg) * 100)),
    remainingKg: Math.max(0, Math.round(next.targetKg - compensatedKg)),
  };
}

/**
 * Adapta la respuesta del backend al formato del dashboard.
 *
 * Solo transforma datos reales: si un campo falta, queda en 0 o vacío y el
 * componente muestra su estado vacío. Nunca se rellena con cifras de ejemplo:
 * un usuario nuevo vería una huella, vuelos y certificados que no son suyos.
 */
export function normalizeDashboardData(raw: Partial<DashboardData>): DashboardData {
  const rawStats: Partial<DashboardData['stats']> = raw.stats ?? {};
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v) || 0);

  const totalEmissionsTons = num(rawStats.totalEmissionsTons);
  const totalCompensatedTons = num(rawStats.totalCompensatedTons);
  const totalPendingTons = num(rawStats.totalPendingTons);
  const compensationRate = num(rawStats.compensationRate);
  const lifetimeCompensatedKg = num(rawStats.lifetimeCompensatedKg);

  const stats: DashboardData['stats'] = {
    totalFlights: num(rawStats.totalFlights),
    totalEmissionsKg: num(rawStats.totalEmissionsKg),
    totalEmissionsTons,
    totalCompensatedKg: num(rawStats.totalCompensatedKg),
    totalCompensatedTons,
    totalPendingKg: num(rawStats.totalPendingKg),
    totalPendingTons,
    certificatesCount: num(rawStats.certificatesCount),
    treesEquivalent: num(rawStats.treesEquivalent),
    compensationRate,
    emissionsDeltaPercentage: rawStats.emissionsDeltaPercentage ?? null,
    flightsDeltaCount: rawStats.flightsDeltaCount ?? null,
    pendingRate: totalEmissionsTons > 0 ? Math.max(0, 100 - compensationRate) : 0,
    lifetimeEmissionsKg: num(rawStats.lifetimeEmissionsKg),
    lifetimeCompensatedKg,
    lifetimeCompensationRate: num(rawStats.lifetimeCompensationRate),
  };

  const recentFlights = raw.recentFlights ?? [];
  const recentTrips: RecentTripItem[] = recentFlights.map((f) => ({
    id: f.id,
    origin: f.origin,
    destination: f.destination,
    date: f.date,
    co2Tons: num(f.co2Tons),
    isCompensated: Boolean(f.isCompensated),
    routeType: f.routeType === 'Internacional' || f.routeType === 'Nacional' ? f.routeType : null,
    transportMode: f.transportMode || 'Avión',
  }));

  return {
    user: {
      nombre: raw.user?.nombre ?? '',
      email: raw.user?.email ?? '',
      avatarUrl: raw.user?.avatarUrl ?? null,
      memberSince: raw.user?.memberSince ?? '',
    },
    stats,
    recentFlights,
    recentTrips,
    recentCertificates: raw.recentCertificates ?? [],
    monthlyEvolution: raw.monthlyEvolution ?? [],
    emissionsByCategory: (raw.emissionsByCategory ?? []).map((c) => ({
      ...c,
      color: CATEGORY_COLORS[c.id] ?? '#079705',
      icon: 'plane',
    })),
    nextAchievement: nextAchievementFor(lifetimeCompensatedKg),
    planetEquivalent: {
      treesCount: stats.treesEquivalent,
      periodText: 'durante 1 año',
    },
  };
}

// ============================================
// API Methods
// ============================================

/**
 * Dashboard - Datos agregados del usuario.
 *
 * Si el backend falla, el error sube: el dashboard muestra un aviso con
 * reintento en vez de datos que no son del usuario.
 *
 * @param period Ventana de los totales. `all` (por defecto) = historial completo.
 */
export async function getDashboardStats(period: DashboardPeriod = 'all'): Promise<DashboardData> {
  const res = await authFetch<{ success: boolean; data: DashboardData }>(`/b2c/dashboard?period=${period}`);
  return normalizeDashboardData(res.data);
}

/**
 * Cálculos/Vuelos - Listar cálculos del usuario
 */
export async function getCalculations(page = 1, limit = 50): Promise<{
  calculations: B2CCalculation[];
  total: number;
  stats: {
    totalFlights: number;
    totalCompensatedKg: number;
    totalPendingKg: number;
    totalCompensatedTons: number;
    totalPendingTons: number;
  };
}> {
  const res = await authFetch<{ success: boolean; calculations: B2CCalculation[]; total: number; stats: any }>(
    `/b2c/calculations?page=${page}&limit=${limit}`
  );
  return { calculations: res.calculations, total: res.total, stats: res.stats };
}

/**
 * Certificados - Listar certificados del usuario
 */
export async function getCertificates(): Promise<{
  certificates: B2CCertificate[];
  total: number;
  totalCO2Compensated: number;
}> {
  const res = await authFetch<{ success: boolean; certificates: B2CCertificate[]; total: number; totalCO2Compensated: number }>(
    '/b2c/certificates'
  );
  return { certificates: res.certificates, total: res.total, totalCO2Compensated: res.totalCO2Compensated };
}

/**
 * Certificado específico
 */
export async function getCertificate(id: string): Promise<any> {
  const res = await authFetch<{ success: boolean; certificate: any }>(`/b2c/certificates/${id}`);
  return res.certificate;
}

/**
 * Proyectos públicos aprobados/activos
 */
export async function getPublicProjects(): Promise<B2CProject[]> {
  const res = await publicFetch<{ success: boolean; projects: B2CProject[]; total: number }>('/public/projects');
  return res.projects;
}

/**
 * Historial de pagos
 */
export async function getPaymentHistory(): Promise<any[]> {
  const res = await authFetch<{ success: boolean; payments: any[]; total: number }>('/b2c/payments/history');
  return res.payments;
}

/**
 * Crear transacción de pago (Webpay) — server-side price calculation
 * Frontend only sends calculationId + projectId; backend calculates amount.
 */
export async function createPaymentTransaction(params: {
  calculationId: string;
  projectId: string;
  physicalUnits?: number;
  co2KgToFreeze?: number;
}): Promise<{
  success: boolean;
  url: string;
  token: string;
  buyOrder: string;
  paymentId: string;
  amountCLP: number;
  project: { id: string; name: string };
}> {
  return authFetch('/b2c/payments/create-transaction', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/**
 * Obtener datos del usuario (auth/me)
 */
export async function getUserProfile(): Promise<any> {
  const res = await authFetch<{ success: boolean; data: any }>('/b2c/auth/me');
  return res.data;
}

/**
 * Eliminar un cálculo/vuelo (solo si no está compensado)
 */
export async function deleteCalculation(id: string): Promise<{ success: boolean; message: string }> {
  const res = await authFetch<{ success: boolean; message: string }>(`/b2c/calculations/${id}`, {
    method: 'DELETE'
  });
  return res;
}

const b2cApi = {
  getDashboardStats,
  getCalculations,
  getCertificates,
  getCertificate,
  getPublicProjects,
  getPaymentHistory,
  createPaymentTransaction,
  getUserProfile,
  deleteCalculation,
};

export default b2cApi;
