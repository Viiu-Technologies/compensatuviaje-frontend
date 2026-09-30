import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Check, X, Pencil, ExternalLink, ChevronUp, ChevronDown,
  Send, Keyboard, Image as ImageIcon, FileSearch, Newspaper,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import adminNewsApi from '../services/adminNewsApi';
import type { AdminNewsArticle, NewsStatus } from '../../../types/news.types';
import { EmptyState, Modal, PageHeader, Panel, Segmented, Skeleton, StatusBadge, type StatusTone } from '../ui';

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

const SHORTCUTS: Array<[string, string]> = [
  ['J / K', 'Siguiente / anterior'],
  ['A', 'Aprobar'],
  ['P', 'Publicar (si está aprobado)'],
  ['R', 'Rechazar'],
  ['E', 'Editar'],
  ['V', 'Ver el detalle y la evidencia'],
  ['Enter', 'Abrir la fuente original'],
  ['?', 'Mostrar u ocultar esta ayuda'],
];

/** Importancia alta pide atención; no es un error, así que no va en rojo. */
const importanceTone = (n: number | null): StatusTone => {
  if (n === null) return 'neutral';
  if (n >= 4) return 'warning';
  if (n === 3) return 'info';
  return 'neutral';
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
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

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
    d ? new Date(d).toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }) : '—';

  const closeReject = () => { setRejecting(null); setRejectReason(''); };

  return (
    <div className="adm-page">
      <PageHeader
        title="Noticias"
        description="Revisa lo que el pipeline clasificó y decide qué se publica. Nada sale sin tu aprobación."
        actions={
          <button type="button" className="adm-btn" onClick={() => setShowHelp((s) => !s)} aria-expanded={showHelp}>
            <Keyboard aria-hidden="true" /> Atajos
          </button>
        }
      />

      {showHelp && (
        <Panel title="Atajos de teclado">
          <dl className="adm-shortcuts">
            {SHORTCUTS.map(([k, d]) => (
              <div key={k}>
                <dt><kbd className="adm-kbd">{k}</kbd></dt>
                <dd>{d}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      )}

      <Segmented
        label="Estado de los artículos"
        options={STATUS_TABS}
        value={status}
        onChange={(v) => setStatus(v as NewsStatus | 'all')}
      />

      {loading ? (
        <div className="adm-stack-v">
          {[0, 1, 2].map((i) => <Skeleton key={i} height={170} />)}
        </div>
      ) : articles.length === 0 ? (
        <section className="adm-panel">
          <EmptyState
            icon={Newspaper}
            title={status === 'pending' ? 'No hay nada por revisar' : 'Sin artículos en este estado'}
            text={status === 'pending' ? 'La cola está al día.' : undefined}
          />
        </section>
      ) : (
        <div className="adm-stack-v">
          {articles.map((a, i) => {
            const active = i === cursor;
            const isEditing = editing === a.id;

            return (
              <article
                key={a.id}
                ref={(el) => { cardRefs.current[a.id] = el; }}
                onClick={() => setCursor(i)}
                className={`adm-news-card${active ? ' adm-news-card--active' : ''}${busy === a.id ? ' adm-news-card--busy' : ''}`}
                aria-current={active ? 'true' : undefined}
              >
                <div className="adm-news-card__meta">
                  {a.importance !== null && (
                    <StatusBadge tone={importanceTone(a.importance)}>Importancia {a.importance}/5</StatusBadge>
                  )}
                  {a.confidenceScore !== null && (
                    <StatusBadge tone={a.needsReview ? 'warning' : 'neutral'}>
                      {Math.round(a.confidenceScore * 100)} % de confianza{a.needsReview ? ' · revisar' : ''}
                    </StatusBadge>
                  )}
                  {a.isRegulatory && <StatusBadge tone="info">Regulatorio</StatusBadge>}
                  {a.affectsTransport && <StatusBadge tone="neutral">Afecta al transporte</StatusBadge>}
                  {a.contentSource === 'feed_only' && <StatusBadge tone="neutral">Solo resumen del feed</StatusBadge>}
                  <span className="adm-news-card__source">{a.source?.name} · {fmt(a.discoveredAt)}</span>
                </div>

                {isEditing ? (
                  <div className="adm-stack-v">
                    <div className="adm-field">
                      <label className="adm-field__label" htmlFor={`nq-title-${a.id}`}>Titular</label>
                      <input id={`nq-title-${a.id}`} className="adm-input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                    </div>
                    <div className="adm-field">
                      <label className="adm-field__label" htmlFor={`nq-summary-${a.id}`}>Resumen</label>
                      <textarea id={`nq-summary-${a.id}`} className="adm-textarea" rows={4} value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} />
                    </div>
                    <div className="adm-field">
                      <label className="adm-field__label" htmlFor={`nq-why-${a.id}`}>Por qué importa</label>
                      <textarea id={`nq-why-${a.id}`} className="adm-textarea" rows={2} value={draft.whyItMatters} onChange={(e) => setDraft({ ...draft, whyItMatters: e.target.value })} />
                    </div>
                    <div className="adm-actions-row">
                      <button type="button" className="adm-btn adm-btn--primary" onClick={() => saveEdit(a)} disabled={busy === a.id}>Guardar</button>
                      <button type="button" className="adm-btn" onClick={() => setEditing(null)}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="adm-news-card__title">
                      <Link to={`/admin/noticias/${a.id}`}>{a.title}</Link>
                    </h2>
                    {a.originalTitle && a.originalTitle !== a.title && (
                      <p className="adm-news-card__original">Titular del medio: {a.originalTitle}</p>
                    )}
                    {a.summary && <p className="adm-news-card__summary">{a.summary}</p>}
                    {a.whyItMatters && (
                      <p className="adm-news-card__why"><b>Por qué importa:</b> {a.whyItMatters}</p>
                    )}
                    {a.categories.length > 0 && (
                      <div className="adm-chips">
                        {a.categories.map((c) => <span key={c} className="adm-tag">{c}</span>)}
                      </div>
                    )}

                    <div className="adm-news-card__actions">
                      {a.status === 'pending' && (
                        <button type="button" className="adm-btn adm-btn--sm adm-btn--primary" onClick={() => approve(a)} disabled={busy === a.id}>
                          <Check aria-hidden="true" /> Aprobar <kbd className="adm-kbd adm-kbd--inverse">A</kbd>
                        </button>
                      )}
                      {a.status === 'approved' && (
                        <button type="button" className="adm-btn adm-btn--sm adm-btn--primary" onClick={() => publish(a)} disabled={busy === a.id}>
                          <Send aria-hidden="true" /> Publicar <kbd className="adm-kbd adm-kbd--inverse">P</kbd>
                        </button>
                      )}
                      {a.status !== 'rejected' && (
                        <button type="button" className="adm-btn adm-btn--sm" onClick={() => setRejecting(a)}>
                          <X aria-hidden="true" /> Rechazar <kbd className="adm-kbd">R</kbd>
                        </button>
                      )}
                      <button type="button" className="adm-btn adm-btn--sm" onClick={() => startEdit(a)}>
                        <Pencil aria-hidden="true" /> Editar <kbd className="adm-kbd">E</kbd>
                      </button>
                      <button type="button" className="adm-btn adm-btn--sm" onClick={() => regenerate(a)} title="Vuelve a redactar el resumen y regenera la imagen">
                        <ImageIcon aria-hidden="true" /> Regenerar
                      </button>
                      <Link to={`/admin/noticias/${a.id}`} className="adm-btn adm-btn--sm" title="Ver la evidencia de extracción">
                        <FileSearch aria-hidden="true" /> Detalle <kbd className="adm-kbd">V</kbd>
                      </Link>
                      <a href={a.url} target="_blank" rel="noopener noreferrer nofollow" className="adm-link adm-news-card__external">
                        Ver original <ExternalLink aria-hidden="true" />
                      </a>
                    </div>
                  </>
                )}
              </article>
            );
          })}

          <div className="adm-news-nav">
            <button type="button" className="adm-icon-btn" onClick={() => setCursor((c) => Math.max(c - 1, 0))} aria-label="Artículo anterior">
              <ChevronUp aria-hidden="true" />
            </button>
            <span>{cursor + 1} de {articles.length}</span>
            <button type="button" className="adm-icon-btn" onClick={() => setCursor((c) => Math.min(c + 1, articles.length - 1))} aria-label="Artículo siguiente">
              <ChevronDown aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Rechazo: el motivo es obligatorio */}
      <Modal
        open={!!rejecting}
        title="Rechazar artículo"
        onClose={closeReject}
        footer={
          <>
            <button type="button" className="adm-btn" onClick={closeReject}>Cancelar</button>
            <button type="button" className="adm-btn adm-btn--danger" onClick={confirmReject} disabled={!rejectReason.trim()}>Rechazar</button>
          </>
        }
      >
        <p>El motivo es obligatorio: permite ajustar los filtros después con datos.</p>
        <div className="adm-chips">
          {MOTIVOS_RAPIDOS.map((m) => (
            <button key={m} type="button" className="adm-tag adm-tag--button" aria-pressed={rejectReason === m} onClick={() => setRejectReason(m)}>
              {m}
            </button>
          ))}
        </div>
        <div className="adm-field">
          <label className="adm-field__label" htmlFor="nq-reject">Motivo del rechazo</label>
          <textarea id="nq-reject" className="adm-textarea" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
};

export default NewsQueuePage;
