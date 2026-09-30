/**
 * Detalle de un Impact Partner para el SuperAdmin: datos, usuarios y
 * proyectos, con las acciones de verificar, activar o suspender.
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Check, X, Pause, Play, ShieldCheck, ExternalLink, Users, TreePine, AlertTriangle, CheckCircle2, XCircle, FileQuestion,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getPartnerDetail,
  updatePartnerStatus,
  verifyPartner,
  approvePartnerProject,
  rejectPartnerProject,
  PartnerDetail as PartnerDetailType
} from '../services/adminApi';
import RejectModal from '../components/shared/RejectModal';
import {
  EmptyState, PageHeader, Panel, Segmented, Skeleton, StatusBadge,
  formatInt, partnerStatus, projectStatus, projectTypeLabel, useAdminConfirm,
} from '../ui';

type Tab = 'info' | 'users' | 'projects';

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { confirm, dialog } = useAdminConfirm();
  const [partner, setPartner] = useState<PartnerDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchPartner();
  }, [id]);

  const fetchPartner = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await getPartnerDetail(id);
      setPartner(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo cargar el partner');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'suspended') => {
    if (!partner) return;
    const activate = newStatus === 'active';
    const ok = await confirm({
      title: activate ? `¿Activar a ${partner.name}?` : `¿Suspender a ${partner.name}?`,
      description: activate
        ? 'El estado del partner pasará a Activo.'
        : 'El estado del partner pasará a Suspendido. Podrás reactivarlo después.',
      confirmLabel: activate ? 'Activar' : 'Suspender',
      tone: activate ? undefined : 'danger',
    });
    if (!ok) return;

    setActionLoading('status');
    setActionError(null);
    try {
      await updatePartnerStatus(partner.id, newStatus);
      toast.success(activate ? 'Partner activado' : 'Partner suspendido');
      fetchPartner();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'No se pudo actualizar el estado');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerify = async () => {
    if (!partner) return;
    const ok = await confirm({
      title: `¿Marcar a ${partner.name} como verificado?`,
      description: 'Hazlo solo después de revisar su documentación KYB.',
      confirmLabel: 'Marcar como verificado',
    });
    if (!ok) return;

    setActionLoading('verify');
    setActionError(null);
    try {
      await verifyPartner(partner.id);
      toast.success('Partner verificado');
      fetchPartner();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'No se pudo verificar el partner');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveProject = async (projectId: string, name: string) => {
    if (!partner) return;
    const ok = await confirm({
      title: '¿Aprobar el proyecto?',
      description: `«${name}» pasará a estar aprobado.`,
      confirmLabel: 'Aprobar',
    });
    if (!ok) return;

    setActionLoading(projectId);
    setActionError(null);
    try {
      await approvePartnerProject(partner.id, projectId);
      toast.success('Proyecto aprobado');
      fetchPartner();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'No se pudo aprobar el proyecto');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectProject = async (reason: string) => {
    if (!partner || !showRejectModal) return;

    setActionLoading(showRejectModal);
    setActionError(null);
    try {
      await rejectPartnerProject(partner.id, showRejectModal, reason);
      setShowRejectModal(null);
      toast.success('Proyecto rechazado');
      fetchPartner();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'No se pudo rechazar el proyecto');
    } finally {
      setActionLoading(null);
    }
  };

  const back = (
    <Link to="/admin/partners" className="adm-back">
      <ArrowLeft aria-hidden="true" /> Volver a Impact Partners
    </Link>
  );

  if (loading && !partner) {
    return (
      <div className="adm-page" aria-busy="true">
        {back}
        <Skeleton height={64} />
        <div className="adm-grid adm-grid--1-1">
          <Skeleton height={280} />
          <Skeleton height={280} />
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="adm-page">
        {back}
        <section className="adm-panel">
          <EmptyState icon={FileQuestion} title="No se pudo abrir el partner" text={error || 'El partner no existe o fue eliminado.'} />
        </section>
      </div>
    );
  }

  const st = partnerStatus(partner.status);
  const users = partner.users ?? [];
  const projects = partner.projects ?? [];
  const pendingProjects = projects.filter((p) => p.status === 'pending_review').length;
  const bank = partner.bank_details;

  return (
    <div className="adm-page">
      {back}

      <PageHeader
        title={partner.name}
        description={`Impact Partner desde el ${fmtDate(partner.created_at)}`}
        actions={
          <>
            {!partner.verified_at && (
              <button type="button" className="adm-btn" onClick={handleVerify} disabled={actionLoading === 'verify'}>
                <ShieldCheck aria-hidden="true" /> Marcar como verificado
              </button>
            )}
            {partner.status !== 'active' ? (
              <button type="button" className="adm-btn adm-btn--primary" onClick={() => handleStatusChange('active')} disabled={actionLoading === 'status'}>
                <Play aria-hidden="true" /> Activar
              </button>
            ) : (
              <button type="button" className="adm-btn" onClick={() => handleStatusChange('suspended')} disabled={actionLoading === 'status'}>
                <Pause aria-hidden="true" /> Suspender
              </button>
            )}
          </>
        }
      />

      <div className="adm-chips">
        <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
        {partner.verified_at
          ? <StatusBadge tone="info">Verificado el {fmtDate(partner.verified_at)}</StatusBadge>
          : <StatusBadge tone="warning">Sin verificar</StatusBadge>}
        {pendingProjects > 0 && (
          <StatusBadge tone="warning">
            {formatInt(pendingProjects)} {pendingProjects === 1 ? 'proyecto por revisar' : 'proyectos por revisar'}
          </StatusBadge>
        )}
      </div>

      {actionError && (
        <div role="alert" className="adm-alert adm-alert--danger">
          <XCircle aria-hidden="true" />
          <div>{actionError}</div>
        </div>
      )}

      <Segmented
        label="Sección"
        options={[
          { value: 'info', label: 'Información' },
          { value: 'users', label: `Usuarios · ${formatInt(users.length)}` },
          { value: 'projects', label: `Proyectos · ${formatInt(projects.length)}` },
        ]}
        value={activeTab}
        onChange={(v) => setActiveTab(v as Tab)}
      />

      {activeTab === 'info' && (
        <div className="adm-grid adm-grid--1-1" style={{ alignItems: 'start' }}>
          <Panel title="Información general">
            <dl className="adm-dl">
              <dt>Correo de contacto</dt>
              <dd style={{ wordBreak: 'break-all' }}>{partner.contact_email || '—'}</dd>
              <dt>Sitio web</dt>
              <dd>
                {partner.website_url ? (
                  <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="adm-link">
                    {partner.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')} <ExternalLink aria-hidden="true" />
                  </a>
                ) : (
                  <span className="adm-cell-mute">No informado</span>
                )}
              </dd>
              <dt>Fecha de registro</dt>
              <dd>{fmtDate(partner.created_at)}</dd>
              <dt>Fecha de verificación</dt>
              <dd>{partner.verified_at ? fmtDate(partner.verified_at) : <span className="adm-cell-mute">Pendiente</span>}</dd>
              <dt>Proyectos</dt>
              <dd>{formatInt(projects.length)}</dd>
            </dl>
          </Panel>

          <Panel title="Datos bancarios" description="Cuenta donde se liquidan las compensaciones.">
            {bank ? (
              <>
                <dl className="adm-dl">
                  <dt>Banco</dt>
                  <dd>{bank.bank_name}</dd>
                  <dt>Tipo de cuenta</dt>
                  <dd>{bank.account_type === 'checking' ? 'Cuenta corriente' : 'Cuenta de ahorro'}</dd>
                  <dt>Número de cuenta</dt>
                  <dd className="adm-mono">{bank.account_number}</dd>
                  <dt>Moneda</dt>
                  <dd>{bank.currency}</dd>
                  <dt>Titular</dt>
                  <dd>{bank.account_holder_name}</dd>
                  <dt>RUT del titular</dt>
                  <dd>{bank.account_holder_rut}</dd>
                </dl>
                {bank.updated_at && (
                  <p className="adm-field__hint" style={{ marginTop: 12 }}>Actualizados el {fmtDate(bank.updated_at)}</p>
                )}
              </>
            ) : partner.bank_details_configured ? (
              <div className="adm-alert adm-alert--success">
                <CheckCircle2 aria-hidden="true" />
                <div>Los datos bancarios están registrados, pero no se muestran en esta vista.</div>
              </div>
            ) : (
              <div className="adm-alert adm-alert--warning">
                <AlertTriangle aria-hidden="true" />
                <div>
                  <b>Pendientes.</b> El partner aún no configura sus datos bancarios; no se le puede liquidar.
                </div>
              </div>
            )}
          </Panel>
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
                      <EmptyState icon={Users} title="Sin usuarios" text="Este partner no tiene usuarios registrados." />
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <span className="adm-cell-title">{user.name}</span>
                        <span className="adm-cell-sub">{user.email}</span>
                      </td>
                      <td>
                        <div className="adm-chips">
                          {user.roles?.length ? user.roles.map((role) => <span key={role.code} className="adm-tag">{role.name}</span>) : <span className="adm-cell-mute">—</span>}
                        </div>
                      </td>
                      <td>
                        <StatusBadge tone={user.is_active ? 'success' : 'neutral'}>{user.is_active ? 'Activo' : 'Inactivo'}</StatusBadge>
                      </td>
                      <td>{user.last_login ? new Date(user.last_login).toLocaleDateString('es-CL') : <span className="adm-cell-mute">Nunca</span>}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'projects' && (
        <section className="adm-table-card">
          <div className="adm-table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th scope="col">Proyecto</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Creado</th>
                  <th scope="col" className="adm-col-actions"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState icon={TreePine} title="Sin proyectos" text="Este partner aún no crea proyectos." />
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => {
                    const ps = projectStatus(project.status);
                    const busy = actionLoading === project.id;
                    return (
                      <tr key={project.id}>
                        <td>
                          <Link to={`/admin/proyectos/${project.id}`} className="adm-cell-title adm-link-plain">{project.name}</Link>
                          <span className="adm-cell-sub">Código {project.code}</span>
                        </td>
                        <td>{projectTypeLabel(project.type)}</td>
                        <td><StatusBadge tone={ps.tone}>{ps.label}</StatusBadge></td>
                        <td>{new Date(project.created_at).toLocaleDateString('es-CL')}</td>
                        <td className="adm-col-actions">
                          {project.status === 'pending_review' && (
                            <div className="adm-actions-row" style={{ justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                              <button type="button" className="adm-btn adm-btn--sm" onClick={() => setShowRejectModal(project.id)} disabled={busy}>
                                <X aria-hidden="true" /> Rechazar
                              </button>
                              <button type="button" className="adm-btn adm-btn--sm adm-btn--primary" onClick={() => handleApproveProject(project.id, project.name)} disabled={busy}>
                                <Check aria-hidden="true" /> Aprobar
                              </button>
                            </div>
                          )}
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

      <RejectModal
        isOpen={!!showRejectModal}
        onClose={() => setShowRejectModal(null)}
        onConfirm={handleRejectProject}
        title="Rechazar proyecto"
        itemName={projects.find((p) => p.id === showRejectModal)?.name || 'este proyecto'}
        loading={actionLoading === showRejectModal}
      />
      {dialog}
    </div>
  );
}
