import React, { useCallback, useState, useRef } from 'react';
import { FileText, Upload, X } from 'lucide-react';

interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  label?: string;
  description?: string;
  required?: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  accept = 'image/*,.pdf',
  multiple = true,
  maxFiles = 10,
  maxSizeMB = 15,
  label = 'Subir archivos',
  description = 'Arrastra o haz clic para seleccionar',
  required = false,
  files,
  onFilesChange,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (newFiles: File[]): File[] => {
      setError(null);
      const maxSize = maxSizeMB * 1024 * 1024;
      const valid: File[] = [];

      for (const file of newFiles) {
        if (file.size > maxSize) {
          setError(`${file.name} excede el tamaño máximo de ${maxSizeMB}MB`);
          continue;
        }
        valid.push(file);
      }

      const total = files.length + valid.length;
      if (total > maxFiles) {
        setError(`Máximo ${maxFiles} archivos permitidos`);
        return valid.slice(0, maxFiles - files.length);
      }

      return valid;
    },
    [files, maxFiles, maxSizeMB]
  );

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;
      const validated = validateFiles(Array.from(newFiles));
      if (validated.length > 0) {
        onFilesChange([...files, ...validated]);
      }
    },
    [files, onFilesChange, validateFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      const updated = [...files];
      updated.splice(index, 1);
      onFilesChange(updated);
    },
    [files, onFilesChange]
  );

  const isImage = (file: File) => file.type.startsWith('image/');

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-rose-600 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`${label}: ${description}`}
        aria-disabled={disabled || undefined}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700
          transition-all duration-200
          ${isDragging
            ? 'border-brand-600 bg-brand-50'
            : 'border-gray-300 hover:border-brand-600 hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-2">
          <Upload className="mx-auto w-7 h-7 text-slate-400" aria-hidden="true" />
          <p className="text-sm text-gray-600">{description}</p>
          <p className="text-xs text-gray-400">
            Máx. {maxSizeMB}MB por archivo · {maxFiles} archivos
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-rose-700" role="alert">
          {error}
        </p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Thumbnail or icon */}
              {isImage(file) ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                  <FileText className="w-5 h-5" aria-hidden="true" />
                </div>
              )}

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
              </div>

              {/* Remove button */}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  aria-label={`Quitar ${file.name}`}
                  className="text-gray-400 hover:text-rose-600 transition-colors p-1 border-0 bg-transparent cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
