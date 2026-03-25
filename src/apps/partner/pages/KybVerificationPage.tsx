// ============================================
// KYB VERIFICATION PAGE
// Página de Verificación Empresarial (Agent 1)
// ============================================

/**
 * CONCEPTO: Máquina de Estados Visual
 * 
 * Esta página maneja 5 estados visuales diferentes según el progreso
 * de la verificación KYB:
 * 
 * 1. NONE - Sin verificación: Mostrar formulario de upload
 * 2. PROCESSING - IA procesando: Mostrar estado de carga con polling
 * 3. AI_COMPLETED - IA terminó: Mostrar scores, esperando admin
 * 4. APPROVED - Admin aprobó: Mostrar certificación final
 * 5. REJECTED - Admin rechazó: Mostrar motivo y opción de reenviar
 * 
 * El flujo es: Upload → Polling → Resultados IA → Esperar Admin → Decisión Final
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Send,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  History,
  ShieldCheck, Coins, Settings, Phone, BarChart, Award, Bot, Calendar
} from 'lucide-react';

// Types
import type { 
  KybStatusResponse, 
  KybEvaluation,
  KybHistoryResponse,
  KybScores,
  KybInsights
} from '../../../types/kyb.types';
import { 
  getKybVisualStatus, 
  KYB_TIER_LABELS, 
  KYB_TIER_ICONS,
  KYB_TIER_COLORS
} from '../../../types/kyb.types';

// Services
import kybApi from '../services/kybApi';

// Hooks
import { usePolling } from '../hooks/usePolling';

// Shared Components
import PdfUploader from '../components/shared/PdfUploader';
import ScoreGauge, { ScoreCard } from '../components/shared/ScoreGauge';
import { 
  KybStatusBadge, 
  TierBadge, 
  AdminPendingBanner, 
  ProcessingState 
} from '../components/shared/StatusBadges';

// ============================================
// TYPES
// ============================================

type PageState = 'none' | 'processing' | 'ai_completed' | 'approved' | 'rejected' | 'error' | 'loading';

interface FormData {
  organizationName: string;
  rutTaxId: string;
  file: File | null;
}

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * Estado: Sin verificación - Formulario de upload
 */
interface UploadFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting: boolean;
  initialOrgName?: string;
}

