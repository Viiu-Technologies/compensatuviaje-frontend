import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Medal,
  Loader2,
  RefreshCw,
  TreePine,
  Building2,
  Crown,
  TrendingUp,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useAuth } from '../../../auth/context/AuthContext';
import type { CompanyType } from '../../../../types/auth.types';
import {
  getB2BRanking,
  type RankingEntry,
  type RankingPeriod,
} from '../../services/rankingService';

// ── Accent color per company type (mirrors B2BDashboard themes) ───────────────
const COMPANY_TYPE_COLOR: Record<string, string> = {
  TRAVEL_AGENCY: '#0ea5e9',
  TRANSPORT:     '#f59e0b',
  LOGISTICS:     '#14b8a6',
  CORPORATE:     '#8b5cf6',
  EVENTS:        '#f43f5e',
  OTHER:         '#10b981',
};

const COMPANY_TYPE_LABEL: Record<string, string> = {
  TRAVEL_AGENCY: 'Aerolíneas y Agencias',
  TRANSPORT:     'Transporte',
  LOGISTICS:     'Logística',
  CORPORATE:     'Corporativo',
  EVENTS:        'Eventos',
  OTHER:         'Otro',
};

const PERIOD_OPTIONS: { value: RankingPeriod; label: string }[] = [
  { value: 'all',   label: 'Todo el tiempo' },
  { value: 'year',  label: 'Último año' },
  { value: 'month', label: 'Último mes' },
];

// Position medal colours
const POSITION_CONFIG: Record<number, { bg: string; text: string; icon: React.ElementType; iconColor: string }> = {
  1: { bg: 'rgba(234,179,8,0.15)',   text: '#eab308', icon: Crown,  iconColor: '#eab308' },
  2: { bg: 'rgba(148,163,184,0.15)', text: '#94a3b8', icon: Medal,  iconColor: '#94a3b8' },
  3: { bg: 'rgba(180,83,9,0.15)',    text: '#b45309', icon: Medal,  iconColor: '#cd7c3a' },
};

// ── Bar widths relative to #1 ─────────────────────────────────────────────────
function getBarWidth(entry: RankingEntry, maxTons: number): string {
  if (maxTons === 0) return '0%';
  const pct = (entry.tonsTco2 / maxTons) * 100;
  return `${Math.max(pct, 2)}%`;
}

