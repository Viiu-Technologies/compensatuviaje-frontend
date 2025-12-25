import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { BsGoogle } from 'react-icons/bs';
import { useAuth } from '../../b2c/context/AuthContext';

const B2CRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: loginWithGoogle, loading: authLoading } = useAuth();
  const [error, setError] = useState('');

  const handleGoogleRegister = async () => {
    try {
      setError('');
      await loginWithGoogle();
    } catch (err: any) {
      setError('Error al registrarse con Google');
      console.error('Error en registro con Google:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/auth/register')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a selección de cuenta
        </button>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Crear Cuenta Personal
            </h2>
            <p className="text-gray-600">
              Regístrate con tu cuenta de Google de forma rápida y segura
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Google Register Button */}
          <button
            onClick={handleGoogleRegister}
            disabled={authLoading}
            className="w-full bg-white border-2 border-gray-300 hover:border-green-500 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                <span>Conectando con Google...</span>
              </>
            ) : (
              <>
                <BsGoogle className="w-6 h-6 text-red-500" />
                <span>Continuar con Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Beneficios de registrarte</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Calcula tu huella de carbono</p>
                <p className="text-sm text-gray-600">Mide el impacto ambiental de tus viajes</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Compensa tus emisiones</p>
                <p className="text-sm text-gray-600">Participa en proyectos certificados de compensación</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Gana badges y certificados</p>
                <p className="text-sm text-gray-600">Recibe reconocimientos por tu compromiso ambiental</p>
              </div>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-600 text-sm mt-6">
            ¿Ya tienes una cuenta?{' '}
            <button 
              onClick={() => navigate('/auth/login')}
              className="text-green-600 font-semibold hover:text-green-700"
            >
              Iniciar sesión
            </button>
          </p>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Al crear una cuenta, aceptas nuestros{' '}
            <a href="#" className="text-green-600 hover:underline">Términos de Servicio</a>
            {' '}y{' '}
            <a href="#" className="text-green-600 hover:underline">Política de Privacidad</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default B2CRegisterPage;
