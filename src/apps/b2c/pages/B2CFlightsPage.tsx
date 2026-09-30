import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlane, FaCheckCircle, FaClock, FaPlus, FaTrashAlt, FaCertificate } from 'react-icons/fa';
import B2CLayout from '../components/B2CLayout';
import b2cApi, { type B2CCalculation } from '../services/b2cApi';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import {
  Badge, Card, CardHeader, Dialog, EmptyState, ErrorState, Skeleton, StatCard, btn, cx, fmtDate, fmtInt, fmtNum,
} from '../ui';

const CABIN: Record<string, string> = {
  economy: 'Económica',
  premium_economy: 'Premium económica',
  premium: 'Premium económica',
  business: 'Business',
  first: 'Primera',
};

const B2CFlightsPage: React.FC = () => {
  const [flights, setFlights] = useState<B2CCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [flightToDelete, setFlightToDelete] = useState<B2CCalculation | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await b2cApi.getCalculations();
        setFlights(data.calculations || []);
      } catch (err: any) {
        console.error('Error fetching flights:', err);
        setError(getErrorMessage(err, 'No pudimos cargar tus vuelos. Vuelve a intentarlo en unos momentos.'));
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [reloadKey]);

  const handleCompensate = (flight: B2CCalculation) => {
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
      setFlightToDelete(null);
    } catch (err: any) {
      console.error('Error deleting flight:', err);
      setDeleteError(err.message || 'No se pudo eliminar el vuelo');
    } finally {
      setDeletingId(null);
    }
  };

  const closeDelete = () => {
    setFlightToDelete(null);
    setDeleteError(null);
  };

  const totalCompensated = flights.filter((f) => f.isCompensated).reduce((sum, f) => sum + f.co2Tons, 0);
  const totalPending = flights.filter((f) => !f.isCompensated).reduce((sum, f) => sum + f.co2Tons, 0);
  const pendingCount = flights.filter((f) => !f.isCompensated).length;

  const layout = (content: React.ReactNode) => (
    <B2CLayout title="Mis viajes" subtitle="Los vuelos que calculaste y su estado de compensación">
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
    return layout(<ErrorState title="No pudimos cargar tus vuelos" text={error} onRetry={() => setReloadKey((k) => k + 1)} />);
  }

  return layout(
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Vuelos registrados" value={fmtInt(flights.length)} icon={FaPlane} />
        <StatCard label="CO₂ compensado" value={fmtNum(totalCompensated, 2)} unit="t" icon={FaCheckCircle} tone="good" />
        <StatCard
          label="CO₂ por compensar"
          value={fmtNum(totalPending, 2)}
          unit="t"
          icon={FaClock}
          tone={totalPending > 0 ? 'warning' : 'default'}
          hint={pendingCount > 0 ? `${fmtInt(pendingCount)} ${pendingCount === 1 ? 'vuelo pendiente' : 'vuelos pendientes'}` : undefined}
        />
      </div>

      <Card className="p-0 overflow-hidden">
        <CardHeader
          className="px-6 pt-6 pb-5 border-b border-gray-100"
          title="Historial de vuelos"
          subtitle="Compensados y pendientes"
          action={
            <Link to="/b2c/calculator" className={btn.primary}>
              <FaPlus aria-hidden="true" /> Calcular un vuelo
            </Link>
          }
        />

        {flights.length === 0 ? (
          <EmptyState
            icon={FaPlane}
            title="Aún no tienes vuelos registrados"
            text="Calcula la huella de tu próximo viaje y compénsala con un proyecto verificado."
            action={<Link to="/b2c/calculator" className={btn.primary}>Calcular mi primer vuelo</Link>}
          />
        ) : (
          <ul className="divide-y divide-gray-100 m-0 p-0 list-none">
            {flights.map((flight) => (
              <li key={flight.id} className="px-6 py-5 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <span className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
                    <FaPlane aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900">
                      {flight.originAirport} → {flight.destinationAirport}
                      {flight.roundTrip && <span className="ml-2 text-sm font-normal text-gray-500">ida y vuelta</span>}
                    </div>
                    <div className="mt-1 text-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                      <span>{fmtDate(flight.date)}</span>
                      {flight.distanceKm ? <span>{fmtInt(flight.distanceKm)} km</span> : null}
                      {flight.serviceClass && <span>{CABIN[flight.serviceClass] ?? flight.serviceClass}</span>}
                      {flight.passengers > 1 && <span>{fmtInt(flight.passengers)} pasajeros</span>}
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
                        title="Eliminar vuelo"
                        aria-label={`Eliminar vuelo ${flight.originAirport} → ${flight.destinationAirport}`}
                      >
                        <FaTrashAlt aria-hidden="true" />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Dialog
        open={!!flightToDelete}
        title="¿Eliminar este vuelo?"
        onClose={closeDelete}
        busy={!!deletingId}
        footer={
          <>
            <button type="button" className={btn.secondary} onClick={closeDelete} disabled={!!deletingId}>Cancelar</button>
            <button type="button" className={cx(btn.primary, 'bg-rose-700 border-rose-700 hover:bg-rose-800 hover:border-rose-800')} onClick={handleConfirmDelete} disabled={!!deletingId}>
              {deletingId ? 'Eliminando…' : 'Eliminar vuelo'}
            </button>
          </>
        }
      >
        {flightToDelete && (
          <>
            <p className="m-0">
              <b>{flightToDelete.originAirport} → {flightToDelete.destinationAirport}</b> · {fmtNum(flightToDelete.co2Tons, 2)} t CO₂e ·{' '}
              {fmtDate(flightToDelete.date)}
            </p>
            <p className="m-0 mt-2 text-gray-500">Se quitará de tu historial y no se puede deshacer.</p>
            {deleteError && <p className="m-0 mt-3 rounded-lg bg-rose-50 border border-rose-100 px-3 py-2 text-rose-700">{deleteError}</p>}
          </>
        )}
      </Dialog>
    </div>,
  );
};

export default B2CFlightsPage;
