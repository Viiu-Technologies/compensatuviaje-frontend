/**
 * Mapea los códigos de error del backend a mensajes user-friendly
 */

const ERROR_MESSAGES = {
  // Errores de autenticación
  INVALID_CREDENTIALS: 'Email o contraseña incorrectos',
  ACCOUNT_INACTIVE: 'Tu cuenta está inactiva. Contacta al administrador.',
  RATE_LIMIT_EXCEEDED: 'Demasiados intentos. Por favor, intenta de nuevo más tarde.',
  NO_ACTIVE_COMPANIES: 'No tienes empresas activas asociadas a tu cuenta.',
  TOKEN_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  INVALID_TOKEN: 'Token inválido. Por favor, inicia sesión nuevamente.',
  
  // Errores de validación
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados',
  INVALID_EMAIL: 'Email inválido',
  INVALID_PASSWORD: 'La contraseña debe tener al menos 8 caracteres',
  INVALID_RUT: 'RUT inválido',
  
  // Errores de duplicados
  DUPLICATE_ENTRY: 'Ya existe un registro con estos datos',
  EMAIL_EXISTS: 'Este email ya está registrado',
  RUT_EXISTS: 'Esta empresa ya está registrada',
  
  // Errores de permisos
  FORBIDDEN: 'No tienes permisos para realizar esta acción',
  UNAUTHORIZED: 'Debes iniciar sesión para continuar',
  
  // Errores del sistema
  SYSTEM_ERROR: 'Error del servidor. Por favor, intenta de nuevo más tarde.',
  DATABASE_ERROR: 'Error al procesar la solicitud. Intenta nuevamente.',
  
  // Errores de onboarding
  COMPANY_NOT_FOUND: 'Empresa no encontrada',
  DOCUMENT_NOT_FOUND: 'Documento no encontrado',
  INVALID_STATUS_TRANSITION: 'Cambio de estado no permitido',
  
  // Default
  UNKNOWN_ERROR: 'Ha ocurrido un error. Por favor, intenta de nuevo.'
};

/**
 * Obtiene un mensaje user-friendly a partir de un error
 * @param {Error|Object} error - Error object o respuesta de error del backend
 * @returns {string} Mensaje de error user-friendly
 */
export const getErrorMessage = (error) => {
  // Si es un string, retornarlo directamente
  if (typeof error === 'string') {
    return error;
  }

  // Si tiene error_code del backend
  if (error.error_code && ERROR_MESSAGES[error.error_code]) {
    return ERROR_MESSAGES[error.error_code];
  }

  // Si tiene un mensaje específico
  if (error.message) {
    // Verificar si el mensaje contiene alguna palabra clave
    const message = error.message.toLowerCase();
    
    if (message.includes('rut') && message.includes('inválido')) {
      return 'RUT inválido';
    }
    if (message.includes('ya existe')) {
      return 'Esta información ya está registrada en el sistema';
    }
    if (message.includes('no encontrad')) {
      return 'El registro solicitado no existe';
    }
    if (message.includes('permisos') || message.includes('autorizado')) {
      return 'No tienes permisos para realizar esta acción';
    }
    
    return error.message;
  }

  // Si tiene data con errors (validación de express-validator)
  if (error.data?.errors && Array.isArray(error.data.errors)) {
    const firstError = error.data.errors[0];
    if (firstError.msg) {
      return firstError.msg;
    }
  }

  // Error por defecto según status HTTP
  if (error.status) {
    switch (error.status) {
      case 400:
        return 'Solicitud inválida. Por favor, verifica los datos.';
      case 401:
        return 'Debes iniciar sesión para continuar';
      case 403:
        return 'No tienes permisos para realizar esta acción';
      case 404:
        return 'El recurso solicitado no existe';
      case 409:
        return 'Ya existe un registro con estos datos';
      case 429:
        return 'Demasiados intentos. Por favor, intenta de nuevo más tarde.';
      case 500:
        return 'Error del servidor. Por favor, intenta de nuevo más tarde.';
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Extrae errores de validación de campos específicos
 * @param {Object} error - Error object del backend
 * @returns {Object} Objeto con errores por campo { fieldName: errorMessage }
 */
export const getFieldErrors = (error) => {
  const fieldErrors = {};

  if (error.data?.errors && Array.isArray(error.data.errors)) {
    error.data.errors.forEach(err => {
      if (err.param && err.msg) {
        fieldErrors[err.param] = err.msg;
      }
    });
  }

  return fieldErrors;
};

/**
 * Verifica si un error es un error de autenticación
 * @param {Object} error - Error object
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  const authErrorCodes = [
    'INVALID_CREDENTIALS',
    'ACCOUNT_INACTIVE',
    'TOKEN_EXPIRED',
    'INVALID_TOKEN',
    'UNAUTHORIZED'
  ];
  
  return authErrorCodes.includes(error.error_code) || error.status === 401;
};

/**
 * Verifica si un error es un error de permisos
 * @param {Object} error - Error object
 * @returns {boolean}
 */
export const isPermissionError = (error) => {
  return error.error_code === 'FORBIDDEN' || error.status === 403;
};

/**
 * Verifica si un error es un error de validación
 * @param {Object} error - Error object
 * @returns {boolean}
 */
export const isValidationError = (error) => {
  return error.error_code === 'VALIDATION_ERROR' || error.status === 400;
};

export default {
  getErrorMessage,
  getFieldErrors,
  isAuthError,
  isPermissionError,
  isValidationError,
  ERROR_MESSAGES
};
