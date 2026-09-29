// ============================================
// Módulo de Noticias — tipos
//
// Dos formas del mismo artículo, deliberadamente distintas:
//
//   NewsArticle       — lo que ve el público. Solo contenido propio.
//   AdminNewsArticle  — lo que ve el revisor. Incluye la evidencia de
//                       verificación y los scores internos.
//
// El backend nunca expone los campos de admin en las rutas públicas.
// ============================================

export interface NewsPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface NewsListResponse<T> {
  success: boolean;
  data: T[];
  pagination: NewsPagination;
}

export interface NewsCategory {
  slug: string;
  label: string;
}

/** Imagen del artículo. `aiGenerated` decide si se muestra la etiqueta. */
export interface NewsImage {
  url: string;
  aiGenerated: boolean;
}

export interface NewsSourceRef {
  name: string | null;
  /** Enlace al medio original. Siempre con rel="nofollow noopener". */
  url: string;
}

// ── Público ──────────────────────────────────────────────────────────

export interface NewsArticle {
  slug: string;
  title: string;
  summary: string | null;
  keyPoints: string[];
  /** Lectura sectorial propia: lo único que no está en la fuente original. */
  whyItMatters: string | null;
  categories: string[];
  countries: string[];
  image: NewsImage | null;
  publishedAt: string | null;
  source: NewsSourceRef;
}

export interface NewsArticleDetail extends NewsArticle {
  related: NewsArticle[];
}

// ── Admin ────────────────────────────────────────────────────────────

export type NewsStatus = 'pending' | 'approved' | 'rejected' | 'published' | 'archived';

/** Campo extraído con la cita literal que lo respalda. */
export interface AnchoredField {
  valor: string | null;
  span: string | null;
  /** Valor que el verificador anuló por no encontrar respaldo textual. */
  _rejected?: string;
}

export interface VerificationInfo {
  comprobados: number;
  respaldados: number;
  anclaje: number;
  rechazados: Array<{ campo: string; valor: unknown; span: string | null }>;
}

export interface ExtractionSpans {
  fecha_publicacion?: AnchoredField;
  fecha_vigencia?: AnchoredField;
  organismo?: AnchoredField;
  empresas?: AnchoredField[];
  _verificacion?: VerificationInfo;
}

export interface AdminNewsSource {
  id: string;
  name: string;
  domain: string;
  trustScore: number;
}

export interface AdminNewsArticle {
  id: string;
  slug: string | null;
  title: string;
  /** Titular del medio. El publicado es `title`, redactado por nosotros. */
  originalTitle: string | null;
  url: string;
  summary: string | null;
  whyItMatters: string | null;
  keyPoints: string[] | null;
  categories: string[];
  countries: string[];
  importance: number | null;
  affectsTransport: boolean | null;
  isRegulatory: boolean | null;
  /** 0-1. Combina anclaje textual, confianza en la fuente y corroboración. */
  confidenceScore: number | null;
  /** true si la confianza está por debajo de 0,6: leer con más atención. */
  needsReview: boolean;
  contentSource: 'full' | 'feed_only' | null;
  imageUrl: string | null;
  imageSource: 'generated' | 'template' | 'none' | null;
  status: NewsStatus;
  rejectionReason: string | null;
  publishedAt: string | null;
  discoveredAt: string;
  publishedAtSite: string | null;
  modelId: string | null;
  promptVersion: string | null;
  source: AdminNewsSource | null;
}

export interface AdminNewsArticleDetail extends AdminNewsArticle {
  extractionSpans: ExtractionSpans | null;
  /** Cuántas otras fuentes publicaron la misma noticia. */
  replicatedBy: number;
}

export interface AdminNewsSourceFull {
  id: string;
  name: string;
  domain: string;
  kind: string;
  feedUrl: string | null;
  listUrl: string | null;
  extractor: string;
  country: string | null;
  language: string;
  trustScore: number;
  active: boolean;
  lastSuccessAt: string | null;
  lastError: string | null;
  consecutiveFailures: number;
}

// ── Estadísticas y salud ─────────────────────────────────────────────

export interface NewsFunnel {
  periodoDias: number;
  descubiertos: number;
  descartadosPorLexico: number;
  extraidos: number;
  fallosDeExtraccion: number;
  duplicados: number;
  descartadosPorTriage: number;
  clasificados: number;
  pendientes: number;
  aprobados: number;
  rechazados: number;
  publicados: number;
}

export interface LlmCostStep {
  paso: string;
  llamadas: number;
  costoUsd: number;
  tokensEntrada: number;
  tokensSalida: number;
  latenciaMediaMs: number;
}

export interface NewsStats {
  embudo: NewsFunnel;
  costoLlm: {
    periodoDias: number;
    porPaso: LlmCostStep[];
    totalUsd: number;
    llamadas: number;
    tasaExito: number | null;
  };
  porEstado: Record<string, number>;
  confianzaMedia: number | null;
  tasaAprobacion: number | null;
}

export interface NewsAlert {
  nivel: 'warning' | 'critical';
  tipo: string;
  mensaje: string;
  detalle?: string[];
}

export interface NewsHealth {
  estado: 'ok' | 'warning' | 'critical';
  moduloHabilitado: boolean;
  aislamientoCredenciales: boolean;
  fuentes: { activas: number; totales: number; sinResultados: number };
  cola: Record<string, number>;
  revisionPendiente: number;
  gasto24hUsd: number;
  presupuestoDiarioUsd: number;
  alertas: NewsAlert[];
}

// ── Campañas ─────────────────────────────────────────────────────────

export type CampaignStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'sending'
  | 'sent'
  | 'cancelled';

export interface NewsCampaign {
  id: string;
  name: string;
  kind: string;
  subject: string;
  status: CampaignStatus;
  recipientCount: number | null;
  approvedAt: string | null;
  sentAt: string | null;
  createdAt: string;
  articleIds: string[];
}

export interface CampaignMetrics {
  sent?: number;
  delivered?: number;
  open?: number;
  click?: number;
  bounce?: number;
  complaint?: number;
  tasaApertura: number | null;
  tasaClic: number | null;
  tasaRebote: number | null;
}

export interface SubscriberStats {
  total: number;
  elegibles: number;
  sinConfirmar: number;
  bajas: number;
  suprimidos: number;
}
