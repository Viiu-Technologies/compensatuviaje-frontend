import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, RefreshCw, Upload, FileText, Check, X, AlertTriangle } from 'lucide-react';
import {
  getB2BOrders,
  approveB2BOrder,
  rejectB2BOrder,
  uploadB2BInvoice,
  type B2BOrder
} from '../services/adminApi';
import { toast } from 'sonner';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import {
  EmptyState, Modal, PageHeader, Pagination, Segmented, StatusBadge, TableSkeletonRows, type StatusTone,
  formatCLP, formatInt, formatTime,
} from '../ui';

/**
 * Órdenes B2B pagadas por transferencia: el admin confirma el pago
 * (aprobar emite el certificado y descuenta stock) y sube la factura.
 *
 * Antes mostraba "Pendientes", "Aprobadas" y "Monto total" calculados solo
 * con las órdenes de la página visible (y el monto sumaba también las
 * rechazadas). Se quitaron: no eran totales reales.
 */

const STATUS: Record<string, { label: string; tone: StatusTone }> = {
  pending: { label: 'Pendiente', tone: 'warning' },
  approved: { label: 'Aprobada', tone: 'success' },
  rejected: { label: 'Rechazada', tone: 'danger' },
  expired: { label: 'Vencida', tone: 'neutral' },
};

const STATUS_FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'rejected', label: 'Rechazadas' },
];

const LIMIT = 20;

const tons = (n: number) => Number(n || 0).toLocaleString('es-CL', { maximumFractionDigits: 2 });

