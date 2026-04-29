import React, { useState, useEffect, lazy, Suspense } from 'react';
import { FaCalculator, FaLeaf, FaChartLine, FaShieldAlt, FaBolt, FaGlobe, FaDatabase, FaAward, FaLock } from 'react-icons/fa';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';
import { useInView } from 'react-intersection-observer';
import './Features.css';
import LogoLoopComponent from './LogoLoop';
import scapelandImg from '../../../assets/images/scapeland-chileflag.jpg';
const CarbonCalculatorModal = lazy(() => import('../../b2c/components/CarbonCalculatorModal'));

const Features = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = scapelandImg as string;
  }, []);

  const paymentMethods = [
    { name: 'Visa', logo: '/images/payment-logos/visa.svg' },
    { name: 'Stripe', logo: '/images/payment-logos/stripe.svg' },
    { name: 'Google Pay', logo: '/images/payment-logos/google-pay.svg' },
    { name: 'Apple Pay', logo: '/images/payment-logos/apple-pay.svg' },
    { name: 'PayPal', logo: '/images/payment-logos/paypal-logo.svg' }
  ];

  const benefits = [
    { icon: FaDatabase, text: 'Datos DEFRA UK actualizados', color: 'text-emerald-500' },
    { icon: FaShieldAlt, text: 'Metodología verificada', color: 'text-blue-500' },
    { icon: FaAward, text: '1 cálculo gratuito', color: 'text-amber-500' },
  ];

  const openCalculator = () => {
    setIsModalOpen(true);
  };

  const closeCalculator = () => {
    setIsModalOpen(false);
  };

  return (
    <section className="features section-padding" id="calculadora">
      <div className="container">
        {/* Título principal */}
        <div className="features-header text-center fade-in-up">
          <h2>Compensa tu Viaje: La Sostenibilidad es Posible</h2>
        </div>

        {/* Métodos de pago */}
        <div className="payment-methods fade-in-up">
          <div className="payment-loop-wrapper">
            <LogoLoopComponent
              logos={paymentMethods.map(m => ({ src: m.logo, alt: m.name }))}
              logoHeight={76}
              gap={80}
              speed={120}
            />
          </div>
        </div>

        {/* Título principal centrado */}
        <div 
          className={`features-main-title ${inView ? 'features-visible' : 'features-hidden'}`}
          ref={ref}
        >
          <div className="calculator-badge-centered">
            <HiSparkles className="badge-icon" />
            Compensa tu huella de carbono hoy
          </div>
          
          <h2 className="main-title-large">
            La forma más <span className="text-gradient">transparente</span> de compensar tu impacto en el planeta
          </h2>
        </div>

        {/* Contenido principal con calculadora */}
        <div className="features-content" id="calculadora-content">
          <div className={`content-left ${inView ? 'features-visible' : 'features-hidden'}`}>

            {/* Tarjeta de calculadora premium */}
            <div className="calculator-card-modern hover:!scale-[1.02] hover:!-translate-y-1 !transition-all !duration-300">
              {/* Gradient background animado */}
              <div className="card-gradient-bg"></div>
              
              <div className="card-content">
                {/* Premium badge */}
                <div
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#fff', fontSize: '12px', fontWeight: 700,
                    padding: '4px 12px', borderRadius: '100px',
                    marginBottom: '16px', letterSpacing: '0.5px'
                  }}
                >
                  <FaAward style={{ fontSize: '12px' }} />
                  1 CÁLCULO GRATUITO
                </div>

                <div className="card-icon-wrapper">
                  <div className="animate-wiggle">
                    <FaCalculator className="card-icon" />
                  </div>
                  <div className="icon-glow"></div>
                </div>

                <h4 className="card-title">
                  <HiLightningBolt className="inline-icon" />
                  Calculadora de Carbono
                </h4>
                
                <p className="card-description" style={{ fontSize: '14px', lineHeight: 1.6 }}>
                  Nuestra calculadora utiliza los factores de emisión oficiales del <strong>DEFRA</strong> (UK Government) y metodologías certificadas internacionalmente para entregar cálculos precisos de tu huella de carbono.
                </p>

                {/* Trust indicators */}
                <div className="card-benefits">
                  {benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <div 
                        key={index}
                        className="benefit-item"
                      >
                        <Icon className={`benefit-icon ${benefit.color}`} />
                        <span>{benefit.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Fine print */}
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '12px 0 16px', lineHeight: 1.5 }}>
                  <FaLock style={{ display: 'inline', marginRight: '4px', fontSize: '10px' }} />
                  Datos basados en DEFRA 2024 · GHG Protocol · ICAO Carbon Calculator
                </p>

                <button 
                  className="calculator-cta-btn hover:!scale-105 active:!scale-95 !transition-transform"
                  onClick={openCalculator}
                >
                  <span className="btn-text">Calcular mi huella gratis</span>
                  <span className="btn-arrow animate-bounce-x">→</span>
                </button>
              </div>
            </div>
          </div>

          <div className={`content-right ${inView ? 'features-visible' : 'features-hidden'}`}>
            <div className="nature-image">
              <div 
                className="image-placeholder hover:!scale-[1.03] !transition-transform !duration-400"
                data-loaded={imageLoaded}
                style={{
                  backgroundImage: imageLoaded ? `url(${scapelandImg})` : 'none',
                  opacity: imageLoaded ? 1 : 0.8
                }}
              >
                <div className="image-floating-badge">
                  <FaLeaf className="badge-leaf-icon" />
                  <div>
                    <span className="badge-value">15,420+</span>
                    <span className="badge-label">Toneladas CO₂ compensadas</span>
                  </div>
                </div>
                
                <div className="image-overlay">
                  <FaGlobe className="overlay-icon" />
                  <span>Paisajes naturales que ayudamos a preservar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Calculadora */}
      {isModalOpen && (
        <Suspense fallback={null}>
          <CarbonCalculatorModal 
            isOpen={isModalOpen} 
            onClose={closeCalculator} 
          />
        </Suspense>
      )}
    </section>
  );
};

export default Features;