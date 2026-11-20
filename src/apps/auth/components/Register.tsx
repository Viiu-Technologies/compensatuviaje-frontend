import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { AlertCircle, ArrowLeft, Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth as useB2CAuth } from '../../b2c/context/AuthContext';
import { DEV_LOGIN_ENABLED } from '../../b2c/services/authService';
import { POPULAR_AIRPORTS } from '../../public/services/publicApi';
import { routeOf, tripOf } from './compensationRoute/model';
import LivingForestCanvas from './LivingForestCanvas';
import './RegisterAtmosphere.css';

interface LocationState {
  from?: {
    pathname: string;
    search?: string;
  };
}

/** Emblema oficial de Google en vector para el botón de 1 clic. */
const GoogleMark: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** ¿Llegó escaneando el flyer? Acepta ?src=qr, ?ref=flyer o utm_source/utm_medium con qr/flyer. */
function isFromFlyer(search: string): boolean {
  const params = new URLSearchParams(search);
  const values = ['src', 'ref', 'utm_source', 'utm_medium']
    .map((key) => (params.get(key) ?? '').toLowerCase());
  return values.some((v) => v.includes('qr') || v.includes('flyer'));
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const pageRef = useRef<HTMLDivElement>(null);

  const { login: loginWithGoogle, loginAsTestUser, loading: googleLoading } = useB2CAuth();

  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [isTestSigningIn, setIsTestSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Si la persona viene de la calculadora pública, se conserva su vuelo para
  // personalizar el titular y devolverla allí después de entrar con Google.
  const locationState = location.state as LocationState | null;
  const trip = useMemo(() => tripOf(locationState?.from?.search), [locationState]);
  const destinationCity = trip
    ? POPULAR_AIRPORTS.find((a) => a.code === trip.destination)?.city ?? trip.destination
    : null;
  const fromFlyer = useMemo(() => isFromFlyer(location.search), [location.search]);

  // Barra de estado del móvil en el tono del bosque: la foto llega de borde a borde.
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) return;
    const previous = meta.content;
    meta.content = '#010604';
    return () => {
      meta.content = previous;
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType !== 'mouse' || !pageRef.current) return;
    const rect = pageRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
    const ny = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
    pageRef.current.style.setProperty('--rg-px', `${(-nx * 12).toFixed(2)}px`);
    pageRef.current.style.setProperty('--rg-py', `${(-ny * 8).toFixed(2)}px`);
  };

  const handlePointerLeave = () => {
    pageRef.current?.style.setProperty('--rg-px', '0px');
    pageRef.current?.style.setProperty('--rg-py', '0px');
  };

  const handleGoogleRegister = async () => {
    try {
      setErrorMessage(null);
      setIsGoogleSigningIn(true);
      const from = locationState?.from;
      await loginWithGoogle(from?.pathname ? `${from.pathname}${from.search ?? ''}` : undefined);
    } catch (error) {
      console.error('Error al registrarse con Google:', error);
      setErrorMessage('No pudimos conectar con Google. Revisa tu conexión e inténtalo de nuevo.');
      toast.error('No se pudo continuar con Google', { description: 'Vuelve a intentarlo en unos segundos.' });
      setIsGoogleSigningIn(false);
    }
  };

  const handleDevTestSignIn = async () => {
    try {
      setErrorMessage(null);
      setIsTestSigningIn(true);
      await loginAsTestUser();
      navigate('/b2c/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.message || 'No se pudo iniciar la sesión de prueba';
      setErrorMessage(msg);
      toast.error('No se pudo entrar como persona de prueba', { description: msg });
    } finally {
      setIsTestSigningIn(false);
    }
  };

  const busy = googleLoading || isGoogleSigningIn || isTestSigningIn;
  const googleBusy = googleLoading || isGoogleSigningIn;

  // Coreografía de entrada: la foto sale de la oscuridad (CSS), luego el
  // titular sube línea a línea y al final aparecen los botones sobre el agua.
  const lineVariants: Variants = {
    hidden: { y: '105%' },
    show: (i: number) => ({
      y: '0%',
      transition: { duration: 0.9, delay: 0.55 + i * 0.12, ease: EASE_OUT },
    }),
  };

  const fadeUp = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: EASE_OUT },
        };

  const titleLines = trip
    ? [
        { text: 'Compensa tu vuelo', soft: false },
        { text: `a ${destinationCity}.`, soft: true },
      ]
    : [
        { text: 'Tu viaje deja huella.', soft: false },
        { text: 'Haz que crezca un bosque.', soft: true },
      ];

  const kicker = trip
    ? `Vuelo ${routeOf(trip)} · listo para compensar`
    : fromFlyer
      ? 'Bienvenido desde el flyer · 10 segundos'
      : 'DEFRA 2025 · Veritas AI · Polygon';

  return (
    <div
      ref={pageRef}
      className="rg-page"
      data-tone="dark"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Escenario: bosque oscuro arriba, árbol al centro, reflejo en el agua abajo */}
      <div className="rg-backdrop" aria-hidden="true">
        <img src="/images/auth/register-forest-tree.webp" alt="" className="rg-backdrop__ambient" decoding="async" />
        <div className="rg-backdrop__stage">
          <div className="rg-backdrop__parallax">
            <picture>
              <source srcSet="/images/auth/register-forest-tree.webp" type="image/webp" />
              <img
                src="/images/auth/register-forest-tree.jpg"
                alt=""
                className="rg-backdrop__photo"
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          </div>
        </div>
        <div className="rg-backdrop__aura" />
        <LivingForestCanvas className="rg-backdrop__canvas" />
        <div className="rg-backdrop__scrim" />
        <div className="rg-backdrop__grain" />
      </div>

      <main className="rg-shell">
        <motion.nav className="rg-nav" aria-label="Navegación de registro" {...fadeUp(0.3)}>
          <Link to="/" className="rg-brand-link" aria-label="CompensaTuViaje · Ir al inicio">
            <img
              src="/images/brand/logo-horizontal-white.svg"
              alt="CompensaTuViaje"
              className="rg-brand-logo"
              width={1117}
              height={240}
            />
          </Link>
          <Link to="/" className="rg-home">
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Inicio</span>
          </Link>
        </motion.nav>

        <header className="rg-hero">
          <motion.p className="rg-kicker" {...fadeUp(0.45)}>
            <span className="rg-kicker__dot" aria-hidden="true" />
            {kicker}
          </motion.p>

          <h1 className="rg-title">
            {titleLines.map((line, i) => (
              <span key={line.text} className="rg-title__mask">
                <motion.span
                  className={`rg-title__line ${line.soft ? 'rg-title__soft' : ''}`}
                  variants={lineVariants}
                  custom={i}
                  initial={reduceMotion ? false : 'hidden'}
                  animate="show"
                >
                  {line.text}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p className="rg-subtitle" {...fadeUp(0.95)}>
            {trip
              ? 'Crea tu cuenta y guardamos tu cálculo para emitir tu certificado.'
              : 'Mide tu vuelo con datos oficiales y compénsalo en proyectos verificados.'}
          </motion.p>
        </header>

        {/* Espacio libre: aquí respira el árbol */}
        <div className="rg-tree-window" aria-hidden="true" />

        <section className="rg-cta" aria-label="Opciones de registro">
          {errorMessage && (
            <div className="rg-error" role="alert">
              <AlertCircle aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <motion.button
            type="button"
            onClick={handleGoogleRegister}
            disabled={busy}
            className="rg-btn rg-btn--google"
            {...fadeUp(1.15)}
          >
            {googleBusy ? <Loader2 size={20} className="animate-spin" aria-hidden="true" /> : <GoogleMark />}
            <span>{googleBusy ? 'Conectando con Google…' : 'Continuar con Google'}</span>
          </motion.button>

          <motion.div {...fadeUp(1.27)}>
            <Link to="/register/empresa" state={location.state} className="rg-btn rg-btn--ghost">
              <Building2 className="rg-btn__icon" aria-hidden="true" />
              <span>Registrar mi empresa</span>
            </Link>
          </motion.div>

          {DEV_LOGIN_ENABLED && (
            <button type="button" onClick={handleDevTestSignIn} disabled={busy} className="rg-dev-btn">
              {isTestSigningIn && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
              [DEV] Entrar como viajero de prueba
            </button>
          )}

          <motion.p className="rg-signin" {...fadeUp(1.4)}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" state={location.state}>
              Inicia sesión
            </Link>
          </motion.p>

          <motion.p className="rg-legal" {...fadeUp(1.5)}>
            Al continuar aceptas los{' '}
            <Link to="/terminos" target="_blank" rel="noopener noreferrer">Términos</Link> y la{' '}
            <Link to="/privacidad" target="_blank" rel="noopener noreferrer">Política de Privacidad</Link>.
          </motion.p>
        </section>
      </main>
    </div>
  );
};

export default Register;
