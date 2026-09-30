/**
 * Detalle de un proyecto ESG para el admin (solo lectura), desde Proyectos ESG.
 *
 * Muestra fotos, documentos, evaluaciones de IA, precios, stock y
 * certificados, con las acciones de inventario (pausar / reactivar).
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pause, Play, ExternalLink, FileQuestion, ChevronDown, ChevronUp, Inbox, ClipboardCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { getProjectDetail, ProjectDetailData } from '../services/adminApi';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import api from '../../../shared/services/api';
import AdminPendingBadge from '../components/shared/AdminPendingBadge';
import {
  EmptyState, KpiCard, PageHeader, Panel, Segmented, Skeleton, StatusBadge, type StatusTone,
  formatCLP, formatInt, monthLabel, partnerStatus, projectTypeLabel, unitLabel, unitPlural, useAdminConfirm, DocumentList, PhotoGallery,
} from '../ui';

const STATUS: Record<string, { label: string; tone: StatusTone }> = {
  draft: { label: 'Borrador', tone: 'neutral' },
  pending_review: { label: 'En revisión', tone: 'warning' },
  approved: { label: 'Por activar', tone: 'info' },
  rejected: { label: 'Rechazado', tone: 'danger' },
  active: { label: 'Activo', tone: 'success' },
  paused: { label: 'Pausado', tone: 'warning' },
  completed: { label: 'Completado', tone: 'info' },
};

const VERTICAL: Record<string, string> = {
  reforestation: 'Bosque', conservation: 'Bosque', biodiversity: 'Bosque',
  clean_water: 'Agua', water_security: 'Agua',
  circular_economy: 'Textil', waste_management: 'Textil',
  energy_efficiency: 'Social', social_housing: 'Social', community_development: 'Social', renewable_energy: 'Social',
};

type Tab = 'evidence' | 'evaluations' | 'pricing' | 'certificates';

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const pct = (n?: number | string | null) => (n == null || n === '' ? '—' : `${Number(n).toLocaleString('es-CL', { maximumFractionDigits: 1 })} %`);

export default function AdminProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { confirm, dialog } = useAdminConfirm();
  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('evidence');
  const [showReportId, setShowReportId] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadProject();
  }, [id]);

  async function loadProject() {
    try {
      setLoading(true);
      setError(null);
      setProject(await getProjectDetail(id!));
    } catch (err: any) {
      setError(getErrorMessage(err, 'No se pudo cargar el proyecto'));
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeStatus(newStatus: 'paused' | 'active') {
    if (!project) return;
    const pausing = newStatus === 'paused';
    const ok = await confirm({
      title: pausing ? `¿Pausar ${project.name}?` : `¿Reactivar ${project.name}?`,
      description: pausing
        ? 'No se podrá comprar mientras esté pausado. Las compensaciones ya emitidas no se ven afectadas.'
        : 'El proyecto volverá a estar disponible para compensar.',
      confirmLabel: pausing ? 'Pausar proyecto' : 'Reactivar proyecto',
      tone: pausing ? 'danger' : undefined,
    });
    if (!ok) return;

    try {
      setStatusLoading(true);
      await (api as any).put(`/admin/projects/${project.id}/status`, { status: newStatus });
      toast.success(pausing ? 'Proyecto pausado' : 'Proyecto reactivado');
      await loadProject();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'No se pudo cambiar el estado'));
    } finally {
      setStatusLoading(false);
    }
  }

  const back = (
    <Link to="/admin/proyectos" className="adm-back">
      <ArrowLeft aria-hidden="true" /> Volver a Proyectos ESG
    </Link>
  );

  if (loading && !project) {
    return (
      <div className="adm-page" aria-busy="true">
        {back}
        <Skeleton height={64} />
        <div className="adm-kpis">{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={104} />)}</div>
        <div className="adm-grid adm-grid--2-1">
          <Skeleton height={380} />
          <Skeleton height={380} />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="adm-page">
        {back}
        <section className="adm-panel">
          <EmptyState icon={FileQuestion} title="No se pudo abrir el proyecto" text={error || 'El proyecto no existe o fue eliminado.'} />
        </section>
      </div>
    );
  }

  const st = STATUS[project.status] ?? { label: project.status, tone: 'neutral' as StatusTone };
  const unit = unitLabel(project.impact_unit ?? undefined);
  const approved = project.monthly_stock_approved || 0;
  const remaining = project.monthly_stock_remaining ?? 0;
  const stockPct = approved ? Math.min(100, Math.max(0, Math.round((remaining / approved) * 100))) : 0;
  const finalPrice = project.currentPricing?.finalPriceClpPerTon || project.currentBasePriceClpPerTon;
  const qty = (n?: number | null) => (n != null ? `${formatInt(n)} ${unitPlural(project.impact_unit ?? undefined, n)}` : '—');

  const photoProps = project.photos.map((p) => ({ url: p.storageUrl, thumbnailUrl: p.thumbnailUrl || null, fileName: p.fileName }));
  const docProps = project.techDocs.map((d) => ({
    fileName: d.fileName,
    fileType: d.fileType,
    storageUrl: d.storageUrl,
    signedUrl: null as string | null,
    mimeType: d.mimeType,
  }));

  const pst = project.partner?.status ? partnerStatus(project.partner.status) : null;
  const location = [project.region, project.country].filter(Boolean).join(', ');

  return (
    <div className="adm-page">
      {back}

      <PageHeader
        title={project.name}
        description={[`Código ${project.code}`, project.partner?.name, location].filter(Boolean).join(' · ')}
        actions={
          <>
            {project.transparencyUrl && (
              <a href={project.transparencyUrl} target="_blank" rel="noopener noreferrer" className="adm-btn">
                <ExternalLink aria-hidden="true" /> Transparencia
              </a>
            )}
            {project.status === 'active' && (
              <button type="button" className="adm-btn" onClick={() => handleChangeStatus('paused')} disabled={statusLoading}>
                <Pause aria-hidden="true" /> Pausar
              </button>
            )}
            {project.status === 'paused' && (
              <button type="button" className="adm-btn adm-btn--primary" onClick={() => handleChangeStatus('active')} disabled={statusLoading}>
                <Play aria-hidden="true" /> Reactivar
              </button>
            )}
          </>
        }
      />

      <div className="adm-chips">
        <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
        {project.is_sold_out && <StatusBadge tone="danger">Agotado</StatusBadge>}
      </div>

      <div className="adm-kpis">
        <KpiCard
          label="Precio final"
          value={finalPrice ? formatCLP(finalPrice) : '—'}
          context={project.currentPricing?.marginPercent != null ? `Margen ${pct(project.currentPricing.marginPercent)}` : 'Sin precio vigente'}
        />
        <KpiCard
          label="Stock del mes"
          value={approved ? `${formatInt(remaining)} de ${formatInt(approved)}` : '—'}
          context={approved ? `${stockPct} % disponible` : 'Sin stock mensual aprobado'}
        />
        <KpiCard
          label="Certificados emitidos"
          value={formatInt(project.stats.totalCertificates)}
          context={`${formatInt(project.stats.totalTonsAllocated)} t CO₂e asignadas`}
        />
        <KpiCard
          label="Ingresos"
          value={formatCLP(project.stats.totalRevenueClp)}
          context={`${formatInt(project.stats.evidenceCount)} entregas de evidencia`}
        />
      </div>

      <div className="adm-grid adm-grid--2-1" style={{ alignItems: 'start' }}>
        <div className="adm-stack-v">
          <Panel title="Fotos">
            {photoProps.length > 0 ? <PhotoGallery photos={photoProps} /> : <p className="adm-cell-mute">El proyecto no tiene fotos.</p>}
          </Panel>

          <Segmented
            label="Sección"
            options={[
              { value: 'evidence', label: `Evidencia · ${formatInt(project.techDocs.length + project.evidences.length)}` },
              { value: 'evaluations', label: `Evaluaciones IA · ${formatInt(project.evaluations.length)}` },
              { value: 'pricing', label: `Precios · ${formatInt(project.pricingHistory.length)}` },
              { value: 'certificates', label: `Certificados · ${formatInt(project.recentCertificates.length)}` },
            ]}
            value={activeTab}
            onChange={(v) => setActiveTab(v as Tab)}
          />

          {activeTab === 'evidence' && (
            <Panel
              title="Documentos y entregas"
              aside={
                <Link to={`/admin/proyectos/${project.id}/evidence`} className="adm-btn adm-btn--sm">
                  <ClipboardCheck aria-hidden="true" /> Revisar evidencia mensual
                </Link>
              }
            >
              {project.techDocs.length === 0 && project.evidences.length === 0 ? (
                <EmptyState icon={Inbox} title="Sin evidencia registrada" />
              ) : (
                <div className="adm-stack-v">
                  {project.techDocs.length > 0 && <DocumentList documents={docProps} />}
                  {project.evidences.length > 0 && (
                    <>
                      <h3 className="adm-subhead">Entregas mensuales</h3>
                      <ul className="adm-list">
                        {project.evidences.map((ev) => (
                          <li key={ev.id} className="adm-list__item">
                            <span className="adm-list__text">
                              <span className="adm-list__title">{ev.periodMonth ? monthLabel(ev.periodMonth) : 'Sin periodo'}</span>
                              {ev.metricName && <span className="adm-list__meta">{ev.metricName}: {ev.metricValue}</span>}
                            </span>
                            <span className="adm-list__end">
                              {formatInt(ev.filesCount)} {ev.filesCount === 1 ? 'archivo' : 'archivos'} · {fmtDate(ev.createdAt)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </Panel>
          )}

          {activeTab === 'evaluations' && (
            <Panel title="Evaluaciones de la IA">
              {project.evaluations.length === 0 ? (
                <EmptyState icon={Inbox} title="Sin evaluaciones de IA" />
              ) : (
                <div className="adm-stack-v">
                  {project.evaluations.map((ev) => (
                    <div key={ev.id} className="adm-decision">
                      <div className="adm-chips">
                        <AdminPendingBadge aiStatus={ev.ai_status} adminDecision={ev.admin_decision as any} />
                        {ev.level && <StatusBadge tone="info">Nivel {ev.level}</StatusBadge>}
                        {ev.final_score != null && <StatusBadge tone="neutral">Puntaje {formatInt(ev.final_score)} de 100</StatusBadge>}
                        <span className="adm-campaign__meta">{fmtDate(ev.createdAt)}</span>
                      </div>
                      {ev.admin_reason && <p className="adm-field__hint"><b>Motivo:</b> {ev.admin_reason}</p>}
                      {ev.report_markdown && (
                        <>
                          <button
                            type="button"
                            className="adm-link"
                            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', width: 'fit-content' }}
                            onClick={() => setShowReportId(showReportId === ev.id ? null : ev.id)}
                            aria-expanded={showReportId === ev.id}
                          >
                            {showReportId === ev.id ? 'Ocultar informe' : 'Ver informe completo'}
                            {showReportId === ev.id ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
                          </button>
                          {/* Antes el informe se mostraba como markdown crudo. */}
                          {showReportId === ev.id && (
                            <div className="adm-report adm-markdown">
                              <ReactMarkdown>{ev.report_markdown}</ReactMarkdown>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}

          {activeTab === 'pricing' && (
            <section className="adm-table-card">
              <div className="adm-table-scroll">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th scope="col">Versión</th>
                      <th scope="col" className="adm-col-num">Base</th>
                      <th scope="col" className="adm-col-num">Margen</th>
                      <th scope="col" className="adm-col-num">Final</th>
                      <th scope="col">Vigente desde</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.pricingHistory.length === 0 ? (
                      <tr><td colSpan={5}><EmptyState icon={Inbox} title="Sin historial de precios" /></td></tr>
                    ) : (
                      project.pricingHistory.map((pv, i) => (
                        <tr key={pv.id}>
                          <td>
                            <span className="adm-cell-title">
                              {pv.version || `Versión ${project.pricingHistory.length - i}`}
                              {pv.status === 'active' && <> <StatusBadge tone="success">Vigente</StatusBadge></>}
                            </span>
                            {(pv.reason || pv.createdBy) && (
                              <span className="adm-cell-sub">
                                {[pv.reason, pv.createdBy ? `por ${pv.createdBy.name || pv.createdBy.email}` : null].filter(Boolean).join(' · ')}
                              </span>
                            )}
                          </td>
                          <td className="adm-col-num">{formatCLP(pv.basePriceClpPerTon)}</td>
                          <td className="adm-col-num">{pct(pv.marginPercent)}</td>
                          <td className="adm-col-num"><b>{formatCLP(pv.finalPriceClpPerTon)}</b></td>
                          <td>{fmtDate(pv.effectiveFrom)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'certificates' && (
            <section className="adm-table-card">
              <div className="adm-table-scroll">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th scope="col">Certificado</th>
                      <th scope="col">Comprador</th>
                      <th scope="col" className="adm-col-num">Toneladas</th>
                      <th scope="col" className="adm-col-num">Monto</th>
                      <th scope="col">Emitido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.recentCertificates.length === 0 ? (
                      <tr><td colSpan={5}><EmptyState icon={Inbox} title="Sin certificados emitidos" /></td></tr>
                    ) : (
                      project.recentCertificates.map((cert) => {
                        const p: any = cert.purchaser;
                        const buyer = p ? (p.type === 'b2b' ? p.nombreComercial || p.razonSocial : p.nombre || p.email) : null;
                        return (
                          <tr key={cert.id}>
                            <td className="adm-mono">{cert.number}</td>
                            <td>
                              {buyer || <span className="adm-cell-mute">—</span>}
                              {p && <span className="adm-cell-sub">{p.type === 'b2b' ? 'Empresa' : 'Persona'}</span>}
                            </td>
                            <td className="adm-col-num">{Number(cert.tonsCompensated ?? 0).toLocaleString('es-CL', { maximumFractionDigits: 2 })}</td>
                            <td className="adm-col-num">{formatCLP(cert.amountClp)}</td>
                            <td>{fmtDate(cert.issuedAt)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        <div className="adm-stack-v">
          <Panel title="Datos del proyecto">
            <dl className="adm-dl">
              <dt>Tipo</dt>
              <dd>{projectTypeLabel(project.projectType)}</dd>
              <dt>Vertical</dt>
              <dd>{VERTICAL[project.projectType] ?? '—'}</dd>
              <dt>Ubicación</dt>
              <dd>{location || '—'}</dd>
              <dt>Proveedor</dt>
              <dd>{project.providerOrganization || '—'}</dd>
              <dt>Certificación</dt>
              <dd>{project.certification || '—'}</dd>
              <dt>Creado</dt>
              <dd>{fmtDate(project.createdAt)}</dd>
              <dt>Actualizado</dt>
              <dd>{fmtDate(project.updatedAt)}</dd>
            </dl>
            {project.description && <p className="adm-prewrap" style={{ marginTop: 14 }}>{project.description}</p>}
          </Panel>

          <Panel title="Precio" description="Costo del proveedor más el margen de la plataforma.">
            <dl className="adm-dl">
              <dt>Unidad de impacto</dt>
              <dd>{unit}</dd>
              <dt>Costo del proveedor por {unit}</dt>
              <dd>{project.provider_cost_unit_clp ? formatCLP(project.provider_cost_unit_clp) : '—'}</dd>
              <dt>CO₂ por {unit}</dt>
              <dd>{project.carbon_capture_per_unit ? `${Number(project.carbon_capture_per_unit).toLocaleString('es-CL')} kg` : '—'}</dd>
              <dt>Margen</dt>
              <dd>{pct(project.currentPricing?.marginPercent)}</dd>
              <dt>Precio final por tonelada</dt>
              <dd>{finalPrice ? formatCLP(finalPrice) : '—'}</dd>
            </dl>
          </Panel>

          <Panel title="Stock y capacidad">
            <dl className="adm-dl">
              <dt>Capacidad total</dt>
              <dd>{project.capacity_total ? qty(project.capacity_total) : '—'}</dd>
              <dt>Vendido</dt>
              <dd>{project.capacity_sold ? qty(project.capacity_sold) : '—'}</dd>
              <dt>Stock mensual aprobado</dt>
              <dd>{approved ? qty(approved) : '—'}</dd>
              <dt>Stock mensual disponible</dt>
              <dd>{project.monthly_stock_remaining != null ? qty(project.monthly_stock_remaining) : '—'}</dd>
            </dl>
            {approved > 0 && (
              <span className="adm-stock" style={{ width: '100%', height: 6, marginTop: 12 }} aria-label={`${stockPct} % disponible`}>
                <span style={{ width: `${stockPct}%` }} className={stockPct <= 20 ? 'adm-stock--low' : undefined} />
              </span>
            )}
          </Panel>

          {project.partner && (
            <Panel title="Impact Partner" aside={pst ? <StatusBadge tone={pst.tone}>{pst.label}</StatusBadge> : undefined}>
              <dl className="adm-dl">
                <dt>Nombre</dt>
                <dd>{project.partner.name}</dd>
                {project.partner.contact_email && (
                  <>
                    <dt>Correo</dt>
                    <dd style={{ wordBreak: 'break-all' }}>{project.partner.contact_email}</dd>
                  </>
                )}
                {project.partner.website_url && (
                  <>
                    <dt>Sitio web</dt>
                    <dd>
                      <a href={project.partner.website_url} target="_blank" rel="noopener noreferrer" className="adm-link">
                        {project.partner.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    </dd>
                  </>
                )}
              </dl>
              {(project.partner as any).id && (
                <p style={{ marginTop: 12 }}>
                  <Link to={`/admin/partners/${(project.partner as any).id}`} className="adm-link">Ver ficha del partner</Link>
                </p>
              )}
            </Panel>
          )}
        </div>
      </div>
      {dialog}
    </div>
  );
}
