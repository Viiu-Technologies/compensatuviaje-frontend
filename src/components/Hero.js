import React from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaPlane, FaChartLine, FaUsers } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

const Hero = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Estadísticas en tiempo real (simuladas)
  const stats = [
    { icon: FaLeaf, value: 15420, label: 'Toneladas CO₂ Compensadas', suffix: '+', color: 'text-primary-500' },
    { icon: FaPlane, value: 8234, label: 'Vuelos Compensados', suffix: '+', color: 'text-secondary-500' },
    { icon: FaUsers, value: 3567, label: 'Empresas Certificadas', suffix: '+', color: 'text-accent-500' },
  ];

  const scrollToCalculator = () => {
    const element = document.getElementById('calculadora');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" id="inicio">
      {/* Background Image de Chile con overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/hero-background.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-secondary-900/70 to-neutral-900/80"></div>
      </div>

      {/* Animated background blobs encima del overlay */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary-300/40 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-300/40 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 badge-primary mb-6"
            >
              <HiSparkles className="text-primary-600" />
              <span>Plataforma #1 en Chile para compensación de CO₂</span>
            </motion.div>

            {/* Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold mb-6 leading-tight">
              <span className="block text-white">Compensa tu</span>
              <span className="block text-gradient-primary bg-clip-text text-transparent bg-gradient-to-r from-primary-300 to-primary-500">
                Viaje Sostenible
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto lg:mx-0">
              La forma más <span className="text-primary-300 font-semibold">transparente</span> y <span className="text-secondary-300 font-semibold">efectiva</span> de neutralizar el impacto ambiental de tus viajes.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToCalculator}
                className="btn-primary text-lg px-8 py-4"
              >
                <FaChartLine className="text-xl" />
                Calcula tu Huella Ahora
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-outline text-lg px-8 py-4"
              >
                Ver Cómo Funciona
              </motion.button>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-6 justify-center lg:justify-start text-sm text-white/80"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                <span>100% Verificado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></div>
                <span>Certificación ISO</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></div>
                <span>Transparencia Total</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Stats Cards */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="card-glass p-6 flex items-center gap-6"
                >
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${
                    stat.color === 'text-primary-500' ? 'from-primary-100 to-primary-200' :
                    stat.color === 'text-secondary-500' ? 'from-secondary-100 to-secondary-200' :
                    'from-accent-100 to-accent-200'
                  }`}>
                    <Icon className={`text-4xl ${stat.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-baseline gap-1">
                      {inView && (
                        <CountUp
                          end={stat.value}
                          duration={2.5}
                          separator=","
                          className={`text-4xl font-bold ${stat.color}`}
                        />
                      )}
                      <span className={`text-3xl font-bold ${stat.color}`}>{stat.suffix}</span>
                    </div>
                    <p className="text-neutral-600 font-medium mt-1">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}

            {/* Additional CTA card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="card-glass p-6 bg-gradient-to-br from-primary-500 to-secondary-500 text-white"
            >
              <div className="flex items-center gap-4">
                <FaLeaf className="text-5xl opacity-90" />
                <div>
                  <h3 className="text-2xl font-bold mb-2">¿Empresa?</h3>
                  <p className="text-white/90 mb-3">Certifica tus operaciones y atrae más clientes</p>
                  <button className="btn bg-white text-primary-600 hover:bg-neutral-100 px-6 py-2 text-sm font-semibold">
                    Registro Empresarial →
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-neutral-500"
        >
          <span className="text-sm font-medium">Descubre más</span>
          <div className="w-6 h-10 rounded-full border-2 border-neutral-400 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-neutral-500 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;