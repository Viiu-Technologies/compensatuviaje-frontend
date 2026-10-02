// ============================================
// PARTNER DASHBOARD PAGE
// Resumen del partner: pasos pendientes, verificación, cifras y proyectos.
// ============================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  FolderKanban,
  Leaf,
  Plus,
  Shield,
  ShieldCheck,
  Wallet,
  XCircle,
} from 'lucide-react';
import type { EsgProject, OnboardingStatus, PartnerStats } from '../../../types/partner.types';
import type { KybStatusResponse } from '../../../types/kyb.types';
import { getKybVisualStatus, KYB_TIER_LABELS } from '../../../types/kyb.types';
import { getPartnerProjects, getPartnerStats } from '../services/partnerApi';
import { usePartnerContext } from '../context/PartnerContext';
import {
  Badge,
  btn,
  Card,
  CardHeader,
  cx,
  EmptyState,
  fmtCLP,
  fmtInt,
  fmtKgAuto,
  PageHeader,
  Progress,
  ProjectStatusBadge,
  Skeleton,
  StatCard,
  type Tone,
} from '../ui';

// ============================================
// PASOS DE CONFIGURACIÓN
// ============================================

const OnboardingCard: React.FC<{ status: OnboardingStatus }> = ({ status }) => {
  const steps = [
    { key: 'profile', label: 'Completar perfil', done: status.steps.profile },
    { key: 'logo', label: 'Subir logo', done: status.steps.logo },
    { key: 'bank_details', label: 'Datos bancarios', done: status.steps.bank_details },
  ];
  return (
    <Card>
      <CardHeader
        title="Termina de configurar tu cuenta"
        subtitle="Con estos pasos listos podrás verificar tu empresa y crear proyectos."
        action={<span className="text-2xl font-bold text-brand-700 tabular-nums">{status.percentage} %</span>}
      />
      <Progress value={status.percentage} label="Configuración completada" />
      <ul className="m-0 p-0 list-none mt-5 grid gap-2 sm:grid-cols-3">
        {steps.map((s) => (
          <li
            key={s.key}
            className={cx(
              'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm',
              s.done ? 'border-brand-100 bg-brand-50 text-brand-800' : 'border-gray-200 text-gray-700',
            )}
          >
            {s.done ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            ) : (
              <Circle className="w-4 h-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
            )}
            <span>{s.label}</span>
            <span className="sr-only">{s.done ? '(listo)' : '(pendiente)'}</span>
          </li>
        ))}
      </ul>
      <Link to="/partner/profile" className={cx(btn.primary, 'mt-5')}>
        Continuar configuración
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </Card>
  );
};

// ============================================
// ESTADO DE VERIFICACIÓN (KYB)
// ============================================

const KYB_VIEW: Record<string, { icon: React.ComponentType<{ className?: string }>; tone: Tone; title: string; text: string; cta: string }> = {
  approved: { icon: ShieldCheck, tone: 'success', title: 'Empresa verificada', text: 'Tu cuenta está activa y puedes publicar proyectos.', cta: 'Ver verificación' },
  pending: { icon: Clock, tone: 'info', title: 'Verificación en proceso', text: 'Estamos evaluando el dossier de tu empresa.', cta: 'Ver estado' },
  ai_approved_pending: { icon: Clock, tone: 'warning', title: 'Esperando revisión final', text: 'La evaluación automática terminó; falta la decisión del equipo.', cta: 'Ver resultados' },
  ai_rejected_pending: { icon: Clock, tone: 'warning', title: 'Esperando revisión final', text: 'La evaluación automática terminó; falta la decisión del equipo.', cta: 'Ver resultados' },
  rejected: { icon: XCircle, tone: 'danger', title: 'Verificación rechazada', text: 'Revisa el motivo y envía nueva documentación.', cta: 'Ver motivo' },
  error: { icon: AlertTriangle, tone: 'danger', title: 'No pudimos evaluar tu dossier', text: 'Hubo un problema con la evaluación. Vuelve a intentarlo.', cta: 'Reintentar' },
  none: { icon: Shield, tone: 'neutral', title: 'Verifica tu empresa', text: 'Es necesario para activar tu cuenta y publicar proyectos.', cta: 'Iniciar verificación' },
};

