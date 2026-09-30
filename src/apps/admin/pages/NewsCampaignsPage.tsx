import React, { useState, useEffect } from 'react';
import { Mail, Plus, Check, Send, X, Eye, BarChart3, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import adminNewsApi from '../services/adminNewsApi';
import type {
  NewsCampaign, SubscriberStats, AdminNewsArticle, CampaignMetrics,
} from '../../../types/news.types';
import {
  EmptyState, KpiCard, Modal, PageHeader, Panel, Skeleton, StatusBadge, type StatusTone,
  formatInt, formatPercent, useAdminConfirm,
} from '../ui';

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

const STATUS_LABEL: Record<string, { label: string; tone: StatusTone }> = {
  draft: { label: 'Borrador', tone: 'neutral' },
  pending_approval: { label: 'Por aprobar', tone: 'warning' },
  approved: { label: 'Aprobada', tone: 'success' },
  sending: { label: 'Enviando', tone: 'info' },
  sent: { label: 'Enviada', tone: 'success' },
  cancelled: { label: 'Cancelada', tone: 'neutral' },
};

const pct = (n: number | null) => (n !== null ? formatPercent(n) : '—');

const NewsCampaignsPage: React.FC = () => {
  const { confirm, dialog } = useAdminConfirm();
  const [campaigns, setCampaigns] = useState<NewsCampaign[]>([]);
  const [subs, setSubs] = useState<SubscriberStats | null>(null);
  const [published, setPublished] = useState<AdminNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);

  const openPreview = async (c: NewsCampaign) => {
    try {
      setBusy(c.id);
      const html = await adminNewsApi.previewCampaign(c.id);
      setPreview({ subject: c.subject, html });
    } catch {
      toast.error('No se pudo cargar la vista previa');
    } finally {
      setBusy(null);
    }
  };
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

  // Enviar llega a personas reales y cancelar no se deshace: ambas piden confirmación.
  const confirmSend = async (c: NewsCampaign) => {
    const ok = await confirm({
      title: c.status === 'sending' ? '¿Continuar el envío?' : '¿Enviar la campaña?',
      description: `«${c.subject}» se enviará a ${formatInt(subs?.elegibles)} suscriptores confirmados. Una vez enviado, el correo no se puede retirar.`,
      confirmLabel: c.status === 'sending' ? 'Continuar envío' : 'Enviar ahora',
    });
    if (ok) act(c.id, () => adminNewsApi.sendCampaign(c.id), 'Envío encolado');
  };

  const confirmCancel = async (c: NewsCampaign) => {
    const ok = await confirm({
      title: '¿Cancelar la campaña?',
      description: `«${c.subject}» quedará cancelada y no se podrá enviar. Para reutilizar los artículos habrá que crear otra.`,
      confirmLabel: 'Cancelar campaña',
      cancelLabel: 'Volver',
      tone: 'danger',
    });
    if (ok) act(c.id, () => adminNewsApi.cancelCampaign(c.id), 'Campaña cancelada');
  };

  const header = (
    <PageHeader
      title="Boletín"
      description="Solo se envían artículos ya publicados, y siempre con aprobación previa."
      actions={
        <button type="button" className="adm-btn adm-btn--primary" onClick={() => setCreating((c) => !c)} aria-expanded={creating}>
          <Plus aria-hidden="true" /> Nueva campaña
        </button>
      }
    />
  );

  if (loading) {
    return (
      <div className="adm-page" aria-busy="true">
        {header}
        <div className="adm-kpis">{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={104} />)}</div>
        <Skeleton height={220} />
      </div>
    );
  }

  return (
    <div className="adm-page">
      {header}

      {/* Suscriptores */}
      {subs && (
        <div className="adm-kpis">
          <KpiCard label="Suscriptores elegibles" value={formatInt(subs.elegibles)} context="Confirmados y activos: reciben el boletín" />
          <KpiCard label="Sin confirmar" value={formatInt(subs.sinConfirmar)} context="No reciben nada hasta confirmar" />
          <KpiCard label="Bajas" value={formatInt(subs.bajas)} context={`De ${formatInt(subs.total)} registros en total`} />
          <KpiCard label="Suprimidos" value={formatInt(subs.suprimidos)} context="Rebote duro o queja de spam" />
        </div>
      )}

      {subs && subs.elegibles === 0 && (
        <div role="status" className="adm-alert adm-alert--warning">
          <AlertTriangle aria-hidden="true" />
          <div>
            No hay suscriptores confirmados todavía. Se pueden crear campañas, pero el envío no llegará a nadie
            hasta que alguien confirme su suscripción.
          </div>
        </div>
      )}

      {/* Nueva campaña */}
      {creating && (
        <Panel title="Nueva campaña">
          <div className="adm-stack-v">
            <div className="adm-form-grid">
              <div className="adm-field">
                <label className="adm-field__label" htmlFor="nc-subject">Asunto del correo</label>
                <input id="nc-subject" className="adm-input" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div className="adm-field">
                <label className="adm-field__label" htmlFor="nc-name">Nombre interno <span className="adm-cell-mute">(opcional)</span></label>
                <input id="nc-name" className="adm-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <div className="adm-field">
              <label className="adm-field__label" htmlFor="nc-pre">Preheader</label>
              <input id="nc-pre" className="adm-input" aria-describedby="nc-pre-hint" value={form.preheader} onChange={(e) => setForm({ ...form, preheader: e.target.value })} />
              <span id="nc-pre-hint" className="adm-field__hint">El texto que se ve junto al asunto en la bandeja de entrada.</span>
            </div>

            <fieldset className="adm-field">
              <legend className="adm-field__label">
                Artículos publicados · {formatInt(form.articleIds.length)} {form.articleIds.length === 1 ? 'seleccionado' : 'seleccionados'}
              </legend>
              {published.length === 0 ? (
                <p className="adm-cell-mute">No hay artículos publicados todavía. Publica alguno antes de crear una campaña.</p>
              ) : (
                <div className="adm-pick-list">
                  {published.map((a) => {
                    const on = form.articleIds.includes(a.id);
                    return (
                      <label key={a.id} className={`adm-pick${on ? ' adm-pick--on' : ''}`}>
                        <input type="checkbox" checked={on} onChange={() => toggleArticle(a.id)} />
                        <span>
                          <span className="adm-pick__title">{a.title}</span>
                          <span className="adm-pick__meta" style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
                            {form.articleIds.indexOf(a.id) === 0 && <StatusBadge tone="info">Destacado</StatusBadge>}
                            {a.source?.name}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
              <span className="adm-field__hint">El primero que selecciones será el destacado del correo, con imagen grande.</span>
            </fieldset>

            <div className="adm-actions-row">
              <button type="button" className="adm-btn adm-btn--primary" onClick={create} disabled={busy === 'new'}>
                Crear borrador
              </button>
              <button type="button" className="adm-btn" onClick={() => setCreating(false)}>Cancelar</button>
            </div>
          </div>
        </Panel>
      )}

      {/* Listado */}
      {campaigns.length === 0 ? (
        <section className="adm-panel">
          <EmptyState icon={Mail} title="Aún no hay campañas" text="Crea la primera con «Nueva campaña»." />
        </section>
      ) : (
        <div className="adm-stack-v">
          {campaigns.map((c) => {
            const st = STATUS_LABEL[c.status] ?? STATUS_LABEL.draft;
            const m = metrics[c.id];
            const n = c.articleIds.length;

            return (
              <section key={c.id} className="adm-panel">
                <div className="adm-panel__body">
                  <div className="adm-campaign">
                    <div style={{ minWidth: 0 }}>
                      <div className="adm-chips">
                        <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                        <span className="adm-campaign__meta">
                          {formatInt(n)} {n === 1 ? 'artículo' : 'artículos'}
                          {['sending', 'sent'].includes(c.status) && ` · ${formatInt(c.recipientCount)} destinatarios`}
                        </span>
                      </div>
                      <h2 className="adm-campaign__title">{c.subject}</h2>
                      {c.name && <p className="adm-campaign__meta">{c.name}</p>}
                    </div>

                    <div className="adm-actions-row">
                      <button type="button" className="adm-btn adm-btn--sm" onClick={() => openPreview(c)} disabled={busy === c.id}>
                        <Eye aria-hidden="true" /> Vista previa
                      </button>
                      {['draft', 'pending_approval'].includes(c.status) && (
                        <button
                          type="button"
                          className="adm-btn adm-btn--sm adm-btn--primary"
                          onClick={() => act(c.id, () => adminNewsApi.approveCampaign(c.id), 'Campaña aprobada')}
                          disabled={busy === c.id}
                        >
                          <Check aria-hidden="true" /> Aprobar
                        </button>
                      )}
                      {['approved', 'sending'].includes(c.status) && (
                        <button type="button" className="adm-btn adm-btn--sm adm-btn--primary" onClick={() => confirmSend(c)} disabled={busy === c.id}>
                          <Send aria-hidden="true" /> {c.status === 'sending' ? 'Continuar envío' : 'Enviar'}
                        </button>
                      )}
                      {c.status === 'sent' && !m && (
                        <button type="button" className="adm-btn adm-btn--sm" onClick={() => loadMetrics(c.id)}>
                          <BarChart3 aria-hidden="true" /> Métricas
                        </button>
                      )}
                      {!['sent', 'cancelled'].includes(c.status) && (
                        <button
                          type="button"
                          className="adm-icon-btn"
                          onClick={() => confirmCancel(c)}
                          disabled={busy === c.id}
                          title="Cancelar campaña"
                          aria-label={`Cancelar la campaña ${c.subject}`}
                        >
                          <X aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>

                  {m && (
                    <dl className="adm-summary">
                      <div><dt>Enviados</dt><dd>{formatInt(m.sent)}</dd></div>
                      <div><dt>Entregados</dt><dd>{formatInt(m.delivered)}</dd></div>
                      <div><dt>Aperturas</dt><dd>{pct(m.tasaApertura)}</dd></div>
                      <div><dt>Clics</dt><dd>{pct(m.tasaClic)}</dd></div>
                      <div><dt>Rebotes</dt><dd>{pct(m.tasaRebote)}</dd></div>
                    </dl>
                  )}

                  {c.status === 'sending' && (
                    <p className="adm-field__hint" style={{ marginTop: 12 }}>
                      Envío en curso. Si el tope diario lo cortó, se reanuda solo al día siguiente.
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Modal open={!!preview} title={preview?.subject ?? 'Vista previa'} onClose={() => setPreview(null)} size="lg">
        {/* sandbox vacío: el HTML se muestra sin ejecutar scripts ni acceder
            a la sesión del panel, igual que en un cliente de correo. */}
        {preview && <iframe title="Vista previa del correo" sandbox="" srcDoc={preview.html} className="adm-preview-frame" />}
      </Modal>
      {dialog}
    </div>
  );
};

export default NewsCampaignsPage;
