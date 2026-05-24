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

// â”€â”€â”€ Decorative SVG backgrounds per industry â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SvgPlane: React.FC = () => (
  <svg aria-hidden="true" className="!absolute !inset-0 !w-full !h-full !pointer-events-none !overflow-hidden" viewBox="0 0 200 600" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.035 }}>
    <path d="M100 40 L170 200 L200 190 L150 240 L170 440 L100 400 L30 440 L50 240 L0 190 L30 200Z" fill="white" opacity="0.6" transform="scale(0.5) translate(100,80)" />
    <circle cx="170" cy="480" r="44" stroke="white" strokeWidth="1.5" fill="none" opacity="0.4" />
    <circle cx="28" cy="100" r="27" stroke="white" strokeWidth="1" fill="none" opacity="0.3" />
    <path d="M18 320 Q60 298 100 318 Q140 338 182 318" stroke="white" strokeWidth="1.5" fill="none" opacity="0.45" />
    <path d="M8 355 Q60 334 100 354 Q140 374 192 354" stroke="white" strokeWidth="1" fill="none" opacity="0.25" />
  </svg>
);
const SvgRoute: React.FC = () => (
  <svg aria-hidden="true" className="!absolute !inset-0 !w-full !h-full !pointer-events-none" viewBox="0 0 200 600" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.035 }}>
    <path d="M100 0 L100 600" stroke="white" strokeWidth="2" strokeDasharray="14 8" opacity="0.5" />
    <path d="M48 0 L48 600" stroke="white" strokeWidth="1" strokeDasharray="6 12" opacity="0.25" />
    <path d="M152 0 L152 600" stroke="white" strokeWidth="1" strokeDasharray="6 12" opacity="0.25" />
    <rect x="28" y="178" width="144" height="66" rx="9" fill="white" opacity="0.38" />
    <rect x="144" y="194" width="56" height="50" rx="5" fill="white" opacity="0.28" />
    <circle cx="54" cy="260" r="20" fill="white" opacity="0.38" />
    <circle cx="162" cy="260" r="20" fill="white" opacity="0.38" />
    <path d="M0 400 L200 400 M0 460 L200 460" stroke="white" strokeWidth="1.5" opacity="0.25" />
  </svg>
);
const SvgBox: React.FC = () => (
  <svg aria-hidden="true" className="!absolute !inset-0 !w-full !h-full !pointer-events-none" viewBox="0 0 200 600" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.035 }}>
    <rect x="50" y="140" width="100" height="88" fill="white" opacity="0.4" />
    <path d="M50 140 L100 110 L150 140" fill="white" opacity="0.5" />
    <path d="M100 110 L100 228" stroke="white" strokeWidth="1.5" opacity="0.5" />
    <path d="M50 140 L50 228 M150 140 L150 228" stroke="white" strokeWidth="0.75" opacity="0.3" />
    <rect x="14" y="315" width="74" height="65" rx="3" fill="white" opacity="0.3" />
    <rect x="112" y="335" width="74" height="65" rx="3" fill="white" opacity="0.3" />
    <path d="M10 445 Q100 408 190 445" stroke="white" strokeWidth="1.2" fill="none" opacity="0.3" />
  </svg>
);
const SvgBriefcase: React.FC = () => (
  <svg aria-hidden="true" className="!absolute !inset-0 !w-full !h-full !pointer-events-none" viewBox="0 0 200 600" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.035 }}>
    <rect x="24" y="174" width="152" height="108" rx="12" fill="white" opacity="0.4" />
    <path d="M68 174 L68 154 Q68 143 78 143 L122 143 Q132 143 132 154 L132 174" stroke="white" strokeWidth="2" fill="none" opacity="0.5" />
    <path d="M24 228 L176 228" stroke="white" strokeWidth="1.5" opacity="0.5" />
    <circle cx="100" cy="228" r="9" fill="white" opacity="0.5" />
    <rect x="44" y="352" width="112" height="7" rx="3.5" fill="white" opacity="0.4" />
    <rect x="56" y="372" width="88" height="7" rx="3.5" fill="white" opacity="0.32" />
    <rect x="68" y="392" width="64" height="7" rx="3.5" fill="white" opacity="0.24" />
    <rect x="64" y="452" width="72" height="52" rx="7" fill="white" opacity="0.18" />
  </svg>
);
const SvgStar: React.FC = () => (
  <svg aria-hidden="true" className="!absolute !inset-0 !w-full !h-full !pointer-events-none" viewBox="0 0 200 600" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.038 }}>
    <polygon points="100,52 114,96 160,96 124,120 138,164 100,140 62,164 76,120 40,96 86,96" fill="white" opacity="0.5" />
    <polygon points="36,296 43,316 64,316 48,328 54,348 36,336 18,348 24,328 8,316 29,316" fill="white" opacity="0.4" />
    <polygon points="164,192 169,208 186,208 173,218 178,234 164,224 150,234 155,218 142,208 159,208" fill="white" opacity="0.32" />
    <circle cx="100" cy="462" r="56" stroke="white" strokeWidth="1.5" fill="none" opacity="0.28" />
    <circle cx="100" cy="462" r="36" stroke="white" strokeWidth="1" fill="none" opacity="0.18" />
  </svg>
);
const SvgLeaf: React.FC = () => (
  <svg aria-hidden="true" className="!absolute !inset-0 !w-full !h-full !pointer-events-none" viewBox="0 0 200 600" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.035 }}>
    <path d="M100 88 Q168 160 148 268 Q128 362 100 378 Q72 362 52 268 Q32 160 100 88Z" fill="white" opacity="0.44" />
    <path d="M100 88 L100 378" stroke="white" strokeWidth="2" opacity="0.4" />
    <path d="M100 196 Q136 210 148 234" stroke="white" strokeWidth="1.5" fill="none" opacity="0.34" />
    <path d="M100 196 Q64 210 52 234" stroke="white" strokeWidth="1.5" fill="none" opacity="0.34" />
    <path d="M100 268 Q126 278 136 296" stroke="white" strokeWidth="1.5" fill="none" opacity="0.28" />
    <path d="M100 268 Q74 278 64 296" stroke="white" strokeWidth="1.5" fill="none" opacity="0.28" />
  </svg>
);

