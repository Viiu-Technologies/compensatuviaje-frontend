import React, { useState, useRef, useEffect } from 'react';
import { HiSparkles, HiShieldCheck, HiSun, HiGlobeAlt, HiArrowRight } from 'react-icons/hi';
import { FaTree, FaLeaf } from 'react-icons/fa';
import ForestCanvas, { TimeOfDay, TreeSpecies } from './ForestCanvas';
import './VirtualForestSection.css';

export const VirtualForestSection: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [species, setSpecies] = useState<TreeSpecies>('roble');

  // IntersectionObserver: activa el render 3D solo cuando la sección está en viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '200px 0px 200px 0px', threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={containerRef}
      className="virtual-forest-section"
      id="entorno-verde"
      aria-label="Entorno Virtual Verde: Bosque 3D de Impacto"
    >
      <div className="vfs-container">
        {/* Cabecera Editorial */}
        <header className="vfs-header">
          <div className="vfs-eyebrow">
            <span className="vfs-eyebrow__dot" />
            <HiSparkles className="vfs-eyebrow__icon" />
            <span>Entorno Virtual Verde · Custodia Digital Nativa</span>
          </div>

          <h2 className="vfs-title">
            Tu huella convertida en <em>bosque vivo</em>
          </h2>

          <p className="vfs-lede">
            No compensas una transacción abstracta: financias la protección física y la custodia activa
            de hectáreas de bosque nativo en la Selva Valdiviana y Patagonia. Este gemelo digital refleja
            en tiempo real los ecosistemas protegidos con cada vuelo neutralizado.
          </p>
        </header>

        {/* Visor 3D Interactivo con HUD Flotante */}
        <div className="vfs-stage">
          {/* Canvas 3D */}
          <ForestCanvas
            isVisible={isVisible}
            timeOfDay={timeOfDay}
            species={species}
          />

          {/* HUD Superior: Controles de Especie y Atmósfera */}
          <div className="vfs-hud-controls">
            {/* Selector de Especie Nativa */}
            <div className="vfs-ctrl-group">
              <span className="vfs-ctrl-label">Especie Nativa</span>
              <div className="vfs-pill-toggle">
                <button
                  type="button"
                  className={`vfs-pill-btn ${species === 'roble' ? 'vfs-pill-btn--active' : ''}`}
                  onClick={() => setSpecies('roble')}
                >
                  <FaLeaf className="vfs-pill-icon" />
                  <span>Roble Valdiviano</span>
                </button>
                <button
                  type="button"
                  className={`vfs-pill-btn ${species === 'alerce' ? 'vfs-pill-btn--active' : ''}`}
                  onClick={() => setSpecies('alerce')}
                >
                  <FaTree className="vfs-pill-icon" />
                  <span>Alerce Patagónico</span>
                </button>
              </div>
            </div>

            {/* Selector de Iluminación / Hora */}
            <div className="vfs-ctrl-group">
              <span className="vfs-ctrl-label">Atmósfera</span>
              <div className="vfs-pill-toggle">
                <button
                  type="button"
                  className={`vfs-pill-btn ${timeOfDay === 'morning' ? 'vfs-pill-btn--active' : ''}`}
                  onClick={() => setTimeOfDay('morning')}
                >
                  <HiSun className="vfs-pill-icon" />
                  <span>Luz Matinal</span>
                </button>
                <button
                  type="button"
                  className={`vfs-pill-btn ${timeOfDay === 'sunset' ? 'vfs-pill-btn--active' : ''}`}
                  onClick={() => setTimeOfDay('sunset')}
                >
                  <HiSparkles className="vfs-pill-icon" />
                  <span>Atardecer Dorado</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tarjeta de Telemetría Flotante (Glassmorphism) */}
          <div className="vfs-telemetry-card">
            <div className="vfs-telemetry-header">
              <span className="vfs-telemetry-dot" />
              <span>Telemetría de Impacto Verificado</span>
            </div>

            <div className="vfs-telemetry-grid">
              <div className="vfs-telemetry-item">
                <span className="vfs-telemetry-val">15.420</span>
                <span className="vfs-telemetry-unit">toneladas CO₂e</span>
                <span className="vfs-telemetry-sub">Neutralizadas auditadas</span>
              </div>
              <div className="vfs-telemetry-item">
                <span className="vfs-telemetry-val">~48.500</span>
                <span className="vfs-telemetry-unit">árboles nativos</span>
                <span className="vfs-telemetry-sub">Bajo custodia activa</span>
              </div>
              <div className="vfs-telemetry-item">
                <span className="vfs-telemetry-val">Sentinel-2</span>
                <span className="vfs-telemetry-unit">Monitoreo cada 5 días</span>
                <span className="vfs-telemetry-sub">Índice NDVI de biomasa</span>
              </div>
            </div>

            <footer className="vfs-telemetry-footer">
              <div className="vfs-telemetry-badge">
                <HiShieldCheck className="vfs-badge-icon" />
                <span>Verra VCS · Gold Standard · Retiro Inmutable</span>
              </div>
              <button
                type="button"
                className="vfs-explore-btn"
                onClick={() => scrollToSection('proyectos')}
              >
                <span>Explorar proyectos</span>
                <HiArrowRight />
              </button>
            </footer>
          </div>

          {/* Pista de Interacción 3D */}
          <div className="vfs-orbit-hint" aria-hidden="true">
            <HiGlobeAlt className="vfs-orbit-hint__icon" />
            <span>Arrastra para orbitar el bosque en 3D · Usa la rueda para acercar</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VirtualForestSection;
