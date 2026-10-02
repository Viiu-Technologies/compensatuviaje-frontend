// ============================================
// MONTHLY RESTOCK PAGE
// Evidencia mensual: libera el pago retenido y solicita stock nuevo.
// ============================================

import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Clock, FolderKanban, History } from 'lucide-react';
import { getProjectById } from '../services/partnerApi';
import { getProjectEvidence, submitMonthlyEvidence } from '../services/evidenceApi';
import { EsgProject } from '../../../types/partner.types';
import { EVIDENCE_STATUS_LABELS, EvidenceStatus, ProjectEvidence } from '../../../types/evidence.types';
import FileUploader from '../../../shared/components/FileUploader';
import {
  Badge,
  btn,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  fmtCLP,
  fmtDate,
  fmtInt,
  inputCls,
  labelCls,
  PageHeader,
  Progress,
  Skeleton,
  type Tone,
  unitOf,
} from '../ui';

const EVIDENCE_TONES: Record<EvidenceStatus, Tone> = {
  pending_approval: 'warning',
  approved: 'success',
  rejected: 'danger',
};

const MonthlyRestockPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<EsgProject | null>(null);
  const [history, setHistory] = useState<ProjectEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [unitsDelivered, setUnitsDelivered] = useState<number | ''>('');
  const [newStockRequested, setNewStockRequested] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadFailed(false);
      const [projRes, evRes] = await Promise.all([getProjectById(id!), getProjectEvidence(id!)]);
      setProject(projRes);
      if (evRes?.success) setHistory(evRes.data?.evidences ?? []);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isPending = history.some((e) => e.status === 'pending_approval');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitsDelivered || !newStockRequested || files.length === 0) {
      setError('Completa las unidades entregadas, el stock solicitado y sube al menos un archivo de evidencia.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await submitMonthlyEvidence(
        id!,
        { unitsDelivered: Number(unitsDelivered), newStockRequested: Number(newStockRequested), note },
        files,
      );
      toast.success('Evidencia enviada. Te avisaremos cuando sea revisada.');
      setUnitsDelivered('');
      setNewStockRequested('');
      setNote('');
      setFiles([]);
      await loadData();
    } catch (err: any) {
      setError(
        err?.code === 'ECONNABORTED'
          ? 'El envío tardó demasiado. Revisa tu conexión o prueba con archivos más livianos.'
          : err?.response?.data?.message || 'No pudimos enviar la evidencia. Inténtalo de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const back = { to: `/partner/projects/${id}`, label: 'Volver al proyecto' };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-1/2" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-60" />
        </div>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div>
        <PageHeader back={back} title="Evidencia mensual" />
        <ErrorState title="No pudimos cargar el proyecto" onRetry={loadData} />
      </div>
    );
  }

  if (!project) {
    return (
      <Card>
        <EmptyState
          icon={FolderKanban}
          title="No encontramos este proyecto"
          action={
            <Link to="/partner/projects" className={btn.secondary}>
              Volver a mis proyectos
            </Link>
          }
        />
      </Card>
    );
  }

  const unit = unitOf(project);
  const total = project.capacity_total || 0;
  const sold = project.capacity_sold || 0;

  return (
    <div>
      <PageHeader back={back} title="Evidencia mensual" subtitle={`${project.name} · ${project.code}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="p-6 lg:col-span-2">
          <CardHeader
            title="Liberar el pago y solicitar stock"
            subtitle="Con la evidencia de lo entregado este mes liberamos el pago retenido y habilitamos el stock del próximo."
          />

          {isPending ? (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <Clock className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="m-0 text-sm font-semibold text-amber-900">Tienes una solicitud en revisión</p>
                <p className="m-0 mt-0.5 text-sm text-amber-800">
                  Podrás enviar una nueva cuando nuestro equipo apruebe o rechace la actual.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {error && (
                <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="r-units" className={labelCls}>
                    {unit.charAt(0).toUpperCase() + unit.slice(1)} entregados este mes
                    <span className="text-rose-600 ml-0.5" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="r-units"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={unitsDelivered}
                    onChange={(e) => setUnitsDelivered(e.target.value ? Number(e.target.value) : '')}
                    className={inputCls}
                  />
                  <p className="m-0 mt-1.5 text-xs text-gray-500">Con esto liberamos el pago retenido.</p>
                </div>
                <div>
                  <label htmlFor="r-stock" className={labelCls}>
                    Stock que solicitas
                    <span className="text-rose-600 ml-0.5" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="r-stock"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={newStockRequested}
                    onChange={(e) => setNewStockRequested(e.target.value ? Number(e.target.value) : '')}
                    className={inputCls}
                  />
                  <p className="m-0 mt-1.5 text-xs text-gray-500">Lo que podrás vender el próximo mes.</p>
                </div>
              </div>

              <div>
                <label htmlFor="r-note" className={labelCls}>
                  Notas
                </label>
                <textarea
                  id="r-note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Avance del mes, problemas, logros…"
                  className={inputCls}
                />
              </div>

              <FileUploader
                label="Evidencia fotográfica o documental"
                description="Guías de despacho, fotos georreferenciadas, reportes del mes."
                accept="image/*,application/pdf"
                maxFiles={10}
                required
                files={files}
                onFilesChange={setFiles}
              />

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={submitting} className={btn.primary}>
                  {submitting ? 'Enviando…' : 'Enviar evidencia'}
                </button>
              </div>
            </form>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Estado actual" />
            <dl className="m-0 space-y-5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <dt className="text-gray-500">Stock restante del mes</dt>
                <dd className="m-0 font-semibold text-gray-900 tabular-nums">
                  {fmtInt(project.monthly_stock_remaining)} {unit}
                </dd>
              </div>
              {total > 0 && (
                <div>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <dt className="text-gray-500">Capacidad vendida</dt>
                    <dd className="m-0 font-semibold text-gray-900 tabular-nums">
                      {fmtInt(sold)} / {fmtInt(total)} {unit}
                    </dd>
                  </div>
                  <Progress value={(sold / total) * 100} label="Capacidad vendida" className="mt-2" />
                </div>
              )}
            </dl>
          </Card>

          <Card>
            <CardHeader title="Historial" icon={History} />
            {history.length === 0 ? (
              <p className="m-0 text-sm text-gray-500">Aún no has enviado evidencia mensual.</p>
            ) : (
              <ul className="m-0 p-0 list-none space-y-4">
                {history.map((ev) => (
                  <li key={ev.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-800">{fmtDate(ev.createdAt)}</span>
                      <Badge tone={EVIDENCE_TONES[ev.status] ?? 'neutral'}>{EVIDENCE_STATUS_LABELS[ev.status] ?? ev.status}</Badge>
                    </div>
                    <p className="m-0 mt-1.5 text-xs text-gray-600">
                      Solicitado: {fmtInt(ev.newStockRequested)} · Verificado: {ev.unitsVerified != null ? fmtInt(ev.unitsVerified) : '—'}
                    </p>
                    {ev.payoutApproved && (
                      <p className="m-0 mt-1 text-xs font-medium text-brand-700">Pago liberado: {fmtCLP(ev.payoutAmount)}</p>
                    )}
                    {ev.note && <p className="m-0 mt-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-600">{ev.note}</p>}
                    {ev.adminNotes && (
                      <p className="m-0 mt-2 rounded-lg bg-rose-50 p-2 text-xs text-rose-800">
                        <strong>Respuesta del equipo:</strong> {ev.adminNotes}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MonthlyRestockPage;
