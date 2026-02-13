import { useState, useEffect } from 'react';
import {
  Shield,
  Building2,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Inbox,
  RefreshCw,
  Eye
} from 'lucide-react';
import {
  getPendingVerifications,
  getVerificationStats,
  getCompanyDocuments,
  getCompanyDetail,
  updateCompanyStatus,
  reviewCompanyDocument,
  verifyDomain
} from '../services/adminApi';

interface PendingCompany {
  id: string;
  razonSocial: string;
  rut: string;
  status: string;
  createdAt: string;
  domainsCount: number;
  verifiedDomains: number;
  documentsCount: number;
  usersCount: number;
  waitingDays: number;
}

interface PendingDomain {
  id: string;
  domain: string;
  createdAt: string;
  waitingDays: number;
  company: {
    id: string;
    razonSocial: string;
    rut: string;
    status: string;
  };
}

interface CompanyDoc {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl?: string;
  status: string;
  uploadedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

interface VerifStats {
  companies: { total: number; pendingVerification: number; verified: number };
  domains: { pending: number; verified: number; total: number };
  metrics: { conversionRate: number; domainVerificationRate: number; pendingWorkload: number };
}

const VerificationPanel = () => {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<PendingCompany[]>([]);
  const [domains, setDomains] = useState<PendingDomain[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [stats, setStats] = useState<VerifStats | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [companyDocs, setCompanyDocs] = useState<CompanyDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'companies' | 'domains'>('companies');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pendingRes, statsRes] = await Promise.allSettled([
        getPendingVerifications(),
        getVerificationStats()
      ]);

      if (pendingRes.status === 'fulfilled') {
        const d = pendingRes.value;
        setCompanies(d?.companies || []);
        setDomains(d?.domains || []);
        setSummary(d?.summary || pendingRes.value);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
    } catch (e: any) {
      setError(e.message || 'Error al cargar datos de verificacion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSelectCompany = async (company: PendingCompany) => {
    setLoadingDocs(true);
    try {
      const [detailRes, docsRes] = await Promise.allSettled([
        getCompanyDetail(company.id),
        getCompanyDocuments(company.id)
      ]);
      const detail = detailRes.status === 'fulfilled' ? detailRes.value : company;
      const docs = docsRes.status === 'fulfilled' ? (Array.isArray(docsRes.value) ? docsRes.value : docsRes.value?.documents || []) : [];
      setSelectedCompany({ ...company, ...detail });
      setCompanyDocs(docs);
    } catch {
      setSelectedCompany(company);
      setCompanyDocs([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleApproveCompany = async (id: string) => {
    const note = prompt('Nota de aprobacion (opcional):');
    setActionLoading(`approve-${id}`);
    try {
      await updateCompanyStatus(id, 'pending_contract', note || undefined);
      setSelectedCompany(null);
      await loadData();
    } catch (e: any) {
      alert(`Error: ${e.message || 'No se pudo aprobar'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectCompany = async (id: string) => {
    const reason = prompt('Razon del rechazo:');
    if (!reason) return;
    setActionLoading(`reject-${id}`);
    try {
      await updateCompanyStatus(id, 'suspended', reason);
      setSelectedCompany(null);
      await loadData();
    } catch (e: any) {
      alert(`Error: ${e.message || 'No se pudo rechazar'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReviewDoc = async (docId: string, status: 'approved' | 'rejected') => {
    const notes = status === 'rejected' ? prompt('Razon del rechazo del documento:') : undefined;
    if (status === 'rejected' && !notes) return;
    setActionLoading(`doc-${docId}`);
    try {
      await reviewCompanyDocument(selectedCompany.id, docId, status, notes || undefined);
      const docs = await getCompanyDocuments(selectedCompany.id);
      setCompanyDocs(Array.isArray(docs) ? docs : docs?.documents || []);
    } catch (e: any) {
      alert(`Error: ${e.message || 'No se pudo revisar el documento'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyDomain = async (domainId: string, approve: boolean) => {
    const note = !approve ? prompt('Razon del rechazo:') : undefined;
    if (!approve && !note) return;
    setActionLoading(`domain-${domainId}`);
    try {
      await verifyDomain(domainId, approve, note || undefined);
      await loadData();
    } catch (e: any) {
      alert(`Error: ${e.message || 'No se pudo verificar el dominio'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      registered: '!bg-blue-100 !text-blue-700',
      pending_contract: '!bg-amber-100 !text-amber-700',
      signed: '!bg-indigo-100 !text-indigo-700',
      active: '!bg-emerald-100 !text-emerald-700',
      suspended: '!bg-red-100 !text-red-700',
      approved: '!bg-emerald-100 !text-emerald-700',
      rejected: '!bg-red-100 !text-red-700',
      pending: '!bg-amber-100 !text-amber-700',
    };
    return (
      <span className={`!inline-flex !items-center !px-3 !py-1 !rounded-full !text-[10px] !font-black !uppercase !tracking-wider ${map[status] || '!bg-slate-100 !text-slate-700'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="!flex !items-center !justify-center !h-64">
        <Loader2 className="!w-8 !h-8 !text-emerald-600 !animate-spin" />
        <span className="!ml-3 !text-slate-500 !font-medium">Cargando verificaciones...</span>
      </div>
    );
  }

  // Company Detail View
  if (selectedCompany) {
    return (
      <div className="!space-y-6 !animate-in !fade-in !duration-500">
        <button onClick={() => setSelectedCompany(null)} className="!flex !items-center !gap-2 !text-slate-600 hover:!text-emerald-600 !font-bold !transition-colors">
          <ArrowLeft className="!w-5 !h-5" /> Volver a la lista
        </button>

        {/* Company Header */}
        <div className="!bg-white !rounded-3xl !shadow-sm !border !border-slate-100 !p-8">
          <div className="!flex !items-start !justify-between !flex-wrap !gap-4">
            <div>
              <h2 className="!text-2xl !font-black !text-slate-900">{selectedCompany.razonSocial || selectedCompany.companyName}</h2>
              <p className="!text-slate-500 !font-medium !mt-1">RUT: {selectedCompany.rut || '-'}</p>
              <div className="!flex !items-center !gap-3 !mt-3">
                {statusBadge(selectedCompany.status)}
                <span className="!text-slate-400 !text-sm">
                  <Clock className="!w-3.5 !h-3.5 !inline !mr-1" />
                  {selectedCompany.waitingDays || 0} dias esperando
                </span>
              </div>
            </div>
            <div className="!flex !gap-3">
              <button
                onClick={() => handleRejectCompany(selectedCompany.id)}
                disabled={actionLoading !== null}
                className="!px-5 !py-2.5 !rounded-2xl !bg-red-50 !text-red-600 !font-bold !text-sm hover:!bg-red-100 !transition-colors disabled:!opacity-50"
              >
                {actionLoading === `reject-${selectedCompany.id}` ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : <><XCircle className="!w-4 !h-4 !inline !mr-1" /> Rechazar</>}
              </button>
              <button
                onClick={() => handleApproveCompany(selectedCompany.id)}
                disabled={actionLoading !== null}
                className="!px-5 !py-2.5 !rounded-2xl !bg-emerald-600 !text-white !font-bold !text-sm hover:!bg-emerald-700 !transition-colors disabled:!opacity-50"
              >
                {actionLoading === `approve-${selectedCompany.id}` ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : <><CheckCircle2 className="!w-4 !h-4 !inline !mr-1" /> Aprobar</>}
              </button>
            </div>
          </div>

          {/* Company Info Grid */}
          <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-4 !mt-6">
            <div className="!bg-slate-50 !rounded-2xl !p-4">
              <p className="!text-slate-400 !text-xs !font-bold !uppercase">Dominios</p>
              <p className="!text-xl !font-black !text-slate-900">{selectedCompany.domainsCount || 0}</p>
              <p className="!text-emerald-600 !text-xs !font-bold">{selectedCompany.verifiedDomains || 0} verificados</p>
            </div>
            <div className="!bg-slate-50 !rounded-2xl !p-4">
              <p className="!text-slate-400 !text-xs !font-bold !uppercase">Documentos</p>
              <p className="!text-xl !font-black !text-slate-900">{selectedCompany.documentsCount || 0}</p>
            </div>
            <div className="!bg-slate-50 !rounded-2xl !p-4">
              <p className="!text-slate-400 !text-xs !font-bold !uppercase">Usuarios</p>
              <p className="!text-xl !font-black !text-slate-900">{selectedCompany.usersCount || 0}</p>
            </div>
            <div className="!bg-slate-50 !rounded-2xl !p-4">
              <p className="!text-slate-400 !text-xs !font-bold !uppercase">Registro</p>
              <p className="!text-sm !font-bold !text-slate-900">{selectedCompany.createdAt ? new Date(selectedCompany.createdAt).toLocaleDateString('es-CL') : '-'}</p>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="!bg-white !rounded-3xl !shadow-sm !border !border-slate-100 !overflow-hidden">
          <div className="!p-6 !border-b !border-slate-100 !bg-slate-50/50">
            <h3 className="!text-lg !font-black !text-slate-900">Documentos de la Empresa</h3>
            <p className="!text-slate-500 !text-sm !font-medium">Revisa y aprueba cada documento necesario.</p>
          </div>
          {loadingDocs ? (
            <div className="!flex !items-center !justify-center !py-12">
              <Loader2 className="!w-6 !h-6 !text-emerald-600 !animate-spin" />
            </div>
          ) : companyDocs.length === 0 ? (
            <div className="!flex !flex-col !items-center !justify-center !py-12 !text-slate-400">
              <Inbox className="!w-12 !h-12 !mb-3" />
              <p className="!font-medium">Sin documentos cargados</p>
            </div>
          ) : (
            <div className="!divide-y !divide-slate-100">
              {companyDocs.map((doc) => (
                <div key={doc.id} className="!p-5 !flex !items-center !justify-between hover:!bg-slate-50/50 !transition-colors !flex-wrap !gap-3">
                  <div className="!flex !items-center !gap-4">
                    <div className="!w-10 !h-10 !bg-blue-100 !rounded-xl !flex !items-center !justify-center">
                      <FileText className="!w-5 !h-5 !text-blue-600" />
                    </div>
                    <div>
                      <p className="!font-bold !text-slate-900">{doc.fileName || doc.fileType || 'Documento'}</p>
                      <p className="!text-xs !text-slate-400">
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('es-CL') : '-'}
                        {doc.fileType && ` - ${doc.fileType}`}
                      </p>
                    </div>
                  </div>
                  <div className="!flex !items-center !gap-3">
                    {statusBadge(doc.status)}
                    {doc.fileUrl && (
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="!p-2 !text-slate-400 hover:!text-blue-600 !transition-colors">
                        <Eye className="!w-4 !h-4" />
                      </a>
                    )}
                    {doc.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleReviewDoc(doc.id, 'rejected')}
                          disabled={actionLoading === `doc-${doc.id}`}
                          className="!px-3 !py-1.5 !rounded-xl !bg-red-50 !text-red-600 !text-xs !font-bold hover:!bg-red-100 !transition-colors disabled:!opacity-50"
                        >
                          Rechazar
                        </button>
                        <button
                          onClick={() => handleReviewDoc(doc.id, 'approved')}
                          disabled={actionLoading === `doc-${doc.id}`}
                          className="!px-3 !py-1.5 !rounded-xl !bg-emerald-50 !text-emerald-600 !text-xs !font-bold hover:!bg-emerald-100 !transition-colors disabled:!opacity-50"
                        >
                          {actionLoading === `doc-${doc.id}` ? <Loader2 className="!w-3 !h-3 !animate-spin" /> : 'Aprobar'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main List View
  return (
    <div className="!space-y-8 !animate-in !fade-in !duration-700">
      {/* Header */}
      <div className="!flex !flex-col md:!flex-row md:!items-center !justify-between !gap-4">
        <div>
          <h1 className="!text-4xl !font-black !text-slate-900 !tracking-tight !mb-2">
            Panel de <span className="!text-emerald-600">Verificacion</span>
          </h1>
          <p className="!text-slate-500 !font-medium">Revisa y valida empresas y dominios pendientes.</p>
        </div>
        <button onClick={loadData} className="!flex !items-center !gap-2 !px-4 !py-2 !bg-white !rounded-2xl !shadow-sm !border !border-slate-100 !text-slate-600 hover:!text-emerald-600 !font-bold !text-sm !transition-colors">
          <RefreshCw className="!w-4 !h-4" /> Actualizar
        </button>
      </div>

      {error && (
        <div className="!bg-red-50 !border !border-red-200 !rounded-2xl !p-4 !text-red-700 !font-medium !text-sm">
          <AlertTriangle className="!w-4 !h-4 !inline !mr-2" />{error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 !gap-6">
        <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 !relative !overflow-hidden">
          <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-amber-50 !rounded-bl-full !-mr-8 !-mt-8" />
          <div className="!relative">
            <div className="!w-12 !h-12 !bg-amber-100 !rounded-2xl !flex !items-center !justify-center !mb-4">
              <Clock className="!w-6 !h-6 !text-amber-600" />
            </div>
            <p className="!text-slate-500 !text-sm !font-bold !uppercase !tracking-wider">Pendientes</p>
            <h3 className="!text-3xl !font-black !text-slate-900 !mt-1">{stats?.metrics?.pendingWorkload ?? companies.length}</h3>
          </div>
        </div>
        <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 !relative !overflow-hidden">
          <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-emerald-50 !rounded-bl-full !-mr-8 !-mt-8" />
          <div className="!relative">
            <div className="!w-12 !h-12 !bg-emerald-100 !rounded-2xl !flex !items-center !justify-center !mb-4">
              <CheckCircle2 className="!w-6 !h-6 !text-emerald-600" />
            </div>
            <p className="!text-slate-500 !text-sm !font-bold !uppercase !tracking-wider">Verificadas</p>
            <h3 className="!text-3xl !font-black !text-slate-900 !mt-1">{stats?.companies?.verified ?? 0}</h3>
          </div>
        </div>
        <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 !relative !overflow-hidden">
          <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-blue-50 !rounded-bl-full !-mr-8 !-mt-8" />
          <div className="!relative">
            <div className="!w-12 !h-12 !bg-blue-100 !rounded-2xl !flex !items-center !justify-center !mb-4">
              <Globe className="!w-6 !h-6 !text-blue-600" />
            </div>
            <p className="!text-slate-500 !text-sm !font-bold !uppercase !tracking-wider">Dominios Pendientes</p>
            <h3 className="!text-3xl !font-black !text-slate-900 !mt-1">{stats?.domains?.pending ?? domains.length}</h3>
          </div>
        </div>
        <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100 !relative !overflow-hidden">
          <div className="!absolute !top-0 !right-0 !w-24 !h-24 !bg-indigo-50 !rounded-bl-full !-mr-8 !-mt-8" />
          <div className="!relative">
            <div className="!w-12 !h-12 !bg-indigo-100 !rounded-2xl !flex !items-center !justify-center !mb-4">
              <Shield className="!w-6 !h-6 !text-indigo-600" />
            </div>
            <p className="!text-slate-500 !text-sm !font-bold !uppercase !tracking-wider">Tasa Conversion</p>
            <h3 className="!text-3xl !font-black !text-slate-900 !mt-1">{stats?.metrics?.conversionRate ?? 0}%</h3>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="!flex !items-center !gap-2 !bg-white !p-1.5 !rounded-2xl !shadow-sm !border !border-slate-100 !w-fit">
        <button
          onClick={() => setTab('companies')}
          className={`!px-5 !py-2 !rounded-xl !text-sm !font-bold !transition-all ${tab === 'companies' ? '!bg-emerald-600 !text-white !shadow-sm' : '!text-slate-500 hover:!text-slate-700'}`}
        >
          <Building2 className="!w-4 !h-4 !inline !mr-1.5" />
          Empresas ({companies.length})
        </button>
        <button
          onClick={() => setTab('domains')}
          className={`!px-5 !py-2 !rounded-xl !text-sm !font-bold !transition-all ${tab === 'domains' ? '!bg-emerald-600 !text-white !shadow-sm' : '!text-slate-500 hover:!text-slate-700'}`}
        >
          <Globe className="!w-4 !h-4 !inline !mr-1.5" />
          Dominios ({domains.length})
        </button>
      </div>

      {/* Companies Tab */}
      {tab === 'companies' && (
        <div className="!bg-white !rounded-3xl !shadow-sm !border !border-slate-100 !overflow-hidden">
          {companies.length === 0 ? (
            <div className="!flex !flex-col !items-center !justify-center !py-16 !text-slate-400">
              <Inbox className="!w-16 !h-16 !mb-4" />
              <p className="!text-lg !font-bold">Sin empresas pendientes</p>
              <p className="!text-sm">Todas las empresas han sido revisadas.</p>
            </div>
          ) : (
            <div className="!divide-y !divide-slate-100">
              {companies.map((company) => (
                <div
                  key={company.id}
                  onClick={() => handleSelectCompany(company)}
                  className="!p-6 !flex !items-center !justify-between !cursor-pointer hover:!bg-slate-50/50 !transition-colors !group"
                >
                  <div className="!flex !items-center !gap-4">
                    <div className="!w-12 !h-12 !bg-gradient-to-br !from-emerald-100 !to-blue-100 !rounded-2xl !flex !items-center !justify-center">
                      <Building2 className="!w-6 !h-6 !text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="!font-bold !text-slate-900 group-hover:!text-emerald-600 !transition-colors">{company.razonSocial}</h4>
                      <p className="!text-sm !text-slate-500">RUT: {company.rut} - {company.documentsCount} docs - {company.usersCount} usuarios</p>
                    </div>
                  </div>
                  <div className="!flex !items-center !gap-4">
                    {company.waitingDays > 7 && (
                      <span className="!flex !items-center !gap-1 !text-xs !font-bold !text-red-500">
                        <AlertTriangle className="!w-3.5 !h-3.5" /> Urgente
                      </span>
                    )}
                    <span className="!text-xs !text-slate-400 !font-medium">
                      <Clock className="!w-3.5 !h-3.5 !inline !mr-1" />
                      {company.waitingDays}d
                    </span>
                    {statusBadge(company.status)}
                    <ChevronRight className="!w-5 !h-5 !text-slate-300 group-hover:!text-emerald-500 !transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Domains Tab */}
      {tab === 'domains' && (
        <div className="!bg-white !rounded-3xl !shadow-sm !border !border-slate-100 !overflow-hidden">
          {domains.length === 0 ? (
            <div className="!flex !flex-col !items-center !justify-center !py-16 !text-slate-400">
              <Inbox className="!w-16 !h-16 !mb-4" />
              <p className="!text-lg !font-bold">Sin dominios pendientes</p>
              <p className="!text-sm">Todos los dominios han sido verificados.</p>
            </div>
          ) : (
            <div className="!divide-y !divide-slate-100">
              {domains.map((d) => (
                <div key={d.id} className="!p-6 !flex !items-center !justify-between">
                  <div className="!flex !items-center !gap-4">
                    <div className="!w-10 !h-10 !bg-blue-100 !rounded-xl !flex !items-center !justify-center">
                      <Globe className="!w-5 !h-5 !text-blue-600" />
                    </div>
                    <div>
                      <p className="!font-bold !text-slate-900">{d.domain}</p>
                      <p className="!text-sm !text-slate-500">
                        {d.company.razonSocial} - {d.waitingDays}d esperando
                      </p>
                    </div>
                  </div>
                  <div className="!flex !items-center !gap-3">
                    {d.waitingDays > 3 && (
                      <span className="!flex !items-center !gap-1 !text-xs !font-bold !text-red-500">
                        <AlertTriangle className="!w-3.5 !h-3.5" />
                      </span>
                    )}
                    <button
                      onClick={() => handleVerifyDomain(d.id, false)}
                      disabled={actionLoading === `domain-${d.id}`}
                      className="!px-3 !py-1.5 !rounded-xl !bg-red-50 !text-red-600 !text-xs !font-bold hover:!bg-red-100 !transition-colors disabled:!opacity-50"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleVerifyDomain(d.id, true)}
                      disabled={actionLoading === `domain-${d.id}`}
                      className="!px-3 !py-1.5 !rounded-xl !bg-emerald-50 !text-emerald-600 !text-xs !font-bold hover:!bg-emerald-100 !transition-colors disabled:!opacity-50"
                    >
                      {actionLoading === `domain-${d.id}` ? <Loader2 className="!w-3 !h-3 !animate-spin" /> : 'Verificar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationPanel;
