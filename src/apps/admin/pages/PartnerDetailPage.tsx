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
import RejectModal from '../components/shared/RejectModal';

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  active: { label: 'Activo', color: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', icon: CheckCircle },
  onboarding: { label: 'Onboarding', color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30', icon: Clock },
  suspended: { label: 'Suspendido', color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30', icon: Pause },
  inactive: { label: 'Inactivo', color: 'text-slate-700 dark:text-slate-200', bgColor: 'bg-slate-100 dark:bg-slate-800', icon: XCircle },
};

const projectStatusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Borrador', color: 'text-slate-700 dark:text-slate-200', bgColor: 'bg-slate-100 dark:bg-slate-800' },
  pending_review: { label: 'Pendiente Revisión', color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  approved: { label: 'Aprobado', color: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  rejected: { label: 'Rechazado', color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  published: { label: 'Publicado', color: 'text-blue-700 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  suspended: { label: 'Suspendido', color: 'text-orange-700 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
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
  const [confirmAction, setConfirmAction] = useState<null | 'verify' | 'activate' | 'suspend'>(null);
  const [confirmApproveProjectId, setConfirmApproveProjectId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
    if (!partner) return;

    setActionLoading('status');
    setActionError(null);
    try {
      await updatePartnerStatus(partner.id, newStatus);
      setConfirmAction(null);
      fetchPartner();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Error al actualizar estado');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerify = async () => {
    if (!partner) return;

    setActionLoading('verify');
    setActionError(null);
    try {
      await verifyPartner(partner.id);
      setConfirmAction(null);
      fetchPartner();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Error al verificar partner');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveProject = async (projectId: string) => {
    if (!partner) return;

    setActionLoading(projectId);
    setActionError(null);
    try {
      await approvePartnerProject(partner.id, projectId);
      setConfirmApproveProjectId(null);
      fetchPartner();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Error al aprobar proyecto');
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
      fetchPartner();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Error al rechazar proyecto');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
        <p className="text-red-700 dark:text-red-400 font-medium">{error || 'Partner no encontrado'}</p>
        <button
          onClick={() => navigate('/admin/partners')}
          className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  const statusInfo = statusConfig[partner.status] || statusConfig.inactive;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/partners')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div className="flex items-center gap-4">
            {partner.logo_url ? (
              <img
                src={partner.logo_url}
                alt={partner.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {partner.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{partner.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusInfo.label}
                </span>
                {partner.verified_at && (
                  <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                    <Shield className="w-3 h-3" />
                    Verificado
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!partner.verified_at && (
            <button
              onClick={() => setConfirmAction('verify')}
              disabled={actionLoading === 'verify'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {actionLoading === 'verify' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              Verificar Partner
            </button>
          )}

          {partner.status !== 'active' && (
            <button
              onClick={() => setConfirmAction('activate')}
              disabled={actionLoading === 'status'}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              <Play className="w-4 h-4" />
              Activar
            </button>
          )}

          {partner.status === 'active' && (
            <button
              onClick={() => setConfirmAction('suspend')}
              disabled={actionLoading === 'status'}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors disabled:opacity-60"
            >
              <Pause className="w-4 h-4" />
              Suspender
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{actionError}</p>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex gap-6">
          {[
            { key: 'info', label: 'Información', icon: Building2 },
            { key: 'users', label: `Usuarios (${partner.users?.length || 0})`, icon: User },
            { key: 'projects', label: `Proyectos (${partner.projects?.length || 0})`, icon: TreePine },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Información General
            </h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">Email de Contacto</dt>
                <dd className="mt-1 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  {partner.contact_email || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">Sitio Web</dt>
                <dd className="mt-1">
                  {partner.website_url ? (
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <Globe className="w-4 h-4" />
                      {partner.website_url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">No configurado</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">Fecha de Registro</dt>
                <dd className="mt-1 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  {new Date(partner.created_at).toLocaleDateString('es-CL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
              {partner.verified_at && (
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Fecha de Verificación</dt>
                  <dd className="mt-1 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Shield className="w-4 h-4" />
                    {new Date(partner.verified_at).toLocaleDateString('es-CL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400">Creado por</dt>
                <dd className="mt-1 text-slate-800 dark:text-slate-100">{partner.created_by}</dd>
              </div>
            </dl>
          </div>

          {/* Bank Details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Datos Bancarios
            </h3>
            {partner.bank_details ? (
              <div className="space-y-4">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Banco</dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-100">{partner.bank_details.bank_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Tipo de Cuenta</dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-100">
                      {partner.bank_details.account_type === 'checking' ? 'Cuenta Corriente' : 'Cuenta de Ahorro'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Número de Cuenta</dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-100">{partner.bank_details.account_number}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Moneda</dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-100">{partner.bank_details.currency}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Titular</dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-100">{partner.bank_details.account_holder_name}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-sm text-slate-500 dark:text-slate-400">RUT Titular</dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-100">{partner.bank_details.account_holder_rut}</dd>
                  </div>
                  {partner.bank_details.updated_at && (
                    <div className="col-span-2">
                      <dt className="text-sm text-slate-500 dark:text-slate-400">Última actualización</dt>
                      <dd className="text-sm text-slate-600 dark:text-slate-300">
                        {new Date(partner.bank_details.updated_at).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </dd>
                    </div>
                  )}
                </dl>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Datos validados y guardados</span>
                </div>
              </div>
            ) : partner.bank_details_configured ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Configurados correctamente</span>
                </div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                  Los datos bancarios están registrados en el sistema
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Pendientes</span>
                </div>
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                  El partner aún no ha configurado sus datos bancarios
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Usuarios del Partner</h3>
          </div>
          {partner.users && partner.users.length > 0 ? (
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Roles</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Último Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {partner.users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-100">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role) => (
                          <span
                            key={role.code}
                            className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full"
                          >
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.is_active
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString('es-CL')
                        : 'Nunca'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-12 text-center">
              <User className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-slate-500 dark:text-slate-400 mt-2">No hay usuarios registrados</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-4">
          {partner.projects && partner.projects.length > 0 ? (
            partner.projects.map((project) => {
              const projectStatus = projectStatusConfig[project.status] || projectStatusConfig.draft;
              const isPendingReview = project.status === 'pending_review';

              return (
                <div
                  key={project.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-slate-100">{project.name}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Código: {project.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${projectStatus.bgColor} ${projectStatus.color}`}>
                          {projectStatus.label}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {project.type}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(project.created_at).toLocaleDateString('es-CL')}
                        </span>
                      </div>
                    </div>

                    {isPendingReview && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setConfirmApproveProjectId(project.id)}
                          disabled={actionLoading === project.id}
                          className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {actionLoading === project.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Aprobar
                        </button>
                        <button
                          onClick={() => setShowRejectModal(project.id)}
                          disabled={actionLoading === project.id}
                          className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                        >
                          <X className="w-4 h-4" />
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center shadow-sm border border-slate-100 dark:border-slate-700">
              <TreePine className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-slate-500 dark:text-slate-400 mt-2">No hay proyectos registrados</p>
            </div>
          )}
        </div>
      )}

      {/* Reject Project Modal */}
      <RejectModal
        isOpen={!!showRejectModal}
        onClose={() => setShowRejectModal(null)}
        onConfirm={handleRejectProject}
        title="Rechazar Proyecto"
        itemName={partner.projects?.find((p) => p.id === showRejectModal)?.name || 'este proyecto'}
        loading={actionLoading === showRejectModal}
      />

      {/* Approve Project Modal */}
      <RejectModal
        isOpen={!!confirmApproveProjectId}
        onClose={() => setConfirmApproveProjectId(null)}
        onConfirm={() => handleApproveProject(confirmApproveProjectId!)}
        title="Aprobar Proyecto"
        itemName={partner.projects?.find((p) => p.id === confirmApproveProjectId)?.name || 'este proyecto'}
        loading={actionLoading === confirmApproveProjectId}
        requireReason={false}
        confirmMessage="¿Aprobar el proyecto"
        confirmLabel="Aprobar"
        variant="primary"
      />

      {/* Verify Partner Modal */}
      <RejectModal
        isOpen={confirmAction === 'verify'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleVerify}
        title="Verificar Partner"
        itemName={partner.name}
        loading={actionLoading === 'verify'}
        requireReason={false}
        confirmMessage="¿Marcar como verificado a"
        confirmLabel="Verificar Partner"
        variant="primary"
      />

      {/* Activate/Suspend Partner Modal */}
      <RejectModal
        isOpen={confirmAction === 'activate' || confirmAction === 'suspend'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleStatusChange(confirmAction === 'activate' ? 'active' : 'suspended')}
        title={confirmAction === 'activate' ? 'Activar Partner' : 'Suspender Partner'}
        itemName={partner.name}
        loading={actionLoading === 'status'}
        requireReason={false}
        confirmMessage={confirmAction === 'activate' ? '¿Cambiar el estado a "Activo" para' : '¿Cambiar el estado a "Suspendido" para'}
        confirmLabel={confirmAction === 'activate' ? 'Activar' : 'Suspender'}
        variant={confirmAction === 'activate' ? 'primary' : 'danger'}
      />
    </div>
  );
}
