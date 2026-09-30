import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox, Search, X, type LucideIcon } from 'lucide-react';
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

/* ──────────────────────────────────────────────────────────────────────────
   Datos: búsqueda, filtro segmentado, paginación y filas de carga
   ────────────────────────────────────────────────────────────────────────── */

export interface SearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

/** Campo de búsqueda con ícono. `label` queda para lectores de pantalla. */
export const SearchField: React.FC<SearchFieldProps> = ({ label, ...rest }) => (
  <div className="adm-search">
    <Search aria-hidden="true" />
    <input type="search" className="adm-input" aria-label={label} {...rest} />
  </div>
);

export interface SegmentedOption {
  value: string;
  label: string;
}

export const Segmented: React.FC<{
  label: string;
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
}> = ({ label, options, value, onChange }) => (
  <div className="adm-segmented" role="group" aria-label={label}>
    {options.map((o) => (
      <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
        {o.label}
      </button>
    ))}
  </div>
);

/** Páginas visibles: 1 … 4 5 6 … 12 */
const pageWindow = (page: number, total: number): Array<number | 'gap'> => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...set].sort((a, b) => a - b);
  const out: Array<number | 'gap'> = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
};

export interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  /** Filas en la página actual. */
  shown: number;
  /** Sustantivo en plural: "empresas". */
  noun: string;
  onPage: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, total, shown, noun, onPage }) => (
  <nav className="adm-pagination" aria-label="Paginación">
    <span>
      Mostrando <b>{shown.toLocaleString('es-CL')}</b> de <b>{total.toLocaleString('es-CL')}</b> {noun}
    </span>
    {totalPages > 1 && (
      <div className="adm-pagination__pages">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Página anterior">
          <ChevronLeft aria-hidden="true" />
        </button>
        {pageWindow(page, totalPages).map((p, i) =>
          p === 'gap' ? (
            <span key={`gap-${i}`} className="adm-pagination__gap" aria-hidden="true">…</span>
          ) : (
            <button key={p} type="button" onClick={() => onPage(p)} aria-current={p === page ? 'page' : undefined}>
              {p}
            </button>
          )
        )}
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= totalPages} aria-label="Página siguiente">
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    )}
  </nav>
);

export const TableSkeletonRows: React.FC<{ rows?: number; columns: number }> = ({ rows = 5, columns }) => (
  <>
    {Array.from({ length: rows }, (_, i) => (
      <tr key={i} className="adm-row-skeleton" aria-hidden="true">
        <td colSpan={columns}><Skeleton height={14} /></td>
      </tr>
    ))}
  </>
);

/* ──────────────────────────────────────────────────────────────────────────
   Modal
   ────────────────────────────────────────────────────────────────────────── */

export interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  /** Mientras es true no se puede cerrar (acción en curso). */
  busy?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Diálogo modal: Escape y clic fuera cierran (salvo con busy), el foco entra
 * al primer campo o botón y vuelve al elemento que lo abrió al cerrar.
 */
export const Modal: React.FC<ModalProps> = ({ open, title, onClose, busy = false, footer, children }) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  // Refs para que Escape use siempre el busy/onClose actuales.
  const busyRef = useRef(busy);
  const onCloseRef = useRef(onClose);
  busyRef.current = busy;
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>('textarea, input, select, button:not([data-modal-close])');
    (first ?? dialog)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busyRef.current) onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="adm-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div ref={dialogRef} className="adm-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <div className="adm-modal__head">
          <h2 id={titleId} className="adm-modal__title">{title}</h2>
          <button type="button" className="adm-icon-btn" onClick={onClose} disabled={busy} aria-label="Cerrar" data-modal-close>
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="adm-modal__body">{children}</div>
        {footer && <div className="adm-modal__foot">{footer}</div>}
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
   Confirmación con promesa (misma API que shared/components/ui/useConfirm,
   pero dibujada con el Modal del admin)
   ────────────────────────────────────────────────────────────────────────── */

export interface AdminConfirmOptions {
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'danger' para acciones destructivas. */
  tone?: 'primary' | 'danger';
}

/**
 * @example
 *   const { confirm, dialog } = useAdminConfirm();
 *   if (!(await confirm({ title: '¿Aprobar?' }))) return;
 *   return <>{contenido}{dialog}</>;
 */
export function useAdminConfirm() {
  const [options, setOptions] = useState<AdminConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback((opts: AdminConfirmOptions) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setOptions(null);
  }, []);

  const dialog = (
    <Modal
      open={!!options}
      title={options?.title ?? ''}
      onClose={() => close(false)}
      footer={
        <>
          <button type="button" className="adm-btn" onClick={() => close(false)}>
            {options?.cancelLabel ?? 'Cancelar'}
          </button>
          <button
            type="button"
            className={`adm-btn ${options?.tone === 'danger' ? 'adm-btn--danger' : 'adm-btn--primary'}`}
            onClick={() => close(true)}
          >
            {options?.confirmLabel ?? 'Confirmar'}
          </button>
        </>
      }
    >
      {options?.description && <p>{options.description}</p>}
    </Modal>
  );

  return { confirm, dialog };
}
