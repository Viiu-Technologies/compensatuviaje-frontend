import api from '../../../shared/services/api';

export interface B2BCertificate {
  id: string;
  number: string;
  tonsCompensated: number;
  totalAmountClp: number;
  scope: string;
  status: 'issued' | 'draft' | 'revoked';
  pdfUrl: string | null;
  issuedAt: string | null;
  createdAt: string;
  project: {
    name: string | null;
    type: string | null;
    country: string | null;
  } | null;
  projects: Array<{
    name: string | null;
    allocationTons: number;
    type: string | null;
    country: string | null;
  }>;
}

export interface CertificatesListResponse {
  certificates: B2BCertificate[];
  total: number;
}

/**
 * GET /api/b2b/certificates — Bóveda de Certificados
 */
export const getMyCertificates = async (): Promise<CertificatesListResponse> => {
  const response = await api.get('/b2b/certificates') as any;
  return {
    certificates: response.certificates || [],
    total: response.total || 0
  };
};
