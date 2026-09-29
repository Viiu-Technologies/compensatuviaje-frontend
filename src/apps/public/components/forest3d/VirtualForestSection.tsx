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
            <span className="vfs-eyebrow__line" />
            <span>Visualización 3D · Bosque nativo</span>
          </div>

          <h2 className="vfs-title">
            Tu huella convertida en <em>bosque vivo</em>
          </h2>

          {/* Antes decía "gemelo digital en tiempo real": la escena es una
              recreación procedural, no está conectada a datos de campo. */}
          <p className="vfs-lede">
            No compensas una transacción abstracta: apoyas proyectos concretos de conservación y
            restauración. Explora una recreación del bosque nativo del sur de Chile, como el que
            protegen los proyectos de nuestra red.
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

          {/* Tarjeta flotante: cómo se respalda cada compensación. Reemplaza la
              antigua "telemetría" (15.420 t, ~48.500 árboles, Sentinel-2), que
              eran cifras fijas en el código y no datos reales. */}
          <div className="vfs-telemetry-card">
            <div className="vfs-telemetry-header">
              <span className="vfs-telemetry-dot" />
              <span>Detrás de cada compensación</span>
            </div>

            <div className="vfs-telemetry-grid">
              <div className="vfs-telemetry-item">
                <span className="vfs-telemetry-val">Veritas AI</span>
                <span className="vfs-telemetry-unit">Evaluación agéntica</span>
                <span className="vfs-telemetry-sub">De cada proyecto antes de publicarlo</span>
              </div>
              <div className="vfs-telemetry-item">
                <span className="vfs-telemetry-val">Revisión</span>
                <span className="vfs-telemetry-unit">Humana</span>
                <span className="vfs-telemetry-sub">Valida el informe de Veritas AI</span>
              </div>
              <div className="vfs-telemetry-item">
                <span className="vfs-telemetry-val">Polygon</span>
                <span className="vfs-telemetry-unit">Certificado on-chain</span>
                <span className="vfs-telemetry-sub">Verificable por cualquiera</span>
              </div>
            </div>

            <footer className="vfs-telemetry-footer">
              <div className="vfs-telemetry-badge">
                <HiShieldCheck className="vfs-badge-icon" />
                <span>Proyectos en Chile con evidencia documental</span>
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
            <span>Arrastra para orbitar el bosque en 3D</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VirtualForestSection;
