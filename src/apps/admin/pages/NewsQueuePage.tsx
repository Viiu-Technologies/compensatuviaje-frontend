import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Newspaper, Check, X, Pencil, ExternalLink, ChevronUp, ChevronDown,
  ShieldAlert, Send, Loader2, Keyboard, Copy, Image as ImageIcon, FileSearch,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import adminNewsApi from '../services/adminNewsApi';
import type { AdminNewsArticle, NewsStatus } from '../../../types/news.types';

/**
 * Cola de revisión de noticias.
 *
 * Lo que hace o rompe esta pantalla es la VELOCIDAD. Si aprobar es lento, la
 * gente aprueba en bloque sin leer y se pierde el control igual — solo que con
 * la ilusión de tenerlo. De ahí los atajos de teclado y la actualización
 * optimista: la tarjeta desaparece al instante y vuelve si el servidor falla.
 *
 * Objetivo medible: 20 artículos en menos de 3 minutos.
 */

const STATUS_TABS: Array<{ value: NewsStatus | 'all'; label: string }> = [
  { value: 'pending', label: 'Por revisar' },
  { value: 'approved', label: 'Aprobados' },
  { value: 'published', label: 'Publicados' },
  { value: 'rejected', label: 'Rechazados' },
  { value: 'all', label: 'Todos' },
];

const MOTIVOS_RAPIDOS = [
  'Sin relación con transporte ni logística',
  'Contenido promocional',
  'Duplicado de otra noticia',
  'Información insuficiente o poco fiable',
];

const importanceColor = (n: number | null) => {
  if (n === null) return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  if (n >= 5) return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300';
  if (n === 4) return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
  if (n === 3) return 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300';
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
};

const ConfidenceBadge: React.FC<{ score: number | null; needsReview: boolean }> = ({
  score, needsReview,
}) => {
  if (score === null) return null;
  const pct = Math.round(score * 100);
  const cls = needsReview
    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
  return (
    <span className={`!inline-flex !items-center !gap-1 !px-2 !py-0.5 !rounded-full !text-xs !font-medium ${cls}`}>
      {needsReview && <ShieldAlert className="!w-3 !h-3" />}
      {pct}% confianza
    </span>
  );
};

