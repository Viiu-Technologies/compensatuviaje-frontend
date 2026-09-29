import React, { lazy, Suspense } from 'react';
import { HiArrowRight, HiShieldCheck } from 'react-icons/hi';
import { FaBuilding } from 'react-icons/fa';
import { gsap, useGsapReveal } from '../hooks/useGsapReveal';
import { TechGrid } from './landing/EcoArt';
import QuickFlightCalculator from './QuickFlightCalculator';
import './Hero.css';

// Lazy: keeps three.js/@react-three/fiber/drei out of the entry chunk. HeroGlobe is
// above the fold and eager-mounted (unlike the footer's 3D scene), but it no longer
// needs to block the landing page's critical script evaluation to do that -- its own
// CSS (.hero-globe-wrap, aspect-ratio 1/1) already reserves the layout space, and the
// component ships its own loading placeholder (GlobeFallback) for the gap.
const HeroGlobe = lazy(() => import('./hero3d/HeroGlobe'));

const Hero: React.FC = () => {
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

    // Parallax suave con el scroll
    gsap.to('.hero__glow--a', {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.6 },
    });
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sin inclinación 3D al mover el mouse: la calculadora es un formulario y
  // moverla mientras se completa distraía.
  return (
    <section ref={scopeRef} className="hero" id="inicio">
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
              <span>Calculadora de huella de carbono</span>
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
              respaldado por proyectos verificados y un registro inmutable en blockchain.
            </p>

          </div>

          <div className="hero__planet-col ctv-reveal">
            {/* Fallback reserves .hero-globe-wrap's own footprint (aspect-ratio 1/1)
                while the HeroGlobe chunk (three.js + r3f + drei) downloads, so this
                column never collapses and reflows the grid next to it. */}
            <Suspense fallback={<div className="hero-globe-wrap" aria-hidden="true" />}>
              <HeroGlobe />
            </Suspense>
          </div>
        </div>

        {/* Calculadora amplia como elemento protagonista central */}
        <div className="hero-calculator-wrap ctv-reveal" id="calculadora">
          <QuickFlightCalculator />
        </div>

        {/* Accesos directos. El contador de "toneladas neutralizadas" se quitó:
            era un número fijo en el código, no un dato real del backend. */}
        <div className="hero-trust-bar ctv-reveal">
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
              <span>Explorar proyectos verificados</span>
              <HiArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
