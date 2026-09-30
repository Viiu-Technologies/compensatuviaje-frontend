import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiArrowLeft, 
  HiArrowRight, 
  HiSwitchHorizontal, 
  HiSparkles, 
  HiInformationCircle, 
  HiCheckCircle,
  HiOutlineGlobe,
  HiOutlineShieldCheck
} from 'react-icons/hi';
import { FaPlane, FaUsers, FaLeaf, FaTree } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  POPULAR_AIRPORTS, 
  estimateEmissions, 
  type EstimateResponse 
} from '../services/publicApi';
import './CalculatorPage.css';
import { useSeo } from '../../../shared/utils/useSeo';

const CABIN_OPTIONS = [
  { value: 'economy', label: 'Económica' },
  { value: 'premium_economy', label: 'Premium Economy' },
  { value: 'business', label: 'Business / Ejecutiva' },
  { value: 'first', label: 'Primera Clase' },
];

const QUICK_ROUTES = [
  { origin: 'SCL', destination: 'LIM', label: 'Santiago ⇄ Lima' },
  { origin: 'SCL', destination: 'BUE', label: 'Santiago ⇄ Buenos Aires' },
  { origin: 'SCL', destination: 'MIA', label: 'Santiago ⇄ Miami' },
  { origin: 'SCL', destination: 'MAD', label: 'Santiago ⇄ Madrid' },
  { origin: 'SCL', destination: 'BOG', label: 'Santiago ⇄ Bogotá' },
  { origin: 'SCL', destination: 'GRU', label: 'Santiago ⇄ São Paulo' },
];

const fmtCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

