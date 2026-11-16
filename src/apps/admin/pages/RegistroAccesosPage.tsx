import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RefreshCw, ShieldCheck, X } from 'lucide-react';
import { getAccessLog, COLLECTION_ID, type AccessLogEntry } from '../services/adminPrivacyApi';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import { EmptyState, PageHeader, Segmented, TableSkeletonRows, formatTime } from '../ui';

/**
 * Registro de accesos a datos personales (Ley 21.719).
 *
 * Quién del equipo consultó datos de quién, cuándo y desde qué IP. Lo
 * escribe el backend (personalDataAccessLog) en cada consulta exitosa del
 * panel; aquí solo se lee. Se borra solo a los 12 meses.
 *
 * Filtros en la URL (?entity_id=&entity_type=&from=&to=) para poder enlazar
 * desde el detalle de una persona, empresa o aliado.
 */

const PAGE_SIZE = 50;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TYPE_FILTERS = [
  { value: '', label: 'Todo' },
  { value: 'b2c_user', label: 'Personas' },
  { value: 'company', label: 'Empresas' },
  { value: 'partner', label: 'Aliados' },
  { value: 'partner_evaluation', label: 'KYB' },
  { value: 'report', label: 'Reportes' },
];

const TYPE_LABEL: Record<string, string> = {
  b2c_user: 'Persona',
  b2c_user_list: 'Lista de personas',
  company: 'Empresa',
  company_list: 'Lista de empresas',
  partner: 'Aliado',
  partner_list: 'Lista de aliados',
  partner_evaluation: 'Evaluación KYB',
  partner_evaluation_list: 'Lista de evaluaciones KYB',
  order_list: 'Órdenes B2B',
  payment_list: 'Pagos',
  settlement_list: 'Liquidaciones',
  report: 'Reporte',
};

/** Enlace al detalle de lo consultado, cuando el admin tiene una página para eso. */
function entityLink(type: string, id: string): string | null {
  if (id === COLLECTION_ID) return null;
  switch (type) {
    case 'b2c_user': return `/admin/usuarios-b2c/${id}`;
    case 'company': return `/admin/empresas/${id}`;
    case 'partner': return `/admin/partners/${id}`;
    case 'partner_evaluation': return `/admin/partners/kyb-evaluations/${id}`;
    default: return null;
  }
}

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: formatTime(d),
  };
};

/** Fecha local (input type=date) → ISO: desde el inicio del día o hasta su final. */
const dayToIso = (day: string, endOfDay: boolean) =>
  day ? new Date(`${day}T${endOfDay ? '23:59:59.999' : '00:00:00'}`).toISOString() : undefined;

