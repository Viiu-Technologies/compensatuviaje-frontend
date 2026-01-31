// ============================================
// PARTNER LAYOUT
// Layout principal con navegación para el módulo Partner
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { getPartnerProfile, getOnboardingStatus } from '../services/partnerApi';
import { PartnerProfile, OnboardingStatus } from '../../../types/partner.types';

// ============================================
// SIDEBAR COMPONENT
// ============================================

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PartnerProfile | null;
  onboarding: OnboardingStatus | null;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, profile, onboarding }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: '/partner',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      exact: true
    },
    {
      path: '/partner/projects',
      label: 'Mis Proyectos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      path: '/partner/profile',
      label: 'Mi Perfil',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      needsAttention: onboarding && !onboarding.completed
    }
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r shadow-lg z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b">
          <Link to="/partner" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-gray-800">CompensaTuViaje</h2>
              <p className="text-xs text-gray-500">Portal Partner</p>
            </div>
          </Link>
        </div>

        {/* Partner Info */}
        {profile && (
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              {profile.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt={profile.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{profile.name}</p>
                <p className="text-xs text-gray-500">{profile.contact_email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 flex-1">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors relative ${
                    isActive(item.path, item.exact)
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {item.needsAttention && (
                    <span className="absolute right-3 w-2 h-2 bg-yellow-400 rounded-full" />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Quick Action */}
          <div className="mt-6 pt-6 border-t">
            <Link
              to="/partner/projects/create"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Proyecto
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
};

// ============================================
// TOP BAR COMPONENT
// ============================================

interface TopBarProps {
  onMenuToggle: () => void;
  profile: PartnerProfile | null;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuToggle, profile }) => {
  const location = useLocation();

  const getPageTitle = (): string => {
    const path = location.pathname;
    if (path === '/partner') return 'Dashboard';
    if (path === '/partner/profile') return 'Mi Perfil';
    if (path === '/partner/projects') return 'Mis Proyectos';
    if (path === '/partner/projects/create') return 'Nuevo Proyecto';
    if (path.includes('/partner/projects/') && path.includes('/edit')) return 'Editar Proyecto';
    if (path.includes('/partner/projects/')) return 'Detalle del Proyecto';
    return 'Portal Partner';
  };

  return (
    <header className="bg-white border-b sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800 lg:text-xl">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications placeholder */}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* Profile quick access */}
          <Link
            to="/partner/profile"
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
          >
            {profile?.logo_url ? (
              <img
                src={profile.logo_url}
                alt={profile.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <span className="hidden md:block text-sm font-medium text-gray-700">
              {profile?.name || 'Mi Cuenta'}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

// ============================================
// MAIN LAYOUT COMPONENT
// ============================================

import { Outlet } from 'react-router-dom';

const PartnerLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, onboardingData] = await Promise.all([
        getPartnerProfile(),
        getOnboardingStatus()
      ]);
      setProfile(profileData);
      setOnboarding(onboardingData);
    } catch (error) {
      console.error('Error loading partner data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        profile={profile}
        onboarding={onboarding}
      />
      
      <div className="lg:pl-64">
        <TopBar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          profile={profile}
        />
        
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PartnerLayout;
