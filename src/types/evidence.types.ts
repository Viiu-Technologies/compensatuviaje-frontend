// ============================================
// EVIDENCE TYPES - Phase 2
// ============================================

export type EvidenceType = 'initial' | 'monthly_restock';
export type EvidenceStatus = 'pending_approval' | 'approved' | 'rejected';
export type EvidenceFileType = 'photo' | 'technical_doc' | 'operational_doc';

export interface ProjectEvidenceFile {
  id: string;
  fileType: EvidenceFileType;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageUrl: string;
  thumbnailUrl?: string | null;
  signedUrl?: string | null;
  createdAt: string;
}

export interface ProjectEvidence {
  id: string;
  periodMonth: string;
  evidenceType: EvidenceType;
  status: EvidenceStatus;
  note?: string | null;
  unitsDelivered?: number | null;
  unitsVerified?: number | null;
  newStockRequested?: number | null;
  newStockApproved?: number | null;
  payoutApproved: boolean;
  payoutAmount?: number | null;
  adminNotes?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  files: ProjectEvidenceFile[];
  // Summary counts
  photosCount: number;
  docsCount: number;
}

export interface EvidenceListResponse {
  success: boolean;
  data: {
    projectId: string;
    evidences: ProjectEvidence[];
    totalCount: number;
    pendingCount: number;
  };
}

export interface SubmitMonthlyEvidenceRequest {
  unitsDelivered: number;
  newStockRequested: number;
  note?: string;
}

export interface ApproveMonthlyEvidenceRequest {
  unitsVerified: number;
  newStockApproved: number;
  providerCostOverride?: number;
  adminNotes?: string;
}

export interface RejectMonthlyEvidenceRequest {
  reason: string;
  freezeStock?: boolean;
}

// Impact unit types for partner form dropdown
export const IMPACT_UNIT_TYPES = [
  { value: 'Árbol', label: '🌳 Árbol' },
  { value: 'Kilogramo', label: '⚖️ Kilogramo' },
  { value: 'Metro Cúbico', label: '💧 Metro Cúbico' },
  { value: 'Hectárea', label: '🌿 Hectárea' },
  { value: 'Tonelada', label: '📦 Tonelada' },
  { value: 'Unidad', label: '📋 Unidad' },
] as const;

export const EVIDENCE_STATUS_LABELS: Record<EvidenceStatus, string> = {
  pending_approval: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

export const EVIDENCE_STATUS_COLORS: Record<EvidenceStatus, string> = {
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};
