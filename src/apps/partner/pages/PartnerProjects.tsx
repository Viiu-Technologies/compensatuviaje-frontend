// ============================================
// PARTNER PROJECTS LIST PAGE
// Lista de proyectos ESG del Partner
// ============================================

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react';
import { EsgProject, PROJECT_TYPE_LABELS } from '../../../types/partner.types';
import { deleteProject, getPartnerProjects } from '../services/partnerApi';
import {
  btn,
  Card,
  cx,
  Dialog,
  EmptyState,
  ErrorState,
  fmtCLP,
  fmtDate,
  fmtInt,
  PageHeader,
  Progress,
  ProjectStatusBadge,
  Skeleton,
  unitOf,
} from '../ui';

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'draft', label: 'Borrador' },
  { value: 'pending_review', label: 'En revisión' },
  { value: 'approved', label: 'Aprobado' },
  { value: 'active', label: 'Activo' },
  { value: 'rejected', label: 'Rechazado' },
  { value: 'paused', label: 'Pausado' },
  { value: 'completed', label: 'Completado' },
];

// ============================================
// PROJECT CARD
// ============================================

const ProjectCard: React.FC<{ project: EsgProject; onDelete: (p: EsgProject) => void }> = ({ project, onDelete }) => {
  const canDelete = project.status === 'draft';
  const canEdit = ['draft', 'rejected'].includes(project.status);
  const unit = unitOf(project);

  const total = project.capacity_total || 0;
  const sold = project.capacity_sold || 0;
  const available = project.capacity_available ?? Math.max(0, total - sold);
  const monthlyApproved = project.monthly_stock_approved || 0;
  const monthlyRemaining = project.monthly_stock_remaining || 0;
  const location = [project.location_region, project.location_country].filter(Boolean).join(', ');

  return (
    <Card className="p-0 flex flex-col" as="article">
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="m-0 text-xs font-medium text-gray-500 tabular-nums">{project.code}</p>
            <h2 className="m-0 mt-0.5 text-base font-semibold text-gray-900 leading-snug">
              <Link to={`/partner/projects/${project.id}`} className="text-inherit no-underline hover:text-brand-700">
                {project.name}
              </Link>
            </h2>
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>
        <p className="m-0 mt-1 text-sm text-gray-500">
          {PROJECT_TYPE_LABELS[project.type] ?? project.type}
          {location && <> · {location}</>}
        </p>
        {project.description && <p className="m-0 mt-3 text-sm text-gray-600 line-clamp-2">{project.description}</p>}

        {(total > 0 || monthlyApproved > 0) && (
          <div className="mt-5 space-y-4">
            {total > 0 && (
              <div>
                <div className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="text-gray-500">Capacidad vendida</span>
                  <span className="font-medium text-gray-800 tabular-nums">
                    {fmtInt(sold)} de {fmtInt(total)} {unit}
                  </span>
                </div>
                <Progress value={(sold / total) * 100} label="Capacidad vendida" className="mt-1.5" />
                <p className="m-0 mt-1 text-xs text-gray-500">{fmtInt(available)} disponibles</p>
              </div>
            )}
            {monthlyApproved > 0 && (
              <div>
                <div className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="text-gray-500">Stock del mes</span>
                  <span className="font-medium text-gray-800 tabular-nums">
                    {fmtInt(monthlyRemaining)} de {fmtInt(monthlyApproved)} {unit}
                  </span>
                </div>
                <Progress value={(monthlyRemaining / monthlyApproved) * 100} label="Stock del mes" className="mt-1.5" />
              </div>
            )}
          </div>
        )}

        <dl className="m-0 mt-5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
          {(project.provider_cost_unit_clp ?? 0) > 0 && (
            <div className="flex gap-1">
              <dt>Costo por unidad</dt>
              <dd className="m-0 font-semibold text-gray-800">{fmtCLP(project.provider_cost_unit_clp)}</dd>
            </div>
          )}
          {project.certification && (
            <div className="flex gap-1">
              <dt>Certificación</dt>
              <dd className="m-0 font-semibold text-gray-800">{project.certification}</dd>
            </div>
          )}
          <div className="flex gap-1">
            <dt>Documentos</dt>
            <dd className="m-0 font-semibold text-gray-800">{fmtInt(project.documents_count)}</dd>
          </div>
          <div className="flex gap-1">
            <dt>Evidencias</dt>
            <dd className="m-0 font-semibold text-gray-800">{fmtInt(project.evidence_count)}</dd>
          </div>
        </dl>
      </div>

      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-500">Creado el {fmtDate(project.created_at)}</span>
        <div className="flex items-center gap-1.5">
          {canDelete && (
            <button type="button" onClick={() => onDelete(project)} className={btn.icon} aria-label={`Eliminar ${project.name}`} title="Eliminar">
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          {canEdit && (
            <Link to={`/partner/projects/${project.id}/edit`} className={btn.icon} aria-label={`Editar ${project.name}`} title="Editar">
              <Pencil className="w-4 h-4" aria-hidden="true" />
            </Link>
          )}
          <Link to={`/partner/projects/${project.id}`} className={cx(btn.secondary, btn.sm)}>
            Ver detalle
          </Link>
        </div>
      </div>
    </Card>
  );
};

// ============================================
// PAGINATION
// ============================================

const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void }> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;
  return (
    <nav className="flex items-center justify-center gap-3 mt-6" aria-label="Paginación">
      <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={btn.icon} aria-label="Página anterior">
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
      </button>
      <span className="text-sm text-gray-600 tabular-nums">
        Página {currentPage} de {totalPages}
      </span>
      <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={btn.icon} aria-label="Página siguiente">
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </button>
    </nav>
  );
};

