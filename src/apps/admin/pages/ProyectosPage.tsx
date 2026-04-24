/**
 * Proyectos ESG - Inventario Vivo
 * 
 * Panel de gestión del portafolio de proyectos que ya pasaron por la Cabina de Control.
 * Muestra proyectos activos, pausados, completados y rechazados.
 * 
 * SEPARACIÓN DE RESPONSABILIDADES:
 * - Cabina de Control (ProjectsReviewPage): Onboarding de proyectos nuevos (pending_review → approved → active)
 * - Esta página: Gestión del inventario vivo (active, paused, completed, sold_out, rejected)
 */

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { formatCLP } from '../../../utils/currency';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  TreePine,
  Eye,
  MapPin,
  DollarSign,
  Leaf,
  Activity,
  Pause,
  Play,
  Package,
  TrendingUp,
  Globe,
  AlertCircle,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import {
  getProjects,
  getProjectsStats,
  Project,
  ProjectsListResponse
} from '../services/adminApi';
import api from '../../../shared/services/api';

// ============================================
// Status config — only inventory-relevant states
// ============================================
const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  active: { label: 'Activo', color: '!text-emerald-700', bgColor: '!bg-emerald-100' },
  paused: { label: 'Pausado', color: '!text-orange-700', bgColor: '!bg-orange-100' },
  completed: { label: 'Completado', color: '!text-indigo-700', bgColor: '!bg-indigo-100' },
  rejected: { label: 'Rechazado', color: '!text-red-700', bgColor: '!bg-red-100' },
  // These exist but should redirect user to Cabina de Control
  pending_review: { label: 'En Cabina', color: '!text-amber-700', bgColor: '!bg-amber-100' },
  approved: { label: 'Por Activar', color: '!text-blue-700', bgColor: '!bg-blue-100' },
  draft: { label: 'Borrador', color: '!text-slate-600', bgColor: '!bg-slate-100' },
};

// Official 4 ESG Verticals (9 project types)
const projectTypeConfig: Record<string, { label: string; color: string; vertical: string }> = {
  // Bosque
  reforestation: { label: 'Reforestación', color: '!bg-emerald-100 !text-emerald-700', vertical: 'Bosque' },
  conservation: { label: 'Conservación', color: '!bg-emerald-100 !text-emerald-700', vertical: 'Bosque' },
  // Agua
  clean_water: { label: 'Agua Limpia', color: '!bg-blue-100 !text-blue-700', vertical: 'Agua' },
  water_security: { label: 'Seguridad Hídrica', color: '!bg-blue-100 !text-blue-700', vertical: 'Agua' },
  // Textil
  circular_economy: { label: 'Economía Circular', color: '!bg-purple-100 !text-purple-700', vertical: 'Textil' },
  waste_management: { label: 'Gestión de Residuos', color: '!bg-purple-100 !text-purple-700', vertical: 'Textil' },
  // Social
  energy_efficiency: { label: 'Eficiencia Energética', color: '!bg-amber-100 !text-amber-700', vertical: 'Social' },
  social_housing: { label: 'Vivienda Social', color: '!bg-amber-100 !text-amber-700', vertical: 'Social' },
  community_development: { label: 'Desarrollo Comunitario', color: '!bg-amber-100 !text-amber-700', vertical: 'Social' },
  // Legacy
  renewable_energy: { label: 'Energía Renovable', color: '!bg-amber-100 !text-amber-700', vertical: 'Legacy' },
  biodiversity: { label: 'Biodiversidad', color: '!bg-emerald-100 !text-emerald-700', vertical: 'Legacy' },
};

// Only show inventory states in the dropdown (not pending_review or approved)
const inventoryStatuses = ['active', 'paused', 'completed', 'rejected'] as const;

