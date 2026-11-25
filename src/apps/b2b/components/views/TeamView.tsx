import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertTriangle,
  CarFront,
  ClipboardList,
  Leaf,
  Plus,
  Route,
  ShieldCheck,
  Trash2,
  Truck,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  archiveTeamVehicle,
  assignMemberVehicle,
  createTeamVehicle,
  getTeamMembers,
  getTeamShifts,
  getTeamSummary,
  getTeamVehicles,
  getVehicleCatalog,
  getVehicleReports,
  inviteTeamMembers,
  removeTeamMember,
  resolveVehicleReport,
  updateTeamVehicle,
  type ReportReason,
  type TeamMember,
  type TeamShift,
  type TeamSummary,
  type TeamVehicle,
  type VehicleCatalogMode,
  type VehicleFuel,
  type VehicleInput,
  type VehicleMode,
  type VehicleReport,
} from '../../services/teamService';
import {
  Badge,
  btn,
  Card,
  cx,
  Dialog,
  EmptyState,
  ErrorState,
  fmtDate,
  fmtInt,
  fmtNum,
  fmtTons,
  inputCls,
  labelCls,
  PageHeader,
  Skeleton,
  StatCard,
  type Tone,
} from '../../ui';
import './TeamView.css';

// ─── Textos ──────────────────────────────────────────────────────────────────

const MODE_LABEL: Record<VehicleMode, string> = {
  truck: 'Camión',
  van: 'Furgón',
  car: 'Auto o camioneta',
  motorcycle: 'Moto',
};

const FUEL_LABEL: Record<VehicleFuel, string> = {
  diesel: 'Diésel',
  gasoline: 'Gasolina',
  hybrid: 'Híbrido',
  electric: 'Eléctrico',
  cng: 'Gas natural (GNC)',
};

const REASON_LABEL: Record<ReportReason, string> = {
  different_vehicle: 'Maneja otro vehículo',
  wrong_data: 'Un dato del vehículo está mal',
  other: 'Otro problema',
};

const SKIP_LABEL: Record<string, string> = {
  invalid_email: 'el correo no es válido',
  other_company: 'ya pertenece a otra empresa',
  already_invited: 'ya estaba invitado',
};

const MEMBER_STATUS: Record<string, { label: string; tone: Tone }> = {
  invited: { label: 'Invitado', tone: 'warning' },
  active: { label: 'Activo', tone: 'success' },
};

const apiMessage = (err: unknown, fallback: string) =>
  (err as { message?: string })?.message || fallback;

const vehicleName = (v: TeamVehicle | null | undefined) =>
  v ? [v.plate, v.label].filter(Boolean).join(' · ') : 'Sin vehículo';

// ─── Validación accesible ────────────────────────────────────────────────────

/**
 * Mantiene aria-invalid y el mensaje de error en aria-describedby iguales a lo
 * que se ve: el error aparece con :user-invalid (tras usar el campo o enviar),
 * y solo entonces se enlaza, para que el lector no lo lea desde el principio.
 */
function syncValidity(e: React.SyntheticEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  const el = e.currentTarget;
  const invalid = el.matches(':user-invalid');
  el.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  const errorId = el.dataset.error;
  if (!errorId) return;
  const ids = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter((id) => id && id !== errorId);
  if (invalid) ids.push(errorId);
  if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
  else el.removeAttribute('aria-describedby');
}
// Sin onChange: lo usa cada campo para su estado; onInput cubre lo mismo.
const validityHandlers = { onBlur: syncValidity, onInput: syncValidity, onInvalid: syncValidity };

const FieldError: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <p id={id} className="team-field-error m-0 mt-1.5 items-start gap-1.5 text-xs text-rose-700">
    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-px" role="img" aria-label="Error" />
    <span>{children}</span>
  </p>
);

// ─── Tabla responsiva ────────────────────────────────────────────────────────

