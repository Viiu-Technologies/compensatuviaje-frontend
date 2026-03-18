// ============================================
// CERTIFICATION TYPES - CompensaTuViaje
// Certificación de Proyectos ESG - Agent 2
// ============================================

// ============================================
// ENUMS & BASIC TYPES
// ============================================

/**
 * Tipos de certificación soportados
 * - PDD: Project Design Document (más común)
 * - VVB: Validation/Verification Body
 * - Gold Standard: Certificación internacional
 * - VCS: Verified Carbon Standard
 */
export type CertificationType = 'PDD' | 'VVB' | 'Gold Standard' | 'VCS';

/**
 * Niveles de certificación ESG
 * - PLATINO IMPACTO: Score >= 90 (máximo impacto)
 * - ORO: Score 70-89 (alto impacto)
 * - PLATA: Score 50-69 (impacto moderado)
 * - null: No certificado o rechazado
 */
export type CertificationLevel = 'PLATINO IMPACTO' | 'ORO' | 'PLATA' | null;

/**
 * Estado de la evaluación por la IA
 */
export type CertAiStatus = 'pending' | 'ai_approved' | 'ai_rejected' | 'error';

/**
 * Decisión del administrador (reutilizada de KYB)
 */
export type CertAdminDecision = 'approved' | 'rejected' | null;

// ============================================
// SCORE DETAILS
// ============================================

/**
 * Desglose de puntajes de certificación ESG
 * Cada dimensión evalúa un aspecto del proyecto
 */
export interface CertScoreDetails {
  scoreB: number; // Biodiversidad - Impacto en ecosistemas
  scoreD: number; // Desarrollo social - Beneficios comunitarios
  scoreE: number; // Estándares ambientales - Cumplimiento normativo
}

/**
 * Cumplimiento normativo
 * Indica qué estándares cumple el proyecto
 */
export interface CertCompliance {
  iso14001?: boolean;      // ISO 14001 - Gestión ambiental
  ghg_protocol?: boolean;  // GHG Protocol - Medición de emisiones
  [key: string]: boolean | undefined; // Otros estándares dinámicos
}

// ============================================
// EVALUATION ENTITY
// ============================================

/**
 * Evaluación de certificación completa
 * Representa un intento de certificación ESG de un proyecto
 */
export interface CertificationEvaluation {
  id: string;
  status: CertAiStatus;
  certification_type: CertificationType;
  level: CertificationLevel;
  final_score: number | null;
  confidence_score: number | null;
  reason: string | null;
  project_type_detected: string | null;
  document_name: string;
  document_url?: string;
  request_id?: string;
  details: CertScoreDetails | null;
  compliance: CertCompliance | null;
  report_markdown: string | null;  // Reporte completo en Markdown
  s3_key: string | null;
  admin_decision: CertAdminDecision;
  admin_reason: string | null;
  admin_decided_at: string | null;
  created_at: string;
  n8n_processed_at: string | null;
  project?: {
    id: string;
    name: string;
    code: string;
    status: string;
    projectType: string;
  };
}

// ============================================
// API RESPONSES
// ============================================

/**
 * Respuesta de GET /api/partner/projects/:id/certification/status
 * Estado actual de certificación del proyecto
 */
export interface CertStatusResponse {
  project: {
    id: string;
    name: string;
    status: string;
  };
  has_evaluation: boolean;
  latest_evaluation: CertificationEvaluation | null;
}

/**
 * Respuesta de POST /api/partner/projects/:id/certification (upload)
 * Confirmación de documento PDD recibido
 */
export interface CertUploadResponse {
  id: string;
  status: string;
  certification_type: CertificationType;
  document_name: string;
  created_at: string;
}

/**
 * Respuesta de GET /api/partner/projects/:id/certification/history
 * Historial de todas las certificaciones del proyecto
 */
export interface CertHistoryResponse {
  project: {
    id: string;
    name: string;
  };
  evaluations: CertificationEvaluation[];
}

/**
 * Respuesta de GET /api/partner/projects/:id/certification/:evalId
 * Detalle completo de una evaluación específica
 */
export interface CertDetailResponse extends CertificationEvaluation {
  // Hereda todos los campos de CertificationEvaluation
}

// ============================================
// REQUEST TYPES
// ============================================

/**
 * Datos para subir un nuevo documento de certificación
 * Se envía como FormData (multipart/form-data)
 */
export interface CertUploadRequest {
  certificationType: CertificationType;
  file: File;
}

// ============================================
// UI HELPER TYPES
// ============================================

/**
 * Estado visual de la certificación para mostrar en UI
 */
export type CertVisualStatus = 
  | 'none'              // Sin evaluación
  | 'processing'        // IA procesando
  | 'ai_completed'      // IA terminó, esperando admin
  | 'certified'         // Admin aprobó - Certificado
  | 'rejected';         // Admin rechazó

/**
 * Configuración de badge según estado
 */
export interface CertBadgeConfig {
  color: string;
  bgColor: string;
  icon: string;
  text: string;
}

