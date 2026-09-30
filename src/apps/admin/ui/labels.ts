import type { StatusTone } from './components';

/**
 * Nombres visibles de claves internas del backend. Compartidos por las
 * páginas del admin para no mostrar "pending_contract" o "mineria_energia".
 */

export const COMPANY_STATUS: Record<string, { label: string; tone: StatusTone }> = {
  registered: { label: 'Registrada', tone: 'neutral' },
  pending_contract: { label: 'Pendiente de contrato', tone: 'warning' },
  signed: { label: 'Contrato firmado', tone: 'info' },
  active: { label: 'Activa', tone: 'success' },
  suspended: { label: 'Suspendida', tone: 'danger' },
};

export const companyStatusLabel = (s: string) => COMPANY_STATUS[s]?.label ?? s;

export const INDUSTRY_LABELS: Record<string, string> = {
  aerolineas: 'Aerolíneas',
  maritimo: 'Transporte marítimo',
  terrestre: 'Transporte terrestre',
  mineria_energia: 'Minería y energía',
  tecnologia: 'Tecnología',
  retail: 'Retail',
  manufactura: 'Manufactura',
  construccion: 'Construcción',
  hoteleria_turismo: 'Hotelería y turismo',
  servicios_financieros: 'Servicios financieros',
  salud: 'Salud',
  educacion: 'Educación',
  alimentacion: 'Alimentación',
  telecomunicaciones: 'Telecomunicaciones',
  gobierno: 'Gobierno',
  consultoria: 'Consultoría',
  otra: 'Otra',
};

export const industryLabel = (key?: string | null) => (key ? INDUSTRY_LABELS[key] ?? key : 'Sin categoría');

export const AUTH_PROVIDER_LABELS: Record<string, string> = {
  email: 'Correo y contraseña',
  google: 'Google',
  supabase: 'Supabase',
};

export const authProviderLabel = (key?: string | null) => (key ? AUTH_PROVIDER_LABELS[key] ?? key : '—');
