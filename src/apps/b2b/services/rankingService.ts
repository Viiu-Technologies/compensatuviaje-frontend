import api from '../../../shared/services/api';

export type RankingPeriod = 'all' | 'year' | 'month';

export interface RankingEntry {
  position: number;
  companyId: string;
  razonSocial: string;
  companyType: string;
  tonsTco2: number;
  ordersCount: number;
  isCurrentCompany: boolean;
}

export interface RankingResponse {
  ranking: RankingEntry[];
  period: RankingPeriod;
  total: number;
}

export const getB2BRanking = async (
  period: RankingPeriod = 'all',
  limit = 20,
): Promise<RankingResponse> => {
  const res = await api.get<RankingResponse>('/b2b/ranking', {
    params: { period, limit },
  });
  return res.data;
};
