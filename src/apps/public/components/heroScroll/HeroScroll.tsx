import React, { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from '../../hooks/useGsapReveal';
import type { EstimateResponse } from '../../services/publicApi';
import type { CabinCode } from '../QuickFlightCalculator';
import QuickFlightCalculator from '../QuickFlightCalculator';
import { flightFromEstimate, setFlight } from '../howItWorks/flight';
import CloudWordmark from './CloudWordmark';
import Mountains from './Mountains';
import Plane from './Plane';
import RouteArc from './RouteArc';
import { MOBILE_QUERY } from './heroScrollConfig';
import { setupHeroMotion, setupHeroReduced } from './heroTimeline';
import './HeroScroll.css';

/**
 * HeroScroll — hero de la landing con scroll pinneado.
 *
 * Un avión atraviesa el wordmark envuelto en bruma, su estela se vuelve la
 * ruta del vuelo y el recorrido termina en la calculadora (emisión → medición).
 * Los tiempos de cada escena están en heroScrollConfig.ts.
 *
 * Sin JavaScript el marcado ya es una página completa: el cielo con el
 * wordmark y, debajo, el titular con la calculadora. La animación se monta
 * encima (clase hs--motion); con prefers-reduced-motion se muestra directo la
 * composición final (hs--reduced).
 *
 * El número del contador y los extremos del arco salen de la misma
 * calculadora de la escena 4, vía onEstimate: no hay datos escritos a mano.
 */

const fmtKg = (n: number) => n.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const HeroScroll: React.FC = () => {
  const rootRef = useRef<HTMLElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const kgRef = useRef<number | null>(null);
  const countProgressRef = useRef(0);
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null);
  // Cambia cuando cambia el ancho de la ventana: la geometría del vuelo se recalcula.
  const [layoutKey, setLayoutKey] = useState(0);

  // El texto del contador lo escribe este componente, no React: así un
  // re-render no lo pisa mientras la animación avanza.
  const paintCount = useCallback(() => {
    const el = countRef.current;
    if (!el) return;
    const kg = kgRef.current;
    el.textContent = kg === null ? '—' : fmtKg(kg * countProgressRef.current);
  }, []);

  const handleEstimate = useCallback(
    (data: EstimateResponse, request: { cabinCode: CabinCode }) => {
      setEstimate(data);
      // "Cómo funciona" cuenta este mismo vuelo (si cabe en su mapa).
      setFlight(flightFromEstimate(data, request.cabinCode));
      kgRef.current = data.emissions?.kgCO2e ?? null;
      paintCount();
    },
    [paintCount],
  );

  useEffect(() => {
    let width = window.innerWidth;
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        // Solo el ancho: en móvil el alto cambia al mostrarse u ocultarse la barra del navegador.
        if (window.innerWidth === width) return;
        width = window.innerWidth;
        setLayoutKey((key) => key + 1);
      }, 200);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let mm: gsap.MatchMedia | null = null;
    const build = () => {
      mm = gsap.matchMedia(root);
      mm.add(
        {
          // Con condiciones, matchMedia solo llama a la función si alguna se
          // cumple: motion y reduce cubren todos los casos.
          mobile: MOBILE_QUERY,
          motion: '(prefers-reduced-motion: no-preference)',
          reduce: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { mobile, motion } = context.conditions as { mobile: boolean; motion: boolean };
          if (!motion) return setupHeroReduced(root, { mobile });
          return setupHeroMotion(root, {
            mobile,
            onCount: (progress) => {
              countProgressRef.current = progress;
              paintCount();
            },
          });
        },
      );
    };

    // La primera vez se arma después del primer cuadro: medir el layout y
    // crear el pin antes de pintar retrasaba el LCP (el wordmark) ~1 s en
    // móvil. Arriba del todo la versión estática y la animada se ven igual, así
    // que no hay salto. Al cambiar el ancho se rearma al instante.
    let frame = 0;
    if (layoutKey === 0) {
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(build);
      });
    } else {
      build();
    }
    return () => {
      cancelAnimationFrame(frame);
      mm?.revert();
    };
  }, [layoutKey, paintCount]);

  const route = estimate?.meta?.route;
  const methodology = estimate?.emissions?.methodology ?? 'DEFRA';
  const distanceKm = estimate?.meta?.distanceKmTotal;
  const tripLabel = estimate?.meta?.tripType === 'round_trip' ? 'Ida y vuelta' : 'Solo ida';

  return (
    <section ref={rootRef} className="hs" id="inicio" aria-label="Inicio">
      <div className="hs-stage">
        <div className="hs-sky" aria-hidden="true" />
        <div className="hs-night" aria-hidden="true" />
        <Mountains />

        <CloudWordmark methodology={methodology} />

        <svg className="hs-flight" aria-hidden="true" focusable="false">
          <RouteArc />
          <Plane />
        </svg>

        {/* Extremos del arco: códigos IATA y ciudad de la ruta calculada */}
        <div className="hs-label hs-label--from" aria-hidden="true">
          <strong>{route?.origin.code}</strong>
          <span>{route ? `${route.origin.city}, ${route.origin.country}` : ''}</span>
        </div>
        <div className="hs-label hs-label--to" aria-hidden="true">
          <strong>{route?.destination.code}</strong>
          <span>{route ? `${route.destination.city}, ${route.destination.country}` : ''}</span>
        </div>

        {/* Escena 3: la huella del vuelo. Decorativa: el dato accesible está en la calculadora. */}
        <div className="hs-readout" aria-hidden="true">
          <p className="hs-readout__caption">Huella de tu vuelo · {tripLabel}</p>
          <p className="hs-readout__value">
            <span ref={countRef} className="hs-readout__number">—</span>
            <span className="hs-readout__unit">kg CO₂e</span>
          </p>
          <p className="hs-readout__meta">
            {distanceKm ? `${Math.round(distanceKm).toLocaleString('es-CL')} km · ` : ''}
            factor {methodology} · GHG Protocol
          </p>
        </div>
      </div>

      {/* Escena 4: titular + calculadora real (variante compacta) */}
      <div className="hs-land">
        <div className="hs-land__inner">
          <div className="hs-land__copy">
            <p className="hs-land__eyebrow">Calculadora · {methodology} &amp; GHG Protocol</p>
            <h2 className="hs-land__title">
              Compensa la huella de cada viaje, <em>medible</em> y trazable.
            </h2>
            <p className="hs-land__lede">
              Factores oficiales, proyectos evaluados antes de recibir tu aporte y un certificado que puedes
              verificar en blockchain.
            </p>
            <ul className="hs-chips" aria-label="Estándares">
              <li>GHG Protocol</li>
              <li>{methodology}</li>
              <li>Veritas AI</li>
              <li>Polygon</li>
            </ul>
          </div>

          <div className="hs-card" id="calculadora">
            <QuickFlightCalculator variant="compact" onEstimate={handleEstimate} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroScroll;
