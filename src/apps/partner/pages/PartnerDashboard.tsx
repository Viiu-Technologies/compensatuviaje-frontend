// ============================================
// PARTNER DASHBOARD PAGE
// Portal Principal del Partner
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PartnerStats,
  PartnerProfile,
  OnboardingStatus,
  EsgProject,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS
} from '../../../types/partner.types';
import {
  getPartnerProfile,
  getPartnerStats,
  getOnboardingStatus,
  getPartnerProjects
} from '../services/partnerApi';

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'yellow' | 'purple' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs mt-1 opacity-70">{subtitle}</p>}
        </div>
        <div className="opacity-50">{icon}</div>
      </div>
    </div>
  );
};

// ============================================
// ONBOARDING PROGRESS COMPONENT
// ============================================

interface OnboardingProgressProps {
  status: OnboardingStatus;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ status }) => {
  if (status.completed) return null;

  const steps = [
    { key: 'profile', label: 'Completar perfil', completed: status.steps.profile },
    { key: 'logo', label: 'Subir logo', completed: status.steps.logo },
    { key: 'bank_details', label: 'Datos bancarios', completed: status.steps.bank_details }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Completa tu onboarding</h3>
          <p className="text-blue-100 text-sm">
            Configura tu cuenta para comenzar a crear proyectos
          </p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold">{status.percentage}%</span>
          <p className="text-blue-100 text-sm">completado</p>
        </div>
      </div>
      
      <div className="w-full bg-blue-400 rounded-full h-2 mb-4">
        <div
          className="bg-white rounded-full h-2 transition-all duration-500"
          style={{ width: `${status.percentage}%` }}
        />
      </div>

      <div className="flex gap-4">
        {steps.map((step) => (
          <div
            key={step.key}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              step.completed ? 'bg-blue-400/50' : 'bg-blue-700/50'
            }`}
          >
            {step.completed ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
              </svg>
            )}
            <span className="text-sm">{step.label}</span>
          </div>
        ))}
      </div>

      <Link
        to="/partner/profile"
        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
      >
        Continuar configuración
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
};

// ============================================
// RECENT PROJECTS COMPONENT
// ============================================

interface RecentProjectsProps {
  projects: EsgProject[];
  loading: boolean;
}

const RecentProjects: React.FC<RecentProjectsProps> = ({ projects, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Proyectos Recientes</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Proyectos Recientes</h3>
        <Link
          to="/partner/projects"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver todos →
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">No tienes proyectos aún</p>
          <Link
            to="/partner/projects/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Crear primer proyecto
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/partner/projects/${project.id}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate group-hover:text-green-600">
                  {project.name}
                </p>
                <p className="text-sm text-gray-500">
                  {project.code} • {project.location_country}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  PROJECT_STATUS_COLORS[project.status]
                }`}
              >
                {PROJECT_STATUS_LABELS[project.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// QUICK ACTIONS COMPONENT
// ============================================

const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Crear Proyecto',
      description: 'Registra un nuevo proyecto ESG',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      ),
      link: '/partner/projects/create',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Ver Proyectos',
      description: 'Administra tus proyectos activos',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      link: '/partner/projects',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Mi Perfil',
      description: 'Actualiza tu información',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      link: '/partner/profile',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white transition-colors`}>
              {action.icon}
            </div>
            <div>
              <p className="font-medium text-gray-800 group-hover:text-green-600">{action.title}</p>
              <p className="text-sm text-gray-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

const PartnerDashboard: React.FC = () => {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null);
  const [recentProjects, setRecentProjects] = useState<EsgProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos en paralelo
      const [profileData, statsData, onboardingData, projectsData] = await Promise.all([
        getPartnerProfile(),
        getPartnerStats(),
        getOnboardingStatus(),
        getPartnerProjects({ limit: 5 })
      ]);

      setProfile(profileData);
      setStats(statsData);
      setOnboarding(onboardingData);
      setRecentProjects(projectsData?.projects || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('es-CL').format(num);
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-80 bg-gray-200 rounded-xl" />
              <div className="h-80 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                ¡Bienvenido, {profile?.name || 'Partner'}!
              </h1>
              <p className="text-gray-500 mt-1">
                Panel de control de tu organización ESG
              </p>
            </div>
            <Link
              to="/partner/projects/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Proyecto
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Onboarding Progress */}
        {onboarding && !onboarding.completed && (
          <OnboardingProgress status={onboarding} />
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Proyectos"
            value={stats?.projects.total || 0}
            subtitle={`${stats?.projects.active || 0} activos`}
            color="green"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            }
          />
          <StatCard
            title="En Revisión"
            value={stats?.projects.pending_review || 0}
            subtitle="Pendientes de aprobación"
            color="yellow"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="CO₂ Compensado"
            value={`${formatNumber(stats?.compensations.total_kg_co2 || 0)} kg`}
            subtitle="Total acumulado"
            color="blue"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="Ingresos Totales"
            value={formatCurrency(stats?.compensations.total_revenue_clp || 0)}
            subtitle="Por certificados vendidos"
            color="purple"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <RecentProjects projects={recentProjects} loading={loading} />
          </div>

          {/* Quick Actions */}
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
