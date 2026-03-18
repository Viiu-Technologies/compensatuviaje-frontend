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
  const response = await api.get(`${BASE_PATH}/evaluations`, { params });
  return response.data; // Ya está interceptado para extraer data, pero mantenemos compatibilidad si retorna {success, data, pagination}
};

export const getCertEvaluationDetail = async (id: string): Promise<{ success: boolean; data: AdminCertEvaluationDetail }> => {
  const response = await api.get(`${BASE_PATH}/evaluations/${id}`);
  return response.data;
};

export const approveCertEvaluation = async (id: string, reason?: string) => {
  const response = await api.post(`${BASE_PATH}/evaluations/${id}/approve`, { reason });
  return response.data;
};

export const rejectCertEvaluation = async (id: string, reason: string) => {
  const response = await api.post(`${BASE_PATH}/evaluations/${id}/reject`, { reason });
  return response.data;
};

// ============================================
// KYB (Agent 1)
// ============================================

export const getKybEvaluations = async (params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<AdminKybEvaluationListItem>> => {
  const response = await api.get(`${BASE_PATH}/kyb-evaluations`, { params });
  return response.data;
};

export const getKybEvaluationDetail = async (id: string): Promise<{ success: boolean; data: AdminKybEvaluationDetail }> => {
  const response = await api.get(`${BASE_PATH}/kyb-evaluations/${id}`);
  return response.data;
};

export const approveKybEvaluation = async (id: string, reason?: string) => {
  const response = await api.post(`${BASE_PATH}/kyb-evaluations/${id}/approve`, { reason });
  return response.data;
};

export const rejectKybEvaluation = async (id: string, reason: string) => {
  const response = await api.post(`${BASE_PATH}/kyb-evaluations/${id}/reject`, { reason });
  return response.data;
};

// ============================================
// CONTEXT
// ============================================

export const getPartnerContext = async (id: string): Promise<{ success: boolean; data: AdminPartnerContext }> => {
  const response = await api.get(`${BASE_PATH}/${id}`);
  return response.data;
};

export const getProjectContext = async (id: string): Promise<{ success: boolean; data: AdminProjectContext }> => {
  const response = await api.get(`${BASE_PATH}/projects/${id}`);
  return response.data;
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
