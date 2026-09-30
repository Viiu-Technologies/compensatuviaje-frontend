import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import adminAIApi from '../services/adminAIApi';
import { AdminKybEvaluationListItem } from '../../../types/admin-evaluations.types';
import AdminPendingBadge from '../components/shared/AdminPendingBadge';
import { KYB_TIER_LABELS } from '../../../types/kyb.types';
import { EmptyState, PageHeader, Segmented, TableSkeletonRows } from '../ui';

const STATUS_FILTERS = [
  { value: 'pending_review', label: 'Por revisar' },
  { value: 'admin_approved', label: 'Aprobadas' },
  { value: 'admin_rejected', label: 'Rechazadas' },
  { value: 'pending', label: 'IA procesando' },
  { value: 'all', label: 'Todas' },
];

const EMPTY_TEXT: Record<string, string> = {
  pending_review: 'No hay solicitudes esperando tu decisión.',
  admin_approved: 'Aún no se ha aprobado ninguna solicitud.',
  admin_rejected: 'No hay solicitudes rechazadas.',
  pending: 'La IA no está procesando ninguna solicitud.',
  all: 'Todavía no llegan solicitudes KYB.',
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('es-CL', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
};

const AIEvaluationsPage: React.FC = () => {
  const [kybEvaluations, setKybEvaluations] = useState<AdminKybEvaluationListItem[]>([]);
  const [kybLoading, setKybLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
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
      setLoadError(false);
    } catch (error) {
      console.error('Error loading KYB evaluations:', error);
      setLoadError(true);
    } finally {
      setKybLoading(false);
    }
  };

  return (
    <div className="adm-page">
      <PageHeader
        title="Solicitudes KYB"
        description="Verificaciones de Impact Partners evaluadas por Veritas AI. La decisión final es tuya."
      />

      {loadError && (
        <div role="alert" className="adm-alert adm-alert--danger">
          <AlertTriangle aria-hidden="true" />
          <div><b>No se pudieron cargar las solicitudes.</b> Revisa la conexión y vuelve a intentar.</div>
        </div>
      )}

      <section className="adm-table-card">
        <div className="adm-toolbar">
          <Segmented label="Filtrar por estado" options={STATUS_FILTERS} value={statusFilter} onChange={setStatusFilter} />
        </div>

        <div className="adm-table-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Organización</th>
                <th scope="col">RUT / Tax ID</th>
                <th scope="col">Evaluación</th>
                <th scope="col">Evaluada</th>
                <th scope="col" className="adm-col-actions"><span className="sr-only">Acción</span></th>
              </tr>
            </thead>
            <tbody>
              {kybLoading ? (
                <TableSkeletonRows columns={5} />
              ) : kybEvaluations.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState icon={ShieldCheck} title="Sin solicitudes" text={EMPTY_TEXT[statusFilter]} />
                  </td>
                </tr>
              ) : (
                kybEvaluations.map((evalItem) => (
                  <tr key={evalItem.id}>
                    <td>
                      <span className="adm-cell-title">{evalItem.organization_name}</span>
                      {evalItem.partner_tier && (
                        <span className="adm-cell-sub">
                          Nivel {KYB_TIER_LABELS[evalItem.partner_tier]}
                          {evalItem.overall_score != null && ` · ${evalItem.overall_score} pts`}
                        </span>
                      )}
                    </td>
                    <td>{evalItem.rut_tax_id || <span className="adm-cell-mute">—</span>}</td>
                    <td>
                      <AdminPendingBadge aiStatus={evalItem.ai_status} adminDecision={evalItem.admin_decision} />
                    </td>
                    <td>{formatDate(evalItem.n8n_processed_at || evalItem.created_at)}</td>
                    <td className="adm-col-actions">
                      <Link to={`/admin/partners/kyb-evaluations/${evalItem.id}`} className="adm-btn adm-btn--sm">
                        {evalItem.admin_decision ? 'Ver' : 'Revisar'}
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AIEvaluationsPage;
