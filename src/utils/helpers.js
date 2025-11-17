import authService from '../services/authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Wrapper para fetch con autenticación automática
 */
export const authFetch = async (url, options = {}) => {
  const token = authService.getToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;

  try {
    const response = await fetch(fullUrl, config);

    // Si el token es inválido (401), hacer logout
    if (response.status === 401) {
      authService.logout();
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Validador de email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validador de contraseña
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validador de nombre
 */
export const isValidName = (name) => {
  return name && name.trim().length >= 2;
};

/**
 * Formateador de errores de API
 */
export const formatApiError = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Ocurrió un error inesperado';
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Get initials from name
 */
export const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${first}${last}`;
};
