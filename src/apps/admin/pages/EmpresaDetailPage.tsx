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
  TrendingUp,
  Download
} from 'lucide-react';
import {
  getCompanyDetail,
  updateCompanyStatus,
  getCompanyTimeline,
} from '../services/adminApi';

// ─── Status config ───
const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType; borderColor: string }> = {
  registered:        { label: 'Registrada',        color: 'text-slate-700 dark:text-slate-200',   bgColor: 'bg-slate-100 dark:bg-slate-700',   icon: Clock,       borderColor: 'border-slate-300 dark:border-slate-600' },
  pending_contract:  { label: 'Pendiente Contrato', color: 'text-amber-700 dark:text-amber-300',  bgColor: 'bg-amber-100 dark:bg-amber-500/10',   icon: FileText,    borderColor: 'border-amber-300 dark:border-amber-700' },
  signed:            { label: 'Contrato Firmado',   color: 'text-blue-700 dark:text-blue-300',   bgColor: 'bg-blue-100 dark:bg-blue-500/10',    icon: CheckCircle, borderColor: 'border-blue-300 dark:border-blue-700' },
  active:            { label: 'Activa',             color: 'text-emerald-700 dark:text-emerald-300', bgColor: 'bg-emerald-100 dark:bg-emerald-500/10', icon: CheckCircle, borderColor: 'border-emerald-300 dark:border-emerald-700' },
  suspended:         { label: 'Suspendida',         color: 'text-rose-700 dark:text-rose-300',   bgColor: 'bg-rose-100 dark:bg-rose-500/10',    icon: Pause,       borderColor: 'border-rose-300 dark:border-rose-700' },
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

export default function EmpresaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const industryLabels: Record<string, string> = {
    aerolineas: 'Aerolíneas y Aviación',
    maritimo: 'Transporte Marítimo',
    terrestre: 'Transporte Terrestre y Logística',
    mineria_energia: 'Minería y Energía',
    tecnologia: 'Tecnología y SaaS',
    retail: 'Retail y E-commerce',
    manufactura: 'Manufactura e Industria',
    construccion: 'Construcción e Inmobiliaria',
    hoteleria_turismo: 'Hotelería y Turismo',
    servicios_financieros: 'Servicios Financieros',
    salud: 'Salud y Farmacéutica',
    educacion: 'Educación',
    alimentacion: 'Alimentación y Agricultura',
    telecomunicaciones: 'Telecomunicaciones',
    gobierno: 'Gobierno y Sector Público',
    consultoria: 'Consultoría y Servicios Profesionales',
    otra: 'Otra',
  };

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
    } catch (err: any) {
      console.error('Error updating status:', err);
      const msg = err?.response?.data?.message || err?.message || 'Error al cambiar el estado. Verifica la transición sea válida.';
      alert(msg);
    } finally {
      setChangingStatus(false);
    }
  };

  // ─── Loading skeleton ───
  if (loading) {
    return (
      <div className="!space-y-6">
        <div className="!flex !items-center !gap-4">
          <div className="!w-10 !h-10 !rounded-xl bg-slate-200 dark:bg-slate-700 !animate-pulse" />
          <div className="!h-8 !w-64 bg-slate-200 dark:bg-slate-700 !rounded-xl !animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:!bg-slate-900 !rounded-3xl !p-8 !border border-slate-100 dark:border-slate-700">
            <div className="!h-6 !w-48 bg-slate-200 dark:bg-slate-700 !rounded-lg !animate-pulse !mb-4" />
            <div className="!space-y-3">
              <div className="!h-4 !w-full bg-slate-100 dark:bg-slate-800 !rounded !animate-pulse" />
              <div className="!h-4 !w-3/4 bg-slate-100 dark:bg-slate-800 !rounded !animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!company) {
    return (
      <div className="!flex !flex-col !items-center !justify-center !py-20 !gap-4">
        <Building2 className="!w-16 !h-16 text-slate-300 dark:text-slate-600" />
        <h3 className="!text-xl !font-bold text-slate-600 dark:text-slate-300">Empresa no encontrada</h3>
        <button onClick={() => navigate('/admin/empresas')} className="bg-indigo-600 dark:bg-indigo-500 text-white !px-6 !py-2.5 !rounded-xl !font-bold !text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 !transition-all">
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
          className="!p-2.5 !rounded-xl bg-white dark:!bg-slate-800 !border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 !transition-all !shadow-sm"
        >
          <ArrowLeft className="!w-5 !h-5" />
        </button>
        <div className="!flex-1">
          <h2 className="!text-2xl !font-black text-slate-900 dark:text-slate-100 !tracking-tight">
            {company.nombreComercial || company.razonSocial}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 !text-sm">{company.razonSocial}</p>
        </div>
        <div className={`!inline-flex !items-center !gap-2 !px-4 !py-2 !rounded-full !text-sm !font-bold !border ${sc.bgColor} ${sc.color} ${sc.borderColor}`}>
          <StatusIcon className="!w-4 !h-4" />
          {sc.label}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="!grid !grid-cols-2 md:!grid-cols-3 lg:!grid-cols-6 !gap-4">
        {[
          { label: 'Emisiones (ton)', value: metrics.totalEmissionsTons.toFixed(1), icon: BarChart3, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10' },
          { label: 'Compensadas (ton)', value: metrics.totalCompensatedTons.toFixed(1), icon: Leaf, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Certificados', value: metrics.totalCertificates, icon: Shield, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
          { label: 'Vuelos', value: metrics.totalFlights, icon: Plane, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
          { label: 'Pasajeros', value: metrics.totalPassengers, icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
          { label: 'Pagos (CLP)', value: `$${(metrics.totalPaymentsCLP || 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:!bg-slate-900 !rounded-2xl !p-4 !border border-slate-100 dark:border-slate-700 !shadow-sm">
            <div className={`!w-10 !h-10 !rounded-xl ${stat.bg} !flex !items-center !justify-center !mb-3`}>
              <stat.icon className={`!w-5 !h-5 ${stat.color}`} />
            </div>
            <p className="!text-xl !font-black text-slate-900 dark:text-slate-100">{stat.value}</p>
            <p className="!text-xs text-slate-500 dark:text-slate-400 !font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:!bg-slate-900 !rounded-3xl !border border-slate-100 dark:border-slate-700 !shadow-sm !overflow-hidden">
        <div className="!flex !border-b border-slate-100 dark:border-slate-700 !overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`!flex !items-center !gap-2 !px-6 !py-4 !text-sm !font-bold !whitespace-nowrap !transition-all !border-b-2 ${
                activeTab === tab.key
                  ? 'border-indigo-600 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-500/10'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                <h3 className="!text-lg !font-black text-slate-900 dark:text-slate-100">Información de Empresa</h3>
                <div className="!space-y-4">
                  {[
                    { icon: Building2, label: 'Razón Social', value: company.razonSocial },
                    { icon: Hash, label: 'RUT', value: company.rut || 'No registrado' },
                    { icon: Briefcase, label: 'Nombre Comercial', value: company.nombreComercial || '—' },
                    { icon: Globe, label: 'Industria', value: company.industry ? (industryLabels[company.industry] || company.industry) : '—' },
                    { icon: TrendingUp, label: 'Giro SII', value: company.giroSii || '—' },
                    { icon: Users, label: 'Tamaño', value: company.tamanoEmpresa || '—' },
                    { icon: MapPin, label: 'Dirección', value: company.direccion || '—' },
                    { icon: Phone, label: 'Teléfono', value: company.phone || '—' },
                    { icon: Globe, label: 'Slug Público', value: company.slugPublico || '—' },
                    { icon: Calendar, label: 'Registrada', value: new Date(company.createdAt).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }) },
                    { icon: RefreshCw, label: 'Última actualización', value: new Date(company.updatedAt).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  ].map((item, idx) => (
                    <div key={idx} className="!flex !items-start !gap-3">
                      <item.icon className="!w-4 !h-4 text-slate-400 dark:text-slate-500 !mt-0.5 !flex-shrink-0" />
                      <div>
                        <p className="!text-xs text-slate-400 dark:text-slate-500 !font-bold !uppercase">{item.label}</p>
                        <p className="!text-sm text-slate-800 dark:text-slate-200 !font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions + Status Change */}
              <div className="!space-y-5">
                <h3 className="!text-lg !font-black text-slate-900 dark:text-slate-100">Acciones</h3>

                {/* Documentation Status Banner */}
                <div className={`!p-4 !rounded-2xl !border ${
                  (company.documents && company.documents.length > 0)
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-800'
                }`}>
                  <div className="!flex !items-center !gap-3 !mb-1">
                    <FileText className={`!w-5 !h-5 ${(company.documents && company.documents.length > 0) ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
                    <p className={`!font-bold !text-sm ${(company.documents && company.documents.length > 0) ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                      Documentación: {company.documents?.length || 0} documento{(company.documents?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {(!company.documents || company.documents.length === 0) && (
                    <p className="!text-xs text-amber-600 dark:text-amber-400 !ml-8">
                      ⚠️ Sin documentos subidos. Se requiere documentación para avanzar a "Contrato Firmado" o "Activa".
                    </p>
                  )}
                  {company.documents && company.documents.length > 0 && (
                    <div className="!ml-8 !flex !flex-wrap !gap-2 !mt-1">
                      {company.documents.map((doc) => (
                        <span key={doc.id} className={`!text-xs !font-medium !px-2 !py-0.5 !rounded-full ${
                          doc.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' :
                          doc.status === 'rejected' ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300' :
                          'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300'
                        }`}>
                          {doc.docType} ({doc.status === 'approved' ? '✓' : doc.status === 'rejected' ? '✗' : '⏳'})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className={`!p-4 !rounded-2xl !border ${sc.borderColor} ${sc.bgColor}`}>
                  <div className="!flex !items-center !gap-3 !mb-2">
                    <StatusIcon className={`!w-5 !h-5 ${sc.color}`} />
                    <p className={`!font-bold ${sc.color}`}>Estado: {sc.label}</p>
                  </div>
                  <p className="!text-xs text-slate-500 dark:text-slate-400">Transiciones permitidas: {allowedTransitions.map(s => statusConfig[s]?.label || s).join(', ') || 'Ninguna'}</p>
                </div>

                {/* Transition Buttons */}
                {allowedTransitions.length > 0 && (
                  <div className="!space-y-2">
                    <p className="!text-sm !font-bold text-slate-700 dark:text-slate-200">Cambiar estado:</p>
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
                    <h4 className="!text-sm !font-bold text-slate-700 dark:text-slate-200">Configuración</h4>
                    <div className="bg-slate-50 dark:bg-slate-800 !rounded-xl !p-4 !space-y-2">
                      <div className="!flex !justify-between !text-sm"><span className="text-slate-500 dark:text-slate-400">Perfil público</span><span className="!font-bold text-slate-800 dark:text-slate-200">{company.publicProfileOptIn ? 'Sí' : 'No'}</span></div>
                      <div className="!flex !justify-between !text-sm"><span className="text-slate-500 dark:text-slate-400">Método de cálculo</span><span className="!font-bold text-slate-800 dark:text-slate-200">{company.preferredCalculationMethod || 'Default'}</span></div>
                    </div>
                  </div>
                )}

                {/* Domains */}
                {company.domains && company.domains.length > 0 && (
                  <div className="!space-y-3">
                    <h4 className="!text-sm !font-bold text-slate-700 dark:text-slate-200">Dominios</h4>
                    <div className="!space-y-2">
                      {company.domains.map((d: any) => (
                        <div key={d.id} className="!flex !items-center !justify-between bg-slate-50 dark:bg-slate-800 !rounded-xl !px-4 !py-3">
                          <div className="!flex !items-center !gap-2">
                            <Globe className="!w-4 !h-4 text-slate-400 dark:text-slate-500" />
                            <span className="!text-sm !font-medium text-slate-800 dark:text-slate-200">{d.domain}</span>
                          </div>
                          <span className={`!text-xs !font-bold !px-2 !py-1 !rounded-full ${d.verified ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
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
              <h3 className="!text-lg !font-black text-slate-900 dark:text-slate-100">Usuarios de la Empresa</h3>
              {company.companyUsers && company.companyUsers.length > 0 ? (
                <div className="!overflow-x-auto">
                  <table className="!w-full !text-left">
                    <thead>
                      <tr className="!border-b border-slate-100 dark:border-slate-700">
                        <th className="!px-4 !py-3 !text-xs !font-black text-slate-400 dark:text-slate-500 !uppercase">Usuario</th>
                        <th className="!px-4 !py-3 !text-xs !font-black text-slate-400 dark:text-slate-500 !uppercase">Email</th>
                        <th className="!px-4 !py-3 !text-xs !font-black text-slate-400 dark:text-slate-500 !uppercase">Roles</th>
                        <th className="!px-4 !py-3 !text-xs !font-black text-slate-400 dark:text-slate-500 !uppercase">Admin</th>
                        <th className="!px-4 !py-3 !text-xs !font-black text-slate-400 dark:text-slate-500 !uppercase">Estado</th>
                        <th className="!px-4 !py-3 !text-xs !font-black text-slate-400 dark:text-slate-500 !uppercase">Último Login</th>
                      </tr>
                    </thead>
                    <tbody className="!divide-y divide-slate-50 dark:divide-slate-800">
                      {company.companyUsers.map((cu) => (
                        <tr key={cu.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 !transition-colors">
                          <td className="!px-4 !py-4">
                            <div className="!flex !items-center !gap-3">
                              <div className="!w-9 !h-9 !rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 !flex !items-center !justify-center !font-bold !text-sm">
                                {(cu.user.name || cu.user.email).charAt(0).toUpperCase()}
                              </div>
                              <span className="!font-bold text-slate-800 dark:text-slate-200 !text-sm">{cu.user.name || '—'}</span>
                            </div>
                          </td>
                          <td className="!px-4 !py-4 !text-sm text-slate-600 dark:text-slate-300">{cu.user.email}</td>
                          <td className="!px-4 !py-4">
                            <div className="!flex !flex-wrap !gap-1">
                              {cu.roles.map((r, i) => (
                                <span key={i} className="!text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 !px-2 !py-0.5 !rounded-full !font-bold">{r.name}</span>
                              ))}
                            </div>
                          </td>
                          <td className="!px-4 !py-4">
                            {cu.isAdmin ? (
                              <span className="!text-xs bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 !px-2.5 !py-1 !rounded-full !font-bold">Admin</span>
                            ) : (
                              <span className="!text-xs text-slate-400 dark:text-slate-500">—</span>
                            )}
                          </td>
                          <td className="!px-4 !py-4">
                            <span className={`!text-xs !font-bold !px-2.5 !py-1 !rounded-full ${cu.user.isActive ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300'}`}>
                              {cu.user.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="!px-4 !py-4 !text-sm text-slate-500 dark:text-slate-400">
                            {cu.user.lastLoginAt ? new Date(cu.user.lastLoginAt).toLocaleDateString('es-CL') : 'Nunca'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="!flex !flex-col !items-center !py-12 !gap-3">
                  <Users className="!w-12 !h-12 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400 !font-medium">No hay usuarios registrados</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ DOCUMENTS TAB ═══ */}
          {activeTab === 'documents' && (
            <div className="!space-y-4">
              <h3 className="!text-lg !font-black text-slate-900 dark:text-slate-100">Documentos</h3>
              {company.documents && company.documents.length > 0 ? (
                <div className="!grid md:!grid-cols-2 !gap-4">
                  {company.documents.map((doc) => {
                    const docTypeNames: Record<string, string> = {
                      rut_empresa: 'RUT Empresa',
                      escritura_constitucion: 'Escritura de Constitución',
                      representante_legal: 'Cédula Representante Legal',
                      poder_notarial: 'Poder Notarial',
                      otro: 'Otro Documento',
                    };
                    const displayName = doc.file?.fileName && !doc.file.fileName.includes(company.id)
                      ? doc.file.fileName
                      : docTypeNames[doc.docType] || doc.docType;
                    const isPdf = doc.file?.mimeType === 'application/pdf';

                    return (
                      <div key={doc.id} className="bg-slate-50 dark:bg-slate-800 !rounded-2xl !p-4 !border border-slate-100 dark:border-slate-700 !flex !items-start !gap-4">
                        <div className={`!w-11 !h-11 !rounded-xl !flex !items-center !justify-center !flex-shrink-0 ${
                          isPdf ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        }`}>
                          <FileText className="!w-5 !h-5" />
                        </div>
                        <div className="!flex-1 !min-w-0">
                          <p className="!font-bold text-slate-800 dark:text-slate-200 !text-sm !truncate" title={doc.file?.fileName}>{displayName}</p>
                          <p className="!text-xs text-slate-500 dark:text-slate-400">{docTypeNames[doc.docType] || doc.docType} — {new Date(doc.uploadedAt).toLocaleDateString('es-CL')}</p>
                          <div className="!flex !items-center !gap-2 !mt-1">
                            <span className={`!inline-block !text-xs !font-bold !px-2 !py-0.5 !rounded-full ${
                              doc.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' :
                              doc.status === 'rejected' ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300' :
                              'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300'
                            }`}>
                              {doc.status === 'approved' ? 'Aprobado' : doc.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                            </span>
                            {doc.file?.sizeBytes && (
                              <span className="!text-xs text-slate-400 dark:text-slate-500">{(doc.file.sizeBytes / 1024).toFixed(0)} KB</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('access_token');
                              const baseURL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3001/api';
                              const resp = await fetch(`${baseURL}/admin/companies/${company.id}/documents/${doc.id}/download`, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              if (!resp.ok) throw new Error('Error al descargar');
                              const blob = await resp.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = displayName;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              window.URL.revokeObjectURL(url);
                            } catch {
                              alert('No se pudo descargar el documento');
                            }
                          }}
                          className="!p-2.5 !rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white dark:hover:text-white !transition-all !flex-shrink-0"
                          title="Descargar documento"
                        >
                          <Download className="!w-4 !h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="!flex !flex-col !items-center !py-12 !gap-3">
                  <FileText className="!w-12 !h-12 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400 !font-medium">No hay documentos cargados</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ TIMELINE TAB ═══ */}
          {activeTab === 'timeline' && (
            <div className="!space-y-4">
              <h3 className="!text-lg !font-black text-slate-900 dark:text-slate-100">Historial de Cambios</h3>
              {timeline.length > 0 ? (
                <div className="!relative !pl-6">
                  {/* Vertical line */}
                  <div className="!absolute !left-[11px] !top-2 !bottom-2 !w-0.5 bg-slate-200 dark:bg-slate-700" />
                  <div className="!space-y-6">
                    {timeline.map((evt) => {
                      const toSc = statusConfig[evt.toStatus] || statusConfig.registered;
                      return (
                        <div key={evt.id} className="!relative !flex !gap-4">
                          <div className={`!absolute !-left-6 !top-1 !w-5 !h-5 !rounded-full !border-2 border-white dark:!border-slate-900 !shadow-sm ${toSc.bgColor} !flex !items-center !justify-center`}>
                            <div className={`!w-2 !h-2 !rounded-full ${statusConfig[evt.toStatus]?.color?.replace('text-', 'bg-').replace(/\s*dark:text-\S+/, '') || 'bg-slate-400'}`} />
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 !rounded-2xl !p-4 !border border-slate-100 dark:border-slate-700 !flex-1">
                            <div className="!flex !items-center !gap-2 !mb-1">
                              <span className={`!text-xs !font-bold !px-2 !py-0.5 !rounded-full ${statusConfig[evt.fromStatus]?.bgColor || 'bg-slate-100 dark:bg-slate-700'} ${statusConfig[evt.fromStatus]?.color || 'text-slate-600 dark:text-slate-300'}`}>
                                {statusConfig[evt.fromStatus]?.label || evt.fromStatus}
                              </span>
                              <ChevronRight className="!w-3 !h-3 text-slate-400 dark:text-slate-500" />
                              <span className={`!text-xs !font-bold !px-2 !py-0.5 !rounded-full ${toSc.bgColor} ${toSc.color}`}>
                                {toSc.label}
                              </span>
                            </div>
                            {evt.note && <p className="!text-sm text-slate-600 dark:text-slate-300 !mt-1">{evt.note}</p>}
                            <div className="!flex !items-center !gap-4 !mt-2 !text-xs text-slate-400 dark:text-slate-500">
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
                  <Clock className="!w-12 !h-12 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400 !font-medium">Sin historial de cambios</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ Status Change Modal ═══ */}
      {showStatusModal && (
        <div className="!fixed !inset-0 !z-50 !flex !items-center !justify-center !bg-black/40 !backdrop-blur-sm" onClick={() => setShowStatusModal(false)}>
          <div className="bg-white dark:!bg-slate-900 !rounded-3xl !shadow-2xl !p-8 !w-full !max-w-md !mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="!text-xl !font-black text-slate-900 dark:text-slate-100 !mb-2">Cambiar Estado</h3>
            <p className="!text-sm text-slate-500 dark:text-slate-400 !mb-6">
              ¿Cambiar <strong>{company.nombreComercial || company.razonSocial}</strong> de{' '}
              <span className={`!font-bold ${sc.color}`}>{sc.label}</span> a{' '}
              <span className={`!font-bold ${(statusConfig[newStatus] || statusConfig.registered).color}`}>{(statusConfig[newStatus] || statusConfig.registered).label}</span>?
            </p>

            <div className="!space-y-4">
              <div>
                <label className="!text-sm !font-bold text-slate-700 dark:text-slate-200 !block !mb-1">Nota (opcional)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Motivo del cambio de estado..."
                  rows={3}
                  className="!w-full bg-slate-50 dark:bg-slate-800 !border border-slate-200 dark:border-slate-700 !rounded-xl !px-4 !py-3 !text-sm text-slate-900 dark:text-slate-100 !outline-none focus:!ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 !resize-none"
                />
              </div>

              {newStatus === 'suspended' && (
                <div className="bg-rose-50 dark:bg-rose-500/10 !border border-rose-200 dark:border-rose-800 !rounded-xl !p-3 !flex !items-start !gap-2">
                  <AlertTriangle className="!w-4 !h-4 text-rose-500 dark:text-rose-400 !mt-0.5 !flex-shrink-0" />
                  <p className="!text-xs text-rose-700 dark:text-rose-300">Suspender la empresa deshabilitará el acceso de todos sus usuarios y desactivará la compensación automática.</p>
                </div>
              )}

              {['signed', 'active'].includes(newStatus) && (!company.documents || company.documents.length === 0) && (
                <div className="bg-amber-50 dark:bg-amber-500/10 !border border-amber-200 dark:border-amber-800 !rounded-xl !p-3 !flex !items-start !gap-2">
                  <AlertTriangle className="!w-4 !h-4 text-amber-500 dark:text-amber-400 !mt-0.5 !flex-shrink-0" />
                  <p className="!text-xs text-amber-700 dark:text-amber-300">
                    <strong>Atención:</strong> Esta empresa no tiene documentos subidos. El backend rechazará esta transición hasta que la documentación requerida esté completa.
                  </p>
                </div>
              )}

              <div className="!flex !gap-3 !pt-2">
                <button
                  onClick={() => { setShowStatusModal(false); setNewStatus(''); setStatusNote(''); }}
                  className="!flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 !px-4 !py-3 !rounded-xl !font-bold !text-sm hover:bg-slate-200 dark:hover:bg-slate-700 !transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={changingStatus}
                  className="!flex-1 bg-indigo-600 dark:bg-indigo-500 text-white !px-4 !py-3 !rounded-xl !font-bold !text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 !transition-all disabled:!opacity-50 !shadow-lg !shadow-indigo-200 dark:!shadow-indigo-900/40"
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
