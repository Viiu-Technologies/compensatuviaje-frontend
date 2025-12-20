// ============================================
// DOCUMENT TYPES
// ============================================

// Tipos de documento
export type DocumentType = 
  | 'contrato_servicio'
  | 'rut_empresa'
  | 'poder_representante'
  | 'certificado_vigencia';

// Configuración de documentos
export interface DocumentTypeConfig {
  name: string;
  required: boolean;
  description: string;
}

export interface DocumentConfig {
  documentTypes: Record<DocumentType, DocumentTypeConfig>;
  maxFileSize: number;
  allowedMimeTypes: string[];
  maxFileSizeMB: number;
}

// Documento de empresa
export interface CompanyDocument {
  id: string;
  docType: DocumentType;
  status: string;
  uploadedAt: string;
  file: {
    id: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    checksum?: string;
  };
}

// Lista de documentos response
export interface DocumentListResponse {
  success: boolean;
  data: CompanyDocument[];
  count: number;
  documentTypes: Record<DocumentType, DocumentTypeConfig>;
}

// Upload response
export interface UploadDocumentResponse {
  success: boolean;
  message: string;
  data: {
    document: {
      id: string;
      docType: DocumentType;
      status: string;
      uploadedAt: string;
    };
    file: {
      id: string;
      fileName: string;
      mimeType: string;
      sizeBytes: number;
    };
    metadata: {
      checksum: string;
      uploadDuration: number;
    };
  };
}

// Validación de documentos
export interface DocumentSummaryItem {
  name: string;
  required: boolean;
  uploaded: number;
  status: 'complete' | 'missing' | 'optional';
}

export interface DocumentValidationResponse {
  success: boolean;
  data: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    documentSummary: Record<DocumentType, DocumentSummaryItem>;
    completionPercentage: number;
  };
}