const ICON_TONE: Record<Tone, string> = {
  success: 'bg-brand-50 text-brand-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
  info: 'bg-sky-50 text-sky-800',
  neutral: 'bg-gray-100 text-gray-600',
  chain: 'bg-brand-900/5 text-brand-900',
};

const KybCard: React.FC<{ kybStatus: KybStatusResponse | null; loading: boolean }> = ({ kybStatus, loading }) => {
  if (loading) return <Skeleton className="h-[88px]" />;
  const evaluation = kybStatus?.latest_evaluation ?? null;
  const visual = getKybVisualStatus(evaluation);
  const view = KYB_VIEW[visual] ?? KYB_VIEW.none;
  const Icon = view.icon;
  const tier = evaluation?.partner_tier ? KYB_TIER_LABELS[evaluation.partner_tier] : null;
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4 flex-wrap">
        <span className={cx('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', ICON_TONE[view.tone])}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </span>
        <div className="flex-1 min-w-[12rem]">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="m-0 text-base font-semibold text-gray-900">{view.title}</h2>
            {visual === 'approved' && tier && <Badge tone="warning">Nivel {tier}</Badge>}
          </div>
          <p className="m-0 mt-0.5 text-sm text-gray-500">{view.text}</p>
        </div>
        <Link
          to="/partner/kyb"
          className={cx(visual === 'none' || visual === 'rejected' || visual === 'error' ? btn.primary : btn.secondary, btn.sm)}
        >
          {view.cta}
        </Link>
      </div>
    </Card>
  );
};

// ============================================
// PROYECTOS RECIENTES
// ============================================

const RecentProjects: React.FC<{ projects: EsgProject[]; loading: boolean; canCreate: boolean }> = ({ projects, loading, canCreate }) => (
  <Card className="p-0">
    <div className="px-6 pt-6">
      <CardHeader
        title="Proyectos recientes"
        icon={FolderKanban}
        action={
          projects.length > 0 ? (
            <Link to="/partner/projects" className={cx(btn.ghost, btn.sm)}>
              Ver todos
            </Link>
          ) : undefined
        }
        className="mb-2"
      />
    </div>
    {loading ? (
      <div className="px-6 pb-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    ) : projects.length === 0 ? (
      <EmptyState
        icon={FolderKanban}
        title="Aún no tienes proyectos"
        text={canCreate ? 'Registra tu primer proyecto para empezar a recibir compensaciones.' : 'Podrás crear proyectos cuando tu verificación KYB esté aprobada.'}
        action={
          canCreate ? (
            <Link to="/partner/projects/create" className={btn.primary}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              Crear primer proyecto
            </Link>
          ) : undefined
        }
      />
    ) : (
      <ul className="m-0 p-0 list-none pb-2">
        {projects.map((project) => (
          <li key={project.id} className="border-t border-gray-100 first:border-t-0">
            <Link
              to={`/partner/projects/${project.id}`}
              className="flex items-center gap-4 px-6 py-3.5 no-underline hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="m-0 text-sm font-semibold text-gray-900 truncate">{project.name}</p>
                <p className="m-0 mt-0.5 text-xs text-gray-500 truncate">
                  {project.code}
                  {(project.location_region || project.location_country) && (
                    <> · {[project.location_region, project.location_country].filter(Boolean).join(', ')}</>
                  )}
                </p>
              </div>
              <ProjectStatusBadge status={project.status} />
            </Link>
          </li>
        ))}
      </ul>
    )}
  </Card>
);

// ============================================
// CAPACIDAD Y STOCK
// ============================================

