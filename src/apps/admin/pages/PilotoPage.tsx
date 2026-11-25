import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, Check, ClipboardCopy, Download, LifeBuoy, RefreshCw, Smartphone, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import {
  closeDiagnostic,
  getDiagnosticLogsUrl,
  getPilotDiagnostics,
  getPilotMembers,
  getPilotVehicleReports,
  setStoreAccess,
  type PilotDiagnostic,
  type PilotMember,
  type PilotVehicle,
  type PilotVehicleReport,
  type ReportReason,
} from '../services/adminPilotApi';
import { EmptyState, KpiCard, PageHeader, Segmented, StatusBadge, TableSkeletonRows, timeAgo } from '../ui';

/**
 * Piloto de empresas y equipos, visto desde CompensaTuViaje:
 *
 * - Acceso a la app: correos que las empresas invitaron y que hay que agregar
 *   a la prueba cerrada de Play Store (Grupo de Google) y a TestFlight. Se
 *   marcan aquí cuando ya tienen acceso; así la empresa lo ve en su panel.
 * - Reportes de vehículo: «no es este vehículo» de todas las empresas.
 * - Diagnósticos: «Reportar un problema» desde la app, con sus registros.
 */

type Section = 'acceso' | 'reportes' | 'diagnosticos';

const SECTIONS = [
  { value: 'acceso', label: 'Acceso a la app' },
  { value: 'reportes', label: 'Reportes de vehículo' },
  { value: 'diagnosticos', label: 'Diagnósticos' },
];

const REASON_LABEL: Record<ReportReason, string> = {
  different_vehicle: 'Maneja otro vehículo',
  wrong_data: 'Un dato está mal',
  other: 'Otro problema',
};

const vehicleText = (v: PilotVehicle | null) => (v ? [v.plate, v.label].filter(Boolean).join(' · ') : null);

/** Lo útil del contexto del celular, en una línea. */
const deviceLine = (ctx: Record<string, unknown> | null) => {
  if (!ctx) return null;
  const pick = (k: string) => (typeof ctx[k] === 'string' || typeof ctx[k] === 'number' ? String(ctx[k]) : null);
  return [pick('platform') ?? pick('os'), pick('osVersion'), pick('model') ?? pick('device'), pick('appVersion') && `app ${pick('appVersion')}`]
    .filter(Boolean)
    .join(' · ');
};

