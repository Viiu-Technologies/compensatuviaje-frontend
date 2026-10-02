import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Copy, Mail, MapPin, Search, ShoppingCart, TreePine } from 'lucide-react';
import { getProjects, type Project } from '../../services/projectsService';
import { createOrder, getBankDetails, getEmissionDebt, type BankDetails, type EmissionDebt } from '../../services/ordersService';
import { calculateTonsFromUnits, calculateUnitsFromTons } from '../../../../utils/carbon';
import {
  Badge,
  btn,
  Card,
  cx,
  Dialog,
  EmptyState,
  ErrorState,
  fmtCLP,
  fmtInt,
  fmtNum,
  inputCls,
  PageHeader,
  Progress,
  projectTypeLabel,
  Skeleton,
} from '../../ui';

// ============================================
// COMPRA (orden por transferencia)
// La lógica de montos y unidades es la misma de antes; solo cambia la vista.
// ============================================

const CheckoutDialog: React.FC<{ project: Project; onClose: () => void; onSuccess: () => void }> = ({ project, onClose, onSuccess }) => {
  const [tons, setTons] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<{ id: string; amount: number } | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [debt, setDebt] = useState<EmissionDebt | null>(null);

  // Unidades físicas que se reservarán (Enfoque B)
  const physicalUnits = project.carbon_capture_per_unit ? calculateUnitsFromTons(tons, project.carbon_capture_per_unit) : null;
  // Stock disponible en toneladas equivalentes para validar el límite
  const availableTons =
    project.carbon_capture_per_unit && project.availableUnits
      ? calculateTonsFromUnits(project.availableUnits, project.carbon_capture_per_unit)
      : project.availableUnits || 0;

  // Máximo del control: el menor entre el stock y la deuda de emisiones (si se conoce), mínimo 1
  const debtMax = debt && debt.tonsPending > 0 ? debt.tonsPending : null;
  const sliderMax = Math.max(debtMax ? Math.min(availableTons, debtMax) : availableTons, 1);
  const sliderMin = 0.1;
  const isOverLimit = tons > 0 && tons > availableTons;
  const totalCLP = tons > 0 ? Math.round(tons * project.pricePerTonCLP) : 0;

  useEffect(() => {
    getBankDetails().then(setBankDetails).catch(() => setBankDetails(null));
    getEmissionDebt()
      .then((d) => {
        setDebt(d);
        // Valor inicial: lo pendiente de compensar (limitado por el stock)
        if (d?.tonsPending > 0) setTons(parseFloat(Math.min(d.tonsPending, availableTons).toFixed(1)));
      })
      .catch(() => setDebt(null));
  }, [availableTons]);

  const submit = async () => {
    if (tons <= 0) return setError('Elige una cantidad válida de toneladas.');
    if (isOverLimit) return setError(`La cantidad supera el stock disponible (${fmtNum(availableTons, 1)} t).`);
    setSubmitting(true);
    setError(null);
    try {
      const response = await createOrder({
        projectId: project.id,
        tons_to_compensate: tons,
        tonsTco2: tons,
        // Enfoque B: enviar unidades físicas y kg congelados al backend
        ...(physicalUnits !== null && { physicalUnits }),
        co2KgToFreeze: tons * 1000,
      });
      setOrder({ id: response.order.id, amount: response.order.amount });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'No pudimos crear la orden.');
    } finally {
      setSubmitting(false);
    }
  };

  const copy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
    });
  };

  return (
    <Dialog
      open
      title={order ? 'Orden creada' : `Compensar con ${project.name}`}
      onClose={onClose}
      busy={submitting}
      footer={
        order ? (
          <>
            <button type="button" className={btn.secondary} onClick={onClose}>
              Cerrar
            </button>
            <button type="button" className={btn.primary} onClick={onSuccess}>
              Ver mis órdenes
            </button>
          </>
        ) : (
          <>
            <button type="button" className={btn.secondary} onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="button" className={btn.primary} onClick={submit} disabled={submitting || tons <= 0 || isOverLimit}>
              <ShoppingCart className="w-4 h-4" aria-hidden="true" />
              {submitting ? 'Creando orden…' : 'Generar orden'}
            </button>
          </>
        )
      }
    >
      {!order ? (
        <div className="space-y-5">
          <p className="m-0 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-900">
            {debt && debt.tonsPending > 0 ? (
              <>
                Tu empresa tiene <strong>{fmtNum(debt.tonsPending, 1)} t de CO₂</strong> por compensar. ¿Cuánto quieres compensar hoy?
              </>
            ) : (
              '¿Cuántas toneladas quieres compensar hoy?'
            )}
          </p>

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="co-tons" className="text-3xl font-bold text-brand-700 tabular-nums">
                {fmtNum(tons, 1)} t
              </label>
              {availableTons > 0 && <span className="text-xs text-gray-500">máx. {fmtNum(availableTons, 0)} t disponibles</span>}
            </div>
            <input
              id="co-tons"
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={sliderMax >= 10 ? 0.5 : 0.1}
              value={tons}
              onChange={(e) => {
                setTons(parseFloat(e.target.value));
                setError(null);
              }}
              className="mt-3 w-full accent-brand-700 cursor-pointer"
              aria-valuetext={`${fmtNum(tons, 1)} toneladas`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{fmtNum(sliderMin, 1)} t</span>
              <span>{fmtNum(sliderMax, 0)} t</span>
            </div>
            {isOverLimit && <p className="m-0 mt-1 text-xs text-rose-700">No puede superar el stock disponible del mes ({fmtNum(availableTons, 1)} t).</p>}
          </div>

          <dl className="m-0 rounded-xl border border-gray-200 p-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">Precio por tonelada</dt>
              <dd className="m-0 text-gray-900 tabular-nums">{fmtCLP(project.pricePerTonCLP)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-500">Cantidad</dt>
              <dd className="m-0 text-gray-900 tabular-nums">{fmtNum(tons, 1)} t</dd>
            </div>
            {physicalUnits !== null && project.impact_unit && (
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Unidades que se reservan</dt>
                <dd className="m-0 font-medium text-brand-700 tabular-nums">
                  {fmtInt(physicalUnits)} {project.impact_unit}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-3 pt-2 border-t border-gray-100 text-base font-semibold">
              <dt className="text-gray-900">Total</dt>
              <dd className="m-0 text-gray-900 tabular-nums">{fmtCLP(totalCLP)}</dd>
            </div>
          </dl>

          {error && (
            <p role="alert" className="m-0 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <CheckCircle2 className="mx-auto w-10 h-10 text-brand-700" aria-hidden="true" />
            <p className="m-0 mt-2 text-sm text-gray-600">
              Referencia <strong className="text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</strong>
            </p>
            <p className="m-0 mt-3 text-sm text-gray-500">Monto a transferir</p>
            <p className="m-0 text-3xl font-bold text-gray-900 tabular-nums">{fmtCLP(order.amount)}</p>
          </div>

          <p className="m-0 flex items-start gap-2 rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Revisa tu correo:</strong> te enviamos las instrucciones de pago para completar la transferencia.
            </span>
          </p>

          {bankDetails && (
            <dl className="m-0 rounded-xl border border-gray-200 p-4 space-y-2 text-sm">
              {[
                ['Banco', bankDetails.bankName],
                ['Tipo de cuenta', bankDetails.accountType],
                ['N.º de cuenta', bankDetails.accountNumber],
                ['Titular', bankDetails.accountHolder],
                ['RUT', bankDetails.rut],
                ['Email', bankDetails.email],
              ]
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="m-0 flex items-center gap-1 font-medium text-gray-900 text-right break-all">
                      {value}
                      <button
                        type="button"
                        onClick={() => copy(label, value)}
                        aria-label={`Copiar ${label}`}
                        className="border-0 bg-transparent p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                      >
                        {copied === label ? <CheckCircle2 className="w-3.5 h-3.5 text-brand-700" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                      </button>
                    </dd>
                  </div>
                ))}
              {bankDetails.message && <p className="m-0 pt-2 border-t border-gray-100 text-xs text-amber-800">{bankDetails.message}</p>}
            </dl>
          )}
        </div>
      )}
    </Dialog>
  );
};

// ============================================
// CATÁLOGO
// ============================================

const STATUS_BADGE: Record<Project['status'], { label: string; tone: 'success' | 'info' | 'warning' }> = {
  active: { label: 'Disponible', tone: 'success' },
  completed: { label: 'Completado', tone: 'info' },
  pending: { label: 'Próximamente', tone: 'warning' },
};

const ProjectsView: React.FC<{ onNavigateToOrders?: () => void }> = ({ onNavigateToOrders }) => {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [checkout, setCheckout] = useState<Project | null>(null);

  // Se carga una vez y se filtra en el navegador (antes cada tecla de la búsqueda hacía una petición).
  useEffect(() => {
    (async () => {
      setLoading(true);
      setFailed(false);
      try {
        setProjects(await getProjects());
      } catch {
        // Sin proyectos de ejemplo: se podía iniciar una compra sobre uno que no existe.
        setProjects([]);
        setFailed(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [reloadKey]);

  // Filtros según los tipos que realmente hay (antes había "Energía" y "Océanos" fijos, y faltaban agua, textil o social).
  const types = useMemo(() => {
    const present = Array.from(new Set(projects.map((p) => p.projectType || p.type).filter(Boolean))) as string[];
    return present.sort((a, b) => projectTypeLabel(a).localeCompare(projectTypeLabel(b), 'es'));
  }, [projects]);

  const visible = projects.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.country.toLowerCase().includes(q);
    const matchesType = type === 'all' || (p.projectType || p.type) === type;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Proyectos" subtitle="Proyectos verificados para compensar la huella de tu empresa." />

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            aria-label="Buscar proyectos"
            placeholder="Buscar por nombre o lugar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cx(inputCls, 'pl-10')}
          />
        </div>
        {types.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por tipo">
            {['all', ...types].map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={type === t}
                onClick={() => setType(t)}
                className={cx(
                  'flex-shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium cursor-pointer transition-colors',
                  type === t ? 'bg-brand-700 border-brand-700 text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
                )}
              >
                {t === 'all' ? 'Todos' : projectTypeLabel(t)}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : failed ? (
        <ErrorState title="No pudimos cargar los proyectos" onRetry={() => setReloadKey((k) => k + 1)} />
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={TreePine}
            title={projects.length === 0 ? 'Aún no hay proyectos disponibles' : 'No hay proyectos con estos filtros'}
            text={projects.length === 0 ? 'Estamos verificando nuevos proyectos. Vuelve pronto.' : undefined}
            action={
              projects.length > 0 ? (
                <button type="button" className={btn.secondary} onClick={() => { setSearch(''); setType('all'); }}>
                  Quitar filtros
                </button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <ul className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {visible.map((p) => {
            const st = STATUS_BADGE[p.status] ?? STATUS_BADGE.active;
            const canBuy = p.status === 'active' && p.pricePerTonCLP > 0 && !p.isSoldOut;
            const unit = p.impact_unit || 'unidades';
            return (
              <li key={p.id}>
                <Card className="p-0 h-full flex flex-col overflow-hidden" as="article">
                  <div className="relative h-36 bg-gray-100">
                    <img src={p.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                    <span className="absolute top-3 left-3">
                      <Badge tone={p.isSoldOut ? 'neutral' : st.tone}>{p.isSoldOut ? 'Agotado este mes' : st.label}</Badge>
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="m-0 text-xs font-medium text-gray-500">{projectTypeLabel(p.projectType || p.type)}</p>
                    <h2 className="m-0 mt-0.5 text-base font-semibold text-gray-900 leading-snug">{p.name}</h2>
                    <p className="m-0 mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                      {[p.location !== p.country ? p.location : null, p.country].filter(Boolean).join(', ')}
                    </p>
                    {p.description && <p className="m-0 mt-3 text-sm text-gray-600 line-clamp-2">{p.description}</p>}

                    <dl className="m-0 mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <dt className="text-xs text-gray-500">Precio por tonelada</dt>
                        <dd className="m-0 mt-0.5 text-base font-semibold text-gray-900 tabular-nums">{p.pricePerTonCLP > 0 ? fmtCLP(p.pricePerTonCLP) : '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Disponible este mes</dt>
                        <dd className="m-0 mt-0.5 text-base font-semibold text-gray-900 tabular-nums">
                          {fmtInt(p.availableUnits)} <span className="text-sm font-normal text-gray-500">{unit}</span>
                        </dd>
                      </div>
                    </dl>

                    {(p.progress ?? 0) > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Stock del mes vendido</span>
                          <span className="tabular-nums">{fmtInt(p.progress)} %</span>
                        </div>
                        <Progress value={p.progress ?? 0} label="Stock del mes vendido" className="mt-1.5" />
                      </div>
                    )}

                    <div className="mt-auto pt-5">
                      {canBuy ? (
                        <button type="button" onClick={() => setCheckout(p)} className={cx(btn.primary, 'w-full')}>
                          <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                          Compensar
                        </button>
                      ) : (
                        <p className="m-0 rounded-full bg-gray-100 py-2.5 text-center text-sm text-gray-500">
                          {p.isSoldOut ? 'Sin stock este mes' : 'Aún no disponible para compra'}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {checkout && (
        <CheckoutDialog
          project={checkout}
          onClose={() => setCheckout(null)}
          onSuccess={() => {
            setCheckout(null);
            onNavigateToOrders?.();
          }}
        />
      )}
    </div>
  );
};

export default ProjectsView;
