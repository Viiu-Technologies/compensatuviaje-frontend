import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaPlane, FaCheckCircle, FaClock, FaPlus, FaTrashAlt, FaCertificate, FaCar, FaLayerGroup } from 'react-icons/fa';
import B2CLayout from '../components/B2CLayout';
import b2cApi, { type B2CCalculation } from '../services/b2cApi';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import {
  Badge, Card, CardHeader, Dialog, EmptyState, ErrorState, Skeleton, StatCard, btn, cx, fmtDate, fmtInt, fmtNum,
} from '../ui';
import { isGroundTrip, tripModeIcon, tripModeLabel } from '../utils/tripMode';

type TripFilter = 'all' | 'flight' | 'ground';
const FILTERS: { value: TripFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'flight', label: 'Vuelos' },
  { value: 'ground', label: 'Terrestres' },
];

/** "SCL → LIM" para vuelos; "Bus" (o el medio que sea) para terrestres. */
const tripTitle = (t: B2CCalculation) =>
  isGroundTrip(t) ? tripModeLabel(t.transportMode) : `${t.originAirport} → ${t.destinationAirport}`;

const CABIN: Record<string, string> = {
  economy: 'Económica',
  premium_economy: 'Premium económica',
  premium: 'Premium económica',
  business: 'Business',
  first: 'Primera',
};

/** Límite de viajes por pago: los ids van en la URL de Proyectos. */
const MAX_SELECTED = 50;

