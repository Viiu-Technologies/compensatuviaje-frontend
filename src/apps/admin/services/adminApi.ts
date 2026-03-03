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
  // El interceptor ya extrae response.data
  const response = await api.get('/admin/dashboard') as any;
  return response.data || response;
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
  // El interceptor ya extrae response.data
  const response = await api.get('/admin/dashboard/metrics', { params: { period } }) as any;
  return response.data || response;
};

// ============================================
// B2B EMPRESAS
// ============================================

export interface Company {
  id: string;
  razonSocial: string;
  nombreComercial?: string;
  rut: string;
  industry?: string;
  tamanoEmpresa?: string;
  status: string;
  createdAt: string;
  _count?: {
    companyUsers?: number;
    certificates?: number;
    flightRecords?: number;
    documents?: number;
  };
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
  // El interceptor ya extrae response.data, response = { success, data, pagination }
  const response = await api.get('/admin/companies', { params }) as any;
  return {
    companies: response.data || [],
    pagination: {
      page: response.pagination?.page || 1,
      limit: response.pagination?.limit || 20,
      total: response.pagination?.totalRecords || response.pagination?.total || 0,
      totalPages: response.pagination?.totalPages || response.pagination?.total_pages || 0
    }
  };
};

export const getCompanyDetail = async (id: string) => {
  // El interceptor ya extrae response.data
  const response = await api.get(`/admin/companies/${id}`) as any;
  return response.data || response;
};

export const updateCompanyStatus = async (id: string, toStatus: string, note?: string) => {
  // Backend espera { toStatus, note } - NO { status, reason }
  const response = await api.put(`/admin/companies/${id}/status`, { toStatus, note }) as any;
  return response;
};

// Timeline de cambios de estado
export const getCompanyTimeline = async (id: string) => {
  const response = await api.get(`/admin/companies/${id}/timeline`) as any;
  return response.data || response;
};

// Documentos de la empresa
export const getCompanyDocuments = async (id: string) => {
  const response = await api.get(`/admin/companies/${id}/documents`) as any;
  return response.data || response;
};

// Revisar documento
export const reviewCompanyDocument = async (companyId: string, documentId: string, status: string, notes?: string) => {
  const response = await api.put(`/admin/companies/${companyId}/documents/${documentId}/review`, { status, notes }) as any;
  return response;
};

// ============================================
// VERIFICACIÓN
// ============================================

// Obtener empresas pendientes de verificación
export const getPendingVerifications = async () => {
  const response = await api.get('/admin/verification/pending') as any;
  return response.data || response;
};

// Estadísticas de verificación
export const getVerificationStats = async () => {
  const response = await api.get('/admin/verification/stats') as any;
  return response.data || response;
};

// Verificar dominio manualmente
export const verifyDomain = async (domainId: string, isVerified: boolean, note?: string) => {
  const response = await api.put(`/admin/verification/domains/${domainId}/verify`, { isVerified, note }) as any;
  return response;
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
  // El interceptor ya extrae response.data
  // Backend retorna: { success, data: { users: [...], pagination: {...} } }
  // Después del interceptor: response = { success, data: { users, pagination } }
  const response = await api.get('/admin/b2c/users', { params }) as any;
  
  // data está anidado: response.data = { users: [...], pagination: {...} }
  const nested = response.data || {};
  const users = nested.users || [];
  const pag = nested.pagination || {};
  
  return {
    users,
    pagination: {
      page: pag.page || 1,
      limit: pag.limit || 20,
      total: pag.total || pag.totalRecords || 0,
      totalPages: pag.totalPages || pag.total_pages || 0
    }
  };
};

export const getB2CUserDetail = async (id: string) => {
  // El interceptor ya extrae response.data
  const response = await api.get(`/admin/b2c/users/${id}`) as any;
  return response.data || response;
};

export const getB2CStats = async (period: string = '30d') => {
  // El interceptor ya extrae response.data
  const response = await api.get('/admin/b2c/stats', { params: { period } }) as any;
  return response.data || response;
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
  // El interceptor ya extrae response.data, response = { success, data, pagination }
  const response = await api.get('/admin/projects', { params }) as any;
  return {
    projects: response.data || [],
    pagination: {
      page: response.pagination?.page || 1,
      limit: response.pagination?.limit || 20,
      total: response.pagination?.totalRecords || response.pagination?.total || 0,
      totalPages: response.pagination?.totalPages || response.pagination?.total_pages || 0
    }
  };
};

export const getProjectDetail = async (id: string) => {
  // El interceptor ya extrae response.data
  const response = await api.get(`/admin/projects/${id}`) as any;
  return response.data || response;
};

