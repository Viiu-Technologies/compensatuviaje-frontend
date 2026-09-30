import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle2, XCircle, FileText, ExternalLink, FileQuestion } from 'lucide-react';
import { toast } from 'sonner';
import adminAIApi from '../services/adminAIApi';
import { AdminKybEvaluationDetail, AdminPartnerContext } from '../../../types/admin-evaluations.types';
import AdminPendingBadge from '../components/shared/AdminPendingBadge';
import RejectModal from '../components/shared/RejectModal';
import { KYB_TIER_LABELS } from '../../../types/kyb.types';
import {
  EmptyState, PageHeader, Panel, Skeleton, StatusBadge, formatInt, partnerStatus, useAdminConfirm,
} from '../ui';

/**
 * Detalle de una solicitud KYB: lo que envió el partner, el análisis de la IA
 * y la decisión del admin. La IA solo recomienda; la decisión es humana.
 */

// Antes volvía a /admin/partners/evaluations, que redirige a Proyectos en revisión.
const LIST_PATH = '/admin/partners/kyb-evaluations';

const DIMENSIONS: Array<{ key: 'legal' | 'financial' | 'technical' | 'references'; label: string }> = [
  { key: 'legal', label: 'Documentación legal' },
  { key: 'financial', label: 'Solidez financiera' },
  { key: 'technical', label: 'Capacidad técnica' },
  { key: 'references', label: 'Referencias comerciales' },
];

const NOTES: Array<{ key: 'legal_notes' | 'financial_notes' | 'technical_notes' | 'references_notes'; label: string }> = [
  { key: 'legal_notes', label: 'Legal' },
  { key: 'financial_notes', label: 'Financiero' },
  { key: 'technical_notes', label: 'Técnico' },
  { key: 'references_notes', label: 'Referencias' },
];

const scoreTone = (n: number) => (n >= 80 ? 'success' : n >= 60 ? 'warning' : 'danger');

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const ScoreRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <li className="adm-funnel__row">
    <span className="adm-funnel__label">{label}</span>
    <span className="adm-funnel__track" aria-hidden="true">
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </span>
    <span className="adm-funnel__value">{formatInt(value)}<small>de 100</small></span>
  </li>
);

const AIKybDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { confirm, dialog } = useAdminConfirm();

  const [evaluation, setEvaluation] = useState<AdminKybEvaluationDetail | null>(null);
  const [context, setContext] = useState<AdminPartnerContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const evalRes = await adminAIApi.getKybEvaluationDetail(id!);
      setEvaluation(evalRes.data);

      if (evalRes.data?.partner?.id) {
        try {
          const contextRes = await adminAIApi.getPartnerContext(evalRes.data.partner.id);
          setContext(contextRes.data);
        } catch (ctxError) {
          console.warn('Could not load partner context, continuing without it', ctxError);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!evaluation) return;
    const ok = await confirm({
      title: '¿Aprobar la verificación KYB?',
      description: `${evaluation.organization_name} quedará verificada como Impact Partner y podrá publicar proyectos.`,
      confirmLabel: 'Aprobar verificación',
    });
    if (!ok) return;
    try {
      setActionLoading(true);
      setActionError(null);
      await adminAIApi.approveKybEvaluation(evaluation.id);
      toast.success('Verificación aprobada');
      await loadData(); // Reload to get updated status
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'No se pudo aprobar la verificación');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!evaluation) return;
    try {
      setActionLoading(true);
      setActionError(null);
      await adminAIApi.rejectKybEvaluation(evaluation.id, reason);
      setShowRejectModal(false);
      toast.success('Verificación rechazada');
      await loadData(); // Reload to get updated status
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'No se pudo rechazar la verificación');
    } finally {
      setActionLoading(false);
    }
  };

  const back = (
    <Link to={LIST_PATH} className="adm-back">
      <ArrowLeft aria-hidden="true" /> Volver a Solicitudes KYB
    </Link>
  );

  if (loading) {
    return (
      <div className="adm-page" aria-busy="true">
        {back}
        <Skeleton height={64} />
        <div className="adm-grid adm-grid--2-1">
          <Skeleton height={380} />
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
          <EmptyState icon={FileQuestion} title="No se pudo abrir la solicitud" text={error || 'La evaluación no existe o fue eliminada.'} />
        </section>
      </div>
    );
  }

  const isDecided = evaluation.admin_decision !== null;
  const approved = evaluation.admin_decision === 'approved';
  const scores = evaluation.scores;
  const insights = evaluation.ai_insights;
  const pst = partnerStatus(context?.status ?? evaluation.partner?.status);

  return (
    <div className="adm-page">
      {back}

      <PageHeader
        title={evaluation.organization_name}
        description={`Verificación KYB · recibida el ${fmtDate(evaluation.created_at)}`}
        actions={
          !isDecided ? (
            <>
              <button type="button" className="adm-btn" onClick={() => setShowRejectModal(true)} disabled={actionLoading}>
                Rechazar
              </button>
              <button type="button" className="adm-btn adm-btn--primary" onClick={handleApprove} disabled={actionLoading}>
                <Check aria-hidden="true" /> Aprobar verificación
              </button>
            </>
          ) : undefined
        }
      />

      <div className="adm-chips">
        <AdminPendingBadge aiStatus={evaluation.ai_status} adminDecision={evaluation.admin_decision} />
        {evaluation.partner_tier && <StatusBadge tone="info">Nivel {KYB_TIER_LABELS[evaluation.partner_tier]}</StatusBadge>}
      </div>

      {actionError && (
        <div role="alert" className="adm-alert adm-alert--danger">
          <XCircle aria-hidden="true" />
          <div>{actionError}</div>
        </div>
      )}

      {isDecided && (
        <div role="status" className={`adm-alert ${approved ? 'adm-alert--success' : 'adm-alert--danger'}`}>
          {approved ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}
          <div>
            <b>{approved ? 'Verificación aprobada' : 'Verificación rechazada'}</b>
            <div className="adm-alert__detail">
              Por {evaluation.admin_user?.name || 'un administrador'} el {fmtDate(evaluation.admin_decided_at)}
            </div>
            {evaluation.admin_reason && (
              <div className="adm-alert__detail"><b>Motivo:</b> {evaluation.admin_reason}</div>
            )}
          </div>
        </div>
      )}

      <div className="adm-grid adm-grid--2-1" style={{ alignItems: 'start' }}>
        {/* Análisis de la IA */}
        <div className="adm-stack-v">
          <Panel
            title="Análisis de la IA"
            description="Puntaje de 0 a 100 por dimensión. Es una recomendación: la decisión es tuya."
            aside={scores ? <StatusBadge tone={scoreTone(scores.overall)}>General {formatInt(scores.overall)} de 100</StatusBadge> : undefined}
          >
            {scores ? (
              <ul className="adm-funnel">
                {DIMENSIONS.filter((d) => typeof scores[d.key] === 'number').map((d) => (
                  <ScoreRow key={d.key} label={d.label} value={scores[d.key]} />
                ))}
              </ul>
            ) : (
              <p className="adm-cell-mute">
                {evaluation.ai_status === 'pending' ? 'La IA todavía está evaluando el documento.' : 'La IA no entregó puntajes.'}
              </p>
            )}
          </Panel>

          {insights && (
            <Panel title="Observaciones de la IA">
              <div className="adm-stack-v">
                {NOTES.filter((n) => insights[n.key]).map((n) => (
                  <div key={n.key}>
                    <h3 className="adm-subhead">{n.label}</h3>
                    <p className="adm-prewrap">{insights[n.key]}</p>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>

        {/* Lo que envió el partner */}
        <div className="adm-stack-v">
          <Panel title="Documento enviado">
            <div className="adm-stack-v">
              <span className="adm-inline-icon">
                <FileText aria-hidden="true" />
                <span style={{ wordBreak: 'break-all' }}>{evaluation.document_name || 'Sin nombre'}</span>
              </span>
              {evaluation.document_url ? (
                <a href={evaluation.document_url} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn--sm" style={{ width: 'fit-content' }}>
                  <ExternalLink aria-hidden="true" /> Abrir documento
                </a>
              ) : (
                <span className="adm-cell-mute">El documento no tiene un enlace disponible.</span>
              )}
            </div>
          </Panel>

          <Panel title="Organización">
            <dl className="adm-dl">
              <dt>Razón social</dt>
              <dd>{evaluation.organization_name}</dd>
              <dt>RUT</dt>
              <dd>{evaluation.rut_tax_id || <span className="adm-cell-mute">No informado</span>}</dd>
              <dt>Estado de la cuenta</dt>
              <dd><StatusBadge tone={pst.tone}>{pst.label}</StatusBadge></dd>
              {context && (
                <>
                  <dt>Correo de contacto</dt>
                  <dd style={{ wordBreak: 'break-all' }}>{context.contact_email}</dd>
                  <dt>Proyectos creados</dt>
                  <dd>{context.total_projects != null ? formatInt(context.total_projects) : '—'}</dd>
                  <dt>En la plataforma desde</dt>
                  <dd>{fmtDate(context.created_at)}</dd>
                </>
              )}
            </dl>
            {evaluation.partner?.id && (
              <p style={{ marginTop: 12 }}>
                <Link to={`/admin/partners/${evaluation.partner.id}`} className="adm-link">Ver ficha del partner</Link>
              </p>
            )}
          </Panel>
        </div>
      </div>

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Rechazar verificación KYB"
        itemName={evaluation.organization_name}
        loading={actionLoading}
      />
      {dialog}
    </div>
  );
};

export default AIKybDetailPage;
