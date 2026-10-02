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
 * Obtener información básica del usuario (desde /me)
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
 * Cambiar contraseña del usuario
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
    
    // Manejar errores específicos
    if (error.response?.status === 401) {
      return {
        success: false,
        message: 'Contraseña actual incorrecta'
      };
    }
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error cambiando contraseña'
    };
  }
};

/**
 * Actualizar email (requiere verificación)
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
 * Cerrar sesión
 */
export const logout = async (): Promise<void> => {
  try {
    await api.post('/b2b/profile/logout');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

