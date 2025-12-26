import { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  TreePine, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Globe,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { getDashboard, getMetrics, DashboardData, MetricsData } from '../services/adminApi';

const data = [
  { name: 'Ene', b2b: 4000, b2c: 2400 },
  { name: 'Feb', b2b: 3000, b2c: 1398 },
  { name: 'Mar', b2b: 2000, b2c: 9800 },
  { name: 'Abr', b2b: 2780, b2c: 3908 },
  { name: 'May', b2b: 1890, b2c: 4800 },
  { name: 'Jun', b2b: 2390, b2c: 3800 },
];

const pieData = [
  { name: 'B2B Corporativo', value: 400 },
  { name: 'B2C Individual', value: 300 },
  { name: 'Partners', value: 300 },
];

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, change, trend, icon: Icon, color }: StatCardProps) {
  return (
    <div className="!bg-white !rounded-3xl !p-6 !shadow-sm !border !border-slate-100 !relative !overflow-hidden !group hover:!shadow-xl hover:!shadow-indigo-500/10 !transition-all !duration-500">
      <div className={`!absolute !top-0 !right-0 !w-32 !h-32 !bg-gradient-to-br ${color} !opacity-[0.03] !rounded-bl-full !transition-transform group-hover:!scale-110`}></div>
      
      <div className="!flex !items-start !justify-between !mb-4">
        <div className={`!p-3 !rounded-2xl !bg-gradient-to-br ${color} !text-white !shadow-lg !shadow-indigo-500/20`}>
          <Icon className="!w-6 !h-6" />
        </div>
        {change && (
          <div className={`!flex !items-center !gap-1 !text-sm !font-bold ${trend === 'up' ? '!text-emerald-500' : trend === 'down' ? '!text-rose-500' : '!text-slate-500'}`}>
            {trend === 'up' ? <ArrowUpRight className="!w-4 !h-4" /> : trend === 'down' ? <ArrowDownRight className="!w-4 !h-4" /> : null}
            {change}
          </div>
        )}
      </div>
      
      <div>
        <p className="!text-slate-500 !text-sm !font-medium !mb-1">{title}</p>
        <h3 className="!text-3xl !font-black !text-slate-900 !tracking-tight">{value}</h3>
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashboardData, metricsData] = await Promise.all([
        getDashboard(),
        getMetrics(period)
      ]);
      setDashboard(dashboardData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Default data for demo/fallback
      setDashboard({
        overview: {
          totalCompanies: 124,
          activeCompanies: 110,
          pendingVerification: 5,
          totalB2CUsers: 8432,
          activeB2CUsers30d: 1250,
          totalEmissionsKg: 450000,
          totalCompensatedKg: 380000,
          compensationRate: 84.4,
          totalRevenueCLP: 45200000
        },
        companies: { total: 124, active: 110, pending: 5, registered: 9, suspended: 0, byStatus: { 'Activa': 110, 'Pendiente': 5, 'Registrada': 9 } },
        b2c: { total: 8432, active30d: 1250, newThisMonth: 450, withCompensations: 3200, totalCalculations: 15400 },
        emissions: { totalCalculated: 450000, totalCompensated: 380000, compensationRate: 84.4, totalRevenue: 45200000 },
        verification: { companies: 5, documents: 12, total: 17 },
        recentActivity: [],
        alerts: [],
        workQueue: { pendingCompanies: 5, pendingDocuments: 12, total: 17 }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="!flex !items-center !justify-center !h-[60vh]">
        <div className="!relative !w-20 !h-20">
          <div className="!absolute !inset-0 !border-4 !border-indigo-100 !rounded-full"></div>
          <div className="!absolute !inset-0 !border-4 !border-indigo-600 !border-t-transparent !rounded-full !animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="!space-y-8 !animate-in !fade-in !slide-in-from-bottom-4 !duration-700">
      {/* Welcome Section */}
      <div className="!flex !flex-col md:!flex-row md:!items-center !justify-between !gap-4">
        <div>
          <h2 className="!text-3xl !font-black !text-slate-900 !tracking-tight">Vista General</h2>
          <p className="!text-slate-500 !mt-1">Monitoreo en tiempo real de la plataforma global.</p>
        </div>
        <div className="!flex !items-center !gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="!bg-white !border !border-slate-200 !rounded-xl !px-4 !py-2 !text-sm !font-bold !text-slate-600 !outline-none focus:!ring-2 focus:!ring-indigo-500 !shadow-sm"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="365d">Último año</option>
          </select>
          <div className="!flex !items-center !gap-2 !bg-emerald-50 !px-3 !py-2 !rounded-xl !border !border-emerald-100">
            <div className="!w-2 !h-2 !bg-emerald-500 !rounded-full !animate-pulse"></div>
            <span className="!text-xs !font-bold !text-emerald-700">SISTEMA ONLINE</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-4 !gap-6">
        <StatCard
          title="Empresas B2B"
          value={dashboard?.overview.totalCompanies || 0}
          change="+12%"
          trend="up"
          icon={Building2}
          color="!from-indigo-500 !to-blue-600"
        />
        <StatCard
          title="Usuarios B2C"
          value={dashboard?.overview.totalB2CUsers || 0}
          change="+18%"
          trend="up"
          icon={Users}
          color="!from-purple-500 !to-pink-600"
        />
        <StatCard
          title="CO2 Compensado"
          value={`${((dashboard?.overview.totalCompensatedKg || 0) / 1000).toFixed(1)}t`}
          change="+24%"
          trend="up"
          icon={TreePine}
          color="!from-emerald-500 !to-teal-600"
        />
        <StatCard
          title="Ingresos Totales"
          value={`$${((dashboard?.overview.totalRevenueCLP || 0) / 1000000).toFixed(1)}M`}
          change="-3%"
          trend="down"
          icon={TrendingUp}
          color="!from-amber-500 !to-orange-600"
        />
      </div>

      {/* Charts Section */}
      <div className="!grid !grid-cols-1 lg:!grid-cols-3 !gap-8">
        {/* Main Growth Chart */}
        <div className="lg:!col-span-2 !bg-white !p-8 !rounded-3xl !shadow-sm !border !border-slate-100">
          <div className="!flex !items-center !justify-between !mb-8">
            <div>
              <h3 className="!text-xl !font-bold !text-slate-900">Crecimiento de Usuarios</h3>
              <p className="!text-sm !text-slate-500">Comparativa B2B vs B2C mensual</p>
            </div>
          </div>
          <div className="!h-[350px] !w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorB2B" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorB2C" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="b2b" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorB2B)" />
                <Area type="monotone" dataKey="b2c" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorB2C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="!bg-white !p-8 !rounded-3xl !shadow-sm !border !border-slate-100">
          <h3 className="!text-xl !font-bold !text-slate-900 !mb-2">Distribución</h3>
          <p className="!text-sm !text-slate-500 !mb-8">Por tipo de cliente</p>
          <div className="!h-[250px] !w-full !relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="!absolute !inset-0 !flex !items-center !justify-center !flex-col !pointer-events-none">
              <span className="!text-2xl !font-black !text-slate-900">1,100</span>
              <span className="!text-[10px] !uppercase !tracking-widest !text-slate-400 !font-bold">Total</span>
            </div>
          </div>
          <div className="!mt-8 !space-y-3">
            {pieData.map((item, idx) => (
              <div key={item.name} className="!flex !items-center !justify-between">
                <div className="!flex !items-center !gap-2">
                  <div className="!w-3 !h-3 !rounded-full" style={{backgroundColor: COLORS[idx]}}></div>
                  <span className="!text-sm !text-slate-600">{item.name}</span>
                </div>
                <span className="!text-sm !font-bold !text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="!grid !grid-cols-1 lg:!grid-cols-2 !gap-8">
        {/* Recent Activity */}
        <div className="!bg-white !p-8 !rounded-3xl !shadow-sm !border !border-slate-100">
          <div className="!flex !items-center !justify-between !mb-6">
            <h3 className="!text-xl !font-bold !text-slate-900">Alertas y Pendientes</h3>
            <button className="!text-indigo-600 !text-sm !font-bold hover:!underline !bg-transparent !border-0">Ver todo</button>
          </div>
          <div className="!space-y-6">
            {dashboard?.workQueue.pendingCompanies ? (
              <div className="!flex !items-center !gap-4 !group !p-4 !bg-amber-50 !rounded-2xl !border !border-amber-100">
                <div className="!p-3 !rounded-2xl !bg-amber-100 !text-amber-600">
                  <AlertTriangle className="!w-5 !h-5" />
                </div>
                <div className="!flex-1">
                  <p className="!text-sm !font-bold !text-slate-900">{dashboard.workQueue.pendingCompanies} Empresas pendientes</p>
                  <p className="!text-xs !text-slate-500">Requieren verificación de documentos</p>
                </div>
                <button className="!bg-amber-600 !text-white !px-4 !py-2 !rounded-xl !text-xs !font-bold">Revisar</button>
              </div>
            ) : null}
            
            {[
              { user: 'TechCorp S.A.', action: 'Nueva suscripción B2B', time: 'Hace 5 min', icon: Zap, color: '!bg-indigo-100 !text-indigo-600' },
              { user: 'Juan Pérez', action: 'Compensación de vuelo', time: 'Hace 12 min', icon: Globe, color: '!bg-emerald-100 !text-emerald-600' },
              { user: 'Sistema', action: 'Backup completado', time: 'Hace 45 min', icon: ShieldCheck, color: '!bg-blue-100 !text-blue-600' },
            ].map((item, i) => (
              <div key={i} className="!flex !items-center !gap-4 !group">
                <div className={`!p-3 !rounded-2xl ${item.color} !transition-transform group-hover:!scale-110`}>
                  <item.icon className="!w-5 !h-5" />
                </div>
                <div className="!flex-1">
                  <p className="text-sm !font-bold !text-slate-900">{item.user}</p>
                  <p className="text-xs !text-slate-500">{item.action}</p>
                </div>
                <span className="text-xs !text-slate-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="!bg-gradient-to-br !from-slate-900 !to-slate-800 !p-8 !rounded-3xl !shadow-xl !text-white">
          <h3 className="!text-xl !font-bold !mb-6 !flex !items-center !gap-2">
            <Activity className="!text-indigo-400" />
            Estado del Sistema
          </h3>
          <div className="!space-y-6">
            {[
              { label: 'API Gateway', status: 'Operacional', value: 99.9, color: '!bg-emerald-500' },
              { label: 'Base de Datos', status: 'Operacional', value: 98.5, color: '!bg-emerald-500' },
              { label: 'Servicios de Pago', status: 'Latencia Alta', value: 75, color: '!bg-amber-500' },
            ].map((sys, i) => (
              <div key={i}>
                <div className="!flex !justify-between !mb-2">
                  <span className="!text-sm !font-medium !text-slate-300">{sys.label}</span>
                  <span className={`!text-xs !font-bold ${sys.value > 90 ? '!text-emerald-400' : '!text-amber-400'}`}>{sys.status}</span>
                </div>
                <div className="!h-2 !bg-white/10 !rounded-full !overflow-hidden">
                  <div 
                    className={`!h-full ${sys.color} !transition-all !duration-1000`} 
                    style={{ width: `${sys.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="!mt-8 !p-4 !bg-white/5 !rounded-2xl !border !border-white/10">
            <p className="!text-xs !text-slate-400 !leading-relaxed">
              Todos los sistemas están siendo monitoreados. Próximo mantenimiento programado: <span className="!text-white !font-bold">Domingo 02:00 AM</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
