// ============================================
// USER TYPES
// ============================================

import type { Permission, CompanyStatus } from './auth.types';

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
