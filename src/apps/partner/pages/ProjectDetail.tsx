// ============================================
// PROJECT DETAIL PAGE
// Detalle de un proyecto ESG específico
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  EsgProject,
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS
} from '../../../types/partner.types';
import {
  getProjectById,
  submitProjectForReview,
  deleteProject
} from '../services/partnerApi';
import { getProjectEvidence } from '../services/evidenceApi';
import PhotoCarousel from '../../../shared/components/PhotoCarousel';
import DocumentViewer from '../../../shared/components/DocumentViewer';
import { Bot, CheckCircle2, Clock, AlertTriangle, Camera, FileText, Upload } from 'lucide-react';

// ============================================
// PROJECT INFO CARD COMPONENT
// ============================================

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, children }) => (
  <div className="!bg-white dark:bg-slate-800 dark:!bg-slate-800 !rounded-xl !border !shadow-sm !p-6">
    <h3 className="!text-lg !font-semibold !text-slate-800 dark:!text-slate-100 !mb-4">{title}</h3>
    {children}
  </div>
);

// ============================================
// STAT ITEM COMPONENT
// ============================================

interface StatItemProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'purple' | 'yellow';
}

const StatItem: React.FC<StatItemProps> = ({ label, value, icon, color }) => {
  const colorClasses = {
    green: '!bg-emerald-50 !text-emerald-700',
    blue: '!bg-sky-50 !text-sky-700',
    purple: '!bg-violet-50 !text-violet-700',
    yellow: '!bg-amber-50 !text-amber-700'
  };

  return (
    <div className={`!rounded-lg !p-4 ${colorClasses[color]}`}>
      <div className="!flex !items-center !gap-3">
        <div className="!opacity-60">{icon}</div>
        <div>
          <p className="!text-sm !opacity-80">{label}</p>
          <p className="!text-xl !font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN PROJECT DETAIL COMPONENT
// ============================================

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<EsgProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [evidencePhotos, setEvidencePhotos] = useState<any[]>([]);
  const [evidenceDocs, setEvidenceDocs] = useState<any[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const projectData = await getProjectById(id!);
      
      if (projectData) {
        setProject(projectData);
        // Load evidence files after project data
        loadEvidence();
      } else {
        setError('Error al cargar el proyecto');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setError('Error al cargar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const loadEvidence = async () => {
    try {
      setEvidenceLoading(true);
      const result = await getProjectEvidence(id!);
      if (result?.data?.evidences) {
        const allFiles = result.data.evidences.flatMap((ev: any) => ev.files || []);
        const photos = allFiles
          .filter((f: any) => f.mimeType?.startsWith('image/'))
          .map((f: any) => ({ url: f.storageUrl, thumbnailUrl: f.thumbnailUrl, fileName: f.fileName }));
        const docs = allFiles
          .filter((f: any) => !f.mimeType?.startsWith('image/'))
          .map((f: any) => ({
            fileName: f.fileName,
            fileType: f.fileType || 'document',
            signedUrl: f.signedUrl,
            storageUrl: f.storageUrl,
            mimeType: f.mimeType,
          }));
        setEvidencePhotos(photos);
        setEvidenceDocs(docs);
      }
    } catch (err) {
      console.error('Error loading evidence:', err);
    } finally {
      setEvidenceLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!id || !project) return;
    
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      // DOUBLE-LOCK: No se requiere precio - Admin lo define durante la aprobación
      const updatedProject = await submitProjectForReview(id);
      if (updatedProject) {
        setProject(updatedProject);
        setSuccess('Proyecto enviado a revisión correctamente');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar el proyecto a revisión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setDeleting(true);
    try {
      const success = await deleteProject(id);
      if (success) {
        navigate('/partner/projects', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar el proyecto');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatNumber = (num: number | undefined | null): string => {
    if (num === null || num === undefined || isNaN(num)) {
      return '0';
    }
    return new Intl.NumberFormat('es-CL').format(num);
  };

  const formatCurrency = (num: number | undefined | null): string => {
    if (num === null || num === undefined || isNaN(num)) {
      return '$0';
    }
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              ))}
            </div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="!flex !items-center !justify-center !py-20">
        <div className="!text-center">
          <div className="!w-20 !h-20 !bg-slate-100 !rounded-full !flex !items-center !justify-center !mx-auto !mb-4">
            <svg className="!w-10 !h-10 !text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="!text-xl !font-semibold !text-slate-800 !mb-2">Proyecto no encontrado</h2>
          <p className="!text-slate-500 !mb-4">El proyecto que buscas no existe o fue eliminado</p>
          <Link
            to="/partner/projects"
            className="!text-emerald-600 hover:!text-emerald-700 !font-medium !no-underline"
          >
            ← Volver a mis proyectos
          </Link>
        </div>
      </div>
    );
  }

  const canEdit = ['draft', 'rejected'].includes(project.status);
  const canDelete = project.status === 'draft';
  const canSubmit = project.status === 'draft' || project.status === 'rejected';

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div className="!flex !flex-col sm:!flex-row !items-start sm:!items-center !justify-between !gap-4">
        <div className="!flex !items-center !gap-4">
          <Link
            to="/partner/projects"
            className="!p-2 !text-slate-400 hover:!text-slate-600 hover:!bg-slate-100 !rounded-lg !transition-colors !no-underline"
          >
            <svg className="!w-5 !h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <div className="!flex !items-center !gap-3 !mb-1">
              <span className="!text-sm !font-mono !text-slate-500">{project.code}</span>
              <span className={`!px-2.5 !py-1 !text-xs !font-medium !rounded-full ${PROJECT_STATUS_COLORS[project.status]}`}>
                {PROJECT_STATUS_LABELS[project.status]}
              </span>
            </div>
            <h1 className="!text-2xl !font-bold !text-slate-800">{project.name}</h1>
          </div>
        </div>

        <div className="!flex !items-center !gap-2">
          {canDelete && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="!p-2 !text-slate-400 hover:!text-red-600 dark:!text-red-400 hover:!bg-red-50 dark:!bg-red-900/30 !rounded-lg !transition-colors"
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
              className="!inline-flex !items-center !gap-2 !px-4 !py-2 !border !border-slate-300 !text-slate-700 !rounded-xl hover:!bg-slate-50 !transition-colors !no-underline"
            >
              <svg className="!w-4 !h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </Link>
          )}
          {canSubmit && (
            <button
              onClick={handleSubmitForReview}
              disabled={submitting}
              className="!inline-flex !items-center !gap-2 !px-5 !py-2.5 !bg-gradient-to-r !from-emerald-500 !to-teal-600 !text-white !rounded-xl hover:!from-emerald-600 hover:!to-teal-700 disabled:!opacity-50 !transition-all !font-semibold !shadow-lg !shadow-emerald-500/20"
            >
              {submitting ? (
                <>
                  <svg className="!w-4 !h-4 !animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="!opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="!opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <svg className="!w-4 !h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Enviar a revisión
                </>
              )}
            </button>
          )}
          {/* AI Evaluation link (replaces manual 'Certificar' button) */}
          {['active', 'approved', 'pending_review'].includes(project.status) && (
            <Link
              to={`/partner/projects/${project.id}/certification`}
              className="!inline-flex !items-center !gap-2 !px-4 !py-2 !rounded-xl !bg-indigo-50 dark:!bg-indigo-900/30 !border !border-indigo-200 dark:!border-indigo-700 !text-indigo-700 dark:!text-indigo-300 !text-sm !font-medium hover:!bg-indigo-100 dark:hover:!bg-indigo-900/50 !transition-colors !no-underline"
            >
              <Bot className="!w-4 !h-4" />
              Ver Evaluación IA
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="!space-y-6">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Rejection Notice */}
        {project.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium text-red-800">Proyecto Rechazado</p>
                <p className="text-sm text-red-700 mt-1">
                  Tu proyecto fue rechazado. Por favor revisa la información y vuelve a enviarlo para revisión.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {project.stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatItem
              label="Certificados Emitidos"
              value={formatNumber(project.stats.certificates_issued || 0)}
              color="green"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              }
            />
            <StatItem
              label="Órdenes de Compensación"
              value={formatNumber(project.stats.compensation_orders || 0)}
              color="blue"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatItem
              label="Capacidad Disponible"
              value={`${formatNumber(project.stats.capacity_remaining || 0)} unidades`}
              color="purple"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        )}

        {/* Project Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InfoCard title="Información General">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">Tipo de Proyecto</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-100">{PROJECT_TYPE_LABELS[project.type]}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">Ubicación</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-100">
                  {project.location_country}
                  {project.location_region && `, ${project.location_region}`}
                </dd>
              </div>
              {project.provider_organization && (
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Organización Proveedora</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-100">{project.provider_organization}</dd>
                </div>
              )}
              {project.certification && (
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Certificación</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-100">{project.certification}</dd>
                </div>
              )}
              {Array.isArray(project.co_benefits) && project.co_benefits.length > 0 && (
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Co-Beneficios</dt>
                  <dd className="flex flex-wrap gap-1.5 mt-1">
                    {project.co_benefits.map((cb, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cb}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">Descripción</dt>
                <dd className="text-slate-700 dark:text-slate-200">
                  {project.description || 'Sin descripción'}
                </dd>
              </div>
              {project.transparency_url && (
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">URL de Transparencia</dt>
                  <dd>
                    <a
                      href={project.transparency_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
                    >
                      {project.transparency_url}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </InfoCard>

          <InfoCard title="Datos Técnicos y Comerciales">
            <dl className="space-y-4">
              {(project.impact_unit_type || project.impact_unit_spec) && (
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Unidad de Impacto</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-100">
                    {project.impact_unit_type || project.impact_unit || 'unidad'}
                    {project.impact_unit_spec && ` · ${project.impact_unit_spec}`}
                  </dd>
                </div>
              )}
              {project.provider_cost_unit_clp !== undefined && (
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">
                    Costo por {project.impact_unit_type || 'Unidad'} (CLP)
                  </dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-100">
                    {formatCurrency(project.provider_cost_unit_clp)}
                  </dd>
                </div>
              )}
              {project.carbon_capture_per_unit !== undefined && (
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">
                    Captura CO₂ por {project.impact_unit_type || 'Unidad'}
                  </dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-100">
                    {formatNumber(project.carbon_capture_per_unit)} kg
                  </dd>
                </div>
              )}
              {project.impact_ratio_per_ton != null && (
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">
                    {project.impact_unit_type || 'Unidades'} por ton CO₂
                  </dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-100">
                    {formatNumber(project.impact_ratio_per_ton)}
                  </dd>
                </div>
              )}
              {project.capacity_total !== undefined && (
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Capacidad Total</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-100">
                    {formatNumber(project.capacity_total)} {project.impact_unit_type || 'unidades'}
                  </dd>
                </div>
              )}
              {project.capacity_sold !== undefined && (
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Capacidad Vendida</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-100">
                    {formatNumber(project.capacity_sold)} {project.impact_unit_type || 'unidades'}
                    {project.capacity_total && project.capacity_total > 0 && (
                      <span className="text-slate-500 dark:text-slate-400 ml-2">
                        ({((project.capacity_sold / project.capacity_total) * 100).toFixed(1)}%)
                      </span>
                    )}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">Fecha de Creación</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-100">
                  {new Date(project.created_at).toLocaleDateString('es-CL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">Última Actualización</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-100">
                  {new Date(project.updated_at).toLocaleDateString('es-CL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
            </dl>
          </InfoCard>
        </div>

        {/* Stock Mensual */}
        {((project.monthly_stock_approved ?? 0) > 0 || project.stock_period_start) && (
          <InfoCard title="Stock Mensual">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatItem
                label="Aprobado (este ciclo)"
                value={`${formatNumber(project.monthly_stock_approved || 0)} ${project.impact_unit_type || 'u'}`}
                color="blue"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <StatItem
                label="Disponible"
                value={`${formatNumber(project.monthly_stock_remaining || 0)} ${project.impact_unit_type || 'u'}`}
                color="green"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-3l-2 3h-6l-2-3H4" />
                  </svg>
                }
              />
              <StatItem
                label="Período"
                value={
                  project.stock_period_start
                    ? `${new Date(project.stock_period_start).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' })} → ${project.stock_period_end ? new Date(project.stock_period_end).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }) : '—'}`
                    : '—'
                }
                color="purple"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
            </div>
          </InfoCard>
        )}

        {/* ====== Mis Archivos Subidos ====== */}
        {!evidenceLoading && (evidencePhotos.length > 0 || evidenceDocs.length > 0) && (
          <InfoCard title="Mis Archivos Subidos">
            <div className="!space-y-6">
              {/* Photos */}
              {evidencePhotos.length > 0 && (
                <div>
                  <h4 className="!flex !items-center !gap-2 !text-sm !font-semibold !text-slate-700 dark:!text-slate-300 !mb-3">
                    <Camera className="!w-4 !h-4 !text-emerald-600" />
                    Fotos ({evidencePhotos.length})
                  </h4>
                  <div className="!bg-slate-50 dark:!bg-slate-900 !rounded-xl !p-2">
                    <PhotoCarousel photos={evidencePhotos} />
                  </div>
                </div>
              )}

              {/* Documents */}
              {evidenceDocs.length > 0 && (
                <div>
                  <h4 className="!flex !items-center !gap-2 !text-sm !font-semibold !text-slate-700 dark:!text-slate-300 !mb-3">
                    <FileText className="!w-4 !h-4 !text-blue-600" />
                    Documentos ({evidenceDocs.length})
                  </h4>
                  <DocumentViewer documents={evidenceDocs} />
                </div>
              )}
            </div>
          </InfoCard>
        )}

        {evidenceLoading && (
          <div className="!bg-white dark:!bg-slate-800 !rounded-xl !border !shadow-sm !p-6">
            <div className="!flex !items-center !gap-3 !text-slate-500">
              <div className="!w-5 !h-5 !border-2 !border-slate-300 !border-t-emerald-500 !rounded-full !animate-spin" />
              Cargando archivos...
            </div>
          </div>
        )}

        {/* Restock Button - only for active projects */}
        {project.status === 'active' && (
          <div className="!bg-gradient-to-r !from-emerald-50 !to-teal-50 dark:!from-emerald-900/20 dark:!to-teal-900/20 !rounded-xl !border !border-emerald-200 dark:!border-emerald-800 !p-6">
            <div className="!flex !flex-col sm:!flex-row !items-start sm:!items-center !justify-between !gap-4">
              <div>
                <h3 className="!text-lg !font-semibold !text-emerald-800 dark:!text-emerald-200">
                  Evidencia Mensual
                </h3>
                <p className="!text-sm !text-emerald-700/70 dark:!text-emerald-300/70 !mt-1">
                  Sube fotos y documentos de avance para solicitar reposición de stock
                </p>
              </div>
              <Link
                to={`/partner/projects/${project.id}/restock`}
                className="!inline-flex !items-center !gap-2 !px-5 !py-2.5 !bg-emerald-600 hover:!bg-emerald-700 !text-white !rounded-xl !font-semibold !transition-colors !shadow-lg !shadow-emerald-500/20 !no-underline"
              >
                <Upload className="!w-4 !h-4" />
                Subir Evidencia Mensual
              </Link>
            </div>
          </div>
        )}
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
    </div>
  );
};

export default ProjectDetail;
