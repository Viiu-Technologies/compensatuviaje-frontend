// ============================================
// STATUS BADGES COMPONENTS
// Badges visuales para mostrar estados de evaluación
// ============================================

/**
 * CONCEPTO: Componentes de presentación
 * 
 * Estos son "presentational components" o "dumb components".
 * Solo reciben datos via props y los muestran.
 * No tienen lógica de negocio ni efectos secundarios.
 * 
 * Ventajas:
 * - Fáciles de testear
 * - Reutilizables en diferentes contextos
 * - Predecibles (mismo input = mismo output)
 */

import React from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, Loader2, Bot } from 'lucide-react';
import type { PartnerTier } from '../../../../types/kyb.types';
import type { CertificationLevel } from '../../../../types/certification.types';
import {
  KYB_TIER_LABELS,
  KYB_TIER_COLORS,
  KYB_TIER_ICONS,
  getKybBadgeConfig
} from '../../../../types/kyb.types';
import {
  CERT_LEVEL_LABELS,
  CERT_LEVEL_COLORS,
  CERT_LEVEL_ICONS,
  getCertBadgeConfig
} from '../../../../types/certification.types';
import type { KybEvaluation } from '../../../../types/kyb.types';
import type { CertificationEvaluation } from '../../../../types/certification.types';

// ============================================
// KYB STATUS BADGE
// ============================================

interface KybStatusBadgeProps {
  evaluation: KybEvaluation | null;
  showTier?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const KybStatusBadge: React.FC<KybStatusBadgeProps> = ({
  evaluation,
  showTier = true,
  size = 'md',
  className = ''
}) => {
  const config = getKybBadgeConfig(evaluation);
  
  const sizeClasses = {
    sm: '!px-2 !py-0.5 !text-xs',
    md: '!px-3 !py-1 !text-sm',
    lg: '!px-4 !py-1.5 !text-base'
  };

  return (
    <div className={`!inline-flex !items-center !gap-1.5 ${className}`}>
      <span className={`
        !inline-flex !items-center !gap-1.5 !rounded-full !font-medium
        ${sizeClasses[size]}
        ${config.bgColor}
        ${config.color}
      `}>
        <span>{config.icon}</span>
        <span>{config.text}</span>
      </span>
      
      {showTier && evaluation?.partner_tier && evaluation.admin_decision === 'approved' && (
        <TierBadge tier={evaluation.partner_tier} size={size} />
      )}
    </div>
  );
};

// ============================================
// TIER BADGE (PLATINUM, GOLD, SILVER)
// ============================================

interface TierBadgeProps {
  tier: PartnerTier;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  size = 'md',
  className = ''
}) => {
  if (!tier) return null;

  const sizeClasses = {
    sm: '!px-2 !py-0.5 !text-xs',
    md: '!px-3 !py-1 !text-sm',
    lg: '!px-4 !py-1.5 !text-base'
  };

  return (
    <span className={`
      !inline-flex !items-center !gap-1 !rounded-full !font-semibold !border
      ${sizeClasses[size]}
      ${KYB_TIER_COLORS[tier]}
      ${className}
    `}>
      <span>{KYB_TIER_ICONS[tier]}</span>
      <span>{KYB_TIER_LABELS[tier]}</span>
    </span>
  );
};

// ============================================
// CERTIFICATION STATUS BADGE
// ============================================

