import React, { lazy, Suspense } from 'react';
import { FaDatabase, FaShieldAlt, FaAward, FaLock, FaBolt, FaCalculator } from 'react-icons/fa';
import { HiSparkles, HiArrowRight } from 'react-icons/hi';
import { useInView } from 'react-intersection-observer';
import LogoLoopComponent from './LogoLoop';
import './Features.css';

const CarbonCalculatorModal = lazy(() => import('../../b2c/components/CarbonCalculatorModal'));

const TRUST_ITEMS = [
  { icon: FaDatabase,  label: 'Datos DEFRA UK actualizados', colorClass: 'trust-item--green' },
  { icon: FaShieldAlt, label: 'Metodología verificada',       colorClass: 'trust-item--blue'  },
  { icon: FaAward,     label: 'Certificación internacional',  colorClass: 'trust-item--amber' },
];

const Features = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="ft-section" id="calculadora">
      <div className="ft-container">

        {/* ── Métodos de pago ── */}
        <div className="ft-payment">
          <LogoLoopComponent />
        </div>

        {/* ── Badge + título ── */}
        <div
          ref={ref}
          className={`ft-header ${inView ? 'ft-visible' : 'ft-hidden'}`}
        >
          <span className="ft-badge">
            <HiSparkles aria-hidden="true" />
            Compensa tu huella de carbono hoy
          </span>

          <h2 className="ft-title">
            La forma más <span className="ft-title__accent">transparente</span> de
            compensar tu impacto en el planeta
          </h2>
        </div>

        {/* ── Card calculadora ── */}
        <div
          id="calculadora-content"
          className={`ft-card ${inView ? 'ft-visible' : 'ft-hidden'} ft-visible--delay`}
        >
          {/* Cabecera verde */}
          <div className="ft-card__top">
            <div className="ft-card__icon" aria-hidden="true">
              <FaCalculator />
            </div>

            <div className="ft-card__top-text">
              <h3 className="ft-card__name">
                <FaBolt className="ft-card__bolt" aria-hidden="true" />
                Calculadora de Carbono
              </h3>
              <p className="ft-card__sub">
                Cálculos precisos con factores de emisión oficiales del{' '}
                <strong>DEFRA</strong> y metodologías certificadas internacionalmente.
              </p>
              <span className="ft-card__pill">
                <FaAward aria-hidden="true" />
                1 CÁLCULO GRATUITO
              </span>
            </div>
          </div>

          {/* Cuerpo */}
          <div className="ft-card__body">
            {/* Trust grid */}
            <div className="ft-trust-grid">
              {TRUST_ITEMS.map(({ icon: Icon, label, colorClass }) => (
                <div key={label} className={`ft-trust-item ${colorClass}`}>
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Descripción con borde verde */}
            <p className="ft-card__desc">
              Usamos los factores del <strong>DEFRA 2024</strong>,{' '}
              <strong>GHG Protocol</strong> e{' '}
              <strong>ICAO Carbon Calculator</strong> para una huella exacta y auditada.
            </p>

            {/* Fine print */}
            <p className="ft-card__fine">
              <FaLock aria-hidden="true" />
              DEFRA 2024 · GHG Protocol · ICAO Carbon Calculator
            </p>

            {/* CTA */}
            <button
              className="ft-cta"
              onClick={() => setIsModalOpen(true)}
            >
              <FaCalculator aria-hidden="true" />
              Calcular mi huella gratis
              <HiArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Suspense fallback={null}>
          <CarbonCalculatorModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </Suspense>
      )}
    </section>
  );
};

export default Features;