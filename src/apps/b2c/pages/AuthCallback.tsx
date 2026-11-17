import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { takeAuthReturnTo } from '../services/authReturnTo';
import { useForceLightTheme } from '../../../shared/utils/useForceLightTheme';
import { useTailwindSpacing } from '../../../shared/utils/useTailwindSpacing';

const AuthCallback: React.FC = () => {
  useTailwindSpacing();
  useForceLightTheme();
  const navigate = useNavigate();
  const { setAuthenticatedUser } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');
  // StrictMode ejecuta el efecto dos veces en desarrollo: sin esto se
  // verificaba el token dos veces.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      setStatus('processing');

      // Supabase lee la sesión de la URL y el backend la verifica (y crea la
      // cuenta la primera vez). Devuelve la persona ya verificada.
      const user = await authService.handleOAuthCallback();
      if (!user) {
        throw new Error('No se pudo autenticar al usuario');
      }

      // Se usa esa misma persona. Antes se volvía a pedir a /b2c/auth/me con un
      // límite de 5 s y, si tardaba o fallaba, la sesión quedaba en null y la
      // ruta protegida devolvía al login justo después de entrar.
      setAuthenticatedUser(user);
      setStatus('success');

      // Datos completos en segundo plano; si falla, se conserva la persona verificada.
      void authService.getCurrentUser().then((fresh) => {
        if (fresh) setAuthenticatedUser(fresh);
      });

      // replace: con "atrás" no se vuelve a este callback, que ya no tiene la sesión en la URL.
      navigate(takeAuthReturnTo() ?? '/b2c/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Error en callback:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Error desconocido al autenticar');

      // Redirigir al login despues de 3 segundos
      setTimeout(() => {
        navigate('/login?perfil=persona', { replace: true });
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {status === 'processing' && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="w-16 h-16 text-green-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Autenticando...
              </h2>
              <p className="text-gray-600">
                Estamos verificando tu cuenta con Google
              </p>
              <div className="mt-6">
                <div className="flex justify-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                ¡Bienvenido!
              </h2>
              <p className="text-gray-600">
                Autenticación exitosa. Redirigiendo a tu dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Error de Autenticación
              </h2>
              <p className="text-gray-600 mb-4">
                {errorMessage}
              </p>
              <p className="text-sm text-gray-500">
                Redirigiendo al login...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
