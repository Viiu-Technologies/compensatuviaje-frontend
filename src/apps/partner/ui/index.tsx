import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge, cx, type Tone } from '../../b2c/ui';
import type { EsgProject, ProjectStatus } from '../../../types/partner.types';
import { PROJECT_STATUS_LABELS } from '../../../types/partner.types';

/**
 * Piezas del portal de partners. Reutiliza el kit del área B2C (tarjetas,
 * botones, cifras, etiquetas) para que las tres áreas se vean iguales, y suma
 * lo propio del portal: cabecera de página, campos de solo lectura y estado de
 * proyecto.
 */
export * from '../../b2c/ui';

/** Cabecera de página: volver (opcional), título, subtítulo y acciones. */
export const PageHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  back?: { to: string; label: string };
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, subtitle, back, meta, actions }) => (
  <header className="mb-6">
    {back && (
      <Link
        to={back.to}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 no-underline mb-3"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        {back.label}
      </Link>
    )}
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        {meta && <div className="flex items-center gap-2 flex-wrap mb-1.5">{meta}</div>}
        <h1 className="text-2xl font-bold text-gray-900 m-0 leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 m-0 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  </header>
);

/** Par etiqueta/valor de solo lectura. */
export const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label,
  children,
  className,
}) => (
  <div className={cx('min-w-0', className)}>
    <dt className="text-xs font-medium text-gray-500">{label}</dt>
    <dd className="m-0 mt-1 text-sm text-gray-900 break-words">{children}</dd>
  </div>
);

const PROJECT_TONES: Record<ProjectStatus, Tone> = {
  draft: 'neutral',
  pending_review: 'warning',
  approved: 'info',
  rejected: 'danger',
  active: 'success',
  paused: 'warning',
  completed: 'chain',
};

export const ProjectStatusBadge: React.FC<{ status: ProjectStatus | string }> = ({ status }) => (
  <Badge tone={PROJECT_TONES[status as ProjectStatus] ?? 'neutral'}>
    {PROJECT_STATUS_LABELS[status as ProjectStatus] ?? status}
  </Badge>
);

/** Unidad de impacto del proyecto ("árboles"); si no viene, "unidades". */
export const unitOf = (p?: Pick<EsgProject, 'impact_unit' | 'impact_unit_type'> | null) =>
  p?.impact_unit || p?.impact_unit_type || 'unidades';

/** Tono de un puntaje 0–100: verde desde 70, ámbar desde 50, rojo bajo eso. */
export const scoreTone = (score: number): 'good' | 'warning' | 'danger' =>
  score >= 70 ? 'good' : score >= 50 ? 'warning' : 'danger';

const SCORE_TEXT = { good: 'text-brand-700', warning: 'text-amber-700', danger: 'text-rose-700' };
const SCORE_BAR = { good: 'bg-brand-600', warning: 'bg-amber-500', danger: 'bg-rose-500' };

/** Puntaje de una dimensión de la evaluación, con nota opcional desplegable. */
export const ScoreTile: React.FC<{
  label: string;
  score?: number | null;
  icon?: React.ComponentType<{ className?: string }>;
  notes?: string | null;
}> = ({ label, score, icon: Icon, notes }) => {
  const v = Math.max(0, Math.min(100, Math.round(score ?? 0)));
  const tone = scoreTone(v);
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 min-w-0">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {Icon && <Icon className="w-4 h-4 text-gray-400" aria-hidden="true" />}
        {label}
      </div>
      <p className={cx('m-0 mt-2 text-2xl font-bold tabular-nums leading-none', SCORE_TEXT[tone])}>
        {v}
        <span className="text-sm font-medium text-gray-400"> / 100</span>
      </p>
      <div
        className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden"
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className={cx('h-full rounded-full', SCORE_BAR[tone])} style={{ width: `${v}%` }} />
      </div>
      {notes && (
        <details className="mt-3 group">
          <summary className="cursor-pointer text-xs font-medium text-brand-700 list-none [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Ver comentario</span>
            <span className="hidden group-open:inline">Ocultar comentario</span>
          </summary>
          <p className="m-0 mt-2 text-xs leading-relaxed text-gray-600">{notes}</p>
        </details>
      )}
    </div>
  );
};

/** Clases de inputs del portal (mismo aspecto en todos los formularios). */
export const inputCls =
  'w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15 disabled:bg-gray-50 disabled:text-gray-600 disabled:border-gray-200';
export const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';
