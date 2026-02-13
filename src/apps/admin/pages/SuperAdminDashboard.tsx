import { useState, useEffect, useMemo } from 'react';
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
  DollarSign,
  Inbox,
  UserPlus,
  FileText
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

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  return (
    <div className="!bg-white !rounded-3xl !p-6 !shadow-sm !border !border-slate-100 !relative !overflow-hidden !group hover:!shadow-xl hover:!shadow-indigo-500/10 !transition-all !duration-500">
      <div className={`!absolute !top-0 !right-0 !w-32 !h-32 !bg-gradient-to-br ${color} !opacity-[0.03] !rounded-bl-full !transition-transform group-hover:!scale-110`}></div>
      
      <div className="!flex !items-start !justify-between !mb-4">
        <div className={`!p-3 !rounded-2xl !bg-gradient-to-br ${color} !text-white !shadow-lg !shadow-indigo-500/20`}>
          <Icon className="!w-6 !h-6" />
        </div>
        {subtitle && (
          <span className="!text-xs !font-semibold !text-slate-400 !bg-slate-50 !px-2 !py-1 !rounded-lg">{subtitle}</span>
        )}
      </div>
      
      <div>
        <p className="!text-slate-500 !text-sm !font-medium !mb-1">{title}</p>
        <h3 className="!text-3xl !font-black !text-slate-900 !tracking-tight">{value}</h3>
      </div>
    </div>
  );
}

/** Helper: format relative time in Spanish */
function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `Hace ${diffD}d`;
}

