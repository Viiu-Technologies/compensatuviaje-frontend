import { useEffect, useState } from 'react';
import { AlertTriangle, Banknote, Check, RefreshCw, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import {
  generateSettlements,
  getFund,
  getSettlements,
  paySettlement,
  settlementCode,
  type FundReport,
  type PartnerSettlement,
} from '../services/adminFinanceApi';
import {
  EmptyState, KpiCard, Modal, PageHeader, Panel, Skeleton, StatusBadge, TableSkeletonRows,
  formatCLP, formatInt,
} from '../ui';

/**
 * Fondo de la plataforma (CTV-41): cuánto hay y a quién se le debe.
 *
 * El fondo es contable: refleja lo que debería haber en la cuenta bancaria.
 * Entra el total cobrado (B2C + B2B), sale por liquidaciones pagadas a
 * partners y reembolsos. Desde aquí también se generan y pagan liquidaciones.
 */

const currentMonth = () => new Date().toISOString().slice(0, 7);
const today = () => new Date().toISOString().slice(0, 10);

const formatMonth = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  const label = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('es-CL', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export default function FinanzasPage() {
  const [fund, setFund] = useState<FundReport | null>(null);
  const [settlements, setSettlements] = useState<PartnerSettlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [month, setMonth] = useState(currentMonth());
  const [isGenerating, setIsGenerating] = useState(false);

  const [payTarget, setPayTarget] = useState<PartnerSettlement | null>(null);
  const [payReference, setPayReference] = useState('');
  const [payDate, setPayDate] = useState(today());
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const [fundData, settlementData] = await Promise.all([getFund(), getSettlements()]);
      setFund(fundData);
      setSettlements(settlementData);
      setLoadError(false);
    } catch (err) {
      console.error('Error loading finance:', err);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      toast.error('Elige un mes válido');
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateSettlements(month);
      if (result.settlements.length === 0) {
        toast.info(result.message || 'No hay ventas nuevas para liquidar en este mes');
      } else {
        const parts = [];
        if (result.created > 0) parts.push(`${result.created} nueva(s)`);
        if (result.updated > 0) parts.push(`${result.updated} pendiente(s) actualizada(s)`);
        toast.success(`Liquidaciones de ${formatMonth(month)}: ${parts.join(' y ')}`);
      }
      if (result.skippedLegacy > 0) {
        toast.warning(`${result.skippedLegacy} venta(s) antigua(s) sin desglose no se pudieron liquidar.`);
      }
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudieron generar las liquidaciones'));
    } finally {
      setIsGenerating(false);
    }
  };

  const openPay = (s: PartnerSettlement) => {
    setPayTarget(s);
    setPayReference('');
    setPayDate(today());
    setPayError(null);
  };

  const closePay = () => setPayTarget(null);

  const submitPay = async () => {
    if (!payTarget) return;
    if (!payReference.trim()) {
      setPayError('Ingresa el número de la transferencia');
      return;
    }
    setIsPaying(true);
    setPayError(null);
    try {
      await paySettlement(payTarget.id, { payment_reference: payReference.trim(), payment_date: payDate || undefined });
      toast.success(`Liquidación de ${payTarget.partner?.name || 'partner'} marcada como pagada`);
      closePay();
      await load();
    } catch (err: any) {
      setPayError(err?.response?.data?.message || 'No se pudo registrar el pago');
    } finally {
      setIsPaying(false);
    }
  };

  const pendingCount = settlements.filter((s) => s.status === 'pending').length;

  return (
    <div className="adm-page">
      <PageHeader
        title="Fondo y liquidaciones"
        description="Cuánto hay en el fondo de la plataforma, a quién se le debe y los pagos a partners."
        actions={
          <button type="button" className="adm-btn" onClick={load} disabled={isLoading}>
            <RefreshCw aria-hidden="true" /> Actualizar
          </button>
        }
      />

      {loadError && (
        <div role="alert" className="adm-alert adm-alert--danger">
          <AlertTriangle aria-hidden="true" />
          <div><b>No se pudo cargar el fondo.</b> Revisa la conexión y vuelve a intentar.</div>
        </div>
      )}

      {isLoading && !fund ? (
        <div className="adm-kpis">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={112} />)}
        </div>
      ) : fund && (
        <>
          <div className="adm-kpis">
            <KpiCard
              label="Saldo en el fondo"
              value={formatCLP(fund.balance)}
              context="Lo que debería haber hoy en la cuenta"
              foot={`Cobrado ${formatCLP(fund.collected.total)}`}
            />
            <KpiCard
              label="Se debe a partners"
              value={formatCLP(fund.owedToPartners.total)}
              context={`${formatCLP(fund.owedToPartners.pendingSettlements)} en liquidaciones por pagar`}
              foot={`${formatCLP(fund.owedToPartners.unsettled)} aún sin liquidar`}
            />
            <KpiCard
              label="Comisión de la plataforma"
              value={formatCLP(fund.platformFees)}
              context="Parte del fondo que es de la plataforma"
            />
            <KpiCard
              label="Pagado a partners"
              value={formatCLP(fund.paidToPartners)}
              context={fund.refunded > 0 ? `Reembolsos ${formatCLP(fund.refunded)}` : 'Liquidaciones ya transferidas'}
              foot={`B2C ${formatCLP(fund.collected.b2c)} · B2B ${formatCLP(fund.collected.b2b)}`}
            />
          </div>

          {(fund.warnings.legacyB2cWithoutSnapshot > 0 || fund.warnings.refundsNotAllocated || fund.unassignedPayout > 0) && (
            <div role="status" className="adm-alert adm-alert--warning">
              <AlertTriangle aria-hidden="true" />
              <div>
                {fund.warnings.legacyB2cWithoutSnapshot > 0 && (
                  <p>{formatInt(fund.warnings.legacyB2cWithoutSnapshot)} venta(s) B2C antiguas no tienen desglose partner/comisión y no se cuentan.</p>
                )}
                {fund.warnings.refundsNotAllocated && (
                  <p>Los reembolsos se descuentan del saldo, pero no de la deuda de un partner ni de la comisión.</p>
                )}
                {fund.unassignedPayout > 0 && (
                  <p>{formatCLP(fund.unassignedPayout)} corresponden a ventas sin proyecto asignado: no son deuda de ningún partner.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <Panel title="Deuda por partner" description="Lo que le corresponde a cada partner según el costo congelado al momento de cada venta." flush>
        <div className="adm-table-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Partner</th>
                <th scope="col" className="adm-col-num">Ventas</th>
                <th scope="col" className="adm-col-num">Sin liquidar</th>
                <th scope="col" className="adm-col-num">Por pagar</th>
                <th scope="col" className="adm-col-num">Pagado</th>
                <th scope="col" className="adm-col-num">Se le debe</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !fund ? (
                <TableSkeletonRows columns={6} rows={3} />
              ) : !fund || fund.partners.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={Wallet} title="Aún no hay ventas" text="Cuando se pague una compensación aparecerá aquí lo que corresponde a cada partner." /></td></tr>
              ) : (
                fund.partners.map((p) => (
                  <tr key={p.partnerId}>
                    <td>
                      <span className="adm-cell-title">{p.name || 'Partner sin nombre'}</span>
                      {p.rut && <span className="adm-cell-sub">{p.rut}</span>}
                    </td>
                    <td className="adm-col-num">{formatInt(p.sales)}</td>
                    <td className="adm-col-num">{formatCLP(p.unsettled)}</td>
                    <td className="adm-col-num">{formatCLP(p.pendingSettlements)}</td>
                    <td className="adm-col-num">{formatCLP(p.paid)}</td>
                    <td className="adm-col-num"><span className="adm-cell-title">{formatCLP(p.owed)}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="Liquidaciones"
        description="Agrupa por partner las ventas del mes aún no liquidadas. Si la del mes sigue por pagar, las ventas nuevas se suman a ella; si ya se pagó, se abre la siguiente (#2, #3…)."
        aside={pendingCount > 0 ? <StatusBadge tone="warning">{pendingCount} por pagar</StatusBadge> : undefined}
        flush
      >
        <div className="adm-toolbar">
          <div className="adm-actions-row">
            <label className="sr-only" htmlFor="fin-month">Mes a liquidar</label>
            <input
              id="fin-month"
              type="month"
              className="adm-input adm-input--date"
              value={month}
              max={currentMonth()}
              onChange={(e) => setMonth(e.target.value)}
            />
            <button type="button" className="adm-btn adm-btn--primary" onClick={handleGenerate} disabled={isGenerating || !month}>
              <Banknote aria-hidden="true" /> {isGenerating ? 'Generando…' : 'Generar liquidaciones'}
            </button>
          </div>
        </div>

        <div className="adm-table-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Liquidación</th>
                <th scope="col">Partner</th>
                <th scope="col" className="adm-col-num">Cobrado</th>
                <th scope="col" className="adm-col-num">Comisión</th>
                <th scope="col" className="adm-col-num">A pagar</th>
                <th scope="col">Estado</th>
                <th scope="col" className="adm-col-actions"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && settlements.length === 0 ? (
                <TableSkeletonRows columns={7} rows={3} />
              ) : settlements.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={Banknote} title="Aún no hay liquidaciones" text="Elige un mes y genera las liquidaciones." /></td></tr>
              ) : (
                settlements.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span className="adm-cell-title">{settlementCode(s)}</span>
                      <span className="adm-cell-sub">{formatMonth(s.periodMonth)}</span>
                    </td>
                    <td>
                      <span className="adm-cell-title">{s.partner?.name || '—'}</span>
                      {s.partner?.rut && <span className="adm-cell-sub">{s.partner.rut}</span>}
                    </td>
                    <td className="adm-col-num">{formatCLP(s.totalAmountCollected)}</td>
                    <td className="adm-col-num">{formatCLP(s.platformFee)}</td>
                    <td className="adm-col-num"><span className="adm-cell-title">{formatCLP(s.partnerAmountOwed)}</span></td>
                    <td>
                      {s.status === 'paid' ? (
                        <>
                          <StatusBadge tone="success">Pagada</StatusBadge>
                          <span className="adm-cell-sub">
                            {s.paidAt && new Date(s.paidAt).toLocaleDateString('es-CL')}
                            {s.paymentReference && ` · ${s.paymentReference}`}
                          </span>
                        </>
                      ) : (
                        <StatusBadge tone="warning">Por pagar</StatusBadge>
                      )}
                    </td>
                    <td className="adm-col-actions">
                      {s.status === 'pending' && (
                        <button type="button" className="adm-btn adm-btn--sm adm-btn--primary" onClick={() => openPay(s)}>
                          <Check aria-hidden="true" /> Registrar pago
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal
        open={!!payTarget}
        title="Registrar pago a partner"
        onClose={closePay}
        busy={isPaying}
        footer={
          <>
            <button type="button" className="adm-btn" onClick={closePay} disabled={isPaying}>Cancelar</button>
            <button type="button" className="adm-btn adm-btn--primary" onClick={submitPay} disabled={isPaying}>
              {isPaying ? 'Guardando…' : 'Marcar como pagada'}
            </button>
          </>
        }
      >
        {payTarget && (
          <>
            <p>Registra la transferencia ya hecha al partner. El comprobante permite cuadrar el fondo con la cartola.</p>
            <dl className="adm-dl">
              <dt>Partner</dt>
              <dd>{payTarget.partner?.name || '—'}</dd>
              <dt>Liquidación</dt>
              <dd>{settlementCode(payTarget)} · {formatMonth(payTarget.periodMonth)}</dd>
              <dt>Monto a transferir</dt>
              <dd><b>{formatCLP(payTarget.partnerAmountOwed)}</b></dd>
            </dl>
            <div className="adm-field">
              <label className="adm-field__label" htmlFor="fin-ref">N° de transferencia</label>
              <input
                id="fin-ref"
                className="adm-input"
                maxLength={100}
                value={payReference}
                onChange={(e) => setPayReference(e.target.value)}
                placeholder="Ej: TRF-000123"
                aria-describedby="fin-ref-hint"
              />
              <span id="fin-ref-hint" className="adm-field__hint">
                Se guarda en mayúsculas y sin espacios. No se puede repetir en otra liquidación.
              </span>
            </div>
            <div className="adm-field">
              <label className="adm-field__label" htmlFor="fin-date">Fecha de la transferencia</label>
              <input
                id="fin-date"
                type="date"
                className="adm-input adm-input--date"
                value={payDate}
                max={today()}
                onChange={(e) => setPayDate(e.target.value)}
              />
            </div>
            {payError && (
              <div role="alert" className="adm-alert adm-alert--danger">
                <AlertTriangle aria-hidden="true" />
                <div>{payError}</div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
