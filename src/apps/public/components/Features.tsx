import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { FaCalculator, FaLeaf, FaChartLine, FaShieldAlt, FaBolt, FaGlobe, FaDatabase, FaAward, FaLock } from 'react-icons/fa';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';
import { useInView } from 'react-intersection-observer';
import './Features.css';
import LogoLoopComponent from './LogoLoop';
// import local image from src assets so bundler serves it correctly
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
    { name: 'Visa', logo: '/images/payment-logos/visa.png' },
    { name: 'Webpay', logo: '/images/payment-logos/stripe.png' },
    { name: 'Google Pay', logo: '/images/payment-logos/google-pay.png' },
    { name: 'Apple Pay', logo: '/images/payment-logos/apple-pay.png' },
    { name: 'PayPal', logo: '/images/payment-logos/paypal-logo.png' }
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
        <motion.div 
          className="features-main-title"
          initial={{ opacity: 0, y: -30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          ref={ref}
        >
          <motion.div 
            className="calculator-badge-centered"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            <HiSparkles className="badge-icon" />
            Compensa tu huella de carbono hoy
          </motion.div>
          
          <motion.h2
            className="main-title-large"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            La forma más <span className="text-gradient">transparente</span> de compensar tu impacto en el planeta
          </motion.h2>
        </motion.div>

        {/* Contenido principal con calculadora */}
        <div className="features-content" id="calculadora-content">
          <motion.div 
            className="content-left"
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >

            {/* Tarjeta de calculadora premium */}
            <motion.div 
              className="calculator-card-modern"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              {/* Gradient background animado */}
              <div className="card-gradient-bg"></div>
              
              <div className="card-content">
                {/* Premium badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.6 }}
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
                </motion.div>

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
                      <motion.div 
                        key={index}
                        className="benefit-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <Icon className={`benefit-icon ${benefit.color}`} />
                        <span>{benefit.text}</span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Fine print */}
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '12px 0 16px', lineHeight: 1.5 }}>
                  <FaLock style={{ display: 'inline', marginRight: '4px', fontSize: '10px' }} />
                  Datos basados en DEFRA 2024 · GHG Protocol · ICAO Carbon Calculator
                </p>

                <motion.button 
                  className="calculator-cta-btn"
                  onClick={openCalculator}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="btn-text">Calcular mi huella gratis</span>
                  <span className="btn-arrow animate-bounce-x">→</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="content-right"
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="nature-image">
              <motion.div 
                className="image-placeholder"
                data-loaded={imageLoaded}
                style={{
                  backgroundImage: imageLoaded ? `url(${scapelandImg})` : 'none',
                  opacity: imageLoaded ? 1 : 0.8
                }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.4 }}
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
              </motion.div>
            </div>
          </motion.div>
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