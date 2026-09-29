import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaClock, FaPlane } from 'react-icons/fa';
import { EmissionCategoryItem } from '../../services/b2cApi';

interface EmissionBreakdownDonutProps {
  categories: EmissionCategoryItem[];
  totalTons: number;
}

export const EmissionBreakdownDonut: React.FC<EmissionBreakdownDonutProps> = ({
  categories,
  totalTons,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
          <FaClock />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white m-0">
          ¿De dónde provienen tus emisiones?
        </h3>
      </div>

      {/* Content: Donut + Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-6">
        {/* Left: Donut Chart with Center Text */}
        <div className="sm:col-span-5 relative flex items-center justify-center h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
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
            <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">
              {totalTons.toFixed(1)}
            </span>
            <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 mt-1">
              tCO₂e
            </span>
          </div>
        </div>

        {/* Right: Breakdown List */}
        <div className="sm:col-span-7 space-y-3.5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between text-xs py-1 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <FaPlane className="text-gray-400 dark:text-slate-500 text-xs" />
                <span className="font-medium text-gray-700 dark:text-slate-300">
                  {cat.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 dark:text-white">
                  {cat.percentage}%
                </span>
                <span className="text-gray-400 dark:text-slate-500 min-w-[50px] text-right font-medium">
                  {cat.tons.toFixed(1)} tCO₂e
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmissionBreakdownDonut;
