// ============================================
// ADMIN AI EVALUATIONS TYPES - CompensaTuViaje
// ============================================
import { CertAiStatus, CertificationLevel, CertificationType, CertScoreDetails, CertCompliance } from './certification.types';
import { KybAiStatus, PartnerTier, KybScores, KybInsights } from './kyb.types';

// ============================================
// COMMON & PAGINATION
// ============================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export type AdminDecision = 'approved' | 'rejected' | null;

// ============================================
// CERTIFICATIONS (Agent 2)
// ============================================

export interface AdminCertEvaluationListItem {
  id: string;
  ai_status: CertAiStatus;
  level: CertificationLevel;
  final_score: number | null;
  confidence_score: number | null;
  reason: string | null;
  certification_type: CertificationType;
  document_name: string;
  created_at: string;
  n8n_processed_at: string | null;
  admin_decision: AdminDecision;
  project: {
    id: string;
    name: string;
    code: string;
    projectType: string;
    status: string;
  };
  partner: {
    id: string;
    name: string;
    contact_email: string;
  };
}

export interface AdminCertEvaluationDetail {
  id: string;
  request_id?: string;
  ai_status: CertAiStatus;
  certification_type: CertificationType;
  level: CertificationLevel;
  final_score: number | null;
  confidence_score: number | null;
  reason: string | null;
  report_markdown: string | null;
  project_type_detected: string | null;
  details: CertScoreDetails | null;
  compliance: CertCompliance | null;
  document_name: string;
  document_url?: string;
  s3_key: string | null;
  created_at: string;
  n8n_processed_at: string | null;
  admin_decision: AdminDecision;
  admin_reason: string | null;
  admin_decided_at: string | null;
  admin_user?: {
    id: string;
    name: string;
    email: string;
  };
  project: {
    id: string;
    name: string;
    code: string;
    projectType: string;
    status: string;
    description?: string;
    country?: string;
    region?: string;
    providerOrganization?: string;
  };
  partner: {
    id: string;
    name: string;
    contact_email: string;
    website_url?: string;
  };
}

// ============================================
// KYB (Agent 1)
// ============================================

export interface AdminKybEvaluationListItem {
  id: string;
  ai_status: KybAiStatus;
  partner_tier: PartnerTier;
  overall_score: number | null;
  organization_name: string;
  rut_tax_id?: string;
  document_name: string;
  created_at: string;
  n8n_processed_at: string | null;
  admin_decision: AdminDecision;
  partner: {
    id: string;
    name: string;
    contact_email: string;
    status: string;
  };
}

export interface AdminKybEvaluationDetail {
  id: string;
  ai_status: KybAiStatus;
  partner_tier: PartnerTier;
  organization_name: string;
  rut_tax_id?: string;
  scores: KybScores | null;
  ai_insights: KybInsights | null;
  document_name: string;
  document_url?: string;
  s3_key: string | null;
  created_at: string;
  n8n_processed_at: string | null;
  admin_decision: AdminDecision;
  admin_reason: string | null;
  admin_decided_at: string | null;
  admin_user?: {
    id: string;
    name: string;
    email: string;
  };
  partner: {
    id: string;
    name: string;
    contact_email: string;
    website_url?: string;
    status: string;
  };
}

// ============================================
// CONTEXT
// ============================================

export interface AdminPartnerContext {
  id: string;
  name: string;
  contact_email: string;
  website_url?: string;
  logo_url: string | null;
  status: string;
  bank_details: any | null;
  verified_at: string | null;
  created_at: string;
  total_projects: number;
  recent_projects: any[];
  users: Array<{
    id: string;
    name: string;
    email: string;
    is_active: boolean;
    last_login: string | null;
    created_at: string;
    roles: Array<{ code: string; name: string }>;
  }>;
}

export interface AdminProjectContext {
  id: string;
  code: string;
  name: string;
  description: string;
  type: string;
  status: string;
  location_country: string;
  location_region?: string;
  provider_cost_unit_clp?: number;
  carbon_capture_per_unit?: number;
  capacity_total?: number;
  capacity_sold?: number;
  transparency_url?: string;
  created_at: string;
  updated_at: string;
  partner: {
    id: string;
    name: string;
    logo_url: string | null;
  };
  documents: any[];
  recent_evidence: any[];
  recent_metrics: any[];
  stats: {
    certificates_issued: number;
    compensation_orders: number;
    capacity_remaining: number;
  };
}
