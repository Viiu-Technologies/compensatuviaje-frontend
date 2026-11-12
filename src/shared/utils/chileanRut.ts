/**
 * Validación y formateo de RUT chileno (módulo 11) en frontend.
 */

export function cleanRut(rut: string): string {
  return (rut || '').replace(/[^0-9kK]/g, '').toUpperCase();
}

export function formatRut(rut: string): string {
  const cleaned = cleanRut(rut);
  if (cleaned.length < 2) return cleaned;

  const dv = cleaned.slice(-1);
  const body = cleaned.slice(0, -1);
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${dv}`;
}

export function calculateRutDv(bodyDigits: string): string {
  const body = (bodyDigits || '').replace(/\D/g, '');
  if (!body) return '';

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  if (remainder === 11) return '0';
  if (remainder === 10) return 'K';
  return String(remainder);
}

export interface RutValidationResult {
  valid: boolean;
  cleaned: string;
  formatted: string;
  error?: string;
}

export function validateChileanRut(rut: string): RutValidationResult {
  const trimmed = (rut || '').trim();
  if (!trimmed) {
    return { valid: false, cleaned: '', formatted: '', error: 'El RUT es obligatorio' };
  }

  const cleaned = cleanRut(trimmed);
  if (cleaned.length < 7 || cleaned.length > 9) {
    return {
      valid: false,
      cleaned,
      formatted: trimmed,
      error: 'El RUT debe tener entre 7 y 9 caracteres válidos'
    };
  }

  const body = cleaned.slice(0, -1);
  const providedDv = cleaned.slice(-1);

  if (!/^\d+$/.test(body)) {
    return { valid: false, cleaned, formatted: trimmed, error: 'Cuerpo del RUT inválido' };
  }

  if (parseInt(body, 10) < 1000000 || /^(\d)\1+$/.test(body)) {
    return { valid: false, cleaned, formatted: trimmed, error: 'RUT inválido' };
  }

  const expectedDv = calculateRutDv(body);
  if (providedDv !== expectedDv) {
    return {
      valid: false,
      cleaned,
      formatted: trimmed,
      error: 'Dígito verificador incorrecto (verifica el guión y dígito final)'
    };
  }

  return {
    valid: true,
    cleaned,
    formatted: formatRut(cleaned)
  };
}

