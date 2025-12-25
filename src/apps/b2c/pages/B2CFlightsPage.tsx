import React from 'react';
import { motion } from 'framer-motion';
import {
  FaPlane,
  FaCheckCircle,
  FaClock,
  FaDownload,
  FaEye,
  FaMapMarkerAlt,
  FaCalendarAlt
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { Link } from 'react-router-dom';

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
    <div className="!min-h-screen !bg-gray-50 !p-6">
      <div className="!max-w-6xl !mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="!mb-8"
        >
          <div className="!flex !items-center !gap-3 !mb-2">
            <FaPlane className="!text-3xl !text-blue-600" />
            <h1 className="!text-3xl !font-bold !text-gray-900">Mis Viajes</h1>
          </div>
          <p className="!text-gray-600">Historial de compensaciones de tus vuelos</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-6 !mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="!bg-white !rounded-2xl !p-6 !shadow-sm !border !border-gray-200"
          >
            <div className="!flex !items-center !justify-between !mb-2">
              <span className="!text-gray-600 !text-sm !font-medium">Total Vuelos</span>
              <FaPlane className="!text-gray-400" />
            </div>
            <div className="!text-3xl !font-bold !text-gray-900">{flights.length}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="!bg-gradient-to-br !from-green-500 !to-green-600 !rounded-2xl !p-6 !shadow-lg !text-white"
          >
            <div className="!flex !items-center !justify-between !mb-2">
              <span className="!text-green-50 !text-sm !font-medium">CO₂ Compensado</span>
              <FaCheckCircle className="!text-green-200" />
            </div>
            <div className="!text-3xl !font-bold">{totalCompensated.toFixed(2)} t</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="!bg-white !rounded-2xl !p-6 !shadow-sm !border !border-orange-200"
          >
            <div className="!flex !items-center !justify-between !mb-2">
              <span className="!text-gray-600 !text-sm !font-medium">CO₂ Pendiente</span>
              <FaClock className="!text-orange-400" />
            </div>
            <div className="!text-3xl !font-bold !text-orange-600">{totalPending.toFixed(2)} t</div>
          </motion.div>
        </div>

        {/* Flights List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="!bg-white !rounded-2xl !shadow-sm !border !border-gray-200 !overflow-hidden"
        >
          <div className="!p-6 !border-b !border-gray-200">
            <div className="!flex !items-center !justify-between">
              <div>
                <h2 className="!text-xl !font-bold !text-gray-900 !mb-1">Historial de Vuelos</h2>
                <p className="!text-sm !text-gray-600">Todos tus vuelos compensados y pendientes</p>
              </div>
              <Link to="/calculator">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="!px-4 !py-2 !bg-green-600 !text-white !rounded-lg !font-semibold !text-sm !shadow hover:!bg-green-700 !transition !border-0 !flex !items-center !gap-2"
                >
                  <HiSparkles /> Nuevo Vuelo
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
                className="!p-6 hover:!bg-gray-50 !transition-colors"
              >
                <div className="!flex !flex-col md:!flex-row !items-start md:!items-center !justify-between !gap-4">
                  {/* Flight Info */}
                  <div className="!flex-1">
                    <div className="!flex !items-center !gap-3 !mb-2">
                      <div className="!w-10 !h-10 !rounded-full !bg-blue-100 !flex !items-center !justify-center">
                        <FaPlane className="!text-blue-600" />
                      </div>
                      <div>
                        <div className="!font-semibold !text-gray-900 !text-lg">{flight.flightNumber}</div>
                        <div className="!text-sm !text-gray-500 !flex !items-center !gap-2">
                          <FaMapMarkerAlt className="!text-xs" />
                          {flight.route.origin} → {flight.route.destination}
                        </div>
                      </div>
                    </div>
                    
                    <div className="!flex !flex-wrap !gap-4 !text-sm !text-gray-600 !ml-13">
                      <div className="!flex !items-center !gap-1">
                        <FaCalendarAlt className="!text-xs !text-gray-400" />
                        {new Date(flight.date).toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="!flex !items-center !gap-1">
                        <span className="!font-medium">{flight.co2Tons} t CO₂</span>
                      </div>
                      {flight.passengers > 1 && (
                        <div>
                          {flight.passengers} pasajeros
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="!flex !items-center !gap-3">
                    {flight.status === 'compensated' ? (
                      <>
                        <span className="!inline-flex !items-center !gap-2 !px-4 !py-2 !rounded-full !bg-green-100 !text-green-700 !text-sm !font-semibold">
                          <FaCheckCircle /> Compensado
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="!p-2 !bg-gray-100 !rounded-lg hover:!bg-gray-200 !transition !border-0"
                          title="Ver certificado"
                        >
                          <FaEye className="!text-gray-600" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="!p-2 !bg-gray-100 !rounded-lg hover:!bg-gray-200 !transition !border-0"
                          title="Descargar certificado"
                        >
                          <FaDownload className="!text-gray-600" />
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <span className="!inline-flex !items-center !gap-2 !px-4 !py-2 !rounded-full !bg-orange-100 !text-orange-700 !text-sm !font-semibold">
                          <FaClock /> Pendiente
                        </span>
                        <Link to={`/calculator?flightId=${flight.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            className="!px-4 !py-2 !bg-green-600 !text-white !rounded-lg !text-sm !font-semibold hover:!bg-green-700 !transition !border-0"
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
            className="!bg-white !rounded-2xl !p-12 !text-center !shadow-sm !border !border-gray-200"
          >
            <div className="!w-20 !h-20 !mx-auto !mb-6 !rounded-full !bg-gray-100 !flex !items-center !justify-center">
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="!px-6 !py-3 !bg-green-600 !text-white !rounded-full !font-bold !shadow-lg hover:!bg-green-700 !transition !border-0 !flex !items-center !gap-2 !mx-auto"
              >
                <HiSparkles /> Calcular mi Primer Vuelo
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default B2CFlightsPage;
