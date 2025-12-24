import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Leaf,
  Cloud,
  TreePine,
  Droplets,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap,
  Globe,
  Loader2
} from 'lucide-react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { 
  getCompanyDashboard, 
  getMockDashboardStats, 
  getMockRecentActivity,
  type DashboardStats,
  type RecentActivity 
} from '../../services/dashboardService';

const DashboardPanelView: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalCO2: 0,
    treesPlanted: 0,
    waterSaved: 0,
    projectsActive: 0,
    monthlyGrowth: 0,
    yearlyTarget: 5000,
    yearlyProgress: 0
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // Cargar datos al montar
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const dashboardData = await getCompanyDashboard();
      
      if (dashboardData) {
        // Mapear datos reales de la API
        setStats({
          totalCO2: 1250.5, // TODO: calcular de compensaciones reales
          treesPlanted: 3420,
          waterSaved: 125000,
          projectsActive: dashboardData.users?.total || 4,
          monthlyGrowth: 12.5,
          yearlyTarget: 5000,
          yearlyProgress: dashboardData.progress?.overall || 67
        });
      } else {
        // Usar datos mock
        setStats(getMockDashboardStats());
      }
      
      setRecentActivity(getMockRecentActivity());
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setStats(getMockDashboardStats());
      setRecentActivity(getMockRecentActivity());
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const handleExport = () => {
    // Generar CSV de datos
    const csvContent = `data:text/csv;charset=utf-8,
Métrica,Valor
CO2 Compensado,${stats.totalCO2} tCO2e
Árboles Plantados,${stats.treesPlanted}
Agua Conservada,${stats.waterSaved} L
Proyectos Activos,${stats.projectsActive}
Progreso Anual,${stats.yearlyProgress}%
`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `impacto_ambiental_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statsCards = [
    {
      title: 'CO₂ Compensado',
      value: `${stats.totalCO2.toLocaleString()}`,
      unit: 'tCO₂e',
      change: stats.monthlyGrowth,
      icon: Cloud,
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-50',
      borderColor: 'border-emerald-200'
    },
    {
      title: 'Árboles Plantados',
      value: stats.treesPlanted.toLocaleString(),
      unit: 'unidades',
      change: 8.3,
      icon: TreePine,
      gradient: 'from-green-500 to-teal-600',
      bgGradient: 'from-green-50 to-teal-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Agua Conservada',
      value: `${(stats.waterSaved / 1000).toFixed(0)}K`,
      unit: 'litros',
      change: 15.2,
      icon: Droplets,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Proyectos Activos',
      value: stats.projectsActive.toString(),
      unit: 'proyectos',
      change: 0,
      icon: Globe,
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50',
      borderColor: 'border-purple-200'
    }
  ];

  if (isLoading) {
    return (
      <div className="!flex !items-center !justify-center !py-20">
        <div className="!text-center">
          <Loader2 className="!w-12 !h-12 !text-green-500 !animate-spin !mx-auto !mb-4" />
          <p className={isDark ? '!text-gray-400' : '!text-gray-500'}>Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div className="!flex !flex-col sm:!flex-row !items-start sm:!items-center !justify-between !gap-4">
        <div>
          <h1 className={`!text-2xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Panel Principal</h1>
          <p className={`!text-sm !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Resumen de tu impacto ambiental corporativo</p>
        </div>
        <div className="!flex !items-center !gap-3">
          {/* Time Range Selector */}
          <div className={`!flex !rounded-xl !p-1 ${isDark ? '!bg-gray-700/50' : '!bg-gray-100'}`}>
            {(['week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`!px-4 !py-2 !rounded-lg !text-sm !font-medium !transition-all !border-0 ${
                  timeRange === range
                    ? isDark 
                      ? '!bg-gray-600 !text-white !shadow-sm' 
                      : '!bg-white !text-gray-900 !shadow-sm'
                    : isDark
                    ? '!bg-transparent !text-gray-400 hover:!text-gray-200'
                    : '!bg-transparent !text-gray-600 hover:!text-gray-900'
                }`}
              >
                {range === 'week' ? 'Semana' : range === 'month' ? 'Mes' : 'Año'}
              </button>
            ))}
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`!p-2.5 !rounded-xl !transition-colors !border-0 disabled:!opacity-60 ${
              isDark ? '!bg-gray-700/50 hover:!bg-gray-600/50 !text-gray-400' : '!bg-gray-100 hover:!bg-gray-200 !text-gray-600'
            }`}
          >
            <RefreshCw className={`!w-5 !h-5 ${isRefreshing ? '!animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleExport}
            className="!flex !items-center !gap-2 !px-4 !py-2.5 !bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !rounded-xl !font-medium !text-sm !border-0 !shadow-lg !shadow-green-500/30 hover:!shadow-green-500/50 !transition-all"
          >
            <Download className="!w-4 !h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="!grid sm:!grid-cols-2 lg:!grid-cols-4 !gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`!rounded-2xl !p-5 !border !transition-all !group hover:!shadow-lg ${
              isDark 
                ? '!bg-gray-800/50 !border-gray-700/50' 
                : `!bg-gradient-to-br ${stat.bgGradient} ${stat.borderColor}`
            }`}
          >
            <div className="!flex !items-start !justify-between !mb-3">
              <div className={`!w-12 !h-12 !rounded-xl !bg-gradient-to-br ${stat.gradient} !flex !items-center !justify-center !shadow-lg`}>
                <stat.icon className="!w-6 !h-6 !text-white" />
              </div>
              {stat.change !== 0 && (
                <div className={`!flex !items-center !gap-1 !text-sm !font-medium ${stat.change > 0 ? '!text-green-600' : '!text-red-600'}`}>
                  {stat.change > 0 ? <ArrowUpRight className="!w-4 !h-4" /> : <ArrowDownRight className="!w-4 !h-4" />}
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <div className={`!text-3xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>{stat.value}</div>
            <div className={`!text-sm !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-600'}`}>{stat.unit}</div>
            <p className={`!text-xs !mt-2 ${isDark ? '!text-gray-500' : '!text-gray-500'}`}>{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="!grid lg:!grid-cols-3 !gap-6">
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`lg:!col-span-2 !rounded-2xl !p-6 !border !shadow-lg !transition-colors ${
            isDark 
              ? '!bg-gray-800/50 !border-gray-700/50' 
              : '!bg-white !border-gray-200'
          }`}
        >
          <div className="!flex !items-center !justify-between !mb-6">
            <div>
              <h3 className={`!text-lg !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Progreso Anual</h3>
              <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Meta: {stats.yearlyTarget.toLocaleString()} tCO₂e</p>
            </div>
            <div className="!flex !items-center !gap-2">
              <Target className="!w-5 !h-5 !text-green-600" />
              <span className="!text-2xl !font-bold !text-green-600">{stats.yearlyProgress}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="!relative !h-4 !bg-gray-100 !rounded-full !overflow-hidden !mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.yearlyProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="!absolute !inset-y-0 !left-0 !bg-gradient-to-r !from-green-500 !to-emerald-500 !rounded-full"
            />
          </div>

          <div className="!flex !justify-between !text-sm">
            <span className={isDark ? '!text-gray-400' : '!text-gray-600'}>Compensado: {((stats.yearlyTarget * stats.yearlyProgress) / 100).toLocaleString()} tCO₂e</span>
            <span className={isDark ? '!text-gray-400' : '!text-gray-600'}>Restante: {((stats.yearlyTarget * (100 - stats.yearlyProgress)) / 100).toLocaleString()} tCO₂e</span>
          </div>

          {/* Monthly Chart Placeholder */}
          <div className={`!mt-6 !pt-6 !border-t ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
            <h4 className={`!text-sm !font-semibold !mb-4 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>Compensaciones Mensuales</h4>
            <div className="!flex !items-end !justify-between !h-32 !gap-2">
              {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((month, i) => {
                const height = Math.random() * 70 + 30;
                const isCurrentMonth = i === new Date().getMonth();
                return (
                  <div key={month} className="!flex-1 !flex !flex-col !items-center !gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className={`!w-full !rounded-t-lg ${isCurrentMonth ? '!bg-gradient-to-t !from-green-500 !to-emerald-400' : isDark ? '!bg-gray-700' : '!bg-gray-200'}`}
                    />
                    <span className={`!text-xs ${isCurrentMonth ? '!text-green-600 !font-semibold' : isDark ? '!text-gray-500' : '!text-gray-400'}`}>{month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`!rounded-2xl !p-6 !border !shadow-lg !transition-colors ${
            isDark 
              ? '!bg-gray-800/50 !border-gray-700/50' 
              : '!bg-white !border-gray-200'
          }`}
        >
          <div className="!flex !items-center !justify-between !mb-6">
            <h3 className={`!text-lg !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Actividad Reciente</h3>
            <button className={`!text-sm !font-medium !bg-transparent !border-0 ${
              isDark ? '!text-green-400 hover:!text-green-300' : '!text-green-600 hover:!text-green-700'
            }`}>
              Ver todo
            </button>
          </div>

          <div className="!space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`!flex !gap-3 !p-3 !rounded-xl !transition-colors ${
                  isDark ? 'hover:!bg-gray-700/50' : 'hover:!bg-gray-50'
                }`}
              >
                <div className={`!w-10 !h-10 !rounded-xl !flex !items-center !justify-center !flex-shrink-0 ${
                  activity.type === 'compensation' ? isDark ? '!bg-green-900/30 !text-green-400' : '!bg-green-100 !text-green-600' :
                  activity.type === 'project' ? isDark ? '!bg-blue-900/30 !text-blue-400' : '!bg-blue-100 !text-blue-600' :
                  isDark ? '!bg-yellow-900/30 !text-yellow-400' : '!bg-yellow-100 !text-yellow-600'
                }`}>
                  {activity.type === 'compensation' ? <Cloud className="!w-5 !h-5" /> :
                   activity.type === 'project' ? <TreePine className="!w-5 !h-5" /> :
                   <Zap className="!w-5 !h-5" />}
                </div>
                <div className="!flex-1 !min-w-0">
                  <p className={`!text-sm !font-medium !truncate ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>{activity.title}</p>
                  <p className={`!text-xs !truncate ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>{activity.description}</p>
                  <div className="!flex !items-center !justify-between !mt-1">
                    <span className={`!text-xs ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>{activity.date}</span>
                    {activity.amount && (
                      <span className="!text-xs !font-semibold !text-green-600">+{activity.amount} tCO₂</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPanelView;
