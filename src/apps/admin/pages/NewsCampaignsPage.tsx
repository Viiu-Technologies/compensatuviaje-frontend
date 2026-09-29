import React, { useState, useEffect } from 'react';
import {
  Mail, Plus, Check, Send, X, Eye, Users, Loader2, BarChart3, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import adminNewsApi from '../services/adminNewsApi';
import type {
  NewsCampaign, SubscriberStats, AdminNewsArticle, CampaignMetrics,
} from '../../../types/news.types';

/**
 * Campañas del boletín.
 *
 * Dos reglas que el backend impone y esta pantalla refleja:
 *   · Solo se pueden incluir artículos YA PUBLICADOS.
 *   · Una campaña necesita aprobación humana antes de enviarse.
 *
 * El envío no ocurre en el navegador ni en el request: se encola y el worker
 * lo procesa respetando el tope diario del proveedor.
 */

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Borrador', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  pending_approval: { label: 'Por aprobar', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  approved: { label: 'Aprobada', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  sending: { label: 'Enviando', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
  sent: { label: 'Enviada', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
  cancelled: { label: 'Cancelada', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
};

const API_BASE =
  import.meta.env.VITE_APP_API_URL || import.meta.env.VITE_API_URL || '';

const NewsCampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<NewsCampaign[]>([]);
  const [subs, setSubs] = useState<SubscriberStats | null>(null);
  const [published, setPublished] = useState<AdminNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Record<string, CampaignMetrics>>({});

  const [form, setForm] = useState({ name: '', subject: '', preheader: '', articleIds: [] as string[] });

  const load = async () => {
    try {
      setLoading(true);
      const [c, s, p] = await Promise.all([
        adminNewsApi.getCampaigns({ limit: 30 }),
        adminNewsApi.getSubscriberStats(),
        adminNewsApi.getQueue({ status: 'published', limit: 40 }),
      ]);
      setCampaigns(c.data || []);
      setSubs(s.data);
      setPublished(p.data || []);
    } catch {
      toast.error('No se pudo cargar la información de campañas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleArticle = (id: string) => {
    setForm((f) => ({
      ...f,
      articleIds: f.articleIds.includes(id)
        ? f.articleIds.filter((x) => x !== id)
        : [...f.articleIds, id],
    }));
  };

  const create = async () => {
    if (!form.subject.trim()) return toast.error('El asunto es obligatorio');
    if (form.articleIds.length === 0) return toast.error('Selecciona al menos un artículo');

    try {
      setBusy('new');
      await adminNewsApi.createCampaign(form);
      toast.success('Campaña creada en borrador');
      setCreating(false);
      setForm({ name: '', subject: '', preheader: '', articleIds: [] });
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo crear la campaña');
    } finally {
      setBusy(null);
    }
  };

  const act = async (id: string, fn: () => Promise<unknown>, ok: string) => {
    try {
      setBusy(id);
      await fn();
      toast.success(ok);
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'La acción falló');
    } finally {
      setBusy(null);
    }
  };

  const loadMetrics = async (id: string) => {
    try {
      const r = await adminNewsApi.getCampaignMetrics(id);
      setMetrics((m) => ({ ...m, [id]: r.data }));
    } catch {
      toast.error('No se pudieron cargar las métricas');
    }
  };

  if (loading) {
    return (
      <div className="!flex !items-center !justify-center !py-20 text-slate-400">
        <Loader2 className="!w-6 !h-6 !animate-spin !mr-2" /> Cargando…
      </div>
    );
  }

  return (
    <div className="!space-y-6 bg-slate-50 dark:bg-slate-900 !p-6 md:!p-8 !rounded-3xl">
      <div className="!flex !items-start !justify-between !flex-wrap !gap-4">
        <div>
          <h1 className="!text-2xl !font-bold text-slate-800 dark:text-slate-100 !flex !items-center !gap-2">
            <Mail className="!w-7 !h-7 text-emerald-600 dark:text-emerald-400" />
            Boletín
          </h1>
          <p className="text-slate-500 dark:text-slate-400 !mt-1">
            Solo se envían artículos ya publicados, y siempre con aprobación previa.
          </p>
        </div>
        <button
          onClick={() => setCreating((c) => !c)}
          className="!flex !items-center !gap-2 !px-4 !py-2 !rounded-lg !bg-emerald-600 !text-white !text-sm !font-medium hover:!bg-emerald-700"
        >
          <Plus className="!w-4 !h-4" /> Nueva campaña
        </button>
      </div>

      {/* Suscriptores */}
      {subs && (
        <div className="!grid sm:!grid-cols-2 lg:!grid-cols-5 !gap-3">
          {[
            ['Elegibles', subs.elegibles, 'confirmados y activos'],
            ['Sin confirmar', subs.sinConfirmar, 'no reciben nada'],
            ['Bajas', subs.bajas, ''],
            ['Suprimidos', subs.suprimidos, 'rebote duro o queja'],
            ['Total', subs.total, ''],
          ].map(([label, value, hint]) => (
            <div key={label as string} className="bg-white dark:bg-slate-800 !rounded-xl !p-4 !border border-slate-200 dark:border-slate-700">
              <div className="!flex !items-center !gap-1.5 !text-xs text-slate-500 dark:text-slate-400">
                <Users className="!w-3.5 !h-3.5" /> {label}
              </div>
              <div className="!mt-1.5 !text-2xl !font-bold text-slate-800 dark:text-slate-100">{value}</div>
              {hint && <div className="!text-xs text-slate-400 dark:text-slate-500">{hint}</div>}
            </div>
          ))}
        </div>
      )}

      {subs && subs.elegibles === 0 && (
        <div className="!flex !items-start !gap-3 !p-4 !rounded-xl bg-amber-50 dark:bg-amber-950/40 !border border-amber-200 dark:border-amber-900">
          <AlertTriangle className="!w-5 !h-5 text-amber-600 !shrink-0 !mt-0.5" />
          <p className="!text-sm text-slate-700 dark:text-slate-200">
            No hay suscriptores confirmados todavía. Se pueden crear campañas, pero el envío no
            llegará a nadie hasta que alguien confirme su suscripción.
          </p>
        </div>
      )}

      {/* Nueva campaña */}
      {creating && (
        <div className="bg-white dark:bg-slate-800 !rounded-xl !p-5 !border border-slate-200 dark:border-slate-700 !space-y-4">
          <h2 className="!text-base !font-semibold text-slate-800 dark:text-slate-100">Nueva campaña</h2>

          <div className="!grid sm:!grid-cols-2 !gap-3">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre interno (opcional)"
              className="!px-3 !py-2 !rounded-lg !border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 !text-sm"
            />
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Asunto del correo *"
              className="!px-3 !py-2 !rounded-lg !border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 !text-sm"
            />
          </div>

          <input
            value={form.preheader}
            onChange={(e) => setForm({ ...form, preheader: e.target.value })}
            placeholder="Preheader — el texto que se ve junto al asunto en la bandeja"
            className="!w-full !px-3 !py-2 !rounded-lg !border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 !text-sm"
          />

          <div>
            <p className="!text-sm !font-medium text-slate-700 dark:text-slate-200 !mb-2">
              Artículos publicados ({form.articleIds.length} seleccionados)
            </p>
            {published.length === 0 ? (
              <p className="!text-sm text-slate-400">
                No hay artículos publicados todavía. Publica alguno antes de crear una campaña.
              </p>
            ) : (
              <div className="!max-h-64 !overflow-y-auto !space-y-1.5 !pr-1">
                {published.map((a, i) => (
                  <label
                    key={a.id}
                    className={`!flex !items-start !gap-2.5 !p-2.5 !rounded-lg !cursor-pointer !border ${
                      form.articleIds.includes(a.id)
                        ? '!border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-700 hover:!bg-slate-50 dark:hover:!bg-slate-700/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.articleIds.includes(a.id)}
                      onChange={() => toggleArticle(a.id)}
                      className="!mt-0.5"
                    />
                    <div className="!min-w-0">
                      <p className="!text-sm text-slate-800 dark:text-slate-100 !leading-snug">
                        {form.articleIds.indexOf(a.id) === 0 && (
                          <span className="!text-xs text-emerald-600 dark:text-emerald-400 !font-medium">[destacado] </span>
                        )}
                        {a.title}
                      </p>
                      <p className="!text-xs text-slate-400">{a.source?.name}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <p className="!text-xs text-slate-400 !mt-2">
              El primero que selecciones será el destacado del correo, con imagen grande.
            </p>
          </div>

          <div className="!flex !gap-2">
            <button
              onClick={create}
              disabled={busy === 'new'}
              className="!px-4 !py-2 !rounded-lg !bg-emerald-600 !text-white !text-sm !font-medium disabled:!opacity-50"
            >
              Crear borrador
            </button>
            <button
              onClick={() => setCreating(false)}
              className="!px-4 !py-2 !rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 !text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Listado */}
      {campaigns.length === 0 ? (
        <div className="!text-center !py-16">
          <Mail className="!w-12 !h-12 !mx-auto text-slate-300 dark:text-slate-600" />
          <p className="!mt-3 text-slate-500 dark:text-slate-400">Aún no hay campañas.</p>
        </div>
      ) : (
        <div className="!space-y-3">
          {campaigns.map((c) => {
            const st = STATUS_LABEL[c.status] ?? STATUS_LABEL.draft;
            const m = metrics[c.id];

            return (
              <div key={c.id} className="bg-white dark:bg-slate-800 !rounded-xl !p-5 !border border-slate-200 dark:border-slate-700">
                <div className="!flex !items-start !justify-between !gap-3 !flex-wrap">
                  <div className="!min-w-0">
                    <div className="!flex !items-center !gap-2 !flex-wrap">
                      <span className={`!px-2 !py-0.5 !rounded-full !text-xs !font-medium ${st.cls}`}>
                        {st.label}
                      </span>
                      <span className="!text-xs text-slate-400">
                        {c.articleIds.length} artículo(s) · {c.recipientCount ?? 0} destinatarios
                      </span>
                    </div>
                    <h3 className="!text-base !font-semibold text-slate-800 dark:text-slate-100 !mt-1.5">
                      {c.subject}
                    </h3>
                    <p className="!text-xs text-slate-400">{c.name}</p>
                  </div>

                  <div className="!flex !items-center !gap-1.5 !flex-wrap">
                    <a
                      href={`${API_BASE}/admin/news/campaigns/${c.id}/preview`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="!flex !items-center !gap-1.5 !px-3 !py-1.5 !rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 !text-sm"
                      title="Vista previa del correo"
                    >
                      <Eye className="!w-4 !h-4" /> Vista previa
                    </a>

                    {['draft', 'pending_approval'].includes(c.status) && (
                      <button
                        onClick={() => act(c.id, () => adminNewsApi.approveCampaign(c.id), 'Campaña aprobada')}
                        disabled={busy === c.id}
                        className="!flex !items-center !gap-1.5 !px-3 !py-1.5 !rounded-lg !bg-emerald-600 !text-white !text-sm disabled:!opacity-50"
                      >
                        <Check className="!w-4 !h-4" /> Aprobar
                      </button>
                    )}

                    {['approved', 'sending'].includes(c.status) && (
                      <button
                        onClick={() => act(c.id, () => adminNewsApi.sendCampaign(c.id), 'Envío encolado')}
                        disabled={busy === c.id}
                        className="!flex !items-center !gap-1.5 !px-3 !py-1.5 !rounded-lg !bg-sky-600 !text-white !text-sm disabled:!opacity-50"
                      >
                        <Send className="!w-4 !h-4" />
                        {c.status === 'sending' ? 'Continuar envío' : 'Enviar'}
                      </button>
                    )}

                    {c.status === 'sent' && (
                      <button
                        onClick={() => loadMetrics(c.id)}
                        className="!flex !items-center !gap-1.5 !px-3 !py-1.5 !rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 !text-sm"
                      >
                        <BarChart3 className="!w-4 !h-4" /> Métricas
                      </button>
                    )}

                    {!['sent', 'cancelled'].includes(c.status) && (
                      <button
                        onClick={() => act(c.id, () => adminNewsApi.cancelCampaign(c.id), 'Campaña cancelada')}
                        disabled={busy === c.id}
                        className="!p-1.5 !rounded-lg text-slate-400 hover:!bg-slate-100 dark:hover:!bg-slate-700"
                        title="Cancelar"
                      >
                        <X className="!w-4 !h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {m && (
                  <div className="!grid sm:!grid-cols-5 !gap-3 !mt-4 !pt-4 !border-t border-slate-100 dark:border-slate-700 !text-sm">
                    {[
                      ['Enviados', m.sent ?? 0],
                      ['Entregados', m.delivered ?? 0],
                      ['Aperturas', m.tasaApertura !== null ? `${m.tasaApertura}%` : '—'],
                      ['Clics', m.tasaClic !== null ? `${m.tasaClic}%` : '—'],
                      ['Rebotes', m.tasaRebote !== null ? `${m.tasaRebote}%` : '—'],
                    ].map(([k, v]) => (
                      <div key={k as string}>
                        <p className="!text-xs text-slate-500 dark:text-slate-400">{k}</p>
                        <p className="!font-semibold text-slate-800 dark:text-slate-100">{v}</p>
                      </div>
                    ))}
                  </div>
                )}

                {c.status === 'sending' && (
                  <p className="!mt-3 !text-xs text-sky-700 dark:text-sky-400">
                    Envío en curso. Si el tope diario lo cortó, se reanuda solo al día siguiente.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NewsCampaignsPage;
