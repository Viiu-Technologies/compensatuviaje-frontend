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

export const PARTNER_STATUS: Record<string, { label: string; tone: StatusTone }> = {
  active: { label: 'Activo', tone: 'success' },
  onboarding: { label: 'En incorporación', tone: 'warning' },
  suspended: { label: 'Suspendido', tone: 'danger' },
  inactive: { label: 'Inactivo', tone: 'neutral' },
};

export const partnerStatus = (s?: string | null) =>
  (s && PARTNER_STATUS[s]) || { label: s || 'Sin estado', tone: 'neutral' as StatusTone };

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  reforestation: 'Reforestación',
  conservation: 'Conservación',
  clean_water: 'Agua limpia',
  water_security: 'Seguridad hídrica',
  circular_economy: 'Economía circular',
  waste_management: 'Gestión de residuos',
  energy_efficiency: 'Eficiencia energética',
  social_housing: 'Vivienda social',
  community_development: 'Desarrollo comunitario',
  renewable_energy: 'Energía renovable',
  biodiversity: 'Biodiversidad',
  other: 'Otro',
};

export const projectTypeLabel = (key?: string | null) => (key ? PROJECT_TYPE_LABELS[key] ?? key : '—');

export const PROJECT_STATUS: Record<string, { label: string; tone: StatusTone }> = {
  draft: { label: 'Borrador', tone: 'neutral' },
  pending_review: { label: 'Por revisar', tone: 'warning' },
  approved: { label: 'Aprobado', tone: 'info' },
  published: { label: 'Publicado', tone: 'success' },
  rejected: { label: 'Rechazado', tone: 'danger' },
  suspended: { label: 'Suspendido', tone: 'danger' },
};

export const projectStatus = (s?: string | null) =>
  (s && PROJECT_STATUS[s]) || { label: s || 'Sin estado', tone: 'neutral' as StatusTone };
