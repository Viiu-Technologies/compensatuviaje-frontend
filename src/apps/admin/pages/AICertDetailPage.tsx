import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, TreePine, FileText, Download, Building2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import adminAIApi from '../services/adminAIApi';
import { AdminCertEvaluationDetail, AdminProjectContext } from '../../../types/admin-evaluations.types';
import AdminPendingBadge from '../components/shared/AdminPendingBadge';
import RejectModal from '../components/shared/RejectModal';
import { CERT_LEVEL_LABELS, CERT_LEVEL_COLORS, CERT_LEVEL_ICONS, SCORE_LABELS } from '../../../types/certification.types';

const AICertDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState<AdminCertEvaluationDetail | null>(null);
  const [context, setContext] = useState<AdminProjectContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
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
      setError(err.response?.data?.message || 'Error al cargar la evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!evaluation || !window.confirm('¿Estás seguro de aprobar esta certificación de proyecto?')) return;
    try {
      setActionLoading(true);
      await adminAIApi.approveCertEvaluation(evaluation.id);
      await loadData(); // Reload to get updated status
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al aprobar');
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
      await loadData(); // Reload to get updated status
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al rechazar');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(num);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CL').format(num);
  };

  if (loading) {
    return <div className="!p-12 !text-center !text-slate-500">Cargando detalles de certificación...</div>;
  }

  if (error || !evaluation) {
    return (
      <div className="!p-6">
        <div className="!bg-red-50 !text-red-700 !p-4 !rounded-lg !mb-4">{error || 'Evaluación no encontrada'}</div>
        <Link to="/admin/evaluations" className="!text-indigo-600 hover:!underline">← Volver a la lista</Link>
      </div>
    );
  }

  const isDecided = evaluation.admin_decision !== null;

  return (
    <div className="!space-y-6 !pb-24">
      {/* Header */}
      <div className="!flex !items-center !justify-between">
        <div className="!flex !items-center !gap-4">
          <Link
            to="/admin/evaluations"
            className="!p-2 !text-slate-400 hover:!text-slate-600 hover:!bg-slate-100 !rounded-lg !transition-colors"
          >
            <ArrowLeft className="!w-5 !h-5" />
          </Link>
          <div>
            <div className="!flex !items-center !gap-3 !mb-1">
              <h1 className="!text-2xl !font-bold !text-slate-800">Certificación de Proyecto</h1>
              <AdminPendingBadge aiStatus={evaluation.ai_status} adminDecision={evaluation.admin_decision} />
            </div>
            <p className="!text-slate-500">{evaluation.project.name} ({evaluation.project.code})</p>
          </div>
        </div>

        {!isDecided && (
          <div className="!flex !items-center !gap-3">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
              className="!px-4 !py-2 !bg-red-50 !text-red-600 hover:!bg-red-100 !rounded-lg !font-medium !transition-colors disabled:!opacity-50"
            >
              Rechazar
            </button>
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="!px-4 !py-2 !bg-green-600 !text-white hover:!bg-green-700 !rounded-lg !font-medium !transition-colors !flex !items-center !gap-2 disabled:!opacity-50"
            >
              <CheckCircle className="!w-4 !h-4" />
              Aprobar Certificación
            </button>
          </div>
        )}
      </div>

      {isDecided && (
        <div className={`!p-4 !rounded-xl !border ${evaluation.admin_decision === 'approved' ? '!bg-green-50 !border-green-200' : '!bg-red-50 !border-red-200'}`}>
          <div className="!flex !items-start !gap-3">
            {evaluation.admin_decision === 'approved' ? (
              <CheckCircle className="!w-6 !h-6 !text-green-600 !mt-0.5" />
            ) : (
              <XCircle className="!w-6 !h-6 !text-red-600 !mt-0.5" />
            )}
            <div>
              <h3 className={`!font-semibold ${evaluation.admin_decision === 'approved' ? '!text-green-800' : '!text-red-800'}`}>
                Decisión Final: {evaluation.admin_decision === 'approved' ? 'Aprobado' : 'Rechazado'}
              </h3>
              <p className={`!text-sm !mt-1 ${evaluation.admin_decision === 'approved' ? '!text-green-700' : '!text-red-700'}`}>
                Por: {evaluation.admin_user?.name || 'Admin'} el {new Date(evaluation.admin_decided_at || '').toLocaleDateString('es-CL')}
              </p>
              {evaluation.admin_reason && (
                <div className="!mt-3 !p-3 !bg-white/60 !rounded-lg !text-sm">
                  <strong>Motivo:</strong> {evaluation.admin_reason}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="!grid !grid-cols-1 lg:!grid-cols-3 !gap-6">
        
        {/* Left Column - Project Context */}
        <div className="!space-y-6">
          <div className="!bg-white !rounded-xl !border !shadow-sm !p-6">
            <h3 className="!text-lg !font-semibold !mb-4 !flex !items-center !gap-2">
              <TreePine className="!w-5 !h-5 !text-slate-400" />
              Datos del Proyecto
            </h3>
            
            <dl className="!space-y-4">
              <div>
                <dt className="!text-sm !text-slate-500">Nombre</dt>
                <dd className="!font-medium !text-slate-900">{evaluation.project.name}</dd>
              </div>
              <div>
                <dt className="!text-sm !text-slate-500">Tipo de Proyecto</dt>
                <dd className="!inline-flex !px-2 !py-0.5 !rounded !text-xs !font-medium !bg-slate-100 !mt-1">
                  {evaluation.project.projectType}
                </dd>
              </div>
              
              {context && (
                <>
                  <div>
                    <dt className="!text-sm !text-slate-500">Ubicación</dt>
                    <dd className="!text-slate-900">{context.location_country} {context.location_region && `- ${context.location_region}`}</dd>
                  </div>
                  <div>
                    <dt className="!text-sm !text-slate-500">Capacidad Total</dt>
                    <dd className="!text-slate-900">{formatNumber(context.capacity_total || 0)} bonos</dd>
                  </div>
                </>
              )}
            </dl>
          </div>
          
          <div className="!bg-white !rounded-xl !border !shadow-sm !p-6">
            <h3 className="!text-lg !font-semibold !mb-4 !flex !items-center !gap-2">
              <Building2 className="!w-5 !h-5 !text-slate-400" />
              Datos del Partner
            </h3>
            <dl className="!space-y-4">
              <div>
                <dt className="!text-sm !text-slate-500">Nombre</dt>
                <dd className="!font-medium !text-slate-900">{evaluation.partner.name}</dd>
              </div>
              <div>
                <dt className="!text-sm !text-slate-500">Contacto</dt>
                <dd className="!text-slate-900">{evaluation.partner.contact_email}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right Column - IA Analysis */}
        <div className="lg:!col-span-2 !space-y-6">
          <div className="!bg-white !rounded-xl !border !shadow-sm !p-6">
            <h3 className="!text-lg !font-semibold !mb-4 !flex !items-center !gap-2">
              <FileText className="!w-5 !h-5 !text-slate-400" />
              Análisis IA
            </h3>
            
            <div className="!mb-6 !flex !gap-4">
              {evaluation.level && (
                <div className={`!px-4 !py-2 !rounded-lg !border ${CERT_LEVEL_COLORS[evaluation.level]} !flex !items-center !gap-2`}>
                  <span className="!text-xl">{CERT_LEVEL_ICONS[evaluation.level]}</span>
                  <span className="!font-bold">{CERT_LEVEL_LABELS[evaluation.level]}</span>
                </div>
              )}
              {evaluation.final_score !== null && (
                <div className="!px-4 !py-2 !rounded-lg !bg-slate-100 !border !border-slate-200 !flex !items-center !gap-2">
                  <span className="!text-sm !text-slate-500">Score:</span>
                  <span className="!font-bold !text-slate-800">{evaluation.final_score}/100</span>
                </div>
              )}
            </div>

            {evaluation.report_markdown && (
              <div className="!mt-6 !prose !prose-sm !max-w-none !prose-slate !border-t !pt-6">
                <ReactMarkdown>{evaluation.report_markdown}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Rechazar Certificación de Proyecto"
        itemName={evaluation.project.name}
        loading={actionLoading}
      />
    </div>
  );
};

export default AICertDetailPage;
