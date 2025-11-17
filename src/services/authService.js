const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const USE_MOCK = false; // Backend real disponible

class AuthService {
  // Login de usuario
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Manejar diferentes códigos de error del backend
        if (data.error_code === 'INVALID_CREDENTIALS') {
          throw new Error('Email o contraseña incorrectos');
        } else if (data.error_code === 'ACCOUNT_INACTIVE') {
          throw new Error('Tu cuenta está inactiva. Contacta al administrador.');
        } else if (data.error_code === 'RATE_LIMIT_EXCEEDED') {
          throw new Error('Demasiados intentos. Intenta de nuevo más tarde.');
        }
        throw new Error(data.message || 'Error en el login');
      }

      // El backend devuelve: { success, access_token, refresh_token, user_info, meta }
      if (!data.success) {
        throw new Error(data.message || 'Error en el login');
      }

      return data; // Retornamos toda la respuesta para que AuthContext la procese
    } catch (error) {
      throw error;
    }
  }

  // Registro de usuario (crear empresa y usuario)
  async register(payload) {
    try {
      // El backend espera: { adminUser: {...}, ...companyData }
      const response = await fetch(`${API_URL}/onboard/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Manejar errores específicos del backend
        if (data.error && data.error.includes('RUT')) {
          throw new Error('RUT inválido o ya existe en el sistema');
        } else if (data.error && data.error.includes('ya existe')) {
          throw new Error('Esta empresa o usuario ya está registrado');
        }
        throw new Error(data.message || 'Error en el registro');
      }

      // El backend devuelve: { success, message, data: { company, user, nextSteps } }
      if (!data.success) {
        throw new Error(data.message || 'Error en el registro');
      }

      return data; // Retornamos toda la respuesta
    } catch (error) {
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        // Llamar al endpoint de logout del backend
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Error al hacer logout en el backend:', error);
    }
  }

  // Obtener usuario actual (llamar a GET /api/auth/me)
  async getCurrentUser() {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      // El backend devuelve: { success, user_info }
      if (data.success && data.user_info) {
        return data; // Retorna toda la respuesta con user_info
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  // Obtener token
  getToken() {
    return localStorage.getItem('access_token');
  }

  // Verificar si está autenticado
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  // Recuperar contraseña
  async forgotPassword(email) {
    // MODO MOCK - Sin backend
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            message: 'Se ha enviado un email con instrucciones (modo demo)',
            success: true
          });
        }, 500);
      });
    }

    // MODO REAL - Con backend
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar email');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Resetear contraseña
  async resetPassword(token, password) {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al resetear contraseña');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

const authService = new AuthService();
export default authService;
