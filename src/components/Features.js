import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalculator, FaLeaf, FaChartLine, FaShieldAlt, FaBolt, FaGlobe } from 'react-icons/fa';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';
import { useInView } from 'react-intersection-observer';
import './Features.css';
import CarbonCalculatorModal from './CarbonCalculatorModal';

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
    img.src = '/images/mountain-landscape.jpg';
  }, []);

  const paymentMethods = [
    { name: 'Visa', logo: '/images/payment-logos/visa.png' },
    { name: 'Google Pay', logo: '/images/payment-logos/google-pay.png' },
    { name: 'Apple Pay', logo: '/images/payment-logos/apple-pay.png' },
    { name: 'PayPal', logo: '/images/payment-logos/paypal-logo.png' },
    { name: 'Stripe', logo: '/images/payment-logos/stripe.png' }
  ];

  const benefits = [
    { icon: FaBolt, text: 'Cálculo en segundos', color: 'text-accent-500' },
    { icon: FaShieldAlt, text: '100% Verificado', color: 'text-primary-500' },
    { icon: FaGlobe, text: 'Impacto Global', color: 'text-secondary-500' },
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
          <div className="payment-grid">
            {paymentMethods.map((method, index) => (
              <div key={index} className="payment-method">
                <div className="payment-logo">
                  <img 
                    src={method.logo} 
                    alt={method.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
                <span className="payment-name">{method.name}</span>
              </div>
            ))}
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

            {/* Tarjeta de calculadora mejorada */}
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
                <div className="card-icon-wrapper">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <FaCalculator className="card-icon" />
                  </motion.div>
                  <div className="icon-glow"></div>
                </div>

                <h4 className="card-title">
                  <HiLightningBolt className="inline-icon" />
                  Calculadora de Carbono
                </h4>
                
                <p className="card-description">
                  Calcula tu huella de carbono en segundos y descubre cómo compensar tu impacto ambiental
                </p>

                {/* Benefits */}
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

                <motion.button 
                  className="calculator-cta-btn"
                  onClick={openCalculator}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="btn-text">Abrir Calculadora</span>
                  <motion.span 
                    className="btn-arrow"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
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
                  backgroundImage: imageLoaded ? 'url(/images/mountain-landscape.jpg)' : 'none',
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
      <CarbonCalculatorModal 
        isOpen={isModalOpen} 
        onClose={closeCalculator} 
      />
    </section>
  );
};

export default Features;