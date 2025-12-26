import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Building2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Download,
  ArrowUpDown,
  Plus,
  ExternalLink
} from 'lucide-react';
import { getCompanies, Company, CompaniesListResponse, updateCompanyStatus } from '../services/adminApi';

const statusConfig: Record<string, { label: string; color: string; bgColor: string; dot: string }> = {
  registered: { label: 'Registrada', color: 'text-slate-700', bgColor: 'bg-slate-100', dot: 'bg-slate-400' },
  pending_contract: { label: 'Pendiente Contrato', color: 'text-amber-700', bgColor: 'bg-amber-100', dot: 'bg-amber-500' },
  signed: { label: 'Contrato Firmado', color: 'text-blue-700', bgColor: 'bg-blue-100', dot: 'bg-blue-500' },
  active: { label: 'Activa', color: 'text-emerald-700', bgColor: 'bg-emerald-100', dot: 'bg-emerald-500' },
  suspended: { label: 'Suspendida', color: 'text-rose-700', bgColor: 'bg-rose-100', dot: 'bg-rose-500' },
};

export default function EmpresasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadCompanies();
  }, [searchParams, sortBy, sortOrder]);

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
      setCompanies(data.companies);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    setSearchParams(params);
    setStatusFilter(status);
  };

  return (
    <div className="!space-y-8 !animate-in !fade-in !slide-in-from-bottom-4 !duration-700">
      {/* Header Section */}
      <div className="!flex !flex-col md:!flex-row md:!items-center !justify-between !gap-4">
        <div>
          <h2 className="!text-3xl !font-black !text-slate-900 !tracking-tight">Empresas B2B</h2>
          <p className="!text-slate-500 !mt-1">Gestiona y verifica las empresas registradas en la plataforma.</p>
        </div>
        <div className="!flex !items-center !gap-3">
          <button className="!flex !items-center !gap-2 !bg-white !text-slate-700 !px-4 !py-2.5 !rounded-xl !border !border-slate-200 !font-bold !text-sm hover:!bg-slate-50 !transition-all !shadow-sm">
            <Download className="!w-4 !h-4" />
            Exportar
          </button>
          <button className="!flex !items-center !gap-2 !bg-indigo-600 !text-white !px-4 !py-2.5 !rounded-xl !font-bold !text-sm hover:!bg-indigo-700 !transition-all !shadow-lg !shadow-indigo-200">
            <Plus className="!w-4 !h-4" />
            Nueva Empresa
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="!bg-white !p-6 !rounded-3xl !shadow-sm !border !border-slate-100">
        <form onSubmit={handleSearch} className="!flex !flex-col md:!flex-row !gap-4">
          <div className="!flex-1 !relative">
            <Search className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !text-slate-400 !w-5 !h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, RUT o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!w-full !pl-12 !pr-4 !py-3 !bg-slate-50 !border-0 !rounded-2xl !text-slate-900 !placeholder-slate-400 focus:!ring-2 focus:!ring-indigo-500 !outline-none !transition-all"
            />
          </div>
          <div className="!flex !gap-4">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="!bg-slate-50 !border-0 !rounded-2xl !px-6 !py-3 !text-slate-600 !font-bold !text-sm !outline-none focus:!ring-2 focus:!ring-indigo-500 !min-w-[180px]"
            >
              <option value="">Todos los estados</option>
              <option value="registered">Registrada</option>
              <option value="pending_contract">Pendiente Contrato</option>
              <option value="signed">Contrato Firmado</option>
              <option value="active">Activa</option>
              <option value="suspended">Suspendida</option>
            </select>
            <button type="submit" className="!bg-slate-900 !text-white !px-8 !py-3 !rounded-2xl !font-bold !text-sm hover:!bg-slate-800 !transition-all">
              Filtrar
            </button>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className="!bg-white !rounded-3xl !shadow-sm !border !border-slate-100 !overflow-hidden">
        <div className="!overflow-x-auto">
          <table className="!w-full !text-left !border-collapse">
            <thead>
              <tr className="!bg-slate-50/50 !border-b !border-slate-100">
                <th className="!px-6 !py-5 !text-xs !font-black !text-slate-400 !uppercase !tracking-widest">Empresa</th>
                <th className="!px-6 !py-5 !text-xs !font-black !text-slate-400 !uppercase !tracking-widest">RUT / ID</th>
                <th className="!px-6 !py-5 !text-xs !font-black !text-slate-400 !uppercase !tracking-widest">Estado</th>
                <th className="!px-6 !py-5 !text-xs !font-black !text-slate-400 !uppercase !tracking-widest">Registro</th>
                <th className="!px-6 !py-5 !text-xs !font-black !text-slate-400 !uppercase !tracking-widest !text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="!divide-y !divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="!animate-pulse">
                    <td colSpan={5} className="!px-6 !py-8">
                      <div className="!h-4 !bg-slate-100 !rounded-full !w-full"></div>
                    </td>
                  </tr>
                ))
              ) : companies.length > 0 ? (
                companies.map((company) => (
                  <tr key={company.id} className="hover:!bg-slate-50/50 !transition-colors !group">
                    <td className="!px-6 !py-5">
                      <div className="!flex !items-center !gap-4">
                        <div className="!w-12 !h-12 !rounded-2xl !bg-indigo-50 !text-indigo-600 !flex !items-center !justify-center !font-black !text-lg !shadow-sm">
                          {(company.nombreComercial || company.razonSocial).charAt(0)}
                        </div>
                        <div>
                          <p className="!font-bold !text-slate-900">{company.nombreComercial || company.razonSocial}</p>
                          <p className="!text-xs !text-slate-500">{company.razonSocial}</p>
                        </div>
                      </div>
                    </td>
                    <td className="!px-6 !py-5">
                      <span className="!text-sm !font-medium !text-slate-600">{company.rut || 'N/A'}</span>
                    </td>
                    <td className="!px-6 !py-5">
                      <div className={`!inline-flex !items-center !gap-2 !px-3 !py-1.5 !rounded-full !text-xs !font-bold ${statusConfig[company.status]?.bgColor} ${statusConfig[company.status]?.color}`}>
                        <div className={`!w-1.5 !h-1.5 !rounded-full ${statusConfig[company.status]?.dot}`}></div>
                        {statusConfig[company.status]?.label}
                      </div>
                    </td>
                    <td className="!px-6 !py-5">
                      <p className="!text-sm !text-slate-600">{new Date(company.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="!px-6 !py-5 !text-right">
                      <div className="!flex !items-center !justify-end !gap-2">
                        <Link
                          to={`/admin/empresas/${company.id}`}
                          className="!p-2 !rounded-xl !bg-slate-100 !text-slate-600 hover:!bg-indigo-600 hover:!text-white !transition-all"
                          title="Ver detalles"
                        >
                          <Eye className="!w-4 !h-4" />
                        </Link>
                        <button className="!p-2 !rounded-xl !bg-slate-100 !text-slate-600 hover:!bg-slate-900 hover:!text-white !transition-all">
                          <MoreVertical className="!w-4 !h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="!px-6 !py-20 !text-center">
                    <div className="!flex !flex-col !items-center !gap-4">
                      <div className="!w-20 !h-20 !bg-slate-50 !rounded-full !flex !items-center !justify-center">
                        <Building2 className="!w-10 !h-10 !text-slate-300" />
                      </div>
                      <p className="!text-slate-500 !font-medium">No se encontraron empresas</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="!px-6 !py-6 !bg-slate-50/50 !border-t !border-slate-100 !flex !items-center !justify-between">
            <p className="!text-sm !text-slate-500">
              Mostrando <span className="!font-bold !text-slate-900">{companies.length}</span> de <span className="!font-bold !text-slate-900">{pagination.total}</span> empresas
            </p>
            <div className="!flex !items-center !gap-2">
              <button
                onClick={() => pagination.page > 1 && setSearchParams({ page: (pagination.page - 1).toString() })}
                disabled={pagination.page === 1}
                className="!p-2 !rounded-xl !bg-white !border !border-slate-200 !text-slate-600 disabled:!opacity-50 hover:!bg-slate-50 !transition-all"
              >
                <ChevronLeft className="!w-5 !h-5" />
              </button>
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSearchParams({ page: (i + 1).toString() })}
                  className={`!w-10 !h-10 !rounded-xl !text-sm !font-bold !transition-all ${
                    pagination.page === i + 1
                      ? '!bg-indigo-600 !text-white !shadow-lg !shadow-indigo-200'
                      : '!bg-white !border !border-slate-200 !text-slate-600 hover:!bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => pagination.page < pagination.totalPages && setSearchParams({ page: (pagination.page + 1).toString() })}
                disabled={pagination.page === pagination.totalPages}
                className="!p-2 !rounded-xl !bg-white !border !border-slate-200 !text-slate-600 disabled:!opacity-50 hover:!bg-slate-50 !transition-all"
              >
                <ChevronRight className="!w-5 !h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
