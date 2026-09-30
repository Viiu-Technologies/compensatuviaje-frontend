import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  FileText,
  UserPlus,
  Activity,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getDashboard, getMetrics, DashboardData, MetricsData } from '../services/adminApi';
import {
  ADMIN_COLORS,
  EmptyState,
  KpiCard,
  Legend,
  PageHeader,
  Panel,
  Skeleton,
  Sparkline,
  cumulative,
  formatCLP,
  formatCLPCompact,
  formatDayLong,
  formatDayShort,
  formatInt,
  formatPercent,
  formatTime,
  kgToTonnes,
  timeAgo,
} from '../ui';

/*
 * Vista general del admin.
 *
 * Rehecha en la fase 1 de la auditoría: antes mezclaba empresas, usuarios y
 * "pendientes" en una dona, ponía 1.284 usuarios y 24 empresas en el mismo
 * eje y no graficaba emisiones ni ingresos, que la API ya entregaba.
 */

const PERIOD_LABELS: Record<string, string> = {
  '7d': 'últimos 7 días',
  '30d': 'últimos 30 días',
  '90d': 'últimos 90 días',
  '365d': 'último año',
};

/** Nombre visible del tipo de entidad (el backend envía la clave interna en inglés). */
const ENTITY_LABELS: Record<string, string> = {
  company: 'Empresa',
  user: 'Usuario',
  b2c_user: 'Usuario B2C',
  document: 'Documento',
  payment: 'Pago',
  compensation: 'Compensación',
  project: 'Proyecto',
  partner: 'Partner',
  certificate: 'Certificado',
  order: 'Orden',
};

const entityLabel = (type: string) => ENTITY_LABELS[type] ?? type;

function activityIcon(type: string) {
  switch (type) {
    case 'company_registered':
      return Building2;
    case 'b2c_user_registered':
      return UserPlus;
    case 'document_uploaded':
      return FileText;
    default:
      return Activity;
  }
}

const EMPTY_DASHBOARD: DashboardData = {
  overview: { totalCompanies: 0, activeCompanies: 0, pendingVerification: 0, totalB2CUsers: 0, activeB2CUsers30d: 0, totalEmissionsKg: 0, totalCompensatedKg: 0, compensationRate: 0, totalRevenueCLP: 0 },
  companies: { total: 0, active: 0, pending: 0, registered: 0, suspended: 0, byStatus: {} },
  b2c: { total: 0, active30d: 0, newThisMonth: 0, withCompensations: 0, totalCalculations: 0 },
  emissions: { totalCalculated: 0, totalCompensated: 0, compensationRate: 0, totalRevenue: 0 },
  verification: { companies: 0, documents: 0, total: 0 },
  recentActivity: [],
  alerts: [],
  workQueue: { pendingCompanies: 0, pendingDocuments: 0, total: 0 },
};

/** Tooltip común de los gráficos: fecha larga y valores formateados. */
function ChartTooltip({ active, payload, label, format }: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string; stroke?: string; fill?: string }>;
  label?: string;
  format: (n: number) => string;
}) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="adm-chart-tooltip">
      <div className="adm-chart-tooltip__date">{formatDayLong(label)}</div>
      {payload.map((p) => (
        <div key={p.name} className="adm-chart-tooltip__row">
          <span className="adm-legend__swatch" style={{ background: p.stroke || p.fill || p.color }} aria-hidden="true" />
          {p.name}: <b>{format(p.value ?? 0)}</b>
        </div>
      ))}
    </div>
  );
}

const axisProps = {
  axisLine: false,
  tickLine: false,
  tick: { fill: ADMIN_COLORS.axis, fontSize: 12 },
} as const;