const B2CFlightsPage: React.FC = () => {
  const [flights, setFlights] = useState<B2CCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();
  // CTV-61: el filtro va en la URL para poder volver a "Terrestres" desde el resultado del pago.
  const [searchParams, setSearchParams] = useSearchParams();
  const rawFilter = searchParams.get('type');
  const filter: TripFilter = rawFilter === 'flight' || rawFilter === 'ground' ? rawFilter : 'all';
  const setFilter = (next: TripFilter) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'all') params.delete('type');
    else params.set('type', next);
    setSearchParams(params, { replace: true });
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [flightToDelete, setFlightToDelete] = useState<B2CCalculation | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Orden 9: varios viajes pendientes en un solo pago. Un trayecto corto suele
  // costar menos que el mínimo de Webpay ($50) y no se podía compensar solo.
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_SELECTED) next.add(id);
      return next;
    });
  };

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await b2cApi.getCalculations();
        setFlights(data.calculations || []);
      } catch (err: any) {
        console.error('Error fetching flights:', err);
        setError(getErrorMessage(err, 'No pudimos cargar tus viajes. Vuelve a intentarlo en unos momentos.'));
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [reloadKey]);

  const handleCompensate = (flight: B2CCalculation) => {
    // Un viaje terrestre ya tiene su huella calculada: va directo a elegir
    // proyecto. Antes se mandaba a la calculadora de vuelos con origin=GND.
    if (isGroundTrip(flight)) {
      navigate(`/b2c/projects?calcId=${encodeURIComponent(flight.id)}&kg=${flight.co2Kg}`);
      return;
    }
    // Pasar los datos del vuelo a la calculadora a través de query params
    const params = new URLSearchParams({
      origin: flight.originAirport,
      destination: flight.destinationAirport,
      cabin: flight.serviceClass || 'economy',
      passengers: String(flight.passengers || 1),
      roundTrip: String(flight.roundTrip || false),
      calculationId: flight.id,
    });
    navigate(`/b2c/calculator?${params.toString()}`);
  };

  const handleConfirmDelete = async () => {
    if (!flightToDelete) return;
    try {
      setDeletingId(flightToDelete.id);
      await b2cApi.deleteCalculation(flightToDelete.id);
      setFlights((prev) => prev.filter((f) => f.id !== flightToDelete.id));
      setSelected((prev) => {
        if (!prev.has(flightToDelete.id)) return prev;
        const next = new Set(prev);
        next.delete(flightToDelete.id);
        return next;
      });
      setFlightToDelete(null);
    } catch (err: any) {
      console.error('Error deleting flight:', err);
      setDeleteError(err.message || 'No se pudo eliminar el viaje');
    } finally {
      setDeletingId(null);
    }
  };

  const closeDelete = () => {
    setFlightToDelete(null);
    setDeleteError(null);
  };

  const visible = flights.filter((f) => filter === 'all' || (filter === 'ground') === isGroundTrip(f));
  const groundCount = flights.filter(isGroundTrip).length;
  const totalCompensated = visible.filter((f) => f.isCompensated).reduce((sum, f) => sum + f.co2Tons, 0);
  const totalPending = visible.filter((f) => !f.isCompensated).reduce((sum, f) => sum + f.co2Tons, 0);
  const pendingCount = visible.filter((f) => !f.isCompensated).length;
  const selectedTrips = flights.filter((f) => selected.has(f.id) && !f.isCompensated);
  const selectedKg = selectedTrips.reduce((sum, f) => sum + (Number(f.co2Kg) || 0), 0);

  const compensateSelected = () => {
    if (selectedTrips.length === 0) return;
    if (selectedTrips.length === 1) {
      handleCompensate(selectedTrips[0]);
      return;
    }
    const ids = selectedTrips.map((f) => f.id).join(',');
    navigate(`/b2c/projects?calcIds=${encodeURIComponent(ids)}&kg=${Number(selectedKg.toFixed(4))}`);
  };

  const layout = (content: React.ReactNode) => (
    <B2CLayout title="Mis viajes" subtitle="Tus vuelos y trayectos terrestres, con su estado de compensación">
      {content}
    </B2CLayout>
  );

  if (loading) {
    return layout(
      <div className="space-y-6" aria-busy="true">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-80" />
      </div>,
    );
  }

  // Antes el error se guardaba pero no se mostraba: la página decía
  // "Aún no tienes vuelos registrados" aunque el problema fuera de conexión.
  if (error) {
    return layout(<ErrorState title="No pudimos cargar tus viajes" text={error} onRetry={() => setReloadKey((k) => k + 1)} />);
  }

  return layout(
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Viajes registrados"
          value={fmtInt(visible.length)}
          icon={FaPlane}
          hint={filter === 'all' && groundCount > 0 ? `${fmtInt(groundCount)} terrestres` : undefined}
        />
        <StatCard label="CO₂ compensado" value={fmtNum(totalCompensated, 2)} unit="t" icon={FaCheckCircle} tone="good" />
        <StatCard
          label="CO₂ por compensar"
          value={fmtNum(totalPending, 2)}
          unit="t"
          icon={FaClock}
          tone={totalPending > 0 ? 'warning' : 'default'}
          hint={pendingCount > 0 ? `${fmtInt(pendingCount)} ${pendingCount === 1 ? 'viaje pendiente' : 'viajes pendientes'}` : undefined}
        />
      </div>

      <Card className="p-0 overflow-hidden">
        <CardHeader
          className="px-6 pt-6 pb-5 border-b border-gray-100"
          title="Historial de viajes"
          subtitle={pendingCount > 1 ? 'Marca varios pendientes para compensarlos en un solo pago' : 'Compensados y pendientes'}
          action={
            <div className="flex flex-wrap gap-2">
              <Link to="/b2c/calculator?mode=ground" className={btn.secondary}>
                <FaCar aria-hidden="true" /> Registrar trayecto
              </Link>
              <Link to="/b2c/calculator" className={btn.primary}>
                <FaPlus aria-hidden="true" /> Calcular un vuelo
              </Link>
            </div>
          }
        />

        <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo de viaje">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cx(btn.sm, filter === f.value ? btn.primary : btn.secondary)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {flights.length > 0 && visible.length === 0 ? (
          <EmptyState
            icon={filter === 'ground' ? tripModeIcon('car') : FaPlane}
            title={filter === 'ground' ? 'No tienes viajes terrestres' : 'No tienes vuelos'}
            text={filter === 'ground'
              ? 'Los trayectos en auto, bus o metro se registran solos con la app móvil, o puedes agregarlos a mano.'
              : 'Calcula la huella de tu próximo vuelo y compénsala con un proyecto verificado.'}
            action={filter === 'ground'
              ? <Link to="/b2c/calculator?mode=ground" className={btn.primary}><FaPlus aria-hidden="true" /> Registrar un trayecto</Link>
              : undefined}
          />
        ) : flights.length === 0 ? (
          <EmptyState
            icon={FaPlane}
            title="Aún no tienes vuelos registrados"
            text="Calcula la huella de tu próximo viaje y compénsala con un proyecto verificado."
            action={<Link to="/b2c/calculator" className={btn.primary}>Calcular mi primer vuelo</Link>}
          />
        ) : (
          <ul className="divide-y divide-gray-100 m-0 p-0 list-none">
            {visible.map((flight) => {
              const ground = isGroundTrip(flight);
              const Icon = tripModeIcon(flight.transportMode, ground);
              return (
              <li
                key={flight.id}
                className={cx('px-6 py-5 flex flex-col lg:flex-row lg:items-center gap-4', selected.has(flight.id) && 'bg-brand-50')}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {!flight.isCompensated && (
                    // Área táctil de 44 px alrededor de la casilla nativa.
                    <label className="-m-2 p-2 flex items-center self-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.has(flight.id)}
                        onChange={() => toggleSelected(flight.id)}
                        disabled={!selected.has(flight.id) && selected.size >= MAX_SELECTED}
                        className="w-5 h-5 accent-brand-700 cursor-pointer"
                      />
                      <span className="sr-only">Seleccionar {tripTitle(flight)} del {fmtDate(flight.date)}</span>
                    </label>
                  )}
                  <span className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
                    <Icon aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900">
                      {tripTitle(flight)}
                      {ground && <span className="ml-2 text-sm font-normal text-gray-500">terrestre</span>}
                      {!ground && flight.roundTrip && <span className="ml-2 text-sm font-normal text-gray-500">ida y vuelta</span>}
                    </div>
                    <div className="mt-1 text-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                      <span>{fmtDate(flight.date)}</span>
                      {flight.distanceKm ? <span>{ground ? fmtNum(flight.distanceKm, 1) : fmtInt(flight.distanceKm)} km</span> : null}
                      {!ground && flight.serviceClass && <span>{CABIN[flight.serviceClass] ?? flight.serviceClass}</span>}
                      {!ground && flight.passengers > 1 && <span>{fmtInt(flight.passengers)} pasajeros</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 lg:gap-6 flex-wrap lg:flex-nowrap">
                  <div className="text-right min-w-[88px]">
                    <div className="font-semibold text-gray-900 tabular-nums">{fmtNum(flight.co2Tons, 2)} t</div>
                    <div className="text-xs text-gray-500">CO₂e</div>
                  </div>
                  {flight.isCompensated ? (
                    <>
                      <Badge tone="success" icon={FaCheckCircle}>Compensado</Badge>
                      {flight.certificateId && (
                        <Link to="/b2c/certificates" className={btn.icon} title="Ver certificado" aria-label="Ver certificado">
                          <FaCertificate aria-hidden="true" />
                        </Link>
                      )}
                    </>
                  ) : (
                    <>
                      <Badge tone="warning" icon={FaClock}>Pendiente</Badge>
                      <button type="button" onClick={() => handleCompensate(flight)} className={cx(btn.primary, btn.sm)}>
                        Compensar
                      </button>
                      <button
                        type="button"
                        onClick={() => { setFlightToDelete(flight); setDeleteError(null); }}
                        disabled={deletingId === flight.id}
                        className={cx(btn.icon, 'hover:text-rose-700 hover:border-rose-200')}
                        title={ground ? 'Eliminar viaje' : 'Eliminar vuelo'}
                        aria-label={`Eliminar ${tripTitle(flight)}`}
                      >
                        <FaTrashAlt aria-hidden="true" />
                      </button>
                    </>
                  )}
                </div>
              </li>
              );
            })}
          </ul>
        )}
      </Card>

      {selectedTrips.length > 0 && (
        <div
          className="sticky bottom-4 z-10 rounded-2xl border border-brand-100 bg-white shadow-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
          role="region"
          aria-label="Viajes seleccionados"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0" aria-live="polite">
            <span className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0">
              <FaLayerGroup aria-hidden="true" />
            </span>
            <p className="m-0 text-sm text-gray-700">
              <b>{fmtInt(selectedTrips.length)} {selectedTrips.length === 1 ? 'viaje' : 'viajes'}</b> ·{' '}
              {selectedKg < 10 ? fmtNum(selectedKg, 2) : fmtInt(selectedKg)} kg CO₂e
              {selectedTrips.length > 1 && <span className="text-gray-500"> · en un solo pago</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" className={cx(btn.secondary, btn.sm)} onClick={() => setSelected(new Set())}>
              Quitar selección
            </button>
            <button type="button" className={cx(btn.primary, btn.sm)} onClick={compensateSelected}>
              {selectedTrips.length === 1 ? 'Compensar' : 'Compensar juntos'}
            </button>
          </div>
        </div>
      )}

      <Dialog
        open={!!flightToDelete}
        title="¿Eliminar este viaje?"
        onClose={closeDelete}
        busy={!!deletingId}
        footer={
          <>
            <button type="button" className={btn.secondary} onClick={closeDelete} disabled={!!deletingId}>Cancelar</button>
            <button type="button" className={cx(btn.primary, 'bg-rose-700 border-rose-700 hover:bg-rose-800 hover:border-rose-800')} onClick={handleConfirmDelete} disabled={!!deletingId}>
              {deletingId ? 'Eliminando…' : 'Eliminar'}
            </button>
          </>
        }
      >
        {flightToDelete && (
          <>
            <p className="m-0">
              <b>{tripTitle(flightToDelete)}</b> · {fmtNum(flightToDelete.co2Tons, 2)} t CO₂e ·{' '}
              {fmtDate(flightToDelete.date)}
            </p>
            <p className="m-0 mt-2 text-gray-500">
              {isGroundTrip(flightToDelete)
                ? 'Se quitará de tu historial y de la app, junto con su recorrido. No se puede deshacer.'
                : 'Se quitará de tu historial y no se puede deshacer.'}
            </p>
            {deleteError && <p className="m-0 mt-3 rounded-lg bg-rose-50 border border-rose-100 px-3 py-2 text-rose-700">{deleteError}</p>}
          </>
        )}
      </Dialog>
    </div>,
  );
};

export default B2CFlightsPage;
