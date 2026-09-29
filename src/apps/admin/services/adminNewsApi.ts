// ============================================
// Módulo de Noticias — API de administración
//
// El interceptor de `api` ya extrae response.data, así que lo que devuelve
// cada llamada es directamente {success, data, ...}.
// ============================================

import api from '../../../shared/services/api';
import type {
  AdminNewsArticle,
  AdminNewsArticleDetail,
  AdminNewsSourceFull,
  NewsListResponse,
  NewsStats,
  NewsHealth,
  NewsCampaign,
  CampaignMetrics,
  SubscriberStats,
  NewsStatus,
} from '../../../types/news.types';

const BASE = '/admin/news';

// ── Cola de revisión ─────────────────────────────────────────────────

export interface QueueParams {
  status?: NewsStatus | 'all';
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

/** Cola ordenada por importancia y luego recencia. */
export const getQueue = async (params?: QueueParams) =>
  api.get(`${BASE}/queue`, { params }) as unknown as Promise<
    NewsListResponse<AdminNewsArticle>
  >;

export const getArticle = async (id: string) =>
  api.get(`${BASE}/articles/${id}`) as unknown as Promise<{
    success: boolean;
    data: AdminNewsArticleDetail;
  }>;

export interface ArticlePatch {
  title?: string;
  summary?: string;
  whyItMatters?: string;
  keyPoints?: string[];
  categories?: string[];
  countries?: string[];
  importance?: number;
}

export const updateArticle = async (id: string, patch: ArticlePatch) =>
  api.patch(`${BASE}/articles/${id}`, patch);

export const approveArticle = async (id: string) =>
  api.post(`${BASE}/articles/${id}/approve`);

/** El motivo es obligatorio: el backend devuelve 400 si falta. */
export const rejectArticle = async (id: string, reason: string) =>
  api.post(`${BASE}/articles/${id}/reject`, { reason });

/** Exige que el artículo esté aprobado; si no, 409. */
export const publishArticle = async (id: string) =>
  api.post(`${BASE}/articles/${id}/publish`);

export const archiveArticle = async (id: string) =>
  api.post(`${BASE}/articles/${id}/archive`);

/** Encola el trabajo (202). El backend no regenera en el request. */
export const regenerateImage = async (id: string) =>
  api.post(`${BASE}/articles/${id}/regenerate-image`);

// ── Fuentes ──────────────────────────────────────────────────────────

export const getSources = async () =>
  api.get(`${BASE}/sources`) as unknown as Promise<{
    success: boolean;
    data: AdminNewsSourceFull[];
  }>;

export const createSource = async (data: {
  name: string;
  domain: string;
  kind?: string;
  feedUrl?: string;
  listUrl?: string;
  country?: string;
  trustScore?: number;
}) => api.post(`${BASE}/sources`, data);

export const updateSource = async (
  id: string,
  data: Partial<Pick<AdminNewsSourceFull, 'name' | 'feedUrl' | 'trustScore' | 'active' | 'extractor'>>
) => api.patch(`${BASE}/sources/${id}`, data);

/** Encola un descubrimiento inmediato (202). */
export const testSource = async (id: string) => api.post(`${BASE}/sources/${id}/test`);

// ── Estadísticas y salud ─────────────────────────────────────────────

export const getStats = async () =>
  api.get(`${BASE}/stats`) as unknown as Promise<{ success: boolean; data: NewsStats }>;

export const getHealth = async () =>
  api.get(`${BASE}/health`) as unknown as Promise<{ success: boolean; data: NewsHealth }>;

// ── Campañas ─────────────────────────────────────────────────────────

export const getCampaigns = async (params?: { status?: string; limit?: number }) =>
  api.get(`${BASE}/campaigns`, { params }) as unknown as Promise<{
    success: boolean;
    data: NewsCampaign[];
  }>;

/** Solo acepta artículos ya publicados; si no, 400. */
export const createCampaign = async (data: {
  name?: string;
  subject: string;
  preheader?: string;
  articleIds: string[];
}) => api.post(`${BASE}/campaigns`, data);

export const approveCampaign = async (id: string) =>
  api.post(`${BASE}/campaigns/${id}/approve`);

export const cancelCampaign = async (id: string) =>
  api.post(`${BASE}/campaigns/${id}/cancel`);

/** Encola el envío (202). Respeta el tope diario del proveedor. */
export const sendCampaign = async (id: string) => api.post(`${BASE}/campaigns/${id}/send`);

export const getCampaignMetrics = async (id: string) =>
  api.get(`${BASE}/campaigns/${id}/metrics`) as unknown as Promise<{
    success: boolean;
    data: CampaignMetrics;
  }>;

export const getSubscriberStats = async () =>
  api.get(`${BASE}/subscribers/stats`) as unknown as Promise<{
    success: boolean;
    data: SubscriberStats;
  }>;

export default {
  getQueue,
  getArticle,
  updateArticle,
  approveArticle,
  rejectArticle,
  publishArticle,
  archiveArticle,
  regenerateImage,
  getSources,
  createSource,
  updateSource,
  testSource,
  getStats,
  getHealth,
  getCampaigns,
  createCampaign,
  approveCampaign,
  cancelCampaign,
  sendCampaign,
  getCampaignMetrics,
  getSubscriberStats,
};
