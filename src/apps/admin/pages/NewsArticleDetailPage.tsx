import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Check, X, Send, Pencil, ExternalLink, Image as ImageIcon, Quote, AlertTriangle, FileQuestion,
} from 'lucide-react';
import { toast } from 'sonner';
import adminNewsApi from '../services/adminNewsApi';
import type {
  AdminNewsArticleDetail, AnchoredField, NewsStatus,
} from '../../../types/news.types';
import {
  EmptyState, Modal, PageHeader, Panel, Skeleton, StatusBadge, type StatusTone, formatInt,
} from '../ui';

/**
 * Detalle de un artículo para revisión.
 *
 * Lo que distingue esta pantalla de la cola: muestra la EVIDENCIA. Cada dato
 * que extrajo el modelo viene con la cita literal del texto original que lo
 * respalda, y se ve cuáles no pasaron la verificación.
 *
 * Eso es lo que permite decidir con criterio en un caso dudoso, en vez de
 * confiar a ciegas en un score.
 */

const STATUS: Record<NewsStatus, { label: string; tone: StatusTone }> = {
  pending: { label: 'Por revisar', tone: 'warning' },
  approved: { label: 'Aprobado', tone: 'info' },
  published: { label: 'Publicado', tone: 'success' },
  rejected: { label: 'Rechazado', tone: 'danger' },
  archived: { label: 'Archivado', tone: 'neutral' },
};

const MOTIVOS_RAPIDOS = [
  'Sin relación con transporte ni logística',
  'Contenido promocional',
  'Duplicado de otra noticia',
  'Información insuficiente o poco fiable',
];

const fmt = (d: string | null) =>
  d
    ? new Date(d).toLocaleString('es-CL', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      })
    : '—';

