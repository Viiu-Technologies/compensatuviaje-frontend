import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, FileText, Building2, Search, ArrowRight, Clock } from 'lucide-react';
import adminAIApi from '../services/adminAIApi';
import { 
  AdminCertEvaluationListItem, 
  AdminKybEvaluationListItem 
} from '../../../types/admin-evaluations.types';
import AdminPendingBadge from '../components/shared/AdminPendingBadge';
import { KYB_TIER_LABELS, KYB_TIER_COLORS, KYB_TIER_ICONS } from '../../../types/kyb.types';
import { CERT_LEVEL_LABELS, CERT_LEVEL_COLORS, CERT_LEVEL_ICONS } from '../../../types/certification.types';

type Tab = 'projects' | 'kyb';

const AIEvaluationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('projects');
  
  const [certEvaluations, setCertEvaluations] = useState<AdminCertEvaluationListItem[]>([]);
  const [certLoading, setCertLoading] = useState(true);
  
  const [kybEvaluations, setKybEvaluations] = useState<AdminKybEvaluationListItem[]>([]);
  const [kybLoading, setKybLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<string>('pending_review');

  useEffect(() => {
    if (activeTab === 'projects') {
      loadCertEvaluations();
    } else {
      loadKybEvaluations();
    }
  }, [activeTab, statusFilter]);

  const loadCertEvaluations = async () => {
    try {
      setCertLoading(true);
      const params = statusFilter === 'pending_review' ? {} : { status: statusFilter };
      const response = await adminAIApi.getCertEvaluations(params);
      setCertEvaluations(response.data || []);
    } catch (error) {
      console.error('Error loading cert evaluations:', error);
    } finally {
      setCertLoading(false);
    }
  };

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
    <div className="!space-y-6">
      <div className="!flex !items-center !justify-between">
        <div>
          <h1 className="!text-2xl !font-bold !text-slate-800 dark:!text-slate-100 !flex !items-center !gap-2">
            <Bot className="!w-7 !h-7 !text-indigo-600 dark:!text-indigo-400" />
            Validaciones IA
          </h1>
          <p className="!text-slate-500 dark:!text-slate-400 !mt-1">
            Revisa las evaluaciones automáticas de proyectos y empresas y toma la decisión final.
          </p>
        </div>
      </div>

      <div className="!flex !flex-col sm:!flex-row !justify-between !items-start sm:!items-center !gap-4 !bg-white dark:!bg-slate-800 !p-4 !rounded-xl !shadow-sm !border !border-slate-200 dark:!border-slate-700">
        <div className="!flex !bg-slate-100 dark:!bg-slate-700 !p-1 !rounded-lg">
          <button
            onClick={() => setActiveTab('projects')}
            className={`!flex !items-center !gap-2 !px-4 !py-2 !rounded-md !text-sm !font-medium !transition-colors ${
              activeTab === 'projects'
                ? '!bg-white dark:!bg-slate-600 !text-indigo-700 dark:!text-indigo-300 !shadow-sm'
                : '!text-slate-600 dark:!text-slate-300 hover:!text-slate-900 dark:hover:!text-white'
            }`}
          >
            <FileText className="!w-4 !h-4" />
            Certificaciones ESG
          </button>
          <button
            onClick={() => setActiveTab('kyb')}
            className={`!flex !items-center !gap-2 !px-4 !py-2 !rounded-md !text-sm !font-medium !transition-colors ${
              activeTab === 'kyb'
                ? '!bg-white dark:!bg-slate-600 !text-indigo-700 dark:!text-indigo-300 !shadow-sm'
                : '!text-slate-600 dark:!text-slate-300 hover:!text-slate-900 dark:hover:!text-white'
            }`}
          >
            <Building2 className="!w-4 !h-4" />
            Verificaciones KYB
          </button>
        </div>

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
        {activeTab === 'projects' && (
          <div>
            {certLoading ? (
              <div className="!p-12 !text-center !text-slate-500 dark:!text-slate-400">
                <Clock className="!w-8 !h-8 !animate-spin !mx-auto !mb-4" />
                Cargando evaluaciones...
              </div>
            ) : certEvaluations.length === 0 ? (
              <div className="!p-12 !text-center !text-slate-500 dark:!text-slate-400">
                <Bot className="!w-12 !h-12 !mx-auto !mb-4 !text-slate-300 dark:!text-slate-600" />
                <h3 className="!text-lg !font-medium !text-slate-700 dark:!text-slate-300 !mb-1">No hay certificaciones</h3>
                <p>No se encontraron evaluaciones para el filtro seleccionado.</p>
              </div>
            ) : (
              <div className="!overflow-x-auto">
                <table className="!w-full !text-left !border-collapse">
                  <thead>
                    <tr className="!bg-slate-50 dark:!bg-slate-700/50 !border-b !border-slate-200 dark:!border-slate-600 !text-xs !uppercase !text-slate-500 dark:!text-slate-400">
                      <th className="!py-3 !px-4 !font-medium">Proyecto / Partner</th>
                      <th className="!py-3 !px-4 !font-medium">Tipo</th>
                      <th className="!py-3 !px-4 !font-medium">Evaluación IA</th>
                      <th className="!py-3 !px-4 !font-medium">Fecha</th>
                      <th className="!py-3 !px-4 !font-medium !text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="!divide-y !divide-slate-200 dark:!divide-slate-700">
                    {certEvaluations.map((evalItem) => (
                      <tr key={evalItem.id} className="hover:!bg-slate-50 dark:hover:!bg-slate-700/30 !transition-colors">
                        <td className="!py-3 !px-4">
                          <div className="!font-medium !text-slate-900 dark:!text-slate-100">{evalItem.project.name}</div>
                          <div className="!text-xs !text-slate-500 dark:!text-slate-400">{evalItem.partner.name}</div>
                        </td>
                        <td className="!py-3 !px-4">
                          <span className="!inline-flex !items-center !px-2 !py-0.5 !rounded !text-xs !font-medium !bg-slate-100 dark:!bg-slate-700 !text-slate-800 dark:!text-slate-200">
                            {evalItem.certification_type}
                          </span>
                        </td>
                        <td className="!py-3 !px-4">
                          <div className="!flex !flex-col !gap-1.5 !items-start">
                            <AdminPendingBadge aiStatus={evalItem.ai_status} adminDecision={evalItem.admin_decision} size="sm" />
                            {evalItem.level && (
                              <div className={`!text-xs !px-2 !py-0.5 !rounded-full !font-medium !border ${CERT_LEVEL_COLORS[evalItem.level]}`}>
                                {CERT_LEVEL_ICONS[evalItem.level]} {CERT_LEVEL_LABELS[evalItem.level]} (Score: {evalItem.final_score})
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="!py-3 !px-4 !text-sm !text-slate-500 dark:!text-slate-400">
                          {formatDate(evalItem.n8n_processed_at || evalItem.created_at)}
                        </td>
                        <td className="!py-3 !px-4 !text-right">
                          <Link 
                            to={`/admin/partners/evaluations/${evalItem.id}`}
                            className="!inline-flex !items-center !gap-1 !px-3 !py-1.5 !text-sm !font-medium !text-indigo-600 dark:!text-indigo-400 !bg-indigo-50 dark:!bg-indigo-900/30 hover:!bg-indigo-100 dark:hover:!bg-indigo-900/50 !rounded-lg !transition-colors"
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
        )}

        {activeTab === 'kyb' && (
          <div>
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
                              <div className={`!text-xs !px-2 !py-0.5 !rounded-full !font-medium !border ${KYB_TIER_COLORS[evalItem.partner_tier]}`}>
                                {KYB_TIER_ICONS[evalItem.partner_tier]} {KYB_TIER_LABELS[evalItem.partner_tier]} (Score: {evalItem.overall_score})
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
                            className="!inline-flex !items-center !gap-1 !px-3 !py-1.5 !text-sm !font-medium !text-indigo-600 dark:!text-indigo-400 !bg-indigo-50 dark:!bg-indigo-900/30 hover:!bg-indigo-100 dark:hover:!bg-indigo-900/50 !rounded-lg !transition-colors"
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
        )}
      </div>
    </div>
  );
};

export default AIEvaluationsPage;