// ============================================
// CONSTANTS & HELPERS
// ============================================

export const CERTIFICATION_TYPES: CertificationType[] = [
  'PDD',
  'VVB',
  'Gold Standard',
  'VCS'
];

export const CERTIFICATION_TYPE_LABELS: Record<CertificationType, string> = {
  'PDD': 'Project Design Document',
  'VVB': 'Validation/Verification Body',
  'Gold Standard': 'Gold Standard Certification',
  'VCS': 'Verified Carbon Standard'
};

export const CERT_LEVEL_LABELS: Record<NonNullable<CertificationLevel>, string> = {
  'PLATINO IMPACTO': 'Platino Impacto',
  'ORO': 'Oro',
  'PLATA': 'Plata'
};

export const CERT_LEVEL_COLORS: Record<NonNullable<CertificationLevel>, string> = {
  'PLATINO IMPACTO': '!bg-purple-100 !text-purple-800 !border-purple-300',
  'ORO': '!bg-yellow-100 !text-yellow-800 !border-yellow-300',
  'PLATA': '!bg-gray-200 !text-gray-700 !border-gray-400'
};

export const CERT_LEVEL_ICONS: Record<NonNullable<CertificationLevel>, string> = {
  'PLATINO IMPACTO': '💎',
  'ORO': '🥇',
  'PLATA': '🥈'
};

export const CERT_LEVEL_THRESHOLDS = {
  PLATINO: 90,  // >= 90
  ORO: 70,      // >= 70 && < 90
  PLATA: 50     // >= 50 && < 70
};

export const CERT_STATUS_BADGES: Record<string, CertBadgeConfig> = {
  none: {
    color: '!text-gray-600',
    bgColor: '!bg-gray-100',
    icon: '📄',
    text: 'Sin certificar'
  },
  pending: {
    color: '!text-blue-600',
    bgColor: '!bg-blue-100',
    icon: '🔄',
    text: 'Procesando...'
  },
  ai_approved_pending: {
    color: '!text-amber-600',
    bgColor: '!bg-amber-100',
    icon: '🤖',
    text: 'IA Evaluó - Pendiente Admin'
  },
  ai_rejected_pending: {
    color: '!text-orange-600',
    bgColor: '!bg-orange-100',
    icon: '🤖',
    text: 'IA Rechazó - Pendiente Admin'
  },
  certified: {
    color: '!text-green-600',
    bgColor: '!bg-green-100',
    icon: '✅',
    text: 'Certificado'
  },
  rejected: {
    color: '!text-red-600',
    bgColor: '!bg-red-100',
    icon: '❌',
    text: 'Rechazado'
  },
  error: {
    color: '!text-red-600',
    bgColor: '!bg-red-100',
    icon: '⚠️',
    text: 'Error en evaluación'
  }
};

export const SCORE_LABELS: Record<keyof CertScoreDetails, { label: string; icon: string; description: string }> = {
  scoreB: {
    label: 'Biodiversidad',
    icon: '🌱',
    description: 'Impacto en ecosistemas y biodiversidad'
  },
  scoreD: {
    label: 'Desarrollo Social',
    icon: '👥',
    description: 'Beneficios para comunidades locales'
  },
  scoreE: {
    label: 'Estándares Ambientales',
    icon: '🌍',
    description: 'Cumplimiento de normativas ambientales'
  }
};

/**
 * Determina el estado visual basado en la evaluación
 */
export function getCertVisualStatus(evaluation: CertificationEvaluation | null): string {
  if (!evaluation) return 'none';
  
  if (evaluation.admin_decision === 'approved') return 'certified';
  if (evaluation.admin_decision === 'rejected') return 'rejected';
  
  if (evaluation.status === 'pending') return 'pending';
  if (evaluation.status === 'error') return 'error';
  if (evaluation.status === 'ai_approved') return 'ai_approved_pending';
  if (evaluation.status === 'ai_rejected') return 'ai_rejected_pending';
  
  return 'none';
}

/**
 * Obtiene la configuración del badge para una evaluación
 */
export function getCertBadgeConfig(evaluation: CertificationEvaluation | null): CertBadgeConfig {
  const status = getCertVisualStatus(evaluation);
  return CERT_STATUS_BADGES[status] || CERT_STATUS_BADGES.none;
}

/**
 * Calcula el nivel de certificación basado en el score
 */
export function getCertificationLevel(score: number | null): CertificationLevel {
  if (score === null) return null;
  if (score >= CERT_LEVEL_THRESHOLDS.PLATINO) return 'PLATINO IMPACTO';
  if (score >= CERT_LEVEL_THRESHOLDS.ORO) return 'ORO';
  if (score >= CERT_LEVEL_THRESHOLDS.PLATA) return 'PLATA';
  return null;
}

/**
 * Formatea una fecha ISO a formato legible
 */
export function formatCertDate(isoDate: string | null): string {
  if (!isoDate) return 'N/A';
  return new Date(isoDate).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
