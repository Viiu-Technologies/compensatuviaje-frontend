// ============================================
// PARTNER API SERVICE - CompensaTuViaje
// ============================================

import api from '../../../shared/services/api';
import {
  PartnerProfile,
  PartnerStats,
  OnboardingStatus,
  BankDetailsResponse,
  UpdatePartnerProfileRequest,
  UpdateLogoRequest,
  UpdateBankDetailsRequest,
  ChangePasswordRequest,
  EsgProject,
  CreateProjectRequest,
  UpdateProjectRequest,
  PartnerApiResponse,
  PartnerListResponse,
  ProjectType
} from '../../../types/partner.types';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Safely parse a numeric value that might come as string from API
 * Returns undefined if the value is null, undefined, or not a valid number
 */
const parseNumber = (value: any): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(parsed) ? undefined : parsed;
};

/**
 * Normalize a project from API response to match our EsgProject type
 * Handles field name variations and type coercion
 */
const normalizeProject = (raw: any): EsgProject => {
  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    description: raw.description || undefined,
    // Normalize type field - API sends both 'type' and 'project_type'
    type: (raw.type || raw.project_type || 'other') as ProjectType,
    project_type: raw.project_type as ProjectType | undefined,
    status: raw.status,
    // Normalize location fields - API sends both variations
    location_country: raw.location_country || raw.country || '',
    location_region: raw.location_region || raw.region || undefined,
    country: raw.country,
    region: raw.region,
    // Provider info
    provider_organization: raw.provider_organization,
    provider_currency: raw.provider_currency,
    // Parse numeric fields (API may return as strings)
    provider_cost_unit_clp: parseNumber(raw.provider_cost_unit_clp),
    carbon_capture_per_unit: parseNumber(raw.carbon_capture_per_unit),
    capacity_total: parseNumber(raw.capacity_total),
    capacity_sold: parseNumber(raw.capacity_sold),
    capacity_available: parseNumber(raw.capacity_available),
    base_price_usd_per_ton: parseNumber(
      raw.base_price_usd_per_ton ?? raw.currentBasePriceUsdPerTon ?? raw.current_base_price_usd_per_ton
    ),
    currentBasePriceUsdPerTon: parseNumber(
      raw.currentBasePriceUsdPerTon ?? raw.current_base_price_usd_per_ton ?? raw.base_price_usd_per_ton
    ),
    impact_ratio_per_ton: parseNumber(raw.impact_ratio_per_ton),
    // Additional fields
    certification: raw.certification,
    co_benefits: raw.co_benefits,
    impact_unit: raw.impact_unit,
    transparency_url: raw.transparency_url,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    // Related entities
    partner_id: raw.partner_id,
    partner: raw.partner,
    documents: raw.documents,
    documents_count: raw.documents_count,
    recent_evidence: raw.recent_evidence,
    evidence_count: raw.evidence_count,
    recent_metrics: raw.recent_metrics,
    // Stats (only in detail response)
    stats: raw.stats
  };
};

// ============================================
// PROFILE SERVICES
// ============================================

/**
 * Obtener perfil del partner autenticado
 */
export const getPartnerProfile = async (): Promise<PartnerProfile | null> => {
  try {
    // Note: Axios interceptor already extracts response.data, so 'response' IS the body
    const response = await api.get('/partner/profile') as any;
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching partner profile:', error);
    throw error;
  }
};

/**
 * Actualizar perfil del partner
 */
export const updatePartnerProfile = async (
  data: UpdatePartnerProfileRequest
): Promise<PartnerProfile | null> => {
  try {
    const response = await api.put('/partner/profile', data) as any;
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error updating partner profile:', error);
    throw error;
  }
};

/**
 * Actualizar logo del partner
 */
export const updatePartnerLogo = async (
  data: UpdateLogoRequest
): Promise<PartnerProfile | null> => {
  try {
    let payload: any;
    let config: any = {};

    if (data.logo_file) {
      const formData = new FormData();
      formData.append('logo_file', data.logo_file);
      if (data.logo_url) {
        formData.append('logo_url', data.logo_url);
      }
      payload = formData;
      config = { headers: { 'Content-Type': 'multipart/form-data' } };
    } else {
      payload = data;
    }

    const response = await api.put('/partner/profile/logo', payload, config) as any;
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error updating partner logo:', error);
    throw error;
  }
};

// ============================================
// ONBOARDING SERVICES
// ============================================

/**
 * Obtener estado del onboarding
 */
export const getOnboardingStatus = async (): Promise<OnboardingStatus | null> => {
  try {
    const response = await api.get('/partner/onboarding/status') as any;
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error: any) {
    // 404 es un estado válido - significa que el endpoint no existe o no hay datos de onboarding
    if (error.response?.status === 404 || error.status === 404) {
      return null;
    }
    console.error('Error fetching onboarding status:', error);
    throw error;
  }
};

// ============================================
// BANK DETAILS SERVICES
// ============================================

/**
 * Obtener datos bancarios del partner
 */
