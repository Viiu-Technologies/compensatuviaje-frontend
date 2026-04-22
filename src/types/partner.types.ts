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
  logo_url?: string;
  logo_file?: File | null;
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
  bank_code: string | null;
  account_type: string;
  account_number: string;
  account_holder_name: string;
  account_holder_rut: string;
  account_holder_id: string | null;
  currency: string;
  updated_at?: string;
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
  // API returns both 'type' and 'project_type' - we normalize to 'type'
  type: ProjectType;
  project_type?: ProjectType;
  status: ProjectStatus;
  // API returns both 'country'/'region' and 'location_country'/'location_region'
  location_country: string;
  location_region?: string;
  country?: string;
  region?: string;
  // Provider/organization info
  provider_organization?: string;
  // Numeric fields - API may return as string, we normalize to number
  provider_cost_unit_clp?: number;
  provider_currency?: string;
  carbon_capture_per_unit?: number;
  capacity_total?: number;
  capacity_sold?: number;
  capacity_available?: number;
  base_price_usd_per_ton?: number;
  currentBasePriceUsdPerTon?: number;
  // Additional fields
  certification?: string | null;
  co_benefits?: string[] | null;
  impact_unit?: string;
  impact_ratio_per_ton?: number | null;
  // Phase 2: Monthly stock & impact specification
  impact_unit_type?: string;
  impact_unit_spec?: string;
  monthly_stock_approved?: number;
  monthly_stock_remaining?: number;
  stock_period_start?: string;
  stock_period_end?: string;
  transparency_url?: string;
  created_at: string;
  updated_at: string;
  // Related entities
  partner_id?: string;
  partner?: {
    id: string;
    name: string;
    logo_url?: string | null;
  };
  documents?: ProjectDocument[];
  documents_count?: number;
  recent_evidence?: ProjectEvidence[];
  evidence_count?: number;
  recent_metrics?: any[];
  // Stats (only in detail response)
  stats?: {
    certificates_issued: number;
    compensation_orders: number;
    capacity_remaining: number;
  };
}

// Tipos de proyecto (4 Verticales ESG)
// Sincronizado con Backend: src/modules/partner/validators/partnerValidatos.js
export type ProjectType =
  // Vertical BOSQUE
  | 'reforestation'      // Reforestación
  | 'conservation'       // Conservación
  // Vertical AGUA
  | 'clean_water'        // Agua Limpia
  | 'water_security'     // Seguridad Hídrica
  // Vertical TEXTIL
  | 'circular_economy'   // Economía Circular
  | 'waste_management'   // Gestión de Residuos
  // Vertical SOCIAL
  | 'energy_efficiency'  // Eficiencia Energética
  | 'social_housing'     // Vivienda Social
  | 'community_development'; // Desarrollo Comunitario

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

/**
 * Request para crear un proyecto (Partner)
 * 
 * ARQUITECTURA DOBLE CANDADO:
 * - Partner solo envía datos operativos
 * - currentBasePriceUsdPerTon y carbon_capture_per_unit son definidos por Admin
 */
export interface CreateProjectRequest {
  name: string;
  code: string;
  projectType: ProjectType;
  description?: string;
  country: string;
  region?: string;
  providerOrganization?: string;
  transparencyUrl?: string;
  // Datos operativos que el Partner puede definir
  provider_cost_unit_clp?: number;
  capacity_total?: number;
  // Phase 2: Impact specification & monthly stock
  impact_unit_type?: string;
  impact_unit_spec?: string;
  monthly_stock?: number;
  // NOTA: currentBasePriceUsdPerTon y carbon_capture_per_unit 
  // NO se incluyen - son definidos por Admin en aprobación
}

/**
 * Request para actualizar un proyecto (Partner)
 * 
 * ARQUITECTURA DOBLE CANDADO:
 * - Partner solo puede editar datos operativos
 * - Campos financieros son de solo lectura
 */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  country?: string;
  region?: string;
  transparency_url?: string;
  // Datos operativos editables por Partner
  provider_cost_unit_clp?: number;
  capacity_total?: number;
  // NOTA: currentBasePriceUsdPerTon y carbon_capture_per_unit 
  // NO se incluyen - solo Admin puede modificarlos
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

// Labels para tipos de proyecto (4 Verticales ESG)
export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  // Vertical BOSQUE
  reforestation: 'Reforestación',
  conservation: 'Conservación',
  // Vertical AGUA
  clean_water: 'Agua Limpia',
  water_security: 'Seguridad Hídrica',
  // Vertical TEXTIL
  circular_economy: 'Economía Circular',
  waste_management: 'Gestión de Residuos',
  // Vertical SOCIAL
  energy_efficiency: 'Eficiencia Energética',
  social_housing: 'Vivienda Social',
  community_development: 'Desarrollo Comunitario'
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