// ============================================
// MAIN PROJECTS LIST COMPONENT
// ============================================

const PartnerProjects: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<EsgProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [toDelete, setToDelete] = useState<EsgProject | null>(null);
  const [deleting, setDeleting] = useState(false);

  const currentStatus = searchParams.get('status') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const loadProjects = async () => {
    setLoading(true);
    setFailed(false);
    try {
      const result = await getPartnerProjects({ page: currentPage, limit: 10, status: currentStatus || undefined });
      if (!result) throw new Error('sin respuesta');
      setProjects(result.projects || []);
      // La API devuelve la paginación en snake_case o camelCase
      const pag = result.pagination || {};
      setPagination({
        page: pag.page || 1,
        total: pag.total || 0,
        totalPages: pag.total_pages || pag.totalPages || 1,
      });
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStatus, currentPage]);

  const setParam = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setSearchParams(next);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const ok = await deleteProject(toDelete.id);
      if (!ok) throw new Error('no eliminado');
      toast.success('Proyecto eliminado');
      setToDelete(null);
      loadProjects();
    } catch {
      toast.error('No pudimos eliminar el proyecto. Inténtalo de nuevo.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Mis proyectos"
        subtitle={loading ? ' ' : `${fmtInt(pagination.total)} ${pagination.total === 1 ? 'proyecto' : 'proyectos'}${currentStatus ? ' con este estado' : ' en total'}`}
        actions={
          <Link to="/partner/projects/create" className={btn.primary}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            Nuevo proyecto
          </Link>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 -mx-1 px-1" role="group" aria-label="Filtrar por estado">
        {STATUS_FILTERS.map((f) => {
          const active = f.value === currentStatus;
          return (
            <button
              key={f.value || 'all'}
              type="button"
              aria-pressed={active}
              onClick={() => setParam({ status: f.value || null, page: null })}
              className={cx(
                'flex-shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium cursor-pointer transition-colors',
                active ? 'bg-brand-700 border-brand-700 text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : failed ? (
        <ErrorState title="No pudimos cargar tus proyectos" onRetry={loadProjects} />
      ) : projects.length === 0 ? (
        <Card>
          {currentStatus ? (
            <EmptyState
              icon={FolderKanban}
              title="No hay proyectos con este estado"
              action={
                <button type="button" className={btn.secondary} onClick={() => setParam({ status: null, page: null })}>
                  Ver todos
                </button>
              }
            />
          ) : (
            <EmptyState
              icon={FolderKanban}
              title="Aún no tienes proyectos"
              text="Registra tu primer proyecto ESG para comenzar a recibir compensaciones."
              action={
                <Link to="/partner/projects/create" className={btn.primary}>
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Crear primer proyecto
                </Link>
              }
            />
          )}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onDelete={setToDelete} />
            ))}
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => setParam({ page: String(page) })}
          />
        </>
      )}

      <Dialog
        open={!!toDelete}
        title="¿Eliminar este proyecto?"
        onClose={() => setToDelete(null)}
        busy={deleting}
        footer={
          <>
            <button type="button" className={btn.secondary} onClick={() => setToDelete(null)} disabled={deleting}>
              Cancelar
            </button>
            <button type="button" className={btn.danger} onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </button>
          </>
        }
      >
        <p className="m-0">
          Se eliminará <strong>{toDelete?.name}</strong>. Esta acción no se puede deshacer.
        </p>
      </Dialog>
    </div>
  );
};

export default PartnerProjects;
