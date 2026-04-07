// ============================================
// AUTH TYPES - Compensa Tu Viaje
// ============================================

// Login Request
export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

// Login Response
export interface LoginResponse {
  success: boolean;
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user_info: UserInfo;
  meta: {
    login_time: string;
    expires_at: string;
  };
}

// Refresh Token Request
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Refresh Token Response
export interface RefreshTokenResponse {
  success: boolean;
  access_token: string;
  refresh_token?: string;
  token_type: 'Bearer';
  expires_in: number;
  user_info: UserInfo;
}

// User Info (viene en login y refresh)
export interface UserInfo {
  user_id: string;
  email: string;
  name: string;
  company_id?: string;
  company_name?: string;
  role: UserRole;
  permissions: Permission[];
  is_admin: boolean;
  is_super_admin?: boolean;
  user_type: UserType;
}

// Tipos de usuario para routing
export type UserType = 
  | 'superadmin'
  | 'b2b'
  | 'b2c'
  | 'partner';

// Roles disponibles
export type UserRole = 
  | 'SUPERADMIN'
  | 'COMPANY_ADMIN' 
  | 'COMPANY_OPERATOR' 
  | 'COMPANY_VIEWER'
  | 'B2C_USER'
  | 'PARTNER_ADMIN'
  | 'PARTNER_VIEWER';

// Permisos disponibles
export type Permission = 
  | 'companies.read'
  | 'companies.update'
  | 'companies.create'
  | 'companies.verify'
  | 'uploads.read'
  | 'uploads.create'
  | 'users.read'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'calculations.read'
  | 'calculations.export'
  | 'certificates.read'
  | 'certificates.create'
  | 'payments.read'
  | 'payments.create'
  | 'admin.system'
  | 'admin.audit'
  | 'admin.catalogs'
  | 'projects.read'
  | 'projects.create'
  | 'projects.update';

// Error Response genérico
export interface AuthErrorResponse {
  success: false;
  error_code: AuthErrorCode;
  error_message: string;
  details?: { field: string; message: string }[];
  retry_after?: number;
}

export type AuthErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_REFRESH_TOKEN'
  | 'USER_NOT_FOUND'
  | 'ACCOUNT_INACTIVE'
  | 'NO_ACTIVE_COMPANIES'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SYSTEM_ERROR'
  | 'COMPANY_SUSPENDED'
  | 'USER_INACTIVE_IN_COMPANY';

// User state for frontend
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  companyId?: string;
  companyName?: string;
  role: UserRole;
  permissions: Permission[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
  userType: UserType;
}

// Auth Context Type
export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  register: (companyData: RegisterCompanyRequest, adminUser: AdminUserData) => Promise<RegisterCompanyResponse>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
}

// Register types
export interface AdminUserData {
  email: string;
  name: string;
  password: string;
}

export interface RegisterCompanyRequest {
  razonSocial: string;
  rut: string;
  nombreComercial?: string;
  giroSii?: string;
  tamanoEmpresa: CompanySize;
  direccion?: string;
  phone?: string;
  adminUser: AdminUserData;
}

export interface RegisterCompanyResponse {
  success: boolean;
  message: string;
  data: {
    company: {
      id: string;
      razonSocial: string;
      rut: string;
      slugPublico: string | null;
      status: CompanyStatus;
      createdAt: string;
    };
    user: {
      id: string;
      email: string;
      name: string;
    };
    nextSteps: string[];
  };
}

export type CompanySize = 'micro' | 'pequena' | 'mediana' | 'grande';
export type CompanyStatus = 'registered' | 'pending_contract' | 'signed' | 'active' | 'suspended';
