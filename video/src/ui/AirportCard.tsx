import React from 'react';
import { interpolateColors } from 'remotion';
import { FaPlane } from 'react-icons/fa';
import { HiChevronDown } from 'react-icons/hi';
import type { Airport } from '../data/example';

export type FieldFill = {
  /** Letras del código IATA ya escritas (0-3, admite decimales para el fade). */
  letters: number;
  /** 0-1: entrada de ciudad y nombre del aeropuerto. */
  meta: number;
  /** 0-1: realce de "campo activo" (el :focus-within de la tarjeta real). */
  active: number;
};

type Props = {
  kind: 'origin' | 'destination';
  airport: Airport;
  fill: FieldFill;
};

// Dos capas en la misma celda de grid: el placeholder y el valor real se
// cruzan sin que cambie el alto de la tarjeta (la cámara mide el layout una vez).
const stack: React.CSSProperties = { display: 'grid' };
const cell: React.CSSProperties = { gridArea: '1 / 1' };

// El placeholder se va en el primer 40 % del cruce: si se desvanece al mismo
// ritmo que entra el valor, ambos se ven superpuestos a medio camino.
export const placeholderOpacity = (t: number) => 1 - Math.min(1, t * 2.5);

export const AirportCard: React.FC<Props> = ({ kind, airport, fill }) => {
  const { active } = fill;

  return (
    <div
      className="qfc-airport-card"
      style={{
        // Mismo estado que .qfc-airport-card:focus-within en el CSS real.
        borderColor: interpolateColors(active, [0, 1], ['rgba(7, 61, 61, 0.12)', 'rgba(8, 174, 6, 0.55)']),
        background: interpolateColors(active, [0, 1], ['#F9FBFA', '#FFFFFF']),
        boxShadow: `0 2px 6px rgba(7, 61, 61, 0.02), 0 10px 28px -6px rgba(8, 174, 6, ${0.16 * active})`,
      }}
    >
      <div className="qfc-card-top">
        <span className="qfc-card-tag">
          <FaPlane
            className={`qfc-tag-icon ${kind === 'origin' ? 'qfc-tag-icon--depart' : 'qfc-tag-icon--arrive'}`}
            aria-hidden="true"
          />
          {kind === 'origin' ? 'Origen' : 'Destino'}
        </span>
        <HiChevronDown className="qfc-chevron" aria-hidden="true" />
      </div>

      <div className="qfc-airport-visual">
        <span className="qfc-airport-code" style={{ position: 'relative' }}>
          {/* Fuera del flujo: el ancho del hueco lo da el código, no el placeholder. */}
          <span
            style={{
              position: 'absolute',
              left: 0,
              color: 'rgba(7, 61, 61, 0.16)',
              opacity: placeholderOpacity(fill.letters),
            }}
          >
            ···
          </span>
          <span>
            {airport.code.split('').map((ch, i) => {
              const t = Math.max(0, Math.min(1, fill.letters - i));
              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    opacity: t,
                    transform: `translateY(${(1 - t) * 10}px)`,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        </span>

        <div className="qfc-airport-meta" style={stack}>
          <div style={{ ...cell, display: 'flex', flexDirection: 'column', gap: '0.2rem', opacity: placeholderOpacity(fill.meta) }}>
            <span className="qfc-airport-city vid-placeholder">
              {kind === 'origin' ? '¿Desde dónde vuelas?' : '¿A dónde vas?'}
            </span>
            <span className="qfc-airport-name">Selecciona un aeropuerto</span>
          </div>
          <div
            style={{
              ...cell,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem',
              opacity: fill.meta,
              transform: `translateY(${(1 - fill.meta) * 6}px)`,
            }}
          >
            <span className="qfc-airport-city">
              {airport.city}, {airport.country}
            </span>
            <span className="qfc-airport-name">{airport.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
