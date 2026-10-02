import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Trophy } from 'lucide-react';
import { getB2BRanking, type RankingEntry, type RankingPeriod } from '../../services/rankingService';
import { Badge, btn, Card, cx, EmptyState, ErrorState, fmtInt, fmtNum, PageHeader, Skeleton } from '../../ui';

const COMPANY_TYPE_LABEL: Record<string, string> = {
  TRAVEL_AGENCY: 'Aerolíneas y agencias',
  TRANSPORT: 'Transporte',
  LOGISTICS: 'Logística',
  CORPORATE: 'Corporativo',
  EVENTS: 'Eventos',
  OTHER: 'Otro',
};

const PERIODS: { value: RankingPeriod; label: string }[] = [
  { value: 'all', label: 'Todo el tiempo' },
  { value: 'year', label: 'Último año' },
  { value: 'month', label: 'Último mes' },
];

// Oro, plata y bronce solo en el número del puesto; el resto usa la marca.
const MEDAL: Record<number, string> = {
  1: 'bg-amber-100 text-amber-800',
  2: 'bg-gray-200 text-gray-700',
  3: 'bg-orange-100 text-orange-800',
};

const RankingView: React.FC = () => {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [period, setPeriod] = useState<RankingPeriod>('all');

  const load = useCallback(async (p: RankingPeriod) => {
    setLoading(true);
    setFailed(false);
    try {
      const data = await getB2BRanking(p);
      setRanking(data?.ranking ?? []);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(period);
  }, [load, period]);

  const max = Math.max(0, ...ranking.map((r) => Number(r.tonsTco2) || 0));
  const me = ranking.find((r) => r.isCurrentCompany);

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Ranking de empresas"
        subtitle="Empresas que más toneladas de CO₂ han compensado en la plataforma."
        actions={
          <button type="button" onClick={() => load(period)} disabled={loading} className={btn.secondary}>
            <RefreshCw className={cx('w-4 h-4', loading && 'animate-spin')} aria-hidden="true" />
            Actualizar
          </button>
        }
      />

      <div className="flex gap-2 flex-wrap" role="group" aria-label="Periodo">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            aria-pressed={period === p.value}
            onClick={() => setPeriod(p.value)}
            className={cx(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium cursor-pointer transition-colors',
              period === p.value ? 'bg-brand-700 border-brand-700 text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton className="h-80" />
      ) : failed ? (
        <ErrorState title="No pudimos cargar el ranking" onRetry={() => load(period)} />
      ) : ranking.length === 0 ? (
        <Card>
          <EmptyState icon={Trophy} title="Aún no hay compensaciones en este periodo" text="El ranking se arma con las órdenes aprobadas de cada empresa." />
        </Card>
      ) : (
        <>
          {me && (
            <Card className="p-5">
              <p className="m-0 text-sm text-gray-500">Tu empresa</p>
              <p className="m-0 mt-1 text-lg font-semibold text-gray-900">
                Puesto {fmtInt(me.position)} de {fmtInt(ranking.length)}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  · {fmtNum(me.tonsTco2, 1)} t compensadas · {fmtInt(me.ordersCount)} {me.ordersCount === 1 ? 'orden' : 'órdenes'}
                </span>
              </p>
            </Card>
          )}

          <Card className="p-0">
            <ol className="m-0 p-0 list-none">
              {ranking.map((entry) => {
                const tons = Number(entry.tonsTco2) || 0;
                return (
                  <li
                    key={entry.companyId}
                    className={cx(
                      'relative flex items-center gap-4 px-5 py-4 border-t border-gray-100 first:border-t-0',
                      entry.isCurrentCompany && 'bg-brand-50/50 before:absolute before:left-0 before:inset-y-0 before:w-[3px] before:bg-brand-600',
                    )}
                  >
                    <span
                      className={cx(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold tabular-nums flex-shrink-0',
                        MEDAL[entry.position] ?? 'bg-gray-100 text-gray-500',
                      )}
                    >
                      {entry.position}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="m-0 text-sm font-semibold text-gray-900 truncate">{entry.razonSocial}</p>
                        {entry.isCurrentCompany && <Badge tone="success">Tu empresa</Badge>}
                        <span className="text-xs text-gray-500">{COMPANY_TYPE_LABEL[entry.companyType] ?? entry.companyType}</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden" aria-hidden="true">
                        <div className="h-full rounded-full bg-brand-600" style={{ width: `${max ? Math.max(2, (tons / max) * 100) : 0}%` }} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="m-0 text-base font-semibold text-gray-900 tabular-nums">{fmtNum(tons, 1)} t</p>
                      <p className="m-0 text-xs text-gray-500">{fmtInt(entry.ordersCount)} {entry.ordersCount === 1 ? 'orden' : 'órdenes'}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </>
      )}
    </div>
  );
};

export default RankingView;
