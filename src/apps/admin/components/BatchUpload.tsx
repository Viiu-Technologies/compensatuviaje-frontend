import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Download, 
  History,
  FileSpreadsheet,
  ArrowRight,
  Loader2,
  RefreshCcw
} from 'lucide-react';

interface UploadHistory {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'completed' | 'failed' | 'partial';
  totalRows: number;
  successRows: number;
  errorRows: number;
}

const BatchUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadHistory] = useState<UploadHistory[]>([
    {
      id: '1',
      fileName: 'viajes_octubre_2023.csv',
      uploadDate: '2023-10-25T14:30:00Z',
      status: 'completed',
      totalRows: 150,
      successRows: 150,
      errorRows: 0
    },
    {
      id: '2',
      fileName: 'viajes_noviembre_v1.xlsx',
      uploadDate: '2023-11-02T09:15:00Z',
      status: 'partial',
      totalRows: 200,
      successRows: 185,
      errorRows: 15
    }
  ]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const simulateUpload = () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadStatus('success');
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const resetUpload = () => {
    setFile(null);
    setUploadStatus('idle');
    setProgress(0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Completado
          </span>
        );
      case 'partial':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Parcial
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <X className="w-3 h-3" /> Fallido
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Carga Masiva</h1>
          <p className="text-slate-400 mt-1">Sube archivos CSV o Excel para procesar múltiples registros de viajes.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700">
          <Download className="w-4 h-4" />
          <span>Descargar Plantilla</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            className={`relative group overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ${
              isDragging 
                ? 'border-emerald-500 bg-emerald-500/5' 
                : file 
                  ? 'border-indigo-500/50 bg-indigo-500/5' 
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="p-12 flex flex-col items-center text-center">
              {!file ? (
                <>
                  <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-10 h-10 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Arrastra tu archivo aquí</h3>
                  <p className="text-slate-400 mb-8 max-w-xs">
                    Soporta formatos .csv y .xlsx hasta 20MB.
                  </p>
                  <label className="cursor-pointer px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20">
                    Seleccionar Archivo
                    <input type="file" className="hidden" onChange={handleFileSelect} accept=".csv,.xlsx" />
                  </label>
                </>
              ) : (
                <div className="w-full max-w-md animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                      <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-white font-medium truncate">{file.name}</p>
                      <p className="text-slate-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {uploadStatus === 'idle' && !uploading && (
                      <button onClick={resetUpload} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {uploading ? (
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Subiendo...
                        </span>
                        <span className="text-indigo-400 font-medium">{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : uploadStatus === 'success' ? (
                    <div className="space-y-6">
                      <div className="flex flex-col items-center gap-3 py-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h4 className="text-xl font-semibold text-white">¡Carga Exitosa!</h4>
                        <p className="text-slate-400">El archivo ha sido procesado correctamente.</p>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={resetUpload}
                          className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all border border-slate-700 flex items-center justify-center gap-2"
                        >
                          <RefreshCcw className="w-4 h-4" /> Nueva Carga
                        </button>
                        <button className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                          Ver Resultados <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={simulateUpload}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                    >
                      Comenzar Carga <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-400" />
              Instrucciones de Carga
            </h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-indigo-400 mt-0.5 shrink-0">1</div>
                <span>Asegúrate de que el archivo use la plantilla oficial para evitar errores de formato.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-indigo-400 mt-0.5 shrink-0">2</div>
                <span>Las columnas obligatorias son: Fecha, Origen, Destino, Distancia y Tipo de Vehículo.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-indigo-400 mt-0.5 shrink-0">3</div>
                <span>El sistema validará automáticamente cada fila antes de guardarla en la base de datos.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* History Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              Historial
            </h3>
            <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
              Ver todo
            </button>
          </div>

          <div className="space-y-4">
            {uploadHistory.map((upload) => (
              <div 
                key={upload.id}
                className="bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                      <FileText className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm truncate max-w-[120px]">
                        {upload.fileName}
                      </h4>
                      <p className="text-slate-500 text-xs">
                        {new Date(upload.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(upload.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/50">
                  <div className="text-center p-2 rounded-lg bg-slate-800/30">
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider">Éxito</p>
                    <p className="text-emerald-400 font-bold">{upload.successRows}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-800/30">
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider">Error</p>
                    <p className="text-rose-400 font-bold">{upload.errorRows}</p>
                  </div>
                </div>

                {upload.errorRows > 0 && (
                  <button className="w-full mt-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center justify-center gap-1 transition-colors">
                    <Download className="w-3 h-3" /> Descargar Errores
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchUpload;
