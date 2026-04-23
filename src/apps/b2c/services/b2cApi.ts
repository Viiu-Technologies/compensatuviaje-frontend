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
  co2Compensated: number;
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
  partner: { name: string; logoUrl: string | null } | null;
  metrics: { name: string; value: number; date: string }[];
  transparencyUrl: string | null;
  createdAt: string;
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
  };
  recentFlights: {
    id: string;
    origin: string;
    destination: string;
    date: string;
    co2Tons: number;
    isCompensated: boolean;
  }[];
  recentCertificates: {
    id: string;
    number: string;
    date: string;
    tons: number;
    project: string;
  }[];
}

// ============================================
// API Methods
// ============================================

/**
 * Dashboard - Datos agregados del usuario
 */
export async function getDashboardStats(): Promise<DashboardData> {
  const res = await authFetch<{ success: boolean; data: DashboardData }>('/b2c/dashboard');
  return res.data;
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