const Table: React.FC<{ caption: string; headers: string[]; children: React.ReactNode }> = ({ caption, headers, children }) => {
  const id = useId();
  return (
    <div className="team-table-wrap" tabIndex={0} role="region" aria-labelledby={id}>
      <table className="team-table text-sm">
        <caption id={id} className="sr-only">{caption}</caption>
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h) => (
              <th key={h} scope="col" className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};
const tdCls = 'px-4 py-3 align-top border-b border-gray-100 text-gray-700';
const thRowCls = 'px-4 py-3 align-top border-b border-gray-100 text-left font-normal';

// ─── Pestañas ────────────────────────────────────────────────────────────────

type TabId = 'members' | 'vehicles' | 'shifts' | 'reports';

/**
 * Pestañas con `focusgroup` (flechas entre pestañas). Donde el navegador aún no
 * lo soporta, el mismo manejo de flechas se hace aquí, sin dependencias.
 */
const Tabs: React.FC<{
  tabs: { id: TabId; label: string; count?: number }[];
  active: TabId;
  onChange: (id: TabId) => void;
  idPrefix: string;
}> = ({ tabs, active, onChange, idPrefix }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const nativeFocusgroup = typeof HTMLElement !== 'undefined' && Object.prototype.hasOwnProperty.call(HTMLElement.prototype, 'focusGroup');

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (nativeFocusgroup) return;
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.id === active);
    const next =
      e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [active]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Secciones del equipo"
      onKeyDown={onKeyDown}
      className="flex overflow-x-auto border-b border-gray-200 gap-1"
      {...({ focusgroup: 'tablist nomemory' } as object)}
    >
      {tabs.map((t) => {
        const selected = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${t.id}`}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            {...(selected ? ({ focusgroupstart: '' } as object) : {})}
            className={cx(
              'relative flex-none flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-0 bg-transparent cursor-pointer transition-colors',
              selected
                ? 'text-brand-900 after:absolute after:inset-x-0 after:bottom-0 after:border-b-[3px] after:border-brand-700'
                : 'text-gray-500 hover:text-gray-900',
            )}
          >
            {t.label}
            {t.count != null && t.count > 0 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

// ─── Diálogo: invitar ────────────────────────────────────────────────────────

const InviteDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  vehicles: TeamVehicle[];
  onDone: () => void;
}> = ({ open, onClose, vehicles, onDone }) => {
  const formId = useId();
  const [rows, setRows] = useState<{ key: number; email: string; vehicleId: string }[]>([{ key: 1, email: '', vehicleId: '' }]);
  const [busy, setBusy] = useState(false);
  const nextKey = useRef(2);

  useEffect(() => {
    if (open) setRows([{ key: 1, email: '', vehicleId: '' }]);
  }, [open]);

  const update = (key: number, patch: Partial<{ email: string; vehicleId: string }>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const members = rows.filter((r) => r.email.trim()).map((r) => ({ email: r.email.trim(), vehicleId: r.vehicleId || null }));
    if (members.length === 0) return;
    setBusy(true);
    try {
      const result = await inviteTeamMembers(members);
      if (result.invited.length > 0) {
        toast.success(
          result.invited.length === 1
            ? 'Invitamos a 1 trabajador. Te avisaremos cuando tenga acceso a la app.'
            : `Invitamos a ${result.invited.length} trabajadores. Te avisaremos cuando tengan acceso a la app.`,
        );
      }
      for (const s of result.skipped) toast.warning(`${s.email ?? 'Un correo'}: ${SKIP_LABEL[s.reason] ?? 'no se pudo invitar'}`);
      onDone();
      onClose();
    } catch (err) {
      toast.error(apiMessage(err, 'No pudimos enviar las invitaciones'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      busy={busy}
      size="lg"
      title="Invitar trabajadores"
      footer={
        <>
          <button type="button" className={btn.secondary} onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="submit" form={formId} className={btn.primary} disabled={busy}>
            {busy ? 'Invitando…' : 'Invitar'}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="team-form space-y-4">
        <p className="m-0 text-sm text-gray-600">
          Usa el correo de Google (o Apple ID, en iPhone) con que cada trabajador entrará a la app. Cuando lo invites, le damos acceso a
          la versión de prueba y la app lo une a tu empresa al iniciar sesión.
        </p>
        <ul className="m-0 p-0 list-none space-y-3">
          {rows.map((r, i) => {
            const emailId = `${formId}-email-${r.key}`;
            const errId = `${emailId}-error`;
            return (
              <li key={r.key} className="grid grid-cols-1 sm:grid-cols-[1fr_14rem_auto] gap-2 items-start">
                <div>
                  <label htmlFor={emailId} className={i === 0 ? labelCls : 'sr-only'}>
                    Correo
                  </label>
                  <input
                    id={emailId}
                    type="email"
                    required={i === 0}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="nombre@gmail.com"
                    value={r.email}
                    onChange={(e) => update(r.key, { email: e.target.value })}
                    data-error={errId}
                    aria-invalid="false"
                    {...validityHandlers}
                    className={inputCls}
                  />
                  <FieldError id={errId}>Escribe un correo con el formato nombre@dominio.com.</FieldError>
                </div>
                <div>
                  <label htmlFor={`${emailId}-v`} className={i === 0 ? labelCls : 'sr-only'}>
                    Vehículo
                  </label>
                  <select
                    id={`${emailId}-v`}
                    value={r.vehicleId}
                    onChange={(e) => update(r.key, { vehicleId: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">Sin vehículo por ahora</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {vehicleName(v)}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className={cx(btn.icon, i === 0 && 'sm:mt-[1.85rem]')}
                  aria-label={`Quitar la fila ${i + 1}`}
                  disabled={rows.length === 1}
                  onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className={cx(btn.ghost, btn.sm)}
          disabled={rows.length >= 50}
          onClick={() => setRows((rs) => [...rs, { key: nextKey.current++, email: '', vehicleId: '' }])}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Agregar otro correo
        </button>
      </form>
    </Dialog>
  );
};

// ─── Diálogo: vehículo ───────────────────────────────────────────────────────

const emptyVehicle = (catalog: VehicleCatalogMode[]): VehicleInput => {
  const first = catalog[0];
  return {
    mode: first?.mode ?? 'truck',
    subtype: first?.subtypes[0]?.code ?? '',
    plate: '',
    brand: '',
    model: '',
    year: null,
    fuel: 'diesel',
    refrigerated: false,
    ownership: 'company',
    notes: '',
  };
};

const VehicleDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  catalog: VehicleCatalogMode[];
  vehicle: TeamVehicle | null;
  onDone: () => void;
}> = ({ open, onClose, catalog, vehicle, onDone }) => {
  const formId = useId();
  const [form, setForm] = useState<VehicleInput>(() => emptyVehicle(catalog));
  const [busy, setBusy] = useState(false);
  const maxYear = new Date().getFullYear() + 1;

  useEffect(() => {
    if (!open) return;
    setForm(
      vehicle
        ? {
            mode: vehicle.mode,
            subtype: vehicle.subtype,
            plate: vehicle.plate ?? '',
            brand: vehicle.brand ?? '',
            model: vehicle.model ?? '',
            year: vehicle.year,
            fuel: vehicle.fuel,
            refrigerated: vehicle.refrigerated,
            ownership: vehicle.ownership,
            notes: vehicle.notes ?? '',
          }
        : emptyVehicle(catalog),
    );
  }, [open, vehicle, catalog]);

  const subtypes = catalog.find((m) => m.mode === form.mode)?.subtypes ?? [];
  const set = (patch: Partial<VehicleInput>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const payload: VehicleInput = {
      ...form,
      plate: form.plate?.trim() || null,
      brand: form.brand?.trim() || null,
      model: form.model?.trim() || null,
      notes: form.notes?.trim() || null,
      refrigerated: form.mode === 'truck' || form.mode === 'van' ? Boolean(form.refrigerated) : false,
    };
    try {
      if (vehicle) await updateTeamVehicle(vehicle.id, payload);
      else await createTeamVehicle(payload);
      toast.success(vehicle ? 'Vehículo actualizado' : 'Vehículo registrado');
      onDone();
      onClose();
    } catch (err) {
      toast.error(apiMessage(err, 'No pudimos guardar el vehículo'));
    } finally {
      setBusy(false);
    }
  };

  const id = (name: string) => `${formId}-${name}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      busy={busy}
      size="lg"
      title={vehicle ? 'Editar vehículo' : 'Registrar vehículo'}
      footer={
        <>
          <button type="button" className={btn.secondary} onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="submit" form={formId} className={btn.primary} disabled={busy || subtypes.length === 0}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="team-form grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={id('mode')} className={labelCls}>Tipo</label>
          <select
            id={id('mode')}
            value={form.mode}
            onChange={(e) => {
              const mode = e.target.value as VehicleMode;
              set({ mode, subtype: catalog.find((m) => m.mode === mode)?.subtypes[0]?.code ?? '' });
            }}
            className={inputCls}
          >
            {catalog.map((m) => (
              <option key={m.mode} value={m.mode}>{MODE_LABEL[m.mode]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={id('subtype')} className={labelCls}>Tamaño o modelo</label>
          <select id={id('subtype')} required value={form.subtype} onChange={(e) => set({ subtype: e.target.value })} className={inputCls}>
            {subtypes.map((s) => (
              <option key={s.code} value={s.code}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={id('plate')} className={labelCls}>Patente</label>
          <input
            id={id('plate')}
            type="text"
            maxLength={20}
            autoComplete="off"
            value={form.plate ?? ''}
            onChange={(e) => set({ plate: e.target.value.toUpperCase() })}
            placeholder="KJTR-21"
            className={cx(inputCls, 'uppercase')}
          />
        </div>
        <div>
          <label htmlFor={id('fuel')} className={labelCls}>Combustible</label>
          <select id={id('fuel')} value={form.fuel ?? ''} onChange={(e) => set({ fuel: (e.target.value || null) as VehicleFuel | null })} className={inputCls}>
            <option value="">No lo sé</option>
            {(Object.keys(FUEL_LABEL) as VehicleFuel[]).map((f) => (
              <option key={f} value={f}>{FUEL_LABEL[f]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={id('brand')} className={labelCls}>Marca</label>
          <input id={id('brand')} type="text" maxLength={60} value={form.brand ?? ''} onChange={(e) => set({ brand: e.target.value })} className={inputCls} />
        </div>
        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <div>
            <label htmlFor={id('model')} className={labelCls}>Modelo</label>
            <input id={id('model')} type="text" maxLength={60} value={form.model ?? ''} onChange={(e) => set({ model: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label htmlFor={id('year')} className={labelCls}>Año</label>
            <input
              id={id('year')}
              type="number"
              inputMode="numeric"
              min={1950}
              max={maxYear}
              value={form.year ?? ''}
              onChange={(e) => set({ year: e.target.value ? Number(e.target.value) : null })}
              data-error={`${id('year')}-error`}
              aria-invalid="false"
              {...validityHandlers}
              className={inputCls}
            />
            <FieldError id={`${id('year')}-error`}>Entre 1950 y {maxYear}.</FieldError>
          </div>
        </div>

        <fieldset className="sm:col-span-2 m-0 p-0 border-0">
          <legend className={labelCls}>¿De quién es el vehículo?</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {([
              ['company', 'De la empresa'],
              ['third_party', 'De terceros (subcontratado o del trabajador)'],
            ] as const).map(([value, label]) => (
              <label key={value} className="inline-flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                <input
                  type="radio"
                  name={id('ownership')}
                  value={value}
                  checked={form.ownership === value}
                  onChange={() => set({ ownership: value })}
                  className="w-4 h-4 accent-brand-700"
                />
                {label}
              </label>
            ))}
          </div>
          <p className="m-0 mt-1.5 text-xs text-gray-500">
            Define cómo se reportan sus emisiones: propio es Alcance 1; de terceros, Alcance 3.
          </p>
        </fieldset>

        {(form.mode === 'truck' || form.mode === 'van') && (
          <label className="sm:col-span-2 inline-flex items-start gap-2 text-sm text-gray-800 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(form.refrigerated)}
              onChange={(e) => set({ refrigerated: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-brand-700"
            />
            <span>
              Refrigerado
              <span className="block text-xs text-gray-500">El equipo de frío suma emisiones; usamos el factor refrigerado.</span>
            </span>
          </label>
        )}

        <div className="sm:col-span-2">
          <label htmlFor={id('notes')} className={labelCls}>Notas para el trabajador</label>
          <textarea
            id={id('notes')}
            maxLength={500}
            rows={2}
            value={form.notes ?? ''}
            onChange={(e) => set({ notes: e.target.value })}
            placeholder="Ej.: base Quilicura, turno de mañana"
            className={cx(inputCls, 'resize-y')}
          />
          <p className="m-0 mt-1 text-xs text-gray-500">El trabajador ve todos estos datos en la app al confirmar su vehículo.</p>
        </div>
      </form>
    </Dialog>
  );
};

// ─── Diálogo: resolver reporte ───────────────────────────────────────────────

const ResolveDialog: React.FC<{
  report: VehicleReport | null;
  vehicles: TeamVehicle[];
  onClose: () => void;
  onDone: () => void;
}> = ({ report, vehicles, onClose, onDone }) => {
  const formId = useId();
  const [vehicleId, setVehicleId] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!report) return;
    // Si el trabajador dio una patente que ya está registrada, se propone esa.
    const match = report.actual.plate ? vehicles.find((v) => v.plate === report.actual.plate) : null;
    setVehicleId(match?.id ?? '');
    setNote('');
  }, [report, vehicles]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;
    setBusy(true);
    try {
      const out = await resolveVehicleReport(report.id, { vehicleId: vehicleId || null, resolutionNote: note.trim() || undefined });
      toast.success(
        out.recalculatedTrips > 0
          ? `Reporte resuelto. Recalculamos ${out.recalculatedTrips} viaje(s) con el vehículo correcto.`
          : 'Reporte resuelto',
      );
      onDone();
      onClose();
    } catch (err) {
      toast.error(apiMessage(err, 'No pudimos resolver el reporte'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={Boolean(report)}
      onClose={onClose}
      busy={busy}
      title="Resolver reporte de vehículo"
      footer={
        <>
          <button type="button" className={btn.secondary} onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="submit" form={formId} className={btn.primary} disabled={busy}>
            {busy ? 'Guardando…' : 'Resolver'}
          </button>
        </>
      }
    >
      {report && (
        <form id={formId} onSubmit={submit} className="team-form space-y-4">
          <dl className="m-0 grid grid-cols-1 gap-2 rounded-xl bg-gray-50 p-3 text-sm">
            <div><dt className="inline text-gray-500">Trabajador: </dt><dd className="inline m-0">{report.member?.name || report.member?.email}</dd></div>
            <div><dt className="inline text-gray-500">Motivo: </dt><dd className="inline m-0">{REASON_LABEL[report.reason]}</dd></div>
            <div><dt className="inline text-gray-500">Asignado: </dt><dd className="inline m-0">{vehicleName(report.assignedVehicle)}</dd></div>
            {report.actual.plate && (
              <div><dt className="inline text-gray-500">Dice que maneja: </dt><dd className="inline m-0 font-semibold">{report.actual.plate}</dd></div>
            )}
            {report.note && <div><dt className="inline text-gray-500">Comentario: </dt><dd className="inline m-0">{report.note}</dd></div>}
          </dl>
          <div>
            <label htmlFor={`${formId}-v`} className={labelCls}>Vehículo correcto</label>
            <select id={`${formId}-v`} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className={inputCls}>
              <option value="">Dejar el que tiene asignado</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{vehicleName(v)}</option>
              ))}
            </select>
            <p className="m-0 mt-1 text-xs text-gray-500">
              Sus viajes pendientes de revisión se recalculan con este vehículo. Si no está en la lista, regístralo primero.
            </p>
          </div>
          <div>
            <label htmlFor={`${formId}-n`} className={labelCls}>Nota (opcional)</label>
            <textarea id={`${formId}-n`} maxLength={500} rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={cx(inputCls, 'resize-y')} />
          </div>
        </form>
      )}
    </Dialog>
  );
};

// ─── Diálogo: confirmar ──────────────────────────────────────────────────────

const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  text: React.ReactNode;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}> = ({ open, title, text, confirmLabel, onCancel, onConfirm }) => {
  const [busy, setBusy] = useState(false);
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      busy={busy}
      title={title}
      footer={
        <>
          <button type="button" className={btn.secondary} onClick={onCancel} disabled={busy} autoFocus>
            Cancelar
          </button>
          <button
            type="button"
            className={btn.danger}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="m-0">{text}</p>
    </Dialog>
  );
};

// ─── Vista ───────────────────────────────────────────────────────────────────

const TeamView: React.FC = () => {
  const tabsId = useId();
  const [summary, setSummary] = useState<TeamSummary | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [vehicles, setVehicles] = useState<TeamVehicle[]>([]);
  const [reports, setReports] = useState<VehicleReport[]>([]);
  const [shifts, setShifts] = useState<TeamShift[]>([]);
  const [catalog, setCatalog] = useState<VehicleCatalogMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<TabId>('members');

  const [inviteOpen, setInviteOpen] = useState(false);
  const [vehicleDialog, setVehicleDialog] = useState<{ open: boolean; vehicle: TeamVehicle | null }>({ open: false, vehicle: null });
  const [resolving, setResolving] = useState<VehicleReport | null>(null);
  const [removing, setRemoving] = useState<TeamMember | null>(null);
  const [archiving, setArchiving] = useState<TeamVehicle | null>(null);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      const [s, m, v, r, sh] = await Promise.all([
        getTeamSummary(),
        getTeamMembers(),
        getTeamVehicles(),
        getVehicleReports('open'),
        getTeamShifts(),
      ]);
      setSummary(s);
      setMembers(m);
      setVehicles(v);
      setReports(r);
      setShifts(sh);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    getVehicleCatalog().then(setCatalog).catch(() => setCatalog([]));
  }, [load]);

  const assign = async (member: TeamMember, vehicleId: string) => {
    try {
      const updated = await assignMemberVehicle(member.id, vehicleId || null);
      setMembers((ms) => ms.map((m) => (m.id === member.id ? updated : m)));
      toast.success(vehicleId ? 'Vehículo asignado. La app le pedirá confirmarlo en su próximo turno.' : 'Vehículo quitado');
      getTeamVehicles().then(setVehicles).catch(() => {});
    } catch (err) {
      toast.error(apiMessage(err, 'No pudimos asignar el vehículo'));
    }
  };

  const tabs = useMemo(
    () => [
      { id: 'members' as const, label: 'Trabajadores', count: members.length },
      { id: 'vehicles' as const, label: 'Vehículos', count: vehicles.length },
      { id: 'shifts' as const, label: 'Turnos' },
      { id: 'reports' as const, label: 'Reportes', count: reports.length },
    ],
    [members.length, vehicles.length, reports.length],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }
  if (failed) return <ErrorState onRetry={load} />;

  const panel = (id: TabId, children: React.ReactNode) => (
    <div role="tabpanel" id={`${tabsId}-panel-${id}`} aria-labelledby={`${tabsId}-tab-${id}`} hidden={tab !== id}>
      <div className="pt-5">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipo"
        subtitle="Invita a tus trabajadores, asígnales su vehículo y sigue sus viajes de trabajo."
        actions={
          <>
            <button type="button" className={btn.secondary} onClick={() => setVehicleDialog({ open: true, vehicle: null })} disabled={catalog.length === 0}>
              <Truck className="w-4 h-4" aria-hidden="true" />
              Registrar vehículo
            </button>
            <button type="button" className={btn.primary} onClick={() => setInviteOpen(true)}>
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              Invitar trabajadores
            </button>
          </>
        }
      />

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Trabajadores"
            value={fmtInt(summary.members.active)}
            hint={summary.members.invited > 0 ? `${summary.members.invited} con invitación pendiente` : 'Activos en la app'}
          />
          <StatCard icon={Route} label="Viajes de trabajo" value={fmtInt(summary.totals.trips)} hint="Últimos 30 días" />
          <StatCard icon={CarFront} label="Recorrido" value={fmtNum(summary.totals.km, 0)} unit="km" hint="Últimos 30 días" />
          <StatCard icon={Leaf} label="Emisiones" value={fmtTons(summary.totals.co2Tons)} unit="CO₂e" hint="Las compensa tu empresa" />
        </div>
      )}

      {reports.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" aria-hidden="true" />
          <p className="m-0 flex-1">
            {reports.length === 1 ? 'Un trabajador reportó' : `${reports.length} trabajadores reportaron`} un problema con su vehículo. Sus viajes quedan
            pendientes de revisión hasta que lo resuelvas.
          </p>
          <button type="button" className={cx(btn.secondary, btn.sm)} onClick={() => setTab('reports')}>
            Revisar
          </button>
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="px-4 pt-2">
          <Tabs tabs={tabs} active={tab} onChange={setTab} idPrefix={tabsId} />
        </div>
        <div className="px-4 pb-4">
          {panel(
            'members',
            members.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Aún no invitas trabajadores"
                text="Escribe sus correos de Google y, si quieres, el vehículo de cada uno. Les damos acceso a la app de prueba."
                action={
                  <button type="button" className={btn.primary} onClick={() => setInviteOpen(true)}>
                    <UserPlus className="w-4 h-4" aria-hidden="true" />
                    Invitar trabajadores
                  </button>
                }
              />
            ) : (
              <>
                <Table caption="Trabajadores del equipo" headers={['Trabajador', 'Estado', 'Vehículo', '']}>
                  {members.map((m) => {
                    const status = MEMBER_STATUS[m.status] ?? { label: m.status, tone: 'neutral' as Tone };
                    return (
                      <tr key={m.id}>
                        <th scope="row" className={thRowCls}>
                          <span className="block font-semibold text-gray-900">{m.name || m.email}</span>
                          {m.name && <span className="block text-xs text-gray-500">{m.email}</span>}
                        </th>
                        <td className={tdCls} data-label="Estado">
                          <span className="flex flex-wrap gap-1.5">
                            <Badge tone={status.tone}>{status.label}</Badge>
                            {m.appAccess === 'pending' && <Badge tone="neutral">Preparando su acceso a la app</Badge>}
                            {m.openReport && (
                              <Badge tone="danger" icon={AlertTriangle}>Reportó un problema</Badge>
                            )}
                          </span>
                        </td>
                        <td className={tdCls} data-label="Vehículo">
                          <label htmlFor={`veh-${m.id}`} className="sr-only">Vehículo de {m.name || m.email}</label>
                          <select
                            id={`veh-${m.id}`}
                            value={m.vehicle?.id ?? ''}
                            onChange={(e) => assign(m, e.target.value)}
                            className={cx(inputCls, 'py-2 min-w-48')}
                          >
                            <option value="">Sin vehículo</option>
                            {vehicles.map((v) => (
                              <option key={v.id} value={v.id}>{vehicleName(v)}</option>
                            ))}
                          </select>
                          {m.vehicle && (
                            <span className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                              {m.vehicleConfirmedAt ? (
                                <><ShieldCheck className="w-3.5 h-3.5 text-brand-700" aria-hidden="true" />Confirmado el {fmtDate(m.vehicleConfirmedAt)}</>
                              ) : (
                                'Lo confirmará al iniciar su próximo turno'
                              )}
                            </span>
                          )}
                        </td>
                        <td className={cx(tdCls, 'text-right')}>
                          <button type="button" className={cx(btn.ghost, btn.sm, 'text-rose-700 hover:bg-rose-50')} onClick={() => setRemoving(m)}>
                            Quitar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </Table>
                <p className="m-0 mt-4 text-xs text-gray-500">
                  Solo ves los viajes que tus trabajadores marcan como «Trabajo»: fecha, kilómetros, medio y CO₂e. No ves su recorrido en el mapa
                  ni sus viajes personales.
                </p>
              </>
            ),
          )}

          {panel(
            'vehicles',
            vehicles.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="Aún no registras vehículos"
                text="Registra cada vehículo con su patente y tamaño. Así calculamos las emisiones como corresponde y el trabajador no tiene que elegir nada."
                action={
                  <button type="button" className={btn.primary} onClick={() => setVehicleDialog({ open: true, vehicle: null })} disabled={catalog.length === 0}>
                    <Truck className="w-4 h-4" aria-hidden="true" />
                    Registrar vehículo
                  </button>
                }
              />
            ) : (
              <Table caption="Vehículos de trabajo" headers={['Vehículo', 'Detalle', 'Asignado a', '']}>
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <th scope="row" className={thRowCls}>
                      <span className="block font-semibold text-gray-900">{v.plate || 'Sin patente'}</span>
                      <span className="block text-xs text-gray-500">{v.label}</span>
                    </th>
                    <td className={tdCls} data-label="Detalle">
                      <span className="block">{[v.brand, v.model, v.year].filter(Boolean).join(' ') || '—'}</span>
                      <span className="mt-1 flex flex-wrap gap-1.5">
                        {v.fuel && <Badge tone="neutral">{FUEL_LABEL[v.fuel]}</Badge>}
                        {v.refrigerated && <Badge tone="info">Refrigerado</Badge>}
                        <Badge tone="neutral">{v.ownership === 'company' ? 'De la empresa' : 'De terceros'}</Badge>
                      </span>
                    </td>
                    <td className={tdCls} data-label="Asignado a">
                      {v.assignedTo && v.assignedTo.length > 0 ? v.assignedTo.map((a) => a.email).join(', ') : 'Nadie'}
                    </td>
                    <td className={cx(tdCls, 'text-right whitespace-nowrap')}>
                      <button type="button" className={cx(btn.ghost, btn.sm)} onClick={() => setVehicleDialog({ open: true, vehicle: v })}>
                        Editar
                      </button>
                      <button type="button" className={cx(btn.ghost, btn.sm, 'text-rose-700 hover:bg-rose-50')} onClick={() => setArchiving(v)}>
                        Archivar
                      </button>
                    </td>
                  </tr>
                ))}
              </Table>
            ),
          )}

          {panel(
            'shifts',
            shifts.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="Todavía no hay turnos"
                text="Cuando tus trabajadores inicien turno en la app, verás aquí los kilómetros que midió la app y los del odómetro."
              />
            ) : (
              <>
                <Table caption="Turnos de los últimos 30 días" headers={['Trabajador', 'Turno', 'Vehículo', 'Km app', 'Km odómetro', 'Diferencia']}>
                  {shifts.map((s) => (
                    <tr key={s.id}>
                      <th scope="row" className={thRowCls}>
                        <span className="block font-semibold text-gray-900">{s.member.name || s.member.email}</span>
                        <span className="block text-xs text-gray-500">{s.trips} viaje(s) · {fmtNum(s.co2Kg, 1)} kg CO₂e</span>
                      </th>
                      <td className={tdCls} data-label="Turno">
                        <span className="block">{fmtDate(s.startedAt)}</span>
                        {s.endedAt ? (
                          s.endReason === 'auto_timeout' && <span className="block text-xs text-amber-700">Cerrado automáticamente</span>
                        ) : (
                          <Badge tone="success">En curso</Badge>
                        )}
                      </td>
                      <td className={tdCls} data-label="Vehículo">{vehicleName(s.vehicle)}</td>
                      <td className={cx(tdCls, 'tabular-nums')} data-label="Km app">{fmtNum(s.appKm, 1)}</td>
                      <td className={cx(tdCls, 'tabular-nums')} data-label="Km odómetro">{s.odometerKm != null ? fmtInt(s.odometerKm) : '—'}</td>
                      <td className={cx(tdCls, 'tabular-nums')} data-label="Diferencia">
                        {s.differencePct != null ? `${s.differencePct > 0 ? '+' : ''}${fmtNum(s.differencePct, 1)} %` : '—'}
                      </td>
                    </tr>
                  ))}
                </Table>
                <p className="m-0 mt-4 text-xs text-gray-500">
                  «Km app» suma los viajes que la app registró durante el turno. Una diferencia grande con el odómetro suele indicar permisos de ubicación
                  desactivados en el celular.
                </p>
              </>
            ),
          )}

          {panel(
            'reports',
            reports.length === 0 ? (
              <EmptyState icon={ShieldCheck} title="Sin reportes abiertos" text="Si un trabajador dice que maneja otro vehículo, aparecerá aquí." />
            ) : (
              <ul className="m-0 p-0 list-none space-y-3">
                {reports.map((r) => (
                  <li key={r.id} className="rounded-2xl border border-gray-200 p-4 flex flex-wrap items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="m-0 font-semibold text-gray-900">{r.member?.name || r.member?.email}</p>
                      <p className="m-0 mt-0.5 text-sm text-gray-600">
                        {REASON_LABEL[r.reason]}
                        {r.actual.plate && <> · dice que maneja <strong>{r.actual.plate}</strong></>}
                      </p>
                      <p className="m-0 mt-1 text-xs text-gray-500">
                        Asignado: {vehicleName(r.assignedVehicle)} · {fmtDate(r.createdAt)}
                      </p>
                      {r.note && <p className="m-0 mt-2 text-sm text-gray-700">«{r.note}»</p>}
                    </div>
                    <button type="button" className={cx(btn.primary, btn.sm)} onClick={() => setResolving(r)}>
                      Resolver
                    </button>
                  </li>
                ))}
              </ul>
            ),
          )}
        </div>
      </Card>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} vehicles={vehicles} onDone={load} />
      <VehicleDialog
        open={vehicleDialog.open}
        vehicle={vehicleDialog.vehicle}
        catalog={catalog}
        onClose={() => setVehicleDialog({ open: false, vehicle: null })}
        onDone={load}
      />
      <ResolveDialog report={resolving} vehicles={vehicles} onClose={() => setResolving(null)} onDone={load} />
      <ConfirmDialog
        open={Boolean(removing)}
        title="¿Quitar del equipo?"
        text={
          <>
            {removing?.name || removing?.email} dejará de compartir sus viajes de trabajo con tu empresa. Sus viajes anteriores siguen en el
            resumen. Si tiene un turno abierto, se cierra.
          </>
        }
        confirmLabel="Quitar"
        onCancel={() => setRemoving(null)}
        onConfirm={async () => {
          if (!removing) return;
          try {
            await removeTeamMember(removing.id);
            toast.success('Trabajador quitado del equipo');
            setRemoving(null);
            load();
          } catch (err) {
            toast.error(apiMessage(err, 'No pudimos quitarlo del equipo'));
          }
        }}
      />
      <ConfirmDialog
        open={Boolean(archiving)}
        title="¿Archivar este vehículo?"
        text={<>{vehicleName(archiving)} deja de estar disponible y se quita a quien lo tenía asignado. Sus viajes y turnos pasados se conservan.</>}
        confirmLabel="Archivar"
        onCancel={() => setArchiving(null)}
        onConfirm={async () => {
          if (!archiving) return;
          try {
            await archiveTeamVehicle(archiving.id);
            toast.success('Vehículo archivado');
            setArchiving(null);
            load();
          } catch (err) {
            toast.error(apiMessage(err, 'No pudimos archivar el vehículo'));
          }
        }}
      />
    </div>
  );
};

export default TeamView;
