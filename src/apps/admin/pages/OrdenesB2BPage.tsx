import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  TreePine,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  DollarSign,
  Filter
} from 'lucide-react';
import {
  getB2BOrders,
  approveB2BOrder,
  rejectB2BOrder,
  type B2BOrder
} from '../services/adminApi';

export default function OrdenesB2BPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<B2BOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const limit = 20;

  // Action modal state
  const [actionModal, setActionModal] = useState<{
    type: 'approve' | 'reject';
    order: B2BOrder;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionResult, setActionResult] = useState<{ success: boolean; message: string } | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit };
      if (statusFilter) params.status = statusFilter;
      const data = await getB2BOrders(params);
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const params: any = { page: page.toString() };
    if (statusFilter) params.status = statusFilter;
    setSearchParams(params, { replace: true });
  }, [page, statusFilter]);

  const totalPages = Math.ceil(total / limit);

  const handleApprove = async () => {
    if (!actionModal || actionModal.type !== 'approve') return;
    setIsSubmitting(true);
    try {
      const result = await approveB2BOrder(actionModal.order.id);
      setActionResult({ success: true, message: `Orden aprobada. Certificado: ${result.certificateNumber}` });
      loadOrders();
    } catch (err: any) {
      setActionResult({ success: false, message: err?.response?.data?.message || 'Error al aprobar' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!actionModal || actionModal.type !== 'reject') return;
    setIsSubmitting(true);
    try {
      await rejectB2BOrder(actionModal.order.id, rejectReason || undefined);
      setActionResult({ success: true, message: 'Orden rechazada' });
      loadOrders();
    } catch (err: any) {
      setActionResult({ success: false, message: err?.response?.data?.message || 'Error al rechazar' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setActionModal(null);
    setRejectReason('');
    setActionResult(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="!inline-flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !bg-yellow-100 !text-yellow-700 !text-xs !font-semibold">
            <Clock className="!w-3.5 !h-3.5" /> Pendiente
          </span>
        );
      case 'approved':
        return (
          <span className="!inline-flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !bg-green-100 !text-green-700 !text-xs !font-semibold">
            <CheckCircle2 className="!w-3.5 !h-3.5" /> Aprobada
          </span>
        );
      case 'rejected':
        return (
          <span className="!inline-flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !bg-red-100 !text-red-700 !text-xs !font-semibold">
            <XCircle className="!w-3.5 !h-3.5" /> Rechazada
          </span>
        );
      default:
        return <span className="!px-3 !py-1 !rounded-full !bg-gray-100 !text-gray-700 !text-xs !font-semibold">{status}</span>;
    }
  };

  // Stats
  const stats = {
    total,
    pending: orders.filter(o => o.status === 'pending').length,
    approved: orders.filter(o => o.status === 'approved').length,
    totalCLP: orders.reduce((acc, o) => acc + o.amount, 0)
  };

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div className="!flex !flex-col lg:!flex-row !items-start lg:!items-center !justify-between !gap-4">
        <div>
          <h1 className="!text-2xl !font-bold !text-slate-900 !flex !items-center !gap-2">
            <Package className="!text-indigo-600" />
            Órdenes B2B
          </h1>
          <p className="!text-sm !text-slate-500 !mt-1">Gestión de órdenes de compensación por transferencia bancaria</p>
        </div>
        <button
          onClick={loadOrders}
          className="!flex !items-center !gap-2 !px-4 !py-2.5 !rounded-xl !bg-white !text-slate-700 !border !border-slate-200 !font-medium !text-sm hover:!bg-slate-50 !transition-all"
        >
          <RefreshCw className="!w-4 !h-4" /> Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="!grid sm:!grid-cols-4 !gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Package, color: '!from-blue-500 !to-indigo-600' },
          { label: 'Pendientes', value: stats.pending, icon: Clock, color: '!from-yellow-500 !to-orange-500' },
          { label: 'Aprobadas', value: stats.approved, icon: CheckCircle2, color: '!from-green-500 !to-emerald-600' },
          { label: 'Monto Total', value: `$${stats.totalCLP.toLocaleString('es-CL')}`, icon: DollarSign, color: '!from-purple-500 !to-pink-500' },
        ].map((stat) => (
          <div key={stat.label} className="!rounded-2xl !p-4 !bg-white !border !border-slate-200 !shadow-sm">
            <div className="!flex !items-center !gap-3">
              <div className={`!w-10 !h-10 !rounded-xl !bg-gradient-to-br ${stat.color} !flex !items-center !justify-center`}>
                <stat.icon className="!w-5 !h-5 !text-white" />
              </div>
              <div>
                <p className="!text-xl !font-bold !text-slate-900">{stat.value}</p>
                <p className="!text-xs !text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="!flex !items-center !gap-3 !flex-wrap">
        <div className="!flex !items-center !gap-1.5 !text-sm !text-slate-500">
          <Filter className="!w-4 !h-4" /> Estado:
        </div>
        {[
          { value: '', label: 'Todos' },
          { value: 'pending', label: 'Pendientes' },
          { value: 'approved', label: 'Aprobadas' },
          { value: 'rejected', label: 'Rechazadas' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => { setStatusFilter(opt.value); setPage(1); }}
            className={`!px-4 !py-2 !rounded-xl !text-sm !font-medium !border-0 !transition-all ${
              statusFilter === opt.value
                ? '!bg-indigo-500 !text-white !shadow-lg !shadow-indigo-500/30'
                : '!bg-white !text-slate-600 !border !border-slate-200 hover:!bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="!bg-white !rounded-2xl !border !border-slate-200 !shadow-sm !overflow-hidden">
        {isLoading ? (
          <div className="!flex !items-center !justify-center !py-20">
            <Loader2 className="!w-8 !h-8 !text-indigo-500 !animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="!text-center !py-16">
            <Package className="!w-12 !h-12 !text-slate-300 !mx-auto !mb-3" />
            <p className="!text-slate-500">No hay órdenes {statusFilter ? `con estado "${statusFilter}"` : ''}</p>
          </div>
        ) : (
          <div className="!overflow-x-auto">
            <table className="!w-full">
              <thead>
                <tr className="!border-b !border-slate-200 !bg-slate-50/50">
                  <th className="!text-left !px-6 !py-3.5 !text-xs !font-semibold !text-slate-500 !uppercase !tracking-wider">Empresa</th>
                  <th className="!text-left !px-6 !py-3.5 !text-xs !font-semibold !text-slate-500 !uppercase !tracking-wider">Proyecto</th>
                  <th className="!text-right !px-6 !py-3.5 !text-xs !font-semibold !text-slate-500 !uppercase !tracking-wider">Tons CO₂</th>
                  <th className="!text-right !px-6 !py-3.5 !text-xs !font-semibold !text-slate-500 !uppercase !tracking-wider">Monto CLP</th>
                  <th className="!text-center !px-6 !py-3.5 !text-xs !font-semibold !text-slate-500 !uppercase !tracking-wider">Estado</th>
                  <th className="!text-left !px-6 !py-3.5 !text-xs !font-semibold !text-slate-500 !uppercase !tracking-wider">Fecha</th>
                  <th className="!text-center !px-6 !py-3.5 !text-xs !font-semibold !text-slate-500 !uppercase !tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="!border-b !border-slate-100 hover:!bg-slate-50/50 !transition-colors">
                    <td className="!px-6 !py-4">
                      <div className="!flex !items-center !gap-2">
                        <Building2 className="!w-4 !h-4 !text-slate-400" />
                        <div>
                          <p className="!text-sm !font-medium !text-slate-900">{order.company?.name || 'N/A'}</p>
                          <p className="!text-xs !text-slate-400">{order.company?.rut || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="!px-6 !py-4">
                      <div className="!flex !items-center !gap-2">
                        <TreePine className="!w-4 !h-4 !text-green-500" />
                        <p className="!text-sm !text-slate-700">{order.project?.name || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="!px-6 !py-4 !text-right">
                      <p className="!text-sm !font-semibold !text-slate-900">{order.tonsTco2}</p>
                    </td>
                    <td className="!px-6 !py-4 !text-right">
                      <p className="!text-sm !font-semibold !text-slate-900">${order.amount.toLocaleString('es-CL')}</p>
                      <p className="!text-xs !text-slate-400">Fee: ${order.platformFee.toLocaleString('es-CL')}</p>
                    </td>
                    <td className="!px-6 !py-4 !text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="!px-6 !py-4">
                      <p className="!text-sm !text-slate-600">{new Date(order.createdAt).toLocaleDateString('es-CL')}</p>
                      <p className="!text-xs !text-slate-400">{new Date(order.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="!px-6 !py-4 !text-center">
                      {order.status === 'pending' ? (
                        <div className="!flex !items-center !justify-center !gap-2">
                          <button
                            onClick={() => setActionModal({ type: 'approve', order })}
                            className="!px-3 !py-1.5 !rounded-lg !bg-green-50 !text-green-700 !text-xs !font-semibold !border !border-green-200 hover:!bg-green-100 !transition-colors"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => setActionModal({ type: 'reject', order })}
                            className="!px-3 !py-1.5 !rounded-lg !bg-red-50 !text-red-700 !text-xs !font-semibold !border !border-red-200 hover:!bg-red-100 !transition-colors"
                          >
                            Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className="!text-xs !text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="!flex !items-center !justify-between !px-6 !py-4 !border-t !border-slate-200">
            <p className="!text-sm !text-slate-500">
              Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total}
            </p>
            <div className="!flex !items-center !gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="!p-2 !rounded-lg !border !border-slate-200 !text-slate-600 hover:!bg-slate-50 disabled:!opacity-50 disabled:!cursor-not-allowed"
              >
                <ChevronLeft className="!w-4 !h-4" />
              </button>
              <span className="!text-sm !text-slate-700 !font-medium">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="!p-2 !rounded-lg !border !border-slate-200 !text-slate-600 hover:!bg-slate-50 disabled:!opacity-50 disabled:!cursor-not-allowed"
              >
                <ChevronRight className="!w-4 !h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="!fixed !inset-0 !z-[100] !flex !items-center !justify-center !p-4">
          <div className="!absolute !inset-0 !bg-black/50 !backdrop-blur-sm" onClick={closeModal} />
          <div className="!relative !bg-white !rounded-2xl !shadow-2xl !w-full !max-w-md !p-6 !space-y-5">
            {actionResult ? (
              <>
                <div className="!text-center">
                  {actionResult.success ? (
                    <CheckCircle2 className="!w-12 !h-12 !text-green-500 !mx-auto !mb-3" />
                  ) : (
                    <AlertTriangle className="!w-12 !h-12 !text-red-500 !mx-auto !mb-3" />
                  )}
                  <p className={`!text-lg !font-semibold ${actionResult.success ? '!text-green-700' : '!text-red-700'}`}>
                    {actionResult.message}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="!w-full !py-3 !rounded-xl !bg-slate-100 !text-slate-700 !font-medium !border-0 hover:!bg-slate-200 !transition-all"
                >
                  Cerrar
                </button>
              </>
            ) : (
              <>
                <div>
                  <h3 className="!text-lg !font-bold !text-slate-900">
                    {actionModal.type === 'approve' ? 'Aprobar Orden' : 'Rechazar Orden'}
                  </h3>
                  <p className="!text-sm !text-slate-500 !mt-1">
                    {actionModal.type === 'approve'
                      ? 'Se deducirá stock y se emitirá un certificado automáticamente.'
                      : 'La orden será marcada como rechazada.'}
                  </p>
                </div>

                {/* Order summary */}
                <div className="!bg-slate-50 !rounded-xl !p-4 !space-y-2 !text-sm">
                  <div className="!flex !justify-between">
                    <span className="!text-slate-500">Empresa</span>
                    <span className="!font-medium !text-slate-700">{actionModal.order.company?.name}</span>
                  </div>
                  <div className="!flex !justify-between">
                    <span className="!text-slate-500">Proyecto</span>
                    <span className="!font-medium !text-slate-700">{actionModal.order.project?.name}</span>
                  </div>
                  <div className="!flex !justify-between">
                    <span className="!text-slate-500">Toneladas</span>
                    <span className="!font-medium !text-slate-700">{actionModal.order.tonsTco2} tCO₂</span>
                  </div>
                  <div className="!flex !justify-between !border-t !border-slate-200 !pt-2">
                    <span className="!text-slate-500 !font-semibold">Monto</span>
                    <span className="!font-bold !text-slate-900">${actionModal.order.amount.toLocaleString('es-CL')} CLP</span>
                  </div>
                </div>

                {actionModal.type === 'reject' && (
                  <div>
                    <label className="!block !text-sm !font-medium !text-slate-700 !mb-2">
                      Motivo de rechazo (opcional)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Transferencia no verificada, monto incorrecto, etc."
                      rows={3}
                      className="!w-full !px-4 !py-3 !rounded-xl !border !border-slate-200 !text-sm !outline-none focus:!ring-2 focus:!ring-indigo-500 !resize-none"
                    />
                  </div>
                )}

                <div className="!flex !gap-3">
                  <button
                    onClick={closeModal}
                    className="!flex-1 !py-3 !rounded-xl !bg-slate-100 !text-slate-700 !font-medium !border-0 hover:!bg-slate-200 !transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={actionModal.type === 'approve' ? handleApprove : handleReject}
                    disabled={isSubmitting}
                    className={`!flex-1 !py-3 !rounded-xl !text-white !font-medium !border-0 !transition-all !flex !items-center !justify-center !gap-2 ${
                      actionModal.type === 'approve'
                        ? '!bg-green-600 hover:!bg-green-700'
                        : '!bg-red-600 hover:!bg-red-700'
                    } disabled:!opacity-50`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="!w-4 !h-4 !animate-spin" />
                    ) : actionModal.type === 'approve' ? (
                      <><CheckCircle2 className="!w-4 !h-4" /> Aprobar</>
                    ) : (
                      <><XCircle className="!w-4 !h-4" /> Rechazar</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
