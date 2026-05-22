import React, { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useTheme } from '../../../shared/context/ThemeContext';
import {
  Trees,
  User,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  Package,
  Calculator,
  Bot,
  FileText,
  FileUp,
  Bell,
  X,
  Menu,
} from 'lucide-react';

// Import Views
import ProfileView from './views/ProfileView';
import DashboardPanelView from './views/DashboardPanelView';
import ProjectsView from './views/ProjectsView';
import SettingsView from './views/SettingsView';
import CalculatorView from './views/CalculatorView';
import AssistantView from './views/AssistantView';
import DocumentsView from './views/DocumentsView';
import OrdersView from './views/OrdersView';
import ManifestView from './views/ManifestView';
import CertificatesView from './views/CertificatesView';

// Navegación agrupada por secciones
const NAV_SECTIONS = [
  {
    label: 'MI EMPRESA',
    items: [
      { id: 'dashboard', label: 'Tu Perfil', icon: User },
      { id: 'panel', label: 'Panel Principal', icon: BarChart3 },
      { id: 'documentos', label: 'Documentos', icon: FileText },
    ],
  },
  {
    label: 'COMPENSACIONES',
    items: [
      { id: 'proyectos', label: 'Proyectos ESG', icon: Trees },
      { id: 'ordenes', label: 'Mis Órdenes', icon: Package },
      { id: 'certificados', label: 'Bóveda de Certificados', icon: ShieldCheck },
      { id: 'manifiestos', label: 'Manifiestos de Vuelos', icon: FileUp },
    ],
  },
  {
    label: 'HERRAMIENTAS',
    items: [
      { id: 'calculadora', label: 'Calculadora CO₂', icon: Calculator },
      { id: 'asistente', label: 'Asistente IA', icon: Bot },
    ],
  },
];

// Ítem inferior (fuera de secciones)
const BOTTOM_ITEM = { id: 'cuenta', label: 'Configuración', icon: Settings };

// Etiquetas para el header según pestaña activa
const TAB_LABELS: Record<string, string> = {
  dashboard: 'Tu Perfil',
  panel: 'Panel Principal',
  documentos: 'Documentos',
  proyectos: 'Proyectos ESG',
  ordenes: 'Mis Órdenes',
  certificados: 'Bóveda de Certificados',
  manifiestos: 'Manifiestos de Vuelos',
  calculadora: 'Calculadora CO₂',
  asistente: 'Asistente IA',
  cuenta: 'Configuración',
};

