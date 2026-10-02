// ============================================
// KYB VERIFICATION PAGE
// Página de Verificación Empresarial (Agent 1)
// ============================================

/**
 * CONCEPTO: Máquina de Estados Visual
 *
 * 1. NONE - Sin verificación: formulario de envío
 * 2. PROCESSING - IA procesando: estado de espera con polling
 * 3. AI_COMPLETED - IA terminó: puntajes, esperando al admin
 * 4. APPROVED - Admin aprobó: verificación final
 * 5. REJECTED - Admin rechazó: motivo y opción de reenviar
 *
 * Flujo: Envío → Polling → Resultados IA → Esperar Admin → Decisión Final
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Coins,
  FileText,
  History,
  Phone,
  RefreshCw,
  Send,
  Settings,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import type { KybEvaluation, KybHistoryResponse, KybInsights, KybScores, KybStatusResponse } from '../../../types/kyb.types';
import { KYB_TIER_LABELS } from '../../../types/kyb.types';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import kybApi from '../services/kybApi';
import { usePolling } from '../hooks/usePolling';
import { usePartnerContext } from '../context/PartnerContext';
import PdfUploader from '../components/shared/PdfUploader';
import {
  Badge,
  btn,
  Card,
  CardHeader,
  cx,
  ErrorState,
  fmtDate,
  inputCls,
  labelCls,
  PageHeader,
  ScoreTile,
  scoreTone,
  Skeleton,
  type Tone,
} from '../ui';

type PageState = 'none' | 'processing' | 'ai_completed' | 'approved' | 'rejected' | 'error' | 'loading';

interface FormData {
  organizationName: string;
  rutTaxId: string;
  file: File | null;
}

const STATE_BADGE: Partial<Record<PageState, { tone: Tone; label: string }>> = {
  processing: { tone: 'info', label: 'En evaluación' },
  ai_completed: { tone: 'warning', label: 'Esperando revisión final' },
  approved: { tone: 'success', label: 'Verificada' },
  rejected: { tone: 'danger', label: 'Rechazada' },
  error: { tone: 'danger', label: 'Error en la evaluación' },
  none: { tone: 'neutral', label: 'Sin verificar' },
};

const overallOf = (e: KybEvaluation) => e.overall_score ?? e.scores?.overall ?? 0;

// ============================================
// FORMULARIO DE ENVÍO
// ============================================

const UploadForm: React.FC<{ onSubmit: (data: FormData) => Promise<void>; isSubmitting: boolean; initialOrgName?: string; isRetry?: boolean }> = ({
  onSubmit,
  isSubmitting,
  initialOrgName = '',
  isRetry,
}) => {
  const [formData, setFormData] = useState<FormData>({ organizationName: initialOrgName, rutTaxId: '', file: null });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (initialOrgName) setFormData((p) => (p.organizationName ? p : { ...p, organizationName: initialOrgName }));
  }, [initialOrgName]);

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!formData.organizationName.trim()) e.organizationName = 'Escribe la razón social';
    if (!formData.rutTaxId.trim()) e.rutTaxId = 'Escribe el RUT de la empresa';
    else if (!/^[0-9]{7,8}-[0-9Kk]$/.test(formData.rutTaxId.trim())) e.rutTaxId = 'Formato no válido. Ej.: 76123456-7 (sin puntos)';
    if (!formData.file) e.file = 'Adjunta el dossier en PDF';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <Card className="p-6 lg:col-span-2">
        <CardHeader
          title={isRetry ? 'Enviar nueva documentación' : 'Envía el dossier de tu empresa'}
          subtitle="Un solo PDF con la documentación legal, financiera y técnica de la organización."
        />
        <form
          noValidate
          onSubmit={async (ev) => {
            ev.preventDefault();
            if (validate()) await onSubmit(formData);
          }}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="k-org" className={labelCls}>
                Razón social<span className="text-rose-600 ml-0.5" aria-hidden="true">*</span>
              </label>
              <input
                id="k-org"
                type="text"
                value={formData.organizationName}
                onChange={(e) => setFormData((p) => ({ ...p, organizationName: e.target.value }))}
                placeholder="Ej.: EcoForest Chile SpA"
                disabled={isSubmitting}
                aria-invalid={!!errors.organizationName || undefined}
                className={cx(inputCls, errors.organizationName && 'border-rose-400')}
              />
              {errors.organizationName && <p className="m-0 mt-1.5 text-xs text-rose-700">{errors.organizationName}</p>}
            </div>
            <div>
              <label htmlFor="k-rut" className={labelCls}>
                RUT de la empresa<span className="text-rose-600 ml-0.5" aria-hidden="true">*</span>
              </label>
              <input
                id="k-rut"
                type="text"
                value={formData.rutTaxId}
                onChange={(e) => setFormData((p) => ({ ...p, rutTaxId: e.target.value }))}
                placeholder="76123456-7"
                disabled={isSubmitting}
                aria-invalid={!!errors.rutTaxId || undefined}
                className={cx(inputCls, errors.rutTaxId && 'border-rose-400')}
              />
              {errors.rutTaxId ? (
                <p className="m-0 mt-1.5 text-xs text-rose-700">{errors.rutTaxId}</p>
              ) : (
                <p className="m-0 mt-1.5 text-xs text-gray-500">Sin puntos y con guion.</p>
              )}
            </div>
          </div>

          <div>
            <p className={cx(labelCls, 'm-0')}>
              Dossier empresarial (PDF)<span className="text-rose-600 ml-0.5" aria-hidden="true">*</span>
            </p>
            <PdfUploader
              onFileSelect={(file) => {
                setFormData((p) => ({ ...p, file }));
                setErrors((p) => ({ ...p, file: undefined }));
              }}
              disabled={isSubmitting}
              isUploading={isSubmitting}
              instruction="Arrastra el PDF aquí o haz clic para elegirlo"
            />
            {errors.file && <p className="m-0 mt-1.5 text-xs text-rose-700">{errors.file}</p>}
          </div>

          <div className="flex justify-end pt-1">
            <button type="submit" disabled={isSubmitting} className={btn.primary}>
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
              {isSubmitting ? 'Enviando…' : 'Enviar para evaluación'}
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="Qué evaluamos" />
        <ul className="m-0 p-0 list-none space-y-3 text-sm text-gray-700">
          {[
            [FileText, 'Documentación legal'],
            [Coins, 'Solidez financiera'],
            [Settings, 'Capacidad técnica'],
            [Phone, 'Referencias comerciales'],
          ].map(([Icon, text]) => {
            const I = Icon as React.ComponentType<{ className?: string }>;
            return (
              <li key={text as string} className="flex items-center gap-2.5">
                <I className="w-4 h-4 text-gray-400" aria-hidden="true" />
                {text as string}
              </li>
            );
          })}
        </ul>
        <p className="m-0 mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500">
          Primero lo revisa nuestra IA y luego una persona del equipo toma la decisión final. Suele tomar entre unas horas y un día.
        </p>
      </Card>
    </div>
  );
};

// ============================================
// PUNTAJES
// ============================================

const ScoresGrid: React.FC<{ scores: KybScores; insights?: KybInsights | null }> = ({ scores, insights }) => (
  <Card>
    <CardHeader title="Puntajes por dimensión" />
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      <ScoreTile label="Legal" icon={FileText} score={scores.legal} notes={insights?.legal_notes} />
      <ScoreTile label="Financiero" icon={Coins} score={scores.financial} notes={insights?.financial_notes} />
      <ScoreTile label="Técnico" icon={Settings} score={scores.technical} notes={insights?.technical_notes} />
      <ScoreTile label="Referencias" icon={Phone} score={scores.references} notes={insights?.references_notes} />
    </div>
  </Card>
);

/** Resumen: puntaje general, nivel y (si aplica) decisión de la IA. */
const Summary: React.FC<{ evaluation: KybEvaluation; showAi?: boolean }> = ({ evaluation, showAi }) => {
  const overall = overallOf(evaluation);
  const tone = scoreTone(overall);
  return (
    <div className={cx('grid gap-4', showAi ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2')}>
      <Card className="p-5">
        <p className="m-0 text-sm text-gray-500">Puntaje general</p>
        <p className={cx('m-0 mt-1.5 text-3xl font-bold tabular-nums leading-none', tone === 'good' ? 'text-brand-700' : tone === 'warning' ? 'text-amber-700' : 'text-rose-700')}>
          {overall}
          <span className="text-base font-medium text-gray-400"> / 100</span>
        </p>
      </Card>
      <Card className="p-5">
        <p className="m-0 text-sm text-gray-500">Nivel asignado</p>
        <p className="m-0 mt-1.5 text-3xl font-bold text-gray-900 leading-none">
          {evaluation.partner_tier ? KYB_TIER_LABELS[evaluation.partner_tier] : <span className="text-base font-medium text-gray-500">Por definir</span>}
        </p>
      </Card>
      {showAi && (
        <Card className="p-5">
          <p className="m-0 text-sm text-gray-500">Recomendación de la IA</p>
          <p className={cx('m-0 mt-2 flex items-center gap-1.5 text-lg font-semibold', evaluation.ai_status === 'ai_approved' ? 'text-brand-700' : 'text-rose-700')}>
            {evaluation.ai_status === 'ai_approved' ? <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> : <XCircle className="w-5 h-5" aria-hidden="true" />}
            {evaluation.ai_status === 'ai_approved' ? 'Aprobar' : 'Rechazar'}
          </p>
        </Card>
      )}
    </div>
  );
};

// ============================================
// HISTORIAL
// ============================================

const EvaluationHistory: React.FC<{ evaluations: KybHistoryResponse['evaluations'] }> = ({ evaluations }) => (
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
              <p className="m-0 text-xs text-gray-500 truncate">{ev.document_name}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {ev.admin_decision === 'approved' ? (
                <Badge tone="success">Aprobada</Badge>
              ) : ev.admin_decision === 'rejected' ? (
                <Badge tone="danger">Rechazada</Badge>
              ) : (
                <Badge tone="neutral">Sin decisión</Badge>
              )}
              <span className="text-sm text-gray-600 tabular-nums">{ev.overall_score}</span>
            </div>
          </li>
        ))}
      </ul>
    </details>
  </Card>
);

