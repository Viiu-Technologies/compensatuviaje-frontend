import React, { useState } from 'react';
import gsap from 'gsap';
import { HiArrowRight, HiCheck } from 'react-icons/hi';
import { useGsapReveal } from '../hooks/useGsapReveal';
import './ContactSection.css';

const SUBJECTS = [
  'Consulta general',
  'Compensación corporativa (B2B)',
  'Certificados NFT',
  'Soporte técnico',
  'Alianzas y partnerships',
  'Otro',
];

const CONTACT_EMAIL = 'compensatuviaje@gmail.com';

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', company: '', subject: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const scopeRef = useGsapReveal<HTMLElement>((root) => {
    gsap.set(root.querySelectorAll('.ctv-reveal'), { autoAlpha: 1 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });
    tl.from('.contact-eyebrow', { y: 12, autoAlpha: 0, duration: 0.6 }, 0);
    tl.from('.contact-title .hero-line__inner', {
      yPercent: 110, stagger: 0.1, duration: 0.9,
    }, 0.1);
    tl.from('.contact-lede', { y: 14, autoAlpha: 0, duration: 0.6 }, 0.4);
    tl.from('.contact-form', { y: 24, autoAlpha: 0, duration: 0.8 }, 0.5);
    tl.from('.contact-visual', { x: 24, autoAlpha: 0, duration: 0.85 }, 0.4);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = formData.subject || 'Consulta desde el sitio web';
    const bodyLines = [
      `Nombre: ${formData.name}`,
      `Email: ${formData.email}`,
      formData.company ? `Empresa: ${formData.company}` : null,
      '',
      formData.message,
    ].filter(Boolean);

    const href = `mailto:${CONTACT_EMAIL}`
      + `?subject=${encodeURIComponent(subject)}`
      + `&body=${encodeURIComponent(bodyLines.join('\n'))}`;

    window.location.href = href;
    setSubmitted(true);
  };

  return (
    <section ref={scopeRef} id="contacto" className="contact-section">
      <div className="contact-container">
        <div className="contact-grid">
          <div className="contact-content">
            <header className="contact-header">
              <span className="contact-eyebrow ctv-reveal">
                <span className="contact-eyebrow__line" />
                Contacto
              </span>

              <h2 className="contact-title">
                <span className="hero-line"><span className="hero-line__inner">¿Listo para</span></span>
                <span className="hero-line contact-title--accent">
                  <span className="hero-line__inner"><em>compensar</em>?</span>
                </span>
              </h2>

              <p className="contact-lede ctv-reveal">
                Cuéntanos cómo podemos ayudarte. Respondemos en menos de 24 horas.
              </p>

              <a href={`mailto:${CONTACT_EMAIL}`} className="contact-email ctv-reveal">
                {CONTACT_EMAIL}
                <HiArrowRight aria-hidden="true" />
              </a>
            </header>

            {submitted ? (
          <div className="contact-success">
            <span className="contact-success__icon" aria-hidden="true">
              <HiCheck />
            </span>
            <h3 className="contact-success__title">Mensaje recibido</h3>
            <p className="contact-success__sub">
              Nos pondremos en contacto contigo pronto. Revisa tu correo electrónico.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', company: '', subject: '', message: '' });
              }}
              className="contact-success__again"
            >
              Enviar otro mensaje
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="contact-row">
              <label className="contact-field">
                <span className="contact-field__label">Nombre completo</span>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className="contact-input"
                />
              </label>
              <label className="contact-field">
                <span className="contact-field__label">Correo electrónico</span>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="contact-input"
                />
              </label>
            </div>

            <div className="contact-row">
              <label className="contact-field">
                <span className="contact-field__label">
                  Empresa <span className="contact-field__opt">(opcional)</span>
                </span>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Tu empresa"
                  className="contact-input"
                />
              </label>
              <label className="contact-field">
                <span className="contact-field__label">Asunto</span>
                <select
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="contact-input contact-input--select"
                >
                  <option value="">Selecciona un asunto</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>

            <label className="contact-field">
              <span className="contact-field__label">Mensaje</span>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                rows={5}
                placeholder="Cuéntanos en qué podemos ayudarte..."
                className="contact-input contact-input--textarea"
              />
            </label>

            <div className="contact-footer">
              <button type="submit" className="contact-submit">
                Enviar mensaje
                <HiArrowRight aria-hidden="true" />
              </button>
              <p className="contact-fine">
                Al enviar aceptas nuestra política de privacidad.
              </p>
            </div>
          </form>
            )}
          </div>
          
          <div className="contact-visual ctv-reveal">
            <div className="contact-image-wrapper">
              <img
                src="/images/realistic_forest_canopy.png"
                alt="Lush green forest canopy bathed in sunlight"
                className="contact-image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
