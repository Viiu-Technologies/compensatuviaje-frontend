// ============================================
// PARTNER LAYOUT
// Layout principal con navegación para el módulo Partner
// Estilo consistente con AdminLayout
// ============================================

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { getPartnerProfile, getOnboardingStatus } from '../services/partnerApi';
import { PartnerProfile, OnboardingStatus } from '../../../types/partner.types';
import {
  LayoutDashboard,
  FolderKanban,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Bell,
  Plus,
  Building2,
  Shield
} from 'lucide-react';

// ============================================
// MAIN LAYOUT COMPONENT
// ============================================

const PartnerLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const results = await Promise.allSettled([
        getPartnerProfile(),
        getOnboardingStatus()
      ]);
      if (results[0].status === 'fulfilled') setProfile(results[0].value);
      if (results[1].status === 'fulfilled') setOnboarding(results[1].value);
    } catch (error) {
      console.error('Error loading partner data:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/partner', icon: LayoutDashboard, label: 'Dashboard', exact: true, needsAttention: false },
    { path: '/partner/projects', icon: FolderKanban, label: 'Mis Proyectos', exact: false, needsAttention: false },
    { path: '/partner/kyb', icon: Shield, label: 'Verificación KYB', exact: false, needsAttention: profile?.status === 'onboarding' },
    { path: '/partner/profile', icon: UserCircle, label: 'Mi Perfil', exact: false, needsAttention: onboarding ? !onboarding.completed : false },
  ];

  return (
    <div className="!min-h-screen !bg-gradient-to-br !from-slate-50 !via-emerald-50/20 !to-teal-50/10 !flex !font-sans !w-full">
      {/* ====== Sidebar Desktop ====== */}
      <aside
        className={`!hidden lg:!flex !flex-col !h-screen !bg-gradient-to-b !from-slate-900 !via-slate-800 !to-slate-950 !shadow-2xl !fixed !left-0 !top-0 !z-50 !overflow-y-auto !transition-all !duration-300 ${
          sidebarCollapsed ? '!w-20' : '!w-72'
        }`}
      >
        {/* Logo */}
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

        {/* Partner Info */}
        <div className="!px-4 !py-4 !border-b !border-white/10">
          <div className={`!flex !items-center !gap-3 !p-4 !rounded-xl !bg-gradient-to-r !from-emerald-500/20 !to-teal-500/20 !border !border-emerald-400/30 !backdrop-blur-sm ${sidebarCollapsed ? '!justify-center' : ''}`}>
            {profile?.logo_url ? (
              <img
                src={profile.logo_url}
                alt={profile.name}
                className="!w-10 !h-10 !rounded-full !object-cover !flex-shrink-0 !shadow-lg"
              />
            ) : (
              <div className="!w-10 !h-10 !rounded-full !bg-gradient-to-br !from-emerald-400 !to-teal-500 !flex !items-center !justify-center !text-white !font-bold !flex-shrink-0 !shadow-lg !shadow-emerald-500/50">
                <Building2 className="!w-5 !h-5" />
              </div>
            )}
            {!sidebarCollapsed && (
              <div className="!flex-1 !min-w-0">
                <p className="!text-sm !font-bold !text-white !truncate">{profile?.name || 'Partner'}</p>
                <p className="!text-xs !text-emerald-300 !truncate">{profile?.contact_email || user?.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="!flex-1 !px-4 !py-6 !space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !transition-all !text-left !font-medium !border-0 !outline-none !relative !no-underline ${
                  isActive
                    ? '!bg-gradient-to-r !from-emerald-500 !to-teal-600 !text-white !shadow-lg !shadow-emerald-500/50'
                    : '!bg-transparent !text-slate-300 hover:!bg-white/10 hover:!text-white'
                } ${sidebarCollapsed ? '!justify-center' : ''}`
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="!w-5 !h-5 !flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="!truncate">{item.label}</span>
              )}
              {!sidebarCollapsed && item.needsAttention && (
                <span className="!ml-auto !w-2.5 !h-2.5 !bg-amber-400 !rounded-full !shadow-lg !shadow-amber-400/50" />
              )}
            </NavLink>
          ))}

          {/* New Project Button */}
          {!sidebarCollapsed && (
            <div className="!pt-4 !mt-4 !border-t !border-white/10">
              <NavLink
                to="/partner/projects/create"
                className="!flex !items-center !justify-center !gap-2 !w-full !px-4 !py-3 !bg-gradient-to-r !from-emerald-500 !to-green-600 !text-white !rounded-xl hover:!from-emerald-600 hover:!to-green-700 !transition-all !font-semibold !shadow-lg !shadow-emerald-500/30 !no-underline"
              >
                <Plus className="!w-5 !h-5" />
                Nuevo Proyecto
              </NavLink>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="!pt-4 !mt-4 !border-t !border-white/10 !flex !justify-center">
              <NavLink
                to="/partner/projects/create"
                className="!p-3 !bg-gradient-to-r !from-emerald-500 !to-green-600 !text-white !rounded-xl hover:!from-emerald-600 hover:!to-green-700 !transition-all !shadow-lg !no-underline"
                title="Nuevo Proyecto"
              >
                <Plus className="!w-5 !h-5" />
              </NavLink>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="!mt-auto !px-4 !pb-6 !space-y-1 !flex-shrink-0 !border-t !border-white/10 !pt-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !text-slate-300 hover:!bg-white/10 hover:!text-white !bg-transparent !border-0 !transition-all !cursor-pointer"
          >
            {sidebarCollapsed ? <ChevronRight className="!w-5 !h-5" /> : <ChevronLeft className="!w-5 !h-5" />}
            {!sidebarCollapsed && <span>Colapsar</span>}
          </button>
          <button
            onClick={handleLogout}
            className="!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !text-red-400 hover:!bg-red-500/20 hover:!text-red-300 !bg-transparent !border-0 !transition-all !cursor-pointer"
          >
            <LogOut className="!w-5 !h-5" />
            {!sidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* ====== Sidebar Mobile ====== */}
      {mobileMenuOpen && (
        <div
          className="!fixed !inset-0 !z-[60] !bg-black/60 !backdrop-blur-sm lg:!hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="!fixed !left-0 !top-0 !h-full !w-72 !bg-gradient-to-b !from-slate-900 !via-slate-800 !to-slate-950 !shadow-2xl !flex !flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="!flex !items-center !justify-center !h-20 !px-6 !border-b !border-white/10">
              <img src="/images/brand/logo-horizontal-white.svg" alt="CompensaTuViaje" className="!h-10 !w-auto" />
            </div>

            <div className="!px-4 !py-4 !border-b !border-white/10">
              <div className="!flex !items-center !gap-3 !p-4 !rounded-xl !bg-gradient-to-r !from-emerald-500/20 !to-teal-500/20 !border !border-emerald-400/30">
                {profile?.logo_url ? (
                  <img src={profile.logo_url} alt={profile.name} className="!w-12 !h-12 !rounded-full !object-cover !shadow-lg" />
                ) : (
                  <div className="!w-12 !h-12 !rounded-full !bg-gradient-to-br !from-emerald-400 !to-teal-500 !flex !items-center !justify-center !text-white !font-bold !shadow-lg">
                    <Building2 className="!w-6 !h-6" />
                  </div>
                )}
                <div className="!flex-1 !min-w-0">
                  <p className="!text-sm !font-bold !text-white">{profile?.name || 'Partner'}</p>
                  <p className="!text-xs !text-emerald-300 !truncate">{profile?.contact_email || user?.email}</p>
                </div>
              </div>
            </div>

            <nav className="!flex-1 !px-4 !py-6 !space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !transition-all !text-left !font-medium !border-0 !no-underline ${
                      isActive
                        ? '!bg-gradient-to-r !from-emerald-500 !to-teal-600 !text-white !shadow-lg'
                        : '!text-slate-300 hover:!bg-white/10'
                    }`
                  }
                >
                  <item.icon className="!w-5 !h-5" />
                  {item.label}
                  {item.needsAttention && (
                    <span className="!ml-auto !w-2.5 !h-2.5 !bg-amber-400 !rounded-full" />
                  )}
                </NavLink>
              ))}
              <div className="!pt-4 !mt-4 !border-t !border-white/10">
                <NavLink
                  to="/partner/projects/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="!flex !items-center !justify-center !gap-2 !w-full !px-4 !py-3 !bg-gradient-to-r !from-emerald-500 !to-green-600 !text-white !rounded-xl !font-semibold !shadow-lg !no-underline"
                >
                  <Plus className="!w-5 !h-5" />
                  Nuevo Proyecto
                </NavLink>
              </div>
            </nav>

            <div className="!px-4 !pb-6 !border-t !border-white/10 !pt-4">
              <button
                onClick={handleLogout}
                className="!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !text-red-400 hover:!bg-red-500/20 !bg-transparent !border-0 !cursor-pointer"
              >
                <LogOut className="!w-5 !h-5" />
                Cerrar Sesión
              </button>
            </div>

            <button
              className="!absolute !top-4 !right-4 !text-white/60 !text-2xl !border-0 !bg-transparent !cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              ×
            </button>
          </aside>
        </div>
      )}

      {/* ====== Main Content ====== */}
      <main className={`!flex-1 !min-h-screen !transition-all !duration-300 !w-full ${sidebarCollapsed ? 'lg:!ml-20' : 'lg:!ml-72'}`}>
        {/* Header */}
        <header className="!bg-white/90 !backdrop-blur-md !border-b !border-slate-200 !sticky !top-0 !z-40">
          <div className="!max-w-7xl !mx-auto !px-6 !py-4">
            <div className="!flex !items-center !justify-between">
              <div className="!flex !items-center !gap-4">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:!hidden !p-2 !rounded-lg !bg-slate-200 !text-slate-700 !border-0 !cursor-pointer"
                >
                  <Menu className="!w-6 !h-6" />
                </button>
                <div>
                  <h1 className="!text-2xl !font-bold !text-slate-900 !flex !items-center !gap-2">
                    <Building2 className="!text-emerald-600 !w-6 !h-6" />
                    Portal Partner
                  </h1>
                  <p className="!text-sm !text-slate-500 !mt-1">Gestión de proyectos ESG</p>
                </div>
              </div>

              <div className="!flex !items-center !gap-3">
                <button className="!relative !p-2.5 !rounded-full !bg-slate-100 hover:!bg-slate-200 !transition-colors !border-0 !cursor-pointer">
                  <Bell className="!w-5 !h-5 !text-slate-600" />
                </button>
                <NavLink
                  to="/partner/profile"
                  className="!hidden sm:!flex !items-center !gap-3 !pl-3 !border-l !border-slate-200 !no-underline"
                >
                  <div className="!text-right">
                    <p className="!text-sm !font-bold !text-slate-900">{profile?.name || user?.name || 'Partner'}</p>
                    <p className="!text-xs !text-slate-500">Impact Partner</p>
                  </div>
                  {profile?.logo_url ? (
                    <img src={profile.logo_url} alt={profile.name} className="!w-10 !h-10 !rounded-full !object-cover" />
                  ) : (
                    <div className="!w-10 !h-10 !rounded-full !bg-emerald-100 !text-emerald-700 !flex !items-center !justify-center !font-bold">
                      {profile?.name?.charAt(0) || 'P'}
                    </div>
                  )}
                </NavLink>
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
};

export default PartnerLayout;
