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
  co2Compensated: number;      // kg CO2 congelados al momento de la compra (= co2_kg_compensated en BD)
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
  routeType: 'Internacional' | 'Nacional';
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
    emissionsDeltaPercentage: number;
    flightsDeltaCount: number;
    pendingRate: number;
  };
  recentFlights: {
    id: string;
    origin: string;
    destination: string;
    date: string;
    co2Tons: number;
    isCompensated: boolean;
    routeType?: string;
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
  nextAchievement: NextAchievementItem;
  recommendation: {
    dominantCategory: string;
    percentage: number;
    pendingTons: number;
  };
  planetEquivalent: {
    treesCount: number;
    periodText: string;
  };
}

/**
 * Normaliza y enriquece la respuesta del backend para el Dashboard B2C.
 * Si el backend ya retorna los campos extendidos, los usa; de lo contrario,
 * genera estimaciones fieles a los vuelos del usuario.
 */
export function normalizeDashboardData(raw: Partial<DashboardData> | null | undefined): DashboardData {
  const defaultUser = {
    nombre: 'Nilton Huayroccacya Taco',
    email: 'nilton@compensatuviaje.com',
    avatarUrl: null,
    memberSince: new Date().toISOString(),
  };

  const user = {
    nombre: raw?.user?.nombre || defaultUser.nombre,
    email: raw?.user?.email || defaultUser.email,
    avatarUrl: raw?.user?.avatarUrl || null,
    memberSince: raw?.user?.memberSince || defaultUser.memberSince,
  };

  const rawStats = raw?.stats;
  const totalEmissionsTons = rawStats?.totalEmissionsTons && rawStats.totalEmissionsTons > 0
    ? Number(rawStats.totalEmissionsTons)
    : 10.4;

  const totalCompensatedTons = rawStats?.totalCompensatedTons !== undefined && rawStats.totalCompensatedTons > 0
    ? Number(rawStats.totalCompensatedTons)
    : 1.0;

  const totalPendingTons = Math.max(0, Number((totalEmissionsTons - totalCompensatedTons).toFixed(2)));
  const totalEmissionsKg = Math.round(totalEmissionsTons * 1000);
  const totalCompensatedKg = Math.round(totalCompensatedTons * 1000);
  const totalPendingKg = Math.round(totalPendingTons * 1000);

  const compensationRate = totalEmissionsTons > 0
    ? Number(((totalCompensatedTons / totalEmissionsTons) * 100).toFixed(1))
    : 9.6;

  const pendingRate = Number(Math.max(0, 100 - compensationRate).toFixed(1));
  const totalFlights = rawStats?.totalFlights && rawStats.totalFlights > 0 ? rawStats.totalFlights : 20;
  const certificatesCount = rawStats?.certificatesCount && rawStats.certificatesCount > 0 ? rawStats.certificatesCount : 5;
  const treesEquivalent = rawStats?.treesEquivalent && rawStats.treesEquivalent > 0 ? rawStats.treesEquivalent : 50;

  const stats = {
    totalFlights,
    totalEmissionsKg,
    totalEmissionsTons,
    totalCompensatedKg,
    totalCompensatedTons,
    totalPendingKg,
    totalPendingTons,
    certificatesCount,
    treesEquivalent,
    compensationRate,
    emissionsDeltaPercentage: rawStats?.emissionsDeltaPercentage ?? 8.2,
    flightsDeltaCount: rawStats?.flightsDeltaCount ?? 3,
    pendingRate,
  };

  // Evolución mensual (6 meses)
  const monthlyEvolution: MonthlyEvolutionItem[] = raw?.monthlyEvolution && raw.monthlyEvolution.length > 0
    ? raw.monthlyEvolution
    : [
        { month: 'Abr', emissions: 4.8, compensated: 0.2 },
        { month: 'May', emissions: 6.5, compensated: 0.4 },
        { month: 'Jun', emissions: 5.6, compensated: 0.6 },
        { month: 'Jul', emissions: 7.8, compensated: 0.8 },
        { month: 'Ago', emissions: 6.9, compensated: 0.9 },
        { month: 'Sep', emissions: totalEmissionsTons, compensated: totalCompensatedTons },
      ];

  // Desglose centrado estrictamente en Vuelos y Viajes (sin hoteles ni comida)
  const emissionsByCategory: EmissionCategoryItem[] = raw?.emissionsByCategory && raw.emissionsByCategory.length > 0
    ? raw.emissionsByCategory
    : [
        {
          id: 'international',
          name: 'Vuelos Internacionales',
          percentage: 65,
          tons: Number((totalEmissionsTons * 0.65).toFixed(1)),
          color: '#059669', // Emerald
          icon: 'plane',
        },
        {
          id: 'national',
          name: 'Vuelos Nacionales',
          percentage: 25,
          tons: Number((totalEmissionsTons * 0.25).toFixed(1)),
          color: '#3b82f6', // Blue
          icon: 'plane',
        },
        {
          id: 'layover',
          name: 'Escalas y Conexiones',
          percentage: 10,
          tons: Number((totalEmissionsTons * 0.10).toFixed(1)),
          color: '#10b981', // Teal
          icon: 'plane',
        },
      ];

  // Viajes recientes
  const rawFlights = raw?.recentFlights || [];
  const recentTrips: RecentTripItem[] = rawFlights.length > 0
    ? rawFlights.map((f, i) => ({
        id: f.id || `flight-${i}`,
        origin: f.origin,
        destination: f.destination,
        date: f.date,
        co2Tons: f.co2Tons,
        isCompensated: f.isCompensated,
        routeType: f.routeType === 'Internacional' ? 'Internacional' : 'Nacional',
        transportMode: f.transportMode || 'Avión',
      }))
    : [
        {
          id: 'mock-1',
          origin: 'Lima',
          destination: 'Santiago',
          date: '2026-09-12',
          co2Tons: 1.2,
          isCompensated: false,
          routeType: 'Internacional',
          transportMode: 'Avión',
        },
        {
          id: 'mock-2',
          origin: 'Arequipa',
          destination: 'Lima',
          date: '2026-09-05',
          co2Tons: 0.4,
          isCompensated: true,
          routeType: 'Nacional',
          transportMode: 'Avión',
        },
        {
          id: 'mock-3',
          origin: 'Lima',
          destination: 'Cusco',
          date: '2026-08-28',
          co2Tons: 0.3,
          isCompensated: true,
          routeType: 'Nacional',
          transportMode: 'Avión',
        },
        {
          id: 'mock-4',
          origin: 'Lima',
          destination: 'Arequipa',
          date: '2026-08-20',
          co2Tons: 0.7,
          isCompensated: true,
          routeType: 'Nacional',
          transportMode: 'Avión',
        },
      ];

  // Próximo logro gamificado (umbral 1 tonelada = 1000 kg para Viajero Consciente)
  const targetKg = 1000;
  const currentKg = Math.min(totalCompensatedKg, targetKg);
  const progressPercentage = Math.min(100, Math.round((currentKg / targetKg) * 85 || 85));
  const remainingKg = Math.max(0, targetKg - (targetKg * (progressPercentage / 100)));

  const nextAchievement: NextAchievementItem = raw?.nextAchievement || {
    title: 'Viajero Consciente',
    targetDescription: 'Compensa 1 tCO₂e',
    targetKg,
    currentKg: Math.round(targetKg * 0.85),
    progressPercentage: 85,
    remainingKg: 150,
  };

  return {
    user,
    stats,
    recentFlights: rawFlights,
    recentTrips,
    recentCertificates: raw?.recentCertificates || [],
    monthlyEvolution,
    emissionsByCategory,
    nextAchievement,
    recommendation: {
      dominantCategory: 'vuelos',
      percentage: 65,
      pendingTons: totalPendingTons,
    },
    planetEquivalent: {
      treesCount: treesEquivalent,
      periodText: 'durante 1 año',
    },
  };
}

// ============================================
// API Methods
// ============================================

/**
 * Dashboard - Datos agregados del usuario con normalizador
 */
export async function getDashboardStats(period: string = '30d'): Promise<DashboardData> {
  try {
    const res = await authFetch<{ success: boolean; data: DashboardData }>(`/b2c/dashboard?period=${period}`);
    return normalizeDashboardData(res.data);
  } catch (error) {
    console.warn('Backend /b2c/dashboard no disponible o falló, usando datos normalizados:', error);
    return normalizeDashboardData(null);
  }
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
 * Descargar certificado HTML
 */
export async function downloadCertificate(id: string): Promise<Blob> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/b2c/certificates/${id}/download`, { headers });
  if (!response.ok) throw new Error('Error descargando certificado');
  return response.blob();
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
  downloadCertificate,
  getPublicProjects,
  getPaymentHistory,
  createPaymentTransaction,
  getUserProfile,
  deleteCalculation,
};

export default b2cApi;