// ── Component ─────────────────────────────────────────────────────────────────
const RankingView: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();
  const isDark = resolvedTheme === 'dark';

  const [ranking, setRanking]       = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [period, setPeriod]         = useState<RankingPeriod>('all');

  const companyType = (user?.companyType as CompanyType) ?? 'OTHER';
  const myAccent    = COMPANY_TYPE_COLOR[companyType] ?? '#10b981';

  const load = useCallback(async (p: RankingPeriod) => {
    setError(null);
    try {
      const data = await getB2BRanking(p);
      setRanking(data.ranking);
    } catch {
      setError('No se pudo cargar el ranking. Intenta más tarde.');
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    load(period).finally(() => setIsLoading(false));
  }, [load, period]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load(period);
    setIsRefreshing(false);
  };

  const maxTons = ranking[0]?.tonsTco2 ?? 0;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="!flex !items-center !justify-center !py-24">
        <div className="!text-center">
          <Trophy className="!w-12 !h-12 !mx-auto !mb-4 !animate-pulse" style={{ color: myAccent }} />
          <p className={isDark ? '!text-gray-400' : '!text-gray-500'}>Cargando ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="!space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="!flex !flex-col sm:!flex-row !items-start sm:!items-center !justify-between !gap-4">
        <div>
          <div className="!flex !items-center !gap-3 !mb-1">
            <div
              className="!p-2.5 !rounded-xl"
              style={{ background: `${myAccent}20` }}
            >
              <Trophy className="!w-5 !h-5" style={{ color: myAccent }} />
            </div>
            <h1 className={`!text-xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>
              Ranking de Empresas
            </h1>
          </div>
          <p className={`!text-sm !pl-14 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
            Empresas que más toneladas de CO₂ han compensado
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`!flex !items-center !gap-2 !px-4 !py-2 !rounded-xl !text-sm !font-medium !border-0 !transition-all ${
            isDark
              ? '!bg-gray-700 hover:!bg-gray-600 !text-gray-300'
              : '!bg-white hover:!bg-gray-50 !text-gray-600 !shadow-sm !border !border-gray-200'
          }`}
        >
          <RefreshCw className={`!w-4 !h-4 ${isRefreshing ? '!animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* ── Period filter ────────────────────────────────────────────────────── */}
      <div className="!flex !gap-2 !flex-wrap">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            className={`!flex !items-center !gap-1.5 !px-4 !py-2 !rounded-xl !text-sm !font-medium !border-0 !transition-all ${
              period === opt.value
                ? '!text-white'
                : isDark
                  ? '!bg-gray-700/60 !text-gray-400 hover:!bg-gray-700 hover:!text-gray-200'
                  : '!bg-white !text-gray-500 hover:!bg-gray-50 !shadow-sm !border !border-gray-200'
            }`}
            style={period === opt.value ? { background: myAccent } : {}}
          >
            <Calendar className="!w-3.5 !h-3.5" />
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── Error state ─────────────────────────────────────────────────────── */}
      {error && (
        <div className={`!flex !items-center !gap-3 !p-4 !rounded-xl ${isDark ? '!bg-red-900/20 !border !border-red-800/40' : '!bg-red-50 !border !border-red-200'}`}>
          <AlertCircle className="!w-5 !h-5 !text-red-400 !flex-shrink-0" />
          <p className={`!text-sm ${isDark ? '!text-red-300' : '!text-red-600'}`}>{error}</p>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {!error && ranking.length === 0 && (
        <div className={`!flex !flex-col !items-center !justify-center !py-20 !rounded-2xl !border-2 !border-dashed ${isDark ? '!border-gray-700 !bg-gray-800/30' : '!border-gray-200 !bg-gray-50'}`}>
          <TreePine className="!w-14 !h-14 !mb-4 !opacity-30" style={{ color: myAccent }} />
          <p className={`!text-base !font-semibold !mb-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
            Aún no hay datos de compensación
          </p>
          <p className={`!text-sm ${isDark ? '!text-gray-600' : '!text-gray-400'}`}>
            El ranking se actualizará cuando las empresas completen sus primeras órdenes.
          </p>
        </div>
      )}

      {/* ── Podium (top 3) ──────────────────────────────────────────────────── */}
      {ranking.length >= 3 && (
        <div className={`!rounded-2xl !p-6 ${isDark ? '!bg-gray-800/60 !border !border-gray-700/60' : '!bg-white !border !border-gray-200 !shadow-sm'}`}>
          <p className={`!text-xs !font-bold !tracking-widest !uppercase !mb-6 ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>
            Podio
          </p>
          <div className="!flex !items-end !justify-center !gap-3 sm:!gap-6">
            {/* 2nd */}
            <PodiumCard entry={ranking[1]} height="!h-24" isDark={isDark} myAccent={myAccent} />
            {/* 1st */}
            <PodiumCard entry={ranking[0]} height="!h-32" isDark={isDark} myAccent={myAccent} crown />
            {/* 3rd */}
            <PodiumCard entry={ranking[2]} height="!h-20" isDark={isDark} myAccent={myAccent} />
          </div>
        </div>
      )}

      {/* ── Full ranking list ────────────────────────────────────────────────── */}
      {!error && ranking.length > 0 && (
        <div className={`!rounded-2xl !overflow-hidden ${isDark ? '!bg-gray-800/60 !border !border-gray-700/60' : '!bg-white !border !border-gray-200 !shadow-sm'}`}>
          <div className={`!px-6 !py-4 !border-b ${isDark ? '!border-gray-700/60' : '!border-gray-100'}`}>
            <div className="!flex !items-center !gap-2">
              <TrendingUp className="!w-4 !h-4" style={{ color: myAccent }} />
              <p className={`!text-sm !font-semibold ${isDark ? '!text-gray-200' : '!text-gray-700'}`}>
                Clasificación completa
              </p>
              <span className={`!ml-auto !text-xs !px-2.5 !py-0.5 !rounded-full ${isDark ? '!bg-gray-700 !text-gray-400' : '!bg-gray-100 !text-gray-500'}`}>
                {ranking.length} empresas
              </span>
            </div>
          </div>

          <div className="!divide-y" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
            <AnimatePresence>
              {ranking.map((entry, idx) => {
                const posConf   = POSITION_CONFIG[entry.position];
                const accent    = COMPANY_TYPE_COLOR[entry.companyType] ?? '#10b981';
                const barWidth  = getBarWidth(entry, maxTons);
                const isMe      = entry.isCurrentCompany;

                return (
                  <motion.div
                    key={entry.companyId}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                    className={`!px-5 !py-4 !flex !items-center !gap-4 !transition-colors ${
                      isMe
                        ? isDark ? '!bg-gray-700/40' : '!bg-gray-50/80'
                        : isDark ? 'hover:!bg-gray-700/30' : 'hover:!bg-gray-50'
                    }`}
                    style={isMe ? { boxShadow: `inset 3px 0 0 ${myAccent}` } : {}}
                  >
                    {/* Position badge */}
                    <div
                      className="!w-8 !h-8 !rounded-full !flex !items-center !justify-center !text-xs !font-bold !flex-shrink-0"
                      style={
                        posConf
                          ? { background: posConf.bg, color: posConf.text }
                          : {
                              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                              color: isDark ? '#6b7280' : '#9ca3af',
                            }
                      }
                    >
                      {posConf ? (
                        <posConf.icon className="!w-4 !h-4" style={{ color: posConf.iconColor }} />
                      ) : (
                        entry.position
                      )}
                    </div>

                    {/* Company type avatar */}
                    <div
                      className="!w-9 !h-9 !rounded-xl !flex !items-center !justify-center !flex-shrink-0"
                      style={{ background: `${accent}20` }}
                    >
                      <Building2 className="!w-4.5 !h-4.5" style={{ color: accent }} />
                    </div>

                    {/* Name + bar */}
                    <div className="!flex-1 !min-w-0">
                      <div className="!flex !items-center !gap-2 !mb-1.5">
                        <p className={`!text-sm !font-semibold !truncate ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>
                          {entry.razonSocial}
                        </p>
                        {isMe && (
                          <span
                            className="!text-[10px] !font-bold !px-2 !py-0.5 !rounded-full !flex-shrink-0"
                            style={{ background: `${myAccent}25`, color: myAccent }}
                          >
                            TÚ
                          </span>
                        )}
                        <span className={`!text-[10px] !px-2 !py-0.5 !rounded-full !flex-shrink-0 !ml-auto ${isDark ? '!bg-gray-700 !text-gray-400' : '!bg-gray-100 !text-gray-500'}`}>
                          {COMPANY_TYPE_LABEL[entry.companyType] ?? entry.companyType}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className={`!h-1.5 !rounded-full !overflow-hidden ${isDark ? '!bg-gray-700' : '!bg-gray-100'}`}>
                        <motion.div
                          className="!h-full !rounded-full"
                          style={{ background: accent }}
                          initial={{ width: 0 }}
                          animate={{ width: barWidth }}
                          transition={{ duration: 0.6, delay: idx * 0.04, ease: 'easeOut' }}
                        />
                      </div>
                    </div>

                    {/* tCO₂ metric */}
                    <div className="!text-right !flex-shrink-0">
                      <p className="!text-base !font-bold" style={{ color: accent }}>
                        {entry.tonsTco2.toLocaleString('es-CL', { maximumFractionDigits: 1 })}
                      </p>
                      <p className={`!text-[10px] ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>
                        ton CO₂
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Podium card sub-component ─────────────────────────────────────────────────
const PodiumCard: React.FC<{
  entry: RankingEntry;
  height: string;
  isDark: boolean;
  myAccent: string;
  crown?: boolean;
}> = ({ entry, height, isDark, myAccent, crown = false }) => {
  const accent = COMPANY_TYPE_COLOR[entry.companyType] ?? '#10b981';
  const posConf = POSITION_CONFIG[entry.position];
  const isMe = entry.isCurrentCompany;

  return (
    <div className="!flex !flex-col !items-center !gap-2 !flex-1 !max-w-[140px]">
      {crown && <Crown className="!w-5 !h-5" style={{ color: '#eab308' }} />}
      <div className={`!w-full ${height} !rounded-xl !flex !items-end !justify-center !pb-3 !transition-all`}
        style={{
          background: `${accent}18`,
          border: `1.5px solid ${accent}35`,
          boxShadow: isMe ? `0 0 0 2px ${myAccent}` : undefined,
        }}
      >
        <div className="!text-center !px-2">
          <p className="!text-[10px] !font-bold" style={{ color: posConf?.text || accent }}>
            #{entry.position}
          </p>
          <p className="!text-xs !font-bold !truncate !w-full" style={{ color: accent }}>
            {entry.tonsTco2.toLocaleString('es-CL', { maximumFractionDigits: 1 })} t
          </p>
        </div>
      </div>
      <p className={`!text-[11px] !font-medium !text-center !line-clamp-2 !leading-tight ${isDark ? '!text-gray-300' : '!text-gray-600'}`}>
        {entry.razonSocial}
      </p>
    </div>
  );
};

export default RankingView;
