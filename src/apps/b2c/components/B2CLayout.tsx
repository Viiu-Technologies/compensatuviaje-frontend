import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChartLine,
  FaPlane,
  FaGlobeAmericas,
  FaCertificate,
  FaSignOutAlt,
  FaTimes,
  FaBars,
  FaCubes,
  FaTrophy,
  FaLeaf,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import b2cApi from '../services/b2cApi';
import { useForceLightTheme } from '../../../shared/utils/useForceLightTheme';
import { useTailwindSpacing } from '../../../shared/utils/useTailwindSpacing';
import { Progress, firstName, fmtNum, fmtPercent, fmtInt } from '../ui';

interface B2CLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerRightExtra?: React.ReactNode;
}

interface NavGroup {
  groupLabel?: string;
  items: { id: string; label: string; icon: any; path: string }[];
}

/**
 * Antes "Compensaciones" y "Certificados" llevaban a la misma página, y
 * "Configuración" a una ruta que no existe (/b2c/settings). La campana de
 * notificaciones tenía un punto rojo fijo sin nada detrás; se quitó.
 */
const navGroups: NavGroup[] = [
  {
    items: [{ id: 'dashboard', label: 'Resumen', icon: FaChartLine, path: '/b2c/dashboard' }],
  },
  {
    groupLabel: 'Tu huella',
    items: [
      { id: 'flights', label: 'Mis viajes', icon: FaPlane, path: '/b2c/flights' },
      { id: 'calculator', label: 'Calcular CO₂', icon: FaLeaf, path: '/b2c/calculator' },
    ],
  },
  {
    groupLabel: 'Compensación',
    items: [
      { id: 'projects', label: 'Proyectos', icon: FaGlobeAmericas, path: '/b2c/projects' },
      { id: 'certificates', label: 'Certificados', icon: FaCertificate, path: '/b2c/certificates' },
      { id: 'nft-certificates', label: 'Certificados NFT', icon: FaCubes, path: '/b2c/nft-certificates' },
      { id: 'achievements', label: 'Mis logros', icon: FaTrophy, path: '/b2c/achievements' },
    ],
  },
];

const B2CLayout: React.FC<B2CLayoutProps> = ({ children, title, subtitle, headerRightExtra }) => {
  const { user, logout } = useAuth();
  // Sin estos dos, el menú lateral tapaba el contenido (el reset global
  // anulaba lg:ml-60 y todos los rellenos) y en modo oscuro las cifras
  // quedaban en blanco sobre tarjetas blancas.
  useTailwindSpacing();
  useForceLightTheme();
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

  const isActive = (path: string) =>
    path === '/b2c/dashboard'
      ? location.pathname === path
      : location.pathname === path || location.pathname.startsWith(path + '/');

  const name = firstName(user?.nombre, user?.email);

  const renderNavLinks = () => (
    <div className="space-y-5">
      {navGroups.map((group, gIdx) => (
        <div key={gIdx} className="space-y-0.5">
          {group.groupLabel && (
            <div className="px-3 pb-1 text-xs font-semibold text-gray-400">{group.groupLabel}</div>
          )}
          {group.items.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm no-underline transition-colors ${
                  active
                    ? 'bg-brand-50 text-brand-800 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`}
              >
                <Icon className={`text-sm flex-shrink-0 ${active ? 'text-brand-700' : 'text-gray-400'}`} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );

  const impactWidget = (
    <div className="mx-3 mb-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
      <div className="text-xs font-semibold text-gray-500">Tu impacto</div>
      <div className="mt-1 text-xl font-bold text-gray-900 tabular-nums">
        {fmtNum(sidebarStats.totalCompensatedTons)}{' '}
        <span className="text-xs font-semibold text-gray-500">t CO₂e compensadas</span>
      </div>
      <Progress value={sidebarStats.compensationRate} label="Porcentaje de tu huella compensado" className="mt-3 h-1.5" />
      <div className="mt-2 text-xs text-gray-500">
        <span className="font-semibold text-brand-700">{fmtPercent(sidebarStats.compensationRate)}</span> de tu huella ·{' '}
        {fmtInt(sidebarStats.certificatesCount)} {sidebarStats.certificatesCount === 1 ? 'certificado' : 'certificados'}
      </div>
    </div>
  );

  const logoutButton = (
    <button
      type="button"
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-rose-700 hover:bg-rose-50 bg-transparent border-0 cursor-pointer text-left transition-colors"
    >
      <FaSignOutAlt className="text-sm text-gray-400" aria-hidden="true" />
      <span>Cerrar sesión</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800 w-full box-border">
      {/* Menú lateral de escritorio */}
      <aside className="hidden lg:flex flex-col w-60 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 z-50">
        <Link to="/b2c/dashboard" className="flex items-center h-16 px-5 border-b border-gray-100 flex-shrink-0 no-underline">
          <img src="/images/brand/logo-horizontal-clean.svg" alt="CompensaTuViaje" className="h-7 w-auto" />
        </Link>
        <nav className="flex-1 px-3 py-5 overflow-y-auto" aria-label="Menú principal">
          {renderNavLinks()}
        </nav>
        {impactWidget}
        <div className="px-3 pb-4 pt-2 border-t border-gray-100 flex-shrink-0">{logoutButton}</div>
      </aside>

      {/* Menú lateral en móvil */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-xl flex flex-col z-[70] lg:hidden"
            >
              <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100">
                <Link to="/b2c/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center no-underline">
                  <img src="/images/brand/logo-horizontal-clean.svg" alt="CompensaTuViaje" className="h-7 w-auto" />
                </Link>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-800 bg-transparent border-0 cursor-pointer"
                  aria-label="Cerrar menú"
                >
                  <FaTimes aria-hidden="true" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-5 overflow-y-auto" aria-label="Menú principal">
                {renderNavLinks()}
              </nav>
              {impactWidget}
              <div className="px-3 pb-4 pt-2 border-t border-gray-100">{logoutButton}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Contenido */}
      <main className="flex-1 min-h-screen lg:ml-60 bg-gray-50 w-full min-w-0">
        <header className="bg-white/95 backdrop-blur border-b border-gray-200 sticky top-0 z-40 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                className="lg:hidden p-2 rounded-lg bg-gray-100 text-gray-600 border-0 cursor-pointer flex-shrink-0"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menú"
              >
                <FaBars aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 m-0 leading-tight truncate">
                  {title || (name ? `Hola, ${name}` : 'Hola')}
                </h1>
                {subtitle && <p className="text-gray-500 text-sm m-0 mt-0.5 truncate hidden sm:block">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {headerRightExtra}
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
              ) : (
                <span
                  className="w-8 h-8 rounded-full bg-brand-700 text-white flex items-center justify-center font-semibold text-sm"
                  aria-hidden="true"
                >
                  {(name || 'U').charAt(0)}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
};

export default B2CLayout;
