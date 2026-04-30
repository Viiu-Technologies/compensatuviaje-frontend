import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaTree,
  FaLeaf,
  FaGlobeAmericas,
  FaCertificate,
  FaPlane,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import B2CLayout from './B2CLayout';
import b2cApi, { type DashboardData } from '../services/b2cApi';
import { TrophyRoomPanel } from './badges/TrophyRoomPanel';

const emptyDashboard: DashboardData = {
  user: { nombre: '', email: '', avatarUrl: null, memberSince: new Date().toISOString() },
  stats: {
    totalFlights: 0,
    totalEmissionsKg: 0,
    totalEmissionsTons: 0,
    totalCompensatedKg: 0,
    totalCompensatedTons: 0,
    totalPendingKg: 0,
    totalPendingTons: 0,
    certificatesCount: 0,
    treesEquivalent: 0,
    compensationRate: 0,
  },
  recentFlights: [],
  recentCertificates: [],
};

const B2CDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashData = await b2cApi.getDashboardStats();
        setData(dashData);
      } catch (err: any) {
        console.error('Error fetching dashboard:', err);
        setError(err.message || 'Error cargando datos');
        // Use empty dashboard so the page renders with zeros instead of error page
        setData(emptyDashboard);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <B2CLayout>
        <div className="!flex !items-center !justify-center !py-20">
          <div className="!text-center">
            <div className="!w-16 !h-16 !border-4 !border-green-200 !border-t-green-600 !rounded-full !animate-spin !mx-auto !mb-4"></div>
            <p className="!text-gray-500">Cargando tu dashboard...</p>
          </div>
        </div>
      </B2CLayout>
    );
  }

  if (error || !data) {
    // If data and error, we still show the dashboard with zeros (set in catch above).
    // Only show full error page if data is truly null (shouldn't happen now).
    if (!data) {
      return (
        <B2CLayout>
          <div className="!text-center !py-20">
            <p className="!text-red-500 !mb-4">{error || 'Error cargando datos'}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="!px-4 !py-2 !bg-green-600 !text-white !rounded-lg !border-0 !cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        </B2CLayout>
      );
    }
  }

  const { stats, recentFlights, recentCertificates } = data;

  const impactStats = [
    { emoji: '🌳', value: stats.treesEquivalent.toLocaleString(), label: 'árboles equivalentes' },
    { emoji: '✈️', value: stats.totalFlights.toString(), label: 'vuelos registrados' },
    { emoji: '☁️', value: `${stats.totalCompensatedTons.toFixed(2)}`, label: 'tCO₂ compensadas' },
    { emoji: '📊', value: `${stats.compensationRate}%`, label: 'tasa compensación' }
  ];

  return (
    <B2CLayout>
      <div className="!space-y-8">
        {/* ERROR BANNER (subtle, when API failed but we show empty state) */}
        {error && (
          <div className="!flex !items-center !gap-3 !bg-yellow-50 !border !border-yellow-200 !rounded-xl !px-4 !py-3 !text-sm !text-yellow-800">
            <span>⚠️</span>
            <span>No pudimos cargar tus datos en este momento. Mostrando estado vacío.</span>
            <button 
              onClick={() => window.location.reload()} 
              className="!ml-auto !px-3 !py-1 !bg-yellow-200 !text-yellow-800 !rounded-lg !border-0 !cursor-pointer !text-xs !font-semibold hover:!bg-yellow-300"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* HERO BANNER */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="!w-full"
        >
          <div className="!relative !overflow-hidden !rounded-3xl !bg-gradient-to-r !from-green-500 !via-green-600 !to-emerald-600 !p-8 md:!p-12 !shadow-2xl">
            <div className="!absolute !top-0 !right-0 !w-64 !h-64 !bg-white/10 !rounded-full !blur-3xl !transform !translate-x-1/3 -!translate-y-1/3"></div>
            
            <div className="!relative !z-10 !flex !flex-col md:!flex-row !items-center !justify-between !gap-6">
              <div className="!flex-1 !text-white">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="!inline-flex !items-center !gap-2 !px-4 !py-2 !rounded-full !bg-white/20 !backdrop-blur-sm !mb-4"
                >
                  <HiSparkles className="!text-yellow-300" />
                  <span className="!text-sm !font-semibold">¡Compensa tu huella ahora!</span>
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="!text-3xl md:!text-4xl !font-bold !mb-3 !leading-tight"
                >
                  Calcula tu Huella de Carbono
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="!text-green-50 !text-base md:!text-lg !mb-6 !max-w-xl"
                >
                  Descubre el impacto de tus viajes y compénsalo en minutos. Apoya proyectos ambientales verificados.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="!flex !flex-wrap !gap-3"
                >
                  <Link to="/b2c/calculator">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="!px-6 !py-3 !bg-white !text-green-600 !rounded-full !font-bold !shadow-lg hover:!shadow-xl !transition-all !flex !items-center !gap-2 !border-0 !cursor-pointer"
                    >
                      <FaLeaf /> Calcular Ahora
                    </motion.button>
                  </Link>
                  <Link to="/b2c/projects">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="!px-6 !py-3 !bg-white/10 !backdrop-blur-sm !text-white !border-2 !border-white/30 !rounded-full !font-semibold hover:!bg-white/20 !transition-all !cursor-pointer"
                    >
                      Ver Proyectos
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="!flex-shrink-0"
              >
                <div className="!relative !w-48 !h-48 md:!w-56 md:!h-56">
                  <div className="!absolute !inset-0 !bg-white/20 !rounded-full !animate-pulse"></div>
                  <div className="!absolute !inset-4 !bg-white/30 !rounded-full !flex !items-center !justify-center">
                    <FaGlobeAmericas className="!text-8xl !text-white/90" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ESTADÍSTICAS DE IMPACTO */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="!w-full"
        >
          <div className="!flex !items-center !justify-between !mb-6">
            <div>
              <div className="!inline-flex !items-center !gap-2 !px-3 !py-1 !rounded-full !bg-blue-50 !text-blue-700 !text-xs !font-semibold !mb-2 !border !border-blue-100">
                <HiSparkles /> <span>Tu Impacto</span>
              </div>
              <h2 className="!text-xl !font-bold !text-gray-900">Resumen de Impacto</h2>
            </div>
          </div>

          <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 !gap-6">
            {impactStats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="!bg-white !rounded-2xl !p-6 !border !border-gray-100 !shadow-sm !relative !overflow-hidden group !flex !flex-col !justify-between !h-full !cursor-pointer"
              >
                <div className="!absolute !inset-0 !bg-gradient-to-br !from-green-50/0 group-hover:!from-green-50/100 !to-transparent !opacity-0 group-hover:!opacity-100 !transition-opacity !duration-300"></div>
                <div className="!absolute !top-0 !right-0 !p-4 !opacity-10 group-hover:!opacity-20 !transition-all !duration-300 !transform group-hover:!scale-125 !pointer-events-none">
                  <span className="!text-6xl">{stat.emoji}</span>
                </div>
                <div className="!relative !z-10">
                  <div className="!w-12 !h-12 !rounded-full !bg-gradient-to-br !from-green-100 !to-green-50 !flex !items-center !justify-center !text-2xl !mb-4 !shadow-sm">
                    {stat.emoji}
                  </div>
                  <div className="!text-3xl !font-bold !text-gray-900 !mb-1 group-hover:!text-green-600 !transition-colors">
                    {stat.value}
                  </div>
                  <p className="!text-xs !font-bold !text-gray-400 !uppercase !tracking-wider">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* TROPHY ROOM */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="!w-full"
        >
          <TrophyRoomPanel totalCompensatedKg={stats.totalCompensatedKg} />
        </motion.section>

        {/* VUELOS RECIENTES */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="!w-full"
        >
          <div className="!bg-white !rounded-2xl !border !border-gray-200 !shadow-sm !p-6">
            <div className="!flex !items-center !justify-between !mb-6">
              <div>
                <h3 className="!text-lg !font-bold !text-gray-800 !mb-1">Vuelos Recientes</h3>
                <p className="!text-sm !text-gray-500">Tus últimos cálculos de emisiones</p>
              </div>
              <Link to="/b2c/flights" className="!text-green-600 !text-sm !font-semibold hover:!text-green-700 !no-underline">
                Ver todos →
              </Link>
            </div>
            
            {recentFlights.length > 0 ? (
              <div className="!overflow-x-auto">
                <table className="!min-w-full !text-sm !text-left">
                  <thead className="!bg-gray-50/50">
                    <tr className="!text-gray-500 !border-b !border-gray-200">
                      <th className="!py-3 !px-4 !font-semibold">Ruta</th>
                      <th className="!py-3 !px-4 !font-semibold">Fecha</th>
                      <th className="!py-3 !px-4 !font-semibold">Emisiones (t CO₂)</th>
                      <th className="!py-3 !px-4 !font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="!divide-y !divide-gray-100">
                    {recentFlights.map((flight) => (
                      <tr key={flight.id} className="hover:!bg-gray-50 !transition-colors">
                        <td className="!py-3 !px-4 !flex !items-center !gap-2">
                          <FaPlane className="!text-xs !text-gray-400"/>
                          {flight.origin} <span className="!text-gray-400">→</span> {flight.destination}
                        </td>
                        <td className="!py-3 !px-4 !text-gray-600">
                          {new Date(flight.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="!py-3 !px-4 !font-medium">{flight.co2Tons.toFixed(2)}</td>
                        <td className="!py-3 !px-4">
                          {flight.isCompensated ? (
                            <span className="!inline-flex !items-center !gap-1 !px-2.5 !py-0.5 !rounded-full !bg-green-100 !text-green-700 !text-xs !font-semibold">
                              <FaCheckCircle className="!text-xs" /> Compensado
                            </span>
                          ) : (
                            <span className="!inline-flex !items-center !gap-1 !px-2.5 !py-0.5 !rounded-full !bg-orange-100 !text-orange-700 !text-xs !font-semibold">
                              <FaClock className="!text-xs" /> Pendiente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="!text-center !py-8 !text-gray-500">
                <FaPlane className="!text-4xl !text-gray-300 !mx-auto !mb-3" />
                <p>Aún no tienes vuelos. ¡Calcula tu primer vuelo!</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* CERTIFICADOS RECIENTES */}
        {recentCertificates.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="!w-full"
          >
            <div className="!bg-white !rounded-2xl !border !border-gray-200 !shadow-sm !p-6">
              <div className="!flex !items-center !justify-between !mb-6">
                <div>
                  <h3 className="!text-lg !font-bold !text-gray-800 !mb-1">Certificados Recientes</h3>
                  <p className="!text-sm !text-gray-500">Tus últimos certificados de compensación</p>
                </div>
                <Link to="/b2c/certificates" className="!text-green-600 !text-sm !font-semibold hover:!text-green-700 !no-underline">
                  Ver todos →
                </Link>
              </div>
              <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-4">
                {recentCertificates.map((cert) => (
                  <Link key={cert.id} to="/b2c/certificates" className="!no-underline">
                    <div className="!bg-gradient-to-br !from-green-50 !to-white !rounded-xl !p-4 !border !border-green-100 hover:!shadow-md !transition-all">
                      <div className="!flex !items-center !gap-2 !mb-2">
                        <FaCertificate className="!text-green-600" />
                        <span className="!font-mono !text-xs !text-gray-500">{cert.number}</span>
                      </div>
                      <div className="!text-2xl !font-bold !text-green-700 !mb-1">{cert.tons.toFixed(2)} t</div>
                      <div className="!text-sm !text-gray-600">{cert.project}</div>
                      <div className="!text-xs !text-gray-400 !mt-1">
                        {new Date(cert.date).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* ACCIONES RÁPIDAS */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="!w-full"
        >
          <h2 className="!text-xl !font-bold !text-gray-900 !mb-6">Acciones Rápidas</h2>
          <div className="!grid md:!grid-cols-2 !gap-6 !pb-8">
            <Link to="/b2c/flights" className="!block !no-underline">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="!bg-gradient-to-br !from-blue-50 !to-white !rounded-2xl !p-6 !shadow-sm !border !border-blue-200 hover:!shadow-lg !transition-all !cursor-pointer group !h-full"
              >
                <div className="!flex !items-start !justify-between !mb-4">
                  <div className="!w-12 !h-12 !rounded-xl !bg-gradient-to-br !from-blue-500 !to-blue-600 !flex !items-center !justify-center !text-white !text-2xl !shadow-lg !shadow-blue-200">
                    <FaPlane />
                  </div>
                  <span className="!text-blue-400 group-hover:!text-blue-500 !transition-colors !text-xl">→</span>
                </div>
                <h3 className="!text-lg !font-bold !text-gray-900 !mb-1 group-hover:!text-blue-700 !transition-colors">Mis Viajes</h3>
                <p className="!text-gray-500 !text-sm">Ver historial de compensaciones</p>
              </motion.div>
            </Link>

            <Link to="/b2c/calculator" className="!block !no-underline">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="!bg-gradient-to-br !from-green-500 !to-green-600 !rounded-2xl !p-6 !shadow-lg !border-2 !border-green-400 hover:!shadow-xl !transition-all !cursor-pointer group !h-full !relative !overflow-hidden"
              >
                <div className="!absolute !top-0 !right-0 !w-32 !h-32 !bg-white/10 !rounded-full !blur-2xl group-hover:!scale-150 !transition-transform"></div>
                <div className="!relative !z-10">
                  <div className="!flex !items-start !justify-between !mb-4">
                    <div className="!w-12 !h-12 !rounded-xl !bg-white/20 !backdrop-blur-sm !flex !items-center !justify-center !text-white !text-2xl !shadow-lg">
                      <FaLeaf />
                    </div>
                  </div>
                  <h3 className="!text-lg !font-bold !text-white !mb-1 !flex !items-center !gap-2">
                    <HiSparkles className="!text-yellow-300" /> Nueva Compensación
                  </h3>
                  <p className="!text-green-50 !text-sm">Calcula y compensa tu huella ahora</p>
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.section>
      </div>
    </B2CLayout>
  );
};

export default B2CDashboard;
