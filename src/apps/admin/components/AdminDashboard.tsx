import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import {
  Users,
  Building2,
  CreditCard,
  Award,
  TreePine,
  TrendingUp,
  DollarSign,
  FileText,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Shield,
  Package,
  Calendar,
  Download,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  b2c: {
    activeUsers: number;
    usersWithPurchases: number;
    monthlyRevenue: number;
    totalTransactions: number;
    certificates: number;
    activeProjects: number;
  };
  b2b: {
    registeredCompanies: number;
    activeContracts: number;
    pendingContracts: number;
    compensationCodes: number;
  };
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data - TODO: Replace with API calls
  const stats: DashboardStats = {
    b2c: {
      activeUsers: 1247,
      usersWithPurchases: 856,
      monthlyRevenue: 45680,
      totalTransactions: 1543,
      certificates: 982,
      activeProjects: 12
    },
    b2b: {
      registeredCompanies: 47,
      activeContracts: 23,
      pendingContracts: 8,
      compensationCodes: 1245
    }
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'b2c', label: 'B2C Usuarios', icon: Users },
    { id: 'b2b', label: 'B2B Empresas', icon: Building2 },
    { id: 'projects', label: 'Proyectos', icon: TreePine },
    { id: 'reports', label: 'Reportes', icon: FileText },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="!min-h-screen !bg-gradient-to-br !from-slate-50 !via-blue-50/30 !to-indigo-50/20 !flex !font-sans !w-full">
      
      {/* --- SIDEBAR DESKTOP --- */}
      <aside className="!hidden lg:!flex !flex-col !w-72 !h-screen !bg-gradient-to-b !from-slate-900 !via-slate-800 !to-slate-950 !shadow-2xl !fixed !left-0 !top-0 !z-50 !overflow-y-auto">
        {/* Logo Area */}
        <div className="!flex !items-center !justify-center !h-20 !px-6 !border-b !border-white/10 !flex-shrink-0">
          <img
            src="/images/brand/logo-horizontal-white.svg"
            alt="CompensaTuViaje"
            className="!h-10 !w-auto !drop-shadow-lg"
          />
        </div>
        
        {/* Admin Info */}
        <div className="!px-4 !py-4 !border-b !border-white/10">
          <div className="!flex !items-center !gap-3 !p-4 !rounded-xl !bg-gradient-to-r !from-indigo-500/20 !to-purple-500/20 !border !border-indigo-400/30 !backdrop-blur-sm">
            <div className="!w-12 !h-12 !rounded-full !bg-gradient-to-br !from-amber-400 !to-orange-500 !flex !items-center !justify-center !text-white !font-bold !flex-shrink-0 !shadow-lg !shadow-amber-500/50 !text-lg">
              <Shield className="!w-6 !h-6" />
            </div>
            <div className="!flex-1 !min-w-0">
              <p className="!text-sm !font-bold !text-white !truncate">SuperAdmin</p>
              <p className="!text-xs !text-indigo-300">{user?.email}</p>
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
                  ? '!bg-gradient-to-r !from-indigo-500 !to-purple-600 !text-white !shadow-lg !shadow-indigo-500/50' 
                  : '!bg-transparent !text-slate-300 hover:!bg-white/10 hover:!text-white'
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

      {/* --- SIDEBAR MOBILE --- */}
      {sidebarOpen && (
        <div className="!fixed !inset-0 !z-[60] !bg-black/60 !backdrop-blur-sm lg:!hidden" onClick={() => setSidebarOpen(false)}>
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
            
            <nav className="!flex-1 !px-4 !py-6 !space-y-2">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !transition-all !text-left !font-medium !border-0 ${
                    activeTab === item.id ? '!bg-gradient-to-r !from-indigo-500 !to-purple-600 !text-white !shadow-lg' : '!text-slate-300 hover:!bg-white/10'
                  }`}>
                  <item.icon className="!text-xl" />
                  {item.label}
                </button>
              ))}
            </nav>
            <button className="!absolute !top-4 !right-4 !text-white/60 !text-2xl !border-0 !bg-transparent" onClick={() => setSidebarOpen(false)}>×</button>
          </aside>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="!flex-1 !min-h-screen lg:!ml-72 !transition-all !w-full">
        
        {/* Header */}
        <div className="!bg-white/90 !backdrop-blur-md !border-b !border-slate-200 !sticky !top-0 !z-40">
          <div className="!max-w-7xl !mx-auto !px-6 !py-4">
            <div className="!flex !items-center !justify-between">
              <div className="!flex !items-center !gap-4">
                <button className="lg:!hidden !p-2 !rounded-lg !bg-slate-200 !text-slate-700 !border-0" onClick={() => setSidebarOpen(true)}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
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
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="!max-w-7xl !mx-auto !px-6 !py-8 !space-y-8">
          
          {/* B2C Section */}
          <section>
            <div className="!flex !items-center !gap-3 !mb-6">
              <div className="!w-10 !h-10 !rounded-lg !bg-gradient-to-br !from-blue-500 !to-cyan-600 !flex !items-center !justify-center !shadow-lg !shadow-blue-500/40">
                <Users className="!w-6 !h-6 !text-white" />
              </div>
              <div>
                <h2 className="!text-2xl !font-bold !text-slate-900">B2C - Usuarios</h2>
                <p className="!text-sm !text-slate-500">Gestión de usuarios individuales</p>
              </div>
            </div>

            <div className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-4 !gap-6">
              {/* Card: Usuarios Activos */}
              <div className="!bg-gradient-to-br !from-blue-500 !to-blue-600 !rounded-2xl !p-6 !text-white !shadow-lg !shadow-blue-500/40 hover:!shadow-xl !transition-all hover:!scale-105">
                <div className="!flex !items-center !justify-between !mb-4">
                  <Users className="!w-8 !h-8 !text-white/90" />
                  <span className="!text-xs !bg-white/20 !backdrop-blur-sm !px-2 !py-1 !rounded-full">Total</span>
                </div>
                <div className="!text-3xl !font-bold !mb-1">{stats.b2c.activeUsers.toLocaleString()}</div>
                <p className="!text-sm !text-white/80">Usuarios Activos</p>
              </div>

              {/* Card: Usuarios que Compraron */}
              <div className="!bg-gradient-to-br !from-emerald-500 !to-emerald-600 !rounded-2xl !p-6 !text-white !shadow-lg !shadow-emerald-500/40 hover:!shadow-xl !transition-all hover:!scale-105">
                <div className="!flex !items-center !justify-between !mb-4">
                  <CheckCircle className="!w-8 !h-8 !text-white/90" />
                  <span className="!text-xs !bg-white/20 !backdrop-blur-sm !px-2 !py-1 !rounded-full">Compraron</span>
                </div>
                <div className="!text-3xl !font-bold !mb-1">{stats.b2c.usersWithPurchases.toLocaleString()}</div>
                <p className="!text-sm !text-white/80">Con Compensaciones</p>
              </div>

              {/* Card: Ingresos Mensuales */}
              <div className="!bg-gradient-to-br !from-purple-500 !to-purple-600 !rounded-2xl !p-6 !text-white !shadow-lg !shadow-purple-500/40 hover:!shadow-xl !transition-all hover:!scale-105">
                <div className="!flex !items-center !justify-between !mb-4">
                  <DollarSign className="!w-8 !h-8 !text-white/90" />
                  <span className="!text-xs !bg-white/20 !backdrop-blur-sm !px-2 !py-1 !rounded-full">Mes</span>
                </div>
                <div className="!text-3xl !font-bold !mb-1">${(stats.b2c.monthlyRevenue / 1000).toFixed(1)}k</div>
                <p className="!text-sm !text-white/80">Ingresos Mensuales</p>
              </div>

              {/* Card: Certificados */}
              <div className="!bg-gradient-to-br !from-amber-500 !to-orange-500 !rounded-2xl !p-6 !text-white !shadow-lg !shadow-amber-500/40 hover:!shadow-xl !transition-all hover:!scale-105">
                <div className="!flex !items-center !justify-between !mb-4">
                  <Award className="!w-8 !h-8 !text-white/90" />
                  <span className="!text-xs !bg-white/20 !backdrop-blur-sm !px-2 !py-1 !rounded-full">Total</span>
                </div>
                <div className="!text-3xl !font-bold !mb-1">{stats.b2c.certificates.toLocaleString()}</div>
                <p className="!text-sm !text-white/80">Certificados Emitidos</p>
              </div>
            </div>

            {/* Tabla de Pagos Recientes */}
            <div className="!mt-6 !bg-white !rounded-2xl !shadow-lg !border !border-slate-200 !overflow-hidden">
              <div className="!p-6 !border-b !border-slate-200">
                <div className="!flex !items-center !justify-between">
                  <h3 className="!text-lg !font-bold !text-slate-900">Pagos Recientes</h3>
                  <button className="!flex !items-center !gap-2 !px-4 !py-2 !bg-slate-100 hover:!bg-slate-200 !rounded-lg !text-sm !font-medium !text-slate-700 !border-0">
                    <Download className="!w-4 !h-4" />
                    Exportar
                  </button>
                </div>
              </div>
              <div className="!overflow-x-auto">
                <table className="!w-full !text-sm">
                  <thead className="!bg-slate-50 !border-b !border-slate-200">
                    <tr>
                      <th className="!px-6 !py-3 !text-left !font-semibold !text-slate-700">Usuario</th>
                      <th className="!px-6 !py-3 !text-left !font-semibold !text-slate-700">Monto</th>
                      <th className="!px-6 !py-3 !text-left !font-semibold !text-slate-700">Fecha</th>
                      <th className="!px-6 !py-3 !text-left !font-semibold !text-slate-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="!divide-y !divide-slate-100">
                    {[
                      { user: 'maria.garcia@email.com', amount: 45.5, date: '19/12/2025', status: 'Completado' },
                      { user: 'juan.perez@email.com', amount: 89.0, date: '19/12/2025', status: 'Completado' },
                      { user: 'ana.rodriguez@email.com', amount: 32.8, date: '18/12/2025', status: 'Completado' }
                    ].map((payment, idx) => (
                      <tr key={idx} className="hover:!bg-slate-50 !transition-colors">
                        <td className="!px-6 !py-4 !text-slate-900">{payment.user}</td>
                        <td className="!px-6 !py-4 !font-semibold !text-emerald-600">${payment.amount}</td>
                        <td className="!px-6 !py-4 !text-slate-600">{payment.date}</td>
                        <td className="!px-6 !py-4">
                          <span className="!px-3 !py-1 !bg-emerald-100 !text-emerald-700 !rounded-full !text-xs !font-semibold">{payment.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* B2B Section */}
          <section>
            <div className="!flex !items-center !gap-3 !mb-6">
              <div className="!w-10 !h-10 !rounded-lg !bg-gradient-to-br !from-indigo-500 !to-purple-600 !flex !items-center !justify-center !shadow-lg !shadow-indigo-500/40">
                <Building2 className="!w-6 !h-6 !text-white" />
              </div>
              <div>
                <h2 className="!text-2xl !font-bold !text-slate-900">B2B - Empresas</h2>
                <p className="!text-sm !text-slate-500">Gestión de empresas y contratos</p>
              </div>
            </div>

            <div className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-4 !gap-6">
              {/* Card: Empresas Registradas */}
              <div className="!bg-gradient-to-br !from-indigo-500 !to-indigo-600 !rounded-2xl !p-6 !text-white !shadow-lg !shadow-indigo-500/40 hover:!shadow-xl !transition-all hover:!scale-105">
                <div className="!flex !items-center !justify-between !mb-4">
                  <Building2 className="!w-8 !h-8 !text-white/90" />
                  <span className="!text-xs !bg-white/20 !backdrop-blur-sm !px-2 !py-1 !rounded-full">Total</span>
                </div>
                <div className="!text-3xl !font-bold !mb-1">{stats.b2b.registeredCompanies}</div>
                <p className="!text-sm !text-white/80">Empresas Registradas</p>
              </div>

              {/* Card: Contratos Activos */}
              <div className="!bg-gradient-to-br !from-teal-500 !to-cyan-600 !rounded-2xl !p-6 !text-white !shadow-lg !shadow-teal-500/40 hover:!shadow-xl !transition-all hover:!scale-105">
                <div className="!flex !items-center !justify-between !mb-4">
                  <FileText className="!w-8 !h-8 !text-white/90" />
                  <span className="!text-xs !bg-white/20 !backdrop-blur-sm !px-2 !py-1 !rounded-full">Activos</span>
                </div>
                <div className="!text-3xl !font-bold !mb-1">{stats.b2b.activeContracts}</div>
                <p className="!text-sm !text-white/80">Contratos con Aerolíneas</p>
              </div>

              {/* Card: Contratos Pendientes */}
              <div className="!bg-gradient-to-br !from-orange-500 !to-red-500 !rounded-2xl !p-6 !text-white !shadow-lg !shadow-orange-500/40 hover:!shadow-xl !transition-all hover:!scale-105">
                <div className="!flex !items-center !justify-between !mb-4">
                  <Clock className="!w-8 !h-8 !text-white/90" />
                  <span className="!text-xs !bg-white/20 !backdrop-blur-sm !px-2 !py-1 !rounded-full">Pendiente</span>
                </div>
                <div className="!text-3xl !font-bold !mb-1">{stats.b2b.pendingContracts}</div>
                <p className="!text-sm !text-white/80">Contratos Pendientes</p>
              </div>

              {/* Card: Códigos de Compensación */}
              <div className="!bg-gradient-to-br !from-pink-500 !to-rose-600 !rounded-2xl !p-6 !text-white !shadow-lg !shadow-pink-500/40 hover:!shadow-xl !transition-all hover:!scale-105">
                <div className="!flex !items-center !justify-between !mb-4">
                  <Package className="!w-8 !h-8 !text-white/90" />
                  <span className="!text-xs !bg-white/20 !backdrop-blur-sm !px-2 !py-1 !rounded-full">Total</span>
                </div>
                <div className="!text-3xl !font-bold !mb-1">{stats.b2b.compensationCodes.toLocaleString()}</div>
                <p className="!text-sm !text-white/80">Códigos Generados</p>
              </div>
            </div>
          </section>

          {/* Proyectos Section */}
          <section>
            <div className="!flex !items-center !gap-3 !mb-6">
              <div className="!w-10 !h-10 !rounded-lg !bg-gradient-to-br !from-green-500 !to-emerald-600 !flex !items-center !justify-center !shadow-lg !shadow-green-500/40">
                <TreePine className="!w-6 !h-6 !text-white" />
              </div>
              <div>
                <h2 className="!text-2xl !font-bold !text-slate-900">Proyectos de Compensación</h2>
                <p className="!text-sm !text-slate-500">Proyectos activos y disponibles</p>
              </div>
            </div>

            <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-6">
              {[
                { name: 'Reforestación Amazonía', location: 'Brasil', capacity: '12,500 t/año', investment: '$45,200', progress: 78, color: 'green' },
                { name: 'Eólica Marina', location: 'España', capacity: '8,200 t/año', investment: '$28,100', progress: 64, color: 'blue' },
                { name: 'Conservación Azul', location: 'Portugal', capacity: '5,600 t/año', investment: '$11,092', progress: 45, color: 'cyan' }
              ].map((project, idx) => (
                <div key={idx} className="!bg-white !rounded-2xl !p-6 !shadow-lg !border !border-slate-200 hover:!shadow-xl !transition-all">
                  <div className="!flex !items-center !justify-between !mb-3">
                    <span className={`!px-3 !py-1 !rounded-full !text-xs !font-semibold !bg-${project.color}-100 !text-${project.color}-700`}>
                      {project.location}
                    </span>
                  </div>
                  <h3 className="!text-lg !font-bold !text-slate-900 !mb-2">{project.name}</h3>
                  <div className="!space-y-2 !text-sm !text-slate-600 !mb-4">
                    <div>Capacidad: <span className="!font-semibold !text-slate-900">{project.capacity}</span></div>
                    <div>Inversión: <span className="!font-semibold !text-emerald-600">{project.investment}</span></div>
                  </div>
                  <div>
                    <div className="!flex !justify-between !text-xs !text-slate-500 !mb-2">
                      <span>Progreso</span>
                      <span className="!font-semibold">{project.progress}%</span>
                    </div>
                    <div className="!w-full !h-2 !bg-slate-200 !rounded-full !overflow-hidden">
                      <div 
                        className={`!h-2 !bg-gradient-to-r !from-${project.color}-400 !to-${project.color}-600 !rounded-full`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
