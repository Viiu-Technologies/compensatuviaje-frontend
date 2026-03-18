// ============================================
// PDF UPLOADER COMPONENT
// Componente reutilizable para subir archivos PDF
// ============================================

/**
 * CONCEPTO: Este es un "componente controlado".
 * 
 * En React, los componentes pueden ser:
 * - Controlados: El padre controla el estado (a través de props)
 * - No controlados: El componente maneja su propio estado interno
 * 
 * Aquí usamos un patrón híbrido:
 * - El archivo seleccionado se comunica al padre via onFileSelect
 * - Pero mantenemos estado interno para preview y drag&drop
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface PdfUploaderProps {
  /** Callback cuando se selecciona un archivo válido */
  onFileSelect: (file: File) => void;
  /** Tamaño máximo en MB (default: 10) */
  maxSizeMB?: number;
  /** Deshabilitar el componente */
  disabled?: boolean;
  /** Mostrar estado de carga */
  isUploading?: boolean;
  /** Nombre del archivo actual (si existe) */
  currentFileName?: string;
  /** Texto de instrucción personalizado */
  instruction?: string;
  /** Clase CSS adicional */
  className?: string;
}

interface ValidationError {
  type: 'size' | 'format';
  message: string;
}

// ============================================
// COMPONENT
// ============================================

const PdfUploader: React.FC<PdfUploaderProps> = ({
  onFileSelect,
  maxSizeMB = 10,
  disabled = false,
  isUploading = false,
  currentFileName,
  instruction = 'Arrastra tu archivo aquí o haz clic para seleccionar',
  className = ''
}) => {
  // Estado interno
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<ValidationError | null>(null);
  
  // Ref al input de archivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Calcular tamaño máximo en bytes
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  /**
   * CONCEPTO: Validación del archivo
   * 
   * Validamos dos cosas:
   * 1. Tipo MIME: Solo aceptamos PDFs
   * 2. Tamaño: No puede exceder el máximo permitido
   */
  const validateFile = useCallback((file: File): ValidationError | null => {
    // Validar tipo MIME
    if (file.type !== 'application/pdf') {
      return {
        type: 'format',
        message: 'Solo se permiten archivos PDF'
      };
    }
    
    // Validar tamaño
    if (file.size > maxSizeBytes) {
      return {
        type: 'size',
        message: `El archivo excede el tamaño máximo de ${maxSizeMB}MB`
      };
    }
    
    return null;
  }, [maxSizeBytes, maxSizeMB]);

  /**
   * Procesar archivo seleccionado
   */
  const handleFile = useCallback((file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  /**
   * CONCEPTO: Drag & Drop API
   * 
   * HTML5 tiene una API nativa para drag & drop.
   * Debemos manejar varios eventos:
   * - dragenter/dragleave: Para mostrar feedback visual
   * - dragover: Necesario para permitir el drop (prevenir default)
   * - drop: Cuando el usuario suelta el archivo
   */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled || isUploading) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  /**
   * Manejar selección desde input file
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  /**
   * Abrir selector de archivos
   */
  const openFileSelector = () => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Limpiar selección
   */
  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Formatear tamaño de archivo
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Determinar clases CSS según estado
  const containerClasses = `
    !relative !border-2 !border-dashed !rounded-xl !p-8 !text-center !transition-all !duration-200 !cursor-pointer
    ${isDragging 
      ? '!border-emerald-500 !bg-emerald-50' 
      : error 
        ? '!border-red-300 !bg-red-50' 
        : selectedFile || currentFileName
          ? '!border-emerald-300 !bg-emerald-50'
          : '!border-slate-300 !bg-slate-50 hover:!border-emerald-400 hover:!bg-emerald-50/50'
    }
    ${disabled || isUploading ? '!opacity-60 !cursor-not-allowed' : ''}
    ${className}
  `;

  return (
    <div
      className={containerClasses}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={openFileSelector}
    >
      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleInputChange}
        className="!hidden"
        disabled={disabled || isUploading}
      />

      {/* Estado: Subiendo */}
      {isUploading && (
        <div className="!flex !flex-col !items-center !gap-3">
          <div className="!w-12 !h-12 !border-4 !border-emerald-200 !border-t-emerald-600 !rounded-full !animate-spin" />
          <p className="!text-slate-600 !font-medium">Subiendo archivo...</p>
        </div>
      )}

      {/* Estado: Error */}
      {!isUploading && error && (
        <div className="!flex !flex-col !items-center !gap-3">
          <div className="!w-14 !h-14 !rounded-full !bg-red-100 !flex !items-center !justify-center">
            <AlertCircle className="!w-7 !h-7 !text-red-500" />
          </div>
          <p className="!text-red-600 !font-medium">{error.message}</p>
          <p className="!text-sm !text-slate-500">Haz clic para seleccionar otro archivo</p>
        </div>
      )}

      {/* Estado: Archivo seleccionado */}
      {!isUploading && !error && (selectedFile || currentFileName) && (
        <div className="!flex !flex-col !items-center !gap-3">
          <div className="!w-14 !h-14 !rounded-full !bg-emerald-100 !flex !items-center !justify-center">
            <CheckCircle className="!w-7 !h-7 !text-emerald-600" />
          </div>
          <div className="!flex !items-center !gap-2">
            <File className="!w-5 !h-5 !text-emerald-600" />
            <span className="!text-slate-700 !font-medium !max-w-xs !truncate">
              {selectedFile?.name || currentFileName}
            </span>
            {selectedFile && (
              <span className="!text-sm !text-slate-500">
                ({formatFileSize(selectedFile.size)})
              </span>
            )}
          </div>
          {!disabled && (
            <button
              onClick={clearSelection}
              className="!flex !items-center !gap-1 !text-sm !text-slate-500 hover:!text-red-500 !transition-colors !bg-transparent !border-0 !cursor-pointer"
            >
              <X className="!w-4 !h-4" />
              Cambiar archivo
            </button>
          )}
        </div>
      )}

      {/* Estado: Vacío (listo para recibir archivo) */}
      {!isUploading && !error && !selectedFile && !currentFileName && (
        <div className="!flex !flex-col !items-center !gap-3">
          <div className={`!w-14 !h-14 !rounded-full !flex !items-center !justify-center !transition-colors ${
            isDragging ? '!bg-emerald-200' : '!bg-slate-200'
          }`}>
            <Upload className={`!w-7 !h-7 ${isDragging ? '!text-emerald-600' : '!text-slate-500'}`} />
          </div>
          <div>
            <p className="!text-slate-700 !font-medium">{instruction}</p>
            <p className="!text-sm !text-slate-500 !mt-1">
              Formato: PDF • Máximo: {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfUploader;
