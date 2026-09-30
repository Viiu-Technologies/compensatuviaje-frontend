import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { useForceLightTheme } from '../../../shared/utils/useForceLightTheme';
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
  Handshake,
  ClipboardCheck,
  Blocks,
  Settings,
  FileCheck,
  Package,
  Newspaper,
  Activity,
  Mail,
  Rss,
  type LucideIcon,
} from 'lucide-react';
import '../ui/admin-ui.css';

// ============================================
// NUEVA ESTRUCTURA DE NAVEGACIÓN - MODELO INBOX
// Organizado por Flujos de Trabajo en vez de Tecnologías
// ============================================

interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  end?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

// Antes el menú no tenía enlace a la vista general (y el logo no era un
// enlace): al salir del dashboard solo se volvía escribiendo la URL.
const overviewItems: NavItem[] = [
  { path: '/admin', icon: LayoutDashboard, label: 'Vista general', end: true },
];

// A. Centro de Auditoría (Inbox de Decisiones con IA)
const auditCenterItems: NavItem[] = [
  { path: '/admin/partners/kyb-evaluations', icon: FileCheck, label: 'Solicitudes KYB', end: true },
  { path: '/admin/proyectos-revision', icon: ClipboardCheck, label: 'Proyectos en Revisión' },
  { path: '/admin/noticias', icon: Newspaper, label: 'Noticias', end: true },
];

// B. Ecosistema de Oferta (Catálogo Activo)
const supplyEcosystemItems: NavItem[] = [
  { path: '/admin/partners', icon: Handshake, label: 'Impact Partners', end: true },
  { path: '/admin/proyectos', icon: TreePine, label: 'Proyectos ESG' },
];

// C. Ecosistema de Demanda
const demandEcosystemItems: NavItem[] = [
  { path: '/admin/empresas', icon: Building2, label: 'Empresas B2B' },
  { path: '/admin/ordenes-b2b', icon: Package, label: 'Órdenes B2B' },
  { path: '/admin/usuarios-b2c', icon: Users, label: 'Usuarios B2C' },
];

// D. Trazabilidad y Configuración
const traceabilityItems: NavItem[] = [
  { path: '/admin/reportes', icon: FileBarChart, label: 'Reportes' },
  { path: '/admin/nft-blockchain', icon: Blocks, label: 'NFT Blockchain' },
  { path: '/admin/noticias/fuentes', icon: Rss, label: 'Fuentes de Noticias' },
  { path: '/admin/noticias/boletin', icon: Mail, label: 'Boletín' },
  { path: '/admin/noticias/salud', icon: Activity, label: 'Salud de Noticias' },
  { path: '/admin/settings', icon: Settings, label: 'Configuración' },
];

const navSections: NavSection[] = [
  { items: overviewItems },
  { title: 'Centro de Auditoría', items: auditCenterItems },
  { title: 'Ecosistema de Oferta', items: supplyEcosystemItems },
  { title: 'Ecosistema de Demanda', items: demandEcosystemItems },
  { title: 'Trazabilidad', items: traceabilityItems },
];

/**
 * Sección e ítem del menú que corresponden a la ruta (el prefijo más largo).
 * A diferencia del menú, aquí `end` no impide que una página de detalle
 * (/admin/noticias/:id) herede la miga de su listado; solo la raíz /admin es exacta.
 */
function findCurrent(pathname: string) {
  let best: { section?: string; label: string; len: number } | null = null;
  for (const section of navSections) {
    for (const item of section.items) {
      const matches =
        pathname === item.path ||
        pathname === `${item.path}/` ||
        (item.path !== '/admin' && pathname.startsWith(`${item.path}/`));
      if (matches && (!best || item.path.length > best.len)) {
        best = { section: section.title, label: item.label, len: item.path.length };
      }
    }
  }
  return best;
}

const COLLAPSE_KEY = 'adminSidebarCollapsed';

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
};

