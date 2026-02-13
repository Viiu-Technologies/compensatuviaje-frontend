import React from 'react';
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

const B2CFlightsPage: React.FC = () => {
  // Mock data - Esto vendrá del backend
  const flights = [
    {
      id: '1',
      flightNumber: 'LA800',
      route: { origin: 'SCL', destination: 'MIA' },
      date: '2024-12-20',
      passengers: 1,
      co2Tons: 2.45,
      status: 'compensated',
      certificateId: 'CERT-2024-001'
    },
    {
      id: '2',
      flightNumber: 'AA123',
      route: { origin: 'MIA', destination: 'JFK' },
      date: '2024-12-15',
      passengers: 2,
      co2Tons: 1.8,
      status: 'compensated',
      certificateId: 'CERT-2024-002'
    },
    {
      id: '3',
      flightNumber: 'IB6800',
      route: { origin: 'SCL', destination: 'MAD' },
      date: '2024-12-10',
      passengers: 1,
      co2Tons: 3.2,
      status: 'pending',
      certificateId: null
    }
  ];

  const totalCompensated = flights
    .filter(f => f.status === 'compensated')
    .reduce((sum, f) => sum + f.co2Tons, 0);

  const totalPending = flights
    .filter(f => f.status === 'pending')
    .reduce((sum, f) => sum + f.co2Tons, 0);

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
              <Link to="/calculator" className="!w-full sm:!w-auto">
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
                        <div className="!font-bold !text-gray-900 !text-lg">{flight.flightNumber}</div>
                        <div className="!text-sm !text-gray-500 !flex !items-center !gap-2">
                          <FaMapMarkerAlt className="!text-xs !text-green-500" />
                          {flight.route.origin} → {flight.route.destination}
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
                        <span className="!font-semibold !text-gray-800">{flight.co2Tons} t</span>
                        <span className="!text-gray-400">CO₂</span>
                      </div>
                      {flight.passengers > 1 && (
                        <div className="!text-gray-500">
                          {flight.passengers} pasajeros
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="!flex !items-center !gap-2 sm:!gap-3 !w-full lg:!w-auto !justify-end !flex-wrap">
                    {flight.status === 'compensated' ? (
                      <>
                        <span className="!inline-flex !items-center !gap-2 !px-3 sm:!px-4 !py-2 !rounded-full !bg-green-100 !text-green-700 !text-xs sm:!text-sm !font-semibold">
                          <FaCheckCircle className="!text-green-500" /> Compensado
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="!p-2.5 !bg-gray-100 !rounded-xl hover:!bg-gray-200 !transition !border-0 !cursor-pointer"
                          title="Ver certificado"
                        >
                          <FaEye className="!text-gray-600" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="!p-2.5 !bg-gray-100 !rounded-xl hover:!bg-gray-200 !transition !border-0 !cursor-pointer"
                          title="Descargar certificado"
                        >
                          <FaDownload className="!text-gray-600" />
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <span className="!inline-flex !items-center !gap-2 !px-3 sm:!px-4 !py-2 !rounded-full !bg-orange-100 !text-orange-700 !text-xs sm:!text-sm !font-semibold">
                          <FaClock className="!text-orange-500" /> Pendiente
                        </span>
                        <Link to={`/calculator?flightId=${flight.id}`}>
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
        </motion.div>

        {/* Empty State (si no hay vuelos) */}
        {flights.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="!bg-white !rounded-2xl !p-8 sm:!p-12 !text-center !shadow-sm !border !border-gray-200"
          >
            <div className="!w-20 !h-20 !mx-auto !mb-6 !rounded-2xl !bg-gray-100 !flex !items-center !justify-center">
              <FaPlane className="!text-4xl !text-gray-400" />
            </div>
            <h3 className="!text-xl !font-bold !text-gray-900 !mb-2">
              Aún no tienes vuelos registrados
            </h3>
            <p className="!text-gray-600 !mb-6 !max-w-md !mx-auto">
              Comienza a compensar tus viajes y contribuye a proyectos ambientales verificados
            </p>
            <Link to="/calculator">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="!px-6 !py-3 !bg-green-600 !text-white !rounded-xl !font-bold !shadow-lg hover:!bg-green-700 !transition !border-0 !flex !items-center !gap-2 !mx-auto !cursor-pointer"
              >
                <HiSparkles /> Calcular mi Primer Vuelo
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </B2CLayout>
  );
};

export default B2CFlightsPage;