interface CertStatusBadgeProps {
  evaluation: CertificationEvaluation | null;
  showLevel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CertStatusBadge: React.FC<CertStatusBadgeProps> = ({
  evaluation,
  showLevel = true,
  size = 'md',
  className = ''
}) => {
  const config = getCertBadgeConfig(evaluation);
  
  const sizeClasses = {
    sm: '!px-2 !py-0.5 !text-xs',
    md: '!px-3 !py-1 !text-sm',
    lg: '!px-4 !py-1.5 !text-base'
  };

  return (
    <div className={`!inline-flex !items-center !gap-1.5 ${className}`}>
      <span className={`
        !inline-flex !items-center !gap-1.5 !rounded-full !font-medium
        ${sizeClasses[size]}
        ${config.bgColor}
        ${config.color}
      `}>
        <span>{config.icon}</span>
        <span>{config.text}</span>
      </span>
      
      {showLevel && evaluation?.level && evaluation.admin_decision === 'approved' && (
        <CertLevelBadge level={evaluation.level} size={size} />
      )}
    </div>
  );
};

// ============================================
// CERTIFICATION LEVEL BADGE
// ============================================

interface CertLevelBadgeProps {
  level: CertificationLevel;
  score?: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CertLevelBadge: React.FC<CertLevelBadgeProps> = ({
  level,
  score,
  size = 'md',
  className = ''
}) => {
  if (!level) return null;

  const sizeClasses = {
    sm: '!px-2 !py-0.5 !text-xs',
    md: '!px-3 !py-1 !text-sm',
    lg: '!px-4 !py-1.5 !text-base'
  };

  return (
    <span className={`
      !inline-flex !items-center !gap-1 !rounded-full !font-semibold !border
      ${sizeClasses[size]}
      ${CERT_LEVEL_COLORS[level]}
      ${className}
    `}>
      <span>{CERT_LEVEL_ICONS[level]}</span>
      <span>{CERT_LEVEL_LABELS[level]}</span>
      {score !== undefined && score !== null && (
        <span className="!opacity-75">({score})</span>
      )}
    </span>
  );
};

// ============================================
// ADMIN PENDING BANNER
// ============================================

interface AdminPendingBannerProps {
  className?: string;
}

export const AdminPendingBanner: React.FC<AdminPendingBannerProps> = ({
  className = ''
}) => {
  return (
    <div className={`
      !flex !items-center !gap-3 !p-4 !rounded-lg
      !bg-amber-50 !border !border-amber-200
      ${className}
    `}>
      <div className="!flex-shrink-0">
        <Bot className="!w-6 !h-6 !text-amber-600" />
      </div>
      <div>
        <p className="!text-amber-800 !font-medium">
          Evaluación de IA completada
        </p>
        <p className="!text-amber-700 !text-sm">
          Pendiente revisión final del administrador. Te notificaremos cuando haya una decisión.
        </p>
      </div>
    </div>
  );
};

// ============================================
// PROCESSING STATE COMPONENT
// ============================================

interface ProcessingStateProps {
  title?: string;
  message?: string;
  documentName?: string;
  submittedAt?: string;
  className?: string;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({
  title = 'Evaluación en Proceso',
  message = 'Nuestra IA está analizando tu documento. Este proceso puede tomar entre 5 y 15 minutos.',
  documentName,
  submittedAt,
  className = ''
}) => {
  return (
    <div className={`
      !flex !flex-col !items-center !justify-center !p-8 !text-center
      !bg-blue-50 !border !border-blue-200 !rounded-xl
      ${className}
    `}>
      <div className="!relative !mb-4">
        <div className="!w-16 !h-16 !rounded-full !bg-blue-100 !flex !items-center !justify-center">
          <Loader2 className="!w-8 !h-8 !text-blue-600 !animate-spin" />
        </div>
      </div>
      
      <h3 className="!text-lg !font-semibold !text-blue-900 !mb-2">
        {title}
      </h3>
      
      <p className="!text-blue-700 !max-w-md !mb-4">
        {message}
      </p>
      
      {documentName && (
        <div className="!flex !items-center !gap-2 !text-sm !text-blue-600 !bg-white !px-4 !py-2 !rounded-lg !border !border-blue-200">
          <span>📄</span>
          <span className="!font-medium">{documentName}</span>
        </div>
      )}
      
      {submittedAt && (
        <p className="!text-xs !text-blue-500 !mt-3">
          Enviado: {new Date(submittedAt).toLocaleString('es-CL')}
        </p>
      )}
    </div>
  );
};

// ============================================
// EVALUATION STATUS BADGE (Generic)
// ============================================

type GenericStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'error';

interface EvaluationStatusBadgeProps {
  status: GenericStatus;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const EvaluationStatusBadge: React.FC<EvaluationStatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  className = ''
}) => {
  const configs: Record<GenericStatus, { icon: React.ReactNode; bg: string; text: string; defaultLabel: string }> = {
    pending: {
      icon: <Clock className="!w-4 !h-4" />,
      bg: '!bg-gray-100',
      text: '!text-gray-700',
      defaultLabel: 'Pendiente'
    },
    processing: {
      icon: <Loader2 className="!w-4 !h-4 !animate-spin" />,
      bg: '!bg-blue-100',
      text: '!text-blue-700',
      defaultLabel: 'Procesando'
    },
    approved: {
      icon: <CheckCircle className="!w-4 !h-4" />,
      bg: '!bg-green-100',
      text: '!text-green-700',
      defaultLabel: 'Aprobado'
    },
    rejected: {
      icon: <XCircle className="!w-4 !h-4" />,
      bg: '!bg-red-100',
      text: '!text-red-700',
      defaultLabel: 'Rechazado'
    },
    error: {
      icon: <AlertTriangle className="!w-4 !h-4" />,
      bg: '!bg-red-100',
      text: '!text-red-700',
      defaultLabel: 'Error'
    }
  };

  const config = configs[status];
  
  const sizeClasses = {
    sm: '!px-2 !py-0.5 !text-xs !gap-1',
    md: '!px-3 !py-1 !text-sm !gap-1.5',
    lg: '!px-4 !py-1.5 !text-base !gap-2'
  };

  return (
    <span className={`
      !inline-flex !items-center !rounded-full !font-medium
      ${sizeClasses[size]}
      ${config.bg}
      ${config.text}
      ${className}
    `}>
      {config.icon}
      <span>{label || config.defaultLabel}</span>
    </span>
  );
};

// ============================================
// EXPORT ALL
// ============================================

export default {
  KybStatusBadge,
  TierBadge,
  CertStatusBadge,
  CertLevelBadge,
  AdminPendingBanner,
  ProcessingState,
  EvaluationStatusBadge
};
