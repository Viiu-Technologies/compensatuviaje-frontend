import React from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiOutlineDocumentReport, HiOutlineCloudUpload, HiOutlineCode, HiCheck } from 'react-icons/hi';
import { FaShieldAlt } from 'react-icons/fa';
import { useGsapReveal, reveal, sectionTimeline } from '../hooks/useGsapReveal';
import { enterFrom } from '../hooks/motion';
import './EnterpriseSuite.css';

const B2B_BENEFITS = [
  'Reportes con desglose Scope 3 (Categoría 6: viajes de negocio), útiles para informar bajo la NCG 461 de la CMF y la CSRD',
  'Certificados corporativos consolidados con el detalle de cada compensación',
  'Beneficios de posicionamiento reputacional y sustentabilidad corporativa',
];

export const EnterpriseSuite: React.FC = () => {
  const scopeRef = useGsapReveal<HTMLElement>((root) => {
    // El texto entra por la izquierda; el panel se arma pieza por pieza: sube
    // la tarjeta, baja la barra de ventana, y métricas y capacidades llegan
    // desde los lados.
    sectionTimeline(root)
      .from('.es-eyebrow', { y: 10, autoAlpha: 0 }, 0)
      .add(reveal(root, '.es-title'), 0.05)
      .add(enterFrom('.es-lede', 'left', { x: -24, duration: 0.5 }), 0.15)
      .add(enterFrom('.es-benefit-item', 'left', { x: -24, duration: 0.5, stagger: 0.06 }), 0.2)
      .add(enterFrom('.es-actions', 'left', { x: -24, duration: 0.5 }), 0.38)
      .from('.es-mockup-card', { y: 28, autoAlpha: 0, duration: 0.6 }, 0.1)
      .from('.es-mockup-bar', { yPercent: -100, duration: 0.5 }, 0.3)
      .from('.es-m-card', { x: (i: number) => [-36, 0, 36][i] ?? 0, y: (i: number) => (i === 1 ? 24 : 0), autoAlpha: 0, duration: 0.55, stagger: 0.07 }, 0.5)
      .add(enterFrom('.es-feature-item', 'right', { x: 32, duration: 0.5, stagger: 0.07 }), 0.7)
      .from('.es-mockup-footer', { autoAlpha: 0, duration: 0.4 }, 0.95);
  }, []);

  return (
    <section ref={scopeRef} className="es-section" id="empresas" aria-label="Soluciones corporativas de compensación para empresas">
      <div className="es-container">
        <div className="es-grid">
          {/* Columna Izquierda: Propuesta de Valor B2B */}
          <div className="es-content">
            <div className="es-eyebrow">
              <span className="es-eyebrow__line" />
              <span>Soluciones para empresas</span>
            </div>

            <h2 className="es-title">
              Automatiza la huella Scope 3 de los viajes de tu empresa.
            </h2>

            <p className="es-lede">
              Gestiona y mide las emisiones de los viajes de negocios de toda tu organización y contribuye a proyectos ambientales verificados.
              Genera reportes ejecutivos para comités de sustentabilidad, memorias anuales y procesos de auditoría.
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
              {/* El formulario de contacto vive en /contacto (no en la landing):
                  antes se buscaba #contacto aquí y el botón no hacía nada. */}
              <Link
                to="/contacto?asunto=b2b#contacto"
                className="es-btn es-btn--primary"
                data-magnetic
              >
                <span>Agendar reunión</span>
                <HiArrowRight aria-hidden="true" />
              </Link>
              <Link
                to="/#calculadora"
                className="es-btn es-btn--ghost"
              >
                <span>Calcula tu huella</span>
              </Link>
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
                {/* Las cifras del mockup son ilustrativas, no de un cliente real. */}
                <span className="es-mockup-badge">Vista de ejemplo</span>
              </div>

              {/* Contenido interactivo simulado */}
              <div className="es-mockup-body">
                {/* 3 Métricas Rápidas B2B */}
                <div className="es-metrics-row">
                  <div className="es-m-card">
                    <span className="es-m-label">Vuelos</span>
                    <span className="es-m-val">1.482</span>
                    <span className="es-m-sub">Últimos 12 meses</span>
                  </div>
                  <div className="es-m-card">
                    <span className="es-m-label">Emisiones</span>
                    <span className="es-m-val">412,8 t</span>
                    <span className="es-m-sub">Scope 3 · DEFRA 2025</span>
                  </div>
                  <div className="es-m-card es-m-card--accent">
                    <span className="es-m-label">Contribución</span>
                    <span className="es-m-val">100%</span>
                    <span className="es-m-sub">Certificado verificable</span>
                  </div>
                </div>

                {/* Features Pilares */}
                <div className="es-features-list">
                  <div className="es-feature-item">
                    <div className="es-f-icon">
                      <HiOutlineCloudUpload aria-hidden="true" />
                    </div>
                    <div className="es-f-text">
                      <h3>Carga masiva de itinerarios en segundos</h3>
                      <p>Sube archivos Excel o CSV de tu agencia de viajes y obtén el cálculo consolidado al instante.</p>
                    </div>
                  </div>

                  <div className="es-feature-item">
                    <div className="es-f-icon">
                      <HiOutlineDocumentReport aria-hidden="true" />
                    </div>
                    <div className="es-f-text">
                      <h3>Resumen mensual para tus reportes CMF y CSRD</h3>
                      <p>Consulta en tu panel las emisiones de cada mes, calculadas con factores DEFRA documentados.</p>
                    </div>
                  </div>

                  <div className="es-feature-item">
                    <div className="es-f-icon">
                      <HiOutlineCode aria-hidden="true" />
                    </div>
                    <div className="es-f-text">
                      <h3>Integraciones a medida</h3>
                      <p>¿Necesitas conectar tu sistema de reservas? Conversemos y evaluamos la integración contigo.</p>
                    </div>
                  </div>
                </div>

                {/* Footer del Mockup */}
                <div className="es-mockup-footer">
                  <FaShieldAlt className="es-footer-shield" aria-hidden="true" />
                  <span>Emisión de certificados corporativos por cada compensación</span>
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
