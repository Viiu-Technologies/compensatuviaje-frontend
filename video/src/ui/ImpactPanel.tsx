import React from 'react';
import { interpolateColors } from 'remotion';
import { FaLeaf, FaTree } from 'react-icons/fa';
import { HiArrowRight, HiCheck, HiSparkles } from 'react-icons/hi';
import { Focus } from '../camera/Focus';
import { EXAMPLE, fmt } from '../data/example';
import { C } from '../theme/palette';
import { placeholderOpacity } from './AirportCard';

export type ImpactView = {
  /** kg CO₂e mostrados (count-up). null = aún sin calcular ("—", como en la web). */
  kg: number | null;
  /** 0-1: km, toneladas, árboles y precio. */
  meta: number;
  /** 0-1: pulso único de brillo en el número. */
  pulse: number;
  /** 0-1: el CTA pasa del teal real al acento cuando recibe el foco. */
  ctaAccent: number;
  /** Escala del CTA (pulsación 1 → 0.97 → 1). */
  ctaScale: number;
  /** 0-1: salida del precio y el botón. */
  actionOut: number;
  /** 0-1: estado "Huella compensada" (entra cuando actionOut ya terminó). */
  done: number;
};

const stack: React.CSSProperties = { display: 'grid' };
const cell: React.CSSProperties = { gridArea: '1 / 1' };

export const ImpactPanel: React.FC<{ view: ImpactView }> = ({ view }) => {
  const { kg, meta, pulse, ctaAccent, ctaScale, actionOut, done } = view;
  const tripLabel = EXAMPLE.roundTrip ? 'Ida y vuelta' : 'Trayecto de ida';

  return (
    <Focus id="panel" className="qfc-impact-panel" style={{ position: 'relative' }}>
      {/* Columna 1: métrica principal */}
      <Focus id="metric" className="qfc-impact-metric">
        <span className="qfc-metric-caption">Huella de carbono calculada</span>
        <div className="qfc-metric-value-row">
          <span
            className="qfc-metric-number"
            style={{
              // Acento único del video. En la web este número es teal.
              color: kg === null ? undefined : C.accent,
              textShadow: pulse > 0 ? `0 0 ${28 * pulse}px rgba(7, 151, 5, ${0.35 * pulse})` : undefined,
            }}
          >
            {kg === null ? '—' : fmt.kg(kg)}
          </span>
          <div className="qfc-metric-unit-group">
            <span className="qfc-metric-unit">kg CO₂e</span>
            <span className="qfc-metric-ton" style={{ opacity: meta }}>
              ({fmt.ton(EXAMPLE.tonCO2e)} t)
            </span>
          </div>
        </div>
        <p className="qfc-metric-sub" style={stack}>
          <span style={{ ...cell, opacity: placeholderOpacity(meta) }}>{tripLabel}</span>
          <span style={{ ...cell, opacity: meta }}>
            {fmt.int(EXAMPLE.distanceKmTotal)} km de vuelo · {tripLabel} · {EXAMPLE.methodology}
          </span>
        </p>
      </Focus>

      {/* Columna 2: equivalencia */}
      <Focus id="context" className="qfc-impact-context">
        <div className="qfc-eco-box">
          <div className="qfc-eco-icon-wrap" aria-hidden="true">
            <FaTree />
          </div>
          <div className="qfc-eco-info">
            <span className="qfc-eco-title">Impacto equivalente</span>
            <span className="qfc-eco-detail" style={stack}>
              <span style={{ ...cell, opacity: placeholderOpacity(meta) }}>Calcula tu vuelo para ver su equivalencia</span>
              <span style={{ ...cell, opacity: meta }}>
                Equivale a{' '}
                <strong>
                  ~{fmt.dec(EXAMPLE.trees)} {EXAMPLE.trees === 1 ? 'árbol' : 'árboles'}
                </strong>
              </span>
            </span>
          </div>
        </div>
        <span className="qfc-verified-note">
          <HiSparkles aria-hidden="true" />
          Compensable en proyectos evaluados por Veritas AI
        </span>
      </Focus>

      {/* Columna 3: aporte y CTA, que se convierte en "Huella compensada" */}
      <Focus id="action" className="qfc-impact-action" style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            alignItems: 'flex-end',
            width: '100%',
            opacity: 1 - actionOut,
          }}
        >
          <div className="qfc-action-price" style={{ opacity: meta }}>
            <span className="qfc-price-caption">Aporte para neutralizar, desde</span>
            <div className="qfc-price-row">
              <span className="qfc-price-amount">{fmt.clp(EXAMPLE.priceFromCLP)}</span>
              <span className="qfc-price-currency">CLP</span>
            </div>
          </div>
          <button
            type="button"
            className="qfc-compensate-btn"
            style={{
              background: interpolateColors(ctaAccent, [0, 1], ['#073D3D', C.accent]),
              transform: `scale(${ctaScale})`,
            }}
          >
            <FaLeaf aria-hidden="true" />
            <span>Compensar huella</span>
            <HiArrowRight aria-hidden="true" />
          </button>
        </div>

        <div
          className="vid-done"
          style={{ opacity: done, transform: `translateY(${(1 - done) * 10}px)` }}
        >
          <span className="vid-done__badge" aria-hidden="true">
            <HiCheck />
          </span>
          <span className="vid-done__title">Huella compensada</span>
          <span className="vid-done__detail">
            <strong>{fmt.int(EXAMPLE.kgCO2e)} kg CO₂e</strong> neutralizados
            <br />
            {EXAMPLE.projectLabel}
          </span>
        </div>
      </Focus>
    </Focus>
  );
};
