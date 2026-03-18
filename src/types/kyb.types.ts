// ============================================
// KYB (Know Your Business) TYPES - CompensaTuViaje
// Verificación Empresarial - Agent 1
// ============================================

// ============================================
// ENUMS & BASIC TYPES
// ============================================

/**
 * Estado de la evaluación por la IA
 * - pending: La IA está procesando el dossier
 * - ai_approved: La IA aprobó (pero falta admin)
 * - ai_rejected: La IA rechazó (pero admin puede override)
 * - error: Hubo un error en el procesamiento
 */
export type KybAiStatus = 'pending' | 'ai_approved' | 'ai_rejected' | 'error';

/**
 * Decisión del administrador
 * - null: Aún no ha decidido
 * - approved: Aprobó la verificación
 * - rejected: Rechazó la verificación
 */
export type AdminDecision = 'approved' | 'rejected' | null;

/**
 * Tier del partner basado en el score
 * - PLATINUM: Score >= 90
 * - GOLD: Score >= 70
 * - SILVER: Score >= 50
 * - null: No asignado o rechazado
 */
export type PartnerTier = 'PLATINUM' | 'GOLD' | 'SILVER' | null;

// ============================================
// SCORES & INSIGHTS
// ============================================

/**
 * Scores de evaluación KYB
 * Cada dimensión se evalúa de 0 a 100
 */
export interface KybScores {
  overall: number;     // Puntaje general promedio
  legal: number;       // Documentación legal
  financial: number;   // Solidez financiera
  technical: number;   // Capacidad técnica
  references: number;  // Referencias comerciales
}

/**
 * Insights/notas generadas por la IA
 * Explicaciones detalladas de cada evaluación
 */
export interface KybInsights {
  legal_notes: string;
  financial_notes: string;
  technical_notes: string;
  references_notes: string;
}

// ============================================
// EVALUATION ENTITY
// ============================================

/**
 * Evaluación KYB completa
 * Representa un intento de verificación empresarial
 */
export interface KybEvaluation {
  id: string;
  ai_status: KybAiStatus;
  partner_tier: PartnerTier;
  document_name: string;
  document_url?: string;
  organization_name: string;
  rut_tax_id?: string;
  scores: KybScores | null;
  ai_insights: KybInsights | null;
  s3_key: string | null;
  admin_decision: AdminDecision;
  admin_reason: string | null;
  admin_decided_at: string | null;
  created_at: string;
  n8n_processed_at: string | null;
}

// ============================================
// API RESPONSES
// ============================================

/**
 * Respuesta de GET /api/partner/kyb/status
 * Estado actual de verificación KYB del partner
 */
export interface KybStatusResponse {
  partner: {
    id: string;
    name: string;
    status: string;
  };
  has_evaluation: boolean;
  latest_evaluation: KybEvaluation | null;
}

/**
 * Respuesta de GET /api/partner/kyb/history
 * Historial de todas las evaluaciones
 */
export interface KybHistoryResponse {
  partner: {
    id: string;
    name: string;
  };
  evaluations: Array<KybEvaluation & { overall_score: number }>;
  total: number;
}

/**
 * Respuesta de POST /api/partner/kyb (upload)
 * Confirmación de dossier recibido
 */
export interface KybUploadResponse {
  id: string;
  status: string;
  document_name: string;
  organization_name: string;
  created_at: string;
}

/**
 * Respuesta de GET /api/partner/kyb/:evalId
 * Detalle completo de una evaluación específica
 */
export interface KybDetailResponse extends KybEvaluation {
  // Hereda todos los campos de KybEvaluation
}

// ============================================
// REQUEST TYPES
// ============================================

/**
 * Datos para subir un nuevo dossier KYB
 * Se envía como FormData (multipart/form-data)
 */
export interface KybUploadRequest {
  organizationName: string;
  rutTaxId: string;
  file: File;
}

// ============================================
// UI HELPER TYPES
// ============================================

/**
 * Estado visual del KYB para mostrar en UI
 */
export type KybVisualStatus = 
  | 'none'              // Sin evaluación
  | 'processing'        // IA procesando
  | 'ai_completed'      // IA terminó, esperando admin
  | 'approved'          // Admin aprobó
  | 'rejected';         // Admin rechazó

/**
 * Configuración de badge según estado
 */
export interface KybBadgeConfig {
  color: string;
  bgColor: string;
  icon: string;
  text: string;
}

// ============================================
// CONSTANTS & HELPERS
// ============================================

export const KYB_TIER_LABELS: Record<NonNullable<PartnerTier>, string> = {
  PLATINUM: 'Platino',
  GOLD: 'Oro',
  SILVER: 'Plata'
};

export const KYB_TIER_COLORS: Record<NonNullable<PartnerTier>, string> = {
  PLATINUM: '!bg-purple-100 !text-purple-800 !border-purple-300',
  GOLD: '!bg-yellow-100 !text-yellow-800 !border-yellow-300',
  SILVER: '!bg-gray-100 !text-gray-600 !border-gray-300'
};

export const KYB_TIER_ICONS: Record<NonNullable<PartnerTier>, string> = {
  PLATINUM: '💎',
  GOLD: '🥇',
  SILVER: '🥈'
};

export const KYB_STATUS_BADGES: Record<string, KybBadgeConfig> = {
  none: {
    color: '!text-gray-600',
    bgColor: '!bg-gray-100',
    icon: '⚪',
    text: 'Sin verificar'
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
    text: 'IA Aprobó - Pendiente Admin'
  },
  ai_rejected_pending: {
    color: '!text-orange-600',
    bgColor: '!bg-orange-100',
    icon: '🤖',
    text: 'IA Rechazó - Pendiente Admin'
  },
  approved: {
    color: '!text-green-600',
    bgColor: '!bg-green-100',
    icon: '✅',
    text: 'Verificado'
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

/**
 * Determina el estado visual basado en la evaluación
 */
export function getKybVisualStatus(evaluation: KybEvaluation | null): string {
  if (!evaluation) return 'none';
  
  if (evaluation.admin_decision === 'approved') return 'approved';
  if (evaluation.admin_decision === 'rejected') return 'rejected';
  
  if (evaluation.ai_status === 'pending') return 'pending';
  if (evaluation.ai_status === 'error') return 'error';
  if (evaluation.ai_status === 'ai_approved') return 'ai_approved_pending';
  if (evaluation.ai_status === 'ai_rejected') return 'ai_rejected_pending';
  
  return 'none';
}

/**
 * Obtiene la configuración del badge para una evaluación
 */
export function getKybBadgeConfig(evaluation: KybEvaluation | null): KybBadgeConfig {
  const status = getKybVisualStatus(evaluation);
  return KYB_STATUS_BADGES[status] || KYB_STATUS_BADGES.none;
}
