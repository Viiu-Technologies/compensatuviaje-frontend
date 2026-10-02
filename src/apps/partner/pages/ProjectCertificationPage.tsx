// ============================================
// PROJECT CERTIFICATION PAGE (solo lectura)
// La evaluación IA se envía automáticamente al crear el proyecto;
// esta página muestra su estado.
// ============================================

import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, Award, Bot, CheckCircle2, Clock, FileText, Globe, History, Leaf, Users, XCircle } from 'lucide-react';
import type { CertHistoryResponse, CertificationEvaluation, CertScoreDetails, CertStatusResponse } from '../../../types/certification.types';
import { CERT_LEVEL_LABELS, SCORE_LABELS } from '../../../types/certification.types';
import certificationApi from '../services/certificationApi';
import { usePolling } from '../hooks/usePolling';
import { Badge, btn, Card, CardHeader, cx, EmptyState, ErrorState, Field, fmtDate, PageHeader, ScoreTile, scoreTone, Skeleton, type Tone } from '../ui';

type PageState = 'none' | 'processing' | 'ai_completed' | 'certified' | 'rejected' | 'error' | 'loading';

const STATE_BADGE: Partial<Record<PageState, { tone: Tone; label: string }>> = {
  none: { tone: 'neutral', label: 'Sin evaluación' },
  processing: { tone: 'info', label: 'En evaluación' },
  ai_completed: { tone: 'warning', label: 'Esperando revisión final' },
  certified: { tone: 'success', label: 'Certificado' },
  rejected: { tone: 'danger', label: 'Rechazado' },
  error: { tone: 'danger', label: 'Error en la evaluación' },
};

const STANDARD_LABELS: Record<string, string> = { iso14001: 'ISO 14001', ghg_protocol: 'GHG Protocol' };

// ============================================
// REPORTE
// ============================================

/**
 * Markdown mínimo (títulos, negrita, cursiva). Se escapa el HTML antes de
 * convertir: el reporte viene de la IA y antes se insertaba tal cual.
 */
