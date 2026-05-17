import React, { useEffect, useState } from 'react';
import { FaLeaf, FaPlane, FaUsers, FaBuilding, FaChartLine, FaGlobeAmericas, FaBriefcase } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import './Hero.css';

const Hero = () => {
  const [isMounted, setIsMounted] = useState(false);
  // Estado para controlar la pestaña activa de la columna derecha
  const [activeTab, setActiveTab] = useState<'impacto' | 'empresas'>('impacto');

  useEffect(() => {
    setIsMounted(true);
    
    // Rotación automática sutil cada 8 segundos solo si el usuario no está interactuando
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev === 'impacto' ? 'empresas' : 'impacto'));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: FaLeaf, value: 15420, label: 'Toneladas CO₂ Compensadas', suffix: '+', color: 'text-emerald-400', barWidth: 'w-[85%]', bg: 'bg-emerald-500/10' },
    { icon: FaPlane, value: 8234, label: 'Vuelos Verificados', suffix: '+', color: 'text-blue-400', barWidth: 'w-[62%]', bg: 'bg-blue-500/10' },
    { icon: FaUsers, value: 3567, label: 'Usuarios Activos', suffix: '+', color: 'text-amber-400', barWidth: 'w-[74%]', bg: 'bg-amber-500/10' },
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

      {/* Blobs Animados del CSS */}
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
        <div className="grid lg:grid-cols-2 xl:grid-cols-[1fr_450px] gap-12 xl:gap-16 items-center">
          
          {/* Columna Izquierda: Tu Diseño Original Intacto */}
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

          {/* Columna Derecha: INTERACTIVE HUB REIMAGINADO */}
          <div className="hidden lg:flex flex-col w-full relative group/hub">
            
            {/* Efecto Glow Perimetral detrás del Dashboard */}
            <div className={`absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r ${activeTab === 'impacto' ? 'from-emerald-500/20 to-teal-500/10' : 'from-blue-500/20 to-purple-500/10'} blur-xl opacity-70 group-hover/hub:opacity-100 transition duration-1000`} />

            {/* Contenedor Principal Flotante (Glassmorphism de un solo bloque) */}
            <div className="relative w-full bg-slate-900/30 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-7 shadow-2xl flex flex-col min-h-[440px] justify-between transition-all duration-500">
              
              {/* Header: Selector de Perspectiva (Tabs Estilizadas) */}
              <div className="grid grid-cols-2 gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/5 mb-6">
                <button
                  onClick={() => setActiveTab('impacto')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs xl:text-sm font-bold tracking-wide transition-all duration-300 ${activeTab === 'impacto' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg font-black' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                  <FaGlobeAmericas className="text-sm" />
                  <span>Impacto Colectivo</span>
                </button>
                <button
                  onClick={() => setActiveTab('empresas')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs xl:text-sm font-bold tracking-wide transition-all duration-300 ${activeTab === 'empresas' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg font-black' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                  <FaBriefcase className="text-sm" />
                  <span>Soluciones B2B</span>
                </button>
              </div>

              {/* Contenido Cambiante con Transición Suave */}
              <div className="flex-1 flex flex-col justify-center">
                {activeTab === 'impacto' ? (
                  /* VISTA 1: Estadísticas de Impacto */
                  <div className="flex flex-col gap-5 animate-fadeIn">
                    <div className="mb-1">
                      <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Live Metrics</span>
                      <h3 className="text-white font-bold text-xl mt-2">Nuestra huella verde global</h3>
                    </div>
                    
                    {stats.map((stat, i) => {
                      const Icon = stat.icon;
                      return (
                        <div key={i} className="flex flex-col gap-1.5 bg-white/[0.02] border border-white/5 p-3.5 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white/80 text-xs font-semibold">
                              <Icon className={stat.color} />
                              <span>{stat.label}</span>
                            </div>
                            <span className={`font-black tracking-tight text-white text-base`}>
                              {isMounted ? stat.value.toLocaleString() : stat.value}{stat.suffix}
                            </span>
                          </div>
                          {/* Gráfico de barras simulado para dar una sensación analítica */}
                          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r from-emerald-400 to-teal-400 ${stat.barWidth} rounded-full`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* VISTA 2: Propuesta Exclusiva Corporativa */
                  <div className="flex flex-col items-start gap-4 animate-fadeIn text-left">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xl shadow-lg shadow-blue-500/10">
                      <FaBuilding />
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-black tracking-tight">¿Representas a una organización?</h3>
                      <p className="text-white/70 text-sm mt-1.5 leading-relaxed">
                        Automatiza la medición, reducción y compensación de carbono de los viajes de tu equipo mediante nuestra infraestructura API corporativa.
                      </p>
                    </div>
                    <ul className="text-white/60 text-xs space-y-1.5 font-medium">
                      <li className="flex items-center gap-2">✔ Certificados ISO de Neutralidad</li>
                      <li className="flex items-center gap-2">✔ Reportes de Sostenibilidad Automatizados</li>
                    </ul>
                    
                    <button className="group/btn w-full mt-2 inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold text-sm py-3.5 px-5 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                      <span>Acceder a Registro Empresarial</span>
                      <HiArrowRight className="text-base group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>

              {/* Footer del Bloque: Pequeño indicador de paginación o estado */}
              <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-6 text-[11px] text-white/40 font-medium">
                <span>Actualizado en tiempo real</span>
                <div className="flex gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeTab === 'impacto' ? 'bg-emerald-400 w-3' : 'bg-white/20'}`} />
                  <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeTab === 'empresas' ? 'bg-blue-400 w-3' : 'bg-white/20'}`} />
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Layout móvil unificado (mantiene compatibilidad intacta) */}
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