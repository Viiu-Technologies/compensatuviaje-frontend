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

/** Unidad de impacto del proyecto en singular: 'tree' -> 'árbol'. */
export const UNIT_LABELS: Record<string, string> = {
  tree: 'árbol',
  trees: 'árbol',
  arbol: 'árbol',
  árbol: 'árbol',
  panel: 'panel',
  panels: 'panel',
  m2: 'm²',
  m3: 'm³',
  ha: 'hectárea',
  hectare: 'hectárea',
  other: 'unidad de impacto',
};

export const unitLabel = (u?: string) => (u ? UNIT_LABELS[u.trim().toLowerCase()] ?? u : 'unidad');

/** Plural de la unidad según la cantidad: 1 árbol, 12 árboles, 3 m³. */
export const unitPlural = (u: string | undefined, n: number | null | undefined) => {
  const s = unitLabel(u);
  if (n === 1 || /[²³]$/.test(s)) return s;
  const last = s.split(' ');
  const w = last[0];
  last[0] = /[aeiouáéó]$/i.test(w) ? `${w}s` : `${w}es`;
  return last.join(' ');
};

/** "2026-09" -> "septiembre de 2026". Si no calza el formato, se deja igual. */
export const monthLabel = (ym?: string | null) => {
  if (!ym) return '—';
  const m = /^(\d{4})-(\d{2})$/.exec(ym);
  if (!m) return ym;
  return new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
};
