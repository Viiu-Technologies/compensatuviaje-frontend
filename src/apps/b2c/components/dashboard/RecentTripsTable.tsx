import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlane, FaChevronRight, FaLeaf, FaTree } from 'react-icons/fa';
import { RecentTripItem } from '../../services/b2cApi';

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
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 p-6 shadow-xs">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
              <FaPlane />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white m-0 leading-tight">
                Viajes recientes
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 m-0 mt-0.5">
                Tus últimos viajes registrados y su impacto.
              </p>
            </div>
          </div>
        </div>

        {trips.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-slate-400 m-0 py-6 text-center">
            Todavía no registras viajes.{' '}
            <Link to="/b2c/calculator" className="font-bold text-emerald-600 dark:text-emerald-400 no-underline">
              Calcula tu primera huella
            </Link>
          </p>
        ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-500 font-semibold">
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Ruta</th>
                <th className="py-2.5 px-3">Medio</th>
                <th className="py-2.5 px-3">Emisiones</th>
                <th className="py-2.5 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
              {trips.slice(0, 4).map((trip) => (
                <tr
                  key={trip.id}
                  className="hover:bg-gray-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                >
                  {/* Fecha */}
                  <td className="py-3 px-3 text-gray-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(trip.date)}
                  </td>

                  {/* Ruta + Badge */}
                  <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span>{trip.origin} → {trip.destination}</span>
                      {trip.routeType && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            trip.routeType === 'Internacional'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {trip.routeType}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Medio */}
                  <td className="py-3 px-3 text-gray-600 dark:text-slate-300 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <FaPlane className="text-gray-400 text-xs" />
                      <span>{trip.transportMode || 'Avión'}</span>
                    </div>
                  </td>

                  {/* Emisiones */}
                  <td className="py-3 px-3 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    {trip.co2Tons.toFixed(1)} tCO₂e
                  </td>

                  {/* Action Arrow */}
                  <td className="py-3 px-3 text-right text-gray-300 dark:text-slate-600 group-hover:text-emerald-600 transition-colors">
                    <FaChevronRight className="text-xs" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Footer Link */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 text-right">
          <Link
            to="/b2c/flights"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 inline-flex items-center gap-1.5 no-underline transition-colors"
          >
            Ver todos los viajes →
          </Link>
        </div>
      </div>

      {/* Tu huella vs el planeta Banner: solo si ya compensó algo */}
      {compensatedTons > 0 && (
      <div className="bg-[#f0f9f4] dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0 text-sm">
            <FaLeaf />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white m-0">
              Tu huella vs. el planeta
            </h4>
            <p className="text-xs text-gray-600 dark:text-slate-300 m-0 mt-0.5">
              Con <span className="font-semibold">{compensatedTons.toFixed(1)} tCO₂e</span> compensadas, estás ayudando a proteger bosques y comunidades.
            </p>
          </div>
        </div>

        <Link
          to="/b2c/projects"
          className="inline-flex items-center gap-2 bg-emerald-100/80 dark:bg-emerald-900/60 hover:bg-emerald-200/80 dark:hover:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold no-underline transition-colors flex-shrink-0 self-end sm:self-center"
        >
          <FaTree className="text-emerald-600 dark:text-emerald-400" />
          <span>= {treesEquivalent} árboles durante 1 año</span>
          <FaChevronRight className="text-[10px]" />
        </Link>
      </div>
      )}
    </div>
  );
};

export default RecentTripsTable;
