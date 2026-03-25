/**
 * Projects Review Page
 * Proyectos ESG pendientes de revisión y aprobados por activar
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TreePine,
  Search,
  Eye,
  Check,
  X,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar,
  Building2,
  FileText,
  Leaf,
  MapPin,
  DollarSign,
  Filter,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { 
  getProjectsPendingReview, 
  getProjectsApproved,
  approvePartnerProject, 
  rejectPartnerProject,
  activatePartnerProject 
} from '../services/adminApi';

interface PendingProject {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  country: string;
  region?: string;
  price_per_ton_usd?: number;
  status: string;
  submitted_at: string;
  created_at: string;
  approved_at?: string;
  partner: {
    id: string;
    name: string;
    logo_url?: string;
  };
}

interface ProjectsResponse {
  projects: PendingProject[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const projectTypeLabels: Record<string, string> = {
  reforestation: 'Reforestación',
  conservation: 'Conservación',
  renewable_energy: 'Energía Renovable',
  waste_management: 'Gestión de Residuos',
  water_conservation: 'Conservación de Agua',
  biodiversity: 'Biodiversidad',
  other: 'Otro',
};

type TabType = 'pending' | 'approved';

export default function ProjectsReviewPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  
  // Pending projects state
  const [pendingProjects, setPendingProjects] = useState<PendingProject[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);
  
  // Approved projects state
  const [approvedProjects, setApprovedProjects] = useState<PendingProject[]>([]);
  const [approvedLoading, setApprovedLoading] = useState(true);
  const [approvedPage, setApprovedPage] = useState(1);
  const [approvedTotalPages, setApprovedTotalPages] = useState(1);
  const [approvedTotal, setApprovedTotal] = useState(0);
  
  const [error, setError] = useState<string | null>(null);
  const limit = 10;

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<PendingProject | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [search, setSearch] = useState('');

  const fetchPendingProjects = useCallback(async () => {
    try {
      setPendingLoading(true);
      const response: ProjectsResponse = await getProjectsPendingReview({ page: pendingPage, limit });
      setPendingProjects(response.projects);
      setPendingTotalPages(response.pagination.totalPages);
      setPendingTotal(response.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar proyectos pendientes');
    } finally {
      setPendingLoading(false);
    }
  }, [pendingPage]);

  const fetchApprovedProjects = useCallback(async () => {
    try {
      setApprovedLoading(true);
      const response: ProjectsResponse = await getProjectsApproved({ page: approvedPage, limit });
      setApprovedProjects(response.projects);
      setApprovedTotalPages(response.pagination.totalPages);
      setApprovedTotal(response.pagination.total);
    } catch (err: any) {
      // If endpoint doesn't exist yet, just show empty state
      console.warn('Could not fetch approved projects:', err);
      setApprovedProjects([]);
      setApprovedTotalPages(1);
      setApprovedTotal(0);
    } finally {
      setApprovedLoading(false);
    }
  }, [approvedPage]);

  useEffect(() => {
    fetchPendingProjects();
    fetchApprovedProjects();
  }, [fetchPendingProjects, fetchApprovedProjects]);

  const handleApprove = async (project: PendingProject) => {
    if (!confirm(`¿Aprobar el proyecto "${project.name}"?`)) return;

    setActionLoading(project.id);
    try {
      await approvePartnerProject(project.partner.id, project.id);
      fetchPendingProjects();
      fetchApprovedProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al aprobar proyecto');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!showRejectModal || !rejectReason.trim()) return;

    setActionLoading(showRejectModal.id);
    try {
      await rejectPartnerProject(showRejectModal.partner.id, showRejectModal.id, rejectReason);
      setShowRejectModal(null);
      setRejectReason('');
      fetchPendingProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al rechazar proyecto');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (project: PendingProject) => {
    if (!confirm(`¿Activar el proyecto "${project.name}"? Una vez activo, estará disponible para certificación y compensaciones.`)) return;

    setActionLoading(project.id);
    try {
      await activatePartnerProject(project.id);
      fetchApprovedProjects();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Error al activar proyecto';
      alert(message);
    } finally {
      setActionLoading(null);
    }
  };

  const currentProjects = activeTab === 'pending' ? pendingProjects : approvedProjects;
  const currentLoading = activeTab === 'pending' ? pendingLoading : approvedLoading;
  const currentPage = activeTab === 'pending' ? pendingPage : approvedPage;
  const currentTotalPages = activeTab === 'pending' ? pendingTotalPages : approvedTotalPages;
  const currentTotal = activeTab === 'pending' ? pendingTotal : approvedTotal;
  const setCurrentPage = activeTab === 'pending' ? setPendingPage : setApprovedPage;

  const filteredProjects = currentProjects.filter(p =>
    !search || 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.partner.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div className="!flex !flex-col md:!flex-row !justify-between !items-start md:!items-center !gap-4">
        <div>
          <h1 className="!text-3xl !font-bold !text-slate-800 dark:!text-slate-100 !flex !items-center !gap-3">
            <TreePine className="!w-8 !h-8 !text-emerald-600" />
            Gestión de Proyectos ESG
          </h1>
          <p className="!text-slate-500 dark:!text-slate-400 !mt-1">
            Revisar, aprobar y activar proyectos de Impact Partners
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="!flex !gap-2 !bg-white dark:!bg-slate-800 !p-1.5 !rounded-xl !shadow-sm !border !border-slate-100 dark:!border-slate-700 !w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`!flex !items-center !gap-2 !px-5 !py-2.5 !rounded-lg !font-medium !transition-all ${
            activeTab === 'pending'
              ? '!bg-amber-100 dark:!bg-amber-900/30 !text-amber-700 dark:!text-amber-400'
              : '!text-slate-600 dark:!text-slate-400 hover:!bg-slate-100 dark:hover:!bg-slate-700'
          }`}
        >
          <Clock className="!w-4 !h-4" />
          Pendientes de Revisión
          {pendingTotal > 0 && (
            <span className="!bg-amber-600 !text-white !text-xs !px-2 !py-0.5 !rounded-full !font-bold">
              {pendingTotal}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`!flex !items-center !gap-2 !px-5 !py-2.5 !rounded-lg !font-medium !transition-all ${
            activeTab === 'approved'
              ? '!bg-emerald-100 dark:!bg-emerald-900/30 !text-emerald-700 dark:!text-emerald-400'
              : '!text-slate-600 dark:!text-slate-400 hover:!bg-slate-100 dark:hover:!bg-slate-700'
          }`}
        >
          <CheckCircle2 className="!w-4 !h-4" />
          Aprobados (por Activar)
          {approvedTotal > 0 && (
            <span className="!bg-emerald-600 !text-white !text-xs !px-2 !py-0.5 !rounded-full !font-bold">
              {approvedTotal}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="!bg-white dark:!bg-slate-800 !rounded-2xl !p-4 !shadow-sm !border !border-slate-100 dark:!border-slate-700">
        <div className="!relative !max-w-md">
          <Search className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !w-5 !h-5 !text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o partner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!w-full !pl-10 !pr-4 !py-2.5 !border !border-slate-200 dark:!border-slate-600 !rounded-xl !bg-white dark:!bg-slate-700 !text-slate-800 dark:!text-slate-200 placeholder:!text-slate-400 focus:!ring-2 focus:!ring-emerald-500/20 focus:!border-emerald-500 !outline-none !transition-all"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="!bg-red-50 dark:!bg-red-900/20 !text-red-700 dark:!text-red-400 !px-4 !py-3 !rounded-xl !flex !items-center !gap-2">
          <AlertTriangle className="!w-5 !h-5" />
          {error}
        </div>
      )}

      {/* Projects List */}
      {currentLoading ? (
        <div className="!bg-white dark:!bg-slate-800 !rounded-2xl !p-12 !text-center !shadow-sm !border !border-slate-100 dark:!border-slate-700">
          <RefreshCw className="!w-8 !h-8 !animate-spin !text-emerald-600 !mx-auto" />
          <p className="!text-slate-500 dark:!text-slate-400 !mt-4">Cargando proyectos...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="!bg-white dark:!bg-slate-800 !rounded-2xl !p-12 !text-center !shadow-sm !border !border-slate-100 dark:!border-slate-700">
          <TreePine className="!w-16 !h-16 !text-slate-300 dark:!text-slate-600 !mx-auto" />
          <p className="!text-slate-500 dark:!text-slate-400 !mt-4 !text-lg">
            {activeTab === 'pending' 
              ? 'No hay proyectos pendientes de revisión'
              : 'No hay proyectos aprobados por activar'
            }
          </p>
          <p className="!text-slate-400 dark:!text-slate-500 !text-sm !mt-1">
            {activeTab === 'pending'
              ? 'Los proyectos aparecerán aquí cuando los partners los envíen para revisión'
              : 'Los proyectos aprobados aparecerán aquí para que los actives'
            }
          </p>
        </div>
      ) : (
        <div className="!space-y-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="!bg-white dark:!bg-slate-800 !rounded-2xl !p-6 !shadow-sm !border !border-slate-100 dark:!border-slate-700 hover:!shadow-md !transition-shadow"
            >
              <div className="!flex !flex-col lg:!flex-row !gap-6">
                {/* Project Info */}
                <div className="!flex-1">
                  <div className="!flex !items-start !gap-4">
                    <div className={`!w-14 !h-14 !rounded-2xl !flex !items-center !justify-center !flex-shrink-0 ${
                      activeTab === 'pending' 
                        ? '!bg-gradient-to-br !from-amber-400 !to-orange-600'
                        : '!bg-gradient-to-br !from-emerald-400 !to-green-600'
                    }`}>
                      <Leaf className="!w-7 !h-7 !text-white" />
                    </div>
                    <div className="!flex-1 !min-w-0">
                      <div className="!flex !items-center !gap-2 !flex-wrap">
                        <h3 className="!text-lg !font-bold !text-slate-800 dark:!text-slate-100">{project.name}</h3>
                        <span className={`!px-2 !py-0.5 !text-xs !font-medium !rounded-full !flex !items-center !gap-1 ${
                          activeTab === 'pending'
                            ? '!bg-amber-100 dark:!bg-amber-900/30 !text-amber-700 dark:!text-amber-400'
                            : '!bg-emerald-100 dark:!bg-emerald-900/30 !text-emerald-700 dark:!text-emerald-400'
                        }`}>
                          {activeTab === 'pending' ? (
                            <>
                              <Clock className="!w-3 !h-3" />
                              Pendiente de revisión
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="!w-3 !h-3" />
                              Aprobado - Por activar
                            </>
                          )}
                        </span>
                      </div>
                      <p className="!text-sm !text-slate-500 dark:!text-slate-400 !mt-1">Código: {project.code}</p>
                      {project.description && (
                        <p className="!text-sm !text-slate-600 dark:!text-slate-300 !mt-2 !line-clamp-2">{project.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="!flex !flex-wrap !gap-4 !mt-4 !text-sm">
                    <div className="!flex !items-center !gap-1.5 !text-slate-600 dark:!text-slate-400">
                      <FileText className="!w-4 !h-4 !text-slate-400" />
                      {projectTypeLabels[project.type] || project.type}
                    </div>
                    <div className="!flex !items-center !gap-1.5 !text-slate-600 dark:!text-slate-400">
                      <MapPin className="!w-4 !h-4 !text-slate-400" />
                      {project.country}{project.region ? `, ${project.region}` : ''}
                    </div>
                    {project.price_per_ton_usd && (
                      <div className="!flex !items-center !gap-1.5 !text-slate-600 dark:!text-slate-400">
                        <DollarSign className="!w-4 !h-4 !text-slate-400" />
                        ${project.price_per_ton_usd} USD/ton
                      </div>
                    )}
                    <div className="!flex !items-center !gap-1.5 !text-slate-600 dark:!text-slate-400">
                      <Calendar className="!w-4 !h-4 !text-slate-400" />
                      {activeTab === 'pending' 
                        ? `Enviado: ${new Date(project.submitted_at || project.created_at).toLocaleDateString('es-CL')}`
                        : `Aprobado: ${new Date(project.approved_at || project.created_at).toLocaleDateString('es-CL')}`
                      }
                    </div>
                  </div>

                  {/* Partner */}
                  <div className="!mt-4 !pt-4 !border-t !border-slate-100 dark:!border-slate-700">
                    <div className="!flex !items-center !gap-3">
                      {project.partner.logo_url ? (
                        <img
                          src={project.partner.logo_url}
                          alt={project.partner.name}
                          className="!w-8 !h-8 !rounded-lg !object-cover"
                        />
                      ) : (
                        <div className="!w-8 !h-8 !rounded-lg !bg-indigo-100 dark:!bg-indigo-900/30 !flex !items-center !justify-center !text-indigo-600 dark:!text-indigo-400 !font-bold !text-sm">
                          {project.partner.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="!text-sm !font-medium !text-slate-700 dark:!text-slate-300">{project.partner.name}</p>
                        <button
                          onClick={() => navigate(`/admin/partners/${project.partner.id}`)}
                          className="!text-xs !text-indigo-600 dark:!text-indigo-400 hover:!underline"
                        >
                          Ver partner
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="!flex lg:!flex-col !gap-2 !flex-shrink-0">
                  <button
                    onClick={() => navigate(`/admin/partners/${project.partner.id}?tab=projects`)}
                    className="!flex !items-center !justify-center !gap-2 !px-4 !py-2.5 !border !border-slate-200 dark:!border-slate-600 !text-slate-700 dark:!text-slate-300 !rounded-xl !font-medium hover:!bg-slate-50 dark:hover:!bg-slate-700 !transition-colors"
                  >
                    <Eye className="!w-4 !h-4" />
                    Ver Detalle
                  </button>
                  
                  {activeTab === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApprove(project)}
                        disabled={actionLoading === project.id}
                        className="!flex !items-center !justify-center !gap-2 !px-4 !py-2.5 !bg-emerald-600 !text-white !rounded-xl !font-medium hover:!bg-emerald-700 !transition-colors disabled:!opacity-60"
                      >
                        {actionLoading === project.id ? (
                          <RefreshCw className="!w-4 !h-4 !animate-spin" />
                        ) : (
                          <Check className="!w-4 !h-4" />
                        )}
                        Aprobar
                      </button>
                      <button
                        onClick={() => setShowRejectModal(project)}
                        disabled={actionLoading === project.id}
                        className="!flex !items-center !justify-center !gap-2 !px-4 !py-2.5 !bg-red-600 !text-white !rounded-xl !font-medium hover:!bg-red-700 !transition-colors disabled:!opacity-60"
                      >
                        <X className="!w-4 !h-4" />
                        Rechazar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleActivate(project)}
                      disabled={actionLoading === project.id}
                      className="!flex !items-center !justify-center !gap-2 !px-4 !py-2.5 !bg-gradient-to-r !from-emerald-500 !to-green-600 !text-white !rounded-xl !font-medium hover:!from-emerald-600 hover:!to-green-700 !transition-all !shadow-lg !shadow-emerald-500/30 disabled:!opacity-60"
                    >
                      {actionLoading === project.id ? (
                        <RefreshCw className="!w-4 !h-4 !animate-spin" />
                      ) : (
                        <Zap className="!w-4 !h-4" />
                      )}
                      Activar Proyecto
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {currentTotalPages > 1 && (
        <div className="!flex !items-center !justify-between !bg-white dark:!bg-slate-800 !rounded-2xl !p-4 !shadow-sm !border !border-slate-100 dark:!border-slate-700">
          <p className="!text-sm !text-slate-500 dark:!text-slate-400">
            Mostrando {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, currentTotal)} de {currentTotal}
          </p>
          <div className="!flex !items-center !gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="!p-2 !rounded-lg !border !border-slate-200 dark:!border-slate-600 hover:!bg-slate-50 dark:hover:!bg-slate-700 disabled:!opacity-50 !transition-colors"
            >
              <ChevronLeft className="!w-5 !h-5" />
            </button>
            <span className="!px-4 !py-2 !text-sm !font-medium !text-slate-600 dark:!text-slate-300">
              {currentPage} / {currentTotalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(currentTotalPages, p + 1))}
              disabled={currentPage === currentTotalPages}
              className="!p-2 !rounded-lg !border !border-slate-200 dark:!border-slate-600 hover:!bg-slate-50 dark:hover:!bg-slate-700 disabled:!opacity-50 !transition-colors"
            >
              <ChevronRight className="!w-5 !h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="!fixed !inset-0 !bg-black/50 !backdrop-blur-sm !flex !items-center !justify-center !z-50 !p-4">
          <div className="!bg-white dark:!bg-slate-800 !rounded-2xl !shadow-2xl !max-w-md !w-full !p-6">
            <h3 className="!text-lg !font-bold !text-slate-800 dark:!text-slate-100 !mb-2">Rechazar Proyecto</h3>
            <p className="!text-sm !text-slate-600 dark:!text-slate-400 !mb-4">
              Estás rechazando: <strong>{showRejectModal.name}</strong>
            </p>
            <p className="!text-sm !text-slate-500 dark:!text-slate-400 !mb-4">
              Por favor, indica el motivo del rechazo. El partner recibirá esta información.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motivo del rechazo..."
              rows={4}
              className="!w-full !px-4 !py-3 !border !border-slate-200 dark:!border-slate-600 !rounded-xl !bg-white dark:!bg-slate-700 !text-slate-800 dark:!text-slate-200 placeholder:!text-slate-400 focus:!ring-2 focus:!ring-red-500/20 focus:!border-red-500 !outline-none !resize-none"
            />
            <div className="!flex !gap-3 !mt-4">
              <button
                onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                className="!flex-1 !py-2.5 !border !border-slate-200 dark:!border-slate-600 !text-slate-700 dark:!text-slate-300 !rounded-xl !font-medium hover:!bg-slate-50 dark:hover:!bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading === showRejectModal.id}
                className="!flex-1 !py-2.5 !bg-red-600 !text-white !rounded-xl !font-medium hover:!bg-red-700 disabled:!opacity-60"
              >
                {actionLoading === showRejectModal.id ? 'Rechazando...' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
