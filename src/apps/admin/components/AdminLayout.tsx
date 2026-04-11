import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  TreePine, 
  FileBarChart,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Shield,
  Bell,
  CheckSquare,
  Handshake,
  ClipboardCheck,
  Blocks,
  Inbox,
  Settings,
  FileCheck,
  Package,
  RefreshCw
} from 'lucide-react';

// ============================================
// NUEVA ESTRUCTURA DE NAVEGACIÓN - MODELO INBOX
// Organizado por Flujos de Trabajo en vez de Tecnologías
// ============================================

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  end?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// A. Centro de Auditoría (Inbox de Decisiones con IA)
const auditCenterItems: NavItem[] = [
  { path: '/admin/partners/kyb-evaluations', icon: FileCheck, label: 'Solicitudes KYB', end: true },
  { path: '/admin/proyectos-revision', icon: ClipboardCheck, label: 'Proyectos en Revisión' },
];

// B. Ecosistema de Oferta (Catálogo Activo)
const supplyEcosystemItems: NavItem[] = [
  { path: '/admin/partners', icon: Handshake, label: 'Impact Partners', end: true },
  { path: '/admin/proyectos', icon: TreePine, label: 'Proyectos ESG' },
];

// C. Ecosistema de Demanda
const demandEcosystemItems: NavItem[] = [
  { path: '/admin/empresas', icon: Building2, label: 'Empresas B2B' },
  { path: '/admin/usuarios-b2c', icon: Users, label: 'Usuarios B2C' },
];

// D. Trazabilidad y Configuración
const traceabilityItems: NavItem[] = [
  { path: '/admin/reportes', icon: FileBarChart, label: 'Reportes' },
  { path: '/admin/nft-blockchain', icon: Blocks, label: 'NFT Blockchain' },
  { path: '/admin/settings', icon: Settings, label: 'Configuración' },
];

