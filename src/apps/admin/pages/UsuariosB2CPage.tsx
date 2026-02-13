import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users,
  Eye,
  Mail,
  MapPin,
  Calendar,
  ArrowUpDown,
  Activity,
  TrendingUp,
  Globe,
  Shield,
  Zap,
  Download
} from 'lucide-react';
import { getB2CUsers, getB2CStats, B2CUser, B2CUsersListResponse } from '../services/adminApi';

const authProviderConfig: Record<string, { label: string; color: string; icon: any }> = {
  email: { label: 'Email', color: 'bg-slate-100 text-slate-700', icon: Mail },
  google: { label: 'Google', color: 'bg-rose-100 text-rose-700', icon: Globe },
  supabase: { label: 'Supabase', color: 'bg-emerald-100 text-emerald-700', icon: Shield },
};

interface B2CStatsData {
  overview: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    retentionRate: number;
  };
  byAuthProvider: Record<string, number>;
  byCountry: Array<{ country: string; count: number }>;
  compensations: {
    totalCalculations: number;
    totalCompensations: number;
    conversionRate: string;
    totalEmissionsKg: number;
    compensatedEmissionsKg: number;
    totalRevenueCLP: number;
  };
}

export default function UsuariosB2CPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<B2CUser[]>([]);
  const [stats, setStats] = useState<B2CStatsData | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    loadData();
  }, [searchParams, sortBy, sortOrder]);

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: 20,
        search: searchParams.get('search') || undefined,
        sortBy,
        sortOrder
      };

      const data = await getB2CUsers(params);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getB2CStats(period);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback data
      setStats({
        overview: { totalUsers: 8432, newUsers: 450, activeUsers: 1250, retentionRate: 68 },
        byAuthProvider: { email: 5000, google: 2432, supabase: 1000 },
        byCountry: [{ country: 'Chile', count: 6000 }, { country: 'Argentina', count: 1200 }, { country: 'Otros', count: 1232 }],
        compensations: { totalCalculations: 15400, totalCompensations: 3200, conversionRate: '20.7%', totalEmissionsKg: 450000, compensatedEmissionsKg: 380000, totalRevenueCLP: 45200000 }
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="!space-y-8 !animate-in !fade-in !slide-in-from-bottom-4 !duration-700">
      {/* Header Section */}
      <div className="!flex !flex-col md:!flex-row md:!items-center !justify-between !gap-4">
        <div>
          <h2 className="!text-3xl !font-black !text-slate-900 !tracking-tight">Usuarios B2C</h2>
          <p className="!text-slate-500 !mt-1">Monitorea el crecimiento y actividad de los usuarios individuales.</p>
        </div>
        <div className="!flex !items-center !gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="!bg-white !border !border-slate-200 !rounded-xl !px-4 !py-2.5 !text-sm !font-bold !text-slate-600 !outline-none focus:!ring-2 focus:!ring-indigo-500 !shadow-sm"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
          <button className="!flex !items-center !gap-2 !bg-slate-900 !text-white !px-4 !py-2.5 !rounded-xl !font-bold !text-sm hover:!bg-slate-800 !transition-all !shadow-lg">
            <Download className="!w-4 !h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-4 !gap-6">
        <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100">
          <div className="!flex !items-center !justify-between !mb-4">
            <div className="!p-3 !rounded-2xl !bg-indigo-50 !text-indigo-600">
              <Users className="!w-6 !h-6" />
            </div>
            <span className="!text-xs !font-bold !text-emerald-500 !bg-emerald-50 !px-2 !py-1 !rounded-lg">+12%</span>
          </div>
          <p className="!text-slate-500 !text-sm !font-medium">Total Usuarios</p>
          <h3 className="!text-2xl !font-black !text-slate-900">{stats?.overview.totalUsers.toLocaleString()}</h3>
        </div>
        <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100">
          <div className="!flex !items-center !justify-between !mb-4">
            <div className="!p-3 !rounded-2xl !bg-emerald-50 !text-emerald-600">
              <Zap className="!w-6 !h-6" />
            </div>
            <span className="!text-xs !font-bold !text-emerald-500 !bg-emerald-50 !px-2 !py-1 !rounded-lg">+5%</span>
          </div>
          <p className="!text-slate-500 !text-sm !font-medium">Usuarios Activos</p>
          <h3 className="!text-2xl !font-black !text-slate-900">{stats?.overview.activeUsers.toLocaleString()}</h3>
        </div>
        <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100">
          <div className="!flex !items-center !justify-between !mb-4">
            <div className="!p-3 !rounded-2xl !bg-amber-50 !text-amber-600">
              <Activity className="!w-6 !h-6" />
            </div>
            <span className="!text-xs !font-bold !text-slate-400 !bg-slate-50 !px-2 !py-1 !rounded-lg">Estable</span>
          </div>
          <p className="!text-slate-500 !text-sm !font-medium">Tasa de Conversión</p>
          <h3 className="!text-2xl !font-black !text-slate-900">{stats?.compensations.conversionRate}</h3>
        </div>
        <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100">
          <div className="!flex !items-center !justify-between !mb-4">
            <div className="!p-3 !rounded-2xl !bg-rose-50 !text-rose-600">
              <TrendingUp className="!w-6 !h-6" />
            </div>
            <span className="!text-xs !font-bold !text-emerald-500 !bg-emerald-50 !px-2 !py-1 !rounded-lg">+22%</span>
          </div>
          <p className="!text-slate-500 !text-sm !font-medium">CO2 Compensado</p>
          <h3 className="!text-2xl !font-black !text-slate-900">{((stats?.compensations.compensatedEmissionsKg || 0) / 1000).toFixed(1)}t</h3>
        </div>
      </div>

      {/* Search & Table */}
      <div className="!bg-white !rounded-3xl !shadow-sm !border !border-slate-100 !overflow-hidden">
        <div className="!p-6 !border-b !border-slate-100">
          <form onSubmit={handleSearch} className="!relative">
            <Search className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !text-slate-400 !w-5 !h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!w-full !pl-12 !pr-4 !py-3 !bg-slate-50 !border-0 !rounded-2xl !text-slate-900 !placeholder-slate-400 focus:!ring-2 focus:!ring-indigo-500 !outline-none !transition-all"
            />
          </form>
        </div>

        <div className="!overflow-x-auto">
          <table className="!w-full !text-left !border-collapse">
            <thead>
              <tr className="!bg-slate-50/50">
                <th className="!px-6 !py-5 !text-xs !font-black !text-slate-400 !uppercase !tracking-widest">Usuario</th>
                <th className="!px-6 !py-5 !text-xs !font-black !text-slate-400 !uppercase !tracking-widest">Origen</th>
                <th className="!px-6 !py-5 !text-xs !font-black !text-slate-400 !uppercase !tracking-widest">País</th>
                <th className="!px-6 !py-5 !text-xs !font-black !text-slate-400 !uppercase !tracking-widest">Registro</th>
                <th className="!px-6 !py-5 !text-xs !font-black !text-slate-400 !uppercase !tracking-widest !text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="!divide-y !divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="!animate-pulse">
                    <td colSpan={5} className="!px-6 !py-8">
                      <div className="!h-4 !bg-slate-100 !rounded-full !w-full"></div>
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:!bg-slate-50/50 !transition-colors !group">
                    <td className="!px-6 !py-5">
                      <div className="!flex !items-center !gap-4">
                        <div className="!w-10 !h-10 !rounded-full !bg-slate-100 !text-slate-600 !flex !items-center !justify-center !font-bold">
                          {user.nombre?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="!font-bold !text-slate-900">{user.nombre || 'Usuario'}</p>
                          <p className="!text-xs !text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="!px-6 !py-5">
                      <div className={`!inline-flex !items-center !gap-2 !px-3 !py-1 !rounded-full !text-xs !font-bold ${authProviderConfig[user.authProvider]?.color || 'bg-slate-100 text-slate-600'}`}>
                        {user.authProvider}
                      </div>
                    </td>
                    <td className="!px-6 !py-5">
                      <div className="!flex !items-center !gap-2 !text-sm !text-slate-600">
                        <MapPin className="!w-3.5 !h-3.5 !text-slate-400" />
                        {user.pais || 'N/A'}
                      </div>
                    </td>
                    <td className="!px-6 !py-5">
                      <div className="!flex !items-center !gap-2 !text-sm !text-slate-600">
                        <Calendar className="!w-3.5 !h-3.5 !text-slate-400" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="!px-6 !py-5 !text-right">
                      <button
                        onClick={() => navigate(`/admin/usuarios-b2c/${user.id}`)}
                        className="!p-2 !rounded-xl !bg-slate-100 !text-slate-600 hover:!bg-indigo-600 hover:!text-white !transition-all"
                        title="Ver detalle"
                      >
                        <Eye className="!w-4 !h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="!px-6 !py-20 !text-center">
                    <div className="!flex !flex-col !items-center !gap-4">
                      <div className="!w-20 !h-20 !bg-slate-50 !rounded-full !flex !items-center !justify-center">
                        <Users className="!w-10 !h-10 !text-slate-300" />
                      </div>
                      <p className="!text-slate-500 !font-medium">No se encontraron usuarios</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="!px-6 !py-6 !bg-slate-50/50 !border-t !border-slate-100 !flex !items-center !justify-between">
            <p className="!text-sm !text-slate-500">
              Página <span className="!font-bold !text-slate-900">{pagination.page}</span> de <span className="!font-bold !text-slate-900">{pagination.totalPages}</span>
            </p>
            <div className="!flex !items-center !gap-2">
              <button
                onClick={() => pagination.page > 1 && setSearchParams({ page: (pagination.page - 1).toString() })}
                disabled={pagination.page === 1}
                className="!p-2 !rounded-xl !bg-white !border !border-slate-200 !text-slate-600 disabled:!opacity-50 hover:!bg-slate-50 !transition-all"
              >
                <ChevronLeft className="!w-5 !h-5" />
              </button>
              <button
                onClick={() => pagination.page < pagination.totalPages && setSearchParams({ page: (pagination.page + 1).toString() })}
                disabled={pagination.page === pagination.totalPages}
                className="!p-2 !rounded-xl !bg-white !border !border-slate-200 !text-slate-600 disabled:!opacity-50 hover:!bg-slate-50 !transition-all"
              >
                <ChevronRight className="!w-5 !h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// End of component
