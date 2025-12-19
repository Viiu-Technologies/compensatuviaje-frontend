# 📦 TypeScript Types - AUTH + ONBOARD B2B

**Para:** IA Frontend Developer  
**Uso:** Copiar directamente a `src/types/`

---

## auth.types.ts

```typescript
// ============================================
// AUTH TYPES
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
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user_info: UserInfo;
}

// User Info (viene en login y refresh)
export interface UserInfo {
  user_id: string;
  email: string;
  name: string;
  company_id: string;
  company_name: string;
  role: UserRole;
  permissions: Permission[];
  is_admin: boolean;
}

// Roles disponibles
export type UserRole = 
  | 'SUPERADMIN'
  | 'COMPANY_ADMIN' 
  | 'COMPANY_OPERATOR' 
  | 'COMPANY_VIEWER';

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
  | 'admin.catalogs';

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
  | 'SYSTEM_ERROR';
```

---

## company.types.ts

```typescript
// ============================================
// COMPANY TYPES
// ============================================

// Estados de empresa
export type CompanyStatus = 
  | 'registered'
  | 'pending_contract'
  | 'signed'
  | 'active'
  | 'suspended';

// Tamaños de empresa
export type CompanySize = 
  | 'micro'
  | 'pequena'
  | 'mediana'
  | 'grande';

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

// Para registro de empresa
export interface RegisterCompanyRequest {
  razonSocial: string;
  rut: string;
  nombreComercial?: string;
  giroSii?: string;
  tamanoEmpresa: CompanySize;
  direccion?: string;
  phone?: string;
  adminUser: {
    email: string;
    name: string;
    password: string;
  };
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
```

---

## document.types.ts

```typescript
// ============================================
// DOCUMENT TYPES
// ============================================

// Tipos de documento
export type DocumentType = 
  | 'contrato_servicio'
  | 'rut_empresa'
  | 'poder_representante'
  | 'certificado_vigencia';

// Configuración de documentos
export interface DocumentTypeConfig {
  name: string;
  required: boolean;
  description: string;
}

export interface DocumentConfig {
  documentTypes: Record<DocumentType, DocumentTypeConfig>;
  maxFileSize: number;
  allowedMimeTypes: string[];
  maxFileSizeMB: number;
}

// Documento de empresa
export interface CompanyDocument {
  id: string;
  docType: DocumentType;
  status: string;
  uploadedAt: string;
  file: {
    id: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    checksum?: string;
  };
}

// Lista de documentos response
export interface DocumentListResponse {
  success: boolean;
  data: CompanyDocument[];
  count: number;
  documentTypes: Record<DocumentType, DocumentTypeConfig>;
}

// Upload response
export interface UploadDocumentResponse {
  success: boolean;
  message: string;
  data: {
    document: {
      id: string;
      docType: DocumentType;
      status: string;
      uploadedAt: string;
    };
    file: {
      id: string;
      fileName: string;
      mimeType: string;
      sizeBytes: number;
    };
    metadata: {
      checksum: string;
      uploadDuration: number;
    };
  };
}

// Validación de documentos
export interface DocumentSummaryItem {
  name: string;
  required: boolean;
  uploaded: number;
  status: 'complete' | 'missing' | 'optional';
}

export interface DocumentValidationResponse {
  success: boolean;
  data: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    documentSummary: Record<DocumentType, DocumentSummaryItem>;
    completionPercentage: number;
  };
}
```

---

## user.types.ts

```typescript
// ============================================
// USER TYPES
// ============================================

// Usuario completo (perfil)
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  company: {
    id: string;
    razonSocial: string;
    rut: string;
    status: CompanyStatus;
  };
  roles: string[];
  permissions: Permission[];
}

// Para actualizar perfil
export interface UpdateProfileRequest {
  name?: string;
  preferences?: {
    notifications_email?: boolean;
    language?: string;
  };
}

// Cambio de contraseña
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Cambio de email
export interface UpdateEmailRequest {
  newEmail: string;
  currentPassword: string;
}

// Usuario de empresa (listado)
export interface CompanyUser {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  isAdmin: boolean;
  roles: string[];
  lastLoginAt: string | null;
  createdAt: string;
}

// Listado de usuarios
export interface UsersListResponse {
  success: boolean;
  data: {
    users: CompanyUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Query params para listar usuarios
export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'all';
}

// Crear usuario
export interface CreateUserRequest {
  email: string;
  name: string;
  role: 'COMPANY_ADMIN' | 'COMPANY_OPERATOR' | 'COMPANY_VIEWER';
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      roles: string[];
    };
    temporaryPassword: string;
    instructions: string;
  };
}

// Actualizar usuario
export interface UpdateUserRequest {
  name?: string;
  role?: 'COMPANY_ADMIN' | 'COMPANY_OPERATOR' | 'COMPANY_VIEWER';
}

// Reset password
export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data: {
    temporaryPassword: string;
    instructions: string;
  };
}
```

---

## dashboard.types.ts

```typescript
// ============================================
// DASHBOARD & ONBOARDING TYPES
// ============================================

import { CompanyStatus, CompanyDomain, Company } from './company.types';
import { DocumentSummaryItem, DocumentType } from './document.types';

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
  metadata: Record<string, any>;
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
```

---

## api.types.ts

```typescript
// ============================================
// API GENERIC TYPES
// ============================================

// Response base exitosa
export interface SuccessResponse<T = any> {
  success: true;
  message?: string;
  data: T;
}

// Response base error
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  error_code?: string;
  details?: any[];
}

// Response con paginación
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic API Response
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Validación de aeropuerto
export interface AirportValidationResponse {
  success: boolean;
  message: string;
  data?: {
    iataCode: string;
    name: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
}

// Validación de dominio
export interface DomainInfoResponse {
  success: boolean;
  data: {
    domain: string;
    exists: boolean;
    message: string;
  };
}
```

---

## index.ts (barrel export)

```typescript
// ============================================
// BARREL EXPORT
// ============================================

export * from './auth.types';
export * from './company.types';
export * from './document.types';
export * from './user.types';
export * from './dashboard.types';
export * from './api.types';
```

---

**Copia estos tipos directamente a tu proyecto frontend en `src/types/`**