const RegistroAccesosPage = () => {
  const [params, setParams] = useSearchParams();
  const entityId = params.get('entity_id') || '';
  const entityType = params.get('entity_type') || '';
  const fromDay = params.get('from') || '';
  const toDay = params.get('to') || '';

  const [entityDraft, setEntityDraft] = useState(entityId);
  const [rows, setRows] = useState<AccessLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const fetchPage = useCallback(
    (before?: string) =>
      getAccessLog({
        entity_id: entityId || undefined,
        entity_type: entityType || undefined,
        from: dayToIso(fromDay, false),
        // Paginación por fecha: la página siguiente es lo anterior al último visto.
        to: before || dayToIso(toDay, true),
        limit: PAGE_SIZE,
      }),
    [entityId, entityType, fromDay, toDay]
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPage();
      setRows(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      setRows([]);
      setHasMore(false);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setEntityDraft(entityId); }, [entityId]);

  const loadMore = async () => {
    const last = rows[rows.length - 1];
    if (!last) return;
    setIsLoadingMore(true);
    try {
      const before = new Date(new Date(last.at).getTime() - 1).toISOString();
      const data = await fetchPage(before);
      setRows((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoadingMore(false);
    }
  };

  const entityDraftValid = !entityDraft || UUID_RE.test(entityDraft.trim());
  const applyEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (entityDraftValid) setParam('entity_id', entityDraft.trim());
  };

  const hasFilters = Boolean(entityId || entityType || fromDay || toDay);

  return (
    <div className="adm-page">
      <PageHeader
        title="Registro de accesos"
        description="Quién del equipo consultó datos personales, de quién, cuándo y desde qué IP (Ley 21.719). Se guarda 12 meses."
        actions={
          <button type="button" className="adm-btn" onClick={load} disabled={isLoading}>
            <RefreshCw size={16} aria-hidden="true" className={isLoading ? 'animate-spin' : ''} /> Actualizar
          </button>
        }
      />

      {error && (
        <div role="alert" className="adm-alert adm-alert--danger">{error}</div>
      )}

      <section className="adm-table-card">
        <div className="adm-toolbar" style={{ flexWrap: 'wrap', gap: 12 }}>
          <Segmented
            label="Filtrar por tipo"
            options={TYPE_FILTERS}
            value={entityType}
            onChange={(v) => setParam('entity_type', v)}
          />

          <form onSubmit={applyEntity} className="adm-field" style={{ margin: 0 }}>
            <label className="adm-field__label" htmlFor="ra-entity">ID de persona, empresa o aliado</label>
            <input
              id="ra-entity"
              className="adm-input adm-mono"
              value={entityDraft}
              onChange={(e) => setEntityDraft(e.target.value)}
              onBlur={applyEntity}
              placeholder="00000000-0000-0000-0000-000000000000"
              aria-invalid={!entityDraftValid}
              style={{ minWidth: 300 }}
            />
            {!entityDraftValid && <span className="adm-field__error">Debe ser un UUID</span>}
          </form>

          <div className="adm-field" style={{ margin: 0 }}>
            <label className="adm-field__label" htmlFor="ra-from">Desde</label>
            <input id="ra-from" type="date" className="adm-input" value={fromDay} max={toDay || undefined}
              onChange={(e) => setParam('from', e.target.value)} />
          </div>
          <div className="adm-field" style={{ margin: 0 }}>
            <label className="adm-field__label" htmlFor="ra-to">Hasta</label>
            <input id="ra-to" type="date" className="adm-input" value={toDay} min={fromDay || undefined}
              onChange={(e) => setParam('to', e.target.value)} />
          </div>

          {hasFilters && (
            <button type="button" className="adm-btn adm-btn--sm" onClick={() => setParams({}, { replace: true })}>
              <X size={14} aria-hidden="true" /> Quitar filtros
            </button>
          )}
        </div>

        <div className="adm-table-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Quién</th>
                <th scope="col">Qué consultó</th>
                <th scope="col">De quién</th>
                <th scope="col">IP</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeletonRows columns={5} />
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={ShieldCheck}
                      title={hasFilters ? 'Sin accesos con estos filtros' : 'Todavía no hay accesos registrados'}
                      text={hasFilters ? 'Prueba quitando algún filtro.' : 'Cada vez que alguien del equipo abra datos personales en el panel aparecerá aquí.'}
                    />
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const when = formatDateTime(r.at);
                  const link = entityLink(r.entity_type, r.entity_id);
                  const isSelf = !r.actor;
                  return (
                    <tr key={r.id}>
                      <td>
                        <span className="adm-cell-title">{when.day}</span>
                        <span className="adm-cell-sub">{when.time}</span>
                      </td>
                      <td>
                        {isSelf ? (
                          <span className="adm-cell-title">El propio titular</span>
                        ) : (
                          <>
                            <span className="adm-cell-title">{r.actor?.name || r.details?.actor_email || '—'}</span>
                            <span className="adm-cell-sub">{r.actor?.email || r.details?.actor_email}</span>
                          </>
                        )}
                      </td>
                      <td>
                        <span className="adm-cell-title">{r.details?.what || r.entity_type}</span>
                        {r.details?.route && <span className="adm-cell-sub adm-mono">{r.details.route}</span>}
                      </td>
                      <td>
                        <span className="adm-cell-title">{TYPE_LABEL[r.entity_type] || r.entity_type}</span>
                        {r.entity_id !== COLLECTION_ID && (
                          <span className="adm-cell-sub adm-mono">
                            {link ? <Link to={link} className="adm-link">{r.entity_id.slice(0, 8)}…</Link> : `${r.entity_id.slice(0, 8)}…`}
                            {' · '}
                            <button
                              type="button"
                              className="adm-link"
                              style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
                              onClick={() => setParam('entity_id', r.entity_id)}
                            >
                              ver sus accesos
                            </button>
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="adm-mono">{r.details?.ip || <span className="adm-cell-mute">—</span>}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {hasMore && !isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
            <button type="button" className="adm-btn" onClick={loadMore} disabled={isLoadingMore}>
              {isLoadingMore ? 'Cargando…' : 'Cargar más'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default RegistroAccesosPage;
