import api from '../../../shared/services/api';

// ============ TYPES ============
export interface DashboardStats {
  totalCO2: number;
  treesPlanted: number;
  waterSaved: number;
  projectsActive: number;
  monthlyGrowth: number;
  yearlyTarget: number;
  yearlyProgress: number;
}

export interface RecentActivity {
  id: string;
  type: 'compensation' | 'project' | 'achievement';
  title: string;
  description: string;
  date: string;
  amount?: number;
}

export interface CompanyOverview {
  id: string;
  razonSocial: string;
  rut: string;
  status: string;
  createdAt: string;
}

export interface OnboardingProgress {
  overall: number;
  steps: {
    registration: { completed: boolean; percentage: number };
    documents: { completed: boolean; percentage: number };
    verification: { completed: boolean; percentage: number };
    contract: { completed: boolean; percentage: number };
  };
}

export interface DashboardResponse {
  company: CompanyOverview;
  progress: OnboardingProgress;
  documents: {
    total: number;
    required: number;
    uploaded: number;
    completionPercentage: number;
    isValid: boolean;
  };
  domains: {
    total: number;
    verified: number;
    pending: number;
  };
  users: {
    total: number;
    admins: number;
  };
  nextSteps: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
  }>;
}

// ============ DASHBOARD SERVICE ============

/**
 * Obtener dashboard de la empresa del usuario actual
 */
export const getCompanyDashboard = async (): Promise<DashboardResponse | null> => {
  try {
    const response = await api.get('/b2b/dashboard');
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching company dashboard:', error);
    return null;
  }
};

/**
 * Obtener progreso de onboarding
 */
export const getOnboardingProgress = async (): Promise<OnboardingProgress | null> => {
  try {
    const response = await api.get('/b2b/dashboard/progress');
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
    return null;
  }
};

/**
 * Obtener timeline de eventos de la empresa
 */
export const getCompanyTimeline = async (): Promise<RecentActivity[]> => {
  try {
    const response = await api.get('/b2b/dashboard/timeline');
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching company timeline:', error);
    return [];
  }
};

/**
 * Generar estad├¡sticas simuladas para el demo
 * (Mientras no tengamos datos reales en BD)
 */
export const getMockDashboardStats = (): DashboardStats => {
  return {
    totalCO2: 1250.5,
    treesPlanted: 3420,
    waterSaved: 125000,
    projectsActive: 4,
    monthlyGrowth: 12.5,
    yearlyTarget: 5000,
    yearlyProgress: 67
  };
};

/**
 * Generar actividad reciente simulada para demo
 */
export const getMockRecentActivity = (): RecentActivity[] => {
  return [
    {
      id: '1',
      type: 'compensation',
      title: 'Compensación de vuelo',
      description: 'Santiago → Miami (Ida y vuelta)',
      date: 'Hace 2 horas',
      amount: 2.4
    },
    {
      id: '2',
      type: 'project',
      title: 'Nuevo proyecto agregado',
      description: 'Reforestación Parque Nacional Torres del Paine',
      date: 'Hace 1 día'
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Insignia desbloqueada',
      description: '¡Alcanzaste 1000 tCO₂ compensadas!',
      date: 'Hace 3 días'
    },
    {
      id: '4',
      type: 'compensation',
      title: 'Compensación de flota',
      description: '15 vehículos corporativos - Q4 2024',
      date: 'Hace 1 semana',
      amount: 45.2
    }
  ];
};
