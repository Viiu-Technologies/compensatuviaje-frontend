import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { formatCLP, formatCLPPerTon } from '../../../utils/currency';
import { calculateTonsFromUnits, calculateUnitsFromKg } from '../../../utils/carbon';
import {
  FaGlobeAmericas,
  FaTree,
  FaWind,
  FaWater,
  FaSolarPanel,
  FaLeaf,
  FaTimes,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaCertificate,
  FaIndustry,
  FaCreditCard,
  FaSpinner
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import B2CLayout from '../components/B2CLayout';
import b2cApi, { createPaymentTransaction, type B2CProject } from '../services/b2cApi';

const projectTypeConfig: Record<string, { label: string; emoji: string; icon: any; colorFrom: string; colorTo: string; badgeBg: string; badgeText: string }> = {
  reforestation: { label: 'Reforestación', emoji: '🌳', icon: FaTree, colorFrom: '!from-green-50', colorTo: '!to-green-100', badgeBg: '!bg-green-100', badgeText: '!text-green-700' },
  wind_energy: { label: 'Eólica', emoji: '💨', icon: FaWind, colorFrom: '!from-blue-50', colorTo: '!to-blue-100', badgeBg: '!bg-blue-100', badgeText: '!text-blue-700' },
  solar_energy: { label: 'Solar', emoji: '☀️', icon: FaSolarPanel, colorFrom: '!from-yellow-50', colorTo: '!to-yellow-100', badgeBg: '!bg-yellow-100', badgeText: '!text-yellow-700' },
  ocean_conservation: { label: 'Océanos', emoji: '🌊', icon: FaWater, colorFrom: '!from-cyan-50', colorTo: '!to-cyan-100', badgeBg: '!bg-cyan-100', badgeText: '!text-cyan-700' },
  carbon_capture: { label: 'Captura Carbono', emoji: '🏭', icon: FaIndustry, colorFrom: '!from-gray-50', colorTo: '!to-gray-100', badgeBg: '!bg-gray-100', badgeText: '!text-gray-700' },
};

const defaultTypeConfig = { label: 'Proyecto', emoji: '🌿', icon: FaLeaf, colorFrom: '!from-green-50', colorTo: '!to-green-100', badgeBg: '!bg-green-100', badgeText: '!text-green-700' };

function getTypeConfig(type: string) {
  return projectTypeConfig[type] || defaultTypeConfig;
}

const B2CProjectsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<B2CProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<B2CProject | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [payingProjectId, setPayingProjectId] = useState<string | null>(null);

  // Read calculator context from query params
  const calcId = searchParams.get('calcId');
  const tonsParam = searchParams.get('tons');
  const kgParam = searchParams.get('kg');
  const emissionsKg = kgParam ? parseFloat(kgParam) : (tonsParam ? parseFloat(tonsParam) * 1000 : null);
  const hasCalculation = Boolean(calcId && emissionsKg && emissionsKg > 0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await b2cApi.getPublicProjects();
        setProjects(data);
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError(err.message || 'Error cargando proyectos');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  /** Calculate per-project total CLP for the user's emissions */
  const getProjectTotalCLP = (project: B2CProject): number | null => {
    if (!emissionsKg || project.pricePerTonCLP <= 0) return null;
    return Math.round(emissionsKg * (project.pricePerTonCLP / 1000));
  };

  /** Trigger Webpay payment for a project */
  const handlePayProject = async (project: B2CProject) => {
    if (!calcId) return;
    setPayingProjectId(project.id);
    setError(null);
    try {
      const physicalUnits =
        project.carbon_capture_per_unit && emissionsKg
          ? calculateUnitsFromKg(emissionsKg, project.carbon_capture_per_unit)
          : undefined;

      const data = await createPaymentTransaction({
        calculationId: calcId,
        projectId: project.id,
        physicalUnits,
        co2KgToFreeze: emissionsKg ?? undefined,
      });

      if (data.success && data.url && data.token) {
        // Redirect to Webpay
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.url;
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'token_ws';
        input.value = data.token;
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        return;
      }
    } catch (err: any) {
      console.error('Error creating payment:', err);
      setError(err.message || 'Error al crear transacción de pago');
    } finally {
      setPayingProjectId(null);
    }
  };

  // Build dynamic filter list from existing project types
  const uniqueTypes = [...new Set(projects.map(p => p.projectType))];
  const projectTypes = [
    { id: 'all', label: 'Todos', icon: FaGlobeAmericas },
    ...uniqueTypes.map(t => ({
      id: t,
      label: getTypeConfig(t).label,
      icon: getTypeConfig(t).icon
    }))
  ];

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.projectType === filter);

  if (loading) {
    return (
      <B2CLayout title="Proyectos Ambientales" subtitle="Conoce los proyectos que estás apoyando con tus compensaciones">
        <div className="!flex !items-center !justify-center !py-20">
          <div className="!text-center">
            <div className="!w-16 !h-16 !border-4 !border-green-200 !border-t-green-600 !rounded-full !animate-spin !mx-auto !mb-4"></div>
            <p className="!text-gray-500">Cargando proyectos...</p>
          </div>
        </div>
      </B2CLayout>
    );
  }

  return (
    <B2CLayout title="Proyectos Ambientales" subtitle="Conoce los proyectos que estás apoyando con tus compensaciones">
      <div className="!space-y-6">
        {/* Calculator context banner */}
        {hasCalculation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="!bg-gradient-to-r !from-emerald-50 !to-teal-50 !border !border-emerald-200 !rounded-2xl !p-5 !flex !items-center !gap-4"
          >
            <div className="!w-12 !h-12 !rounded-xl !bg-emerald-100 !flex !items-center !justify-center !flex-shrink-0">
              <HiSparkles className="!text-emerald-600 !text-xl" />
            </div>
            <div>
              <p className="!text-emerald-800 !font-semibold !m-0">
                Tu huella: {emissionsKg!.toLocaleString()} kg CO₂e ({(emissionsKg! / 1000).toFixed(4)} ton)
              </p>
              <p className="!text-emerald-600 !text-sm !m-0">
                Elige un proyecto para compensar tu vuelo. El precio se calcula automáticamente.
              </p>
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="!bg-red-50 !border !border-red-200 !rounded-xl !p-4 !text-red-700 !text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="!flex !flex-wrap !gap-2 sm:!gap-3"
        >
          {projectTypes.map((type) => (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilter(type.id)}
              className={`!px-3 sm:!px-4 !py-2 !rounded-xl !font-semibold !text-sm !flex !items-center !gap-2 !transition-all !border-2 !cursor-pointer ${
                filter === type.id
                  ? '!bg-green-600 !text-white !border-green-600'
                  : '!bg-white !text-gray-700 !border-gray-200 hover:!border-green-300'
              }`}
            >
              <type.icon />
              <span className="!hidden sm:!inline">{type.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 xl:!grid-cols-4 !gap-4 sm:!gap-6">
          {filteredProjects.map((project, index) => {
            const tc = getTypeConfig(project.projectType);
            const soldOut = project.isSoldOut;
            const availableUnits = project.availableUnits;
            // Monthly progress bar: units sold this month vs monthly approved
            const monthlyApproved = project.monthlyStockApproved || 0;
            const monthlyRemaining = project.monthlyStockRemaining || 0;
            const monthlyUnitsSold = Math.max(monthlyApproved - monthlyRemaining, 0);
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={soldOut ? undefined : { y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                onClick={() => setSelectedProject(project)}
                className={`!rounded-2xl !border !border-gray-200 !bg-gradient-to-br ${tc.colorFrom} ${tc.colorTo} !p-6 !flex !flex-col !shadow-sm !transition-all !cursor-pointer group ${soldOut ? '!grayscale !opacity-70' : ''}`}
              >
                {/* Project Header */}
                <div className="!flex !items-start !justify-between !mb-4">
                  <div className="!text-5xl">{tc.emoji}</div>
                  <span className={`!inline-block !px-3 !py-1 !rounded-full ${tc.badgeBg} ${tc.badgeText} !text-xs !font-semibold`}>
                    {tc.label}
                  </span>
                </div>
                {soldOut && (
                  <div className="!inline-flex !items-center !gap-1 !px-2 !py-1 !rounded-full !bg-gray-800 !text-white !text-xs !font-semibold !mb-3 !w-fit">
                    Meta Completada 🎯
                  </div>
                )}

                {/* Project Info */}
                <h3 className="!text-lg !font-bold !text-gray-800 !mb-2 group-hover:!text-green-700 !transition-colors">
                  {project.name}
                </h3>
                <div className="!flex !items-center !gap-1 !text-sm !text-gray-600 !mb-2">
                  <FaMapMarkerAlt className="!text-xs" />
                  {project.region && `${project.region}, `}{project.country}
                </div>
                {project.partner?.name && (
                  <div className="!text-xs !text-gray-500 !mb-4">
                    Por: {project.partner.name}
                  </div>
                )}
                {project.certification && (
                  <div className="!inline-flex !items-center !gap-1 !px-2 !py-0.5 !rounded-full !bg-white/70 !text-gray-600 !text-xs !font-medium !mb-4 !w-fit">
                    <FaCertificate className="!text-green-500 !text-xs" /> {project.certification}
                  </div>
                )}

                {/* Stats */}
                <div className="!space-y-2 !mb-4">
                  <div className="!flex !justify-between !text-sm">
                    <span className="!text-gray-600">Cupo mensual:</span>
                    <span className="!font-semibold !text-gray-800">{monthlyApproved.toLocaleString()} {project.impact_unit || 'uds'}</span>
                  </div>
                  <div className="!flex !justify-between !text-sm">
                    <span className="!text-gray-600">Disponible:</span>
                    <span className="!font-semibold !text-gray-800">
                      {availableUnits.toLocaleString()} {project.impact_unit || 'uds'}
                      {project.carbon_capture_per_unit && availableUnits > 0 && (
                        <span className="!text-gray-400 !font-normal !ml-1">
                          ({calculateTonsFromUnits(availableUnits, project.carbon_capture_per_unit)} t CO₂)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="!flex !justify-between !text-sm">
                    <span className="!text-gray-600">Precio:</span>
                    <span className="!font-semibold !text-gray-800">{formatCLPPerTon(project.pricePerTonCLP)}</span>
                  </div>
                  {hasCalculation && (() => {
                    const total = getProjectTotalCLP(project);
                    return total ? (
                      <div className="!flex !justify-between !text-sm !pt-1 !border-t !border-gray-200/50">
                        <span className="!text-emerald-700 !font-medium">Tu compensación:</span>
                        <span className="!font-bold !text-emerald-700">{formatCLP(total)}</span>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Monthly Progress Bar */}
                <div className="!mt-auto">
                  <div className="!flex !justify-between !text-xs !text-gray-600 !mb-1">
                    <span>Progreso mensual</span>
                    <span className="!font-semibold">{project.progress}%</span>
                  </div>
                  <div className="!w-full !h-2 !bg-white/50 !rounded-full !overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`!h-2 !rounded-full ${soldOut ? '!bg-gray-400' : '!bg-green-500'}`}
                    />
                  </div>
                  <div className="!flex !justify-between !text-xs !text-gray-400 !mt-1">
                    <span>{monthlyUnitsSold.toLocaleString()} {project.impact_unit || 'uds'} vendidas</span>
                    <span>{monthlyApproved.toLocaleString()} {project.impact_unit || 'uds'} aprobadas</span>
                  </div>
                </div>

                {/* Hover Indicator */}
                <div className={`!mt-4 !text-sm !font-semibold !opacity-0 group-hover:!opacity-100 !transition-opacity !flex !items-center !gap-1 ${soldOut ? '!text-gray-600' : '!text-green-600'}`}>
                  {soldOut ? 'Solo lectura' : 'Ver detalles'} <span>→</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredProjects.length === 0 && !loading && (
          <div className="!text-center !py-12">
            <FaGlobeAmericas className="!text-5xl !text-gray-300 !mx-auto !mb-4" />
            <h3 className="!text-lg !font-bold !text-gray-700 !mb-2">No hay proyectos disponibles</h3>
            <p className="!text-gray-500">No se encontraron proyectos {filter !== 'all' ? 'con este filtro' : 'activos en este momento'}.</p>
          </div>
        )}

        {/* Project Detail Modal */}
        <AnimatePresence>
          {selectedProject && (() => {
            const tc = getTypeConfig(selectedProject.projectType);
            const selectedProjectIsSoldOut = selectedProject.isSoldOut;
            const selMonthlyApproved = selectedProject.monthlyStockApproved || 0;
            const selMonthlyRemaining = selectedProject.monthlyStockRemaining || 0;
            const selMonthlyUnitsSold = Math.max(selMonthlyApproved - selMonthlyRemaining, 0);
            const heroPhoto = selectedProject.photos?.[0]?.url ?? null;
            const veritas = selectedProject.veritasAI;
            const veritasLabel = veritas?.level
              ? `${veritas.level}${veritas.finalScore !== null ? ` · ${veritas.finalScore}/100` : ''}`
              : null;

            // Co-benefits: support array of strings OR object { key: true }
            const coBenefitsRaw = selectedProject.coBenefits;
            let coBenefitChips: string[] = [];
            if (Array.isArray(coBenefitsRaw)) {
              coBenefitChips = coBenefitsRaw.map(String);
            } else if (coBenefitsRaw && typeof coBenefitsRaw === 'object') {
              coBenefitChips = Object.entries(coBenefitsRaw)
                .filter(([, v]) => v)
                .map(([k]) => k);
            }

            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProject(null)}
                className="!fixed !inset-0 !bg-black/60 !backdrop-blur-sm !z-50 !flex !items-center !justify-center !p-4"
              >
                <motion.div
                  initial={{ scale: 0.92, y: 24 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.92, y: 24 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  onClick={(e) => e.stopPropagation()}
                  className="!bg-white !rounded-3xl !max-w-lg !w-full !max-h-[92vh] !overflow-y-auto !shadow-2xl"
                >
                  {/* ── Hero image / gradient header ─────────────────── */}
                  <div className="!relative !overflow-hidden !rounded-t-3xl">
                    {heroPhoto ? (
                      <img
                        src={heroPhoto}
                        alt={selectedProject.name}
                        className="!w-full !h-52 !object-cover"
                      />
                    ) : (
                      <div className={`!w-full !h-52 !bg-gradient-to-br ${tc.colorFrom} ${tc.colorTo} !flex !items-center !justify-center`}>
                        <span className="!text-8xl !opacity-60">{tc.emoji}</span>
                      </div>
                    )}

                    {/* Overlay gradient at bottom for text readability */}
                    <div className="!absolute !inset-0 !bg-gradient-to-t !from-black/60 !via-transparent !to-transparent" />

                    {/* Close button */}
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="!absolute !top-3 !right-3 !w-9 !h-9 !bg-black/40 hover:!bg-black/60 !backdrop-blur-sm !rounded-full !flex !items-center !justify-center !text-white !transition !border-0 !cursor-pointer"
                    >
                      <FaTimes className="!text-sm" />
                    </button>

                    {/* Type badge on the image */}
                    <span className={`!absolute !top-3 !left-3 !px-2.5 !py-1 !rounded-full !text-xs !font-semibold !backdrop-blur-sm !bg-white/80 !text-gray-700`}>
                      {tc.emoji} {tc.label}
                    </span>

                    {/* Title & location over the image */}
                    <div className="!absolute !bottom-0 !left-0 !right-0 !p-5">
                      {selectedProjectIsSoldOut && (
                        <span className="!inline-flex !items-center !gap-1 !px-2 !py-0.5 !rounded-full !bg-gray-800/80 !text-white !text-xs !font-semibold !mb-2">
                          Meta Completada 🎯
                        </span>
                      )}
                      <h2 className="!text-2xl !font-bold !text-white !leading-tight !mb-1">
                        {selectedProject.name}
                      </h2>
                      <div className="!flex !items-center !gap-1.5 !text-white/80 !text-sm">
                        <FaMapMarkerAlt className="!text-xs !flex-shrink-0" />
                        <span>{selectedProject.region && `${selectedProject.region}, `}{selectedProject.country}</span>
                        {selectedProject.partner?.name && (
                          <span className="!text-white/60 !ml-1">· {selectedProject.partner.name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Modal body ───────────────────────────────────── */}
                  <div className="!p-6 !space-y-5">

                    {/* Trust badge — Veritas AI */}
                    {veritasLabel && (
                      <div className="!flex !items-center !gap-2 !bg-emerald-50 !border !border-emerald-200 !rounded-xl !px-4 !py-2.5">
                        <span className="!text-emerald-600 !text-base">🛡️</span>
                        <div>
                          <span className="!text-xs !text-emerald-500 !font-medium !block !leading-none !mb-0.5">Auditado por Veritas AI</span>
                          <span className="!text-sm !font-bold !text-emerald-700">{veritasLabel}</span>
                        </div>
                        {selectedProject.certification && (
                          <div className="!ml-auto !flex !items-center !gap-1 !text-xs !text-gray-500 !font-medium">
                            <FaCertificate className="!text-green-500" />
                            {selectedProject.certification}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Certification alone (if no Veritas AI) */}
                    {!veritasLabel && selectedProject.certification && (
                      <div className="!flex !items-center !gap-2 !bg-gray-50 !border !border-gray-200 !rounded-xl !px-4 !py-2.5">
                        <FaCertificate className="!text-green-500" />
                        <span className="!text-sm !font-medium !text-gray-700">{selectedProject.certification}</span>
                      </div>
                    )}

                    {/* Description — 3 lines max */}
                    {selectedProject.description && (
                      <p className="!text-gray-600 !text-sm !leading-relaxed !line-clamp-3 !m-0">
                        {selectedProject.description}
                      </p>
                    )}

                    {/* Co-benefits chips */}
                    {coBenefitChips.length > 0 && (
                      <div className="!flex !flex-wrap !gap-2">
                        {coBenefitChips.map((chip) => (
                          <span
                            key={chip}
                            className="!px-2.5 !py-1 !bg-green-50 !border !border-green-200 !text-green-700 !text-xs !font-medium !rounded-full"
                          >
                            🌿 {chip}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* FOMO — Monthly progress bar */}
                    <div className="!bg-gray-50 !rounded-xl !p-4">
                      <div className="!flex !items-center !justify-between !mb-2">
                        <span className="!text-sm !font-semibold !text-gray-700">Disponibilidad mensual</span>
                        <span className={`!text-sm !font-bold ${selectedProjectIsSoldOut ? '!text-gray-500' : '!text-green-600'}`}>
                          {selectedProject.progress}%
                        </span>
                      </div>
                      <div className="!w-full !h-3 !bg-white !rounded-full !overflow-hidden !shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedProject.progress}%` }}
                          transition={{ duration: 0.9, ease: 'easeOut' }}
                          className={`!h-3 !rounded-full ${selectedProjectIsSoldOut ? '!bg-gradient-to-r !from-gray-400 !to-gray-500' : '!bg-gradient-to-r !from-green-500 !to-emerald-500'}`}
                        />
                      </div>
                      <div className="!flex !justify-between !text-xs !text-gray-400 !mt-1.5">
                        <span>{selMonthlyUnitsSold.toLocaleString()} {selectedProject.impact_unit || 'uds'} vendidas</span>
                        <span>{selMonthlyApproved.toLocaleString()} {selectedProject.impact_unit || 'uds'} aprobadas</span>
                      </div>
                    </div>

                    {/* Pricing block */}
                    {hasCalculation && (() => {
                      const total = getProjectTotalCLP(selectedProject);
                      return total ? (
                        <div className="!bg-emerald-50 !rounded-xl !p-4 !text-center !border !border-emerald-200">
                          <div className="!text-xs !text-emerald-600 !font-medium !mb-0.5">Total a pagar por tu compensación</div>
                          <div className="!text-3xl !font-bold !text-emerald-700">{formatCLP(total)}</div>
                          <div className="!text-xs !text-emerald-500 !mt-1">
                            {tonsParam ? parseFloat(tonsParam).toFixed(4) : (emissionsKg! / 1000).toFixed(4)} ton CO₂ × {formatCLP(selectedProject.pricePerTonCLP)} / ton
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {/* CTA button */}
                    <motion.button
                      whileHover={selectedProjectIsSoldOut ? undefined : { scale: 1.02 }}
                      whileTap={selectedProjectIsSoldOut ? undefined : { scale: 0.98 }}
                      className={`!w-full !px-6 !py-4 !text-white !rounded-xl !font-bold !shadow-lg !transition !border-0 !flex !items-center !justify-center !gap-2 !text-base ${selectedProjectIsSoldOut ? '!bg-gray-400 !cursor-not-allowed !shadow-none' : '!bg-gradient-to-r !from-green-600 !to-emerald-600 hover:!shadow-xl !cursor-pointer'}`}
                      disabled={selectedProjectIsSoldOut || payingProjectId === selectedProject.id}
                      onClick={() => {
                        if (selectedProjectIsSoldOut) return;
                        if (hasCalculation) {
                          handlePayProject(selectedProject);
                        } else {
                          setSelectedProject(null);
                          window.location.href = `/b2c/calculator`;
                        }
                      }}
                    >
                      {payingProjectId === selectedProject.id ? (
                        <><FaSpinner className="!animate-spin" /> Procesando pago...</>
                      ) : selectedProjectIsSoldOut ? (
                        <>Meta Completada</>
                      ) : hasCalculation ? (
                        <><FaCreditCard /> Compensar con Este Proyecto</>
                      ) : (
                        <><FaLeaf /> Calcular mi Huella Primero</>
                      )}
                    </motion.button>

                    {/* Exit link — transparency page */}
                    <div className="!text-center">
                      {selectedProject.transparencyUrl ? (
                        <a
                          href={selectedProject.transparencyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="!text-xs !text-gray-400 hover:!text-gray-600 !transition !inline-flex !items-center !gap-1.5 !no-underline"
                        >
                          📄 Ver evidencia, certificados y auditoría completa
                          <span>↗</span>
                        </a>
                      ) : (
                        <span className="!text-xs !text-gray-300 !inline-flex !items-center !gap-1.5 !cursor-default">
                          📄 Página de transparencia próximamente
                        </span>
                      )}
                    </div>

                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </B2CLayout>
  );
};

export default B2CProjectsPage;
