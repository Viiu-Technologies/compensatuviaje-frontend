import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, RefreshCw, Rss } from 'lucide-react';
import { toast } from 'sonner';
import adminNewsApi from '../services/adminNewsApi';
import type { NewsHealth, NewsStats, AdminNewsSourceFull } from '../../../types/news.types';
import {
  KpiCard,
  PageHeader,
  Panel,
  Skeleton,
  StatusBadge,
  formatInt,
  formatTime,
} from '../ui';

/**
 * Salud del módulo de noticias.
 *
 * El embudo es el diagnóstico de un vistazo: si "extraídos" cae mucho respecto
 * a "descubiertos" hay un problema de extracción; si "publicados" se estanca,
 * nadie está revisando. Los descartes van en gris y con sangría: antes usaban
 * el mismo verde que las etapas que avanzan y parecían progreso.
 */

// Montos en dólares con formato chileno (coma decimal): "US$ 0,0012".
const usd = (n: number | null | undefined, maxDecimals = 4) =>
  `US$ ${(n ?? 0).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: maxDecimals })}`;

const FunnelRow: React.FC<{ label: string; value: number; max: number; discard?: boolean }> = ({ label, value, max, discard }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <li className={`adm-funnel__row${discard ? ' adm-funnel__row--discard' : ''}`}>
      <span className="adm-funnel__label">{discard ? `− ${label}` : label}</span>
      <span className="adm-funnel__track" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
      <span className="adm-funnel__value">
        {formatInt(value)}
        <small>{pct} %</small>
      </span>
    </li>
  );
};

