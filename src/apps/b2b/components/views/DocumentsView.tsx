import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Download, FileText, Image as ImageIcon, Info, RefreshCw, Trash2, Upload, XCircle } from 'lucide-react';
import api from '../../../../shared/services/api';
import { useConfirm } from '../../../../shared/components/ui';
import {
  Badge,
  btn,
  Card,
  CardHeader,
  cx,
  EmptyState,
  ErrorState,
  fmtDate,
  inputCls,
  labelCls,
  PageHeader,
  Progress,
  Skeleton,
  type Tone,
} from '../../ui';

interface DocumentFile {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  checksum?: string;
}

interface CompanyDocument {
  id: string;
  docType: string;
  status: string;
  uploadedAt: string;
  file: DocumentFile;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completionPercentage: number;
  documentSummary: Record<string, { required: boolean; uploaded: number; maxFiles: number }>;
}

const DOC_TYPES: Record<string, { label: string; description: string }> = {
  rut_empresa: { label: 'RUT de la empresa', description: 'Obligatorio para validar la cuenta.' },
  escritura_constitucion: { label: 'Escritura de constitución', description: 'Opcional; agiliza la aprobación.' },
  representante_legal: { label: 'Cédula del representante legal', description: 'Opcional; anverso y reverso.' },
  poder_notarial: { label: 'Poder notarial', description: 'Opcional; si quien opera la cuenta no es el representante legal.' },
  otro: { label: 'Otro documento', description: 'Documentación adicional.' },
};

const STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'En revisión', tone: 'warning' },
  approved: { label: 'Aprobado', tone: 'success' },
  rejected: { label: 'Rechazado', tone: 'danger' },
};

const ALLOWED = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_MB = 10;

const fileSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toLocaleString('es-CL', { maximumFractionDigits: 1 })} MB`;

const DocumentsView: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { confirm, dialog } = useConfirm();
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [docType, setDocType] = useState('rut_empresa');
  const [description, setDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadData = async () => {
    setFailed(false);
    try {
      const [docsRes, validationRes] = await Promise.all([api.get('/b2b/documents') as any, api.get('/b2b/documents/validation') as any]);
      setDocuments(Array.isArray(docsRes?.data) ? docsRes.data : []);
      const v = validationRes?.data || validationRes;
      setValidation(v && typeof v === 'object' ? { ...v, errors: v.errors ?? [], warnings: v.warnings ?? [] } : null);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (file: File) => {
    setUploadError(null);
    if (file.size > MAX_MB * 1024 * 1024) return setUploadError(`El archivo pesa más de ${MAX_MB} MB.`);
    if (!ALLOWED.includes(file.type)) return setUploadError('Formato no permitido. Usa PDF, JPG o PNG.');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', docType);
      if (description.trim()) formData.append('description', description.trim());
      await api.post('/b2b/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Documento subido');
      setDescription('');
      await loadData();
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || 'No pudimos subir el documento. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (doc: CompanyDocument) => {
    const ok = await confirm({
      title: '¿Eliminar este documento?',
      description: 'Se borrará de forma permanente y tendrás que volver a subirlo si lo necesitas.',
      confirmLabel: 'Eliminar',
      confirmVariant: 'destructive',
    });
    if (!ok) return;
    setBusyId(doc.id);
    try {
      await api.delete(`/b2b/documents/${doc.id}`);
      toast.success('Documento eliminado');
      await loadData();
    } catch {
      toast.error('No pudimos eliminar el documento');
    } finally {
      setBusyId(null);
    }
  };

  /**
   * Antes la descarga abría `…/download?token=<sesión>`: la sesión quedaba en
   * el historial del navegador y en los registros del servidor. Ahora se pide
   * el archivo con la cabecera de autorización y se abre localmente. Si el
   * servidor solo acepta el token en la URL, se usa el método anterior.
   */
  const handleDownload = async (doc: CompanyDocument) => {
    setBusyId(doc.id);
    try {
      const blob = (await api.get(`/b2b/documents/${doc.id}/download`, { responseType: 'blob' })) as unknown as Blob;
      if (!(blob instanceof Blob)) throw new Error('respuesta inesperada');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file.fileName || 'documento';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      const token = localStorage.getItem('access_token');
      const baseURL = (api.defaults as any).baseURL || '';
      window.open(`${baseURL}/b2b/documents/${doc.id}/download?token=${token}`, '_blank', 'noopener');
    } finally {
      setBusyId(null);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    onDrag(e);
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-1/2" />
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (failed) return <ErrorState title="No pudimos cargar tus documentos" onRetry={loadData} />;

  const completion = validation?.completionPercentage ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos"
        subtitle="La documentación legal que necesitamos para validar tu empresa."
        actions={
          <button type="button" onClick={() => { setLoading(true); loadData(); }} className={btn.icon} aria-label="Actualizar" title="Actualizar">
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
          </button>
        }
      />

      {validation && (
        <Card>
          <CardHeader
            title={validation.isValid ? 'Documentación completa' : 'Validación de documentos'}
            subtitle={validation.isValid ? 'Ya tenemos todo lo necesario.' : 'Te falta subir o corregir algunos documentos.'}
            action={<span className={cx('text-2xl font-bold tabular-nums', validation.isValid ? 'text-brand-700' : 'text-amber-700')}>{completion} %</span>}
          />
          <Progress value={completion} label="Documentación completa" />
          {(validation.errors.length > 0 || validation.warnings.length > 0) && (
            <ul className="m-0 p-0 list-none mt-4 space-y-1.5">
              {validation.errors.map((e, i) => (
                <li key={`e${i}`} className="flex items-center gap-2 text-sm text-rose-700">
                  <XCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  {e}
                </li>
              ))}
              {validation.warnings.map((w, i) => (
                <li key={`w${i}`} className="flex items-center gap-2 text-sm text-amber-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  {w}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="p-6 lg:col-span-2">
          <CardHeader title="Subir un documento" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label htmlFor="d-type" className={labelCls}>
                Tipo de documento
              </label>
              <select id="d-type" value={docType} onChange={(e) => setDocType(e.target.value)} className={inputCls}>
                {Object.entries(DOC_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                    {key === 'rut_empresa' ? ' (obligatorio)' : ''}
                  </option>
                ))}
              </select>
              <p className="m-0 mt-1.5 text-xs text-gray-500">{DOC_TYPES[docType]?.description}</p>
            </div>
            <div>
              <label htmlFor="d-desc" className={labelCls}>
                Descripción (opcional)
              </label>
              <input
                id="d-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej.: RUT actualizado 2026"
                className={inputCls}
              />
            </div>
          </div>

          <div
            role="button"
            tabIndex={uploading ? -1 : 0}
            aria-label="Elegir archivo para subir"
            aria-disabled={uploading || undefined}
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={onDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (!uploading && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={cx(
              'rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700',
              uploading && 'opacity-60 pointer-events-none',
              dragActive ? 'border-brand-600 bg-brand-50' : 'border-gray-300 hover:border-brand-600 hover:bg-gray-50',
            )}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} className="hidden" />
            <Upload className={cx('mx-auto w-7 h-7 text-gray-400', uploading && 'animate-pulse')} aria-hidden="true" />
            <p className="m-0 mt-2 text-sm font-medium text-gray-700">{uploading ? 'Subiendo documento…' : 'Arrastra el archivo aquí o haz clic para elegirlo'}</p>
            <p className="m-0 mt-1 text-xs text-gray-500">PDF, JPG o PNG · máximo {MAX_MB} MB</p>
          </div>
          {uploadError && (
            <p role="alert" className="m-0 mt-3 text-sm text-rose-700">
              {uploadError}
            </p>
          )}
        </Card>

        <Card>
          <CardHeader title="Qué necesitamos" icon={Info} />
          <ul className="m-0 p-0 list-none space-y-3 text-sm">
            {Object.entries(DOC_TYPES)
              .filter(([k]) => k !== 'otro')
              .map(([key, val]) => {
                const uploaded = documents.some((d) => d.docType === key);
                return (
                  <li key={key} className="flex items-start gap-2">
                    {uploaded ? (
                      <CheckCircle2 className="w-4 h-4 text-brand-700 flex-shrink-0 mt-0.5" aria-label="Subido" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" aria-label="Pendiente" />
                    )}
                    <span>
                      <span className="font-medium text-gray-900">{val.label}</span>
                      <span className="block text-xs text-gray-500">{val.description}</span>
                    </span>
                  </li>
                );
              })}
          </ul>
        </Card>
      </div>

      <Card className="p-0">
        <div className="px-6 pt-6">
          <CardHeader title={`Documentos subidos (${documents.length})`} className="mb-2" />
        </div>
        {documents.length === 0 ? (
          <EmptyState icon={FileText} title="Aún no has subido documentos" text="Empieza por el RUT de la empresa." />
        ) : (
          <ul className="m-0 p-0 list-none pb-2">
            {documents.map((doc) => {
              const st = STATUS[doc.status] ?? STATUS.pending;
              const isPdf = doc.file?.mimeType === 'application/pdf';
              return (
                <li key={doc.id} className="flex flex-wrap items-center gap-4 px-6 py-3.5 border-t border-gray-100 first:border-t-0">
                  <span className="w-10 h-10 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
                    {isPdf ? <FileText className="w-5 h-5" aria-hidden="true" /> : <ImageIcon className="w-5 h-5" aria-hidden="true" />}
                  </span>
                  <div className="flex-1 min-w-[10rem]">
                    <p className="m-0 text-sm font-medium text-gray-900 truncate">{doc.file?.fileName}</p>
                    <p className="m-0 mt-0.5 text-xs text-gray-500">
                      {DOC_TYPES[doc.docType]?.label || doc.docType} · {fileSize(doc.file?.sizeBytes ?? 0)} · {fmtDate(doc.uploadedAt)}
                    </p>
                  </div>
                  <Badge tone={st.tone}>{st.label}</Badge>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => handleDownload(doc)} disabled={busyId === doc.id} className={btn.icon} aria-label={`Descargar ${doc.file?.fileName}`} title="Descargar">
                      <Download className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => handleDelete(doc)} disabled={busyId === doc.id} className={btn.icon} aria-label={`Eliminar ${doc.file?.fileName}`} title="Eliminar">
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      {dialog}
    </div>
  );
};

export default DocumentsView;
