import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, FileText, Building2, Search, ArrowRight, Clock, Award, Medal, Gem } from 'lucide-react';
import adminAIApi from '../services/adminAIApi';
import { 
  AdminKybEvaluationListItem 
} from '../../../types/admin-evaluations.types';
import AdminPendingBadge from '../components/shared/AdminPendingBadge';
import { KYB_TIER_LABELS, KYB_TIER_COLORS } from '../../../types/kyb.types';

const getKybTieIcon = (tier: string) => {
  if (tier === 'PLATINUM') return <Gem className="!w-3.5 !h-3.5" />;
  if (tier === 'GOLD') return <Award className="!w-3.5 !h-3.5" />;
  return <Medal className="!w-3.5 !h-3.5" />;
};

const AIEvaluationsPage: React.FC = () => {
  const [kybEvaluations, setKybEvaluations] = useState<AdminKybEvaluationListItem[]>([]);
  const [kybLoading, setKybLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending_review');

  useEffect(() => {
    loadKybEvaluations();
  }, [statusFilter]);

  const loadKybEvaluations = async () => {
    try {
      setKybLoading(true);
      const params = statusFilter === 'pending_review' ? {} : { status: statusFilter };
      const response = await adminAIApi.getKybEvaluations(params);
      setKybEvaluations(response.data || []);
    } catch (error) {
      console.error('Error loading KYB evaluations:', error);
    } finally {
      setKybLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('es-CL', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="!space-y-6 !bg-slate-50 dark:!bg-slate-900 !p-6 md:!p-8 !rounded-3xl">
      <div className="!flex !items-center !justify-between">
        <div>
          <h1 className="!text-2xl !font-bold !text-slate-800 dark:!text-slate-100 !flex !items-center !gap-2">
            <Bot className="!w-7 !h-7 !text-indigo-600 dark:!text-indigo-400" />
            Solicitudes KYB
          </h1>
          <p className="!text-slate-500 dark:!text-slate-400 !mt-1">
            Revisa las verificaciones KYB de Impact Partners evaluadas por IA y toma la decisión final.
          </p>
        </div>
      </div>

      <div className="!flex !justify-end !items-center !gap-4 !bg-white dark:!bg-slate-800 !p-4 !rounded-xl !shadow-sm !border !border-slate-200 dark:!border-slate-700">
        <div className="!flex !items-center !gap-2">
          <span className="!text-sm !text-slate-500 dark:!text-slate-400">Filtrar por:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="!border-slate-300 dark:!border-slate-600 !bg-white dark:!bg-slate-700 !text-slate-900 dark:!text-slate-100 !rounded-lg !text-sm !py-2 !pl-3 !pr-8 focus:!ring-indigo-500 focus:!border-indigo-500"
          >
            <option value="all">Todos</option>
            <option value="pending_review">Pendientes de Revisión</option>
            <option value="admin_approved">Aprobados</option>
            <option value="admin_rejected">Rechazados</option>
            <option value="pending">Procesando IA</option>
          </select>
        </div>
      </div>

      <div className="!bg-white dark:!bg-slate-800 !rounded-xl !shadow-sm !border !border-slate-200 dark:!border-slate-700 !overflow-hidden">
        {kybLoading ? (
          <div className="!p-12 !text-center !text-slate-500 dark:!text-slate-400">
            <Clock className="!w-8 !h-8 !animate-spin !mx-auto !mb-4" />
            Cargando evaluaciones...
          </div>
        ) : kybEvaluations.length === 0 ? (
          <div className="!p-12 !text-center !text-slate-500 dark:!text-slate-400">
            <Bot className="!w-12 !h-12 !mx-auto !mb-4 !text-slate-300 dark:!text-slate-600" />
            <h3 className="!text-lg !font-medium !text-slate-700 dark:!text-slate-300 !mb-1">No hay verificaciones KYB</h3>
            <p>No se encontraron evaluaciones para el filtro seleccionado.</p>
          </div>
        ) : (
          <div className="!overflow-x-auto">
            <table className="!w-full !text-left !border-collapse">
              <thead>
                <tr className="!bg-slate-50 dark:!bg-slate-700/50 !border-b !border-slate-200 dark:!border-slate-600 !text-xs !uppercase !text-slate-500 dark:!text-slate-400">
                  <th className="!py-3 !px-4 !font-medium">Empresa</th>
                  <th className="!py-3 !px-4 !font-medium">RUT / Tax ID</th>
                  <th className="!py-3 !px-4 !font-medium">Evaluación IA</th>
                  <th className="!py-3 !px-4 !font-medium">Fecha</th>
                  <th className="!py-3 !px-4 !font-medium !text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="!divide-y !divide-slate-200 dark:!divide-slate-700">
                {kybEvaluations.map((evalItem) => (
                  <tr key={evalItem.id} className="hover:!bg-slate-50 dark:hover:!bg-slate-700/30 !transition-colors">
                    <td className="!py-3 !px-4">
                      <div className="!font-medium !text-slate-900 dark:!text-slate-100">{evalItem.organization_name}</div>
                      <div className="!text-xs !text-slate-500 dark:!text-slate-400">Partner ID: {evalItem.partner?.id?.slice(0, 8) || 'N/A'}</div>
                    </td>
                    <td className="!py-3 !px-4 !text-sm !text-slate-600 dark:!text-slate-300">
                      {evalItem.rut_tax_id || 'N/A'}
                    </td>
                    <td className="!py-3 !px-4">
                      <div className="!flex !flex-col !gap-1.5 !items-start">
                        <AdminPendingBadge aiStatus={evalItem.ai_status} adminDecision={evalItem.admin_decision} size="sm" />
                        {evalItem.partner_tier && (
                          <div className={`!flex !items-center !gap-1 !text-xs !px-2.5 !py-1 !rounded-full !font-medium !border ${KYB_TIER_COLORS[evalItem.partner_tier]}`}>
                            {getKybTieIcon(evalItem.partner_tier)} {KYB_TIER_LABELS[evalItem.partner_tier]} (Score: {evalItem.overall_score})
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="!py-3 !px-4 !text-sm !text-slate-500 dark:!text-slate-400">
                      {formatDate(evalItem.n8n_processed_at || evalItem.created_at)}
                    </td>
                    <td className="!py-3 !px-4 !text-right">
                      <Link 
                        to={`/admin/partners/kyb-evaluations/${evalItem.id}`}
                        className="!inline-flex !items-center !gap-1 !px-3 !py-1.5 !text-sm !font-medium !text-white !bg-indigo-600 dark:!bg-indigo-500 hover:!bg-indigo-700 dark:hover:!bg-indigo-600 !rounded-lg !transition-colors"
                      >
                        Revisar
                        <ArrowRight className="!w-4 !h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIEvaluationsPage;
