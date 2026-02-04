// ============================================
// PARTNER TYPES - CompensaTuViaje
// ============================================

// ============================================
// PARTNER PROFILE & ONBOARDING
// ============================================

export interface Partner {
  id: string;
  name: string;
  contact_email: string;
  website_url?: string;
  logo_url?: string;
  status: PartnerStatus;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export type PartnerStatus = 
  | 'onboarding'
  | 'active'
  | 'suspended'
  | 'inactive';

export interface PartnerProfile {
  id: string;
  name: string;
  contact_email: string;
  website_url?: string;
  logo_url?: string;
  status: PartnerStatus;
  stats: {
    total_projects: number;
  };
  bank_details_configured: boolean;
  onboarding_status?: OnboardingStatus;
}

export interface OnboardingStatus {
  completed: boolean;
  percentage: number;
  steps: {
    profile: boolean;
    logo: boolean;
    bank_details: boolean;
  };
}

export interface UpdatePartnerProfileRequest {
  name?: string;
  contact_email?: string;
  website_url?: string;
}

export interface UpdateLogoRequest {
  logo_url: string;
}

// ============================================
// BANK DETAILS
// ============================================

export interface BankDetails {
  bank_name: string;
  account_type: 'checking' | 'savings';
  account_number: string;
  account_holder_name: string;
  account_holder_rut: string;
  currency: 'CLP' | 'USD';
}

export interface BankDetailsResponse {
  bank_name: string;
  account_type: string;
  account_number_masked: string;
  account_holder_name: string;
  account_holder_rut_masked: string;
  currency: string;
  last_updated?: string;
}

export interface UpdateBankDetailsRequest {
  bank_name: string;
  account_type: 'checking' | 'savings';
  account_number: string;
  account_holder_name: string;
  account_holder_rut: string;
  currency: 'CLP' | 'USD';
}

// ============================================
// PASSWORD CHANGE
// ============================================

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// ============================================
// ESG PROJECTS
// ============================================

export interface EsgProject {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: ProjectType;
  status: ProjectStatus;
  location_country: string;
  location_region?: string;
  provider_cost_unit_clp?: number;
  carbon_capture_per_unit?: number;
  capacity_total?: number;
  capacity_sold?: number;
  transparency_url?: string;
  created_at: string;
  updated_at: string;
  partner?: {
    id: string;
    name: string;
  };
  documents?: ProjectDocument[];
  evidences?: ProjectEvidence[];
  metrics?: ProjectMetrics;
}

export type ProjectType =
  | 'reforestation'
  | 'conservation'
  | 'renewable_energy'
  | 'methane_capture'
  | 'ocean_cleanup'
  | 'sustainable_agriculture'
  | 'other';

export type ProjectStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'paused'
  | 'completed';

export interface ProjectDocument {
  id: string;
  type: string;
  name: string;
  url: string;
  uploaded_at: string;
}

export interface ProjectEvidence {
  id: string;
  type: 'image' | 'video' | 'document' | 'report';
  title: string;
  description?: string;
  url: string;
  date: string;
}

export interface ProjectMetrics {
  total_certificates: number;
  total_kg_co2: number;
  total_revenue_clp: number;
}

// ============================================
// PROJECT CRUD
// ============================================

export interface CreateProjectRequest {
  name: string;
  code: string;
  projectType: ProjectType;
  description?: string;
  country: string;
  region?: string;
  providerOrganization?: string;
  currentBasePriceUsdPerTon?: number;
  transparencyUrl?: string;
  provider_cost_unit_clp?: number;
  carbon_capture_per_unit?: number;
  capacity_total?: number;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  country?: string;
  region?: string;
  transparency_url?: string;
  provider_cost_unit_clp?: number;
  carbon_capture_per_unit?: number;
  capacity_total?: number;
}

// ============================================
// PARTNER DASHBOARD / STATS
// ============================================

export interface PartnerStats {
  projects: {
    total: number;
    draft: number;
    pending_review: number;
    approved: number;
    active: number;
    rejected: number;
  };
  compensations: {
    total_certificates: number;
    total_kg_co2: number;
    total_revenue_clp: number;
    message?: string;
  };
}

// ============================================
// API RESPONSES
// ============================================

export interface PartnerApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PartnerListResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// ADMIN - PARTNER MANAGEMENT
// ============================================

export interface AdminPartnerListItem {
  id: string;
  name: string;
  contact_email: string;
  website_url?: string;
  logo_url?: string;
  status: PartnerStatus;
  total_projects: number;
  total_active_projects: number;
  created_at: string;
  verified_at?: string;
}

export interface AdminPartnerDetail extends Partner {
  users: Array<{
    id: string;
    name: string;
    email: string;
    is_active: boolean;
    last_login?: string;
    created_at: string;
    roles: Array<{
      code: string;
      name: string;
    }>;
  }>;
  projects: EsgProject[];
  total_projects: number;
  total_active_projects: number;
}

export interface CreatePartnerRequest {
  partnerName: string;
  contactEmail: string;
  websiteUrl?: string;
  adminName: string;
  adminEmail: string;
}

export interface UpdatePartnerStatusRequest {
  status: PartnerStatus;
  reason?: string;
}

// ============================================
// ADMIN - PROJECT REVIEW
// ============================================

export interface RejectProjectRequest {
  reason: string;
}

// ============================================
// FORM HELPERS
// ============================================

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  reforestation: 'Reforestación',
  conservation: 'Conservación',
  renewable_energy: 'Energía Renovable',
  methane_capture: 'Captura de Metano',
  ocean_cleanup: 'Limpieza Oceánica',
  sustainable_agriculture: 'Agricultura Sostenible',
  other: 'Otro'
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Borrador',
  pending_review: 'En Revisión',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  active: 'Activo',
  paused: 'Pausado',
  completed: 'Completado'
};

export const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = {
  onboarding: 'En Onboarding',
  active: 'Activo',
  suspended: 'Suspendido',
  inactive: 'Inactivo'
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  draft: '!bg-gray-100 !text-gray-800',
  pending_review: '!bg-yellow-100 !text-yellow-800',
  approved: '!bg-blue-100 !text-blue-800',
  rejected: '!bg-red-100 !text-red-800',
  active: '!bg-green-100 !text-green-800',
  paused: '!bg-orange-100 !text-orange-800',
  completed: '!bg-purple-100 !text-purple-800'
};

export const PARTNER_STATUS_COLORS: Record<PartnerStatus, string> = {
  onboarding: '!bg-yellow-100 !text-yellow-800',
  active: '!bg-green-100 !text-green-800',
  suspended: '!bg-red-100 !text-red-800',
  inactive: '!bg-gray-100 !text-gray-800'
};