// ============================================
// AVISOS DE ESTADO
// ============================================

const Notice: React.FC<{ tone: 'success' | 'warning' | 'danger' | 'info'; icon: React.ComponentType<{ className?: string }>; title: string; children?: React.ReactNode; action?: React.ReactNode }> = ({
  tone,
  icon: Icon,
  title,
  children,
  action,
}) => {
  const styles = {
    success: ['border-brand-100 bg-brand-50', 'text-brand-700', 'text-brand-900', 'text-brand-800'],
    warning: ['border-amber-200 bg-amber-50', 'text-amber-700', 'text-amber-900', 'text-amber-800'],
    danger: ['border-rose-200 bg-rose-50', 'text-rose-700', 'text-rose-900', 'text-rose-800'],
    info: ['border-sky-100 bg-sky-50', 'text-sky-800', 'text-sky-900', 'text-sky-900'],
  }[tone];
  return (
    <div className={cx('flex items-start gap-3 rounded-2xl border p-5', styles[0])}>
      <Icon className={cx('w-5 h-5 flex-shrink-0 mt-0.5', styles[1])} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className={cx('m-0 text-base font-semibold', styles[2])}>{title}</p>
        {children && <div className={cx('mt-1 text-sm', styles[3])}>{children}</div>}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================

const KybVerificationPage: React.FC = () => {
  const { refetch: refetchPartnerContext } = usePartnerContext();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [evaluation, setEvaluation] = useState<KybEvaluation | null>(null);
  const [history, setHistory] = useState<KybHistoryResponse | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const determinePageState = useCallback((s: KybStatusResponse): PageState => {
    if (!s.has_evaluation || !s.latest_evaluation) return 'none';
    const e = s.latest_evaluation;
    if (e.admin_decision === 'approved') return 'approved';
    if (e.admin_decision === 'rejected') return 'rejected';
    if (e.ai_status === 'pending') return 'processing';
    if (e.ai_status === 'error') return 'error';
    if (e.ai_status === 'ai_approved' || e.ai_status === 'ai_rejected') return 'ai_completed';
    return 'none';
  }, []);

  const handleStatusUpdate = useCallback(
    (status: KybStatusResponse) => {
      setError(null);
      setEvaluation(status.latest_evaluation);
      setPartnerName(status.partner?.name ?? '');
      setPageState(determinePageState(status));
      // Avisar al PartnerLayout (doble candado de navegación) del cambio de
      // estado: cubre la subida inicial del dossier y la decisión del admin
      // detectada por polling, sin esperar al ciclo propio del PartnerContext.
      refetchPartnerContext();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [determinePageState],
  );

  // Consulta cada 30 s mientras la IA está procesando
  const { refetch } = usePolling<KybStatusResponse>(
    () => kybApi.getStatus(),
    (status) => status?.latest_evaluation?.ai_status === 'pending' && !status?.latest_evaluation?.admin_decision,
    30000,
    {
      onSuccess: handleStatusUpdate,
      onError: () => setError('No pudimos obtener el estado de la verificación.'),
    },
  );

  useEffect(() => {
    if (pageState === 'approved' || pageState === 'rejected') {
      kybApi.getHistory().then(setHistory).catch(() => setHistory(null));
    }
  }, [pageState]);

  const handleSubmit = async (formData: FormData) => {
    if (!formData.file) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', formData.file);
      fd.append('organizationName', formData.organizationName);
      fd.append('rutTaxId', formData.rutTaxId);
      await kybApi.upload(fd);
      setShowUploadForm(false);
      setPageState('processing');
      await refetch();
    } catch (err) {
      setError(getErrorMessage(err, 'No pudimos enviar el dossier. Vuelve a intentarlo en unos momentos.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const badge = STATE_BADGE[pageState];
  const showForm = pageState === 'none' || showUploadForm;
  const pastEvaluations = history?.evaluations ?? [];

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Verificación de empresa (KYB)"
        subtitle="Validamos tu organización antes de que puedas publicar proyectos."
        meta={badge ? <Badge tone={badge.tone}>{badge.label}</Badge> : undefined}
        actions={
          showUploadForm && pageState !== 'none' ? (
            <button type="button" className={btn.secondary} onClick={() => setShowUploadForm(false)}>
              Cancelar
            </button>
          ) : undefined
        }
      />

      {error && pageState !== 'loading' && (
        <div role="alert" className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {pageState === 'loading' ? (
        error ? (
          <ErrorState title="No pudimos cargar tu verificación" onRetry={() => refetch()} />
        ) : (
          <div className="space-y-6">
            <Skeleton className="h-28" />
            <Skeleton className="h-48" />
          </div>
        )
      ) : showForm ? (
        <UploadForm onSubmit={handleSubmit} isSubmitting={isSubmitting} initialOrgName={partnerName} isRetry={pageState !== 'none'} />
      ) : (
        <div className="space-y-6">
          {pageState === 'processing' && (
            <Notice tone="info" icon={Clock} title="Estamos evaluando tu dossier">
              <p className="m-0">
                Lo recibimos{evaluation?.created_at && <> el {fmtDate(evaluation.created_at, 'long')}</>}. La evaluación suele tomar entre unas horas y un día; esta
                página se actualiza sola.
              </p>
              {evaluation?.document_name && (
                <p className="m-0 mt-2 inline-flex items-center gap-1.5 text-xs">
                  <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                  {evaluation.document_name}
                </p>
              )}
            </Notice>
          )}

          {pageState === 'ai_completed' && evaluation && (
            <>
              <Notice tone="warning" icon={Clock} title="Falta la revisión del equipo">
                La IA terminó su evaluación. Una persona del equipo revisará los resultados y tomará la decisión final.
              </Notice>
              <Summary evaluation={evaluation} showAi />
              {evaluation.scores && <ScoresGrid scores={evaluation.scores} insights={evaluation.ai_insights} />}
            </>
          )}

          {pageState === 'approved' && evaluation && (
            <>
              <Notice tone="success" icon={ShieldCheck} title="Tu empresa está verificada">
                <p className="m-0">
                  Tu cuenta está activa y puedes publicar proyectos.
                  {evaluation.admin_decided_at && <> Verificada el {fmtDate(evaluation.admin_decided_at, 'long')}.</>}
                </p>
              </Notice>
              <Summary evaluation={evaluation} />
              {evaluation.scores && <ScoresGrid scores={evaluation.scores} insights={evaluation.ai_insights} />}
              {pastEvaluations.length > 0 && <EvaluationHistory evaluations={pastEvaluations} />}
            </>
          )}

          {pageState === 'rejected' && evaluation && (
            <>
              <Notice
                tone="danger"
                icon={XCircle}
                title="La verificación fue rechazada"
                action={
                  <button type="button" onClick={() => setShowUploadForm(true)} className={btn.primary}>
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    Enviar nueva documentación
                  </button>
                }
              >
                {evaluation.admin_reason && (
                  <p className="m-0 mb-2 rounded-lg bg-white/70 px-3 py-2">
                    <strong>Motivo:</strong> {evaluation.admin_reason}
                  </p>
                )}
                <p className="m-0">Corrige la documentación y vuelve a enviarla.</p>
              </Notice>
              {pastEvaluations.length > 0 && <EvaluationHistory evaluations={pastEvaluations} />}
            </>
          )}

          {pageState === 'error' && (
            <Notice
              tone="danger"
              icon={AlertTriangle}
              title="No pudimos evaluar tu dossier"
              action={
                <button type="button" onClick={() => setShowUploadForm(true)} className={btn.primary}>
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Enviar de nuevo
                </button>
              }
            >
              Hubo un problema durante la evaluación. Vuelve a enviar el documento; si se repite, escríbenos.
            </Notice>
          )}
        </div>
      )}
    </div>
  );
};

export default KybVerificationPage;
