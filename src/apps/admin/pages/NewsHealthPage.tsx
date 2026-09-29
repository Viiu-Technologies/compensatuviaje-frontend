import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, AlertTriangle, CheckCircle2, Rss, DollarSign, Inbox,
  Loader2, RefreshCw, ShieldCheck, ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import adminNewsApi from '../services/adminNewsApi';
import type {
  NewsHealth, NewsStats, AdminNewsSourceFull,
} from '../../../types/news.types';

/**
 * Salud del módulo de noticias.
 *
 * El embudo es el diagnóstico de un vistazo: si "extraídos" cae mucho respecto
 * a "descubiertos" hay un problema de extracción; si "aprobados" se estanca,
 * nadie está revisando.
 */

type IconComponent = React.ComponentType<{ className?: string }>;

const Stat: React.FC<{
  icon: IconComponent;
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: 'ok' | 'warn' | 'bad';
}> = ({ icon: Icon, label, value, hint, tone = 'ok' }) => {
  const toneCls: Record<'ok' | 'warn' | 'bad', string> = {
    ok: 'text-emerald-600 dark:text-emerald-400',
    warn: 'text-amber-600 dark:text-amber-400',
    bad: 'text-rose-600 dark:text-rose-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 !rounded-xl !p-4 !border border-slate-200 dark:border-slate-700">
      <div className="!flex !items-center !gap-2 !text-xs text-slate-500 dark:text-slate-400">
        <Icon className={`!w-4 !h-4 ${toneCls[tone]}`} />
        {label}
      </div>
      <div className="!mt-2 !text-2xl !font-bold text-slate-800 dark:text-slate-100">{value}</div>
      {hint && <div className="!mt-1 !text-xs text-slate-400 dark:text-slate-500">{hint}</div>}
    </div>
  );
};

