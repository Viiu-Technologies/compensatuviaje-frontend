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
  /** Vuelos sin fecha en la planilla: se registraron con la fecha de carga. */
  rowsWithoutDate?: number;
  totalTonsCO2e: number;
  monthlySummaries: MonthlySummary[];
  errors: string[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * GET /api/b2b/reports/emissions?desde=&hasta=
 * Informe Excel con una fila por vuelo (con y sin forzamiento radiativo),
 * resumen por mes y metodología. Fechas opcionales en formato AAAA-MM-DD.
 */
export const downloadEmissionsReport = async (desde?: string, hasta?: string): Promise<Blob> => {
  try {
    const blob = (await api.get('/b2b/reports/emissions', {
      params: { ...(desde && { desde }), ...(hasta && { hasta }) },
      responseType: 'blob',
    })) as unknown as Blob;
    if (!(blob instanceof Blob)) throw new Error('Respuesta inesperada del servidor.');
    return blob;
  } catch (err: any) {
    // Con responseType 'blob', el mensaje de error del servidor también llega como Blob.
    const data = err?.response?.data;
    if (data instanceof Blob) {
      const message = await data.text().then((t) => JSON.parse(t)?.message).catch(() => null);
      if (message) throw new Error(message);
    }
    throw err;
  }
};

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
