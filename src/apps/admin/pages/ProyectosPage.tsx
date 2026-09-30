/**
 * Proyectos ESG: inventario vivo.
 *
 * Portafolio de proyectos que ya pasaron por Proyectos en revisión:
 * activos, pausados, completados y rechazados.
 *
 * SEPARACIÓN DE RESPONSABILIDADES:
 * - ProjectsReviewPage: alta de proyectos nuevos (pending_review → approved → active)
 * - Esta página: inventario vivo (active, paused, completed, sold_out, rejected)
 */

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Eye, Pause, Play, ExternalLink, TreePine, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getProjects, getProjectsStats, Project } from '../services/adminApi';
import api from '../../../shared/services/api';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import {
  EmptyState, KpiCard, PageHeader, Pagination, SearchField, Segmented, StatusBadge, TableSkeletonRows, type StatusTone,
  formatCLP, formatInt, projectTypeLabel, useAdminConfirm,
} from '../ui';

const STATUS: Record<string, { label: string; tone: StatusTone }> = {
  active: { label: 'Activo', tone: 'success' },
  paused: { label: 'Pausado', tone: 'warning' },
  completed: { label: 'Completado', tone: 'info' },
  rejected: { label: 'Rechazado', tone: 'danger' },
  pending_review: { label: 'En revisión', tone: 'warning' },
  approved: { label: 'Por activar', tone: 'info' },
  draft: { label: 'Borrador', tone: 'neutral' },
};

// Sin filtro, el backend recibe 'active': el inventario vivo por defecto.
const STATUS_FILTERS = [
  { value: 'active', label: 'Activos' },
  { value: 'paused', label: 'Pausados' },
  { value: 'completed', label: 'Completados' },
  { value: 'rejected', label: 'Rechazados' },
  { value: 'approved', label: 'Por activar' },
];

const TYPE_GROUPS: Array<{ label: string; types: string[] }> = [
  { label: 'Bosque', types: ['reforestation', 'conservation'] },
  { label: 'Agua', types: ['clean_water', 'water_security'] },
  { label: 'Textil', types: ['circular_economy', 'waste_management'] },
  { label: 'Social', types: ['energy_efficiency', 'social_housing', 'community_development'] },
];

