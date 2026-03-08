/**
 * Partners Page - Lista y gestión de Impact Partners
 * Panel SuperAdmin
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Handshake,
  Globe,
  Mail,
  Calendar,
  MoreVertical,
  Shield,
  Pause,
  Play,
  Trash2
} from 'lucide-react';
import { getPartners, getPartnersStats, updatePartnerStatus, Partner } from '../services/adminApi';
import PartnerCreateModal from '../components/PartnerCreateModal';

interface PartnerStats {
  total: number;
  byStatus: {
    active: number;
    onboarding: number;
    suspended: number;
    inactive: number;
  };
  verified: number;
  withProjects: number;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  active: { label: 'Activo', color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: CheckCircle },
  onboarding: { label: 'Onboarding', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Clock },
  suspended: { label: 'Suspendido', color: 'text-red-700', bgColor: 'bg-red-100', icon: Pause },
  inactive: { label: 'Inactivo', color: 'text-slate-700', bgColor: 'bg-slate-100', icon: XCircle },
};

export default function PartnersPage() {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPartners({
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
        sortBy,
        sortOrder,
      });
      setPartners(response.partners);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar partners');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, sortBy, sortOrder]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await getPartnersStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPartners();
  };

  const handleStatusChange = async (partnerId: string, newStatus: 'active' | 'suspended' | 'inactive') => {
    if (!confirm(`¿Cambiar estado del partner a "${statusConfig[newStatus]?.label}"?`)) return;
    
    try {
      await updatePartnerStatus(partnerId, newStatus);
      fetchPartners();
      fetchStats();
      setActionMenuOpen(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar estado');
    }
  };

  const handlePartnerCreated = () => {
    setShowCreateModal(false);
    fetchPartners();
    fetchStats();
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    bgColor 
  }: { 
    title: string; 
    value: number; 
    icon: React.ElementType; 
    color: string; 
    bgColor: string;
  }) => (
    <div className="!bg-white !rounded-2xl !p-6 !shadow-sm !border !border-slate-100 hover:!shadow-md !transition-shadow">
      <div className="!flex !items-center !justify-between">
        <div>
          <p className="!text-sm !text-slate-500 !font-medium">{title}</p>
          <p className={`!text-3xl !font-bold !mt-1 ${color}`}>
            {statsLoading ? '...' : value}
          </p>
        </div>
        <div className={`!w-14 !h-14 !rounded-2xl ${bgColor} !flex !items-center !justify-center`}>
          <Icon className={`!w-7 !h-7 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div className="!flex !flex-col md:!flex-row !justify-between !items-start md:!items-center !gap-4">
        <div>
          <h1 className="!text-3xl !font-bold !text-slate-800 !flex !items-center !gap-3">
            <Handshake className="!w-8 !h-8 !text-indigo-600" />
            Impact Partners
          </h1>
          <p className="!text-slate-500 !mt-1">
            Gestión de organizaciones de proyectos ESG
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="!flex !items-center !gap-2 !px-5 !py-2.5 !bg-gradient-to-r !from-indigo-600 !to-purple-600 !text-white !rounded-xl !font-medium hover:!shadow-lg hover:!shadow-indigo-500/30 !transition-all"
        >
          <Plus className="!w-5 !h-5" />
          Nuevo Partner
        </button>
      </div>

      {/* Stats Cards */}
      <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 !gap-4">
        <StatCard
          title="Total Partners"
          value={stats?.total || 0}
          icon={Handshake}
          color="text-indigo-600"
          bgColor="bg-indigo-100"
        />
        <StatCard
          title="Activos"
          value={stats?.byStatus.active || 0}
          icon={CheckCircle}
          color="text-emerald-600"
          bgColor="bg-emerald-100"
        />
        <StatCard
          title="En Onboarding"
          value={stats?.byStatus.onboarding || 0}
          icon={Clock}
          color="text-amber-600"
          bgColor="bg-amber-100"
        />
        <StatCard
          title="Verificados"
          value={stats?.verified || 0}
          icon={Shield}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
      </div>

      {/* Filters */}
      <div className="!bg-white !rounded-2xl !p-4 !shadow-sm !border !border-slate-100">
        <div className="!flex !flex-col lg:!flex-row !gap-4">
          <form onSubmit={handleSearch} className="!flex-1">
            <div className="!relative">
              <Search className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !w-5 !h-5 !text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="!w-full !pl-10 !pr-4 !py-2.5 !border !border-slate-200 !rounded-xl !bg-white !text-slate-800 placeholder:!text-slate-400 focus:!ring-2 focus:!ring-indigo-500/20 focus:!border-indigo-500 !outline-none !transition-all"
              />
            </div>
          </form>

          <div className="!flex !items-center !gap-3">
            <div className="!flex !items-center !gap-2">
              <Filter className="!w-4 !h-4 !text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="!px-3 !py-2.5 !border !border-slate-200 !rounded-xl !bg-white !text-slate-800 focus:!ring-2 focus:!ring-indigo-500/20 focus:!border-indigo-500 !outline-none"
              >
                <option value="">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="onboarding">En Onboarding</option>
                <option value="suspended">Suspendidos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
                setPage(1);
              }}
              className="!px-3 !py-2.5 !border !border-slate-200 !rounded-xl !bg-white !text-slate-800 focus:!ring-2 focus:!ring-indigo-500/20 focus:!border-indigo-500 !outline-none"
            >
              <option value="created_at-desc">Más recientes</option>
              <option value="created_at-asc">Más antiguos</option>
              <option value="name-asc">Nombre A-Z</option>
              <option value="name-desc">Nombre Z-A</option>
            </select>

            <button
              onClick={() => { fetchPartners(); fetchStats(); }}
              className="!p-2.5 !border !border-slate-200 !rounded-xl hover:!bg-slate-50 !transition-colors"
              title="Refrescar"
            >
              <RefreshCw className={`!w-5 !h-5 !text-slate-600 ${loading ? '!animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="!bg-red-50 !text-red-700 !px-4 !py-3 !rounded-xl !flex !items-center !gap-2">
          <AlertTriangle className="!w-5 !h-5" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="!bg-white !rounded-2xl !shadow-sm !border !border-slate-100 !overflow-hidden">
        <div className="!overflow-x-auto">
          <table className="!w-full">
            <thead className="!bg-slate-50 !border-b !border-slate-100">
              <tr>
                <th className="!px-6 !py-4 !text-left !text-xs !font-semibold !text-slate-600 !uppercase !tracking-wider">
                  Partner
                </th>
                <th className="!px-6 !py-4 !text-left !text-xs !font-semibold !text-slate-600 !uppercase !tracking-wider">
                  Contacto
                </th>
                <th className="!px-6 !py-4 !text-left !text-xs !font-semibold !text-slate-600 !uppercase !tracking-wider">
                  Estado
                </th>
                <th className="!px-6 !py-4 !text-left !text-xs !font-semibold !text-slate-600 !uppercase !tracking-wider">
                  Proyectos
                </th>
                <th className="!px-6 !py-4 !text-left !text-xs !font-semibold !text-slate-600 !uppercase !tracking-wider">
                  Fecha Registro
                </th>
                <th className="!px-6 !py-4 !text-right !text-xs !font-semibold !text-slate-600 !uppercase !tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="!divide-y !divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="!px-6 !py-12 !text-center">
                    <RefreshCw className="!w-8 !h-8 !animate-spin !text-indigo-500 !mx-auto" />
                    <p className="!text-slate-500 !mt-2">Cargando partners...</p>
                  </td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="!px-6 !py-12 !text-center">
                    <Handshake className="!w-12 !h-12 !text-slate-300 !mx-auto" />
                    <p className="!text-slate-500 !mt-2">No se encontraron partners</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="!mt-4 !text-indigo-600 hover:!text-indigo-700 !font-medium"
                    >
                      Crear primer partner
                    </button>
                  </td>
                </tr>
              ) : (
                partners.map((partner) => {
                  const statusInfo = statusConfig[partner.status] || statusConfig.inactive;
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={partner.id} className="hover:!bg-slate-50/50 !transition-colors">
                      <td className="!px-6 !py-4">
                        <div className="!flex !items-center !gap-3">
                          {partner.logo_url ? (
                            <img
                              src={partner.logo_url}
                              alt={partner.name}
                              className="!w-10 !h-10 !rounded-xl !object-cover !border !border-slate-200"
                            />
                          ) : (
                            <div className="!w-10 !h-10 !rounded-xl !bg-gradient-to-br !from-indigo-500 !to-purple-600 !flex !items-center !justify-center !text-white !font-bold">
                              {partner.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="!font-semibold !text-slate-800">{partner.name}</p>
                            {partner.website_url && (
                              <a
                                href={partner.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="!text-xs !text-indigo-600 hover:!underline !flex !items-center !gap-1"
                              >
                                <Globe className="!w-3 !h-3" />
                                {new URL(partner.website_url).hostname}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="!px-6 !py-4">
                        <div className="!flex !items-center !gap-2 !text-sm !text-slate-600">
                          <Mail className="!w-4 !h-4 !text-slate-400" />
                          {partner.contact_email}
                        </div>
                      </td>
                      <td className="!px-6 !py-4">
                        <span className={`!inline-flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !text-xs !font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          <StatusIcon className="!w-3.5 !h-3.5" />
                          {statusInfo.label}
                        </span>
                        {partner.verified_at && (
                          <span className="!ml-2 !inline-flex !items-center !gap-1 !text-xs !text-blue-600">
                            <Shield className="!w-3 !h-3" />
                            Verificado
                          </span>
                        )}
                      </td>
                      <td className="!px-6 !py-4">
                        <span className="!text-sm !text-slate-600">
                          {partner.projects_count || 0} proyectos
                        </span>
                      </td>
                      <td className="!px-6 !py-4">
                        <div className="!flex !items-center !gap-2 !text-sm !text-slate-500">
                          <Calendar className="!w-4 !h-4" />
                          {new Date(partner.created_at).toLocaleDateString('es-CL')}
                        </div>
                      </td>
                      <td className="!px-6 !py-4 !text-right">
                        <button
                          onClick={(e) => {
                            if (actionMenuOpen === partner.id) {
                              setActionMenuOpen(null);
                            } else {
                              const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                              setMenuPos({
                                top: rect.bottom + window.scrollY + 4,
                                left: rect.right + window.scrollX - 192,
                              });
                              setActionMenuOpen(partner.id);
                            }
                          }}
                          className="!p-2 !rounded-lg hover:!bg-slate-100 !transition-colors"
                        >
                          <MoreVertical className="!w-5 !h-5 !text-slate-500" />
                        </button>
                        
                        {actionMenuOpen === partner.id && (
                          <div ref={menuRef} className="!fixed !bg-white !rounded-xl !shadow-2xl !border !border-slate-200 !py-2 !z-50 !w-48"
                            style={{ top: menuPos.top, left: menuPos.left }}
                          >
                            <button
                              onClick={() => { navigate(`/admin/partners/${partner.id}`); setActionMenuOpen(null); }}
                              className="!w-full !px-4 !py-2.5 !text-left !text-sm !text-slate-700 hover:!bg-slate-50 !flex !items-center !gap-2 !transition-colors"
                            >
                              <Eye className="!w-4 !h-4" />
                              Ver detalle
                            </button>
                            
                            {!partner.verified_at && (
                              <button
                                onClick={() => { navigate(`/admin/partners/${partner.id}?action=verify`); setActionMenuOpen(null); }}
                                className="!w-full !px-4 !py-2.5 !text-left !text-sm !text-blue-700 hover:!bg-blue-50 !flex !items-center !gap-2 !transition-colors"
                              >
                                <Shield className="!w-4 !h-4" />
                                Verificar
                              </button>
                            )}
                            
                            <div className="!border-t !border-slate-100 !my-1"></div>
                            
                            {partner.status !== 'active' && (
                              <button
                                onClick={() => handleStatusChange(partner.id, 'active')}
                                className="!w-full !px-4 !py-2.5 !text-left !text-sm !text-emerald-700 hover:!bg-emerald-50 !flex !items-center !gap-2 !transition-colors !font-medium"
                              >
                                <Play className="!w-4 !h-4" />
                                Activar
                              </button>
                            )}
                            
                            {partner.status === 'active' && (
                              <button
                                onClick={() => handleStatusChange(partner.id, 'suspended')}
                                className="!w-full !px-4 !py-2.5 !text-left !text-sm !text-amber-700 hover:!bg-amber-50 !flex !items-center !gap-2 !transition-colors !font-medium"
                              >
                                <Pause className="!w-4 !h-4" />
                                Suspender
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleStatusChange(partner.id, 'inactive')}
                              className="!w-full !px-4 !py-2.5 !text-left !text-sm !text-red-700 hover:!bg-red-50 !flex !items-center !gap-2 !transition-colors !font-medium"
                            >
                              <Trash2 className="!w-4 !h-4" />
                              Desactivar
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="!px-6 !py-4 !border-t !border-slate-100 !flex !items-center !justify-between">
            <p className="!text-sm !text-slate-500">
              Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)} de {total} partners
            </p>
            <div className="!flex !items-center !gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="!p-2 !rounded-lg !border !border-slate-200 hover:!bg-slate-50 disabled:!opacity-50 disabled:!cursor-not-allowed !transition-colors"
              >
                <ChevronLeft className="!w-5 !h-5" />
              </button>
              <span className="!px-4 !py-2 !text-sm !font-medium !text-slate-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="!p-2 !rounded-lg !border !border-slate-200 hover:!bg-slate-50 disabled:!opacity-50 disabled:!cursor-not-allowed !transition-colors"
              >
                <ChevronRight className="!w-5 !h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <PartnerCreateModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handlePartnerCreated}
        />
      )}

      {/* Click outside to close menu */}
      {actionMenuOpen && (
        <div
          className="!fixed !inset-0 !z-[49]"
          onClick={() => setActionMenuOpen(null)}
        />
      )}
    </div>
  );
}
