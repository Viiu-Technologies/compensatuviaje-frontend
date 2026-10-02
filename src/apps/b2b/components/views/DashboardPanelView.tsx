import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Leaf,
  RefreshCw,
  Shield,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { getCompanyDashboard, type DashboardResponse, type TimelineEvent } from '../../services/dashboardService';
import { getEmissionDebt, type EmissionDebt } from '../../services/ordersService';
import { getMyCertificates } from '../../services/certificatesService';
import {
  Badge,
  btn,
  Card,
  CardHeader,
  cx,
  ErrorState,
  fmtDate,
  fmtInt,
  fmtTons,
  PageHeader,
  Progress,
  Skeleton,
  StatCard,
  type Tone,
} from '../../ui';

/**
 * Resumen de la empresa. Antes mostraba solo el onboarding (también con la
 * empresa ya activa) y nada de emisiones ni compensaciones: ahora parte por
 * la huella registrada, lo compensado y lo pendiente.
 */

const STATUS: Record<string, { label: string; tone: Tone }> = {
  registered: { label: 'Registrada', tone: 'info' },
  pending_contract: { label: 'Contrato pendiente', tone: 'warning' },
  signed: { label: 'Contrato firmado', tone: 'info' },
  active: { label: 'Activa', tone: 'success' },
  suspended: { label: 'Suspendida', tone: 'danger' },
};

const INDUSTRY: Record<string, string> = {
  aerolineas: 'Aerolíneas y aviación',
  maritimo: 'Transporte marítimo',
  terrestre: 'Transporte terrestre y logística',
  mineria_energia: 'Minería y energía',
  tecnologia: 'Tecnología',
  retail: 'Retail y e-commerce',
  manufactura: 'Manufactura e industria',
  construccion: 'Construcción e inmobiliaria',
  hoteleria_turismo: 'Hotelería y turismo',
  servicios_financieros: 'Servicios financieros',
  salud: 'Salud',
  educacion: 'Educación',
  alimentacion: 'Alimentación y agricultura',
  telecomunicaciones: 'Telecomunicaciones',
  gobierno: 'Sector público',
  consultoria: 'Consultoría',
  otra: 'Otra',
  TRAVEL_AGENCY: 'Aerolíneas y agencias',
  TRANSPORT: 'Transporte',
  LOGISTICS: 'Logística',
  CORPORATE: 'Corporativo',
  EVENTS: 'Eventos',
  OTHER: 'Otra',
};

const industryOf = (industry?: string, companyType?: string) =>
  (industry && INDUSTRY[industry]) || (companyType && INDUSTRY[companyType]) || industry || 'Sin categoría';

/** "Hace 3 días" o la fecha. */
const relative = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hours = Math.floor((Date.now() - d.getTime()) / 3_600_000);
  if (hours < 1) return 'Hace menos de una hora';
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
  return fmtDate(iso);
};

