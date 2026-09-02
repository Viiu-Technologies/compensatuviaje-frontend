import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  Eye,
  CheckCircle,
  Clock,
  MoreVertical,
  FileText,
  Pause,
  Play,
  AlertTriangle,
  X
} from 'lucide-react';
import { getCompanies, Company, updateCompanyStatus } from '../services/adminApi';

const industryLabels: Record<string, string> = {
  aerolineas: 'Aerolíneas',
  maritimo: 'Transporte Marítimo',
  terrestre: 'Transporte Terrestre',
  mineria_energia: 'Minería y Energía',
  tecnologia: 'Tecnología',
  retail: 'Retail',
  manufactura: 'Manufactura',
  construccion: 'Construcción',
  hoteleria_turismo: 'Hotelería y Turismo',
  servicios_financieros: 'Servicios Financieros',
  salud: 'Salud',
  educacion: 'Educación',
  alimentacion: 'Alimentación',
  telecomunicaciones: 'Telecomunicaciones',
  gobierno: 'Gobierno',
  consultoria: 'Consultoría',
  otra: 'Otra',
};

const statusConfig: Record<string, { label: string; color: string; bgColor: string; dot: string }> = {
  registered:        { label: 'Registrada',          color: 'text-slate-700 dark:text-slate-200',   bgColor: 'bg-slate-100 dark:bg-slate-500/10',   dot: 'bg-slate-400' },
  pending_contract:  { label: 'Pendiente Contrato',  color: 'text-amber-700 dark:text-amber-300',   bgColor: 'bg-amber-100 dark:bg-amber-500/10',   dot: 'bg-amber-500' },
  signed:            { label: 'Contrato Firmado',     color: 'text-blue-700 dark:text-blue-300',    bgColor: 'bg-blue-100 dark:bg-blue-500/10',    dot: 'bg-blue-500' },
  active:            { label: 'Activa',               color: 'text-emerald-700 dark:text-emerald-300', bgColor: 'bg-emerald-100 dark:bg-emerald-500/10', dot: 'bg-emerald-500' },
  suspended:         { label: 'Suspendida',           color: 'text-rose-700 dark:text-rose-300',    bgColor: 'bg-rose-100 dark:bg-rose-500/10',    dot: 'bg-rose-500' },
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  registered:       ['pending_contract', 'suspended'],
  pending_contract: ['signed', 'registered', 'suspended'],
  signed:           ['active', 'suspended'],
  active:           ['suspended'],
  suspended:        ['active'],
};

