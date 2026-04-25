/**
 * Partner Detail Page
 * Vista detallada de un Impact Partner para SuperAdmin
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Mail,
  Globe,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  AlertTriangle,
  Edit,
  User,
  CreditCard,
  TreePine,
  RefreshCw,
  Play,
  Ban,
  ExternalLink,
  MoreHorizontal,
  Eye,
  Check,
  X,
  FileText,
  MapPin,
  DollarSign,
  Leaf
} from 'lucide-react';
import { 
  getPartnerDetail, 
  updatePartnerStatus, 
  verifyPartner, 
  approvePartnerProject,
  rejectPartnerProject,
  PartnerDetail as PartnerDetailType 
} from '../services/adminApi';

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  active: { label: 'Activo', color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: CheckCircle },
  onboarding: { label: 'Onboarding', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Clock },
  suspended: { label: 'Suspendido', color: 'text-red-700', bgColor: 'bg-red-100', icon: Pause },
  inactive: { label: 'Inactivo', color: 'text-slate-700', bgColor: 'bg-slate-100', icon: XCircle },
};

const projectStatusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Borrador', color: 'text-slate-700', bgColor: 'bg-slate-100' },
  pending_review: { label: 'Pendiente Revisión', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  approved: { label: 'Aprobado', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  rejected: { label: 'Rechazado', color: 'text-red-700', bgColor: 'bg-red-100' },
  published: { label: 'Publicado', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  suspended: { label: 'Suspendido', color: 'text-orange-700', bgColor: 'bg-orange-100' },
};

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [partner, setPartner] = useState<PartnerDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'users' | 'projects'>('info');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPartner();
    
    // Check for action param
    if (searchParams.get('action') === 'verify') {
      // Auto-scroll to verify section
    }
  }, [id, searchParams]);

  const fetchPartner = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await getPartnerDetail(id);
      setPartner(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar partner');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'suspended' | 'inactive') => {
    if (!partner || !confirm(`¿Cambiar estado a "${statusConfig[newStatus]?.label}"?`)) return;

    setActionLoading('status');
    try {
      await updatePartnerStatus(partner.id, newStatus);
      fetchPartner();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar estado');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerify = async () => {
    if (!partner || !confirm('¿Marcar este partner como verificado?')) return;

    setActionLoading('verify');
    try {
      await verifyPartner(partner.id);
      fetchPartner();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al verificar partner');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveProject = async (projectId: string) => {
    if (!partner || !confirm('¿Aprobar este proyecto?')) return;

    setActionLoading(projectId);
    try {
      await approvePartnerProject(partner.id, projectId);
      fetchPartner();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al aprobar proyecto');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectProject = async () => {
    if (!partner || !showRejectModal || !rejectReason.trim()) return;

    setActionLoading(showRejectModal);
    try {
      await rejectPartnerProject(partner.id, showRejectModal, rejectReason);
      setShowRejectModal(null);
      setRejectReason('');
      fetchPartner();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al rechazar proyecto');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="!flex !items-center !justify-center !h-96">
        <RefreshCw className="!w-8 !h-8 !animate-spin !text-indigo-600" />
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="!bg-red-50 !rounded-2xl !p-8 !text-center">
        <AlertTriangle className="!w-12 !h-12 !text-red-500 !mx-auto !mb-4" />
        <p className="!text-red-700 !font-medium">{error || 'Partner no encontrado'}</p>
        <button
          onClick={() => navigate('/admin/partners')}
          className="!mt-4 !text-indigo-600 hover:!underline"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  const statusInfo = statusConfig[partner.status] || statusConfig.inactive;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div className="!flex !items-start !justify-between">
        <div className="!flex !items-center !gap-4">
          <button
            onClick={() => navigate('/admin/partners')}
            className="!p-2 !rounded-xl !border !border-slate-200 hover:!bg-slate-50 !transition-colors"
          >
            <ArrowLeft className="!w-5 !h-5 !text-slate-600" />
          </button>
          <div className="!flex !items-center !gap-4">
            {partner.logo_url ? (
              <img
                src={partner.logo_url}
                alt={partner.name}
                className="!w-16 !h-16 !rounded-2xl !object-cover !border-2 !border-slate-200"
              />
            ) : (
              <div className="!w-16 !h-16 !rounded-2xl !bg-gradient-to-br !from-indigo-500 !to-purple-600 !flex !items-center !justify-center !text-white !text-2xl !font-bold">
                {partner.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="!text-2xl !font-bold !text-slate-800">{partner.name}</h1>
              <div className="!flex !items-center !gap-3 !mt-1">
                <span className={`!inline-flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !text-xs !font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                  <StatusIcon className="!w-3.5 !h-3.5" />
                  {statusInfo.label}
                </span>
                {partner.verified_at && (
                  <span className="!inline-flex !items-center !gap-1 !text-xs !text-blue-600 !bg-blue-50 !px-2 !py-1 !rounded-full">
                    <Shield className="!w-3 !h-3" />
                    Verificado
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="!flex !items-center !gap-2">
          {!partner.verified_at && (
            <button
              onClick={handleVerify}
              disabled={actionLoading === 'verify'}
              className="!flex !items-center !gap-2 !px-4 !py-2 !bg-blue-600 !text-white !rounded-xl !font-medium hover:!bg-blue-700 !transition-colors disabled:!opacity-60"
            >
              {actionLoading === 'verify' ? (
                <RefreshCw className="!w-4 !h-4 !animate-spin" />
              ) : (
                <Shield className="!w-4 !h-4" />
              )}
              Verificar Partner
            </button>
          )}
          
          {partner.status !== 'active' && (
            <button
              onClick={() => handleStatusChange('active')}
              disabled={actionLoading === 'status'}
              className="!flex !items-center !gap-2 !px-4 !py-2 !bg-emerald-600 !text-white !rounded-xl !font-medium hover:!bg-emerald-700 !transition-colors disabled:!opacity-60"
            >
              <Play className="!w-4 !h-4" />
              Activar
            </button>
          )}
          
          {partner.status === 'active' && (
            <button
              onClick={() => handleStatusChange('suspended')}
              disabled={actionLoading === 'status'}
              className="!flex !items-center !gap-2 !px-4 !py-2 !bg-amber-600 !text-white !rounded-xl !font-medium hover:!bg-amber-700 !transition-colors disabled:!opacity-60"
            >
              <Pause className="!w-4 !h-4" />
              Suspender
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="!border-b !border-slate-200">
        <nav className="!flex !gap-6">
          {[
            { key: 'info', label: 'Información', icon: Building2 },
            { key: 'users', label: `Usuarios (${partner.users?.length || 0})`, icon: User },
            { key: 'projects', label: `Proyectos (${partner.projects?.length || 0})`, icon: TreePine },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`!flex !items-center !gap-2 !px-1 !py-3 !border-b-2 !font-medium !transition-colors ${
                activeTab === tab.key
                  ? '!border-indigo-600 !text-indigo-600'
                  : '!border-transparent !text-slate-500 hover:!text-slate-700'
              }`}
            >
              <tab.icon className="!w-4 !h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="!grid !grid-cols-1 lg:!grid-cols-2 !gap-6">
          {/* Basic Info */}
          <div className="!bg-white !rounded-2xl !p-6 !shadow-sm !border !border-slate-100">
            <h3 className="!text-lg !font-semibold !text-slate-800 !mb-4 !flex !items-center !gap-2">
              <Building2 className="!w-5 !h-5 !text-indigo-600" />
              Información General
            </h3>
            <dl className="!space-y-4">
              <div>
                <dt className="!text-sm !text-slate-500">Email de Contacto</dt>
                <dd className="!mt-1 !flex !items-center !gap-2 !text-slate-800">
                  <Mail className="!w-4 !h-4 !text-slate-400" />
                  {partner.contact_email || '-'}
                </dd>
              </div>
              <div>
                <dt className="!text-sm !text-slate-500">Sitio Web</dt>
                <dd className="!mt-1">
                  {partner.website_url ? (
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="!flex !items-center !gap-2 !text-indigo-600 hover:!underline"
                    >
                      <Globe className="!w-4 !h-4" />
                      {partner.website_url}
                      <ExternalLink className="!w-3 !h-3" />
                    </a>
                  ) : (
                    <span className="!text-slate-400">No configurado</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="!text-sm !text-slate-500">Fecha de Registro</dt>
                <dd className="!mt-1 !flex !items-center !gap-2 !text-slate-800">
                  <Calendar className="!w-4 !h-4 !text-slate-400" />
                  {new Date(partner.created_at).toLocaleDateString('es-CL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
              {partner.verified_at && (
                <div>
                  <dt className="!text-sm !text-slate-500">Fecha de Verificación</dt>
                  <dd className="!mt-1 !flex !items-center !gap-2 !text-blue-600">
                    <Shield className="!w-4 !h-4" />
                    {new Date(partner.verified_at).toLocaleDateString('es-CL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
              )}
              <div>
                <dt className="!text-sm !text-slate-500">Creado por</dt>
                <dd className="!mt-1 !text-slate-800">{partner.created_by}</dd>
              </div>
            </dl>
          </div>

          {/* Bank Details */}
          <div className="!bg-white !rounded-2xl !p-6 !shadow-sm !border !border-slate-100">
            <h3 className="!text-lg !font-semibold !text-slate-800 !mb-4 !flex !items-center !gap-2">
              <CreditCard className="!w-5 !h-5 !text-indigo-600" />
              Datos Bancarios
            </h3>
            {partner.bank_details ? (
              <div className="!space-y-4">
                <dl className="!grid !grid-cols-2 !gap-x-4 !gap-y-3">
                  <div>
                    <dt className="!text-sm !text-slate-500">Banco</dt>
                    <dd className="!font-medium !text-slate-800">{partner.bank_details.bank_name}</dd>
                  </div>
                  <div>
                    <dt className="!text-sm !text-slate-500">Tipo de Cuenta</dt>
                    <dd className="!font-medium !text-slate-800">
                      {partner.bank_details.account_type === 'checking' ? 'Cuenta Corriente' : 'Cuenta de Ahorro'}
                    </dd>
                  </div>
                  <div>
                    <dt className="!text-sm !text-slate-500">Número de Cuenta</dt>
                    <dd className="!font-medium !text-slate-800">{partner.bank_details.account_number}</dd>
                  </div>
                  <div>
                    <dt className="!text-sm !text-slate-500">Moneda</dt>
                    <dd className="!font-medium !text-slate-800">{partner.bank_details.currency}</dd>
                  </div>
                  <div className="!col-span-2">
                    <dt className="!text-sm !text-slate-500">Titular</dt>
                    <dd className="!font-medium !text-slate-800">{partner.bank_details.account_holder_name}</dd>
                  </div>
                  <div className="!col-span-2">
                    <dt className="!text-sm !text-slate-500">RUT Titular</dt>
                    <dd className="!font-medium !text-slate-800">{partner.bank_details.account_holder_rut}</dd>
                  </div>
                  {partner.bank_details.updated_at && (
                    <div className="!col-span-2">
                      <dt className="!text-sm !text-slate-500">Última actualización</dt>
                      <dd className="!text-sm !text-slate-600">
                        {new Date(partner.bank_details.updated_at).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </dd>
                    </div>
                  )}
                </dl>
                <div className="!bg-emerald-50 !rounded-xl !p-3 !flex !items-center !gap-2 !text-emerald-700">
                  <CheckCircle className="!w-4 !h-4" />
                  <span className="!text-sm !font-medium">Datos validados y guardados</span>
                </div>
              </div>
            ) : partner.bank_details_configured ? (
              <div className="!bg-emerald-50 !rounded-xl !p-4">
                <div className="!flex !items-center !gap-2 !text-emerald-700">
                  <CheckCircle className="!w-5 !h-5" />
                  <span className="!font-medium">Configurados correctamente</span>
                </div>
                <p className="!text-sm !text-emerald-600 !mt-1">
                  Los datos bancarios están registrados en el sistema
                </p>
              </div>
            ) : (
              <div className="!bg-amber-50 !rounded-xl !p-4">
                <div className="!flex !items-center !gap-2 !text-amber-700">
                  <AlertTriangle className="!w-5 !h-5" />
                  <span className="!font-medium">Pendientes</span>
                </div>
                <p className="!text-sm !text-amber-600 !mt-1">
                  El partner aún no ha configurado sus datos bancarios
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="!bg-white !rounded-2xl !shadow-sm !border !border-slate-100 !overflow-hidden">
          <div className="!px-6 !py-4 !border-b !border-slate-100">
            <h3 className="!font-semibold !text-slate-800">Usuarios del Partner</h3>
          </div>
          {partner.users && partner.users.length > 0 ? (
            <table className="!w-full">
              <thead className="!bg-slate-50">
                <tr>
                  <th className="!px-6 !py-3 !text-left !text-xs !font-semibold !text-slate-600 !uppercase">Usuario</th>
                  <th className="!px-6 !py-3 !text-left !text-xs !font-semibold !text-slate-600 !uppercase">Email</th>
                  <th className="!px-6 !py-3 !text-left !text-xs !font-semibold !text-slate-600 !uppercase">Roles</th>
                  <th className="!px-6 !py-3 !text-left !text-xs !font-semibold !text-slate-600 !uppercase">Estado</th>
                  <th className="!px-6 !py-3 !text-left !text-xs !font-semibold !text-slate-600 !uppercase">Último Login</th>
                </tr>
              </thead>
              <tbody className="!divide-y !divide-slate-100">
                {partner.users.map((user) => (
                  <tr key={user.id} className="hover:!bg-slate-50">
                    <td className="!px-6 !py-4">
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-8 !h-8 !rounded-full !bg-indigo-100 !flex !items-center !justify-center !text-indigo-600 !font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="!font-medium !text-slate-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="!px-6 !py-4 !text-slate-600">{user.email}</td>
                    <td className="!px-6 !py-4">
                      <div className="!flex !flex-wrap !gap-1">
                        {user.roles?.map((role) => (
                          <span
                            key={role.code}
                            className="!px-2 !py-0.5 !bg-indigo-100 !text-indigo-700 !text-xs !rounded-full"
                          >
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="!px-6 !py-4">
                      <span className={`!px-2 !py-1 !rounded-full !text-xs !font-medium ${
                        user.is_active
                          ? '!bg-emerald-100 !text-emerald-700'
                          : '!bg-slate-100 !text-slate-600'
                      }`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="!px-6 !py-4 !text-sm !text-slate-500">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString('es-CL')
                        : 'Nunca'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="!px-6 !py-12 !text-center">
              <User className="!w-12 !h-12 !text-slate-300 !mx-auto" />
              <p className="!text-slate-500 !mt-2">No hay usuarios registrados</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="!space-y-4">
          {partner.projects && partner.projects.length > 0 ? (
            partner.projects.map((project) => {
              const projectStatus = projectStatusConfig[project.status] || projectStatusConfig.draft;
              const isPendingReview = project.status === 'pending_review';

              return (
                <div
                  key={project.id}
                  className="!bg-white !rounded-2xl !p-6 !shadow-sm !border !border-slate-100"
                >
                  <div className="!flex !items-start !justify-between">
                    <div className="!flex-1">
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-10 !h-10 !rounded-xl !bg-emerald-100 !flex !items-center !justify-center">
                          <Leaf className="!w-5 !h-5 !text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="!font-semibold !text-slate-800">{project.name}</h4>
                          <p className="!text-sm !text-slate-500">Código: {project.code}</p>
                        </div>
                      </div>
                      <div className="!flex !items-center !gap-4 !mt-4">
                        <span className={`!px-3 !py-1 !rounded-full !text-xs !font-medium ${projectStatus.bgColor} ${projectStatus.color}`}>
                          {projectStatus.label}
                        </span>
                        <span className="!text-sm !text-slate-500 !flex !items-center !gap-1">
                          <FileText className="!w-4 !h-4" />
                          {project.type}
                        </span>
                        <span className="!text-sm !text-slate-500 !flex !items-center !gap-1">
                          <Calendar className="!w-4 !h-4" />
                          {new Date(project.created_at).toLocaleDateString('es-CL')}
                        </span>
                      </div>
                    </div>

                    {isPendingReview && (
                      <div className="!flex !items-center !gap-2">
                        <button
                          onClick={() => handleApproveProject(project.id)}
                          disabled={actionLoading === project.id}
                          className="!flex !items-center !gap-1 !px-3 !py-2 !bg-emerald-600 !text-white !rounded-lg !text-sm !font-medium hover:!bg-emerald-700 disabled:!opacity-60"
                        >
                          {actionLoading === project.id ? (
                            <RefreshCw className="!w-4 !h-4 !animate-spin" />
                          ) : (
                            <Check className="!w-4 !h-4" />
                          )}
                          Aprobar
                        </button>
                        <button
                          onClick={() => setShowRejectModal(project.id)}
                          disabled={actionLoading === project.id}
                          className="!flex !items-center !gap-1 !px-3 !py-2 !bg-red-600 !text-white !rounded-lg !text-sm !font-medium hover:!bg-red-700 disabled:!opacity-60"
                        >
                          <X className="!w-4 !h-4" />
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="!bg-white !rounded-2xl !p-12 !text-center !shadow-sm !border !border-slate-100">
              <TreePine className="!w-12 !h-12 !text-slate-300 !mx-auto" />
              <p className="!text-slate-500 !mt-2">No hay proyectos registrados</p>
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="!fixed !inset-0 !bg-black/50 !backdrop-blur-sm !flex !items-center !justify-center !z-50 !p-4">
          <div className="!bg-white !rounded-2xl !shadow-2xl !max-w-md !w-full !p-6">
            <h3 className="!text-lg !font-bold !text-slate-800 !mb-4">Rechazar Proyecto</h3>
            <p className="!text-sm !text-slate-600 !mb-4">
              Por favor, indica el motivo del rechazo. El partner recibirá esta información.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motivo del rechazo..."
              rows={4}
              className="!w-full !px-4 !py-3 !border !border-slate-200 !rounded-xl !bg-white !text-slate-800 placeholder:!text-slate-400 focus:!ring-2 focus:!ring-red-500/20 focus:!border-red-500 !outline-none !resize-none"
            />
            <div className="!flex !gap-3 !mt-4">
              <button
                onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                className="!flex-1 !py-2.5 !border !border-slate-200 !text-slate-700 !rounded-xl !font-medium hover:!bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectProject}
                disabled={!rejectReason.trim() || actionLoading === showRejectModal}
                className="!flex-1 !py-2.5 !bg-red-600 !text-white !rounded-xl !font-medium hover:!bg-red-700 disabled:!opacity-60"
              >
                {actionLoading === showRejectModal ? 'Rechazando...' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
