import React from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaTrophy, FaChevronRight } from 'react-icons/fa';
import { NextAchievementItem } from '../../services/b2cApi';
import { fmtNum, btn } from '../../ui';

interface NextActionAndAchievementProps {
  pendingTons: number;
  /** null cuando ya alcanzó el nivel máximo. */
  nextAchievement: NextAchievementItem | null;
}

export const NextActionAndAchievement: React.FC<NextActionAndAchievementProps> = ({
  pendingTons,
  nextAchievement,
}) => {
  return (
    <div className="space-y-4">
      {/* 1. Tu próxima acción Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#ebf8f0] to-[#e0f5e9] dark:from-brand-950/40 dark:to-brand-900/30 border border-brand-200/80 dark:border-brand-800/40 rounded-2xl p-6 shadow-xs">
        {/* Subtle Decorative Tree SVGs in background corner */}
        <div className="absolute right-0 bottom-0 pointer-events-none opacity-40 dark:opacity-20 translate-x-2 translate-y-2">
          <svg width="180" height="110" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="140" cy="110" rx="40" ry="30" fill="#a7f3d0" />
            <path d="M140 10 C140 10 120 50 120 85 C120 96 128 105 140 105 C152 105 160 96 160 85 C160 50 140 10 140 10 Z" fill="#34d399" />
            <path d="M165 40 C165 40 150 70 150 92 C150 100 156 106 165 106 C174 106 180 100 180 92 C180 70 165 40 165 40 Z" fill="#10b981" />
            <path d="M115 50 C115 50 102 75 102 95 C102 102 107 107 115 107 C123 107 128 102 128 95 C128 75 115 50 115 50 Z" fill="#059669" />
          </svg>
        </div>

        {/* Card Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-brand-200/80 dark:bg-brand-800/60 text-brand-800 dark:text-brand-200 flex items-center justify-center text-xs">
              <FaLeaf />
            </div>
            <span className="text-xs font-bold text-brand-800 dark:text-brand-300">
              Tu próxima acción
            </span>
          </div>

          <h3 className="text-lg font-extrabold text-gray-900 dark:text-white m-0 mb-1.5 leading-snug">
            {pendingTons > 0
              ? `Compensa ${fmtNum(pendingTons)} tCO₂e restantes`
              : 'No tienes emisiones pendientes'}
          </h3>

          <p className="text-xs text-gray-600 dark:text-slate-300 m-0 mb-4 max-w-[280px] leading-relaxed">
            Elige uno de nuestros proyectos y contribuye a un futuro más sostenible.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link
              to="/b2c/projects"
              className={btn.primary}
            >
              <FaLeaf className="text-xs" />
              <span>Ver proyectos</span>
            </Link>

            <Link
              to="/b2c/certificates"
              className="text-xs font-bold text-brand-700 dark:text-brand-300 hover:text-brand-800 dark:hover:text-brand-200 inline-flex items-center gap-1 no-underline transition-colors"
            >
              <span>Ver todas las compensaciones</span>
              <FaChevronRight className="text-xs" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Próximo logro Card */}
      {nextAchievement && (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1 text-amber-500 text-xs font-bold uppercase tracking-wider">
            <FaTrophy />
            <span>Próximo logro</span>
          </div>

          <h4 className="text-base font-bold text-gray-900 dark:text-white m-0 leading-tight">
            {nextAchievement.title}
          </h4>
          <p className="text-xs text-gray-400 dark:text-slate-500 m-0 mt-0.5">
            {nextAchievement.targetDescription}
          </p>

          {/* Progress Bar */}
          <div className="w-full max-w-xs mt-3">
            <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-700"
                style={{ width: `${nextAchievement.progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-slate-500 mt-1">
              <span>
                {nextAchievement.currentKg > 0
                  ? `Te faltan ${nextAchievement.remainingKg} kg CO₂e`
                  : 'Aún no has compensado ningún viaje'}
              </span>
              <span className="font-bold text-brand-600 dark:text-brand-300">
                {nextAchievement.progressPercentage}%
              </span>
            </div>
          </div>

          <Link
            to="/b2c/achievements"
            className="text-xs font-bold text-brand-600 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-300 inline-flex items-center gap-1 mt-2.5 no-underline transition-colors"
          >
            <span>Ver todos los logros</span>
            <FaChevronRight className="text-xs" />
          </Link>
        </div>

        {/* Right Gold Ring Badge Graphic */}
        <div className="flex-shrink-0 relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300 dark:from-amber-900/40 dark:to-amber-700/40 p-1 flex items-center justify-center shadow-inner">
          <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border border-amber-300 dark:border-amber-600">
            <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center text-brand-600 dark:text-brand-300 text-lg shadow-xs">
              🌱
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default NextActionAndAchievement;
