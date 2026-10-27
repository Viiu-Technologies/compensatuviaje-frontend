import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaPlane, FaLeaf, FaMapMarkerAlt, FaUsers, FaExchangeAlt, FaCheckCircle, FaArrowLeft, FaSpinner, FaInfoCircle,
  FaMinus, FaPlus, FaArrowRight,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import B2CLayout from './B2CLayout';
import { cx, fmtInt, fmtNum } from '../ui';
import './B2CCalculator.css';

/**
 * Calculadora de huella de un vuelo (área B2C).
 *
 * Migrada al mismo lenguaje visual que la calculadora del Hero público
 * (QuickFlightCalculator): mismos tokens --ctv-*, mismas tarjetas con vidrio
 * y sombra en capas, mismo panel de impacto. Antes usaba las utilidades
 * Tailwind genéricas de `ui/components.tsx` (pensadas para el admin), lo que
 * hacía que el usuario pasara de una pieza de marketing con identidad fuerte
 * a un panel de back-office apenas hacía clic en "Compensar huella" desde
 * el landing — el salto se notaba y se leía como hecho por partes distintas.
 *
 * Cambios respecto de la versión anterior (antes de esta migración visual):
 *  - Vive dentro del layout del área (menú lateral), no con encabezado propio.
 *  - Sin emojis para las clases de cabina ni degradados.
 *  - Se quitó el paso "¡Felicitaciones!": nunca se mostraba (el pago ocurre en
 *    Proyectos y vuelve por PaymentResultPage) y generaba un certificado con
 *    el proyecto escrito a mano ("Proyecto de Reforestación Nativa") y monto 0.
 *  - Se quitaron las "equivalencias" del resultado (árboles, litros, m² de
 *    vivienda, kg de textiles): eran proporciones fijas del backend, distintas
 *    de las que usan los certificados (1 árbol por tonelada aquí, 50 allá) y no
 *    dependían del proyecto. Lo que financia la compensación se ve en el paso
 *    siguiente, con los datos reales de cada proyecto.
 */

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  lat?: number;
  lon?: number;
}

interface CalculationResult {
  status: string;
  meta: {
    tripType: string;
    distanceKmOneWay: number;
    distanceKmTotal: number;
    haulType: string;
    route: {
      origin: { code: string; city: string; country: string };
      destination: { code: string; city: string; country: string };
    };
  };
  emissions: {
    kgCO2e: number;
    tonCO2e: number;
    factorUsed: number;
    passengers: number;
  };
}

type Step = 'form' | 'result';

interface B2CCalculatorProps {
  projectId?: string | null;
}

const CABIN_OPTIONS = [
  { value: 'economy', label: 'Económica' },
  { value: 'premium_economy', label: 'Premium económica' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'Primera' },
];

const API_URL = import.meta.env.VITE_APP_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