export default function SuperAdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  // Estado real de la carga (reemplaza el badge fijo "SISTEMA ONLINE", que
  // se mostraba igual aunque el backend estuviera caído).
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashboardData, metricsData] = await Promise.allSettled([getDashboard(), getMetrics(period)]);
      if (dashboardData.status === 'fulfilled') {
        setDashboard(dashboardData.value);
        setLoadError(false);
        setUpdatedAt(new Date());
      } else {
        console.error('Error loading dashboard:', dashboardData.reason);
        setLoadError(true);
        setDashboard(EMPTY_DASHBOARD);
      }
      if (metricsData.status === 'fulfilled') {
        setMetrics(metricsData.value);
      } else {
        console.error('Error loading metrics:', metricsData.reason);
        setMetrics(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const d = dashboard ?? EMPTY_DASHBOARD;
  const periodLabel = PERIOD_LABELS[period] ?? period;

  // Emisiones del período, en t CO₂e para el gráfico
  const emissionsSeries = useMemo(
    () => (metrics?.emissions?.series ?? []).map((p) => ({ date: p.date, calculated: p.calculated ?? 0, compensated: p.compensated ?? 0 })),
    [metrics]
  );
  const periodCalculated = emissionsSeries.reduce((a, p) => a + p.calculated, 0);
  const periodCompensated = emissionsSeries.reduce((a, p) => a + p.compensated, 0);

  const revenueSeries = useMemo(
    () => (metrics?.revenue?.series ?? []).map((p) => ({ date: p.date, value: p.valueCLP ?? 0 })),
    [metrics]
  );

  const registrations = [
    { label: 'Empresas B2B', data: metrics?.newCompanies },
    { label: 'Usuarios B2C', data: metrics?.newB2CUsers },
    { label: 'Impact Partners', data: metrics?.newPartners },
  ];

  // Estado de empresas: "otras" cubre estados sin categoría propia (p. ej. contrato firmado)
  const companyStates = useMemo(() => {
    const c = d.companies;
    const known = [
      { label: 'Activas', value: c?.active ?? 0, color: ADMIN_COLORS.success },
      { label: 'Pendientes', value: c?.pending ?? 0, color: ADMIN_COLORS.warning },
      { label: 'Registradas', value: c?.registered ?? 0, color: ADMIN_COLORS.info },
      { label: 'Suspendidas', value: c?.suspended ?? 0, color: ADMIN_COLORS.danger },
    ];
    const other = Math.max(0, (c?.total ?? 0) - known.reduce((a, k) => a + k.value, 0));
    return other > 0 ? [...known, { label: 'Otros estados', value: other, color: ADMIN_COLORS.neutral }] : known;
  }, [d]);
  const companiesTotal = d.companies?.total ?? 0;

  // Cola de trabajo: lo que requiere una acción del administrador
  const attention = [
    { key: 'companies', count: d.workQueue?.pendingCompanies ?? 0, title: 'Empresas por verificar', meta: 'Documentación de registro', to: '/admin/verificacion', icon: Building2 },
    { key: 'documents', count: d.workQueue?.pendingDocuments ?? 0, title: 'Documentos por revisar', meta: 'Cargados por empresas', to: '/admin/verificacion', icon: FileText },
  ].filter((a) => a.count > 0);
  const alerts = d.alerts ?? [];

  const header = (
    <PageHeader
      title="Vista general"
      description={`Resumen de la plataforma. Los gráficos muestran los ${periodLabel}.`}
      actions={
        <>
          <label className="sr-only" htmlFor="adm-period">Período</label>
          <select id="adm-period" className="adm-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="365d">Último año</option>
          </select>
          <button type="button" className="adm-btn" onClick={loadData} disabled={loading} title="Volver a cargar los datos">
            <RefreshCw aria-hidden="true" />
            {updatedAt ? `Actualizado ${formatTime(updatedAt)}` : 'Actualizar'}
          </button>
        </>
      }
    />
  );

  if (loading && !dashboard) {
    return (
      <div className="adm-page" aria-busy="true">
        {header}
        <div className="adm-kpis">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={132} />)}
        </div>
        <div className="adm-grid adm-grid--2-1">
          <Skeleton height={340} />
          <Skeleton height={340} />
        </div>
      </div>
    );
  }

  return (
    <div className="adm-page">
      {header}

      {loadError && (
        <div role="alert" className="adm-alert adm-alert--danger">
          <AlertTriangle aria-hidden="true" />
          <div>
            <b>No se pudieron cargar los datos del panel.</b> Las cifras en 0 no son reales. Revisa la conexión con el
            servidor y vuelve a intentar.
          </div>
        </div>
      )}

      {/* KPI: el número grande es el total histórico; el pie, lo del período */}
      <div className="adm-kpis">
        <KpiCard
          label="Empresas activas"
          value={formatInt(d.overview?.activeCompanies)}
          context={`de ${formatInt(d.overview?.totalCompanies)} registradas`}
          trend={metrics?.newCompanies?.series ? cumulative(metrics.newCompanies.series.map((p) => p.count)) : undefined}
          foot={metrics?.newCompanies ? <><b>+{formatInt(metrics.newCompanies.total)}</b> nuevas en los {periodLabel}</> : undefined}
        />
        <KpiCard
          label="Usuarios B2C"
          value={formatInt(d.overview?.totalB2CUsers)}
          context={`${formatInt(d.overview?.activeB2CUsers30d)} activos en los últimos 30 días`}
          trend={metrics?.newB2CUsers?.series ? cumulative(metrics.newB2CUsers.series.map((p) => p.count)) : undefined}
          foot={metrics?.newB2CUsers ? <><b>+{formatInt(metrics.newB2CUsers.total)}</b> nuevos en los {periodLabel}</> : undefined}
        />
        <KpiCard
          label="CO₂e compensado"
          value={kgToTonnes(d.overview?.totalCompensatedKg)}
          unit="t"
          context={`${formatPercent(d.overview?.compensationRate)} de lo calculado`}
          trend={emissionsSeries.map((p) => p.compensated)}
          foot={emissionsSeries.length ? <><b>{kgToTonnes(periodCompensated)} t</b> en los {periodLabel}</> : undefined}
        />
        <KpiCard
          label="Ingresos"
          value={formatCLP(d.overview?.totalRevenueCLP)}
          context="Total histórico, CLP"
          trend={revenueSeries.map((p) => p.value)}
          foot={metrics?.revenue ? <><b>{formatCLP(metrics.revenue.totalCLP)}</b> en los {periodLabel}</> : undefined}
        />
      </div>

      <div className="adm-grid adm-grid--2-1">
        <Panel
          title="Emisiones calculadas y compensadas"
          description="Toneladas de CO₂e por día"
          aside={periodCalculated > 0 ? `${formatPercent((periodCompensated / periodCalculated) * 100)} compensado` : undefined}
        >
          {emissionsSeries.length ? (
            <>
              <Legend items={[
                { label: 'Calculadas', color: ADMIN_COLORS.series2 },
                { label: 'Compensadas', color: ADMIN_COLORS.series1 },
              ]} />
              <div style={{ height: 260, marginTop: 12 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={emissionsSeries} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
                    <CartesianGrid vertical={false} stroke={ADMIN_COLORS.grid} />
                    <XAxis dataKey="date" {...axisProps} tickFormatter={formatDayShort} minTickGap={32} dy={6} />
                    <YAxis {...axisProps} width={48} tickFormatter={(v: number) => kgToTonnes(v, 0)} />
                    <Tooltip content={<ChartTooltip format={(v) => `${kgToTonnes(v)} t`} />} />
                    <Area type="monotone" dataKey="calculated" name="Calculadas" stroke={ADMIN_COLORS.series2} fill={ADMIN_COLORS.series2} fillOpacity={0.25} strokeWidth={1.5} />
                    <Area type="monotone" dataKey="compensated" name="Compensadas" stroke={ADMIN_COLORS.series1} fill={ADMIN_COLORS.series1} fillOpacity={0.12} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <EmptyState title="Sin emisiones en el período" text="Aparecerán cuando se registren cálculos." />
          )}
        </Panel>

        <Panel title="Requiere atención" description="Tareas pendientes del equipo" flush>
          {attention.length === 0 && alerts.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Nada pendiente" text="No hay verificaciones ni alertas abiertas." />
          ) : (
            <ul className="adm-list">
              {attention.map((a) => (
                <li key={a.key}>
                  <Link to={a.to} className="adm-list__item">
                    <span className="adm-list__icon"><a.icon aria-hidden="true" /></span>
                    <span className="adm-list__text">
                      <span className="adm-list__title">{a.title}</span>
                      <span className="adm-list__meta">{a.meta}</span>
                    </span>
                    <span className="adm-list__count">{formatInt(a.count)}</span>
                  </Link>
                </li>
              ))}
              {alerts.map((alert, i) => {
                const content = (
                  <>
                    <span className="adm-list__icon"><ShieldAlert aria-hidden="true" /></span>
                    <span className="adm-list__text">
                      <span className="adm-list__title">{alert.message}</span>
                      <span className="adm-list__meta">{alert.type === 'error' ? 'Error' : alert.type === 'warning' ? 'Advertencia' : 'Aviso'}</span>
                    </span>
                  </>
                );
                return (
                  <li key={`alert-${i}`}>
                    {alert.actionUrl?.startsWith('/') ? (
                      <Link to={alert.actionUrl} className="adm-list__item">{content}</Link>
                    ) : (
                      <div className="adm-list__item">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <div className="adm-grid adm-grid--1-1">
        <Panel
          title="Ingresos por día"
          description="Pesos chilenos"
          aside={metrics?.revenue ? formatCLP(metrics.revenue.totalCLP) : undefined}
        >
          {revenueSeries.length ? (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueSeries} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke={ADMIN_COLORS.grid} />
                  <XAxis dataKey="date" {...axisProps} tickFormatter={formatDayShort} minTickGap={32} dy={6} />
                  <YAxis {...axisProps} width={64} tickFormatter={formatCLPCompact} />
                  <Tooltip cursor={{ fill: ADMIN_COLORS.grid }} content={<ChartTooltip format={formatCLP} />} />
                  <Bar dataKey="value" name="Ingresos" fill={ADMIN_COLORS.series1} radius={[2, 2, 0, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="Sin ingresos en el período" />
          )}
        </Panel>

        <Panel title="Registros nuevos" description={`Acumulado de los ${periodLabel}; cada fila con su propia escala`}>
          {registrations.some((r) => r.data) ? (
            <ul className="adm-trend-rows">
              {registrations.map((r) => (
                <li key={r.label} className="adm-trend-row">
                  <span className="adm-trend-row__label">{r.label}</span>
                  <span className="adm-trend-row__value">{formatInt(r.data?.total)}</span>
                  {(r.data?.series?.length ?? 0) > 1 ? (
                    <Sparkline values={cumulative(r.data!.series.map((p) => p.count))} width={120} height={28} label={`Registros acumulados de ${r.label}`} />
                  ) : (
                    <span />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Sin datos de registros" />
          )}
        </Panel>
      </div>

      <div className="adm-grid adm-grid--1-1">
        <Panel title="Estado de las empresas" description="Total histórico" aside={`${formatInt(companiesTotal)} empresas`}>
          {companiesTotal > 0 ? (
            <>
              <div className="adm-stack" role="img" aria-label={companyStates.map((s) => `${s.label}: ${s.value}`).join(', ')}>
                {companyStates.filter((s) => s.value > 0).map((s) => (
                  <span key={s.label} style={{ width: `${(s.value / companiesTotal) * 100}%`, background: s.color }} />
                ))}
              </div>
              <ul className="adm-breakdown">
                {companyStates.map((s) => (
                  <li key={s.label}>
                    <span className="adm-legend__swatch" style={{ background: s.color }} aria-hidden="true" />
                    {s.label}
                    <b>{formatInt(s.value)}</b>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyState title="Aún no hay empresas registradas" />
          )}
        </Panel>

        <Panel title="Actividad reciente" flush>
          {(d.recentActivity?.length ?? 0) > 0 ? (
            <ul className="adm-list">
              {d.recentActivity.slice(0, 6).map((item, i) => {
                const Icon = activityIcon(item.type);
                return (
                  <li key={`activity-${i}`} className="adm-list__item">
                    <span className="adm-list__icon"><Icon aria-hidden="true" /></span>
                    <span className="adm-list__text">
                      <span className="adm-list__title">{item.description}</span>
                      <span className="adm-list__meta">{entityLabel(item.entityType)}</span>
                    </span>
                    <span className="adm-list__end">{timeAgo(item.timestamp)}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState title="Sin actividad reciente" />
          )}
        </Panel>
      </div>
    </div>
  );
}
