/**
 * Detalle de una empresa B2B para el SuperAdmin: datos, métricas, usuarios,
 * documentos e historial de estados, con el cambio de estado.
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Users, Clock, AlertTriangle, CheckCircle2, Building2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../shared/services/api';
import {
  getCompanyDetail,
  updateCompanyStatus,
  getCompanyTimeline,
} from '../services/adminApi';
import {
  COMPANY_STATUS, EmptyState, KpiCard, Modal, PageHeader, Panel, Segmented, Skeleton, StatusBadge,
  formatCLP, formatInt, formatPercent, industryLabel,
} from '../ui';

// Transiciones válidas (deben coincidir con el backend)
const VALID_TRANSITIONS: Record<string, string[]> = {
  registered:       ['pending_contract', 'suspended'],
  pending_contract: ['signed', 'registered', 'suspended'],
  signed:           ['active', 'suspended'],
  active:           ['suspended'],
  suspended:        ['active'],
};

const DOC_TYPE_LABELS: Record<string, string> = {
  rut_empresa: 'RUT de la empresa',
  escritura_constitucion: 'Escritura de constitución',
  representante_legal: 'Cédula del representante legal',
  poder_notarial: 'Poder notarial',
  otro: 'Otro documento',
};

const DOC_STATUS = {
  approved: { label: 'Aprobado', tone: 'success' },
  rejected: { label: 'Rechazado', tone: 'danger' },
  pending: { label: 'Pendiente', tone: 'warning' },
} as const;

const docStatus = (s: string) => (s === 'approved' || s === 'rejected' ? DOC_STATUS[s] : DOC_STATUS.pending);

const statusOf = (s: string) => COMPANY_STATUS[s] ?? { label: s, tone: 'neutral' as const };

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString('es-CL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

const tons = (n: number) => `${(n || 0).toLocaleString('es-CL', { maximumFractionDigits: 1 })} t`;

interface CompanyDetail {
  id: string;
  razonSocial: string;
  rut: string;
  nombreComercial?: string;
  industry?: string;
  giroSii?: string;
  tamanoEmpresa?: string;
  direccion?: string;
  phone?: string;
  slugPublico?: string;
  publicProfileOptIn?: boolean;
  preferredCalculationMethod?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  companyUsers?: Array<{
    id: string;
    isAdmin: boolean;
    status: string;
    user: { id: string; email: string; name?: string; lastLoginAt?: string; isActive: boolean };
    roles: Array<{ code: string; name: string }>;
  }>;
  documents?: Array<{
    id: string;
    docType: string;
    status: string;
    uploadedAt: string;
    file?: { fileName: string; mimeType: string; sizeBytes: number; storageUrl: string };
  }>;
  domains?: Array<{ id: string; domain: string; verified: boolean; createdAt: string }>;
  settings?: any;
  metrics?: {
    totalEmissionsTons: number;
    totalCertificates: number;
    totalCompensatedTons: number;
    totalPaymentsCLP: number;
    totalFlights: number;
    totalPassengers: number;
  };
}

interface TimelineEvent {
  id: string;
  fromStatus: string;
  toStatus: string;
  note?: string;
  createdAt: string;
  changedBy?: { email: string; name?: string };
}

type Tab = 'overview' | 'users' | 'documents' | 'timeline';

export default function EmpresaDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [downloading, setDownloading] = useState<string | null>(null);

  // Cambio de estado
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [changingStatus, setChangingStatus] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [companyRes, timelineRes] = await Promise.allSettled([
        getCompanyDetail(id!),
        getCompanyTimeline(id!),
      ]);

      if (companyRes.status === 'fulfilled') {
        setCompany(companyRes.value as CompanyDetail);
      }
      if (timelineRes.status === 'fulfilled') {
        const tData = timelineRes.value as any;
        setTimeline(tData?.events || []);
      }
    } catch (err) {
      console.error('Error loading company detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const closeStatusModal = () => { setNewStatus(''); setStatusNote(''); };

  const handleStatusChange = async () => {
    if (!newStatus || !id) return;
    setChangingStatus(true);
    try {
      await updateCompanyStatus(id, newStatus, statusNote || undefined);
      toast.success(`Estado cambiado a «${statusOf(newStatus).label}»`);
      closeStatusModal();
      await loadData();
    } catch (err: any) {
      // Antes este error se mostraba con toast.success (en verde).
      const msg = err?.response?.data?.message || err?.message || 'No se pudo cambiar el estado. Revisa que la transición sea válida.';
      toast.error(msg);
    } finally {
      setChangingStatus(false);
    }
  };

  // Va por el cliente del API (y no por fetch con una URL armada a mano) para
  // usar la misma base, el token vigente y la renovación de sesión.
  const downloadDoc = async (docId: string, fileName: string) => {
    if (!company) return;
    try {
      setDownloading(docId);
      const res: any = await api.get(`/admin/companies/${company.id}/documents/${docId}/download`, { responseType: 'blob' });
      const blob: Blob = res instanceof Blob ? res : res?.data;
      if (!(blob instanceof Blob)) throw new Error('Respuesta inválida');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('No se pudo descargar el documento. Vuelve a intentarlo.');
    } finally {
      setDownloading(null);
    }
  };

  const back = (
    <Link to="/admin/empresas" className="adm-back">
      <ArrowLeft aria-hidden="true" /> Volver a Empresas
    </Link>
  );

  if (loading && !company) {
    return (
      <div className="adm-page" aria-busy="true">
        {back}
        <Skeleton height={64} />
        <div className="adm-kpis">{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={104} />)}</div>
        <Skeleton height={320} />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="adm-page">
        {back}
        <section className="adm-panel">
          <EmptyState icon={Building2} title="Empresa no encontrada" text="Puede que se haya eliminado o que el enlace esté incompleto." />
        </section>
      </div>
    );
  }

  const st = statusOf(company.status);
  const allowedTransitions = VALID_TRANSITIONS[company.status] || [];
  const metrics = company.metrics || { totalEmissionsTons: 0, totalCertificates: 0, totalCompensatedTons: 0, totalPaymentsCLP: 0, totalFlights: 0, totalPassengers: 0 };
  const compensationRate = metrics.totalEmissionsTons > 0 ? (metrics.totalCompensatedTons / metrics.totalEmissionsTons) * 100 : null;
  const users = company.companyUsers ?? [];
  const documents = company.documents ?? [];
  const target = newStatus ? statusOf(newStatus) : null;

  const docName = (doc: NonNullable<CompanyDetail['documents']>[number]) =>
    doc.file?.fileName && !doc.file.fileName.includes(company.id)
      ? doc.file.fileName
      : DOC_TYPE_LABELS[doc.docType] || doc.docType;

  return (
    <div className="adm-page">
      {back}

      <PageHeader
        title={company.nombreComercial || company.razonSocial}
        description={`${company.razonSocial}${company.rut ? ` · RUT ${company.rut}` : ''}`}
        actions={<StatusBadge tone={st.tone}>{st.label}</StatusBadge>}
      />

      <div className="adm-kpis">
        <KpiCard
          label="Emisiones calculadas"
          value={tons(metrics.totalEmissionsTons)}
          context={`${formatInt(metrics.totalFlights)} vuelos · ${formatInt(metrics.totalPassengers)} pasajeros`}
        />
        <KpiCard
          label="Emisiones compensadas"
          value={tons(metrics.totalCompensatedTons)}
          context={compensationRate !== null ? `${formatPercent(compensationRate)} de lo calculado` : 'Sin emisiones calculadas'}
        />
        <KpiCard label="Pagos" value={formatCLP(metrics.totalPaymentsCLP)} context="Total pagado por compensaciones" />
        <KpiCard label="Certificados" value={formatInt(metrics.totalCertificates)} context="Emitidos a la empresa" />
      </div>

      <Segmented
        label="Sección"
        options={[
          { value: 'overview', label: 'General' },
          { value: 'users', label: `Usuarios · ${formatInt(users.length)}` },
          { value: 'documents', label: `Documentos · ${formatInt(documents.length)}` },
          { value: 'timeline', label: 'Historial' },
        ]}
        value={activeTab}
        onChange={(v) => setActiveTab(v as Tab)}
      />

      {activeTab === 'overview' && (
        <div className="adm-grid adm-grid--2-1" style={{ alignItems: 'start' }}>
          <Panel title="Datos de la empresa">
            <dl className="adm-dl">
              <dt>Razón social</dt>
              <dd>{company.razonSocial}</dd>
              <dt>RUT</dt>
              <dd>{company.rut || <span className="adm-cell-mute">No registrado</span>}</dd>
              <dt>Nombre comercial</dt>
              <dd>{company.nombreComercial || '—'}</dd>
              <dt>Industria</dt>
              <dd>{company.industry ? industryLabel(company.industry) : '—'}</dd>
              <dt>Giro SII</dt>
              <dd>{company.giroSii || '—'}</dd>
              <dt>Tamaño</dt>
              <dd>{company.tamanoEmpresa || '—'}</dd>
              <dt>Dirección</dt>
              <dd>{company.direccion || '—'}</dd>
              <dt>Teléfono</dt>
              <dd>{company.phone || '—'}</dd>
              <dt>Perfil público</dt>
              <dd>{company.publicProfileOptIn ? 'Visible' : 'Oculto'}</dd>
              <dt>Identificador público</dt>
              <dd>{company.slugPublico ? <span className="adm-mono">{company.slugPublico}</span> : '—'}</dd>
              {company.settings && (
                <>
                  <dt>Método de cálculo</dt>
                  <dd>{company.preferredCalculationMethod || 'Predeterminado'}</dd>
                </>
              )}
              <dt>Registrada</dt>
              <dd>{fmtDate(company.createdAt)}</dd>
              <dt>Última actualización</dt>
              <dd>{fmtDate(company.updatedAt)}</dd>
            </dl>
          </Panel>

          <div className="adm-stack-v">
            <Panel title="Estado" aside={<StatusBadge tone={st.tone}>{st.label}</StatusBadge>}>
              {allowedTransitions.length > 0 ? (
                <div className="adm-stack-v">
                  <p className="adm-field__hint">Cambiar a:</p>
                  <div className="adm-actions-row">
                    {allowedTransitions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`adm-btn adm-btn--sm${s === 'active' || s === 'signed' ? ' adm-btn--primary' : ''}`}
                        onClick={() => setNewStatus(s)}
                      >
                        {statusOf(s).label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="adm-cell-mute">No hay transiciones disponibles desde este estado.</p>
              )}
            </Panel>

            <Panel title="Documentación">
              {documents.length > 0 ? (
                <div className="adm-chips">
                  {documents.map((doc) => {
                    const ds = docStatus(doc.status);
                    return (
                      <StatusBadge key={doc.id} tone={ds.tone}>
                        {DOC_TYPE_LABELS[doc.docType] || doc.docType} · {ds.label.toLowerCase()}
                      </StatusBadge>
                    );
                  })}
                </div>
              ) : (
                <div className="adm-alert adm-alert--warning">
                  <AlertTriangle aria-hidden="true" />
                  <div>Sin documentos. Se requieren para pasar a «Contrato firmado» o «Activa».</div>
                </div>
              )}
            </Panel>

            {company.domains && company.domains.length > 0 && (
              <Panel title="Dominios">
                <dl className="adm-dl">
                  {company.domains.map((d) => (
                    <div key={d.id} style={{ display: 'contents' }}>
                      <dt className="adm-mono">{d.domain}</dt>
                      <dd><StatusBadge tone={d.verified ? 'success' : 'warning'}>{d.verified ? 'Verificado' : 'Pendiente'}</StatusBadge></dd>
                    </div>
                  ))}
                </dl>
              </Panel>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <section className="adm-table-card">
          <div className="adm-table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th scope="col">Usuario</th>
                  <th scope="col">Roles</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Último ingreso</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState icon={Users} title="Sin usuarios" text="Esta empresa no tiene usuarios registrados." />
                    </td>
                  </tr>
                ) : (
                  users.map((cu) => (
                    <tr key={cu.id}>
                      <td>
                        <span className="adm-cell-title">{cu.user.name || cu.user.email}</span>
                        {cu.user.name && <span className="adm-cell-sub">{cu.user.email}</span>}
                      </td>
                      <td>
                        <div className="adm-chips">
                          {cu.isAdmin && <StatusBadge tone="info">Administrador</StatusBadge>}
                          {cu.roles.map((r) => <span key={r.code} className="adm-tag">{r.name}</span>)}
                          {!cu.isAdmin && cu.roles.length === 0 && <span className="adm-cell-mute">—</span>}
                        </div>
                      </td>
                      <td>
                        <StatusBadge tone={cu.user.isActive ? 'success' : 'neutral'}>{cu.user.isActive ? 'Activo' : 'Inactivo'}</StatusBadge>
                      </td>
                      <td>{cu.user.lastLoginAt ? new Date(cu.user.lastLoginAt).toLocaleDateString('es-CL') : <span className="adm-cell-mute">Nunca</span>}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'documents' && (
        <section className="adm-table-card">
          <div className="adm-table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th scope="col">Documento</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Subido</th>
                  <th scope="col" className="adm-col-num">Tamaño</th>
                  <th scope="col" className="adm-col-actions"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState icon={FileText} title="Sin documentos" text="La empresa aún no sube documentación." />
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => {
                    const name = docName(doc);
                    const ds = docStatus(doc.status);
                    return (
                      <tr key={doc.id}>
                        <td>
                          <span className="adm-cell-title" title={doc.file?.fileName}>{name}</span>
                          <span className="adm-cell-sub">{DOC_TYPE_LABELS[doc.docType] || doc.docType}</span>
                        </td>
                        <td><StatusBadge tone={ds.tone}>{ds.label}</StatusBadge></td>
                        <td>{new Date(doc.uploadedAt).toLocaleDateString('es-CL')}</td>
                        <td className="adm-col-num">{doc.file?.sizeBytes ? `${formatInt(doc.file.sizeBytes / 1024)} KB` : '—'}</td>
                        <td className="adm-col-actions">
                          <button
                            type="button"
                            className="adm-icon-btn"
                            onClick={() => downloadDoc(doc.id, name)}
                            disabled={downloading === doc.id}
                            title="Descargar"
                            aria-label={`Descargar ${name}`}
                          >
                            <Download aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'timeline' && (
        <Panel title="Historial de estados">
          {timeline.length === 0 ? (
            <EmptyState icon={Clock} title="Sin cambios de estado" />
          ) : (
            <ol className="adm-timeline">
              {timeline.map((evt) => {
                const from = statusOf(evt.fromStatus);
                const to = statusOf(evt.toStatus);
                return (
                  <li key={evt.id} className="adm-timeline__item">
                    <div className="adm-chips">
                      <StatusBadge tone="neutral">{from.label}</StatusBadge>
                      <ChevronRight aria-label="a" className="adm-timeline__arrow" />
                      <StatusBadge tone={to.tone}>{to.label}</StatusBadge>
                    </div>
                    {evt.note && <p className="adm-timeline__note">{evt.note}</p>}
                    <p className="adm-timeline__meta">
                      {fmtDateTime(evt.createdAt)}
                      {evt.changedBy && ` · ${evt.changedBy.name || evt.changedBy.email}`}
                    </p>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>
      )}

      <Modal
        open={!!newStatus}
        title="Cambiar estado"
        onClose={closeStatusModal}
        busy={changingStatus}
        footer={
          <>
            <button type="button" className="adm-btn" onClick={closeStatusModal} disabled={changingStatus}>Cancelar</button>
            <button
              type="button"
              className={`adm-btn ${newStatus === 'suspended' ? 'adm-btn--danger' : 'adm-btn--primary'}`}
              onClick={handleStatusChange}
              disabled={changingStatus}
            >
              {changingStatus ? 'Cambiando…' : `Cambiar a «${target?.label ?? ''}»`}
            </button>
          </>
        }
      >
        <p>
          {company.nombreComercial || company.razonSocial} pasará de <b>{st.label}</b> a <b>{target?.label}</b>.
        </p>

        {newStatus === 'suspended' && (
          <div className="adm-alert adm-alert--danger">
            <AlertTriangle aria-hidden="true" />
            <div>Suspender la empresa deshabilitará el acceso de todos sus usuarios y desactivará la compensación automática.</div>
          </div>
        )}

        {['signed', 'active'].includes(newStatus) && documents.length === 0 && (
          <div className="adm-alert adm-alert--warning">
            <AlertTriangle aria-hidden="true" />
            <div>La empresa no tiene documentos: el servidor rechazará este cambio hasta que la documentación esté completa.</div>
          </div>
        )}

        {newStatus === 'active' && documents.length > 0 && (
          <div className="adm-alert adm-alert--success">
            <CheckCircle2 aria-hidden="true" />
            <div>{formatInt(documents.length)} {documents.length === 1 ? 'documento cargado' : 'documentos cargados'}.</div>
          </div>
        )}

        <div className="adm-field">
          <label className="adm-field__label" htmlFor="ed-note">Nota <span className="adm-cell-mute">(opcional)</span></label>
          <textarea id="ed-note" className="adm-textarea" rows={3} value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="Motivo del cambio" />
        </div>
      </Modal>
    </div>
  );
}
