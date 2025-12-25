import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, User, ArrowRight, Briefcase, Users, TrendingUp, Leaf } from 'lucide-react';

const AccountTypeSelector: React.FC = () => {
  const navigate = useNavigate();

  const accountTypes = [
    {
      id: 'b2b',
      title: 'Cuenta Empresarial',
      subtitle: 'Para empresas y organizaciones',
      description: 'Gestiona las emisiones de carbono de tu empresa, accede a reportes detallados y compensa el impacto ambiental de tu organización.',
      icon: Building2,
      features: [
        'Dashboard empresarial completo',
        'Gestión de múltiples usuarios',
        'Reportes y analytics avanzados',
        'Facturación corporativa',
        'Compensación a escala'
      ],
      gradient: 'from-blue-500 to-indigo-600',
      accentColor: 'blue',
      route: '/auth/register/empresa'
    },
    {
      id: 'b2c',
      title: 'Cuenta Personal',
      subtitle: 'Para viajeros individuales',
      description: 'Calcula y compensa las emisiones de carbono de tus viajes personales. Inicia con tu cuenta de Google de forma rápida y sencilla.',
      icon: User,
      features: [
        'Registro rápido con Google',
        'Calculadora de emisiones',
        'Historial de compensaciones',
        'Proyectos ambientales verificados',
        'Impacto ambiental personal'
      ],
      gradient: 'from-green-500 to-emerald-600',
      accentColor: 'green',
      route: '/auth/register/personal'
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
            ¿Qué tipo de cuenta necesitas?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Elige el tipo de cuenta que mejor se adapte a tus necesidades
          </p>
        </motion.div>

        {/* Account Type Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {accountTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${type.gradient} p-8 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <type.icon className="w-12 h-12" strokeWidth={1.5} />
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                        {type.id === 'b2b' ? 'Empresas' : 'Personal'}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{type.title}</h3>
                    <p className="text-white/90 text-sm">{type.subtitle}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {type.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {type.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full bg-${type.accentColor}-100 flex items-center justify-center flex-shrink-0`}>
                          <div className={`w-2 h-2 rounded-full bg-${type.accentColor}-600`} />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => navigate(type.route)}
                    className={`w-full bg-gradient-to-r ${type.gradient} text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:scale-105 group-hover:gap-4`}
                  >
                    Crear cuenta {type.id === 'b2b' ? 'empresarial' : 'personal'}
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                {/* Decorative Icons */}
                <div className="absolute top-4 right-4 opacity-5">
                  {type.id === 'b2b' ? (
                    <Briefcase className="w-32 h-32" />
                  ) : (
                    <Users className="w-32 h-32" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Already have account */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <p className="text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <button
              onClick={() => navigate('/auth/login')}
              className="text-green-600 font-semibold hover:text-green-700 transition-colors underline"
            >
              Iniciar sesión
            </button>
          </p>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-gray-400 text-sm"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>+1,000 empresas confían en nosotros</span>
          </div>
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4" />
            <span>Certificado Gold Standard</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccountTypeSelector;