const DashboardPanelView: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [debt, setDebt] = useState<EmissionDebt | null>(null);
  const [certificates, setCertificates] = useState<number | null>(null);

  const load = async () => {
    const [d, e, c] = await Promise.allSettled([getCompanyDashboard(), getEmissionDebt(), getMyCertificates()]);
    setData(d.status === 'fulfilled' ? d.value : null);
    setDebt(e.status === 'fulfilled' ? e.value ?? null : null);
    setCertificates(c.status === 'fulfilled' ? c.value.total : null);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-1/2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[118px]" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (!data) {
    return <ErrorState title="No pudimos cargar el resumen de tu empresa" onRetry={refresh} />;
  }

  const { company, progress, documents, domains, users, nextSteps, timeline } = data;
  const status = STATUS[company.status] ?? { label: company.status, tone: 'neutral' as Tone };
  const onboardingDone = (progress?.overall ?? 0) >= 100 || company.status === 'active';
  const steps = Object.entries(progress?.steps ?? {});
  const emitted = debt?.totalEmitted ?? 0;
  const compensated = debt?.totalCompensated ?? 0;
  const pending = Math.max(0, debt?.tonsPending ?? emitted - compensated);
  const coverage = emitted > 0 ? Math.min(100, (compensated / emitted) * 100) : 0;
  const activity: TimelineEvent[] = (timeline ?? []).slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title={company.razonSocial}
        subtitle={`RUT ${company.rut} · ${industryOf(company.industry, company.companyType)}${company.createdAt ? ` · desde ${fmtDate(company.createdAt)}` : ''}`}
        meta={<Badge tone={status.tone}>{status.label}</Badge>}
        actions={
          <button type="button" onClick={refresh} disabled={refreshing} className={btn.icon} aria-label="Actualizar" title="Actualizar">
            <RefreshCw className={cx('w-4 h-4', refreshing && 'animate-spin')} aria-hidden="true" />
          </button>
        }
      />

      {!onboardingDone && (
        <Card>
          <CardHeader
            title="Activa tu cuenta"
            subtitle="Completa estos pasos para empezar a compensar."
            action={<span className="text-2xl font-bold text-brand-700 tabular-nums">{fmtInt(progress?.overall)} %</span>}
          />
          <Progress value={progress?.overall ?? 0} label="Activación de la cuenta" />
          <ul className="m-0 p-0 list-none mt-5 grid gap-2 sm:grid-cols-2">
            {steps.map(([key, step]) => (
              <li
                key={key}
                className={cx(
                  'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm',
                  step.completed ? 'border-brand-100 bg-brand-50 text-brand-800' : 'border-gray-200 text-gray-700',
                )}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                ) : step.percentage > 0 ? (
                  <Clock className="w-4 h-4 flex-shrink-0 text-amber-600" aria-hidden="true" />
                ) : (
                  <Circle className="w-4 h-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
                )}
                <span className="flex-1">{step.name}</span>
                {!step.completed && step.percentage > 0 && <span className="text-xs text-gray-500 tabular-nums">{step.percentage} %</span>}
              </li>
            ))}
          </ul>
          {nextSteps?.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="m-0 mb-2 text-sm font-semibold text-gray-900">Lo que falta</h3>
              <ul className="m-0 p-0 list-none space-y-2">
                {nextSteps.slice(0, 3).map((s, i) => (
                  <li key={s.id || i} className="flex items-start gap-2 text-sm">
                    <ArrowRight className={cx('w-4 h-4 mt-0.5 flex-shrink-0', s.priority === 'high' ? 'text-amber-600' : 'text-gray-400')} aria-hidden="true" />
                    <span>
                      <span className="font-medium text-gray-900">{s.title}</span>
                      {s.description && <span className="text-gray-500"> · {s.description}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {onNavigate && documents && !documents.isValid && (
            <button type="button" onClick={() => onNavigate('documentos')} className={cx(btn.primary, 'mt-5')}>
              <Upload className="w-4 h-4" aria-hidden="true" />
              Subir documentos
            </button>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Emisiones registradas" icon={Activity} value={debt ? fmtTons(emitted) : '—'} hint="CO₂ de tus vuelos y manifiestos" />
        <StatCard label="Compensado" icon={Leaf} value={debt ? fmtTons(compensated) : '—'} tone="good" hint={emitted > 0 ? `${fmtInt(coverage)} % de lo emitido` : 'Con órdenes aprobadas'} />
        <StatCard
          label="Por compensar"
          icon={Clock}
          value={debt ? fmtTons(pending) : '—'}
          tone={pending > 0 ? 'warning' : 'default'}
          hint={pending > 0 ? 'Elige un proyecto para cubrirlo' : 'Estás al día'}
        />
        <StatCard label="Certificados" icon={ShieldCheck} value={certificates == null ? '—' : fmtInt(certificates)} hint="Emitidos a tu empresa" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Compensación de tu huella" subtitle="Cuánto de lo que emite tu empresa ya está compensado." icon={Leaf} />
            {emitted === 0 ? (
              <p className="m-0 text-sm text-gray-500">
                Aún no hay emisiones registradas. Sube los vuelos de la empresa o usa la calculadora para empezar.
              </p>
            ) : (
              <>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-gray-500">Cubierto</span>
                  <span className="font-semibold text-gray-900 tabular-nums">
                    {fmtTons(compensated)} de {fmtTons(emitted)}
                  </span>
                </div>
                <Progress value={coverage} label="Huella compensada" className="mt-2" />
              </>
            )}
            {onNavigate && (
              <div className="mt-5 flex flex-wrap gap-2">
                {pending > 0 && (
                  <button type="button" onClick={() => onNavigate('proyectos')} className={btn.primary}>
                    Compensar {fmtTons(pending)}
                  </button>
                )}
                <button type="button" onClick={() => onNavigate('calculadora')} className={btn.secondary}>
                  Calcular un vuelo
                </button>
              </div>
            )}
          </Card>

          <Card className="p-0">
            <div className="px-6 pt-6">
              <CardHeader title="Actividad reciente" icon={Activity} className="mb-2" />
            </div>
            {activity.length === 0 ? (
              <p className="m-0 px-6 pb-6 text-sm text-gray-500">Aún no hay actividad registrada.</p>
            ) : (
              <ul className="m-0 p-0 list-none pb-2">
                {activity.map((ev, i) => {
                  const Icon = ev.type === 'status_change' ? Shield : ev.type === 'document_upload' ? FileText : Activity;
                  return (
                    <li key={`${ev.timestamp}-${i}`} className="flex gap-3 px-6 py-3 border-t border-gray-100 first:border-t-0">
                      <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="m-0 text-sm font-medium text-gray-900">{ev.title}</p>
                        {ev.description && <p className="m-0 text-xs text-gray-500">{ev.description}</p>}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{relative(ev.timestamp)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <Card>
          <CardHeader title="Tu cuenta" icon={Building2} />
          <dl className="m-0 space-y-4 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-gray-500">Documentos</dt>
              <dd className="m-0 font-semibold text-gray-900 tabular-nums">
                {fmtInt(documents?.uploaded)} de {fmtInt(documents?.required || documents?.total)}
              </dd>
            </div>
            <Progress value={documents?.completionPercentage ?? 0} label="Documentos" />
            <div className="flex items-baseline justify-between gap-3 pt-1">
              <dt className="text-gray-500">Dominios verificados</dt>
              <dd className="m-0 font-semibold text-gray-900 tabular-nums">
                {fmtInt(domains?.verified)} de {fmtInt(domains?.total)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-gray-500">Usuarios</dt>
              <dd className="m-0 font-semibold text-gray-900 tabular-nums">
                {fmtInt(users?.total)}
                <span className="font-normal text-gray-500"> · {fmtInt(users?.admins)} admin.</span>
              </dd>
            </div>
          </dl>
          {onNavigate && (
            <button type="button" onClick={() => onNavigate('documentos')} className={cx(btn.secondary, btn.sm, 'mt-5')}>
              Ver documentos
            </button>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardPanelView;