// â”€â”€â”€ Theme System â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface CompanyTheme {
  sidebarFrom: string;
  sidebarVia:  string;
  sidebarTo:   string;
  activeGrad:  string;
  activeShadow: string;
  pillFrom:    string;
  pillTo:      string;
  pillBorder:  string;
  avatarFrom:  string;
  avatarTo:    string;
  avatarGlow:  string;
  emailTint:   string;
  accentHex:   string;
  BgSvg:       React.FC;
}

export const COMPANY_THEMES: Record<CompanyType, CompanyTheme> = {
  TRAVEL_AGENCY: {
    sidebarFrom: '#050d1a', sidebarVia: '#081628', sidebarTo: '#050d1a',
    activeGrad: '!from-sky-500 !to-blue-600', activeShadow: '!shadow-sky-500/30',
    pillFrom: 'rgba(14,165,233,0.12)', pillTo: 'rgba(37,99,235,0.12)', pillBorder: 'rgba(56,189,248,0.22)',
    avatarFrom: '#38bdf8', avatarTo: '#2563eb', avatarGlow: '!shadow-sky-500/35',
    emailTint: '!text-sky-400/75', accentHex: '#0ea5e9', BgSvg: SvgPlane,
  },
  TRANSPORT: {
    sidebarFrom: '#1a0e00', sidebarVia: '#231200', sidebarTo: '#1a0e00',
    activeGrad: '!from-amber-500 !to-orange-600', activeShadow: '!shadow-amber-500/30',
    pillFrom: 'rgba(245,158,11,0.12)', pillTo: 'rgba(234,88,12,0.12)', pillBorder: 'rgba(251,191,36,0.22)',
    avatarFrom: '#fbbf24', avatarTo: '#ea580c', avatarGlow: '!shadow-amber-500/35',
    emailTint: '!text-amber-400/75', accentHex: '#f59e0b', BgSvg: SvgRoute,
  },
  LOGISTICS: {
    sidebarFrom: '#001118', sidebarVia: '#001d28', sidebarTo: '#001118',
    activeGrad: '!from-teal-500 !to-cyan-600', activeShadow: '!shadow-teal-500/30',
    pillFrom: 'rgba(20,184,166,0.12)', pillTo: 'rgba(8,145,178,0.12)', pillBorder: 'rgba(45,212,191,0.22)',
    avatarFrom: '#2dd4bf', avatarTo: '#0891b2', avatarGlow: '!shadow-teal-500/35',
    emailTint: '!text-teal-400/75', accentHex: '#14b8a6', BgSvg: SvgBox,
  },
  CORPORATE: {
    sidebarFrom: '#0e081a', sidebarVia: '#150c24', sidebarTo: '#0e081a',
    activeGrad: '!from-violet-500 !to-purple-600', activeShadow: '!shadow-violet-500/30',
    pillFrom: 'rgba(139,92,246,0.12)', pillTo: 'rgba(147,51,234,0.12)', pillBorder: 'rgba(167,139,250,0.22)',
    avatarFrom: '#a78bfa', avatarTo: '#9333ea', avatarGlow: '!shadow-violet-500/35',
    emailTint: '!text-violet-400/75', accentHex: '#8b5cf6', BgSvg: SvgBriefcase,
  },
  EVENTS: {
    sidebarFrom: '#180a10', sidebarVia: '#22101a', sidebarTo: '#180a10',
    activeGrad: '!from-rose-500 !to-pink-600', activeShadow: '!shadow-rose-500/30',
    pillFrom: 'rgba(244,63,94,0.12)', pillTo: 'rgba(219,39,119,0.12)', pillBorder: 'rgba(251,113,133,0.22)',
    avatarFrom: '#fb7185', avatarTo: '#db2777', avatarGlow: '!shadow-rose-500/35',
    emailTint: '!text-rose-400/75', accentHex: '#f43f5e', BgSvg: SvgStar,
  },
  OTHER: {
    sidebarFrom: '#0d1117', sidebarVia: '#111827', sidebarTo: '#0d1117',
    activeGrad: '!from-green-500 !to-emerald-600', activeShadow: '!shadow-green-500/30',
    pillFrom: 'rgba(16,185,129,0.15)', pillTo: 'rgba(5,150,105,0.15)', pillBorder: 'rgba(52,211,153,0.25)',
    avatarFrom: '#34d399', avatarTo: '#059669', avatarGlow: '!shadow-green-500/35',
    emailTint: '!text-green-400/75', accentHex: '#10b981', BgSvg: SvgLeaf,
  },
};

