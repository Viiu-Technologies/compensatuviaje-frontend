import React from 'react';
/** Íconos de react-icons (B2C) o lucide (partners). */
export type IconType = React.ComponentType<{ className?: string }>;

/**
 * Piezas comunes del área B2C.
 *
 * Reglas de estilo (las mismas del admin, en tono más cercano):
 *  - Color de acción: brand-700 (verde del logo, 7,5:1 con blanco). Nada de
 *    degradados ni violetas; los NFT usan brand-900 (petróleo).
 *  - Neutros: la escala gray de Tailwind y nada más.
 *  - Tarjetas rounded-2xl con borde gray-200; botones y etiquetas rounded-full.
 *  - Texto mínimo 12 px.
 */

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

/* Botones: clases para usar en <button> o <Link>. */
const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold no-underline transition-colors border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700';
export const btn = {
  primary: `${btnBase} bg-brand-700 border-brand-700 text-white hover:bg-brand-800 hover:border-brand-800 px-5 py-2.5`,
  secondary: `${btnBase} bg-white border-gray-300 text-gray-800 hover:bg-gray-50 px-5 py-2.5`,
  ghost: `${btnBase} bg-transparent border-transparent text-brand-700 hover:bg-brand-50 px-3 py-2`,
  danger: `${btnBase} bg-white border-rose-200 text-rose-700 hover:bg-rose-50 px-5 py-2.5`,
  icon: `${btnBase} bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-9 h-9 p-0`,
  sm: 'px-3.5 py-1.5 text-xs',
};

export const Card: React.FC<{ className?: string; children: React.ReactNode; as?: 'div' | 'section' | 'article' }> = ({
  className,
  children,
  as: Tag = 'section',
}) => <Tag className={cx('bg-white rounded-2xl border border-gray-200', className ?? 'p-6')}>{children}</Tag>;

export const CardHeader: React.FC<{
  title: string;
  subtitle?: React.ReactNode;
  icon?: IconType;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, icon: Icon, action, className }) => (
  <div className={cx('flex items-start justify-between gap-4 flex-wrap', className ?? 'mb-5')}>
    <div className="flex items-start gap-3 min-w-0">
      {Icon && (
        <span className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0">
          <Icon className="text-sm [&.lucide]:w-4 [&.lucide]:h-4" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-gray-900 m-0 leading-snug">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 m-0 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

/** Cifra principal con etiqueta y contexto. */
export const Stat: React.FC<{
  label: string;
  value: React.ReactNode;
  unit?: string;
  hint?: React.ReactNode;
  icon?: IconType;
  tone?: 'default' | 'good' | 'warning';
}> = ({ label, value, unit, hint, icon: Icon, tone = 'default' }) => (
  <div className="min-w-0">
    <div className="flex items-center gap-2 text-sm text-gray-500">
      {Icon && <Icon className="text-gray-400 [&.lucide]:w-4 [&.lucide]:h-4" aria-hidden="true" />}
      <span>{label}</span>
    </div>
    <div
      className={cx(
        'mt-1.5 text-3xl font-bold leading-none tabular-nums',
        tone === 'good' ? 'text-brand-700' : tone === 'warning' ? 'text-amber-700' : 'text-gray-900',
      )}
    >
      {value}
      {unit && <span className="ml-1 text-sm font-semibold text-gray-500">{unit}</span>}
    </div>
    {hint && <div className="mt-2 text-xs text-gray-500">{hint}</div>}
  </div>
);

/** Tarjeta con una cifra: para filas de indicadores. */
export const StatCard: React.FC<React.ComponentProps<typeof Stat>> = (props) => (
  <Card className="p-5">
    <Stat {...props} />
  </Card>
);

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'chain';

const TONES: Record<Tone, string> = {
  success: 'bg-brand-50 text-brand-700 border-brand-100',
  warning: 'bg-amber-50 text-amber-800 border-amber-100',
  danger: 'bg-rose-50 text-rose-700 border-rose-100',
  info: 'bg-sky-50 text-sky-800 border-sky-100',
  neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  chain: 'bg-brand-900/5 text-brand-900 border-brand-900/15',
};

export const Badge: React.FC<{ tone?: Tone; icon?: IconType; children: React.ReactNode; className?: string }> = ({
  tone = 'neutral',
  icon: Icon,
  children,
  className,
}) => (
  <span
    className={cx(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
      TONES[tone],
      className,
    )}
  >
    {Icon && <Icon className="text-[11px] [&.lucide]:w-3 [&.lucide]:h-3" aria-hidden="true" />}
    {children}
  </span>
);

export const EmptyState: React.FC<{ icon: IconType; title: string; text?: React.ReactNode; action?: React.ReactNode }> = ({
  icon: Icon,
  title,
  text,
  action,
}) => (
  <div className="text-center py-12 px-6">
    <span className="mx-auto mb-4 w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
      <Icon className="text-xl [&.lucide]:w-5 [&.lucide]:h-5" aria-hidden="true" />
    </span>
    <h3 className="text-base font-semibold text-gray-900 m-0">{title}</h3>
    {text && <p className="text-sm text-gray-500 m-0 mt-1.5 max-w-md mx-auto">{text}</p>}
    {action && <div className="mt-5 flex justify-center">{action}</div>}
  </div>
);

export const ErrorState: React.FC<{ title?: string; text?: string; onRetry?: () => void }> = ({
  title = 'No pudimos cargar esta información',
  text = 'Revisa tu conexión y vuelve a intentarlo.',
  onRetry,
}) => (
  <Card className="p-8 text-center" as="div">
    <h2 className="text-base font-semibold text-gray-900 m-0">{title}</h2>
    <p className="text-sm text-gray-500 m-0 mt-1.5">{text}</p>
    {onRetry && (
      <button type="button" onClick={onRetry} className={cx(btn.primary, 'mt-5')}>
        Reintentar
      </button>
    )}
  </Card>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cx('animate-pulse rounded-2xl bg-gray-200/70', className)} aria-hidden="true" />
);

/** Barra de progreso de un solo color (el de la marca). */
export const Progress: React.FC<{ value: number; label?: string; className?: string }> = ({ value, label, className }) => {
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <div
      className={cx('h-2 rounded-full bg-gray-100 overflow-hidden', className)}
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="h-full rounded-full bg-brand-600" style={{ width: `${v}%` }} />
    </div>
  );
};

/**
 * Diálogo modal simple: Escape y clic fuera cierran (salvo con busy); el foco
 * entra al diálogo y vuelve al elemento que lo abrió.
 */
export const Dialog: React.FC<{
  open: boolean;
  title: string;
  onClose: () => void;
  busy?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
  size?: 'md' | 'lg';
}> = ({ open, title, onClose, busy = false, footer, children, size = 'md' }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const state = React.useRef({ busy, onClose });
  state.current = { busy, onClose };

  React.useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !state.current.busy) state.current.onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx('bg-white rounded-2xl shadow-xl w-full max-h-[90vh] overflow-y-auto outline-none', size === 'lg' ? 'max-w-2xl' : 'max-w-md')}
      >
        <div className="px-6 pt-5 pb-2">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900 m-0">{title}</h2>
        </div>
        <div className="px-6 pb-2 text-sm text-gray-700">{children}</div>
        {footer && <div className="px-6 pt-4 pb-5 flex justify-end gap-2 flex-wrap">{footer}</div>}
      </div>
    </div>
  );
};
