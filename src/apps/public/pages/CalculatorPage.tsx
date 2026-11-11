import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft, HiInformationCircle } from 'react-icons/hi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QuickFlightCalculator, { type CabinCode } from '../components/QuickFlightCalculator';
import { flightFromEstimate, setFlight } from '../components/howItWorks/flight';
import type { EstimateResponse } from '../services/publicApi';
import './CalculatorPage.css';
import { useSeo } from '../../../shared/utils/useSeo';
import { PUBLIC_SEO } from '../../../shared/config/publicSeo';
import { useForceLightTheme } from '../../../shared/utils/useForceLightTheme';

// Anillos de distancia con los asientos de cabina: por qué cambia el factor.
const FactorRings = lazy(() => import('../components/factorRings/FactorRings'));

/**
 * Página /calculadora.
 *
 * Usa la misma calculadora que el Hero del landing (QuickFlightCalculator).
 * Antes tenía una copia propia, con otros controles (selects nativos, otro
 * orden de "ida y vuelta"), otro panel de resultado (tarjeta teal oscura con
 * botón verde vivo, 2,97:1 con texto blanco) y un botón "Compensar" que
 * llevaba a /#proyectos: el mismo camino circular que ya se había corregido
 * en el landing. Ahora el botón lleva a /b2c/calculator con el vuelo cargado,
 * igual que desde el Hero, y los errores de red se muestran con el mensaje
 * amable del componente en vez de "Failed to fetch".
 */
const CalculatorPage: React.FC = () => {
  // La versión de la metodología (p. ej. "DEFRA 2025") llega con el cálculo.
  const [methodology, setMethodology] = useState('DEFRA');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useSeo(PUBLIC_SEO['/calculadora']);

  // Mismo criterio que el landing: las páginas públicas van en tema claro.
  useForceLightTheme();

  const handleEstimate = (res: EstimateResponse, request: { cabinCode: CabinCode }) => {
    if (res.emissions?.methodology) setMethodology(res.emissions.methodology);
    // La figura de metodología parte en este mismo vuelo.
    setFlight(flightFromEstimate(res, request.cabinCode));
  };

  return (
    <div className="calcp-page">
      <Header />

      <main className="calcp-main">
        <section className="calcp-hero">
          <div className="calcp-container">
            <Link to="/" className="calcp-back-link">
              <HiArrowLeft aria-hidden="true" /> Volver al inicio
            </Link>

            <div className="calcp-eyebrow">
              <span className="calcp-eyebrow__line" aria-hidden="true" />
              <span>Calculadora de huella de carbono</span>
            </div>

            <h1 className="calcp-title">
              Calcula con precisión la huella de tu viaje.
            </h1>

            <p className="calcp-lead">
              Utilizamos los factores de emisión oficiales de {methodology} para vuelos, aplicados según el GHG Protocol, para ofrecerte un cálculo transparente y auditable.
            </p>
          </div>
        </section>

        <section className="calcp-calc-section">
          <div className="calcp-container">
            <div className="calcp-calculator">
              <QuickFlightCalculator onEstimate={handleEstimate} />
            </div>

            {/* Metodología y fuentes */}
            <div className="calcp-method-box" id="metodologia">
              <div className="calcp-method-header">
                <HiInformationCircle aria-hidden="true" />
                <h2>Bases científicas y estándares internacionales de cálculo</h2>
              </div>
              <p className="calcp-method-desc">
                Cada resultado emitido por esta calculadora se basa estrictamente en ecuaciones del <strong>GHG Protocol Corporate Value Chain (Scope 3) Standard</strong> y las tablas anuales publicadas por el <strong>Department for Environment, Food and Rural Affairs (DEFRA, Reino Unido)</strong>.
              </p>
              <Suspense fallback={null}>
                <FactorRings />
              </Suspense>
              <div className="calcp-sources-grid">
                <a
                  href="https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="calcp-source-card"
                >
                  <span className="calcp-source-badge">{methodology}</span>
                  <h3>Factores de Conversión Gubernamentales</h3>
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
                  <h3>Estándar Corporativo de Alcance 3</h3>
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
