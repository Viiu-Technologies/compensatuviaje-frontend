import React from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';
import './admin-ui.css';

/* ──────────────────────────────────────────────────────────────────────────
   Componentes base del admin. Estilos en admin-ui.css (clases .adm-*).
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Colores para SVG (Recharts, Sparkline). Reflejan los tokens de admin-ui.css:
 * var(--…) no es confiable dentro de atributos SVG como stroke o fill.
 */
export const ADMIN_COLORS = {
  series1: '#0b5d57',
  series2: '#a9bcb8',
  series3: '#c58b2b',
  grid: '#e6ecea',
  axis: '#6f807e',
  success: '#046302',
  warning: '#c9861a',
  danger: '#b42318',
  info: '#1d5fa8',
  neutral: '#c3d0cc',
} as const;

export interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  /** Controles a la derecha: filtros, "Actualizado HH:MM", acciones. */
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => (
  <header className="adm-page-header">
    <div className="adm-page-header__text">
      <h1 className="adm-page-header__title">{title}</h1>
      {description && <p className="adm-page-header__desc">{description}</p>}
    </div>
    {actions && <div className="adm-page-header__actions">{actions}</div>}
  </header>
);

export interface PanelProps {
  title: string;
  description?: React.ReactNode;
  /** Dato o control alineado a la derecha del título. */
  aside?: React.ReactNode;
  /** Sin padding lateral: para listas que dibujan sus propios bordes. */
  flush?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ title, description, aside, flush, className = '', children }) => (
  <section className={`adm-panel ${className}`.trim()}>
    <div className="adm-panel__head">
      <div>
        <h2 className="adm-panel__title">{title}</h2>
        {description && <p className="adm-panel__desc">{description}</p>}
      </div>
      {aside && <div className="adm-panel__aside">{aside}</div>}
    </div>
    <div className={`adm-panel__body${flush ? ' adm-panel__body--flush' : ''}`}>{children}</div>
  </section>
);

export interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  /** Unidad junto al número ("t", "CLP"). */
  unit?: string;
  /** Una línea de contexto bajo el número: "de 24 registradas". */
  context?: React.ReactNode;
  /** Pie con el dato del período: "+96 en el período". */
  foot?: React.ReactNode;
  /** Serie para el mini gráfico de tendencia. */
  trend?: number[];
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, unit, context, foot, trend }) => (
  <article className="adm-kpi">
    <span className="adm-kpi__label">{label}</span>
    <div className="adm-kpi__row">
      <span className="adm-kpi__value">
        {value}
        {unit && <span className="adm-kpi__unit">{unit}</span>}
      </span>
      {trend && trend.length > 1 && (
        <span className="adm-kpi__trend">
          <Sparkline values={trend} />
        </span>
      )}
    </div>
    {context && <span className="adm-kpi__context">{context}</span>}
    {foot && <div className="adm-kpi__foot">{foot}</div>}
  </article>
);

export interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  label?: string;
}

/** Línea de tendencia mínima, con área suave y el último punto marcado. */
export const Sparkline: React.FC<SparklineProps> = ({
  values,
  width = 96,
  height = 32,
  color = ADMIN_COLORS.series1,
  label = 'Tendencia del período',
}) => {
  const pad = 3;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = (width - pad * 2) / (values.length - 1);
  const pts = values.map((v, i) => [pad + i * step, height - pad - ((v - min) / span) * (height - pad * 2)] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${height} L${pts[0][0].toFixed(1)},${height} Z`;
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg className="adm-sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <path d={area} fill={color} opacity={0.08} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r={2.5} fill={color} />
    </svg>
  );
};

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export const StatusBadge: React.FC<{ tone: StatusTone; children: React.ReactNode }> = ({ tone, children }) => (
  <span className={`adm-badge adm-badge--${tone}`}>{children}</span>
);

export interface EmptyStateProps {
  title: string;
  text?: React.ReactNode;
  icon?: LucideIcon;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, text, icon: Icon = Inbox }) => (
  <div className="adm-empty">
    <Icon aria-hidden="true" />
    <p className="adm-empty__title">{title}</p>
    {text && <p className="adm-empty__text">{text}</p>}
  </div>
);

export interface LegendItem {
  label: string;
  color: string;
}

export const Legend: React.FC<{ items: LegendItem[] }> = ({ items }) => (
  <div className="adm-legend">
    {items.map((i) => (
      <span key={i.label} className="adm-legend__item">
        <span className="adm-legend__swatch" style={{ background: i.color }} aria-hidden="true" />
        {i.label}
      </span>
    ))}
  </div>
);

export const Skeleton: React.FC<{ height: number; className?: string }> = ({ height, className = '' }) => (
  <div className={`adm-skeleton ${className}`.trim()} style={{ height }} aria-hidden="true" />
);
