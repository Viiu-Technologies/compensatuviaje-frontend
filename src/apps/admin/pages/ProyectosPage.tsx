import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  TreePine,
  Eye,
  Plus,
  Edit,
  Trash2,
  MapPin,
  DollarSign,
  Leaf,
  ArrowUpDown,
  X,
  Save,
  Image as ImageIcon,
  Globe,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  getProjects, 
  getProjectsStats, 
  createProject, 
  updateProject, 
  deleteProject,
  Project, 
  ProjectsListResponse 
} from '../services/adminApi';

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  active: { label: 'Activo', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  draft: { label: 'Borrador', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  pending_review: { label: 'En Revisión', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  approved: { label: 'Aprobado', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  rejected: { label: 'Rechazado', color: 'text-red-700', bgColor: 'bg-red-100' },
  paused: { label: 'Pausado', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  completed: { label: 'Completado', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  inactive: { label: 'Inactivo', color: 'text-slate-600', bgColor: 'bg-slate-200' },
  coming_soon: { label: 'Próximamente', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  deleted: { label: 'Eliminado', color: 'text-red-700', bgColor: 'bg-red-100' },
};

const projectTypeConfig: Record<string, { label: string; color: string }> = {
  reforestation: { label: 'Reforestación', color: 'bg-emerald-100 text-emerald-700' },
  renewable_energy: { label: 'Energía Renovable', color: 'bg-amber-100 text-amber-700' },
  conservation: { label: 'Conservación', color: 'bg-blue-100 text-blue-700' },
  methane_capture: { label: 'Captura de Metano', color: 'bg-purple-100 text-purple-700' },
  ocean_restoration: { label: 'Restauración Oceánica', color: 'bg-cyan-100 text-cyan-700' },
};

interface ProjectFormData {
  code: string;
  name: string;
  description: string;
  projectType: string;
  country: string;
  region: string;
  status: string;
  pricePerTonCLP: number | '';
  pricePerTonUSD: number | '';
  availableCredits: number | '';
  totalCredits: number | '';
  imageUrl: string;
}

const initialFormData: ProjectFormData = {
  code: '',
  name: '',
  description: '',
  projectType: 'reforestation',
  country: 'Chile',
  region: '',
  status: 'active',
  pricePerTonCLP: '',
  pricePerTonUSD: '',
  availableCredits: '',
  totalCredits: '',
  imageUrl: ''
};

export default function ProyectosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [searchParams, sortBy, sortOrder]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: 20,
        search: searchParams.get('search') || undefined,
        status: searchParams.get('status') || undefined,
        projectType: searchParams.get('type') || undefined,
        sortBy,
        sortOrder
      };

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
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
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

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const openCreateModal = () => {
    setFormData(initialFormData);
    setEditingProject(null);
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (project: Project) => {
    setFormData({
      code: project.code,
      name: project.name,
      description: project.description || '',
      projectType: project.projectType,
      country: project.country,
      region: project.region || '',
      status: project.status,
      pricePerTonCLP: project.pricePerTonCLP || '',
      pricePerTonUSD: project.pricePerTonUSD || '',
      availableCredits: project.availableCredits || '',
      totalCredits: project.totalCredits || '',
      imageUrl: project.imageUrl || ''
    });
    setEditingProject(project);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Convert empty strings to null for numeric fields
      const payload = {
        ...formData,
        pricePerTonCLP: formData.pricePerTonCLP === '' ? null : Number(formData.pricePerTonCLP),
        pricePerTonUSD: formData.pricePerTonUSD === '' ? null : Number(formData.pricePerTonUSD),
        availableCredits: formData.availableCredits === '' ? null : Number(formData.availableCredits),
        totalCredits: formData.totalCredits === '' ? null : Number(formData.totalCredits),
      };

      if (modalMode === 'create') {
        await createProject(payload);
      } else if (editingProject) {
        await updateProject(editingProject.id, payload);
      }
      
      setShowModal(false);
      loadData();
      loadStats();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error al guardar el proyecto. Por favor, revisa los datos.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      setDeleteConfirm(null);
      loadData();
      loadStats();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error al eliminar el proyecto.');
    }
  };

  return (
    <div className="!space-y-8 !animate-in !fade-in !duration-700">
      {/* Header Section */}
      <div className="!flex !flex-col md:!flex-row md:!items-center !justify-between !gap-4">
        <div>
          <h1 className="!text-4xl !font-black !text-slate-900 !tracking-tight !mb-2">
            Proyectos <span className="!text-emerald-600">ESG</span>
          </h1>
          <p className="!text-slate-500 !font-medium">
            Gestiona el portafolio de proyectos de compensación de carbono.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="!flex !items-center !justify-center !gap-2 !bg-emerald-600 !hover:bg-emerald-700 !text-white !px-6 !py-3 !rounded-2xl !font-bold !transition-all !shadow-lg !shadow-emerald-200 !active:scale-95"
        >
          <Plus className="!w-5 !h-5" />
          Nuevo Proyecto
        </button>
      </div>

      {/* Stats Grid */}
      <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 !gap-6">
        <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 !relative !overflow-hidden !group">
          <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-emerald-50 !rounded-bl-full !-mr-8 !-mt-8 !transition-transform !group-hover:scale-110" />
          <div className="!relative">
            <div className="!w-12 !h-12 !bg-emerald-100 !rounded-2xl !flex !items-center !justify-center !mb-4">
              <TreePine className="!w-6 !h-6 !text-emerald-600" />
            </div>
            <p className="!text-slate-500 !text-sm !font-bold !uppercase !tracking-wider">Total Proyectos</p>
            <h3 className="!text-3xl !font-black !text-slate-900 !mt-1">{stats?.totalProjects || 0}</h3>
          </div>
        </div>

        <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 !relative !overflow-hidden !group">
          <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-blue-50 !rounded-bl-full !-mr-8 !-mt-8 !transition-transform !group-hover:scale-110" />
          <div className="!relative">
            <div className="!w-12 !h-12 !bg-blue-100 !rounded-2xl !flex !items-center !justify-center !mb-4">
              <Leaf className="!w-6 !h-6 !text-blue-600" />
            </div>
            <p className="!text-slate-500 !text-sm !font-bold !uppercase !tracking-wider">Créditos Disponibles</p>
            <h3 className="!text-3xl !font-black !text-slate-900 !mt-1">
              {stats?.totalAvailableCredits?.toLocaleString() || 0} <span className="!text-sm !font-medium !text-slate-400">tCO2e</span>
            </h3>
          </div>
        </div>

        <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 !relative !overflow-hidden !group">
          <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-amber-50 !rounded-bl-full !-mr-8 !-mt-8 !transition-transform !group-hover:scale-110" />
          <div className="!relative">
            <div className="!w-12 !h-12 !bg-amber-100 !rounded-2xl !flex !items-center !justify-center !mb-4">
              <Globe className="!w-6 !h-6 !text-amber-600" />
            </div>
            <p className="!text-slate-500 !text-sm !font-bold !uppercase !tracking-wider">Países</p>
            <h3 className="!text-3xl !font-black !text-slate-900 !mt-1">{stats?.countriesCount || 0}</h3>
          </div>
        </div>

        <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 !relative !overflow-hidden !group">
          <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-purple-50 !rounded-bl-full !-mr-8 !-mt-8 !transition-transform !group-hover:scale-110" />
          <div className="!relative">
            <div className="!w-12 !h-12 !bg-purple-100 !rounded-2xl !flex !items-center !justify-center !mb-4">
              <Activity className="!w-6 !h-6 !text-purple-600" />
            </div>
            <p className="!text-slate-500 !text-sm !font-bold !uppercase !tracking-wider">Tipos de Proyecto</p>
            <h3 className="!text-3xl !font-black !text-slate-900 !mt-1">{stats?.typesCount || 0}</h3>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100">
        <div className="!flex !flex-col lg:!flex-row !gap-4">
          <form onSubmit={handleSearch} className="!flex-1 !relative">
            <Search className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !text-slate-400 !w-5 !h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!w-full !pl-12 !pr-4 !py-3 !bg-slate-50 !border-none !rounded-2xl !focus:ring-2 !focus:ring-emerald-500 !font-medium !transition-all"
            />
          </form>
          
          <div className="!flex !flex-wrap !gap-3">
            <select
              value={statusFilter}
              onChange={(e) => handleFilter('status', e.target.value)}
              className="!bg-slate-50 !border-none !rounded-2xl !px-4 !py-3 !font-medium !text-slate-700 !focus:ring-2 !focus:ring-emerald-500 !cursor-pointer"
            >
              <option value="">Todos los estados</option>
              {Object.entries(statusConfig)
                .filter(([key]) => key !== 'deleted')
                .map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))
              }
            </select>

            <select
              value={typeFilter}
              onChange={(e) => handleFilter('type', e.target.value)}
              className="!bg-slate-50 !border-none !rounded-2xl !px-4 !py-3 !font-medium !text-slate-700 !focus:ring-2 !focus:ring-emerald-500 !cursor-pointer"
            >
              <option value="">Todos los tipos</option>
              {Object.entries(projectTypeConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="!bg-white !rounded-3xl !shadow-sm !border !border-slate-100 !overflow-hidden">
        <div className="!overflow-x-auto">
          <table className="!w-full !text-left !border-collapse">
            <thead>
              <tr className="!bg-slate-50/50">
                <th className="!px-6 !py-4 !text-slate-500 !font-bold !text-xs !uppercase !tracking-widest">Proyecto</th>
                <th className="!px-6 !py-4 !text-slate-500 !font-bold !text-xs !uppercase !tracking-widest">Tipo / Ubicación</th>
                <th className="!px-6 !py-4 !text-slate-500 !font-bold !text-xs !uppercase !tracking-widest">Créditos</th>
                <th className="!px-6 !py-4 !text-slate-500 !font-bold !text-xs !uppercase !tracking-widest">Precio (USD)</th>
                <th className="!px-6 !py-4 !text-slate-500 !font-bold !text-xs !uppercase !tracking-widest">Estado</th>
                <th className="!px-6 !py-4 !text-slate-500 !font-bold !text-xs !uppercase !tracking-widest !text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="!divide-y !divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="!animate-pulse">
                    <td colSpan={6} className="!px-6 !py-8">
                      <div className="!h-4 !bg-slate-100 !rounded-full !w-3/4" />
                    </td>
                  </tr>
                ))
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="!px-6 !py-12 !text-center">
                    <div className="!flex !flex-col !items-center !gap-3">
                      <div className="!w-16 !h-16 !bg-slate-50 !rounded-full !flex !items-center !justify-center">
                        <TreePine className="!w-8 !h-8 !text-slate-300" />
                      </div>
                      <p className="!text-slate-400 !font-medium">No se encontraron proyectos</p>
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="!hover:bg-slate-50/50 !transition-colors !group">
                    <td className="!px-6 !py-5">
                      <div className="!flex !items-center !gap-4">
                        <div className="!w-12 !h-12 !rounded-xl !bg-slate-100 !overflow-hidden !flex-shrink-0">
                          {project.imageUrl ? (
                            <img src={project.imageUrl} alt={project.name} className="!w-full !h-full !object-cover" />
                          ) : (
                            <div className="!w-full !h-full !flex !items-center !justify-center">
                              <ImageIcon className="!w-5 !h-5 !text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="!font-bold !text-slate-900 !group-hover:text-emerald-600 !transition-colors">
                            {project.name}
                          </div>
                          <div className="!text-xs !font-mono !text-slate-400 !mt-0.5">{project.code}</div>
                          {(project as any).partner && (
                            <div className="!text-xs !text-emerald-600 !font-medium !mt-0.5">
                              Partner: {(project as any).partner.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="!px-6 !py-5">
                      <div className="!flex !flex-col !gap-1.5">
                        <span className={`!inline-flex !px-2.5 !py-0.5 !rounded-lg !text-[10px] !font-black !uppercase !tracking-wider !w-fit ${projectTypeConfig[project.projectType]?.color || 'bg-slate-100 text-slate-600'}`}>
                          {projectTypeConfig[project.projectType]?.label || project.projectType}
                        </span>
                        <div className="!flex !items-center !gap-1 !text-slate-500 !text-sm">
                          <MapPin className="!w-3 !h-3" />
                          {project.region}, {project.country}
                        </div>
                      </div>
                    </td>
                    <td className="!px-6 !py-5">
                      <div className="!flex !flex-col">
                        <span className="!font-bold !text-slate-900">
                          {project.availableCredits?.toLocaleString()}
                        </span>
                        <span className="!text-xs !text-slate-400">de {project.totalCredits?.toLocaleString()} tCO2e</span>
                      </div>
                    </td>
                    <td className="!px-6 !py-5">
                      <div className="!font-bold !text-slate-900">
                        ${project.pricePerTonUSD?.toLocaleString()}
                      </div>
                    </td>
                    <td className="!px-6 !py-5">
                      <span className={`!inline-flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !text-xs !font-bold ${statusConfig[project.status]?.bgColor} ${statusConfig[project.status]?.color}`}>
                        <span className="!w-1.5 !h-1.5 !rounded-full !bg-current" />
                        {statusConfig[project.status]?.label}
                      </span>
                    </td>
                    <td className="!px-6 !py-5 !text-right">
                      <div className="!flex !items-center !justify-end !gap-2">
                        <button
                          onClick={() => openEditModal(project)}
                          className="!p-2 !text-slate-400 !hover:text-blue-600 !hover:bg-blue-50 !rounded-xl !transition-all"
                          title="Editar"
                        >
                          <Edit className="!w-5 !h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(project.id)}
                          className="!p-2 !text-slate-400 !hover:text-red-600 !hover:bg-red-50 !rounded-xl !transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="!w-5 !h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="!px-6 !py-4 !bg-slate-50/50 !border-t !border-slate-100 !flex !items-center !justify-between">
            <p className="!text-sm !text-slate-500 !font-medium">
              Mostrando <span className="!font-bold !text-slate-900">{projects.length}</span> de <span className="!font-bold !text-slate-900">{pagination.total}</span> proyectos
            </p>
            <div className="!flex !items-center !gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="!p-2 !rounded-xl !border !border-slate-200 !bg-white !text-slate-600 !disabled:opacity-50 !hover:bg-slate-50 !transition-all"
              >
                <ChevronLeft className="!w-5 !h-5" />
              </button>
              <div className="!flex !items-center !gap-1">
                {Array.from({ length: pagination.totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`!w-10 !h-10 !rounded-xl !text-sm !font-bold !transition-all ${
                      pagination.page === i + 1
                        ? '!bg-emerald-600 !text-white !shadow-md !shadow-emerald-100'
                        : '!text-slate-600 !hover:bg-slate-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="!p-2 !rounded-xl !border !border-slate-200 !bg-white !text-slate-600 !disabled:opacity-50 !hover:bg-slate-50 !transition-all"
              >
                <ChevronRight className="!w-5 !h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Project Modal */}
      {showModal && (
        <div className="!fixed !inset-0 !z-50 !flex !items-center !justify-center !p-4 !bg-slate-900/60 !backdrop-blur-sm !animate-in !fade-in !duration-300">
          <div className="!bg-white !rounded-[2.5rem] !shadow-2xl !w-full !max-w-3xl !max-h-[90vh] !overflow-hidden !flex !flex-col !animate-in !zoom-in-95 !duration-300">
            <div className="!p-8 !border-b !border-slate-100 !flex !items-center !justify-between !bg-slate-50/50">
              <div>
                <h2 className="!text-2xl !font-black !text-slate-900">
                  {modalMode === 'create' ? 'Nuevo Proyecto' : 'Editar Proyecto'}
                </h2>
                <p className="!text-slate-500 !text-sm !font-medium">Completa la información técnica del proyecto.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="!p-2 !hover:bg-slate-200 !rounded-full !transition-colors">
                <X className="!w-6 !h-6 !text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="!p-8 !overflow-y-auto !flex-1 !space-y-6">
              <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
                <div className="!space-y-2">
                  <label className="!text-sm !font-bold !text-slate-700 !ml-1">Nombre del Proyecto</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="!w-full !px-4 !py-3 !bg-slate-50 !border !border-slate-200 !rounded-2xl focus:!ring-2 focus:!ring-emerald-500 !font-medium !text-slate-900 !placeholder-slate-400 !outline-none"
                    placeholder="Ej: Reforestación Amazonía"
                  />
                </div>
                <div className="!space-y-2">
                  <label className="!text-sm !font-bold !text-slate-700 !ml-1">Código Único</label>
                  <input
                    required
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="!w-full !px-4 !py-3 !bg-slate-50 !border !border-slate-200 !rounded-2xl focus:!ring-2 focus:!ring-emerald-500 !font-medium !text-slate-900 !placeholder-slate-400 !outline-none"
                    placeholder="Ej: REF-001"
                  />
                </div>
                <div className="!space-y-2">
                  <label className="!text-sm !font-bold !text-slate-700 !ml-1">Tipo de Proyecto</label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="!w-full !px-4 !py-3 !bg-slate-50 !border !border-slate-200 !rounded-2xl focus:!ring-2 focus:!ring-emerald-500 !font-medium !text-slate-900 !outline-none !cursor-pointer"
                  >
                    {Object.entries(projectTypeConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div className="!space-y-2">
                  <label className="!text-sm !font-bold !text-slate-700 !ml-1">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="!w-full !px-4 !py-3 !bg-slate-50 !border !border-slate-200 !rounded-2xl focus:!ring-2 focus:!ring-emerald-500 !font-medium !text-slate-900 !outline-none !cursor-pointer"
                  >
                    {Object.entries(statusConfig)
                      .filter(([key]) => key !== 'deleted')
                      .map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))
                    }
                  </select>
                </div>
                <div className="!space-y-2">
                  <label className="!text-sm !font-bold !text-slate-700 !ml-1">País</label>
                  <input
                    required
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="!w-full !px-4 !py-3 !bg-slate-50 !border !border-slate-200 !rounded-2xl focus:!ring-2 focus:!ring-emerald-500 !font-medium !text-slate-900 !placeholder-slate-400 !outline-none"
                  />
                </div>
                <div className="!space-y-2">
                  <label className="!text-sm !font-bold !text-slate-700 !ml-1">Región / Ciudad</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="!w-full !px-4 !py-3 !bg-slate-50 !border !border-slate-200 !rounded-2xl focus:!ring-2 focus:!ring-emerald-500 !font-medium !text-slate-900 !placeholder-slate-400 !outline-none"
                  />
                </div>
                <div className="!space-y-2">
                  <label className="!text-sm !font-bold !text-slate-700 !ml-1">Precio por Tonelada (USD)</label>
                  <div className="!relative">
                    <DollarSign className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !text-slate-400 !w-4 !h-4" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pricePerTonUSD}
                      onChange={(e) => setFormData({ ...formData, pricePerTonUSD: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="!w-full !pl-10 !pr-4 !py-3 !bg-slate-50 !border !border-slate-200 !rounded-2xl focus:!ring-2 focus:!ring-emerald-500 !font-medium !text-slate-900 !placeholder-slate-400 !outline-none"
                    />
                  </div>
                </div>
                <div className="!space-y-2">
                  <label className="!text-sm !font-bold !text-slate-700 !ml-1">Precio por Tonelada (CLP)</label>
                  <div className="!relative">
                    <DollarSign className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !text-slate-400 !w-4 !h-4" />
                    <input
                      type="number"
                      value={formData.pricePerTonCLP}
                      onChange={(e) => setFormData({ ...formData, pricePerTonCLP: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="!w-full !pl-10 !pr-4 !py-3 !bg-slate-50 !border !border-slate-200 !rounded-2xl focus:!ring-2 focus:!ring-emerald-500 !font-medium !text-slate-900 !placeholder-slate-400 !outline-none"
                    />
                  </div>
                </div>
                <div className="!space-y-2">
                  <label className="!text-sm !font-bold !text-slate-700 !ml-1">Créditos Totales</label>
                  <input
                    type="number"
                    value={formData.totalCredits}
                    onChange={(e) => setFormData({ ...formData, totalCredits: e.target.value === '' ? '' : Number(e.target.value) })}
                    className="!w-full !px-4 !py-3 !bg-slate-50 !border !border-slate-200 !rounded-2xl focus:!ring-2 focus:!ring-emerald-500 !font-medium !text-slate-900 !placeholder-slate-400 !outline-none"
                  />
                </div>
                <div className="!space-y-2">
                  <label className="!text-sm !font-bold !text-slate-700 !ml-1">Créditos Disponibles</label>
                  <input
                    type="number"
                    value={formData.availableCredits}
                    onChange={(e) => setFormData({ ...formData, availableCredits: e.target.value === '' ? '' : Number(e.target.value) })}
                    className="!w-full !px-4 !py-3 !bg-slate-50 !border !border-slate-200 !rounded-2xl focus:!ring-2 focus:!ring-emerald-500 !font-medium !text-slate-900 !placeholder-slate-400 !outline-none"
                  />
                </div>
              </div>

              <div className="!space-y-2">
                <label className="!text-sm !font-bold !text-slate-700 !ml-1">URL de Imagen</label>
                <div className="!relative">
                  <ImageIcon className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !text-slate-400 !w-4 !h-4" />
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="!w-full !pl-10 !pr-4 !py-3 !bg-slate-50 !border !border-slate-200 !rounded-2xl focus:!ring-2 focus:!ring-emerald-500 !font-medium !text-slate-900 !placeholder-slate-400 !outline-none"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>

              <div className="!space-y-2">
                <label className="!text-sm !font-bold !text-slate-700 !ml-1">Descripción</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="!w-full !px-4 !py-3 !bg-slate-50 !border !border-slate-200 !rounded-2xl focus:!ring-2 focus:!ring-emerald-500 !font-medium !text-slate-900 !placeholder-slate-400 !outline-none !resize-none"
                  placeholder="Describe el impacto ambiental y social del proyecto..."
                />
              </div>
            </form>

            <div className="!p-8 !bg-slate-50/50 !border-t !border-slate-100 !flex !justify-end !gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="!px-6 !py-3 !rounded-2xl !font-bold !text-slate-600 !hover:bg-slate-200 !transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="!flex !items-center !gap-2 !bg-emerald-600 !hover:bg-emerald-700 !text-white !px-8 !py-3 !rounded-2xl !font-bold !transition-all !shadow-lg !shadow-emerald-100 !disabled:opacity-50"
              >
                {saving ? (
                  <div className="!w-5 !h-5 !border-2 !border-white/30 !border-t-white !rounded-full !animate-spin" />
                ) : (
                  <Save className="!w-5 !h-5" />
                )}
                {modalMode === 'create' ? 'Crear Proyecto' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="!fixed !inset-0 !z-[60] !flex !items-center !justify-center !p-4 !bg-slate-900/60 !backdrop-blur-sm !animate-in !fade-in !duration-300">
          <div className="!bg-white !rounded-[2rem] !shadow-2xl !w-full !max-w-md !p-8 !text-center !animate-in !zoom-in-95 !duration-300">
            <div className="!w-20 !h-20 !bg-red-50 !rounded-full !flex !items-center !justify-center !mx-auto !mb-6">
              <AlertCircle className="!w-10 !h-10 !text-red-500" />
            </div>
            <h3 className="!text-2xl !font-black !text-slate-900 !mb-2">¿Eliminar proyecto?</h3>
            <p className="!text-slate-500 !font-medium !mb-8">
              Esta acción no se puede deshacer. El proyecto será marcado como eliminado en el sistema.
            </p>
            <div className="!flex !gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="!flex-1 !py-4 !rounded-2xl !font-bold !text-slate-600 !bg-slate-100 !hover:bg-slate-200 !transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="!flex-1 !py-4 !rounded-2xl !font-bold !text-white !bg-red-500 !hover:bg-red-600 !transition-all !shadow-lg !shadow-red-100"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

