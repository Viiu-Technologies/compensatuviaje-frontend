import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAuth } from '../../auth/context/AuthContext';
import { useTheme } from '../../../shared/context/ThemeContext';
import type { CompanyType } from '../../../types/auth.types';
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

// ─── Per-company-type theme system ────────────────────────────────────────────

interface CompanyTheme {
  /** CSS gradient for sidebar background */
  sidebarGradient: string;
  /** Tailwind classes for active nav button */
  activeGrad: string;
  activeShadow: string;
  /** Inline style for user pill container */
  pillStyle: React.CSSProperties;
  /** Tailwind classes for avatar bg */
  avatarGrad: string;
  avatarShadow: string;
  /** Tailwind class for email text color */
  emailColor: string;
  /** Hex for the topbar accent line + title border */
  accentHex: string;
  /** Human-readable label shown in topbar subtitle */
  industryLabel: string;
}

const COMPANY_THEMES: Record<CompanyType, CompanyTheme> = {
  TRAVEL_AGENCY: {
    sidebarGradient: 'linear-gradient(to bottom, #040e1e, #071528, #040e1e)',
    activeGrad: '!from-sky-500 !to-blue-600',
    activeShadow: '!shadow-sky-500/30',
    pillStyle: { background: 'linear-gradient(to right, rgba(14,165,233,0.15), rgba(37,99,235,0.12))', borderColor: 'rgba(56,189,248,0.25)' },
    avatarGrad: '!from-sky-400 !to-blue-600',
    avatarShadow: '!shadow-sky-500/40',
    emailColor: '!text-sky-400/80',
    accentHex: '#0ea5e9',
    industryLabel: 'Plataforma para Aerolíneas y Agencias',
  },
  TRANSPORT: {
    sidebarGradient: 'linear-gradient(to bottom, #1a0e00, #231500, #1a0e00)',
    activeGrad: '!from-amber-500 !to-orange-600',
    activeShadow: '!shadow-amber-500/30',
    pillStyle: { background: 'linear-gradient(to right, rgba(245,158,11,0.15), rgba(234,88,12,0.12))', borderColor: 'rgba(251,191,36,0.25)' },
    avatarGrad: '!from-amber-400 !to-orange-600',
    avatarShadow: '!shadow-amber-500/40',
    emailColor: '!text-amber-400/80',
    accentHex: '#f59e0b',
    industryLabel: 'Gestión de Rutas y Transporte',
  },
  LOGISTICS: {
    sidebarGradient: 'linear-gradient(to bottom, #00111a, #001e2c, #00111a)',
    activeGrad: '!from-teal-500 !to-cyan-600',
    activeShadow: '!shadow-teal-500/30',
    pillStyle: { background: 'linear-gradient(to right, rgba(20,184,166,0.15), rgba(8,145,178,0.12))', borderColor: 'rgba(45,212,191,0.25)' },
    avatarGrad: '!from-teal-400 !to-cyan-600',
    avatarShadow: '!shadow-teal-500/40',
    emailColor: '!text-teal-400/80',
    accentHex: '#14b8a6',
    industryLabel: 'Control de Cadena Logística',
  },
  CORPORATE: {
    sidebarGradient: 'linear-gradient(to bottom, #0f0820, #17102e, #0f0820)',
    activeGrad: '!from-violet-500 !to-purple-600',
    activeShadow: '!shadow-violet-500/30',
    pillStyle: { background: 'linear-gradient(to right, rgba(139,92,246,0.15), rgba(147,51,234,0.12))', borderColor: 'rgba(167,139,250,0.25)' },
    avatarGrad: '!from-violet-400 !to-purple-600',
    avatarShadow: '!shadow-violet-500/40',
    emailColor: '!text-violet-400/80',
    accentHex: '#8b5cf6',
    industryLabel: 'Compensación Corporativa de Viajes',
  },
  EVENTS: {
    sidebarGradient: 'linear-gradient(to bottom, #1a0810, #251016, #1a0810)',
    activeGrad: '!from-rose-500 !to-pink-600',
    activeShadow: '!shadow-rose-500/30',
    pillStyle: { background: 'linear-gradient(to right, rgba(244,63,94,0.15), rgba(219,39,119,0.12))', borderColor: 'rgba(251,113,133,0.25)' },
    avatarGrad: '!from-rose-400 !to-pink-600',
    avatarShadow: '!shadow-rose-500/40',
    emailColor: '!text-rose-400/80',
    accentHex: '#f43f5e',
    industryLabel: 'Eventos y Turismo Sostenible',
  },
  OTHER: {
    sidebarGradient: 'linear-gradient(to bottom, #0d1117, #111827, #0d1117)',
    activeGrad: '!from-green-500 !to-emerald-600',
    activeShadow: '!shadow-green-500/30',
    pillStyle: { background: 'linear-gradient(to right, rgba(16,185,129,0.15), rgba(5,150,105,0.12))', borderColor: 'rgba(52,211,153,0.25)' },
    avatarGrad: '!from-green-400 !to-emerald-600',
    avatarShadow: '!shadow-green-500/40',
    emailColor: '!text-green-400/80',
    accentHex: '#10b981',
    industryLabel: 'Panel de impacto ambiental corporativo',
  },
};

