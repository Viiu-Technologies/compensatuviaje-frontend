import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FaTree,
  FaWind,
  FaCloudUploadAlt,
  FaLeaf,
  FaGlobeAmericas,
  FaCertificate,
  FaChartLine,
  FaCalendarAlt,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaDownload,
  FaShareAlt
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import ScrollReveal from '../../../shared/components/ScrollReveal';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logout();
  };

  // Stats data (estilo Ecologi)
  const impactStats = [
    {
      icon: FaTree,
      value: '0',
      label: 'árboles plantados',
      emoji: '🌱',
      color: 'bg-gradient-to-br from-green-400 to-green-600'
    },
    {
      icon: FaWind,
      value: '0',
      label: 'tCO2e evitadas',
      emoji: '💨',
      color: 'bg-gradient-to-br from-blue-400 to-blue-600'
    },
    {
      icon: FaCloudUploadAlt,
      value: '0',
      label: 'tCO2e removidas',
      emoji: '☁️',
      color: 'bg-gradient-to-br from-sky-400 to-sky-600'
    },
    {
      icon: FaLeaf,
      value: '0 m²',
      label: 'hábitat restaurado',
      emoji: '🌿',
      color: 'bg-gradient-to-br from-emerald-400 to-emerald-600'
    }
  ];

  const menuItems = [
    { id: 'overview', label: 'Tu perfil', icon: FaUserCircle },
    { id: 'dashboard', label: 'Panel Principal', icon: FaChartLine },
    { id: 'projects', label: 'Proyectos', icon: FaGlobeAmericas },
    { id: 'shop', label: 'Tienda de Impacto', icon: HiSparkles },
    { id: 'badges', label: 'Insignias', icon: FaCertificate },
    { id: 'settings', label: 'Cuenta', icon: FaCog }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
      {/* Sidebar Navigation (estilo Ecologi) */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-neutral-900 text-white p-6 overflow-y-auto z-40">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mb-8">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center"
          >
            <FaLeaf className="text-white text-xl" />
          </motion.div>
          <span className="text-xl font-bold">CompensaTuViaje</span>
        </Link>

        {/* User Profile */}
        <div className="mb-8 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-white/60 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="space-y-2 mb-8">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 5 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="text-xl" />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        {/* Logout Button */}
        <motion.button
          whileHover={{ x: 5 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-all"
        >
          <FaSignOutAlt className="text-xl" />
          <span className="font-medium">Cerrar Sesión</span>
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-md border-b border-neutral-200/50 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">
                  {user?.firstName} {user?.lastName?.charAt(0)}.
                </h1>
                <p className="text-neutral-600 mt-1">
                  Bienvenido a tu panel de impacto ambiental
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-3 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  <FaBell className="text-xl text-neutral-600" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  <FaCog className="text-xl text-neutral-600" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">

          {/* Impact Stats Grid (estilo Ecologi con iconos redondos) */}
          <ScrollReveal>
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 font-medium mb-2">
                    <HiSparkles className="text-lg" />
                    <span>Tu Impacto</span>
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900 mt-2">
                    Tu Impacto Ambiental
                  </h2>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary flex items-center gap-2"
                >
                  <FaDownload />
                  Generar Reporte
                </motion.button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {impactStats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="relative group"
                  >
                    <div className="card-glass p-8 text-center h-full">
                      {/* Circular Icon Background (estilo Ecologi) */}
                      <div className="relative mx-auto mb-6">
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: 'reverse'
                          }}
                          className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-sky-200 to-blue-300 flex items-center justify-center text-5xl"
                        >
                          {stat.emoji}
                        </motion.div>
                      </div>

                      {/* Value */}
                      <div className="mb-2">
                        <span className="text-4xl font-bold text-neutral-900">
                          {stat.value}
                        </span>
                      </div>

                      {/* Label */}
                      <p className="text-sm font-medium text-neutral-600">
                        {stat.label}
                      </p>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Action Buttons (estilo Ecologi) */}
          <ScrollReveal delay={0.2}>
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Acciones Rápidas</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
                >
                  Ver todas
                  <span>→</span>
                </motion.button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Link to="/onboarding/edit">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="card-glass p-8 group cursor-pointer border-2 border-transparent hover:border-primary-400 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-primary-500/30">
                        <FaUserCircle />
                      </div>
                      <span className="text-primary-600 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Editar Información
                    </h3>
                    <p className="text-neutral-600">
                      Actualizar datos de tu empresa y configuración
                    </p>
                  </motion.div>
                </Link>

                <Link to="/onboarding/wizard">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="card-glass p-8 group cursor-pointer border-2 border-transparent hover:border-secondary-400 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-secondary-500/30">
                        <FaCertificate />
                      </div>
                      <span className="text-secondary-600 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Cargar Documentos
                    </h3>
                    <p className="text-neutral-600">
                      Subir documentación legal de tu empresa
                    </p>
                  </motion.div>
                </Link>

                <Link to="/onboarding/status">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="card-glass p-8 group cursor-pointer border-2 border-transparent hover:border-accent-400 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-accent-500/30">
                        <FaChartLine />
                      </div>
                      <span className="text-accent-600 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Estado Onboarding
                    </h3>
                    <p className="text-neutral-600">
                      Ver progreso de registro empresarial
                    </p>
                  </motion.div>
                </Link>

                <Link to="/#calculadora">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="card-glass p-8 group cursor-pointer border-2 border-transparent hover:border-emerald-400 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-500/30">
                        <FaGlobeAmericas />
                      </div>
                      <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Compensar Viaje
                    </h3>
                    <p className="text-neutral-600">
                      Calcular y compensar la huella de carbono
                    </p>
                  </motion.div>
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Recent Activity */}
          <ScrollReveal delay={0.3}>
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Actividad Reciente</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="btn-primary flex items-center gap-2"
                >
                  <FaShareAlt />
                  Compartir Impacto
                </motion.button>
              </div>

              <div className="card-glass p-12 text-center">
                <motion.div
                  animate={{
                    y: [0, -10, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center text-5xl"
                >
                  🌍
                </motion.div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  Comienza tu viaje sostenible
                </h3>
                <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                  No hay actividad reciente. Comienza compensando tu primer viaje y contribuye a un planeta más verde.
                </p>
                <Link to="/#calculadora">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <FaLeaf />
                    Compensar mi primer viaje
                  </motion.button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
