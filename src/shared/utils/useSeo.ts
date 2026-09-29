import { useEffect } from 'react';
import { LEGAL } from '../config/legal';

interface SeoOptions {
  title: string;
  description?: string;
  /** Ruta canónica (ej. '/terminos'). Por defecto, la ruta actual sin query. */
  path?: string;
  noindex?: boolean;
}

const DEFAULT_DESCRIPTION =
  'Calcula y compensa la huella de carbono de tus viajes con proyectos verificados. Certificado digital verificable para personas y empresas.';

/** Crea o actualiza un <meta>/<link> del <head> identificado por un atributo. */
function upsert(tag: 'meta' | 'link', key: string, keyValue: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLElement>(`${tag}[${key}="${keyValue}"]`);
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(key, keyValue);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

/**
 * Title, description, canonical, Open Graph y robots por página.
 *
 * El sitio es una SPA: el HTML inicial es el mismo para todas las rutas, así
 * que sin esto Google (que sí ejecuta JS) ve el mismo título en todas las
 * páginas. Los crawlers que no ejecutan JS (LinkedIn, WhatsApp) siguen viendo
 * los valores por defecto de index.html.
 */
export function useSeo({ title, description = DEFAULT_DESCRIPTION, path, noindex = false }: SeoOptions) {
  useEffect(() => {
    const fullTitle = title.includes(LEGAL.brand) ? title : `${title} | ${LEGAL.brand}`;
    const url = LEGAL.site + (path ?? window.location.pathname);

    document.title = fullTitle;
    upsert('meta', 'name', 'description', { content: description });
    upsert('meta', 'name', 'robots', { content: noindex ? 'noindex, nofollow' : 'index, follow' });
    upsert('link', 'rel', 'canonical', { href: url });
    upsert('meta', 'property', 'og:title', { content: fullTitle });
    upsert('meta', 'property', 'og:description', { content: description });
    upsert('meta', 'property', 'og:url', { content: url });
  }, [title, description, path, noindex]);
}