const NewsHealthPage: React.FC = () => {
  const [health, setHealth] = useState<NewsHealth | null>(null);
  const [stats, setStats] = useState<NewsStats | null>(null);
  const [sources, setSources] = useState<AdminNewsSourceFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const [h, s, src] = await Promise.all([
        adminNewsApi.getHealth(),
        adminNewsApi.getStats(),
        adminNewsApi.getSources(),
      ]);
      setHealth(h.data);
      setStats(s.data);
      setSources(src.data || []);
      setUpdatedAt(new Date());
    } catch {
      toast.error('No se pudo cargar el estado del módulo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const header = (
    <PageHeader
      title="Salud de noticias"
      description="Embudo, costo y fuentes del módulo de noticias. Las alertas también llegan por Telegram."
      actions={
        <button type="button" className="adm-btn" onClick={load} disabled={loading}>
          <RefreshCw aria-hidden="true" />
          {updatedAt ? `Actualizado ${formatTime(updatedAt)}` : 'Actualizar'}
        </button>
      }
    />
  );

  if (loading && !health) {
    return (
      <div className="adm-page" aria-busy="true">
        {header}
        <div className="adm-kpis">{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={110} />)}</div>
        <Skeleton height={300} />
      </div>
    );
  }

  const embudo = stats?.embudo;
  const max = embudo?.descubiertos || 1;
  const alertas = health?.alertas ?? [];
  const failing = sources.filter((s) => s.active && s.consecutiveFailures > 0);
  const pending = health?.revisionPendiente ?? 0;
  const overBudget = (health?.gasto24hUsd ?? 0) >= (health?.presupuestoDiarioUsd ?? Infinity);

  return (
    <div className="adm-page">
      {header}

      {alertas.map((a, i) => (
        <div key={i} role="alert" className={`adm-alert ${a.nivel === 'critical' ? 'adm-alert--danger' : 'adm-alert--warning'}`}>
          <AlertTriangle aria-hidden="true" />
          <div>
            <b>{a.mensaje}</b>
            {a.detalle && a.detalle.length > 0 && (
              <div className="adm-alert__detail">
                {a.detalle.slice(0, 8).join(' · ')}
                {a.detalle.length > 8 && ` … y ${a.detalle.length - 8} más`}
              </div>
            )}
          </div>
        </div>
      ))}

      {health && alertas.length === 0 && (
        <div role="status" className="adm-alert adm-alert--success">
          <CheckCircle2 aria-hidden="true" />
          <div>Todo en orden. No hay alertas activas.</div>
        </div>
      )}

      <div className="adm-kpis">
        <KpiCard
          label="Fuentes activas"
          value={`${formatInt(health?.fuentes?.activas)} de ${formatInt(health?.fuentes?.totales)}`}
          context={health?.fuentes?.sinResultados
            ? <StatusBadge tone="warning">{formatInt(health.fuentes.sinResultados)} sin resultados</StatusBadge>
            : 'Todas trayendo artículos'}
        />
        <KpiCard
          label="Por revisar"
          value={formatInt(pending)}
          context={pending > 50 ? <StatusBadge tone="warning">Cola acumulada</StatusBadge> : 'Artículos esperando revisión'}
        />
        <KpiCard
          label="Gasto de IA, últimas 24 h"
          value={usd(health?.gasto24hUsd, 2)}
          context={overBudget
            ? <StatusBadge tone="danger">Superó el presupuesto de {usd(health?.presupuestoDiarioUsd, 2)}</StatusBadge>
            : `Presupuesto diario: ${usd(health?.presupuestoDiarioUsd, 2)}`}
        />
        <KpiCard
          label="Aislamiento de credenciales"
          value={health?.aislamientoCredenciales ? 'Activo' : 'Inactivo'}
          context={health?.aislamientoCredenciales
            ? 'Usa un rol dedicado'
            : <StatusBadge tone="warning">Usa las credenciales del API</StatusBadge>}
        />
      </div>

      {embudo && (
        <Panel
          title={`Embudo de los últimos ${embudo.periodoDias} días`}
          description="Porcentaje sobre los artículos descubiertos"
        >
          <ul className="adm-funnel">
            <FunnelRow label="Descubiertos" value={embudo.descubiertos} max={max} />
            <FunnelRow label="Descartados por el filtro léxico" value={embudo.descartadosPorLexico} max={max} discard />
            <FunnelRow label="Extraídos" value={embudo.extraidos} max={max} />
            <FunnelRow label="Descartados en triage" value={embudo.descartadosPorTriage} max={max} discard />
            <FunnelRow label="Clasificados" value={embudo.clasificados} max={max} />
            <FunnelRow label="Publicados" value={embudo.publicados} max={max} />
          </ul>

          {stats && (
            <dl className="adm-summary">
              <div>
                <dt>Costo de IA, 30 días</dt>
                <dd>{usd(stats.costoLlm?.totalUsd)}</dd>
              </div>
              <div>
                <dt>Llamadas exitosas</dt>
                <dd>{stats.costoLlm?.tasaExito != null ? `${stats.costoLlm.tasaExito} %` : '—'}</dd>
              </div>
              <div>
                <dt>Confianza media</dt>
                <dd>{stats.confianzaMedia !== null ? `${Math.round(stats.confianzaMedia * 100)} %` : '—'}</dd>
              </div>
            </dl>
          )}
        </Panel>
      )}

      {(stats?.costoLlm?.porPaso?.length ?? 0) > 0 && (
        <section className="adm-table-card">
          <div className="adm-panel__head" style={{ paddingBottom: 12 }}>
            <h2 className="adm-panel__title">Costo por paso</h2>
          </div>
          <div className="adm-table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th scope="col">Paso</th>
                  <th scope="col" className="adm-col-num">Llamadas</th>
                  <th scope="col" className="adm-col-num">Costo</th>
                  <th scope="col" className="adm-col-num">Latencia media</th>
                </tr>
              </thead>
              <tbody>
                {stats!.costoLlm.porPaso.map((p) => (
                  <tr key={p.paso}>
                    <td>{p.paso}</td>
                    <td className="adm-col-num">{formatInt(p.llamadas)}</td>
                    <td className="adm-col-num">{usd(p.costoUsd, 5)}</td>
                    <td className="adm-col-num">{formatInt(p.latenciaMediaMs)} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Panel
        title="Fuentes"
        description={`${formatInt(sources.filter((s) => s.active).length)} activas de ${formatInt(sources.length)}${failing.length ? ` · ${formatInt(failing.length)} con fallos` : ''}`}
        aside={
          <Link to="/admin/noticias/fuentes" className="adm-btn adm-btn--sm">
            <Rss aria-hidden="true" /> Gestionar fuentes
          </Link>
        }
      >
        {failing.length > 0 ? (
          <div className="adm-chips">
            {failing.map((s) => (
              <StatusBadge key={s.id} tone="warning">{s.domain} · {formatInt(s.consecutiveFailures)} fallos</StatusBadge>
            ))}
          </div>
        ) : (
          <p className="adm-cell-mute">Ninguna fuente activa tiene fallos recientes.</p>
        )}
      </Panel>
    </div>
  );
};

export default NewsHealthPage;