const CalculatorPage: React.FC = () => {
  const [origin, setOrigin] = useState('SCL');
  const [destination, setDestination] = useState('LIM');
  const [cabinCode, setCabinCode] = useState<'economy' | 'premium_economy' | 'business' | 'first'>('economy');
  const [passengers, setPassengers] = useState(1);
  const [roundTrip, setRoundTrip] = useState(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EstimateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useSeo({
    title: 'Calculadora de Huella de Carbono de Vuelos',
    description: 'Calcula gratis las emisiones de CO₂ de tu vuelo con factores DEFRA y compénsalas con proyectos verificados.',
    path: '/calculadora',
  });

  const originAirport = useMemo(
    () => POPULAR_AIRPORTS.find((a) => a.code === origin) || POPULAR_AIRPORTS[0],
    [origin]
  );
  const destAirport = useMemo(
    () => POPULAR_AIRPORTS.find((a) => a.code === destination) || POPULAR_AIRPORTS[1],
    [destination]
  );

  const calculate = async () => {
    if (origin === destination) {
      setError('El aeropuerto de origen y destino no pueden ser idénticos.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await estimateEmissions({
        origin,
        destination,
        cabinCode,
        passengers,
        roundTrip,
      });

      // Solo el resultado del backend. Antes había dos cálculos de respaldo
      // (distancias fijas y factores 0,25/0,15/0,145) que mostraban cifras
      // inventadas como si fueran el cálculo oficial.
      if (res.status === 'success' && res.emissions && res.meta) {
        setResult(res);
      } else {
        setResult(null);
        setError(res.message || 'No pudimos calcular las emisiones de este vuelo.');
      }
    } catch (err: any) {
      setResult(null);
      setError(err?.message || 'No pudimos conectar con la calculadora. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [origin, destination, cabinCode, passengers, roundTrip]);

  const swapAirports = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  // Todo sale del backend de la calculadora (emisiones, equivalencia y precio).
  const emissions = result?.emissions;
  const trees = result?.equivalencies?.trees;
  const pricing = result?.pricing ?? null;
  const methodology = emissions?.methodology ?? 'DEFRA';

  return (
    <div className="calcp-page">
      <Header />

      <main className="calcp-main">
        {/* Hero */}
        <section className="calcp-hero">
          <div className="calcp-container">
            <Link to="/" className="calcp-back-link">
              <HiArrowLeft /> Volver al inicio
            </Link>

            <span className="calcp-eyebrow">
              <HiSparkles /> Calculadora Científica y Transparente
            </span>

            <h1 className="calcp-title">
              Calcula con precisión la huella de tu viaje.
            </h1>

            <p className="calcp-lead">
              Utilizamos los factores de emisión oficiales de {methodology} para vuelos, aplicados según el GHG Protocol, para ofrecerte un cálculo transparente y auditable.
            </p>

            {/* Quick Route Pills */}
            <div className="calcp-quick-routes">
              <span className="calcp-quick-label">Rutas frecuentes:</span>
              <div className="calcp-quick-pills">
                {QUICK_ROUTES.map((r) => (
                  <button
                    key={`${r.origin}-${r.destination}`}
                    className={`calcp-quick-pill ${origin === r.origin && destination === r.destination ? 'calcp-quick-pill--active' : ''}`}
                    onClick={() => {
                      setOrigin(r.origin);
                      setDestination(r.destination);
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Interactive Grid */}
        <section className="calcp-calc-section">
          <div className="calcp-container">
            <div className="calcp-grid">
              {/* Form Col */}
              <div className="calcp-form-card">
                <div className="calcp-form-header">
                  <FaPlane className="calcp-icon-green" />
                  <h2>Configura los datos del vuelo</h2>
                </div>

                {/* Tipo de viaje */}
                <div className="calcp-trip-type">
                  <button
                    className={`calcp-type-btn ${roundTrip ? 'calcp-type-btn--active' : ''}`}
                    onClick={() => setRoundTrip(true)}
                  >
                    Ida y vuelta
                  </button>
                  <button
                    className={`calcp-type-btn ${!roundTrip ? 'calcp-type-btn--active' : ''}`}
                    onClick={() => setRoundTrip(false)}
                  >
                    Solo ida
                  </button>
                </div>

                {/* Aeropuertos Origen y Destino */}
                <div className="calcp-airports-wrap">
                  <div className="calcp-field">
                    <label>Aeropuerto de Origen</label>
                    <select
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="calcp-select"
                    >
                      {POPULAR_AIRPORTS.map((a) => (
                        <option key={`orig-${a.code}`} value={a.code}>
                          {a.code} — {a.city}, {a.country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={swapAirports}
                    className="calcp-swap-btn"
                    title="Intercambiar origen y destino"
                  >
                    <HiSwitchHorizontal />
                  </button>

                  <div className="calcp-field">
                    <label>Aeropuerto de Destino</label>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="calcp-select"
                    >
                      {POPULAR_AIRPORTS.map((a) => (
                        <option key={`dest-${a.code}`} value={a.code}>
                          {a.code} — {a.city}, {a.country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pasajeros y Clase de Cabina */}
                <div className="calcp-row">
                  <div className="calcp-field">
                    <label>Pasajeros</label>
                    <div className="calcp-counter">
                      <button
                        type="button"
                        onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                        disabled={passengers <= 1}
                      >
                        -
                      </button>
                      <span>{passengers}</span>
                      <button
                        type="button"
                        onClick={() => setPassengers((p) => Math.min(20, p + 1))}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="calcp-field">
                    <label>Clase de Cabina</label>
                    <select
                      value={cabinCode}
                      onChange={(e) => setCabinCode(e.target.value as any)}
                      className="calcp-select"
                    >
                      {CABIN_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && <div className="calcp-error">{error}</div>}
              </div>

              {/* Results & Equivalencies Col */}
              <div className="calcp-results-card">
                <div className="calcp-results-badge">
                  <FaLeaf /> Resultado del cálculo
                </div>

                <div className="calcp-emissions-highlight">
                  <span className="calcp-emissions-number">
                    {emissions ? emissions.tonCO2e.toLocaleString('es-CL', { maximumFractionDigits: 2 }) : '—'}
                  </span>
                  <span className="calcp-emissions-unit">
                    toneladas de CO₂e
                  </span>
                  {emissions && (
                    <p className="calcp-emissions-sub">
                      ({Math.round(emissions.kgCO2e).toLocaleString('es-CL')} kg de CO₂ equivalente total)
                    </p>
                  )}
                </div>

                {/* Detalle de ruta */}
                <div className="calcp-route-summary">
                  <div className="calcp-route-item">
                    <span>Distancia total estimada</span>
                    <strong>{result?.meta?.distanceKmTotal ? `${Math.round(result.meta.distanceKmTotal).toLocaleString('es-CL')} km` : '—'}</strong>
                  </div>
                  <div className="calcp-route-item">
                    <span>Trayecto</span>
                    <strong>{origin} ⇄ {destination} ({roundTrip ? 'Ida y vuelta' : 'Solo ida'})</strong>
                  </div>
                  {pricing && (
                    <div className="calcp-route-item">
                      <span>Compensación desde</span>
                      <strong className="calcp-price-tag">
                        {fmtCLP(pricing.fromTotalCLP)} CLP
                        <small> ({fmtCLP(pricing.fromPricePerTonCLP)}/t en el proyecto más accesible)</small>
                      </strong>
                    </div>
                  )}
                </div>

                {/* Equivalencia (la que calcula el backend: 1 t = 1 árbol) */}
                {trees !== undefined && (
                  <div className="calcp-equiv-section">
                    <h4>Equivalencia ambiental:</h4>
                    <div className="calcp-equiv-grid">
                      <div className="calcp-equiv-item">
                        <FaTree className="calcp-equiv-icon calcp-equiv-icon--tree" />
                        <div>
                          <strong>~{trees.toLocaleString('es-CL')} {trees === 1 ? 'árbol' : 'árboles'}</strong>
                          <span>equivalentes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA Compensar */}
                <div className="calcp-cta-box">
                  <Link
                    to="/#proyectos"
                    className="calcp-cta-btn"
                  >
                    Compensar con Proyectos Verificados
                    <HiArrowRight />
                  </Link>
                  <p className="calcp-cta-guarantee">
                    <HiOutlineShieldCheck />
                    Certificado digital verificable + Registro inmutable
                  </p>
                </div>
              </div>
            </div>

            {/* Metodología y Fuentes Científicas */}
            <div className="calcp-method-box" id="metodologia">
              <div className="calcp-method-header">
                <HiInformationCircle />
                <h3>Bases científicas y estándares internacionales de cálculo</h3>
              </div>
              <p className="calcp-method-desc">
                Cada resultado emitido por esta calculadora se basa estrictamente en ecuaciones del <strong>GHG Protocol Corporate Value Chain (Scope 3) Standard</strong> y las tablas anuales publicadas por el <strong>Department for Environment, Food and Rural Affairs (DEFRA, Reino Unido)</strong>.
              </p>
              <div className="calcp-sources-grid">
                <a
                  href="https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="calcp-source-card"
                >
                  <span className="calcp-source-badge">{methodology}</span>
                  <h4>Factores de Conversión Gubernamentales</h4>
                  <p>Tablas oficiales para vuelos de corto, medio y largo alcance según cabina.</p>
                  <span className="calcp-source-link">Ver fuente oficial en gov.uk →</span>
                </a>

                <a
                  href="https://ghgprotocol.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="calcp-source-card"
                >
                  <span className="calcp-source-badge">GHG Protocol</span>
                  <h4>Estándar Corporativo de Alcance 3</h4>
                  <p>Directrices globales para contabilidad de emisiones en viajes de negocios.</p>
                  <span className="calcp-source-link">Ver marco metodológico →</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CalculatorPage;
