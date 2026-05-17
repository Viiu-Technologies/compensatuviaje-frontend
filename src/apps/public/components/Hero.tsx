import React, { useEffect, useState } from 'react';
import { FaLeaf, FaPlane, FaUsers, FaChartLine, FaBuilding } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import './Hero.css';

const Hero = () => {
  // Estado para prevenir desajustes de formato de números en Server-Side Rendering (SSR)
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
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      lineColor: 'bg-emerald-500'
    },
    { 
      icon: FaPlane, 
      value: 8234, 
      label: 'Vuelos Compensados', 
      suffix: '+', 
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      lineColor: 'bg-blue-500'
    },
    { 
      icon: FaUsers, 
      value: 3567, 
      label: 'Empresas Certificadas', 
      suffix: '+', 
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      lineColor: 'bg-amber-500'
    },
  ];

  const scrollToCalculator = () => {
    const element = document.getElementById('calculadora');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden bg-slate-950" id="inicio">
      
      {/* Background con overlay gradiente premium */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: 'url(/images/hero-background.webp)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/60 to-slate-950" />
      </div>

      {/* Blobs de luz decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[130px] animate-blob-slow" />
        <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-[130px] animate-blob-slow-reverse" />
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-7xl pt-[clamp(6rem,14vh,10rem)] pb-[clamp(3rem,8vh,6rem)]">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">
          
          {/* Columna Izquierda: Mensaje de Valor */}
          <div className="flex flex-col items-start text-left">
            <h1 className="font-black leading-[1.1] tracking-tight mb-6 text-[clamp(2.25rem,5.5vw,4.25rem)] text-white drop-shadow-lg">
              Compensa <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-400 to-teal-400">
                tu Viaje Sostenible
              </span>
            </h1>

            <p className="text-slate-300 max-w-lg mb-10 text-[clamp(1rem,1.8vw,1.125rem)] leading-relaxed">
              Neutraliza el impacto ambiental de tus viajes con proyectos verificados y certificados de forma totalmente transparente.
            </p>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-12">
              <button
                onClick={scrollToCalculator}
                className="group relative inline-flex justify-center items-center gap-3 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-bold text-base px-8 py-4 rounded-xl shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <FaChartLine className="text-lg group-hover:scale-110 transition-transform" />
                <span>Calcula tu Huella</span>
              </button>
              
              <button
                className="group inline-flex justify-center items-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-medium text-base px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <span>Cómo Funciona</span>
                <HiArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Indicadores de Confianza */}
            <div className="flex flex-wrap gap-y-3 gap-x-6 border-t border-white/10 pt-6 w-full lg:w-auto">
              {[
                { color: 'bg-emerald-400', text: '100% Verificado' },
                { color: 'bg-blue-400', text: 'Certificación ISO' },
                { color: 'bg-amber-400', text: 'Transparencia Total' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm font-medium">
                  <span className={`w-2 h-2 ${item.color} rounded-full`} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Dashboard de Stats y CTAs (Alineación Perfecta) */}
          <div className="hidden lg:flex flex-col gap-4 w-full max-w-[460px] justify-self-end">
            
            {/* Contenedor tipo Dashboard para agrupar los stats de forma limpia */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Impacto Global de la Plataforma</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-200"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`p-3 rounded-xl border ${stat.iconBg} flex-shrink-0`}>
                        <Icon className="text-xl" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-400 text-xs font-medium truncate">{stat.label}</p>
                        <div className="flex items-baseline gap-0.5 text-white font-black tracking-tight text-xl xl:text-2xl mt-0.5">
                          <span>{isMounted ? stat.value.toLocaleString() : stat.value}</span>
                          <span className="text-slate-400 font-bold text-sm">{stat.suffix}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Detalle visual: Micro-gráfico de barra simulado */}
                    <div className="w-16 bg-white/5 h-1.5 rounded-full overflow-hidden hidden xl:block">
                      <div className={`h-full ${stat.lineColor} w-3/4 rounded-full opacity-60`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Card Empresa: Rediseñada y perfectamente alineada con la misma estructura */}
            <div className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-emerald-950/40 to-slate-900/40 border border-emerald-500/20 hover:border-emerald-500/40 shadow-xl shadow-emerald-950/10 transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex gap-4 items-start">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                  <FaBuilding className="text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-white mb-1">¿Eres Empresa?</h3>
                  <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                    Certifica el impacto ambiental de tus operaciones corporativas y lidera el cambio sostenible.
                  </p>
                  <button className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-colors">
                    <span>Solicitar Registro Empresarial</span>
                    <HiArrowRight className="text-sm group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Layout Adaptado para Móviles (lg:hidden) */}
        <div className="flex flex-col gap-4 mt-12 lg:hidden">
          <div className="grid grid-cols-3 gap-2.5">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-slate-900/60 backdrop-blur-md rounded-xl p-3 text-center border border-white/5">
                  <Icon className="text-base mx-auto mb-1 text-emerald-400" />
                  <div className="text-base sm:text-lg font-black text-white leading-none">
                    {isMounted ? stat.value.toLocaleString() : stat.value}
                    <span className="text-xs font-bold text-slate-400">{stat.suffix}</span>
                  </div>
                  <p className="text-slate-400 text-[10px] font-medium mt-1 leading-tight truncate">
                    {stat.label.split(' ')[0]} {stat.label.split(' ')[1] || ''}
                  </p>
                </div>
              );
            })}
          </div>
          
          {/* Card Empresa Móvil */}
          <div className="bg-gradient-to-r from-slate-900/80 to-emerald-950/30 rounded-xl p-4 border border-emerald-500/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 flex-shrink-0">
                <FaBuilding className="text-base" />
              </div>
              <div className="min-w-0">
                <h4 className="text-white text-xs font-bold">¿Eres Empresa?</h4>
                <p className="text-slate-400 text-[10px] truncate">Certifica el impacto de tu organización.</p>
              </div>
            </div>
            <button className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-2 rounded-lg transition-colors flex-shrink-0">
              Unirse
            </button>
          </div>
        </div>

      </div>

      {/* Indicador de Scroll Inferior */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1.5 cursor-pointer group z-10"
        onClick={scrollToCalculator}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-300 transition-colors">
          Descubre más
        </span>
        <div className="w-5 h-8 rounded-full border border-slate-800 group-hover:border-slate-600 flex justify-center pt-1.5 transition-colors">
          <div className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" />
        </div>
      </div>

    </section>
  );
};

export default Hero;