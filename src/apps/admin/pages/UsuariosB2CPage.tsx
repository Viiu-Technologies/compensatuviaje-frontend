import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Eye, Users, AlertTriangle } from 'lucide-react';
import { getB2CUsers, getB2CStats, B2CUser } from '../services/adminApi';
import {
  EmptyState, KpiCard, PageHeader, Pagination, SearchField, TableSkeletonRows,
  authProviderLabel, formatInt, kgToTonnes,
} from '../ui';

interface B2CStatsData {
  overview: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    retentionRate: number;
  };
  byAuthProvider: Record<string, number>;
  byCountry: Array<{ country: string; count: number }>;
  compensations: {
    totalCalculations: number;
    totalCompensations: number;
    conversionRate: string;
    totalEmissionsKg: number;
    compensatedEmissionsKg: number;
    totalRevenueCLP: number;
  };
}

const PERIODS = [
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: '90d', label: 'Últimos 90 días' },
];

/** El backend puede mandar "12.5" o "12.5%"; se muestra siempre como "12,5 %". */
const pctText = (v?: string | number | null) => {
  if (v == null || v === '') return '—';
  const n = parseFloat(String(v).replace('%', '').replace(',', '.'));
  return Number.isFinite(n) ? `${n.toLocaleString('es-CL', { maximumFractionDigits: 1 })} %` : String(v);
};

export default function UsuariosB2CPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<B2CUser[]>([]);
  const [stats, setStats] = useState<B2CStatsData | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [period, setPeriod] = useState('30d');

  useEffect(() => { loadData(); }, [searchParams]);
  useEffect(() => { loadStats(); }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getB2CUsers({
        page: parseInt(searchParams.get('page') || '1'),
        limit: 20,
        search: searchParams.get('search') || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setUsers(data.users);
      setPagination(data.pagination);
      setLoadError(false);
    } catch (error) {
      console.error('Error loading users:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStats(await getB2CStats(period));
      setStatsError(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Antes se mostraban cifras inventadas como si fueran reales.
      setStats(null);
      setStatsError(true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search.trim()) params.set('search', search.trim()); else params.delete('search');
    params.set('page', '1');
    setSearchParams(params);
  };

  // Antes los botones de página hacían setSearchParams({ page }) y se perdía la búsqueda.
  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params);
  };

  const periodLabel = PERIODS.find((p) => p.value === period)?.label.toLowerCase();
  const c = stats?.compensations;

  return (
    <div className="adm-page">
      <PageHeader
        title="Usuarios B2C"
        description="Personas que calculan y compensan sus viajes."
        actions={
          <>
            <label className="sr-only" htmlFor="ub-period">Periodo de las métricas</label>
            <select id="ub-period" className="adm-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
              {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </>
        }
      />

      {statsError && (
        <div role="alert" className="adm-alert adm-alert--danger">
          <AlertTriangle aria-hidden="true" />
          <div>No se pudieron cargar las estadísticas de usuarios. Vuelve a intentarlo en unos minutos.</div>
        </div>
      )}

      <div className="adm-kpis">
        <KpiCard
          label="Usuarios registrados"
          value={stats ? formatInt(stats.overview?.totalUsers) : '—'}
          context={stats ? `${formatInt(stats.overview?.newUsers)} nuevos en ${periodLabel}` : undefined}
        />
        <KpiCard
          label="Usuarios activos"
          value={stats ? formatInt(stats.overview?.activeUsers) : '—'}
          context={stats ? `Con actividad en ${periodLabel}` : undefined}
        />
        <KpiCard
          label="Conversión"
          value={pctText(c?.conversionRate)}
          context={c ? `${formatInt(c.totalCompensations)} compensaciones de ${formatInt(c.totalCalculations)} cálculos` : undefined}
        />
        <KpiCard
          label="CO₂e compensado"
          value={c ? kgToTonnes(c.compensatedEmissionsKg) : '—'}
          unit={c ? 't' : undefined}
          context={c ? `De ${kgToTonnes(c.totalEmissionsKg)} t calculadas` : undefined}
        />
      </div>

      {loadError && (
        <div role="alert" className="adm-alert adm-alert--danger">
          <AlertTriangle aria-hidden="true" />
          <div><b>No se pudo cargar la lista de usuarios.</b> Revisa la conexión y vuelve a intentar.</div>
        </div>
      )}

      <section className="adm-table-card">
        <div className="adm-toolbar">
          <form onSubmit={handleSearch} role="search">
            <SearchField
              label="Buscar usuarios"
              placeholder="Buscar por nombre o correo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="adm-btn">Buscar</button>
          </form>
        </div>

        <div className="adm-table-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Usuario</th>
                <th scope="col">Acceso</th>
                <th scope="col">País</th>
                <th scope="col">Registro</th>
                <th scope="col" className="adm-col-actions"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeletonRows columns={5} />
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <Link to={`/admin/usuarios-b2c/${user.id}`} className="adm-cell-main">
                        <span className="adm-cell-initial" aria-hidden="true">{(user.nombre || user.email).charAt(0).toUpperCase()}</span>
                        <span>
                          <span className="adm-cell-title">{user.nombre || user.email}</span>
                          {user.nombre && <span className="adm-cell-sub">{user.email}</span>}
                        </span>
                      </Link>
                    </td>
                    <td>{authProviderLabel(user.authProvider)}</td>
                    <td>{user.pais || <span className="adm-cell-mute">—</span>}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString('es-CL')}</td>
                    <td className="adm-col-actions">
                      <Link to={`/admin/usuarios-b2c/${user.id}`} className="adm-icon-btn" title="Ver detalle" aria-label={`Ver detalle de ${user.nombre || user.email}`}>
                        <Eye aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={Users}
                      title="No se encontraron usuarios"
                      text={searchParams.get('search') ? 'Prueba con otra búsqueda.' : undefined}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && pagination.total > 0 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            shown={users.length}
            noun="usuarios"
            onPage={goToPage}
          />
        )}
      </section>
    </div>
  );
}
