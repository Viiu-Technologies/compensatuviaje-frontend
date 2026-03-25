// ============================================
// PARTNER PROJECTS LIST PAGE
// Lista de proyectos ESG del Partner
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  EsgProject,
  ProjectStatus,
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS
} from '../../../types/partner.types';
import { getPartnerProjects, deleteProject } from '../services/partnerApi';

// ============================================
// FILTER COMPONENT
// ============================================

interface FilterProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
}

const ProjectFilters: React.FC<FilterProps> = ({ currentStatus, onStatusChange }) => {
  const statusOptions: { value: string; label: string }[] = [
    { value: '', label: 'Todos los estados' },
    { value: 'draft', label: 'Borrador' },
    { value: 'pending_review', label: 'En Revisión' },
    { value: 'approved', label: 'Aprobado' },
    { value: 'active', label: 'Activo' },
    { value: 'rejected', label: 'Rechazado' },
    { value: 'paused', label: 'Pausado' },
    { value: 'completed', label: 'Completado' }
  ];

  return (
    <div className="!bg-white dark:bg-slate-800 dark:!bg-slate-800 !rounded-lg !border !p-4 !mb-6">
      <div className="!flex !flex-wrap !items-center !gap-4">
        <div className="!flex !items-center !gap-2">
          <svg className="!w-5 !h-5 !text-slate-400 dark:!text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="!text-sm !text-slate-600 dark:!text-slate-300">Filtrar:</span>
        </div>
        <select
          value={currentStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="!px-3 !py-2 !border !border-slate-300 dark:!border-slate-600 !rounded-lg !text-sm focus:!ring-2 focus:!ring-emerald-500 focus:!border-emerald-500"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// ============================================
// PROJECT CARD COMPONENT
// ============================================

interface ProjectCardProps {
  project: EsgProject;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(project.id);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const canDelete = project.status === 'draft';
  const canEdit = ['draft', 'rejected'].includes(project.status);

  return (
    <>
      <div className="!bg-white dark:bg-slate-800 dark:!bg-slate-800 !rounded-xl !border !shadow-sm hover:!shadow-md !transition-shadow !overflow-hidden">
        {/* Card Header */}
        <div className="!p-6">
          <div className="!flex !items-start !justify-between">
            <div className="!flex-1 !min-w-0">
              <div className="!flex !items-center !gap-3 !mb-2">
                <div className="!w-10 !h-10 !bg-emerald-100 !rounded-lg !flex !items-center !justify-center !text-emerald-600">
                  <svg className="!w-5 !h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <div>
                  <span className="!text-xs !font-mono !text-slate-500 dark:!text-slate-400">{project.code}</span>
                  <h3 className="!font-semibold !text-slate-800 dark:!text-slate-100 !truncate">{project.name}</h3>
                </div>
              </div>
              
              <p className="!text-sm !text-slate-500 dark:!text-slate-400 !line-clamp-2 !mb-4">
                {project.description || 'Sin descripción'}
              </p>

              <div className="!flex !flex-wrap !items-center !gap-2 !text-sm">
                <span className={`!px-2.5 !py-1 !text-xs !font-medium !rounded-full ${PROJECT_STATUS_COLORS[project.status]}`}>
                  {PROJECT_STATUS_LABELS[project.status]}
                </span>
                <span className="!text-slate-400 dark:!text-slate-500">•</span>
                <span className="!text-slate-600 dark:!text-slate-300">
                  {PROJECT_TYPE_LABELS[project.type]}
                </span>
                <span className="!text-slate-400 dark:!text-slate-500">•</span>
                <span className="!text-slate-600 dark:!text-slate-300">
                  {project.location_country}
                  {project.location_region && `, ${project.location_region}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="!px-6 !py-4 !bg-slate-50 dark:!bg-slate-900 !border-t !flex !items-center !justify-between">
          <div className="!text-sm !text-slate-500 dark:!text-slate-400">
            Creado: {new Date(project.created_at).toLocaleDateString('es-CL')}
          </div>
          <div className="!flex !items-center !gap-2">
            {canDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="!p-2 !text-slate-400 dark:!text-slate-500 hover:!text-red-600 dark:!text-red-400 hover:!bg-red-50 dark:!bg-red-900/30 !rounded-lg !transition-colors"
                title="Eliminar"
              >
                <svg className="!w-5 !h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            {canEdit && (
              <Link
                to={`/partner/projects/${project.id}/edit`}
                className="!p-2 !text-slate-400 dark:!text-slate-500 hover:!text-blue-600 hover:!bg-blue-50 !rounded-lg !transition-colors"
                title="Editar"
              >
                <svg className="!w-5 !h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
            )}
            <Link
              to={`/partner/projects/${project.id}`}
              className="!inline-flex !items-center !gap-1 !px-3 !py-2 !text-sm !font-medium !text-emerald-600 hover:!text-emerald-700 hover:!bg-emerald-50 !rounded-lg !transition-colors !no-underline"
            >
              Ver detalle
              <svg className="!w-4 !h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Eliminar proyecto</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              ¿Estás seguro de que deseas eliminar el proyecto <strong>{project.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:bg-slate-900 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================
// EMPTY STATE COMPONENT
// ============================================

const EmptyState: React.FC<{ hasFilter: boolean }> = ({ hasFilter }) => (
  <div className="!bg-white dark:bg-slate-800 dark:!bg-slate-800 !rounded-xl !border !p-12 !text-center">
    <div className="!w-20 !h-20 !bg-slate-100 dark:!bg-slate-800 !rounded-full !flex !items-center !justify-center !mx-auto !mb-6">
      <svg className="!w-10 !h-10 !text-slate-400 dark:!text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    </div>
    {hasFilter ? (
      <>
        <h3 className="!text-lg !font-semibold !text-slate-800 dark:!text-slate-100 !mb-2">
          No hay proyectos con este filtro
        </h3>
        <p className="!text-slate-500 dark:!text-slate-400 !mb-6">
          Intenta cambiar los filtros de búsqueda
        </p>
      </>
    ) : (
      <>
        <h3 className="!text-lg !font-semibold !text-slate-800 dark:!text-slate-100 !mb-2">
          No tienes proyectos aún
        </h3>
        <p className="!text-slate-500 dark:!text-slate-400 !mb-6">
          Crea tu primer proyecto ESG para comenzar a recibir compensaciones
        </p>
        <Link
          to="/partner/projects/create"
          className="!inline-flex !items-center !gap-2 !px-6 !py-3 !bg-gradient-to-r !from-emerald-500 !to-teal-600 !text-white !rounded-xl hover:!from-emerald-600 hover:!to-teal-700 !transition-all !font-semibold !shadow-lg !shadow-emerald-500/20 !no-underline"
        >
          <svg className="!w-5 !h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Crear primer proyecto
        </Link>
      </>
    )}
  </div>
);

// ============================================
// PAGINATION COMPONENT
// ============================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="!flex !items-center !justify-center !gap-2 !mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="!p-2 !border !border-slate-300 dark:!border-slate-600 !rounded-lg hover:!bg-slate-50 dark:!bg-slate-900 disabled:!opacity-50 disabled:!cursor-not-allowed"
      >
        <svg className="!w-5 !h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`!w-10 !h-10 !rounded-lg !font-medium ${
            page === currentPage
              ? '!bg-emerald-600 !text-white'
              : '!border !border-slate-300 dark:!border-slate-600 hover:!bg-slate-50 dark:!bg-slate-900'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="!p-2 !border !border-slate-300 dark:!border-slate-600 !rounded-lg hover:!bg-slate-50 dark:!bg-slate-900 disabled:!opacity-50 disabled:!cursor-not-allowed"
      >
        <svg className="!w-5 !h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

// ============================================
// MAIN PROJECTS LIST COMPONENT
// ============================================

const PartnerProjects: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<EsgProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const currentStatus = searchParams.get('status') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    loadProjects();
  }, [currentStatus, currentPage]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const result = await getPartnerProjects({
        page: currentPage,
        limit: 10,
        status: currentStatus || undefined
      });

      if (result) {
        setProjects(result.projects);
        // API returns snake_case pagination, normalize to our format
        const pag = result.pagination || {};
        setPagination({
          page: pag.page || 1,
          limit: pag.limit || 10,
          total: pag.total || 0,
          totalPages: pag.total_pages || pag.totalPages || 1
        });
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (status) {
      newParams.set('status', status);
    } else {
      newParams.delete('status');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteProject(id);
      if (success) {
        loadProjects();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div className="!flex !items-center !justify-between">
        <div>
          <h1 className="!text-2xl !font-bold !text-slate-800">Mis Proyectos ESG</h1>
          <p className="!text-slate-500 !mt-1">
            {pagination.total} proyecto{pagination.total !== 1 ? 's' : ''} en total
          </p>
        </div>
        <Link
          to="/partner/projects/create"
          className="!inline-flex !items-center !gap-2 !px-5 !py-2.5 !bg-gradient-to-r !from-emerald-500 !to-teal-600 !text-white !rounded-xl hover:!from-emerald-600 hover:!to-teal-700 !transition-all !font-semibold !shadow-lg !shadow-emerald-500/20 !no-underline"
        >
          <svg className="!w-5 !h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Proyecto
        </Link>
      </div>

      {/* Filters */}
        <ProjectFilters
          currentStatus={currentStatus}
          onStatusChange={handleStatusChange}
        />

        {/* Projects Grid */}
        {loading ? (
          <div className="!grid !grid-cols-1 lg:!grid-cols-2 !gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="!bg-white dark:bg-slate-800 dark:!bg-slate-800 !rounded-xl !border !p-6 !animate-pulse">
                <div className="!flex !items-start !gap-4">
                  <div className="!w-10 !h-10 !bg-slate-200 dark:!bg-slate-700 !rounded-lg" />
                  <div className="!flex-1">
                    <div className="!h-4 !bg-slate-200 dark:!bg-slate-700 !rounded !w-1/4 !mb-2" />
                    <div className="!h-5 !bg-slate-200 dark:!bg-slate-700 !rounded !w-3/4 !mb-4" />
                    <div className="!h-4 !bg-slate-200 dark:!bg-slate-700 !rounded !w-full !mb-4" />
                    <div className="!flex !gap-2">
                      <div className="!h-6 !bg-slate-200 dark:!bg-slate-700 !rounded !w-20" />
                      <div className="!h-6 !bg-slate-200 dark:!bg-slate-700 !rounded !w-24" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState hasFilter={!!currentStatus} />
        ) : (
          <>
            <div className="!grid !grid-cols-1 lg:!grid-cols-2 !gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
    </div>
  );
};

export default PartnerProjects;
