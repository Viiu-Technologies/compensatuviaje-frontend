import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaTrophy, FaChevronRight, FaCubes } from 'react-icons/fa';
import { NextAchievementItem } from '../../services/b2cApi';
import { SproutSvg, GlobeSvg, TreeSvg } from '../badges/BadgeSvgs';
import { fmtNum, fmtKgAuto } from '../../ui';

interface NextActionAndAchievementProps {
  pendingTons: number;
  /** null cuando ya alcanzó el nivel máximo. */
  nextAchievement: NextAchievementItem | null;
}

function resolveAchievementSvg(title: string) {
  if (title.toLowerCase().includes('viajero')) return GlobeSvg;
  if (title.toLowerCase().includes('guardi')) return TreeSvg;
  return SproutSvg;
}

export const NextActionAndAchievement: React.FC<NextActionAndAchievementProps> = ({
  pendingTons,
  nextAchievement,
}) => {
  const AchievementSvg = nextAchievement ? resolveAchievementSvg(nextAchievement.title) : SproutSvg;

  return (
    <div className="space-y-4">
      {/* 1. Cápsula de Trazabilidad & Portafolio Regenerativo */}
      <div className="relative overflow-hidden ctv-b2c-carbon-capsule text-white rounded-2xl p-6">
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-mono font-semibold text-brand-200">
              <FaShieldAlt className="text-brand-300 text-xs" aria-hidden="true" />
              <span>Veritas AI + Polygon</span>
            </span>
          </div>

          <h3 className="text-lg font-extrabold text-white m-0 mb-1.5 leading-snug font-display">
            {pendingTons > 0
              ? `Retira ${fmtNum(pendingTons)} tCO₂e con trazabilidad total`
              : 'Portafolio de regeneración verificada'}
          </h3>

          <p className="text-xs text-white/85 m-0 mb-5 leading-relaxed">
            Cada unidad financiada cuenta con auditoría algorítmica de impacto real y respaldo público en blockchain.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/b2c/projects"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-brand-900 hover:bg-brand-50 px-4 py-2 text-xs font-bold no-underline transition-all active:scale-[0.98]"
            >
              <span>Explorar portafolio</span>
              <FaChevronRight className="text-[10px]" aria-hidden="true" />
            </Link>

            <Link
              to="/b2c/nft-certificates"
              className="text-xs font-semibold text-brand-200 hover:text-white inline-flex items-center gap-1.5 no-underline transition-colors"
            >
              <FaCubes className="text-xs" aria-hidden="true" />
              <span>Registro on-chain</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Próximo logro Card con insignia SVG oficial */}
      {nextAchievement && (
        <div className="ctv-b2c-surface bg-white rounded-2xl border border-gray-200/90 p-5 flex items-center justify-between gap-4">
          {/* Left info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 text-brand-700 text-[11px] font-bold uppercase tracking-wider">
              <FaTrophy className="text-amber-600" aria-hidden="true" />
              <span>Próxima insignia</span>
            </div>

            <h4 className="text-base font-bold text-gray-900 m-0 leading-tight font-display">
              {nextAchievement.title}
            </h4>
            <p className="text-xs text-gray-500 m-0 mt-0.5">
              {nextAchievement.targetDescription}
            </p>

            {/* Progress Bar */}
            <div className="w-full max-w-xs mt-3">
              <div
                className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(nextAchievement.progressPercentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progreso hacia ${nextAchievement.title}`}
              >
                <div
                  className="h-full bg-gradient-to-r from-brand-700 to-brand-500 rounded-full transition-all duration-700"
                  style={{ width: `${nextAchievement.progressPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1.5 tabular-nums">
                <span>
                  {nextAchievement.currentKg > 0
                    ? `Faltan ${fmtKgAuto(nextAchievement.remainingKg)} CO₂e`
                    : 'Se activa con tu primera compensación'}
                </span>
                <span className="font-mono font-bold text-brand-700">
                  {nextAchievement.progressPercentage}%
                </span>
              </div>
            </div>

            <Link
              to="/b2c/achievements"
              className="text-xs font-bold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1 mt-3 no-underline transition-colors"
            >
              <span>Sala de insignias</span>
              <FaChevronRight className="text-[10px]" aria-hidden="true" />
            </Link>
          </div>

          {/* Right Official Animated Badge SVG */}
          <div
            className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gray-50 border border-gray-200/80 p-1.5 flex items-center justify-center"
            aria-hidden="true"
          >
            <AchievementSvg className="w-full h-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default NextActionAndAchievement;
