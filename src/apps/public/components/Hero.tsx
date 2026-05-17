import React, { useEffect, useState } from 'react';
import { FaLeaf, FaPlane, FaUsers, FaBuilding, FaChartLine } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import './Hero.css';

const Hero = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const stats = [
    { 
      icon: FaLeaf, 
      value: 15420, 
      label: 'Toneladas CO₂ Compensadas', 
      suffix: '+', 
      glowClass: 'hover:shadow-emerald-500/20 hover:border-emerald-500/30',
      iconColor: 'text-emerald-400'
    },
    { 
      icon: FaPlane, 
      value: 8234, 
      label: 'Vuelos Compensados', 
      suffix: '+', 
      glowClass: 'hover:shadow-blue-500/20 hover:border-blue-500/30',
      iconColor: 'text-blue-400'
    },
    { 
      icon: FaUsers, 
      value: 3567, 
      label: 'Empresas Certificadas', 
      suffix: '+', 
      glowClass: 'hover:shadow-amber-500/20 hover:border-amber-500/30',
      iconColor: 'text-amber-400'
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
      
      {/* Fondo Original con Gradientes */}
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

      {/* Blobs Animados del CSS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[150px] will-change-transform animate-blob-slow" />
        <div className="absolute -bottom-40 -right-40 w-[900px] h-[900px] bg-blue-500/20 rounded-full blur-[150px] will-change-transform animate-blob-slow-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] will-change-transform animate-blob-slow-mid" />
      </div>

      {/* Contenedor Principal */}
      <div
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full"
        style={{
          maxWidth: '1280px',
          paddingTop: 'clamp(5.5rem, 12vh, 9rem)',
          paddingBottom: 'clamp(2rem, 6vh, 5rem)',
        }}
      >
        <div className="grid lg:grid-cols-2 xl:grid-cols-[1fr_460px] gap-12 xl:gap-16 items-center">
          
          {/* Columna Izquierda: Tu diseño original */}
          <div className="flex flex-col items-start">
            <h1
              className="font-black leading-[1.1] tracking-tight !mb-5 lg:!mb-6"
              style={{
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

            <p
              className="text-white/85 max-w-md !mb-10 lg:!mb-14"
              style={{
                fontSize: 'clamp(0.875rem, 1.8vw, 1.125rem)',
                textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                lineHeight: '1.5',
              }}
            >
              Neutraliza el impacto ambiental de tus viajes con proyectos verificados y certificados.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full sm:w-auto !mb-8 lg:!mb-12">
              <button
                onClick={scrollToCalculator}
                className="group relative inline-flex justify-center items-center !gap-3 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 hover:from-emerald-300 hover:via-green-400 hover:to-teal-400 text-slate-900 font-black text-base sm:text-lg !px-9 sm:!px-12 !py-4 sm:!py-5 !leading-[1.15] !min-h-[52px] sm:!min-h-[60px] whitespace-nowrap rounded-2xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-400/60 active:shadow-emerald-500/30 !transition-all !duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <FaChartLine className="text-lg sm:text-xl group-hover:scale-110 transition-transform relative z-10" />
                <span className="relative z-10">Calcula tu Huella</span>
              </button>
              
              <button
                className="group inline-flex justify-center items-center !gap-3 bg-slate-900/30 hover:bg-slate-900/50 backdrop-blur-xl text-white/90 hover:text-white font-semibold text-base sm:text-lg !px-9 sm:!px-12 !py-4 sm:!py-5 !leading-[1.15] !min-h-[52px] sm:!min-h-[60px] whitespace-nowrap rounded-2xl border-2 border-white/30 hover:border-white/50 shadow-lg shadow-black/20 !transition-all !duration-300"
              >
                <span>Cómo Funciona</span>
                <HiArrowRight className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex flex-nowrap gap-x-3 sm:gap-x-5">
              {[
                { color: 'bg-emerald-400', glow: 'shadow-emerald-400/80', text: '100% Verificado' },
                { color: 'bg-blue-400', glow: 'shadow-blue-400/80', text: 'Certificación ISO' },
                { color: 'bg-amber-400', glow: 'shadow-amber-400/80', text: 'Transparencia Total' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-white/90 text-[11px] sm:text-sm font-medium" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${item.color} rounded-full shadow-lg ${item.glow}`} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: El Nuevo Set de Glassmorphic Interactive Cards */}
          <div className="hidden lg:flex flex-col gap-4 w-full">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`
                    group relative overflow-hidden
                    bg-slate-900/30 backdrop-blur-xl 
                    border border-white/10 ${stat.glowClass}
                    rounded-2xl p-5
                    grid grid-cols-[auto_1fr] gap-5 items-center
                    transition-all duration-300 hover:-translate-y-1 shadow-xl
                  `}
                >
                  {/* Capa de luz interna sutil (Efecto Tarjeta Premium) */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent pointer-events-none" />

                  {/* Icono con contenedor estructurado */}
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-white/10">
                    <Icon className={`${stat.iconColor} transition-transform`} />
                  </div>

                  {/* Textos alineados milimétricamente en la parte derecha */}
                  <div className="flex flex-col text-left">
                    <div className="flex items-baseline gap-0.5 text-white font-black tracking-tight text-2xl xl:text-3xl leading-none">
                      <span>{isMounted ? stat.value.toLocaleString() : stat.value}</span>
                      <span className="text-white/60 font-bold text-base">{stat.suffix}</span>
                    </div>
                    <p className="text-white/50 text-xs xl:text-sm font-medium mt-1">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* CARD EMPRESA: Estilizada con Borde de Brillo Activo */}
            <div className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-emerald-500/10 via-slate-900/40 to-slate-900/40 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-emerald-950/5">
              <div className="grid grid-cols-[auto_1fr] gap-5 items-center">
                
                {/* Icono alineado exactamente en la misma cuadrícula */}
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl text-emerald-400 group-hover:scale-110 transition-transform">
                  <FaBuilding />
                </div>

                {/* Contenido alineado */}
                <div className="flex flex-col text-left">
                  <h3 className="text-sm xl:text-base font-bold text-white leading-tight">
                    ¿Eres Empresa?
                  </h3>
                  <p className="text-white/60 text-xs mt-0.5 leading-normal">
                    Certifica el impacto de tus operaciones corporativas y reduce emisiones.
                  </p>
                  <button className="group/btn inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-bold mt-2 transition-colors w-max">
                    <span>Solicitar Registro</span>
                    <HiArrowRight className="text-sm group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* Layout móvil sin cambios para mantener consistencia */}
        <div className="grid grid-cols-3 gap-3 mt-8 lg:hidden">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-xl rounded-xl !p-3 text-center border border-white/15">
                <Icon className="text-lg mx-auto mb-1 text-emerald-400" />
                <div className="text-xl sm:text-2xl font-black text-white leading-none">
                  {isMounted ? stat.value.toLocaleString() : stat.value}
                  <span className="text-sm font-bold text-white/70">{stat.suffix}</span>
                </div>
                <p className="text-white/50 text-[10px] sm:text-xs font-medium mt-1 leading-tight">{stat.label}</p>
              </div>
            );
          })}
        </div>

      </div>

      {/* Scroll Arrow original */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 cursor-pointer group" onClick={scrollToCalculator}>
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