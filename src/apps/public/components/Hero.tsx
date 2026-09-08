import React, { useRef } from 'react';
import { HiArrowRight, HiShieldCheck } from 'react-icons/hi';
import { FaBuilding } from 'react-icons/fa';
import { gsap, useGsapReveal } from '../hooks/useGsapReveal';
import { TechGrid } from './landing/EcoArt';
import QuickFlightCalculator from './QuickFlightCalculator';
import HeroGlobe from './hero3d/HeroGlobe';
import './Hero.css';

const Hero: React.FC = () => {
  const rafId = useRef<number | null>(null);

  const scopeRef = useGsapReveal<HTMLElement>((root) => {
    // Revelar todos los elementos marcados con ctv-reveal
    gsap.set('.ctv-reveal', { autoAlpha: 1 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out', duration: 0.9 },
    });

    // Animación de título y textos
    tl.from('.hero-display .hero-line__inner', {
      yPercent: 110,
      stagger: 0.12,
      duration: 1.0,
    }, 0);

    tl.from('.hero-eyebrow', { y: 12, autoAlpha: 0, duration: 0.6 }, 0.1);
    tl.from('.hero-lede', { y: 16, autoAlpha: 0, duration: 0.7 }, 0.35);
    tl.from('.hero__planet-col', { scale: 0.9, autoAlpha: 0, duration: 1.1, ease: 'power2.out' }, 0.4);
    tl.from('.hero-calculator-wrap', { y: 28, autoAlpha: 0, scale: 0.98, duration: 0.85 }, 0.5);
    tl.from('.hero-trust-bar', { y: 20, autoAlpha: 0, duration: 0.7 }, 0.75);

    // Animación de conteo de toneladas
    const target = root.querySelector<HTMLElement>('.hero-stat__number');
    if (target) {
      const end = Number(target.dataset.value ?? 0);
      const obj = { v: 0 };
      tl.to(obj, {
        v: end,
        duration: 1.6,
        ease: 'power2.out',
        snap: { v: 1 },
        onUpdate: () => {
          target.textContent = Math.round(obj.v).toLocaleString('es-CL');
        },
      }, 0.7);
    }

    tl.from('.hero-rule', { scaleX: 0, transformOrigin: 'left center', duration: 1.0 }, 0.6);
    tl.from('.hero-meta > *', { y: 10, autoAlpha: 0, stagger: 0.1, duration: 0.5 }, 0.9);

    // Parallax suave con el scroll
    gsap.to('.hero__glow--a', {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.6 },
    });
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (-y / rect.height) * 4;
    const rotateY = (x / rect.width) * 4;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const target = container.querySelector('.hero-calculator-wrap') as HTMLElement;
      if (target) {
        target.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
        target.style.transition = 'transform 0.15s ease-out';
      }
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    const container = e.currentTarget;
    const target = container.querySelector('.hero-calculator-wrap') as HTMLElement;
    if (target) {
      target.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
      target.style.transition = 'transform 0.6s var(--ctv-ease-out)';
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={scopeRef} className="hero" id="inicio" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {/* Fondos con profundidad y branding orgánico */}
      <div className="hero__glow hero__glow--a" aria-hidden="true" />
      <div className="hero__glow hero__glow--b" aria-hidden="true" />
      <TechGrid opacity={0.06} />
      <div className="hero__grain" aria-hidden="true" />

      <div className="hero__container">
        {/* Encabezado Principal Split: Texto a la Izquierda, Planeta 3D a la Derecha */}
        <div className="hero__top-grid">
          <div className="hero__header">
            <div className="hero-eyebrow ctv-reveal">
              <span className="hero-eyebrow__line" />
              <span>Tecnología climática certificada</span>
            </div>

            <h1 className="hero-display">
              <span className="hero-line"><span className="hero-line__inner">Compensa la huella</span></span>
              <span className="hero-line"><span className="hero-line__inner">de cada viaje,</span></span>
              <span className="hero-line hero-line--accent">
                <span className="hero-line__inner"><em>medible</em> y trazable.</span>
              </span>
            </h1>

            <p className="hero-lede ctv-reveal">
              Calcula y neutraliza las emisiones de tus vuelos con factores oficiales del DEFRA y GHG Protocol,
              respaldado por proyectos verificados internacionalmente con trazabilidad inmutable.
            </p>

            <div className="hero-header-badges ctv-reveal">
              <div className="hero-badge-pill">
                <HiShieldCheck aria-hidden="true" className="hero-badge-pill__icon" />
                <span>DEFRA 2024 & GHG Protocol</span>
              </div>
              <div className="hero-badge-pill">
                <span className="hero-stat__pulse" />
                <span>Retiro Criptográfico Inmutable</span>
              </div>
            </div>
          </div>

          <div className="hero__planet-col ctv-reveal">
            <HeroGlobe />
          </div>
        </div>

        {/* Calculadora amplia como elemento protagonista central */}
        <div className="hero-calculator-wrap ctv-reveal">
          <QuickFlightCalculator />
        </div>

        {/* Barra de confianza y accesos directos */}
        <div className="hero-trust-bar ctv-reveal">
          <div className="hero-stat-compact">
            <div className="hero-stat-compact__live">
              <span className="hero-stat__pulse" />
              <span>Auditado en tiempo real</span>
            </div>
            <div className="hero-stat-compact__val">
              <span className="hero-stat__number" data-value="15420">
                15.420
              </span>
              <span className="hero-stat__suffix">toneladas de CO₂ ya neutralizadas</span>
            </div>
          </div>

          <div className="hero-quick-links">
            <button
              type="button"
              onClick={() => scrollToSection('empresas')}
              className="hero-sublink"
            >
              <FaBuilding aria-hidden="true" />
              <span>¿Viajes corporativos? Soluciones B2B Scope 3</span>
              <HiArrowRight aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('proyectos')}
              className="hero-sublink"
            >
              <HiShieldCheck aria-hidden="true" />
              <span>Explorar proyectos certificados</span>
              <HiArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Separador */}
        <div className="hero-rule" aria-hidden="true" />

        {/* Metadatos Institucionales */}
        <div className="hero-meta">
          <div className="hero-meta__item">
            <span className="hero-meta__num">01</span>
            <span className="hero-meta__txt">Factores oficiales DEFRA 2024 y GHG Protocol</span>
          </div>
          <div className="hero-meta__item">
            <span className="hero-meta__num">02</span>
            <span className="hero-meta__txt">Proyectos registrados en Verra VCS y Gold Standard</span>
          </div>
          <div className="hero-meta__item">
            <span className="hero-meta__num">03</span>
            <span className="hero-meta__txt">Reportes de sostenibilidad para empresas</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
