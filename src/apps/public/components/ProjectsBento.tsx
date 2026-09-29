import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiShieldCheck, HiLocationMarker } from 'react-icons/hi';
import { FaTree, FaCheck } from 'react-icons/fa';
import { getPublicProjects, type B2CProject } from '../../b2c/services/b2cApi';
import { formatCLPPerTon } from '../../../utils/currency';
import './ProjectsBento.css';

export interface ProjectData {
  id: string;
  title: string;
  location: string;
  category: string;
  badge: string;
  sdgs: string[];
  priceLabel: string;
  metricLabel: string;
  metricValue: string;
  description: string;
  imageUrl: string | null;
  href: string;
  ctaLabel: string;
}

const TYPE_LABELS: Record<string, string> = {
  reforestation: 'Reforestación',
  conservation: 'Conservación',
  clean_water: 'Agua limpia',
  water_security: 'Seguridad hídrica',
  circular_economy: 'Economía circular',
  waste_management: 'Gestión de residuos',
  energy_efficiency: 'Eficiencia energética',
  social_housing: 'Vivienda social',
  community_development: 'Desarrollo comunitario',
  renewable_energy: 'Energía renovable',
  biodiversity: 'Biodiversidad',
};

// Respaldo cuando la API no responde o aún no hay proyectos publicados. Son
// ejemplos del tipo de proyecto que evaluamos, no proyectos cargados en la
// plataforma: por eso no llevan sello de Veritas AI y su CTA lleva a la
// calculadora en vez de a compensar en un proyecto que no existe.
const REFERENCE_PROJECTS: ProjectData[] = [
  {
    id: 'ref-patagonia',
    title: 'Reforestación de ecosistemas nativos',
    location: 'Aysén, Chile',
    category: 'Soluciones basadas en la naturaleza',
    badge: 'Proyecto de referencia',
    sdgs: ['ODS 13: Acción Climática', 'ODS 15: Vida Terrestre'],
    priceLabel: 'Según proyecto',
    metricLabel: 'Tipo de impacto',
    metricValue: 'Captura de carbono',
    description: 'Restauración ecológica con especies nativas (lenga, coihue y ñirre) en cuencas degradadas, protegiendo biodiversidad y capturando carbono de largo plazo.',
    imageUrl: '/images/projects/ref-patagonia.webp',
    href: '/calculadora',
    ctaLabel: 'Calcular mi huella',
  },
  {
    id: 'ref-atacama',
    title: 'Energía solar fotovoltaica',
    location: 'Desierto de Atacama, Chile',
    category: 'Transición energética',
    badge: 'Proyecto de referencia',
    sdgs: [],
    priceLabel: 'Según proyecto',
    metricLabel: 'Tipo de impacto',
    metricValue: 'Emisiones evitadas',
    description: 'Generación solar de alta radiación que reemplaza generación térmica a carbón en la red eléctrica.',
    imageUrl: '/images/projects/ref-atacama.webp',
    href: '/calculadora',
    ctaLabel: 'Calcular',
  },
  {
    // Antes "Turberas de Magallanes" con una foto de una higuera tropical:
    // la imagen no correspondía al proyecto.
    id: 'ref-bosque-nativo',
    title: 'Conservación de bosque nativo',
    location: 'Sur de Chile',
    category: 'Conservación',
    badge: 'Proyecto de referencia',
    sdgs: [],
    priceLabel: 'Según proyecto',
    metricLabel: 'Tipo de impacto',
    metricValue: 'Carbono conservado',
    description: 'Protección de bosque nativo frente a la tala y los incendios, manteniendo el carbono almacenado y el hábitat de especies endémicas.',
    imageUrl: '/images/projects/ref-bosque-nativo.webp',
    href: '/calculadora',
    ctaLabel: 'Calcular',
  },
];

// coBenefits llega como string[] o como { beneficio: true } (ver B2CProjectsPage).
const coBenefitChips = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw.map(String);
  if (raw && typeof raw === 'object') {
    return Object.entries(raw as Record<string, unknown>).filter(([, v]) => v).map(([k]) => k);
  }
  return [];
};

const toProjectData = (p: B2CProject): ProjectData => ({
  id: p.id,
  title: p.name,
  location: [p.region, p.country].filter(Boolean).join(', '),
  category: TYPE_LABELS[p.projectType] ?? p.projectType,
  badge: p.veritasAI ? 'Verificado · Veritas AI' : 'Proyecto aprobado',
  sdgs: coBenefitChips(p.coBenefits).slice(0, 2),
  priceLabel: formatCLPPerTon(p.pricePerTonCLP),
  metricLabel: p.isSoldOut ? 'Disponibilidad' : 'Disponible este mes',
  metricValue: p.isSoldOut
    ? 'Agotado este mes'
    : `${p.availableUnits.toLocaleString('es-CL')} ${p.impact_unit || 'uds'}`,
  description: p.description ?? '',
  imageUrl: p.photos?.[0]?.thumbnailUrl ?? p.photos?.[0]?.url ?? null,
  href: `/b2c/calculator?projectId=${encodeURIComponent(p.id)}`,
  ctaLabel: 'Compensar en este proyecto',
});

const ProjectImage: React.FC<{ src: string | null; alt: string; className: string }> = ({ src, alt, className }) =>
  src ? (
    <img src={src} alt={alt} className={className} loading="lazy" />
  ) : (
    <div className={`${className} pb-media-placeholder`} aria-hidden="true">
      <FaTree />
    </div>
  );

