import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import {
  Sprout,
  Cloud,
  CloudOff,
  Trees,
  Download,
  User,
  FileUp,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  TrendingUp,
  Leaf
} from 'lucide-react';

interface EnvironmentalImpact {
  treesPlanted: number;
  co2Avoided: number;
  co2Removed: number;
  habitatRestored: number;
}

const B2BDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [impact, setImpact] = useState<EnvironmentalImpact>({
    treesPlanted: 0,
    co2Avoided: 0,
    co2Removed: 0,
    habitatRestored: 0
  });

  useEffect(() => {
    // TODO: Fetch real data from API
    const mockData: EnvironmentalImpact = {
      treesPlanted: 0,
      co2Avoided: 0,
      co2Removed: 0,
      habitatRestored: 0
    };
    setImpact(mockData);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Tu perfil', icon: User },
    { id: 'panel', label: 'Panel Principal', icon: BarChart3 },
    { id: 'proyectos', label: 'Proyectos', icon: Trees },
    { id: 'tienda', label: 'Tienda de Impacto', icon: Sparkles },
    { id: 'insignias', label: 'Insignias', icon: TrendingUp },
    { id: 'cuenta', label: 'Cuenta', icon: Settings },
  ];

  const handleGenerateReport = () => {
    console.log('Generating report...');
  };

  const handleEditInfo = () => {
    navigate('/b2b/edit');
  };

  const handleUploadDocuments = () => {
    console.log('Navigate to upload documents');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="!min-h-screen !bg-gradient-to-br !from-gray-50 !via-blue-50/30 !to-green-50/20 !flex !font-sans !text-gray-800 !w-full !box-border">
      
      {/* --- SIDEBAR DESKTOP --- */}
      <aside className="!hidden lg:!flex !flex-col !w-64 !h-screen !bg-gradient-to-b !from-gray-900 !via-gray-800 !to-black !shadow-2xl !fixed !left-0 !top-0 !z-50 !overflow-y-auto">
        {/* Logo Area */}
        <div className="!flex !items-center !justify-center !h-20 !px-6 !border-b !border-white/10 !flex-shrink-0">
          <img
            src="/images/brand/logocompensatuviaje.png"
            alt="CompensaTuViaje"
            className="!h-12 !w-auto !drop-shadow-lg"
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
                src="/images/brand/logocompensatuviaje.png"
                alt="CompensaTuViaje"
                className="!h-12 !w-auto !drop-shadow-lg"
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
      <main className="!flex-1 !min-h-screen lg:!ml-64 !transition-all !duration-300 !relative !bg-gray-50 !w-full">
        
        {/* Header Top Bar */}
        <div className="!bg-white/80 !backdrop-blur-md !border-b !border-gray-200 !sticky !top-0 !z-40 !w-full">
          <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-4">
            <div className="!flex !items-center !justify-between">
              <div className="!flex !items-center !gap-4">
                {/* Burger Button Mobile */}
                <button className="lg:!hidden !p-2 !rounded-md !bg-gray-100 !text-gray-600 !border-0" onClick={() => setSidebarOpen(true)}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <div>
                  <p className="!text-sm !text-gray-500 !hidden sm:!block !mt-1">Bienvenido a tu panel de impacto ambiental</p>
                </div>
              </div>
              
              <div className="!flex !items-center !gap-4">
                <button className="!relative !p-2.5 !rounded-full !bg-gray-100 hover:!bg-gray-200 !transition-colors !border-0">
                  🔔
                </button>
                <button className="!p-2.5 !rounded-full !bg-gray-100 hover:!bg-gray-200 !transition-colors !border-0">
                  ⚙️
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Inner Content Container */}
        <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-8 !space-y-8">

          {/* Environmental Impact Section */}
          <section className="!w-full">
            <div className="!flex !items-center !justify-between !mb-6">
              <div>
                <div className="!inline-flex !items-center !gap-2 !px-3 !py-1 !rounded-full !bg-green-50 !text-green-700 !text-xs !font-semibold !mb-2 !border !border-green-100">
                  <Sparkles className="!w-3 !h-3" /> <span>Tu Impacto</span>
                </div>
                <h2 className="!text-xl !font-bold !text-gray-900">Tu Impacto Ambiental</h2>
              </div>
              <button 
                onClick={handleGenerateReport}
                className="!flex !items-center !gap-2 !px-5 !py-2.5 !bg-gradient-to-r !from-yellow-400 !to-orange-500 hover:!from-yellow-500 hover:!to-orange-600 !rounded-xl !text-white !text-sm !font-semibold !shadow-lg !shadow-yellow-500/40 !transition-all !border-0 hover:!scale-105"
              >
                <Download className="!w-4 !h-4" /> 
                <span className="!hidden sm:!inline">Generar Reporte</span>
              </button>
            </div>

            <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 !gap-6">
              {/* Card 1: Árboles Plantados */}
              <div className="!bg-gradient-to-br !from-white !to-green-50 !rounded-2xl !p-6 !border !border-green-200 !shadow-lg hover:!shadow-xl !relative !overflow-hidden group !flex !flex-col !justify-between !h-full !transition-all hover:!scale-105">
                <div className="!w-16 !h-16 !rounded-full !bg-gradient-to-br !from-green-400 !to-emerald-500 !flex !items-center !justify-center !mb-4 !shadow-lg !shadow-green-500/50">
                  <Sprout className="!w-8 !h-8 !text-white" />
                </div>
                <div>
                  <div className="!text-3xl !font-bold !text-gray-900 !mb-1">{impact.treesPlanted}</div>
                  <p className="!text-xs !font-semibold !text-gray-600 !uppercase !tracking-wide">árboles plantados</p>
                </div>
              </div>

              {/* Card 2: CO2 Evitadas */}
              <div className="!bg-gradient-to-br !from-white !to-pink-50 !rounded-2xl !p-6 !border !border-pink-200 !shadow-lg hover:!shadow-xl !relative !overflow-hidden group !flex !flex-col !justify-between !h-full !transition-all hover:!scale-105">
                <div className="!w-16 !h-16 !rounded-full !bg-gradient-to-br !from-pink-400 !to-rose-500 !flex !items-center !justify-center !mb-4 !shadow-lg !shadow-pink-500/50">
                  <Cloud className="!w-8 !h-8 !text-white" />
                </div>
                <div>
                  <div className="!text-3xl !font-bold !text-gray-900 !mb-1">{impact.co2Avoided}</div>
                  <p className="!text-xs !font-semibold !text-gray-600 !uppercase !tracking-wide">tCO2e evitadas</p>
                </div>
              </div>

              {/* Card 3: CO2 Removidas */}
              <div className="!bg-gradient-to-br !from-white !to-purple-50 !rounded-2xl !p-6 !border !border-purple-200 !shadow-lg hover:!shadow-xl !relative !overflow-hidden group !flex !flex-col !justify-between !h-full !transition-all hover:!scale-105">
                <div className="!w-16 !h-16 !rounded-full !bg-gradient-to-br !from-purple-400 !to-violet-500 !flex !items-center !justify-center !mb-4 !shadow-lg !shadow-purple-500/50">
                  <CloudOff className="!w-8 !h-8 !text-white" />
                </div>
                <div>
                  <div className="!text-3xl !font-bold !text-gray-900 !mb-1">{impact.co2Removed}</div>
                  <p className="!text-xs !font-semibold !text-gray-600 !uppercase !tracking-wide">tCO2e removidas</p>
                </div>
              </div>

              {/* Card 4: Hábitat Restaurado */}
              <div className="!bg-gradient-to-br !from-white !to-teal-50 !rounded-2xl !p-6 !border !border-teal-200 !shadow-lg hover:!shadow-xl !relative !overflow-hidden group !flex !flex-col !justify-between !h-full !transition-all hover:!scale-105">
                <div className="!w-16 !h-16 !rounded-full !bg-gradient-to-br !from-teal-400 !to-cyan-500 !flex !items-center !justify-center !mb-4 !shadow-lg !shadow-teal-500/50">
                  <Trees className="!w-8 !h-8 !text-white" />
                </div>
                <div>
                  <div className="!text-3xl !font-bold !text-gray-900 !mb-1">{impact.habitatRestored} m²</div>
                  <p className="!text-xs !font-semibold !text-gray-600 !uppercase !tracking-wide">hábitat restaurado</p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions Section */}
          <section className="!w-full">
            <div className="!flex !items-center !justify-between !mb-6">
              <h2 className="!text-xl !font-bold !text-gray-900">Acciones Rápidas</h2>
              <button className="!text-green-600 hover:!text-green-700 !font-medium !text-sm !bg-transparent !border-0">Ver todas →</button>
            </div>

            <div className="!grid md:!grid-cols-2 !gap-6 !pb-8">
              {/* Action Card 1 */}
              <div 
                onClick={handleEditInfo}
                className="!bg-gradient-to-br !from-green-500 !to-emerald-600 !rounded-2xl !p-6 !shadow-lg !shadow-green-500/40 hover:!shadow-xl hover:!shadow-green-500/50 !transition-all !cursor-pointer group !h-full hover:!scale-105"
              >
                <div className="!flex !items-start !justify-between !mb-4">
                  <div className="!w-12 !h-12 !rounded-xl !bg-white/20 !backdrop-blur-sm !flex !items-center !justify-center !text-white !text-2xl">
                    <User className="!w-6 !h-6" />
                  </div>
                  <span className="!text-white/70 group-hover:!text-white !transition-colors !text-xl">→</span>
                </div>
                <h3 className="!text-lg !font-bold !text-white !mb-2">Editar Información</h3>
                <p className="!text-white/80 !text-sm">Actualizar datos de tu empresa y configuración</p>
              </div>

              {/* Action Card 2 */}
              <div 
                onClick={handleUploadDocuments}
                className="!bg-gradient-to-br !from-blue-500 !to-indigo-600 !rounded-2xl !p-6 !shadow-lg !shadow-blue-500/40 hover:!shadow-xl hover:!shadow-blue-500/50 !transition-all !cursor-pointer group !h-full hover:!scale-105"
              >
                <div className="!flex !items-start !justify-between !mb-4">
                  <div className="!w-12 !h-12 !rounded-xl !bg-white/20 !backdrop-blur-sm !flex !items-center !justify-center !text-white !text-2xl">
                    <FileUp className="!w-6 !h-6" />
                  </div>
                  <span className="!text-white/70 group-hover:!text-white !transition-colors !text-xl">→</span>
                </div>
                <h3 className="!text-lg !font-bold !text-white !mb-2">Cargar Documentos</h3>
                <p className="!text-white/80 !text-sm">Subir documentación legal de tu empresa</p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default B2BDashboard;