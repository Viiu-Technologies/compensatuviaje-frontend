// ============================================
// UPLOAD SERVICE - Cloudflare R2 via Backend
// ============================================

import api from '../../../shared/services/api';
import type {
  ProjectEvidence,
  EvidenceListResponse,
  SubmitMonthlyEvidenceRequest,
  ApproveMonthlyEvidenceRequest,
  RejectMonthlyEvidenceRequest,
  EvidenceFileType,
} from '../../../types/evidence.types';

// ============================================
// PARTNER: File Uploads
// ============================================

/**
 * Upload files for a project (initial evidence: photos, technical docs, operational docs)
 */
export const uploadProjectFiles = async (
  projectId: string,
  files: File[],
  fileType: EvidenceFileType = 'photo'
): Promise<{ evidenceId: string; files: any[] } | null> => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('fileType', fileType);

    const response = await api.post(
      `/partner/projects/${projectId}/files`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    ) as any;

    if (response.success) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error uploading project files:', error);
    throw error;
  }
};

// ============================================
// PARTNER: Monthly Evidence
// ============================================

/**
 * Submit monthly evidence for restock cycle
 */
export const submitMonthlyEvidence = async (
  projectId: string,
  data: SubmitMonthlyEvidenceRequest,
  files: File[]
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('unitsDelivered', data.unitsDelivered.toString());
    formData.append('newStockRequested', data.newStockRequested.toString());
    if (data.note) formData.append('note', data.note);
    files.forEach((file) => formData.append('files', file));

    const response = await api.post(
      `/partner/projects/${projectId}/evidence`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    ) as any;

    return response;
  } catch (error) {
    console.error('Error submitting monthly evidence:', error);
    throw error;
  }
};

/**
 * Get evidence list for a project (partner can see their own)
 */
export const getProjectEvidence = async (
  projectId: string,
  options?: { type?: string; status?: string }
): Promise<EvidenceListResponse | null> => {
  try {
    const params = new URLSearchParams();
    if (options?.type) params.append('type', options.type);
    if (options?.status) params.append('status', options.status);

    const url = `/partner/projects/${projectId}/evidence${params.toString() ? `?${params}` : ''}`;
    const response = await api.get(url) as any;
    return response;
  } catch (error) {
    console.error('Error fetching evidence:', error);
    throw error;
  }
};

// ============================================
// ADMIN: Evidence Review
// ============================================

/**
 * Get evidence for admin review (with signed URLs)
 */
export const getAdminProjectEvidence = async (
  projectId: string,
  options?: { type?: string; status?: string }
): Promise<EvidenceListResponse | null> => {
  try {
    const params = new URLSearchParams();
    if (options?.type) params.append('type', options.type);
    if (options?.status) params.append('status', options.status);

    const url = `/admin/projects/${projectId}/evidence${params.toString() ? `?${params}` : ''}`;
    const response = await api.get(url) as any;
    return response;
  } catch (error) {
    console.error('Error fetching admin evidence:', error);
    throw error;
  }
};

/**
 * Approve monthly evidence (release payout + renew stock)
 */
export const approveMonthlyEvidence = async (
  projectId: string,
  evidenceId: string,
  data: ApproveMonthlyEvidenceRequest
): Promise<any> => {
  try {
    const response = await api.post(
      `/admin/projects/${projectId}/evidence/${evidenceId}/approve`,
      data
    ) as any;
    return response;
  } catch (error) {
    console.error('Error approving evidence:', error);
    throw error;
  }
};

/**
 * Reject monthly evidence
 */
export const rejectMonthlyEvidence = async (
  projectId: string,
  evidenceId: string,
  data: RejectMonthlyEvidenceRequest
): Promise<any> => {
  try {
    const response = await api.post(
      `/admin/projects/${projectId}/evidence/${evidenceId}/reject`,
      data
    ) as any;
    return response;
  } catch (error) {
    console.error('Error rejecting evidence:', error);
    throw error;
  }
};

export default {
  uploadProjectFiles,
  submitMonthlyEvidence,
  getProjectEvidence,
  getAdminProjectEvidence,
  approveMonthlyEvidence,
  rejectMonthlyEvidence,
};
