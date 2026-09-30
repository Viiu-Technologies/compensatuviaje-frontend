import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaPlane, FaLeaf, FaMapMarkerAlt, FaUsers, FaExchangeAlt, FaCheckCircle, FaArrowLeft, FaSpinner, FaInfoCircle,
  FaMinus, FaPlus, FaArrowRight,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import B2CLayout from './B2CLayout';
import { Card, CardHeader, btn, cx, fmtInt, fmtNum } from '../ui';

/**
 * Calculadora de huella de un vuelo (área B2C).
 *
 * Cambios respecto de la versión anterior:
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

/** Buscador de aeropuertos con sugerencias. */
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
    <div className="relative">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
        <FaMapMarkerAlt className="text-gray-400" aria-hidden="true" />
        {label}
      </label>
      <div className="relative">
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
          className={cx(
            'w-full rounded-xl border px-4 py-3 pr-10 text-gray-900 bg-white outline-none transition-colors placeholder:text-gray-400',
            value ? 'border-brand-700 bg-brand-50/40' : 'border-gray-300 focus:border-brand-700',
          )}
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <FaSpinner className="animate-spin text-gray-400" aria-hidden="true" />
          ) : value ? (
            <FaCheckCircle className="text-brand-700" aria-label="Aeropuerto seleccionado" />
          ) : null}
        </span>
      </div>

      {showResults && results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-lg border border-gray-200 max-h-72 overflow-y-auto z-50 m-0 p-1 list-none" role="listbox">
          {results.map((airport) => (
            <li key={airport.code}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(airport)}
                className="w-full px-3 py-2.5 text-left rounded-lg hover:bg-gray-50 flex items-center gap-3 cursor-pointer bg-transparent border-0"
              >
                <span className="w-12 h-9 rounded-lg bg-gray-100 text-gray-800 font-mono font-semibold text-sm flex items-center justify-center flex-shrink-0">
                  {airport.code}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-medium text-gray-900 truncate">{airport.city}</span>
                  <span className="block text-sm text-gray-500 truncate">{airport.name}</span>
                </span>
                <span className="text-xs text-gray-500">{airport.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const choice = (active: boolean) =>
  cx(
    'rounded-xl border px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors text-center',
    active ? 'border-brand-700 bg-brand-50 text-brand-800' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  );

const B2CCalculator: React.FC<B2CCalculatorProps> = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<Step>('form');
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    origin: null as Airport | null,
    destination: null as Airport | null,
    cabinCode: 'economy',
    passengers: 1,
    roundTrip: true,
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [calculationId, setCalculationId] = useState<string | null>(null);
  const [distance, setDistance] = useState(0);

  // Precarga desde "Mis viajes" (query params)
  useEffect(() => {
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const cabin = searchParams.get('cabin');
    const passengers = searchParams.get('passengers');
    const roundTrip = searchParams.get('roundTrip');
    const calcId = searchParams.get('calculationId');

    if (origin && destination) {
      setFormData((prev) => ({
        ...prev,
        cabinCode: cabin || 'economy',
        passengers: passengers ? parseInt(passengers) : 1,
        roundTrip: roundTrip === 'true',
      }));
      if (calcId) setCalculationId(calcId);

      const fetchAirports = async () => {
        try {
          const [originRes, destRes] = await Promise.all([
            fetch(`${API_URL}/public/airports/search?q=${encodeURIComponent(origin)}`),
            fetch(`${API_URL}/public/airports/search?q=${encodeURIComponent(destination)}`),
          ]);
          const originData = await originRes.json();
          const destData = await destRes.json();
          const originAirports = originData.success ? originData.data : originData.airports || [];
          const destAirports = destData.success ? destData.data : destData.airports || [];
          const originAirport = originAirports.find((a: any) => a.code === origin) || originAirports[0];
          const destAirport = destAirports.find((a: any) => a.code === destination) || destAirports[0];
          if (originAirport) setFormData((prev) => ({ ...prev, origin: originAirport }));
          if (destAirport) setFormData((prev) => ({ ...prev, destination: destAirport }));
        } catch (err) {
          console.error('Error precargando aeropuertos:', err);
        }
      };
      fetchAirports();
    }
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

  const handleCalculate = async () => {
    if (!formData.origin || !formData.destination) return;
    setIsCalculating(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/public/calculator/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: formData.origin.code,
          destination: formData.destination.code,
          cabinCode: formData.cabinCode,
          passengers: formData.passengers,
          roundTrip: formData.roundTrip,
          userId: user?.id, // Enviar userId si está autenticado
        }),
      });
      const data = await response.json();
      if (data.status === 'success') {
        setResult(data);
        if (data.calculationId) setCalculationId(data.calculationId);
        setCurrentStep('result');
      } else {
        setError(data.message || 'No pudimos calcular las emisiones de este vuelo.');
      }
    } catch (err) {
      console.error('Error calculating:', err);
      // Antes: "Verifica que el servidor esté corriendo" (mensaje para desarrolladores).
      setError('No pudimos calcular. Revisa tu conexión y vuelve a intentarlo.');
    } finally {
      setIsCalculating(false);
    }
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
      {currentStep === 'form' && (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <Card className="p-6 lg:col-span-2">
            <CardHeader icon={FaPlane} title="Datos del vuelo" subtitle="Busca por ciudad o código IATA" />
            <form
              className="space-y-6"
              onSubmit={(e) => { e.preventDefault(); if (canCalculate && !isCalculating) handleCalculate(); }}
            >
              <div className="grid sm:grid-cols-2 gap-4">
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
                <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Distancia aproximada</span>
                  <span className="font-semibold text-gray-900">
                    {fmtInt(distance)} km{formData.roundTrip && ` · ${fmtInt(distance * 2)} km ida y vuelta`}
                  </span>
                </div>
              )}

              <fieldset className="border-0 p-0 m-0">
                <legend className="text-sm font-medium text-gray-700 mb-1.5">Clase de cabina</legend>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CABIN_OPTIONS.map((cabin) => (
                    <button
                      key={cabin.value}
                      type="button"
                      aria-pressed={formData.cabinCode === cabin.value}
                      onClick={() => setFormData((prev) => ({ ...prev, cabinCode: cabin.value }))}
                      className={choice(formData.cabinCode === cabin.value)}
                    >
                      {cabin.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                    <FaUsers className="text-gray-400" aria-hidden="true" /> Pasajeros
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, passengers: Math.max(1, prev.passengers - 1) }))}
                      disabled={formData.passengers <= 1}
                      className={cx(btn.icon, 'w-11 h-11 rounded-xl')}
                      aria-label="Quitar un pasajero"
                    >
                      <FaMinus aria-hidden="true" />
                    </button>
                    <output className="flex-1 h-11 rounded-xl border border-gray-300 flex items-center justify-center text-lg font-semibold text-gray-900" aria-live="polite">
                      {formData.passengers}
                    </output>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, passengers: Math.min(10, prev.passengers + 1) }))}
                      disabled={formData.passengers >= 10}
                      className={cx(btn.icon, 'w-11 h-11 rounded-xl')}
                      aria-label="Agregar un pasajero"
                    >
                      <FaPlus aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                    <FaExchangeAlt className="text-gray-400" aria-hidden="true" /> Tipo de viaje
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" aria-pressed={formData.roundTrip} onClick={() => setFormData((prev) => ({ ...prev, roundTrip: true }))} className={choice(formData.roundTrip)}>
                      Ida y vuelta
                    </button>
                    <button type="button" aria-pressed={!formData.roundTrip} onClick={() => setFormData((prev) => ({ ...prev, roundTrip: false }))} className={choice(!formData.roundTrip)}>
                      Solo ida
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 flex items-start gap-2 text-sm text-rose-700">
                  <FaInfoCircle className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={!canCalculate || isCalculating} className={cx(btn.primary, 'w-full py-3 text-base')}>
                {isCalculating ? (
                  <><FaSpinner className="animate-spin" aria-hidden="true" /> Calculando…</>
                ) : (
                  'Calcular huella'
                )}
              </button>
            </form>
          </Card>

          <Card className="p-6">
            <CardHeader icon={FaLeaf} title="Cómo funciona" />
            <ol className="m-0 p-0 list-none space-y-4 text-sm text-gray-600">
              {[
                ['Calcula', 'Estimamos las emisiones de tu vuelo según la distancia, la cabina y los pasajeros.'],
                ['Elige un proyecto', 'Proyectos evaluados por Verita AI y revisión humana: reforestación, agua, conservación y más.'],
                ['Compensa', 'Pagas con Webpay y recibes un certificado con lo que tu compensación financió.'],
              ].map(([title, text], i) => (
                <li key={title} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-800 text-xs font-semibold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <span><b className="text-gray-900">{title}.</b> {text}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}

      {currentStep === 'result' && result && (
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 font-mono">{result.meta.route.origin.code}</div>
                  <div className="text-sm text-gray-500">{result.meta.route.origin.city}</div>
                </div>
                <FaArrowRight className="text-gray-300" aria-hidden="true" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 font-mono">{result.meta.route.destination.code}</div>
                  <div className="text-sm text-gray-500">{result.meta.route.destination.city}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600 text-right">
                <div>{result.meta.tripType === 'round_trip' ? 'Ida y vuelta' : 'Solo ida'}</div>
                <div>
                  {fmtInt(result.meta.distanceKmTotal)} km · {fmtInt(result.emissions.passengers)}{' '}
                  {result.emissions.passengers === 1 ? 'pasajero' : 'pasajeros'}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-brand-50 border border-brand-100 p-6 text-center">
              <div className="text-sm font-medium text-brand-800">Huella de este vuelo</div>
              <div className="mt-1 text-5xl font-bold text-brand-800 tabular-nums">
                {fmtInt(result.emissions.kgCO2e)} <span className="text-xl font-semibold">kg CO₂e</span>
              </div>
              <div className="mt-2 text-sm text-brand-800">{fmtNum(result.emissions.tonCO2e, 2)} toneladas</div>
            </div>

            <p className="mt-5 mb-0 text-sm text-gray-600 text-center">
              En el siguiente paso eliges el proyecto y ves exactamente qué financia tu compensación y cuánto cuesta.
            </p>

            <div className="mt-5 flex flex-col-reverse sm:flex-row gap-3">
              <button type="button" onClick={() => setCurrentStep('form')} className={cx(btn.secondary, 'sm:flex-1')}>
                <FaArrowLeft aria-hidden="true" /> Modificar vuelo
              </button>
              <button type="button" onClick={handleViewProjects} disabled={!calculationId} className={cx(btn.primary, 'sm:flex-[2]')}>
                <FaLeaf aria-hidden="true" /> Elegir proyecto para compensar
              </button>
            </div>
            {!calculationId && (
              <p className="mt-3 mb-0 text-xs text-gray-500 text-center">Para compensar necesitas iniciar sesión: el cálculo se guarda en tu cuenta.</p>
            )}
          </Card>
        </div>
      )}
    </B2CLayout>
  );
};

export default B2CCalculator;
