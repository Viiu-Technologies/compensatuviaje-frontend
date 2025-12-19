import React from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaPlane, FaChartLine, FaUsers, FaBuilding } from 'react-icons/fa';
import { HiSparkles, HiArrowRight } from 'react-icons/hi';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import './Hero.css';

const Hero = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const stats = [
    { 
      icon: FaLeaf, 
      value: 15420, 
      label: 'Toneladas CO₂ Compensadas', 
      suffix: '+', 
      gradient: 'from-emerald-400 to-green-500',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-green-600',
      glow: 'shadow-emerald-500/40'
    },
    { 
      icon: FaPlane, 
      value: 8234, 
      label: 'Vuelos Compensados', 
      suffix: '+', 
      gradient: 'from-blue-400 to-cyan-500',
      iconBg: 'bg-gradient-to-br from-blue-400 to-cyan-600',
      glow: 'shadow-blue-500/40'
    },
    { 
      icon: FaUsers, 
      value: 3567, 
      label: 'Empresas Certificadas', 
      suffix: '+', 
      gradient: 'from-amber-400 to-orange-500',
      iconBg: 'bg-gradient-to-br from-amber-400 to-orange-600',
      glow: 'shadow-amber-500/40'
    },
  ];

  const scrollToCalculator = () => {
    const element = document.getElementById('calculadora');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" id="inicio">
      {/* Background con overlay premium */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero-background.jpg)' }}
      >
        {/* Overlay con gradiente más sofisticado */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: `
              linear-gradient(180deg, rgba(15, 23, 42, 0.55) 0%, rgba(15, 23, 42, 0.65) 100%),
              linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 58, 138, 0.55) 50%, rgba(15, 23, 42, 0.7) 100%)
            `
          }}
        />
      </div>

      {/* Blobs decorativos sutiles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[900px] h-[900px] bg-blue-500/20 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-28 lg:py-32" style={{ maxWidth: '1280px' }}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Columna Izquierda */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="text-center lg:text-left flex flex-col items-center lg:items-start"
          >
            {/* Badge Premium */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center !gap-3.5 bg-white/15 backdrop-blur-xl border border-white/25 !px-7 !py-0.5 rounded-full shadow-xl !mt-10 !mb-6"
            >
              <HiSparkles className="text-emerald-400 text-lg animate-pulse shrink-0" />
              <span className="text-sm font-semibold text-white/95 tracking-wide !leading-[1.2]">
                Plataforma #1 en Chile
              </span>
            </motion.div>

            {/* Título Principal */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.2] tracking-tight mb-10"
              style={{ textShadow: '0 4px 30px rgba(0,0,0,0.4)' }}
            >
              <span className="text-white">Compensa</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-400 to-teal-400" style={{ WebkitTextStroke: '0.5px rgba(255,255,255,0.1)' }}>
                tu Viaje
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-400 to-teal-400" style={{ WebkitTextStroke: '0.5px rgba(255,255,255,0.1)' }}>
                Sostenible
              </span>
            </motion.h1>

            {/* Subtítulo */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-lg !mb-14 sm:!mb-16 text-left"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
            >
              La forma más <span className="text-white font-bold">transparente</span> y{' '}
              <span className="text-white font-bold">efectiva</span> de neutralizar el impacto 
              ambiental de tus viajes corporativos y personales.
            </motion.p>

            {/* Botones CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto mb-12"
            >
              <motion.button
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={scrollToCalculator}
                className="group relative inline-flex justify-center items-center !gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:via-amber-400 hover:to-orange-400 text-slate-900 font-bold text-lg !px-10 !py-4 !leading-[1.15] !min-h-[56px] whitespace-nowrap rounded-2xl shadow-2xl shadow-amber-500/40 hover:shadow-amber-400/50 transition-all duration-300 overflow-hidden"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <FaChartLine className="text-xl group-hover:scale-110 transition-transform relative z-10" />
                <span className="relative z-10">Calcula tu Huella</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex justify-center items-center !gap-3 bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-xl text-white font-semibold text-lg !px-10 !py-4 !leading-[1.15] !min-h-[56px] whitespace-nowrap rounded-2xl border-2 border-white/40 hover:border-white/70 shadow-lg shadow-black/20 hover:shadow-xl transition-all duration-300"
              >
                <span>Cómo Funciona</span>
                <HiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 !pt-8 lg:!pt-10"
            >
              {[
                { color: 'bg-emerald-400', glow: 'shadow-emerald-400/80', text: '100% Verificado' },
                { color: 'bg-blue-400', glow: 'shadow-blue-400/80', text: 'Certificación ISO' },
                { color: 'bg-amber-400', glow: 'shadow-amber-400/80', text: 'Transparencia Total' },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-2.5 text-white text-sm font-semibold"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                >
                  <div className={`w-2.5 h-2.5 ${item.color} rounded-full shadow-lg ${item.glow}`} />
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Columna Derecha - Cards */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col gap-5 w-full max-w-[420px] mx-auto lg:mx-0 lg:ml-auto"
          >
            {/* Stats Cards */}
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 40, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.15, duration: 0.6 }}
                  whileHover={{ 
                    y: -6, 
                    scale: 1.02, 
                    transition: { duration: 0.25 } 
                  }}
                  className={`
                    group relative overflow-hidden
                    bg-white/10 backdrop-blur-2xl 
                    rounded-2xl lg:rounded-3xl 
                    !px-9 py-6 lg:!px-12 lg:py-7
                    flex items-center gap-6
                    border border-white/20 hover:border-white/40
                    shadow-2xl ${stat.glow}
                    transition-all duration-300
                  `}
                >
                  {/* Glow effect en hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${stat.gradient} blur-3xl -z-10`} />
                  
                  {/* Icono con gradiente vibrante */}
                  <div className={`
                    relative flex-shrink-0
                    p-4 rounded-xl lg:rounded-2xl 
                    ${stat.iconBg}
                    shadow-lg ${stat.glow}
                    group-hover:scale-110 group-hover:rotate-3
                    transition-all duration-300
                  `}>
                    <Icon className="text-2xl lg:text-3xl text-white drop-shadow-md" />
                  </div>
                  
                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1">
                      {inView && (
                        <CountUp
                          end={stat.value}
                          duration={2.5}
                          separator=","
                          className="text-3xl lg:text-4xl font-black text-white tracking-tight"
                        />
                      )}
                      <span className="text-xl lg:text-2xl font-bold text-white/80">{stat.suffix}</span>
                    </div>
                    <p className="text-white/60 font-medium text-sm lg:text-base mt-1 truncate">
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {/* Card Empresa - Premium Glass */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.95, duration: 0.6 }}
              whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.25 } }}
              className="group relative overflow-hidden rounded-2xl lg:rounded-3xl"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700" />
              
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
              
              {/* Pattern overlay sutil */}
              <div className="absolute inset-0 opacity-[0.03]" 
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h20v20H0z" fill="none"/%3E%3Cpath d="M10 0v20M0 10h20" stroke="%23fff" stroke-width=".5"/%3E%3C/svg%3E")' }}
              />
              
              {/* Contenido */}
              <div className="relative !px-9 py-6 lg:!px-12 lg:py-7 flex items-center gap-6">
                <div className="flex-shrink-0 p-4 rounded-xl lg:rounded-2xl bg-white/20 backdrop-blur-md shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaBuilding className="text-2xl lg:text-3xl text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">
                    ¿Eres Empresa?
                  </h3>
                  <p className="text-white/80 text-sm lg:text-base mb-3 leading-snug">
                    Certifica tus operaciones y lidera el cambio sostenible.
                  </p>
                  <button className="group/btn inline-flex items-center gap-2 text-emerald-300 hover:text-white font-semibold text-sm transition-colors duration-200">
                    Registro Empresarial
                    <HiArrowRight className="text-lg group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator mejorado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-3 cursor-pointer group"
        onClick={() => {
          const element = document.getElementById('calculadora');
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <motion.span 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-xs uppercase tracking-[0.25em] text-white/60 font-semibold group-hover:text-white/90 transition-colors"
        >
          Descubre más
        </motion.span>
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-7 h-11 rounded-full border-2 border-white/30 group-hover:border-white/60 flex justify-center pt-2.5 transition-colors"
        >
          <motion.div 
            animate={{ y: [0, 6, 0], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-3 bg-white/60 group-hover:bg-white/90 rounded-full transition-colors" 
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;