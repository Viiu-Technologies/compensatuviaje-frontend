import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaPlane,
  FaCheckCircle,
  FaClock,
  FaDownload,
  FaEye,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaPlus,
  FaTrashAlt
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import B2CLayout from '../components/B2CLayout';
import b2cApi, { type B2CCalculation } from '../services/b2cApi';

const B2CFlightsPage: React.FC = () => {
  const [flights, setFlights] = useState<B2CCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const handleCompensate = (flight: B2CCalculation) => {
    // Pasar los datos del vuelo a la calculadora a través de query params
    const params = new URLSearchParams({
      origin: flight.originAirport,
      destination: flight.destinationAirport,
      cabin: flight.serviceClass || 'economy',
      passengers: String(flight.passengers || 1),
      roundTrip: String(flight.roundTrip || false),
      calculationId: flight.id
    });
    navigate(`/b2c/calculator?${params.toString()}`);
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flightToDelete, setFlightToDelete] = useState<B2CCalculation | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = (flight: B2CCalculation) => {
    setFlightToDelete(flight);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!flightToDelete) return;
    try {
      setDeletingId(flightToDelete.id);
      await b2cApi.deleteCalculation(flightToDelete.id);
      setFlights(prev => prev.filter(f => f.id !== flightToDelete.id));
      setShowDeleteModal(false);
      setFlightToDelete(null);
    } catch (err: any) {
      console.error('Error deleting flight:', err);
      setDeleteError(err.message || 'Error al eliminar el vuelo');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setFlightToDelete(null);
    setDeleteError(null);
  };

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
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCompensate(flight)}
                            className="!px-4 !py-2 !bg-green-600 !text-white !rounded-xl !text-sm !font-semibold hover:!bg-green-700 !transition !border-0 !cursor-pointer"
                          >
                            Compensar
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(flight)}
                            disabled={deletingId === flight.id}
                            className="!p-2.5 !bg-red-50 !rounded-xl hover:!bg-red-100 !transition !border-0 !cursor-pointer disabled:!opacity-50 disabled:!cursor-not-allowed"
                            title="Eliminar vuelo"
                          >
                            <FaTrashAlt className="!text-red-500" />
                          </motion.button>
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

        {/* 🗑️ Modal de Confirmación de Eliminación */}
        {showDeleteModal && flightToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="!fixed !inset-0 !bg-black/50 !backdrop-blur-sm !flex !items-center !justify-center !z-50 !p-4"
            onClick={handleCancelDelete}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="!bg-white !rounded-3xl !shadow-2xl !max-w-md !w-full !overflow-hidden"
            >
              {/* Header Rojo */}
              <div className="!bg-gradient-to-br !from-red-500 !via-red-600 !to-rose-600 !p-8 !text-center !text-white !relative !overflow-hidden">
                <div className="!absolute !top-0 !right-0 !w-40 !h-40 !bg-white/10 !rounded-full !blur-3xl"></div>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="!w-20 !h-20 !mx-auto !mb-4 !rounded-full !bg-white/20 !backdrop-blur-sm !flex !items-center !justify-center !relative !z-10"
                >
                  <FaTrashAlt className="!text-3xl" />
                </motion.div>
                <h3 className="!text-2xl !font-bold !mb-2 !m-0 !relative !z-10">¿Eliminar vuelo?</h3>
                <p className="!text-red-100 !m-0 !relative !z-10">Esta acción no se puede deshacer</p>
              </div>

              {/* Contenido */}
              <div className="!p-8">
                {/* Flight Info */}
                <div className="!bg-gradient-to-br !from-red-50 !to-rose-50 !rounded-2xl !p-5 !mb-6 !border !border-red-100">
                  <div className="!flex !items-center !gap-4">
                    <div className="!w-16 !h-16 !rounded-xl !bg-red-100 !flex !items-center !justify-center !flex-shrink-0">
                      <FaPlane className="!text-red-600 !text-2xl" />
                    </div>
                    <div>
                      <div className="!font-bold !text-gray-900 !text-lg">
                        {flightToDelete.originAirport} → {flightToDelete.destinationAirport}
                      </div>
                      <div className="!text-sm !text-gray-600 !mt-1">
                        {flightToDelete.co2Tons.toFixed(2)} t CO₂ • {new Date(flightToDelete.date).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error (si existe) */}
                {deleteError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="!bg-red-50 !border !border-red-200 !rounded-xl !p-4 !mb-6"
                  >
                    <p className="!text-red-700 !text-sm !m-0 !font-medium">{deleteError}</p>
                  </motion.div>
                )}

                {/* Aviso */}
                <p className="!text-gray-600 !text-center !mb-8 !text-sm">
                  Se eliminará este vuelo de tu historial. No podrás recuperarlo después.
                </p>

                {/* Botones */}
                <div className="!flex !gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelDelete}
                    disabled={deletingId === flightToDelete.id}
                    className="!flex-1 !py-3 !bg-gray-100 !text-gray-700 !rounded-xl !font-semibold !transition !border-0 !cursor-pointer hover:!bg-gray-200 disabled:!opacity-50"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmDelete}
                    disabled={deletingId === flightToDelete.id}
                    className="!flex-1 !py-3 !bg-gradient-to-r !from-red-500 !to-rose-600 !text-white !rounded-xl !font-bold !transition !border-0 !cursor-pointer hover:!shadow-lg !shadow-red-500/30 disabled:!opacity-50 disabled:!cursor-not-allowed"
                  >
                    {deletingId === flightToDelete.id ? (
                      <span className="!flex !items-center !justify-center !gap-2">
                        <div className="!w-4 !h-4 !border-2 !border-white/30 !border-t-white !rounded-full !animate-spin"></div>
                        Eliminando...
                      </span>
                    ) : (
                      'Sí, Eliminar'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </B2CLayout>
  );
};

export default B2CFlightsPage;
