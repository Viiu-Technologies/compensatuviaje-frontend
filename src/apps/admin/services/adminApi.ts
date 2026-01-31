/**
 * Admin API Service
 * Servicios para el panel de SuperAdmin
 */

import api from '../../../shared/services/api';

// ============================================
// DASHBOARD
// ============================================

export interface DashboardData {
  overview: {
    totalCompanies: number;
    activeCompanies: number;
    pendingVerification: number;
    totalB2CUsers: number;
    activeB2CUsers30d: number;
    totalEmissionsKg: number;
    totalCompensatedKg: number;
    compensationRate: number;
    totalRevenueCLP: number;
  };
  companies: {
    total: number;
    active: number;
    pending: number;
    registered: number;
    suspended: number;
    byStatus: Record<string, number>;
  };
  b2c: {
    total: number;
    active30d: number;
    newThisMonth: number;
    withCompensations: number;
    totalCalculations: number;
  };
  emissions: {
    totalCalculated: number;
    totalCompensated: number;
    compensationRate: number;
    totalRevenue: number;
  };
  verification: {
    companies: number;
    documents: number;
    total: number;
  };
  recentActivity: Array<{
    type: string;
    timestamp: string;
    description: string;
    entityId: string;
    entityType: string;
  }>;
  alerts: Array<{
    type: 'info' | 'warning' | 'error';
    message: string;
    actionUrl: string;
    count: number;
  }>;
  workQueue: {
    pendingCompanies: number;
    pendingDocuments: number;
    total: number;
  };
}

export const getDashboard = async (): Promise<DashboardData> => {
  const response = await api.get('/admin/dashboard');
  return response.data.data;
};

export interface MetricsData {
  period: string;
  groupBy: string;
  emissions: {
    series: Array<{ date: string; calculated: number; compensated: number }>;
    total: number;
    average: number;
    trend: string;
  };
  revenue: {
    series: Array<{ date: string; valueCLP: number; valueUSD: number }>;
    totalCLP: number;
    totalUSD: number;
    trend: string;
  };
  newCompanies: {
    series: Array<{ date: string; count: number }>;
    total: number;
    trend: string;
  };
  newB2CUsers: {
    series: Array<{ date: string; count: number }>;
    total: number;
    trend: string;
  };
}

export const getMetrics = async (period: string = '30d'): Promise<MetricsData> => {
  const response = await api.get('/admin/dashboard/metrics', { params: { period } });
  return response.data.data;
};

// ============================================
// B2B EMPRESAS
// ============================================

export interface Company {
  id: string;
  razonSocial: string;
  nombreComercial?: string;
  rut: string;
  industria?: string;
  tamanoEmpresa?: string;
  status: string;
  createdAt: string;
  stats?: {
    totalCertificates: number;
    totalEmissionsKg: number;
    totalSpentCLP: number;
  };
}

