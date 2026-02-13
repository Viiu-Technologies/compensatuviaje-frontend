import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLeaf,
  FaChartLine,
  FaPlane,
  FaGlobeAmericas,
  FaCertificate,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaTimes,
  FaBars,
  FaUser,
  FaCalculator
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

interface B2CLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const B2CLayout: React.FC<B2CLayoutProps> = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartLine, path: '/b2c/dashboard' },
    { id: 'flights', label: 'Mis Viajes', icon: FaPlane, path: '/b2c/flights' },
    { id: 'projects', label: 'Proyectos', icon: FaGlobeAmericas, path: '/b2c/projects' },
    { id: 'certificates', label: 'Certificados', icon: FaCertificate, path: '/b2c/certificates' },
    { id: 'calculator', label: 'Calcular CO₂', icon: HiSparkles, path: '/b2c/calculator' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="!min-h-screen !bg-gray-50 !flex !font-sans !text-gray-800 !w-full !box-border">
      
      {/* --- SIDEBAR DESKTOP --- */}
      <aside className="!hidden lg:!flex !flex-col !w-64 !h-screen !bg-white !border-r !border-gray-200 !shadow-sm !fixed !left-0 !top-0 !z-50 !overflow-y-auto">
        {/* Logo Area */}
        <Link to="/b2c/dashboard" className="!flex !items-center !gap-3 !h-20 !px-6 !border-b !border-gray-100 !flex-shrink-0 !no-underline">
          <div className="!w-10 !h-10 !bg-green-100 !rounded-lg !flex !items-center !justify-center">
            <FaLeaf className="!text-green-600 !text-2xl" />
          </div>
          <span className="!text-lg !font-bold !text-gray-800">CompensaTuViaje</span>
        </Link>
        
        {/* Nav Links */}
        <nav className="!flex-1 !px-4 !py-6 !space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-lg !transition-all !font-medium !no-underline ${
                isActive(item.path)
                  ? '!bg-green-100 !text-green-700' 
                  : '!bg-transparent !text-gray-700 hover:!bg-green-50 hover:!text-green-700'
              }`}
            >
              <item.icon className="!text-xl" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Widget Meta Mensual */}
        <div className="!mx-4 !mb-4 !p-4 !rounded-xl !bg-gradient-to-br !from-green-500 !to-green-600 !text-white !shadow-lg !flex-shrink-0">
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
          <Link 
            to="/b2c/settings" 
            className="!w-full !flex !items-center !gap-3 !px-4 !py-2 !rounded-lg !text-gray-600 hover:!bg-gray-100 !no-underline"
          >
            <FaCog className="!text-lg" /> Configuración
          </Link>
          <button 
            onClick={handleLogout} 
            className="!w-full !flex !items-center !gap-3 !px-4 !py-2 !rounded-lg !text-red-500 hover:!bg-red-50 !bg-transparent !border-0 !cursor-pointer"
          >
            <FaSignOutAlt className="!text-lg" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- SIDEBAR MOBILE (DRAWER) --- */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="!fixed !inset-0 !z-[60] !bg-black/40 !backdrop-blur-sm lg:!hidden" 
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="!fixed !left-0 !top-0 !h-full !w-64 !bg-white !border-r !border-gray-200 !shadow-2xl !flex !flex-col !z-[70] lg:!hidden"
            >
              <div className="!flex !items-center !justify-between !h-20 !px-6 !border-b !border-gray-100">
                <Link to="/b2c/dashboard" className="!flex !items-center !gap-3 !no-underline" onClick={() => setSidebarOpen(false)}>
                  <div className="!w-10 !h-10 !bg-green-100 !rounded-lg !flex !items-center !justify-center">
                    <FaLeaf className="!text-green-600 !text-2xl" />
                  </div>
                  <span className="!text-lg !font-bold !text-gray-800">CompensaTuViaje</span>
                </Link>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="!p-2 !rounded-lg !text-gray-400 hover:!text-gray-600 hover:!bg-gray-100 !bg-transparent !border-0"
                >
                  <FaTimes className="!text-xl" />
                </button>
              </div>
              
              <nav className="!flex-1 !px-4 !py-6 !space-y-1 !overflow-y-auto">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-lg !transition-all !font-medium !no-underline ${
                      isActive(item.path) 
                        ? '!bg-green-100 !text-green-700' 
                        : '!text-gray-700 hover:!bg-green-50'
                    }`}
                  >
                    <item.icon className="!text-xl" />
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Meta Widget */}
              <div className="!mx-4 !mb-4 !p-4 !rounded-xl !bg-gradient-to-br !from-green-500 !to-green-600 !text-white !shadow-lg">
                <div className="!text-xs !font-semibold !mb-1 !opacity-90">Meta Mensual</div>
                <div className="!text-xl !font-bold">1,247 t CO₂</div>
                <div className="!w-full !h-2 !bg-green-800/30 !rounded-full !overflow-hidden !mt-2">
                  <div className="!h-2 !bg-white !rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div className="!px-4 !pb-6 !space-y-1">
                <Link 
                  to="/b2c/settings" 
                  onClick={() => setSidebarOpen(false)}
                  className="!w-full !flex !items-center !gap-3 !px-4 !py-2 !rounded-lg !text-gray-600 hover:!bg-gray-100 !no-underline"
                >
                  <FaCog className="!text-lg" /> Configuración
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="!w-full !flex !items-center !gap-3 !px-4 !py-2 !rounded-lg !text-red-500 hover:!bg-red-50 !bg-transparent !border-0"
                >
                  <FaSignOutAlt className="!text-lg" /> Cerrar Sesión
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <main className="!flex-1 !min-h-screen lg:!ml-64 !transition-all !duration-300 !relative !bg-gray-50 !w-full">
        
        {/* Header Top Bar */}
        <div className="!bg-white/80 !backdrop-blur-md !border-b !border-gray-200 !sticky !top-0 !z-40 !w-full">
          <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-4">
            <div className="!flex !items-center !justify-between">
              <div className="!flex !items-center !gap-4">
                {/* Burger Button Mobile */}
                <button 
                  className="lg:!hidden !p-2 !rounded-lg !bg-gray-100 !text-gray-600 hover:!bg-gray-200 !border-0 !cursor-pointer" 
                  onClick={() => setSidebarOpen(true)}
                >
                  <FaBars className="!text-xl" />
                </button>
                <div>
                  {title ? (
                    <>
                      <h1 className="!text-xl sm:!text-2xl !font-bold !text-gray-900 !m-0 !leading-tight">
                        {title}
                      </h1>
                      {subtitle && (
                        <p className="!text-gray-500 !text-sm !mt-1">{subtitle}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <h1 className="!text-xl sm:!text-2xl !font-bold !text-gray-900 !m-0 !leading-tight">
                        Hola, {user?.nombre || user?.email?.split('@')[0] || 'Usuario'}
                      </h1>
                      <p className="!text-gray-500 !text-sm !hidden sm:!block !mt-1">
                        Bienvenido a tu panel de impacto ambiental
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              <div className="!flex !items-center !gap-3">
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  className="!relative !p-2.5 !rounded-full !bg-gray-100 hover:!bg-gray-200 !transition-colors !border-0 !cursor-pointer"
                >
                  <FaBell className="!text-lg !text-gray-600" />
                  <span className="!absolute !top-1.5 !right-1.5 !w-2.5 !h-2.5 !bg-red-500 !rounded-full !border-2 !border-white"></span>
                </motion.button>
                
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt="Avatar" 
                    className="!w-10 !h-10 !rounded-full !shadow-lg !object-cover !border-2 !border-green-200"
                  />
                ) : (
                  <div className="!w-10 !h-10 !rounded-full !bg-gradient-to-br !from-green-500 !to-emerald-600 !flex !items-center !justify-center !text-white !font-bold !shadow-lg !text-sm">
                    {user?.nombre?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-6 sm:!py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default B2CLayout;
