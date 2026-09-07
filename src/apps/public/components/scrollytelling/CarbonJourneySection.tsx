import React, { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { HiArrowDown, HiSparkles, HiGlobeAlt, HiShieldCheck } from 'react-icons/hi';
import { FaLeaf, FaPlaneDeparture, FaTree } from 'react-icons/fa';
import { SceneManager } from './components/SceneManager';
import { initScrollAnimations, destroyScrollAnimations, refreshScrollAnimations } from './animations/scrollAnimations';
import { useScrollProgress } from './hooks/useScrollProgress';
import './CarbonJourneySection.css';

export const CarbonJourneySection: React.FC = () => {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollState = useScrollProgress();

  // IntersectionObserver: solo montar el Canvas cuando el usuario esté próximo
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { rootMargin: '400px 0px 400px 0px', threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Inicializar ScrollTriggers de GSAP
  useEffect(() => {
    if (!inView) return;

    initScrollAnimations();

    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        refreshScrollAnimations();
      });
      return () => cancelAnimationFrame(raf2);
    });

    return () => {
      cancelAnimationFrame(raf1);
      destroyScrollAnimations();
    };
  }, [inView]);

  const cameraConfig = useMemo(() => ({ position: [0, 0, 5] as [number, number, number], fov: 60 }), []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Determinar acto activo según el scroll global (0 a 1)
  const currentAct = scrollState.overall < 0.32 ? 1 : scrollState.overall < 0.68 ? 2 : 3;

  return (
    <section ref={containerRef} className="carbon-journey" id="ciclo-carbono" aria-label="El Ciclo del Carbono: Del Aire a la Tierra">
      {/* ── Viewport Fijo con Canvas 3D ── */}
      <div className="cj-canvas-pin">
        {inView ? (
          <Canvas
            camera={cameraConfig}
            dpr={[1, 1.75]}
            shadows
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
            }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.NeutralToneMapping;
              gl.toneMappingExposure = 2;
            }}
          >
            <SceneManager />
          </Canvas>
        ) : (
          <div className="cj-canvas-placeholder" aria-hidden="true" />
        )}

        {/* ── Barra Superior de Navegación de Actos (HUD) ── */}
        <header className="cj-top-hud">
          <div className="cj-hud-badge">
            <HiSparkles aria-hidden="true" />
            <span>El Ciclo del Carbono · Narrativa 3D</span>
          </div>

          <nav className="cj-hud-stepper" aria-label="Progreso de actos">
            <button
              type="button"
              className={`cj-step-pill ${currentAct === 1 ? 'cj-step-pill--active' : ''}`}
              onClick={() => scrollToSection('section-planet')}
            >
              <FaPlaneDeparture aria-hidden="true" />
              <span>01. Emisión</span>
            </button>
            <button
              type="button"
              className={`cj-step-pill ${currentAct === 2 ? 'cj-step-pill--active' : ''}`}
              onClick={() => scrollToSection('section-transition')}
            >
              <HiShieldCheck aria-hidden="true" />
              <span>02. Auditoría</span>
            </button>
            <button
              type="button"
              className={`cj-step-pill ${currentAct === 3 ? 'cj-step-pill--active' : ''}`}
              onClick={() => scrollToSection('section-forest')}
            >
              <FaTree aria-hidden="true" />
              <span>03. Regeneración</span>
            </button>
          </nav>
        </header>

        {/* ── Tarjetas Narrativas Flotantes (Glassmorphism Contextual) ── */}
        <div className="cj-overlay-container">
          {/* Acto 01: La Huella en el Cielo */}
          <article className={`cj-narrative-card ${currentAct === 1 ? 'cj-narrative-card--visible' : ''}`} aria-hidden={currentAct !== 1}>
            <div className="cj-card-pill">
              <HiGlobeAlt aria-hidden="true" />
              <span>Acto 01 · La Huella en la Tropopausa</span>
            </div>
            <h3 className="cj-card-title">
              900 millones de toneladas de CO₂e en el cielo cada año
            </h3>
            <p className="cj-card-text">
              Cada vuelo comercial conecta continentes pero deja una estela invisible a gran altitud. A más de 10.000 metros, el forzamiento radiativo y la combustión fósil multiplican el impacto climático de cada trayecto en la atmósfera.
            </p>
            <footer className="cj-card-meta">
              <span className="cj-meta-dot" />
              <span>Altitud: 11.200 m · Factor GHG Protocol Scope 3 · Telemetría en tiempo real</span>
            </footer>
          </article>

          {/* Acto 02: Transmutación Digital */}
          <article className={`cj-narrative-card ${currentAct === 2 ? 'cj-narrative-card--visible' : ''}`} aria-hidden={currentAct !== 2}>
            <div className="cj-card-pill">
              <HiSparkles aria-hidden="true" />
              <span>Acto 02 · Transmutación y Auditoría Digital</span>
            </div>
            <h3 className="cj-card-title">
              Cálculo auditable: el carbono se convierte en custodia
            </h3>
            <p className="cj-card-text">
              Cero opacidad y cero estimaciones vagas. La tecnología climática de Compensatuviaje aplica los factores oficiales del DEFRA 2024 para auditar cada gramo y emparejarlo en tiempo real con créditos de absorción certificados en registros internacionales.
            </p>
            <footer className="cj-card-meta">
              <span className="cj-meta-dot" />
              <span>Estándar: DEFRA 2024 · Verra VCS · Gold Standard · Retiro Criptográfico Inmutable</span>
            </footer>
          </article>

          {/* Acto 03: Regeneración Tangible en la Tierra */}
          <article className={`cj-narrative-card ${currentAct === 3 ? 'cj-narrative-card--visible' : ''}`} aria-hidden={currentAct !== 3}>
            <div className="cj-card-pill">
              <FaLeaf aria-hidden="true" />
              <span>Acto 03 · Regeneración Tangible en la Tierra</span>
            </div>
            <h3 className="cj-card-title">
              El bosque que respira: naturaleza viva y protegida
            </h3>
            <p className="cj-card-text">
              Llegamos al suelo. Tu aporte no es una transacción abstracta en una pantalla: financia la custodia activa de hectáreas de bosque nativo en la Patagonia y Selva Valdiviana, cuidando biodiversidad, suelo y comunidades locales.
            </p>
            <footer className="cj-card-actions">
              <span className="cj-card-tag">Patagonia & Selva Valdiviana · Monitoreo Satelital</span>
              <button
                type="button"
                className="cj-cta-btn"
                onClick={() => scrollToSection('proyectos')}
              >
                <span>Explorar proyectos certificados</span>
                <HiArrowDown aria-hidden="true" />
              </button>
            </footer>
          </article>
        </div>

        {/* ── Pista de Interacción 3D ── */}
        <div className="cj-orbit-hint" aria-hidden="true">
          <span>Arrastra para orbitar la escena en 3D</span>
        </div>
      </div>

      {/* ── Pista de Scroll (ScrollTriggers) ── */}
      <div className="cj-scroll-track" aria-hidden="true">
        <div className="cj-scroll-segment" id="section-planet" />
        <div className="cj-scroll-segment" id="section-transition" />
        <div className="cj-scroll-segment" id="section-forest" />
        <div className="cj-scroll-segment" id="section-harmony" />
      </div>
    </section>
  );
};

export default CarbonJourneySection;