const renderBasicMarkdown = (md: string): string =>
  md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*)$/gim, '<h4 class="text-sm font-semibold text-gray-900 mt-4 mb-1">$1</h4>')
    .replace(/^## (.*)$/gim, '<h3 class="text-base font-semibold text-gray-900 mt-5 mb-1.5">$1</h3>')
    .replace(/^# (.*)$/gim, '<h2 class="text-lg font-bold text-gray-900 mt-5 mb-2">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');

const Report: React.FC<{ markdown: string | null }> = ({ markdown }) =>
  markdown ? (
    <Card className="p-0">
      <details className="group">
        <summary className="flex items-center justify-between gap-3 px-6 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <FileText className="w-4 h-4 text-gray-400" aria-hidden="true" />
            Reporte completo de la evaluación
          </span>
          <span className="text-xs font-medium text-brand-700 group-open:hidden">Ver</span>
          <span className="text-xs font-medium text-brand-700 hidden group-open:inline">Ocultar</span>
        </summary>
        <div
          className="px-6 pb-6 pt-2 border-t border-gray-100 text-sm leading-relaxed text-gray-700"
          dangerouslySetInnerHTML={{ __html: renderBasicMarkdown(markdown) }}
        />
      </details>
    </Card>
  ) : null;

// ============================================
// RESULTADOS
// ============================================

const Results: React.FC<{ evaluation: CertificationEvaluation; showAi?: boolean }> = ({ evaluation, showAi }) => {
  const final = evaluation.final_score ?? 0;
  const tone = scoreTone(final);
  const scores = evaluation.details as CertScoreDetails | null;
  const standards = Object.entries(evaluation.compliance ?? {}).filter(([, v]) => v);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="m-0 text-sm text-gray-500">Puntaje final</p>
          <p className={cx('m-0 mt-1.5 text-3xl font-bold tabular-nums leading-none', tone === 'good' ? 'text-brand-700' : tone === 'warning' ? 'text-amber-700' : 'text-rose-700')}>
            {final}
            <span className="text-base font-medium text-gray-400"> / 100</span>
          </p>
        </Card>
        <Card className="p-5">
          <p className="m-0 text-sm text-gray-500">{showAi ? 'Nivel propuesto' : 'Nivel'}</p>
          <p className="m-0 mt-1.5 text-2xl font-bold text-gray-900 leading-tight">
            {evaluation.level ? CERT_LEVEL_LABELS[evaluation.level] : <span className="text-base font-medium text-gray-500">Sin nivel</span>}
          </p>
        </Card>
        <Card className="p-5">
          <p className="m-0 text-sm text-gray-500">Confianza de la IA</p>
          <p className="m-0 mt-1.5 text-3xl font-bold text-gray-900 tabular-nums leading-none">
            {evaluation.confidence_score ?? 0}
            <span className="text-base font-medium text-gray-400"> %</span>
          </p>
        </Card>
      </div>

      {scores && (
        <Card>
          <CardHeader title="Puntajes ESG" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ScoreTile label={SCORE_LABELS.scoreB.label} icon={Leaf} score={scores.scoreB} notes={SCORE_LABELS.scoreB.description} />
            <ScoreTile label={SCORE_LABELS.scoreD.label} icon={Users} score={scores.scoreD} notes={SCORE_LABELS.scoreD.description} />
            <ScoreTile label={SCORE_LABELS.scoreE.label} icon={Globe} score={scores.scoreE} notes={SCORE_LABELS.scoreE.description} />
          </div>
        </Card>
      )}

      {(evaluation.project_type_detected || evaluation.certification_type || standards.length > 0) && (
        <Card>
          <dl className="m-0 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {evaluation.project_type_detected && <Field label="Tipo de proyecto detectado">{evaluation.project_type_detected}</Field>}
            {evaluation.certification_type && <Field label="Tipo de documento">{evaluation.certification_type}</Field>}
            {standards.length > 0 && (
              <Field label="Estándares que cumple" className="sm:col-span-2">
                <span className="flex flex-wrap gap-1.5">
                  {standards.map(([k]) => (
                    <Badge key={k} tone="success" icon={CheckCircle2}>
                      {STANDARD_LABELS[k] || k}
                    </Badge>
                  ))}
                </span>
              </Field>
            )}
          </dl>
        </Card>
      )}

      <Report markdown={evaluation.report_markdown} />
    </>
  );
};

const EvaluationHistory: React.FC<{ evaluations: CertificationEvaluation[] }> = ({ evaluations }) => (
  <Card className="p-0">
    <details className="group">
      <summary className="flex items-center justify-between gap-3 px-6 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <History className="w-4 h-4 text-gray-400" aria-hidden="true" />
          Historial de evaluaciones
          <span className="font-normal text-gray-500">({evaluations.length})</span>
        </span>
        <span className="text-xs font-medium text-brand-700 group-open:hidden">Ver</span>
        <span className="text-xs font-medium text-brand-700 hidden group-open:inline">Ocultar</span>
      </summary>
      <ul className="m-0 p-0 list-none border-t border-gray-100">
        {evaluations.map((ev) => (
          <li key={ev.id} className="flex items-center justify-between gap-4 px-6 py-3 border-b border-gray-100 last:border-0">
            <div className="min-w-0">
              <p className="m-0 text-sm text-gray-800">{fmtDate(ev.created_at)}</p>
              <p className="m-0 text-xs text-gray-500 truncate">
                {ev.document_name} · {ev.certification_type}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {ev.admin_decision === 'approved' ? (
                <Badge tone="success">{ev.level ? CERT_LEVEL_LABELS[ev.level] : 'Aprobada'}</Badge>
              ) : ev.admin_decision === 'rejected' ? (
                <Badge tone="danger">Rechazada</Badge>
              ) : (
                <Badge tone="neutral">Sin decisión</Badge>
              )}
              <span className="text-sm text-gray-600 tabular-nums">{ev.final_score ?? '—'}</span>
            </div>
          </li>
        ))}
      </ul>
    </details>
  </Card>
);

const Notice: React.FC<{ tone: 'success' | 'warning' | 'danger' | 'info'; icon: React.ComponentType<{ className?: string }>; title: string; children?: React.ReactNode }> = ({
  tone,
  icon: Icon,
  title,
  children,
}) => {
  const s = {
    success: ['border-brand-100 bg-brand-50', 'text-brand-700', 'text-brand-900', 'text-brand-800'],
    warning: ['border-amber-200 bg-amber-50', 'text-amber-700', 'text-amber-900', 'text-amber-800'],
    danger: ['border-rose-200 bg-rose-50', 'text-rose-700', 'text-rose-900', 'text-rose-800'],
    info: ['border-sky-100 bg-sky-50', 'text-sky-800', 'text-sky-900', 'text-sky-900'],
  }[tone];
  return (
    <div className={cx('flex items-start gap-3 rounded-2xl border p-5', s[0])}>
      <Icon className={cx('w-5 h-5 flex-shrink-0 mt-0.5', s[1])} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className={cx('m-0 text-base font-semibold', s[2])}>{title}</p>
        {children && <div className={cx('mt-1 text-sm', s[3])}>{children}</div>}
      </div>
    </div>
  );
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================

const ProjectCertificationPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [evaluation, setEvaluation] = useState<CertificationEvaluation | null>(null);
  const [history, setHistory] = useState<CertHistoryResponse | null>(null);
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const determinePageState = useCallback((s: CertStatusResponse): PageState => {
    if (!s.has_evaluation || !s.latest_evaluation) return 'none';
    const e = s.latest_evaluation;
    if (e.admin_decision === 'approved') return 'certified';
    if (e.admin_decision === 'rejected') return 'rejected';
    if (e.status === 'pending') return 'processing';
    if (e.status === 'error') return 'error';
    if (e.status === 'ai_approved' || e.status === 'ai_rejected') return 'ai_completed';
    return 'none';
  }, []);

  const handleStatusUpdate = useCallback(
    (status: CertStatusResponse) => {
      setError(null);
      setEvaluation(status.latest_evaluation);
      setProjectName(status.project?.name ?? '');
      setPageState(determinePageState(status));
    },
    [determinePageState],
  );

  const { refetch } = usePolling<CertStatusResponse>(
    () => certificationApi.getStatus(projectId!),
    (status) => status?.latest_evaluation?.status === 'pending' && !status?.latest_evaluation?.admin_decision,
    30000,
    {
      enabled: !!projectId,
      onSuccess: handleStatusUpdate,
      onError: () => setError('No pudimos obtener el estado de la evaluación.'),
    },
  );

  useEffect(() => {
    if ((pageState === 'certified' || pageState === 'rejected') && projectId) {
      certificationApi.getHistory(projectId).then(setHistory).catch(() => setHistory(null));
    }
  }, [pageState, projectId]);

  const back = { to: projectId ? `/partner/projects/${projectId}` : '/partner/projects', label: 'Volver al proyecto' };

  if (!projectId) {
    return (
      <Card>
        <EmptyState
          icon={Bot}
          title="Falta el proyecto"
          action={
            <Link to="/partner/projects" className={btn.secondary}>
              Ir a mis proyectos
            </Link>
          }
        />
      </Card>
    );
  }

  const badge = STATE_BADGE[pageState];
  const pastEvaluations = history?.evaluations ?? [];

  return (
    <div className="max-w-5xl">
      <PageHeader
        back={back}
        title="Evaluación IA del proyecto"
        subtitle={projectName || 'Resultado de la evaluación automática del documento técnico.'}
        meta={badge ? <Badge tone={badge.tone}>{badge.label}</Badge> : undefined}
      />

      {pageState === 'loading' ? (
        error ? (
          // Antes, si la consulta fallaba, quedaban el aviso y el spinner girando para siempre.
          <ErrorState title="No pudimos cargar la evaluación" onRetry={() => refetch()} />
        ) : (
          <div className="space-y-6">
            <Skeleton className="h-28" />
            <Skeleton className="h-48" />
          </div>
        )
      ) : (
        <div className="space-y-6">
          {error && (
            <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          {pageState === 'none' && (
            <Card>
              <EmptyState
                icon={Bot}
                title="Este proyecto aún no tiene evaluación"
                text="La evaluación se envía sola cuando subes el documento técnico (PDD) al crear el proyecto."
              />
            </Card>
          )}

          {pageState === 'processing' && (
            <Notice tone="info" icon={Clock} title="Estamos evaluando el documento">
              <p className="m-0">Suele tomar entre 5 y 15 minutos. Esta página se actualiza sola.</p>
              {evaluation?.document_name && (
                <p className="m-0 mt-2 inline-flex items-center gap-1.5 text-xs">
                  <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                  {evaluation.document_name}
                  {evaluation.created_at && <> · enviado el {fmtDate(evaluation.created_at)}</>}
                </p>
              )}
            </Notice>
          )}

          {pageState === 'ai_completed' && evaluation && (
            <>
              <Notice tone="warning" icon={Clock} title="Falta la revisión del equipo">
                La IA terminó su evaluación. Una persona del equipo revisará los resultados y tomará la decisión final.
              </Notice>
              <Results evaluation={evaluation} showAi />
            </>
          )}

          {pageState === 'certified' && evaluation && (
            <>
              <Notice tone="success" icon={Award} title="Proyecto certificado">
                Está listo para recibir compensaciones.
                {evaluation.admin_decided_at && <> Certificado el {fmtDate(evaluation.admin_decided_at, 'long')}.</>}
              </Notice>
              <Results evaluation={evaluation} />
              {pastEvaluations.length > 0 && <EvaluationHistory evaluations={pastEvaluations} />}
            </>
          )}

          {pageState === 'rejected' && evaluation && (
            <>
              <Notice tone="danger" icon={XCircle} title="La certificación fue rechazada">
                {evaluation.admin_reason && (
                  <p className="m-0 mb-2 rounded-lg bg-white/70 px-3 py-2">
                    <strong>Motivo:</strong> {evaluation.admin_reason}
                  </p>
                )}
                <p className="m-0">Escríbenos si necesitas más información. Al editar el proyecto y subir un nuevo documento se evalúa otra vez.</p>
              </Notice>
              {pastEvaluations.length > 0 && <EvaluationHistory evaluations={pastEvaluations} />}
            </>
          )}

          {pageState === 'error' && (
            <Notice tone="danger" icon={AlertTriangle} title="No pudimos evaluar el documento">
              Edita el proyecto para volver a subir el documento técnico o escríbenos si el problema se repite.
            </Notice>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectCertificationPage;