export default function ProyectosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { confirm, dialog } = useAdminConfirm();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const statusFilter = searchParams.get('status') || 'active';
  const typeFilter = searchParams.get('type') || '';

  useEffect(() => { loadData(); }, [searchParams]);
  useEffect(() => { loadStats(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getProjects({
        page: parseInt(searchParams.get('page') || '1'),
        limit: 20,
        search: searchParams.get('search') || undefined,
        status: statusFilter,
        projectType: typeFilter || undefined,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      } as any);
      setProjects(data.projects);
      setPagination(data.pagination);
      setLoadError(false);
    } catch (error) {
      console.error('Error loading projects:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStats(await getProjectsStats());
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

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

  const handleChangeStatus = async (project: Project, newStatus: 'paused' | 'active') => {
    const pausing = newStatus === 'paused';
    const ok = await confirm({
      title: pausing ? `¿Pausar ${project.name}?` : `¿Reactivar ${project.name}?`,
      description: pausing
        ? 'Dejará de estar disponible para nuevas compensaciones. Las ya emitidas no se ven afectadas.'
        : 'Volverá a estar disponible para nuevas compensaciones.',
      confirmLabel: pausing ? 'Pausar proyecto' : 'Reactivar proyecto',
      tone: pausing ? 'danger' : undefined,
    });
    if (!ok) return;

    setActionLoading(project.id);
    try {
      await api.put(`/admin/projects/${project.id}/status`, { status: newStatus });
      toast.success(pausing ? 'Proyecto pausado' : 'Proyecto reactivado');
      loadData();
      loadStats();
    } catch (err: any) {
      toast.error(getErrorMessage(err, pausing ? 'No se pudo pausar el proyecto' : 'No se pudo reactivar el proyecto'));
    } finally {
      setActionLoading(null);
    }
  };

  const inv = stats?.inventory;
  const filtered = !!(searchParams.get('search') || typeFilter);

  return (
    <div className="adm-page">
      <PageHeader
        title="Proyectos ESG"
        description="Inventario de proyectos disponibles para compensar."
        actions={
          <Link to="/admin/proyectos-revision" className="adm-btn">
            <ClipboardCheck aria-hidden="true" /> Proyectos en revisión
          </Link>
        }
      />

      {/* Antes "Certificados emitidos" mostraba en realidad las unidades asignadas. */}
      <div className="adm-kpis">
        <KpiCard label="Proyectos activos" value={formatInt(stats?.activeProjects)} context="Disponibles para compensar" />
        <KpiCard label="Stock disponible" value={formatInt(inv?.totalTonsAvailable)} unit="unidades" context="Suma del stock de todos los proyectos" />
        <KpiCard label="Unidades asignadas" value={formatInt(inv?.totalTonsAllocated)} unit="unidades" context="Ya vendidas a clientes" />
        <KpiCard label="Ingresos" value={formatCLP(inv?.totalRevenueClp)} context="Total vendido por proyectos" />
      </div>

      {loadError && (
        <div role="alert" className="adm-alert adm-alert--danger">
          <AlertTriangle aria-hidden="true" />
          <div><b>No se pudo cargar la lista de proyectos.</b> Revisa la conexión y vuelve a intentar.</div>
        </div>
      )}

      <section className="adm-table-card">
        <div className="adm-toolbar">
          <form onSubmit={handleSearch} role="search">
            <SearchField
              label="Buscar proyectos"
              placeholder="Buscar por nombre, código o partner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="adm-btn">Buscar</button>
          </form>
          <Segmented label="Filtrar por estado" options={STATUS_FILTERS} value={statusFilter} onChange={(v) => setParam('status', v === 'active' ? '' : v)} />
          <div className="adm-filters">
            <label className="sr-only" htmlFor="pr-type">Tipo de proyecto</label>
            <select id="pr-type" className="adm-select" value={typeFilter} onChange={(e) => setParam('type', e.target.value)}>
              <option value="">Todos los tipos</option>
              {TYPE_GROUPS.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.types.map((t) => <option key={t} value={t}>{projectTypeLabel(t)}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div className="adm-table-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Proyecto</th>
                <th scope="col">Tipo</th>
                <th scope="col" className="adm-col-num">Stock del mes</th>
                <th scope="col" className="adm-col-num">Precio por tonelada</th>
                <th scope="col">Estado</th>
                <th scope="col" className="adm-col-actions"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeletonRows columns={6} />
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={TreePine}
                      title={`No hay proyectos ${(STATUS_FILTERS.find((o) => o.value === statusFilter)?.label ?? '').toLowerCase()}`}
                      text={filtered ? 'Prueba con otra búsqueda o quita el filtro de tipo.' : undefined}
                    />
                  </td>
                </tr>
              ) : (
                projects.map((project) => {
                  const st = STATUS[project.status] ?? { label: project.status, tone: 'neutral' as StatusTone };
                  const approved = project.monthly_stock_approved || 0;
                  const remaining = project.monthly_stock_remaining || 0;
                  const pct = approved ? Math.round((remaining / approved) * 100) : 0;
                  const busy = actionLoading === project.id;
                  return (
                    <tr key={project.id}>
                      <td>
                        <Link to={`/admin/proyectos/${project.id}`} className="adm-cell-title adm-link-plain">{project.name}</Link>
                        <span className="adm-cell-sub">
                          {project.code}{project.partner ? ` · ${project.partner.name}` : ''}
                        </span>
                      </td>
                      <td>
                        <span className="adm-cell-title" style={{ fontWeight: 400 }}>{projectTypeLabel(project.projectType)}</span>
                        <span className="adm-cell-sub">{[project.region, project.country].filter(Boolean).join(', ')}</span>
                      </td>
                      <td className="adm-col-num">
                        {approved ? (
                          <>
                            <span className="adm-cell-title">{formatInt(remaining)} de {formatInt(approved)}</span>
                            <span className="adm-stock" aria-label={`${pct} % disponible`}>
                              <span style={{ width: `${pct}%` }} className={pct <= 20 ? 'adm-stock--low' : undefined} />
                            </span>
                          </>
                        ) : (
                          <span className="adm-cell-mute">Sin stock mensual</span>
                        )}
                      </td>
                      <td className="adm-col-num">
                        <span className="adm-cell-title">{project.currentPrice?.pricePerTonClp != null ? formatCLP(project.currentPrice.pricePerTonClp) : '—'}</span>
                        {project.currentPrice?.marginPercent != null && (
                          <span className="adm-cell-sub">Margen {formatInt(Number(project.currentPrice.marginPercent))} %</span>
                        )}
                      </td>
                      <td>
                        <div className="adm-chips">
                          <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                          {project.is_sold_out && <StatusBadge tone="danger">Agotado</StatusBadge>}
                        </div>
                      </td>
                      <td className="adm-col-actions">
                        <Link to={`/admin/proyectos/${project.id}`} className="adm-icon-btn" title="Ver detalle" aria-label={`Ver detalle de ${project.name}`}>
                          <Eye aria-hidden="true" />
                        </Link>
                        {project.status === 'active' && (
                          <button type="button" className="adm-icon-btn" onClick={() => handleChangeStatus(project, 'paused')} disabled={busy} title="Pausar" aria-label={`Pausar ${project.name}`}>
                            <Pause aria-hidden="true" />
                          </button>
                        )}
                        {project.status === 'paused' && (
                          <button type="button" className="adm-icon-btn" onClick={() => handleChangeStatus(project, 'active')} disabled={busy} title="Reactivar" aria-label={`Reactivar ${project.name}`}>
                            <Play aria-hidden="true" />
                          </button>
                        )}
                        {project.transparencyUrl && (
                          <a href={project.transparencyUrl} target="_blank" rel="noopener noreferrer" className="adm-icon-btn" title="Ver transparencia" aria-label={`Ver transparencia de ${project.name}`}>
                            <ExternalLink aria-hidden="true" />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Antes la paginación mostraba como máximo las páginas 1 a 7. */}
        {!loading && pagination.total > 0 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            shown={projects.length}
            noun="proyectos"
            onPage={goToPage}
          />
        )}
        <p className="adm-table-note">
          Los proyectos nuevos se aprueban y se les fija precio en <Link to="/admin/proyectos-revision" className="adm-link">Proyectos en revisión</Link>.
        </p>
      </section>
      {dialog}
    </div>
  );
}