/** Campo con su cita textual: verificado, anulado o ausente. */
const AnchoredRow: React.FC<{ label: string; field?: AnchoredField }> = ({ label, field }) => {
  if (!field) return null;

  const rejected = field._rejected !== undefined;
  const empty = field.valor === null && !rejected;

  return (
    <div className="adm-evidence__row">
      <span className="adm-evidence__label">{label}</span>
      <div className="adm-evidence__value">
        {rejected ? (
          <>
            <span className="adm-evidence__rejected">
              <AlertTriangle aria-hidden="true" />
              <s>{String(field._rejected)}</s>
            </span>
            <span className="adm-evidence__note adm-evidence__note--danger">
              Anulado: la cita no aparece en el texto original.
            </span>
          </>
        ) : empty ? (
          <span className="adm-cell-mute">Sin dato: el modelo no encontró respaldo textual</span>
        ) : (
          <>
            <b>{String(field.valor)}</b>
            {field.span && (
              <span className="adm-evidence__quote">
                <Quote aria-hidden="true" />
                <q>{field.span}</q>
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const NewsArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<AdminNewsArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: '', summary: '', whyItMatters: '' });
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await adminNewsApi.getArticle(id);
      setArticle(res.data);
      setDraft({
        title: res.data.title ?? '',
        summary: res.data.summary ?? '',
        whyItMatters: res.data.whyItMatters ?? '',
      });
    } catch {
      toast.error('No se pudo cargar el artículo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  /** Devuelve true si la acción terminó bien. */
  const act = async (fn: () => Promise<unknown>, ok: string, back = true) => {
    try {
      setBusy(true);
      await fn();
      toast.success(ok);
      if (back) navigate('/admin/noticias');
      else await load();
      return true;
    } catch (err: any) {
      toast.error(err?.message || 'La acción falló');
      return false;
    } finally {
      setBusy(false);
    }
  };

  // Antes cerraba el editor aunque el guardado fallara y se perdían los cambios.
  const save = async () => {
    if (!id) return;
    if (await act(() => adminNewsApi.updateArticle(id, draft), 'Cambios guardados', false)) setEditing(false);
  };

  const closeReject = () => { setRejectOpen(false); setReason(''); };

  const back = (
    <button type="button" className="adm-back" onClick={() => navigate('/admin/noticias')}>
      <ArrowLeft aria-hidden="true" /> Volver a la cola
    </button>
  );

  if (loading) {
    return (
      <div className="adm-page" aria-busy="true">
        {back}
        <Skeleton height={64} />
        <div className="adm-grid adm-grid--2-1">
          <Skeleton height={420} />
          <Skeleton height={320} />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="adm-page">
        {back}
        <section className="adm-panel">
          <EmptyState icon={FileQuestion} title="Artículo no encontrado" text="Puede que se haya eliminado o que el enlace esté incompleto." />
          <p style={{ textAlign: 'center' }}><Link to="/admin/noticias" className="adm-link">Volver a la cola</Link></p>
        </section>
      </div>
    );
  }

  const v = article.extractionSpans?._verificacion;
  const spans = article.extractionSpans;
  const st = STATUS[article.status] ?? { label: article.status, tone: 'neutral' as StatusTone };
  const trust = article.source
    ? article.source.trustScore.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—';

  return (
    <div className="adm-page">
      {back}

      <PageHeader
        title={article.title}
        description={`${article.source?.name ?? 'Fuente desconocida'} · ${fmt(article.discoveredAt)}`}
        actions={<StatusBadge tone={st.tone}>{st.label}</StatusBadge>}
      />

      <div className="adm-grid adm-grid--2-1" style={{ alignItems: 'start' }}>
        {/* Contenido */}
        <div className="adm-stack-v">
          <Panel title={editing ? 'Editar contenido' : 'Contenido'}>
            {editing ? (
              <div className="adm-stack-v">
                <div className="adm-field">
                  <label className="adm-field__label" htmlFor="na-title">Titular</label>
                  <input id="na-title" className="adm-input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                </div>
                <div className="adm-field">
                  <label className="adm-field__label" htmlFor="na-summary">Resumen</label>
                  <textarea id="na-summary" className="adm-textarea" rows={6} value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} />
                </div>
                <div className="adm-field">
                  <label className="adm-field__label" htmlFor="na-why">Por qué importa</label>
                  <textarea id="na-why" className="adm-textarea" rows={3} value={draft.whyItMatters} onChange={(e) => setDraft({ ...draft, whyItMatters: e.target.value })} />
                </div>
                <div className="adm-actions-row">
                  <button type="button" className="adm-btn adm-btn--primary" onClick={save} disabled={busy}>Guardar</button>
                  <button type="button" className="adm-btn" onClick={() => setEditing(false)} disabled={busy}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="adm-stack-v">
                {article.originalTitle && article.originalTitle !== article.title && (
                  <p className="adm-news-card__original">Titular del medio: {article.originalTitle}</p>
                )}

                {article.imageUrl && (
                  <figure className="adm-figure">
                    <img src={article.imageUrl} alt="" />
                    {article.imageSource === 'generated' && <figcaption>Imagen generada con IA</figcaption>}
                  </figure>
                )}

                {article.summary && <p className="adm-news-card__summary">{article.summary}</p>}

                {Array.isArray(article.keyPoints) && article.keyPoints.length > 0 && (
                  <div>
                    <h3 className="adm-subhead">Puntos clave</h3>
                    <ul className="adm-plain-list">
                      {article.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}

                {article.whyItMatters && (
                  <p className="adm-news-card__why"><b>Por qué importa:</b> {article.whyItMatters}</p>
                )}

                {article.categories.length > 0 && (
                  <div className="adm-chips">
                    {article.categories.map((c) => <span key={c} className="adm-tag">{c}</span>)}
                  </div>
                )}
              </div>
            )}
          </Panel>

          {/* Evidencia de verificación */}
          {spans && (
            <Panel
              title="Evidencia de extracción"
              description="Cada dato lleva la cita literal del artículo original que lo respalda. Lo que no se pudo verificar aparece anulado."
              aside={v ? <StatusBadge tone={v.respaldados < v.comprobados ? 'warning' : 'success'}>{formatInt(v.respaldados)} de {formatInt(v.comprobados)} con respaldo</StatusBadge> : undefined}
            >
              <div className="adm-evidence">
                <AnchoredRow label="Organismo" field={spans.organismo} />
                <AnchoredRow label="Fecha de publicación" field={spans.fecha_publicacion} />
                <AnchoredRow label="Fecha de vigencia" field={spans.fecha_vigencia} />
                {spans.empresas?.map((e, i) => (
                  <AnchoredRow key={i} label={i === 0 ? 'Empresas' : ''} field={e} />
                ))}
              </div>

              {v && v.rechazados.length > 0 && (
                <div className="adm-alert adm-alert--warning" style={{ marginTop: 12 }}>
                  <AlertTriangle aria-hidden="true" />
                  <div>
                    <b>{formatInt(v.rechazados.length)} {v.rechazados.length === 1 ? 'campo anulado' : 'campos anulados'}.</b>{' '}
                    Si este patrón se repite en muchos artículos, el prompt tiene un problema que se puede corregir.
                  </div>
                </div>
              )}
            </Panel>
          )}
        </div>

        {/* Panel lateral */}
        <div className="adm-stack-v">
          <Panel title="Decisión">
            <div className="adm-stack-v">
              {article.status === 'pending' && (
                <button type="button" className="adm-btn adm-btn--primary adm-btn--block" onClick={() => act(() => adminNewsApi.approveArticle(article.id), 'Aprobado')} disabled={busy}>
                  <Check aria-hidden="true" /> Aprobar
                </button>
              )}
              {article.status === 'approved' && (
                <button type="button" className="adm-btn adm-btn--primary adm-btn--block" onClick={() => act(() => adminNewsApi.publishArticle(article.id), 'Publicado')} disabled={busy}>
                  <Send aria-hidden="true" /> Publicar
                </button>
              )}
              {article.status !== 'rejected' && (
                <button type="button" className="adm-btn adm-btn--block" onClick={() => setRejectOpen(true)} disabled={busy}>
                  <X aria-hidden="true" /> Rechazar
                </button>
              )}
              <div className="adm-actions-row">
                <button type="button" className="adm-btn adm-btn--sm" onClick={() => setEditing(true)} disabled={editing}>
                  <Pencil aria-hidden="true" /> Editar
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn--sm"
                  onClick={() => act(() => adminNewsApi.regenerateImage(article.id), 'Regeneración encolada', false)}
                  disabled={busy}
                  title="Vuelve a redactar el resumen y regenera la imagen"
                >
                  <ImageIcon aria-hidden="true" /> Regenerar
                </button>
              </div>
              <a href={article.url} target="_blank" rel="noopener noreferrer nofollow" className="adm-link">
                Ver el artículo original <ExternalLink aria-hidden="true" />
              </a>
            </div>
          </Panel>

          <Panel title="Clasificación">
            {article.needsReview && (
              <div className="adm-alert adm-alert--warning" style={{ marginBottom: 12 }}>
                <AlertTriangle aria-hidden="true" />
                <div>Confianza bajo el umbral: conviene leerlo con más atención antes de aprobar.</div>
              </div>
            )}
            <dl className="adm-dl">
              <dt>Confianza del modelo</dt>
              <dd>{article.confidenceScore !== null ? `${Math.round(article.confidenceScore * 100)} %` : '—'}</dd>
              <dt>Importancia</dt>
              <dd>{article.importance !== null ? `${article.importance} de 5` : '—'}</dd>
              <dt>Regulatorio</dt>
              <dd>{article.isRegulatory ? 'Sí' : 'No'}</dd>
              <dt>Afecta al transporte</dt>
              <dd>{article.affectsTransport ? 'Sí' : 'No'}</dd>
              <dt>Confianza de la fuente</dt>
              <dd>{trust}</dd>
              <dt>Texto extraído</dt>
              <dd>{article.contentSource === 'feed_only' ? 'Solo resumen del feed' : 'Completo'}</dd>
              {article.replicatedBy > 0 && (
                <>
                  <dt>También publicada en</dt>
                  <dd>{formatInt(article.replicatedBy)} {article.replicatedBy === 1 ? 'fuente más' : 'fuentes más'}</dd>
                </>
              )}
            </dl>
          </Panel>

          <Panel title="Trazabilidad">
            <dl className="adm-dl adm-dl--stacked">
              <dt>Modelo</dt>
              <dd className="adm-mono">{article.modelId ?? '—'}</dd>
              <dt>Versión del prompt</dt>
              <dd className="adm-mono">{article.promptVersion ?? '—'}</dd>
              <dt>Descubierto</dt>
              <dd>{fmt(article.discoveredAt)}</dd>
              <dt>Publicado en origen</dt>
              <dd>{fmt(article.publishedAt)}</dd>
              <dt>Publicado en el sitio</dt>
              <dd>{fmt(article.publishedAtSite)}</dd>
            </dl>
            {article.rejectionReason && (
              <p className="adm-note" style={{ marginTop: 12 }}>
                <b>Motivo del rechazo:</b> {article.rejectionReason}
              </p>
            )}
          </Panel>
        </div>
      </div>

      {/* Rechazo: el motivo es obligatorio */}
      <Modal
        open={rejectOpen}
        title="Rechazar artículo"
        onClose={closeReject}
        footer={
          <>
            <button type="button" className="adm-btn" onClick={closeReject}>Cancelar</button>
            <button
              type="button"
              className="adm-btn adm-btn--danger"
              disabled={!reason.trim()}
              onClick={() => {
                const r = reason;
                closeReject();
                act(() => adminNewsApi.rejectArticle(article.id, r), 'Rechazado');
              }}
            >
              Rechazar
            </button>
          </>
        }
      >
        <p>El motivo es obligatorio: permite ajustar los filtros después con datos.</p>
        <div className="adm-chips">
          {MOTIVOS_RAPIDOS.map((m) => (
            <button key={m} type="button" className="adm-tag adm-tag--button" aria-pressed={reason === m} onClick={() => setReason(m)}>
              {m}
            </button>
          ))}
        </div>
        <div className="adm-field">
          <label className="adm-field__label" htmlFor="na-reject">Motivo del rechazo</label>
          <textarea id="na-reject" className="adm-textarea" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
};

export default NewsArticleDetailPage;
