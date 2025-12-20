// ============================================
// DASHBOARD & ONBOARDING TYPES
// ============================================

import type { CompanyStatus } from './auth.types';
import type { CompanyDomain } from './company.types';
import type { DocumentType, DocumentSummaryItem } from './document.types';

// Paso de progreso
export interface ProgressStep {
  name: string;
  completed: boolean;
  percentage: number;
  completedAt: string | null;
}

// Progreso de onboarding
export interface OnboardingProgress {
  overall: number;
  steps: {
    registration: ProgressStep;
    documents: ProgressStep;
    domains: ProgressStep;
    approval: ProgressStep;
  };
}

// Próximo paso
export interface NextStep {
  action: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low' | 'info' | 'success';
}

// Evento de timeline
export interface TimelineEvent {
  type: 'status_change' | 'document_upload' | 'system_event';
  timestamp: string;
  title: string;
  description: string;
  actor?: {
    name: string;
    email?: string;
  };
  metadata: Record<string, unknown>;
}

// Dashboard completo
export interface DashboardResponse {
  success: boolean;
  data: {
    company: {
      id: string;
      razonSocial: string;
      rut: string;
      status: CompanyStatus;
      createdAt: string;
      updatedAt: string;
    };
    progress: OnboardingProgress;
    documents: {
      total: number;
      required: number;
      uploaded: number;
      completionPercentage: number;
      isValid: boolean;
      summary?: Record<DocumentType, DocumentSummaryItem>;
    };
    domains: {
      total: number;
      verified: number;
      pending: number;
      list: CompanyDomain[];
    };
    users: {
      total: number;
      admins: number;
    };
    timeline: TimelineEvent[];
    nextSteps: NextStep[];
    estimatedTimeToComplete: string;
  };
}

// Progreso detallado
export interface ProgressResponse {
  success: boolean;
  data: {
    companyId: string;
    currentStatus: CompanyStatus;
    overallProgress: number;
    steps: {
      registration: ProgressStep;
      documents: ProgressStep;
      domains: ProgressStep;
      approval: ProgressStep;
    };
    blockers: {
      type: string;
      message: string;
      details: string[];
    }[];
    recommendations: string[];
  };
}

// Timeline response
export interface TimelineResponse {
  success: boolean;
  data: TimelineEvent[];
}
