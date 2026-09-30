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

interface EmissionEvolutionChartProps {
  data: MonthlyEvolutionItem[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  activeMetric: 'emissions' | 'compensated';
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, activeMetric }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const year = payload[0].payload?.year;
    const isEmissions = activeMetric === 'emissions';
    return (
      <div className="bg-white dark:bg-slate-800 px-3.5 py-2.5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 text-xs">
        <p className="font-semibold text-gray-500 dark:text-slate-400 mb-0.5">
          {label} {year ?? ''}
        </p>
        <p className={`text-sm font-bold ${isEmissions ? 'text-brand-900' : 'text-brand-700'} m-0`}>
          {value} tCO₂e
        </p>
      </div>
    );
  }
  return null;
};

export const EmissionEvolutionChart: React.FC<EmissionEvolutionChartProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'emissions' | 'compensated'>('emissions');

  const strokeColor = activeTab === 'emissions' ? '#073D3D' : '#079705';
  const gradientId = activeTab === 'emissions' ? 'colorEmissions' : 'colorCompensated';
  const isEmpty = data.every((m) => !m.emissions && !m.compensated);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header with Title and Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 flex items-center justify-center text-sm">
            <FaChartBar />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white m-0">
            Evolución de emisiones
          </h3>
        </div>

        {/* Toggle Segmented Buttons */}
        <div className="inline-flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('emissions')}
            className={`px-3 py-1.5 rounded-lg transition-all border-0 cursor-pointer ${
              activeTab === 'emissions'
                ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-xs font-bold'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 bg-transparent'
            }`}
          >
            Emisiones
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compensated')}
            className={`px-3 py-1.5 rounded-lg transition-all border-0 cursor-pointer ${
              activeTab === 'compensated'
                ? 'bg-white dark:bg-slate-900 text-brand-700 shadow-xs font-bold'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 bg-transparent'
            }`}
          >
            Compensaciones
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="w-full h-56 flex items-center justify-center text-center px-6">
          <p className="text-xs text-gray-500 dark:text-slate-400 m-0">
            Aún no hay viajes en los últimos 6 meses. Cuando registres uno, verás aquí su evolución.
          </p>
        </div>
      ) : (
      <div className="w-full h-56 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#073D3D" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#073D3D" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorCompensated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#079705" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#079705" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.6} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              domain={[0, 'auto']}
              allowDecimals
            />
            <Tooltip content={<CustomTooltip activeMetric={activeTab} />} />
            <Area
              type="monotone"
              dataKey={activeTab}
              stroke={strokeColor}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 6, fill: strokeColor, stroke: '#fff', strokeWidth: 2 }}
              dot={{ r: 3.5, fill: strokeColor, strokeWidth: 1.5, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
};

export default EmissionEvolutionChart;
