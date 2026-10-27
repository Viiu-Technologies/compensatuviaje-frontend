import React, { Suspense, useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from '../hooks/useGsapReveal';
import { getSectionScroller, getSmoothScroller, scrollToY } from '../hooks/smoothScroll';
import './DeferredSection.css';

/**
 * Monta una sección del landing solo cuando se acerca a la pantalla.
 *
 * Antes todas las secciones (cómo funciona, bosque, proyectos, empresas,
 * verificar, FAQ, pie) se montaban al cargar, y calcular el estilo y el diseño
 * de la página entera era la mayor parte del bloqueo inicial en móviles. Hasta
 * que se monta, un espacio reservado ocupa un alto parecido al real (medido por
 * ancho de pantalla) y lleva el mismo id del ancla, para que los enlaces
 * #proyectos, #faq… sigan teniendo destino.
 */

const REVEAL_EVENT = 'ctv:reveal-sections';

/** Monta de inmediato todas las secciones diferidas (antes de saltar a un ancla). */
export function revealSections() {
  window.dispatchEvent(new Event(REVEAL_EVENT));
}

/**
 * Lleva a una sección del landing. Monta antes las diferidas, para que las que
 * quedan por encima tengan su alto real, y vuelve a apuntar al destino cuando
 * su código terminó de cargar.
 */
export function scrollToSection(id: string, behavior: ScrollBehavior = 'smooth') {
  revealSections();
  const go = (how: ScrollBehavior) => {
    // Anclas con camino propio (la calculadora dentro del hero pinneado). Se
    // busca en cada intento: el hero registra el suyo después de su primer cuadro.
    const custom = getSectionScroller(id);
    if (custom) return custom(how);
    const el = document.getElementById(id);
    if (!el) return;
    // Con Lenis activo, scrollIntoView suave compite con su propio bucle.
    if (getSmoothScroller()) scrollToY(el.getBoundingClientRect().top + window.scrollY, how);
    else el.scrollIntoView({ behavior: how });
  };
  requestAnimationFrame(() => requestAnimationFrame(() => go(behavior)));
  window.setTimeout(() => go(behavior), 700);
}

let refreshTimer = 0;
/** Las posiciones de ScrollTrigger dependen del alto de lo que hay arriba. */
const refreshScrollTriggers = () => {
  clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
};

interface Props {
  /** El id del ancla que lleva la sección real (si tiene una). */
  id?: string;
  /** Alto aproximado del espacio reservado: [móvil, tablet ≥640, escritorio ≥1024], en px. */
  heights: [number, number, number];
  children: React.ReactNode;
}

export const DeferredSection: React.FC<Props> = ({ id, heights, children }) => {
  const holder = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const reveal = () => setMounted(true);
    window.addEventListener(REVEAL_EVENT, reveal);
    const el = holder.current;
    // Sin IntersectionObserver (navegadores muy viejos): se monta de una vez.
    if (!el || typeof IntersectionObserver === 'undefined') {
      reveal();
      return () => window.removeEventListener(REVEAL_EVENT, reveal);
    }
    // Un margen de ~1,5 pantallas: el código se descarga antes de llegar.
    const io = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) reveal();
    }, { rootMargin: '1400px 0px' });
    io.observe(el);
    return () => {
      io.disconnect();
      window.removeEventListener(REVEAL_EVENT, reveal);
    };
  }, [mounted]);

  useEffect(() => {
    if (mounted) refreshScrollTriggers();
  }, [mounted]);

  const style = {
    '--deferred-h-mobile': `${heights[0]}px`,
    '--deferred-h-tablet': `${heights[1]}px`,
    '--deferred-h-desktop': `${heights[2]}px`,
  } as React.CSSProperties;
  // El mismo espacio reservado sirve mientras se descarga el código de la
  // sección: si Suspense no mostrara nada, la página se encogería y saltaría.
  const placeholder = <div ref={holder} id={id} className="ctv-deferred" style={style} aria-hidden="true" />;

  return mounted ? <Suspense fallback={placeholder}>{children}</Suspense> : placeholder;
};

export default DeferredSection;
