import React, { useState } from 'react';
import { HiArrowRight, HiShieldCheck, HiLocationMarker, HiExternalLink } from 'react-icons/hi';
import { FaTree, FaSun, FaWater, FaCheck } from 'react-icons/fa';
import './ProjectsBento.css';

export interface ProjectData {
  id: string;
  title: string;
  location: string;
  category: string;
  standard: string;
  registryId: string;
  sdgs: string[];
  pricePerTon: number;
  metricLabel: string;
  metricValue: string;
  description: string;
  imageUrl: string;
  featured?: boolean;
}

const PROJECTS: ProjectData[] = [
  {
    id: 'patagonia-reforest',
    title: 'Reforestación de Ecosistemas Nativos en Aysén',
    location: 'Patagonia, Chile',
    category: 'Soluciones Basadas en la Naturaleza',
    standard: 'Verra VCS',
    registryId: 'VCS-ID-2489',
    sdgs: ['ODS 13: Acción Climática', 'ODS 15: Vida Terrestre'],
    pricePerTon: 25,
    metricLabel: 'Hectáreas en restauración activa',
    metricValue: '1.240 ha',
    description: 'Restauración ecológica con especies nativas (Lenga, Coihue y Ñirre) en cuencas degradadas, protegiendo biodiversidad y capturando carbono de largo plazo con monitoreo satelital.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    featured: true,
  },
  {
    id: 'atacama-solar',
    title: 'Parque Solar Fotovoltaico Atacama Clean Power',
    location: 'Desierto de Atacama, Chile',
    category: 'Transición Energética',
    standard: 'Gold Standard',
    registryId: 'GS-ID-5104',
    sdgs: ['ODS 7: Energía Asequible', 'ODS 13: Acción Climática'],
    pricePerTon: 22,
    metricLabel: 'Emisiones desplazadas al año',
    metricValue: '8.750 t CO₂e',
    description: 'Generación solar de alta radiación que reemplaza generación térmica a carbón en la red eléctrica nacional, con certificación de impacto social en comunidades locales.',
    imageUrl: '/images/atacama_solar_park.jpg',
  },
  {
    id: 'magallanes-peatlands',
    title: 'Conservación de Turberas y Humedales Australes',
    location: 'Región de Magallanes, Chile',
    category: 'Reservorios de Carbono Azul y Turba',
    standard: 'Mercado Voluntario Auditado',
    registryId: 'REG-CL-9921',
    sdgs: ['ODS 13: Acción Climática', 'ODS 14: Vida Submarina'],
    pricePerTon: 28,
    metricLabel: 'Stock de carbono protegido',
    metricValue: '24.000 t CO₂',
    description: 'Protección estricta contra drenaje y fuego de turberas milenarias, los ecosistemas terrestres con mayor densidad de carbono por metro cuadrado del planeta.',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
  },
];

export const ProjectsBento: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('patagonia-reforest');

  const featured = PROJECTS[0];
  const sideProjects = PROJECTS.slice(1);

  return (
    <section className="pb-section" id="proyectos" aria-label="Portafolio de proyectos de compensación certificados">
      <div className="pb-container">
        {/* Encabezado Editorial de Sección */}
        <header className="pb-header">
          <div className="pb-eyebrow">
            <span className="pb-eyebrow-line" />
            <span>Portafolio de impacto verificado</span>
          </div>

          <div className="pb-title-row">
            <h2 className="pb-title">
              Proyectos reales auditados,{' '}
              <span className="pb-title-accent">con coordenadas y trazabilidad pública.</span>
            </h2>
            <p className="pb-lede">
              Cada tonelada que compensas está asignada a un proyecto físico certificado bajo estándares
              internacionales (Verra VCS o Gold Standard). Cero créditos fantasma.
            </p>
          </div>
        </header>

        {/* Bento Grid Asimétrico */}
        <div className="pb-grid">
          {/* Card Destacada (Slot Principal 60%) */}
          <article className="pb-card pb-card--featured">
            <div className="pb-card-media">
              <img
                src={featured.imageUrl}
                alt={featured.title}
                className="pb-card-img"
                loading="lazy"
              />
              <div className="pb-card-overlay" />
              <div className="pb-card-badges">
                <span className="pb-badge pb-badge--standard">
                  <HiShieldCheck aria-hidden="true" />
                  {featured.standard}
                </span>
                <span className="pb-badge pb-badge--registry">{featured.registryId}</span>
              </div>
            </div>

            <div className="pb-card-body">
              <div className="pb-meta-top">
                <span className="pb-location">
                  <HiLocationMarker aria-hidden="true" />
                  {featured.location}
                </span>
                <span className="pb-category">{featured.category}</span>
              </div>

              <h3 className="pb-card-title">{featured.title}</h3>
              <p className="pb-card-desc">{featured.description}</p>

              {/* Tags ODS */}
              <div className="pb-sdgs">
                {featured.sdgs.map((sdg) => (
                  <span key={sdg} className="pb-sdg-tag">
                    <FaCheck aria-hidden="true" />
                    {sdg}
                  </span>
                ))}
              </div>

              {/* Métricas y Acción */}
              <div className="pb-card-footer">
                <div className="pb-metric-block">
                  <span className="pb-metric-label">{featured.metricLabel}</span>
                  <span className="pb-metric-value">{featured.metricValue}</span>
                </div>

                <div className="pb-price-block">
                  <span className="pb-price-label">Valor de retiro</span>
                  <span className="pb-price-value">${featured.pricePerTon} USD / t</span>
                </div>

                <a
                  href="#calculadora"
                  className="pb-action-btn"
                  onClick={() => setSelectedProjectId(featured.id)}
                >
                  <FaTree aria-hidden="true" />
                  <span>Compensar en este proyecto</span>
                  <HiArrowRight aria-hidden="true" />
                </a>
              </div>
            </div>
          </article>

          {/* Columna Secundaria (2 Cards de Apoyo 40%) */}
          <div className="pb-side-column">
            {sideProjects.map((proj) => (
              <article key={proj.id} className="pb-card pb-card--side">
                <div className="pb-side-media">
                  <img src={proj.imageUrl} alt={proj.title} className="pb-side-img" loading="lazy" />
                  <div className="pb-side-badges">
                    <span className="pb-badge pb-badge--standard">
                      <HiShieldCheck aria-hidden="true" />
                      {proj.standard}
                    </span>
                    <span className="pb-badge pb-badge--registry">{proj.registryId}</span>
                  </div>
                </div>

                <div className="pb-side-content">
                  <div className="pb-meta-top">
                    <span className="pb-location">
                      <HiLocationMarker aria-hidden="true" />
                      {proj.location}
                    </span>
                  </div>

                  <h3 className="pb-side-title">{proj.title}</h3>
                  <p className="pb-side-desc">{proj.description}</p>

                  <div className="pb-side-footer">
                    <div className="pb-side-metric">
                      <span className="pb-metric-label">{proj.metricLabel}</span>
                      <span className="pb-metric-val-sm">{proj.metricValue}</span>
                    </div>

                    <div className="pb-side-price">
                      <span className="pb-side-price-tag">${proj.pricePerTon} USD / t</span>
                      <a
                        href="#calculadora"
                        className="pb-side-link"
                        onClick={() => setSelectedProjectId(proj.id)}
                      >
                        <span>Elegir</span>
                        <HiArrowRight aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsBento;