interface SidebarProps {
  collapsed: boolean;
  email?: string;
  name?: string;
  onNavigate?: () => void;
  onToggle?: () => void;
  onLogout: () => void;
}

function Sidebar({ collapsed, email, name, onNavigate, onToggle, onLogout }: SidebarProps) {
  const initial = (name || email || 'A').charAt(0);
  return (
    <>
      <Link to="/admin" className="adm-side__brand" onClick={onNavigate} aria-label="Vista general">
        {collapsed ? (
          <img src="/images/brand/logo-icon.svg" alt="CompensaTuViaje" style={{ height: 28 }} />
        ) : (
          <img src="/images/brand/logo-horizontal-white.svg" alt="CompensaTuViaje" />
        )}
      </Link>

      <nav className="adm-side__nav" aria-label="Administración">
        {navSections.map((section, i) => (
          <div key={section.title ?? `s${i}`} className="adm-side__section">
            {section.title && !collapsed && <h3 className="adm-side__section-title">{section.title}</h3>}
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) => `adm-side__link${isActive ? ' adm-side__link--active' : ''}`}
              >
                <item.icon aria-hidden="true" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="adm-side__foot">
        <div className="adm-side__user" title={collapsed ? email : undefined}>
          <span className="adm-avatar" aria-hidden="true">{initial}</span>
          {!collapsed && (
            <span className="adm-side__user-text">
              <span className="adm-side__user-name">Superadministrador</span>
              <span className="adm-side__user-mail">{email}</span>
            </span>
          )}
        </div>
        {onToggle && (
          <button type="button" className="adm-side__action" onClick={onToggle} aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}>
            {collapsed ? <ChevronRight aria-hidden="true" /> : <ChevronLeft aria-hidden="true" />}
            {!collapsed && <span>Colapsar menú</span>}
          </button>
        )}
        <button type="button" className="adm-side__action" onClick={onLogout} title={collapsed ? 'Cerrar sesión' : undefined}>
          <LogOut aria-hidden="true" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </>
  );
}

export default function AdminLayout() {
  // El admin no tiene un modo oscuro completo: con el SO en oscuro, el texto
  // pasaba a claro sobre tarjetas que siguen blancas y los KPI no se veían.
  useForceLightTheme();
  // Se recuerda entre sesiones (antes volvía a abrirse al recargar).
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readCollapsed);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const current = findCurrent(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      } catch {
        /* sin almacenamiento: solo dura la sesión */
      }
      return next;
    });
  };

  return (
    <div className="adm adm-shell">
      <aside className={`adm-side${sidebarCollapsed ? ' adm-side--collapsed' : ''}`}>
        <Sidebar
          collapsed={sidebarCollapsed}
          email={user?.email}
          name={user?.name}
          onToggle={toggleSidebar}
          onLogout={handleLogout}
        />
      </aside>

      {mobileMenuOpen && (
        <div className="adm-drawer" onClick={() => setMobileMenuOpen(false)}>
          <aside className="adm-side" onClick={(e) => e.stopPropagation()} aria-label="Menú">
            <button type="button" className="adm-drawer__close" onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar menú">
              <X aria-hidden="true" />
            </button>
            <Sidebar
              collapsed={false}
              email={user?.email}
              name={user?.name}
              onNavigate={() => setMobileMenuOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      <main className={`adm-main${sidebarCollapsed ? ' adm-main--collapsed' : ''}`}>
        {/* Antes repetía "Panel de Administración" en todas las páginas;
            ahora dice dónde estás. */}
        <header className="adm-topbar">
          <button type="button" className="adm-topbar__menu" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menú">
            <Menu size={18} aria-hidden="true" />
          </button>
          <div className="adm-crumbs">
            <span>Administración</span>
            {current?.section && (
              <>
                <span aria-hidden="true">/</span>
                <span>{current.section}</span>
              </>
            )}
            {current && (
              <>
                <span aria-hidden="true">/</span>
                <b>{current.label}</b>
              </>
            )}
          </div>
        </header>

        <div className="adm-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
