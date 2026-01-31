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
  PartnerListResponse
} from '../../../types/partner.types';

// ============================================
// PROFILE SERVICES
// ============================================

/**
 * Obtener perfil del partner autenticado
 */
export const getPartnerProfile = async (): Promise<PartnerProfile | null> => {
  try {
    const response = await api.get<PartnerApiResponse<PartnerProfile>>('/partner/profile');
    if (response.data.success && response.data.data) {
      return response.data.data;
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
    const response = await api.put<PartnerApiResponse<PartnerProfile>>('/partner/profile', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
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
    const response = await api.put<PartnerApiResponse<PartnerProfile>>('/partner/profile/logo', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
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
    const response = await api.get<PartnerApiResponse<OnboardingStatus>>('/partner/onboarding/status');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
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
    const response = await api.get<PartnerApiResponse<BankDetailsResponse>>('/partner/bank-details');
    if (response.data.success && response.data.data) {
      return response.data.data;
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
    const response = await api.put<PartnerApiResponse<BankDetailsResponse>>('/partner/bank-details', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
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
    const response = await api.put<PartnerApiResponse<null>>('/partner/profile/password', data);
    return response.data.success;
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
    const response = await api.get<PartnerApiResponse<PartnerStats>>('/partner/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
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
    const response = await api.get<PartnerListResponse<EsgProject>>(url);
    
    if (response.data.success) {
      return {
        projects: response.data.data,
        pagination: response.data.pagination
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
    const response = await api.get<PartnerApiResponse<EsgProject>>(`/partner/projects/${projectId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
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
    const response = await api.post<PartnerApiResponse<EsgProject>>('/partner/projects', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
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
    const response = await api.put<PartnerApiResponse<EsgProject>>(`/partner/projects/${projectId}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
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
    const response = await api.delete<PartnerApiResponse<null>>(`/partner/projects/${projectId}`);
    return response.data.success;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

/**
 * Enviar proyecto a revisión
 */
export const submitProjectForReview = async (projectId: string): Promise<EsgProject | null> => {
  try {
    const response = await api.post<PartnerApiResponse<EsgProject>>(
      `/partner/projects/${projectId}/submit`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error submitting project for review:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de un proyecto específico
 */
export const getProjectStats = async (
  projectId: string
): Promise<{
  total_certificates: number;
  total_kg_co2: number;
  total_revenue_clp: number;
} | null> => {
  try {
    const response = await api.get<PartnerApiResponse<{
      total_certificates: number;
      total_kg_co2: number;
      total_revenue_clp: number;
    }>>(`/partner/projects/${projectId}/stats`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching project stats:', error);
    throw error;
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
