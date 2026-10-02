// ============================================
// PARTNER LAYOUT
// Barra lateral petróleo (como el admin) y cabecera con la sección actual.
//
// ARQUITECTURA DOBLE CANDADO:
// - Sin perfil completo: solo Dashboard y Mi Perfil
// - Sin KYB aprobado por el admin: Proyectos bloqueados
// ============================================

import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Plus,
  Shield,
  ShieldAlert,
  UserCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { usePartnerContext } from '../context/PartnerContext';
import { useForceLightTheme } from '../../../shared/utils/useForceLightTheme';
import { useTailwindSpacing } from '../../../shared/utils/useTailwindSpacing';
import { btn, cx } from '../ui';

const COLLAPSE_KEY = 'partnerSidebarCollapsed';

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
};

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  end?: boolean;
  attention?: boolean;
  locked?: boolean;
  lockedMessage?: string;
}

/** Logo del partner en un cuadro blanco (los logos horizontales no caben en un círculo). */
const PartnerLogo: React.FC<{ url?: string | null; name?: string; size?: 'sm' | 'md' }> = ({ url, size = 'md' }) => {
  const box = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  return url ? (
    <span className={cx(box, 'rounded-lg bg-white flex items-center justify-center flex-shrink-0 overflow-hidden p-1')}>
      <img src={url} alt="" className="max-w-full max-h-full object-contain" />
    </span>
  ) : (
    <span className={cx(box, 'rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0')}>
      <Building2 className="w-4 h-4" aria-hidden="true" />
    </span>
  );
};

const Sidebar: React.FC<{
  collapsed: boolean;
  items: NavItem[];
  canCreate: boolean;
  name: string;
  email?: string;
  logoUrl?: string | null;
  onNavigate?: () => void;
  onToggle?: () => void;
  onLogout: () => void;
}> = ({ collapsed, items, canCreate, name, email, logoUrl, onNavigate, onToggle, onLogout }) => {
  const linkBase = cx(
    'relative flex items-center gap-3 rounded-lg text-sm font-medium no-underline transition-colors',
    collapsed ? 'justify-center py-2.5' : 'px-3 py-2',
  );
  return (
    <>
      <Link
        to="/partner"
        onClick={onNavigate}
        aria-label="Inicio del portal"
        className={cx('flex items-center h-16 border-b border-white/10 flex-shrink-0', collapsed ? 'justify-center' : 'px-5')}
      >
        {collapsed ? (
          <img src="/images/brand/logo-icon.svg" alt="CompensaTuViaje" className="h-7 w-auto" />
        ) : (
          <img src="/images/brand/logo-horizontal-white.svg" alt="CompensaTuViaje" className="h-8 w-auto" />
        )}
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5" aria-label="Portal de partners">
        {items.map((item) =>
          item.locked ? (
            <div
              key={item.path}
              className={cx(linkBase, 'text-[#7f9996] cursor-not-allowed')}
              title={item.lockedMessage}
              aria-disabled="true"
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" aria-hidden="true" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && <Lock className="ml-auto w-3.5 h-3.5" aria-label="Bloqueado" />}
            </div>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cx(
                  linkBase,
                  isActive
                    ? 'bg-white/10 text-white before:absolute before:-left-3 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r before:bg-[#3ED32B]'
                    : 'text-[#c9d6d4] hover:bg-white/[0.06] hover:text-white',
                )
              }
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" aria-hidden="true" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {item.attention && (
                <span
                  className={cx('w-2 h-2 rounded-full bg-amber-400', collapsed ? 'absolute top-1.5 right-3' : 'ml-auto')}
                  aria-label="Requiere atención"
                />
              )}
            </NavLink>
          ),
        )}

        <div className="mt-4 pt-4 border-t border-white/10">
          {canCreate ? (
            <Link
              to="/partner/projects/create"
              onClick={onNavigate}
              title={collapsed ? 'Nuevo proyecto' : undefined}
              className={cx(
                'flex items-center justify-center gap-2 rounded-lg border border-white/20 text-sm font-semibold text-white no-underline hover:bg-white/[0.06] transition-colors',
                collapsed ? 'py-2.5' : 'px-3 py-2',
              )}
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              {!collapsed && 'Nuevo proyecto'}
            </Link>
          ) : (
            !collapsed && (
              <p className="m-0 px-3 text-xs text-[#7f9996]">
                Podrás crear proyectos cuando tu verificación KYB esté aprobada.
              </p>
            )
          )}
        </div>
      </nav>

      <div className="flex-shrink-0 p-3 border-t border-white/10 flex flex-col gap-0.5">
        <div className={cx('flex items-center gap-2.5 pb-3 pt-1 min-w-0', collapsed ? 'justify-center' : 'px-3')} title={collapsed ? name : undefined}>
          <PartnerLogo url={logoUrl} name={name} size="sm" />
          {!collapsed && (
            <span className="min-w-0 flex flex-col">
              <span className="text-[13px] font-semibold text-white truncate">{name}</span>
              {email && <span className="text-xs text-[#7f9996] truncate">{email}</span>}
            </span>
          )}
        </div>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            className={cx(linkBase, 'w-full border-0 bg-transparent cursor-pointer text-[#c9d6d4] hover:bg-white/[0.06] hover:text-white')}
          >
            {collapsed ? <ChevronRight className="w-[18px] h-[18px]" aria-hidden="true" /> : <ChevronLeft className="w-[18px] h-[18px]" aria-hidden="true" />}
            {!collapsed && <span>Colapsar menú</span>}
          </button>
        )}
        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? 'Cerrar sesión' : undefined}
          className={cx(linkBase, 'w-full border-0 bg-transparent cursor-pointer text-[#c9d6d4] hover:bg-white/[0.06] hover:text-white')}
        >
          <LogOut className="w-[18px] h-[18px]" aria-hidden="true" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </>
  );
};

