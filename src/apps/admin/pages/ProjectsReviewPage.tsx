/**
 * Projects Review Page
 * Proyectos ESG pendientes de revisión (todos los partners)
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
  Filter
} from 'lucide-react';
import { getProjectsPendingReview, approvePartnerProject, rejectPartnerProject } from '../services/adminApi';

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

export default function ProjectsReviewPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<PendingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<PendingProject | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [search, setSearch] = useState('');

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response: ProjectsResponse = await getProjectsPendingReview({ page, limit });
      setProjects(response.projects);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar proyectos');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleApprove = async (project: PendingProject) => {
    if (!confirm(`¿Aprobar el proyecto "${project.name}"?`)) return;

    setActionLoading(project.id);
    try {
      await approvePartnerProject(project.partner.id, project.id);
      fetchProjects();
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
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al rechazar proyecto');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProjects = projects.filter(p =>
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
          <h1 className="!text-3xl !font-bold !text-slate-800 !flex !items-center !gap-3">
            <TreePine className="!w-8 !h-8 !text-emerald-600" />
            Proyectos Pendientes de Revisión
          </h1>
          <p className="!text-slate-500 !mt-1">
            Revisar y aprobar proyectos ESG de Impact Partners
          </p>
        </div>
        <div className="!bg-amber-100 !text-amber-800 !px-4 !py-2 !rounded-xl !font-medium !flex !items-center !gap-2">
          <Clock className="!w-5 !h-5" />
          {total} proyectos pendientes
        </div>
      </div>

      {/* Search */}
      <div className="!bg-white !rounded-2xl !p-4 !shadow-sm !border !border-slate-100">
        <div className="!relative !max-w-md">
          <Search className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !w-5 !h-5 !text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o partner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!w-full !pl-10 !pr-4 !py-2.5 !border !border-slate-200 !rounded-xl !bg-white !text-slate-800 placeholder:!text-slate-400 focus:!ring-2 focus:!ring-emerald-500/20 focus:!border-emerald-500 !outline-none !transition-all"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="!bg-red-50 !text-red-700 !px-4 !py-3 !rounded-xl !flex !items-center !gap-2">
          <AlertTriangle className="!w-5 !h-5" />
          {error}
        </div>
      )}

      {/* Projects List */}
      {loading ? (
        <div className="!bg-white !rounded-2xl !p-12 !text-center !shadow-sm !border !border-slate-100">
          <RefreshCw className="!w-8 !h-8 !animate-spin !text-emerald-600 !mx-auto" />
          <p className="!text-slate-500 !mt-4">Cargando proyectos...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="!bg-white !rounded-2xl !p-12 !text-center !shadow-sm !border !border-slate-100">
          <TreePine className="!w-16 !h-16 !text-slate-300 !mx-auto" />
          <p className="!text-slate-500 !mt-4 !text-lg">No hay proyectos pendientes de revisión</p>
          <p className="!text-slate-400 !text-sm !mt-1">
            Los proyectos aparecerán aquí cuando los partners los envíen para revisión
          </p>
        </div>
      ) : (
        <div className="!space-y-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="!bg-white !rounded-2xl !p-6 !shadow-sm !border !border-slate-100 hover:!shadow-md !transition-shadow"
            >
              <div className="!flex !flex-col lg:!flex-row !gap-6">
                {/* Project Info */}
                <div className="!flex-1">
                  <div className="!flex !items-start !gap-4">
                    <div className="!w-14 !h-14 !rounded-2xl !bg-gradient-to-br !from-emerald-400 !to-green-600 !flex !items-center !justify-center !flex-shrink-0">
                      <Leaf className="!w-7 !h-7 !text-white" />
                    </div>
                    <div className="!flex-1 !min-w-0">
                      <div className="!flex !items-center !gap-2 !flex-wrap">
                        <h3 className="!text-lg !font-bold !text-slate-800">{project.name}</h3>
                        <span className="!px-2 !py-0.5 !bg-amber-100 !text-amber-700 !text-xs !font-medium !rounded-full !flex !items-center !gap-1">
                          <Clock className="!w-3 !h-3" />
                          Pendiente
                        </span>
                      </div>
                      <p className="!text-sm !text-slate-500 !mt-1">Código: {project.code}</p>
                      {project.description && (
                        <p className="!text-sm !text-slate-600 !mt-2 !line-clamp-2">{project.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="!flex !flex-wrap !gap-4 !mt-4 !text-sm">
                    <div className="!flex !items-center !gap-1.5 !text-slate-600">
                      <FileText className="!w-4 !h-4 !text-slate-400" />
                      {projectTypeLabels[project.type] || project.type}
                    </div>
                    <div className="!flex !items-center !gap-1.5 !text-slate-600">
                      <MapPin className="!w-4 !h-4 !text-slate-400" />
                      {project.country}{project.region ? `, ${project.region}` : ''}
                    </div>
                    {project.price_per_ton_usd && (
                      <div className="!flex !items-center !gap-1.5 !text-slate-600">
                        <DollarSign className="!w-4 !h-4 !text-slate-400" />
                        ${project.price_per_ton_usd} USD/ton
                      </div>
                    )}
                    <div className="!flex !items-center !gap-1.5 !text-slate-600">
                      <Calendar className="!w-4 !h-4 !text-slate-400" />
                      Enviado: {new Date(project.submitted_at || project.created_at).toLocaleDateString('es-CL')}
                    </div>
                  </div>

                  {/* Partner */}
                  <div className="!mt-4 !pt-4 !border-t !border-slate-100">
                    <div className="!flex !items-center !gap-3">
                      {project.partner.logo_url ? (
                        <img
                          src={project.partner.logo_url}
                          alt={project.partner.name}
                          className="!w-8 !h-8 !rounded-lg !object-cover"
                        />
                      ) : (
                        <div className="!w-8 !h-8 !rounded-lg !bg-indigo-100 !flex !items-center !justify-center !text-indigo-600 !font-bold !text-sm">
                          {project.partner.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="!text-sm !font-medium !text-slate-700">{project.partner.name}</p>
                        <button
                          onClick={() => navigate(`/admin/partners/${project.partner.id}`)}
                          className="!text-xs !text-indigo-600 hover:!underline"
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
                    className="!flex !items-center !justify-center !gap-2 !px-4 !py-2.5 !border !border-slate-200 !text-slate-700 !rounded-xl !font-medium hover:!bg-slate-50 !transition-colors"
                  >
                    <Eye className="!w-4 !h-4" />
                    Ver Detalle
                  </button>
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="!flex !items-center !justify-between !bg-white !rounded-2xl !p-4 !shadow-sm !border !border-slate-100">
          <p className="!text-sm !text-slate-500">
            Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)} de {total}
          </p>
          <div className="!flex !items-center !gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="!p-2 !rounded-lg !border !border-slate-200 hover:!bg-slate-50 disabled:!opacity-50 !transition-colors"
            >
              <ChevronLeft className="!w-5 !h-5" />
            </button>
            <span className="!px-4 !py-2 !text-sm !font-medium !text-slate-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="!p-2 !rounded-lg !border !border-slate-200 hover:!bg-slate-50 disabled:!opacity-50 !transition-colors"
            >
              <ChevronRight className="!w-5 !h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="!fixed !inset-0 !bg-black/50 !backdrop-blur-sm !flex !items-center !justify-center !z-50 !p-4">
          <div className="!bg-white !rounded-2xl !shadow-2xl !max-w-md !w-full !p-6">
            <h3 className="!text-lg !font-bold !text-slate-800 !mb-2">Rechazar Proyecto</h3>
            <p className="!text-sm !text-slate-600 !mb-4">
              Estás rechazando: <strong>{showRejectModal.name}</strong>
            </p>
            <p className="!text-sm !text-slate-500 !mb-4">
              Por favor, indica el motivo del rechazo. El partner recibirá esta información.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motivo del rechazo..."
              rows={4}
              className="!w-full !px-4 !py-3 !border !border-slate-200 !rounded-xl !bg-white !text-slate-800 placeholder:!text-slate-400 focus:!ring-2 focus:!ring-red-500/20 focus:!border-red-500 !outline-none !resize-none"
            />
            <div className="!flex !gap-3 !mt-4">
              <button
                onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                className="!flex-1 !py-2.5 !border !border-slate-200 !text-slate-700 !rounded-xl !font-medium hover:!bg-slate-50"
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
