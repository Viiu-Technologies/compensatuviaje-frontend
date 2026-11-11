import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlane, FaChevronRight, FaLeaf, FaTree, FaCheckCircle, FaClock } from 'react-icons/fa';
import { RecentTripItem } from '../../services/b2cApi';
import { Badge, btn, fmtDate, fmtInt, fmtNum } from '../../ui';

interface RecentTripsTableProps {
  trips: RecentTripItem[];
  treesEquivalent: number;
  compensatedTons: number;
}

export const RecentTripsTable: React.FC<RecentTripsTableProps> = ({
  trips,
  treesEquivalent,
  compensatedTons,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Main Table Card */}
      <div className="ctv-b2c-surface bg-white rounded-2xl border border-gray-200/90 p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center text-sm">
              <FaPlane aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 m-0 leading-tight font-display">
                Registro de vuelos recientes
              </h3>
              <p className="text-xs text-gray-500 m-0 mt-0.5">
                Últimas rutas calculadas y su estado de retiro.
              </p>
            </div>
          </div>

          <Link
            to="/b2c/flights"
            className="text-xs font-bold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1 no-underline transition-colors"
          >
            <span>Historial completo</span>
            <FaChevronRight className="text-[10px]" aria-hidden="true" />
          </Link>
        </div>

        {trips.length === 0 ? (
          <div className="py-8 px-4 text-center rounded-xl bg-gray-50/70 border border-dashed border-gray-200">
            <p className="text-xs text-gray-600 m-0 mb-3">
              Todavía no registras vuelos en tu bitácora climática.
            </p>
            <Link to="/b2c/calculator" className={`${btn.primary} ${btn.sm}`}>
              <FaPlane className="text-xs" aria-hidden="true" />
              <span>Calcular primer vuelo</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Ruta</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3 text-right">Huella</th>
                  <th className="py-2.5 px-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trips.slice(0, 4).map((trip) => (
                  <tr
                    key={trip.id}
                    onClick={() => navigate('/b2c/flights')}
                    className="hover:bg-gray-50/90 transition-colors group cursor-pointer"
                  >
                    {/* Fecha */}
                    <td className="py-3.5 px-3 text-gray-500 whitespace-nowrap">
                      {fmtDate(trip.date)}
                    </td>

                    {/* Ruta + Badge */}
                    <td className="py-3.5 px-3 font-semibold text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900">
                          {trip.origin} → {trip.destination}
                        </span>
                        {trip.routeType && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {trip.routeType}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {trip.isCompensated ? (
                        <Badge tone="success" icon={FaCheckCircle}>
                          Compensado
                        </Badge>
                      ) : (
                        <Badge tone="warning" icon={FaClock}>
                          Pendiente
                        </Badge>
                      )}
                    </td>

                    {/* Emisiones */}
                    <td className="py-3.5 px-3 font-mono font-bold text-gray-900 whitespace-nowrap text-right tabular-nums">
                      {fmtNum(trip.co2Tons, 2)}{' '}
                      <span className="text-gray-500 font-normal">tCO₂e</span>
                    </td>

                    {/* Action Arrow */}
                    <td className="py-3.5 px-2 text-right text-gray-400 group-hover:text-brand-700 transition-colors">
                      <FaChevronRight className="text-xs" aria-hidden="true" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Equivalencia biofísica: solo si ya compensó algo */}
      {compensatedTons > 0 && (
        <div className="ctv-b2c-surface bg-gradient-to-r from-brand-50/90 via-brand-50/40 to-white border border-brand-200/80 rounded-2xl p-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-brand-200 text-brand-700 flex items-center justify-center flex-shrink-0 text-sm shadow-2xs">
              <FaLeaf aria-hidden="true" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 m-0 font-display">
                Equivalencia de captura biológica
              </h4>
              <p className="text-xs text-gray-600 m-0 mt-0.5">
                Con <span className="font-mono font-bold text-gray-900">{fmtNum(compensatedTons)} tCO₂e</span>{' '}
                retiradas, financias regeneración activa de ecosistemas.
              </p>
            </div>
          </div>

          <Link
            to="/b2c/projects"
            className="inline-flex items-center gap-2 bg-white hover:bg-brand-50 text-brand-800 border border-brand-200 px-3.5 py-1.5 rounded-full text-xs font-bold no-underline transition-colors flex-shrink-0 self-end sm:self-center shadow-2xs"
          >
            <FaTree className="text-brand-700" aria-hidden="true" />
            <span className="tabular-nums">≈ {fmtInt(treesEquivalent)} árboles / año</span>
            <FaChevronRight className="text-[10px]" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentTripsTable;
