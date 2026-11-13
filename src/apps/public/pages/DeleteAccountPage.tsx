import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiArrowLeft,
  HiMail,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineTrash,
} from 'react-icons/hi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactSection from '../components/ContactSection';
import { LEGAL, LEGAL_ROUTES, OWNER_NAME } from '../../../shared/config/legal';
import { PUBLIC_SEO } from '../../../shared/config/publicSeo';
import { useSeo } from '../../../shared/utils/useSeo';
import './ContactPage.css';
import './SupportPage.css';
import '../components/legal/LegalLayout.css';
import './DeleteAccountPage.css';

interface RetentionRow {
  category: string;
  action: string;
  retention: string;
}

const RETENTION_ROWS: RetentionRow[] = [
  {
    category: 'Cuenta y credenciales de acceso (correo, Google, Apple ID y Supabase)',
    action:
      'Se elimina el usuario de autenticación, se revocan las sesiones y tokens vinculados (incluido Sign in with Apple) y se anonimizan nombre, correo, foto de perfil y preferencia de newsletter.',
    retention: 'Inmediata desde la app; máx. 30 días corridos si la solicitas por formulario o correo.',
  },
  {
    category: 'Trayectos terrestres, ubicación GPS y actividad de movimiento (Android e iOS)',
    action:
      'Se eliminan todos los puntos GPS registrados del trayecto (coordenadas, velocidad, altitud, precisión, marcas de tiempo y actividad detectada) y se borran coordenadas de inicio/término y geometrías de ruta.',
    retention: 'Ninguno (eliminación inmediata al ejecutar la baja).',
  },
  {
    category: 'Cálculos sin compensar, viajes guardados, insignias y ranking',
    action: 'Se eliminan de forma permanente de tu historial y del ranking.',
    retention: 'Ninguno (eliminación inmediata al ejecutar la baja).',
  },
  {
    category: 'Contribuciones climáticas ya compensadas, pagos y documentos tributarios',
    action:
      'Se conservan por obligación legal y tributaria en Chile, desvinculados de tus credenciales activas de acceso.',
    retention: '6 años desde la compra o emisión.',
  },
  {
    category: 'Registro público de Certificados emitidos (Polygon / IPFS)',
    action:
      'Permanece accesible para verificar la validez del Certificado sin incluir nombre, correo electrónico ni RUT.',
    retention: 'Permanente (registro inmutable sin datos personales).',
  },
  {
    category: 'Registros técnicos y de seguridad del servidor',
    action: 'Se mantienen exclusivamente para auditoría, prevención de fraude y estabilidad operativa.',
    retention: 'Hasta 12 meses.',
  },
];

