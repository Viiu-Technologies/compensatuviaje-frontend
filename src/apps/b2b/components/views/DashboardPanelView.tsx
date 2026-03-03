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
  Loader2,
  Building2,
  FileCheck,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Shield,
  FileText,
  Link2
} from 'lucide-react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { 
  getCompanyDashboard, 
  getDefaultDashboardStats,
  formatTimelineAsActivity,
  type DashboardStats,
  type DashboardResponse,
  type RecentActivity 
} from '../../services/dashboardService';

const DashboardPanelView: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // Cargar datos al montar
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const data = await getCompanyDashboard();
      
      if (data) {
        setDashboardData(data);
        // Formatear timeline real como actividad reciente
        if (data.timeline && data.timeline.length > 0) {
          setRecentActivity(formatTimelineAsActivity(data.timeline));
        } else {
          setRecentActivity([]);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { text: string; color: string; bg: string }> = {
      registered: { text: 'Registrada', color: 'text-blue-700', bg: 'bg-blue-100' },
      pending_contract: { text: 'Pendiente Contrato', color: 'text-yellow-700', bg: 'bg-yellow-100' },
      signed: { text: 'Contrato Firmado', color: 'text-purple-700', bg: 'bg-purple-100' },
      active: { text: 'Activa', color: 'text-green-700', bg: 'bg-green-100' },
      suspended: { text: 'Suspendida', color: 'text-red-700', bg: 'bg-red-100' }
    };
    return labels[status] || { text: status, color: 'text-gray-700', bg: 'bg-gray-100' };
  };

  const getIndustryLabel = (industry?: string) => {
    if (!industry) return 'Sin categoría';
    const labels: Record<string, string> = {
      aerolineas: 'Aerolíneas y Aviación',
      maritimo: 'Transporte Marítimo',
      terrestre: 'Transporte Terrestre y Logística',
      mineria_energia: 'Minería y Energía',
      tecnologia: 'Tecnología y SaaS',
      retail: 'Retail y E-commerce',
      manufactura: 'Manufactura e Industria',
      construccion: 'Construcción e Inmobiliaria',
      hoteleria_turismo: 'Hotelería y Turismo',
      servicios_financieros: 'Servicios Financieros',
      salud: 'Salud y Farmacéutica',
      educacion: 'Educación',
      alimentacion: 'Alimentación y Agricultura',
      telecomunicaciones: 'Telecomunicaciones',
      gobierno: 'Gobierno y Sector Público',
      consultoria: 'Consultoría y Servicios Profesionales',
      otra: 'Otra'
    };
    return labels[industry] || industry;
  };

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

  if (!dashboardData) {
    return (
      <div className="!flex !items-center !justify-center !py-20">
        <div className="!text-center">
          <AlertCircle className="!w-12 !h-12 !text-yellow-500 !mx-auto !mb-4" />
          <p className={`!text-lg !font-medium ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>No se pudieron cargar los datos</p>
          <p className={`!text-sm !mt-1 ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>Verifica tu conexión e intenta nuevamente</p>
          <button
            onClick={handleRefresh}
            className="!mt-4 !px-4 !py-2 !bg-green-600 !text-white !rounded-xl !font-medium !text-sm !border-0 hover:!bg-green-700 !transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { company, progress, documents, domains, users, nextSteps } = dashboardData;
  const statusInfo = getStatusLabel(company.status);

  const statsCards = [
    {
      title: 'Progreso Onboarding',
      value: `${progress.overall}%`,
      subtitle: company.status === 'active' ? 'Completado' : 'En progreso',
      icon: Target,
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-50',
      borderColor: 'border-emerald-200'
    },
    {
      title: 'Documentos',
      value: `${documents.uploaded}/${documents.required || documents.total}`,
      subtitle: documents.isValid ? 'Validados' : 'Pendientes',
      icon: FileCheck,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Dominios',
      value: `${domains.verified}/${domains.total}`,
      subtitle: domains.pending > 0 ? `${domains.pending} pendiente${domains.pending > 1 ? 's' : ''}` : 'Verificados',
      icon: Link2,
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Usuarios',
      value: users.total.toString(),
      subtitle: `${users.admins} admin${users.admins !== 1 ? 's' : ''}`,
      icon: Users,
      gradient: 'from-orange-500 to-amber-600',
      bgGradient: 'from-orange-50 to-amber-50',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div className="!flex !flex-col sm:!flex-row !items-start sm:!items-center !justify-between !gap-4">
        <div>
          <h1 className={`!text-2xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Panel Principal</h1>
          <p className={`!text-sm !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
            {company.razonSocial} — {getIndustryLabel(company.industry)}
          </p>
        </div>
        <div className="!flex !items-center !gap-3">
          <span className={`!px-3 !py-1.5 !rounded-full !text-xs !font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`!p-2.5 !rounded-xl !transition-colors !border-0 disabled:!opacity-60 ${
              isDark ? '!bg-gray-700/50 hover:!bg-gray-600/50 !text-gray-400' : '!bg-gray-100 hover:!bg-gray-200 !text-gray-600'
            }`}
          >
            <RefreshCw className={`!w-5 !h-5 ${isRefreshing ? '!animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Company Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`!rounded-2xl !p-5 !border ${
          isDark ? '!bg-gradient-to-r !from-green-900/30 !to-emerald-900/20 !border-green-800/30' : '!bg-gradient-to-r !from-green-50 !to-emerald-50 !border-green-200'
        }`}
      >
        <div className="!flex !flex-wrap !items-center !gap-6">
          <div className="!flex !items-center !gap-3">
            <div className="!w-12 !h-12 !rounded-xl !bg-gradient-to-br !from-green-500 !to-emerald-600 !flex !items-center !justify-center">
              <Building2 className="!w-6 !h-6 !text-white" />
            </div>
            <div>
              <h2 className={`!text-lg !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>{company.razonSocial}</h2>
              <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>RUT: {company.rut}</p>
            </div>
          </div>
          <div className={`!h-10 !w-px ${isDark ? '!bg-gray-700' : '!bg-green-200'} !hidden sm:!block`} />
          <div>
            <p className={`!text-xs !uppercase !tracking-wider ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>Industria</p>
            <p className={`!text-sm !font-medium ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>{getIndustryLabel(company.industry)}</p>
          </div>
          {company.tamanoEmpresa && (
            <>
              <div className={`!h-10 !w-px ${isDark ? '!bg-gray-700' : '!bg-green-200'} !hidden sm:!block`} />
              <div>
                <p className={`!text-xs !uppercase !tracking-wider ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>Tamaño</p>
                <p className={`!text-sm !font-medium ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>{company.tamanoEmpresa}</p>
              </div>
            </>
          )}
          <div className={`!h-10 !w-px ${isDark ? '!bg-gray-700' : '!bg-green-200'} !hidden sm:!block`} />
          <div>
            <p className={`!text-xs !uppercase !tracking-wider ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>Miembro desde</p>
            <p className={`!text-sm !font-medium ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>
              {new Date(company.createdAt).toLocaleDateString('es-CL', { year: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      </motion.div>

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
            </div>
            <div className={`!text-3xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>{stat.value}</div>
            <div className={`!text-sm !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-600'}`}>{stat.subtitle}</div>
            <p className={`!text-xs !mt-2 ${isDark ? '!text-gray-500' : '!text-gray-500'}`}>{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="!grid lg:!grid-cols-3 !gap-6">
        {/* Onboarding Progress Card */}
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
              <h3 className={`!text-lg !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Progreso de Onboarding</h3>
              <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
                {progress.overall === 100 ? '¡Proceso completado!' : 'Completa todos los pasos para activar tu cuenta'}
              </p>
            </div>
            <div className="!flex !items-center !gap-2">
              <Target className="!w-5 !h-5 !text-green-600" />
              <span className="!text-2xl !font-bold !text-green-600">{progress.overall}%</span>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="!relative !h-4 !bg-gray-100 !rounded-full !overflow-hidden !mb-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.overall}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="!absolute !inset-y-0 !left-0 !bg-gradient-to-r !from-green-500 !to-emerald-500 !rounded-full"
            />
          </div>

          {/* Steps Detail */}
          <div className="!space-y-4">
            {Object.entries(progress.steps).map(([key, step], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`!flex !items-center !gap-4 !p-3 !rounded-xl ${
                  isDark ? '!bg-gray-700/30' : '!bg-gray-50'
                }`}
              >
                <div className={`!w-10 !h-10 !rounded-full !flex !items-center !justify-center !flex-shrink-0 ${
                  step.completed 
                    ? '!bg-green-100 !text-green-600' 
                    : step.percentage > 0 
                    ? '!bg-yellow-100 !text-yellow-600' 
                    : isDark ? '!bg-gray-600 !text-gray-400' : '!bg-gray-200 !text-gray-400'
                }`}>
                  {step.completed ? (
                    <CheckCircle2 className="!w-5 !h-5" />
                  ) : step.percentage > 0 ? (
                    <Clock className="!w-5 !h-5" />
                  ) : (
                    <span className="!text-sm !font-bold">{index + 1}</span>
                  )}
                </div>
                <div className="!flex-1">
                  <div className="!flex !items-center !justify-between !mb-1">
                    <span className={`!text-sm !font-medium ${isDark ? '!text-gray-200' : '!text-gray-700'}`}>
                      {step.name}
                    </span>
                    <span className={`!text-xs !font-semibold ${
                      step.completed ? '!text-green-600' : '!text-gray-400'
                    }`}>
                      {step.percentage}%
                    </span>
                  </div>
                  <div className="!h-2 !bg-gray-200 !rounded-full !overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${step.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                      className={`!h-full !rounded-full ${
                        step.completed ? '!bg-green-500' : '!bg-yellow-500'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Next Steps */}
          {nextSteps && nextSteps.length > 0 && (
            <div className={`!mt-6 !pt-6 !border-t ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
              <h4 className={`!text-sm !font-semibold !mb-3 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>
                Próximos pasos
              </h4>
              <div className="!space-y-2">
                {nextSteps.slice(0, 3).map((step, idx) => (
                  <div
                    key={step.id || idx}
                    className={`!flex !items-start !gap-3 !p-3 !rounded-lg ${
                      isDark ? '!bg-gray-700/20' : '!bg-blue-50/50'
                    }`}
                  >
                    <ChevronRight className={`!w-4 !h-4 !mt-0.5 !flex-shrink-0 ${
                      step.priority === 'high' ? '!text-red-500' : step.priority === 'medium' ? '!text-yellow-500' : '!text-blue-500'
                    }`} />
                    <div>
                      <p className={`!text-sm !font-medium ${isDark ? '!text-gray-200' : '!text-gray-700'}`}>{step.title}</p>
                      <p className={`!text-xs !mt-0.5 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Right Column: Activity + Info */}
        <div className="!space-y-6">
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
              <Activity className={`!w-5 !h-5 ${isDark ? '!text-gray-500' : '!text-gray-400'}`} />
            </div>

            {recentActivity.length > 0 ? (
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
                      activity.type === 'status_change' ? isDark ? '!bg-purple-900/30 !text-purple-400' : '!bg-purple-100 !text-purple-600' :
                      activity.type === 'document_upload' ? isDark ? '!bg-blue-900/30 !text-blue-400' : '!bg-blue-100 !text-blue-600' :
                      isDark ? '!bg-gray-700 !text-gray-400' : '!bg-gray-100 !text-gray-600'
                    }`}>
                      {activity.type === 'status_change' ? <Shield className="!w-5 !h-5" /> :
                       activity.type === 'document_upload' ? <FileText className="!w-5 !h-5" /> :
                       <Activity className="!w-5 !h-5" />}
                    </div>
                    <div className="!flex-1 !min-w-0">
                      <p className={`!text-sm !font-medium !truncate ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>{activity.title}</p>
                      <p className={`!text-xs !truncate ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>{activity.description}</p>
                      <span className={`!text-xs ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>{activity.date}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="!text-center !py-8">
                <Clock className={`!w-10 !h-10 !mx-auto !mb-3 ${isDark ? '!text-gray-600' : '!text-gray-300'}`} />
                <p className={`!text-sm ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>Aún no hay actividad registrada</p>
              </div>
            )}
          </motion.div>

          {/* Documents Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`!rounded-2xl !p-5 !border !transition-colors ${
              isDark 
                ? '!bg-gray-800/50 !border-gray-700/50' 
                : '!bg-white !border-gray-200'
            }`}
          >
            <h4 className={`!text-sm !font-semibold !mb-3 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>Documentación</h4>
            <div className="!flex !items-center !gap-3 !mb-3">
              <div className="!flex-1 !h-3 !bg-gray-200 !rounded-full !overflow-hidden">
                <div 
                  className={`!h-full !rounded-full ${documents.isValid ? '!bg-green-500' : '!bg-yellow-500'}`}
                  style={{ width: `${documents.completionPercentage}%` }}
                />
              </div>
              <span className={`!text-sm !font-bold ${documents.isValid ? '!text-green-600' : '!text-yellow-600'}`}>
                {documents.completionPercentage}%
              </span>
            </div>
            <div className="!flex !items-center !gap-2">
              {documents.isValid ? (
                <CheckCircle2 className="!w-4 !h-4 !text-green-500" />
              ) : (
                <AlertCircle className="!w-4 !h-4 !text-yellow-500" />
              )}
              <span className={`!text-xs ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
                {documents.isValid ? 'Todos los documentos han sido validados' : `${documents.uploaded} de ${documents.required || documents.total} documentos subidos`}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPanelView;
