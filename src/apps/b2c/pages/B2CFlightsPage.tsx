import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaPlane,
  FaCheckCircle,
  FaClock,
  FaDownload,
  FaEye,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaPlus
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import B2CLayout from '../components/B2CLayout';
import b2cApi, { type B2CCalculation } from '../services/b2cApi';

const B2CFlightsPage: React.FC = () => {
  const [flights, setFlights] = useState<B2CCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        const data = await b2cApi.getCalculations();
        setFlights(data.calculations || []);
      } catch (err: any) {
        console.error('Error fetching flights:', err);
        setError(err.message || 'Error cargando vuelos');
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, []);

  const totalCompensated = flights
    .filter(f => f.isCompensated)
    .reduce((sum, f) => sum + f.co2Tons, 0);

  const totalPending = flights
    .filter(f => !f.isCompensated)
    .reduce((sum, f) => sum + f.co2Tons, 0);

  if (loading) {
    return (
      <B2CLayout title="Mis Viajes" subtitle="Historial de compensaciones de tus vuelos">
        <div className="!flex !items-center !justify-center !py-20">
          <div className="!text-center">
            <div className="!w-16 !h-16 !border-4 !border-green-200 !border-t-green-600 !rounded-full !animate-spin !mx-auto !mb-4"></div>
            <p className="!text-gray-500">Cargando vuelos...</p>
          </div>
        </div>
      </B2CLayout>
    );
  }

  return (
    <B2CLayout title="Mis Viajes" subtitle="Historial de compensaciones de tus vuelos">
      <div className="!space-y-6">
        {/* Stats Cards */}
        <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 !gap-4 sm:!gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="!bg-white !rounded-2xl !p-6 !shadow-sm !border !border-gray-200"
          >
            <div className="!flex !items-center !justify-between !mb-2">
              <span className="!text-gray-600 !text-sm !font-medium">Total Vuelos</span>
              <div className="!w-10 !h-10 !rounded-xl !bg-blue-100 !flex !items-center !justify-center">
                <FaPlane className="!text-blue-600" />
              </div>
            </div>
            <div className="!text-3xl !font-bold !text-gray-900">{flights.length}</div>
            <p className="!text-sm !text-gray-500 !mt-1">vuelos registrados</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="!bg-gradient-to-br !from-green-500 !to-green-600 !rounded-2xl !p-6 !shadow-lg !text-white"
          >
            <div className="!flex !items-center !justify-between !mb-2">
              <span className="!text-green-50 !text-sm !font-medium">CO₂ Compensado</span>
              <div className="!w-10 !h-10 !rounded-xl !bg-white/20 !flex !items-center !justify-center">
                <FaCheckCircle className="!text-white" />
              </div>
            </div>
            <div className="!text-3xl !font-bold">{totalCompensated.toFixed(2)} t</div>
            <p className="!text-sm !text-green-100 !mt-1">impacto positivo</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="!bg-white !rounded-2xl !p-6 !shadow-sm !border !border-orange-200"
          >
            <div className="!flex !items-center !justify-between !mb-2">
              <span className="!text-gray-600 !text-sm !font-medium">CO₂ Pendiente</span>
              <div className="!w-10 !h-10 !rounded-xl !bg-orange-100 !flex !items-center !justify-center">
                <FaClock className="!text-orange-500" />
              </div>
            </div>
            <div className="!text-3xl !font-bold !text-orange-600">{totalPending.toFixed(2)} t</div>
            <p className="!text-sm !text-gray-500 !mt-1">por compensar</p>
          </motion.div>
        </div>

        {/* Flights List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="!bg-white !rounded-2xl !shadow-sm !border !border-gray-200 !overflow-hidden"
        >
          <div className="!p-4 sm:!p-6 !border-b !border-gray-200">
            <div className="!flex !flex-col sm:!flex-row !items-start sm:!items-center !justify-between !gap-4">
              <div>
                <h2 className="!text-lg sm:!text-xl !font-bold !text-gray-900 !mb-1">Historial de Vuelos</h2>
                <p className="!text-sm !text-gray-600">Todos tus vuelos compensados y pendientes</p>
              </div>
              <Link to="/b2c/calculator" className="!w-full sm:!w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="!w-full sm:!w-auto !px-5 !py-2.5 !bg-green-600 !text-white !rounded-xl !font-semibold !text-sm !shadow-lg hover:!bg-green-700 !transition !border-0 !flex !items-center !justify-center !gap-2 !cursor-pointer"
                >
                  <FaPlus /> Nuevo Vuelo
                </motion.button>
              </Link>
            </div>
          </div>

          {flights.length > 0 ? (
            <div className="!divide-y !divide-gray-100">
              {flights.map((flight, index) => (
                <motion.div
                  key={flight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="!p-4 sm:!p-6 hover:!bg-gray-50 !transition-colors"
                >
                  <div className="!flex !flex-col lg:!flex-row !items-start lg:!items-center !justify-between !gap-4">
                    {/* Flight Info */}
                    <div className="!flex-1 !w-full">
                      <div className="!flex !items-center !gap-3 !mb-3">
                        <div className="!w-12 !h-12 !rounded-xl !bg-blue-100 !flex !items-center !justify-center !flex-shrink-0">
                          <FaPlane className="!text-blue-600 !text-lg" />
                        </div>
                        <div>
                          <div className="!font-bold !text-gray-900 !text-lg">
                            {flight.originAirport} → {flight.destinationAirport}
                          </div>
                          <div className="!text-sm !text-gray-500 !flex !items-center !gap-2">
                            <FaMapMarkerAlt className="!text-xs !text-green-500" />
                            {flight.distanceKm ? `${Math.round(flight.distanceKm).toLocaleString()} km` : ''}
                            {flight.serviceClass && (
                              <span className="!ml-2 !px-2 !py-0.5 !rounded-full !bg-gray-100 !text-gray-600 !text-xs">
                                {flight.serviceClass === 'economy' ? 'Económica' : 
                                 flight.serviceClass === 'business' ? 'Business' : 
                                 flight.serviceClass === 'first' ? 'Primera' : flight.serviceClass}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="!flex !flex-wrap !gap-x-4 !gap-y-2 !text-sm !text-gray-600">
                        <div className="!flex !items-center !gap-1.5">
                          <FaCalendarAlt className="!text-xs !text-gray-400" />
                          {new Date(flight.date).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="!flex !items-center !gap-1">
                          <span className="!font-semibold !text-gray-800">{flight.co2Tons.toFixed(2)} t</span>
                          <span className="!text-gray-400">CO₂</span>
                        </div>
                        {flight.passengers > 1 && (
                          <div className="!text-gray-500">
                            {flight.passengers} pasajeros
                          </div>
                        )}
                        {flight.roundTrip && (
                          <span className="!px-2 !py-0.5 !rounded-full !bg-purple-100 !text-purple-600 !text-xs !font-medium">
                            Ida y vuelta
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="!flex !items-center !gap-2 sm:!gap-3 !w-full lg:!w-auto !justify-end !flex-wrap">
                      {flight.isCompensated ? (
                        <>
                          <span className="!inline-flex !items-center !gap-2 !px-3 sm:!px-4 !py-2 !rounded-full !bg-green-100 !text-green-700 !text-xs sm:!text-sm !font-semibold">
                            <FaCheckCircle className="!text-green-500" /> Compensado
                          </span>
                          {flight.certificateId && (
                            <Link to="/b2c/certificates">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="!p-2.5 !bg-gray-100 !rounded-xl hover:!bg-gray-200 !transition !border-0 !cursor-pointer"
                                title="Ver certificado"
                              >
                                <FaEye className="!text-gray-600" />
                              </motion.button>
                            </Link>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="!inline-flex !items-center !gap-2 !px-3 sm:!px-4 !py-2 !rounded-full !bg-orange-100 !text-orange-700 !text-xs sm:!text-sm !font-semibold">
                            <FaClock className="!text-orange-500" /> Pendiente
                          </span>
                          <Link to="/b2c/calculator">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="!px-4 !py-2 !bg-green-600 !text-white !rounded-xl !text-sm !font-semibold hover:!bg-green-700 !transition !border-0 !cursor-pointer"
                            >
                              Compensar
                            </motion.button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="!p-8 sm:!p-12 !text-center">
              <div className="!w-20 !h-20 !mx-auto !mb-6 !rounded-2xl !bg-gray-100 !flex !items-center !justify-center">
                <FaPlane className="!text-4xl !text-gray-400" />
              </div>
              <h3 className="!text-xl !font-bold !text-gray-900 !mb-2">
                Aún no tienes vuelos registrados
              </h3>
              <p className="!text-gray-600 !mb-6 !max-w-md !mx-auto">
                Comienza a compensar tus viajes y contribuye a proyectos ambientales verificados
              </p>
              <Link to="/b2c/calculator">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="!px-6 !py-3 !bg-green-600 !text-white !rounded-xl !font-bold !shadow-lg hover:!bg-green-700 !transition !border-0 !flex !items-center !gap-2 !mx-auto !cursor-pointer"
                >
                  <HiSparkles /> Calcular mi Primer Vuelo
                </motion.button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </B2CLayout>
  );
};

export default B2CFlightsPage;
