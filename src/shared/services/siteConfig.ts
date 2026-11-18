/**
 * Configuración pública del sitio que decide el backend (GET /public/config/payments):
 * ambiente de Webpay y modo demostración. Se pide una sola vez por carga de página.
 *
 * El último valor se recuerda en localStorage para pintar el aviso de demostración
 * desde el primer render en las visitas siguientes, sin que el contenido salte.
 */
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_API_URL || 'http://localhost:3001/api';
const STORAGE_KEY = 'ctv:site-config';

export interface SiteConfig {
  webpayEnvironment: 'production' | 'integration';
  demoMode: boolean;
}

function isLocalhost(): boolean {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

function readStored(): SiteConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return { webpayEnvironment: v.webpayEnvironment === 'production' ? 'production' : 'integration', demoMode: v.demoMode === true };
  } catch {
    return null;
  }
}

/** Ante un error, se asume producción y sin demostración, salvo en localhost (pruebas). */
const FALLBACK = (): SiteConfig => ({ webpayEnvironment: isLocalhost() ? 'integration' : 'production', demoMode: false });

let cached: Promise<SiteConfig> | null = null;

export function fetchSiteConfig(): Promise<SiteConfig> {
  if (!cached) {
    cached = fetch(`${API_URL}/public/config/payments`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((body) => {
        const config: SiteConfig = {
          webpayEnvironment: body?.data?.webpayEnvironment === 'integration' ? 'integration' : 'production',
          demoMode: body?.data?.demoMode === true,
        };
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch { /* sin almacenamiento */ }
        return config;
      })
      .catch(() => readStored() ?? FALLBACK());
  }
  return cached;
}

/** Devuelve null hasta conocer el valor (salvo que haya uno recordado). */
export function useSiteConfig(): SiteConfig | null {
  const [config, setConfig] = useState<SiteConfig | null>(() => readStored());
  useEffect(() => {
    let alive = true;
    fetchSiteConfig().then((v) => { if (alive) setConfig(v); });
    return () => { alive = false; };
  }, []);
  return config;
}
