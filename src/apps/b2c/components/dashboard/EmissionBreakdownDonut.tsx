import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaGlobeAmericas, FaPlane } from 'react-icons/fa';
import { EmissionCategoryItem } from '../../services/b2cApi';
import { fmtNum } from '../../ui';

interface EmissionBreakdownDonutProps {
  categories: EmissionCategoryItem[];
  totalTons: number;
}

export const EmissionBreakdownDonut: React.FC<EmissionBreakdownDonutProps> = ({
  categories,
  totalTons,
}) => {
  return (
    <div className="ctv-b2c-surface bg-white rounded-2xl border border-gray-200/90 p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center text-sm">
          <FaGlobeAmericas aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 m-0 font-display leading-snug">
            Origen de tus emisiones
          </h3>
          <p className="text-xs text-gray-500 m-0">
            Distribución por alcance de ruta aérea
          </p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="h-52 flex flex-col items-center justify-center text-center px-6 rounded-xl bg-gray-50/70 border border-dashed border-gray-200">
          <p className="text-xs font-medium text-gray-600 m-0">
            Sin emisiones registradas en este período.
          </p>
          <p className="text-xs text-gray-500 m-0 mt-1">
            Aquí verás la proporción entre rutas nacionales e internacionales.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-6 my-auto">
          {/* Left: Donut Chart with Center Text */}
          <div className="sm:col-span-5 relative flex items-center justify-center h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={74}
                  paddingAngle={4}
                  cornerRadius={4}
                  dataKey="tons"
                >
                  {categories.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Total Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-gray-900 leading-none font-display tabular-nums">
                {fmtNum(totalTons)}
              </span>
              <span className="text-[11px] font-mono font-semibold text-gray-500 mt-1">
                tCO₂e
              </span>
            </div>
          </div>

          {/* Right: Breakdown List with proportional bars */}
          <div className="sm:col-span-7 space-y-4">
            {categories.map((cat) => {
              const pct = Math.max(0, Math.min(100, cat.percentage || 0));
              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                        aria-hidden="true"
                      />
                      <FaPlane className="text-gray-400 text-xs" aria-hidden="true" />
                      <span className="font-semibold text-gray-800">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2.5 tabular-nums">
                      <span className="font-mono font-bold text-gray-900">
                        {cat.percentage}%
                      </span>
                      <span className="font-mono text-gray-500 min-w-[64px] text-right">
                        {fmtNum(cat.tons)} t
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmissionBreakdownDonut;
