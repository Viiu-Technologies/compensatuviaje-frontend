import React, { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useTheme } from '../../../shared/context/ThemeContext';
import {
  Trees,
  User,
  BarChart3,
  Settings,
  LogOut,
  Award,
  ShoppingBag,
  Calculator,
  Bot,
  FileText
} from 'lucide-react';

// Import Views
import ProfileView from './views/ProfileView';
import DashboardPanelView from './views/DashboardPanelView';
import ProjectsView from './views/ProjectsView';
import ImpactStoreView from './views/ImpactStoreView';
import BadgesView from './views/BadgesView';
import SettingsView from './views/SettingsView';
import CalculatorView from './views/CalculatorView';
import AssistantView from './views/AssistantView';
import DocumentsView from './views/DocumentsView';

const B2BDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDark = resolvedTheme === 'dark';

  const navItems = [
    { id: 'dashboard', label: 'Tu perfil', icon: User },
    { id: 'panel', label: 'Panel Principal', icon: BarChart3 },
    { id: 'documentos', label: 'Documentos', icon: FileText },
    { id: 'proyectos', label: 'Proyectos', icon: Trees },
    { id: 'tienda', label: 'Tienda de Impacto', icon: ShoppingBag },
    { id: 'insignias', label: 'Insignias', icon: Award },
    { id: 'calculadora', label: 'Calculadora', icon: Calculator },
    { id: 'asistente', label: 'Asistente IA', icon: Bot },
    { id: 'cuenta', label: 'Cuenta', icon: Settings },
  ];

  // Render active view based on activeTab
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ProfileView />;
      case 'panel':
        return <DashboardPanelView />;
      case 'documentos':
        return <DocumentsView />;
      case 'proyectos':
        return <ProjectsView />;
      case 'tienda':
        return <ImpactStoreView />;
      case 'insignias':
        return <BadgesView />;
      case 'calculadora':
        return <CalculatorView />;
      case 'asistente':
        return <AssistantView />;
      case 'cuenta':
        return <SettingsView />;
      default:
        return <ProfileView />;
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`!min-h-screen !flex !font-sans !w-full !box-border !transition-colors !duration-200 ${
      isDark 
        ? '!bg-gradient-to-br !from-gray-900 !via-gray-900 !to-gray-800 !text-gray-100' 
        : '!bg-gradient-to-br !from-gray-50 !via-blue-50/30 !to-green-50/20 !text-gray-800'
    }`}>
      
      {/* --- SIDEBAR DESKTOP --- */}
      <aside className="!hidden lg:!flex !flex-col !w-64 !h-screen !bg-gradient-to-b !from-gray-900 !via-gray-800 !to-black !shadow-2xl !fixed !left-0 !top-0 !z-50 !overflow-y-auto">
        {/* Logo Area */}
        <div className="!flex !items-center !justify-center !h-20 !px-6 !border-b !border-white/10 !flex-shrink-0">
          <img
            src="/images/brand/logo-horizontal-white.svg"
            alt="CompensaTuViaje"
            className="!h-10 !w-auto !drop-shadow-lg"
          />
        </div>
        
        {/* User Info */}
        <div className="!px-4 !py-4 !border-b !border-white/10">
          <div className="!flex !items-center !gap-3 !p-3 !rounded-xl !bg-gradient-to-r !from-green-500/20 !to-emerald-500/20 !border !border-green-400/30 !backdrop-blur-sm">
            <div className="!w-10 !h-10 !rounded-full !bg-gradient-to-br !from-green-400 !to-emerald-600 !flex !items-center !justify-center !text-white !font-bold !flex-shrink-0 !shadow-lg !shadow-green-500/50">
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="!flex-1 !min-w-0">
              <p className="!text-sm !font-medium !text-white !truncate">{user?.email || 'Usuario'}</p>
            </div>
          </div>
        </div>
        
        {/* Nav Links */}
        <nav className="!flex-1 !px-4 !py-6 !space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !transition-all !text-left !font-medium !border-0 !outline-none ${
                activeTab === item.id 
                  ? '!bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !shadow-lg !shadow-green-500/50' 
                  : '!bg-transparent !text-gray-300 hover:!bg-white/10 hover:!text-white'
              }`}
            >
              <item.icon className="!text-xl !flex-shrink-0" />
              <span className="!truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="!mt-auto !px-4 !pb-6 !space-y-1 !flex-shrink-0 !border-t !border-white/10 !pt-4">
          <button 
            onClick={handleLogout}
            className="!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !text-red-400 hover:!bg-red-500/20 hover:!text-red-300 !bg-transparent !border-0 !transition-all"
          >
            <LogOut className="!text-lg" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- SIDEBAR MOBILE (DRAWER) --- */}
      {sidebarOpen && (
        <div className="!fixed !inset-0 !z-[60] !bg-black/60 !backdrop-blur-sm !transition-opacity lg:!hidden" onClick={() => setSidebarOpen(false)}>
          <aside className="!fixed !left-0 !top-0 !h-full !w-64 !bg-gradient-to-b !from-gray-900 !via-gray-800 !to-black !shadow-2xl !flex !flex-col !z-[70]">
            <div className="!flex !items-center !justify-center !h-20 !px-6 !border-b !border-white/10">
              <img
                src="/images/brand/logo-horizontal-white.svg"
                alt="CompensaTuViaje"
                className="!h-10 !w-auto !drop-shadow-lg"
              />
            </div>
            
            {/* User Info Mobile */}
            <div className="!px-4 !py-4 !border-b !border-white/10">
              <div className="!flex !items-center !gap-3 !p-3 !rounded-xl !bg-gradient-to-r !from-green-500/20 !to-emerald-500/20 !border !border-green-400/30">
                <div className="!w-10 !h-10 !rounded-full !bg-gradient-to-br !from-green-400 !to-emerald-600 !flex !items-center !justify-center !text-white !font-bold !shadow-lg !shadow-green-500/50">
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="!flex-1 !min-w-0">
                  <p className="!text-sm !font-medium !text-white !truncate">{user?.email || 'Usuario'}</p>
                </div>
              </div>
            </div>
            
            <nav className="!flex-1 !px-4 !py-6 !space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !transition-all !text-left !font-medium !border-0 ${
                    activeTab === item.id ? '!bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !shadow-lg' : '!text-gray-300 hover:!bg-white/10 hover:!text-white'
                  }`}
                >
                  <item.icon className="!text-xl" />
                  {item.label}
                </button>
              ))}
            </nav>
            <button className="!absolute !top-4 !right-4 !text-white/60 hover:!text-white !text-2xl !border-0 !bg-transparent !transition-colors" onClick={() => setSidebarOpen(false)}>×</button>
          </aside>
        </div>
      )}

      {/* --- MAIN CONTENT WRAPPER --- */}
      <main className={`!flex-1 !min-h-screen lg:!ml-64 !transition-all !duration-300 !relative !w-full ${
        isDark ? '!bg-gray-900' : '!bg-gray-50'
      }`}>
        
        {/* Header Top Bar */}
        <div className={`!backdrop-blur-md !border-b !sticky !top-0 !z-40 !w-full ${
          isDark 
            ? '!bg-gray-800/80 !border-gray-700' 
            : '!bg-white/80 !border-gray-200'
        }`}>
          <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-4">
            <div className="!flex !items-center !justify-between">
              <div className="!flex !items-center !gap-4">
                {/* Burger Button Mobile */}
                <button 
                  className={`lg:!hidden !p-2 !rounded-md !border-0 ${
                    isDark ? '!bg-gray-700 !text-gray-300' : '!bg-gray-100 !text-gray-600'
                  }`} 
                  onClick={() => setSidebarOpen(true)}
                >
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <div>
                  <p className={`!text-sm !hidden sm:!block !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
                    Bienvenido a tu panel de impacto ambiental
                  </p>
                </div>
              </div>
              
              <div className="!flex !items-center !gap-4">
                <button className={`!relative !p-2.5 !rounded-full !transition-colors !border-0 ${
                  isDark ? '!bg-gray-700 hover:!bg-gray-600' : '!bg-gray-100 hover:!bg-gray-200'
                }`}>
                  🔔
                </button>
                <button className={`!p-2.5 !rounded-full !transition-colors !border-0 ${
                  isDark ? '!bg-gray-700 hover:!bg-gray-600' : '!bg-gray-100 hover:!bg-gray-200'
                }`}>
                  ⚙️
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Inner Content Container - Dynamic View Rendering */}
        <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-8">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
};

export default B2BDashboard;