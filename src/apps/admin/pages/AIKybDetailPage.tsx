import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Building2, FileText, Download, User, Calendar, ExternalLink } from 'lucide-react';
import adminAIApi from '../services/adminAIApi';
import { AdminKybEvaluationDetail, AdminPartnerContext } from '../../../types/admin-evaluations.types';
import AdminPendingBadge from '../components/shared/AdminPendingBadge';
import RejectModal from '../components/shared/RejectModal';
import { KYB_TIER_LABELS, KYB_TIER_COLORS, KYB_TIER_ICONS } from '../../../types/kyb.types';

const AIKybDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState<AdminKybEvaluationDetail | null>(null);
  const [context, setContext] = useState<AdminPartnerContext | null>(null);
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
    if (!evaluation || !window.confirm('¿Estás seguro de aprobar esta verificación KYB?')) return;
    try {
      setActionLoading(true);
      await adminAIApi.approveKybEvaluation(evaluation.id);
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
      await adminAIApi.rejectKybEvaluation(evaluation.id, reason);
      setShowRejectModal(false);
      await loadData(); // Reload to get updated status
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al rechazar');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="!p-12 !text-center !text-slate-500 dark:!text-slate-400">Cargando detalles...</div>;
  }

  if (error || !evaluation) {
    return (
      <div className="!p-6">
        <div className="!bg-red-50 dark:!bg-red-900/30 !text-red-700 dark:!text-red-300 !p-4 !rounded-lg !mb-4">{error || 'Evaluación no encontrada'}</div>
        <Link to="/admin/partners/evaluations" className="!text-indigo-600 dark:!text-indigo-400 hover:!underline">← Volver a la lista</Link>
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
            to="/admin/partners/evaluations"
            className="!p-2 !text-slate-400 dark:!text-slate-500 hover:!text-slate-600 dark:hover:!text-slate-300 hover:!bg-slate-100 dark:hover:!bg-slate-700 !rounded-lg !transition-colors"
          >
            <ArrowLeft className="!w-5 !h-5" />
          </Link>
          <div>
            <div className="!flex !items-center !gap-3 !mb-1">
              <h1 className="!text-2xl !font-bold !text-slate-800 dark:!text-slate-100">Verificación KYB</h1>
              <AdminPendingBadge aiStatus={evaluation.ai_status} adminDecision={evaluation.admin_decision} />
            </div>
            <p className="!text-slate-500 dark:!text-slate-400">{evaluation.organization_name}</p>
          </div>
        </div>

        {!isDecided && (
          <div className="!flex !items-center !gap-3">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
              className="!px-4 !py-2 !bg-red-50 dark:!bg-red-900/30 !text-red-600 dark:!text-red-400 hover:!bg-red-100 dark:hover:!bg-red-900/50 !rounded-lg !font-medium !transition-colors disabled:!opacity-50"
            >
              Rechazar
            </button>
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="!px-4 !py-2 !bg-green-600 !text-white hover:!bg-green-700 !rounded-lg !font-medium !transition-colors !flex !items-center !gap-2 disabled:!opacity-50"
            >
              <CheckCircle className="!w-4 !h-4" />
              Aprobar Verificación
            </button>
          </div>
        )}
      </div>

      {isDecided && (
        <div className={`!p-4 !rounded-xl !border ${evaluation.admin_decision === 'approved' ? '!bg-green-50 dark:!bg-green-900/20 !border-green-200 dark:!border-green-800' : '!bg-red-50 dark:!bg-red-900/20 !border-red-200 dark:!border-red-800'}`}>
          <div className="!flex !items-start !gap-3">
            {evaluation.admin_decision === 'approved' ? (
              <CheckCircle className="!w-6 !h-6 !text-green-600 dark:!text-green-400 !mt-0.5" />
            ) : (
              <XCircle className="!w-6 !h-6 !text-red-600 dark:!text-red-400 !mt-0.5" />
            )}
            <div>
              <h3 className={`!font-semibold ${evaluation.admin_decision === 'approved' ? '!text-green-800 dark:!text-green-300' : '!text-red-800 dark:!text-red-300'}`}>
                Decisión Final: {evaluation.admin_decision === 'approved' ? 'Aprobado' : 'Rechazado'}
              </h3>
              <p className={`!text-sm !mt-1 ${evaluation.admin_decision === 'approved' ? '!text-green-700 dark:!text-green-400' : '!text-red-700 dark:!text-red-400'}`}>
                Por: {evaluation.admin_user?.name || 'Admin'} el {new Date(evaluation.admin_decided_at || '').toLocaleDateString('es-CL')}
              </p>
              {evaluation.admin_reason && (
                <div className="!mt-3 !p-3 !bg-white/60 dark:!bg-slate-800/60 !rounded-lg !text-sm !text-slate-700 dark:!text-slate-300">
                  <strong>Motivo:</strong> {evaluation.admin_reason}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="!grid !grid-cols-1 lg:!grid-cols-3 !gap-6">
        
        {/* Left Column - Partner Context */}
        <div className="!space-y-6">
          <div className="!bg-white dark:!bg-slate-800 !rounded-xl !border !border-slate-200 dark:!border-slate-700 !shadow-sm !p-6">
            <h3 className="!text-lg !font-semibold !text-slate-800 dark:!text-slate-100 !mb-4 !flex !items-center !gap-2">
              <Building2 className="!w-5 !h-5 !text-slate-400 dark:!text-slate-500" />
              Datos de la Empresa
            </h3>
            
            <dl className="!space-y-4">
              <div>
                <dt className="!text-sm !text-slate-500 dark:!text-slate-400">Razón Social</dt>
                <dd className="!font-medium !text-slate-900 dark:!text-slate-100">{evaluation.organization_name}</dd>
              </div>
              <div>
                <dt className="!text-sm !text-slate-500 dark:!text-slate-400">RUT / Tax ID</dt>
                <dd className="!font-medium !text-slate-900 dark:!text-slate-100">{evaluation.rut_tax_id || 'No proporcionado'}</dd>
              </div>
              {context && (
                <>
                  <div>
                    <dt className="!text-sm !text-slate-500 dark:!text-slate-400">Email Contacto</dt>
                    <dd className="!text-slate-900 dark:!text-slate-100">{context.contact_email}</dd>
                  </div>
                  <div>
                    <dt className="!text-sm !text-slate-500 dark:!text-slate-400">Estado Actual Cuenta</dt>
                    <dd>
                      <span className="!inline-flex !px-2 !py-0.5 !rounded !text-xs !font-medium !bg-slate-100 dark:!bg-slate-700 !text-slate-800 dark:!text-slate-200">
                        {context.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="!text-sm !text-slate-500 dark:!text-slate-400">Proyectos Creados</dt>
                    <dd className="!text-slate-900 dark:!text-slate-100">{context.total_projects} proyectos</dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        </div>

        {/* Right Column - IA Analysis */}
        <div className="lg:!col-span-2 !space-y-6">
          <div className="!bg-white dark:!bg-slate-800 !rounded-xl !border !border-slate-200 dark:!border-slate-700 !shadow-sm !p-6">
            <h3 className="!text-lg !font-semibold !text-slate-800 dark:!text-slate-100 !mb-4 !flex !items-center !gap-2">
              <FileText className="!w-5 !h-5 !text-slate-400 dark:!text-slate-500" />
              Análisis IA
            </h3>
            
            {evaluation.scores && (
              <div className="!mb-6">
                <p className="!text-sm !text-slate-500 dark:!text-slate-400 !mb-2">Score General</p>
                <div className="!flex !items-center !gap-4">
                  <div className="!flex-1 !h-4 !bg-slate-100 dark:!bg-slate-700 !rounded-full !overflow-hidden">
                    <div 
                      className={`!h-full ${evaluation.scores.overall >= 80 ? '!bg-green-500' : evaluation.scores.overall >= 60 ? '!bg-yellow-500' : '!bg-red-500'}`}
                      style={{ width: `${evaluation.scores.overall}%` }}
                    />
                  </div>
                  <span className="!font-bold !text-slate-900 dark:!text-slate-100">{evaluation.scores.overall}%</span>
                </div>
              </div>
            )}

            {evaluation.ai_insights && (
              <div className="!prose !max-w-none dark:!prose-invert">
                <h4 className="!text-md !font-medium !text-slate-900 dark:!text-slate-100 !mb-2">Insights Legales</h4>
                <p className="!text-slate-700 dark:!text-slate-300 !whitespace-pre-line">{evaluation.ai_insights.legal_notes}</p>
                
                <h4 className="!text-md !font-medium !text-slate-900 dark:!text-slate-100 !mt-4 !mb-2">Insights Financieros</h4>
                <p className="!text-slate-700 dark:!text-slate-300 !whitespace-pre-line">{evaluation.ai_insights.financial_notes}</p>
                
                <h4 className="!text-md !font-medium !text-slate-900 dark:!text-slate-100 !mt-4 !mb-2">Insights Técnicos</h4>
                <p className="!text-slate-700 dark:!text-slate-300 !whitespace-pre-line">{evaluation.ai_insights.technical_notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Rechazar Verificación KYB"
        itemName={evaluation.organization_name}
        loading={actionLoading}
      />
    </div>
  );
};

export default AIKybDetailPage;
