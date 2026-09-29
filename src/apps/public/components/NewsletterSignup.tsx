import { useState } from 'react';
import { subscribeToNewsletter } from '../services/newsService';

/**
 * Alta en el boletín.
 *
 * Doble opt-in: esto solo dispara el correo de confirmación. Hasta que la
 * persona pulse el enlace, no recibe nada más. Es lo que dice el texto, y es
 * lo que hace el backend.
 */
const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('sending');
    const res = await subscribeToNewsletter(email.trim());
    setMessage(res.message);
    setStatus(res.ok ? 'done' : 'error');
    if (res.ok) setEmail('');
  };

  return (
    <section className="blog-newsletter">
      <div className="blog-newsletter__panel">
        <h2 className="blog-newsletter__title">Recibe lo importante del sector</h2>
        <p className="blog-newsletter__lead">
          Un envío semanal con la regulación, las emisiones y la sostenibilidad que afectan al
          transporte y la logística en Chile. Puedes darte de baja en un clic cuando quieras.
        </p>

        {status === 'done' ? (
          <p className="blog-newsletter__success">{message}</p>
        ) : (
          <form onSubmit={submit} className="blog-newsletter__form">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@empresa.cl"
              aria-label="Correo electrónico"
              className="blog-newsletter__input"
              disabled={status === 'sending'}
            />
            <button type="submit" className="blog-btn" disabled={status === 'sending'}>
              {status === 'sending' ? 'Enviando…' : 'Suscribirme'}
            </button>
          </form>
        )}

        {status === 'error' && <p className="blog-newsletter__error">{message}</p>}

        <p className="blog-newsletter__legal">
          Te enviaremos un correo para confirmar la suscripción. Sin esa confirmación no
          recibirás nada más.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSignup;