const FunnelBar: React.FC<{ label: string; value: number; max: number; hint?: string }> = ({
  label, value, max, hint,
}) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="!flex !justify-between !text-sm !mb-1">
        <span className="text-slate-600 dark:text-slate-300">{label}</span>
        <span className="text-slate-800 dark:text-slate-100 !font-medium">
          {value}
          {hint && <span className="text-slate-400 !ml-1 !text-xs">{hint}</span>}
        </span>
      </div>
      <div className="!h-2 !rounded-full bg-slate-100 dark:bg-slate-700 !overflow-hidden">
        <div className="!h-full !bg-emerald-500 !rounded-full !transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const NewsHealthPage: React.FC = () => {
  const [health, setHealth] = useState<NewsHealth | null>(null);
  const [stats, setStats] = useState<NewsStats | null>(null);
  const [sources, setSources] = useState<AdminNewsSourceFull[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch {
      toast.error('No se pudo cargar el estado del módulo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="!flex !items-center !justify-center !py-20 text-slate-400">
        <Loader2 className="!w-6 !h-6 !animate-spin !mr-2" /> Cargando…
      </div>
    );
  }

  const embudo = stats?.embudo;
  const max = embudo?.descubiertos || 1;

  return (
    <div className="!space-y-6 bg-slate-50 dark:bg-slate-900 !p-6 md:!p-8 !rounded-3xl">
      <div className="!flex !items-start !justify-between !flex-wrap !gap-4">
        <div>
          <h1 className="!text-2xl !font-bold text-slate-800 dark:text-slate-100 !flex !items-center !gap-2">
            <Activity className="!w-7 !h-7 text-emerald-600 dark:text-emerald-400" />
            Salud del módulo de noticias
          </h1>
          <p className="text-slate-500 dark:text-slate-400 !mt-1">
            Embudo, costo y fuentes. Las alertas también llegan por Telegram.
          </p>
        </div>
        <button
          onClick={load}
          className="!flex !items-center !gap-2 !px-3 !py-2 !rounded-lg !text-sm bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 !border border-slate-200 dark:border-slate-700 hover:!bg-slate-100 dark:hover:!bg-slate-700"
        >
          <RefreshCw className="!w-4 !h-4" /> Actualizar
        </button>
      </div>

      {/* Alertas */}
      {health && health.alertas.length > 0 && (
        <div className="!space-y-2">
          {health.alertas.map((a, i) => (
            <div
              key={i}
              className={`!flex !items-start !gap-3 !p-4 !rounded-xl !border ${
                a.nivel === 'critical'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900'
              }`}
            >
              <AlertTriangle className={`!w-5 !h-5 !shrink-0 !mt-0.5 ${a.nivel === 'critical' ? 'text-rose-600' : 'text-amber-600'}`} />
              <div>
                <p className="!text-sm !font-medium text-slate-800 dark:text-slate-100">{a.mensaje}</p>
                {a.detalle && a.detalle.length > 0 && (
                  <p className="!text-xs text-slate-500 dark:text-slate-400 !mt-1">
                    {a.detalle.slice(0, 8).join(' · ')}
                    {a.detalle.length > 8 && ` …y ${a.detalle.length - 8} más`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {health && health.alertas.length === 0 && (
        <div className="!flex !items-center !gap-3 !p-4 !rounded-xl bg-emerald-50 dark:bg-emerald-950/40 !border border-emerald-200 dark:border-emerald-900">
          <CheckCircle2 className="!w-5 !h-5 text-emerald-600" />
          <p className="!text-sm text-slate-700 dark:text-slate-200">Todo en orden. Sin alertas activas.</p>
        </div>
      )}

      {/* Indicadores */}
      <div className="!grid sm:!grid-cols-2 lg:!grid-cols-4 !gap-4">
        <Stat
          icon={Rss}
          label="Fuentes activas"
          value={`${health?.fuentes.activas ?? 0}/${health?.fuentes.totales ?? 0}`}
          hint={health?.fuentes.sinResultados ? `${health.fuentes.sinResultados} sin resultados` : 'todas trayendo'}
          tone={health?.fuentes.sinResultados ? 'warn' : 'ok'}
        />
        <Stat
          icon={Inbox}
          label="Por revisar"
          value={health?.revisionPendiente ?? 0}
          hint={(health?.revisionPendiente ?? 0) > 50 ? 'cola acumulada' : undefined}
          tone={(health?.revisionPendiente ?? 0) > 50 ? 'warn' : 'ok'}
        />
        <Stat
          icon={DollarSign}
          label="Gasto LLM 24 h"
          value={`$${(health?.gasto24hUsd ?? 0).toFixed(4)}`}
          hint={`de $${(health?.presupuestoDiarioUsd ?? 0).toFixed(2)}`}
          tone={
            (health?.gasto24hUsd ?? 0) >= (health?.presupuestoDiarioUsd ?? 1) ? 'bad' : 'ok'
          }
        />
        <Stat
          icon={health?.aislamientoCredenciales ? ShieldCheck : ShieldAlert}
          label="Aislamiento de credenciales"
          value={health?.aislamientoCredenciales ? 'Activo' : 'Sin rol'}
          hint={health?.aislamientoCredenciales ? 'rol dedicado' : 'usa las credenciales del API'}
          tone={health?.aislamientoCredenciales ? 'ok' : 'warn'}
        />
      </div>

      {/* Embudo */}
      {embudo && (
        <div className="bg-white dark:bg-slate-800 !rounded-xl !p-5 !border border-slate-200 dark:border-slate-700">
          <h2 className="!text-lg !font-semibold text-slate-800 dark:text-slate-100 !mb-4">
            Embudo · últimos {embudo.periodoDias} días
          </h2>
          <div className="!space-y-3">
            <FunnelBar label="Descubiertos" value={embudo.descubiertos} max={max} />
            <FunnelBar
              label="Descartados por el filtro léxico"
              value={embudo.descartadosPorLexico}
              max={max}
              hint={embudo.descubiertos ? `${Math.round((embudo.descartadosPorLexico / embudo.descubiertos) * 100)}%` : ''}
            />
            <FunnelBar label="Extraídos" value={embudo.extraidos} max={max} />
            <FunnelBar label="Descartados en triage" value={embudo.descartadosPorTriage} max={max} />
            <FunnelBar label="Clasificados" value={embudo.clasificados} max={max} />
            <FunnelBar label="Publicados" value={embudo.publicados} max={max} />
          </div>

          {stats && (
            <div className="!grid sm:!grid-cols-3 !gap-4 !mt-5 !pt-5 !border-t border-slate-100 dark:border-slate-700 !text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Costo LLM 30 d</span>
                <p className="!text-lg !font-semibold text-slate-800 dark:text-slate-100">
                  ${stats.costoLlm.totalUsd.toFixed(4)}
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Éxito de llamadas</span>
                <p className="!text-lg !font-semibold text-slate-800 dark:text-slate-100">
                  {stats.costoLlm.tasaExito != null ? `${stats.costoLlm.tasaExito}%` : '—'}
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Confianza media</span>
                <p className="!text-lg !font-semibold text-slate-800 dark:text-slate-100">
                  {stats.confianzaMedia !== null ? `${Math.round(stats.confianzaMedia * 100)}%` : '—'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Costo por paso */}
      {stats && stats.costoLlm.porPaso.length > 0 && (
        <div className="bg-white dark:bg-slate-800 !rounded-xl !p-5 !border border-slate-200 dark:border-slate-700 !overflow-x-auto">
          <h2 className="!text-lg !font-semibold text-slate-800 dark:text-slate-100 !mb-4">Costo por paso</h2>
          <table className="!w-full !text-sm">
            <thead>
              <tr className="!text-left text-slate-500 dark:text-slate-400 !text-xs">
                <th className="!pb-2">Paso</th>
                <th className="!pb-2 !text-right">Llamadas</th>
                <th className="!pb-2 !text-right">Costo</th>
                <th className="!pb-2 !text-right">Latencia media</th>
              </tr>
            </thead>
            <tbody>
              {stats.costoLlm.porPaso.map((p) => (
                <tr key={p.paso} className="!border-t border-slate-100 dark:border-slate-700">
                  <td className="!py-2 text-slate-700 dark:text-slate-200">{p.paso}</td>
                  <td className="!py-2 !text-right text-slate-600 dark:text-slate-300">{p.llamadas}</td>
                  <td className="!py-2 !text-right text-slate-600 dark:text-slate-300">${p.costoUsd.toFixed(5)}</td>
                  <td className="!py-2 !text-right text-slate-600 dark:text-slate-300">{p.latenciaMediaMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fuentes — la gestión vive en su propia página, aquí solo el resumen */}
      <div className="bg-white dark:bg-slate-800 !rounded-xl !p-5 !border border-slate-200 dark:border-slate-700">
        <div className="!flex !items-center !justify-between !flex-wrap !gap-3">
          <div>
            <h2 className="!text-lg !font-semibold text-slate-800 dark:text-slate-100">Fuentes</h2>
            <p className="!text-sm text-slate-500 dark:text-slate-400 !mt-0.5">
              {sources.filter((s) => s.active).length} activas de {sources.length}
              {sources.filter((s) => s.active && s.consecutiveFailures > 0).length > 0 &&
                ` · ${sources.filter((s) => s.active && s.consecutiveFailures > 0).length} con fallos`}
            </p>
          </div>
          <Link
            to="/admin/noticias/fuentes"
            className="!flex !items-center !gap-2 !px-4 !py-2 !rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 !text-sm !font-medium hover:!bg-slate-200 dark:hover:!bg-slate-600"
          >
            <Rss className="!w-4 !h-4" /> Gestionar fuentes
          </Link>
        </div>

        {sources.filter((s) => s.active && s.consecutiveFailures > 0).length > 0 && (
          <div className="!mt-4 !pt-4 !border-t border-slate-100 dark:border-slate-700">
            <p className="!text-xs text-slate-500 dark:text-slate-400 !mb-2">Con fallos recientes:</p>
            <div className="!flex !flex-wrap !gap-2">
              {sources
                .filter((s) => s.active && s.consecutiveFailures > 0)
                .map((s) => (
                  <span
                    key={s.id}
                    className="!px-2.5 !py-1 !rounded-full !text-xs bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  >
                    {s.domain} · {s.consecutiveFailures}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsHealthPage;
