import React, { useRef, useState, useEffect, lazy, Suspense } from 'react';
import { HiGlobeAlt } from 'react-icons/hi';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import './HeroGlobe.css';

/**
 * La escena 3D (three.js + @react-three/fiber + drei, ~240 KB comprimidos y
 * ~2 s de CPU en un móvil medio) ya no se descarga al montar el Hero: primero
 * se ve una imagen fija del mismo globo, en su pose inicial, y la escena se
 * carga cuando el navegador queda libre después de la carga, o antes si la
 * persona toca o pasa el puntero por el globo. Cuando la escena pinta su
 * primer cuadro, la imagen se funde.
 */
const GlobeScene = lazy(() => import('./GlobeScene'));

/** Imagen fija: captura del globo en su pose inicial (sin rotación). */
const POSTER = '/images/hero-globe-poster.webp';

/** Espera a que la página termine de cargar y el hilo principal quede libre. */
function whenIdle(run: () => void) {
  let cancelled = false;
  let idleId = 0;
  let timer = 0;
  const go = () => {
    if (cancelled) return;
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (ric) idleId = ric(() => !cancelled && run(), { timeout: 2500 });
    else timer = window.setTimeout(() => !cancelled && run(), 1200);
  };
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener('load', go);
    const cic = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
    if (idleId && cic) cic(idleId);
    clearTimeout(timer);
  };
}

export const HeroGlobe: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [wanted, setWanted] = useState(false);
  const [ready, setReady] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Pausar el render loop cuando el globo sale de pantalla.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Cargar la escena cuando el navegador quede libre.
  useEffect(() => (wanted ? undefined : whenIdle(() => setWanted(true))), [wanted]);

  const wake = () => setWanted(true);

  return (
    <div
      ref={containerRef}
      className="hero-globe-wrap"
      onPointerEnter={wake}
      onPointerDown={wake}
      onFocus={wake}
    >
      {/* Halo y resplandor decorativo de fondo */}
      <div className="hero-globe-halo" aria-hidden="true" />

      {/* Badge flotante */}
      <div className="hero-globe-badge">
        <span className="hero-globe-badge__dot" />
        <HiGlobeAlt className="hero-globe-badge__icon" />
        <span>Rutas aéreas desde Santiago</span>
      </div>

      <div className={`hero-globe-canvas-box${ready ? ' is-ready' : ''}`}>
        <img
          className="hero-globe-poster"
          src={POSTER}
          alt=""
          aria-hidden="true"
          width={640}
          height={640}
          decoding="async"
          fetchPriority="low"
        />
        {wanted && (
          <Suspense fallback={null}>
            <GlobeScene active={isVisible} autoRotate={!prefersReducedMotion} onReady={() => setReady(true)} />
          </Suspense>
        )}
      </div>

      {/* Chip informativo inferior */}
      <div className="hero-globe-caption">
        <span className="hero-globe-caption__route">SCL ✈ MAD</span>
        <span className="hero-globe-caption__sep">·</span>
        <span className="hero-globe-caption__val">Ruta de ejemplo</span>
      </div>
    </div>
  );
};

export default HeroGlobe;
