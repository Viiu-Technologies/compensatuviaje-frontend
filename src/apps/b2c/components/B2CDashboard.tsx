import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCloud,
  FaLeaf,
  FaClock,
  FaPlane,
  FaCalendarAlt,
  FaChevronDown,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';
import B2CLayout from './B2CLayout';
import b2cApi, { type DashboardData, type DashboardPeriod } from '../services/b2cApi';
import EmissionEvolutionChart from './dashboard/EmissionEvolutionChart';
import EmissionBreakdownDonut from './dashboard/EmissionBreakdownDonut';
import RecentTripsTable from './dashboard/RecentTripsTable';
import NextActionAndAchievement from './dashboard/NextActionAndAchievement';
import { useAuth } from '../context/AuthContext';

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
      className={`inline-flex items-center gap-1 text-[11px] font-bold ${
        good ? 'text-brand-700 dark:text-brand-400' : 'text-rose-600 dark:text-rose-400'
      }`}
    >
      {up ? <FaArrowUp className="text-[9px]" /> : <FaArrowDown className="text-[9px]" />}
      <span>
        {Math.abs(value)}
        {suffix}
      </span>
      <span className="text-gray-500 dark:text-slate-400 font-normal">vs. periodo anterior</span>
    </div>
  );
};

export const B2CDashboard: React.FC = () => {
  const { user } = useAuth();
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
        <div className="space-y-6 animate-pulse">
          <div className="h-44 bg-gray-200 dark:bg-slate-800 rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 h-72 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
            <div className="lg:col-span-5 h-72 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </B2CLayout>
    );
  }

  if (error && !data) {
    return (
      <B2CLayout>
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200/80 dark:border-slate-800 p-8 text-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white m-0 mb-2">
            No pudimos cargar tu resumen
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 m-0 mb-5">
            Revisa tu conexión y vuelve a intentarlo.
          </p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="inline-flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold px-5 py-2.5 rounded-full border-0 cursor-pointer"
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

  const displayName = (user?.nombre || data.user.nombre || '').toUpperCase();

  // Header Right Period Filter Dropdown
  const headerFilterElement = (
    <div className="relative">
      <button
        type="button"
        onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-gray-200 dark:border-slate-700 shadow-xs cursor-pointer transition-all"
      >
        <FaCalendarAlt className="text-gray-400 text-xs" />
        <span>{activePeriodLabel}</span>
        <FaChevronDown className="text-[10px] text-gray-400" />
      </button>

      {periodDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setPeriodDropdownOpen(false)}
          />
          <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl z-30 py-1 text-xs">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setSelectedPeriod(opt.id);
                  setPeriodDropdownOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors border-0 cursor-pointer ${
                  selectedPeriod === opt.id
                    ? 'text-brand-700 dark:text-brand-400 font-bold bg-brand-50/50 dark:bg-brand-950/40'
                    : 'text-gray-700 dark:text-slate-300'
                }`}
              >
                {opt.label}
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
      subtitle="Aquí tienes un resumen de tu huella de carbono y el progreso de tus compensaciones."
      headerRightExtra={headerFilterElement}
    >
      <div className="space-y-6">
        {/* ========================================================= */}
        {/* 1. HERO / TARJETA INTEGRADA: TU HUELLA DE CARBONO        */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs relative overflow-hidden"
        >
          {/* Card Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-800 dark:text-brand-300 flex items-center justify-center text-base flex-shrink-0">
              <FaLeaf />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white m-0 leading-tight">
                Tu huella de carbono
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 m-0 mt-0.5">
                Vuelos, transporte y viajes registrados.
              </p>
            </div>
          </div>

          {/* Grid Layout: 4 Metrics + Right Reduction Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* 4 Metrics in 4 columns */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
              {/* Metric 1: Emisiones totales */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-slate-400">
                  <FaCloud className="text-gray-400 text-sm" />
                  <span>Emisiones totales</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-none">
                  {stats.totalEmissionsTons.toFixed(1)}{' '}
                  <span className="text-xs font-semibold text-gray-400">tCO₂e</span>
                </div>
                <Delta value={stats.emissionsDeltaPercentage} suffix="%" lowerIsBetter />
              </div>

              {/* Metric 2: Compensadas */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-slate-400">
                  <FaLeaf className="text-brand-700 text-sm" />
                  <span>Compensadas</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-none">
                  {stats.totalCompensatedTons.toFixed(1)}{' '}
                  <span className="text-xs font-semibold text-gray-400">tCO₂e</span>
                </div>
                <div className="text-[11px] font-bold text-brand-700 dark:text-brand-400">
                  {stats.compensationRate}%{' '}
                  <span className="text-gray-500 dark:text-slate-400 font-normal">
                    de tu huella
                  </span>
                </div>
              </div>

              {/* Metric 3: Pendientes */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-slate-400">
                  <FaClock className="text-gray-400 text-sm" />
                  <span>Pendientes</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-none">
                  {stats.totalPendingTons.toFixed(1)}{' '}
                  <span className="text-xs font-semibold text-gray-400">tCO₂e</span>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                  <span className="font-bold text-gray-700 dark:text-slate-300">
                    {stats.pendingRate}%
                  </span>{' '}
                  por compensar
                </div>
              </div>

              {/* Metric 4: Viajes registrados */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-slate-400">
                  <FaPlane className="text-gray-400 text-sm" />
                  <span>Viajes registrados</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-none">
                  {stats.totalFlights}
                </div>
                <Delta value={stats.flightsDeltaCount} />
              </div>
            </div>

            {/* Right Card: Puedes reducir tu impacto */}
            <div className="lg:col-span-4 bg-brand-50 dark:bg-brand-950/40 border border-brand-200/70 dark:border-brand-900/40 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-brand-200/80 dark:bg-brand-900/70 text-brand-900 dark:text-brand-200 flex items-center justify-center text-xs">
                    <FaLeaf />
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white m-0">
                    Puedes reducir tu impacto
                  </h4>
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-300 m-0 mb-3 leading-relaxed">
                  {stats.totalPendingTons > 0 ? (
                    <>
                      Te quedan{' '}
                      <span className="font-bold">{stats.totalPendingTons.toFixed(1)} tCO₂e</span> por
                      compensar en este período.
                    </>
                  ) : stats.totalFlights > 0 ? (
                    'Tienes compensados todos tus viajes de este período.'
                  ) : (
                    'Calcula la huella de tu próximo viaje y compénsala con un proyecto verificado.'
                  )}
                </p>
              </div>

              <Link
                to="/b2c/projects"
                className="inline-flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xs hover:shadow-md transition-all no-underline w-fit"
              >
                <FaLeaf className="text-xs" />
                <span>Ver proyectos</span>
              </Link>
            </div>
          </div>
        </motion.div>

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

          {/* Right Column: Tu Próxima Acción + Próximo Logro */}
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