export default function OrdenesB2BPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<B2BOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const statusFilter = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [actionModal, setActionModal] = useState<{ type: 'approve' | 'reject'; order: B2BOrder } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [uploadingInvoiceId, setUploadingInvoiceId] = useState<string | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      const data = await getB2BOrders(params);
      setOrders(data.orders);
      setTotal(data.total);
      setLoadError(false);
    } catch (err) {
      console.error('Error loading orders:', err);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, [page, statusFilter]);

  const totalPages = Math.ceil(total / LIMIT);

  const setFilter = (value: string) => {
    const params: Record<string, string> = { page: '1' };
    if (value) params.status = value;
    setSearchParams(params);
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params);
  };

  const closeModal = () => {
    setActionModal(null);
    setRejectReason('');
    setActionError(null);
  };

  const submitAction = async () => {
    if (!actionModal) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      if (actionModal.type === 'approve') {
        const result = await approveB2BOrder(actionModal.order.id);
        toast.success(`Orden aprobada. Certificado ${result.certificateNumber}`);
      } else {
        await rejectB2BOrder(actionModal.order.id, rejectReason.trim() || undefined);
        toast.success('Orden rechazada');
      }
      closeModal();
      loadOrders();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || (actionModal.type === 'approve' ? 'No se pudo aprobar la orden' : 'No se pudo rechazar la orden'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvoiceUpload = async (orderId: string, file: File) => {
    setUploadingInvoiceId(orderId);
    try {
      await uploadB2BInvoice(orderId, file);
      toast.success('Factura subida');
      loadOrders();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'No se pudo subir la factura'));
    } finally {
      setUploadingInvoiceId(null);
    }
  };

  const approving = actionModal?.type === 'approve';

  return (
    <div className="adm-page">
      <PageHeader
        title="Órdenes B2B"
        description="Compensaciones de empresas pagadas por transferencia bancaria."
        actions={
          <button type="button" className="adm-btn" onClick={loadOrders} disabled={isLoading}>
            <RefreshCw aria-hidden="true" /> Actualizar
          </button>
        }
      />

      {loadError && (
        <div role="alert" className="adm-alert adm-alert--danger">
          <AlertTriangle aria-hidden="true" />
          <div><b>No se pudo cargar la lista de órdenes.</b> Revisa la conexión y vuelve a intentar.</div>
        </div>
      )}

      <section className="adm-table-card">
        <div className="adm-toolbar">
          <Segmented label="Filtrar por estado" options={STATUS_FILTERS} value={statusFilter} onChange={setFilter} />
        </div>

        <div className="adm-table-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Empresa</th>
                <th scope="col">Proyecto</th>
                <th scope="col" className="adm-col-num">Toneladas</th>
                <th scope="col" className="adm-col-num">Monto</th>
                <th scope="col">Estado</th>
                <th scope="col">Fecha</th>
                <th scope="col" className="adm-col-actions"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeletonRows columns={7} />
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Package}
                      title={statusFilter ? `No hay órdenes ${STATUS_FILTERS.find((o) => o.value === statusFilter)?.label.toLowerCase()}` : 'Aún no hay órdenes'}
                    />
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const st = STATUS[order.status] ?? { label: order.status, tone: 'neutral' as StatusTone };
                  const created = new Date(order.createdAt);
                  return (
                    <tr key={order.id}>
                      <td>
                        <span className="adm-cell-title">{order.company?.name || '—'}</span>
                        {order.company?.rut && <span className="adm-cell-sub">{order.company.rut}</span>}
                      </td>
                      <td>{order.project?.name || <span className="adm-cell-mute">—</span>}</td>
                      <td className="adm-col-num">{tons(order.tonsTco2)} t</td>
                      <td className="adm-col-num">
                        <span className="adm-cell-title">{formatCLP(order.amount)}</span>
                        <span className="adm-cell-sub">Comisión {formatCLP(order.platformFee)}</span>
                      </td>
                      <td><StatusBadge tone={st.tone}>{st.label}</StatusBadge></td>
                      <td>
                        {created.toLocaleDateString('es-CL')}
                        <span className="adm-cell-sub">{formatTime(created)}</span>
                      </td>
                      <td className="adm-col-actions">
                        {order.status === 'pending' && (
                          <div className="adm-actions-row" style={{ justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                            <button type="button" className="adm-btn adm-btn--sm" onClick={() => setActionModal({ type: 'reject', order })}>
                              <X aria-hidden="true" /> Rechazar
                            </button>
                            <button type="button" className="adm-btn adm-btn--sm adm-btn--primary" onClick={() => setActionModal({ type: 'approve', order })}>
                              <Check aria-hidden="true" /> Aprobar
                            </button>
                          </div>
                        )}
                        {order.status === 'approved' && (
                          <div className="adm-actions-row" style={{ justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                            {order.invoicePdfUrl && (
                              <a href={order.invoicePdfUrl} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn--sm">
                                <FileText aria-hidden="true" /> Factura
                              </a>
                            )}
                            <label className={`adm-btn adm-btn--sm${uploadingInvoiceId === order.id ? ' is-busy' : ''}`}>
                              <Upload aria-hidden="true" />
                              {uploadingInvoiceId === order.id ? 'Subiendo…' : order.invoicePdfUrl ? 'Reemplazar' : 'Subir factura'}
                              <input
                                type="file"
                                accept="application/pdf,.pdf"
                                className="sr-only"
                                disabled={uploadingInvoiceId === order.id}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleInvoiceUpload(order.id, file);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && total > 0 && (
          <Pagination page={page} totalPages={totalPages} total={total} shown={orders.length} noun="órdenes" onPage={goToPage} />
        )}
      </section>

      <Modal
        open={!!actionModal}
        title={approving ? 'Aprobar orden' : 'Rechazar orden'}
        onClose={closeModal}
        busy={isSubmitting}
        footer={
          <>
            <button type="button" className="adm-btn" onClick={closeModal} disabled={isSubmitting}>Cancelar</button>
            <button
              type="button"
              className={`adm-btn ${approving ? 'adm-btn--primary' : 'adm-btn--danger'}`}
              onClick={submitAction}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando…' : approving ? 'Aprobar y emitir certificado' : 'Rechazar orden'}
            </button>
          </>
        }
      >
        {actionModal && (
          <>
            <p>
              {approving
                ? 'Confirma que la transferencia llegó. Se descontará el stock del proyecto y se emitirá el certificado.'
                : 'La orden quedará rechazada y no se emitirá certificado.'}
            </p>
            <dl className="adm-dl">
              <dt>Empresa</dt>
              <dd>{actionModal.order.company?.name || '—'}</dd>
              <dt>Proyecto</dt>
              <dd>{actionModal.order.project?.name || '—'}</dd>
              <dt>Toneladas</dt>
              <dd>{tons(actionModal.order.tonsTco2)} t CO₂e</dd>
              <dt>Monto</dt>
              <dd>{formatCLP(actionModal.order.amount)}</dd>
            </dl>
            {!approving && (
              <div className="adm-field">
                <label className="adm-field__label" htmlFor="ob-reason">Motivo <span className="adm-cell-mute">(opcional)</span></label>
                <textarea
                  id="ob-reason"
                  className="adm-textarea"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Transferencia no recibida, monto incorrecto…"
                />
              </div>
            )}
            {actionError && (
              <div role="alert" className="adm-alert adm-alert--danger">
                <AlertTriangle aria-hidden="true" />
                <div>{actionError}</div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