/** Nombre de la sección para la cabecera. */
const sectionOf = (path: string) => {
  if (path.startsWith('/partner/projects')) return 'Mis proyectos';
  if (path.startsWith('/partner/kyb')) return 'Verificación KYB';
  if (path.startsWith('/partner/profile')) return 'Mi perfil';
  return 'Resumen';
};

const PartnerLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readCollapsed);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, onboarding, kybStatus, isDataLoaded, isProfileComplete, isKybVerified } = usePartnerContext();
  // El modo oscuro del portal dejaba texto blanco sobre tarjetas blancas; se
  // fuerza el tema claro, como en el admin y el área de usuarios.
  useForceLightTheme();
  // Activa las utilidades de espaciado sin "!" (el reset global las anulaba).
  useTailwindSpacing();

  // Candados: redirige si se entra por URL a una sección bloqueada.
  useEffect(() => {
    if (!isDataLoaded) return;
    if (!isProfileComplete) {
      if (location.pathname.includes('/partner/kyb') || location.pathname.includes('/partner/projects')) {
        navigate('/partner/profile', { replace: true });
      }
    } else if (!isKybVerified && location.pathname.includes('/partner/projects')) {
      navigate('/partner/kyb', { replace: true });
    }
  }, [profile, onboarding, kybStatus, isProfileComplete, isKybVerified, location.pathname, navigate, isDataLoaded]);

  // El menú móvil se cierra con Escape.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
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

  const navItems: NavItem[] = [
    { path: '/partner', icon: LayoutDashboard, label: 'Resumen', end: true },
    { path: '/partner/profile', icon: UserCircle, label: 'Mi perfil', attention: !isProfileComplete },
    {
      path: '/partner/kyb',
      icon: Shield,
      label: 'Verificación KYB',
      attention: isProfileComplete && !isKybVerified,
      locked: !isProfileComplete,
      lockedMessage: 'Completa tu perfil para habilitar la verificación KYB',
    },
    {
      path: '/partner/projects',
      icon: FolderKanban,
      label: 'Mis proyectos',
      locked: !isKybVerified,
      lockedMessage: !isProfileComplete
        ? 'Completa tu perfil y la verificación KYB para acceder'
        : 'La verificación KYB debe ser aprobada por un administrador',
    },
  ];

  const name = profile?.name || user?.name || 'Partner';
  const email = profile?.contact_email || user?.email;
  const sidebarProps = { items: navItems, canCreate: isKybVerified, name, email, logoUrl: profile?.logo_url, onLogout: handleLogout };

  return (
    <div className="ptr-root min-h-screen w-full bg-[#f6f8f7] font-sans text-gray-900">
      <aside
        className={cx(
          'hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 bg-[#0b2a2a] transition-[width] duration-200',
          sidebarCollapsed ? 'w-[72px]' : 'w-64',
        )}
      >
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} {...sidebarProps} />
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <aside
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0b2a2a] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            aria-label="Menú"
          >
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Cerrar menú"
              className="absolute top-4 right-3 w-8 h-8 rounded-lg border-0 bg-transparent text-[#c9d6d4] hover:bg-white/10 flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
            <Sidebar collapsed={false} onNavigate={() => setMobileMenuOpen(false)} {...sidebarProps} />
          </aside>
        </div>
      )}

      <main className={cx('min-h-screen transition-[margin] duration-200', sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64')}>
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
          <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menú"
                className={cx(btn.icon, 'lg:hidden')}
              >
                <Menu className="w-[18px] h-[18px]" aria-hidden="true" />
              </button>
              <p className="m-0 text-sm text-gray-500 truncate">
                <span className="hidden sm:inline">Portal de partners</span>
                <span className="hidden sm:inline mx-2 text-gray-300">/</span>
                <span className="font-semibold text-gray-900">{sectionOf(location.pathname)}</span>
              </p>
            </div>
            <Link to="/partner/profile" className="flex items-center gap-3 no-underline min-w-0">
              <span className="hidden sm:block text-right min-w-0">
                <span className="block text-sm font-semibold text-gray-900 truncate">{name}</span>
                <span className="block text-xs text-gray-500">Impact Partner</span>
              </span>
              <span className="rounded-lg border border-gray-200">
                <PartnerLogo url={profile?.logo_url} name={name} size="sm" />
              </span>
            </Link>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {isProfileComplete && !isKybVerified && !location.pathname.startsWith('/partner/kyb') && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="m-0 text-sm font-semibold text-amber-900">Falta la verificación de tu empresa (KYB)</p>
                <p className="m-0 mt-0.5 text-sm text-amber-800">
                  La necesitamos para validar tu organización y habilitar la creación de proyectos.
                </p>
              </div>
              <Link to="/partner/kyb" className={cx(btn.secondary, btn.sm, 'flex-shrink-0')}>
                Verificar
              </Link>
            </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PartnerLayout;
