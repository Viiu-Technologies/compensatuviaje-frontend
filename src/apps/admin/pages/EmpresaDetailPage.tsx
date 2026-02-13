/**
 * EmpresaDetailPage
 * Vista detallada de una empresa B2B para SuperAdmin
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  FileText,
  Users,
  BarChart3,
  Plane,
  Leaf,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Hash,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import {
  getCompanyDetail,
  updateCompanyStatus,
  getCompanyTimeline,
} from '../services/adminApi';

// ─── Status config ───
const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType; borderColor: string }> = {
  registered:        { label: 'Registrada',        color: 'text-slate-700',   bgColor: 'bg-slate-100',   icon: Clock,       borderColor: 'border-slate-300' },
  pending_contract:  { label: 'Pendiente Contrato', color: 'text-amber-700',  bgColor: 'bg-amber-100',   icon: FileText,    borderColor: 'border-amber-300' },
  signed:            { label: 'Contrato Firmado',   color: 'text-blue-700',   bgColor: 'bg-blue-100',    icon: CheckCircle, borderColor: 'border-blue-300' },
  active:            { label: 'Activa',             color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: CheckCircle, borderColor: 'border-emerald-300' },
  suspended:         { label: 'Suspendida',         color: 'text-rose-700',   bgColor: 'bg-rose-100',    icon: Pause,       borderColor: 'border-rose-300' },
};

// Valid status transitions (must match backend)
const VALID_TRANSITIONS: Record<string, string[]> = {
  registered:       ['pending_contract', 'suspended'],
  pending_contract: ['signed', 'registered', 'suspended'],
  signed:           ['active', 'suspended'],
  active:           ['suspended'],
  suspended:        ['active'],
};

interface CompanyDetail {
  id: string;
  razonSocial: string;
  rut: string;
  nombreComercial?: string;
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

export default function EmpresaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'documents' | 'timeline'>('overview');

  // Status change modal
  const [showStatusModal, setShowStatusModal] = useState(false);
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

  const handleStatusChange = async () => {
    if (!newStatus || !id) return;
    setChangingStatus(true);
    try {
      await updateCompanyStatus(id, newStatus, statusNote || undefined);
      setShowStatusModal(false);
      setNewStatus('');
      setStatusNote('');
      await loadData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error al cambiar el estado. Verifica la transición sea válida.');
    } finally {
      setChangingStatus(false);
    }
  };

  // ─── Loading skeleton ───
  if (loading) {
    return (
      <div className="!space-y-6">
        <div className="!flex !items-center !gap-4">
          <div className="!w-10 !h-10 !rounded-xl !bg-slate-200 !animate-pulse" />
          <div className="!h-8 !w-64 !bg-slate-200 !rounded-xl !animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="!bg-white !rounded-3xl !p-8 !border !border-slate-100">
            <div className="!h-6 !w-48 !bg-slate-200 !rounded-lg !animate-pulse !mb-4" />
            <div className="!space-y-3">
              <div className="!h-4 !w-full !bg-slate-100 !rounded !animate-pulse" />
              <div className="!h-4 !w-3/4 !bg-slate-100 !rounded !animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!company) {
    return (
      <div className="!flex !flex-col !items-center !justify-center !py-20 !gap-4">
        <Building2 className="!w-16 !h-16 !text-slate-300" />
        <h3 className="!text-xl !font-bold !text-slate-600">Empresa no encontrada</h3>
        <button onClick={() => navigate('/admin/empresas')} className="!bg-indigo-600 !text-white !px-6 !py-2.5 !rounded-xl !font-bold !text-sm hover:!bg-indigo-700 !transition-all">
          Volver a Empresas
        </button>
      </div>
    );
  }

  const sc = statusConfig[company.status] || statusConfig.registered;
  const StatusIcon = sc.icon;
  const allowedTransitions = VALID_TRANSITIONS[company.status] || [];
  const metrics = company.metrics || { totalEmissionsTons: 0, totalCertificates: 0, totalCompensatedTons: 0, totalPaymentsCLP: 0, totalFlights: 0, totalPassengers: 0 };

  const tabs = [
    { key: 'overview' as const, label: 'General', icon: Building2 },
    { key: 'users' as const, label: `Usuarios (${company.companyUsers?.length || 0})`, icon: Users },
    { key: 'documents' as const, label: `Documentos (${company.documents?.length || 0})`, icon: FileText },
    { key: 'timeline' as const, label: 'Historial', icon: Clock },
  ];

  return (
    <div className="!space-y-6 !animate-in !fade-in !slide-in-from-bottom-4 !duration-500">
      {/* Back + Header */}
      <div className="!flex !items-center !gap-4">
        <button
          onClick={() => navigate('/admin/empresas')}
          className="!p-2.5 !rounded-xl !bg-white !border !border-slate-200 !text-slate-600 hover:!bg-slate-50 !transition-all !shadow-sm"
        >
          <ArrowLeft className="!w-5 !h-5" />
        </button>
        <div className="!flex-1">
          <h2 className="!text-2xl !font-black !text-slate-900 !tracking-tight">
            {company.nombreComercial || company.razonSocial}
          </h2>
          <p className="!text-slate-500 !text-sm">{company.razonSocial}</p>
        </div>
        <div className={`!inline-flex !items-center !gap-2 !px-4 !py-2 !rounded-full !text-sm !font-bold !border ${sc.bgColor} ${sc.color} ${sc.borderColor}`}>
          <StatusIcon className="!w-4 !h-4" />
          {sc.label}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="!grid !grid-cols-2 md:!grid-cols-3 lg:!grid-cols-6 !gap-4">
        {[
          { label: 'Emisiones (ton)', value: metrics.totalEmissionsTons.toFixed(1), icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Compensadas (ton)', value: metrics.totalCompensatedTons.toFixed(1), icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Certificados', value: metrics.totalCertificates, icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Vuelos', value: metrics.totalFlights, icon: Plane, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Pasajeros', value: metrics.totalPassengers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Pagos (CLP)', value: `$${(metrics.totalPaymentsCLP || 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat, idx) => (
          <div key={idx} className="!bg-white !rounded-2xl !p-4 !border !border-slate-100 !shadow-sm">
            <div className={`!w-10 !h-10 !rounded-xl ${stat.bg} !flex !items-center !justify-center !mb-3`}>
              <stat.icon className={`!w-5 !h-5 ${stat.color}`} />
            </div>
            <p className="!text-xl !font-black !text-slate-900">{stat.value}</p>
            <p className="!text-xs !text-slate-500 !font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="!bg-white !rounded-3xl !border !border-slate-100 !shadow-sm !overflow-hidden">
        <div className="!flex !border-b !border-slate-100 !overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`!flex !items-center !gap-2 !px-6 !py-4 !text-sm !font-bold !whitespace-nowrap !transition-all !border-b-2 ${
                activeTab === tab.key
                  ? '!border-indigo-600 !text-indigo-700 !bg-indigo-50/50'
                  : '!border-transparent !text-slate-500 hover:!text-slate-700 hover:!bg-slate-50'
              }`}
            >
              <tab.icon className="!w-4 !h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="!p-6">
          {/* ═══ OVERVIEW TAB ═══ */}
          {activeTab === 'overview' && (
            <div className="!grid md:!grid-cols-2 !gap-6">
              {/* Company Info */}
              <div className="!space-y-5">
                <h3 className="!text-lg !font-black !text-slate-900">Información de Empresa</h3>
                <div className="!space-y-4">
                  {[
                    { icon: Building2, label: 'Razón Social', value: company.razonSocial },
                    { icon: Hash, label: 'RUT', value: company.rut || 'No registrado' },
                    { icon: Briefcase, label: 'Nombre Comercial', value: company.nombreComercial || '—' },
                    { icon: TrendingUp, label: 'Giro SII', value: company.giroSii || '—' },
                    { icon: Users, label: 'Tamaño', value: company.tamanoEmpresa || '—' },
                    { icon: MapPin, label: 'Dirección', value: company.direccion || '—' },
                    { icon: Phone, label: 'Teléfono', value: company.phone || '—' },
                    { icon: Globe, label: 'Slug Público', value: company.slugPublico || '—' },
                    { icon: Calendar, label: 'Registrada', value: new Date(company.createdAt).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }) },
                    { icon: RefreshCw, label: 'Última actualización', value: new Date(company.updatedAt).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  ].map((item, idx) => (
                    <div key={idx} className="!flex !items-start !gap-3">
                      <item.icon className="!w-4 !h-4 !text-slate-400 !mt-0.5 !flex-shrink-0" />
                      <div>
                        <p className="!text-xs !text-slate-400 !font-bold !uppercase">{item.label}</p>
                        <p className="!text-sm !text-slate-800 !font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions + Status Change */}
              <div className="!space-y-5">
                <h3 className="!text-lg !font-black !text-slate-900">Acciones</h3>

                {/* Status */}
                <div className={`!p-4 !rounded-2xl !border ${sc.borderColor} ${sc.bgColor}`}>
                  <div className="!flex !items-center !gap-3 !mb-2">
                    <StatusIcon className={`!w-5 !h-5 ${sc.color}`} />
                    <p className={`!font-bold ${sc.color}`}>Estado: {sc.label}</p>
                  </div>
                  <p className="!text-xs !text-slate-500">Transiciones permitidas: {allowedTransitions.map(s => statusConfig[s]?.label || s).join(', ') || 'Ninguna'}</p>
                </div>

                {/* Transition Buttons */}
                {allowedTransitions.length > 0 && (
                  <div className="!space-y-2">
                    <p className="!text-sm !font-bold !text-slate-700">Cambiar estado:</p>
                    <div className="!flex !flex-wrap !gap-2">
                      {allowedTransitions.map((status) => {
                        const tsc = statusConfig[status] || statusConfig.registered;
                        const TIcon = tsc.icon;
                        return (
                          <button
                            key={status}
                            onClick={() => { setNewStatus(status); setShowStatusModal(true); }}
                            className={`!flex !items-center !gap-2 !px-4 !py-2.5 !rounded-xl !text-sm !font-bold !border !transition-all hover:!shadow-md ${tsc.bgColor} ${tsc.color} ${tsc.borderColor}`}
                          >
                            <TIcon className="!w-4 !h-4" />
                            {tsc.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Settings */}
                {company.settings && (
                  <div className="!space-y-3">
                    <h4 className="!text-sm !font-bold !text-slate-700">Configuración</h4>
                    <div className="!bg-slate-50 !rounded-xl !p-4 !space-y-2">
                      <div className="!flex !justify-between !text-sm"><span className="!text-slate-500">Perfil público</span><span className="!font-bold !text-slate-800">{company.publicProfileOptIn ? 'Sí' : 'No'}</span></div>
                      <div className="!flex !justify-between !text-sm"><span className="!text-slate-500">Método de cálculo</span><span className="!font-bold !text-slate-800">{company.preferredCalculationMethod || 'Default'}</span></div>
                    </div>
                  </div>
                )}

                {/* Domains */}
                {company.domains && company.domains.length > 0 && (
                  <div className="!space-y-3">
                    <h4 className="!text-sm !font-bold !text-slate-700">Dominios</h4>
                    <div className="!space-y-2">
                      {company.domains.map((d: any) => (
                        <div key={d.id} className="!flex !items-center !justify-between !bg-slate-50 !rounded-xl !px-4 !py-3">
                          <div className="!flex !items-center !gap-2">
                            <Globe className="!w-4 !h-4 !text-slate-400" />
                            <span className="!text-sm !font-medium !text-slate-800">{d.domain}</span>
                          </div>
                          <span className={`!text-xs !font-bold !px-2 !py-1 !rounded-full ${d.verified ? '!bg-emerald-100 !text-emerald-700' : '!bg-amber-100 !text-amber-700'}`}>
                            {d.verified ? 'Verificado' : 'Pendiente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ USERS TAB ═══ */}
          {activeTab === 'users' && (
            <div className="!space-y-4">
              <h3 className="!text-lg !font-black !text-slate-900">Usuarios de la Empresa</h3>
              {company.companyUsers && company.companyUsers.length > 0 ? (
                <div className="!overflow-x-auto">
                  <table className="!w-full !text-left">
                    <thead>
                      <tr className="!border-b !border-slate-100">
                        <th className="!px-4 !py-3 !text-xs !font-black !text-slate-400 !uppercase">Usuario</th>
                        <th className="!px-4 !py-3 !text-xs !font-black !text-slate-400 !uppercase">Email</th>
                        <th className="!px-4 !py-3 !text-xs !font-black !text-slate-400 !uppercase">Roles</th>
                        <th className="!px-4 !py-3 !text-xs !font-black !text-slate-400 !uppercase">Admin</th>
                        <th className="!px-4 !py-3 !text-xs !font-black !text-slate-400 !uppercase">Estado</th>
                        <th className="!px-4 !py-3 !text-xs !font-black !text-slate-400 !uppercase">Último Login</th>
                      </tr>
                    </thead>
                    <tbody className="!divide-y !divide-slate-50">
                      {company.companyUsers.map((cu) => (
                        <tr key={cu.id} className="hover:!bg-slate-50/50 !transition-colors">
                          <td className="!px-4 !py-4">
                            <div className="!flex !items-center !gap-3">
                              <div className="!w-9 !h-9 !rounded-full !bg-indigo-100 !text-indigo-600 !flex !items-center !justify-center !font-bold !text-sm">
                                {(cu.user.name || cu.user.email).charAt(0).toUpperCase()}
                              </div>
                              <span className="!font-bold !text-slate-800 !text-sm">{cu.user.name || '—'}</span>
                            </div>
                          </td>
                          <td className="!px-4 !py-4 !text-sm !text-slate-600">{cu.user.email}</td>
                          <td className="!px-4 !py-4">
                            <div className="!flex !flex-wrap !gap-1">
                              {cu.roles.map((r, i) => (
                                <span key={i} className="!text-xs !bg-indigo-50 !text-indigo-700 !px-2 !py-0.5 !rounded-full !font-bold">{r.name}</span>
                              ))}
                            </div>
                          </td>
                          <td className="!px-4 !py-4">
                            {cu.isAdmin ? (
                              <span className="!text-xs !bg-purple-100 !text-purple-700 !px-2.5 !py-1 !rounded-full !font-bold">Admin</span>
                            ) : (
                              <span className="!text-xs !text-slate-400">—</span>
                            )}
                          </td>
                          <td className="!px-4 !py-4">
                            <span className={`!text-xs !font-bold !px-2.5 !py-1 !rounded-full ${cu.user.isActive ? '!bg-emerald-100 !text-emerald-700' : '!bg-rose-100 !text-rose-700'}`}>
                              {cu.user.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="!px-4 !py-4 !text-sm !text-slate-500">
                            {cu.user.lastLoginAt ? new Date(cu.user.lastLoginAt).toLocaleDateString('es-CL') : 'Nunca'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="!flex !flex-col !items-center !py-12 !gap-3">
                  <Users className="!w-12 !h-12 !text-slate-300" />
                  <p className="!text-slate-500 !font-medium">No hay usuarios registrados</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ DOCUMENTS TAB ═══ */}
          {activeTab === 'documents' && (
            <div className="!space-y-4">
              <h3 className="!text-lg !font-black !text-slate-900">Documentos</h3>
              {company.documents && company.documents.length > 0 ? (
                <div className="!grid md:!grid-cols-2 !gap-4">
                  {company.documents.map((doc) => (
                    <div key={doc.id} className="!bg-slate-50 !rounded-2xl !p-4 !border !border-slate-100 !flex !items-start !gap-4">
                      <div className="!w-11 !h-11 !rounded-xl !bg-indigo-100 !text-indigo-600 !flex !items-center !justify-center !flex-shrink-0">
                        <FileText className="!w-5 !h-5" />
                      </div>
                      <div className="!flex-1 !min-w-0">
                        <p className="!font-bold !text-slate-800 !text-sm !truncate">{doc.file?.fileName || doc.docType}</p>
                        <p className="!text-xs !text-slate-500">{doc.docType} — {new Date(doc.uploadedAt).toLocaleDateString('es-CL')}</p>
                        <span className={`!inline-block !mt-1 !text-xs !font-bold !px-2 !py-0.5 !rounded-full ${
                          doc.status === 'approved' ? '!bg-emerald-100 !text-emerald-700' :
                          doc.status === 'rejected' ? '!bg-rose-100 !text-rose-700' :
                          '!bg-amber-100 !text-amber-700'
                        }`}>
                          {doc.status === 'approved' ? 'Aprobado' : doc.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                        </span>
                      </div>
                      {doc.file?.sizeBytes && (
                        <span className="!text-xs !text-slate-400 !whitespace-nowrap">{(doc.file.sizeBytes / 1024).toFixed(0)} KB</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="!flex !flex-col !items-center !py-12 !gap-3">
                  <FileText className="!w-12 !h-12 !text-slate-300" />
                  <p className="!text-slate-500 !font-medium">No hay documentos cargados</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ TIMELINE TAB ═══ */}
          {activeTab === 'timeline' && (
            <div className="!space-y-4">
              <h3 className="!text-lg !font-black !text-slate-900">Historial de Cambios</h3>
              {timeline.length > 0 ? (
                <div className="!relative !pl-6">
                  {/* Vertical line */}
                  <div className="!absolute !left-[11px] !top-2 !bottom-2 !w-0.5 !bg-slate-200" />
                  <div className="!space-y-6">
                    {timeline.map((evt) => {
                      const toSc = statusConfig[evt.toStatus] || statusConfig.registered;
                      return (
                        <div key={evt.id} className="!relative !flex !gap-4">
                          <div className={`!absolute !-left-6 !top-1 !w-5 !h-5 !rounded-full !border-2 !border-white !shadow-sm ${toSc.bgColor} !flex !items-center !justify-center`}>
                            <div className={`!w-2 !h-2 !rounded-full ${statusConfig[evt.toStatus]?.color?.replace('text-', 'bg-') || 'bg-slate-400'}`} />
                          </div>
                          <div className="!bg-slate-50 !rounded-2xl !p-4 !border !border-slate-100 !flex-1">
                            <div className="!flex !items-center !gap-2 !mb-1">
                              <span className={`!text-xs !font-bold !px-2 !py-0.5 !rounded-full ${statusConfig[evt.fromStatus]?.bgColor || '!bg-slate-100'} ${statusConfig[evt.fromStatus]?.color || '!text-slate-600'}`}>
                                {statusConfig[evt.fromStatus]?.label || evt.fromStatus}
                              </span>
                              <ChevronRight className="!w-3 !h-3 !text-slate-400" />
                              <span className={`!text-xs !font-bold !px-2 !py-0.5 !rounded-full ${toSc.bgColor} ${toSc.color}`}>
                                {toSc.label}
                              </span>
                            </div>
                            {evt.note && <p className="!text-sm !text-slate-600 !mt-1">{evt.note}</p>}
                            <div className="!flex !items-center !gap-4 !mt-2 !text-xs !text-slate-400">
                              <span>{new Date(evt.createdAt).toLocaleString('es-CL')}</span>
                              {evt.changedBy && <span>por {evt.changedBy.name || evt.changedBy.email}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="!flex !flex-col !items-center !py-12 !gap-3">
                  <Clock className="!w-12 !h-12 !text-slate-300" />
                  <p className="!text-slate-500 !font-medium">Sin historial de cambios</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ Status Change Modal ═══ */}
      {showStatusModal && (
        <div className="!fixed !inset-0 !z-50 !flex !items-center !justify-center !bg-black/40 !backdrop-blur-sm" onClick={() => setShowStatusModal(false)}>
          <div className="!bg-white !rounded-3xl !shadow-2xl !p-8 !w-full !max-w-md !mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="!text-xl !font-black !text-slate-900 !mb-2">Cambiar Estado</h3>
            <p className="!text-sm !text-slate-500 !mb-6">
              ¿Cambiar <strong>{company.nombreComercial || company.razonSocial}</strong> de{' '}
              <span className={`!font-bold ${sc.color}`}>{sc.label}</span> a{' '}
              <span className={`!font-bold ${(statusConfig[newStatus] || statusConfig.registered).color}`}>{(statusConfig[newStatus] || statusConfig.registered).label}</span>?
            </p>

            <div className="!space-y-4">
              <div>
                <label className="!text-sm !font-bold !text-slate-700 !block !mb-1">Nota (opcional)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Motivo del cambio de estado..."
                  rows={3}
                  className="!w-full !bg-slate-50 !border !border-slate-200 !rounded-xl !px-4 !py-3 !text-sm !text-slate-900 !outline-none focus:!ring-2 focus:!ring-indigo-500 !resize-none"
                />
              </div>

              {newStatus === 'suspended' && (
                <div className="!bg-rose-50 !border !border-rose-200 !rounded-xl !p-3 !flex !items-start !gap-2">
                  <AlertTriangle className="!w-4 !h-4 !text-rose-500 !mt-0.5 !flex-shrink-0" />
                  <p className="!text-xs !text-rose-700">Suspender la empresa deshabilitará el acceso de todos sus usuarios y desactivará la compensación automática.</p>
                </div>
              )}

              <div className="!flex !gap-3 !pt-2">
                <button
                  onClick={() => { setShowStatusModal(false); setNewStatus(''); setStatusNote(''); }}
                  className="!flex-1 !bg-slate-100 !text-slate-700 !px-4 !py-3 !rounded-xl !font-bold !text-sm hover:!bg-slate-200 !transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={changingStatus}
                  className="!flex-1 !bg-indigo-600 !text-white !px-4 !py-3 !rounded-xl !font-bold !text-sm hover:!bg-indigo-700 !transition-all disabled:!opacity-50 !shadow-lg !shadow-indigo-200"
                >
                  {changingStatus ? 'Cambiando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
