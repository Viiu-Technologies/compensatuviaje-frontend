// ============================================
// PROJECT CERTIFICATION PAGE (Read-Only Status)
// Evaluación IA se envía automáticamente al crear el proyecto.
// Esta página solo muestra el estado actual.
// ============================================

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  History,
  Search,
  Tag,
  BarChart,
  Calendar,
  ClipboardList,
  Bot
} from 'lucide-react';

// Types
import type {
  CertStatusResponse,
  CertificationEvaluation,
  CertHistoryResponse,
  CertScoreDetails,
} from '../../../types/certification.types';
import {
  SCORE_LABELS,
  formatCertDate
} from '../../../types/certification.types';

// Services
import certificationApi from '../services/certificationApi';

// Hooks
import { usePolling } from '../hooks/usePolling';

// Shared Components
import ScoreGauge, { ScoreCard } from '../components/shared/ScoreGauge';
import {
  CertStatusBadge,
  CertLevelBadge,
  AdminPendingBanner,
  ProcessingState
} from '../components/shared/StatusBadges';

// ============================================
// TYPES
// ============================================

type PageState = 'none' | 'processing' | 'ai_completed' | 'certified' | 'rejected' | 'error' | 'loading';

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * ESG Scores Grid - Muestra los 3 scores ESG (B, D, E)
 */
interface EsgScoresGridProps {
  scores: CertScoreDetails;
  finalScore: number | null;
  confidenceScore: number | null;
}