export default function PilotoPage() {
  const [params, setParams] = useSearchParams();
  const section = (SECTIONS.some((s) => s.value === params.get('ver')) ? params.get('ver') : 'acceso') as Section;
  const [onlyPending, setOnlyPending] = useState(true);
  const [members, setMembers] = useState<PilotMember[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [reports, setReports] = useState<PilotVehicleReport[]>([]);
  const [diagnostics, setDiagnostics] = useState<PilotDiagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [all, r, d] = await Promise.all([getPilotMembers(false), getPilotVehicleReports(), getPilotDiagnostics()]);
      setMembers(all);
      setPendingCount(all.filter((m) => !m.storeAccessGrantedAt).length);
      setActiveCount(all.filter((m) => m.status === 'active').length);
      setReports(r);
      setDiagnostics(d);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const visibleMembers = onlyPending ? members.filter((m) => !m.storeAccessGrantedAt) : members;
  const openReports = reports.filter((r) => r.status === 'open');
  const openDiagnostics = diagnostics.filter((d) => d.status === 'open');

  const toggleAccess = async (m: PilotMember, granted: boolean) => {
    setBusyId(m.id);
    try {
      const out = await setStoreAccess(m.id, granted);
      setMembers((ms) => ms.map((x) => (x.id === m.id ? { ...x, storeAccessGrantedAt: out.storeAccessGrantedAt } : x)));
      setPendingCount((n) => n + (granted ? -1 : 1));
      toast.success(granted ? `${m.email}: acceso marcado` : `${m.email}: marca quitada`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo guardar'));
    } finally {
      setBusyId(null);
    }
  };

  /** Copia los correos pendientes, uno por línea: listos para pegar en el Grupo de Google o TestFlight. */
  const copyPending = async () => {
    const emails = members.filter((m) => !m.storeAccessGrantedAt).map((m) => m.email);
    if (emails.length === 0) return;
    try {
      await navigator.clipboard.writeText(emails.join('\n'));
      toast.success(`${emails.length} correo(s) copiados`);
    } catch {
      toast.error('El navegador no permitió copiar');
    }
  };

  const downloadLogs = async (d: PilotDiagnostic) => {
    setBusyId(d.id);
    try {
      const url = await getDiagnosticLogsUrl(d.id);
      if (!url) throw new Error('No se pudo firmar el enlace');
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudieron descargar los registros'));
    } finally {
      setBusyId(null);
    }
  };

  const close = async (d: PilotDiagnostic) => {
    setBusyId(d.id);
    try {
      await closeDiagnostic(d.id);
      setDiagnostics((ds) => ds.map((x) => (x.id === d.id ? { ...x, status: 'closed' } : x)));
      toast.success(`${d.ticket} cerrado`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo cerrar'));
    } finally {
      setBusyId(null);
    }
  };

  const setSection = (value: string) => {
    const next = new URLSearchParams(params);
    if (value === 'acceso') next.delete('ver');
    else next.set('ver', value);
    setParams(next, { replace: true });
  };

  return (
    <div className="adm-page">
      <PageHeader
        title="Piloto de empresas"
        description="Trabajadores invitados por las empresas, sus reportes de vehículo y los problemas que envían desde la app."
        actions={
          <button type="button" className="adm-btn" onClick={load} disabled={loading}>
            <RefreshCw aria-hidden="true" /> Actualizar
          </button>
        }
      />

      {loadError && (
        <div role="alert" className="adm-alert adm-alert--danger">
          <AlertTriangle aria-hidden="true" />
          <div><b>No se pudo cargar el piloto.</b> Revisa la conexión y vuelve a intentar.</div>
        </div>
      )}

      <div className="adm-kpis">
        <KpiCard label="Sin acceso a la app" value={pendingCount} context="Agregar a Play Store y TestFlight" />
        <KpiCard label="Trabajadores activos" value={activeCount} context={`de ${members.length} invitados`} />
        <KpiCard label="Reportes de vehículo" value={openReports.length} context="Abiertos" />
        <KpiCard label="Diagnósticos" value={openDiagnostics.length} context="Sin cerrar" />
      </div>

      <section className="adm-table-card">
        <div className="adm-toolbar">
          <Segmented label="Sección" options={SECTIONS} value={section} onChange={setSection} />
          {section === 'acceso' && (
            <div className="adm-actions-row">
              <Segmented
                label="Filtrar trabajadores"
                options={[{ value: 'pending', label: 'Sin acceso' }, { value: 'all', label: 'Todos' }]}
                value={onlyPending ? 'pending' : 'all'}
                onChange={(v) => setOnlyPending(v === 'pending')}
              />
              <button type="button" className="adm-btn adm-btn--sm" onClick={copyPending} disabled={pendingCount === 0}>
                <ClipboardCopy aria-hidden="true" /> Copiar correos sin acceso
              </button>
            </div>
          )}
        </div>

        {section === 'acceso' && (
          <div className="adm-table-scroll">
            <table className="adm-table">
              <caption className="sr-only">Trabajadores invitados por las empresas del piloto</caption>
              <thead>
                <tr>
                  <th scope="col">Trabajador</th>
                  <th scope="col">Empresa</th>
                  <th scope="col">Vehículo</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Último uso</th>
                  <th scope="col" className="adm-col-actions">Acceso a la app</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeletonRows columns={6} />
                ) : visibleMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={Smartphone}
                        title={onlyPending ? 'Todos tienen acceso a la app' : 'Aún no hay trabajadores invitados'}
                        text={onlyPending ? 'Cuando una empresa invite correos nuevos, aparecerán aquí y llegará un aviso a Telegram.' : undefined}
                      />
                    </td>
                  </tr>
                ) : (
                  visibleMembers.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <span className="adm-cell-title">{m.name || m.email}</span>
                        {m.name && <span className="adm-cell-sub">{m.email}</span>}
                        {m.invitedAt && <span className="adm-cell-sub">Invitado {timeAgo(m.invitedAt).toLowerCase()}</span>}
                      </td>
                      <td>{m.company.name}</td>
                      <td>
                        {vehicleText(m.vehicle) ?? <span className="adm-cell-mute">Sin vehículo</span>}
                        {m.vehicle?.refrigerated && <span className="adm-cell-sub">Refrigerado</span>}
                      </td>
                      <td>
                        <StatusBadge tone={m.status === 'active' ? 'success' : 'warning'}>
                          {m.status === 'active' ? 'Activo' : 'Invitado'}
                        </StatusBadge>
                      </td>
                      <td>
                        {m.lastTripAt ? (
                          <>Viaje {timeAgo(m.lastTripAt).toLowerCase()}</>
                        ) : m.lastLoginAt ? (
                          <>Entró {timeAgo(m.lastLoginAt).toLowerCase()}</>
                        ) : (
                          <span className="adm-cell-mute">Nunca</span>
                        )}
                      </td>
                      <td className="adm-col-actions">
                        {m.storeAccessGrantedAt ? (
                          <div className="adm-actions-row" style={{ justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                            <StatusBadge tone="success">Con acceso</StatusBadge>
                            <button
                              type="button"
                              className="adm-btn adm-btn--sm"
                              disabled={busyId === m.id}
                              onClick={() => toggleAccess(m, false)}
                              aria-label={`Quitar la marca de acceso de ${m.email}`}
                            >
                              Quitar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="adm-btn adm-btn--sm adm-btn--primary"
                            disabled={busyId === m.id}
                            onClick={() => toggleAccess(m, true)}
                            aria-label={`Marcar que ${m.email} ya tiene acceso a la app`}
                          >
                            <Check aria-hidden="true" /> Ya tiene acceso
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {section === 'reportes' && (
          <div className="adm-table-scroll">
            <table className="adm-table">
              <caption className="sr-only">Reportes de vehículo de todas las empresas</caption>
              <thead>
                <tr>
                  <th scope="col">Trabajador</th>
                  <th scope="col">Empresa</th>
                  <th scope="col">Motivo</th>
                  <th scope="col">Asignado</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeletonRows columns={6} />
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState icon={Truck} title="Sin reportes de vehículo" text="Los resuelve el jefe de cada empresa desde su sección Equipo." />
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => (
                    <tr key={r.id}>
                      <td><span className="adm-cell-title">{r.member?.email ?? '—'}</span></td>
                      <td>{r.company.name}</td>
                      <td>
                        {REASON_LABEL[r.reason] ?? r.reason}
                        {r.actual.plate && <span className="adm-cell-sub">Dice que maneja {r.actual.plate}</span>}
                        {r.note && <span className="adm-cell-sub">«{r.note}»</span>}
                      </td>
                      <td>{vehicleText(r.assignedVehicle) ?? <span className="adm-cell-mute">—</span>}</td>
                      <td>
                        <StatusBadge tone={r.status === 'open' ? 'warning' : 'success'}>
                          {r.status === 'open' ? 'Abierto' : 'Resuelto'}
                        </StatusBadge>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(r.createdAt).toLocaleDateString('es-CL')}
                        <span className="adm-cell-sub">{timeAgo(r.createdAt)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {section === 'diagnosticos' && (
          <div className="adm-table-scroll">
            <table className="adm-table">
              <caption className="sr-only">Problemas reportados desde la app</caption>
              <thead>
                <tr>
                  <th scope="col">Ticket</th>
                  <th scope="col">Persona</th>
                  <th scope="col">Mensaje</th>
                  <th scope="col">Celular</th>
                  <th scope="col">Fecha</th>
                  <th scope="col" className="adm-col-actions"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeletonRows columns={6} />
                ) : diagnostics.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState icon={LifeBuoy} title="Sin diagnósticos" text="Llegan cuando alguien toca «Reportar un problema» en la app." />
                    </td>
                  </tr>
                ) : (
                  diagnostics.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <span className="adm-cell-title">{d.ticket}</span>
                        <StatusBadge tone={d.status === 'open' ? 'warning' : 'neutral'}>{d.status === 'open' ? 'Abierto' : 'Cerrado'}</StatusBadge>
                      </td>
                      <td>
                        <span className="adm-cell-title">{d.user.name || d.user.email || '—'}</span>
                        {d.user.name && d.user.email && <span className="adm-cell-sub">{d.user.email}</span>}
                      </td>
                      <td style={{ maxWidth: '28rem', whiteSpace: 'normal' }}>
                        {d.message}
                        {d.context && (
                          <details>
                            <summary className="adm-cell-sub" style={{ cursor: 'pointer' }}>Contexto del celular</summary>
                            <pre style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {JSON.stringify(d.context, null, 2)}
                            </pre>
                          </details>
                        )}
                      </td>
                      <td>{deviceLine(d.context) || <span className="adm-cell-mute">—</span>}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(d.createdAt).toLocaleDateString('es-CL')}
                        <span className="adm-cell-sub">{timeAgo(d.createdAt)}</span>
                      </td>
                      <td className="adm-col-actions">
                        <div className="adm-actions-row" style={{ justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                          {d.hasLogs && (
                            <button type="button" className="adm-btn adm-btn--sm" disabled={busyId === d.id} onClick={() => downloadLogs(d)}>
                              <Download aria-hidden="true" /> Registros
                            </button>
                          )}
                          {d.status === 'open' && (
                            <button type="button" className="adm-btn adm-btn--sm" disabled={busyId === d.id} onClick={() => close(d)}>
                              <Check aria-hidden="true" /> Cerrar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
