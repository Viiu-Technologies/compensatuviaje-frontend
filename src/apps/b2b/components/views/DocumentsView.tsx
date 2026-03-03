import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  File,
  RefreshCw,
  Shield,
  Info
} from 'lucide-react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/services/api';

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

interface DocumentTypeConfig {
  name: string;
  required: boolean;
  maxFiles: number;
  allowedTypes: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completionPercentage: number;
  documentSummary: Record<string, { required: boolean; uploaded: number; maxFiles: number }>;
}

const docTypeLabels: Record<string, { label: string; description: string }> = {
  rut_empresa: { label: 'RUT Empresa', description: 'Documento RUT de la empresa (obligatorio)' },
  escritura_constitucion: { label: 'Escritura de Constitución', description: 'Escritura pública de la constitución de la sociedad' },
  representante_legal: { label: 'Cédula Representante Legal', description: 'Cédula de identidad del representante (anverso y reverso)' },
  poder_notarial: { label: 'Poder Notarial', description: 'Poder notarial que acredite representación' },
  otro: { label: 'Otro Documento', description: 'Documentación adicional o complementaria' },
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock },
  approved: { label: 'Aprobado', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
  rejected: { label: 'Rechazado', color: 'text-rose-700', bg: 'bg-rose-100', icon: XCircle },
};

