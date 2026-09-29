import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Check, X, Send, Pencil, ExternalLink, ShieldAlert, ShieldCheck,
  Loader2, Image as ImageIcon, Copy, Quote, AlertTriangle, Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import adminNewsApi from '../services/adminNewsApi';
import type {
  AdminNewsArticleDetail, AnchoredField,
} from '../../../types/news.types';

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

const fmt = (d: string | null) =>
  d
    ? new Date(d).toLocaleString('es-CL', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—';

/** Campo con su cita textual: verificado, anulado o ausente. */
const AnchoredRow: React.FC<{ label: string; field?: AnchoredField }> = ({ label, field }) => {
  if (!field) return null;

  const rejected = field._rejected !== undefined;
  const empty = field.valor === null && !rejected;

  return (
    <div className="!py-3 !border-b border-slate-100 dark:border-slate-700 last:!border-0">
      <div className="!flex !items-start !gap-2">
        <span className="!text-xs !font-medium text-slate-500 dark:text-slate-400 !w-32 !shrink-0 !pt-0.5">
          {label}
        </span>
        <div className="!flex-1 !min-w-0">
          {rejected ? (
            <>
              <span className="!inline-flex !items-center !gap-1 !text-sm text-rose-600 dark:text-rose-400 !line-through">
                <AlertTriangle className="!w-3.5 !h-3.5" />
                {String(field._rejected)}
              </span>
              <p className="!text-xs text-rose-500 dark:text-rose-400 !mt-1">
                Anulado: la cita no aparece en el texto original.
              </p>
            </>
          ) : empty ? (
            <span className="!text-sm text-slate-400 dark:text-slate-500 !italic">
              Sin dato — el modelo no encontró respaldo textual
            </span>
          ) : (
            <>
              <span className="!text-sm text-slate-800 dark:text-slate-100 !font-medium">
                {String(field.valor)}
              </span>
              {field.span && (
                <p className="!flex !items-start !gap-1.5 !text-xs text-slate-500 dark:text-slate-400 !mt-1 !italic">
                  <Quote className="!w-3 !h-3 !shrink-0 !mt-0.5" />
                  <span>“{field.span}”</span>
                </p>
              )}
            </>
          )}
        </div>
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

  const act = async (fn: () => Promise<unknown>, ok: string, back = true) => {
    try {
      setBusy(true);
      await fn();
      toast.success(ok);
      if (back) navigate('/admin/noticias');
      else await load();
    } catch (err: any) {
      toast.error(err?.message || 'La acción falló');
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!id) return;
    await act(() => adminNewsApi.updateArticle(id, draft), 'Cambios guardados', false);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="!flex !items-center !justify-center !py-20 text-slate-400">
        <Loader2 className="!w-6 !h-6 !animate-spin !mr-2" /> Cargando…
      </div>
    );
  }

  if (!article) {
    return (
      <div className="!text-center !py-20">
        <p className="text-slate-500 dark:text-slate-400">Artículo no encontrado.</p>
        <Link to="/admin/noticias" className="!text-emerald-600 !mt-2 !inline-block">
          Volver a la cola
        </Link>
      </div>
    );
  }

  const v = article.extractionSpans?._verificacion;
  const spans = article.extractionSpans;

  return (
    <div className="!space-y-6 bg-slate-50 dark:bg-slate-900 !p-6 md:!p-8 !rounded-3xl">
      {/* Cabecera */}
      <div className="!flex !items-center !gap-3">
        <button
          onClick={() => navigate('/admin/noticias')}
          className="!p-2 !rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 !border border-slate-200 dark:border-slate-700 hover:!bg-slate-100 dark:hover:!bg-slate-700"
        >
          <ArrowLeft className="!w-4 !h-4" />
        </button>
        <div className="!flex-1 !min-w-0">
          <p className="!text-xs text-slate-500 dark:text-slate-400">
            {article.source?.name} · {fmt(article.discoveredAt)}
          </p>
        </div>
        <span
          className={`!px-2.5 !py-1 !rounded-full !text-xs !font-medium ${
            article.status === 'published'
              ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
              : article.status === 'approved'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : article.status === 'rejected'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
          }`}
        >
          {article.status}
        </span>
      </div>

      <div className="!grid lg:!grid-cols-3 !gap-6">
        {/* Contenido */}
        <div className="lg:!col-span-2 !space-y-4">
          <div className="bg-white dark:bg-slate-800 !rounded-xl !p-5 !border border-slate-200 dark:border-slate-700">
            {editing ? (
              <div className="!space-y-3">
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="!w-full !px-3 !py-2 !rounded-lg !border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 !font-semibold"
                />
                <textarea
                  value={draft.summary}
                  onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                  rows={6}
                  className="!w-full !px-3 !py-2 !rounded-lg !border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 !text-sm"
                />
                <textarea
                  value={draft.whyItMatters}
                  onChange={(e) => setDraft({ ...draft, whyItMatters: e.target.value })}
                  rows={3}
                  className="!w-full !px-3 !py-2 !rounded-lg !border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 !text-sm"
                  placeholder="Por qué importa"
                />
                <div className="!flex !gap-2">
                  <button onClick={save} disabled={busy} className="!px-4 !py-2 !rounded-lg !bg-emerald-600 !text-white !text-sm !font-medium">
                    Guardar
                  </button>
                  <button onClick={() => setEditing(false)} className="!px-4 !py-2 !rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 !text-sm">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="!text-xl !font-bold text-slate-800 dark:text-slate-100 !leading-snug">
                  {article.title}
                </h1>

                {article.originalTitle && article.originalTitle !== article.title && (
                  <p className="!mt-2 !text-xs text-slate-400 dark:text-slate-500 !flex !items-start !gap-1.5">
                    <Copy className="!w-3 !h-3 !mt-0.5 !shrink-0" />
                    <span>Titular del medio: {article.originalTitle}</span>
                  </p>
                )}

                {article.imageUrl && (
                  <figure className="!mt-4">
                    <img src={article.imageUrl} alt="" className="!w-full !rounded-lg" />
                    {article.imageSource === 'generated' && (
                      <figcaption className="!text-xs text-slate-400 !mt-1">Imagen generada con IA</figcaption>
                    )}
                  </figure>
                )}

                {article.summary && (
                  <p className="!mt-4 !text-sm text-slate-600 dark:text-slate-300 !leading-relaxed">
                    {article.summary}
                  </p>
                )}

                {Array.isArray(article.keyPoints) && article.keyPoints.length > 0 && (
                  <ul className="!mt-4 !pl-5 !list-disc !text-sm text-slate-600 dark:text-slate-300 !space-y-1">
                    {article.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                )}

                {article.whyItMatters && (
                  <p className="!mt-4 !p-3 !rounded-lg bg-slate-50 dark:bg-slate-900 !border-l-2 !border-emerald-500 !text-sm text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-800 dark:text-slate-100">Por qué importa: </strong>
                    {article.whyItMatters}
                  </p>
                )}

                <div className="!flex !gap-1.5 !flex-wrap !mt-4">
                  {article.categories.map((c) => (
                    <span key={c} className="!px-2 !py-0.5 !rounded !text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {c}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Evidencia de verificación */}
          {spans && (
            <div className="bg-white dark:bg-slate-800 !rounded-xl !p-5 !border border-slate-200 dark:border-slate-700">
              <div className="!flex !items-center !justify-between !mb-1">
                <h2 className="!text-base !font-semibold text-slate-800 dark:text-slate-100">
                  Evidencia de extracción
                </h2>
                {v && (
                  <span className="!text-xs text-slate-500 dark:text-slate-400">
                    {v.respaldados} de {v.comprobados} con respaldo textual
                  </span>
                )}
              </div>
              <p className="!text-xs text-slate-500 dark:text-slate-400 !mb-3">
                Cada dato lleva la cita literal del artículo original que lo respalda. Lo que no
                se pudo verificar aparece anulado.
              </p>

              <div>
                <AnchoredRow label="Organismo" field={spans.organismo} />
                <AnchoredRow label="Fecha publicación" field={spans.fecha_publicacion} />
                <AnchoredRow label="Fecha vigencia" field={spans.fecha_vigencia} />
                {spans.empresas?.map((e, i) => (
                  <AnchoredRow key={i} label={i === 0 ? 'Empresas' : ''} field={e} />
                ))}
              </div>

              {v && v.rechazados.length > 0 && (
                <div className="!mt-3 !p-3 !rounded-lg bg-amber-50 dark:bg-amber-950/40 !text-xs text-amber-800 dark:text-amber-300">
                  <strong>{v.rechazados.length} campo(s) anulados.</strong> Si ves este patrón
                  repetido en muchos artículos, el prompt tiene un problema que se puede corregir.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel lateral */}
        <div className="!space-y-4">
          {/* Confianza */}
          <div className="bg-white dark:bg-slate-800 !rounded-xl !p-5 !border border-slate-200 dark:border-slate-700">
            <div className="!flex !items-center !gap-2 !mb-3">
              {article.needsReview ? (
                <ShieldAlert className="!w-5 !h-5 text-amber-500" />
              ) : (
                <ShieldCheck className="!w-5 !h-5 text-emerald-500" />
              )}
              <span className="!text-2xl !font-bold text-slate-800 dark:text-slate-100">
                {article.confidenceScore !== null ? `${Math.round(article.confidenceScore * 100)}%` : '—'}
              </span>
              <span className="!text-xs text-slate-500 dark:text-slate-400">confianza</span>
            </div>

            {article.needsReview && (
              <p className="!text-xs text-amber-700 dark:text-amber-400 !mb-3">
                Por debajo del umbral: conviene leerlo con más atención antes de aprobar.
              </p>
            )}

            <dl className="!text-sm !space-y-2">
              {[
                ['Importancia', article.importance !== null ? `${article.importance}/5` : '—'],
                ['Regulatorio', article.isRegulatory ? 'Sí' : 'No'],
                ['Afecta transporte', article.affectsTransport ? 'Sí' : 'No'],
                ['Fuente', article.source?.name ?? '—'],
                ['Confianza de la fuente', article.source ? article.source.trustScore.toFixed(2) : '—'],
                ['Texto extraído', article.contentSource === 'feed_only' ? 'Solo resumen del feed' : 'Completo'],
              ].map(([k, val]) => (
                <div key={k as string} className="!flex !justify-between !gap-2">
                  <dt className="text-slate-500 dark:text-slate-400">{k}</dt>
                  <dd className="text-slate-800 dark:text-slate-100 !font-medium !text-right">{val}</dd>
                </div>
              ))}
            </dl>

            {article.replicatedBy > 0 && (
              <div className="!mt-3 !pt-3 !border-t border-slate-100 dark:border-slate-700 !flex !items-center !gap-2 !text-sm">
                <Layers className="!w-4 !h-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-300">
                  Replicada en <strong>{article.replicatedBy}</strong> fuente(s) más
                </span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="bg-white dark:bg-slate-800 !rounded-xl !p-5 !border border-slate-200 dark:border-slate-700 !space-y-2">
            {article.status === 'pending' && (
              <button
                onClick={() => act(() => adminNewsApi.approveArticle(article.id), 'Aprobado')}
                disabled={busy}
                className="!w-full !flex !items-center !justify-center !gap-2 !px-4 !py-2.5 !rounded-lg !bg-emerald-600 !text-white !text-sm !font-medium hover:!bg-emerald-700 disabled:!opacity-50"
              >
                <Check className="!w-4 !h-4" /> Aprobar
              </button>
            )}

            {article.status === 'approved' && (
              <button
                onClick={() => act(() => adminNewsApi.publishArticle(article.id), 'Publicado')}
                disabled={busy}
                className="!w-full !flex !items-center !justify-center !gap-2 !px-4 !py-2.5 !rounded-lg !bg-sky-600 !text-white !text-sm !font-medium hover:!bg-sky-700 disabled:!opacity-50"
              >
                <Send className="!w-4 !h-4" /> Publicar
              </button>
            )}

            {article.status !== 'rejected' && (
              <button
                onClick={() => setRejectOpen(true)}
                disabled={busy}
                className="!w-full !flex !items-center !justify-center !gap-2 !px-4 !py-2.5 !rounded-lg bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 !text-sm !border border-rose-200 dark:border-slate-600"
              >
                <X className="!w-4 !h-4" /> Rechazar
              </button>
            )}

            <button
              onClick={() => setEditing(true)}
              className="!w-full !flex !items-center !justify-center !gap-2 !px-4 !py-2.5 !rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 !text-sm"
            >
              <Pencil className="!w-4 !h-4" /> Editar
            </button>

            <button
              onClick={() =>
                act(() => adminNewsApi.regenerateImage(article.id), 'Regeneración encolada', false)
              }
              className="!w-full !flex !items-center !justify-center !gap-2 !px-4 !py-2.5 !rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 !text-sm"
            >
              <ImageIcon className="!w-4 !h-4" /> Regenerar resumen e imagen
            </button>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="!w-full !flex !items-center !justify-center !gap-2 !px-4 !py-2.5 !rounded-lg text-slate-500 dark:text-slate-400 !text-sm hover:!bg-slate-100 dark:hover:!bg-slate-700"
            >
              <ExternalLink className="!w-4 !h-4" /> Ver original
            </a>
          </div>

          {/* Trazabilidad */}
          <div className="bg-white dark:bg-slate-800 !rounded-xl !p-5 !border border-slate-200 dark:border-slate-700 !text-xs !space-y-1.5">
            <p className="!font-medium text-slate-600 dark:text-slate-300 !mb-2">Trazabilidad</p>
            {[
              ['Modelo', article.modelId],
              ['Versión del prompt', article.promptVersion],
              ['Descubierto', fmt(article.discoveredAt)],
              ['Publicado en origen', fmt(article.publishedAt)],
              ['Publicado en el sitio', fmt(article.publishedAtSite)],
            ].map(([k, val]) => (
              <div key={k as string} className="!flex !justify-between !gap-2">
                <span className="text-slate-400 dark:text-slate-500">{k}</span>
                <span className="text-slate-600 dark:text-slate-300 !text-right !font-mono !text-[11px]">
                  {val ?? '—'}
                </span>
              </div>
            ))}
            {article.rejectionReason && (
              <p className="!mt-2 !pt-2 !border-t border-slate-100 dark:border-slate-700 text-rose-600 dark:text-rose-400">
                Motivo del rechazo: {article.rejectionReason}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Diálogo de rechazo */}
      {rejectOpen && (
        <div className="!fixed !inset-0 !bg-black/50 !flex !items-center !justify-center !z-50 !p-4" onClick={() => setRejectOpen(false)}>
          <div className="bg-white dark:bg-slate-800 !rounded-xl !p-6 !max-w-lg !w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="!text-lg !font-semibold text-slate-800 dark:text-slate-100">Rechazar artículo</h3>
            <p className="!text-sm text-slate-500 dark:text-slate-400 !mt-1">
              El motivo es obligatorio: permite ajustar los filtros después con datos.
            </p>
            <textarea
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="!w-full !mt-3 !px-3 !py-2 !rounded-lg !border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 !text-sm"
              placeholder="Motivo del rechazo"
            />
            <div className="!flex !gap-2 !mt-4 !justify-end">
              <button onClick={() => setRejectOpen(false)} className="!px-4 !py-2 !rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 !text-sm">
                Cancelar
              </button>
              <button
                onClick={() => {
                  setRejectOpen(false);
                  act(() => adminNewsApi.rejectArticle(article.id, reason), 'Rechazado');
                }}
                disabled={!reason.trim()}
                className="!px-4 !py-2 !rounded-lg !bg-rose-600 !text-white !text-sm !font-medium disabled:!opacity-40"
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

export default NewsArticleDetailPage;
