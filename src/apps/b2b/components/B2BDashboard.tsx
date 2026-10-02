import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  Bot,
  Calculator,
  FileText,
  FileUp,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  Trees,
  Trophy,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import type { CompanyType } from '../../../types/auth.types';
import { useForceLightTheme } from '../../../shared/utils/useForceLightTheme';
import { useTailwindSpacing } from '../../../shared/utils/useTailwindSpacing';
import { btn, cx } from '../ui';
import ViewBoundary from './ViewBoundary';

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
import RankingView from './views/RankingView';

/**
 * Panel de empresas.
 *
 * Antes cada tipo de empresa tenía su propio color (azul, naranjo, violeta,
 * rosado…): ahora todas ven la marca, como el admin, el área de usuarios y el
 * portal de partners. Del tipo de empresa solo quedan las secciones del menú
 * y la etiqueta de la industria.
 */

const INDUSTRY_LABEL: Record<CompanyType, string> = {
  TRAVEL_AGENCY: 'Aerolíneas y agencias',
  TRANSPORT: 'Rutas y transporte',
  LOGISTICS: 'Cadena logística',
  CORPORATE: 'Viajes corporativos',
  EVENTS: 'Eventos y turismo',
  OTHER: 'Empresa',
};

type NavItem = { id: string; label: string; icon: React.ComponentType<{ className?: string }>; tag?: string };

const ITEMS = {
  panel: { id: 'panel', label: 'Resumen', icon: BarChart3 },
  perfil: { id: 'dashboard', label: 'Tu perfil', icon: User },
  documentos: { id: 'documentos', label: 'Documentos', icon: FileText },
  proyectos: { id: 'proyectos', label: 'Proyectos', icon: Trees },
  ordenes: { id: 'ordenes', label: 'Órdenes', icon: Package },
  certificados: { id: 'certificados', label: 'Certificados', icon: ShieldCheck },
  manifiestos: { id: 'manifiestos', label: 'Manifiestos de vuelos', icon: FileUp },
  calculadora: { id: 'calculadora', label: 'Calculadora de CO₂', icon: Calculator },
  asistente: { id: 'asistente', label: 'Asistente IA', icon: Bot, tag: 'Pronto' },
  ranking: { id: 'ranking', label: 'Ranking', icon: Trophy },
} satisfies Record<string, NavItem>;

const BASE_EMPRESA: NavItem[] = [ITEMS.panel, ITEMS.perfil, ITEMS.documentos];
const BASE_TOOLS: NavItem[] = [ITEMS.calculadora, ITEMS.asistente];

const DASHBOARD_CONFIGS: Record<CompanyType, { label: string; items: NavItem[] }[]> = {
  TRAVEL_AGENCY: [
    { label: 'Mi empresa', items: BASE_EMPRESA },
    { label: 'Vuelos', items: [ITEMS.proyectos, ITEMS.ordenes, ITEMS.certificados, ITEMS.manifiestos] },
    { label: 'Comunidad', items: [ITEMS.ranking] },
    { label: 'Herramientas', items: BASE_TOOLS },
  ],
  TRANSPORT: [
    { label: 'Mi empresa', items: BASE_EMPRESA },
    { label: 'Rutas', items: [ITEMS.proyectos, ITEMS.ordenes, ITEMS.certificados] },
    { label: 'Comunidad', items: [ITEMS.ranking] },
    { label: 'Herramientas', items: BASE_TOOLS },
  ],
  LOGISTICS: [
    { label: 'Mi empresa', items: BASE_EMPRESA },
    { label: 'Logística', items: [ITEMS.proyectos, ITEMS.ordenes, ITEMS.certificados, ITEMS.manifiestos] },
    { label: 'Comunidad', items: [ITEMS.ranking] },
    { label: 'Herramientas', items: BASE_TOOLS },
  ],
  CORPORATE: [
    { label: 'Mi empresa', items: BASE_EMPRESA },
    { label: 'Compensaciones', items: [ITEMS.proyectos, ITEMS.ordenes, ITEMS.certificados] },
    { label: 'Comunidad', items: [ITEMS.ranking] },
    { label: 'Herramientas', items: BASE_TOOLS },
  ],
  EVENTS: [
    { label: 'Mi empresa', items: BASE_EMPRESA },
    { label: 'Eventos', items: [ITEMS.proyectos, ITEMS.ordenes, ITEMS.certificados, ITEMS.manifiestos] },
    { label: 'Comunidad', items: [ITEMS.ranking] },
    { label: 'Herramientas', items: BASE_TOOLS },
  ],
  OTHER: [
    { label: 'Mi empresa', items: BASE_EMPRESA },
    { label: 'Compensaciones', items: [ITEMS.proyectos, ITEMS.ordenes, ITEMS.certificados] },
    { label: 'Comunidad', items: [ITEMS.ranking] },
    { label: 'Herramientas', items: BASE_TOOLS },
  ],
};

