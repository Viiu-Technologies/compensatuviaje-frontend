// Versión "títere" de src/apps/public/components/QuickFlightCalculator.tsx:
// mismas clases y el mismo markup, pero controlada por props (sin estado, API
// ni router). Los estilos vienen del QuickFlightCalculator.css real.
import React from 'react';
import { interpolateColors } from 'remotion';
import { FaUsers } from 'react-icons/fa';
import { HiChevronDown, HiSwitchHorizontal } from 'react-icons/hi';
import { Focus } from '../camera/Focus';
import { EXAMPLE } from '../data/example';
import { AirportCard, placeholderOpacity, type FieldFill } from './AirportCard';
import { ImpactPanel, type ImpactView } from './ImpactPanel';

const QUICK_ROUTES = ['Santiago → Lima', 'Santiago → Bs. Aires', 'Santiago → Miami', 'Santiago → Madrid'];

export type FormFill = {
  origin: FieldFill;
  destination: FieldFill;
  /** 0-1 cada uno: valor de cabina y de pasajeros. */
  cabin: number;
  passengers: number;
  /** 0-1 cada uno: realce de campo activo. */
  cabinActive: number;
  passengersActive: number;
};

export type CalculatorView = { form: FormFill; impact: ImpactView };

const stack: React.CSSProperties = { display: 'grid' };
const cell: React.CSSProperties = { gridArea: '1 / 1' };

const activeBorder = (t: number) =>
  interpolateColors(t, [0, 1], ['rgba(7, 61, 61, 0.14)', 'rgba(8, 174, 6, 0.55)']);

const EcoWatermarkLeaf: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`qfc-watermark-leaf ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20 4C11.5 3.5 4.5 10.5 3.5 20C13 21 20 14 20 4Z" fill="currentColor" />
    <path d="M3.5 20C9.5 14 14.5 9 20 4" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
  </svg>
);

export const CalculatorCard: React.FC<{ view: CalculatorView }> = ({ view }) => {
  const { form, impact } = view;

  return (
    <div className="qfc-card" data-anchor="calculator">
      <div className="qfc-ambient-bg" aria-hidden="true">
        <EcoWatermarkLeaf className="qfc-watermark-leaf--top" />
        <EcoWatermarkLeaf className="qfc-watermark-leaf--bottom" />
      </div>

      <Focus id="calcHeader" className="qfc-header">
        <div className="qfc-header-info">
          <span className="qfc-indicator-dot" aria-hidden="true" />
          <span className="qfc-header-title">Calculadora de huella aérea</span>
          <span className="qfc-header-sep">·</span>
          <span className="qfc-header-meta">{EXAMPLE.methodology} & GHG Protocol</span>
        </div>
        <div className="qfc-trip-toggle">
          <button type="button" className={`qfc-toggle-btn ${EXAMPLE.roundTrip ? '' : 'qfc-toggle-btn--active'}`}>
            Solo ida
          </button>
          <button type="button" className={`qfc-toggle-btn ${EXAMPLE.roundTrip ? 'qfc-toggle-btn--active' : ''}`}>
            Ida y vuelta
          </button>
        </div>
      </Focus>

      <div data-anchor="form">
        <Focus id="route" className="qfc-route-section">
          <AirportCard kind="origin" airport={EXAMPLE.origin} fill={form.origin} />
          <div className="qfc-swap-container">
            <span className="qfc-swap-button" aria-hidden="true">
              <HiSwitchHorizontal />
            </span>
          </div>
          <AirportCard kind="destination" airport={EXAMPLE.destination} fill={form.destination} />
        </Focus>

        <Focus id="config" className="qfc-config-row">
          <div className="qfc-config-block qfc-config-block--cabin">
            <span className="qfc-config-label">Clase de cabina</span>
            <div className="qfc-select-wrapper">
              <div className="qfc-custom-select" style={{ ...stack, borderColor: activeBorder(form.cabinActive) }}>
                <span className="vid-placeholder" style={{ ...cell, opacity: placeholderOpacity(form.cabin) }}>
                  Selecciona la clase
                </span>
                <span style={{ ...cell, opacity: form.cabin }}>{EXAMPLE.cabinLabel}</span>
              </div>
              <HiChevronDown className="qfc-select-icon" aria-hidden="true" />
            </div>
          </div>

          <div className="qfc-config-block qfc-config-block--pax">
            <span className="qfc-config-label">
              <FaUsers aria-hidden="true" />
              Número de pasajeros
            </span>
            <div className="qfc-stepper" style={{ borderColor: activeBorder(form.passengersActive) }}>
              <button type="button" className="qfc-stepper-btn" disabled>
                −
              </button>
              <span className="qfc-stepper-display" style={stack}>
                <span style={{ ...cell, opacity: placeholderOpacity(form.passengers) }}>
                  <strong>—</strong> pasajeros
                </span>
                <span style={{ ...cell, opacity: form.passengers }}>
                  <strong>{EXAMPLE.passengers}</strong> {EXAMPLE.passengers === 1 ? 'pasajero' : 'pasajeros'}
                </span>
              </span>
              <button type="button" className="qfc-stepper-btn">
                +
              </button>
            </div>
          </div>
        </Focus>
      </div>

      <Focus id="quickRoutes" className="qfc-quick-routes-bar">
        <span className="qfc-routes-label">Rutas frecuentes:</span>
        <div className="qfc-routes-list">
          {QUICK_ROUTES.map((label) => (
            <span key={label} className="qfc-route-chip">
              {label}
            </span>
          ))}
        </div>
      </Focus>

      <div data-anchor="impact">
        <ImpactPanel view={impact} />
      </div>
    </div>
  );
};