const DeleteAccountPage: React.FC = () => {
  useSeo(PUBLIC_SEO['/eliminar-cuenta']);

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
              <HiOutlineTrash aria-hidden="true" /> Eliminación de cuenta · {OWNER_NAME}
            </span>

            <h1 className="cp-title">
              Eliminación de cuenta y datos en {LEGAL.brand}.
            </h1>

            <p className="cp-lead">
              Esta página oficial de <strong>{OWNER_NAME}</strong> explica cómo solicitar el borrado de tu
              cuenta de usuario de <strong>{LEGAL.brand}</strong> (aplicación móvil Android, iOS y
              plataforma web), qué información se elimina y qué datos se conservan por obligación legal o
              técnica.
            </p>

            <div className="cp-meta-cards">
              <div className="cp-meta-card">
                <HiOutlineShieldCheck className="cp-meta-card__icon" aria-hidden="true" />
                <div>
                  <h4>Aplicación y responsable</h4>
                  <p>
                    {LEGAL.brand} ({OWNER_NAME}
                    {LEGAL.rut ? ` · RUT ${LEGAL.rut}` : ''})
                  </p>
                </div>
              </div>

              <div className="cp-meta-card">
                <HiMail className="cp-meta-card__icon" aria-hidden="true" />
                <div>
                  <h4>Correo de privacidad</h4>
                  <a href={`mailto:${LEGAL.emails.privacy}?subject=Solicitud%20de%20eliminaci%C3%B3n%20de%20cuenta`}>
                    {LEGAL.emails.privacy}
                  </a>
                </div>
              </div>

              <div className="cp-meta-card">
                <HiOutlineClock className="cp-meta-card__icon" aria-hidden="true" />
                <div>
                  <h4>Tiempo de procesamiento</h4>
                  <p>Inmediato en la app · Máx. 30 días vía web</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="da-section" aria-labelledby="da-steps-heading">
          <div className="cp-container">
            <div className="da-header">
              <h2 id="da-steps-heading" className="da-title">
                Pasos para solicitar la eliminación de tu cuenta
              </h2>
              <p className="da-sub">
                Puedes borrar tu cuenta directamente dentro de la app o enviarnos una solicitud pública
                sin necesidad de tener la aplicación instalada.
              </p>
            </div>

            <div className="sp-guides-grid">
              <article className="sp-guide-card sp-guide-card--highlight">
                <h3>Opción 1: Directamente desde la app (Android e iOS)</h3>
                <ol className="da-steps">
                  <li>
                    Abre la aplicación móvil <strong>{LEGAL.brand}</strong> e inicia sesión con tu cuenta.
                  </li>
                  <li>
                    Ingresa a tu perfil o ajustes de cuenta y toca <strong>Eliminar cuenta</strong>.
                  </li>
                  <li>
                    Confirma la eliminación (si iniciaste sesión con <strong>Sign in with Apple</strong>,
                    tu dispositivo pedirá reconfirmar con Apple ID para revocar el acceso).
                  </li>
                  <li>
                    Tu acceso quedará cerrado y los datos personales vinculados se eliminarán o anonimizarán
                    de inmediato.
                  </li>
                </ol>
              </article>

              <article className="sp-guide-card">
                <h3>Opción 2: Solicitud web o por correo (sin abrir la app)</h3>
                <ol className="da-steps">
                  <li>
                    Completa el <a href="#solicitar-eliminacion">formulario de abajo</a> indicando{' '}
                    <strong>el correo electrónico asociado a tu cuenta</strong>, o escribe directamente a{' '}
                    <a href={`mailto:${LEGAL.emails.privacy}`}>{LEGAL.emails.privacy}</a>.
                  </li>
                  <li>
                    Validaremos que la solicitud proviene del titular del correo registrado para evitar
                    eliminaciones por terceros.
                  </li>
                  <li>
                    Procesaremos la baja y te enviaremos confirmación por correo en un plazo máximo de{' '}
                    <strong>30 días corridos</strong>.
                  </li>
                </ol>
              </article>
            </div>
          </div>
        </section>

        <section className="da-section" aria-labelledby="da-retention-heading">
          <div className="cp-container">
            <div className="da-header">
              <h2 id="da-retention-heading" className="da-title">
                Datos que se eliminan, datos que se conservan y plazos de retención
              </h2>
              <p className="da-sub">
                Al eliminar tu cuenta en {LEGAL.brand} aplicamos este tratamiento sobre cada categoría de
                información:
              </p>
            </div>

            <div className="da-table-card">
              <div className="lgl-table-wrap">
                <table className="lgl-table">
                  <thead>
                    <tr>
                      <th>Tipo de dato</th>
                      <th>Qué ocurre al eliminar la cuenta</th>
                      <th>Plazo adicional de conservación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RETENTION_ROWS.map((row) => (
                      <tr key={row.category}>
                        <td>
                          <strong>{row.category}</strong>
                        </td>
                        <td>{row.action}</td>
                        <td>{row.retention}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="da-note">
                Puedes consultar el detalle completo de tratamiento de datos en nuestra{' '}
                <Link to={LEGAL_ROUTES.privacy}>Política de Privacidad</Link> o escribir a{' '}
                <Link to="/soporte">Soporte</Link>.
              </p>
            </div>
          </div>
        </section>

        <section className="cp-form-wrapper">
          <ContactSection
            defaultSubject="Solicitud de eliminación de cuenta"
            contactEmail={LEGAL.emails.privacy}
            sectionId="solicitar-eliminacion"
            eyebrow="Solicitud de Eliminación"
            titleTop="Solicita el borrado"
            titleAccent="de tu cuenta desde aquí"
            lede="Usa el mismo correo asociado a tu cuenta en CompensaTuViaje (web, Android o iOS) para verificar titularidad y procesar tu eliminación."
            messagePlaceholder="Indica el correo electrónico de tu cuenta de CompensaTuViaje y si ingresabas con correo, Google o Apple ID..."
            submitLabel="Enviar solicitud de eliminación"
          />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DeleteAccountPage;

