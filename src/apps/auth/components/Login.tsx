import React, { useState, useMemo, lazy, Suspense, FormEvent, ChangeEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuth as useB2CAuth } from '../../b2c/context/AuthContext';
import { DEV_LOGIN_ENABLED } from '../../b2c/services/authService';
import { getRedirectPath } from '../services/authService';
import { Eye, EyeOff, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { BsGoogle } from 'react-icons/bs';
import { toast } from 'sonner';
import { tripOf, routeOf } from './compensationRoute/model';
import { POPULAR_AIRPORTS } from '../../public/services/publicApi';

// La Fig. 2 solo se ve en escritorio (el panel se oculta en móvil): se carga aparte.
const CompensationRoute = lazy(() => import('./compensationRoute/CompensationRoute'));

interface LocationState {
  from?: {
    pathname: string;
    search?: string;
  };
}

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Cuentas que crea `pnpm prisma:seed` con SEED_DEV_DATA=true (backend).
// Solo se muestran en desarrollo; ver backend/docs/entorno-local.md.
const DEV_ACCOUNTS = [
  { label: 'Empresa (B2B)', email: 'empresa@example.com' },
  { label: 'Partner', email: 'partner@example.com' },
];
const DEV_SEED_PASSWORD = import.meta.env.VITE_DEV_SEED_PASSWORD || 'Prueba1234!';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, clearError, isLoading: authLoading } = useAuth();
  const { login: loginWithGoogle, loginAsTestUser, loading: googleLoading } = useB2CAuth();
  const [isTestSigningIn, setIsTestSigningIn] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Vuelo que trae la URL de destino (la calculadora pública manda aquí con
  // /b2c/calculator?origin=…&destination=…). Personaliza el titular y la Fig. 2.
  const trip = useMemo(() => tripOf((location.state as LocationState | null)?.from?.search), [location.state]);
  const destinationCity = trip ? POPULAR_AIRPORTS.find((a) => a.code === trip.destination)?.city ?? trip.destination : null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    clearError();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(formData.email, formData.password, formData.rememberMe);
      
      if (response.success && response.user_info) {
        const userType = response.user_info.user_type;
        const state = location.state as LocationState;
        // Se conserva el search: el destino guardado puede llevar datos en la
        // query (p. ej. /b2c/calculator?origin=SCL&destination=LIM al venir de
        // la calculadora publica). Quedarse solo con el pathname obligaba al
        // usuario a volver a introducir su vuelo despues de identificarse.
        const from = state?.from?.pathname
          ? `${state.from.pathname}${state.from.search ?? ''}`
          : undefined;
        const redirectPath = from || getRedirectPath(userType);
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      // Los errores del servidor (credenciales, cuenta bloqueada…) ya se
      // muestran en el formulario. Antes además salía un aviso de "Revisa tu
      // conexión", que contradecía el mensaje real.
      if (!(err as { status?: number })?.status) {
        toast.error('No se pudo completar el inicio de sesión', {
          description: 'Revisa tu conexión e inténtalo de nuevo.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loading = isLoading || authLoading;

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const formVariants: Variants = {
    hidden: { x: 50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.6, delay: 0.2, ease: "easeOut" }
    }
  };

  // Colores: la escala brand-* es la paleta de marca (brand-900 = #073D3D, el
  // teal del logotipo). Antes el login usaba los esmeralda de Tailwind, una
  // ola con una costura visible y árboles triangulares de plantilla.
  const field =
    '!w-full !px-4 !py-3.5 !rounded-xl !bg-[#F9FBFA] !border-[1.5px] !border-brand-900/15 !text-brand-900 !placeholder-brand-900/40 focus:!bg-white focus:!border-brand-500 focus:!shadow-[0_0_0_3px_rgba(4,99,2,0.7)] !transition-all !outline-none';

  return (
    <div className="!min-h-screen !w-full !flex !overflow-hidden !bg-white">

      {/* Panel izquierdo: la Fig. 2, lo que pasa después de entrar */}
      <motion.div
        className="!hidden lg:!flex !w-[55%] !relative !bg-[#EDF4F1] !flex-col !justify-center !px-12 xl:!px-16 !py-24 !overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Link to="/" className="!absolute !top-8 !left-12 xl:!left-16 !z-20" aria-label="Ir al inicio"><img src="/images/brand/logo-horizontal-clean.svg" alt="CompensaTuViaje" className="!h-8 !w-auto" width={1117} height={240} /></Link>

        <div className="!relative !z-10 !w-full !max-w-[720px]">
          <div className="!flex !items-center !gap-3 !mb-4 !text-xs !font-semibold !uppercase !tracking-[0.16em] !text-brand-900/70">
            <span className="!w-7 !h-0.5 !bg-brand-500" aria-hidden="true" />
            <span>{trip ? `Tu vuelo ${routeOf(trip)}` : 'Cómo funciona'}</span>
          </div>
          <h2 className="!font-display !text-4xl xl:!text-5xl !font-semibold !text-brand-900 !mb-3 !tracking-tight !leading-[1.08]">
            {trip ? `Compensa tu vuelo a ${destinationCity}` : 'Te damos la bienvenida'}
          </h2>
          <p className="!text-lg !text-brand-900/70 !mb-8 !max-w-[56ch]">
            {trip
              ? 'Al entrar calculamos tu vuelo con los datos que ingresaste. Después sigue esta ruta:'
              : 'Calcula, compensa y sigue el impacto de tus viajes. Esta es la ruta de cada compensación:'}
          </p>
          <Suspense fallback={<div className="!aspect-[650/470] !w-full" aria-hidden="true" />}>
            <CompensationRoute trip={trip} />
          </Suspense>
        </div>
      </motion.div>

      {/* Panel derecho: formulario */}
      <div className="!w-full lg:!w-[45%] !relative !bg-white !flex !items-center !justify-center !p-8 lg:!p-16 lg:!border-l lg:!border-brand-900/10">
        <motion.div
          className="!w-full !max-w-md !relative !z-30"
          initial="hidden"
          animate="visible"
          variants={formVariants}
        >
          <div className="!mb-10 !text-center lg:!text-left">
            <Link to="/" className="!inline-flex !items-center !gap-2 !text-sm !text-brand-900/70 hover:!text-brand-700 !transition-colors !mb-6">
              <ArrowLeft className="!w-4 !h-4" /> <span>Volver al inicio</span>
            </Link>
            <h1 className="!font-display !text-4xl !font-semibold !text-brand-900 !mb-3">Iniciar sesión</h1>
            <p className="!text-brand-900/70">
              {trip ? `Accede para compensar tu vuelo ${routeOf(trip)}.` : 'Accede a tu cuenta de CompensaTuViaje.'}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="!mb-6 !p-4 !bg-[#FEE2E2] !border !border-[#FCA5A5] !rounded-xl !flex !items-start !gap-3 !text-[#991B1B]"
            >
              <AlertCircle className="!w-5 !h-5 !flex-shrink-0 !mt-0.5" />
              <span className="!text-sm">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="!space-y-6">
            <div className="!space-y-2">
              <label htmlFor="email" className="!text-xs !font-bold !uppercase !tracking-[0.06em] !text-brand-900/60 !ml-1">Correo Electrónico</label>
              <div className="!relative !group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  placeholder="tu@email.com"
                  disabled={loading}
                  className={field}
                />
              </div>
            </div>

            <div className="!space-y-2">
              <label htmlFor="password" className="!text-xs !font-bold !uppercase !tracking-[0.06em] !text-brand-900/60 !ml-1">Contraseña</label>
              <div className="!relative !group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={loading}
                  className={`${field} !pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="!absolute !right-4 !top-1/2 !-translate-y-1/2 !text-brand-900/50 hover:!text-brand-900 !transition-colors !p-2"
                >
                  {showPassword ? <EyeOff className="!w-5 !h-5" /> : <Eye className="!w-5 !h-5" />}
                </button>
              </div>
            </div>

            <div className="!flex !items-center !justify-between !text-sm !px-1">
              <label className="!flex !items-center !gap-2 !cursor-pointer !group">
                <div className="!relative !flex !items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disabled={loading}
                    className="!peer !appearance-none !w-5 !h-5 !border-2 !border-brand-900/30 !rounded !bg-white checked:!bg-brand-900 checked:!border-brand-900 !transition-all"
                  />
                  <svg className="!absolute !w-3.5 !h-3.5 !text-white !pointer-events-none !opacity-0 peer-checked:!opacity-100 !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 !transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="!text-brand-900/70 group-hover:!text-brand-900 !transition-colors">Recordarme</span>
              </label>

              <Link to="/forgot-password" className="!text-brand-700 hover:!text-brand-800 !font-semibold !transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="!w-full !py-4 !px-6 !bg-brand-900 !text-white hover:!bg-[#044443] !font-bold !text-base !rounded-xl !shadow-[0_4px_14px_rgba(7,61,61,0.22)] hover:!shadow-[0_8px_24px_rgba(7,61,61,0.3)] !transition-all disabled:!opacity-70 disabled:!cursor-not-allowed !flex !items-center !justify-center !gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="!w-6 !h-6 !animate-spin" />
                  <span>Iniciando...</span>
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </motion.button>
          </form>

          <div className="!mt-10 !text-center">
            <div className="!flex !items-center !gap-4 !mb-5">
              <div className="!flex-1 !h-px !bg-brand-900/10" />
              <p className="!text-brand-900/50 !text-sm !whitespace-nowrap">O continúa con</p>
              <div className="!flex-1 !h-px !bg-brand-900/10" />
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  setIsGoogleSigningIn(true);
                  await loginWithGoogle();
                } catch (err) {
                  console.error('Error al iniciar sesión con Google:', err);
                  // Sin esto el fallo era invisible: el boton volvia a su
                  // estado normal y el usuario no sabia que habia pasado.
                  toast.error('No se pudo iniciar sesión con Google', {
                    description: 'Vuelve a intentarlo o entra con tu correo y contraseña.',
                  });
                  setIsGoogleSigningIn(false);
                }
              }}
              disabled={googleLoading || isGoogleSigningIn || loading}
              className="!w-full !flex !items-center !justify-center !gap-3 !py-3.5 !px-6 !rounded-xl !bg-white !border-[1.5px] !border-brand-900/15 !text-brand-900 !font-semibold hover:!bg-[#EDF4F1] !transition-all disabled:!opacity-60 disabled:!cursor-not-allowed"
            >
              {isGoogleSigningIn ? (
                <Loader2 className="!w-5 !h-5 !animate-spin" />
              ) : (
                <BsGoogle className="!w-5 !h-5" />
              )}
              <span>{isGoogleSigningIn ? 'Conectando...' : 'Iniciar sesión con Google'}</span>
            </button>

            {DEV_LOGIN_ENABLED && (
              <div className="!mt-5 !p-4 !rounded-2xl !border !border-dashed !border-amber-400 !bg-amber-50 !text-left">
                <p className="!text-amber-800 !text-xs !font-bold !uppercase !tracking-wide !mb-3">
                  Entorno local de pruebas
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setIsTestSigningIn(true);
                      await loginAsTestUser();
                      navigate('/b2c/dashboard', { replace: true });
                    } catch (err: any) {
                      toast.error('No se pudo entrar como persona de prueba', {
                        description: err?.message,
                      });
                    } finally {
                      setIsTestSigningIn(false);
                    }
                  }}
                  disabled={isTestSigningIn || loading}
                  className="!w-full !flex !items-center !justify-center !gap-2 !py-2.5 !px-4 !rounded-xl !bg-amber-300 !text-brand-950 !text-sm !font-semibold hover:!bg-amber-200 !transition-colors disabled:!opacity-60"
                >
                  {isTestSigningIn && <Loader2 className="!w-4 !h-4 !animate-spin" />}
                  Entrar como persona de prueba (B2C, sin Google)
                </button>
                <div className="!flex !gap-2 !mt-2">
                  {DEV_ACCOUNTS.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, email: account.email, password: DEV_SEED_PASSWORD }))
                      }
                      className="!flex-1 !py-2 !px-3 !rounded-xl !border !border-amber-400 !text-amber-900 !text-xs !font-semibold hover:!bg-amber-100 !transition-colors"
                    >
                      Usar cuenta: {account.label}
                    </button>
                  ))}
                </div>
                <p className="!text-amber-900/70 !text-xs !mt-2">
                  Las cuentas de empresa y partner se crean con <code>pnpm prisma:seed</code>. Solo visible en desarrollo.
                </p>
              </div>
            )}

            <div className="!mt-6">
              <span className="!text-brand-900/70">¿No tienes cuenta? </span>
              <Link to="/register" state={location.state} className="!text-brand-900 !font-bold hover:!text-brand-700 !underline !decoration-2 !underline-offset-4 !transition-colors">
                Regístrate aquí
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