// ─── Nav items base ────────────────────────────────────────────────────────────
const ITEMS = {
  perfil:       { id: 'dashboard',    label: 'Tu Perfil',               icon: User },
  panel:        { id: 'panel',        label: 'Panel Principal',          icon: BarChart3 },
  documentos:   { id: 'documentos',   label: 'Documentos',               icon: FileText },
  proyectos:    { id: 'proyectos',    label: 'Proyectos ESG',            icon: Trees },
  ordenes:      { id: 'ordenes',      label: 'Mis Órdenes',              icon: Package },
  certificados: { id: 'certificados', label: 'Bóveda de Certificados',   icon: ShieldCheck },
  manifiestos:  { id: 'manifiestos',  label: 'Manifiestos de Vuelos',    icon: FileUp },
  calculadora:  { id: 'calculadora',  label: 'Calculadora CO₂',          icon: Calculator },
  asistente:    { id: 'asistente',    label: 'Asistente IA',             icon: Bot },
} as const;

// Navegación base para todos los tipos
const BASE_EMPRESA = [ITEMS.perfil, ITEMS.panel, ITEMS.documentos];
const BASE_TOOLS   = [ITEMS.calculadora, ITEMS.asistente];

// Configuración de secciones por tipo de empresa
const DASHBOARD_CONFIGS: Record<CompanyType, { label: string; items: typeof ITEMS[keyof typeof ITEMS][] }[]> = {
  TRAVEL_AGENCY: [
    { label: 'MI EMPRESA',     items: BASE_EMPRESA },
    { label: 'VUELOS',         items: [ITEMS.proyectos, ITEMS.ordenes, ITEMS.certificados, ITEMS.manifiestos] },
    { label: 'HERRAMIENTAS',   items: BASE_TOOLS },
  ],
  TRANSPORT: [
    { label: 'MI EMPRESA',     items: BASE_EMPRESA },
    { label: 'RUTAS',          items: [ITEMS.proyectos, ITEMS.ordenes, ITEMS.certificados] },
    { label: 'HERRAMIENTAS',   items: BASE_TOOLS },
  ],
  LOGISTICS: [
    { label: 'MI EMPRESA',     items: BASE_EMPRESA },
    { label: 'LOGÍSTICA',      items: [ITEMS.proyectos, ITEMS.ordenes, ITEMS.certificados, ITEMS.manifiestos] },
    { label: 'HERRAMIENTAS',   items: BASE_TOOLS },
  ],
  CORPORATE: [
    { label: 'MI EMPRESA',     items: BASE_EMPRESA },
    { label: 'COMPENSACIONES', items: [ITEMS.proyectos, ITEMS.ordenes, ITEMS.certificados] },
    { label: 'HERRAMIENTAS',   items: BASE_TOOLS },
  ],
  EVENTS: [
    { label: 'MI EMPRESA',     items: BASE_EMPRESA },
    { label: 'EVENTOS',        items: [ITEMS.proyectos, ITEMS.ordenes, ITEMS.certificados, ITEMS.manifiestos] },
    { label: 'HERRAMIENTAS',   items: BASE_TOOLS },
  ],
  OTHER: [
    { label: 'MI EMPRESA',     items: BASE_EMPRESA },
    { label: 'COMPENSACIONES', items: [ITEMS.proyectos, ITEMS.ordenes, ITEMS.certificados] },
    { label: 'HERRAMIENTAS',   items: BASE_TOOLS },
  ],
};

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
  navSections: { label: string; items: { id: string; label: string; icon: React.ElementType }[] }[];
  theme: CompanyTheme;
}> = ({ activeTab, onNav, user, onLogout, navSections, theme }) => (
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
      <div className="!flex !items-center !gap-3 !p-3 !rounded-xl !border" style={theme.pillStyle}>
        <div className={`!w-9 !h-9 !rounded-full !bg-gradient-to-br ${theme.avatarGrad} !flex !items-center !justify-center !text-white !font-bold !flex-shrink-0 !text-sm !shadow-lg ${theme.avatarShadow}`}>
          {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="!flex-1 !min-w-0">
          <p className="!text-xs !font-semibold !text-white !truncate">{user?.name || user?.email || 'Usuario'}</p>
          <p className={`!text-[10px] ${theme.emailColor} !truncate`}>{user?.email || ''}</p>
        </div>
      </div>
    </div>

    {/* Secciones de navegación */}
    <nav className="!flex-1 !overflow-y-auto !px-3 !py-4 !space-y-5">
      {navSections.map((section) => (
        <div key={section.label}>
          <p className="!text-[10px] !font-bold !tracking-widest !text-gray-500 !uppercase !px-3 !mb-2">
            {section.label}
          </p>
          <div className="!space-y-0.5">
            {section.items.map((item) => (
              <button
                key={item.id}
                data-nav-item="true"
                onClick={() => onNav(item.id)}
                className={`!w-full !flex !items-center !gap-3 !px-3 !py-2.5 !rounded-xl !transition-all !text-left !text-sm !font-medium !border-0 !outline-none ${
                  activeTab === item.id
                    ? `!bg-gradient-to-r ${theme.activeGrad} !text-white !shadow-lg ${theme.activeShadow}`
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
        data-nav-item="true"
        onClick={() => onNav(BOTTOM_ITEM.id)}
        className={`!w-full !flex !items-center !gap-3 !px-3 !py-2.5 !rounded-xl !transition-all !text-left !text-sm !font-medium !border-0 !outline-none ${
          activeTab === BOTTOM_ITEM.id
            ? `!bg-gradient-to-r ${theme.activeGrad} !text-white !shadow-lg ${theme.activeShadow}`
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

  const sidebarRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const companyType = (user?.companyType as CompanyType) ?? 'OTHER';
  const theme       = COMPANY_THEMES[companyType];
  const navSections = DASHBOARD_CONFIGS[companyType];

  // GSAP: stagger nav items into view on first mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-nav-item]',
        { x: -18, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, stagger: 0.045, duration: 0.4, ease: 'power2.out', delay: 0.25 },
      );
    }, sidebarRef);
    return () => ctx.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // GSAP: fade + slide content area on tab change
  useEffect(() => {
    if (!contentRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(contentRef.current, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' });
  }, [activeTab]);

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
      <aside
        ref={sidebarRef}
        className="!hidden lg:!flex !flex-col !w-64 !h-screen !shadow-2xl !fixed !left-0 !top-0 !z-50 !overflow-hidden"
        style={{ background: theme.sidebarGradient }}
      >
        <SidebarContent activeTab={activeTab} onNav={handleNav} user={user} onLogout={handleLogout} navSections={navSections} theme={theme} />
      </aside>

      {/* ── SIDEBAR MOBILE (DRAWER) ── */}
      {sidebarOpen && (
        <div
          className="!fixed !inset-0 !z-[60] !bg-black/60 !backdrop-blur-sm lg:!hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="!fixed !left-0 !top-0 !h-full !w-64 !shadow-2xl !flex !flex-col !z-[70]"
            style={{ background: theme.sidebarGradient }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent activeTab={activeTab} onNav={handleNav} user={user} onLogout={handleLogout} navSections={navSections} theme={theme} />
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
        <div className={`!backdrop-blur-md !border-b !sticky !top-0 !z-40 !w-full !overflow-hidden ${
          isDark ? '!bg-gray-800/80 !border-gray-700' : '!bg-white/80 !border-gray-200'
        }`}>
          {/* Colored accent line */}
          <div
            className="!h-[2px] !w-full"
            style={{ background: `linear-gradient(to right, ${theme.accentHex}, ${theme.accentHex}60, transparent)` }}
          />
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
                <div className="!pl-3" style={{ borderLeft: `2px solid ${theme.accentHex}` }}>
                  <h2 className={`!text-base !font-semibold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>
                    {TAB_LABELS[activeTab] || 'Panel B2B'}
                  </h2>
                  <p className={`!text-xs !hidden sm:!block ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>
                    {theme.industryLabel}
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
                      ? isDark ? '!bg-gray-700' : '!bg-gray-100'
                      : isDark ? '!bg-gray-700 hover:!bg-gray-600 !text-gray-400' : '!bg-gray-100 hover:!bg-gray-200 !text-gray-500'
                  }`}
                  style={activeTab === 'cuenta' ? { color: theme.accentHex } : {}}
                >
                  <Settings className="!w-4.5 !h-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div ref={contentRef} className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-8">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
};

export default B2BDashboard;