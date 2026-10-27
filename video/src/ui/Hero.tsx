// Header de cristal líquido, titular, globo y barra de accesos del hero real
// (Header.tsx, Hero.tsx y HeroGlobe.tsx), sin estado ni navegación.
import React from 'react';
import { Img, staticFile } from 'remotion';
import { FaBuilding } from 'react-icons/fa';
import { HiArrowRight, HiChevronDown, HiGlobeAlt, HiShieldCheck } from 'react-icons/hi';
import { Focus } from '../camera/Focus';
import { GlobeCanvas } from './Globe';

// Ancho de .hero__planet-col a 1920 px: (1200 - 2·40 - 48) · 0.85 / 2.
export const HERO_GLOBE_SIZE = 456;

export const StageHeader: React.FC = () => (
  <Focus id="header" as="header" className="ctv-liquid-surface">
    <div className="ctv-liquid-refraction" aria-hidden="true" />
    <div className="ctv-liquid-bar">
      <span className="ctv-liquid-logo">
        <Img
          src={staticFile('brand/logo-horizontal-white.svg')}
          alt="Compensatuviaje"
          className="ctv-liquid-logo__img"
          width={168}
          height={36}
        />
      </span>
      <nav className="ctv-liquid-nav">
        {['Soluciones', 'Transparencia', 'Recursos'].map((label) => (
          <div key={label} className="ctv-liquid-trigger-wrap">
            <span className="ctv-liquid-nav__trigger">
              <span>{label}</span>
              <span className="ctv-liquid-nav__chevron-wrap">
                <HiChevronDown className="ctv-liquid-nav__chevron" />
              </span>
            </span>
          </div>
        ))}
        <span className="ctv-liquid-nav__trigger ctv-liquid-nav__trigger--link">
          <span>Calculadora</span>
        </span>
      </nav>
      <div className="ctv-liquid-actions">
        <span className="ctv-btn-liquid ctv-btn-liquid--ghost">Entrar</span>
        <span className="ctv-btn-liquid ctv-btn-liquid--outline ctv-liquid-actions__register">Registrarse</span>
        <span className="ctv-btn-liquid ctv-btn-liquid--glow">
          <span>Compensar Vuelo</span>
          <HiArrowRight className="ctv-btn-liquid__arrow" />
        </span>
      </div>
    </div>
  </Focus>
);

/** Cuadrícula (TechGrid de EcoArt.tsx) y grano editorial del hero. */
export const HeroTexture: React.FC<{ id: string }> = ({ id }) => (
  <>
    <svg
      width="100%"
      height="100%"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <defs>
        <pattern id={id} width="45" height="45" patternUnits="userSpaceOnUse">
          <path d="M 45 0 L 0 0 0 45" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={0.06} color="var(--ctv-brand-deep)" />
    </svg>
    <div className="hero__grain" aria-hidden="true" />
  </>
);

export const HeroBackdrop: React.FC = () => (
  <>
    <div className="hero__glow hero__glow--a" aria-hidden="true" />
    <div className="hero__glow hero__glow--b" aria-hidden="true" />
    <HeroTexture id="stageGrid" />
  </>
);

export const HeroHeadline: React.FC = () => (
  <Focus id="headline" className="hero__header">
    <div className="hero-eyebrow">
      <span className="hero-eyebrow__line" />
      <span>Calculadora de huella de carbono</span>
    </div>
    <h1 className="hero-display">
      <span className="hero-line">
        <span className="hero-line__inner">Compensa la huella</span>
      </span>
      <span className="hero-line">
        <span className="hero-line__inner">de cada viaje,</span>
      </span>
      <span className="hero-line hero-line--accent">
        <span className="hero-line__inner">
          <em>medible</em> y trazable.
        </span>
      </span>
    </h1>
    <p className="hero-lede">
      Calcula y neutraliza las emisiones de tus vuelos con factores oficiales del DEFRA y GHG Protocol, respaldado por
      proyectos verificados y un registro inmutable en blockchain.
    </p>
  </Focus>
);

export const HeroGlobe: React.FC = () => (
  <Focus id="globe" className="hero__planet-col">
    <div className="hero-globe-wrap">
      <div className="hero-globe-halo" aria-hidden="true" />
      <div className="hero-globe-badge">
        <span className="hero-globe-badge__dot" />
        <HiGlobeAlt className="hero-globe-badge__icon" />
        <span>Rutas aéreas desde Santiago</span>
      </div>
      <div className="hero-globe-canvas-box">
        <GlobeCanvas width={HERO_GLOBE_SIZE} height={HERO_GLOBE_SIZE} showRoutes dpr={2} />
      </div>
    </div>
  </Focus>
);

export const HeroTrustBar: React.FC = () => (
  <Focus id="trust" className="hero-trust-bar">
    <div className="hero-quick-links">
      <span className="hero-sublink">
        <FaBuilding aria-hidden="true" />
        <span>¿Viajes corporativos? Soluciones B2B Scope 3</span>
        <HiArrowRight aria-hidden="true" />
      </span>
      <span className="hero-sublink">
        <HiShieldCheck aria-hidden="true" />
        <span>Explorar proyectos verificados</span>
        <HiArrowRight aria-hidden="true" />
      </span>
    </div>
  </Focus>
);