export interface CompaniesListResponse {
  companies: Company[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getCompanies = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<CompaniesListResponse> => {
  const response = await api.get('/admin/companies', { params });
  return response.data.data;
};

export const getCompanyDetail = async (id: string) => {
  const response = await api.get(`/admin/companies/${id}`);
  return response.data.data;
};

export const updateCompanyStatus = async (id: string, status: string, reason?: string) => {
  const response = await api.put(`/admin/companies/${id}/status`, { status, reason });
  return response.data;
};

// ============================================
// B2C USUARIOS
// ============================================

export interface B2CUser {
  id: string;
  email: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  pais?: string;
  status: string;
  emailVerified: boolean;
  authProvider?: string;
  lastLoginAt?: string;
  createdAt: string;
  stats?: {
    totalCalculations: number;
    compensatedCount: number;
    totalEmissionsKg: number;
    compensatedEmissionsKg: number;
    totalSpentCLP: number;
  };
}

export interface B2CUsersListResponse {
  users: B2CUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getB2CUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<B2CUsersListResponse> => {
  const response = await api.get('/admin/b2c/users', { params });
  return response.data.data;
};

export const getB2CUserDetail = async (id: string) => {
  const response = await api.get(`/admin/b2c/users/${id}`);
  return response.data.data;
};

export const getB2CStats = async (period: string = '30d') => {
  const response = await api.get('/admin/b2c/stats', { params: { period } });
  return response.data.data;
};

// ============================================
// PROYECTOS ESG
// ============================================

export interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  projectType: string;
  country: string;
  region?: string;
  status: string;
  pricePerTonCLP?: number;
  pricePerTonUSD?: number;
  availableCredits: number;
  totalCredits: number;
  imageUrl?: string;
  certificatesCount?: number;
  evidencesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsListResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getProjects = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  projectType?: string;
  country?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<ProjectsListResponse> => {
  const response = await api.get('/admin/projects', { params });
  return response.data.data;
};

export const getProjectDetail = async (id: string) => {
  const response = await api.get(`/admin/projects/${id}`);
  return response.data.data;
};

export const createProject = async (data: Partial<Project>) => {
  const response = await api.post('/admin/projects', data);
  return response.data;
};

export const updateProject = async (id: string, data: Partial<Project>) => {
  const response = await api.put(`/admin/projects/${id}`, data);
  return response.data;
};

export const deleteProject = async (id: string) => {
  const response = await api.delete(`/admin/projects/${id}`);
  return response.data;
};

export const getProjectsStats = async () => {
  const response = await api.get('/admin/projects/stats');
  return response.data.data;
};

export const addProjectEvidence = async (projectId: string, data: {
  type: string;
  title: string;
  description?: string;
  fileUrl: string;
  documentDate?: string;
}) => {
  const response = await api.post(`/admin/projects/${projectId}/evidences`, data);
  return response.data;
};

export const deleteProjectEvidence = async (projectId: string, evidenceId: string) => {
  const response = await api.delete(`/admin/projects/${projectId}/evidences/${evidenceId}`);
  return response.data;
};

export const addProjectPricing = async (projectId: string, data: {
  pricePerTonCLP?: number;
  pricePerTonUSD?: number;
  effectiveFrom?: string;
  reason?: string;
}) => {
  const response = await api.post(`/admin/projects/${projectId}/pricing`, data);
  return response.data;
};

export const getProjectPricingHistory = async (projectId: string) => {
  const response = await api.get(`/admin/projects/${projectId}/pricing-history`);
  return response.data.data;
};

// ============================================
// REPORTES
// ============================================

export interface ReportFilters {
  period?: string;
  groupBy?: string;
  dateFrom?: string;
  dateTo?: string;
  companyId?: string;
  projectId?: string;
  status?: string;
  country?: string;
  industry?: string;
}

export const getEmissionsReport = async (filters: ReportFilters) => {
  const response = await api.get('/admin/reports/emissions', { params: filters });
  return response.data.data;
};

export const getFinancialReport = async (filters: ReportFilters) => {
  const response = await api.get('/admin/reports/financial', { params: filters });
  return response.data.data;
};

export const getCompaniesReport = async (filters: ReportFilters) => {
  const response = await api.get('/admin/reports/companies', { params: filters });
  return response.data.data;
};

export const getB2CReport = async (filters: ReportFilters) => {
  const response = await api.get('/admin/reports/b2c', { params: filters });
  return response.data.data;
};

export const exportReport = async (params: {
  reportType: 'emissions' | 'financial' | 'companies' | 'b2c' | 'projects';
  format: 'csv' | 'excel' | 'pdf';
  period?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const response = await api.get('/admin/reports/export', { 
    params,
    responseType: params.format === 'csv' ? 'blob' : 'json'
  });
  return response;
};

export const downloadCSV = (data: Blob, filename: string) => {
  const url = window.URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ============================================
// PARTNERS (ESG)
// ============================================

export interface Partner {
  id: string;
  name: string;
  contact_email: string;
  website_url?: string;
  logo_url?: string;
  status: 'onboarding' | 'active' | 'suspended' | 'inactive';
  verified_at?: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  projects_count?: number;
  total_projects?: number;
  total_active_projects?: number;
}

export interface PartnerDetail extends Partner {
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
  projects: Array<{
    id: string;
    code: string;
    name: string;
    status: string;
    type: string;
    created_at: string;
  }>;
  bank_details_configured: boolean;
}

export interface PartnersListResponse {
  partners: Partner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getPartners = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<PartnersListResponse> => {
  const response = await api.get('/admin/partners', { params });
  return response.data.data;
};

export const getPartnerDetail = async (id: string): Promise<PartnerDetail> => {
  const response = await api.get(`/admin/partners/${id}`);
  return response.data.data;
};

export const createPartner = async (data: {
  partnerName: string;
  contactEmail: string;
  websiteUrl?: string;
  adminName: string;
  adminEmail: string;
}) => {
  const response = await api.post('/admin/partners', data);
  return response.data;
};

export const updatePartnerStatus = async (
  id: string, 
  status: 'active' | 'suspended' | 'inactive',
  reason?: string
) => {
  const response = await api.put(`/admin/partners/${id}/status`, { status, reason });
  return response.data;
};

export const verifyPartner = async (id: string) => {
  const response = await api.post(`/admin/partners/${id}/verify`);
  return response.data;
};

// Partner Projects (Admin view)
export const getPartnerProjects = async (partnerId: string, params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const response = await api.get(`/admin/partners/${partnerId}/projects`, { params });
  return response.data.data;
};

export const approvePartnerProject = async (partnerId: string, projectId: string) => {
  const response = await api.post(`/admin/partners/${partnerId}/projects/${projectId}/approve`);
  return response.data;
};

export const rejectPartnerProject = async (
  partnerId: string, 
  projectId: string, 
  reason: string
) => {
  const response = await api.post(`/admin/partners/${partnerId}/projects/${projectId}/reject`, { reason });
  return response.data;
};

// Partner Stats
export const getPartnersStats = async () => {
  const response = await api.get('/admin/partners/stats');
  return response.data.data;
};

// Projects pending review (all partners)
export const getProjectsPendingReview = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/admin/partners/projects/pending', { params });
  return response.data.data;
};
