import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteConfig } from '../services/siteConfig';

/**
 * Rutas donde el modo demostración importa: pagar y ver o verificar un
 * certificado. En la portada y los paneles el aviso solo estorba; ahí ya avisan
 * el PDF, el correo y el verificador del certificado.
 */
const DEMO_NOTICE_ROUTES = [
  '/b2c/projects', // único punto de pago B2C (Webpay)
  '/b2c/payment-result',
  '/b2c/certificates',
  '/b2c/nft-certificates',
  '/verify/',
  '/verificar/',
];

export function isDemoNoticeRoute(pathname: string): boolean {
  return DEMO_NOTICE_ROUTES.some((r) => (r.endsWith('/') ? pathname.startsWith(r) : pathname === r || pathname.startsWith(`${r}/`)));
}

/**
 * Aviso de modo demostración (DEMO_MODE en el backend), solo en las rutas de
 * pago y certificados (DEMO_NOTICE_ROUTES).
 *
 * Una sola fila (dos en celular), en el flujo de la página y no fija: no se apila
 * con los menús fijos y se va al hacer scroll. No se puede cerrar: quien paga o
 * mira un certificado tiene que saber que es una demostración.
 *
 * Publica su altura en --ctv-demo-h y marca <html data-demo-mode> para que el
 * encabezado fijo de las páginas públicas no lo tape (ver Header.css).
 */
const DemoModeBanner: React.FC = () => {
  const config = useSiteConfig();
  const { pathname } = useLocation();
  const ref = useRef<HTMLElement>(null);
  const active = Boolean(config?.demoMode) && isDemoNoticeRoute(pathname);

  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (!active || !el) return;
    root.setAttribute('data-demo-mode', '');
    const update = () => root.style.setProperty('--ctv-demo-h', `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.removeAttribute('data-demo-mode');
      root.style.removeProperty('--ctv-demo-h');
    };
  }, [active]);

  if (!active) return null;

  return (
    <aside
      ref={ref}
      aria-label="Acceso anticipado"
      className="relative bg-amber-100 text-amber-950 border-b border-amber-300 text-center text-sm leading-snug dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800"
      // En línea: el reset global de index.css anula p-* fuera de .tw-spacing (portada incluida).
      style={{ padding: '0.5rem 1rem' }}
    >
      <strong>Acceso anticipado:</strong> estás usando CompensaTuViaje antes de su apertura. Los pagos se hacen con
      tarjetas de prueba y los certificados todavía no tienen validez.
    </aside>
  );
};

/**
 * El mismo aviso dentro de una vista que no tiene ruta propia (p. ej. los
 * certificados del panel B2B, que viven bajo /b2b/dashboard).
 */
export const DemoModeNotice: React.FC = () => {
  const config = useSiteConfig();
  if (!config?.demoMode) return null;
  return (
    <p
      role="note"
      className="m-0 rounded-lg bg-amber-50 text-amber-950 border border-amber-200 text-sm leading-snug dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800"
      style={{ padding: '0.5rem 0.75rem' }}
    >
      <strong>Acceso anticipado:</strong> estos certificados se emitieron con pagos de prueba y todavía no tienen validez.
    </p>
  );
};

export default DemoModeBanner;
