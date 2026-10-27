// La landing real, montada una sola vez debajo de la cámara durante todo el
// video. Las escenas no montan UI propia: cambian el estado de la calculadora.
import React, { useLayoutEffect, useRef } from 'react';
import type { Rect } from '../camera/Camera';
import { fontsReady } from '../theme/fonts';
import { CalculatorCard, type CalculatorView } from './CalculatorCard';
import { HeroBackdrop, HeroGlobe, HeroHeadline, HeroTrustBar, StageHeader } from './Hero';

// CSS del front tal cual (una sola fuente de verdad) + adaptaciones para video.
import '../../../src/apps/public/components/landing/tokens.css';
import '../../../src/apps/public/components/Header.css';
import '../../../src/apps/public/components/Hero.css';
import '../../../src/apps/public/components/hero3d/HeroGlobe.css';
import '../../../src/apps/public/components/QuickFlightCalculator.css';
import '../theme/stage.css';

export const STAGE_WIDTH = 1920;

export type StageLayout = {
  height: number;
  calculator: Rect;
  form: Rect;
  impact: Rect;
};

type Props = {
  view: CalculatorView;
  /** 0-1: el escenario pasa a ser una "pantalla" flotante en el outro. */
  framed: number;
  onMeasured: (layout: StageLayout) => void;
};

/**
 * Mide los anclajes en coordenadas del escenario. Divide por la escala real
 * del nodo raíz, así da igual el transform de la cámara o el zoom del Studio.
 */
const measure = (root: HTMLElement): StageLayout => {
  const rootRect = root.getBoundingClientRect();
  const k = rootRect.width / root.offsetWidth;
  const rectOf = (name: string): Rect => {
    const el = root.querySelector<HTMLElement>(`[data-anchor="${name}"]`);
    if (!el) throw new Error(`Falta el anclaje "${name}" en el escenario`);
    const r = el.getBoundingClientRect();
    return { x: (r.left - rootRect.left) / k, y: (r.top - rootRect.top) / k, w: r.width / k, h: r.height / k };
  };
  return {
    height: root.offsetHeight,
    calculator: rectOf('calculator'),
    form: rectOf('form'),
    impact: rectOf('impact'),
  };
};

export const Stage: React.FC<Props> = ({ view, framed, onMeasured }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  // El layout no depende del frame (los textos que cambian van en capas
  // superpuestas), así que basta con medir una vez, con las fuentes cargadas.
  useLayoutEffect(() => {
    let cancelled = false;
    fontsReady.then(() => {
      if (!cancelled && rootRef.current) onMeasured(measure(rootRef.current));
    });
    return () => {
      cancelled = true;
    };
  }, [onMeasured]);

  return (
    <div
      ref={rootRef}
      className="ctv-stage"
      style={{
        borderRadius: 28 * framed,
        boxShadow: framed > 0 ? `0 60px 140px -40px rgba(0, 0, 0, ${0.6 * framed})` : undefined,
      }}
    >
      <HeroBackdrop />
      <StageHeader />
      <div className="hero__container">
        <div className="hero__top-grid">
          <HeroHeadline />
          <HeroGlobe />
        </div>
        <div className="hero-calculator-wrap">
          <CalculatorCard view={view} />
        </div>
        <HeroTrustBar />
      </div>
    </div>
  );
};
