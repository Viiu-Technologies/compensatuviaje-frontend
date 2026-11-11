import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { FaChartBar } from 'react-icons/fa';
import { MonthlyEvolutionItem } from '../../services/b2cApi';
import { fmtNum } from '../../ui';

interface EmissionEvolutionChartProps {
  data: MonthlyEvolutionItem[];
}

type ChartMode = 'both' | 'emissions' | 'compensated';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const year = payload[0]?.payload?.year;
    return (
      <div className="bg-white px-3.5 py-2.5 rounded-xl shadow-lg border border-gray-200 text-xs space-y-1.5">
        <p className="font-bold text-gray-700 m-0 border-b border-gray-100 pb-1">
          {label} {year ?? ''}
        </p>
        {payload.map((entry: any) => {
          const isEmissions = entry.dataKey === 'emissions';
          return (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 text-gray-600">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: isEmissions ? '#073D3D' : '#08AE06' }}
                />
                {isEmissions ? 'Emisiones' : 'Compensadas'}
              </span>
              <span className="font-mono font-bold text-gray-900 tabular-nums">
                {fmtNum(entry.value, 2)} tCO₂e
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export const EmissionEvolutionChart: React.FC<EmissionEvolutionChartProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<ChartMode>('both');

  const isEmpty = data.every((m) => !m.emissions && !m.compensated);
  const showEmissions = activeTab === 'both' || activeTab === 'emissions';
  const showCompensated = activeTab === 'both' || activeTab === 'compensated';

  return (
    <div className="ctv-b2c-surface bg-white rounded-2xl border border-gray-200/90 p-6 flex flex-col justify-between h-full">
      {/* Header with Title and Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center text-sm">
            <FaChartBar aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 m-0 font-display leading-snug">
              Curva de emisiones y retiro
            </h3>
            <p className="text-xs text-gray-500 m-0">
              Evolución mensual en toneladas de CO₂e
            </p>
          </div>
        </div>

        {/* Toggle Segmented Buttons */}
        <div
          className="inline-flex p-1 bg-gray-100 rounded-xl text-xs font-semibold"
          role="group"
          aria-label="Filtrar serie del gráfico"
        >
          {(
            [
              ['both', 'Balance'],
              ['emissions', 'Emisiones'],
              ['compensated', 'Compensadas'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={`px-3 py-1.5 rounded-lg transition-all border-0 cursor-pointer ${
                activeTab === id
                  ? 'bg-white text-brand-900 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900 bg-transparent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <div className="w-full h-56 flex flex-col items-center justify-center text-center px-6 rounded-xl bg-gray-50/70 border border-dashed border-gray-200">
          <p className="text-xs font-medium text-gray-600 m-0">
            Aún no hay telemetría en los últimos 6 meses.
          </p>
          <p className="text-xs text-gray-500 m-0 mt-1">
            Cuando registres o compenses un vuelo, verás aquí su curva comparativa.
          </p>
        </div>
      ) : (
        <>
          <div className="w-full h-52 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#073D3D" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#073D3D" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCompensated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#08AE06" stopOpacity={0.26} />
                    <stop offset="95%" stopColor="#08AE06" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e9e9" opacity={0.8} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#647675', fontSize: 12 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#647675', fontSize: 11 }}
                  domain={[0, 'auto']}
                  allowDecimals
                />
                <Tooltip content={<CustomTooltip />} />
                {showEmissions && (
                  <Area
                    type="monotone"
                    dataKey="emissions"
                    stroke="#073D3D"
                    strokeWidth={2.25}
                    fillOpacity={1}
                    fill="url(#colorEmissions)"
                    activeDot={{ r: 5, fill: '#073D3D', stroke: '#fff', strokeWidth: 2 }}
                    dot={{ r: 3, fill: '#073D3D', strokeWidth: 1.5, stroke: '#fff' }}
                  />
                )}
                {showCompensated && (
                  <Area
                    type="monotone"
                    dataKey="compensated"
                    stroke="#079705"
                    strokeWidth={2.25}
                    fillOpacity={1}
                    fill="url(#colorCompensated)"
                    activeDot={{ r: 5, fill: '#079705', stroke: '#fff', strokeWidth: 2 }}
                    dot={{ r: 3, fill: '#079705', strokeWidth: 1.5, stroke: '#fff' }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-5 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#073D3D]" aria-hidden="true" />
              Huella emitida
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#08AE06]" aria-hidden="true" />
              CO₂e compensado
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default EmissionEvolutionChart;
