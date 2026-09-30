/**
 * Impact Partners: listado y gestión de las organizaciones que publican
 * proyectos ESG.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Plus, Eye, MoreHorizontal, Pause, Play, Power, Handshake, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getPartners, getPartnersStats, updatePartnerStatus, Partner } from '../services/adminApi';
import PartnerCreateModal from '../components/PartnerCreateModal';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import {
  EmptyState, KpiCard, PageHeader, Pagination, SearchField, Segmented, Skeleton, StatusBadge, TableSkeletonRows,
  formatInt, partnerStatus, useAdminConfirm,
} from '../ui';

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

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'onboarding', label: 'En incorporación' },
  { value: 'suspended', label: 'Suspendidos' },
  { value: 'inactive', label: 'Inactivos' },
];

const SORTS = [
  { value: 'created_at-desc', label: 'Más recientes' },
  { value: 'created_at-asc', label: 'Más antiguos' },
  { value: 'name-asc', label: 'Nombre A-Z' },
  { value: 'name-desc', label: 'Nombre Z-A' },
];

const LIMIT = 10;

/** Antes usaba new URL(...) directo y una URL mal escrita tiraba abajo la página. */
const hostOf = (url: string) => {
  if (/s/.test(url.trim())) return url;
  try {
    return new URL(url.includes('://') ? url : `https://${url}`).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

export default function PartnersPage() {
  const navigate = useNavigate();
  const { confirm, dialog } = useAdminConfirm();
  const [searchParams, setSearchParams] = useSearchParams();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Los filtros viven en la URL: sobreviven a recargar y al botón atrás.
  const page = Number(searchParams.get('page') || '1');
  const appliedSearch = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || 'created_at-desc';
  const [search, setSearch] = useState(appliedSearch);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!menuFor) return;
    const close = () => setMenuFor(null);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('scroll', close, true);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', close, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuFor]);

  // Antes cada tecla en el buscador disparaba una petición; ahora se busca al enviar.
  const fetchPartners = useCallback(async () => {
    const [sortBy, sortOrder] = sort.split('-');
    try {
      setLoading(true);
      const response = await getPartners({
        page,
        limit: LIMIT,
        search: appliedSearch || undefined,
        status: statusFilter || undefined,
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc',
      });
      setPartners(response.partners);
      setPagination({ totalPages: response.pagination.totalPages, total: response.pagination.total });
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo cargar la lista de partners');
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, statusFilter, sort]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      setStats(await getPartnersStats());
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => { fetchPartners(); }, [fetchPartners]);
  useEffect(() => { fetchStats(); }, []);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParam('search', search.trim());
  };

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    if (menuFor === id) return setMenuFor(null);
    const rect = e.currentTarget.getBoundingClientRect();
    const menuH = 170;
    const top = window.innerHeight - rect.bottom < menuH ? rect.top - menuH : rect.bottom + 4;
    setMenuPos({ top: Math.max(8, top), left: Math.max(8, rect.right - 220) });
    setMenuFor(id);
  };

  const handleStatusChange = async (partner: Partner, newStatus: 'active' | 'suspended' | 'inactive') => {
    setMenuFor(null);
    const label = partnerStatus(newStatus).label;
    const ok = await confirm({
      title: `¿Cambiar ${partner.name} a «${label}»?`,
      description:
        newStatus === 'active'
          ? 'El partner podrá volver a operar en la plataforma.'
          : 'El partner dejará de operar en la plataforma hasta que vuelvas a activarlo.',
      confirmLabel: newStatus === 'active' ? 'Activar' : newStatus === 'suspended' ? 'Suspender' : 'Desactivar',
      tone: newStatus === 'active' ? undefined : 'danger',
    });
    if (!ok) return;

    try {
      await updatePartnerStatus(partner.id, newStatus);
      toast.success(`${partner.name}: ${label.toLowerCase()}`);
      fetchPartners();
      fetchStats();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'No se pudo actualizar el estado'));
    }
  };

  const handlePartnerCreated = () => {
    setShowCreateModal(false);
    fetchPartners();
    fetchStats();
  };

  const menuPartner = menuFor ? partners.find((p) => p.id === menuFor) : null;
  const filtered = !!(appliedSearch || statusFilter);

  return (
    <div className="adm-page">
      <PageHeader
        title="Impact Partners"
        description="Organizaciones que publican proyectos de compensación."
        actions={
          <button type="button" className="adm-btn adm-btn--primary" onClick={() => setShowCreateModal(true)}>
            <Plus aria-hidden="true" /> Nuevo partner
          </button>
        }
      />

      {statsLoading && !stats ? (
        <div className="adm-kpis">{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={104} />)}</div>
      ) : (
        <div className="adm-kpis">
          <KpiCard label="Partners" value={formatInt(stats?.total)} context={`${formatInt(stats?.withProjects)} proyectos en total`} />
          <KpiCard label="Activos" value={formatInt(stats?.byStatus.active)} context="Operando en la plataforma" />
          <KpiCard
            label="En incorporación"
            value={formatInt(stats?.byStatus.onboarding)}
            context={stats?.byStatus.onboarding ? <StatusBadge tone="warning">Por completar</StatusBadge> : 'Ninguno pendiente'}
          />
          {/* Antes había una tarjeta "Verificados", pero el servicio la calcula con los activos: repetía la cifra. */}
          <KpiCard
            label="Suspendidos o inactivos"
            value={formatInt((stats?.byStatus.suspended ?? 0) + (stats?.byStatus.inactive ?? 0))}
            context="No operan en la plataforma"
          />
        </div>
      )}

      {error && (
        <div role="alert" className="adm-alert adm-alert--danger">
          <AlertTriangle aria-hidden="true" />
          <div><b>{error}.</b> Revisa la conexión y vuelve a intentar.</div>
        </div>
      )}

      <section className="adm-table-card">
        <div className="adm-toolbar">
          <form onSubmit={handleSearch} role="search">
            <SearchField
              label="Buscar partners"
              placeholder="Buscar por nombre o correo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="adm-btn">Buscar</button>
          </form>
          <Segmented label="Filtrar por estado" options={STATUS_FILTERS} value={statusFilter} onChange={(v) => setParam('status', v)} />
          <div className="adm-filters">
            <label className="sr-only" htmlFor="pt-sort">Ordenar</label>
            <select id="pt-sort" className="adm-select" value={sort} onChange={(e) => setParam('sort', e.target.value)}>
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button
              type="button"
              className="adm-icon-btn"
              onClick={() => { fetchPartners(); fetchStats(); }}
              disabled={loading}
              title="Actualizar"
              aria-label="Actualizar lista"
            >
              <RefreshCw aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="adm-table-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Partner</th>
                <th scope="col">Contacto</th>
                <th scope="col">Estado</th>
                <th scope="col" className="adm-col-num">Proyectos</th>
                <th scope="col">Registro</th>
                <th scope="col" className="adm-col-actions"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeletonRows columns={6} />
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Handshake}
                      title={filtered ? 'No se encontraron partners' : 'Aún no hay partners'}
                      text={filtered ? 'Prueba con otra búsqueda o quita el filtro de estado.' : 'Crea el primero con «Nuevo partner».'}
                    />
                  </td>
                </tr>
              ) : (
                partners.map((partner) => {
                  const st = partnerStatus(partner.status);
                  return (
                    <tr key={partner.id}>
                      <td>
                        <Link to={`/admin/partners/${partner.id}`} className="adm-cell-main">
                          {partner.logo_url
                            ? <img src={partner.logo_url} alt="" className="adm-cell-initial" style={{ objectFit: 'cover' }} />
                            : <span className="adm-cell-initial" aria-hidden="true">{partner.name.charAt(0)}</span>}
                          <span>
                            <span className="adm-cell-title">{partner.name}</span>
                            {partner.website_url && <span className="adm-cell-sub">{hostOf(partner.website_url)}</span>}
                          </span>
                        </Link>
                      </td>
                      <td>{partner.contact_email || <span className="adm-cell-mute">—</span>}</td>
                      <td>
                        <div className="adm-chips">
                          <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                          {partner.verified_at && <StatusBadge tone="info">Verificado</StatusBadge>}
                        </div>
                      </td>
                      <td className="adm-col-num">{formatInt(partner.projects_count)}</td>
                      <td>{new Date(partner.created_at).toLocaleDateString('es-CL')}</td>
                      <td className="adm-col-actions">
                        <Link to={`/admin/partners/${partner.id}`} className="adm-icon-btn" title="Ver detalle" aria-label={`Ver detalle de ${partner.name}`}>
                          <Eye aria-hidden="true" />
                        </Link>
                        <button
                          type="button"
                          className="adm-icon-btn"
                          onClick={(e) => openMenu(e, partner.id)}
                          aria-haspopup="menu"
                          aria-expanded={menuFor === partner.id}
                          aria-label={`Acciones para ${partner.name}`}
                        >
                          <MoreHorizontal aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && pagination.total > 0 && (
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            shown={partners.length}
            noun="partners"
            onPage={goToPage}
          />
        )}
      </section>

      {menuPartner && (
        <>
          <div className="adm-overlay-clear" onClick={() => setMenuFor(null)} />
          <div className="adm-menu" role="menu" style={{ top: menuPos.top, left: menuPos.left }}>
            <button type="button" role="menuitem" onClick={() => { setMenuFor(null); navigate(`/admin/partners/${menuPartner.id}`); }}>
              <Eye aria-hidden="true" /> Ver detalle
            </button>
            <hr />
            {menuPartner.status !== 'active' ? (
              <button type="button" role="menuitem" onClick={() => handleStatusChange(menuPartner, 'active')}>
                <Play aria-hidden="true" /> Activar
              </button>
            ) : (
              <button type="button" role="menuitem" onClick={() => handleStatusChange(menuPartner, 'suspended')}>
                <Pause aria-hidden="true" /> Suspender
              </button>
            )}
            {menuPartner.status !== 'inactive' && (
              <button type="button" role="menuitem" className="adm-menu__danger" onClick={() => handleStatusChange(menuPartner, 'inactive')}>
                <Power aria-hidden="true" /> Desactivar
              </button>
            )}
          </div>
        </>
      )}

      {showCreateModal && (
        <PartnerCreateModal onClose={() => setShowCreateModal(false)} onCreated={handlePartnerCreated} />
      )}
      {dialog}
    </div>
  );
}
