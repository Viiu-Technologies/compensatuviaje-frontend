import React, { useState, useEffect } from 'react';
import { Rss, Plus, Search, Check, X, PlayCircle, Trash2, AlertTriangle, CheckCircle2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../shared/services/api';
import adminNewsApi from '../services/adminNewsApi';
import type { AdminNewsSourceFull } from '../../../types/news.types';
import { EmptyState, PageHeader, Panel, StatusBadge, TableSkeletonRows, formatInt, useAdminConfirm } from '../ui';

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
const TRUST_HINTS: Array<{ value: number; label: string; short: string }> = [
  { value: 0.95, label: 'Organismo oficial: es la fuente primaria del hecho', short: 'Organismo oficial' },
  { value: 0.85, label: 'Organismo internacional de referencia', short: 'Organismo internacional' },
  { value: 0.7, label: 'Gremio o prensa especializada', short: 'Prensa especializada' },
  { value: 0.6, label: 'Prensa general', short: 'Prensa general' },
];

const trustText = (v: number) => {
  const hint = TRUST_HINTS.find((t) => t.value === v);
  const num = Number(v).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return hint ? `${num} · ${hint.short}` : num;
};

const NewsSourcesPage: React.FC = () => {
  const { confirm, dialog } = useAdminConfirm();
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


  // Antes borraba al primer clic, sin confirmar.
  const confirmRemove = async (s: AdminNewsSourceFull) => {
    const ok = await confirm({
      title: `¿Eliminar ${s.name}?`,
      description: 'Solo se puede eliminar una fuente sin contenido. Si ya trajo artículos, desactívala.',
      confirmLabel: 'Eliminar fuente',
      tone: 'danger',
    });
    if (ok) remove(s);
  };

  const activas = sources.filter((s) => s.active).length;
  const conProblemas = sources.filter((s) => s.active && s.consecutiveFailures > 0).length;
  const cancelAdd = () => { setAdding(false); setResult(null); setDomain(''); };

  return (
    <div className="adm-page">
      <PageHeader
        title="Fuentes de noticias"
        description={`${formatInt(activas)} activas de ${formatInt(sources.length)}${conProblemas > 0 ? ` · ${formatInt(conProblemas)} con fallos recientes` : ''}`}
        actions={
          <button type="button" className="adm-btn adm-btn--primary" onClick={() => setAdding((a) => !a)} aria-expanded={adding}>
            <Plus aria-hidden="true" /> Añadir fuente
          </button>
        }
      />

      {adding && (
        <Panel title="Añadir fuente" description="Escribe el dominio y buscamos el feed. No hace falta saber la URL.">
          <div className="adm-stack-v">
            <div className="adm-actions-row">
              <div className="adm-search" style={{ maxWidth: 420 }}>
                <Globe aria-hidden="true" />
                <input
                  className="adm-input"
                  aria-label="Dominio de la fuente"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && discover()}
                  placeholder="mma.gob.cl"
                />
              </div>
              <button type="button" className="adm-btn" onClick={discover} disabled={discovering || !domain.trim()}>
                <Search aria-hidden="true" /> {discovering ? 'Buscando…' : 'Buscar feed'}
              </button>
            </div>

            {result && (
              <div className={`adm-alert ${result.found ? 'adm-alert--success' : 'adm-alert--warning'}`}>
                {result.found ? <CheckCircle2 aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />}
                <div>
                  {result.found ? (
                    <>
                      <b>Feed encontrado · {formatInt(result.items)} entradas</b>
                      <div className="adm-alert__detail adm-mono" style={{ wordBreak: 'break-all' }}>{result.feedUrl}</div>
                      {result.titles && result.titles.length > 0 && (
                        <div className="adm-alert__detail">
                          Últimos titulares, para comprobar que es la fuente correcta:
                          <ul className="adm-plain-list">
                            {result.titles.map((t, i) => <li key={i}>{t}</li>)}
                          </ul>
                        </div>
                      )}
                      {result.warning && <div className="adm-alert__detail">{result.warning}</div>}
                    </>
                  ) : (
                    result.message
                  )}
                </div>
              </div>
            )}

            {result && (
              <>
                <div className="adm-form-grid">
                  <div className="adm-field">
                    <label className="adm-field__label" htmlFor="ns-name">Nombre</label>
                    <input id="ns-name" className="adm-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="adm-field">
                    <label className="adm-field__label" htmlFor="ns-country">País (código ISO)</label>
                    <input id="ns-country" className="adm-input" value={form.country} placeholder="CL" onChange={(e) => setForm({ ...form, country: e.target.value.toUpperCase().slice(0, 2) })} />
                  </div>
                  <div className="adm-field">
                    <label className="adm-field__label" htmlFor="ns-trust">Confianza</label>
                    <select id="ns-trust" className="adm-select" value={form.trustScore} onChange={(e) => setForm({ ...form, trustScore: Number(e.target.value) })}>
                      {TRUST_HINTS.map((t) => <option key={t.value} value={t.value}>{trustText(t.value)}</option>)}
                    </select>
                  </div>
                </div>
                <p className="adm-field__hint">
                  La confianza decide qué versión se conserva cuando dos fuentes publican la misma noticia.{' '}
                  {TRUST_HINTS.find((t) => t.value === form.trustScore)?.label}.
                </p>
                <div className="adm-actions-row">
                  <button type="button" className="adm-btn adm-btn--primary" onClick={save} disabled={busy === 'new'}>
                    {result.found ? 'Añadir y activar' : 'Añadir (queda inactiva)'}
                  </button>
                  <button type="button" className="adm-btn" onClick={cancelAdd}>Cancelar</button>
                </div>
              </>
            )}
          </div>
        </Panel>
      )}

      <section className="adm-table-card">
        <div className="adm-table-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Fuente</th>
                <th scope="col">Estado</th>
                <th scope="col">Confianza</th>
                <th scope="col">Último éxito</th>
                <th scope="col" className="adm-col-actions"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeletonRows columns={5} />
              ) : sources.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState icon={Rss} title="Aún no hay fuentes" text="Añade la primera con el botón de arriba." />
                  </td>
                </tr>
              ) : (
                sources.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span className="adm-cell-title">{s.name}</span>
                      <span className="adm-cell-sub">{s.domain}</span>
                    </td>
                    <td>
                      <div className="adm-chips">
                        <StatusBadge tone={s.active ? 'success' : 'neutral'}>{s.active ? 'Activa' : 'Inactiva'}</StatusBadge>
                        {!s.feedUrl && <StatusBadge tone="warning">Sin feed</StatusBadge>}
                        {s.consecutiveFailures > 0 && (
                          <StatusBadge tone="danger">{formatInt(s.consecutiveFailures)} {s.consecutiveFailures === 1 ? 'fallo' : 'fallos'}</StatusBadge>
                        )}
                      </div>
                    </td>
                    <td>
                      <select
                        className="adm-select"
                        aria-label={`Confianza de ${s.name}`}
                        value={s.trustScore}
                        onChange={(e) => setTrust(s, Number(e.target.value))}
                      >
                        {TRUST_HINTS.map((t) => <option key={t.value} value={t.value}>{trustText(t.value)}</option>)}
                        {!TRUST_HINTS.some((t) => t.value === s.trustScore) && (
                          <option value={s.trustScore}>{trustText(s.trustScore)}</option>
                        )}
                      </select>
                    </td>
                    <td>{s.lastSuccessAt ? new Date(s.lastSuccessAt).toLocaleDateString('es-CL') : <span className="adm-cell-mute">Nunca</span>}</td>
                    <td className="adm-col-actions">
                      <button type="button" className="adm-icon-btn" onClick={() => test(s)} disabled={!s.feedUrl} title="Buscar noticias ahora" aria-label={`Buscar noticias ahora en ${s.name}`}>
                        <PlayCircle aria-hidden="true" />
                      </button>
                      <button type="button" className="adm-icon-btn" onClick={() => toggle(s)} disabled={busy === s.id} title={s.active ? 'Desactivar' : 'Activar'} aria-label={`${s.active ? 'Desactivar' : 'Activar'} ${s.name}`}>
                        {s.active ? <X aria-hidden="true" /> : <Check aria-hidden="true" />}
                      </button>
                      <button type="button" className="adm-icon-btn" onClick={() => confirmRemove(s)} disabled={busy === s.id} title="Eliminar (solo si no tiene contenido)" aria-label={`Eliminar ${s.name}`}>
                        <Trash2 aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="adm-table-note">
          Una fuente que falla 10 veces seguidas se desactiva sola: insistir contra un sitio que bloquea es la forma más
          rápida de terminar en su lista negra. Al reactivarla, el contador vuelve a cero.
        </p>
      </section>
      {dialog}
    </div>
  );
};

export default NewsSourcesPage;
