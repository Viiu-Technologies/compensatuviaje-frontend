import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FaCloud,
  FaLeaf,
  FaClock,
  FaPlane,
  FaCalendarAlt,
  FaChevronDown,
  FaArrowUp,
  FaArrowDown,
  FaCheckCircle,
  FaCertificate,
} from 'react-icons/fa';
import B2CLayout from './B2CLayout';
import b2cApi, { type DashboardData, type DashboardPeriod } from '../services/b2cApi';
import EmissionEvolutionChart from './dashboard/EmissionEvolutionChart';
import EmissionBreakdownDonut from './dashboard/EmissionBreakdownDonut';
import RecentTripsTable from './dashboard/RecentTripsTable';
import NextActionAndAchievement from './dashboard/NextActionAndAchievement';
import { useAuth } from '../context/AuthContext';
import { Badge, btn, fmtNum, fmtPercent, fmtInt, firstName } from '../ui';

const PERIOD_OPTIONS: { id: DashboardPeriod; label: string }[] = [
  { id: '30d', label: 'Últimos 30 días' },
  { id: '90d', label: 'Últimos 3 meses' },
  { id: '1y', label: 'Últimos 12 meses' },
  { id: 'all', label: 'Histórico total' },
];

/** Variación contra el periodo anterior. No se muestra si no hay con qué comparar. */
const Delta: React.FC<{ value: number | null; suffix?: string; lowerIsBetter?: boolean }> = ({
  value,
  suffix = '',
  lowerIsBetter = false,
}) => {
  if (value === null || value === 0) return null;
  const up = value > 0;
  const good = lowerIsBetter ? !up : up;
  return (
    <div
      className={`inline-flex items-center gap-1 text-xs font-bold tabular-nums ${
        good ? 'text-brand-700' : 'text-rose-700'
      }`}
    >
      {up ? <FaArrowUp className="text-[10px]" aria-hidden="true" /> : <FaArrowDown className="text-[10px]" aria-hidden="true" />}
      <span>
        {Math.abs(value)}
        {suffix}
      </span>
      <span className="text-gray-500 font-normal">vs. periodo anterior</span>
    </div>
  );
};