// â”€â”€â”€ Nav items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ITEMS = {
  perfil:       { id: 'dashboard',    label: 'Tu Perfil',              icon: User },
  panel:        { id: 'panel',        label: 'Panel Principal',         icon: BarChart3 },
  documentos:   { id: 'documentos',   label: 'Documentos',              icon: FileText },
  proyectos:    { id: 'proyectos',    label: 'Proyectos ESG',           icon: Trees },
  ordenes:      { id: 'ordenes',      label: 'Mis Ã“rdenes',             icon: Package },
  certificados: { id: 'certificados', label: 'BÃ³veda de Certificados',  icon: ShieldCheck },
  manifiestos:  { id: 'manifiestos',  label: 'Manifiestos de Vuelos',   icon: FileUp },
  calculadora:  { id: 'calculadora',  label: 'Calculadora COâ‚‚',         icon: Calculator },
  asistente:    { id: 'asistente',    label: 'Asistente IA',            icon: Bot },
} as const;

const BASE_EMPRESA = [ITEMS.perfil, ITEMS.panel, ITEMS.documentos];
const BASE_TOOLS   = [ITEMS.calculadora, ITEMS.asistente];

const DASHBOARD_CONFIGS: Record<CompanyType, { label: string; items: typeof ITEMS[keyof typeof ITEMS][] }[]> = {
  TRAVEL_AGENCY: [
    { label: 'MI EMPRESA',   items: BASE_EMPRESA },
    { label: 'VUELOS',       items: [ITEMS.proyectos, ITEMS.ordenes, ITEMS.certificados, ITEMS.manifiestos] },
    { label: 'HERRAMIENTAS', items: BASE_TOOLS },
  ],
  TRANSPORT: [
    { label: 'MI EMPRESA',   items: BASE_EMPRESA },
    { label: 'RUTAS',        items: [ITEMS.proyectos, ITEMS.ordenes, ITEMS.certificados] },
    { label: 'HERRAMIENTAS', items: BASE_TOOLS },
  ],
  LOGISTICS: [
    { label: 'MI EMPRESA',   items: BASE_EMPRESA },
    { label: 'LOGÃSTICA',    items: [ITEMS.proyectos, ITEMS.ordenes, ITEMS.certificados, ITEMS.manifiestos] },
    { label: 'HERRAMIENTAS', items: BASE_TOOLS },
  ],
  CORPORATE: [
    { label: 'MI EMPRESA',     items: BASE_EMPRESA },
    { label: 'COMPENSACIONES', items: [ITEMS.proyectos, ITEMS.ordenes, ITEMS.certificados] },
    { label: 'HERRAMIENTAS',   items: BASE_TOOLS },
  ],
  EVENTS: [
    { label: 'MI EMPRESA',   items: BASE_EMPRESA },
    { label: 'EVENTOS',      items: [ITEMS.proyectos, ITEMS.ordenes, ITEMS.certificados, ITEMS.manifiestos] },
    { label: 'HERRAMIENTAS', items: BASE_TOOLS },
  ],
  OTHER: [
    { label: 'MI EMPRESA',     items: BASE_EMPRESA },
    { label: 'COMPENSACIONES', items: [ITEMS.proyectos, ITEMS.ordenes, ITEMS.certificados] },
    { label: 'HERRAMIENTAS',   items: BASE_TOOLS },
  ],
};