/** Buscador de aeropuertos con sugerencias, en la misma piel que las tarjetas de ruta del landing. */
const AirportSearchInput: React.FC<{
  id: string;
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
  placeholder: string;
  label: string;
}> = ({ id, value, onChange, placeholder, label }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  // Si el aeropuerto llega desde fuera (precarga desde "Mis viajes"), mostrarlo en el campo.
  useEffect(() => {
    if (value) setQuery(`${value.city} (${value.code})`);
  }, [value]);

  useEffect(() => {
    if (debouncedQuery.length >= 2 && !value) {
      setIsLoading(true);
      fetch(`${API_URL}/public/airports/search?q=${encodeURIComponent(debouncedQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          // El backend responde { success: true, data: airports[] }
          const airports = data.success ? data.data : data.airports || [];
          setResults(airports);
          setShowResults(airports.length > 0);
        })
        .catch((err) => {
          console.error('Error buscando aeropuertos:', err);
          setResults([]);
        })
        .finally(() => setIsLoading(false));
    } else if (debouncedQuery.length < 2) {
      setResults([]);
      setShowResults(false);
    }
  }, [debouncedQuery, value]);

  const handleSelect = (airport: Airport) => {
    onChange(airport);
    setQuery(`${airport.city} (${airport.code})`);
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (value && val !== `${value.city} (${value.code})`) onChange(null);
  };

  return (
    <div className="b2cc-field">
      <label htmlFor={id} className="b2cc-field-label">
        <FaMapMarkerAlt aria-hidden="true" />
        {label}
      </label>
      <div className={cx('b2cc-input-wrap', value ? 'b2cc-input-wrap--filled' : '')}>
        <input
          id={id}
          type="text"
          autoComplete="off"
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-expanded={showResults}
          className="b2cc-input"
        />
        {isLoading ? (
          <span className="b2cc-input-status b2cc-input-status--loading">
            <FaSpinner aria-hidden="true" />
          </span>
        ) : value ? (
          <span className="b2cc-input-status b2cc-input-status--ok">
            <FaCheckCircle aria-label="Aeropuerto seleccionado" />
          </span>
        ) : null}
      </div>

      {showResults && results.length > 0 && (
        <ul className="b2cc-suggestions" role="listbox">
          {results.map((airport) => (
            <li key={airport.code}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(airport)}
                className="b2cc-suggestion"
              >
                <span className="b2cc-suggestion-code">{airport.code}</span>
                <span className="b2cc-suggestion-text">
                  <span className="b2cc-suggestion-city">{airport.city}</span>
                  <span className="b2cc-suggestion-name">{airport.name}</span>
                </span>
                <span className="b2cc-suggestion-country">{airport.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const EMPTY_FORM = {
  origin: null as Airport | null,
  destination: null as Airport | null,
  cabinCode: 'economy',
  passengers: 1,
  roundTrip: true,
};

interface TripInput {
  origin: Airport;
  destination: Airport;
  cabinCode: string;
  passengers: number;
  roundTrip: boolean;
}

/** Firma de un viaje, para saber si el formulario sigue siendo un viaje ya guardado. */
const tripKey = (t: TripInput) =>
  [t.origin.code, t.destination.code, t.cabinCode, t.passengers, t.roundTrip].join('|');

/** Busca un aeropuerto por código IATA; si no hay coincidencia exacta, el primero que devuelva la búsqueda. */
async function findAirport(code: string): Promise<Airport | null> {
  const res = await fetch(`${API_URL}/public/airports/search?q=${encodeURIComponent(code)}`);
  const data = await res.json();
  // El backend responde { success: true, data: airports[] }
  const list: Airport[] = data.success ? data.data : data.airports || [];
  return list.find((a) => a.code === code) || list[0] || null;
}

const B2CCalculator: React.FC<B2CCalculatorProps> = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<Step>('form');
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Si se llega con un vuelo en la URL (desde el landing o "Mis viajes") se
  // calcula solo. Mientras tanto se muestra "Calculando…": sin esto el
  // formulario aparecía un instante y luego saltaba al resultado.
  const [autoCalculating, setAutoCalculating] = useState(
    () => Boolean(searchParams.get('origin') && searchParams.get('destination')),
  );

  const [formData, setFormData] = useState(EMPTY_FORM);
  // Cambia al reiniciar el formulario para que los buscadores de aeropuerto,
  // que guardan su propio texto, se monten de nuevo vacíos.
  const [formKey, setFormKey] = useState(0);

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [calculationId, setCalculationId] = useState<string | null>(null);
  const [distance, setDistance] = useState(0);

  /**
   * Cálculo ya guardado para el viaje actual. El backend guarda un cálculo
   * nuevo cada vez que recibe userId, así que si el formulario sigue siendo
   * este viaje se recalcula sin userId y se reutiliza el id. Antes, llegar
   * desde "Mis viajes" y pulsar "Calcular huella" duplicaba el viaje.
   */
  const savedTrip = useRef<{ key: string; id: string } | null>(null);
  // URL ya procesada: en desarrollo StrictMode ejecuta los efectos dos veces,
  // y cada cálculo automático con userId terminaría guardado dos veces.
  const autoRanFor = useRef<string | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /** Calcula el viaje y pasa al resultado. Devuelve el id del cálculo, si lo hay. */
  const runCalculation = async (trip: TripInput): Promise<string | null> => {
    const key = tripKey(trip);
    const reuseId = savedTrip.current?.key === key ? savedTrip.current.id : null;
    setIsCalculating(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/public/calculator/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: trip.origin.code,
          destination: trip.destination.code,
          cabinCode: trip.cabinCode,
          passengers: trip.passengers,
          roundTrip: trip.roundTrip,
          // Sin userId el backend no guarda: un viaje ya guardado no se duplica.
          userId: reuseId ? undefined : user?.id,
        }),
      });
      const data = await response.json();
      if (data.status === 'success') {
        const id: string | null = reuseId ?? data.calculationId ?? null;
        if (id) savedTrip.current = { key, id };
        setResult(data);
        // Explícito, también cuando es null: antes se conservaba el id del
        // viaje anterior aunque el usuario hubiera cambiado la ruta.
        setCalculationId(id);
        setCurrentStep('result');
        return id;
      }
      setError(data.message || 'No pudimos calcular las emisiones de este vuelo.');
    } catch (err) {
      console.error('Error calculating:', err);
      // Antes: "Verifica que el servidor esté corriendo" (mensaje para desarrolladores).
      setError('No pudimos calcular. Revisa tu conexión y vuelve a intentarlo.');
    } finally {
      setIsCalculating(false);
    }
    return null;
  };

  // Vuelo en la URL: precargar el formulario y calcular sin pedir otro clic.
  useEffect(() => {
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    if (!origin || !destination) {
      // Se venía de una URL con vuelo y ahora no hay (p. ej. "Calcular CO₂"
      // en el menú lateral, que es la misma ruta): volver al formulario vacío
      // en vez de seguir mostrando el resultado anterior.
      if (autoRanFor.current !== null) {
        autoRanFor.current = null;
        savedTrip.current = null;
        setFormData(EMPTY_FORM);
        setFormKey((k) => k + 1);
        setResult(null);
        setCalculationId(null);
        setError(null);
        setCurrentStep('form');
      }
      return;
    }

    const urlKey = searchParams.toString();
    if (autoRanFor.current === urlKey) return;
    autoRanFor.current = urlKey;

    const cabinCode = searchParams.get('cabin') || 'economy';
    const passengers = Math.max(1, parseInt(searchParams.get('passengers') || '1', 10) || 1);
    const roundTrip = searchParams.get('roundTrip') === 'true';
    const calcId = searchParams.get('calculationId');

    setFormData((prev) => ({ ...prev, cabinCode, passengers, roundTrip }));
    if (calcId) setCalculationId(calcId);

    const prefillAndCalculate = async () => {
      try {
        const [originAirport, destAirport] = await Promise.all([findAirport(origin), findAirport(destination)]);
        if (!mounted.current) return;
        setFormData((prev) => ({
          ...prev,
          origin: originAirport ?? prev.origin,
          destination: destAirport ?? prev.destination,
        }));
        if (!originAirport || !destAirport) {
          setError('No encontramos uno de los aeropuertos de tu vuelo. Revísalo y calcula de nuevo.');
          return;
        }

        const trip: TripInput = { origin: originAirport, destination: destAirport, cabinCode, passengers, roundTrip };
        if (calcId) savedTrip.current = { key: tripKey(trip), id: calcId };
        const id = await runCalculation(trip);

        // Deja el id en la URL: si el usuario recarga, se reutiliza en vez de
        // guardar el mismo viaje otra vez.
        if (id && id !== calcId && mounted.current) {
          const next = new URLSearchParams(searchParams);
          next.set('calculationId', id);
          autoRanFor.current = next.toString();
          setSearchParams(next, { replace: true });
        }
      } catch (err) {
        console.error('Error precargando el vuelo:', err);
        if (mounted.current) setError('No pudimos cargar tu vuelo. Revisa tu conexión y vuelve a intentarlo.');
      } finally {
        if (mounted.current) setAutoCalculating(false);
      }
    };
    prefillAndCalculate();
    // runCalculation y setSearchParams no cambian el resultado de este efecto:
    // solo debe reaccionar a una URL nueva.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Distancia de referencia (gran círculo) mientras se completa el formulario
  useEffect(() => {
    if (formData.origin?.lat && formData.destination?.lat) {
      const R = 6371;
      const dLat = (((formData.destination.lat || 0) - (formData.origin.lat || 0)) * Math.PI) / 180;
      const dLon = (((formData.destination.lon || 0) - (formData.origin.lon || 0)) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(((formData.origin.lat || 0) * Math.PI) / 180) *
          Math.cos(((formData.destination.lat || 0) * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      setDistance(Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
    } else {
      setDistance(0);
    }
  }, [formData.origin, formData.destination]);

  const handleCalculate = () => {
    const { origin, destination } = formData;
    if (!origin || !destination) return;
    runCalculation({ ...formData, origin, destination });
  };

  const handleViewProjects = () => {
    if (!calculationId || !result) return;
    const params = new URLSearchParams({
      calcId: calculationId,
      tons: String(result.emissions.tonCO2e),
      kg: String(result.emissions.kgCO2e),
    });
    navigate(`/b2c/projects?${params.toString()}`);
  };

  const canCalculate = Boolean(formData.origin && formData.destination);

  return (
    <B2CLayout title="Calcular CO₂" subtitle="Calcula la huella de un vuelo y compénsala con un proyecto verificado">
      {autoCalculating && (
        <div className="b2cc-result">
          <div className="b2cc-card b2cc-loading" role="status" aria-live="polite">
            <FaSpinner aria-hidden="true" />
            <p className="b2cc-loading-title">Calculando la huella de tu vuelo…</p>
            <p className="b2cc-loading-sub">Usamos los datos que ingresaste, no tienes que escribirlos de nuevo.</p>
          </div>
        </div>
      )}

      {!autoCalculating && currentStep === 'form' && (
        <div className="b2cc-grid" key={formKey}>
          <div className="b2cc-card">
            <div className="b2cc-card-header">
              <span className="b2cc-card-icon" aria-hidden="true"><FaPlane /></span>
              <div>
                <h2 className="b2cc-card-title">Datos del vuelo</h2>
                <p className="b2cc-card-subtitle">Busca por ciudad o código IATA</p>
              </div>
            </div>

            <form
              className="b2cc-form"
              onSubmit={(e) => { e.preventDefault(); if (canCalculate && !isCalculating) handleCalculate(); }}
            >
              <div className="b2cc-row">
                <AirportSearchInput
                  id="calc-origin"
                  value={formData.origin}
                  onChange={(airport) => setFormData((prev) => ({ ...prev, origin: airport }))}
                  placeholder="Ej.: Santiago o SCL"
                  label="Origen"
                />
                <AirportSearchInput
                  id="calc-destination"
                  value={formData.destination}
                  onChange={(airport) => setFormData((prev) => ({ ...prev, destination: airport }))}
                  placeholder="Ej.: Madrid o MAD"
                  label="Destino"
                />
              </div>

              {distance > 0 && (
                <div className="b2cc-distance">
                  <span>Distancia aproximada</span>
                  <strong>
                    {fmtInt(distance)} km{formData.roundTrip && ` · ${fmtInt(distance * 2)} km ida y vuelta`}
                  </strong>
                </div>
              )}

              <fieldset className="b2cc-fieldset">
                <legend className="b2cc-field-label">Clase de cabina</legend>
                <div className="b2cc-chip-group b2cc-chip-group--4">
                  {CABIN_OPTIONS.map((cabin) => (
                    <button
                      key={cabin.value}
                      type="button"
                      aria-pressed={formData.cabinCode === cabin.value}
                      onClick={() => setFormData((prev) => ({ ...prev, cabinCode: cabin.value }))}
                      className={cx('b2cc-chip', formData.cabinCode === cabin.value && 'b2cc-chip--active')}
                    >
                      {cabin.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="b2cc-row b2cc-row--wide">
                <div>
                  <span className="b2cc-field-label">
                    <FaUsers aria-hidden="true" /> Pasajeros
                  </span>
                  <div className="b2cc-stepper">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, passengers: Math.max(1, prev.passengers - 1) }))}
                      disabled={formData.passengers <= 1}
                      className="b2cc-stepper-btn"
                      aria-label="Quitar un pasajero"
                    >
                      <FaMinus aria-hidden="true" />
                    </button>
                    <output className="b2cc-stepper-display" aria-live="polite">
                      {formData.passengers}
                    </output>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, passengers: Math.min(10, prev.passengers + 1) }))}
                      disabled={formData.passengers >= 10}
                      className="b2cc-stepper-btn"
                      aria-label="Agregar un pasajero"
                    >
                      <FaPlus aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="b2cc-field-label">
                    <FaExchangeAlt aria-hidden="true" /> Tipo de viaje
                  </span>
                  {/* Mismo interruptor segmentado que la calculadora del landing. */}
                  <div className="b2cc-toggle" role="radiogroup" aria-label="Tipo de viaje">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={!formData.roundTrip}
                      onClick={() => setFormData((prev) => ({ ...prev, roundTrip: false }))}
                      className={cx('b2cc-toggle-btn', !formData.roundTrip && 'b2cc-toggle-btn--active')}
                    >
                      Solo ida
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={formData.roundTrip}
                      onClick={() => setFormData((prev) => ({ ...prev, roundTrip: true }))}
                      className={cx('b2cc-toggle-btn', formData.roundTrip && 'b2cc-toggle-btn--active')}
                    >
                      Ida y vuelta
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div role="alert" className="b2cc-error">
                  <FaInfoCircle className="b2cc-error-icon" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={!canCalculate || isCalculating} className="b2cc-submit-btn">
                {isCalculating ? (
                  <><FaSpinner className="b2cc-spin" aria-hidden="true" /> Calculando…</>
                ) : (
                  <><FaLeaf aria-hidden="true" /> Calcular huella</>
                )}
              </button>
            </form>
          </div>

          <div className="b2cc-card b2cc-card--side">
            <div className="b2cc-card-header">
              <span className="b2cc-card-icon" aria-hidden="true"><FaLeaf /></span>
              <h2 className="b2cc-card-title">Cómo funciona</h2>
            </div>
            <ol className="b2cc-steps">
              {[
                ['Calcula', 'Estimamos las emisiones de tu vuelo según la distancia, la cabina y los pasajeros.'],
                ['Elige un proyecto', 'Proyectos evaluados por Veritas AI y revisión humana: reforestación, agua, conservación y más.'],
                ['Compensa', 'Pagas con Webpay y recibes un certificado con lo que tu compensación financió.'],
              ].map(([title, text], i) => (
                <li key={title} className="b2cc-step">
                  <span className="b2cc-step-num">{i + 1}</span>
                  <span className="b2cc-step-text"><b>{title}.</b> {text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {!autoCalculating && currentStep === 'result' && result && (
        <div className="b2cc-result">
          <div className="b2cc-card">
            <div className="b2cc-result-route">
              <div className="b2cc-result-airports">
                <div>
                  <div className="b2cc-result-code">{result.meta.route.origin.code}</div>
                  <div className="b2cc-result-city">{result.meta.route.origin.city}</div>
                </div>
                <FaArrowRight className="b2cc-result-arrow" aria-hidden="true" />
                <div>
                  <div className="b2cc-result-code">{result.meta.route.destination.code}</div>
                  <div className="b2cc-result-city">{result.meta.route.destination.city}</div>
                </div>
              </div>
              <div className="b2cc-result-meta">
                <div>{result.meta.tripType === 'round_trip' ? 'Ida y vuelta' : 'Solo ida'}</div>
                <div>
                  {fmtInt(result.meta.distanceKmTotal)} km · {fmtInt(result.emissions.passengers)}{' '}
                  {result.emissions.passengers === 1 ? 'pasajero' : 'pasajeros'}
                </div>
              </div>
            </div>

            <div className="b2cc-impact-panel">
              <div className="b2cc-impact-caption">Huella de este vuelo</div>
              <div className="b2cc-impact-number">
                {fmtInt(result.emissions.kgCO2e)} <span>kg CO₂e</span>
              </div>
              <div className="b2cc-impact-tons">{fmtNum(result.emissions.tonCO2e, 2)} toneladas</div>
            </div>

            <p className="b2cc-result-note">
              En el siguiente paso eliges el proyecto y ves exactamente qué financia tu compensación y cuánto cuesta.
            </p>

            <div className="b2cc-result-actions">
              <button type="button" onClick={() => setCurrentStep('form')} className="b2cc-btn-secondary">
                <FaArrowLeft aria-hidden="true" /> Modificar vuelo
              </button>
              <button type="button" onClick={handleViewProjects} disabled={!calculationId} className="b2cc-submit-btn">
                <FaLeaf aria-hidden="true" /> Elegir proyecto para compensar
              </button>
            </div>
            {!calculationId && (
              <p className="b2cc-login-note">Para compensar necesitas iniciar sesión: el cálculo se guarda en tu cuenta.</p>
            )}
          </div>
        </div>
      )}
    </B2CLayout>
  );
};

export default B2CCalculator;