const DocumentsView: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<Record<string, DocumentTypeConfig>>({});
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState('rut_empresa');
  const [description, setDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [docsRes, validationRes] = await Promise.all([
        api.get('/b2b/documents') as any,
        api.get('/b2b/documents/validation') as any,
      ]);

      setDocuments(docsRes.data || []);
      if (docsRes.documentTypes) setDocumentTypes(docsRes.documentTypes);

      setValidation(validationRes.data || validationRes);
    } catch (err: any) {
      console.error('Error loading documents:', err);
      setError('Error al cargar los documentos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo excede el tamaño máximo de 10MB');
      return;
    }

    // Validate mime type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no permitido. Usa PDF, JPG o PNG.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', selectedDocType);
      if (description.trim()) formData.append('description', description.trim());

      await api.post('/b2b/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccessMsg('Documento subido exitosamente');
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadData();
    } catch (err: any) {
      console.error('Error uploading:', err);
      setError(err?.response?.data?.message || err?.message || 'Error al subir el documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('¿Eliminar este documento?')) return;
    setDeleting(docId);
    try {
      await api.delete(`/b2b/documents/${docId}`);
      setSuccessMsg('Documento eliminado');
      await loadData();
    } catch (err: any) {
      setError('Error al eliminar el documento');
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = (docId: string) => {
    const token = localStorage.getItem('access_token');
    const baseURL = (api.defaults as any).baseURL || '';
    window.open(`${baseURL}/b2b/documents/${docId}/download?token=${token}`, '_blank');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="!flex !items-center !justify-center !py-20">
        <div className="!text-center">
          <Loader2 className="!w-12 !h-12 !text-green-500 !animate-spin !mx-auto !mb-4" />
          <p className={isDark ? '!text-gray-400' : '!text-gray-500'}>Cargando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div className="!flex !flex-col sm:!flex-row !items-start sm:!items-center !justify-between !gap-4">
        <div>
          <h1 className={`!text-2xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Documentación Legal</h1>
          <p className={`!text-sm !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
            Sube y gestiona los documentos requeridos para completar tu onboarding
          </p>
        </div>
        <button
          onClick={loadData}
          className={`!p-2.5 !rounded-xl !transition-colors !border-0 ${
            isDark ? '!bg-gray-700/50 hover:!bg-gray-600/50 !text-gray-400' : '!bg-gray-100 hover:!bg-gray-200 !text-gray-600'
          }`}
        >
          <RefreshCw className="!w-5 !h-5" />
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="!bg-rose-50 !border !border-rose-200 !rounded-xl !p-4 !flex !items-start !gap-3">
          <AlertCircle className="!w-5 !h-5 !text-rose-500 !mt-0.5 !flex-shrink-0" />
          <div className="!flex-1">
            <p className="!text-sm !text-rose-700 !font-medium">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="!text-rose-400 hover:!text-rose-600 !text-lg !font-bold !border-0 !bg-transparent">×</button>
        </div>
      )}

      {successMsg && (
        <div className="!bg-emerald-50 !border !border-emerald-200 !rounded-xl !p-4 !flex !items-center !gap-3">
          <CheckCircle2 className="!w-5 !h-5 !text-emerald-500 !flex-shrink-0" />
          <p className="!text-sm !text-emerald-700 !font-medium">{successMsg}</p>
        </div>
      )}

      {/* Validation Progress */}
      {validation && (
        <div className={`!rounded-2xl !p-5 !border ${
          isDark ? '!bg-gray-800/50 !border-gray-700/50' : '!bg-white !border-gray-200'
        }`}>
          <div className="!flex !items-center !justify-between !mb-3">
            <div className="!flex !items-center !gap-3">
              <Shield className={`!w-5 !h-5 ${validation.isValid ? '!text-emerald-500' : '!text-amber-500'}`} />
              <h3 className={`!font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>
                Validación de Documentos
              </h3>
            </div>
            <span className={`!text-lg !font-bold ${validation.isValid ? '!text-emerald-600' : '!text-amber-600'}`}>
              {validation.completionPercentage}%
            </span>
          </div>
          <div className="!h-3 !bg-gray-200 !rounded-full !overflow-hidden !mb-3">
            <div
              className={`!h-full !rounded-full !transition-all !duration-500 ${validation.isValid ? '!bg-emerald-500' : '!bg-amber-500'}`}
              style={{ width: `${validation.completionPercentage}%` }}
            />
          </div>
          {validation.errors.length > 0 && (
            <div className="!space-y-1">
              {validation.errors.map((err, i) => (
                <p key={i} className="!text-xs !text-rose-600 !flex !items-center !gap-1">
                  <XCircle className="!w-3 !h-3" /> {err}
                </p>
              ))}
            </div>
          )}
          {validation.warnings.length > 0 && (
            <div className="!space-y-1 !mt-2">
              {validation.warnings.map((warn, i) => (
                <p key={i} className="!text-xs !text-amber-600 !flex !items-center !gap-1">
                  <AlertCircle className="!w-3 !h-3" /> {warn}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Section */}
      <div className={`!rounded-2xl !p-6 !border ${
        isDark ? '!bg-gray-800/50 !border-gray-700/50' : '!bg-white !border-gray-200'
      }`}>
        <h3 className={`!text-lg !font-bold !mb-4 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>
          Subir Documento
        </h3>

        <div className="!grid md:!grid-cols-2 !gap-4 !mb-4">
          {/* Doc Type Select */}
          <div>
            <label className={`!block !text-sm !font-medium !mb-1.5 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>
              Tipo de documento
            </label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className={`!w-full !px-4 !py-3 !rounded-xl !text-sm !border !outline-none focus:!ring-2 focus:!ring-green-500 ${
                isDark ? '!bg-gray-700 !border-gray-600 !text-gray-200' : '!bg-gray-50 !border-gray-200 !text-gray-800'
              }`}
            >
              {Object.entries(docTypeLabels).map(([key, val]) => (
                <option key={key} value={key}>{val.label}{key === 'rut_empresa' ? ' *' : ''}</option>
              ))}
            </select>
            <p className={`!text-xs !mt-1 ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>
              {docTypeLabels[selectedDocType]?.description}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className={`!block !text-sm !font-medium !mb-1.5 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>
              Descripción (opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: RUT actualizado 2025"
              className={`!w-full !px-4 !py-3 !rounded-xl !text-sm !border !outline-none focus:!ring-2 focus:!ring-green-500 ${
                isDark ? '!bg-gray-700 !border-gray-600 !text-gray-200 !placeholder-gray-500' : '!bg-gray-50 !border-gray-200 !text-gray-800 !placeholder-gray-400'
              }`}
            />
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`!relative !border-2 !border-dashed !rounded-2xl !p-8 !text-center !cursor-pointer !transition-all ${
            uploading ? '!opacity-60 !pointer-events-none' : ''
          } ${
            dragActive
              ? '!border-green-500 !bg-green-50/50'
              : isDark
              ? '!border-gray-600 !bg-gray-700/30 hover:!border-gray-500'
              : '!border-gray-300 !bg-gray-50 hover:!border-green-400 hover:!bg-green-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="!hidden"
          />
          {uploading ? (
            <div className="!flex !flex-col !items-center !gap-3">
              <Loader2 className="!w-10 !h-10 !text-green-500 !animate-spin" />
              <p className={`!text-sm !font-medium ${isDark ? '!text-gray-300' : '!text-gray-600'}`}>Subiendo documento...</p>
            </div>
          ) : (
            <div className="!flex !flex-col !items-center !gap-3">
              <div className={`!w-14 !h-14 !rounded-2xl !flex !items-center !justify-center ${
                isDark ? '!bg-gray-600' : '!bg-green-100'
              }`}>
                <Upload className={`!w-7 !h-7 ${isDark ? '!text-gray-300' : '!text-green-600'}`} />
              </div>
              <div>
                <p className={`!text-sm !font-semibold ${isDark ? '!text-gray-200' : '!text-gray-700'}`}>
                  Arrastra tu archivo aquí o haz clic para seleccionar
                </p>
                <p className={`!text-xs !mt-1 ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>
                  PDF, JPG o PNG — Máximo 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Documents List */}
      <div className={`!rounded-2xl !p-6 !border ${
        isDark ? '!bg-gray-800/50 !border-gray-700/50' : '!bg-white !border-gray-200'
      }`}>
        <div className="!flex !items-center !justify-between !mb-5">
          <h3 className={`!text-lg !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>
            Documentos Subidos ({documents.length})
          </h3>
        </div>

        {documents.length > 0 ? (
          <div className="!space-y-3">
            {documents.map((doc) => {
              const st = statusConfig[doc.status] || statusConfig.pending;
              const StIcon = st.icon;
              return (
                <div
                  key={doc.id}
                  className={`!flex !items-center !gap-4 !p-4 !rounded-xl !border !transition-colors ${
                    isDark
                      ? '!bg-gray-700/30 !border-gray-600/50 hover:!bg-gray-700/50'
                      : '!bg-gray-50 !border-gray-100 hover:!bg-gray-100'
                  }`}
                >
                  {/* Icon */}
                  <div className={`!w-12 !h-12 !rounded-xl !flex !items-center !justify-center !flex-shrink-0 ${
                    doc.file.mimeType === 'application/pdf'
                      ? isDark ? '!bg-red-900/30 !text-red-400' : '!bg-red-100 !text-red-600'
                      : isDark ? '!bg-blue-900/30 !text-blue-400' : '!bg-blue-100 !text-blue-600'
                  }`}>
                    {doc.file.mimeType === 'application/pdf' ? (
                      <FileText className="!w-6 !h-6" />
                    ) : (
                      <File className="!w-6 !h-6" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="!flex-1 !min-w-0">
                    <p className={`!text-sm !font-semibold !truncate ${isDark ? '!text-gray-200' : '!text-gray-800'}`}>
                      {doc.file.fileName}
                    </p>
                    <div className="!flex !flex-wrap !items-center !gap-2 !mt-1">
                      <span className={`!text-xs !px-2 !py-0.5 !rounded-full !font-medium ${
                        isDark ? '!bg-gray-600 !text-gray-300' : '!bg-indigo-50 !text-indigo-700'
                      }`}>
                        {docTypeLabels[doc.docType]?.label || doc.docType}
                      </span>
                      <span className={`!text-xs ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>
                        {formatFileSize(doc.file.sizeBytes)}
                      </span>
                      <span className={`!text-xs ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>
                        {new Date(doc.uploadedAt).toLocaleDateString('es-CL')}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className={`!flex !items-center !gap-1.5 !px-2.5 !py-1 !rounded-full !text-xs !font-bold ${st.bg} ${st.color}`}>
                    <StIcon className="!w-3.5 !h-3.5" />
                    {st.label}
                  </div>

                  {/* Actions */}
                  <div className="!flex !items-center !gap-1">
                    <button
                      onClick={() => handleDownload(doc.id)}
                      className={`!p-2 !rounded-lg !transition-colors !border-0 ${
                        isDark ? '!bg-gray-600 hover:!bg-gray-500 !text-gray-300' : '!bg-gray-200 hover:!bg-gray-300 !text-gray-600'
                      }`}
                      title="Descargar"
                    >
                      <Download className="!w-4 !h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleting === doc.id}
                      className={`!p-2 !rounded-lg !transition-colors !border-0 ${
                        isDark ? '!bg-gray-600 hover:!bg-rose-900/50 !text-gray-300 hover:!text-rose-400' : '!bg-gray-200 hover:!bg-rose-100 !text-gray-600 hover:!text-rose-600'
                      } disabled:!opacity-50`}
                      title="Eliminar"
                    >
                      {deleting === doc.id ? (
                        <Loader2 className="!w-4 !h-4 !animate-spin" />
                      ) : (
                        <Trash2 className="!w-4 !h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="!text-center !py-12">
            <div className={`!w-16 !h-16 !rounded-2xl !mx-auto !mb-4 !flex !items-center !justify-center ${
              isDark ? '!bg-gray-700' : '!bg-gray-100'
            }`}>
              <FileText className={`!w-8 !h-8 ${isDark ? '!text-gray-500' : '!text-gray-300'}`} />
            </div>
            <p className={`!font-medium ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>No hay documentos subidos</p>
            <p className={`!text-xs !mt-1 ${isDark ? '!text-gray-600' : '!text-gray-400'}`}>
              Sube tu primer documento usando la zona de carga superior
            </p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className={`!rounded-2xl !p-5 !border ${
        isDark ? '!bg-blue-900/20 !border-blue-800/30' : '!bg-blue-50 !border-blue-200'
      }`}>
        <div className="!flex !items-start !gap-3">
          <Info className={`!w-5 !h-5 !mt-0.5 !flex-shrink-0 ${isDark ? '!text-blue-400' : '!text-blue-600'}`} />
          <div>
            <h4 className={`!text-sm !font-bold !mb-1 ${isDark ? '!text-blue-300' : '!text-blue-800'}`}>Documentos Requeridos</h4>
            <ul className={`!text-xs !space-y-1 ${isDark ? '!text-blue-400/80' : '!text-blue-700'}`}>
              <li>• <strong>RUT Empresa</strong> — Obligatorio para completar la validación</li>
              <li>• <strong>Escritura de Constitución</strong> — Opcional, agiliza la aprobación</li>
              <li>• <strong>Cédula del Representante Legal</strong> — Opcional (anverso y reverso)</li>
              <li>• <strong>Poder Notarial</strong> — Opcional, si el contacto no es representante legal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsView;