const SETTINGS_ITEM: NavItem = { id: 'cuenta', label: 'Configuración', icon: Settings };

const TAB_LABELS: Record<string, string> = {
  panel: 'Resumen',
  dashboard: 'Tu perfil',
  documentos: 'Documentos',
  proyectos: 'Proyectos',
  ordenes: 'Órdenes',
  certificados: 'Certificados',
  manifiestos: 'Manifiestos de vuelos',
  calculadora: 'Calculadora de CO₂',
  asistente: 'Asistente IA',
  ranking: 'Ranking',
  cuenta: 'Configuración',
};

const VALID_TABS = new Set(Object.keys(TAB_LABELS));

const Sidebar: React.FC<{
  activeTab: string;
  onNav: (id: string) => void;
  sections: { label: string; items: NavItem[] }[];
  name: string;
  email?: string;
  company?: string;
  onLogout: () => void;
}> = ({ activeTab, onNav, sections, name, email, company, onLogout }) => {
  const itemCls = (active: boolean) =>
    cx(
      'relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium border-0 cursor-pointer transition-colors',
      active
        ? 'bg-white/10 text-white before:absolute before:-left-3 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r before:bg-[#3ED32B]'
        : 'bg-transparent text-[#c9d6d4] hover:bg-white/[0.06] hover:text-white',
    );
  return (
    <>
      <Link to="/b2b/dashboard" onClick={() => onNav('panel')} aria-label="Resumen" className="flex items-center h-16 px-5 border-b border-white/10 flex-shrink-0">
        <img src="/images/brand/logo-horizontal-white.svg" alt="CompensaTuViaje" className="h-8 w-auto" />
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5" aria-label="Panel de empresa">
        {sections.map((section) => (
          <div key={section.label} className="flex flex-col gap-0.5">
            <h3 className="m-0 px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#7f9996]">{section.label}</h3>
            {section.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNav(item.id)}
                aria-current={activeTab === item.id ? 'page' : undefined}
                className={itemCls(activeTab === item.id)}
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
                {item.tag && (
                  <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-[#c9d6d4]">{item.tag}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="flex-shrink-0 p-3 border-t border-white/10 flex flex-col gap-0.5">
        <div className="flex items-center gap-2.5 px-3 pt-1 pb-3 min-w-0">
          <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-[13px] font-semibold uppercase flex-shrink-0" aria-hidden="true">
            {(name || email || 'E').charAt(0)}
          </span>
          <span className="min-w-0 flex flex-col">
            <span className="text-[13px] font-semibold text-white truncate">{name}</span>
            <span className="text-xs text-[#7f9996] truncate">{company || email}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNav(SETTINGS_ITEM.id)}
          aria-current={activeTab === SETTINGS_ITEM.id ? 'page' : undefined}
          className={itemCls(activeTab === SETTINGS_ITEM.id)}
        >
          <Settings className="w-[18px] h-[18px]" aria-hidden="true" />
          <span>Configuración</span>
        </button>
        <button type="button" onClick={onLogout} className={itemCls(false)}>
          <LogOut className="w-[18px] h-[18px]" aria-hidden="true" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </>
  );
};

const B2BDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  // Mismo criterio que el resto de la plataforma: tema claro y espaciado de Tailwind activo.
  useForceLightTheme();
  useTailwindSpacing();

  // La pestaña vive en la URL (?tab=): al recargar o compartir el enlace se vuelve a la misma sección.
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab') || 'panel';
  const activeTab = VALID_TABS.has(requested) ? requested : 'panel';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const companyType = ((user?.companyType as CompanyType) && DASHBOARD_CONFIGS[user?.companyType as CompanyType]
    ? (user?.companyType as CompanyType)
    : 'OTHER');
  const sections = DASHBOARD_CONFIGS[companyType];

  const handleNav = (id: string) => {
    const next = new URLSearchParams(params);
    if (id === 'panel') next.delete('tab');
    else next.set('tab', id);
    setParams(next);
    setSidebarOpen(false);
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSidebarOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard': return <ProfileView onNavigate={handleNav} />;
      case 'documentos': return <DocumentsView />;
      case 'proyectos': return <ProjectsView onNavigateToOrders={() => handleNav('ordenes')} />;
      case 'ordenes': return <OrdersView onNavigate={handleNav} />;
      case 'certificados': return <CertificatesView onNavigate={handleNav} />;
      case 'manifiestos': return <ManifestView onNavigate={handleNav} />;
      case 'calculadora': return <CalculatorView onNavigate={handleNav} />;
      case 'asistente': return <AssistantView onNavigate={handleNav} />;
      case 'ranking': return <RankingView />;
      case 'cuenta': return <SettingsView />;
      default: return <DashboardPanelView onNavigate={handleNav} />;
    }
  };

  const name = user?.name || user?.email || 'Usuario';
  const sidebarProps = {
    activeTab,
    onNav: handleNav,
    sections,
    name,
    email: user?.email,
    company: user?.companyName,
    onLogout: () => logout(),
  };

  return (
    <div className="b2b-root min-h-screen w-full bg-[#f6f8f7] font-sans text-gray-900">
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 w-64 bg-[#0b2a2a]">
        <Sidebar {...sidebarProps} />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0b2a2a] flex flex-col" onClick={(e) => e.stopPropagation()} aria-label="Menú">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
              className="absolute top-4 right-3 w-8 h-8 rounded-lg border-0 bg-transparent text-[#c9d6d4] hover:bg-white/10 flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
            <Sidebar {...sidebarProps} />
          </aside>
        </div>
      )}

      <main className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
          <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú" className={cx(btn.icon, 'lg:hidden')}>
                <Menu className="w-[18px] h-[18px]" aria-hidden="true" />
              </button>
              <p className="m-0 text-sm text-gray-500 truncate">
                <span className="hidden sm:inline">{INDUSTRY_LABEL[companyType]}</span>
                <span className="hidden sm:inline mx-2 text-gray-300">/</span>
                <span className="font-semibold text-gray-900">{TAB_LABELS[activeTab]}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleNav('cuenta')}
              className="flex items-center gap-3 border-0 bg-transparent p-0 cursor-pointer min-w-0 text-left"
            >
              <span className="hidden sm:block min-w-0 text-right">
                <span className="block text-sm font-semibold text-gray-900 truncate">{user?.companyName || name}</span>
                <span className="block text-xs text-gray-500 truncate">{user?.companyName ? name : 'Empresa'}</span>
              </span>
              <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-[13px] font-semibold uppercase flex-shrink-0" aria-hidden="true">
                {name.charAt(0)}
              </span>
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <ViewBoundary resetKey={activeTab}>{renderActiveView()}</ViewBoundary>
        </div>
      </main>
    </div>
  );
};

export default B2BDashboard;
