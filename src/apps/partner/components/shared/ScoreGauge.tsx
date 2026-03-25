// ============================================
// SCORE GAUGE COMPONENT
// Componente visual para mostrar puntajes 0-100
// ============================================

/**
 * CONCEPTO: Visualización de datos
 * 
 * Este componente transforma un número (0-100) en una representación visual.
 * Usamos:
 * - Una barra de progreso con gradiente de color
 * - Colores semánticos (verde=bueno, amarillo=medio, rojo=malo)
 * - Animación CSS para transiciones suaves
 */

import React from 'react';

// ============================================
// TYPES
// ============================================

interface ScoreGaugeProps {
  /** Puntaje a mostrar (0-100) */
  score: number;
  /** Etiqueta descriptiva */
  label: string;
  /** Icono opcional (elemento de React o string) */
  icon?: React.ReactNode;
  /** Tamaño del componente */
  size?: 'sm' | 'md' | 'lg';
  /** Mostrar el porcentaje como texto */
  showPercentage?: boolean;
  /** Descripción adicional (tooltip) */
  description?: string;
  /** Umbrales personalizados para colores */
  thresholds?: {
    green: number;  // >= este valor es verde (default: 70)
    yellow: number; // >= este valor es amarillo (default: 50)
  };
  /** Clase CSS adicional */
  className?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Determina el color basado en el score y umbrales
 */
const getScoreColor = (
  score: number, 
  thresholds: { green: number; yellow: number }
): { bg: string; fill: string; text: string } => {
  if (score >= thresholds.green) {
    return {
      bg: '!bg-green-100',
      fill: '!bg-gradient-to-r !from-green-400 !to-emerald-500',
      text: '!text-green-700'
    };
  }
  if (score >= thresholds.yellow) {
    return {
      bg: '!bg-yellow-100',
      fill: '!bg-gradient-to-r !from-yellow-400 !to-amber-500',
      text: '!text-yellow-700'
    };
  }
  return {
    bg: '!bg-red-100',
    fill: '!bg-gradient-to-r !from-red-400 !to-rose-500',
    text: '!text-red-700'
  };
};

/**
 * Configuración de tamaños
 */
const sizeConfig = {
  sm: {
    container: '!w-full',
    bar: '!h-2',
    label: '!text-xs',
    score: '!text-sm',
    icon: '!text-sm'
  },
  md: {
    container: '!w-full',
    bar: '!h-3',
    label: '!text-sm',
    score: '!text-base',
    icon: '!text-base'
  },
  lg: {
    container: '!w-full',
    bar: '!h-4',
    label: '!text-base',
    score: '!text-lg',
    icon: '!text-lg'
  }
};

// ============================================
// COMPONENT
// ============================================

const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  label,
  icon,
  size = 'md',
  showPercentage = true,
  description,
  thresholds = { green: 70, yellow: 50 },
  className = ''
}) => {
  // Asegurar que el score esté en rango válido
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  // Obtener configuración de color y tamaño
  const colors = getScoreColor(normalizedScore, thresholds);
  const sizes = sizeConfig[size];

  return (
    <div 
      className={`${sizes.container} ${className}`}
      title={description}
    >
      {/* Header: Label + Score */}
      <div className="!flex !items-center !justify-between !mb-1.5">
        <div className="!flex !items-center !gap-1.5">
          {icon && <span className={sizes.icon}>{icon}</span>}
          <span className={`${sizes.label} !font-medium !text-slate-700`}>
            {label}
          </span>
        </div>
        {showPercentage && (
          <span className={`${sizes.score} !font-bold ${colors.text}`}>
            {normalizedScore}/100
          </span>
        )}
      </div>

      {/* Barra de progreso */}
      <div className={`!w-full ${sizes.bar} ${colors.bg} !rounded-full !overflow-hidden`}>
        <div 
          className={`!h-full ${colors.fill} !rounded-full !transition-all !duration-500 !ease-out`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
    </div>
  );
};

// ============================================
// VARIANTE: Score Circular (Badge)
// ============================================

interface ScoreCircleProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  thresholds?: { green: number; yellow: number };
  className?: string;
}

export const ScoreCircle: React.FC<ScoreCircleProps> = ({
  score,
  label,
  size = 'md',
  thresholds = { green: 70, yellow: 50 },
  className = ''
}) => {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const colors = getScoreColor(normalizedScore, thresholds);
  
  const sizeClasses = {
    sm: '!w-12 !h-12 !text-sm',
    md: '!w-16 !h-16 !text-lg',
    lg: '!w-20 !h-20 !text-xl'
  };

  return (
    <div className={`!flex !flex-col !items-center !gap-1 ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        !rounded-full 
        ${colors.bg} 
        !flex !items-center !justify-center 
        !font-bold 
        ${colors.text}
        !border-2
        !shadow-sm
      `}>
        {normalizedScore}
      </div>
      {label && (
        <span className="!text-xs !text-slate-600 !text-center !font-medium">
          {label}
        </span>
      )}
    </div>
  );
};

// ============================================
// VARIANTE: Score Card (para dashboards)
// ============================================

interface ScoreCardProps {
  score: number;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  thresholds?: { green: number; yellow: number };
  className?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  score,
  label,
  icon,
  description,
  thresholds = { green: 70, yellow: 50 },
  className = ''
}) => {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const colors = getScoreColor(normalizedScore, thresholds);

  return (
    <div className={`
      !p-4 !rounded-xl !border !bg-white !shadow-sm
      ${className}
    `}>
      <div className="!flex !items-center !gap-2 !mb-2">
        {icon && <span className="!text-lg">{icon}</span>}
        <span className="!text-sm !font-medium !text-slate-600">{label}</span>
      </div>
      
      <div className={`!text-3xl !font-bold ${colors.text} !mb-2`}>
        {normalizedScore}
        <span className="!text-lg !font-normal !text-slate-400">/100</span>
      </div>
      
      <div className={`!h-2 !w-full ${colors.bg} !rounded-full !overflow-hidden`}>
        <div 
          className={`!h-full ${colors.fill} !rounded-full !transition-all !duration-500`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
      
      {description && (
        <p className="!text-xs !text-slate-500 !mt-2">{description}</p>
      )}
    </div>
  );
};

export default ScoreGauge;
