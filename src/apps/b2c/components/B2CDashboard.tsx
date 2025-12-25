import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  FaPlane
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const B2CDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const handleOverlayClick = (e: any) => {
    if (e.target === e.currentTarget) closeSidebar();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartLine, path: '/b2c/dashboard' },
    { id: 'flights', label: 'Mis Viajes', icon: FaPlane, path: '/b2c/flights' },
    { id: 'projects', label: 'Proyectos', icon: FaGlobeAmericas, path: '/b2c/projects' },
    { id: 'certificates', label: 'Certificados', icon: FaCertificate, path: '/b2c/certificates' },
    { id: 'calculator', label: 'Calcular CO₂', icon: HiSparkles, path: '/calculator' },
  ];

  const impactStats = [
    { icon: FaTree, value: '142', label: 'árboles plantados', emoji: '🌱' },
    { icon: FaWind, value: '12.5', label: 'tCO2e evitadas', emoji: '💨' },
    { icon: FaCloudUploadAlt, value: '8.4', label: 'tCO2e removidas', emoji: '☁️' },
    { icon: FaLeaf, value: '450 m²', label: 'hábitat restaurado', emoji: '🌿' }
  ];

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="!min-h-screen !bg-gray-50 !flex !font-sans !text-gray-800 !w-full !box-border">
      
      {/* --- SIDEBAR DESKTOP --- */}
      <aside className="!hidden lg:!flex !flex-col !w-64 !h-screen !bg-white !border-r !border-gray-200 !shadow-sm !fixed !left-0 !top-0 !z-50 !overflow-y-auto">
        {/* Logo Area */}
        <div className="!flex !items-center !gap-3 !h-20 !px-6 !border-b !border-gray-100 !flex-shrink-0">
          <div className="!w-10 !h-10 !bg-green-100 !rounded-lg !flex !items-center !justify-center">
            <FaLeaf className="!text-green-600 !text-2xl" />
          </div>
          <span className="!text-lg !font-bold !text-gray-800">CompensaTuViaje</span>
        </div>
        
        {/* Nav Links */}
        <nav className="!flex-1 !px-4 !py-6 !space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-lg !transition-all !font-medium !no-underline ${
                activeTab === item.id 
                  ? '!bg-green-100 !text-green-700' 
                  : '!bg-transparent !text-gray-700 hover:!bg-green-50 hover:!text-green-700'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="!text-xl" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Widget Meta Mensual */}
        <div className="!mx-4 !mb-4 !p-4 !rounded-xl !bg-green-600 !text-white !shadow-md !flex-shrink-0">
          <div className="!text-xs !font-semibold !mb-1 !opacity-90">Meta Mensual</div>
          <div className="!text-2xl !font-bold !leading-tight">1,247 t</div>
          <div className="!text-xs !mb-2 !opacity-90">CO₂ compensado este mes</div>
          <div className="!w-full !h-2 !bg-green-800/30 !rounded-full !overflow-hidden !mb-1">
            <div className="!h-2 !bg-white !rounded-full" style={{ width: '68%' }}></div>
          </div>
          <div className="!text-xs !opacity-90">68% del objetivo</div>
        </div>

        {/* Footer Sidebar */}
        <div className="!mt-auto !px-4 !pb-6 !space-y-1 !flex-shrink-0">
          <button className="!w-full !flex !items-center !gap-3 !px-4 !py-2 !rounded-lg !text-gray-600 hover:!bg-gray-100 !bg-transparent !border-0">
            <FaCog className="!text-lg" /> Configuración
          </button>
          <button onClick={handleLogout} className="!w-full !flex !items-center !gap-3 !px-4 !py-2 !rounded-lg !text-red-500 hover:!bg-red-50 !bg-transparent !border-0">
            <FaSignOutAlt className="!text-lg" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- SIDEBAR MOBILE (DRAWER) --- */}
      {sidebarOpen && (
        <div className="!fixed !inset-0 !z-[60] !bg-black/40 !backdrop-blur-sm !transition-opacity lg:!hidden" onClick={handleOverlayClick}>
          <aside className="!fixed !left-0 !top-0 !h-full !w-64 !bg-white !border-r !border-gray-200 !shadow-2xl !flex !flex-col !z-[70]">
            <div className="!flex !items-center !gap-3 !h-20 !px-6 !border-b !border-gray-100">
              <div className="!w-10 !h-10 !bg-green-100 !rounded-lg !flex !items-center !justify-center">
                <FaLeaf className="!text-green-600 !text-2xl" />
              </div>
              <span className="!text-lg !font-bold !text-gray-800">Compensa</span>
            </div>
            <nav className="!flex-1 !px-4 !py-6 !space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => { setActiveTab(item.id); closeSidebar(); }}
                  className={`!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-lg !transition-all !font-medium !no-underline ${
                    activeTab === item.id ? '!bg-green-100 !text-green-700' : '!text-gray-700 hover:!bg-green-50'
                  }`}
                >
                  <item.icon className="!text-xl" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <button className="!absolute !top-4 !right-4 !text-gray-400 !text-2xl" onClick={closeSidebar}>×</button>
          </aside>
        </div>
      )}

      {/* --- MAIN CONTENT WRAPPER --- */}
      {/* lg:!ml-64 es CLAVE aquí para empujar el contenido y que no quede debajo del sidebar */}
      <main className="!flex-1 !min-h-screen lg:!ml-64 !transition-all !duration-300 !relative !bg-gray-50 !w-full">
        
        {/* Header Top Bar */}
        <div className="!bg-white/80 !backdrop-blur-md !border-b !border-gray-200 !sticky !top-0 !z-40 !w-full">
          <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-4">
            <div className="!flex !items-center !justify-between">
              <div className="!flex !items-center !gap-4">
                {/* Burger Button Mobile */}
                <button className="lg:!hidden !p-2 !rounded-md !bg-gray-100 !text-gray-600 !border-0" onClick={openSidebar}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <div>
                  <h1 className="!text-2xl !font-bold !text-gray-900 !m-0 !leading-tight">
                    Hola, {user?.nombre || user?.email?.split('@')[0] || 'Usuario'}
                  </h1>
                  <p className="!text-gray-500 !text-sm !hidden sm:!block !mt-1">Bienvenido a tu panel de impacto ambiental</p>
                </div>
              </div>
              
              <div className="!flex !items-center !gap-4">
                <motion.button whileHover={{ scale: 1.05 }} className="!relative !p-2.5 !rounded-full !bg-gray-100 hover:!bg-gray-200 !transition-colors !border-0">
                  <FaBell className="!text-xl !text-gray-600" />
                  <span className="!absolute !top-2 !right-2 !w-2 !h-2 !bg-red-500 !rounded-full !border !border-white"></span>
                </motion.button>
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt="Avatar" 
                    className="!w-10 !h-10 !rounded-full !shadow-lg !object-cover"
                  />
                ) : (
                  <div className="!w-10 !h-10 !rounded-full !bg-gradient-to-tr !from-green-500 !to-green-300 !flex !items-center !justify-center !text-white !font-bold !shadow-lg">
                    {user?.nombre?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inner Content Container */}
        <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-8 !space-y-8">

          {/* HERO BANNER - CALCULAR CO2 */}
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="!w-full"
          >
            <div className="!relative !overflow-hidden !rounded-3xl !bg-gradient-to-r !from-green-500 !via-green-600 !to-emerald-600 !p-8 md:!p-12 !shadow-2xl">
              {/* Efectos de fondo */}
              <div className="!absolute !top-0 !right-0 !w-64 !h-64 !bg-white/10 !rounded-full !blur-3xl !transform !translate-x-1/3 -!translate-y-1/3"></div>
              <div className="!absolute !bottom-0 !left-0 !w-48 !h-48 !bg-emerald-400/20 !rounded-full !blur-2xl !transform -!translate-x-1/4 !translate-y-1/4"></div>
              
              <div className="!relative !z-10 !flex !flex-col md:!flex-row !items-center !justify-between !gap-6">
                <div className="!flex-1 !text-white">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="!inline-flex !items-center !gap-2 !px-4 !py-2 !rounded-full !bg-white/20 !backdrop-blur-sm !mb-4"
                  >
                    <HiSparkles className="!text-yellow-300" />
                    <span className="!text-sm !font-semibold">¡Compensa tu huella ahora!</span>
                  </motion.div>
                  
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="!text-3xl md:!text-4xl !font-bold !mb-3 !leading-tight"
                  >
                    Calcula tu Huella de Carbono
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="!text-green-50 !text-base md:!text-lg !mb-6 !max-w-xl"
                  >
                    Descubre el impacto de tus viajes y compénsalo en minutos. Apoya proyectos ambientales verificados.
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="!flex !flex-wrap !gap-3"
                  >
                    <Link to="/calculator">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="!px-6 !py-3 !bg-white !text-green-600 !rounded-full !font-bold !shadow-lg hover:!shadow-xl !transition-all !flex !items-center !gap-2 !border-0"
                      >
                        <FaLeaf /> Calcular Ahora
                      </motion.button>
                    </Link>
                    <Link to="/projects">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="!px-6 !py-3 !bg-white/10 !backdrop-blur-sm !text-white !border-2 !border-white/30 !rounded-full !font-semibold hover:!bg-white/20 !transition-all"
                      >
                        Ver Proyectos
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="!flex-shrink-0"
                >
                  <div className="!relative !w-48 !h-48 md:!w-56 md:!h-56">
                    <div className="!absolute !inset-0 !bg-white/20 !rounded-full !animate-pulse"></div>
                    <div className="!absolute !inset-4 !bg-white/30 !rounded-full !flex !items-center !justify-center">
                      <FaGlobeAmericas className="!text-8xl !text-white/90" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* 1. SECCIÓN DE ESTADÍSTICAS (IMPACTO) */}
          <motion.section 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="!w-full"
          >
            <div className="!flex !items-center !justify-between !mb-6">
              <div>
                <div className="!inline-flex !items-center !gap-2 !px-3 !py-1 !rounded-full !bg-blue-50 !text-blue-700 !text-xs !font-semibold !mb-2 !border !border-blue-100">
                  <HiSparkles /> <span>Tu Impacto</span>
                </div>
                <h2 className="!text-xl !font-bold !text-gray-900">Resumen de Impacto</h2>
              </div>
              <button className="!flex !items-center !gap-2 !px-4 !py-2 !bg-white !border !border-gray-200 !rounded-lg !text-sm !font-medium hover:!bg-gray-50 !shadow-sm !transition">
                <FaDownload className="!text-gray-400" /> <span className="hidden sm:inline">Generar Reporte</span>
              </button>
            </div>

            <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 !gap-6">
              {impactStats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="!bg-white !rounded-2xl !p-6 !border !border-gray-100 !shadow-sm !relative !overflow-hidden group !flex !flex-col !justify-between !h-full !cursor-pointer"
                >
                  {/* Efecto de gradiente al hover */}
                  <div className="!absolute !inset-0 !bg-gradient-to-br !from-green-50/0 group-hover:!from-green-50/100 !to-transparent !opacity-0 group-hover:!opacity-100 !transition-opacity !duration-300"></div>
                  
                  <div className="!absolute !top-0 !right-0 !p-4 !opacity-10 group-hover:!opacity-20 !transition-all !duration-300 !transform group-hover:!scale-125 group-hover:!rotate-12 !pointer-events-none">
                    <span className="!text-6xl">{stat.emoji}</span>
                  </div>
                  
                  <div className="!relative !z-10">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="!w-12 !h-12 !rounded-full !bg-gradient-to-br !from-green-100 !to-green-50 group-hover:!from-green-200 group-hover:!to-green-100 !flex !items-center !justify-center !text-2xl !mb-4 !shadow-sm group-hover:!shadow-md !transition-all"
                    >
                      {stat.emoji}
                    </motion.div>
                    <div>
                      <motion.div
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        className="!text-3xl !font-bold !text-gray-900 !mb-1 group-hover:!text-green-600 !transition-colors"
                      >
                        {stat.value}
                      </motion.div>
                      <p className="!text-xs !font-bold !text-gray-400 !uppercase !tracking-wider group-hover:!text-gray-600 !transition-colors">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* 2. SECCIÓN PROYECTOS */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="!w-full"
          >
            <div className="!bg-white !rounded-2xl !border !border-gray-200 !shadow-sm !p-6">
              <div className="!flex !flex-col sm:!flex-row !justify-between !items-start sm:!items-end !mb-6 !gap-4">
                <div>
                  <h3 className="!text-lg !font-bold !text-gray-800 !mb-1">Proyectos de Compensación Activos</h3>
                  <p className="!text-sm !text-gray-500">Proyectos en los que estamos invirtiendo</p>
                </div>
                <button className="!text-green-600 !text-sm !font-semibold hover:!text-green-700 !bg-transparent !border-0">Ver mapa global →</button>
              </div>

              <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-6">
                {/* Card Proyecto 1 */}
                <motion.div
                  whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  className="!rounded-2xl !border !border-gray-200 !bg-gradient-to-br !from-green-50 !to-white !p-6 !flex !flex-col !shadow-sm !transition-all !cursor-pointer group"
                >
                  <div className="!flex !items-center !gap-2 !mb-3">
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className="!inline-block !px-2 !py-0.5 !rounded-full !bg-green-100 !text-green-700 !text-xs !font-semibold"
                    >
                      Reforestación
                    </motion.span>
                  </div>
                  <h4 className="!font-bold !text-gray-800 !text-lg !mb-1 group-hover:!text-green-700 !transition-colors">Reforestación Amazonía</h4>
                  <div className="!text-xs !text-gray-500 !mb-3 !flex !items-center !gap-1"><FaGlobeAmericas /> Brasil</div>
                  <div className="!text-sm !text-gray-700 !mb-1">Capacidad: <span className="!font-semibold">12,500 t/año</span></div>
                  <div className="!text-sm !text-gray-700 !mb-4">Inversión: <span className="!font-semibold">$45,200</span></div>
                  <div className="!mt-auto">
                    <div className="!flex !justify-between !text-xs !text-gray-500 !mb-1"><span>Progreso</span><span>78%</span></div>
                    <div className="!w-full !h-2 !bg-green-200 !rounded-full !overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '78%' }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="!h-2 !bg-green-500 !rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Card Proyecto 2 */}
                <motion.div
                  whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  className="!rounded-2xl !border !border-gray-200 !bg-gradient-to-br !from-blue-50 !to-white !p-6 !flex !flex-col !shadow-sm !transition-all !cursor-pointer group"
                >
                  <div className="!flex !items-center !gap-2 !mb-3">
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className="!inline-block !px-2 !py-0.5 !rounded-full !bg-blue-100 !text-blue-700 !text-xs !font-semibold"
                    >
                      Eólica
                    </motion.span>
                  </div>
                  <h4 className="!font-bold !text-gray-800 !text-lg !mb-1 group-hover:!text-blue-700 !transition-colors">Eólica Marina</h4>
                  <div className="!text-xs !text-gray-500 !mb-3 !flex !items-center !gap-1"><FaGlobeAmericas /> España</div>
                  <div className="!text-sm !text-gray-700 !mb-1">Capacidad: <span className="!font-semibold">8,200 t/año</span></div>
                  <div className="!text-sm !text-gray-700 !mb-4">Inversión: <span className="!font-semibold">$28,100</span></div>
                  <div className="!mt-auto">
                    <div className="!flex !justify-between !text-xs !text-gray-500 !mb-1"><span>Progreso</span><span>64%</span></div>
                    <div className="!w-full !h-2 !bg-blue-200 !rounded-full !overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '64%' }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                        className="!h-2 !bg-blue-500 !rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Card Proyecto 3 */}
                <motion.div
                  whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  className="!rounded-2xl !border !border-gray-200 !bg-gradient-to-br !from-cyan-50 !to-white !p-6 !flex !flex-col !shadow-sm !transition-all !cursor-pointer group"
                >
                  <div className="!flex !items-center !gap-2 !mb-3">
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className="!inline-block !px-2 !py-0.5 !rounded-full !bg-cyan-100 !text-cyan-700 !text-xs !font-semibold"
                    >
                      Océanos
                    </motion.span>
                  </div>
                  <h4 className="!font-bold !text-gray-800 !text-lg !mb-1 group-hover:!text-cyan-700 !transition-colors">Conservación Azul</h4>
                  <div className="!text-xs !text-gray-500 !mb-3 !flex !items-center !gap-1"><FaGlobeAmericas /> Portugal</div>
                  <div className="!text-sm !text-gray-700 !mb-1">Capacidad: <span className="!font-semibold">5,600 t/año</span></div>
                  <div className="!text-sm !text-gray-700 !mb-4">Inversión: <span className="!font-semibold">$11,092</span></div>
                  <div className="!mt-auto">
                    <div className="!flex !justify-between !text-xs !text-gray-500 !mb-1"><span>Progreso</span><span>45%</span></div>
                    <div className="!w-full !h-2 !bg-cyan-200 !rounded-full !overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '45%' }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        className="!h-2 !bg-cyan-500 !rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div className="!flex !justify-end !mt-6">
                <Link to="/b2c/projects">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="!px-6 !py-2 !rounded-full !bg-green-600 !text-white !font-semibold !shadow hover:!bg-green-700 !transition !border-0 !flex !items-center !gap-2"
                  >
                    Ver Todos los Proyectos <span>→</span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.section>

          {/* 3. SECCIÓN VUELOS */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="!w-full"
          >
            <div className="!bg-white !rounded-2xl !border !border-gray-200 !shadow-sm !p-6">
              <div className="!flex !items-center !justify-between !mb-6">
                <div>
                  <h3 className="!text-lg !font-bold !text-gray-800 !mb-1">Vuelos Recientes</h3>
                  <p className="!text-sm !text-gray-500">Últimos vuelos monitoreados</p>
                </div>
                <button className="!p-2 !bg-gray-50 !rounded-lg hover:!bg-gray-100 !border-0"><FaCalendarAlt className="!text-gray-500"/></button>
              </div>
              
              <div className="!overflow-x-auto">
                <table className="!min-w-full !text-sm !text-left">
                  <thead className="!bg-gray-50/50">
                    <tr className="!text-gray-500 !border-b !border-gray-200">
                      <th className="!py-3 !px-4 !font-semibold !rounded-tl-lg">Vuelo</th>
                      <th className="!py-3 !px-4 !font-semibold">Ruta</th>
                      <th className="!py-3 !px-4 !font-semibold">Fecha</th>
                      <th className="!py-3 !px-4 !font-semibold">Pasajeros</th>
                      <th className="!py-3 !px-4 !font-semibold">Emisiones (T CO₂)</th>
                      <th className="!py-3 !px-4 !font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="!divide-y !divide-gray-100">
                    <tr className="hover:!bg-gray-50 !transition-colors">
                      <td className="!py-3 !px-4 !font-mono !text-gray-600 !flex !items-center !gap-2"><FaPlane className="!text-xs !text-gray-400"/> FL-2847</td>
                      <td className="!py-3 !px-4">MAD <span className="!text-gray-400">→</span> JFK</td>
                      <td className="!py-3 !px-4 !text-gray-600">14 dic</td>
                      <td className="!py-3 !px-4 !text-gray-600">287</td>
                      <td className="!py-3 !px-4 !font-medium">145.8</td>
                      <td className="!py-3 !px-4"><span className="!inline-flex !items-center !px-2.5 !py-0.5 !rounded-full !bg-green-100 !text-green-700 !text-xs !font-semibold">Compensado</span></td>
                    </tr>
                    <tr className="hover:!bg-gray-50 !transition-colors">
                      <td className="!py-3 !px-4 !font-mono !text-gray-600 !flex !items-center !gap-2"><FaPlane className="!text-xs !text-gray-400"/> FL-3912</td>
                      <td className="!py-3 !px-4">BCN <span className="!text-gray-400">→</span> CDG</td>
                      <td className="!py-3 !px-4 !text-gray-600">14 dic</td>
                      <td className="!py-3 !px-4 !text-gray-600">156</td>
                      <td className="!py-3 !px-4 !font-medium">32.4</td>
                      <td className="!py-3 !px-4"><span className="!inline-flex !items-center !px-2.5 !py-0.5 !rounded-full !bg-green-100 !text-green-700 !text-xs !font-semibold">Compensado</span></td>
                    </tr>
                    <tr className="hover:!bg-gray-50 !transition-colors">
                      <td className="!py-3 !px-4 !font-mono !text-gray-600 !flex !items-center !gap-2"><FaPlane className="!text-xs !text-gray-400"/> FL-5621</td>
                      <td className="!py-3 !px-4">MAD <span className="!text-gray-400">→</span> LHR</td>
                      <td className="!py-3 !px-4 !text-gray-600">14 dic</td>
                      <td className="!py-3 !px-4 !text-gray-600">198</td>
                      <td className="!py-3 !px-4 !font-medium">48.6</td>
                      <td className="!py-3 !px-4"><span className="!inline-flex !items-center !px-2.5 !py-0.5 !rounded-full !bg-orange-100 !text-orange-700 !text-xs !font-semibold">Pendiente</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>

          {/* 4. ACCIONES RÁPIDAS */}
          <motion.section 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="!w-full"
          >
            <div className="!flex !items-center !justify-between !mb-6">
              <h2 className="!text-xl !font-bold !text-gray-900">Acciones Rápidas</h2>
              <button className="!text-green-600 hover:!text-green-700 !font-medium !text-sm !bg-transparent !border-0">Ver todas →</button>
            </div>

            <div className="!grid md:!grid-cols-2 !gap-6 !pb-8">
              <Link to="/b2c/flights" className="!block !no-underline">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="!bg-gradient-to-br !from-blue-50 !to-white !rounded-2xl !p-6 !shadow-sm !border !border-blue-200 hover:!border-blue-300 hover:!shadow-lg !transition-all !cursor-pointer group !h-full"
                >
                  <div className="!flex !items-start !justify-between !mb-4">
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      className="!w-12 !h-12 !rounded-xl !bg-gradient-to-br !from-blue-500 !to-blue-600 !flex !items-center !justify-center !text-white !text-2xl !shadow-lg !shadow-blue-200"
                    >
                      <FaPlane />
                    </motion.div>
                    <span className="!text-blue-400 group-hover:!text-blue-500 !transition-colors !text-xl">→</span>
                  </div>
                  <h3 className="!text-lg !font-bold !text-gray-900 !mb-1 group-hover:!text-blue-700 !transition-colors">Mis Viajes</h3>
                  <p className="!text-gray-500 !text-sm">Ver historial de compensaciones</p>
                </motion.div>
              </Link>

              <Link to="/calculator" className="!block !no-underline">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="!bg-gradient-to-br !from-green-500 !to-green-600 !rounded-2xl !p-6 !shadow-lg !border-2 !border-green-400 hover:!shadow-xl !transition-all !cursor-pointer group !h-full !relative !overflow-hidden"
                >
                  {/* Efecto brillante */}
                  <div className="!absolute !top-0 !right-0 !w-32 !h-32 !bg-white/10 !rounded-full !blur-2xl group-hover:!scale-150 !transition-transform"></div>
                  
                  <div className="!relative !z-10">
                    <div className="!flex !items-start !justify-between !mb-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="!w-12 !h-12 !rounded-xl !bg-white/20 !backdrop-blur-sm !flex !items-center !justify-center !text-white !text-2xl !shadow-lg"
                      >
                        <FaLeaf />
                      </motion.div>
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="!text-white !text-xl"
                      >
                        →
                      </motion.span>
                    </div>
                    <h3 className="!text-lg !font-bold !text-white !mb-1 !flex !items-center !gap-2">
                      <HiSparkles className="!text-yellow-300" /> Nueva Compensación
                    </h3>
                    <p className="!text-green-50 !text-sm">Calcula y compensa tu huella ahora</p>
                  </div>
                </motion.div>
              </Link>
            </div>
          </motion.section>

        </div>
      </main>
    </div>
  );
};

export default B2CDashboard;
