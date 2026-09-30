import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion, Inbox, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getProjectDetail, ProjectDetailData } from '../services/adminApi';
import { getAdminProjectEvidence, approveMonthlyEvidence, rejectMonthlyEvidence } from '../../partner/services/evidenceApi';
import { EVIDENCE_STATUS_LABELS, ProjectEvidence } from '../../../types/evidence.types';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import {
  EmptyState, PageHeader, Panel, Skeleton, StatusBadge, type StatusTone,
  formatCLP, formatInt, monthLabel, unitLabel, unitPlural, useAdminConfirm, DocumentList, PhotoGallery,
} from '../ui';

/**
 * Revisión mensual de evidencia y liberación del pago retenido (escrow).
 *
 * El partner declara las unidades entregadas y pide stock nuevo. El admin
 * verifica las unidades reales (eso define el pago) y habilita el stock, o
 * rechaza y retiene el pago, con la opción de pausar las ventas.
 */

interface ReviewForm {
  unitsVerified: number;
  newStockApproved: number;
  adminNotes: string;
  rejectReason: string;
  freezeStock: boolean;
}

const STATUS_TONE: Record<string, StatusTone> = { pending_approval: 'warning', approved: 'success', rejected: 'danger' };

const MonthlyEvidenceReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { confirm, dialog } = useAdminConfirm();

  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [evidenceList, setEvidenceList] = useState<ProjectEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<Record<string, ReviewForm>>({});

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, evRes] = await Promise.all([getProjectDetail(id!), getAdminProjectEvidence(id!)]);

      if (projRes) setProject(projRes);

      if (evRes?.success) {
        setEvidenceList(evRes.data.evidences);
        const initialForm: Record<string, ReviewForm> = {};
        evRes.data.evidences.forEach((ev: ProjectEvidence) => {
          initialForm[ev.id] = {
            unitsVerified: ev.unitsDelivered || 0,
            newStockApproved: ev.newStockRequested || 0,
            adminNotes: '',
            rejectReason: '',
            freezeStock: false,
          };
        });
        setReviewData(initialForm);
      }
      setError(null);
    } catch {
      setError('No se pudo cargar la evidencia del proyecto.');
    } finally {
      setLoading(false);
    }
  };

  const setField = <K extends keyof ReviewForm>(evId: string, field: K, value: ReviewForm[K]) => {
    setReviewData((prev) => ({ ...prev, [evId]: { ...prev[evId], [field]: value } }));
  };

  const handleApprove = async (ev: ProjectEvidence, payout: number | null) => {
    const data = reviewData[ev.id];
    if (!data.unitsVerified || !data.newStockApproved) {
      toast.error('Define las unidades verificadas y el nuevo stock antes de aprobar.');
      return;
    }
    const ok = await confirm({
      title: `¿Aprobar la evidencia de ${monthLabel(ev.periodMonth)}?`,
      description: `${payout !== null ? `Se liberarán ${formatCLP(payout)} del pago retenido` : 'Se liberará el pago retenido'} y se habilitarán ${formatInt(data.newStockApproved)} ${unitPlural(project?.impact_unit ?? undefined, data.newStockApproved)} de stock. No se puede deshacer.`,
      confirmLabel: 'Aprobar y liberar pago',
    });
    if (!ok) return;

    try {
      setProcessing(true);
      await approveMonthlyEvidence(id!, ev.id, {
        unitsVerified: data.unitsVerified,
        newStockApproved: data.newStockApproved,
        adminNotes: data.adminNotes,
      });
      await loadData();
      toast.success('Evidencia aprobada. Se liberó el pago retenido.');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'No se pudo aprobar la evidencia.'));
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (ev: ProjectEvidence) => {
    const data = reviewData[ev.id];
    if (!data.rejectReason.trim()) {
      toast.error('Escribe el motivo del rechazo: el partner lo verá.');
      return;
    }
    const ok = await confirm({
      title: `¿Rechazar la evidencia de ${monthLabel(ev.periodMonth)}?`,
      description: `El pago retenido no se liberará y el partner verá el motivo.${data.freezeStock ? ' Además, el proyecto se pausará y no se podrá comprar.' : ''}`,
      confirmLabel: 'Rechazar evidencia',
      tone: 'danger',
    });
    if (!ok) return;

    try {
      setProcessing(true);
      await rejectMonthlyEvidence(id!, ev.id, { reason: data.rejectReason.trim(), freezeStock: data.freezeStock });
      await loadData();
      toast.success('Evidencia rechazada. El pago sigue retenido.');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'No se pudo rechazar la evidencia.'));
    } finally {
      setProcessing(false);
    }
  };

  const back = (
    <Link to={`/admin/proyectos/${id}`} className="adm-back">
      <ArrowLeft aria-hidden="true" /> Volver al proyecto
    </Link>
  );

  if (loading) {
    return (
      <div className="adm-page" aria-busy="true">
        {back}
        <Skeleton height={64} />
        <Skeleton height={420} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="adm-page">
        {back}
        <section className="adm-panel">
          <EmptyState icon={FileQuestion} title="Proyecto no encontrado" text={error || undefined} />
        </section>
      </div>
    );
  }

  const unit = unitLabel(project.impact_unit ?? undefined);
  const unitCost = project.provider_cost_unit_clp ?? null;
  const pendingEvidence = evidenceList.filter((e) => e.status === 'pending_approval');
  const pastEvidence = evidenceList.filter((e) => e.status !== 'pending_approval');

  return (
    <div className="adm-page">
      {back}

      <PageHeader
        title="Revisión de evidencia"
        description={`${project.name} · código ${project.code}${unitCost ? ` · costo del proveedor ${formatCLP(unitCost)} por ${unit}` : ''}`}
      />

      {error && (
        <div role="alert" className="adm-alert adm-alert--danger">
          <AlertTriangle aria-hidden="true" />
          <div>{error}</div>
        </div>
      )}

      {!unitCost && pendingEvidence.length > 0 && (
        <div role="alert" className="adm-alert adm-alert--warning">
          <AlertTriangle aria-hidden="true" />
          <div>El proyecto no tiene costo por unidad definido: no se puede calcular el pago a liberar.</div>
        </div>
      )}

      {pendingEvidence.length === 0 ? (
        <section className="adm-panel">
          <EmptyState icon={Inbox} title="No hay entregas por revisar" text="Cuando el partner envíe la evidencia del mes, aparecerá aquí." />
        </section>
      ) : (
        pendingEvidence.map((ev) => {
          const form = reviewData[ev.id];
          if (!form) return null;
          const photos = ev.files
            .filter((f) => f.fileType === 'photo')
            .map((f) => ({ url: f.signedUrl || f.storageUrl, fileName: f.fileName, thumbnailUrl: f.thumbnailUrl }));
          const docs = ev.files.filter((f) => f.fileType !== 'photo');
          // Antes multiplicaba sin revisar el costo y podía mostrar "$NaN".
          const payout = unitCost !== null ? unitCost * (form.unitsVerified || 0) : null;

          return (
            <Panel
              key={ev.id}
              title={`Entrega de ${monthLabel(ev.periodMonth)}`}
              description={`Enviada el ${new Date(ev.createdAt).toLocaleDateString('es-CL')}${project.partner ? ` por ${project.partner.name}` : ''}`}
              aside={
                <span className="adm-inline-meta" style={{ padding: 0 }}>
                  <span>Declara <b>{formatInt(ev.unitsDelivered)}</b> entregadas</span>
                  <span>Pide <b>{formatInt(ev.newStockRequested)}</b> de stock</span>
                </span>
              }
            >
              <div className="adm-grid adm-grid--3">
                <div className="adm-stack-v">
                  <h3 className="adm-subhead">Fotos</h3>
                  {photos.length > 0 ? <PhotoGallery photos={photos} /> : <p className="adm-cell-mute">Sin fotos.</p>}
                  <h3 className="adm-subhead">Documentos · {formatInt(docs.length)}</h3>
                  {docs.length > 0 ? <DocumentList documents={docs} /> : <p className="adm-cell-mute">Sin documentos.</p>}
                  {ev.note && (
                    <p className="adm-note"><b>Nota del partner:</b> {ev.note}</p>
                  )}
                </div>

                <div className="adm-decision">
                  <h3 className="adm-subhead">Aprobar</h3>
                  <div className="adm-field">
                    <label className="adm-field__label" htmlFor={`uv-${ev.id}`}>Unidades verificadas ({unitPlural(project.impact_unit ?? undefined, 2)})</label>
                    <input
                      id={`uv-${ev.id}`}
                      type="number"
                      min={0}
                      className="adm-input"
                      value={form.unitsVerified}
                      onChange={(e) => setField(ev.id, 'unitsVerified', Number(e.target.value))}
                      aria-describedby={`uv-${ev.id}-hint`}
                    />
                    <span id={`uv-${ev.id}-hint`} className="adm-field__hint">Define cuánto del pago retenido se libera.</span>
                  </div>
                  <div className="adm-calc">
                    <span>Pago a liberar</span>
                    <b>{payout !== null ? formatCLP(payout) : '—'}</b>
                  </div>
                  <div className="adm-field">
                    <label className="adm-field__label" htmlFor={`ns-${ev.id}`}>Stock nuevo a habilitar ({unitPlural(project.impact_unit ?? undefined, 2)})</label>
                    <input
                      id={`ns-${ev.id}`}
                      type="number"
                      min={0}
                      className="adm-input"
                      value={form.newStockApproved}
                      onChange={(e) => setField(ev.id, 'newStockApproved', Number(e.target.value))}
                      aria-describedby={`ns-${ev.id}-hint`}
                    />
                    <span id={`ns-${ev.id}-hint`} className="adm-field__hint">Lo que el partner podrá vender desde ahora.</span>
                  </div>
                  <div className="adm-field">
                    <label className="adm-field__label" htmlFor={`an-${ev.id}`}>Notas internas <span className="adm-cell-mute">(opcional)</span></label>
                    <textarea id={`an-${ev.id}`} className="adm-textarea" rows={2} value={form.adminNotes} onChange={(e) => setField(ev.id, 'adminNotes', e.target.value)} />
                  </div>
                  <button type="button" className="adm-btn adm-btn--primary adm-btn--block" onClick={() => handleApprove(ev, payout)} disabled={processing}>
                    Aprobar y liberar pago
                  </button>
                </div>

                <div className="adm-decision">
                  <h3 className="adm-subhead">Rechazar</h3>
                  <p className="adm-field__hint">Si la evidencia no justifica la entrega, el pago queda retenido.</p>
                  <div className="adm-field">
                    <label className="adm-field__label" htmlFor={`rr-${ev.id}`}>Motivo (lo verá el partner)</label>
                    <textarea
                      id={`rr-${ev.id}`}
                      className="adm-textarea"
                      rows={3}
                      value={form.rejectReason}
                      onChange={(e) => setField(ev.id, 'rejectReason', e.target.value)}
                      placeholder="Las fotos no corresponden a las coordenadas del proyecto…"
                    />
                  </div>
                  <label className="adm-check">
                    <input type="checkbox" checked={form.freezeStock} onChange={(e) => setField(ev.id, 'freezeStock', e.target.checked)} />
                    Pausar las ventas del proyecto
                  </label>
                  <button type="button" className="adm-btn adm-btn--block" onClick={() => handleReject(ev)} disabled={processing}>
                    Rechazar evidencia
                  </button>
                </div>
              </div>
            </Panel>
          );
        })
      )}

      {pastEvidence.length > 0 && (
        <section className="adm-table-card">
          <div className="adm-panel__head" style={{ paddingBottom: 12 }}>
            <h2 className="adm-panel__title">Revisiones anteriores</h2>
          </div>
          <div className="adm-table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th scope="col">Mes</th>
                  <th scope="col">Estado</th>
                  <th scope="col" className="adm-col-num">Verificadas</th>
                  <th scope="col" className="adm-col-num">Pago liberado</th>
                  <th scope="col" className="adm-col-num">Stock habilitado</th>
                  <th scope="col">Notas</th>
                </tr>
              </thead>
              <tbody>
                {pastEvidence.map((ev) => (
                  <tr key={ev.id}>
                    <td>{monthLabel(ev.periodMonth)}</td>
                    <td><StatusBadge tone={STATUS_TONE[ev.status] ?? 'neutral'}>{EVIDENCE_STATUS_LABELS[ev.status] ?? ev.status}</StatusBadge></td>
                    <td className="adm-col-num">{ev.unitsVerified != null ? formatInt(ev.unitsVerified) : '—'} de {formatInt(ev.unitsDelivered)}</td>
                    <td className="adm-col-num">{ev.payoutApproved && ev.payoutAmount != null ? formatCLP(ev.payoutAmount) : '—'}</td>
                    <td className="adm-col-num">{ev.newStockApproved != null ? formatInt(ev.newStockApproved) : '—'}</td>
                    <td>{ev.adminNotes || <span className="adm-cell-mute">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {dialog}
    </div>
  );
};

export default MonthlyEvidenceReviewPage;