export const getBankDetails = async (): Promise<BankDetailsResponse | null> => {
  try {
    const response = await api.get('/partner/profile/bank-details') as any;
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error: any) {
    // 404 significa que no hay datos bancarios configurados
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching bank details:', error);
    throw error;
  }
};

/**
 * Actualizar datos bancarios del partner
 */
export const updateBankDetails = async (
  data: UpdateBankDetailsRequest
): Promise<BankDetailsResponse | null> => {
  try {
    const response = await api.put('/partner/profile/bank-details', data) as any;
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error updating bank details:', error);
    throw error;
  }
};

// ============================================
// PASSWORD SERVICES
// ============================================

/**
 * Cambiar contraseña del usuario partner
 */
export const changePassword = async (
  data: ChangePasswordRequest
): Promise<boolean> => {
  try {
    const response = await api.put('/partner/password', data) as any;
    return response.success || false;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// ============================================
// DASHBOARD / STATS SERVICES
// ============================================

/**
 * Obtener estadísticas del partner
 */
export const getPartnerStats = async (): Promise<PartnerStats | null> => {
  try {
    const response = await api.get('/partner/stats') as any;
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching partner stats:', error);
    throw error;
  }
};

// ============================================
// PROJECTS SERVICES
// ============================================

/**
 * Obtener lista de proyectos del partner
 */
export const getPartnerProjects = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ projects: EsgProject[]; pagination: any } | null> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const url = `/partner/projects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url) as any;
    
    if (response.success) {
      // Normalize each project in the list
      const projects = (response.data || []).map(normalizeProject);
      return {
        projects,
        pagination: response.pagination
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching partner projects:', error);
    throw error;
  }
};

/**
 * Obtener detalle de un proyecto
 */
export const getProjectById = async (projectId: string): Promise<EsgProject | null> => {
  try {
    const response = await api.get(`/partner/projects/${projectId}`) as any;
    if (response.success && response.data) {
      // Normalize the project data
      return normalizeProject(response.data);
    }
    return null;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};

/**
 * Crear nuevo proyecto ESG
 */
export const createProject = async (
  data: CreateProjectRequest
): Promise<EsgProject | null> => {
  try {
    const response = await api.post('/partner/projects', data) as any;
    if (response.success && response.data) {
      return normalizeProject(response.data);
    }
    return null;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

/**
 * Actualizar proyecto existente
 */
export const updateProject = async (
  projectId: string,
  data: UpdateProjectRequest
): Promise<EsgProject | null> => {
  try {
    const response = await api.put(`/partner/projects/${projectId}`, data) as any;
    if (response.success && response.data) {
      return normalizeProject(response.data);
    }
    return null;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

/**
 * Eliminar proyecto (solo si está en draft)
 */
export const deleteProject = async (projectId: string): Promise<boolean> => {
  try {
    const response = await api.delete(`/partner/projects/${projectId}`) as any;
    return response.success || false;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

/**
 * Enviar proyecto a revisión
 * 
 * DOUBLE-LOCK: El precio lo calcula el Admin durante la aprobación,
 * por lo que no se requiere currentBasePriceUsdPerTon aquí.
 */
export const submitProjectForReview = async (
  projectId: string
): Promise<EsgProject | null> => {
  try {
    const response = await api.post(
      `/partner/projects/${projectId}/submit`
    ) as any;
    if (response.success && response.data) {
      return normalizeProject(response.data);
    }
    return null;
  } catch (error) {
    console.error('Error submitting project for review:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de un proyecto específico
 * Note: Stats come embedded in the project detail response, not a separate endpoint
 */
export const getProjectStats = async (
  projectId: string
): Promise<{
  total_certificates: number;
  total_kg_co2: number;
  total_revenue_clp: number;
} | null> => {
  try {
    const response = await api.get(`/partner/projects/${projectId}`) as any;
    if (response.success && response.data && response.data.stats) {
      const stats = response.data.stats;
      // Map API stats to expected format
      return {
        total_certificates: parseNumber(stats.certificates_issued) || 0,
        total_kg_co2: parseNumber(stats.capacity_remaining) || 0, // Using capacity as proxy
        total_revenue_clp: parseNumber(stats.compensation_orders) || 0
      };
    }
    return null;
  } catch (error: any) {
    // 404 es esperado si el endpoint no existe - retornar null silenciosamente
    if (error.response?.status === 404 || error.status === 404) {
      return null;
    }
    // Otros errores también retornamos null para no bloquear la carga del proyecto
    console.warn('Project stats not available:', error.message || 'Unknown error');
    return null;
  }
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  // Profile
  getPartnerProfile,
  updatePartnerProfile,
  updatePartnerLogo,
  // Onboarding
  getOnboardingStatus,
  // Bank Details
  getBankDetails,
  updateBankDetails,
  // Password
  changePassword,
  // Stats
  getPartnerStats,
  // Projects
  getPartnerProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  submitProjectForReview,
  getProjectStats
};
