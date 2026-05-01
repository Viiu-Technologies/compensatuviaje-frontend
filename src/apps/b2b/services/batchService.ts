import api from '../../../shared/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BatchStatus = 'uploaded' | 'validating' | 'processing' | 'done' | 'failed';

export interface BatchMetrics {
  rowsTotal: number;
  rowsSuccess: number;
  rowsFailed: number;
  totalTonsCO2e: number;
}

export interface MonthlySummary {
  periodMonth: string;
  flightsCount: number;
  passengers: number;
  distanceKm: number;
  emissionsTco2: number;
  coveragePct: number;
}

export interface UploadBatch {
  id: string;
  filename: string;
  sizeBytes: number;
  rowsCount: number | null;
  status: BatchStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  metrics: BatchMetrics | null;
}

export interface UploadBatchDetail extends UploadBatch {
  metrics: (BatchMetrics & { monthlySummaries: MonthlySummary[]; errors: string[] }) | null;
}

export interface UploadBatchResult {
  success: boolean;
  batchId: string;
  filename: string;
  status: BatchStatus;
  rowsTotal: number;
  rowsProcessed: number;
  rowsFailed: number;
  totalTonsCO2e: number;
  monthlySummaries: MonthlySummary[];
  errors: string[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * POST /api/b2b/upload-batch
 * Upload a CSV/Excel manifest file and get an EmissionSummary.
 */
export const uploadManifest = async (
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadBatchResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<FormData, UploadBatchResult>(
    '/b2b/upload-batch',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (e) => {
            const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
            onProgress(pct);
          }
        : undefined,
    } as any
  );

  return response;
};

/**
 * GET /api/b2b/upload-batches
 * List all upload batches for the company.
 */
export const listBatches = async (): Promise<{ batches: UploadBatch[] }> => {
  return api.get('/b2b/upload-batches');
};

/**
 * GET /api/b2b/upload-batches/:id
 * Get detail of a specific batch.
 */
export const getBatchDetail = async (id: string): Promise<{ batch: UploadBatchDetail }> => {
  return api.get(`/b2b/upload-batches/${id}`);
};