const navSections: NavSection[] = [
  { title: 'Centro de Auditoría', items: auditCenterItems },
  { title: 'Ecosistema de Oferta', items: supplyEcosystemItems },
  { title: 'Ecosistema de Demanda', items: demandEcosystemItems },
  { title: 'Trazabilidad', items: traceabilityItems },
];

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="!min-h-screen !bg-gradient-to-br !from-slate-50 !via-blue-50/30 !to-indigo-50/20 !flex !font-sans !w-full">
      {/* Sidebar Desktop */}
      <aside
        className={`!hidden lg:!flex !flex-col !h-screen !bg-gradient-to-b !from-slate-900 !via-slate-800 !to-slate-950 !shadow-2xl !fixed !left-0 !top-0 !z-50 !overflow-y-auto !transition-all !duration-300 ${
          sidebarCollapsed ? '!w-20' : '!w-72'
        }`}
      >
        {/* Logo Area */}
        <div className="!flex !items-center !justify-center !h-20 !px-6 !border-b !border-white/10 !flex-shrink-0">
          <img
            src="/images/brand/logo-horizontal-white.svg"
            alt="CompensaTuViaje"
            className={`!h-10 !w-auto !drop-shadow-lg !transition-all ${sidebarCollapsed ? '!hidden' : ''}`}
          />
          {sidebarCollapsed && (
            <img src="/images/brand/favicon.svg" alt="CompensaTuViaje" className="!h-9 !w-9 !drop-shadow-lg" />
          )}
        </div>
        
        {/* Admin Info */}
        <div className="!px-4 !py-4 !border-b !border-white/10">
          <div className={`!flex !items-center !gap-3 !p-4 !rounded-xl !bg-gradient-to-r !from-indigo-500/20 !to-purple-500/20 !border !border-indigo-400/30 !backdrop-blur-sm ${sidebarCollapsed ? '!justify-center' : ''}`}>
            <div className="!w-10 !h-10 !rounded-full !bg-gradient-to-br !from-amber-400 !to-orange-500 !flex !items-center !justify-center !text-white !font-bold !flex-shrink-0 !shadow-lg !shadow-amber-500/50">
              <Shield className="!w-5 !h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="!flex-1 !min-w-0">
                <p className="!text-sm !font-bold !text-white !truncate">SuperAdmin</p>
                <p className="!text-xs !text-indigo-300 !truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation - Organized by Sections */}
        <nav className="!flex-1 !px-4 !py-6 !space-y-6 !overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title}>
              {!sidebarCollapsed && (
                <h3 className="!px-4 !mb-2 !text-xs !font-semibold !text-slate-400 !uppercase !tracking-wider">
                  {section.title}
                </h3>
              )}
              <div className="!space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !transition-all !text-left !font-medium !border-0 !outline-none ${
                        isActive
                          ? '!bg-gradient-to-r !from-indigo-500 !to-purple-600 !text-white !shadow-lg !shadow-indigo-500/50'
                          : '!bg-transparent !text-slate-300 hover:!bg-white/10 hover:!text-white'
                      } ${sidebarCollapsed ? '!justify-center' : ''}`
                    }
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <item.icon className="!w-5 !h-5 !flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="!truncate">{item.label}</span>
                    )}
                    {!sidebarCollapsed && item.badge && (
                      <span className="!ml-auto !bg-red-500 !text-white !text-xs !rounded-full !px-2 !py-0.5">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="!mt-auto !px-4 !pb-6 !space-y-1 !flex-shrink-0 !border-t !border-white/10 !pt-4">
          <button
            onClick={toggleSidebar}
            className="!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !text-slate-300 hover:!bg-white/10 hover:!text-white !bg-transparent !border-0 !transition-all"
          >
            {sidebarCollapsed ? <ChevronRight className="!text-lg" /> : <ChevronLeft className="!text-lg" />}
            {!sidebarCollapsed && <span>Colapsar</span>}
          </button>
          <button 
            onClick={handleLogout}
            className="!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !text-red-400 hover:!bg-red-500/20 hover:!text-red-300 !bg-transparent !border-0 !transition-all"
          >
            <LogOut className="!text-lg" /> {!sidebarCollapsed && 'Cerrar Sesión'}
          </button>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      {mobileMenuOpen && (
        <div className="!fixed !inset-0 !z-[60] !bg-black/60 !backdrop-blur-sm lg:!hidden" onClick={() => setMobileMenuOpen(false)}>
          <aside className="!fixed !left-0 !top-0 !h-full !w-72 !bg-gradient-to-b !from-slate-900 !via-slate-800 !to-slate-950 !shadow-2xl !flex !flex-col">
            <div className="!flex !items-center !justify-center !h-20 !px-6 !border-b !border-white/10">
              <img src="/images/brand/logo-horizontal-white.svg" alt="CompensaTuViaje" className="!h-10 !w-auto" />
            </div>
            
            <div className="!px-4 !py-4 !border-b !border-white/10">
              <div className="!flex !items-center !gap-3 !p-4 !rounded-xl !bg-gradient-to-r !from-indigo-500/20 !to-purple-500/20 !border !border-indigo-400/30">
                <div className="!w-12 !h-12 !rounded-full !bg-gradient-to-br !from-amber-400 !to-orange-500 !flex !items-center !justify-center !text-white !font-bold !shadow-lg">
                  <Shield className="!w-6 !h-6" />
                </div>
                <div className="!flex-1 !min-w-0">
                  <p className="!text-sm !font-bold !text-white">SuperAdmin</p>
                  <p className="!text-xs !text-indigo-300 !truncate">{user?.email}</p>
                </div>
              </div>
            </div>
            
            <nav className="!flex-1 !px-4 !py-6 !space-y-6 !overflow-y-auto">
              {navSections.map((section) => (
                <div key={section.title}>
                  <h3 className="!px-4 !mb-2 !text-xs !font-semibold !text-slate-400 !uppercase !tracking-wider">
                    {section.title}
                  </h3>
                  <div className="!space-y-1">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !transition-all !text-left !font-medium !border-0 ${
                            isActive ? '!bg-gradient-to-r !from-indigo-500 !to-purple-600 !text-white !shadow-lg' : '!text-slate-300 hover:!bg-white/10'
                          }`
                        }
                      >
                        <item.icon className="!w-5 !h-5" />
                        {item.label}
                        {item.badge && (
                          <span className="!ml-auto !bg-red-500 !text-white !text-xs !rounded-full !px-2 !py-0.5">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
            <button className="!absolute !top-4 !right-4 !text-white/60 !text-2xl !border-0 !bg-transparent" onClick={() => setMobileMenuOpen(false)}>×</button>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className={`!flex-1 !min-h-screen !transition-all !duration-300 !w-full ${sidebarCollapsed ? 'lg:!ml-20' : 'lg:!ml-72'}`}>
        {/* Header */}
        <header className="!bg-white/90 !backdrop-blur-md !border-b !border-slate-200 !sticky !top-0 !z-40">
          <div className="!max-w-7xl !mx-auto !px-6 !py-4">
            <div className="!flex !items-center !justify-between">
              <div className="!flex !items-center !gap-4">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:!hidden !p-2 !rounded-lg !bg-slate-200 !text-slate-700 !border-0"
                >
                  <Menu className="!w-6 !h-6" />
                </button>
                <div>
                  <h1 className="!text-2xl !font-bold !text-slate-900 !flex !items-center !gap-2">
                    <Shield className="!text-indigo-600" />
                    Panel de Administración
                  </h1>
                  <p className="!text-sm !text-slate-500 !mt-1">Gestión completa de la plataforma</p>
                </div>
              </div>

              <div className="!flex !items-center !gap-3">
                <button className="!relative !p-2.5 !rounded-full !bg-slate-100 hover:!bg-slate-200 !transition-colors !border-0">
                  <Bell className="!w-5 !h-5 !text-slate-600" />
                  <span className="!absolute !top-1 !right-1 !w-2.5 !h-2.5 !bg-red-500 !rounded-full !border-2 !border-white"></span>
                </button>
                <div className="!hidden sm:!flex !items-center !gap-3 !pl-3 !border-l !border-slate-200">
                  <div className="!text-right">
                    <p className="!text-sm !font-bold !text-slate-900">{user?.name || 'Admin'}</p>
                    <p className="!text-xs !text-slate-500">SuperAdmin</p>
                  </div>
                  <div className="!w-10 !h-10 !rounded-full !bg-indigo-100 !text-indigo-700 !flex !items-center !justify-center !font-bold">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="!max-w-7xl !mx-auto !px-6 !py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
