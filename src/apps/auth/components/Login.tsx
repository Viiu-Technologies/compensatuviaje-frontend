import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuth as useB2CAuth } from '../../b2c/context/AuthContext';
import { getRedirectPath } from '../services/authService';
import { Eye, EyeOff, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { BsGoogle } from 'react-icons/bs';

interface LocationState {
  from?: {
    pathname: string;
  };
}

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, clearError, isLoading: authLoading } = useAuth();
  const { login: loginWithGoogle, loading: googleLoading } = useB2CAuth();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const response = await login(formData.email, formData.password);
      
      if (response.success && response.user_info) {
        const userType = response.user_info.user_type;
        const state = location.state as LocationState;
        const from = state?.from?.pathname;
        const redirectPath = from || getRedirectPath(userType);
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      console.error('Error en login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loading = isLoading || authLoading;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const formVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.6, delay: 0.2, ease: "easeOut" }
    }
  };

  const treeVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: (custom: number) => ({
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, delay: custom * 0.2, type: "spring", bounce: 0.4 }
    })
  };

  return (
    <div className="!min-h-screen !w-full !flex !overflow-hidden !bg-emerald-50">
      
      {/* LEFT PANEL - Illustration */}
      <motion.div 
        className="!hidden lg:!flex !w-[55%] !relative !bg-gradient-to-b !from-emerald-100 !via-emerald-200 !to-emerald-300 !flex-col !justify-center !items-center !p-12 !overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Background Elements (Sun/Clouds) */}
        <motion.div 
          className="!absolute !top-20 !left-20 !w-32 !h-32 !rounded-full !bg-yellow-100/50 !blur-2xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        {/* Content */}
        <div className="!relative !z-10 !max-w-lg !w-full !text-center">
          <motion.h2 
            className="!text-5xl !font-extrabold !text-emerald-900 !mb-4 !tracking-tight"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            BIENVENIDO A COMPENSA TU VIAJE
          </motion.h2>
          <motion.p 
            className="!text-xl !text-emerald-800/80 !mb-12"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Estamos encantados de verte :)
          </motion.p>

          {/* Social Buttons */}
          <motion.div 
            className="!flex !flex-col !gap-4 !items-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button 
              onClick={async () => {
                try {
                  setIsGoogleSigningIn(true);
                  await loginWithGoogle();
                } catch (error) {
                  console.error('Error al iniciar sesión con Google:', error);
                  setIsGoogleSigningIn(false);
                }
              }}
              disabled={googleLoading || isGoogleSigningIn}
              className="!w-full !max-w-xs !flex !items-center !justify-center !gap-3 !py-3 !px-6 !rounded-full !bg-white/90 !text-emerald-800 !font-semibold !shadow-lg hover:!bg-white hover:!scale-105 !transition-all disabled:!opacity-50 disabled:!cursor-not-allowed"
            >
              {isGoogleSigningIn ? (
                <Loader2 className="!w-6 !h-6 animate-spin" />
              ) : (
                <BsGoogle className="!w-6 !h-6" />
              )}
              {isGoogleSigningIn ? 'Conectando...' : 'Iniciar sesión con Google'}
            </button>
            

          </motion.div>
        </div>

        {/* Landscape / Trees Illustration */}
        <div className="!absolute !bottom-0 !left-0 !right-0 !h-1/3 !z-0 !pointer-events-none">
          {/* Hills */}
          <div className="!absolute !bottom-0 !left-0 !w-full !h-full !bg-emerald-400/20 !rounded-tr-[100%] !transform !translate-y-10"></div>
          <div className="!absolute !bottom-0 !right-0 !w-3/4 !h-3/4 !bg-emerald-500/20 !rounded-tl-[100%] !transform !translate-y-5"></div>
          
          {/* Trees */}
          <motion.div custom={1} variants={treeVariants} className="!absolute !bottom-0 !left-[10%] !text-emerald-800/20">
            <svg width="100" height="180" viewBox="0 0 100 180" fill="currentColor">
              <path d="M50 0 L90 120 L60 120 L60 180 L40 180 L40 120 L10 120 Z" />
            </svg>
          </motion.div>
          <motion.div custom={2} variants={treeVariants} className="!absolute !bottom-0 !left-[25%] !text-emerald-700/30 !transform !scale-75">
            <svg width="100" height="180" viewBox="0 0 100 180" fill="currentColor">
              <path d="M50 0 L90 120 L60 120 L60 180 L40 180 L40 120 L10 120 Z" />
            </svg>
          </motion.div>
          <motion.div custom={3} variants={treeVariants} className="!absolute !bottom-0 !right-[30%] !text-emerald-800/20 !transform !scale-125">
            <svg width="100" height="180" viewBox="0 0 100 180" fill="currentColor">
              <path d="M50 0 L90 120 L60 120 L60 180 L40 180 L40 120 L10 120 Z" />
            </svg>
          </motion.div>
        </div>

      </motion.div>

      {/* RIGHT PANEL - Form */}
      <div className="!w-full lg:!w-[45%] !relative !bg-emerald-900 !flex !items-center !justify-center !p-8 lg:!p-16">
        
        {/* Wave Separator (Desktop only) */}
        <div className="!hidden lg:!block !absolute !top-0 !-left-1 !h-full !w-24 !z-20 !text-emerald-900">
           {/* Better approach: Absolute SVG on the left edge of the right panel */}
           <div className="!absolute !inset-y-0 !-left-[100px] !w-[101px] !h-full !overflow-hidden">
             <svg className="!h-full !w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="#064e3b">
               <path d="M100 0 C 20 20 20 80 100 100 V 0 Z" />
             </svg>
           </div>
        </div>

        <motion.div 
          className="!w-full !max-w-md !relative !z-30"
          initial="hidden"
          animate="visible"
          variants={formVariants}
        >
          <div className="!mb-10 !text-center lg:!text-left">
            <Link to="/" className="!inline-flex !items-center !gap-2 !text-sm !text-emerald-200 hover:!text-white !transition-colors !mb-6">
              <ArrowLeft className="!w-4 !h-4" /> <span>Volver al inicio</span>
            </Link>
            <h1 className="!text-4xl !font-bold !text-white !mb-3">Iniciar Sesión</h1>
            <div className="!h-1 !w-20 !bg-emerald-500 !rounded-full !mb-4 lg:!mx-0 !mx-auto"></div>
            <p className="!text-emerald-200/80">Accede a tu cuenta de Compensa tu Viaje</p>
          </div>

          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="!mb-6 !p-4 !bg-red-500/10 !border !border-red-500/20 !rounded-xl !flex !items-start !gap-3 !text-red-200"
            >
              <AlertCircle className="!w-5 !h-5 !flex-shrink-0 !mt-0.5" />
              <span className="!text-sm">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="!space-y-6">
            <div className="!space-y-2">
              <label htmlFor="email" className="!text-sm !font-medium !text-emerald-100 !ml-1">Correo Electrónico</label>
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
                  className="!w-full !px-6 !py-4 !rounded-full !bg-emerald-800/50 !border !border-emerald-700 !text-white !placeholder-emerald-500/50 focus:!ring-2 focus:!ring-emerald-400 focus:!border-transparent !transition-all !outline-none group-hover:!bg-emerald-800/70"
                />
              </div>
            </div>

            <div className="!space-y-2">
              <label htmlFor="password" className="!text-sm !font-medium !text-emerald-100 !ml-1">Contraseña</label>
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
                  className="!w-full !px-6 !py-4 !pr-14 !rounded-full !bg-emerald-800/50 !border !border-emerald-700 !text-white !placeholder-emerald-500/50 focus:!ring-2 focus:!ring-emerald-400 focus:!border-transparent !transition-all !outline-none group-hover:!bg-emerald-800/70"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="!absolute !right-4 !top-1/2 !-translate-y-1/2 !text-emerald-400 hover:!text-white !transition-colors !p-2"
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
                    className="!peer !appearance-none !w-5 !h-5 !border-2 !border-emerald-600 !rounded !bg-transparent checked:!bg-emerald-500 checked:!border-emerald-500 !transition-all"
                  />
                  <svg className="!absolute !w-3.5 !h-3.5 !text-white !pointer-events-none !opacity-0 peer-checked:!opacity-100 !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 !transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="!text-emerald-200 group-hover:!text-white !transition-colors">Recordarme</span>
              </label>

              <Link to="/forgot-password" className="!text-emerald-400 hover:!text-emerald-300 !font-medium !transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="!w-full !py-4 !px-6 !bg-gradient-to-r !from-emerald-400 !to-teal-400 !text-emerald-900 !font-bold !text-lg !rounded-full !shadow-lg !shadow-emerald-900/50 hover:!shadow-emerald-500/30 !transition-all disabled:!opacity-70 disabled:!cursor-not-allowed !flex !items-center !justify-center !gap-2"
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
            <p className="!text-emerald-200/60 !text-sm !mb-4">O continúa con</p>

            <div className="!mt-6">
              <span className="!text-emerald-200/80">¿No tienes cuenta? </span>
              <Link to="/register" className="!text-white !font-bold hover:!text-emerald-300 !underline !decoration-2 !underline-offset-4 !transition-colors">
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