const BOTTOM_ITEM = { id: 'cuenta', label: 'ConfiguraciÃ³n', icon: Settings };

const TAB_LABELS: Record<string, string> = {
  dashboard:    'Tu Perfil',
  panel:        'Panel Principal',
  documentos:   'Documentos',
  proyectos:    'Proyectos ESG',
  ordenes:      'Mis Ã“rdenes',
  certificados: 'BÃ³veda de Certificados',
  manifiestos:  'Manifiestos de Vuelos',
  calculadora:  'Calculadora COâ‚‚',
  asistente:    'Asistente IA',
  cuenta:       'ConfiguraciÃ³n',
};

// â”€â”€â”€ SidebarContent â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface SidebarContentProps {
  activeTab:   string;
  onNav:       (id: string) => void;
  user:        any;
  onLogout:    () => void;
  navSections: { label: string; items: { id: string; label: string; icon: React.ElementType }[] }[];
  theme:       CompanyTheme;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  activeTab, onNav, user, onLogout, navSections, theme,
}) => (
  <>
    {/* Logo */}
    <div className="!flex !items-center !justify-center !h-20 !px-6 !border-b !border-white/10 !flex-shrink-0">
      <img src="/images/brand/logo-horizontal-white.svg" alt="CompensaTuViaje" className="!h-10 !w-auto !drop-shadow-lg" />
    </div>

    {/* User pill */}
    <div className="!px-4 !py-4 !border-b !border-white/10 !flex-shrink-0">
      <div
        className="!flex !items-center !gap-3 !p-3 !rounded-xl !border"
        style={{ background: `linear-gradient(to right, ${theme.pillFrom}, ${theme.pillTo})`, borderColor: theme.pillBorder }}
      >
        <div
          className={`!w-9 !h-9 !rounded-full !flex !items-center !justify-center !text-white !font-bold !flex-shrink-0 !text-sm !shadow-lg ${theme.avatarGlow}`}
          style={{ background: `linear-gradient(135deg, ${theme.avatarFrom}, ${theme.avatarTo})` }}
        >
          {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="!flex-1 !min-w-0">
          <p className="!text-xs !font-semibold !text-white !truncate">{user?.name || user?.email || 'Usuario'}</p>
          <p className={`!text-[10px] ${theme.emailTint} !truncate`}>{user?.email || ''}</p>
        </div>
      </div>
    </div>

    {/* Nav sections */}
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

    {/* Footer */}
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
        <span>Cerrar SesiÃ³n</span>
      </button>
    </div>
  </>
);

// â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  const { BgSvg }   = theme;

  // GSAP: stagger sidebar nav items on initial mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-nav-item]',
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, stagger: 0.04, duration: 0.42, ease: 'power2.out', delay: 0.3 },
      );
    }, sidebarRef);
    return () => ctx.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // GSAP: fade + slide content on tab change
  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' },
    );
  }, [activeTab]);

  const handleNav    = (id: string) => { setActiveTab(id); setSidebarOpen(false); };
  const handleLogout = () => logout();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':    return <ProfileView />;
      case 'panel':        return <DashboardPanelView />;
      case 'documentos':   return <DocumentsView />;
      case 'proyectos':    return <ProjectsView onNavigateToOrders={() => setActiveTab('ordenes')} />;
      case 'ordenes':      return <OrdersView />;
      case 'certificados': return <CertificatesView />;
      case 'manifiestos':  return <ManifestView />;
      case 'calculadora':  return <CalculatorView />;
      case 'asistente':    return <AssistantView />;
      case 'cuenta':       return <SettingsView />;
      default:             return <DashboardPanelView />;
    }
  };

  const sidebarStyle = {
    background: `linear-gradient(to bottom, ${theme.sidebarFrom}, ${theme.sidebarVia}, ${theme.sidebarTo})`,
  };

  return (
    <div className={`!min-h-screen !flex !font-sans !w-full !box-border !transition-colors !duration-200 ${
      isDark
        ? '!bg-gradient-to-br !from-gray-900 !via-gray-900 !to-gray-800 !text-gray-100'
        : '!bg-gradient-to-br !from-gray-50 !via-blue-50/30 !to-green-50/20 !text-gray-800'
    }`}>

      {/* â”€â”€ SIDEBAR DESKTOP â”€â”€ */}
      <aside
        ref={sidebarRef}
        className="!hidden lg:!flex !flex-col !w-64 !h-screen !shadow-2xl !fixed !left-0 !top-0 !z-50 !overflow-hidden"
        style={sidebarStyle}
      >
        <BgSvg />
        <div className="!relative !z-10 !flex !flex-col !h-full">
          <SidebarContent activeTab={activeTab} onNav={handleNav} user={user} onLogout={handleLogout} navSections={navSections} theme={theme} />
        </div>
      </aside>

      {/* â”€â”€ SIDEBAR MOBILE (DRAWER) â”€â”€ */}
      {sidebarOpen && (
        <div
          className="!fixed !inset-0 !z-[60] !bg-black/60 !backdrop-blur-sm lg:!hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="!fixed !left-0 !top-0 !h-full !w-64 !shadow-2xl !flex !flex-col !z-[70] !overflow-hidden"
            style={sidebarStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <BgSvg />
            <div className="!relative !z-10 !flex !flex-col !h-full">
              <SidebarContent activeTab={activeTab} onNav={handleNav} user={user} onLogout={handleLogout} navSections={navSections} theme={theme} />
            </div>
            <button
              className="!absolute !top-4 !right-4 !text-white/50 hover:!text-white !border-0 !bg-transparent !p-1 !z-[80]"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="!w-5 !h-5" />
            </button>
          </aside>
        </div>
      )}

      {/* â”€â”€ MAIN CONTENT â”€â”€ */}
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
            style={{ background: `linear-gradient(to right, ${theme.accentHex}, ${theme.accentHex}50, transparent)` }}
          />
          <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-3.5">
            <div className="!flex !items-center !justify-between">
              <div className="!flex !items-center !gap-3">
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
                  className="!p-2 !rounded-lg !transition-colors !border-0"
                  style={activeTab === 'cuenta' ? { backgroundColor: `${theme.accentHex}25`, color: theme.accentHex } : {}}
                >
                  <Settings className={`!w-4.5 !h-4.5 ${
                    activeTab !== 'cuenta' ? (isDark ? '!text-gray-400' : '!text-gray-500') : ''
                  }`} />
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
