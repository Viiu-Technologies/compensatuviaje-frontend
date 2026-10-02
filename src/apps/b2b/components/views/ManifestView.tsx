import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Download, FileSpreadsheet, Leaf, RefreshCw, UploadCloud, XCircle } from 'lucide-react';
import { listBatches, uploadManifest, type BatchStatus, type UploadBatch, type UploadBatchResult } from '../../services/batchService';
import {
  Badge,
  btn,
  Card,
  CardHeader,
  cx,
  EmptyState,
  ErrorState,
  fmtDate,
  fmtInt,
  fmtNum,
  fmtTons,
  PageHeader,
  Skeleton,
  StatCard,
  type Tone,
} from '../../ui';

const STATUS: Record<BatchStatus, { label: string; tone: Tone }> = {
  uploaded: { label: 'Subido', tone: 'info' },
  validating: { label: 'Validando', tone: 'info' },
  processing: { label: 'Procesando', tone: 'info' },
  done: { label: 'Procesado', tone: 'success' },
  failed: { label: 'Con errores', tone: 'danger' },
};

const fileSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${fmtNum(bytes / (1024 * 1024), 1)} MB`;

const CSV_TEMPLATE = `flight_number,flight_date,origin,destination,cabin,passengers,round_trip
LA500,2026-01-15,SCL,MIA,economy,150,false
LA501,2026-01-16,SCL,JFK,business,12,true
LA800,2026-01-20,SCL,LIM,economy,180,false`;

const downloadTemplate = () => {
  const url = URL.createObjectURL(new Blob([CSV_TEMPLATE], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'manifiesto_ejemplo.csv';
  a.click();
  URL.revokeObjectURL(url);
};

const ManifestView: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const [batches, setBatches] = useState<UploadBatch[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyFailed, setHistoryFailed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadBatchResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    setHistoryFailed(false);
    try {
      const res = await listBatches();
      setBatches(res?.batches ?? []);
    } catch {
      setHistoryFailed(true);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const selectFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext ?? '')) {
      setUploadError('Solo se aceptan archivos CSV o Excel (.csv, .xlsx, .xls).');
      return;
    }
    setSelectedFile(file);
    setResult(null);
    setUploadError(null);
  };

  const upload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setProgress(0);
    setUploadError(null);
    setResult(null);
    try {
      const r = await uploadManifest(selectedFile, setProgress);
      setResult(r);
      setSelectedFile(null);
      await loadHistory();
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || err?.message || 'No pudimos procesar el archivo.');
    } finally {
      setUploading(false);
    }
  };

  const doneBatches = batches.filter((b) => b.status === 'done');
  const totalTons = doneBatches.reduce((acc, b) => acc + (b.metrics?.totalTonsCO2e ?? 0), 0);
  const totalRows = doneBatches.reduce((acc, b) => acc + (b.metrics?.rowsSuccess ?? b.rowsCount ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manifiestos de vuelos"
        subtitle="Sube un CSV o Excel con los vuelos de la empresa y calculamos sus emisiones mes a mes."
        actions={
          <button type="button" onClick={downloadTemplate} className={btn.secondary}>
            <Download className="w-4 h-4" aria-hidden="true" />
            Plantilla CSV
          </button>
        }
      />

      {batches.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Emisiones registradas" icon={Leaf} value={fmtTons(totalTons)} hint="En manifiestos procesados" />
          <StatCard label="Vuelos procesados" value={fmtInt(totalRows)} />
          <StatCard label="Manifiestos" value={fmtInt(batches.length)} hint={`${fmtInt(doneBatches.length)} procesados`} />
        </div>
      )}

      <Card>
        <CardHeader title="Subir manifiesto" subtitle="CSV, XLSX o XLS · máximo 10 MB · hasta 5.000 filas." />
        <div
          role="button"
          tabIndex={selectedFile || uploading ? -1 : 0}
          aria-label="Elegir archivo de vuelos"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) selectFile(f);
          }}
          onClick={() => !selectedFile && !uploading && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (!selectedFile && !uploading && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={cx(
            'rounded-xl border-2 border-dashed p-8 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700',
            !selectedFile && !uploading && 'cursor-pointer hover:border-brand-600 hover:bg-gray-50',
            dragging ? 'border-brand-600 bg-brand-50' : 'border-gray-300',
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) selectFile(f);
              e.target.value = '';
            }}
          />
          {selectedFile ? (
            <p className="m-0 inline-flex items-center gap-2 text-sm">
              <FileSpreadsheet className="w-5 h-5 text-brand-700" aria-hidden="true" />
              <span className="font-semibold text-gray-900">{selectedFile.name}</span>
              <span className="text-gray-500">· {fileSize(selectedFile.size)}</span>
            </p>
          ) : (
            <>
              <UploadCloud className="mx-auto w-8 h-8 text-gray-400" aria-hidden="true" />
              <p className="m-0 mt-2 text-sm font-medium text-gray-700">Arrastra el archivo aquí o haz clic para elegirlo</p>
            </>
          )}
        </div>

        {uploading && (
          <div className="mt-4">
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Subida del manifiesto">
              <div className="h-full rounded-full bg-brand-600 transition-[width]" style={{ width: `${progress}%` }} />
            </div>
            <p className="m-0 mt-1.5 text-xs text-gray-500 text-center">{progress < 100 ? `Subiendo… ${progress} %` : 'Procesando filas…'}</p>
          </div>
        )}

        {selectedFile && !uploading && (
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button type="button" className={btn.secondary} onClick={() => setSelectedFile(null)}>
              Cancelar
            </button>
            <button type="button" className={btn.primary} onClick={upload}>
              <UploadCloud className="w-4 h-4" aria-hidden="true" />
              Procesar manifiesto
            </button>
          </div>
        )}

        {uploadError && (
          <p role="alert" className="m-0 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {uploadError}
          </p>
        )}
      </Card>

      {result && (
        <Card className={result.status === 'done' ? 'p-6 border-brand-100' : 'p-6 border-rose-200'}>
          <CardHeader
            title={result.status === 'done' ? 'Manifiesto procesado' : 'El manifiesto tiene errores'}
            subtitle={result.filename}
            icon={result.status === 'done' ? CheckCircle2 : XCircle}
            action={
              result.status === 'done' && onNavigate ? (
                <button type="button" className={cx(btn.primary, btn.sm)} onClick={() => onNavigate('proyectos')}>
                  Compensar estas emisiones
                </button>
              ) : undefined
            }
          />
          <dl className="m-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ['Filas', fmtInt(result.rowsTotal)],
              ['Procesadas', fmtInt(result.rowsProcessed)],
              ['Con error', fmtInt(result.rowsFailed)],
              ['Emisiones', fmtTons(result.totalTonsCO2e)],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl border border-gray-200 p-3">
                <dt className="text-xs text-gray-500">{l}</dt>
                <dd className="m-0 mt-1 text-lg font-semibold text-gray-900 tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>

          {result.monthlySummaries?.length > 0 && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="text-left text-sm font-semibold text-gray-900 pb-2">Resumen mensual</caption>
                <thead>
                  <tr className="text-xs text-gray-500">
                    {['Mes', 'Vuelos', 'Pasajeros', 'Km', 'Emisiones', 'Cobertura'].map((h) => (
                      <th key={h} scope="col" className="px-3 py-2 text-left font-medium border-b border-gray-200 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.monthlySummaries.map((s, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0 tabular-nums">
                      <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">
                        {new Date(s.periodMonth).toLocaleDateString('es-CL', { year: 'numeric', month: 'long' })}
                      </td>
                      <td className="px-3 py-2">{fmtInt(s.flightsCount)}</td>
                      <td className="px-3 py-2">{fmtInt(s.passengers)}</td>
                      <td className="px-3 py-2">{fmtInt(s.distanceKm)}</td>
                      <td className="px-3 py-2 font-semibold">{fmtTons(s.emissionsTco2)}</td>
                      <td className="px-3 py-2">{fmtInt(s.coveragePct)} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.errors?.length > 0 && (
            <details className="mt-5">
              <summary className="cursor-pointer text-sm font-medium text-rose-700">
                {fmtInt(result.errors.length)} {result.errors.length === 1 ? 'fila con error' : 'filas con error'}
              </summary>
              <ul className="m-0 mt-2 p-0 list-none space-y-1 max-h-48 overflow-y-auto">
                {result.errors.map((err, i) => (
                  <li key={i} className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-800">
                    {err}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </Card>
      )}

      <Card className="p-0">
        <div className="px-6 pt-6">
          <CardHeader
            title="Historial"
            className="mb-2"
            action={
              <button type="button" onClick={loadHistory} disabled={loadingHistory} className={btn.icon} aria-label="Actualizar historial" title="Actualizar">
                <RefreshCw className={cx('w-4 h-4', loadingHistory && 'animate-spin')} aria-hidden="true" />
              </button>
            }
          />
        </div>
        {loadingHistory ? (
          <div className="px-6 pb-6">
            <Skeleton className="h-32" />
          </div>
        ) : historyFailed ? (
          <div className="px-6 pb-6">
            <ErrorState title="No pudimos cargar el historial" onRetry={loadHistory} />
          </div>
        ) : batches.length === 0 ? (
          <EmptyState icon={FileSpreadsheet} title="Aún no has subido manifiestos" text="Descarga la plantilla, complétala con tus vuelos y súbela aquí." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500">
                  {['Archivo', 'Fecha', 'Filas', 'Emisiones', 'Estado'].map((h) => (
                    <th key={h} scope="col" className="px-6 py-2 text-left font-medium border-b border-gray-200 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => {
                  const st = STATUS[b.status] ?? { label: b.status, tone: 'neutral' as Tone };
                  return (
                    <tr key={b.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-6 py-3 font-medium text-gray-900 max-w-[16rem]">
                        <span className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                          <span className="truncate">{b.filename}</span>
                        </span>
                        {b.status === 'failed' && b.errorMessage && <span className="block mt-0.5 text-xs font-normal text-rose-700">{b.errorMessage}</span>}
                      </td>
                      <td className="px-6 py-3 text-gray-600 whitespace-nowrap">{fmtDate(b.createdAt)}</td>
                      <td className="px-6 py-3 text-gray-600 tabular-nums">{b.rowsCount != null ? fmtInt(b.rowsCount) : '—'}</td>
                      <td className="px-6 py-3 font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                        {b.metrics?.totalTonsCO2e != null ? fmtTons(b.metrics.totalTonsCO2e) : '—'}
                      </td>
                      <td className="px-6 py-3">
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ManifestView;
