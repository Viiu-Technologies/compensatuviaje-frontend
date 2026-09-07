import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiArrowLeft, 
  HiMail, 
  HiOutlineClock, 
  HiShieldCheck, 
  HiOutlineChatAlt2,
  HiOutlineQuestionMarkCircle
} from 'react-icons/hi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactSection from '../components/ContactSection';
import './ContactPage.css';

const ContactPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Atención y Consultas | CompensaTuViaje';
  }, []);

  return (
    <div className="cp-page">
      <Header />

      <main className="cp-main">
        {/* Hero de Contacto */}
        <section className="cp-hero">
          <div className="cp-container">
            <Link to="/" className="cp-back-link">
              <HiArrowLeft /> Volver al inicio
            </Link>

            <span className="cp-eyebrow">
              <HiOutlineChatAlt2 /> Canal Oficial de Atención
            </span>

            <h1 className="cp-title">
              Estamos aquí para resolver tus dudas y acompañar tu impacto.
            </h1>

            <p className="cp-lead">
              Ya seas un viajero individual, una empresa calculando sus emisiones de alcance 3 o un desarrollador de proyectos de conservación, nuestro equipo te responderá de forma personalizada.
            </p>

            <div className="cp-meta-cards">
              <div className="cp-meta-card">
                <HiOutlineClock className="cp-meta-card__icon" />
                <div>
                  <h4>Tiempo de respuesta garantizado</h4>
                  <p>Menos de 24 horas hábiles</p>
                </div>
              </div>

              <div className="cp-meta-card">
                <HiMail className="cp-meta-card__icon" />
                <div>
                  <h4>Email de atención directa</h4>
                  <a href="mailto:contacto@compensatuviaje.com">contacto@compensatuviaje.com</a>
                </div>
              </div>

              <div className="cp-meta-card">
                <HiShieldCheck className="cp-meta-card__icon" />
                <div>
                  <h4>Privacidad protegida</h4>
                  <p>Cero spam · Datos 100% confidenciales</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección del formulario interactivo */}
        <section className="cp-form-wrapper">
          <ContactSection />
        </section>

        {/* Enlace a FAQ complementario */}
        <section className="cp-faq-link-section">
          <div className="cp-container">
            <div className="cp-faq-box">
              <HiOutlineQuestionMarkCircle className="cp-faq-icon" />
              <div>
                <h3>¿Buscas respuestas rápidas sobre cálculo o certificados?</h3>
                <p>Revisa nuestra sección de preguntas frecuentes con información detallada sobre factores DEFRA y metodología.</p>
              </div>
              <Link to="/#faq" className="cp-faq-btn">
                Ver Preguntas Frecuentes
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
