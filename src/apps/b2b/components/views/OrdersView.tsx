import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronDown, Copy, Download, Package, RefreshCw } from 'lucide-react';
import { getBankDetails, getMyOrders, type B2BOrder, type BankDetails } from '../../services/ordersService';
import {
  Badge,
  btn,
  Card,
  cx,
  EmptyState,
  ErrorState,
  Field,
  fmtCLP,
  fmtDate,
  fmtInt,
  fmtTons,
  PageHeader,
  Skeleton,
  StatCard,
  type Tone,
} from '../../ui';

const STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'Esperando transferencia', tone: 'warning' },
  approved: { label: 'Aprobada', tone: 'success' },
  rejected: { label: 'Rechazada', tone: 'danger' },
  expired: { label: 'Expirada', tone: 'neutral' },
};

const OrdersView: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const [orders, setOrders] = useState<B2BOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setFailed(false);
    try {
      const data = await getMyOrders();
      setOrders(data.orders);
      // Las órdenes pendientes se abren solas: ahí están los datos para transferir.
      setOpenId((prev) => prev ?? data.orders.find((o) => o.status === 'pending')?.id ?? null);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    getBankDetails().then(setBankDetails).catch(() => setBankDetails(null));
  }, []);

  const copy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedId(key);
      setTimeout(() => setCopiedId((c) => (c === key ? null : c)), 2000);
    });
  };

  const approved = orders.filter((o) => o.status === 'approved');
  const pending = orders.filter((o) => o.status === 'pending');
  const tons = approved.reduce((acc, o) => acc + (Number(o.tonsTco2) || 0), 0);
  const invested = approved.reduce((acc, o) => acc + (Number(o.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Órdenes"
        subtitle="Tus compras de compensación pagadas por transferencia."
        actions={
          <button type="button" onClick={loadOrders} disabled={loading} className={btn.secondary}>
            <RefreshCw className={cx('w-4 h-4', loading && 'animate-spin')} aria-hidden="true" />
            Actualizar
          </button>
        }
      />

      {loading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[118px]" />
            ))}
          </div>
          <Skeleton className="h-48" />
        </>
      ) : failed ? (
        <ErrorState title="No pudimos cargar tus órdenes" onRetry={loadOrders} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Órdenes" icon={Package} value={fmtInt(orders.length)} />
            <StatCard label="Esperando transferencia" value={fmtInt(pending.length)} tone={pending.length ? 'warning' : 'default'} />
            <StatCard label="Compensado" value={fmtTons(tons)} tone="good" hint={`${fmtInt(approved.length)} ${approved.length === 1 ? 'orden aprobada' : 'órdenes aprobadas'}`} />
            <StatCard label="Invertido" value={fmtCLP(invested)} hint="En órdenes aprobadas" />
          </div>

          {orders.length === 0 ? (
            <Card>
              <EmptyState
                icon={Package}
                title="Aún no tienes órdenes"
                text="Elige un proyecto para compensar la huella de tu empresa."
                action={
                  onNavigate ? (
                    <button type="button" className={btn.primary} onClick={() => onNavigate('proyectos')}>
                      Ver proyectos
                    </button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <ul className="m-0 p-0 list-none space-y-3">
              {orders.map((order) => {
                const st = STATUS[order.status] ?? { label: order.status, tone: 'neutral' as Tone };
                const open = openId === order.id;
                const reference = `Orden ${order.id.slice(0, 8)}`;
                return (
                  <li key={order.id}>
                    <Card className="p-0" as="article">
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : order.id)}
                        aria-expanded={open}
                        className="w-full flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-0 bg-transparent text-left cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="m-0 text-sm font-semibold text-gray-900 truncate">{order.project?.name || 'Proyecto'}</p>
                          <p className="m-0 mt-0.5 text-xs text-gray-500">
                            {fmtTons(order.tonsTco2)} · {fmtDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-base font-semibold text-gray-900 tabular-nums">{fmtCLP(order.amount)}</span>
                          <Badge tone={st.tone}>{st.label}</Badge>
                          <ChevronDown className={cx('w-4 h-4 text-gray-400 transition-transform', open && 'rotate-180')} aria-hidden="true" />
                        </div>
                      </button>

                      {open && (
                        <div className="px-5 pb-5 pt-4 border-t border-gray-100 space-y-4">
                          <dl className="m-0 grid gap-x-6 gap-y-4 sm:grid-cols-3">
                            <Field label="N.º de orden">
                              <span className="inline-flex items-center gap-1.5 tabular-nums">
                                {order.id.slice(0, 12)}…
                                <button
                                  type="button"
                                  onClick={() => copy(order.id, order.id)}
                                  aria-label="Copiar número de orden"
                                  className="border-0 bg-transparent p-0.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                                >
                                  {copiedId === order.id ? <CheckCircle2 className="w-3.5 h-3.5 text-brand-700" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                                </button>
                              </span>
                            </Field>
                            <Field label="Proyecto">
                              {order.project?.name}
                              {order.project?.country && <span className="text-gray-500"> · {[order.project.region, order.project.country].filter(Boolean).join(', ')}</span>}
                            </Field>
                            <Field label="Fecha">{fmtDate(order.createdAt, 'long')}</Field>
                          </dl>

                          {order.status === 'pending' && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                              <p className="m-0 text-sm font-semibold text-amber-900">Transfiere para completar la compra</p>
                              {bankDetails ? (
                                <>
                                  <dl className="m-0 mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2 text-sm">
                                    {[
                                      ['Banco', bankDetails.bankName],
                                      ['Tipo de cuenta', bankDetails.accountType],
                                      ['N.º de cuenta', bankDetails.accountNumber],
                                      ['Titular', bankDetails.accountHolder],
                                      ['RUT', bankDetails.rut],
                                      ['Email', bankDetails.email],
                                    ]
                                      .filter(([, v]) => v)
                                      .map(([l, v]) => (
                                        <div key={l} className="flex justify-between gap-3">
                                          <dt className="text-amber-800">{l}</dt>
                                          <dd className="m-0 font-medium text-amber-950 text-right break-all">{v}</dd>
                                        </div>
                                      ))}
                                  </dl>
                                  <div className="mt-3 pt-3 border-t border-amber-200 flex flex-wrap items-center justify-between gap-2 text-sm text-amber-900">
                                    <span>
                                      Monto: <strong className="tabular-nums">{fmtCLP(order.amount)}</strong> · Referencia: <strong>{reference}</strong>
                                    </span>
                                    <button type="button" onClick={() => copy(`ref-${order.id}`, reference)} className={cx(btn.secondary, btn.sm)}>
                                      {copiedId === `ref-${order.id}` ? 'Copiada' : 'Copiar referencia'}
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <p className="m-0 mt-1 text-sm text-amber-800">No pudimos cargar los datos bancarios. Actualiza la página o escríbenos.</p>
                              )}
                            </div>
                          )}

                          {order.status === 'approved' && (
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4">
                              <p className="m-0 flex items-center gap-2 text-sm font-medium text-brand-800">
                                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                                Transferencia verificada y certificado emitido.
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {onNavigate && (
                                  <button type="button" onClick={() => onNavigate('certificados')} className={cx(btn.secondary, btn.sm)}>
                                    Ver certificado
                                  </button>
                                )}
                                {order.invoicePdfUrl && (
                                  <a href={order.invoicePdfUrl} target="_blank" rel="noopener noreferrer" className={cx(btn.primary, btn.sm)}>
                                    <Download className="w-4 h-4" aria-hidden="true" />
                                    Descargar factura
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {order.status === 'rejected' && (
                            <p className="m-0 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                              No pudimos verificar la transferencia de esta orden. Escríbenos si ya la hiciste.
                            </p>
                          )}
                        </div>
                      )}
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersView;
