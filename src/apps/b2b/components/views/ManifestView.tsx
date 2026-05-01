import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  AlertTriangle,
  FileText,
  TrendingUp,
  Plane,
  Users,
  Leaf,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import {
  uploadManifest,
  listBatches,
  getBatchDetail,
  type UploadBatch,
  type UploadBatchResult,
  type BatchStatus,
} from '../../services/batchService';

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<BatchStatus, { label: string; color: string; icon: React.ElementType }> = {
  uploaded:   { label: 'Subido',      color: 'bg-blue-100 text-blue-700',    icon: UploadCloud },
  validating: { label: 'Validando',   color: 'bg-amber-100 text-amber-700',  icon: Loader2 },
  processing: { label: 'Procesando',  color: 'bg-purple-100 text-purple-700',icon: Loader2 },
  done:       { label: 'Completado',  color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  failed:     { label: 'Fallido',     color: 'bg-red-100 text-red-700',      icon: XCircle },
};

function StatusBadge({ status }: { status: BatchStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.failed;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      <Icon className={`w-3 h-3 ${['validating', 'processing'].includes(status) ? 'animate-spin' : ''}`} />
      {cfg.label}
    </span>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── CSV template download ────────────────────────────────────────────────────
const CSV_TEMPLATE = `flight_number,flight_date,origin,destination,cabin,passengers,round_trip
LA500,2025-01-15,SCL,MIA,economy,150,false
LA501,2025-01-16,SCL,JFK,business,12,true
LA800,2025-01-20,SCL,LIM,economy,180,false`;

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'manifiesto_ejemplo.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────
const ManifestView: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [batches, setBatches] = useState<UploadBatch[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadBatchResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cardBase = isDark
    ? 'bg-gray-800 border-gray-700 text-gray-100'
    : 'bg-white border-gray-200 text-gray-900';

  // Load history
  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const { batches: data } = await listBatches();
      setBatches(data);
    } catch {
      setHistoryError('No se pudo cargar el historial');
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // Drag & Drop handlers
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileSelect = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext ?? '')) {
      setUploadError('Solo se permiten archivos CSV o Excel (.csv, .xlsx, .xls)');
      return;
    }
    setSelectedFile(file);
    setUploadResult(null);
    setUploadError(null);
    setShowErrors(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadResult(null);

    try {
      const result = await uploadManifest(selectedFile, setUploadProgress);
      setUploadResult(result);
      setSelectedFile(null);
      await loadHistory();
    } catch (err: any) {
      setUploadError(err?.message ?? 'Error al procesar el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  const totalTonsAll = batches
    .filter(b => b.status === 'done')
    .reduce((acc, b) => acc + (b.metrics?.totalTonsCO2e ?? 0), 0);

  return (
    <div className="!p-6 !max-w-5xl !mx-auto !space-y-8">

      {/* Header */}
      <div>
        <h2 className={`!text-2xl !font-bold ${isDark ? '!text-white' : '!text-gray-900'}`}>
          Subida de Manifiestos
        </h2>
        <p className={`!text-sm !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
          Sube un archivo CSV o Excel con tus vuelos corporativos para calcular las emisiones y generar un resumen mensual.
        </p>
      </div>

      {/* Summary stat */}
      {batches.length > 0 && (
        <div className={`!rounded-2xl !border !p-4 !flex !items-center !gap-4 ${cardBase}`}>
          <div className="!p-3 !rounded-xl !bg-emerald-100">
            <Leaf className="!w-6 !h-6 !text-emerald-600" />
          </div>
          <div>
            <p className={`!text-xs !font-medium !uppercase !tracking-wide ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
              Total CO₂e registrado (todos los manifiestos)
            </p>
            <p className={`!text-2xl !font-black ${isDark ? '!text-white' : '!text-gray-900'}`}>
              {totalTonsAll.toLocaleString('es-CL', { maximumFractionDigits: 2 })}
              <span className="!text-base !font-normal !ml-1 !text-emerald-600">ton CO₂e</span>
            </p>
          </div>
        </div>
      )}

      {/* ─── Dropzone ─── */}
      <div className={`!rounded-2xl !border-2 !transition-all !duration-200 ${cardBase} ${
        isDragging
          ? '!border-emerald-400 !bg-emerald-50 dark:!bg-emerald-900/20'
          : '!border-dashed !border-gray-300 dark:!border-gray-600'
      }`}>
        <div
          className="!p-8 !flex !flex-col !items-center !gap-4 !cursor-pointer"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !selectedFile && !isUploading && fileInputRef.current?.click()}
        >
          <div className={`!p-5 !rounded-2xl !transition-colors ${
            isDragging ? '!bg-emerald-100' : isDark ? '!bg-gray-700' : '!bg-gray-100'
          }`}>
            <UploadCloud className={`!w-10 !h-10 ${isDragging ? '!text-emerald-500' : isDark ? '!text-gray-300' : '!text-gray-400'}`} />
          </div>

          {selectedFile ? (
            <div className="!text-center">
              <div className="!flex !items-center !gap-2 !justify-center">
                <FileSpreadsheet className="!w-5 !h-5 !text-emerald-500" />
                <span className={`!font-semibold ${isDark ? '!text-white' : '!text-gray-900'}`}>{selectedFile.name}</span>
              </div>
              <p className={`!text-sm !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
                {formatBytes(selectedFile.size)}
              </p>
            </div>
          ) : (
            <div className="!text-center">
              <p className={`!font-semibold !text-lg ${isDark ? '!text-white' : '!text-gray-900'}`}>
                Arrastra tu archivo aquí
              </p>
              <p className={`!text-sm !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
                o <span className="!text-emerald-500 !underline !cursor-pointer">selecciona desde tu equipo</span>
              </p>
              <p className={`!text-xs !mt-2 ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>
                CSV · XLSX · XLS — máximo 10 MB · hasta 5,000 filas
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="!hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ''; }}
          />
        </div>

        {/* Progress */}
        {isUploading && (
          <div className="!px-8 !pb-6">
            <div className={`!w-full !h-2 !rounded-full ${isDark ? '!bg-gray-700' : '!bg-gray-200'}`}>
              <div
                className="!h-2 !rounded-full !bg-gradient-to-r !from-emerald-400 !to-green-500 !transition-all !duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className={`!text-xs !mt-1 !text-center ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
              {uploadProgress < 100 ? `Subiendo... ${uploadProgress}%` : 'Procesando filas...'}
            </p>
          </div>
        )}

        {/* Actions */}
        {selectedFile && !isUploading && (
          <div className="!px-8 !pb-6 !flex !gap-3">
            <button
              onClick={handleUpload}
              className="!flex-1 !flex !items-center !justify-center !gap-2 !bg-gradient-to-r !from-emerald-500 !to-green-600 !text-white !font-semibold !py-3 !rounded-xl !transition-all hover:!opacity-90"
            >
              <UploadCloud className="!w-4 !h-4" />
              Procesar Manifiesto
            </button>
            <button
              onClick={() => { setSelectedFile(null); setUploadError(null); }}
              className={`!px-4 !py-3 !rounded-xl !border !font-medium !transition-all ${
                isDark
                  ? '!border-gray-600 !text-gray-300 hover:!bg-gray-700'
                  : '!border-gray-300 !text-gray-600 hover:!bg-gray-50'
              }`}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Template download */}
      <button
        onClick={downloadTemplate}
        className={`!flex !items-center !gap-2 !text-sm !font-medium !transition-colors ${
          isDark ? '!text-emerald-400 hover:!text-emerald-300' : '!text-emerald-600 hover:!text-emerald-700'
        }`}
      >
        <Download className="!w-4 !h-4" />
        Descargar plantilla CSV de ejemplo
      </button>

      {/* Error alert */}
      {uploadError && (
        <div className="!flex !items-start !gap-3 !p-4 !rounded-xl !bg-red-50 !border !border-red-200 !text-red-700">
          <AlertTriangle className="!w-5 !h-5 !flex-shrink-0 !mt-0.5" />
          <p className="!text-sm">{uploadError}</p>
        </div>
      )}

      {/* Upload result */}
      {uploadResult && (
        <div className={`!rounded-2xl !border !p-6 !space-y-4 ${
          uploadResult.status === 'done'
            ? isDark ? '!border-emerald-700 !bg-emerald-900/20' : '!border-emerald-200 !bg-emerald-50'
            : isDark ? '!border-red-700 !bg-red-900/20' : '!border-red-200 !bg-red-50'
        }`}>
          <div className="!flex !items-center !gap-3">
            {uploadResult.status === 'done' ? (
              <CheckCircle2 className="!w-6 !h-6 !text-emerald-500" />
            ) : (
              <XCircle className="!w-6 !h-6 !text-red-500" />
            )}
            <h3 className={`!font-bold !text-lg ${isDark ? '!text-white' : '!text-gray-900'}`}>
              {uploadResult.status === 'done' ? 'Manifiesto procesado' : 'Procesamiento con errores'}
            </h3>
          </div>

          {/* Stats grid */}
          <div className="!grid !grid-cols-2 sm:!grid-cols-4 !gap-3">
            {[
              { icon: FileText,   label: 'Filas totales',    value: uploadResult.rowsTotal },
              { icon: CheckCircle2, label: 'Procesadas',     value: uploadResult.rowsProcessed, color: 'text-emerald-600' },
              { icon: XCircle,    label: 'Fallidas',         value: uploadResult.rowsFailed,     color: 'text-red-500' },
              { icon: Leaf,       label: 'Total ton CO₂e',  value: uploadResult.totalTonsCO2e.toFixed(2), color: 'text-emerald-600' },
            ].map((s, i) => (
              <div key={i} className={`!rounded-xl !p-3 !text-center ${isDark ? '!bg-gray-800' : '!bg-white'} !border ${isDark ? '!border-gray-700' : '!border-gray-200'}`}>
                <s.icon className={`!w-4 !h-4 !mx-auto !mb-1 ${s.color ?? (isDark ? '!text-gray-300' : '!text-gray-500')}`} />
                <p className={`!text-lg !font-black ${s.color ?? (isDark ? '!text-white' : '!text-gray-900')}`}>{s.value}</p>
                <p className={`!text-xs ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Monthly breakdown */}
          {uploadResult.monthlySummaries.length > 0 && (
            <div>
              <p className={`!text-sm !font-semibold !mb-2 ${isDark ? '!text-gray-200' : '!text-gray-700'}`}>
                Resumen mensual
              </p>
              <div className="!overflow-x-auto">
                <table className={`!w-full !text-sm !rounded-xl !overflow-hidden ${isDark ? '!bg-gray-800' : '!bg-white'} !border ${isDark ? '!border-gray-700' : '!border-gray-200'}`}>
                  <thead className={isDark ? '!bg-gray-700' : '!bg-gray-50'}>
                    <tr>
                      {['Período', 'Vuelos', 'Pasajeros', 'Km totales', 'ton CO₂e', 'Cobertura'].map(h => (
                        <th key={h} className={`!px-3 !py-2 !text-left !text-xs !font-semibold !uppercase !tracking-wide ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uploadResult.monthlySummaries.map((s, i) => (
                      <tr key={i} className={`!border-t ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
                        <td className={`!px-3 !py-2 !font-medium ${isDark ? '!text-white' : '!text-gray-900'}`}>
                          {new Date(s.periodMonth).toLocaleDateString('es-CL', { year: 'numeric', month: 'long' })}
                        </td>
                        <td className="!px-3 !py-2">{s.flightsCount.toLocaleString()}</td>
                        <td className="!px-3 !py-2">{s.passengers.toLocaleString()}</td>
                        <td className="!px-3 !py-2">{s.distanceKm.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</td>
                        <td className="!px-3 !py-2 !font-semibold !text-emerald-600">{s.emissionsTco2.toLocaleString('es-CL', { maximumFractionDigits: 2 })}</td>
                        <td className="!px-3 !py-2">{s.coveragePct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Errors collapsible */}
          {uploadResult.errors.length > 0 && (
            <div>
              <button
                onClick={() => setShowErrors(v => !v)}
                className={`!flex !items-center !gap-2 !text-sm !font-medium !text-red-600 hover:!text-red-700`}
              >
                {showErrors ? <ChevronUp className="!w-4 !h-4" /> : <ChevronDown className="!w-4 !h-4" />}
                {uploadResult.errors.length} error{uploadResult.errors.length !== 1 ? 'es' : ''} de procesamiento
              </button>
              {showErrors && (
                <ul className="!mt-2 !space-y-1 !max-h-40 !overflow-y-auto">
                  {uploadResult.errors.map((err, i) => (
                    <li key={i} className="!text-xs !text-red-600 !bg-red-50 !border !border-red-100 !rounded-lg !px-3 !py-1.5">{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── History ─── */}
      <div>
        <div className="!flex !items-center !justify-between !mb-4">
          <h3 className={`!text-lg !font-bold ${isDark ? '!text-white' : '!text-gray-900'}`}>
            Historial de manifiestos
          </h3>
          <button
            onClick={loadHistory}
            disabled={isLoadingHistory}
            className={`!flex !items-center !gap-1.5 !text-sm !font-medium !transition-colors ${
              isDark ? '!text-gray-400 hover:!text-white' : '!text-gray-500 hover:!text-gray-800'
            }`}
          >
            <RefreshCw className={`!w-4 !h-4 ${isLoadingHistory ? '!animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {historyError && (
          <div className="!p-4 !rounded-xl !bg-red-50 !border !border-red-200 !text-red-700 !text-sm">
            {historyError}
          </div>
        )}

        {!historyError && batches.length === 0 && !isLoadingHistory && (
          <div className={`!text-center !py-16 !rounded-2xl !border-2 !border-dashed ${isDark ? '!border-gray-700 !text-gray-500' : '!border-gray-200 !text-gray-400'}`}>
            <FileSpreadsheet className="!w-10 !h-10 !mx-auto !mb-3 !opacity-40" />
            <p className="!font-medium">Aún no has subido manifiestos</p>
            <p className="!text-sm !mt-1">Sube tu primer archivo CSV o Excel para comenzar</p>
          </div>
        )}

        {batches.length > 0 && (
          <div className={`!rounded-2xl !border !overflow-hidden ${isDark ? '!border-gray-700' : '!border-gray-200'}`}>
            <table className="!w-full !text-sm">
              <thead className={isDark ? '!bg-gray-800 !text-gray-400' : '!bg-gray-50 !text-gray-500'}>
                <tr>
                  {['Archivo', 'Fecha', 'Filas', 'ton CO₂e', 'Estado'].map(h => (
                    <th key={h} className="!px-4 !py-3 !text-left !text-xs !font-semibold !uppercase !tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {batches.map((b, i) => (
                  <tr
                    key={b.id}
                    className={`!border-t !transition-colors ${
                      isDark
                        ? '!border-gray-700 hover:!bg-gray-750'
                        : `!border-gray-100 ${i % 2 === 0 ? '' : '!bg-gray-50/50'} hover:!bg-emerald-50/40`
                    }`}
                  >
                    <td className={`!px-4 !py-3 !font-medium !max-w-[200px] !truncate ${isDark ? '!text-white' : '!text-gray-900'}`}>
                      <div className="!flex !items-center !gap-2">
                        <FileSpreadsheet className="!w-4 !h-4 !text-emerald-500 !flex-shrink-0" />
                        <span className="!truncate">{b.filename}</span>
                      </div>
                    </td>
                    <td className={`!px-4 !py-3 !whitespace-nowrap ${isDark ? '!text-gray-300' : '!text-gray-600'}`}>
                      {new Date(b.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className={`!px-4 !py-3 ${isDark ? '!text-gray-300' : '!text-gray-600'}`}>
                      {b.rowsCount != null ? b.rowsCount.toLocaleString() : '—'}
                    </td>
                    <td className={`!px-4 !py-3 !font-semibold ${b.metrics?.totalTonsCO2e ? '!text-emerald-600' : isDark ? '!text-gray-500' : '!text-gray-400'}`}>
                      {b.metrics?.totalTonsCO2e != null
                        ? b.metrics.totalTonsCO2e.toLocaleString('es-CL', { maximumFractionDigits: 2 })
                        : '—'}
                    </td>
                    <td className="!px-4 !py-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManifestView;
