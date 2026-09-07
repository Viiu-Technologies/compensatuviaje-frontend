import React from 'react';
import { HiArrowRight, HiOutlineDocumentReport, HiOutlineCloudUpload, HiOutlineCode, HiCheck } from 'react-icons/hi';
import { FaBuilding, FaShieldAlt } from 'react-icons/fa';
import './EnterpriseSuite.css';

const B2B_BENEFITS = [
  'Cumplimiento con Norma de Carácter General 461 de la CMF y estándares CSRD',
  'Reportes auditables con desglose Scope 3 (Categoría 6: Viajes de Negocios)',
  'Certificados corporativos consolidados con trazabilidad en blockchain',
  'Beneficios de posicionamiento reputacional y sustentabilidad corporativa',
];

export const EnterpriseSuite: React.FC = () => {
  const scrollToContactB2B = () => {
    const contactEl = document.getElementById('contacto');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
      const subjectSelect = document.getElementById('contact-subject') as HTMLSelectElement;
      if (subjectSelect) {
        subjectSelect.value = 'b2b';
      }
    }
  };

  return (
    <section className="es-section" id="empresas" aria-label="Soluciones corporativas de compensación para empresas">
      <div className="es-container">
        <div className="es-grid">
          {/* Columna Izquierda: Propuesta de Valor B2B */}
          <div className="es-content">
            <div className="es-eyebrow">
              <FaBuilding aria-hidden="true" />
              <span>Soluciones Corporativas B2B</span>
            </div>

            <h2 className="es-title">
              Automatiza la huella Scope 3 de tu empresa,{' '}
              <span className="es-title-accent">sin fricción y con rigor auditable.</span>
            </h2>

            <p className="es-lede">
              Gestiona, mide y neutraliza las emisiones de viajes de negocios de toda tu organización.
              Genera reportes ejecutivos listos para comités de sustentabilidad, memorias anuales y auditorías internacionales.
            </p>

            <ul className="es-benefits">
              {B2B_BENEFITS.map((b) => (
                <li key={b} className="es-benefit-item">
                  <span className="es-benefit-check">
                    <HiCheck aria-hidden="true" />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="es-actions">
              <button
                type="button"
                className="es-btn es-btn--primary"
                onClick={scrollToContactB2B}
              >
                <span>Agendar reunión corporativa</span>
                <HiArrowRight aria-hidden="true" />
              </button>
              <a
                href="#calculadora"
                className="es-btn es-btn--ghost"
              >
                <span>Probar calculadora primero</span>
              </a>
            </div>
          </div>

          {/* Columna Derecha: Mockup UI de Dashboard Corporativo */}
          <div className="es-mockup-wrapper">
            <div className="es-mockup-card">
              {/* Barra superior de ventana */}
              <div className="es-mockup-bar">
                <div className="es-mockup-dots">
                  <span className="es-dot es-dot--r" />
                  <span className="es-dot es-dot--y" />
                  <span className="es-dot es-dot--g" />
                </div>
                <span className="es-mockup-title">CompensaTuViaje B2B: Portal Scope 3</span>
                <span className="es-mockup-badge">Auditado GHG</span>
              </div>

              {/* Contenido interactivo simulado */}
              <div className="es-mockup-body">
                {/* 3 Métricas Rápidas B2B */}
                <div className="es-metrics-row">
                  <div className="es-m-card">
                    <span className="es-m-label">Vuelos analizados</span>
                    <span className="es-m-val">1.482</span>
                    <span className="es-m-sub">Últimos 12 meses</span>
                  </div>
                  <div className="es-m-card">
                    <span className="es-m-label">Emisiones Scope 3</span>
                    <span className="es-m-val">412,8 t</span>
                    <span className="es-m-sub">DEFRA 2024</span>
                  </div>
                  <div className="es-m-card es-m-card--accent">
                    <span className="es-m-label">Neutralizado</span>
                    <span className="es-m-val">100%</span>
                    <span className="es-m-sub">Polygon Blockchain</span>
                  </div>
                </div>

                {/* Features Pilares */}
                <div className="es-features-list">
                  <div className="es-feature-item">
                    <div className="es-f-icon">
                      <HiOutlineCloudUpload aria-hidden="true" />
                    </div>
                    <div className="es-f-text">
                      <h4>Carga masiva de itinerarios en segundos</h4>
                      <p>Sube archivos Excel o CSV de tu agencia de viajes y obtén el cálculo consolidado al instante.</p>
                    </div>
                  </div>

                  <div className="es-feature-item">
                    <div className="es-f-icon">
                      <HiOutlineDocumentReport aria-hidden="true" />
                    </div>
                    <div className="es-f-text">
                      <h4>Dossier ESG listo para la CMF y CSRD</h4>
                      <p>Descarga informes en PDF y Excel con metodología auditable por las Big 4.</p>
                    </div>
                  </div>

                  <div className="es-feature-item">
                    <div className="es-f-icon">
                      <HiOutlineCode aria-hidden="true" />
                    </div>
                    <div className="es-f-text">
                      <h4>API REST para agencias y booking engines</h4>
                      <p>Integra la compensación automática en tu software de reservas corporativas.</p>
                    </div>
                  </div>
                </div>

                {/* Footer del Mockup */}
                <div className="es-mockup-footer">
                  <FaShieldAlt className="es-footer-shield" aria-hidden="true" />
                  <span>Emisión de certificados corporativos con retiro irrevocable de créditos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnterpriseSuite;
