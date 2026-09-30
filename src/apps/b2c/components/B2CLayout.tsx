import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChartLine,
  FaPlane,
  FaGlobeAmericas,
  FaCertificate,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaTimes,
  FaBars,
  FaCubes,
  FaTrophy,
  FaLeaf,
  FaCheckCircle,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import b2cApi from '../services/b2cApi';

interface B2CLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerRightExtra?: React.ReactNode;
}

interface NavGroup {
  groupLabel?: string;
  items: {
    id: string;
    label: string;
    icon: any;
    path: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: FaChartLine, path: '/b2c/dashboard' },
    ],
  },
  {
    groupLabel: 'VIAJES',
    items: [
      { id: 'flights', label: 'Mis viajes', icon: FaPlane, path: '/b2c/flights' },
    ],
  },
  {
    groupLabel: 'HUELLA',
    items: [
      { id: 'calculator', label: 'Calcular CO₂', icon: FaLeaf, path: '/b2c/calculator' },
    ],
  },
  {
    groupLabel: 'COMPENSACIÓN',
    items: [
      { id: 'projects', label: 'Proyectos', icon: FaGlobeAmericas, path: '/b2c/projects' },
      { id: 'compensations', label: 'Compensaciones', icon: FaCheckCircle, path: '/b2c/certificates' },
    ],
  },
  {
    groupLabel: 'CERTIFICADOS',
    items: [
      { id: 'certificates', label: 'Certificados', icon: FaCertificate, path: '/b2c/certificates' },
      { id: 'nft-certificates', label: 'Mis NFTs', icon: FaCubes, path: '/b2c/nft-certificates' },
      { id: 'achievements', label: 'Mis Logros', icon: FaTrophy, path: '/b2c/achievements' },
    ],
  },
];

const B2CLayout: React.FC<B2CLayoutProps> = ({
  children,
  title,
  subtitle,
  headerRightExtra,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Resumen del menú lateral: historial completo del usuario, empieza en cero.
  const [sidebarStats, setSidebarStats] = useState({
    totalCompensatedTons: 0,
    compensationRate: 0,
    certificatesCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { stats } = await b2cApi.getDashboardStats('all');
        setSidebarStats({
          totalCompensatedTons: stats.lifetimeCompensatedKg / 1000,
          compensationRate: stats.lifetimeCompensationRate,
          certificatesCount: stats.certificatesCount,
        });
      } catch {
        // Sin datos se queda en cero: nunca mostrar cifras que no son del usuario.
      }
    };
    fetchStats();
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/b2c/dashboard') {
      return location.pathname === '/b2c/dashboard';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderNavLinks = () => (
    <div className="space-y-4">
      {navGroups.map((group, gIdx) => (
        <div key={gIdx} className="space-y-1">
          {group.groupLabel && (
            <div className="px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              {group.groupLabel}
            </div>
          )}
          {group.items.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold no-underline ${
                  active
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`text-sm ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex font-sans text-gray-800 dark:text-slate-100 w-full box-border">
      {/* ========================================================= */}
      {/* DESKTOP SIDEBAR                                           */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex flex-col w-60 h-screen bg-white dark:bg-slate-900 border-r border-gray-200/80 dark:border-slate-800 shadow-xs fixed left-0 top-0 z-50">
        {/* Logo Area */}
        <Link
          to="/b2c/dashboard"
          className="flex items-center h-16 px-5 border-b border-gray-100 dark:border-slate-800 flex-shrink-0 no-underline"
        >
          <img
            src="/images/brand/logo-horizontal-clean.svg"
            alt="CompensaTuViaje"
            className="h-7 w-auto"
          />
        </Link>

        {/* Categorized Nav Links */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {renderNavLinks()}
        </nav>

        {/* Tu Impacto Widget */}
        <div className="mx-3 mb-2 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-emerald-200 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200 flex items-center justify-center text-[10px]">
              <FaLeaf />
            </div>
            <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300">
              Tu impacto
            </span>
          </div>

          <div className="text-lg font-black text-gray-900 dark:text-white leading-tight">
            {sidebarStats.totalCompensatedTons.toFixed(1)}{' '}
            <span className="text-xs font-semibold text-gray-400">tCO₂e</span>
          </div>
          <div className="text-[10px] text-gray-400 dark:text-slate-500 mb-2">
            compensadas
          </div>

          <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(sidebarStats.compensationRate, 100)}%` }}
            />
          </div>

          <div className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {sidebarStats.compensationRate}%
            </span>{' '}
            de tu huella · {sidebarStats.certificatesCount} certificados
          </div>
        </div>

        {/* Footer Sidebar */}
        <div className="px-3 pb-4 pt-2 space-y-0.5 border-t border-gray-100 dark:border-slate-800 flex-shrink-0 text-xs">
          <Link
            to="/b2c/settings"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800 no-underline font-medium transition-colors"
          >
            <FaCog className="text-sm text-gray-400" />
            <span>Configuración</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 bg-transparent border-0 cursor-pointer font-medium transition-colors text-left text-xs"
          >
            <FaSignOutAlt className="text-sm" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MOBILE DRAWER                                             */}
      {/* ========================================================= */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-xs lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 shadow-2xl flex flex-col z-[70] lg:hidden"
            >
              <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100 dark:border-slate-800">
                <Link
                  to="/b2c/dashboard"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center no-underline"
                >
                  <img
                    src="/images/brand/logo-horizontal-clean.svg"
                    alt="CompensaTuViaje"
                    className="h-7 w-auto"
                  />
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 bg-transparent border-0"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 overflow-y-auto">
                {renderNavLinks()}
              </nav>

              <div className="px-3 pb-4 pt-2 space-y-0.5 border-t border-gray-100 dark:border-slate-800 text-xs">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-500 bg-transparent border-0 font-medium text-left text-xs"
                >
                  <FaSignOutAlt className="text-sm" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MAIN CONTENT WRAPPER                                      */}
      {/* ========================================================= */}
      <main className="flex-1 min-h-screen lg:ml-60 transition-all duration-300 relative bg-[#f8fafc] dark:bg-slate-950 w-full">
        {/* Sticky Top Bar */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200/70 dark:border-slate-800 sticky top-0 z-40 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex items-center justify-between gap-4">
              {/* Left Title & Mobile Hamburger */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-0 cursor-pointer flex-shrink-0"
                  onClick={() => setSidebarOpen(true)}
                >
                  <FaBars className="text-base" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white m-0 leading-tight truncate">
                    {title || `Hola, ${(user?.nombre || user?.email?.split('@')[0] || 'Viajero').toUpperCase()}`}
                  </h1>
                  {subtitle && (
                    <p className="text-gray-400 dark:text-slate-500 text-xs m-0 mt-0.5 truncate hidden sm:block">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Controls: Filter + Bell + User Avatar */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {headerRightExtra}

                {/* Notifications Bell */}
                <button
                  type="button"
                  className="relative p-2 rounded-full bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 border border-gray-200/80 dark:border-slate-700 cursor-pointer transition-colors"
                >
                  <FaBell className="text-sm" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* User Avatar */}
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover border border-emerald-300 shadow-xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {(user?.nombre || 'N').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Body Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default B2CLayout;
