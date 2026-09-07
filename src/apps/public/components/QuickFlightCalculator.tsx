import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowRight, HiSwitchHorizontal, HiSparkles, HiInformationCircle, HiChevronDown } from 'react-icons/hi';
import { FaPlane, FaUsers, FaLeaf, FaTree } from 'react-icons/fa';
import {
  estimateEmissions,
  POPULAR_AIRPORTS,
  EstimateResponse,
} from '../services/publicApi';
import { useAuth } from '../../auth/context/AuthContext';
import './QuickFlightCalculator.css';

const QUICK_ROUTES = [
  { origin: 'SCL', destination: 'LIM', label: 'Santiago → Lima' },
  { origin: 'SCL', destination: 'BUE', label: 'Santiago → Bs. Aires' },
  { origin: 'SCL', destination: 'MIA', label: 'Santiago → Miami' },
  { origin: 'SCL', destination: 'MAD', label: 'Santiago → Madrid' },
];

/* Hoja orgánica SVG decorativa para el fondo */
const EcoWatermarkLeaf: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`qfc-watermark-leaf ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M20 4C11.5 3.5 4.5 10.5 3.5 20C13 21 20 14 20 4Z"
      fill="currentColor"
    />
    <path
      d="M3.5 20C9.5 14 14.5 9 20 4"
      stroke="#ffffff"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

export interface QuickFlightCalculatorProps {
  onCompensationSelect?: (data: EstimateResponse) => void;
}

export const QuickFlightCalculator: React.FC<QuickFlightCalculatorProps> = ({ onCompensationSelect }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [origin, setOrigin] = useState('SCL');
  const [destination, setDestination] = useState('LIM');
  const [cabinCode, setCabinCode] = useState<'economy' | 'premium_economy' | 'business' | 'first'>('economy');
  const [passengers, setPassengers] = useState(1);
  const [roundTrip, setRoundTrip] = useState(false);

  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const originAirport = useMemo(
    () => POPULAR_AIRPORTS.find((a) => a.code === origin) || POPULAR_AIRPORTS[0],
    [origin]
  );
  const destAirport = useMemo(
    () => POPULAR_AIRPORTS.find((a) => a.code === destination) || POPULAR_AIRPORTS[1],
    [destination]
  );

  const calculate = useCallback(
    async (orig: string, dest: string, cabin: typeof cabinCode, pax: number, isRound: boolean) => {
      if (orig === dest) {
        setError('El origen y destino no pueden ser el mismo aeropuerto');
        return;
      }
      setError(null);
      setLoading(true);

      try {
        const res = await estimateEmissions({
          origin: orig,
          destination: dest,
          cabinCode: cabin,
          passengers: pax,
          roundTrip: isRound,
          userId: user?.id,
        });

        if (res.status === 'success') {
          setEstimate(res);
        } else {
          setError(res.message || 'Error al calcular emisiones');
        }
      } catch (err: any) {
        setError(err.message || 'Error de conexión con la calculadora');
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    calculate(origin, destination, cabinCode, passengers, roundTrip);
  }, []);

  const handleSwapAirports = () => {
    const prevOrigin = origin;
    const prevDestination = destination;
    setOrigin(prevDestination);
    setDestination(prevOrigin);
    calculate(prevDestination, prevOrigin, cabinCode, passengers, roundTrip);
  };

  const handleQuickRoute = (o: string, d: string) => {
    setOrigin(o);
    setDestination(d);
    calculate(o, d, cabinCode, passengers, roundTrip);
  };

  const handleCabinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as typeof cabinCode;
    setCabinCode(val);
    calculate(origin, destination, val, passengers, roundTrip);
  };

  const handlePaxChange = (delta: number) => {
    const next = Math.max(1, Math.min(50, passengers + delta));
    setPassengers(next);
    calculate(origin, destination, cabinCode, next, roundTrip);
  };

  const handleRoundTripToggle = (val: boolean) => {
    setRoundTrip(val);
    calculate(origin, destination, cabinCode, passengers, val);
  };

  const estimatedCostUsd = estimate?.emissions?.kgCO2e
    ? Math.max(1, Math.round(estimate.emissions.kgCO2e * 0.025 * 100) / 100)
    : 7.71;

  const treesEquivalent = estimate?.equivalencies?.treesPerYear
    ? estimate.equivalencies.treesPerYear
    : Math.max(1, Math.round((estimate?.emissions?.kgCO2e || 308) / 22));

  /**
   * Lleva el vuelo recien calculado a la calculadora B2C, que ya sabe leer
   * estos parametros (mismo contrato que usa "Mis Viajes").
   *
   * Antes, este boton hacia scroll a #proyectos y las tarjetas de esa seccion
   * enlazaban de vuelta a #calculadora: el usuario quedaba dando vueltas por
   * la landing sin llegar nunca a compensar. /b2c/calculator esta protegida,
   * asi que quien no tenga sesion pasa por login y vuelve aqui con sus datos
   * intactos (B2CProtectedRoute guarda el destino en state.from).
   */
  const buildCompensationUrl = useCallback(() => {
    const params = new URLSearchParams({
      origin,
      destination,
      cabin: cabinCode,
      passengers: String(passengers),
      roundTrip: String(roundTrip),
    });
    return `/b2c/calculator?${params.toString()}`;
  }, [origin, destination, cabinCode, passengers, roundTrip]);

  const handleCompensateClick = () => {
    // El callback tiene prioridad: es la API publica del componente y puede
    // estar gestionando el flujo desde fuera (por ejemplo, un modal).
    if (onCompensationSelect && estimate) {
      onCompensationSelect(estimate);
      return;
    }
    navigate(buildCompensationUrl());
  };

  return (
    <div className="qfc-card" aria-label="Calculadora espaciosa de emisiones en vuelos">
      {/* Fondo ambiental sutil con marcas de agua orgánicas no invasivas */}
      <div className="qfc-ambient-bg" aria-hidden="true">
        <EcoWatermarkLeaf className="qfc-watermark-leaf--top" />
        <EcoWatermarkLeaf className="qfc-watermark-leaf--bottom" />
      </div>

      {/* ── Cabecera Espaciosa ── */}
      <div className="qfc-header">
        <div className="qfc-header-info">
          <span className="qfc-indicator-dot" aria-hidden="true" />
          <span className="qfc-header-title">Calculadora de huella aérea</span>
          <span className="qfc-header-sep">·</span>
          <span className="qfc-header-meta">DEFRA 2024 & GHG Protocol</span>
        </div>

        <div className="qfc-trip-toggle" role="radiogroup" aria-label="Tipo de trayecto">
          <button
            type="button"
            className={`qfc-toggle-btn ${!roundTrip ? 'qfc-toggle-btn--active' : ''}`}
            onClick={() => handleRoundTripToggle(false)}
            role="radio"
            aria-checked={!roundTrip}
          >
            Solo ida
          </button>
          <button
            type="button"
            className={`qfc-toggle-btn ${roundTrip ? 'qfc-toggle-btn--active' : ''}`}
            onClick={() => handleRoundTripToggle(true)}
            role="radio"
            aria-checked={roundTrip}
          >
            Ida y vuelta
          </button>
        </div>
      </div>

      {/* ── Selector de Ruta: Tarjetas Amplias de Origen y Destino ── */}
      <div className="qfc-route-section">
        {/* Tarjeta Origen */}
        <div className="qfc-airport-card">
          <div className="qfc-card-top">
            <span className="qfc-card-tag">
              <FaPlane className="qfc-tag-icon qfc-tag-icon--depart" aria-hidden="true" />
              Origen
            </span>
            <HiChevronDown className="qfc-chevron" aria-hidden="true" />
          </div>
          <div className="qfc-airport-visual">
            <span className="qfc-airport-code">{originAirport.code}</span>
            <div className="qfc-airport-meta">
              <span className="qfc-airport-city">{originAirport.city}, {originAirport.country}</span>
              <span className="qfc-airport-name">{originAirport.name}</span>
            </div>
          </div>
          <select
            id="qfc-origin-select"
            className="qfc-hidden-select"
            value={origin}
            onChange={(e) => {
              const val = e.target.value;
              setOrigin(val);
              calculate(val, destination, cabinCode, passengers, roundTrip);
            }}
            aria-label="Aeropuerto de origen"
          >
            {POPULAR_AIRPORTS.map((a) => (
              <option key={a.code} value={a.code} disabled={a.code === destination}>
                {a.code} - {a.city}, {a.country} ({a.name})
              </option>
            ))}
          </select>
        </div>

        {/* Botón de Intercambio Central */}
        <div className="qfc-swap-container">
          <button
            type="button"
            className="qfc-swap-button"
            onClick={handleSwapAirports}
            aria-label="Invertir origen y destino"
            title="Invertir ruta"
          >
            <HiSwitchHorizontal aria-hidden="true" />
          </button>
        </div>

        {/* Tarjeta Destino */}
        <div className="qfc-airport-card">
          <div className="qfc-card-top">
            <span className="qfc-card-tag">
              <FaPlane className="qfc-tag-icon qfc-tag-icon--arrive" aria-hidden="true" />
              Destino
            </span>
            <HiChevronDown className="qfc-chevron" aria-hidden="true" />
          </div>
          <div className="qfc-airport-visual">
            <span className="qfc-airport-code">{destAirport.code}</span>
            <div className="qfc-airport-meta">
              <span className="qfc-airport-city">{destAirport.city}, {destAirport.country}</span>
              <span className="qfc-airport-name">{destAirport.name}</span>
            </div>
          </div>
          <select
            id="qfc-destination-select"
            className="qfc-hidden-select"
            value={destination}
            onChange={(e) => {
              const val = e.target.value;
              setDestination(val);
              calculate(origin, val, cabinCode, passengers, roundTrip);
            }}
            aria-label="Aeropuerto de destino"
          >
            {POPULAR_AIRPORTS.map((a) => (
              <option key={a.code} value={a.code} disabled={a.code === origin}>
                {a.code} - {a.city}, {a.country} ({a.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Parámetros de Vuelo: Cabina & Pasajeros con Espacio Holgado ── */}
      <div className="qfc-config-row">
        <div className="qfc-config-block qfc-config-block--cabin">
          <label htmlFor="qfc-cabin-select" className="qfc-config-label">
            Clase de cabina
          </label>
          <div className="qfc-select-wrapper">
            <select
              id="qfc-cabin-select"
              className="qfc-custom-select"
              value={cabinCode}
              onChange={handleCabinChange}
            >
              <option value="economy">Clase Económica</option>
              <option value="premium_economy">Premium Economy</option>
              <option value="business">Business / Ejecutiva</option>
              <option value="first">Primera Clase</option>
            </select>
            <HiChevronDown className="qfc-select-icon" aria-hidden="true" />
          </div>
        </div>

        <div className="qfc-config-block qfc-config-block--pax">
          <label className="qfc-config-label">
            <FaUsers aria-hidden="true" />
            Número de pasajeros
          </label>
          <div className="qfc-stepper">
            <button
              type="button"
              className="qfc-stepper-btn"
              onClick={() => handlePaxChange(-1)}
              disabled={passengers <= 1}
              aria-label="Disminuir pasajero"
            >
              −
            </button>
            <span className="qfc-stepper-display">
              <strong>{passengers}</strong> {passengers === 1 ? 'pasajero' : 'pasajeros'}
            </span>
            <button
              type="button"
              className="qfc-stepper-btn"
              onClick={() => handlePaxChange(1)}
              disabled={passengers >= 50}
              aria-label="Aumentar pasajero"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* ── Rutas Frecuentes / Sugeridas (Barra limpia y espaciosa) ── */}
      <div className="qfc-quick-routes-bar">
        <span className="qfc-routes-label">Rutas frecuentes:</span>
        <div className="qfc-routes-list">
          {QUICK_ROUTES.map((r) => {
            const isActive = origin === r.origin && destination === r.destination;
            return (
              <button
                key={r.label}
                type="button"
                className={`qfc-route-chip ${isActive ? 'qfc-route-chip--active' : ''}`}
                onClick={() => handleQuickRoute(r.origin, r.destination)}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mensaje de Error si aplica */}
      {error && (
        <div className="qfc-error" role="alert">
          <HiInformationCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Panel de Resultados e Impacto (Espacioso, Limpio y Contundente) ── */}
      <div className={`qfc-impact-panel ${loading ? 'qfc-impact-panel--loading' : ''}`}>
        {/* Columna 1: Métrica Principal */}
        <div className="qfc-impact-metric">
          <span className="qfc-metric-caption">Huella de carbono calculada</span>
          <div className="qfc-metric-value-row">
            <span className="qfc-metric-number">
              {estimate?.emissions?.kgCO2e?.toLocaleString('es-CL') ?? '308,5'}
            </span>
            <div className="qfc-metric-unit-group">
              <span className="qfc-metric-unit">kg CO₂e</span>
              <span className="qfc-metric-ton">
                ({estimate?.emissions?.tonCO2e?.toFixed(3) ?? '0,309'} t)
              </span>
            </div>
          </div>
          <p className="qfc-metric-sub">
            {estimate?.meta?.distanceKmTotal ? Math.round(estimate.meta.distanceKmTotal).toLocaleString('es-CL') : '2.453'} km de vuelo
            {' · '}
            {roundTrip ? 'Ida y vuelta' : 'Trayecto de ida'}
          </p>
        </div>

        {/* Columna 2: Equivalencia Positiva */}
        <div className="qfc-impact-context">
          <div className="qfc-eco-box">
            <div className="qfc-eco-icon-wrap" aria-hidden="true">
              <FaTree />
            </div>
            <div className="qfc-eco-info">
              <span className="qfc-eco-title">Impacto equivalente</span>
              <span className="qfc-eco-detail">
                Equivale a la absorción anual de <strong>~{treesEquivalent} árboles</strong>
              </span>
            </div>
          </div>
          <span className="qfc-verified-note">
            <HiSparkles aria-hidden="true" />
            Compensable con créditos de carbono certificados
          </span>
        </div>

        {/* Columna 3: Aporte & Llamado a la Acción */}
        <div className="qfc-impact-action">
          <div className="qfc-action-price">
            <span className="qfc-price-caption">Aporte para neutralizar</span>
            <div className="qfc-price-row">
              <span className="qfc-price-amount">${estimatedCostUsd}</span>
              <span className="qfc-price-currency">USD</span>
            </div>
          </div>

          <button
            type="button"
            className="qfc-compensate-btn"
            onClick={handleCompensateClick}
          >
            <FaLeaf aria-hidden="true" />
            <span>Compensar huella</span>
            <HiArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickFlightCalculator;

