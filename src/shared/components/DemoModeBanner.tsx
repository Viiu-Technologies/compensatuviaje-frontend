import React, { useEffect, useRef } from 'react';
import { useSiteConfig } from '../services/siteConfig';

/**
 * Aviso de modo demostración en todas las páginas (DEMO_MODE en el backend).
 *
 * Una sola fila (dos en celular), en el flujo de la página y no fija: no se apila
 * con los menús fijos y se va al hacer scroll. No se puede cerrar: mientras el
 * sitio sea una demostración, quien llegue a cualquier página tiene que saberlo.
 *
 * Publica su altura en --ctv-demo-h y marca <html data-demo-mode> para que el
 * encabezado fijo de las páginas públicas no lo tape (ver Header.css).
 */
const DemoModeBanner: React.FC = () => {
  const config = useSiteConfig();
  const ref = useRef<HTMLElement>(null);
  const active = Boolean(config?.demoMode);

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
      aria-label="Modo demostración"
      className="relative bg-amber-100 text-amber-950 border-b border-amber-300 text-center text-sm leading-snug dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800"
      // En línea: el reset global de index.css anula p-* fuera de .tw-spacing (portada incluida).
      style={{ padding: '0.5rem 1rem' }}
    >
      <strong>Sitio en modo demostración:</strong> los pagos se hacen con tarjetas de prueba y los certificados no tienen
      validez.
    </aside>
  );
};

export default DemoModeBanner;
