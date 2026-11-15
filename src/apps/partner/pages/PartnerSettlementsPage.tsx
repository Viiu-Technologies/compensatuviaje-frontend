// ============================================
// PARTNER SETTLEMENTS PAGE ("Mis pagos" - CTV-20)
// Historial de liquidaciones del partner, montos pendientes y comprobantes.
// ============================================

import React, { useEffect, useState } from 'react';
import { Banknote, CheckCircle2, Clock, RefreshCw, Wallet } from 'lucide-react';
import {
  getPartnerSettlements,
  type PartnerSettlementsData,
} from '../services/partnerApi';
import {
  Badge,
  btn,
  Card,
  CardHeader,
  cx,
  EmptyState,
  ErrorState,
  fmtCLP,
  fmtDate,
  fmtInt,
  PageHeader,
  Skeleton,
  StatCard,
} from '../ui';

type StatusFilter = 'all' | 'pending' | 'paid';

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Por cobrar' },
  { value: 'paid', label: 'Pagadas' },
];

const formatPeriodMonth = (ym: string) => {
  const parts = ym.split('-').map(Number);
  if (parts.length !== 2 || !parts[0] || !parts[1]) return ym;
  const label = new Date(Date.UTC(parts[0], parts[1] - 1, 1)).toLocaleDateString('es-CL', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const PartnerSettlementsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [data, setData] = useState<PartnerSettlementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadSettlements = async (filter: StatusFilter) => {
    setLoading(true);
    setError(false);
    try {
      const result = await getPartnerSettlements(
        filter === 'all' ? undefined : { status: filter },
      );
      setData(result);
    } catch (err) {
      console.error('Error loading partner settlements:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettlements(statusFilter);
  }, [statusFilter]);

  const settlements = data?.settlements ?? [];
  const summary = data?.summary ?? {
    totalPaid: 0,
    totalPending: 0,
    unsettledAmount: 0,
    totalAccrued: 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis pagos"
        subtitle="Liquidaciones generadas por tus proyectos, montos por cobrar y comprobantes de transferencia."
        actions={
          <button
            type="button"
            className={cx(btn.secondary, btn.sm)}
            onClick={() => loadSettlements(statusFilter)}
            disabled={loading}
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Actualizar
          </button>
        }
      />

      {loading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[118px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Pagado / Transferido"
            icon={CheckCircle2}
            value={fmtCLP(summary.totalPaid)}
            tone="good"
            hint="Liquidaciones ya transferidas a tu cuenta"
          />
          <StatCard
            label="En liquidación por cobrar"
            icon={Clock}
            value={fmtCLP(summary.totalPending)}
            tone={summary.totalPending > 0 ? 'warning' : 'default'}
            hint="Liquidaciones emitidas pendientes de pago"
          />
          <StatCard
            label="Ventas aún sin liquidar"
            icon={Wallet}
            value={fmtCLP(summary.unsettledAmount)}
            hint="Compensaciones aprobadas en el período actual"
          />
        </div>
      )}

      {error ? (
        <ErrorState onRetry={() => loadSettlements(statusFilter)} />
      ) : (
        <Card className="p-0">
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
            <CardHeader
              title="Historial de liquidaciones"
              subtitle="Cada liquidación agrupa las ventas B2C y B2B aprobadas del período."
              icon={Banknote}
              className="mb-0"
            />
            <div className="flex items-center gap-1.5" role="group" aria-label="Filtrar por estado">
              {STATUS_FILTERS.map((f) => {
                const active = statusFilter === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setStatusFilter(f.value)}
                    aria-pressed={active}
                    className={cx(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors',
                      active
                        ? 'bg-brand-900 border-brand-900 text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : settlements.length === 0 ? (
            <EmptyState
              icon={Banknote}
              title={
                statusFilter === 'all'
                  ? 'Aún no tienes liquidaciones registradas'
                  : 'No hay liquidaciones en este estado'
              }
              text={
                statusFilter === 'all'
                  ? 'Cuando el equipo genere el cierre del período verás aquí cada liquidación y su comprobante.'
                  : 'Prueba cambiando el filtro para revisar otras liquidaciones.'
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50/70">
                    <th className="py-3 px-6">Liquidación</th>
                    <th className="py-3 px-4">Período</th>
                    <th className="py-3 px-4 text-right">Ventas</th>
                    <th className="py-3 px-4 text-right">Total cobrado</th>
                    <th className="py-3 px-4 text-right">Comisión</th>
                    <th className="py-3 px-4 text-right">Monto a recibir</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-6">Comprobante / Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {settlements.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                        {s.code}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 whitespace-nowrap">
                        {formatPeriodMonth(s.periodMonth)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-gray-700 tabular-nums">
                        {fmtInt(s.salesCount)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-gray-700 tabular-nums whitespace-nowrap">
                        {fmtCLP(s.totalAmountCollected)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-gray-500 tabular-nums whitespace-nowrap">
                        {fmtCLP(s.platformFee)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900 tabular-nums whitespace-nowrap">
                        {fmtCLP(s.partnerAmountOwed)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {s.status === 'paid' ? (
                          <Badge tone="success">Pagada</Badge>
                        ) : (
                          <Badge tone="warning">Pendiente de pago</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-xs text-gray-600 whitespace-nowrap">
                        {s.status === 'paid' ? (
                          <div>
                            <div className="font-semibold text-gray-900">
                              {s.paymentReference || 'Transferencia registrada'}
                            </div>
                            <div className="text-gray-500">{fmtDate(s.paidAt)}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">En proceso de transferencia</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default PartnerSettlementsPage;
