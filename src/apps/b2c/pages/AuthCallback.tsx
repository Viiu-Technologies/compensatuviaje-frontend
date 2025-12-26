import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      setStatus('processing');
      
      // Manejar el callback de OAuth
      const user = await authService.handleOAuthCallback();
      
      if (user) {
        setStatus('success');
        
        // Refrescar el usuario en el contexto
        await refreshUser();
        
        // Redirigir al dashboard despues de 1.5 segundos
        setTimeout(() => {
          navigate('/b2c/dashboard');
        }, 1500);
      } else {
        throw new Error('No se pudo autenticar al usuario');
      }
    } catch (error: any) {
      console.error('Error en callback:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Error desconocido al autenticar');
      
      // Redirigir al login despues de 3 segundos
      setTimeout(() => {
        navigate('/b2c/login');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
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
