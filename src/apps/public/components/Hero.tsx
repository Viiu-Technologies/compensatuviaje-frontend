import React, { useEffect, useState } from 'react';
import { FaLeaf, FaPlane, FaUsers, FaBuilding, FaChartLine, FaGlobeAmericas, FaBriefcase } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import './Hero.css';

const Hero = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'impacto' | 'empresas'>('impacto');

  useEffect(() => {
    setIsMounted(true);
    
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev === 'impacto' ? 'empresas' : 'impacto'));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: FaLeaf, value: 15420, label: 'Toneladas CO₂ Compensadas', suffix: '+', color: 'text-emerald-400', barWidth: 'w-[85%]' },
    { icon: FaPlane, value: 8234, label: 'Vuelos Verificados', suffix: '+', color: 'text-blue-400', barWidth: 'w-[62%]' },
    { icon: FaUsers, value: 3567, label: 'Usuarios Activos', suffix: '+', color: 'text-amber-400', barWidth: 'w-[74%]' },
  ];

  const scrollToCalculator = () => {
    const element = document.getElementById('calculadora');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden" id="inicio">
      
      {/* Fondo Original Intacto */}
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

      {/* Blobs Animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[150px] will-change-transform animate-blob-slow" />
        <div className="absolute -bottom-40 -right-40 w-[900px] h-[900px] bg-blue-500/20 rounded-full blur-[150px] will-change-transform animate-blob-slow-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] will-change-transform animate-blob-slow-mid" />
      </div>

      {/* Contenedor Grid Principal */}
      <div
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full"
        style={{
          maxWidth: '1280px',
          paddingTop: 'clamp(5.5rem, 12vh, 9rem)',
          paddingBottom: 'clamp(2rem, 6vh, 5rem)',
        }}
      >
        <div className="grid lg:grid-cols-2 xl:grid-cols-[1fr_480px] gap-12 xl:gap-16 items-center">
          
          {/* Columna Izquierda: Tu Diseño Original Intacto */}
          <div className="flex flex-col items-start w-full">
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
              Neutraliza el impacto ambiental de tus viajes con proyectos verificados y certified.
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

          {/* Columna Derecha: FIX COMPLETO DE ALINEACIÓN Y DISTRIBUCIÓN */}
          <div className="hidden lg:flex flex-col w-full relative">
            
            {/* Efecto Glow Perimetral Ajustado */}
            <div className={`absolute -inset-0.5 rounded-[2rem] bg-gradient-to-r ${activeTab === 'impacto' ? 'from-emerald-500/10 to-teal-500/5' : 'from-blue-500/10 to-purple-500/5'} blur-lg opacity-70`} />

            {/* Contenedor Principal (Cambié px-7 a px-6 para mejor espacio interno) */}
            <div className="relative w-full bg-white/[0.06] backdrop-blur-3xl border border-white/15 rounded-[2rem] p-6 shadow-2xl flex flex-col justify-between min-h-[420px]">
              
              {/* Header: Tabs ajustadas con ancho completo */}
              <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5 w-full">
                <button
                  onClick={() => setActiveTab('impacto')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-300 ${activeTab === 'impacto' ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-md font-black' : 'text-white/60 hover:text-white'}`}
                >
                  <FaGlobeAmericas className="text-sm" />
                  <span>Impacto Colectivo</span>
                </button>
                <button
                  onClick={() => setActiveTab('empresas')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-300 ${activeTab === 'empresas' ? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-slate-950 shadow-md font-black' : 'text-white/60 hover:text-white'}`}
                >
                  <FaBriefcase className="text-sm" />
                  <span>Soluciones B2B</span>
                </button>
              </div>

              {/* Área de Contenido Justificada */}
              <div className="flex-1 flex flex-col justify-center my-4 w-full">
                {activeTab === 'impacto' ? (
                  /* VISTA 1: Estadísticas (Arreglado el aplastamiento lateral) */
                  <div className="flex flex-col gap-4 animate-fadeIn w-full">
                    <div className="text-left mb-2">
                      <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-extrabold bg-emerald-400/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                        Live Metrics
                      </span>
                      <h3 className="text-white font-bold text-lg mt-1.5">Nuestra huella verde global</h3>
                    </div>
                    
                    {stats.map((stat, i) => {
                      const Icon = stat.icon;
                      return (
                        <div key={i} className="w-full bg-white/[0.03] border border-white/5 p-4 rounded-xl flex flex-col gap-2">
                          {/* flex justify-between obliga a los textos a irse a los extremos opuestos */}
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2.5 text-white/70 text-xs font-medium">
                              <Icon className={`${stat.color} text-sm flex-shrink-0`} />
                              <span>{stat.label}</span>
                            </div>
                            <span className="font-black tracking-tight text-white text-base flex-shrink-0">
                              {isMounted ? stat.value.toLocaleString() : stat.value}{stat.suffix}
                            </span>
                          </div>
                          {/* Barra de Progreso Separada */}
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r from-emerald-400 to-teal-400 ${stat.barWidth} rounded-full`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* VISTA 2: Propuesta Corporativa */
                  <div className="flex flex-col items-start gap-4 animate-fadeIn text-left w-full px-1">
                    <div className="w-10 h-10 rounded-xl bg-blue-400/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg shadow-md">
                      <FaBuilding />
                    </div>
                    <div>
                      <h3 className="text-white text-base font-bold tracking-tight">¿Representas a una organización?</h3>
                      <p className="text-white/70 text-xs mt-1 leading-relaxed">
                        Automatiza la medición, reducción y compensación de carbono de los viajes de tu equipo mediante nuestra infraestructura API corporativa.
                      </p>
                    </div>
                    <ul className="text-white/60 text-[11px] space-y-1 w-full">
                      <li className="flex items-center gap-2">✔ Certificados ISO de Neutralidad</li>
                      <li className="flex items-center gap-2">✔ Reportes de Sostenibilidad Automatizados</li>
                    </ul>
                    
                    <button className="group/btn w-full mt-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-300 hover:to-indigo-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-blue-500/10">
                      <span>Acceder a Registro Empresarial</span>
                      <HiArrowRight className="text-sm group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </div>

              {/* Footer del Bloque */}
              <div className="flex justify-between items-center border-t border-white/5 pt-3 text-[10px] text-white/40 font-medium w-full">
                <span>Actualizado en tiempo real</span>
                <div className="flex gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeTab === 'impacto' ? 'bg-emerald-400 w-3' : 'bg-white/20'}`} />
                  <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeTab === 'empresas' ? 'bg-blue-400 w-3' : 'bg-white/20'}`} />
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Layout móvil unificado */}
        <div className="flex flex-col gap-4 mt-12 lg:hidden">
          <div className="grid grid-cols-3 gap-3">
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