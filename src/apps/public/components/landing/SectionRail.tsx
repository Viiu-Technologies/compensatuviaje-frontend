import { useEffect, useRef, useState } from 'react';
import { scrollToSection } from '../DeferredSection';
import { fmt, useFlight } from '../howItWorks/flight';
import './SectionRail.css';

/**
 * Riel lateral de la landing (solo en pantallas anchas): el hilo que une las
 * secciones después del hero. Muestra en qué tramo del recorrido estás, deja
 * saltar a cualquiera y lleva al pie el dato que cuenta toda la página: los
 * kg CO₂e del vuelo de la calculadora (o del ejemplo, y lo dice).
 *
 * Aparece cuando el centro de la pantalla está dentro de una de sus secciones;
 * sobre el hero y el pie se oculta.
 *
 * El riel cruza los cortes entre secciones claras y oscuras, así que cada pieza
 * (cada parada, la línea, el dato) toma el tono de la sección que tiene debajo
 * en ese momento, no el de la sección activa.
 */

const STOPS = [
  { id: 'como-funciona', label: 'Medir', dark: false },
  { id: 'verificar', label: 'Verificar', dark: true },
  { id: 'proyectos', label: 'Proyectos', dark: false },
  { id: 'entorno-verde', label: 'Regenerar', dark: true },
  { id: 'empresas', label: 'Empresas', dark: false },
  { id: 'faq', label: 'Preguntas', dark: false },
] as const;

/** Debe coincidir con la media query que muestra el riel en SectionRail.css. */
const SHOWN_QUERY = '(min-width: 1400px) and (min-height: 640px)';

const SectionRail = () => {
  const flight = useFlight();
  // -1: fuera del recorrido (hero o pie).
  const [active, setActive] = useState(-1);
  const fill = useRef<HTMLSpanElement>(null);
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const vh = window.innerHeight;
      const mid = vh / 2;
      const rects = STOPS.map((stop) => document.getElementById(stop.id)?.getBoundingClientRect());
      let index = -1;
      let within = 0;
      rects.forEach((rect, i) => {
        if (!rect || rect.top > mid || rect.bottom <= mid) return;
        index = i;
        within = (mid - rect.top) / rect.height;
      });
      // Al final se retira antes de que el pie llegue a la altura del dato.
      const last = rects[rects.length - 1];
      if (last && last.bottom < vh * 0.82) index = -1;
      setActive(index);

      // Tono de cada pieza según la sección que tiene debajo.
      nav.current?.querySelectorAll<HTMLElement>('[data-tone]').forEach((piece) => {
        const box = piece.getBoundingClientRect();
        const y = box.top + box.height / 2;
        const under = rects.findIndex((rect) => rect && rect.top <= y && rect.bottom > y);
        const tone = under >= 0 && STOPS[under].dark ? 'dark' : 'light';
        if (piece.dataset.tone !== tone) piece.dataset.tone = tone;
      });
      // El avance va directo al estilo: cambia en cada cuadro y no debe renderizar.
      if (fill.current && index >= 0) {
        fill.current.style.transform = `scaleY(${(index + within) / STOPS.length})`;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    // Solo mide donde el riel se muestra: en móvil y tablet no hay listener de
    // scroll ni lecturas de posición en cada cuadro.
    const shown = window.matchMedia(SHOWN_QUERY);
    const sync = () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (!shown.matches) return;
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      measure();
    };
    sync();
    shown.addEventListener('change', sync);
    return () => {
      cancelAnimationFrame(frame);
      shown.removeEventListener('change', sync);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  const visible = active >= 0;

  return (
    <nav
      ref={nav}
      className={`sec-rail ${visible ? 'sec-rail--on' : ''}`}
      aria-label="Secciones de la página"
      // Oculto no debe recibir foco ni anunciarse.
      inert={!visible}
    >
      <div className="sec-rail__track">
        <span className="sec-rail__line" data-tone="light" aria-hidden="true">
          <span ref={fill} className="sec-rail__fill" />
        </span>
        <ol className="sec-rail__stops">
        {STOPS.map((stop, i) => (
          <li key={stop.id} data-tone="light">
            <button
              type="button"
              className="sec-rail__stop"
              aria-current={i === active ? 'step' : undefined}
              data-passed={i < active || undefined}
              onClick={() => scrollToSection(stop.id)}
            >
              <span className="sec-rail__dot" aria-hidden="true" />
              <span className="sec-rail__label">{stop.label}</span>
            </button>
          </li>
        ))}
        </ol>
      </div>

      <p className="sec-rail__readout" data-tone="light">
        <span className="sec-rail__readout-tag">{flight.example ? 'Ejemplo' : 'Tu vuelo'}</span>
        <span className="sec-rail__readout-value">{fmt.kgNumber(flight.kg)}</span>
        <span className="sec-rail__readout-unit">kg CO₂e</span>
      </p>
    </nav>
  );
};

export default SectionRail;
