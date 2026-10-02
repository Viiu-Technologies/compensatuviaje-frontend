// ============================================
// PROJECT DETAIL PAGE
// Detalle de un proyecto ESG específico
// ============================================

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Bot,
  Camera,
  ExternalLink,
  FileText,
  FolderKanban,
  Info,
  Leaf,
  Pencil,
  Send,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { EsgProject, PROJECT_TYPE_LABELS } from '../../../types/partner.types';
import { deleteProject, getProjectById, submitProjectForReview } from '../services/partnerApi';
import { getProjectEvidence } from '../services/evidenceApi';
import PhotoCarousel from '../../../shared/components/PhotoCarousel';
import DocumentViewer from '../../../shared/components/DocumentViewer';
import {
  Badge,
  btn,
  Card,
  CardHeader,
  cx,
  Dialog,
  EmptyState,
  Field,
  fmtCLP,
  fmtDate,
  fmtInt,
  fmtNum,
  PageHeader,
  Progress,
  ProjectStatusBadge,
  Skeleton,
  StatCard,
  unitOf,
} from '../ui';

const apiMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || fallback;

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState<EsgProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fileUploadWarning, setFileUploadWarning] = useState<string | null>(
    (location.state as { fileUploadWarning?: string } | null)?.fileUploadWarning || null,
  );
  const [evidencePhotos, setEvidencePhotos] = useState<any[]>([]);
  const [evidenceDocs, setEvidenceDocs] = useState<any[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);

  const loadEvidence = async () => {
    try {
      setEvidenceLoading(true);
      const result = await getProjectEvidence(id!);
      const allFiles = (result?.data?.evidences ?? []).flatMap((ev: any) => ev.files || []);
      setEvidencePhotos(
        allFiles
          .filter((f: any) => f.mimeType?.startsWith('image/'))
          .map((f: any) => ({ url: f.storageUrl, thumbnailUrl: f.thumbnailUrl, fileName: f.fileName })),
      );
      setEvidenceDocs(
        allFiles
          .filter((f: any) => !f.mimeType?.startsWith('image/'))
          .map((f: any) => ({
            fileName: f.fileName,
            fileType: f.fileType || 'document',
            signedUrl: f.signedUrl,
            storageUrl: f.storageUrl,
            mimeType: f.mimeType,
          })),
      );
    } catch {
      /* los archivos son complementarios: si fallan, la ficha se muestra igual */
    } finally {
      setEvidenceLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getProjectById(id);
        setProject(data);
        if (data) loadEvidence();
      } catch {
        setProject(null);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmitForReview = async () => {
    if (!id || !project) return;
    setSubmitting(true);
    try {
      // DOUBLE-LOCK: No se requiere precio - Admin lo define durante la aprobación
      const updated = await submitProjectForReview(id);
      if (updated) {
        setProject(updated);
        toast.success('Proyecto enviado a revisión');
      }
    } catch (err) {
      toast.error(apiMessage(err, 'No pudimos enviar el proyecto a revisión'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      if (await deleteProject(id)) {
        toast.success('Proyecto eliminado');
        navigate('/partner/projects', { replace: true });
        return;
      }
      throw new Error('no eliminado');
    } catch (err) {
      toast.error(apiMessage(err, 'No pudimos eliminar el proyecto'));
      setDeleting(false);
      setShowDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-2/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <Card>
        <EmptyState
          icon={FolderKanban}
          title="No encontramos este proyecto"
          text="Puede que haya sido eliminado o que el enlace no sea correcto."
          action={
            <Link to="/partner/projects" className={btn.secondary}>
              Volver a mis proyectos
            </Link>
          }
        />
      </Card>
    );
  }

  const unit = unitOf(project);
  const canEdit = ['draft', 'rejected'].includes(project.status);
  const canDelete = project.status === 'draft';
  const canSubmit = canEdit;
  const hasEvaluation = ['active', 'approved', 'pending_review'].includes(project.status);
  const total = project.capacity_total || 0;
  const sold = project.capacity_sold || 0;
  const monthlyApproved = project.monthly_stock_approved || 0;
  const monthlyRemaining = project.monthly_stock_remaining || 0;
  const location_ = [project.location_region, project.location_country].filter(Boolean).join(', ');

  return (
    <div>
      <PageHeader
        back={{ to: '/partner/projects', label: 'Mis proyectos' }}
        meta={
          <>
            <span className="text-xs font-medium text-gray-500 tabular-nums">{project.code}</span>
            <ProjectStatusBadge status={project.status} />
          </>
        }
        title={project.name}
        subtitle={[PROJECT_TYPE_LABELS[project.type] ?? project.type, location_].filter(Boolean).join(' · ')}
        actions={
          <>
            {canDelete && (
              <button type="button" onClick={() => setShowDelete(true)} className={btn.icon} aria-label="Eliminar proyecto" title="Eliminar">
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
            {canEdit && (
              <Link to={`/partner/projects/${project.id}/edit`} className={btn.secondary}>
                <Pencil className="w-4 h-4" aria-hidden="true" />
                Editar
              </Link>
            )}
            {hasEvaluation && (
              <Link to={`/partner/projects/${project.id}/certification`} className={btn.secondary}>
                <Bot className="w-4 h-4" aria-hidden="true" />
                Evaluación IA
              </Link>
            )}
            {canSubmit && (
              <button type="button" onClick={handleSubmitForReview} disabled={submitting} className={btn.primary}>
                <Send className="w-4 h-4" aria-hidden="true" />
                {submitting ? 'Enviando…' : 'Enviar a revisión'}
              </button>
            )}
          </>
        }
      />

      <div className="space-y-6">
        {fileUploadWarning && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0" aria-hidden="true" />
            <p className="m-0 flex-1">{fileUploadWarning}</p>
            <button
              type="button"
              onClick={() => setFileUploadWarning(null)}
              aria-label="Cerrar aviso"
              className="border-0 bg-transparent p-0 text-amber-700 hover:text-amber-900 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {project.status === 'rejected' && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <AlertTriangle className="w-5 h-5 text-rose-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="m-0 text-sm font-semibold text-rose-900">El proyecto fue rechazado</p>
              <p className="m-0 mt-0.5 text-sm text-rose-800">Revisa la información, corrígela y vuelve a enviarlo a revisión.</p>
            </div>
          </div>
        )}

        {project.status === 'pending_review' && (
          <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <Info className="w-5 h-5 text-sky-800 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="m-0 text-sm text-sky-900">
              Nuestro equipo está revisando el proyecto. Te avisaremos cuando esté aprobado; mientras tanto no se puede editar.
            </p>
          </div>
        )}

        {project.stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Certificados emitidos" value={fmtInt(project.stats.certificates_issued)} />
            <StatCard label="Órdenes de compensación" value={fmtInt(project.stats.compensation_orders)} />
            <StatCard label="Capacidad disponible" value={fmtInt(project.stats.capacity_remaining)} unit={unit} tone="good" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader title="Información del proyecto" icon={Info} />
              <dl className="m-0 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                <Field label="Tipo de proyecto">{PROJECT_TYPE_LABELS[project.type] ?? project.type}</Field>
                <Field label="Ubicación">{location_ || '—'}</Field>
                {project.provider_organization && <Field label="Organización proveedora">{project.provider_organization}</Field>}
                {project.certification && <Field label="Certificación">{project.certification}</Field>}
                {(project.impact_unit_type || project.impact_unit_spec) && (
                  <Field label="Unidad de impacto">
                    {unit}
                    {project.impact_unit_spec && <span className="text-gray-500"> · {project.impact_unit_spec}</span>}
                  </Field>
                )}
                <Field label="Creado">{fmtDate(project.created_at, 'long')}</Field>
                <Field label="Última actualización">{fmtDate(project.updated_at, 'long')}</Field>
                {Array.isArray(project.co_benefits) && project.co_benefits.length > 0 && (
                  <Field label="Co-beneficios" className="sm:col-span-2">
                    <span className="flex flex-wrap gap-1.5">
                      {project.co_benefits.map((cb, i) => (
                        <Badge key={i} tone="success">
                          {cb}
                        </Badge>
                      ))}
                    </span>
                  </Field>
                )}
                <Field label="Descripción" className="sm:col-span-2">
                  <span className="leading-relaxed text-gray-700">{project.description || 'Sin descripción'}</span>
                </Field>
                {project.transparency_url && (
                  <Field label="Página de transparencia" className="sm:col-span-2">
                    <a
                      href={project.transparency_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-brand-700 hover:text-brand-800 break-all"
                    >
                      {project.transparency_url}
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                    </a>
                  </Field>
                )}
              </dl>
            </Card>

            <Card>
              <CardHeader title="Archivos subidos" subtitle="Fotos y documentos que enviaste como evidencia" icon={FileText} />
              {evidenceLoading ? (
                <Skeleton className="h-40" />
              ) : evidencePhotos.length === 0 && evidenceDocs.length === 0 ? (
                <p className="m-0 text-sm text-gray-500">Todavía no hay archivos en este proyecto.</p>
              ) : (
                <div className="space-y-6">
                  {evidencePhotos.length > 0 && (
                    <div>
                      <h3 className="m-0 mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Camera className="w-4 h-4 text-gray-400" aria-hidden="true" />
                        Fotos ({evidencePhotos.length})
                      </h3>
                      <div className="rounded-xl bg-gray-50 p-2">
                        <PhotoCarousel photos={evidencePhotos} />
                      </div>
                    </div>
                  )}
                  {evidenceDocs.length > 0 && (
                    <div>
                      <h3 className="m-0 mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FileText className="w-4 h-4 text-gray-400" aria-hidden="true" />
                        Documentos ({evidenceDocs.length})
                      </h3>
                      <DocumentViewer documents={evidenceDocs} />
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Capacidad" icon={Leaf} />
              <dl className="m-0 space-y-5">
                {total > 0 && (
                  <div>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <dt className="text-gray-500">Vendida</dt>
                      <dd className="m-0 font-semibold text-gray-900 tabular-nums">
                        {fmtInt(sold)} de {fmtInt(total)}
                      </dd>
                    </div>
                    <Progress value={(sold / total) * 100} label="Capacidad vendida" className="mt-2" />
                    <p className="m-0 mt-1 text-xs text-gray-500">
                      {fmtNum((sold / total) * 100, 1)} % de {fmtInt(total)} {unit}
                    </p>
                  </div>
                )}
                {monthlyApproved > 0 && (
                  <div>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <dt className="text-gray-500">Stock del mes</dt>
                      <dd className="m-0 font-semibold text-gray-900 tabular-nums">
                        {fmtInt(monthlyRemaining)} de {fmtInt(monthlyApproved)}
                      </dd>
                    </div>
                    <Progress value={(monthlyRemaining / monthlyApproved) * 100} label="Stock disponible del mes" className="mt-2" />
                    <p className="m-0 mt-1 text-xs text-gray-500">
                      {unit} disponibles
                      {project.stock_period_start && (
                        <> · {fmtDate(project.stock_period_start)} al {fmtDate(project.stock_period_end)}</>
                      )}
                    </p>
                  </div>
                )}
                {total === 0 && monthlyApproved === 0 && (
                  <p className="m-0 text-sm text-gray-500">La capacidad se define cuando el proyecto es aprobado.</p>
                )}
              </dl>
              {project.status === 'active' && (
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <p className="m-0 text-sm text-gray-600">
                    Sube la evidencia del mes para liberar el pago retenido y solicitar nuevo stock.
                  </p>
                  <Link to={`/partner/projects/${project.id}/restock`} className={cx(btn.primary, 'mt-3 w-full')}>
                    <Upload className="w-4 h-4" aria-hidden="true" />
                    Subir evidencia mensual
                  </Link>
                </div>
              )}
            </Card>

            <Card>
              <CardHeader title="Datos comerciales" />
              <dl className="m-0 space-y-4">
                {project.provider_cost_unit_clp !== undefined && (
                  <Field label={`Costo por unidad`}>{fmtCLP(project.provider_cost_unit_clp)}</Field>
                )}
                {project.carbon_capture_per_unit !== undefined && (
                  <Field label="Captura de CO₂ por unidad">{fmtNum(project.carbon_capture_per_unit, 2)} kg</Field>
                )}
                {project.impact_ratio_per_ton != null && (
                  <Field label="Unidades por tonelada de CO₂">{fmtNum(project.impact_ratio_per_ton, 2)}</Field>
                )}
                {(project.base_price_clp_per_ton ?? 0) > 0 && (
                  <Field label="Precio por tonelada">{fmtCLP(project.base_price_clp_per_ton)}</Field>
                )}
              </dl>
            </Card>
          </div>
        </div>
      </div>

      <Dialog
        open={showDelete}
        title="¿Eliminar este proyecto?"
        onClose={() => setShowDelete(false)}
        busy={deleting}
        footer={
          <>
            <button type="button" className={btn.secondary} onClick={() => setShowDelete(false)} disabled={deleting}>
              Cancelar
            </button>
            <button type="button" className={btn.danger} onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </button>
          </>
        }
      >
        <p className="m-0">
          Se eliminará <strong>{project.name}</strong>. Esta acción no se puede deshacer.
        </p>
      </Dialog>
    </div>
  );
};

export default ProjectDetail;
