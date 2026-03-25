import api from '../../../shared/services/api';
import { 
  PaginatedResponse, 
  AdminCertEvaluationListItem, 
  AdminCertEvaluationDetail,
  AdminKybEvaluationListItem,
  AdminKybEvaluationDetail,
  AdminPartnerContext,
  AdminProjectContext
} from '../../../types/admin-evaluations.types';

const BASE_PATH = '/admin/partners';

// ============================================
// CERTIFICATIONS (Agent 2)
// ============================================

export const getCertEvaluations = async (params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<AdminCertEvaluationListItem>> => {
  // El interceptor ya extrae response.data, así que el resultado es directamente el objeto {success, data, pagination}
  return api.get(`${BASE_PATH}/evaluations`, { params }) as unknown as Promise<PaginatedResponse<AdminCertEvaluationListItem>>;
};

export const getCertEvaluationDetail = async (id: string): Promise<{ success: boolean; data: AdminCertEvaluationDetail }> => {
  return api.get(`${BASE_PATH}/evaluations/${id}`) as unknown as Promise<{ success: boolean; data: AdminCertEvaluationDetail }>;
};

export const approveCertEvaluation = async (id: string, reason?: string) => {
  return api.post(`${BASE_PATH}/evaluations/${id}/approve`, { reason });
};

export const rejectCertEvaluation = async (id: string, reason: string) => {
  return api.post(`${BASE_PATH}/evaluations/${id}/reject`, { reason });
};

// ============================================
// KYB (Agent 1)
// ============================================

export const getKybEvaluations = async (params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<AdminKybEvaluationListItem>> => {
  return api.get(`${BASE_PATH}/kyb-evaluations`, { params }) as unknown as Promise<PaginatedResponse<AdminKybEvaluationListItem>>;
};

export const getKybEvaluationDetail = async (id: string): Promise<{ success: boolean; data: AdminKybEvaluationDetail }> => {
  return api.get(`${BASE_PATH}/kyb-evaluations/${id}`) as unknown as Promise<{ success: boolean; data: AdminKybEvaluationDetail }>;
};

export const approveKybEvaluation = async (id: string, reason?: string) => {
  return api.post(`${BASE_PATH}/kyb-evaluations/${id}/approve`, { reason });
};

export const rejectKybEvaluation = async (id: string, reason: string) => {
  return api.post(`${BASE_PATH}/kyb-evaluations/${id}/reject`, { reason });
};

// ============================================
// CONTEXT
// ============================================

export const getPartnerContext = async (id: string): Promise<{ success: boolean; data: AdminPartnerContext }> => {
  return api.get(`${BASE_PATH}/${id}`) as unknown as Promise<{ success: boolean; data: AdminPartnerContext }>;
};

export const getProjectContext = async (id: string): Promise<{ success: boolean; data: AdminProjectContext }> => {
  return api.get(`${BASE_PATH}/projects/${id}`) as unknown as Promise<{ success: boolean; data: AdminProjectContext }>;
};

export default {
  getCertEvaluations,
  getCertEvaluationDetail,
  approveCertEvaluation,
  rejectCertEvaluation,
  getKybEvaluations,
  getKybEvaluationDetail,
  approveKybEvaluation,
  rejectKybEvaluation,
  getPartnerContext,
  getProjectContext
};
