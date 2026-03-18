// ============================================
// KYB API SERVICE - CompensaTuViaje
// Servicios para Verificación Empresarial (Agent 1)
// ============================================

import api from '../../../shared/services/api';
import type {
  KybStatusResponse,
  KybUploadResponse,
  KybDetailResponse,
  KybHistoryResponse
} from '../../../types/kyb.types';

// ============================================
// KYB API ENDPOINTS
// ============================================

/**
 * Subir dossier empresarial para evaluación KYB
 * 
 * @param formData - FormData con: file (PDF), organizationName, rutTaxId
 * @returns Confirmación del dossier recibido
 * 
 * CONCEPTO: Usamos FormData porque estamos enviando un archivo binario (PDF).
 * El header 'Content-Type: multipart/form-data' permite enviar archivos.
 */
export const uploadKybDossier = async (formData: FormData): Promise<KybUploadResponse> => {
  try {
    const response = await api.post('/partner/kyb', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }) as any;
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Error al subir dossier KYB');
  } catch (error: any) {
    // Re-lanzar el error con más contexto
    if (error.status === 409) {
      throw { ...error, message: 'Ya existe una evaluación KYB en proceso. Espera a que finalice.' };
    }
    throw error;
  }
};

/**
 * Obtener estado actual de verificación KYB del partner
 * 
 * Este endpoint se usa para:
 * 1. Mostrar el estado actual en la UI
 * 2. Hacer polling mientras ai_status === 'pending'
 * 
 * CONCEPTO: "Polling" significa consultar periódicamente el servidor
 * para detectar cambios. Es útil cuando no tenemos WebSockets.
 */
export const getKybStatus = async (): Promise<KybStatusResponse> => {
  try {
    const response = await api.get('/partner/kyb/status') as any;
    
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Error al obtener estado KYB');
  } catch (error: any) {
    console.error('Error fetching KYB status:', error);
    throw error;
  }
};

/**
 * Obtener detalle completo de una evaluación KYB específica
 * 
 * @param evalId - ID de la evaluación
 * @returns Todos los detalles de la evaluación
 */
export const getKybDetail = async (evalId: string): Promise<KybDetailResponse> => {
  try {
    const response = await api.get(`/partner/kyb/${evalId}`) as any;
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Error al obtener detalle de evaluación KYB');
  } catch (error: any) {
    if (error.status === 404) {
      throw { ...error, message: 'Evaluación KYB no encontrada' };
    }
    throw error;
  }
};

/**
 * Obtener historial de todas las evaluaciones KYB del partner
 * 
 * Útil para mostrar un timeline de intentos de verificación
 */
export const getKybHistory = async (): Promise<KybHistoryResponse> => {
  try {
    const response = await api.get('/partner/kyb/history') as any;
    
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Error al obtener historial KYB');
  } catch (error: any) {
    console.error('Error fetching KYB history:', error);
    throw error;
  }
};

// ============================================
// EXPORT DEFAULT (para compatibilidad con import default)
// ============================================

const kybApi = {
  upload: uploadKybDossier,
  getStatus: getKybStatus,
  getDetail: getKybDetail,
  getHistory: getKybHistory
};

export default kybApi;
