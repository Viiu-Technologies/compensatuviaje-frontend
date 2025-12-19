import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { motion } from 'framer-motion';
import {
  FaShieldAlt,
  FaCloudUploadAlt,
  FaUsers,
  FaFileAlt,
  FaTree,
  FaGlobeAmericas,
  FaChartLine,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaUserShield,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaDownload,
  FaFilter
} from 'react-icons/fa';
import { HiSparkles, HiTrendingUp } from 'react-icons/hi';
import ScrollReveal from '../../../shared/components/ScrollReveal';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) closeSidebar();
  };

  // Admin stats
  const adminStats = [
    {
      icon: FaUsers,
      value: '47',
      label: 'Empresas Activas',
      trend: '+5',
      trendLabel: 'este mes',
      color: 'from-primary-400 to-primary-600',
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-600'
    },
    {
      icon: FaFileAlt,
      value: '1,245',
      label: 'Viajes Compensados',
      trend: '+127',
      trendLabel: 'esta semana',
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: FaTree,
      value: '32.5 ton',
      label: 'CO₂ Compensado',
      trend: '+2.3 ton',
      trendLabel: 'hoy',
      color: 'from-emerald-400 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      icon: FaClock,
      value: '5',
      label: 'Pendientes',
      trend: '↓ 2',
      trendLabel: 'vs. ayer',
      color: 'from-amber-400 to-amber-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    }
  ];

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: FaChartLine },
    { id: 'verification', label: 'Verificación', icon: FaShieldAlt, badge: '5' },
    { id: 'upload', label: 'Carga Masiva', icon: FaCloudUploadAlt },
    { id: 'companies', label: 'Empresas', icon: FaUsers },
    { id: 'reports', label: 'Reportes', icon: FaFileAlt },
    { id: 'settings', label: 'Configuración', icon: FaCog }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/30 to-primary-50/20">
      {/* Sidebar Drawer & Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity" onClick={handleOverlayClick}>
          <div className="fixed left-0 top-0 h-full w-64 bg-neutral-900 text-white p-6 overflow-y-auto shadow-2xl transition-transform duration-300" style={{transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'}}>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 mb-8" onClick={closeSidebar}>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center"
              >
                <FaShieldAlt className="text-white text-xl" />
              </motion.div>
              <div>
                <span className="text-xl font-bold block">Admin Panel</span>
                <span className="text-xs text-white/60">CompensaTuViaje</span>
              </div>
            </Link>
            {/* Admin Profile */}
            <div className="mb-8 p-4 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-500/30">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <div className="flex items-center gap-1">
                    <FaUserShield className="text-amber-400 text-xs" />
                    <p className="text-xs text-amber-400 font-medium">Administrador</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Menu Items */}
            <nav className="space-y-2 mb-8">
              {menuItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 5 }}
                  onClick={() => { setActiveTab(item.id); closeSidebar(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                    activeTab === item.id
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="text-xl" />
                  <span className="font-medium flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
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
            {/* Close Button */}
            <button className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl" onClick={closeSidebar} aria-label="Cerrar menú">×</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="min-h-screen transition-all duration-300" style={{ marginLeft: sidebarOpen ? 0 : 0 }}>
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-md border-b border-neutral-200/50 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Sidebar open button */}
                <button className="lg:hidden p-2 rounded-md bg-neutral-200 hover:bg-neutral-300 transition-colors text-2xl" onClick={openSidebar} aria-label="Abrir menú">
                  <span className="sr-only">Abrir menú</span>
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
                  <FaShieldAlt className="text-primary-500" />
                  Panel de Administración
                </h1>
              </div>
              <p className="text-neutral-600 mt-1 hidden md:block">
                Gestiona verificaciones y monitorea la plataforma
              </p>
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-3 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  <FaBell className="text-xl text-neutral-600" />
                  <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    5
                  </span>
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

          {/* Stats Grid */}
          <ScrollReveal>
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 font-medium mb-2">
                    <HiSparkles className="text-lg" />
                    <span>Estadísticas</span>
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900 mt-2">
                    Vista General del Sistema
                  </h2>
                </div>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FaFilter />
                    Filtrar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FaDownload />
                    Exportar
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {adminStats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="relative group"
                  >
                    <div className="card-glass p-6">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-2xl mb-4 shadow-lg`}>
                        <stat.icon />
                      </div>

                      {/* Value */}
                      <div className="mb-2">
                        <span className="text-3xl font-bold text-neutral-900">
                          {stat.value}
                        </span>
                      </div>

                      {/* Label */}
                      <p className="text-sm font-medium text-neutral-600 mb-3">
                        {stat.label}
                      </p>

                      {/* Trend */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          <HiTrendingUp />
                          {stat.trend}
                        </span>
                        <span className="text-xs text-neutral-500">{stat.trendLabel}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Admin Modules */}
          <ScrollReveal delay={0.2}>
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Módulos Administrativos</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* MOD-VERIFY */}
                <Link to="/admin/verification">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="card-glass p-8 group cursor-pointer border-2 border-transparent hover:border-primary-400 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-400/10 to-transparent rounded-bl-full"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl shadow-lg shadow-primary-500/30">
                          <FaShieldAlt />
                        </div>
                        {/* Badge */}
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-bold">
                            5 Pendientes
                          </span>
                          <span className="text-primary-600 group-hover:translate-x-1 transition-transform text-2xl">→</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="text-sm font-bold text-primary-600 mb-1 block">MOD-VERIFY</span>
                        <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                          Verificación de Empresas
                        </h3>
                        <p className="text-neutral-600 leading-relaxed">
                          Revisa y aprueba solicitudes de onboarding empresarial. Valida documentos legales y autoriza acceso a la plataforma.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-4 rounded-lg bg-primary-50">
                          <div className="text-2xl font-bold text-primary-700">5</div>
                          <div className="text-xs text-neutral-600 mt-1">Pendientes</div>
                        </div>
                        <div className="p-4 rounded-lg bg-green-50">
                          <div className="text-2xl font-bold text-green-700">23</div>
                          <div className="text-xs text-neutral-600 mt-1">Aprobadas</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>

                {/* MOD-UPLOAD */}
                <Link to="/admin/batch-upload">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="card-glass p-8 group cursor-pointer border-2 border-transparent hover:border-secondary-400 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary-400/10 to-transparent rounded-bl-full"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-white text-3xl shadow-lg shadow-secondary-500/30">
                          <FaCloudUploadAlt />
                        </div>
                        <span className="text-secondary-600 group-hover:translate-x-1 transition-transform text-2xl">→</span>
                      </div>

                      <div className="mb-4">
                        <span className="text-sm font-bold text-secondary-600 mb-1 block">MOD-UPLOAD</span>
                        <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                          Carga Masiva de Viajes
                        </h3>
                        <p className="text-neutral-600 leading-relaxed">
                          Importa grandes volúmenes de datos de viajes desde archivos CSV o Excel. Procesamiento automático con validación.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-4 rounded-lg bg-secondary-50">
                          <div className="text-2xl font-bold text-secondary-700">2</div>
                          <div className="text-xs text-neutral-600 mt-1">Hoy</div>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-50">
                          <div className="text-2xl font-bold text-blue-700">18</div>
                          <div className="text-xs text-neutral-600 mt-1">Este mes</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Quick Actions */}
          <ScrollReveal delay={0.3}>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Acciones Rápidas</h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link to="/dashboard">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="card-glass p-6 group cursor-pointer border border-neutral-200 hover:border-primary-400 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                        <FaChartLine className="text-xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                          Dashboard Principal
                        </h3>
                        <p className="text-sm text-neutral-500">Vista de usuario</p>
                      </div>
                      <span className="text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all">→</span>
                    </div>
                  </motion.div>
                </Link>

                <Link to="/admin/verification">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="card-glass p-6 group cursor-pointer border border-neutral-200 hover:border-amber-400 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-200 transition-colors">
                        <FaCheckCircle className="text-xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 group-hover:text-amber-600 transition-colors">
                          Empresas Pendientes
                        </h3>
                        <p className="text-sm text-neutral-500">5 solicitudes</p>
                      </div>
                      <span className="text-neutral-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all">→</span>
                    </div>
                  </motion.div>
                </Link>

                <Link to="/admin/batch-upload">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="card-glass p-6 group cursor-pointer border border-neutral-200 hover:border-secondary-400 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-secondary-100 flex items-center justify-center text-secondary-600 group-hover:bg-secondary-200 transition-colors">
                        <FaCloudUploadAlt className="text-xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 group-hover:text-secondary-600 transition-colors">
                          Nueva Carga
                        </h3>
                        <p className="text-sm text-neutral-500">Importar viajes</p>
                      </div>
                      <span className="text-neutral-400 group-hover:text-secondary-600 group-hover:translate-x-1 transition-all">→</span>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