export const B2CDashboard: React.FC = () => {
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>('30d');
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);
        const dashData = await b2cApi.getDashboardStats(selectedPeriod);
        setData(dashData);
      } catch (err) {
        console.error('Error cargando dashboard:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedPeriod, reloadKey]);

  // Loading skeleton
  if (loading && !data) {
    return (
      <B2CLayout>
        <div className="space-y-6 animate-pulse" aria-busy="true">
          <div className="h-52 bg-gray-200/70 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 h-72 bg-gray-200/70 rounded-2xl" />
            <div className="lg:col-span-5 h-72 bg-gray-200/70 rounded-2xl" />
          </div>
        </div>
      </B2CLayout>
    );
  }

  if (error && !data) {
    return (
      <B2CLayout>
        <div className="ctv-b2c-surface bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <h2 className="text-lg font-bold text-gray-900 m-0 mb-2 font-display">
            No pudimos cargar tu resumen
          </h2>
          <p className="text-sm text-gray-500 m-0 mb-5">
            Revisa tu conexión y vuelve a intentarlo.
          </p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className={btn.primary}
          >
            Reintentar
          </button>
        </div>
      </B2CLayout>
    );
  }

  if (!data) return null;

  const {
    stats,
    monthlyEvolution,
    emissionsByCategory,
    recentTrips,
    nextAchievement,
    planetEquivalent,
  } = data;

  // Selected period label
  const activePeriodLabel =
    PERIOD_OPTIONS.find((p) => p.id === selectedPeriod)?.label || 'Últimos 30 días';

  const displayName = firstName(user?.nombre || data.user.nombre, user?.email);
  const clampedCompRate = Math.max(0, Math.min(100, stats.compensationRate || 0));

  // Header Right Period Filter Dropdown
  const headerFilterElement = (
    <div className="relative">
      <button
        type="button"
        onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
        aria-expanded={periodDropdownOpen}
        aria-haspopup="listbox"
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold rounded-xl border border-gray-200 shadow-2xs cursor-pointer transition-all"
      >
        <FaCalendarAlt className="text-brand-700 text-xs" aria-hidden="true" />
        <span>{activePeriodLabel}</span>
        <FaChevronDown className="text-[10px] text-gray-400" aria-hidden="true" />
      </button>

      {periodDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setPeriodDropdownOpen(false)}
          />
          <div
            role="listbox"
            aria-label="Seleccionar período"
            className="absolute right-0 mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-30 py-1.5 text-xs"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={selectedPeriod === opt.id}
                onClick={() => {
                  setSelectedPeriod(opt.id);
                  setPeriodDropdownOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 hover:bg-gray-50 transition-colors border-0 cursor-pointer flex items-center justify-between ${
                  selectedPeriod === opt.id
                    ? 'text-brand-800 font-bold bg-brand-50/70'
                    : 'text-gray-700 font-medium'
                }`}
              >
                <span>{opt.label}</span>
                {selectedPeriod === opt.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-700" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <B2CLayout
      title={displayName ? `Hola, ${displayName}` : 'Hola'}
      subtitle="Telemetría de tu huella de carbono y trazabilidad de compensaciones."
      headerRightExtra={headerFilterElement}
    >
      <div className="space-y-6">
        {/* ========================================================= */}
        {/* 1. HERO / LEDGER DE CARBONO: TU HUELLA DE CARBONO         */}
        {/* ========================================================= */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Balance de huella de carbono"
          className="ctv-b2c-surface bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-7 relative overflow-hidden"
        >
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-800 flex items-center justify-center text-base flex-shrink-0">
                <FaLeaf aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 m-0 leading-tight font-display">
                    Balance de carbono
                  </h2>
                  <Badge tone={stats.totalPendingTons === 0 && stats.totalFlights > 0 ? 'success' : 'neutral'}>
                    {activePeriodLabel}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 m-0 mt-0.5">
                  Emisiones calculadas vs. toneladas retiradas en proyectos verificados.
                </p>
              </div>
            </div>

            {stats.totalEmissionsTons > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200/80 rounded-full px-3 py-1">
                <span className="font-medium">Tasa de neutralidad:</span>
                <span className="font-mono font-bold text-brand-800 tabular-nums">
                  {fmtPercent(stats.compensationRate)}
                </span>
              </div>
            )}
          </div>

          {/* Grid Layout: 4 Metrics + Right Balance Status Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: 4 Metrics + Net-Zero Balance Bar */}
            <div className="lg:col-span-8 flex flex-col justify-between gap-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 sm:divide-x sm:divide-gray-100">
                {/* Metric 1: Emisiones totales */}
                <div className="space-y-1.5 sm:pr-5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <FaCloud className="text-gray-400 text-xs" aria-hidden="true" />
                    <span>Emisiones totales</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-none font-display tabular-nums">
                    {fmtNum(stats.totalEmissionsTons)}{' '}
                    <span className="text-xs font-mono font-semibold text-gray-500">tCO₂e</span>
                  </div>
                  <Delta value={stats.emissionsDeltaPercentage} suffix="%" lowerIsBetter />
                </div>

                {/* Metric 2: Compensadas */}
                <div className="space-y-1.5 sm:px-5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <FaLeaf className="text-brand-700 text-xs" aria-hidden="true" />
                    <span>Compensadas</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-brand-700 leading-none font-display tabular-nums">
                    {fmtNum(stats.totalCompensatedTons)}{' '}
                    <span className="text-xs font-mono font-semibold text-gray-500">tCO₂e</span>
                  </div>
                  <div className="text-xs font-bold text-brand-700 tabular-nums">
                    {fmtPercent(stats.compensationRate)}{' '}
                    <span className="text-gray-500 font-normal">cubierto</span>
                  </div>
                </div>

                {/* Metric 3: Pendientes */}
                <div className="space-y-1.5 sm:px-5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <FaClock className="text-amber-700/80 text-xs" aria-hidden="true" />
                    <span>Pendientes</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-none font-display tabular-nums">
                    {fmtNum(stats.totalPendingTons)}{' '}
                    <span className="text-xs font-mono font-semibold text-gray-500">tCO₂e</span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium tabular-nums">
                    <span className="font-bold text-gray-800">{fmtPercent(stats.pendingRate)}</span>{' '}
                    por retirar
                  </div>
                </div>

                {/* Metric 4: Viajes registrados */}
                <div className="space-y-1.5 sm:pl-5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <FaPlane className="text-gray-400 text-xs" aria-hidden="true" />
                    <span>Viajes</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-none font-display tabular-nums">
                    {fmtInt(stats.totalFlights)}
                  </div>
                  <Delta value={stats.flightsDeltaCount} />
                </div>
              </div>

              {/* Barra integrada de Balance Net-Zero */}
              <div className="rounded-xl bg-gray-50 border border-gray-200/80 p-3.5">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-gray-700">
                    Progreso de neutralización del período
                  </span>
                  <span className="font-mono font-semibold text-gray-700 tabular-nums">
                    {fmtNum(stats.totalCompensatedTons)} / {fmtNum(stats.totalEmissionsTons)} tCO₂e
                  </span>
                </div>
                <div
                  className="h-2 w-full rounded-full bg-gray-200/90 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={Math.round(clampedCompRate)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progreso de neutralización del período"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500 transition-all duration-500"
                    style={{ width: `${clampedCompRate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Card: Acción contextual según estado del balance */}
            <div className="lg:col-span-4 rounded-2xl p-5 flex flex-col justify-between bg-gradient-to-br from-brand-50/90 via-brand-50/50 to-white border border-brand-200/80">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-900">
                    {stats.totalPendingTons > 0 ? (
                      <>
                        <FaLeaf className="text-brand-700" aria-hidden="true" />
                        <span>Brecha de carbono activa</span>
                      </>
                    ) : stats.totalFlights > 0 ? (
                      <>
                        <FaCheckCircle className="text-brand-700" aria-hidden="true" />
                        <span>Huella del período neutralizada</span>
                      </>
                    ) : (
                      <>
                        <FaPlane className="text-brand-700" aria-hidden="true" />
                        <span>Comienza tu registro</span>
                      </>
                    )}
                  </span>
                </div>

                <p className="text-xs text-gray-700 m-0 mb-4 leading-relaxed">
                  {stats.totalPendingTons > 0 ? (
                    <>
                      Tienes{' '}
                      <strong className="font-mono font-bold text-gray-900">
                        {fmtNum(stats.totalPendingTons)} tCO₂e
                      </strong>{' '}
                      sin compensar en este período. Financiar unidades verificadas cierra tu balance.
                    </>
                  ) : stats.totalFlights > 0 ? (
                    'Todos tus viajes registrados en este período cuentan con respaldo de compensación.'
                  ) : (
                    'Calcula las emisiones de tu próximo vuelo con precisión IATA y compénsalas en segundos.'
                  )}
                </p>
              </div>

              {stats.totalPendingTons > 0 ? (
                <Link to="/b2c/projects" className={`${btn.primary} w-full sm:w-fit`}>
                  <FaLeaf className="text-xs" aria-hidden="true" />
                  <span>Compensar huella</span>
                </Link>
              ) : stats.totalFlights > 0 ? (
                <Link to="/b2c/certificates" className={`${btn.secondary} w-full sm:w-fit`}>
                  <FaCertificate className="text-xs text-brand-700" aria-hidden="true" />
                  <span>Ver certificados</span>
                </Link>
              ) : (
                <Link to="/b2c/calculator" className={`${btn.primary} w-full sm:w-fit`}>
                  <FaPlane className="text-xs" aria-hidden="true" />
                  <span>Calcular vuelo</span>
                </Link>
              )}
            </div>
          </div>
        </motion.section>

        {/* ========================================================= */}
        {/* 2. FILA MEDIA: GRÁFICOS ANALÍTICOS (EVOLUCIÓN + DONUT)     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Evolución de emisiones */}
          <div className="lg:col-span-7">
            <EmissionEvolutionChart data={monthlyEvolution} />
          </div>

          {/* ¿De dónde provienen tus emisiones? */}
          <div className="lg:col-span-5">
            <EmissionBreakdownDonut
              categories={emissionsByCategory}
              totalTons={stats.totalEmissionsTons}
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. FILA INFERIOR: VIAJES RECIENTES + ACCIÓN & LOGROS      */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Viajes Recientes + Huella vs Planeta */}
          <div className="lg:col-span-7">
            <RecentTripsTable
              trips={recentTrips}
              treesEquivalent={planetEquivalent.treesCount}
              compensatedTons={stats.totalCompensatedTons}
            />
          </div>

          {/* Right Column: Trazabilidad Regenerativa + Próximo Logro */}
          <div className="lg:col-span-5">
            <NextActionAndAchievement
              pendingTons={stats.totalPendingTons}
              nextAchievement={nextAchievement}
            />
          </div>
        </div>
      </div>
    </B2CLayout>
  );
};

export default B2CDashboard;