export default function ProyectosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [pagination, setPagination] = useState({
    page: 1, limit: 20, total: 0, totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { loadData(); }, [searchParams]);
  useEffect(() => { loadStats(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: 20,
        search: searchParams.get('search') || undefined,
        status: searchParams.get('status') || undefined,
        projectType: searchParams.get('type') || undefined,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      };

      // Default: only show inventory states (exclude pending_review, approved, draft)
      if (!params.status) {
        params.status = 'active';
      }

      const data = await getProjects(params);
      setProjects(data.projects);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getProjectsStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) { params.set('search', search); } else { params.delete('search'); }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) { params.set(key, value); } else { params.delete(key); }
    params.set('page', '1');
    setSearchParams(params);
    if (key === 'status') setStatusFilter(value);
    if (key === 'type') setTypeFilter(value);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  // ====== PAUSE / REACTIVATE ======
  const handleChangeStatus = async (projectId: string, newStatus: 'paused' | 'active') => {
    const label = newStatus === 'paused' ? 'pausar' : 'reactivar';
    if (!confirm(`¿Estás seguro de ${label} este proyecto?`)) return;

    setActionLoading(projectId);
    try {
      await api.put(`/admin/projects/${projectId}/status`, { status: newStatus });
      loadData();
      loadStats();
    } catch (err: any) {
      alert(err.response?.data?.message || `Error al ${label} proyecto`);
    } finally {
      setActionLoading(null);
    }
  };

  // ====== HELPERS ======
  const formatNumber = (n?: number | null) => n != null ? n.toLocaleString('es-CL') : '—';

  const getStockPercent = (project: Project) => {
    const total = project.monthly_stock_approved || 0;
    const remaining = project.monthly_stock_remaining || 0;
    if (!total) return 0;
    return Math.round((remaining / total) * 100);
  };

  return (
    <div className="!space-y-8 !animate-in !fade-in !duration-700">
      {/* Header */}
      <div className="!flex !flex-col md:!flex-row md:!items-center !justify-between !gap-4">
        <div>
          <h1 className="!text-4xl !font-black !text-slate-900 dark:!text-white !tracking-tight !mb-2">
            Inventario <span className="!text-emerald-600">ESG</span>
          </h1>
          <p className="!text-slate-500 dark:!text-slate-400 !font-medium">
            Gestiona el portafolio de proyectos activos en el marketplace.
          </p>
        </div>
        <Link
          to="/admin/proyectos-revision"
          className="!flex !items-center !justify-center !gap-2 !bg-indigo-600 hover:!bg-indigo-700 !text-white !px-5 !py-3 !rounded-2xl !font-bold !transition-all !shadow-lg !shadow-indigo-200 dark:!shadow-none active:!scale-95"
        >
          <Eye className="!w-5 !h-5" />
          Cabina de Control
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 !gap-6">
        <div className="!bg-white dark:!bg-slate-800 !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 dark:!border-slate-700 !relative !overflow-hidden !group">
          <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-emerald-50 dark:!bg-emerald-900/20 !rounded-bl-full !-mr-8 !-mt-8 !transition-transform group-hover:!scale-110" />
          <div className="!relative">
            <div className="!w-12 !h-12 !bg-emerald-100 dark:!bg-emerald-900/30 !rounded-2xl !flex !items-center !justify-center !mb-4">
              <Activity className="!w-6 !h-6 !text-emerald-600" />
            </div>
            <p className="!text-slate-500 dark:!text-slate-400 !text-sm !font-bold !uppercase !tracking-wider">Proyectos Activos</p>
            <h3 className="!text-3xl !font-black !text-slate-900 dark:!text-white !mt-1">{stats?.activeProjects || 0}</h3>
          </div>
        </div>

        <div className="!bg-white dark:!bg-slate-800 !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 dark:!border-slate-700 !relative !overflow-hidden !group">
          <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-blue-50 dark:!bg-blue-900/20 !rounded-bl-full !-mr-8 !-mt-8 !transition-transform group-hover:!scale-110" />
          <div className="!relative">
            <div className="!w-12 !h-12 !bg-blue-100 dark:!bg-blue-900/30 !rounded-2xl !flex !items-center !justify-center !mb-4">
              <Package className="!w-6 !h-6 !text-blue-600" />
            </div>
            <p className="!text-slate-500 dark:!text-slate-400 !text-sm !font-bold !uppercase !tracking-wider">Capacidad Total</p>
            <h3 className="!text-3xl !font-black !text-slate-900 dark:!text-white !mt-1">
              {formatNumber(stats?.inventory?.totalTonsAvailable)} <span className="!text-sm !font-medium !text-slate-400">uds</span>
            </h3>
          </div>
        </div>

        <div className="!bg-white dark:!bg-slate-800 !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 dark:!border-slate-700 !relative !overflow-hidden !group">
          <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-amber-50 dark:!bg-amber-900/20 !rounded-bl-full !-mr-8 !-mt-8 !transition-transform group-hover:!scale-110" />
          <div className="!relative">
            <div className="!w-12 !h-12 !bg-amber-100 dark:!bg-amber-900/30 !rounded-2xl !flex !items-center !justify-center !mb-4">
              <TrendingUp className="!w-6 !h-6 !text-amber-600" />
            </div>
            <p className="!text-slate-500 dark:!text-slate-400 !text-sm !font-bold !uppercase !tracking-wider">Revenue Total</p>
            <h3 className="!text-3xl !font-black !text-slate-900 dark:!text-white !mt-1">
              {formatCLP(stats?.inventory?.totalRevenueClp)}
            </h3>
          </div>
        </div>

        <div className="!bg-white dark:!bg-slate-800 !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 dark:!border-slate-700 !relative !overflow-hidden !group">
          <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-purple-50 dark:!bg-purple-900/20 !rounded-bl-full !-mr-8 !-mt-8 !transition-transform group-hover:!scale-110" />
          <div className="!relative">
            <div className="!w-12 !h-12 !bg-purple-100 dark:!bg-purple-900/30 !rounded-2xl !flex !items-center !justify-center !mb-4">
              <BarChart3 className="!w-6 !h-6 !text-purple-600" />
            </div>
            <p className="!text-slate-500 dark:!text-slate-400 !text-sm !font-bold !uppercase !tracking-wider">Certificados Emitidos</p>
            <h3 className="!text-3xl !font-black !text-slate-900 dark:!text-white !mt-1">
              {formatNumber(stats?.inventory?.totalTonsAllocated)} <span className="!text-sm !font-medium !text-slate-400">tCO2e</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="!bg-white dark:!bg-slate-800 !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 dark:!border-slate-700">
        <div className="!flex !flex-col lg:!flex-row !gap-4">
          <form onSubmit={handleSearch} className="!flex-1 !relative">
            <Search className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !text-slate-400 !w-5 !h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o partner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!w-full !pl-12 !pr-4 !py-3 !bg-slate-50 dark:!bg-slate-900 !border-none !rounded-2xl focus:!ring-2 focus:!ring-emerald-500 !font-medium !transition-all !text-slate-900 dark:!text-white"
            />
          </form>

          <div className="!flex !flex-wrap !gap-3">
            <select
              value={statusFilter}
              onChange={(e) => handleFilter('status', e.target.value)}
              className="!bg-slate-50 dark:!bg-slate-900 !border-none !rounded-2xl !px-4 !py-3 !font-medium !text-slate-700 dark:!text-slate-300 focus:!ring-2 focus:!ring-emerald-500 !cursor-pointer"
            >
              <option value="">Activos (por defecto)</option>
              {inventoryStatuses.map(key => (
                <option key={key} value={key}>{statusConfig[key]?.label}</option>
              ))}
              <option value="" disabled>───────────</option>
              <option value="pending_review">En Cabina (pending)</option>
              <option value="approved">Por Activar</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => handleFilter('type', e.target.value)}
              className="!bg-slate-50 dark:!bg-slate-900 !border-none !rounded-2xl !px-4 !py-3 !font-medium !text-slate-700 dark:!text-slate-300 focus:!ring-2 focus:!ring-emerald-500 !cursor-pointer"
            >
              <option value="">Todos los tipos</option>
              <optgroup label="Bosque">
                <option value="reforestation">Reforestación</option>
                <option value="conservation">Conservación</option>
              </optgroup>
              <optgroup label="Agua">
                <option value="clean_water">Agua Limpia</option>
                <option value="water_security">Seguridad Hídrica</option>
              </optgroup>
              <optgroup label="Textil">
                <option value="circular_economy">Economía Circular</option>
                <option value="waste_management">Gestión de Residuos</option>
              </optgroup>
              <optgroup label="Social">
                <option value="energy_efficiency">Eficiencia Energética</option>
                <option value="social_housing">Vivienda Social</option>
                <option value="community_development">Desarrollo Comunitario</option>
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="!bg-white dark:!bg-slate-800 !rounded-3xl !shadow-sm !border !border-slate-100 dark:!border-slate-700 !overflow-hidden">
        <div className="!overflow-x-auto">
          <table className="!w-full !text-left !border-collapse">
            <thead>
              <tr className="!bg-slate-50/50 dark:!bg-slate-900/50">
                <th className="!px-6 !py-4 !text-slate-500 dark:!text-slate-400 !font-bold !text-xs !uppercase !tracking-widest">Proyecto</th>
                <th className="!px-6 !py-4 !text-slate-500 dark:!text-slate-400 !font-bold !text-xs !uppercase !tracking-widest">Tipo</th>
                <th className="!px-6 !py-4 !text-slate-500 dark:!text-slate-400 !font-bold !text-xs !uppercase !tracking-widest">Stock Mensual</th>
                <th className="!px-6 !py-4 !text-slate-500 dark:!text-slate-400 !font-bold !text-xs !uppercase !tracking-widest">Precio CLP/ton</th>
                <th className="!px-6 !py-4 !text-slate-500 dark:!text-slate-400 !font-bold !text-xs !uppercase !tracking-widest">Estado</th>
                <th className="!px-6 !py-4 !text-slate-500 dark:!text-slate-400 !font-bold !text-xs !uppercase !tracking-widest !text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="!divide-y !divide-slate-100 dark:!divide-slate-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="!animate-pulse">
                    <td colSpan={6} className="!px-6 !py-8">
                      <div className="!h-4 !bg-slate-100 dark:!bg-slate-700 !rounded-full !w-3/4" />
                    </td>
                  </tr>
                ))
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="!px-6 !py-12 !text-center">
                    <div className="!flex !flex-col !items-center !gap-3">
                      <div className="!w-16 !h-16 !bg-slate-50 dark:!bg-slate-700 !rounded-full !flex !items-center !justify-center">
                        <TreePine className="!w-8 !h-8 !text-slate-300 dark:!text-slate-500" />
                      </div>
                      <p className="!text-slate-400 !font-medium">No se encontraron proyectos con estos filtros.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((project) => {
                  const stockPct = getStockPercent(project);
                  const priceClp = project.currentPrice?.pricePerTonClp;
                  const typeInfo = projectTypeConfig[project.projectType];

                  return (
                    <tr key={project.id} className="hover:!bg-slate-50/50 dark:hover:!bg-slate-700/30 !transition-colors !group">
                      {/* Proyecto */}
                      <td className="!px-6 !py-5">
                        <div className="!flex !items-center !gap-4">
                          <div className="!w-10 !h-10 !rounded-xl !bg-emerald-100 dark:!bg-emerald-900/30 !flex !items-center !justify-center !flex-shrink-0">
                            <TreePine className="!w-5 !h-5 !text-emerald-600" />
                          </div>
                          <div className="!min-w-0">
                            <Link to={`/admin/proyectos/${project.id}`} className="!font-bold !text-slate-900 dark:!text-white group-hover:!text-emerald-600 !transition-colors !truncate !block hover:!underline">
                              {project.name}
                            </Link>
                            <div className="!text-xs !font-mono !text-slate-400 !mt-0.5">{project.code}</div>
                            {project.partner && (
                              <div className="!text-xs !text-emerald-600 !font-medium !mt-0.5 !truncate">
                                {project.partner.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Tipo */}
                      <td className="!px-6 !py-5">
                        <div className="!flex !flex-col !gap-1.5">
                          <span className={`!inline-flex !px-2.5 !py-0.5 !rounded-lg !text-[10px] !font-black !uppercase !tracking-wider !w-fit ${typeInfo?.color || '!bg-slate-100 !text-slate-600'}`}>
                            {typeInfo?.label || project.projectType}
                          </span>
                          <div className="!flex !items-center !gap-1 !text-slate-500 dark:!text-slate-400 !text-xs">
                            <MapPin className="!w-3 !h-3" />
                            {project.region ? `${project.region}, ` : ''}{project.country}
                          </div>
                        </div>
                      </td>

                      {/* Stock Mensual */}
                      <td className="!px-6 !py-5">
                        {project.monthly_stock_approved ? (
                          <div className="!space-y-1.5">
                            <div className="!flex !items-baseline !gap-1">
                              <span className="!font-bold !text-slate-900 dark:!text-white">{formatNumber(project.monthly_stock_remaining)}</span>
                              <span className="!text-xs !text-slate-400">/ {formatNumber(project.monthly_stock_approved)}</span>
                            </div>
                            <div className="!w-24 !h-1.5 !bg-slate-100 dark:!bg-slate-700 !rounded-full !overflow-hidden">
                              <div
                                className={`!h-full !rounded-full !transition-all ${
                                  stockPct > 50 ? '!bg-emerald-500' : stockPct > 20 ? '!bg-amber-500' : '!bg-red-500'
                                }`}
                                style={{ width: `${stockPct}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="!text-xs !text-slate-400">Sin stock mensual</span>
                        )}
                      </td>

                      {/* Precio CLP/ton */}
                      <td className="!px-6 !py-5">
                        <div className="!flex !flex-col">
                          <span className="!font-bold !text-slate-900 dark:!text-white">
                            {formatCLP(priceClp)}
                          </span>
                          {project.currentPrice?.marginPercent && (
                            <span className="!text-xs !text-slate-400">
                              Margen: {Number(project.currentPrice.marginPercent).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="!px-6 !py-5">
                        <span className={`!inline-flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !text-xs !font-bold ${statusConfig[project.status]?.bgColor || '!bg-slate-100'} ${statusConfig[project.status]?.color || '!text-slate-600'}`}>
                          <span className="!w-1.5 !h-1.5 !rounded-full !bg-current" />
                          {statusConfig[project.status]?.label || project.status}
                        </span>
                        {project.is_sold_out && (
                          <span className="!block !text-[10px] !text-red-600 !font-bold !mt-1">AGOTADO</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="!px-6 !py-5 !text-right">
                        <div className="!flex !items-center !justify-end !gap-2">
                          {/* Ver detalle */}
                          <Link
                            to={`/admin/proyectos/${project.id}`}
                            className="!p-2 !text-slate-400 hover:!text-emerald-600 hover:!bg-emerald-50 dark:hover:!bg-emerald-900/20 !rounded-xl !transition-all"
                            title="Ver detalle"
                          >
                            <Eye className="!w-5 !h-5" />
                          </Link>
                          {/* Pause / Reactivate */}
                          {project.status === 'active' && (
                            <button
                              onClick={() => handleChangeStatus(project.id, 'paused')}
                              disabled={actionLoading === project.id}
                              className="!p-2 !text-slate-400 hover:!text-orange-600 hover:!bg-orange-50 dark:hover:!bg-orange-900/20 !rounded-xl !transition-all disabled:!opacity-50"
                              title="Pausar proyecto"
                            >
                              <Pause className="!w-5 !h-5" />
                            </button>
                          )}
                          {project.status === 'paused' && (
                            <button
                              onClick={() => handleChangeStatus(project.id, 'active')}
                              disabled={actionLoading === project.id}
                              className="!p-2 !text-slate-400 hover:!text-emerald-600 hover:!bg-emerald-50 dark:hover:!bg-emerald-900/20 !rounded-xl !transition-all disabled:!opacity-50"
                              title="Reactivar proyecto"
                            >
                              <Play className="!w-5 !h-5" />
                            </button>
                          )}
                          {/* External transparency link */}
                          {project.transparencyUrl && (
                            <a
                              href={project.transparencyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="!p-2 !text-slate-400 hover:!text-blue-600 hover:!bg-blue-50 dark:hover:!bg-blue-900/20 !rounded-xl !transition-all"
                              title="Ver transparencia"
                            >
                              <ExternalLink className="!w-5 !h-5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="!px-6 !py-4 !bg-slate-50/50 dark:!bg-slate-900/30 !border-t !border-slate-100 dark:!border-slate-700 !flex !items-center !justify-between">
            <p className="!text-sm !text-slate-500 dark:!text-slate-400 !font-medium">
              Mostrando <span className="!font-bold !text-slate-900 dark:!text-white">{projects.length}</span> de <span className="!font-bold !text-slate-900 dark:!text-white">{pagination.total}</span> proyectos
            </p>
            <div className="!flex !items-center !gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="!p-2 !rounded-xl !border !border-slate-200 dark:!border-slate-700 !bg-white dark:!bg-slate-800 !text-slate-600 dark:!text-slate-300 disabled:!opacity-50 hover:!bg-slate-50 dark:hover:!bg-slate-700 !transition-all"
              >
                <ChevronLeft className="!w-5 !h-5" />
              </button>
              <div className="!flex !items-center !gap-1">
                {Array.from({ length: Math.min(pagination.totalPages, 7) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`!w-10 !h-10 !rounded-xl !text-sm !font-bold !transition-all ${
                      pagination.page === i + 1
                        ? '!bg-emerald-600 !text-white !shadow-md !shadow-emerald-100 dark:!shadow-none'
                        : '!text-slate-600 dark:!text-slate-300 hover:!bg-slate-100 dark:hover:!bg-slate-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="!p-2 !rounded-xl !border !border-slate-200 dark:!border-slate-700 !bg-white dark:!bg-slate-800 !text-slate-600 dark:!text-slate-300 disabled:!opacity-50 hover:!bg-slate-50 dark:hover:!bg-slate-700 !transition-all"
              >
                <ChevronRight className="!w-5 !h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info banner about Cabina */}
      <div className="!bg-indigo-50 dark:!bg-indigo-900/20 !border !border-indigo-200 dark:!border-indigo-800 !rounded-2xl !p-4 !flex !items-start !gap-3">
        <AlertCircle className="!w-5 !h-5 !text-indigo-600 dark:!text-indigo-400 !mt-0.5 !flex-shrink-0" />
        <div>
          <p className="!text-sm !text-indigo-800 dark:!text-indigo-300 !font-medium">
            Los proyectos nuevos (pendientes de aprobación) se gestionan desde la{' '}
            <Link to="/admin/proyectos-revision" className="!underline !font-bold hover:!text-indigo-900 dark:hover:!text-indigo-200">
              Cabina de Control
            </Link>
            , donde se revisan documentos, se aprueba la certificación IA y se define el precio con la calculadora "Modo Dios".
          </p>
        </div>
      </div>
    </div>
  );
}
