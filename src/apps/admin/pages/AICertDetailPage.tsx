import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle2, XCircle, FileQuestion } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import adminAIApi from '../services/adminAIApi';
import { AdminCertEvaluationDetail, AdminProjectContext } from '../../../types/admin-evaluations.types';
import AdminPendingBadge from '../components/shared/AdminPendingBadge';
import RejectModal from '../components/shared/RejectModal';
import { CERT_LEVEL_LABELS } from '../../../types/certification.types';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import {
  EmptyState, PageHeader, Panel, Skeleton, StatusBadge, formatInt, projectTypeLabel, useAdminConfirm,
} from '../ui';

/**
 * Evaluación de certificación de un proyecto (Verita AI): nivel, puntaje e
 * informe de la IA, con la decisión del admin.
 */

// /admin/partners/evaluations redirige a Proyectos en revisión; se va directo.
const LIST_PATH = '/admin/proyectos-revision';

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const scoreTone = (n: number) => (n >= 80 ? 'success' : n >= 60 ? 'warning' : 'danger');

const AICertDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { confirm, dialog } = useAdminConfirm();
  const [evaluation, setEvaluation] = useState<AdminCertEvaluationDetail | null>(null);
  const [context, setContext] = useState<AdminProjectContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const evalRes = await adminAIApi.getCertEvaluationDetail(id!);
      setEvaluation(evalRes.data);

      if (evalRes.data?.project?.id) {
        try {
          const contextRes = await adminAIApi.getProjectContext(evalRes.data.project.id);
          setContext(contextRes.data);
        } catch (ctxError) {
          console.warn('Could not load project context, continuing without it', ctxError);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo cargar la evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!evaluation) return;
    const ok = await confirm({
      title: '¿Aprobar esta certificación?',
      description: 'El proyecto quedará certificado y disponible para compensaciones. Esta acción no se puede deshacer.',
      confirmLabel: 'Aprobar certificación',
    });
    if (!ok) return;
    try {
      setActionLoading(true);
      await adminAIApi.approveCertEvaluation(evaluation.id);
      toast.success('Certificación aprobada');
      await loadData();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'No se pudo aprobar la certificación'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!evaluation) return;
    try {
      setActionLoading(true);
      await adminAIApi.rejectCertEvaluation(evaluation.id, reason);
      setShowRejectModal(false);
      toast.success('Certificación rechazada');
      await loadData();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'No se pudo rechazar la certificación'));
    } finally {
      setActionLoading(false);
    }
  };

  const back = (
    <Link to={LIST_PATH} className="adm-back">
      <ArrowLeft aria-hidden="true" /> Volver a Proyectos en revisión
    </Link>
  );

  if (loading) {
    return (
      <div className="adm-page" aria-busy="true">
        {back}
        <Skeleton height={64} />
        <div className="adm-grid adm-grid--2-1">
          <Skeleton height={420} />
          <Skeleton height={300} />
        </div>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="adm-page">
        {back}
        <section className="adm-panel">
          <EmptyState icon={FileQuestion} title="No se pudo abrir la evaluación" text={error || 'La evaluación no existe o fue eliminada.'} />
        </section>
      </div>
    );
  }

  const isDecided = evaluation.admin_decision !== null;
  const approved = evaluation.admin_decision === 'approved';

  return (
    <div className="adm-page">
      {back}

      <PageHeader
        title={evaluation.project.name}
        description={`Certificación del proyecto · código ${evaluation.project.code}`}
        actions={
          !isDecided ? (
            <>
              <button type="button" className="adm-btn" onClick={() => setShowRejectModal(true)} disabled={actionLoading}>
                Rechazar
              </button>
              <button type="button" className="adm-btn adm-btn--primary" onClick={handleApprove} disabled={actionLoading}>
                <Check aria-hidden="true" /> Aprobar certificación
              </button>
            </>
          ) : undefined
        }
      />

      <div className="adm-chips">
        <AdminPendingBadge aiStatus={evaluation.ai_status} adminDecision={evaluation.admin_decision} />
        {evaluation.level && <StatusBadge tone="info">Nivel {CERT_LEVEL_LABELS[evaluation.level]}</StatusBadge>}
      </div>

      {isDecided && (
        <div role="status" className={`adm-alert ${approved ? 'adm-alert--success' : 'adm-alert--danger'}`}>
          {approved ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}
          <div>
            <b>{approved ? 'Certificación aprobada' : 'Certificación rechazada'}</b>
            <div className="adm-alert__detail">
              Por {evaluation.admin_user?.name || 'un administrador'} el {fmtDate(evaluation.admin_decided_at)}
            </div>
            {evaluation.admin_reason && <div className="adm-alert__detail"><b>Motivo:</b> {evaluation.admin_reason}</div>}
          </div>
        </div>
      )}

      <div className="adm-grid adm-grid--2-1" style={{ alignItems: 'start' }}>
        <Panel
          title="Informe de la IA"
          description="Es una recomendación: la decisión es tuya."
          aside={evaluation.final_score !== null
            ? <StatusBadge tone={scoreTone(evaluation.final_score)}>Puntaje {formatInt(evaluation.final_score)} de 100</StatusBadge>
            : undefined}
        >
          {evaluation.report_markdown ? (
            <div className="adm-markdown">
              <ReactMarkdown>{evaluation.report_markdown}</ReactMarkdown>
            </div>
          ) : (
            <p className="adm-cell-mute">
              {evaluation.ai_status === 'pending' ? 'La IA todavía está evaluando el proyecto.' : 'La IA no entregó informe.'}
            </p>
          )}
        </Panel>

        <div className="adm-stack-v">
          <Panel title="Proyecto">
            <dl className="adm-dl">
              <dt>Tipo</dt>
              <dd>{projectTypeLabel(evaluation.project.projectType)}</dd>
              {context && (
                <>
                  <dt>Ubicación</dt>
                  <dd>{[context.location_region, context.location_country].filter(Boolean).join(', ') || '—'}</dd>
                  <dt>Capacidad total</dt>
                  <dd>{context.capacity_total != null ? `${formatInt(context.capacity_total)} unidades` : '—'}</dd>
                </>
              )}
            </dl>
            <p style={{ marginTop: 12 }}>
              <Link to={`/admin/proyectos/${evaluation.project.id}`} className="adm-link">Ver ficha del proyecto</Link>
            </p>
          </Panel>

          <Panel title="Partner">
            <dl className="adm-dl">
              <dt>Nombre</dt>
              <dd>{evaluation.partner.name}</dd>
              <dt>Contacto</dt>
              <dd style={{ wordBreak: 'break-all' }}>{evaluation.partner.contact_email}</dd>
            </dl>
          </Panel>
        </div>
      </div>

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Rechazar certificación"
        itemName={evaluation.project.name}
        loading={actionLoading}
      />
      {dialog}
    </div>
  );
};

export default AICertDetailPage;
