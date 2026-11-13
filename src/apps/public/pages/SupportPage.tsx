import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiArrowLeft,
  HiMail,
  HiOutlineClock,
  HiShieldCheck,
  HiOutlineChatAlt2,
  HiOutlineQuestionMarkCircle,
} from 'react-icons/hi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactSection from '../components/ContactSection';
import { LEGAL, LEGAL_ROUTES } from '../../../shared/config/legal';
import { PUBLIC_SEO } from '../../../shared/config/publicSeo';
import { useSeo } from '../../../shared/utils/useSeo';
import './ContactPage.css';
import './SupportPage.css';

interface SupportTopic {
  id?: string;
  title: string;
  body: React.ReactNode;
  link?: { to: string; label: string };
  highlight?: boolean;
}

const SUPPORT_TOPICS: SupportTopic[] = [
  {
    title: 'Inicio de sesión y acceso (Google, Apple ID o correo)',
    body: (
      <>
        Funciona en <strong>Android, iOS y web</strong>. Si usaste <strong>Google Sign-In</strong> o{' '}
        <strong>Sign in with Apple</strong> (incluso con correo privado reenviado), vuelve a ingresar con
        la misma cuenta para conservar tus trayectos y certificados. Si tienes problemas de acceso,
        escríbenos indicando tu correo.
      </>
    ),
  },
  {
    title: 'Trayectos terrestres, distancia y permisos GPS (Android e iOS)',
    body: (
      <>
        Para medir la distancia y el modo de transporte de tus desplazamientos terrestres, la app móvil en{' '}
        <strong>Android e iOS</strong> necesita permisos de ubicación (GPS) y movimiento/actividad mientras
        registras un recorrido. Si el trayecto no calcula distancia o queda abierto, revisa los permisos de
        ubicación en los ajustes del teléfono y verifica tu conexión para sincronizar.
      </>
    ),
    link: { to: `${LEGAL_ROUTES.privacy}#ubicacion`, label: 'Ver uso de ubicación y permisos' },
  },
  {
    title: 'Vuelos, certificados digitales y pagos con Webpay',
    body: (
      <>
        Tus cálculos, contribuciones climáticas y certificados se sincronizan entre Android, iOS y la web
        (verificables en el <Link to="/#verificar">buscador público</Link>). Si un pago con Webpay quedó
        pendiente o necesitas revisar un reembolso, indícanos la fecha aproximada y el correo de tu cuenta.
      </>
    ),
    link: { to: LEGAL_ROUTES.refunds, label: 'Ver Política de Reembolsos' },
  },
  {
    id: 'eliminar-cuenta',
    title: 'Cómo eliminar tu cuenta y datos (Android, iOS y Web)',
    highlight: true,
    body: (
      <>
        Puedes eliminar tu cuenta en cualquier momento desde la opción <strong>Eliminar cuenta</strong>{' '}
        dentro de la app móvil Android o iOS (si ingresaste con Apple, la app solicitará reconfirmar con tu
        Apple ID para revocar el acceso), o enviarnos una solicitud web sin necesidad de abrir la
        aplicación.
      </>
    ),
    link: { to: '/eliminar-cuenta', label: 'Solicitar eliminación y ver datos retenidos' },
  },
];

const SupportPage: React.FC = () => {
  useSeo(PUBLIC_SEO['/soporte']);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="cp-page">
      <Header />

      <main className="cp-main">
        <section className="cp-hero">
          <div className="cp-container">
            <Link to="/" className="cp-back-link">
              <HiArrowLeft aria-hidden="true" /> Volver al inicio
            </Link>

            <span className="cp-eyebrow">
              <HiOutlineChatAlt2 aria-hidden="true" /> Centro de Soporte
            </span>

            <h1 className="cp-title">
              Soporte y ayuda para la app móvil y la plataforma web.
            </h1>

            <p className="cp-lead">
              ¿Tienes algún problema con tu cuenta, tus viajes, tus certificados o tu sesión en la app de{' '}
              {LEGAL.brand}? Aquí encuentras nuestras guías rápidas y canales directos de atención.
            </p>

            <div className="cp-meta-cards">
              <div className="cp-meta-card">
                <HiOutlineClock className="cp-meta-card__icon" aria-hidden="true" />
                <div>
                  <h4>Tiempo de respuesta</h4>
                  <p>Menos de 24 horas hábiles</p>
                </div>
              </div>

              <div className="cp-meta-card">
                <HiMail className="cp-meta-card__icon" aria-hidden="true" />
                <div>
                  <h4>Correo de soporte directo</h4>
                  <a href={`mailto:${LEGAL.emails.support}?subject=Soporte%20App%20CompensaTuViaje`}>
                    {LEGAL.emails.support}
                  </a>
                </div>
              </div>

              <div className="cp-meta-card">
                <HiShieldCheck className="cp-meta-card__icon" aria-hidden="true" />
                <div>
                  <h4>Privacidad y cuenta</h4>
                  <Link to={LEGAL_ROUTES.privacy}>Política de Privacidad</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sp-guides-section" aria-labelledby="sp-guides-heading">
          <div className="cp-container">
            <div className="sp-guides-header">
              <h2 id="sp-guides-heading" className="sp-guides-title">
                Guías rápidas de ayuda
              </h2>
              <p className="sp-guides-sub">
                Soluciones frecuentes para quienes usan la aplicación móvil (Android e iOS) o la plataforma web.
              </p>
            </div>

            <div className="sp-guides-grid">
              {SUPPORT_TOPICS.map((topic) => (
                <article
                  key={topic.title}
                  id={topic.id}
                  className={`sp-guide-card ${topic.highlight ? 'sp-guide-card--highlight' : ''}`}
                >
                  <h3>{topic.title}</h3>
                  <p>{topic.body}</p>
                  {topic.link && (
                    <Link to={topic.link.to} className="sp-guide-card__link">
                      {topic.link.label} →
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cp-form-wrapper">
          <ContactSection
            defaultSubject="soporte_tecnico"
            contactEmail={LEGAL.emails.support}
            sectionId="formulario-soporte"
            eyebrow="Soporte Técnico"
            titleTop="¿Necesitas ayuda"
            titleAccent="con tu cuenta o la app?"
            lede="Cuéntanos qué ocurrió en la app móvil (Android o iOS) o en la web (si puedes, indica el correo de tu cuenta y tu dispositivo) y nuestro equipo te responderá en menos de 24 horas hábiles."
          />
        </section>

        <section className="cp-faq-link-section">
          <div className="cp-container">
            <div className="cp-faq-box">
              <HiOutlineQuestionMarkCircle className="cp-faq-icon" aria-hidden="true" />
              <div>
                <h3>¿Buscas dudas sobre factores DEFRA o certificados?</h3>
                <p>Revisa las preguntas frecuentes o consulta cómo calculamos las emisiones de cada vuelo.</p>
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

export default SupportPage;

