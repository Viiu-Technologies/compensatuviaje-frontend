// ============================================
// Validators - RUT Chileno, Password, Email
// ============================================

/**
 * Valida un RUT chileno
 * Soporta formatos: 12.345.678-9, 12345678-9, 123456789
 */
export const validateRut = (rut: string): boolean => {
  if (!rut || typeof rut !== 'string') return false;
  
  // Limpiar formato
  const cleanRut = rut.replace(/\./g, '').replace('-', '').toUpperCase();
  
  // Validar longitud
  if (cleanRut.length < 8 || cleanRut.length > 9) return false;
  
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  
  // Validar que el cuerpo sean solo números
  if (!/^\d+$/.test(body)) return false;
  
  // Calcular dígito verificador
  let sum = 0;
  let mul = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  
  const expectedDv = 11 - (sum % 11);
  const dvMap: Record<number, string> = { 11: '0', 10: 'K' };
  const calculatedDv = dvMap[expectedDv] || expectedDv.toString();
  
  return dv === calculatedDv;
};

/**
 * Formatea un RUT chileno
 * Input: 123456789 -> Output: 12.345.678-9
 */
export const formatRut = (rut: string): string => {
  if (!rut) return '';
  
  // Limpiar
  let clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (clean.length < 2) return clean;
  
  // Separar cuerpo y DV
  const dv = clean.slice(-1);
  const body = clean.slice(0, -1);
  
  // Formatear con puntos
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formatted}-${dv}`;
};

/**
 * Valida fortaleza de contraseña
 */
export interface PasswordValidation {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  score: number;
}

export const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = [];
  let score = 0;
  
  // Validaciones básicas
  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  } else {
    score += 1;
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Requiere al menos una mayúscula');
  } else {
    score += 1;
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Requiere al menos una minúscula');
  } else {
    score += 1;
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Requiere al menos un número');
  } else {
    score += 1;
  }
  
  // Bonus por caracteres especiales
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  }
  
  // Bonus por longitud extra
  if (password.length >= 12) {
    score += 1;
  }
  
  // Determinar fortaleza
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 5) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'medium';
  }
  
  return {
    valid: errors.length === 0,
    errors,
    strength,
    score,
  };
};

/**
 * Valida formato de email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida formato de teléfono chileno
 * Soporta: +56912345678, 912345678, 56912345678
 */
export const validateChileanPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\s/g, '').replace(/[-()]/g, '');
  const phoneRegex = /^(\+?56)?9\d{8}$/;
  return phoneRegex.test(cleanPhone);
};

/**
 * Formatea teléfono chileno
 */
export const formatChileanPhone = (phone: string): string => {
  const clean = phone.replace(/\D/g, '');
  
  if (clean.length === 9) {
    return `+56 ${clean.slice(0, 1)} ${clean.slice(1, 5)} ${clean.slice(5)}`;
  }
  
  if (clean.length === 11 && clean.startsWith('56')) {
    return `+${clean.slice(0, 2)} ${clean.slice(2, 3)} ${clean.slice(3, 7)} ${clean.slice(7)}`;
  }
  
  return phone;
};

/**
 * Valida tamaño de archivo
 */
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

/**
 * Valida tipo de archivo
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Valida dominio de email corporativo
 */
export const extractEmailDomain = (email: string): string | null => {
  if (!validateEmail(email)) return null;
  return email.split('@')[1];
};