const UploadForm: React.FC<UploadFormProps> = ({ onSubmit, isSubmitting, initialOrgName = '' }) => {
  const [formData, setFormData] = useState<FormData>({
    organizationName: initialOrgName,
    rutTaxId: '',
    file: null
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'El nombre de la organización es requerido';
    }
    
    if (!formData.rutTaxId.trim()) {
      newErrors.rutTaxId = 'El RUT tributario es requerido';
    } else if (!/^[0-9]{7,8}-[0-9Kk]$/.test(formData.rutTaxId.trim())) {
      newErrors.rutTaxId = 'Formato de RUT inválido (ej: 12345678-9)';
    }
    
    if (!formData.file) {
      newErrors.file = 'Debes seleccionar un archivo PDF';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  const handleFileSelect = (file: File) => {
    setFormData(prev => ({ ...prev, file }));
    setErrors(prev => ({ ...prev, file: undefined }));
  };

  return (
    <div className="!space-y-6">
      {/* Info Banner */}
      <div className="!bg-amber-50 dark:!bg-amber-900/30 !border !border-amber-200 dark:!border-amber-800/50 !rounded-xl !p-6">
        <div className="!flex !gap-4">
          <AlertTriangle className="!w-6 !h-6 !text-amber-600 dark:!text-amber-400 !flex-shrink-0 !mt-0.5" />
          <div>
            <h3 className="!text-amber-800 dark:!text-amber-300 !font-semibold !mb-2">
              Tu empresa aún no ha sido verificada
            </h3>
            <p className="!text-amber-700 dark:!text-amber-400 !text-sm !mb-3">
              Para activar tu cuenta y operar en la plataforma, necesitas enviar tus documentos empresariales para evaluación.
            </p>
            <div className="!text-sm !text-amber-700 dark:!text-amber-400">
              <p className="!font-medium !mb-1">Nuestra IA evaluará:</p>
              <ul className="!space-y-1">
                <li className="!flex !items-center !gap-2">
                  <FileText className="!w-4 !h-4" /> Documentación legal
                </li>
                <li className="!flex !items-center !gap-2">
                  <Coins className="!w-4 !h-4" /> Solidez financiera
                </li>
                <li className="!flex !items-center !gap-2">
                  <Settings className="!w-4 !h-4" /> Capacidad técnica
                </li>
                <li className="!flex !items-center !gap-2">
                  <Phone className="!w-4 !h-4" /> Referencias comerciales
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="!space-y-6">
        <div>
          <h3 className="!text-lg !font-semibold !text-slate-800 dark:!text-white !mb-4">
            Subir Dossier KYB
          </h3>
          
          {/* Organization Name */}
          <div className="!mb-4">
            <label className="!block !text-sm !font-medium !text-slate-700 dark:!text-slate-300 !mb-1">
              Nombre de la Organización *
            </label>
            <input
              type="text"
              value={formData.organizationName}
              onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
              placeholder="Ej: EcoForest Chile SpA"
              className={`!w-full !px-4 !py-3 !border !rounded-lg !transition-colors focus:!outline-none focus:!ring-2 focus:!ring-emerald-500 !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white ${
                errors.organizationName ? '!border-red-300 dark:!border-red-500/50 !bg-red-50 dark:!bg-red-900/20' : '!border-slate-300 dark:!border-slate-600'
              }`}
              disabled={isSubmitting}
            />
            {errors.organizationName && (
              <p className="!text-red-600 dark:!text-red-400 !text-sm !mt-1">{errors.organizationName}</p>
            )}
          </div>

          {/* RUT */}
          <div className="!mb-4">
            <label className="!block !text-sm !font-medium !text-slate-700 dark:!text-slate-300 !mb-1">
              RUT Tributario *
            </label>
            <input
              type="text"
              value={formData.rutTaxId}
              onChange={(e) => setFormData(prev => ({ ...prev, rutTaxId: e.target.value }))}
              placeholder="Ej: 76123456-7"
              className={`!w-full !px-4 !py-3 !border !rounded-lg !transition-colors focus:!outline-none focus:!ring-2 focus:!ring-emerald-500 !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white ${
                errors.rutTaxId ? '!border-red-300 dark:!border-red-500/50 !bg-red-50 dark:!bg-red-900/20' : '!border-slate-300 dark:!border-slate-600'
              }`}
              disabled={isSubmitting}
            />
            {errors.rutTaxId && (
              <p className="!text-red-600 dark:!text-red-400 !text-sm !mt-1">{errors.rutTaxId}</p>
            )}
          </div>

          {/* PDF Upload */}
          <div className="!mb-4">
            <label className="!block !text-sm !font-medium !text-slate-700 dark:!text-slate-300 !mb-2">
              Dossier Empresarial (PDF) *
            </label>
            <PdfUploader
              onFileSelect={handleFileSelect}
              disabled={isSubmitting}
              isUploading={isSubmitting}
              instruction="Arrastra tu dossier empresarial aquí o haz clic para seleccionar"
            />
            {errors.file && (
              <p className="!text-red-600 !text-sm !mt-1">{errors.file}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="!w-full !flex !items-center !justify-center !gap-2 !px-6 !py-3 !bg-emerald-600 !text-white !font-semibold !rounded-lg !transition-all hover:!bg-emerald-700 disabled:!opacity-50 disabled:!cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="!w-5 !h-5 !animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="!w-5 !h-5" />
              Enviar para Evaluación
            </>
          )}
        </button>
      </form>
    </div>
  );
};

/**
 * Scores Grid - Muestra los 4 scores de evaluación
 */
interface ScoresGridProps {
  scores: KybScores;
  insights?: KybInsights | null;
}

const ScoresGrid: React.FC<ScoresGridProps> = ({ scores, insights }) => {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const scoreItems = [
    { key: 'legal', label: 'Legal', icon: <FileText className="!w-4 !h-4" />, score: scores.legal, notes: insights?.legal_notes },
    { key: 'financial', label: 'Financiero', icon: <Coins className="!w-4 !h-4" />, score: scores.financial, notes: insights?.financial_notes },
    { key: 'technical', label: 'Técnico', icon: <Settings className="!w-4 !h-4" />, score: scores.technical, notes: insights?.technical_notes },
    { key: 'references', label: 'Referencias', icon: <Phone className="!w-4 !h-4" />, score: scores.references, notes: insights?.references_notes },
  ];

  return (
    <div className="!space-y-4">
      <h4 className="!text-sm !font-semibold !text-slate-700 dark:!text-slate-300 !uppercase !tracking-wide">
        Scores Detallados
      </h4>
      <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-4">
        {scoreItems.map((item) => (
          <div key={item.key} className="!relative">
            <ScoreCard
              score={item.score}
              label={item.label}
              icon={item.icon}
              description={item.notes || undefined}
            />
            {item.notes && (
              <button
                onClick={() => setExpandedInsight(expandedInsight === item.key ? null : item.key)}
                className="!absolute !top-2 !right-2 !text-slate-400 hover:!text-slate-600 dark:hover:!text-slate-200 !transition-colors"
                title="Ver detalle"
              >
                {expandedInsight === item.key ? (
                  <ChevronUp className="!w-4 !h-4" />
                ) : (
                  <ChevronDown className="!w-4 !h-4" />
                )}
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Expanded Insight */}
      {expandedInsight && (
        <div className="!bg-slate-50 dark:!bg-slate-800/50 !border !border-slate-200 dark:!border-slate-700 !rounded-lg !p-4 !mt-4">
          <h5 className="!font-medium !text-slate-700 dark:!text-slate-200 !mb-2">
            {scoreItems.find(s => s.key === expandedInsight)?.icon}{' '}
            Notas - {scoreItems.find(s => s.key === expandedInsight)?.label}
          </h5>
          <p className="!text-sm !text-slate-600 dark:!text-slate-400">
            {scoreItems.find(s => s.key === expandedInsight)?.notes}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Estado: IA completó evaluación, esperando admin
 */
interface AiCompletedStateProps {
  evaluation: KybEvaluation;
}

const AiCompletedState: React.FC<AiCompletedStateProps> = ({ evaluation }) => {
  return (
    <div className="!space-y-6">
      <AdminPendingBanner />
      
      {/* Summary Cards */}
      <div className="!grid !grid-cols-3 !gap-4">
        <div className="!bg-white dark:!bg-slate-700/50 !border !border-slate-200 dark:!border-slate-600 !rounded-xl !p-4 !text-center">
          <p className="!text-sm !text-slate-500 dark:!text-slate-400 !mb-1 !flex !items-center !justify-center !gap-1">
            <BarChart className="!w-4 !h-4" /> Score General
          </p>
          <p className="!text-3xl !font-bold !text-slate-800 dark:!text-slate-100">
            {evaluation.overall_score ?? evaluation.scores?.overall ?? 0}
            <span className="!text-lg !font-normal !text-slate-400 dark:!text-slate-500">/100</span>
          </p>
        </div>
        <div className="!bg-white dark:!bg-slate-700/50 !border !border-slate-200 dark:!border-slate-600 !rounded-xl !p-4 !text-center">
          <p className="!text-sm !text-slate-500 dark:!text-slate-400 !mb-1 !flex !items-center !justify-center !gap-1">
            <Award className="!w-4 !h-4" /> Tier Asignado
          </p>
          {evaluation.partner_tier ? (
            <TierBadge tier={evaluation.partner_tier} size="lg" />
          ) : (
            <p className="!text-slate-400 dark:!text-slate-500">Por determinar</p>
          )}
        </div>
        <div className="!bg-white dark:!bg-slate-700/50 !border !border-slate-200 dark:!border-slate-600 !rounded-xl !p-4 !text-center">
          <p className="!text-sm !text-slate-500 dark:!text-slate-400 !mb-1 !flex !items-center !justify-center !gap-1">
            <Bot className="!w-4 !h-4" /> Decisión IA
          </p>
          <p className={`!text-lg !font-semibold !flex !items-center !justify-center !gap-1 ${
            evaluation.ai_status === 'ai_approved' ? '!text-green-600 dark:!text-green-400' : '!text-red-600 dark:!text-red-400'
          }`}>
            {evaluation.ai_status === 'ai_approved' ? <><CheckCircle className="!w-5 !h-5" /> Aprobado</>  : <><XCircle className="!w-5 !h-5" /> Rechazado</>}
          </p>
        </div>
      </div>

      {/* Scores */}
      {evaluation.scores && (
        <ScoresGrid scores={evaluation.scores} insights={evaluation.ai_insights} />
      )}

      {/* Waiting message */}
      <div className="!flex !items-center !gap-3 !p-4 !bg-slate-50 dark:!bg-slate-800/80 !rounded-lg !border !border-slate-200 dark:!border-slate-700">
        <Clock className="!w-5 !h-5 !text-slate-500 dark:!text-slate-400 !animate-pulse" />
        <p className="!text-slate-600 dark:!text-slate-300">
          Esperando revisión del equipo de administración...
        </p>
      </div>
    </div>
  );
};

/**
 * Estado: KYB Aprobado
 */
interface ApprovedStateProps {
  evaluation: KybEvaluation;
  history: KybHistoryResponse | null;
}

const ApprovedState: React.FC<ApprovedStateProps> = ({ evaluation, history }) => {
  return (
    <div className="!space-y-6">
      {/* Success Banner */}
      <div className="!bg-green-50 dark:!bg-green-900/30 !border !border-green-200 dark:!border-green-800/50 !rounded-xl !p-6">
        <div className="!flex !items-start !gap-4">
          <div className="!w-12 !h-12 !bg-green-100 dark:!bg-green-900 !rounded-full !flex !items-center !justify-center !flex-shrink-0">
            <CheckCircle className="!w-6 !h-6 !text-green-600 dark:!text-green-400" />
          </div>
          <div className="!flex-grow">
            <h3 className="!text-green-800 dark:!text-green-300 !font-semibold !text-lg !mb-1">
              Empresa Verificada
            </h3>
            <div className="!flex !flex-wrap !items-center !gap-3 !mb-2">
              {evaluation.partner_tier && (
                <TierBadge tier={evaluation.partner_tier} size="md" />
              )}
              <span className="!flex !items-center !gap-1 !text-green-700 dark:!text-green-400">
                <BarChart className="!w-4 !h-4" /> Score: {evaluation.overall_score ?? evaluation.scores?.overall ?? 0}/100
              </span>
            </div>
            <p className="!flex !items-center !gap-1 !text-green-700 dark:!text-green-400 !text-sm">
              <Calendar className="!w-4 !h-4" /> Verificada: {evaluation.admin_decided_at 
                ? new Date(evaluation.admin_decided_at).toLocaleDateString('es-CL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                : 'N/A'
              }
            </p>
            <p className="!text-green-600 dark:!text-green-500 !text-sm !mt-2">
              Tu empresa ha sido verificada exitosamente. Tu cuenta está activa y puedes operar en la plataforma.
            </p>
          </div>
        </div>
      </div>

      {/* Scores */}
      {evaluation.scores && (
        <ScoresGrid scores={evaluation.scores} insights={evaluation.ai_insights} />
      )}

      {/* History */}
      {history && history.evaluations.length > 0 && (
        <EvaluationHistory evaluations={history.evaluations} />
      )}
    </div>
  );
};

/**
 * Estado: KYB Rechazado
 */
interface RejectedStateProps {
  evaluation: KybEvaluation;
  history: KybHistoryResponse | null;
  onRetry: () => void;
}

const RejectedState: React.FC<RejectedStateProps> = ({ evaluation, history, onRetry }) => {
  return (
    <div className="!space-y-6">
      {/* Rejected Banner */}
      <div className="!bg-red-50 dark:!bg-red-900/30 !border !border-red-200 dark:!border-red-800/50 !rounded-xl !p-6">
        <div className="!flex !items-start !gap-4">
          <div className="!w-12 !h-12 !bg-red-100 dark:!bg-red-900 !rounded-full !flex !items-center !justify-center !flex-shrink-0">
            <XCircle className="!w-6 !h-6 !text-red-600 dark:!text-red-400" />
          </div>
          <div className="!flex-grow">
            <h3 className="!text-red-800 dark:!text-red-300 !font-semibold !text-lg !mb-2">
              Verificación Rechazada
            </h3>
            {evaluation.admin_reason && (
              <div className="!bg-white dark:!bg-red-900/50 !border !border-red-200 dark:!border-red-700 !rounded-lg !p-3 !mb-3">
                <p className="!text-red-800 dark:!text-red-200 !text-sm">
                  <strong>Motivo:</strong> "{evaluation.admin_reason}"
                </p>
              </div>
            )}
            <p className="!text-red-600 dark:!text-red-400 !text-sm">
              Puedes corregir la documentación y volver a enviarla.
            </p>
          </div>
        </div>
      </div>

      {/* Retry Button */}
      <button
        onClick={onRetry}
        className="!w-full !flex !items-center !justify-center !gap-2 !px-6 !py-3 !bg-emerald-600 !text-white !font-semibold !rounded-lg !transition-all hover:!bg-emerald-700"
      >
        <RefreshCw className="!w-5 !h-5" />
        Enviar Nueva Documentación
      </button>

      {/* History */}
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
  evaluations: Array<KybEvaluation & { overall_score: number }>;
}

const EvaluationHistory: React.FC<EvaluationHistoryProps> = ({ evaluations }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="!border !border-slate-200 dark:!border-slate-700 !rounded-xl !overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="!w-full !flex !items-center !justify-between !p-4 !bg-slate-50 dark:!bg-slate-800/80 !text-left hover:!bg-slate-100 dark:hover:!bg-slate-700/50 !transition-colors"
      >
        <div className="!flex !items-center !gap-2">
          <History className="!w-5 !h-5 !text-slate-500 dark:!text-slate-400" />
          <span className="!font-medium !text-slate-700 dark:!text-slate-200">Historial de Evaluaciones</span>
          <span className="!text-sm !text-slate-500 dark:!text-slate-400">({evaluations.length})</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="!w-5 !h-5 !text-slate-400 dark:!text-slate-500" />
        ) : (
          <ChevronDown className="!w-5 !h-5 !text-slate-400 dark:!text-slate-500" />
        )}
      </button>

      {isExpanded && (
        <div className="!divide-y !divide-slate-200 dark:!divide-slate-700">
          {evaluations.map((eval_, index) => (
            <div key={eval_.id} className="!p-4 !flex !items-center !justify-between">
              <div className="!flex !items-center !gap-3">
                <span className={`!flex !items-center !justify-center !w-8 !h-8 !rounded-full ${
                  eval_.admin_decision === 'approved' ? '!bg-green-100 !text-green-600 dark:!bg-green-900/30 dark:!text-green-400' : 
                  eval_.admin_decision === 'rejected' ? '!bg-red-100 !text-red-600 dark:!bg-red-900/30 dark:!text-red-400' : '!bg-blue-100 !text-blue-600 dark:!bg-blue-900/30 dark:!text-blue-400'
                }`}>
                  {eval_.admin_decision === 'approved' ? <CheckCircle className="!w-5 !h-5" /> : 
                   eval_.admin_decision === 'rejected' ? <XCircle className="!w-5 !h-5" /> : <RefreshCw className="!w-4 !h-4" />}
                </span>
                <div>
                  <p className="!text-sm !text-slate-600 dark:!text-slate-300">
                    {new Date(eval_.created_at).toLocaleDateString('es-CL')}
                  </p>
                  <p className="!text-xs !text-slate-500 dark:!text-slate-400">
                    {eval_.document_name}
                  </p>
                </div>
              </div>
              <div className="!flex !items-center !gap-3">
                {eval_.partner_tier && (
                  <TierBadge tier={eval_.partner_tier} size="sm" />
                )}
                <span className="!text-sm !text-slate-600 dark:!text-slate-300">
                  Score: {eval_.overall_score}
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

const KybVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [pageState, setPageState] = useState<PageState>('loading');
  const [evaluation, setEvaluation] = useState<KybEvaluation | null>(null);
  const [history, setHistory] = useState<KybHistoryResponse | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  /**
   * Determine page state based on evaluation
   */
  const determinePageState = useCallback((statusResponse: KybStatusResponse): PageState => {
    if (!statusResponse.has_evaluation || !statusResponse.latest_evaluation) {
      return 'none';
    }

    const eval_ = statusResponse.latest_evaluation;
    
    if (eval_.admin_decision === 'approved') return 'approved';
    if (eval_.admin_decision === 'rejected') return 'rejected';
    
    if (eval_.ai_status === 'pending') return 'processing';
    if (eval_.ai_status === 'error') return 'error';
    if (eval_.ai_status === 'ai_approved' || eval_.ai_status === 'ai_rejected') {
      return 'ai_completed';
    }
    
    return 'none';
  }, []);

  /**
   * Handle status response update
   */
  const handleStatusUpdate = useCallback((status: KybStatusResponse) => {
    setEvaluation(status.latest_evaluation);
    setPartnerName(status.partner.name);
    const newState = determinePageState(status);
    setPageState(newState);
    
    // If we just got approved/rejected, fetch history
    if (newState === 'approved' || newState === 'rejected') {
      kybApi.getHistory().then(setHistory).catch(console.error);
    }
  }, [determinePageState]);

  /**
   * Polling hook - polls while status is 'processing'
   */
  const { data: statusData, loading: pollingLoading, refetch } = usePolling<KybStatusResponse>(
    () => kybApi.getStatus(),
    (status) => {
      // Continue polling if AI is still processing
      const latestEval = status?.latest_evaluation;
      return latestEval?.ai_status === 'pending' && !latestEval?.admin_decision;
    },
    30000, // 30 seconds
    {
      onSuccess: handleStatusUpdate,
      onError: (err) => {
        console.error('Polling error:', err);
        setError('Error al obtener el estado de verificación');
      }
    }
  );

  /**
   * Handle form submission
   */
  const handleSubmit = async (formData: FormData) => {
    if (!formData.file) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const submitFormData = new FormData();
      submitFormData.append('file', formData.file);
      submitFormData.append('organizationName', formData.organizationName);
      submitFormData.append('rutTaxId', formData.rutTaxId);
      
      await kybApi.upload(submitFormData);
      
      // After successful upload, refetch status
      setShowUploadForm(false);
      setPageState('processing');
      await refetch();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Error al enviar el dossier');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle retry (show upload form again)
   */
  const handleRetry = () => {
    setShowUploadForm(true);
  };

  // Fetch history on mount if already approved/rejected
  useEffect(() => {
    if (pageState === 'approved' || pageState === 'rejected') {
      kybApi.getHistory().then(setHistory).catch(console.error);
    }
  }, [pageState]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="!max-w-4xl !mx-auto !bg-slate-50 dark:!bg-slate-900 !p-6 md:!p-8 !rounded-3xl">
      {/* Header */}
      <div className="!mb-8">
        <div className="!flex !items-center !gap-3 !mb-2">
          <div className="!w-10 !h-10 !bg-emerald-100 dark:!bg-emerald-900/50 !rounded-xl !flex !items-center !justify-center">
            <Building2 className="!w-5 !h-5 !text-emerald-600 dark:!text-emerald-400" />
          </div>
          <h1 className="!text-2xl !font-bold !text-slate-800 dark:!text-slate-100">
            Verificación Empresarial (KYB)
          </h1>
        </div>
        {evaluation && (
          <div className="!ml-13">
            <KybStatusBadge evaluation={evaluation} size="md" />
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="!mb-6 !bg-red-50 dark:!bg-red-900/30 !border !border-red-200 dark:!border-red-800/50 !rounded-lg !p-4 !flex !items-start !gap-3">
          <AlertTriangle className="!w-5 !h-5 !text-red-500 dark:!text-red-400 !flex-shrink-0 !mt-0.5" />
          <div>
            <p className="!text-red-800 dark:!text-red-300 !font-medium">Error</p>
            <p className="!text-red-600 dark:!text-red-400 !text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="!ml-auto !text-red-400 hover:!text-red-600 dark:hover:!text-red-300"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="!bg-white dark:!bg-slate-800 !rounded-2xl !shadow-sm !border !border-slate-200 dark:!border-slate-700 !p-6 md:!p-8">
        
        {/* Loading State */}
        {pageState === 'loading' && (
          <div className="!flex !flex-col !items-center !justify-center !py-12">
            <div className="!w-12 !h-12 !border-4 !border-emerald-200 dark:!border-emerald-800 !border-t-emerald-600 !rounded-full !animate-spin !mb-4" />
            <p className="!text-slate-600 dark:!text-slate-400">Cargando estado de verificación...</p>
          </div>
        )}

        {/* State: None - No evaluation, show upload form */}
        {(pageState === 'none' || showUploadForm) && !pollingLoading && (
          <UploadForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            initialOrgName={partnerName}
          />
        )}

        {/* State: Processing - AI is evaluating */}
        {pageState === 'processing' && !showUploadForm && (
          <ProcessingState
            title="Evaluación en Proceso"
            message="Tu dossier fue recibido y está siendo evaluado por nuestra IA. Este proceso puede tomar de algunas horas hasta un día."
            documentName={evaluation?.document_name}
            submittedAt={evaluation?.created_at}
          />
        )}

        {/* State: AI Completed - Waiting for admin */}
        {pageState === 'ai_completed' && evaluation && !showUploadForm && (
          <AiCompletedState evaluation={evaluation} />
        )}

        {/* State: Approved */}
        {pageState === 'approved' && evaluation && !showUploadForm && (
          <ApprovedState evaluation={evaluation} history={history} />
        )}

        {/* State: Rejected */}
        {pageState === 'rejected' && evaluation && !showUploadForm && (
          <RejectedState 
            evaluation={evaluation} 
            history={history}
            onRetry={handleRetry}
          />
        )}

        {/* State: Error */}
        {pageState === 'error' && (
          <div className="!text-center !py-12">
            <div className="!w-16 !h-16 !bg-red-100 dark:!bg-red-900/50 !rounded-full !flex !items-center !justify-center !mx-auto !mb-4">
              <AlertTriangle className="!w-8 !h-8 !text-red-500 dark:!text-red-400" />
            </div>
            <h3 className="!text-lg !font-semibold !text-slate-800 dark:!text-white !mb-2">
              Error en la Evaluación
            </h3>
            <p className="!text-slate-600 dark:!text-slate-400 !mb-4">
              Ocurrió un error durante la evaluación de tu dossier. Por favor, intenta enviar nuevamente.
            </p>
            <button
              onClick={handleRetry}
              className="!inline-flex !items-center !gap-2 !px-4 !py-2 !bg-emerald-600 !text-white !rounded-lg hover:!bg-emerald-700 !transition-colors"
            >
              <RefreshCw className="!w-4 !h-4" />
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KybVerificationPage;
