import React, { useState } from 'react';
import gsap from 'gsap';
import { HiArrowRight, HiCheck, HiExclamation, HiMail, HiOutlineClock, HiShieldCheck } from 'react-icons/hi';
import { useGsapReveal } from '../hooks/useGsapReveal';
import { sendContactMessage } from '../services/publicApi';
import './ContactSection.css';

const SUBJECT_OPTIONS = [
  { value: 'general', label: 'Consulta general' },
  { value: 'b2b', label: 'Compensación corporativa (B2B / Scope 3)' },
  { value: 'alianzas', label: 'Alianzas y registro de proyectos' },
  { value: 'soporte_tecnico', label: 'Soporte y verificación' },
  { value: 'otro', label: 'Otro requerimiento' },
];

const OFFICIAL_CONTACT_EMAIL = 'contacto@compensatuviaje.com';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: 'general',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scopeRef = useGsapReveal<HTMLElement>((root) => {
    gsap.set(root.querySelectorAll('.ctv-reveal'), { autoAlpha: 1 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });
    tl.from('.contact-eyebrow', { y: 12, autoAlpha: 0, duration: 0.6 }, 0);
    tl.from('.contact-title .hero-line__inner', {
      yPercent: 110,
      stagger: 0.1,
      duration: 0.9,
    }, 0.1);
    tl.from('.contact-lede', { y: 14, autoAlpha: 0, duration: 0.6 }, 0.4);
    tl.from('.contact-form', { y: 24, autoAlpha: 0, duration: 0.8 }, 0.5);
    tl.from('.contact-visual', { x: 24, autoAlpha: 0, duration: 0.85 }, 0.4);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.name.trim().length < 2) {
      setErrorMessage('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    if (formData.message.trim().length < 10) {
      setErrorMessage('El mensaje debe tener al menos 10 caracteres explicativos.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await sendContactMessage({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        subject: formData.subject,
        message: formData.message,
      });

      if (res.success) {
        setSubmitted(true);
        setStatusMessage(res.message);
      } else {
        setErrorMessage(res.message || 'Ocurrió un error al enviar el mensaje. Intenta nuevamente.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión con el servicio de soporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section ref={scopeRef} id="contacto" className="contact-section">
      <div className="contact-container">
        <div className="contact-grid">
          {/* Columna Izquierda: Información Institucional */}
          <div className="contact-content">
            <header className="contact-header">
              <span className="contact-eyebrow ctv-reveal">
                <span className="contact-eyebrow__line" />
                Atención y Consultas
              </span>

              <h2 className="contact-title">
                <span className="hero-line"><span className="hero-line__inner">Inicia tu plan de</span></span>
                <span className="hero-line contact-title--accent">
                  <span className="hero-line__inner"><em>acción climática</em>.</span>
                </span>
              </h2>

              <p className="contact-lede ctv-reveal">
                Cuéntanos sobre tus requerimientos de viaje individual o metas corporativas Scope 3.
                Nuestro equipo de especialistas en sostenibilidad responde en menos de 24 horas hábiles.
              </p>

              <div className="contact-channel-card ctv-reveal">
                <div className="contact-channel-icon">
                  <HiMail aria-hidden="true" />
                </div>
                <div className="contact-channel-info">
                  <span className="contact-channel-label">Canal Oficial Institucional</span>
                  <a href={`mailto:${OFFICIAL_CONTACT_EMAIL}`} className="contact-channel-email">
                    {OFFICIAL_CONTACT_EMAIL}
                  </a>
                </div>
              </div>

              <div className="contact-trust-badges ctv-reveal">
                <div className="contact-trust-item">
                  <HiOutlineClock aria-hidden="true" />
                  <span>Respuesta garantizada en 24h</span>
                </div>
                <div className="contact-trust-item">
                  <HiShieldCheck aria-hidden="true" />
                  <span>Confidencialidad y protección de datos</span>
                </div>
              </div>
            </header>
          </div>

          {/* Columna Derecha: Formulario Interactivo */}
          <div className="contact-visual ctv-reveal">
            <div className="contact-card">
              {submitted ? (
                <div className="contact-success" role="status">
                  <span className="contact-success__icon" aria-hidden="true">
                    <HiCheck />
                  </span>
                  <h3 className="contact-success__title">Mensaje recibido exitosamente</h3>
                  <p className="contact-success__sub">
                    {statusMessage || 'Gracias por contactarnos. Te responderemos a la brevedad con información detallada.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        company: '',
                        subject: 'general',
                        message: '',
                      });
                    }}
                    className="contact-success__again"
                  >
                    Enviar otra consulta
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <h3 className="contact-form-title">Envíanos un mensaje directo</h3>

                  {errorMessage && (
                    <div className="contact-alert contact-alert--error" role="alert">
                      <HiExclamation aria-hidden="true" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="contact-row">
                    <div className="contact-field">
                      <label htmlFor="contact-name" className="contact-label">
                        Nombre completo *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        required
                        minLength={2}
                        maxLength={120}
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej. Juana Pérez"
                        className="contact-input"
                      />
                    </div>

                    <div className="contact-field">
                      <label htmlFor="contact-email" className="contact-label">
                        Correo electrónico *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        required
                        maxLength={255}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@empresa.cl"
                        className="contact-input"
                      />
                    </div>
                  </div>

                  <div className="contact-row">
                    <div className="contact-field">
                      <label htmlFor="contact-company" className="contact-label">
                        Empresa u organización (opcional)
                      </label>
                      <input
                        id="contact-company"
                        type="text"
                        name="company"
                        maxLength={200}
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Ej. Austral Logistics SpA"
                        className="contact-input"
                      />
                    </div>

                    <div className="contact-field">
                      <label htmlFor="contact-subject" className="contact-label">
                        Tipo de requerimiento *
                      </label>
                      <select
                        id="contact-subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="contact-select"
                      >
                        {SUBJECT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="contact-field">
                    <label htmlFor="contact-message" className="contact-label">
                      Detalle de tu consulta *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      minLength={10}
                      maxLength={5000}
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Indícanos si viajas de manera particular o el volumen de colaboradores que deseas incluir en tu reporte..."
                      className="contact-textarea"
                    />
                  </div>

                  <button
                    type="submit"
                    className="contact-submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <span>Enviando mensaje...</span>
                    ) : (
                      <>
                        <span>Enviar mensaje directo</span>
                        <HiArrowRight aria-hidden="true" />
                      </>
                    )}
                  </button>

                  <p className="contact-fineprint">
                    Tus datos son tratados bajo estricta confidencialidad y normativas de protección de datos.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