export const createProject = async (data: Partial<Project>) => {
  const response = await api.post('/admin/projects', data) as any;
  return response.data || response;
};

export const updateProject = async (id: string, data: Partial<Project>) => {
  const response = await api.put(`/admin/projects/${id}`, data) as any;
  return response.data || response;
};

export const deleteProject = async (id: string) => {
  const response = await api.delete(`/admin/projects/${id}`) as any;
  return response;
};

export const getProjectsStats = async () => {
  const response = await api.get('/admin/projects/stats') as any;
  return response.data || response;
};

export const addProjectEvidence = async (projectId: string, data: {
  type: string;
  title: string;
  description?: string;
  fileUrl: string;
  documentDate?: string;
}) => {
  const response = await api.post(`/admin/projects/${projectId}/evidences`, data) as any;
  return response.data || response;
};

export const deleteProjectEvidence = async (projectId: string, evidenceId: string) => {
  const response = await api.delete(`/admin/projects/${projectId}/evidences/${evidenceId}`) as any;
  return response;
};

export const addProjectPricing = async (projectId: string, data: {
  pricePerTonCLP?: number;
  pricePerTonUSD?: number;
  effectiveFrom?: string;
  reason?: string;
}) => {
  const response = await api.post(`/admin/projects/${projectId}/pricing`, data) as any;
  return response.data || response;
};

export const getProjectPricingHistory = async (projectId: string) => {
  const response = await api.get(`/admin/projects/${projectId}/pricing-history`) as any;
  return response.data || response;
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
  const response = await api.get('/admin/reports/emissions', { params: filters }) as any;
  return response.data || response;
};

export const getFinancialReport = async (filters: ReportFilters) => {
  const response = await api.get('/admin/reports/financial', { params: filters }) as any;
  return response.data || response;
};

export const getCompaniesReport = async (filters: ReportFilters) => {
  const response = await api.get('/admin/reports/companies', { params: filters }) as any;
  return response.data || response;
};

export const getB2CReport = async (filters: ReportFilters) => {
  const response = await api.get('/admin/reports/b2c', { params: filters }) as any;
  return response.data || response;
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
  // El interceptor ya extrae response.data, así que response = { success, data, pagination }
  const response = await api.get('/admin/partners', { params }) as any;
  return {
    partners: response.data || [],
    pagination: {
      page: response.pagination?.page || 1,
      limit: response.pagination?.limit || 10,
      total: response.pagination?.total || 0,
      totalPages: response.pagination?.total_pages || 0
    }
  };
};

export const getPartnerDetail = async (id: string): Promise<PartnerDetail> => {
  const response = await api.get(`/admin/partners/${id}`);
  return response.data;
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
  const response = await api.put(`/admin/partners/${id}/status`, { status: 'active' }) as any;
  return response;
};

// Partner Projects (Admin view)
export const getPartnerProjects = async (partnerId: string, params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const response = await api.get(`/admin/partners/${partnerId}/projects`, { params });
  return response.data;
};

export const approvePartnerProject = async (_partnerId: string, projectId: string) => {
  const response = await api.post(`/admin/partners/projects/${projectId}/approve`) as any;
  return response;
};

export const rejectPartnerProject = async (
  _partnerId: string, 
  projectId: string, 
  reason: string
) => {
  const response = await api.post(`/admin/partners/projects/${projectId}/reject`, { reason }) as any;
  return response;
};

// Partner Stats
export const getPartnersStats = async () => {
  // El interceptor ya extrae response.data, así que response = { success, data }
  const response = await api.get('/admin/partners/stats') as any;
  const data = response.data;
  
  // Transformar al formato esperado por el frontend
  return {
    total: data?.partners?.total || 0,
    byStatus: {
      active: data?.partners?.active || 0,
      onboarding: data?.partners?.onboarding || 0,
      suspended: data?.partners?.suspended || 0,
      inactive: data?.partners?.inactive || 0,
    },
    verified: data?.partners?.active || 0, // Los activos son los verificados
    withProjects: data?.projects?.total || 0,
    projects: data?.projects || {},
    recentPartnersCount: data?.recentPartnersCount || 0,
  };
};

// Projects pending review (all partners)
export const getProjectsPendingReview = async (params?: {
  page?: number;
  limit?: number;
}) => {
  // Note: Axios interceptor already extracts response.data, so 'response' IS the body
  const response = await api.get('/admin/partners/projects/pending', { params }) as any;
  // response = { success, data, pagination }
  return {
    projects: response.data || [],
    pagination: {
      page: response.pagination?.page || 1,
      limit: response.pagination?.limit || 10,
      total: response.pagination?.total || 0,
      totalPages: response.pagination?.total_pages || 0
    }
  };
};