export const ProjectsBento: React.FC = () => {
  // null = cargando
  const [projects, setProjects] = useState<ProjectData[] | null>(null);
  const [isReference, setIsReference] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPublicProjects()
      .then((list) => {
        if (cancelled) return;
        // Primero los que tienen stock disponible este mes.
        const sorted = [...list].sort((a, b) => Number(a.isSoldOut) - Number(b.isSoldOut));
        if (sorted.length > 0) {
          setProjects(sorted.slice(0, 3).map(toProjectData));
        } else {
          setProjects(REFERENCE_PROJECTS);
          setIsReference(true);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setProjects(REFERENCE_PROJECTS);
        setIsReference(true);
      });
    return () => { cancelled = true; };
  }, []);

  const featured = projects?.[0];
  const sideProjects = projects?.slice(1) ?? [];

  return (
    <section className="pb-section" id="proyectos" aria-label="Portafolio de proyectos de compensación">
      <div className="pb-container">
        {/* Encabezado Editorial de Sección */}
        <header className="pb-header">
          <div className="pb-eyebrow">
            <span className="pb-eyebrow-line" />
            <span>Portafolio de proyectos</span>
          </div>

          <div className="pb-title-row">
            <h2 className="pb-title">
              Proyectos concretos, evaluados antes de recibir tu compensación.
            </h2>
            <p className="pb-lede">
              Cada proyecto pasa por Veritas AI, nuestra certificación agéntica que evalúa su
              evidencia documental, y por una revisión humana antes de poder recibir compensaciones.
              {isReference && (
                <span className="pb-reference-note">
                  Los proyectos de abajo son ejemplos de referencia del tipo de iniciativa que evaluamos.
                </span>
              )}
            </p>
          </div>
        </header>

        {!featured ? (
          <div className="pb-grid pb-grid--loading" aria-busy="true" aria-label="Cargando proyectos">
            <div className="pb-skeleton pb-skeleton--featured" />
            <div className="pb-side-column">
              <div className="pb-skeleton" />
              <div className="pb-skeleton" />
            </div>
          </div>
        ) : (
        /* Bento Grid Asimétrico */
        <div className="pb-grid">
          {/* Card Destacada (Slot Principal 60%) */}
          <article className="pb-card pb-card--featured">
            <div className="pb-card-media">
              <ProjectImage src={featured.imageUrl} alt={featured.title} className="pb-card-img" />
              <div className="pb-card-overlay" />
              <div className="pb-card-badges">
                <span className={`pb-badge ${isReference ? 'pb-badge--reference' : 'pb-badge--standard'}`}>
                  {!isReference && <HiShieldCheck aria-hidden="true" />}
                  {featured.badge}
                </span>
              </div>
            </div>

            <div className="pb-card-body">
              <div className="pb-meta-top">
                {featured.location && (
                  <span className="pb-location">
                    <HiLocationMarker aria-hidden="true" />
                    {featured.location}
                  </span>
                )}
                <span className="pb-category">{featured.category}</span>
              </div>

              <h3 className="pb-card-title">{featured.title}</h3>
              <p className="pb-card-desc">{featured.description}</p>

              {/* Tags ODS / co-beneficios */}
              {featured.sdgs.length > 0 && (
                <div className="pb-sdgs">
                  {featured.sdgs.map((sdg) => (
                    <span key={sdg} className="pb-sdg-tag">
                      <FaCheck aria-hidden="true" />
                      {sdg}
                    </span>
                  ))}
                </div>
              )}

              {/* Métricas y Acción */}
              <div className="pb-card-footer">
                <div className="pb-metric-block">
                  <span className="pb-metric-label">{featured.metricLabel}</span>
                  <span className="pb-metric-value">{featured.metricValue}</span>
                </div>

                <div className="pb-price-block">
                  <span className="pb-price-label">Precio por tonelada</span>
                  <span className="pb-price-value">{featured.priceLabel}</span>
                </div>

                <Link to={featured.href} className="pb-action-btn">
                  <FaTree aria-hidden="true" />
                  <span>{featured.ctaLabel}</span>
                  <HiArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>
          </article>

          {/* Columna Secundaria (2 Cards de Apoyo 40%) */}
          <div className="pb-side-column">
            {sideProjects.map((proj) => (
              <article key={proj.id} className="pb-card pb-card--side">
                <div className="pb-side-media">
                  <ProjectImage src={proj.imageUrl} alt={proj.title} className="pb-side-img" />
                  <div className="pb-side-badges">
                    <span className={`pb-badge ${isReference ? 'pb-badge--reference' : 'pb-badge--standard'}`}>
                      {!isReference && <HiShieldCheck aria-hidden="true" />}
                      {proj.badge}
                    </span>
                  </div>
                </div>

                <div className="pb-side-content">
                  {proj.location && (
                    <div className="pb-meta-top">
                      <span className="pb-location">
                        <HiLocationMarker aria-hidden="true" />
                        {proj.location}
                      </span>
                    </div>
                  )}

                  <h3 className="pb-side-title">{proj.title}</h3>
                  <p className="pb-side-desc">{proj.description}</p>

                  <div className="pb-side-footer">
                    <div className="pb-side-metric">
                      <span className="pb-metric-label">{proj.metricLabel}</span>
                      <span className="pb-metric-val-sm">{proj.metricValue}</span>
                    </div>

                    <div className="pb-side-price">
                      <span className="pb-side-price-tag">{proj.priceLabel}</span>
                      <Link to={proj.href} className="pb-side-link">
                        <span>{isReference ? 'Calcular' : 'Elegir'}</span>
                        <HiArrowRight aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsBento;
