import React, { useState, useEffect } from 'react';
import {
  Rss, Plus, Search, Check, X, PlayCircle, Trash2, Loader2,
  AlertTriangle, CheckCircle2, Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../shared/services/api';
import adminNewsApi from '../services/adminNewsApi';
import type { AdminNewsSourceFull } from '../../../types/news.types';

/**
 * Gestión de fuentes.
 *
 * El alta no pide la URL del feed: pide el dominio y el sistema lo busca, lo
 * valida y muestra titulares reales. Así el operador confirma que la fuente
 * sirve ANTES de guardarla, en vez de descubrir tres horas después que el feed
 * no existía.
 */

interface DiscoverResult {
  found: boolean;
  feedUrl?: string;
  via?: string;
  items?: number;
  titles?: string[];
  usable?: boolean;
  warning?: string;
  message?: string;
}

/** Guía para elegir la confianza: decide quién gana ante una noticia duplicada. */
const TRUST_HINTS: Array<{ value: number; label: string }> = [
  { value: 0.95, label: 'Organismo oficial — es la fuente primaria del hecho' },
  { value: 0.85, label: 'Organismo internacional de referencia' },
  { value: 0.7, label: 'Gremio o prensa especializada' },
  { value: 0.6, label: 'Prensa general' },
];

const NewsSourcesPage: React.FC = () => {
  const [sources, setSources] = useState<AdminNewsSourceFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const [domain, setDomain] = useState('');
  const [discovering, setDiscovering] = useState(false);
  const [result, setResult] = useState<DiscoverResult | null>(null);
  const [form, setForm] = useState({ name: '', country: 'CL', trustScore: 0.7 });

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminNewsApi.getSources();
      setSources(res.data || []);
    } catch {
      toast.error('No se pudieron cargar las fuentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const discover = async () => {
    const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
    if (!clean.includes('.')) return toast.error('Escribe un dominio válido, por ejemplo: mma.gob.cl');

    if (sources.some((s) => s.domain === clean)) {
      return toast.error('Esa fuente ya está en la lista');
    }

    try {
      setDiscovering(true);
      setResult(null);
      const res = (await api.get(`/admin/news/sources/discover`, {
        params: { domain: clean },
      })) as unknown as { data: DiscoverResult };
      setResult(res.data);

      if (res.data.found && !form.name) {
        // Nombre tentativo a partir del dominio; el operador puede cambiarlo.
        const base = clean.split('.')[0];
        setForm((f) => ({ ...f, name: base.charAt(0).toUpperCase() + base.slice(1) }));
      }
    } catch {
      toast.error('No se pudo consultar el dominio');
    } finally {
      setDiscovering(false);
    }
  };

  const save = async () => {
    const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
    if (!form.name.trim()) return toast.error('Ponle un nombre a la fuente');

    try {
      setBusy('new');
      await adminNewsApi.createSource({
        name: form.name,
        domain: clean,
        kind: result?.found ? 'rss' : 'html_list',
        feedUrl: result?.feedUrl,
        country: form.country || undefined,
        trustScore: form.trustScore,
      });
      toast.success(
        result?.found
          ? 'Fuente añadida y activada'
          : 'Fuente añadida, pero sin feed: queda inactiva hasta que se le asigne uno'
      );
      setAdding(false);
      setDomain('');
      setResult(null);
      setForm({ name: '', country: 'CL', trustScore: 0.7 });
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo crear la fuente');
    } finally {
      setBusy(null);
    }
  };

  const toggle = async (s: AdminNewsSourceFull) => {
    try {
      setBusy(s.id);
      await adminNewsApi.updateSource(s.id, { active: !s.active });
      setSources((prev) => prev.map((x) => (x.id === s.id ? { ...x, active: !x.active, consecutiveFailures: 0 } : x)));
      toast.success(s.active ? 'Fuente desactivada' : 'Fuente reactivada');
    } catch {
      toast.error('No se pudo actualizar');
    } finally {
      setBusy(null);
    }
  };

  const setTrust = async (s: AdminNewsSourceFull, value: number) => {
    try {
      await adminNewsApi.updateSource(s.id, { trustScore: value });
      setSources((prev) => prev.map((x) => (x.id === s.id ? { ...x, trustScore: value } : x)));
      toast.success('Confianza actualizada');
    } catch {
      toast.error('No se pudo actualizar');
    }
  };

  const test = async (s: AdminNewsSourceFull) => {
    try {
      await adminNewsApi.testSource(s.id);
      toast.success(`Descubrimiento encolado para ${s.domain}`);
    } catch {
      toast.error('No se pudo encolar');
    }
  };

  const remove = async (s: AdminNewsSourceFull) => {
    try {
      setBusy(s.id);
      await api.delete(`/admin/news/sources/${s.id}`);
      setSources((prev) => prev.filter((x) => x.id !== s.id));
      toast.success('Fuente eliminada');
    } catch (err: any) {
      // El backend impide borrar fuentes con historial: desactivar es lo correcto.
      toast.error(err?.message || 'No se pudo eliminar');
    } finally {
      setBusy(null);
    }
  };

  const activas = sources.filter((s) => s.active).length;
  const conProblemas = sources.filter((s) => s.active && s.consecutiveFailures > 0).length;

  return (
    <div className="!space-y-6 bg-slate-50 dark:bg-slate-900 !p-6 md:!p-8 !rounded-3xl">
      <div className="!flex !items-start !justify-between !flex-wrap !gap-4">
        <div>
          <h1 className="!text-2xl !font-bold text-slate-800 dark:text-slate-100 !flex !items-center !gap-2">
            <Rss className="!w-7 !h-7 text-emerald-600 dark:text-emerald-400" />
            Fuentes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 !mt-1">
            {activas} activas de {sources.length}
            {conProblemas > 0 && ` · ${conProblemas} con fallos recientes`}
          </p>
        </div>
        <button
          onClick={() => setAdding((a) => !a)}
          className="!flex !items-center !gap-2 !px-4 !py-2 !rounded-lg !bg-emerald-600 !text-white !text-sm !font-medium hover:!bg-emerald-700"
        >
          <Plus className="!w-4 !h-4" /> Añadir fuente
        </button>
      </div>

      {/* Alta */}
      {adding && (
        <div className="bg-white dark:bg-slate-800 !rounded-xl !p-5 !border border-slate-200 dark:border-slate-700 !space-y-4">
          <div>
            <h2 className="!text-base !font-semibold text-slate-800 dark:text-slate-100">Añadir fuente</h2>
            <p className="!text-xs text-slate-500 dark:text-slate-400 !mt-0.5">
              Escribe el dominio y buscamos el feed por ti. No hace falta que sepas la URL.
            </p>
          </div>

          <div className="!flex !gap-2 !flex-wrap">
            <div className="!flex-1 !min-w-64 !relative">
              <Globe className="!w-4 !h-4 !absolute !left-3 !top-1/2 !-translate-y-1/2 text-slate-400" />
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && discover()}
                placeholder="mma.gob.cl"
                className="!w-full !pl-9 !pr-3 !py-2 !rounded-lg !border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 !text-sm"
              />
            </div>
            <button
              onClick={discover}
              disabled={discovering || !domain.trim()}
              className="!flex !items-center !gap-2 !px-4 !py-2 !rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 !text-sm !font-medium disabled:!opacity-50"
            >
              {discovering ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : <Search className="!w-4 !h-4" />}
              Buscar feed
            </button>
          </div>

          {/* Resultado de la búsqueda */}
          {result && (
            <div
              className={`!p-4 !rounded-lg !border ${
                result.found
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
              }`}
            >
              {result.found ? (
                <>
                  <p className="!flex !items-center !gap-2 !text-sm !font-medium text-slate-800 dark:text-slate-100">
                    <CheckCircle2 className="!w-4 !h-4 text-emerald-600" />
                    Feed encontrado · {result.items} entradas
                  </p>
                  <p className="!text-xs !font-mono text-slate-600 dark:text-slate-300 !mt-1 !break-all">
                    {result.feedUrl}
                  </p>
                  {result.titles && result.titles.length > 0 && (
                    <div className="!mt-3">
                      <p className="!text-xs text-slate-500 dark:text-slate-400 !mb-1">
                        Últimos titulares — comprueba que es la fuente correcta:
                      </p>
                      <ul className="!text-xs text-slate-600 dark:text-slate-300 !space-y-0.5">
                        {result.titles.map((t, i) => <li key={i}>· {t}</li>)}
                      </ul>
                    </div>
                  )}
                  {result.warning && (
                    <p className="!text-xs text-amber-700 dark:text-amber-400 !mt-2">{result.warning}</p>
                  )}
                </>
              ) : (
                <p className="!flex !items-start !gap-2 !text-sm text-slate-700 dark:text-slate-200">
                  <AlertTriangle className="!w-4 !h-4 text-amber-600 !shrink-0 !mt-0.5" />
                  <span>{result.message}</span>
                </p>
              )}
            </div>
          )}

          {/* Datos de la fuente */}
          {result && (
            <>
              <div className="!grid sm:!grid-cols-3 !gap-3">
                <div>
                  <label className="!text-xs text-slate-500 dark:text-slate-400">Nombre</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="!w-full !mt-1 !px-3 !py-2 !rounded-lg !border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 !text-sm"
                  />
                </div>
                <div>
                  <label className="!text-xs text-slate-500 dark:text-slate-400">País</label>
                  <input
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value.toUpperCase().slice(0, 2) })}
                    placeholder="CL"
                    className="!w-full !mt-1 !px-3 !py-2 !rounded-lg !border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 !text-sm"
                  />
                </div>
                <div>
                  <label className="!text-xs text-slate-500 dark:text-slate-400">Confianza</label>
                  <select
                    value={form.trustScore}
                    onChange={(e) => setForm({ ...form, trustScore: Number(e.target.value) })}
                    className="!w-full !mt-1 !px-3 !py-2 !rounded-lg !border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 !text-sm"
                  >
                    {TRUST_HINTS.map((t) => (
                      <option key={t.value} value={t.value}>{t.value.toFixed(2)} — {t.label.split('—')[0].trim()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="!text-xs text-slate-400 dark:text-slate-500">
                La confianza decide qué versión se conserva cuando dos fuentes publican la misma
                noticia. {TRUST_HINTS.find((t) => t.value === form.trustScore)?.label}
              </p>

              <div className="!flex !gap-2">
                <button
                  onClick={save}
                  disabled={busy === 'new'}
                  className="!px-4 !py-2 !rounded-lg !bg-emerald-600 !text-white !text-sm !font-medium disabled:!opacity-50"
                >
                  {result.found ? 'Añadir y activar' : 'Añadir (inactiva)'}
                </button>
                <button
                  onClick={() => { setAdding(false); setResult(null); setDomain(''); }}
                  className="!px-4 !py-2 !rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 !text-sm"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Listado */}
      {loading ? (
        <div className="!flex !items-center !justify-center !py-20 text-slate-400">
          <Loader2 className="!w-6 !h-6 !animate-spin !mr-2" /> Cargando…
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 !rounded-xl !border border-slate-200 dark:border-slate-700 !overflow-x-auto">
          <table className="!w-full !text-sm">
            <thead>
              <tr className="!text-left text-slate-500 dark:text-slate-400 !text-xs !border-b border-slate-100 dark:border-slate-700">
                <th className="!p-3">Fuente</th>
                <th className="!p-3">Confianza</th>
                <th className="!p-3">Último éxito</th>
                <th className="!p-3 !text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id} className="!border-b border-slate-50 dark:border-slate-700/50 last:!border-0">
                  <td className="!p-3">
                    <div className="!flex !items-center !gap-2">
                      <span className={`!w-2 !h-2 !rounded-full !shrink-0 ${s.active ? '!bg-emerald-500' : '!bg-slate-300 dark:!bg-slate-600'}`} />
                      <div className="!min-w-0">
                        <p className="text-slate-800 dark:text-slate-100 !font-medium">{s.name}</p>
                        <p className="!text-xs text-slate-400 dark:text-slate-500">
                          {s.domain}
                          {!s.feedUrl && <span className="!ml-1.5 text-amber-600 dark:text-amber-400">sin feed</span>}
                          {s.consecutiveFailures > 0 && (
                            <span className="!ml-1.5 text-rose-600 dark:text-rose-400">
                              {s.consecutiveFailures} fallo(s)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="!p-3">
                    <select
                      value={s.trustScore}
                      onChange={(e) => setTrust(s, Number(e.target.value))}
                      className="!px-2 !py-1 !rounded !text-xs !border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                    >
                      {TRUST_HINTS.map((t) => (
                        <option key={t.value} value={t.value}>{t.value.toFixed(2)}</option>
                      ))}
                      {!TRUST_HINTS.some((t) => t.value === s.trustScore) && (
                        <option value={s.trustScore}>{Number(s.trustScore).toFixed(2)}</option>
                      )}
                    </select>
                  </td>
                  <td className="!p-3 text-slate-500 dark:text-slate-400 !text-xs">
                    {s.lastSuccessAt ? new Date(s.lastSuccessAt).toLocaleDateString('es-CL') : 'nunca'}
                  </td>
                  <td className="!p-3 !text-right !whitespace-nowrap">
                    <button
                      onClick={() => test(s)}
                      disabled={!s.feedUrl}
                      className="!p-1.5 !rounded text-slate-500 hover:!bg-slate-100 dark:hover:!bg-slate-700 disabled:!opacity-30"
                      title="Buscar noticias ahora"
                    >
                      <PlayCircle className="!w-4 !h-4" />
                    </button>
                    <button
                      onClick={() => toggle(s)}
                      disabled={busy === s.id}
                      className="!p-1.5 !rounded text-slate-500 hover:!bg-slate-100 dark:hover:!bg-slate-700"
                      title={s.active ? 'Desactivar' : 'Activar'}
                    >
                      {s.active ? <X className="!w-4 !h-4" /> : <Check className="!w-4 !h-4" />}
                    </button>
                    <button
                      onClick={() => remove(s)}
                      disabled={busy === s.id}
                      className="!p-1.5 !rounded text-slate-400 hover:!bg-rose-50 hover:!text-rose-600 dark:hover:!bg-slate-700"
                      title="Eliminar (solo si no tiene contenido)"
                    >
                      <Trash2 className="!w-4 !h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="!text-xs text-slate-400 dark:text-slate-500">
        Una fuente que falla 10 veces seguidas se desactiva sola: insistir contra un sitio que
        bloquea es la forma más rápida de acabar en su lista negra. Al reactivarla, el contador
        se pone a cero.
      </p>
    </div>
  );
};

export default NewsSourcesPage;
