import React from 'react';
import { FaLeaf, FaPlane, FaChartLine, FaUsers, FaBuilding } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import './Hero.css';

const Hero = () => {
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
    <section className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden" id="inicio">
      {/* Background con overlay premium */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero-background.webp)' }}
      >
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

      {/* Blobs decorativos sutiles - CSS animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[150px] will-change-transform animate-blob-slow" />
        <div className="absolute -bottom-40 -right-40 w-[900px] h-[900px] bg-blue-500/20 rounded-full blur-[150px] will-change-transform animate-blob-slow-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] will-change-transform animate-blob-slow-mid" />
      </div>

      {/* Contenido Principal */}
      <div
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full"
        style={{
          maxWidth: '1280px',
          /* clamp(min, preferred, max) — padding fluido con el viewport height */
          paddingTop: 'clamp(5.5rem, 12vh, 9rem)',
          paddingBottom: 'clamp(2rem, 6vh, 5rem)',
        }}
      >
        <div className="grid lg:grid-cols-2 xl:grid-cols-[1fr_460px] gap-8 lg:gap-12 xl:gap-16 items-center">
          
          {/* Columna Izquierda */}
          <div className="flex flex-col items-start">

            {/* Título Principal */}
            <h1
              className="font-black leading-[1.1] tracking-tight !mb-5 lg:!mb-6"
              style={{
                /* Fluid typography: escala suavemente de 32px (375px) a 72px (1440px+) */
                fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                textShadow: '0 4px 30px rgba(0,0,0,0.4)',
              }}
            >
              <span className="text-white">Compensa</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-400 to-teal-400">
                tu Viaje
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-400 to-teal-400">
                Sostenible
              </span>
            </h1>

            {/* Subtítulo — alineado a la izquierda igual que el título */}
            <p
              className="text-white/85 leading-relaxed max-w-md !mb-8 lg:!mb-10"
              style={{
                /* Fluid: 14px en móvil → 20px en desktop */
                fontSize: 'clamp(0.875rem, 2vw, 1.25rem)',
                textShadow: '0 2px 20px rgba(0,0,0,0.5)',
              }}
            >
              La forma más <span className="text-white font-bold">transparente</span> y{' '}
              <span className="text-white font-bold">efectiva</span> de neutralizar el impacto 
              ambiental de tus viajes corporativos y personales.
            </p>

            {/* Botones CTA */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto !mb-6 lg:!mb-8">
              <button
                onClick={scrollToCalculator}
                className="group relative inline-flex justify-center items-center !gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:via-amber-400 hover:to-orange-400 text-slate-900 font-bold text-base sm:text-lg !px-8 sm:!px-10 !py-3.5 sm:!py-4 !leading-[1.15] !min-h-[48px] sm:!min-h-[56px] whitespace-nowrap rounded-2xl shadow-2xl shadow-amber-500/40 hover:shadow-amber-400/50 hover:!scale-[1.04] hover:!-translate-y-1 active:!scale-[0.97] !transition-all !duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <FaChartLine className="text-lg sm:text-xl group-hover:scale-110 transition-transform relative z-10" />
                <span className="relative z-10">Calcula tu Huella</span>
              </button>
              
              <button
                className="group inline-flex justify-center items-center !gap-3 bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-xl text-white font-semibold text-base sm:text-lg !px-8 sm:!px-10 !py-3.5 sm:!py-4 !leading-[1.15] !min-h-[48px] sm:!min-h-[56px] whitespace-nowrap rounded-2xl border-2 border-white/40 hover:border-white/70 shadow-lg shadow-black/20 hover:shadow-xl hover:!scale-[1.04] hover:!-translate-y-1 active:!scale-[0.97] !transition-all !duration-300"
              >
                <span>Cómo Funciona</span>
                <HiArrowRight className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-nowrap gap-x-3 sm:gap-x-5">
              {[
                { color: 'bg-emerald-400', glow: 'shadow-emerald-400/80', text: '100% Verificado' },
                { color: 'bg-blue-400', glow: 'shadow-blue-400/80', text: 'Certificación ISO' },
                { color: 'bg-amber-400', glow: 'shadow-amber-400/80', text: 'Transparencia Total' },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-1.5 sm:gap-2 text-white/90 text-[11px] sm:text-sm font-medium"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                >
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${item.color} rounded-full shadow-lg ${item.glow}`} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha - Cards (solo desktop) */}
          <div
            className="hidden lg:flex flex-col gap-3 xl:gap-4 w-full"
          >
            {/* Stats Cards */}
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              
              return (
                <div
                  key={index}
                  className={`
                    group relative overflow-hidden
                    bg-white/10 backdrop-blur-2xl 
                    rounded-2xl xl:rounded-3xl 
                    py-5 xl:py-6
                    flex items-center justify-center gap-5 xl:gap-6
                    border border-white/20 hover:border-white/40
                    shadow-2xl ${stat.glow}
                    hover:!-translate-y-1 hover:!scale-[1.02]
                    !transition-all !duration-300 !ease-out
                  `}
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${stat.gradient} blur-3xl -z-10`} />
                  
                  <div className={`
                    relative flex-shrink-0
                    p-3.5 rounded-2xl 
                    ${stat.iconBg}
                    shadow-lg ${stat.glow}
                    group-hover:scale-110 group-hover:rotate-3
                    transition-all duration-300
                  `}>
                    <Icon className="text-3xl text-white drop-shadow-md" />
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-1">
                      <span
                        className="font-black text-white tracking-tight"
                        style={{ fontSize: 'clamp(1.75rem, 2.5vw, 2.5rem)' }}
                      >
                        {stat.value.toLocaleString()}
                      </span>
                      <span
                        className="font-bold text-white/80"
                        style={{ fontSize: 'clamp(1rem, 1.5vw, 1.5rem)' }}
                      >{stat.suffix}</span>
                    </div>
                    <p className="text-white/60 font-medium text-sm xl:text-base mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Card Empresa */}
            <div className="group relative overflow-hidden rounded-2xl xl:rounded-3xl hover:!-translate-y-1 hover:!scale-[1.02] !transition-all !duration-300 !ease-out">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700" />
              <div className="absolute inset-0 bg-white/5" />
              
              <div className="relative py-5 xl:py-6 flex items-center justify-center gap-5 xl:gap-6">
                <div className="flex-shrink-0 p-3.5 rounded-2xl bg-white/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaBuilding className="text-3xl text-white" />
                </div>
                
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-white mb-0.5">
                    ¿Eres Empresa?
                  </h3>
                  <p className="text-white/80 text-sm xl:text-base mb-2 leading-snug">
                    Certifica tus operaciones y lidera el cambio sostenible.
                  </p>
                  <button className="group/btn inline-flex items-center gap-2 text-emerald-300 hover:text-white font-semibold text-sm transition-colors duration-200">
                    Registro Empresarial
                    <HiArrowRight className="text-lg group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats compactos para móvil */}
        <div className="grid grid-cols-3 gap-3 mt-8 lg:hidden">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-xl rounded-xl !p-3 text-center border border-white/15"
              >
                <Icon className={`text-lg mx-auto mb-1 text-emerald-400`} />
                <div className="text-xl sm:text-2xl font-black text-white leading-none">
                  {stat.value.toLocaleString()}
                  <span className="text-sm font-bold text-white/70">{stat.suffix}</span>
                </div>
                <p className="text-white/50 text-[10px] sm:text-xs font-medium mt-1 leading-tight">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll Indicator — CSS only */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 cursor-pointer group"
        onClick={() => {
          const element = document.getElementById('calculadora');
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <span className="text-xs uppercase tracking-[0.25em] text-white/50 font-semibold group-hover:text-white/80 transition-colors animate-pulse-slow">
          Descubre más
        </span>
        <div className="w-6 h-10 rounded-full border-2 border-white/25 group-hover:border-white/50 flex justify-center pt-2 transition-colors">
          <div className="w-1.5 h-2.5 bg-white/50 group-hover:bg-white/80 rounded-full animate-scroll-dot transition-colors" />
        </div>
      </div>
    </section>
  );
};

export default Hero;