const NewsQueuePage: React.FC = () => {
  const [articles, setArticles] = useState<AdminNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<NewsStatus | 'all'>('pending');
  const [cursor, setCursor] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<AdminNewsArticle | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ title: string; summary: string; whyItMatters: string }>({
    title: '', summary: '', whyItMatters: '',
  });
  const [showHelp, setShowHelp] = useState(false);

  const navigate = useNavigate();
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminNewsApi.getQueue({ status, limit: 50 });
      setArticles(res.data || []);
      setCursor(0);
    } catch {
      toast.error('No se pudo cargar la cola');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  // Mantiene visible la tarjeta activa al navegar con teclado.
  useEffect(() => {
    const current = articles[cursor];
    if (current) {
      cardRefs.current[current.id]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [cursor, articles]);

  /** Quita la tarjeta al instante; si el servidor falla, la devuelve. */
  const optimistic = async (article: AdminNewsArticle, action: () => Promise<unknown>, ok: string) => {
    const index = articles.findIndex((a) => a.id === article.id);
    const backup = articles;

    setBusy(article.id);
    setArticles((prev) => prev.filter((a) => a.id !== article.id));
    setCursor((c) => Math.min(c, Math.max(0, backup.length - 2)));

    try {
      await action();
      toast.success(ok);
    } catch (err: any) {
      setArticles(backup);
      setCursor(index);
      toast.error(err?.message || 'La acción falló');
    } finally {
      setBusy(null);
    }
  };

  const approve = (a: AdminNewsArticle) =>
    optimistic(a, () => adminNewsApi.approveArticle(a.id), 'Aprobado');

  const publish = (a: AdminNewsArticle) =>
    optimistic(a, () => adminNewsApi.publishArticle(a.id), 'Publicado');

  const confirmReject = async () => {
    if (!rejecting) return;
    if (!rejectReason.trim()) {
      toast.error('El motivo es obligatorio');
      return;
    }
    const target = rejecting;
    const reason = rejectReason;
    setRejecting(null);
    setRejectReason('');
    await optimistic(target, () => adminNewsApi.rejectArticle(target.id, reason), 'Rechazado');
  };

  const startEdit = (a: AdminNewsArticle) => {
    setEditing(a.id);
    setDraft({
      title: a.title ?? '',
      summary: a.summary ?? '',
      whyItMatters: a.whyItMatters ?? '',
    });
  };

  const saveEdit = async (a: AdminNewsArticle) => {
    try {
      setBusy(a.id);
      await adminNewsApi.updateArticle(a.id, draft);
      setArticles((prev) => prev.map((x) => (x.id === a.id ? { ...x, ...draft } : x)));
      setEditing(null);
      toast.success('Cambios guardados');
    } catch {
      toast.error('No se pudieron guardar los cambios');
    } finally {
      setBusy(null);
    }
  };

  const regenerate = async (a: AdminNewsArticle) => {
    try {
      await adminNewsApi.regenerateImage(a.id);
      toast.success('Regeneración encolada; el worker la procesará');
    } catch {
      toast.error('No se pudo encolar la regeneración');
    }
  };

  // ── Atajos de teclado ──────────────────────────────────────────────
  // Sin esto, revisar duele y la gente aprueba en bloque sin leer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || editing) return;
      if (rejecting) return;

      const current = articles[cursor];

      switch (e.key.toLowerCase()) {
        case 'j': e.preventDefault(); setCursor((c) => Math.min(c + 1, articles.length - 1)); break;
        case 'k': e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); break;
        case 'a': if (current && current.status === 'pending') { e.preventDefault(); approve(current); } break;
        case 'p': if (current && current.status === 'approved') { e.preventDefault(); publish(current); } break;
        case 'r': if (current) { e.preventDefault(); setRejecting(current); } break;
        case 'e': if (current) { e.preventDefault(); startEdit(current); } break;
        case 'enter': if (current) { e.preventDefault(); window.open(current.url, '_blank', 'noopener'); } break;
        case 'v': if (current) { e.preventDefault(); navigate(`/admin/noticias/${current.id}`); } break;
        case '?': e.preventDefault(); setShowHelp((s) => !s); break;
        default: break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [articles, cursor, editing, rejecting, navigate]);

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="!space-y-6 bg-slate-50 dark:bg-slate-900 !p-6 md:!p-8 !rounded-3xl">
      {/* Cabecera */}
      <div className="!flex !items-start !justify-between !flex-wrap !gap-4">
        <div>
          <h1 className="!text-2xl !font-bold text-slate-800 dark:text-slate-100 !flex !items-center !gap-2">
            <Newspaper className="!w-7 !h-7 text-emerald-600 dark:text-emerald-400" />
            Cola de noticias
          </h1>
          <p className="text-slate-500 dark:text-slate-400 !mt-1">
            Revisa lo que el pipeline clasificó y decide qué se publica. Nada sale sin tu aprobación.
          </p>
        </div>
        <button
          onClick={() => setShowHelp((s) => !s)}
          className="!flex !items-center !gap-2 !px-3 !py-2 !rounded-lg !text-sm bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 !border border-slate-200 dark:border-slate-700 hover:!bg-slate-100 dark:hover:!bg-slate-700"
        >
          <Keyboard className="!w-4 !h-4" />
          Atajos
        </button>
      </div>

      {showHelp && (
        <div className="bg-white dark:bg-slate-800 !rounded-xl !p-4 !border border-slate-200 dark:border-slate-700">
          <div className="!grid sm:!grid-cols-2 lg:!grid-cols-4 !gap-3 !text-sm text-slate-600 dark:text-slate-300">
            {[
              ['J / K', 'Siguiente / anterior'],
              ['A', 'Aprobar'],
              ['P', 'Publicar (si está aprobado)'],
              ['R', 'Rechazar'],
              ['E', 'Editar'],
              ['V', 'Ver el detalle y la evidencia'],
              ['Enter', 'Abrir la fuente original'],
              ['?', 'Mostrar u ocultar esta ayuda'],
            ].map(([k, d]) => (
              <div key={k} className="!flex !items-center !gap-2">
                <kbd className="!px-2 !py-0.5 !rounded bg-slate-100 dark:bg-slate-900 !font-mono !text-xs !border border-slate-300 dark:border-slate-600">{k}</kbd>
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pestañas */}
      <div className="!flex !gap-2 !flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`!px-4 !py-2 !rounded-lg !text-sm !font-medium !transition-colors ${
              status === tab.value
                ? '!bg-emerald-600 !text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:!bg-slate-100 dark:hover:!bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="!flex !items-center !justify-center !py-20 text-slate-400">
          <Loader2 className="!w-6 !h-6 !animate-spin !mr-2" />
          Cargando…
        </div>
      ) : articles.length === 0 ? (
        <div className="!text-center !py-20">
          <Newspaper className="!w-12 !h-12 !mx-auto text-slate-300 dark:text-slate-600" />
          <p className="!mt-3 text-slate-500 dark:text-slate-400">
            {status === 'pending' ? 'No hay nada por revisar. Al día.' : 'Sin artículos en este estado.'}
          </p>
        </div>
      ) : (
        <div className="!space-y-4">
          {articles.map((a, i) => {
            const active = i === cursor;
            const isEditing = editing === a.id;

            return (
              <div
                key={a.id}
                ref={(el) => { cardRefs.current[a.id] = el; }}
                onClick={() => setCursor(i)}
                className={`bg-white dark:bg-slate-800 !rounded-xl !p-5 !border !transition-all ${
                  active
                    ? '!border-emerald-500 !ring-2 !ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700'
                } ${busy === a.id ? '!opacity-50' : ''}`}
              >
                {/* Metadatos */}
                <div className="!flex !items-center !gap-2 !flex-wrap !mb-3 !text-xs">
                  {a.importance !== null && (
                    <span className={`!px-2 !py-0.5 !rounded-full !font-medium ${importanceColor(a.importance)}`}>
                      Importancia {a.importance}/5
                    </span>
                  )}
                  <ConfidenceBadge score={a.confidenceScore} needsReview={a.needsReview} />
                  {a.isRegulatory && (
                    <span className="!px-2 !py-0.5 !rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 !font-medium">
                      Regulatorio
                    </span>
                  )}
                  {a.affectsTransport && (
                    <span className="!px-2 !py-0.5 !rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 !font-medium">
                      Afecta transporte
                    </span>
                  )}
                  {a.contentSource === 'feed_only' && (
                    <span className="!px-2 !py-0.5 !rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      Solo resumen del feed
                    </span>
                  )}
                  <span className="text-slate-400 dark:text-slate-500 !ml-auto">
                    {a.source?.name} · {fmt(a.discoveredAt)}
                  </span>
                </div>

                {isEditing ? (
                  <div className="!space-y-3">
                    <input
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      className="!w-full !px-3 !py-2 !rounded-lg !border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 !font-semibold"
                      placeholder="Titular"
                    />
                    <textarea
                      value={draft.summary}
                      onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                      rows={4}
                      className="!w-full !px-3 !py-2 !rounded-lg !border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 !text-sm"
                      placeholder="Resumen"
                    />
                    <textarea
                      value={draft.whyItMatters}
                      onChange={(e) => setDraft({ ...draft, whyItMatters: e.target.value })}
                      rows={2}
                      className="!w-full !px-3 !py-2 !rounded-lg !border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 !text-sm"
                      placeholder="Por qué importa"
                    />
                    <div className="!flex !gap-2">
                      <button
                        onClick={() => saveEdit(a)}
                        className="!px-4 !py-2 !rounded-lg !bg-emerald-600 !text-white !text-sm !font-medium hover:!bg-emerald-700"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="!px-4 !py-2 !rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 !text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="!text-lg !font-semibold text-slate-800 dark:text-slate-100 !leading-snug">
                      <Link
                        to={`/admin/noticias/${a.id}`}
                        className="hover:!text-emerald-600 dark:hover:!text-emerald-400"
                      >
                        {a.title}
                      </Link>
                    </h2>

                    {a.originalTitle && a.originalTitle !== a.title && (
                      <p className="!mt-1 !text-xs text-slate-400 dark:text-slate-500 !flex !items-start !gap-1">
                        <Copy className="!w-3 !h-3 !mt-0.5 !shrink-0" />
                        <span>Titular del medio: {a.originalTitle}</span>
                      </p>
                    )}

                    {a.summary && (
                      <p className="!mt-2 !text-sm text-slate-600 dark:text-slate-300 !leading-relaxed">
                        {a.summary}
                      </p>
                    )}

                    {a.whyItMatters && (
                      <p className="!mt-3 !p-3 !rounded-lg bg-slate-50 dark:bg-slate-900 !border-l-2 !border-emerald-500 !text-sm text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-800 dark:text-slate-100">Por qué importa: </strong>
                        {a.whyItMatters}
                      </p>
                    )}

                    <div className="!flex !gap-1.5 !flex-wrap !mt-3">
                      {a.categories.map((c) => (
                        <span key={c} className="!px-2 !py-0.5 !rounded !text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {c}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {/* Acciones */}
                {!isEditing && (
                  <div className="!flex !items-center !gap-2 !flex-wrap !mt-4 !pt-4 !border-t border-slate-100 dark:border-slate-700">
                    {a.status === 'pending' && (
                      <button
                        onClick={() => approve(a)}
                        disabled={busy === a.id}
                        className="!flex !items-center !gap-1.5 !px-3 !py-1.5 !rounded-lg !bg-emerald-600 !text-white !text-sm !font-medium hover:!bg-emerald-700 disabled:!opacity-50"
                      >
                        <Check className="!w-4 !h-4" /> Aprobar
                        <kbd className="!ml-1 !text-xs !opacity-70">A</kbd>
                      </button>
                    )}

                    {a.status === 'approved' && (
                      <button
                        onClick={() => publish(a)}
                        disabled={busy === a.id}
                        className="!flex !items-center !gap-1.5 !px-3 !py-1.5 !rounded-lg !bg-sky-600 !text-white !text-sm !font-medium hover:!bg-sky-700 disabled:!opacity-50"
                      >
                        <Send className="!w-4 !h-4" /> Publicar
                        <kbd className="!ml-1 !text-xs !opacity-70">P</kbd>
                      </button>
                    )}

                    {a.status !== 'rejected' && (
                      <button
                        onClick={() => setRejecting(a)}
                        className="!flex !items-center !gap-1.5 !px-3 !py-1.5 !rounded-lg bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 !text-sm !border border-rose-200 dark:border-slate-600 hover:!bg-rose-50 dark:hover:!bg-slate-600"
                      >
                        <X className="!w-4 !h-4" /> Rechazar
                        <kbd className="!ml-1 !text-xs !opacity-70">R</kbd>
                      </button>
                    )}

                    <button
                      onClick={() => startEdit(a)}
                      className="!flex !items-center !gap-1.5 !px-3 !py-1.5 !rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 !text-sm hover:!bg-slate-200 dark:hover:!bg-slate-600"
                    >
                      <Pencil className="!w-4 !h-4" /> Editar
                      <kbd className="!ml-1 !text-xs !opacity-70">E</kbd>
                    </button>

                    <button
                      onClick={() => regenerate(a)}
                      className="!flex !items-center !gap-1.5 !px-3 !py-1.5 !rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 !text-sm hover:!bg-slate-200 dark:hover:!bg-slate-600"
                      title="Vuelve a redactar el resumen y regenera la imagen"
                    >
                      <ImageIcon className="!w-4 !h-4" /> Regenerar
                    </button>

                    <Link
                      to={`/admin/noticias/${a.id}`}
                      className="!flex !items-center !gap-1.5 !px-3 !py-1.5 !rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 !text-sm hover:!bg-slate-200 dark:hover:!bg-slate-600"
                      title="Ver la evidencia de extracción"
                    >
                      <FileSearch className="!w-4 !h-4" /> Detalle
                      <kbd className="!ml-1 !text-xs !opacity-70">V</kbd>
                    </Link>

                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="!flex !items-center !gap-1.5 !px-3 !py-1.5 !rounded-lg text-slate-500 dark:text-slate-400 !text-sm hover:!bg-slate-100 dark:hover:!bg-slate-700 !ml-auto"
                    >
                      <ExternalLink className="!w-4 !h-4" /> Ver original
                    </a>
                  </div>
                )}
              </div>
            );
          })}

          {/* Navegación */}
          <div className="!flex !items-center !justify-center !gap-3 !text-sm text-slate-400 !pt-2">
            <button onClick={() => setCursor((c) => Math.max(c - 1, 0))} className="!p-1 hover:text-slate-600 dark:hover:text-slate-200">
              <ChevronUp className="!w-4 !h-4" />
            </button>
            <span>{cursor + 1} de {articles.length}</span>
            <button onClick={() => setCursor((c) => Math.min(c + 1, articles.length - 1))} className="!p-1 hover:text-slate-600 dark:hover:text-slate-200">
              <ChevronDown className="!w-4 !h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Diálogo de rechazo — el motivo es obligatorio */}
      {rejecting && (
        <div className="!fixed !inset-0 !bg-black/50 !flex !items-center !justify-center !z-50 !p-4" onClick={() => setRejecting(null)}>
          <div className="bg-white dark:bg-slate-800 !rounded-xl !p-6 !max-w-lg !w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="!text-lg !font-semibold text-slate-800 dark:text-slate-100">Rechazar artículo</h3>
            <p className="!text-sm text-slate-500 dark:text-slate-400 !mt-1">
              El motivo es obligatorio: es lo que permite ajustar los filtros después con datos.
            </p>

            <div className="!flex !flex-wrap !gap-2 !mt-4">
              {MOTIVOS_RAPIDOS.map((m) => (
                <button
                  key={m}
                  onClick={() => setRejectReason(m)}
                  className="!px-2.5 !py-1 !rounded-lg !text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:!bg-slate-200 dark:hover:!bg-slate-600"
                >
                  {m}
                </button>
              ))}
            </div>

            <textarea
              autoFocus
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="!w-full !mt-3 !px-3 !py-2 !rounded-lg !border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 !text-sm"
              placeholder="Motivo del rechazo"
            />

            <div className="!flex !gap-2 !mt-4 !justify-end">
              <button
                onClick={() => { setRejecting(null); setRejectReason(''); }}
                className="!px-4 !py-2 !rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 !text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className="!px-4 !py-2 !rounded-lg !bg-rose-600 !text-white !text-sm !font-medium hover:!bg-rose-700 disabled:!opacity-40"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsQueuePage;