/** Icon & color for activity types */
function activityMeta(type: string) {
  switch (type) {
    case 'company_registered':
      return { icon: Building2, color: '!bg-indigo-100 !text-indigo-600' };
    case 'b2c_user_registered':
      return { icon: UserPlus, color: '!bg-emerald-100 !text-emerald-600' };
    case 'document_uploaded':
      return { icon: FileText, color: '!bg-blue-100 !text-blue-600' };
    default:
      return { icon: Zap, color: '!bg-purple-100 !text-purple-600' };
  }
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
      const [dashboardData, metricsData] = await Promise.allSettled([
        getDashboard(),
        getMetrics(period)
      ]);
      if (dashboardData.status === 'fulfilled') {
        setDashboard(dashboardData.value);
      } else {
        console.error('Error loading dashboard:', dashboardData.reason);
        // Fallback con zeros
        setDashboard({
          overview: { totalCompanies: 0, activeCompanies: 0, pendingVerification: 0, totalB2CUsers: 0, activeB2CUsers30d: 0, totalEmissionsKg: 0, totalCompensatedKg: 0, compensationRate: 0, totalRevenueCLP: 0 },
          companies: { total: 0, active: 0, pending: 0, registered: 0, suspended: 0, byStatus: {} },
          b2c: { total: 0, active30d: 0, newThisMonth: 0, withCompensations: 0, totalCalculations: 0 },
          emissions: { totalCalculated: 0, totalCompensated: 0, compensationRate: 0, totalRevenue: 0 },
          verification: { companies: 0, documents: 0, total: 0 },
          recentActivity: [],
          alerts: [],
          workQueue: { pendingCompanies: 0, pendingDocuments: 0, total: 0 }
        });
      }
      if (metricsData.status === 'fulfilled') {
        setMetrics(metricsData.value);
      } else {
        console.error('Error loading metrics:', metricsData.reason);
        setMetrics(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Build chart data from metrics API (newCompanies + newB2CUsers series)
  const chartData = useMemo(() => {
    if (!metrics?.newCompanies?.series?.length && !metrics?.newB2CUsers?.series?.length) return [];

    const companiesSeries = metrics?.newCompanies?.series || [];
    const b2cSeries = metrics?.newB2CUsers?.series || [];

    // Aggregate daily series into monthly buckets
    const monthlyMap = new Map<string, { b2b: number; b2c: number }>();
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    companiesSeries.forEach((item) => {
      const d = new Date(item.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const existing = monthlyMap.get(key) || { b2b: 0, b2c: 0 };
      existing.b2b += item.count || 0;
      monthlyMap.set(key, existing);
    });

    b2cSeries.forEach((item) => {
      const d = new Date(item.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const existing = monthlyMap.get(key) || { b2b: 0, b2c: 0 };
      existing.b2c += item.count || 0;
      monthlyMap.set(key, existing);
    });

    // Sort by date and build output
    const sortedKeys = Array.from(monthlyMap.keys()).sort();
    return sortedKeys.map(key => {
      const [, monthIdx] = key.split('-');
      const vals = monthlyMap.get(key)!;
      return { name: monthNames[parseInt(monthIdx)], b2b: vals.b2b, b2c: vals.b2c };
    });
  }, [metrics]);

  // Build pie data from real dashboard numbers
  const pieData = useMemo(() => {
    if (!dashboard) return [];
    const items = [
      { name: 'Empresas B2B', value: dashboard.companies?.total || 0 },
      { name: 'Usuarios B2C', value: dashboard.b2c?.total || 0 },
      { name: 'Pendientes', value: dashboard.workQueue?.total || 0 },
    ];
    // Only return items that have some value
    return items.filter(i => i.value > 0).length > 0 ? items : [];
  }, [dashboard]);

  const pieTotal = useMemo(() => pieData.reduce((acc, i) => acc + i.value, 0), [pieData]);

  // Format big numbers
  const formatNumber = (n: number): string => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
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

      {/* Stats Grid - Real data from dashboard API */}
      <div className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-4 !gap-6">
        <StatCard
          title="Empresas B2B"
          value={dashboard?.overview?.totalCompanies ?? 0}
          subtitle={`${dashboard?.overview?.activeCompanies ?? 0} activas`}
          icon={Building2}
          color="!from-indigo-500 !to-blue-600"
        />
        <StatCard
          title="Usuarios B2C"
          value={formatNumber(dashboard?.overview?.totalB2CUsers ?? 0)}
          subtitle={`${dashboard?.b2c?.newThisMonth ?? 0} nuevos este mes`}
          icon={Users}
          color="!from-purple-500 !to-pink-600"
        />
        <StatCard
          title="CO2 Compensado"
          value={dashboard?.overview?.totalCompensatedKg ? `${((dashboard.overview.totalCompensatedKg) / 1000).toFixed(1)}t` : '0t'}
          subtitle={`Tasa: ${dashboard?.overview?.compensationRate ?? 0}%`}
          icon={TreePine}
          color="!from-emerald-500 !to-teal-600"
        />
        <StatCard
          title="Ingresos Totales"
          value={dashboard?.overview?.totalRevenueCLP ? `$${formatNumber(dashboard.overview.totalRevenueCLP)}` : '$0'}
          subtitle="CLP"
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
              <h3 className="!text-xl !font-bold !text-slate-900">Crecimiento de Registros</h3>
              <p className="!text-sm !text-slate-500">Nuevas empresas B2B y usuarios B2C por período</p>
            </div>
          </div>
          {chartData.length > 0 ? (
            <div className="!h-[350px] !w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
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
                    formatter={(value: number, name: string) => [value, name === 'b2b' ? 'Empresas B2B' : 'Usuarios B2C']}
                  />
                  <Area type="monotone" dataKey="b2b" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorB2B)" name="b2b" />
                  <Area type="monotone" dataKey="b2c" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorB2C)" name="b2c" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="!h-[350px] !w-full !flex !items-center !justify-center !flex-col !gap-3">
              <Inbox className="!w-16 !h-16 !text-slate-200" />
              <p className="!text-slate-400 !font-medium">Sin datos de crecimiento para este período</p>
            </div>
          )}
        </div>

        {/* Distribution Chart */}
        <div className="!bg-white !p-8 !rounded-3xl !shadow-sm !border !border-slate-100">
          <h3 className="!text-xl !font-bold !text-slate-900 !mb-2">Distribución</h3>
          <p className="!text-sm !text-slate-500 !mb-8">Usuarios por tipo</p>
          {pieData.length > 0 && pieTotal > 0 ? (
            <>
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
                      {pieData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="!absolute !inset-0 !flex !items-center !justify-center !flex-col !pointer-events-none">
                  <span className="!text-2xl !font-black !text-slate-900">{formatNumber(pieTotal)}</span>
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
                    <span className="!text-sm !font-bold !text-slate-900">{formatNumber(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="!h-[250px] !w-full !flex !items-center !justify-center !flex-col !gap-3">
              <Inbox className="!w-12 !h-12 !text-slate-200" />
              <p className="!text-slate-400 !font-medium !text-sm">Sin datos</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="!grid !grid-cols-1 lg:!grid-cols-2 !gap-8">
        {/* Recent Activity - Real data */}
        <div className="!bg-white !p-8 !rounded-3xl !shadow-sm !border !border-slate-100">
          <div className="!flex !items-center !justify-between !mb-6">
            <h3 className="!text-xl !font-bold !text-slate-900">Alertas y Actividad Reciente</h3>
          </div>
          <div className="!space-y-4">
            {/* Pending work queue alerts */}
            {(dashboard?.workQueue?.pendingCompanies ?? 0) > 0 && (
              <div className="!flex !items-center !gap-4 !p-4 !bg-amber-50 !rounded-2xl !border !border-amber-100">
                <div className="!p-3 !rounded-2xl !bg-amber-100 !text-amber-600">
                  <AlertTriangle className="!w-5 !h-5" />
                </div>
                <div className="!flex-1">
                  <p className="!text-sm !font-bold !text-slate-900">{dashboard!.workQueue.pendingCompanies} Empresas pendientes</p>
                  <p className="!text-xs !text-slate-500">Requieren verificación de documentos</p>
                </div>
              </div>
            )}

            {(dashboard?.workQueue?.pendingDocuments ?? 0) > 0 && (
              <div className="!flex !items-center !gap-4 !p-4 !bg-blue-50 !rounded-2xl !border !border-blue-100">
                <div className="!p-3 !rounded-2xl !bg-blue-100 !text-blue-600">
                  <FileText className="!w-5 !h-5" />
                </div>
                <div className="!flex-1">
                  <p className="!text-sm !font-bold !text-slate-900">{dashboard!.workQueue.pendingDocuments} Documentos pendientes</p>
                  <p className="!text-xs !text-slate-500">Documentos por revisar</p>
                </div>
              </div>
            )}

            {/* API alerts */}
            {dashboard?.alerts?.map((alert, i) => (
              <div key={`alert-${i}`} className={`!flex !items-center !gap-4 !p-4 !rounded-2xl !border ${
                alert.type === 'error' ? '!bg-red-50 !border-red-100' :
                alert.type === 'warning' ? '!bg-amber-50 !border-amber-100' :
                '!bg-blue-50 !border-blue-100'
              }`}>
                <div className={`!p-3 !rounded-2xl ${
                  alert.type === 'error' ? '!bg-red-100 !text-red-600' :
                  alert.type === 'warning' ? '!bg-amber-100 !text-amber-600' :
                  '!bg-blue-100 !text-blue-600'
                }`}>
                  <AlertTriangle className="!w-5 !h-5" />
                </div>
                <div className="!flex-1">
                  <p className="!text-sm !font-bold !text-slate-900">{alert.message}</p>
                </div>
              </div>
            ))}

            {/* Recent activity from API */}
            {(dashboard?.recentActivity?.length ?? 0) > 0 ? (
              dashboard!.recentActivity.slice(0, 5).map((item, i) => {
                const meta = activityMeta(item.type);
                const IconComp = meta.icon;
                return (
                  <div key={`activity-${i}`} className="!flex !items-center !gap-4 !group">
                    <div className={`!p-3 !rounded-2xl ${meta.color} !transition-transform group-hover:!scale-110`}>
                      <IconComp className="!w-5 !h-5" />
                    </div>
                    <div className="!flex-1">
                      <p className="!text-sm !font-bold !text-slate-900">{item.description}</p>
                      <p className="!text-xs !text-slate-500">{item.entityType}</p>
                    </div>
                    <span className="!text-xs !text-slate-400">{timeAgo(item.timestamp)}</span>
                  </div>
                );
              })
            ) : (
              (dashboard?.workQueue?.total ?? 0) === 0 && (dashboard?.alerts?.length ?? 0) === 0 && (
                <div className="!flex !items-center !justify-center !py-8 !flex-col !gap-2">
                  <CheckCircle2 className="!w-10 !h-10 !text-emerald-300" />
                  <p className="!text-slate-400 !font-medium !text-sm">Sin actividad reciente ni alertas pendientes</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Platform Summary */}
        <div className="!bg-gradient-to-br !from-slate-900 !to-slate-800 !p-8 !rounded-3xl !shadow-xl !text-white">
          <h3 className="!text-xl !font-bold !mb-6 !flex !items-center !gap-2">
            <Activity className="!text-indigo-400" />
            Resumen de Plataforma
          </h3>
          <div className="!space-y-5">
            {/* Companies breakdown */}
            <div>
              <div className="!flex !justify-between !mb-2">
                <span className="!text-sm !font-medium !text-slate-300">Empresas Activas</span>
                <span className="!text-xs !font-bold !text-emerald-400">{dashboard?.companies?.active ?? 0} / {dashboard?.companies?.total ?? 0}</span>
              </div>
              <div className="!h-2 !bg-white/10 !rounded-full !overflow-hidden">
                <div 
                  className="!h-full !bg-emerald-500 !transition-all !duration-1000 !rounded-full" 
                  style={{ width: `${dashboard?.companies?.total ? ((dashboard.companies.active / dashboard.companies.total) * 100) : 0}%` }}
                ></div>
              </div>
            </div>

            {/* B2C active users */}
            <div>
              <div className="!flex !justify-between !mb-2">
                <span className="!text-sm !font-medium !text-slate-300">Usuarios B2C Activos (30d)</span>
                <span className="!text-xs !font-bold !text-purple-400">{dashboard?.b2c?.active30d ?? 0} / {dashboard?.b2c?.total ?? 0}</span>
              </div>
              <div className="!h-2 !bg-white/10 !rounded-full !overflow-hidden">
                <div 
                  className="!h-full !bg-purple-500 !transition-all !duration-1000 !rounded-full" 
                  style={{ width: `${dashboard?.b2c?.total ? ((dashboard.b2c.active30d / dashboard.b2c.total) * 100) : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Compensation rate */}
            <div>
              <div className="!flex !justify-between !mb-2">
                <span className="!text-sm !font-medium !text-slate-300">Tasa de Compensación</span>
                <span className="!text-xs !font-bold !text-amber-400">{dashboard?.emissions?.compensationRate ?? 0}%</span>
              </div>
              <div className="!h-2 !bg-white/10 !rounded-full !overflow-hidden">
                <div 
                  className="!h-full !bg-amber-500 !transition-all !duration-1000 !rounded-full" 
                  style={{ width: `${dashboard?.emissions?.compensationRate ?? 0}%` }}
                ></div>
              </div>
            </div>

            {/* Pending verifications */}
            <div>
              <div className="!flex !justify-between !mb-2">
                <span className="!text-sm !font-medium !text-slate-300">Verificaciones Pendientes</span>
                <span className="!text-xs !font-bold !text-rose-400">{dashboard?.verification?.total ?? 0}</span>
              </div>
              <div className="!h-2 !bg-white/10 !rounded-full !overflow-hidden">
                <div 
                  className="!h-full !bg-rose-500 !transition-all !duration-1000 !rounded-full" 
                  style={{ width: `${Math.min((dashboard?.verification?.total ?? 0) * 5, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="!mt-6 !grid !grid-cols-2 !gap-3">
            <div className="!p-4 !bg-white/5 !rounded-2xl !border !border-white/10 !text-center">
              <p className="!text-2xl !font-black !text-white">{dashboard?.b2c?.withCompensations ?? 0}</p>
              <p className="!text-[10px] !uppercase !tracking-widest !text-slate-400 !font-bold !mt-1">Con Compensaciones</p>
            </div>
            <div className="!p-4 !bg-white/5 !rounded-2xl !border !border-white/10 !text-center">
              <p className="!text-2xl !font-black !text-white">{formatNumber(dashboard?.b2c?.totalCalculations ?? 0)}</p>
              <p className="!text-[10px] !uppercase !tracking-widest !text-slate-400 !font-bold !mt-1">Cálculos Totales</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