// ─── Sidebar content (reutilizado en desktop y mobile) ────────────────────────
const SidebarContent: React.FC<{
  activeTab: string;
  onNav: (id: string) => void;
  user: any;
  onLogout: () => void;
}> = ({ activeTab, onNav, user, onLogout }) => (
  <>
    {/* Logo */}
    <div className="!flex !items-center !justify-center !h-20 !px-6 !border-b !border-white/10 !flex-shrink-0">
      <img
        src="/images/brand/logo-horizontal-white.svg"
        alt="CompensaTuViaje"
        className="!h-10 !w-auto !drop-shadow-lg"
      />
    </div>

    {/* User pill */}
    <div className="!px-4 !py-4 !border-b !border-white/10 !flex-shrink-0">
      <div className="!flex !items-center !gap-3 !p-3 !rounded-xl !bg-gradient-to-r !from-green-500/20 !to-emerald-500/20 !border !border-green-400/30">
        <div className="!w-9 !h-9 !rounded-full !bg-gradient-to-br !from-green-400 !to-emerald-600 !flex !items-center !justify-center !text-white !font-bold !flex-shrink-0 !text-sm !shadow-lg !shadow-green-500/40">
          {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="!flex-1 !min-w-0">
          <p className="!text-xs !font-semibold !text-white !truncate">{user?.name || user?.email || 'Usuario'}</p>
          <p className="!text-[10px] !text-green-400/80 !truncate">{user?.email || ''}</p>
        </div>
      </div>
    </div>

    {/* Secciones de navegación */}
    <nav className="!flex-1 !overflow-y-auto !px-3 !py-4 !space-y-5">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="!text-[10px] !font-bold !tracking-widest !text-gray-500 !uppercase !px-3 !mb-2">
            {section.label}
          </p>
          <div className="!space-y-0.5">
            {section.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                className={`!w-full !flex !items-center !gap-3 !px-3 !py-2.5 !rounded-xl !transition-all !text-left !text-sm !font-medium !border-0 !outline-none ${
                  activeTab === item.id
                    ? '!bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !shadow-lg !shadow-green-500/30'
                    : '!bg-transparent !text-gray-400 hover:!bg-white/8 hover:!text-white'
                }`}
              >
                <item.icon className="!w-4 !h-4 !flex-shrink-0" />
                <span className="!truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>

    {/* Footer: Configuración + Cerrar sesión */}
    <div className="!flex-shrink-0 !px-3 !py-4 !border-t !border-white/10 !space-y-0.5">
      <button
        onClick={() => onNav(BOTTOM_ITEM.id)}
        className={`!w-full !flex !items-center !gap-3 !px-3 !py-2.5 !rounded-xl !transition-all !text-left !text-sm !font-medium !border-0 !outline-none ${
          activeTab === BOTTOM_ITEM.id
            ? '!bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !shadow-lg !shadow-green-500/30'
            : '!bg-transparent !text-gray-400 hover:!bg-white/8 hover:!text-white'
        }`}
      >
        <BOTTOM_ITEM.icon className="!w-4 !h-4 !flex-shrink-0" />
        <span className="!truncate">{BOTTOM_ITEM.label}</span>
      </button>
      <button
        onClick={onLogout}
        className="!w-full !flex !items-center !gap-3 !px-3 !py-2.5 !rounded-xl !text-red-400 hover:!bg-red-500/20 hover:!text-red-300 !bg-transparent !border-0 !transition-all !text-sm !font-medium"
      >
        <LogOut className="!w-4 !h-4 !flex-shrink-0" />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  </>
);

// ─── Main component ────────────────────────────────────────────────────────────
const B2BDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('panel');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDark = resolvedTheme === 'dark';

  const handleNav = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  const handleLogout = () => logout();

  // Render active view based on activeTab
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':   return <ProfileView />;
      case 'panel':       return <DashboardPanelView />;
      case 'documentos':  return <DocumentsView />;
      case 'proyectos':   return <ProjectsView onNavigateToOrders={() => setActiveTab('ordenes')} />;
      case 'ordenes':     return <OrdersView />;
      case 'certificados':return <CertificatesView />;
      case 'manifiestos': return <ManifestView />;
      case 'calculadora': return <CalculatorView />;
      case 'asistente':   return <AssistantView />;
      case 'cuenta':      return <SettingsView />;
      default:            return <DashboardPanelView />;
    }
  };

  return (
    <div className={`!min-h-screen !flex !font-sans !w-full !box-border !transition-colors !duration-200 ${
      isDark
        ? '!bg-gradient-to-br !from-gray-900 !via-gray-900 !to-gray-800 !text-gray-100'
        : '!bg-gradient-to-br !from-gray-50 !via-blue-50/30 !to-green-50/20 !text-gray-800'
    }`}>

      {/* ── SIDEBAR DESKTOP ── */}
      <aside className="!hidden lg:!flex !flex-col !w-64 !h-screen !bg-gradient-to-b !from-[#0d1117] !via-gray-900 !to-[#0d1117] !shadow-2xl !fixed !left-0 !top-0 !z-50 !overflow-hidden">
        <SidebarContent activeTab={activeTab} onNav={handleNav} user={user} onLogout={handleLogout} />
      </aside>

      {/* ── SIDEBAR MOBILE (DRAWER) ── */}
      {sidebarOpen && (
        <div
          className="!fixed !inset-0 !z-[60] !bg-black/60 !backdrop-blur-sm lg:!hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="!fixed !left-0 !top-0 !h-full !w-64 !bg-gradient-to-b !from-[#0d1117] !via-gray-900 !to-[#0d1117] !shadow-2xl !flex !flex-col !z-[70]"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent activeTab={activeTab} onNav={handleNav} user={user} onLogout={handleLogout} />
            <button
              className="!absolute !top-4 !right-4 !text-white/50 hover:!text-white !border-0 !bg-transparent !p-1"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="!w-5 !h-5" />
            </button>
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className={`!flex-1 !min-h-screen lg:!ml-64 !transition-all !duration-300 !w-full ${
        isDark ? '!bg-gray-900' : '!bg-gray-50'
      }`}>

        {/* Top Bar */}
        <div className={`!backdrop-blur-md !border-b !sticky !top-0 !z-40 !w-full ${
          isDark ? '!bg-gray-800/80 !border-gray-700' : '!bg-white/80 !border-gray-200'
        }`}>
          <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-3.5">
            <div className="!flex !items-center !justify-between">
              <div className="!flex !items-center !gap-3">
                {/* Burger mobile */}
                <button
                  className={`lg:!hidden !p-2 !rounded-lg !border-0 ${isDark ? '!bg-gray-700 !text-gray-300' : '!bg-gray-100 !text-gray-600'}`}
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="!w-5 !h-5" />
                </button>
                <div>
                  <h2 className={`!text-base !font-semibold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>
                    {TAB_LABELS[activeTab] || 'Panel B2B'}
                  </h2>
                  <p className={`!text-xs !hidden sm:!block ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>
                    Panel de impacto ambiental corporativo
                  </p>
                </div>
              </div>

              <div className="!flex !items-center !gap-2">
                <button className={`!p-2 !rounded-lg !transition-colors !border-0 ${
                  isDark ? '!bg-gray-700 hover:!bg-gray-600 !text-gray-400' : '!bg-gray-100 hover:!bg-gray-200 !text-gray-500'
                }`}>
                  <Bell className="!w-4.5 !h-4.5" />
                </button>
                <button
                  onClick={() => handleNav('cuenta')}
                  className={`!p-2 !rounded-lg !transition-colors !border-0 ${
                    activeTab === 'cuenta'
                      ? '!bg-green-500/20 !text-green-400'
                      : isDark ? '!bg-gray-700 hover:!bg-gray-600 !text-gray-400' : '!bg-gray-100 hover:!bg-gray-200 !text-gray-500'
                  }`}
                >
                  <Settings className="!w-4.5 !h-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-8">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
};

export default B2BDashboard;