export default function EmpresasPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [sortBy] = useState('createdAt');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');

  // Dropdown & modal
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Close dropdown on scroll so it doesn't float away from button
  useEffect(() => {
    if (!openDropdown) return;
    const close = () => setOpenDropdown(null);
    window.addEventListener('scroll', close, true);
    return () => window.removeEventListener('scroll', close, true);
  }, [openDropdown]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [changingStatus, setChangingStatus] = useState(false);

  useEffect(() => { loadCompanies(); }, [searchParams, sortBy, sortOrder]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const params = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: 20,
        search: searchParams.get('search') || undefined,
        status: searchParams.get('status') || undefined,
        sortBy,
        sortOrder
      };
      const data = await getCompanies(params);
      setCompanies(data.companies || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) { params.set('search', search); } else { params.delete('search'); }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status) { params.set('status', status); } else { params.delete('status'); }
    params.set('page', '1');
    setSearchParams(params);
    setStatusFilter(status);
  };

  const openStatusChangeModal = (company: Company, toStatus: string) => {
    setSelectedCompany(company);
    setNewStatus(toStatus);
    setStatusNote('');
    setShowStatusModal(true);
    setOpenDropdown(null);
  };

  const handleChangeStatus = async () => {
    if (!selectedCompany || !newStatus) return;
    setChangingStatus(true);
    try {
      await updateCompanyStatus(selectedCompany.id, newStatus, statusNote || undefined);
      setShowStatusModal(false);
      setSelectedCompany(null);
      setNewStatus('');
      setStatusNote('');
      await loadCompanies();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al cambiar el estado');
    } finally {
      setChangingStatus(false);
    }
  };

  const getTransitionIcon = (status: string) => {
    switch (status) {
      case 'pending_contract': return FileText;
      case 'signed': return CheckCircle;
      case 'active': return Play;
      case 'suspended': return Pause;
      case 'registered': return Clock;
      default: return Clock;
    }
  };

  return (
    <div className="!space-y-8 !animate-in !fade-in !slide-in-from-bottom-4 !duration-700">
      {/* Header Section */}
      <div className="!flex !flex-col md:!flex-row md:!items-center !justify-between !gap-4">
        <div>
          <h2 className="!text-3xl !font-black text-slate-900 dark:text-slate-100 !tracking-tight">Empresas B2B</h2>
          <p className="text-slate-500 dark:text-slate-400 !mt-1">Gestiona y verifica las empresas registradas en la plataforma.</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="!grid !grid-cols-2 md:!grid-cols-5 !gap-3">
        {[
          { label: 'Total', value: pagination.total, color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200' },
          { label: 'Registradas', value: companies.filter(c => c.status === 'registered').length, color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
          { label: 'Pendientes', value: companies.filter(c => c.status === 'pending_contract').length, color: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300' },
          { label: 'Activas', value: companies.filter(c => c.status === 'active').length, color: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
          { label: 'Suspendidas', value: companies.filter(c => c.status === 'suspended').length, color: 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300' },
        ].map((stat, i) => (
          <div key={i} className={`!rounded-2xl !p-4 !text-center ${stat.color}`}>
            <p className="!text-2xl !font-black">{stat.value}</p>
            <p className="!text-xs !font-bold !opacity-75">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 !p-6 !rounded-3xl !shadow-sm !border border-slate-100 dark:border-slate-700">
        <form onSubmit={handleSearch} className="!flex !flex-col md:!flex-row !gap-4">
          <div className="!flex-1 !relative">
            <Search className="!absolute !left-4 !top-1/2 !-translate-y-1/2 text-slate-400 dark:text-slate-500 !w-5 !h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, RUT o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!w-full !pl-12 !pr-4 !py-3 bg-slate-50 dark:bg-slate-800 !border-0 !rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:!ring-2 focus:!ring-indigo-500 !outline-none !transition-all"
            />
          </div>
          <div className="!flex !gap-4">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 !border-0 !rounded-2xl !px-6 !py-3 text-slate-600 dark:text-slate-300 !font-bold !text-sm !outline-none focus:!ring-2 focus:!ring-indigo-500 !min-w-[180px]"
            >
              <option value="">Todos los estados</option>
              <option value="registered">Registrada</option>
              <option value="pending_contract">Pendiente Contrato</option>
              <option value="signed">Contrato Firmado</option>
              <option value="active">Activa</option>
              <option value="suspended">Suspendida</option>
            </select>
            <button type="submit" className="bg-slate-900 dark:bg-slate-700 !text-white !px-8 !py-3 !rounded-2xl !font-bold !text-sm hover:bg-slate-800 dark:hover:bg-slate-600 !transition-all">
              Filtrar
            </button>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 !rounded-3xl !shadow-sm !border border-slate-100 dark:border-slate-700 !overflow-hidden">
        <div className="!overflow-x-auto">
          <table className="!w-full !text-left !border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800 !border-b border-slate-100 dark:border-slate-700">
                <th className="!px-6 !py-5 !text-xs !font-black text-slate-400 dark:text-slate-500 !uppercase !tracking-widest">Empresa</th>
                <th className="!px-6 !py-5 !text-xs !font-black text-slate-400 dark:text-slate-500 !uppercase !tracking-widest">RUT / ID</th>
                <th className="!px-6 !py-5 !text-xs !font-black text-slate-400 dark:text-slate-500 !uppercase !tracking-widest">Industria</th>
                <th className="!px-6 !py-5 !text-xs !font-black text-slate-400 dark:text-slate-500 !uppercase !tracking-widest">Estado</th>
                <th className="!px-6 !py-5 !text-xs !font-black text-slate-400 dark:text-slate-500 !uppercase !tracking-widest">Docs</th>
                <th className="!px-6 !py-5 !text-xs !font-black text-slate-400 dark:text-slate-500 !uppercase !tracking-widest">Registro</th>
                <th className="!px-6 !py-5 !text-xs !font-black text-slate-400 dark:text-slate-500 !uppercase !tracking-widest !text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="!divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="!animate-pulse">
                    <td colSpan={7} className="!px-6 !py-8">
                      <div className="!h-4 bg-slate-100 dark:bg-slate-800 !rounded-full !w-full"></div>
                    </td>
                  </tr>
                ))
              ) : companies.length > 0 ? (
                companies.map((company) => {
                  const transitions = VALID_TRANSITIONS[company.status] || [];
                  return (
                    <tr key={company.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800 !transition-colors !group">
                      <td className="!px-6 !py-5">
                        <Link to={`/admin/empresas/${company.id}`} className="!flex !items-center !gap-4 hover:!opacity-80 !transition-opacity">
                          <div className="!w-12 !h-12 !rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 !flex !items-center !justify-center !font-black !text-lg !shadow-sm">
                            {(company.nombreComercial || company.razonSocial).charAt(0)}
                          </div>
                          <div>
                            <p className="!font-bold text-slate-900 dark:text-slate-100">{company.nombreComercial || company.razonSocial}</p>
                            <p className="!text-xs text-slate-500 dark:text-slate-400">{company.razonSocial}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="!px-6 !py-5">
                        <span className="!text-sm !font-medium text-slate-600 dark:text-slate-300">{company.rut || 'N/A'}</span>
                      </td>
                      <td className="!px-6 !py-5">
                        {company.industry ? (
                          <span className="!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-xs !font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                            {industryLabels[company.industry] || company.industry}
                          </span>
                        ) : (
                          <span className="!text-xs text-slate-400 dark:text-slate-500 !italic">Sin categoría</span>
                        )}
                      </td>
                      <td className="!px-6 !py-5">
                        <div className={`!inline-flex !items-center !gap-2 !px-3 !py-1.5 !rounded-full !text-xs !font-bold ${statusConfig[company.status]?.bgColor} ${statusConfig[company.status]?.color}`}>
                          <div className={`!w-1.5 !h-1.5 !rounded-full ${statusConfig[company.status]?.dot}`}></div>
                          {statusConfig[company.status]?.label || company.status}
                        </div>
                      </td>
                      <td className="!px-6 !py-5">
                        <div className="!flex !items-center !gap-1.5">
                          <FileText className="!w-3.5 !h-3.5 text-slate-400 dark:text-slate-500" />
                          <span className={`!text-sm !font-bold ${(company._count?.documents || 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            {company._count?.documents || 0}
                          </span>
                        </div>
                      </td>
                      <td className="!px-6 !py-5">
                        <p className="!text-sm text-slate-600 dark:text-slate-300">{new Date(company.createdAt).toLocaleDateString('es-CL')}</p>
                      </td>
                      <td className="!px-6 !py-5 !text-right">
                        <div className="!flex !items-center !justify-end !gap-2 !relative">
                          {/* View detail */}
                          <Link
                            to={`/admin/empresas/${company.id}`}
                            className="!p-2 !rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:!bg-indigo-600 hover:!text-white !transition-all"
                            title="Ver detalles"
                          >
                            <Eye className="!w-4 !h-4" />
                          </Link>
                          {/* 3-dot menu */}
                          <button
                            onClick={(e) => {
                              if (openDropdown === company.id) {
                                setOpenDropdown(null);
                              } else {
                                const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                                const menuH = 200; // approx menu height
                                const spaceBelow = window.innerHeight - rect.bottom;
                                const top = spaceBelow < menuH
                                  ? rect.top - menuH        // flip upward, snug to button
                                  : rect.bottom + 4;        // normal below
                                setMenuPos({
                                  top: Math.max(8, top),
                                  left: Math.max(8, rect.right - 220),
                                });
                                setOpenDropdown(company.id);
                              }
                            }}
                            className="!p-2 !rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:!bg-slate-900 hover:!text-white !transition-all"
                          >
                            <MoreVertical className="!w-4 !h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="!px-6 !py-20 !text-center">
                    <div className="!flex !flex-col !items-center !gap-4">
                      <div className="!w-20 !h-20 bg-slate-50 dark:bg-slate-800 !rounded-full !flex !items-center !justify-center">
                        <Building2 className="!w-10 !h-10 text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 !font-medium">No se encontraron empresas</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="!px-6 !py-6 bg-slate-50/50 dark:bg-slate-800 !border-t border-slate-100 dark:border-slate-700 !flex !items-center !justify-between">
            <p className="!text-sm text-slate-500 dark:text-slate-400">
              Mostrando <span className="!font-bold text-slate-900 dark:text-slate-100">{companies.length}</span> de <span className="!font-bold text-slate-900 dark:text-slate-100">{pagination.total}</span> empresas
            </p>
            <div className="!flex !items-center !gap-2">
              <button
                onClick={() => pagination.page > 1 && setSearchParams({ page: (pagination.page - 1).toString() })}
                disabled={pagination.page === 1}
                className="!p-2 !rounded-xl bg-white dark:bg-slate-900 !border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:!opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 !transition-all"
              >
                <ChevronLeft className="!w-5 !h-5" />
              </button>
              {[...Array(Math.min(pagination.totalPages, 7))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSearchParams({ page: (i + 1).toString() })}
                  className={`!w-10 !h-10 !rounded-xl !text-sm !font-bold !transition-all ${
                    pagination.page === i + 1
                      ? '!bg-indigo-600 !text-white !shadow-lg !shadow-indigo-200 dark:!shadow-indigo-950'
                      : 'bg-white dark:bg-slate-900 !border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => pagination.page < pagination.totalPages && setSearchParams({ page: (pagination.page + 1).toString() })}
                disabled={pagination.page === pagination.totalPages}
                className="!p-2 !rounded-xl bg-white dark:bg-slate-900 !border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:!opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 !transition-all"
              >
                <ChevronRight className="!w-5 !h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Status Change Modal ═══ */}
      {showStatusModal && selectedCompany && (
        <div className="!fixed !inset-0 !z-50 !flex !items-center !justify-center !bg-black/40 !backdrop-blur-sm" onClick={() => setShowStatusModal(false)}>
          <div className="bg-white dark:bg-slate-900 !rounded-3xl !shadow-2xl !p-8 !w-full !max-w-md !mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="!flex !items-center !justify-between !mb-2">
              <h3 className="!text-xl !font-black text-slate-900 dark:text-slate-100">Cambiar Estado</h3>
              <button onClick={() => setShowStatusModal(false)} className="!p-1 !rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 !transition-colors">
                <X className="!w-5 !h-5 text-slate-400 dark:text-slate-500" />
              </button>
            </div>

            <p className="!text-sm text-slate-500 dark:text-slate-400 !mb-6">
              ¿Cambiar <strong>{selectedCompany.nombreComercial || selectedCompany.razonSocial}</strong> de{' '}
              <span className={`!font-bold ${statusConfig[selectedCompany.status]?.color || ''}`}>{statusConfig[selectedCompany.status]?.label || selectedCompany.status}</span> a{' '}
              <span className={`!font-bold ${statusConfig[newStatus]?.color || ''}`}>{statusConfig[newStatus]?.label || newStatus}</span>?
            </p>

            <div className="!space-y-4">
              <div>
                <label className="!text-sm !font-bold text-slate-700 dark:text-slate-200 !block !mb-1">Nota (opcional)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Motivo del cambio de estado..."
                  rows={3}
                  className="!w-full bg-slate-50 dark:bg-slate-800 !border border-slate-200 dark:border-slate-700 !rounded-xl !px-4 !py-3 !text-sm text-slate-900 dark:text-slate-100 !outline-none focus:!ring-2 focus:!ring-indigo-500 !resize-none"
                />
              </div>

              {newStatus === 'suspended' && (
                <div className="bg-rose-50 dark:bg-rose-500/10 !border border-rose-200 dark:border-rose-800 !rounded-xl !p-3 !flex !items-start !gap-2">
                  <AlertTriangle className="!w-4 !h-4 text-rose-500 dark:text-rose-400 !mt-0.5 !flex-shrink-0" />
                  <p className="!text-xs text-rose-700 dark:text-rose-300">Suspender la empresa deshabilitará el acceso de todos sus usuarios.</p>
                </div>
              )}

              <div className="!flex !gap-3 !pt-2">
                <button
                  onClick={() => { setShowStatusModal(false); setSelectedCompany(null); }}
                  className="!flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 !px-4 !py-3 !rounded-xl !font-bold !text-sm hover:bg-slate-200 dark:hover:bg-slate-700 !transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangeStatus}
                  disabled={changingStatus}
                  className={`!flex-1 !px-4 !py-3 !rounded-xl !font-bold !text-sm !transition-all disabled:!opacity-50 !shadow-lg ${
                    newStatus === 'suspended'
                      ? '!bg-rose-600 !text-white hover:!bg-rose-700 !shadow-rose-200 dark:!shadow-rose-950'
                      : '!bg-indigo-600 !text-white hover:!bg-indigo-700 !shadow-indigo-200 dark:!shadow-indigo-950'
                  }`}
                >
                  {changingStatus ? 'Cambiando...' : 'Confirmar Cambio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside overlay + Dropdown menu (rendered outside table for proper z-index) */}
      {openDropdown && (
        <>
          <div
            className="!fixed !inset-0 !z-[100]"
            onClick={() => setOpenDropdown(null)}
          />
          {(() => {
            const company = companies.find(c => c.id === openDropdown);
            if (!company) return null;
            const transitions = VALID_TRANSITIONS[company.status] || [];
            return (
              <div
                className="!fixed bg-white dark:bg-slate-800 !rounded-2xl !shadow-2xl !border border-slate-200 dark:border-slate-700 !py-2 !min-w-[220px] !z-[101] !animate-in !fade-in !slide-in-from-top-2 !duration-200"
                style={{ top: menuPos.top, left: menuPos.left }}
              >
                {/* View detail */}
                <button
                  onClick={() => { setOpenDropdown(null); navigate(`/admin/empresas/${company.id}`); }}
                  className="!w-full !flex !items-center !gap-3 !px-4 !py-2.5 !text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 !transition-colors !text-left"
                >
                  <Eye className="!w-4 !h-4 text-slate-400 dark:text-slate-500" />
                  <span className="!font-medium">Ver Detalle Completo</span>
                </button>

                {/* Divider */}
                {transitions.length > 0 && (
                  <div className="!border-t border-slate-100 dark:border-slate-700 !my-1" />
                )}

                {/* Status transitions */}
                {transitions.map((toStatus) => {
                  const tsc = statusConfig[toStatus] || statusConfig.registered;
                  const TIcon = getTransitionIcon(toStatus);
                  const isSuspend = toStatus === 'suspended';
                  return (
                    <button
                      key={toStatus}
                      onClick={() => openStatusChangeModal(company, toStatus)}
                      className={`!w-full !flex !items-center !gap-3 !px-4 !py-2.5 !text-sm !transition-colors !text-left ${
                        isSuspend ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10' : `${tsc.color} hover:bg-slate-50 dark:hover:bg-slate-700`
                      }`}
                    >
                      <TIcon className="!w-4 !h-4" />
                      <span className="!font-medium">
                        {toStatus === 'suspended' ? 'Suspender' :
                         toStatus === 'active' ? 'Activar' :
                         toStatus === 'pending_contract' ? 'Enviar a Contrato' :
                         toStatus === 'signed' ? 'Marcar como Firmado' :
                         toStatus === 'registered' ? 'Volver a Registrada' :
                         tsc.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
