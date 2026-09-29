import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { confirmSubscription, unsubscribeFromNewsletter } from '../services/newsService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './BlogPage.css';

type Action = 'confirm' | 'unsubscribe';

/**
 * Confirmación y baja del boletín.
 *
 * La baja se ejecuta al cargar, sin pedir confirmación ni hacer preguntas: es
 * lo que exige el art. 28 B de la Ley 19.496 y lo que esperan Gmail y Outlook
 * al seguir el enlace de `List-Unsubscribe`.
 */
const NewsletterActionPage = ({ action }: { action: Action }) => {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<'working' | 'ok' | 'error'>('working');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (!token) {
        setState('error');
        setMessage('Enlace incompleto');
        return;
      }

      const res =
        action === 'confirm'
          ? await confirmSubscription(token)
          : await unsubscribeFromNewsletter(token);

      if (!alive) return;
      setState(res.ok ? 'ok' : 'error');
      setMessage(
        res.message ||
          (res.ok
            ? action === 'confirm'
              ? 'Suscripción confirmada'
              : 'Te has dado de baja'
            : 'El enlace no es válido o ya caducó')
      );
    };

    run();
    return () => {
      alive = false;
    };
  }, [token, action]);

  const titles: Record<Action, Record<string, string>> = {
    confirm: {
      working: 'Confirmando tu suscripción…',
      ok: '¡Listo! Suscripción confirmada',
      error: 'No pudimos confirmar la suscripción',
    },
    unsubscribe: {
      working: 'Procesando tu baja…',
      ok: 'Te has dado de baja',
      error: 'No pudimos procesar la baja',
    },
  };

  return (
    <div className="blog-page">
      <Header />
      <main>
        <section className="blog-hero">
          <div className="blog-hero__panel">
            <h1 className="blog-hero__title">{titles[action][state]}</h1>
            <p className="blog-hero__lead">{message}</p>

            {state === 'ok' && action === 'confirm' && (
              <p className="blog-hero__lead">
                Recibirás un envío semanal. Puedes darte de baja en un clic desde cualquier correo.
              </p>
            )}

            {state === 'ok' && action === 'unsubscribe' && (
              <p className="blog-hero__lead">
                No volveremos a escribirte. Si fue un error, puedes suscribirte de nuevo desde la
                sección de noticias.
              </p>
            )}

            {state === 'error' && (
              <p className="blog-hero__lead">
                Si el problema continúa, escríbenos a{' '}
                <a href="mailto:baja@compensatuviaje.com">baja@compensatuviaje.com</a>.
              </p>
            )}

            <div className="blog-hero__actions">
              <Link to="/blog" className="blog-btn">
                Ir a las noticias
              </Link>
              <Link to="/" className="blog-btn blog-btn--outline">
                Volver a la landing
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NewsletterActionPage;
