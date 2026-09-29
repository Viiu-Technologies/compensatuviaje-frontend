// ============================================
// Noticias públicas
//
// Reemplaza la versión anterior, que leía RSS de terceros vía rss2json desde el
// navegador y enlazaba al medio original. Ahora consume /api/news: contenido
// propio, revisado por una persona antes de publicarse.
//
// Diferencias que importan:
//   · El titular y el resumen son nuestros, no del medio.
//   · Cada ficha lleva "por qué importa" para una empresa de transporte.
//   · Hay aprobación humana antes de que algo se publique.
//   · No depende de un servicio externo en el cliente.
// ============================================

import type {
  NewsArticle,
  NewsArticleDetail,
  NewsCategory,
  NewsPagination,
} from '../../../types/news.types';

export type { NewsArticle, NewsArticleDetail, NewsCategory };

const API_URL =
  import.meta.env.VITE_APP_API_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3001/api';

interface ListResult {
  articles: NewsArticle[];
  pagination: NewsPagination | null;
}

const EMPTY: ListResult = { articles: [], pagination: null };

export interface FetchNewsParams {
  category?: string;
  country?: string;
  page?: number;
  limit?: number;
}

/**
 * Listado de noticias publicadas.
 *
 * Si la API falla devuelve lista vacía: la sección se degrada a un estado vacío
 * honesto. La versión anterior tenía artículos de relleno hardcodeados, y eso es
 * peor que no mostrar nada — el lector no distingue lo real de lo inventado.
 */
export const fetchNews = async (params: FetchNewsParams = {}): Promise<ListResult> => {
  try {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.country) query.set('country', params.country);
    if (params.page) query.set('page', String(params.page));
    query.set('limit', String(params.limit ?? 12));

    const res = await fetch(`${API_URL}/news?${query.toString()}`);
    if (!res.ok) return EMPTY;

    const json = await res.json();
    if (!json?.success) return EMPTY;

    return {
      articles: Array.isArray(json.data) ? json.data : [],
      pagination: json.pagination ?? null,
    };
  } catch {
    return EMPTY;
  }
};

/** Detalle de una noticia, con relacionadas. `null` si no existe. */
export const fetchNewsBySlug = async (slug: string): Promise<NewsArticleDetail | null> => {
  try {
    const res = await fetch(`${API_URL}/news/${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.success ? json.data : null;
  } catch {
    return null;
  }
};

export const fetchNewsCategories = async (): Promise<NewsCategory[]> => {
  try {
    const res = await fetch(`${API_URL}/news/categories`);
    if (!res.ok) return [];
    const json = await res.json();
    return json?.success && Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
};

/** Alta en el boletín. El backend responde 202 y encola la confirmación. */
export const subscribeToNewsletter = async (
  email: string,
  name?: string
): Promise<{ ok: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_URL}/news/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    const json = await res.json().catch(() => ({}));

    if (res.status === 429) {
      return { ok: false, message: 'Demasiados intentos. Prueba en unos minutos.' };
    }
    if (!res.ok) {
      return { ok: false, message: json?.message || 'No se pudo completar la suscripción' };
    }
    return {
      ok: true,
      message: json?.message || 'Revisa tu correo para confirmar la suscripción',
    };
  } catch {
    return { ok: false, message: 'No se pudo conectar. Inténtalo más tarde.' };
  }
};

/** Confirma el doble opt-in desde el enlace del correo. */
export const confirmSubscription = async (token: string) => {
  try {
    const res = await fetch(`${API_URL}/news/confirmar/${encodeURIComponent(token)}`);
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, message: json?.message || '' };
  } catch {
    return { ok: false, message: 'No se pudo conectar' };
  }
};

/** Baja de un clic. Se honra en el acto, sin pedir nada más. */
export const unsubscribeFromNewsletter = async (token: string) => {
  try {
    const res = await fetch(`${API_URL}/news/baja/${encodeURIComponent(token)}`);
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, message: json?.message || '' };
  } catch {
    return { ok: false, message: 'No se pudo conectar' };
  }
};

/** Fecha legible en español de Chile. */
export const formatNewsDate = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
};
