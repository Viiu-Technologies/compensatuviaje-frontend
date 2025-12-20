// ============================================
// COMPANY TYPES
// ============================================

import type { CompanySize, CompanyStatus } from './auth.types';

// Company completa
export interface Company {
  id: string;
  razonSocial: string;
  rut: string;
  nombreComercial: string | null;
  giroSii: string | null;
  tamanoEmpresa: CompanySize;
  direccion: string | null;
  phone: string | null;
  slugPublico: string | null;
  publicProfileOptIn: boolean;
  status: CompanyStatus;
  createdAt: string;
  updatedAt: string;
}

// Para actualizar empresa
export interface UpdateCompanyRequest {
  nombreComercial?: string;
  direccion?: string;
  phone?: string;
  slugPublico?: string;
  publicProfileOptIn?: boolean;
}

// Dominio corporativo
export interface CompanyDomain {
  id: string;
  domain: string;
  verified: boolean;
  verifiedAt: string | null;
  createdAt: string;
}

export interface AddDomainRequest {
  domain: string;
}

export interface AddDomainResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    domain: string;
    verified: boolean;
    createdAt: string;
    nextSteps: string[];
  };
}

// Validar email corporativo
export interface ValidateEmailRequest {
  email: string;
  companyId: string;
}

export interface ValidateEmailResponse {
  success: boolean;
  data: {
    email: string;
    isValid: boolean;
    message: string;
  };
}

// Company list response
export interface CompanyListResponse {
  success: boolean;
  data: Company[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
