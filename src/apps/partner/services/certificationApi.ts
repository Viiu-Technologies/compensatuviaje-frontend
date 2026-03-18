// ============================================
// CERTIFICATION API SERVICE - CompensaTuViaje
// Servicios para Certificación de Proyectos ESG (Agent 2)
// ============================================

import api from '../../../shared/services/api';
import type {
  CertStatusResponse,
  CertUploadResponse,
  CertDetailResponse,
  CertHistoryResponse,
  CertificationType
} from '../../../types/certification.types';

// ============================================
// CERTIFICATION API ENDPOINTS
// ============================================

/**
 * Subir documento PDD para evaluación de certificación ESG
 * 
 * @param projectId - ID del proyecto a certificar
 * @param formData - FormData con: file (PDF), certificationType
 * @returns Confirmación del documento recibido
 * 
 * CONCEPTO: Cada proyecto tiene su propia certificación.
 * El projectId en la URL indica a qué proyecto pertenece.
 */
export const uploadCertificationDocument = async (
  projectId: string, 
  formData: FormData
): Promise<CertUploadResponse> => {
  try {
    const response = await api.post(
      `/partner/projects/${projectId}/certification`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ) as any;
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Error al subir documento de certificación');
  } catch (error: any) {
    // Manejar errores específicos
    if (error.status === 409) {
      throw { 
        ...error, 
        message: 'Ya existe una evaluación en proceso para este proyecto. Espera a que finalice.' 
      };
    }
    if (error.status === 404) {
      throw { 
        ...error, 
        message: 'Proyecto no encontrado o no tienes permisos para certificarlo.' 
      };
    }
    throw error;
  }
};

/**
 * Obtener estado actual de certificación del proyecto
 * 
 * @param projectId - ID del proyecto
 * @returns Estado actual de certificación
 * 
 * CONCEPTO: Este endpoint se usa para:
 * 1. Determinar qué UI mostrar (formulario, procesando, resultados)
 * 2. Hacer polling mientras status === 'pending'
 */
export const getCertificationStatus = async (projectId: string): Promise<CertStatusResponse> => {
  try {
    const response = await api.get(
      `/partner/projects/${projectId}/certification/status`
    ) as any;
    
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Error al obtener estado de certificación');
  } catch (error: any) {
    console.error('Error fetching certification status:', error);
    throw error;
  }
};

/**
 * Obtener detalle completo de una evaluación de certificación
 * 
 * @param projectId - ID del proyecto
 * @param evalId - ID de la evaluación
 * @returns Todos los detalles incluyendo report_markdown
 * 
 * CONCEPTO: El report_markdown es un string con formato Markdown
 * que debe renderizarse como HTML en el frontend.
 */
export const getCertificationDetail = async (
  projectId: string, 
  evalId: string
): Promise<CertDetailResponse> => {
  try {
    const response = await api.get(
      `/partner/projects/${projectId}/certification/${evalId}`
    ) as any;
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Error al obtener detalle de certificación');
  } catch (error: any) {
    if (error.status === 404) {
      throw { ...error, message: 'Evaluación de certificación no encontrada' };
    }
    throw error;
  }
};

/**
 * Obtener historial de todas las certificaciones del proyecto
 * 
 * @param projectId - ID del proyecto
 * @returns Lista de todas las evaluaciones del proyecto
 */
export const getCertificationHistory = async (projectId: string): Promise<CertHistoryResponse> => {
  try {
    const response = await api.get(
      `/partner/projects/${projectId}/certification/history`
    ) as any;
    
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Error al obtener historial de certificación');
  } catch (error: any) {
    console.error('Error fetching certification history:', error);
    throw error;
  }
};

// ============================================
// HELPER: Crear FormData para upload
// ============================================

/**
 * Helper para crear el FormData de certificación
 * 
 * CONCEPTO: FormData es la forma estándar de enviar archivos
 * en HTTP. Automáticamente configura el Content-Type correcto.
 */
export const createCertificationFormData = (
  file: File, 
  certificationType: CertificationType
): FormData => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('certificationType', certificationType);
  return formData;
};

// ============================================
// EXPORT DEFAULT
// ============================================

const certificationApi = {
  upload: uploadCertificationDocument,
  getStatus: getCertificationStatus,
  getDetail: getCertificationDetail,
  getHistory: getCertificationHistory,
  createFormData: createCertificationFormData
};

export default certificationApi;
