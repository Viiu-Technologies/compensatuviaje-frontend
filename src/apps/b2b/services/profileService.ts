import api from '../../../shared/services/api';

// ============ TYPES ============
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  preferences?: {
    notifications?: boolean;
    newsletter?: boolean;
    language?: string;
    theme?: string;
  };
  company?: {
    id: string;
    razonSocial: string;
    rut: string;
    status: string;
  };
  role?: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
  preferences?: {
    notifications?: boolean;
    newsletter?: boolean;
    language?: string;
    theme?: string;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileResponse {
  success: boolean;
  data?: UserProfile;
  message?: string;
}

// ============ PROFILE SERVICE ============

/**
 * Obtener perfil del usuario actual
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const response = await api.get('/b2b/profile') as any;
    if (response.success) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Obtener informaci├│n b├ísica del usuario (desde /me)
 */
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const response = await api.get('/b2b/profile/me') as any;
    if (response.success) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

/**
 * Actualizar perfil del usuario
 */
export const updateUserProfile = async (data: UpdateProfileData): Promise<ProfileResponse> => {
  try {
    const response = await api.put('/b2b/profile', data) as any;
    return {
      success: response.success,
      data: response.data,
      message: response.message
    };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error actualizando perfil'
    };
  }
};

/**
 * Cambiar contrase├▒a del usuario
 */
export const changePassword = async (data: ChangePasswordData): Promise<ProfileResponse> => {
  try {
    const response = await api.put('/b2b/profile/password', data) as any;
    return {
      success: response.success,
      message: response.message
    };
  } catch (error: any) {
    console.error('Error changing password:', error);
    
    // Manejar errores espec├¡ficos
    if (error.response?.status === 401) {
      return {
        success: false,
        message: 'Contrase├▒a actual incorrecta'
      };
    }
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error cambiando contrase├▒a'
    };
  }
};

/**
 * Actualizar email (requiere verificaci├│n)
 */
export const updateEmail = async (newEmail: string): Promise<ProfileResponse> => {
  try {
    const response = await api.put('/b2b/profile/email', { email: newEmail }) as any;
    return {
      success: response.success,
      message: response.message
    };
  } catch (error: any) {
    console.error('Error updating email:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error actualizando email'
    };
  }
};

/**
 * Cerrar sesi├│n
 */
export const logout = async (): Promise<void> => {
  try {
    await api.post('/b2b/profile/logout');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

// ============ MOCK DATA (para demo) ============

/**
 * Datos de perfil simulados para demo
 */
export const getMockUserProfile = (email?: string): UserProfile => {
  return {
    id: 'usr_demo_001',
    name: 'Usuario Empresarial',
    email: email || 'admin@empresa.com',
    phone: '+56 9 1234 5678',
    preferences: {
      notifications: true,
      newsletter: true,
      language: 'es',
      theme: 'light'
    },
    company: {
      id: 'comp_demo_001',
      razonSocial: 'Empresa Demo S.A.',
      rut: '76.123.456-7',
      status: 'active'
    },
    role: 'company_admin',
    permissions: ['companies.read', 'companies.update', 'compensations.create'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-12-01T14:45:00Z'
  };
};