const CapacityCard: React.FC<{ stats: PartnerStats | null; loading: boolean }> = ({ stats, loading }) => {
  if (loading) return <Skeleton className="h-64" />;
  const c = stats?.compensations;
  const total = c?.total_capacity_total ?? 0;
  const sold = c?.total_capacity_sold ?? 0;
  const approved = c?.monthly_stock_approved_total ?? 0;
  const remaining = c?.monthly_stock_remaining_total ?? 0;
  return (
    <Card>
      <CardHeader title="Capacidad y stock" subtitle="Suma de todos tus proyectos" icon={Leaf} />
      {total === 0 && approved === 0 ? (
        <p className="m-0 text-sm text-gray-500">Verás aquí la capacidad cuando tengas proyectos aprobados.</p>
      ) : (
        <dl className="m-0 space-y-5">
          <div>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <dt className="text-gray-500">Capacidad vendida</dt>
              <dd className="m-0 font-semibold text-gray-900 tabular-nums">
                {fmtInt(sold)} / {fmtInt(total)}
              </dd>
            </div>
            <Progress value={total ? (sold / total) * 100 : 0} label="Capacidad vendida" className="mt-2" />
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <dt className="text-gray-500">Stock disponible este mes</dt>
              <dd className="m-0 font-semibold text-gray-900 tabular-nums">
                {fmtInt(remaining)} / {fmtInt(approved)}
              </dd>
            </div>
            <Progress value={approved ? (remaining / approved) * 100 : 0} label="Stock disponible este mes" className="mt-2" />
          </div>
          <div className="flex items-baseline justify-between gap-3 text-sm border-t border-gray-100 pt-4">
            <dt className="text-gray-500">Certificados emitidos</dt>
            <dd className="m-0 font-semibold text-gray-900 tabular-nums">{fmtInt(c?.total_certificates)}</dd>
          </div>
        </dl>
      )}
    </Card>
  );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

const PartnerDashboard: React.FC = () => {
  const { profile, onboarding, kybStatus, loading: kybLoading, isKybVerified } = usePartnerContext();
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<EsgProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      // stats y proyectos recientes no forman parte del estado compartido
      // de onboarding/KYB (PartnerContext): se cargan aquí.
      const [s, p] = await Promise.allSettled([getPartnerStats(), getPartnerProjects({ limit: 5 })]);
      if (!active) return;
      setStats(s.status === 'fulfilled' ? s.value : null);
      setRecentProjects(p.status === 'fulfilled' ? p.value?.projects || [] : []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const p = stats?.projects;
  const c = stats?.compensations;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola, ${profile?.name || 'partner'}`}
        subtitle="Resumen de tu organización y de tus proyectos de compensación."
        actions={
          isKybVerified ? (
            <Link to="/partner/projects/create" className={btn.primary}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              Nuevo proyecto
            </Link>
          ) : undefined
        }
      />

      {onboarding && !onboarding.completed && <OnboardingCard status={onboarding} />}

      <KybCard kybStatus={kybStatus} loading={kybLoading} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[118px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Proyectos"
            icon={FolderKanban}
            value={fmtInt(p?.total)}
            hint={`${fmtInt(p?.active)} ${p?.active === 1 ? 'activo' : 'activos'}`}
          />
          <StatCard
            label="En revisión"
            icon={Clock}
            value={fmtInt(p?.pending_review)}
            tone={p?.pending_review ? 'warning' : 'default'}
            hint="Esperando aprobación"
          />
          <StatCard label="CO₂ compensado" icon={Leaf} value={fmtKgAuto(c?.total_kg_co2)} tone="good" hint="Total acumulado" />
          <StatCard label="Ingresos" icon={Wallet} value={fmtCLP(c?.total_revenue_clp)} hint="Por certificados vendidos" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <RecentProjects projects={recentProjects} loading={loading} canCreate={isKybVerified} />
        </div>
        <CapacityCard stats={stats} loading={loading} />
      </div>
    </div>
  );
};

export default PartnerDashboard;
