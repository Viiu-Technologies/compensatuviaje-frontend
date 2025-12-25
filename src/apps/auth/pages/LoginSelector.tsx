import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, User, ArrowRight, Leaf, LogIn } from 'lucide-react';
import { BsGoogle } from 'react-icons/bs';
import { useAuth as useB2CAuth } from '../../b2c/context/AuthContext';

const LoginSelector: React.FC = () => {
  const navigate = useNavigate();
  const { login: loginWithGoogle, loading } = useB2CAuth();

  const handleB2BLogin = () => {
    navigate('/auth/login/empresa');
  };

  const handleB2CLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  };

  const loginOptions = [
    {
      id: 'b2b',
      title: 'Iniciar Sesión Empresarial',
      subtitle: 'Para empresas y organizaciones',
      description: 'Accede a tu cuenta corporativa con correo y contraseña.',
      icon: Building2,
      features: [
        'Acceso al dashboard empresarial',
        'Gestión de compensaciones',
        'Reportes detallados'
      ],
      gradient: 'from-blue-500 to-indigo-600',
      accentColor: 'blue',
      action: handleB2BLogin,
      buttonText: 'Iniciar Sesión',
      buttonIcon: LogIn
    },
    {
      id: 'b2c',
      title: 'Iniciar Sesión Personal',
      subtitle: 'Para viajeros individuales',
      description: 'Inicia sesión rápidamente con tu cuenta de Google.',
      icon: User,
      features: [
        'Acceso rápido con Google',
        'Historial de compensaciones',
        'Dashboard personal'
      ],
      gradient: 'from-green-500 to-emerald-600',
      accentColor: 'green',
      action: handleB2CLogin,
      buttonText: 'Continuar con Google',
      buttonIcon: BsGoogle
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf className="w-10 h-10 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">Compensatuviaje</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            ¿Cómo quieres iniciar sesión?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Elige el tipo de cuenta con la que deseas ingresar
          </p>
        </motion.div>

        {/* Login Options Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {loginOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${option.gradient} p-8 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                  
                  <div className="relative z-10">
                    <option.icon className="w-12 h-12 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">{option.title}</h3>
                    <p className="text-white/90 text-sm">{option.subtitle}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {option.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-700">
                        <div className={`w-5 h-5 rounded-full bg-${option.accentColor}-100 flex items-center justify-center flex-shrink-0`}>
                          <ArrowRight className={`w-3 h-3 text-${option.accentColor}-600`} />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={option.action}
                    disabled={option.id === 'b2c' && loading}
                    className={`w-full bg-gradient-to-r ${option.gradient} text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    {option.id === 'b2c' && loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Iniciando...</span>
                      </>
                    ) : (
                      <>
                        <option.buttonIcon className="w-5 h-5" />
                        <span>{option.buttonText}</span>
                        <ArrowRight className="w-5 h-5 ml-auto" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Register Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <p className="text-gray-600">
            ¿No tienes cuenta?{' '}
            <button
              onClick={() => navigate('/auth/register')}
              className="text-green-600 hover:text-green-700 font-semibold underline decoration-2 underline-offset-4 transition-colors"
            >
              Regístrate aquí
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginSelector;