const EsgScoresGrid: React.FC<EsgScoresGridProps> = ({ scores, finalScore, confidenceScore }) => {
  const scoreItems = [
    { key: 'scoreB' as const, ...SCORE_LABELS.scoreB, score: scores.scoreB },
    { key: 'scoreD' as const, ...SCORE_LABELS.scoreD, score: scores.scoreD },
    { key: 'scoreE' as const, ...SCORE_LABELS.scoreE, score: scores.scoreE },
  ];

  return (
    <div className="!space-y-6">
      {/* Summary Row */}
      <div className="!grid !grid-cols-2 md:!grid-cols-3 !gap-4">
        <div className="!bg-emerald-50 dark:!bg-emerald-900/30 !border !border-emerald-200 dark:!border-emerald-700 !rounded-xl !p-4 !text-center">
          <p className="!text-sm !text-emerald-600 dark:!text-emerald-400 !mb-1 !flex !items-center !justify-center !gap-1">
            <BarChart className="!w-4 !h-4" /> Score Final
          </p>
          <p className="!text-3xl !font-bold !text-emerald-700 dark:!text-emerald-300">
            {finalScore ?? 0}
            <span className="!text-lg !font-normal !text-emerald-500 dark:!text-emerald-400">/100</span>
          </p>
        </div>
        <div className="!bg-blue-50 dark:!bg-blue-900/30 !border !border-blue-200 dark:!border-blue-700 !rounded-xl !p-4 !text-center">
          <p className="!text-sm !text-blue-600 dark:!text-blue-400 !mb-1 !flex !items-center !justify-center !gap-1">
            <Search className="!w-4 !h-4" /> Confianza IA
          </p>
          <p className="!text-3xl !font-bold !text-blue-700 dark:!text-blue-300">
            {confidenceScore ?? 0}
            <span className="!text-lg !font-normal !text-blue-500 dark:!text-blue-400">%</span>
          </p>
        </div>
      </div>

      {/* Detailed Scores */}
      <div>
        <h4 className="!text-sm !font-semibold !text-slate-700 dark:!text-slate-300 !uppercase !tracking-wide !mb-4">
          Scores Detallados ESG
        </h4>
        <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-4">
          {scoreItems.map((item) => (
            <ScoreCard
              key={item.key}
              score={item.score}
              label={item.label}
              icon={item.icon}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Markdown Report Display
 */
interface ReportDisplayProps {
  markdown: string | null;
  isExpanded: boolean;
  onToggle: () => void;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ markdown, isExpanded, onToggle }) => {
  if (!markdown) return null;

  const renderBasicMarkdown = (md: string): string => {
    return md
      .replace(/^### (.*$)/gim, '<h3 class="!text-lg !font-semibold !text-slate-800 dark:!text-slate-200 !mt-4 !mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="!text-xl !font-bold !text-slate-800 dark:!text-slate-200 !mt-6 !mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="!text-2xl !font-bold !text-slate-900 dark:!text-slate-100 !mt-6 !mb-4">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="!font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br />');
  };

  return (
    <div className="!border !border-slate-200 dark:!border-slate-700 !rounded-xl !overflow-hidden">
      <button
        onClick={onToggle}
        className="!w-full !flex !items-center !justify-between !p-4 !bg-slate-50 dark:!bg-slate-800 !text-left hover:!bg-slate-100 dark:hover:!bg-slate-700 !transition-colors"
      >
        <div className="!flex !items-center !gap-2">
          <FileText className="!w-5 !h-5 !text-slate-500 dark:!text-slate-400" />
          <span className="!font-medium !text-slate-700 dark:!text-slate-200">Reporte de Evaluación IA</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="!w-5 !h-5 !text-slate-400" />
        ) : (
          <ChevronDown className="!w-5 !h-5 !text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="!p-6 !bg-white dark:!bg-slate-900 !border-t !border-slate-200 dark:!border-slate-700">
          <div
            className="!prose !prose-slate dark:!prose-invert !max-w-none"
            dangerouslySetInnerHTML={{ __html: renderBasicMarkdown(markdown) }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Compliance Badges
 */
interface ComplianceBadgesProps {
  compliance: Record<string, boolean | undefined> | null;
}

const ComplianceBadges: React.FC<ComplianceBadgesProps> = ({ compliance }) => {
  if (!compliance) return null;

  const standards = Object.entries(compliance).filter(([_, value]) => value);
  if (standards.length === 0) return null;

  const standardLabels: Record<string, string> = {
    iso14001: 'ISO 14001',
    ghg_protocol: 'GHG Protocol',
  };

  return (
    <div className="!mt-4">
      <p className="!text-sm !text-slate-600 dark:!text-slate-400 !mb-2">Estándares cumplidos:</p>
      <div className="!flex !flex-wrap !gap-2">
        {standards.map(([key]) => (
          <span
            key={key}
            className="!inline-flex !items-center !gap-1 !px-3 !py-1 !bg-green-100 dark:!bg-green-900/40 !text-green-700 dark:!text-green-300 !text-sm !rounded-full"
          >
            <CheckCircle className="!w-3 !h-3" />
            {standardLabels[key] || key}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * Estado: IA completó evaluación, esperando admin
 */
interface AiCompletedStateProps {
  evaluation: CertificationEvaluation;
}

const AiCompletedState: React.FC<AiCompletedStateProps> = ({ evaluation }) => {
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="!space-y-6">
      <AdminPendingBanner />

      {evaluation.level && (
        <div className="!flex !items-center !justify-center !gap-4 !p-6 !bg-gradient-to-r !from-amber-50 !to-yellow-50 dark:!from-amber-900/30 dark:!to-yellow-900/30 !rounded-xl !border !border-amber-200 dark:!border-amber-700">
          <div className="!text-center">
            <p className="!text-sm !text-amber-600 dark:!text-amber-400 !mb-2">Nivel Propuesto por IA</p>
            <CertLevelBadge level={evaluation.level} score={evaluation.final_score} size="lg" />
          </div>
        </div>
      )}

      {evaluation.project_type_detected && (
        <div className="!flex !items-center !gap-2 !p-3 !bg-slate-50 dark:!bg-slate-800 !rounded-lg">
          <span className="!flex !items-center !gap-1 !text-sm !text-slate-500 dark:!text-slate-400">
            <Tag className="!w-4 !h-4" /> Tipo detectado:
          </span>
          <span className="!font-medium !text-slate-700 dark:!text-slate-200">{evaluation.project_type_detected}</span>
        </div>
      )}

      {evaluation.details && (
        <EsgScoresGrid
          scores={evaluation.details}
          finalScore={evaluation.final_score}
          confidenceScore={evaluation.confidence_score}
        />
      )}

      <ComplianceBadges compliance={evaluation.compliance} />

      <ReportDisplay
        markdown={evaluation.report_markdown}
        isExpanded={showReport}
        onToggle={() => setShowReport(!showReport)}
      />

      <div className="!flex !items-center !gap-3 !p-4 !bg-slate-50 dark:!bg-slate-800 !rounded-lg !border !border-slate-200 dark:!border-slate-700">
        <Clock className="!w-5 !h-5 !text-slate-500 dark:!text-slate-400 !animate-pulse" />
        <p className="!text-slate-600 dark:!text-slate-300">
          Esperando revisión del equipo de administración...
        </p>
      </div>
    </div>
  );
};

/**
 * Estado: Proyecto Certificado
 */
interface CertifiedStateProps {
  evaluation: CertificationEvaluation;
  history: CertHistoryResponse | null;
}

const CertifiedState: React.FC<CertifiedStateProps> = ({ evaluation, history }) => {
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="!space-y-6">
      <div className="!bg-gradient-to-r !from-green-50 !to-emerald-50 dark:!from-green-900/30 dark:!to-emerald-900/30 !border !border-green-200 dark:!border-green-700 !rounded-xl !p-6">
        <div className="!flex !items-start !gap-4">
          <div className="!w-12 !h-12 !bg-green-100 dark:!bg-green-900/50 !rounded-full !flex !items-center !justify-center !flex-shrink-0">
            <Award className="!w-6 !h-6 !text-green-600 dark:!text-green-400" />
          </div>
          <div className="!flex-grow">
            <h3 className="!text-green-800 dark:!text-green-200 !font-semibold !text-lg !mb-2">
              Proyecto Certificado
            </h3>
            <div className="!flex !flex-wrap !items-center !gap-3 !mb-2">
              {evaluation.level && (
                <CertLevelBadge level={evaluation.level} score={evaluation.final_score} size="md" />
              )}
              <span className="!flex !items-center !gap-1 !text-green-700 dark:!text-green-300">
                <Search className="!w-4 !h-4" /> Confianza: {evaluation.confidence_score}%
              </span>
            </div>
            <p className="!flex !items-center !gap-1 !text-green-700 dark:!text-green-300 !text-sm">
              <Calendar className="!w-4 !h-4" /> Certificado: {formatCertDate(evaluation.admin_decided_at)}
            </p>
            <p className="!text-green-600 dark:!text-green-400 !text-sm !mt-2">
              Tu proyecto ha sido certificado exitosamente y está listo para recibir compensaciones.
            </p>
          </div>
        </div>
      </div>

      <div className="!grid !grid-cols-2 !gap-4">
        {evaluation.project_type_detected && (
          <div className="!p-3 !bg-slate-50 dark:!bg-slate-800 !rounded-lg">
            <span className="!flex !items-center !gap-1 !text-sm !text-slate-500 dark:!text-slate-400">
              <Tag className="!w-4 !h-4" /> Tipo detectado:
            </span>
            <p className="!font-medium !text-slate-700 dark:!text-slate-200">{evaluation.project_type_detected}</p>
          </div>
        )}
        <div className="!p-3 !bg-slate-50 dark:!bg-slate-800 !rounded-lg">
          <span className="!flex !items-center !gap-1 !text-sm !text-slate-500 dark:!text-slate-400">
            <ClipboardList className="!w-4 !h-4" /> Certificación:
          </span>
          <p className="!font-medium !text-slate-700 dark:!text-slate-200">{evaluation.certification_type}</p>
        </div>
      </div>

      {evaluation.details && (
        <EsgScoresGrid
          scores={evaluation.details}
          finalScore={evaluation.final_score}
          confidenceScore={evaluation.confidence_score}
        />
      )}

      <ComplianceBadges compliance={evaluation.compliance} />

      <ReportDisplay
        markdown={evaluation.report_markdown}
        isExpanded={showReport}
        onToggle={() => setShowReport(!showReport)}
      />

      {history && history.evaluations.length > 0 && (
        <EvaluationHistory evaluations={history.evaluations} />
      )}
    </div>
  );
};

/**
 * Estado: Certificación Rechazada (read-only, no retry button)
 */
interface RejectedStateProps {
  evaluation: CertificationEvaluation;
  history: CertHistoryResponse | null;
}

const RejectedState: React.FC<RejectedStateProps> = ({ evaluation, history }) => {
  return (
    <div className="!space-y-6">
      <div className="!bg-red-50 dark:!bg-red-900/30 !border !border-red-200 dark:!border-red-700 !rounded-xl !p-6">
        <div className="!flex !items-start !gap-4">
          <div className="!w-12 !h-12 !bg-red-100 dark:!bg-red-900/50 !rounded-full !flex !items-center !justify-center !flex-shrink-0">
            <XCircle className="!w-6 !h-6 !text-red-600 dark:!text-red-400" />
          </div>
          <div className="!flex-grow">
            <h3 className="!text-red-800 dark:!text-red-200 !font-semibold !text-lg !mb-2">
              Certificación Rechazada
            </h3>
            {evaluation.admin_reason && (
              <div className="!bg-white dark:!bg-slate-800 !border !border-red-200 dark:!border-red-700 !rounded-lg !p-3 !mb-3">
                <p className="!text-red-800 dark:!text-red-300 !text-sm">
                  <strong>Motivo:</strong> "{evaluation.admin_reason}"
                </p>
              </div>
            )}
            <p className="!text-red-600 dark:!text-red-400 !text-sm">
              Contacta al administrador para más información. La evaluación IA se envía automáticamente al crear o editar el proyecto.
            </p>
          </div>
        </div>
      </div>

      {history && history.evaluations.length > 0 && (
        <EvaluationHistory evaluations={history.evaluations} />
      )}
    </div>
  );
};

/**
 * Historial de evaluaciones
 */
interface EvaluationHistoryProps {
  evaluations: CertificationEvaluation[];
}

const EvaluationHistory: React.FC<EvaluationHistoryProps> = ({ evaluations }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="!border !border-slate-200 dark:!border-slate-700 !rounded-xl !overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="!w-full !flex !items-center !justify-between !p-4 !bg-slate-50 dark:!bg-slate-800 !text-left hover:!bg-slate-100 dark:hover:!bg-slate-700 !transition-colors"
      >
        <div className="!flex !items-center !gap-2">
          <History className="!w-5 !h-5 !text-slate-500 dark:!text-slate-400" />
          <span className="!font-medium !text-slate-700 dark:!text-slate-200">Historial de Evaluaciones</span>
          <span className="!text-sm !text-slate-500 dark:!text-slate-400">({evaluations.length})</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="!w-5 !h-5 !text-slate-400" />
        ) : (
          <ChevronDown className="!w-5 !h-5 !text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="!divide-y !divide-slate-200 dark:!divide-slate-700">
          {evaluations.map((eval_) => (
            <div key={eval_.id} className="!p-4 !flex !items-center !justify-between !bg-white dark:!bg-slate-900">
              <div className="!flex !items-center !gap-3">
                <span className="!flex !items-center !justify-center !w-8 !h-8 !rounded-full !bg-slate-100 dark:!bg-slate-800">
                  {eval_.admin_decision === 'approved' ? <CheckCircle className="!w-5 !h-5 !text-green-500" /> :
                   eval_.admin_decision === 'rejected' ? <XCircle className="!w-5 !h-5 !text-red-500" /> :
                   <RefreshCw className="!w-5 !h-5 !text-blue-500" />}
                </span>
                <div>
                  <p className="!text-sm !text-slate-600 dark:!text-slate-300">
                    {new Date(eval_.created_at).toLocaleDateString('es-CL')}
                  </p>
                  <p className="!text-xs !text-slate-500 dark:!text-slate-400">
                    {eval_.document_name} • {eval_.certification_type}
                  </p>
                </div>
              </div>
              <div className="!flex !items-center !gap-3">
                {eval_.level && eval_.admin_decision === 'approved' && (
                  <CertLevelBadge level={eval_.level} size="sm" />
                )}
                <span className="!text-sm !text-slate-600 dark:!text-slate-300">
                  Score: {eval_.final_score ?? '-'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================

const ProjectCertificationPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();

  // State
  const [pageState, setPageState] = useState<PageState>('loading');
  const [evaluation, setEvaluation] = useState<CertificationEvaluation | null>(null);
  const [history, setHistory] = useState<CertHistoryResponse | null>(null);
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState<string | null>(null);

  /**
   * Determine page state based on evaluation
   */
  const determinePageState = useCallback((statusResponse: CertStatusResponse): PageState => {
    if (!statusResponse.has_evaluation || !statusResponse.latest_evaluation) {
      return 'none';
    }

    const eval_ = statusResponse.latest_evaluation;

    if (eval_.admin_decision === 'approved') return 'certified';
    if (eval_.admin_decision === 'rejected') return 'rejected';

    if (eval_.status === 'pending') return 'processing';
    if (eval_.status === 'error') return 'error';
    if (eval_.status === 'ai_approved' || eval_.status === 'ai_rejected') {
      return 'ai_completed';
    }

    return 'none';
  }, []);

  /**
   * Handle status response update
   */
  const handleStatusUpdate = useCallback((status: CertStatusResponse) => {
    setEvaluation(status.latest_evaluation);
    setProjectName(status.project.name);
    const newState = determinePageState(status);
    setPageState(newState);

    if ((newState === 'certified' || newState === 'rejected') && projectId) {
      certificationApi.getHistory(projectId).then(setHistory).catch(console.error);
    }
  }, [determinePageState, projectId]);

  /**
   * Polling hook - polls while status is 'processing'
   */
  const { data: statusData, loading: pollingLoading } = usePolling<CertStatusResponse>(
    () => certificationApi.getStatus(projectId!),
    (status) => {
      const latestEval = status?.latest_evaluation;
      return latestEval?.status === 'pending' && !latestEval?.admin_decision;
    },
    30000,
    {
      enabled: !!projectId,
      onSuccess: handleStatusUpdate,
      onError: (err) => {
        console.error('Polling error:', err);
        setError('Error al obtener el estado de certificación');
      }
    }
  );

  // Fetch history on mount if already certified/rejected
  useEffect(() => {
    if ((pageState === 'certified' || pageState === 'rejected') && projectId) {
      certificationApi.getHistory(projectId).then(setHistory).catch(console.error);
    }
  }, [pageState, projectId]);

  // Redirect if no project ID
  if (!projectId) {
    return (
      <div className="!text-center !py-12">
        <p className="!text-red-600 dark:!text-red-400">ID de proyecto no especificado</p>
        <Link to="/partner/projects" className="!text-emerald-600 dark:!text-emerald-400 hover:!underline">
          Volver a proyectos
        </Link>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="!bg-slate-50 dark:!bg-slate-900 !min-h-screen !p-6 md:!p-8">
      <div className="!max-w-4xl !mx-auto">
        {/* Back Link */}
        <Link
          to={`/partner/projects/${projectId}`}
          className="!inline-flex !items-center !gap-2 !text-slate-600 dark:!text-slate-400 hover:!text-slate-800 dark:hover:!text-slate-200 !mb-6 !transition-colors"
        >
          <ArrowLeft className="!w-4 !h-4" />
          Volver a Proyecto
        </Link>

        {/* Header */}
        <div className="!mb-8">
          <div className="!flex !items-center !gap-3 !mb-2">
            <div className="!w-10 !h-10 !bg-emerald-100 dark:!bg-emerald-900/50 !rounded-xl !flex !items-center !justify-center">
              <Bot className="!w-5 !h-5 !text-emerald-600 dark:!text-emerald-400" />
            </div>
            <div>
              <h1 className="!text-2xl !font-bold !text-slate-800 dark:!text-slate-100">
                Evaluación IA del Proyecto
              </h1>
              {projectName && (
                <p className="!text-slate-500 dark:!text-slate-400">{projectName}</p>
              )}
            </div>
          </div>
          {evaluation && (
            <div className="!ml-13">
              <CertStatusBadge evaluation={evaluation} size="md" />
            </div>
          )}
        </div>

        {/* Info Banner: auto-evaluation notice */}
        <div className="!mb-6 !bg-indigo-50 dark:!bg-indigo-900/20 !border !border-indigo-200 dark:!border-indigo-700 !rounded-xl !p-4 !flex !items-start !gap-3">
          <Bot className="!w-5 !h-5 !text-indigo-600 dark:!text-indigo-400 !flex-shrink-0 !mt-0.5" />
          <p className="!text-indigo-700 dark:!text-indigo-300 !text-sm">
            La evaluación IA se envía automáticamente cuando subes un documento técnico al crear el proyecto. No es necesario subir documentos manualmente.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="!mb-6 !bg-red-50 dark:!bg-red-900/30 !border !border-red-200 dark:!border-red-700 !rounded-lg !p-4 !flex !items-start !gap-3">
            <AlertTriangle className="!w-5 !h-5 !text-red-500 dark:!text-red-400 !flex-shrink-0 !mt-0.5" />
            <div>
              <p className="!text-red-800 dark:!text-red-200 !font-medium">Error</p>
              <p className="!text-red-600 dark:!text-red-400 !text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="!ml-auto !text-red-400 hover:!text-red-600 dark:hover:!text-red-300"
            >
              x
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="!bg-white dark:!bg-slate-800 !rounded-2xl !shadow-sm !border !border-slate-200 dark:!border-slate-700 !p-6 md:!p-8">

          {/* Loading State */}
          {pageState === 'loading' && (
            <div className="!flex !flex-col !items-center !justify-center !py-12">
              <div className="!w-12 !h-12 !border-4 !border-emerald-200 dark:!border-emerald-700 !border-t-emerald-600 dark:!border-t-emerald-400 !rounded-full !animate-spin !mb-4" />
              <p className="!text-slate-600 dark:!text-slate-300">Cargando estado de evaluación...</p>
            </div>
          )}

          {/* State: None - No evaluation yet */}
          {pageState === 'none' && !pollingLoading && (
            <div className="!text-center !py-12">
              <div className="!w-16 !h-16 !bg-slate-100 dark:!bg-slate-700 !rounded-full !flex !items-center !justify-center !mx-auto !mb-4">
                <Bot className="!w-8 !h-8 !text-slate-400" />
              </div>
              <h3 className="!text-lg !font-semibold !text-slate-800 dark:!text-slate-100 !mb-2">
                Sin evaluación IA
              </h3>
              <p className="!text-slate-500 dark:!text-slate-400 !max-w-md !mx-auto">
                Este proyecto aún no tiene una evaluación IA. La evaluación se envía automáticamente al subir un documento técnico (PDD) durante la creación del proyecto.
              </p>
            </div>
          )}

          {/* State: Processing - AI is evaluating */}
          {pageState === 'processing' && (
            <ProcessingState
              title="Evaluación ESG en Proceso"
              message="Tu documento PDD está siendo evaluado por nuestra IA. Este proceso puede tomar entre 5 y 15 minutos."
              documentName={evaluation?.document_name}
              submittedAt={evaluation?.created_at}
            />
          )}

          {/* State: AI Completed - Waiting for admin */}
          {pageState === 'ai_completed' && evaluation && (
            <AiCompletedState evaluation={evaluation} />
          )}

          {/* State: Certified */}
          {pageState === 'certified' && evaluation && (
            <CertifiedState evaluation={evaluation} history={history} />
          )}

          {/* State: Rejected */}
          {pageState === 'rejected' && evaluation && (
            <RejectedState evaluation={evaluation} history={history} />
          )}

          {/* State: Error */}
          {pageState === 'error' && (
            <div className="!text-center !py-12">
              <div className="!w-16 !h-16 !bg-red-100 dark:!bg-red-900/40 !rounded-full !flex !items-center !justify-center !mx-auto !mb-4">
                <AlertTriangle className="!w-8 !h-8 !text-red-500 dark:!text-red-400" />
              </div>
              <h3 className="!text-lg !font-semibold !text-slate-800 dark:!text-slate-100 !mb-2">
                Error en la Evaluación
              </h3>
              <p className="!text-slate-600 dark:!text-slate-400 !mb-4">
                Ocurrió un error durante la evaluación del documento. Contacta al administrador o intenta editar el proyecto para volver a subir el documento técnico.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCertificationPage;
