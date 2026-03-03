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
  type: 'compensation' | 'project' | 'achievement' | 'status_change' | 'document_upload' | 'system_event';
  title: string;
  description: string;
  date: string;
  amount?: number;
}

export interface CompanyOverview {
  id: string;
  razonSocial: string;
  rut: string;
  industry?: string;
  tamanoEmpresa?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OnboardingStep {
  name: string;
  completed: boolean;
  percentage: number;
  completedAt?: string | null;
}

export interface OnboardingProgress {
  overall: number;
  steps: {
    registration: OnboardingStep;
    documents: OnboardingStep;
    domains: OnboardingStep;
    approval: OnboardingStep;
  };
}

export interface TimelineEvent {
  type: string;
  timestamp: string;
  title: string;
  description: string;
  actor?: { name: string; email: string };
  metadata?: Record<string, any>;
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
    summary?: Record<string, any>;
  };
  domains: {
    total: number;
    verified: number;
    pending: number;
    list?: Array<{ id: string; domain: string; verified: boolean }>;
  };
  users: {
    total: number;
    admins: number;
  };
  timeline: TimelineEvent[];
  nextSteps: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
  }>;
  estimatedTimeToComplete?: string;
}

// ============ DASHBOARD SERVICE ============

/**
 * Obtener dashboard de la empresa del usuario actual
 */
export const getCompanyDashboard = async (): Promise<DashboardResponse | null> => {
  try {
    const response = await api.get('/b2b/dashboard') as any;
    if (response.success) {
      return response.data;
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
    const response = await api.get('/b2b/dashboard/progress') as any;
    if (response.success) {
      return response.data;
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
    const response = await api.get('/b2b/dashboard/timeline') as any;
    if (response.success) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching company timeline:', error);
    return [];
  }
};

/**
 * Generar estadísticas por defecto (cuando no hay datos reales)
 */
export const getDefaultDashboardStats = (): DashboardStats => {
  return {
    totalCO2: 0,
    treesPlanted: 0,
    waterSaved: 0,
    projectsActive: 0,
    monthlyGrowth: 0,
    yearlyTarget: 0,
    yearlyProgress: 0
  };
};

/**
 * Formatear timeline del backend como actividad reciente
 */
export const formatTimelineAsActivity = (timeline: TimelineEvent[]): RecentActivity[] => {
  return timeline.slice(0, 10).map((event, index) => {
    const eventDate = new Date(event.timestamp);
    const now = new Date();
    const diffMs = now.getTime() - eventDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    let dateStr = '';
    if (diffHours < 1) dateStr = 'Hace menos de 1 hora';
    else if (diffHours < 24) dateStr = `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    else if (diffDays < 7) dateStr = `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    else dateStr = eventDate.toLocaleDateString('es-CL');

    let type: RecentActivity['type'] = 'system_event';
    if (event.type === 'status_change') type = 'status_change';
    else if (event.type === 'document_upload') type = 'document_upload';

    return {
      id: `timeline-${index}`,
      type,
      title: event.title,
      description: event.description,
      date: dateStr,
      amount: undefined
    };
  });
};
