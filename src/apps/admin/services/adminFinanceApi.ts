// ============================================
// Finanzas: fondo y liquidaciones a partners (CTV-41)
//
// El interceptor de `api` ya extrae response.data, así que lo que devuelve
// cada llamada es directamente {success, data, ...}.
// ============================================

import api from '../../../shared/services/api';

const BASE = '/admin/finance';

export interface FundPartner {
  partnerId: string;
  name: string | null;
  rut: string | null;
  /** Todo lo que le corresponde por ventas, pagado o no. */
  accrued: number;
  paid: number;
  /** unsettled + pendingSettlements */
  owed: number;
  /** Vendido, aún sin liquidación. */
  unsettled: number;
  /** En una liquidación generada, sin pagar. */
  pendingSettlements: number;
  sales: number;
}

export interface FundReport {
  currency: 'CLP';
  balance: number;
  collected: { total: number; partners: number; platform: number; b2c: number; b2b: number };
  paidToPartners: number;
  refunded: number;
  owedToPartners: { total: number; unsettled: number; pendingSettlements: number };
  platformFees: number;
  unassignedPayout: number;
  partners: FundPartner[];
  warnings: { legacyB2cWithoutSnapshot: number; refundsNotAllocated: boolean };
}

export interface PartnerSettlement {
  id: string;
  partnerId: string;
  periodMonth: string;
  /** Correlativo dentro del mes por partner (un mes puede tener varias). */
  sequence: number;
  totalAmountCollected: number;
  platformFee: number;
  partnerAmountOwed: number;
  status: 'pending' | 'paid';
  paidAt: string | null;
  paymentReference: string | null;
  createdAt: string;
  partner?: { name: string; rut: string | null; contact_email: string | null } | null;
}

export interface GenerateSettlementsResult {
  settlements: PartnerSettlement[];
  message: string;
  skippedLegacy: number;
  /** Liquidaciones nuevas abiertas en esta corrida. */
  created: number;
  /** Liquidaciones pendientes a las que se sumaron ventas. */
  updated: number;
}

/** LIQ-2026-11-02: mismo formato que usa el backend en sus mensajes. */
export const settlementCode = (s: Pick<PartnerSettlement, 'periodMonth' | 'sequence'>) =>
  `LIQ-${s.periodMonth}-${String(s.sequence || 1).padStart(2, '0')}`;

export const getFund = async (): Promise<FundReport> => {
  const response = await api.get(`${BASE}/fund`) as any;
  return response.data;
};

export const getSettlements = async (month?: string): Promise<PartnerSettlement[]> => {
  const response = await api.get(`${BASE}/settlements`, { params: month ? { month } : undefined }) as any;
  return response.data || [];
};

export const generateSettlements = async (month: string): Promise<GenerateSettlementsResult> => {
  const response = await api.post(`${BASE}/settlements/generate`, { month }) as any;
  return {
    settlements: response.data || [],
    message: response.message || '',
    skippedLegacy: response.meta?.skippedLegacy || 0,
    created: response.meta?.created || 0,
    updated: response.meta?.updated || 0,
  };
};

export const paySettlement = async (
  id: string,
  body: { payment_reference: string; payment_date?: string }
): Promise<PartnerSettlement> => {
  const response = await api.put(`${BASE}/settlements/${id}/pay`, body) as any;
  return response.data;
};
