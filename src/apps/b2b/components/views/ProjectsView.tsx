import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TreePine,
  MapPin,
  Calendar,
  Users,
  Leaf,
  Filter,
  Search,
  Grid,
  List,
  ExternalLink,
  Heart,
  Share2,
  ChevronRight,
  Cloud,
  Droplets,
  Bird,
  Mountain,
  Loader2,
  X,
  ShoppingCart,
  Building2,
  Copy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { 
  getProjects, 
  getMockProjects,
  filterMockProjects,
  type Project 
} from '../../services/projectsService';
import { createOrder, getBankDetails, type BankDetails } from '../../services/ordersService';
import { calculateUnitsFromTons, calculateTonsFromUnits } from '../../../../utils/carbon';

interface CheckoutModalProps {
  project: Project;
  isDark: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ project, isDark, onClose, onSuccess }) => {
  const [tonsTco2, setTonsTco2] = useState<string>('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderCreated, setOrderCreated] = useState<{ id: string; amount: number } | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [copied, setCopied] = useState(false);

  const tons = parseFloat(tonsTco2) || 0;
  // Unidades físicas que se reservarán (Enfoque B)
  const physicalUnits = project.carbon_capture_per_unit
    ? calculateUnitsFromTons(tons, project.carbon_capture_per_unit)
    : null;
  // Stock disponible en toneladas equivalentes para validar el límite
  const availableTons = project.carbon_capture_per_unit && project.availableUnits
    ? calculateTonsFromUnits(project.availableUnits, project.carbon_capture_per_unit)
    : (project.availableUnits || 0);
  const isOverLimit = tons > 0 && tons > availableTons;
  const totalCLP = tons > 0 ? Math.round(tons * project.pricePerTonCLP) : 0;

  useEffect(() => {
    getBankDetails().then(setBankDetails).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (tons <= 0) {
      setError('Ingresa una cantidad válida de toneladas');
      return;
    }
    if (isOverLimit) {
      setError(`La cantidad excede el stock disponible (${availableTons.toLocaleString()} t)`);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await createOrder({
        projectId: project.id,
        tonsTco2: tons,
        // Enfoque B: enviar unidades físicas y kg congelados al backend
        ...(physicalUnits !== null && { physicalUnits }),
        co2KgToFreeze: tons * 1000,
      });
      setOrderCreated({ id: response.order.id, amount: response.order.amount });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Error al crear la orden');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="!fixed !inset-0 !z-[100] !flex !items-center !justify-center !p-4">
      <div className="!absolute !inset-0 !bg-black/60 !backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`!relative !w-full !max-w-lg !rounded-2xl !shadow-2xl !overflow-hidden !max-h-[90vh] !overflow-y-auto ${
          isDark ? '!bg-gray-800 !border !border-gray-700' : '!bg-white'
        }`}
      >
        {/* Header */}
        <div className="!bg-gradient-to-r !from-green-500 !to-emerald-600 !p-6 !text-white">
          <button onClick={onClose} className="!absolute !top-4 !right-4 !text-white/80 hover:!text-white !border-0 !bg-transparent">
            <X className="!w-5 !h-5" />
          </button>
          <h2 className="!text-xl !font-bold">
            {orderCreated ? 'Orden Creada' : 'Compensar con Transferencia'}
          </h2>
          <p className="!text-sm !text-green-100 !mt-1">{project.name}</p>
        </div>

        <div className="!p-6 !space-y-5">
          {!orderCreated ? (
            <>
              {/* Tons input */}
              <div>
                <div className="!flex !justify-between !mb-2">
                  <label className={`!text-sm !font-medium ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>
                    Toneladas de CO₂ a compensar
                  </label>
                  {project.availableUnits !== undefined && (
                    <span className="!text-sm !text-emerald-600 !font-medium">
                      Disponible: {availableTons.toLocaleString()} t
                      {project.impact_unit && project.availableUnits > 0 && (
                        <span className="!text-gray-400 !font-normal !ml-1">
                          ({project.availableUnits.toLocaleString()} {project.impact_unit})
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  max={project.availableUnits}
                  value={tonsTco2}
                  onChange={(e) => { setTonsTco2(e.target.value); setError(null); }}
                  className={`!w-full !px-4 !py-3 !rounded-xl !border !text-lg !font-semibold !outline-none focus:!ring-2 focus:!ring-green-500 ${
                    isOverLimit 
                      ? '!border-red-500 !bg-red-50 !text-red-900' 
                      : (isDark ? '!bg-gray-700 !border-gray-600 !text-white' : '!bg-gray-50 !border-gray-200 !text-gray-900')
                  }`}
                />
                {isOverLimit && (
                  <p className="!text-xs !text-red-600 !mt-1">
                    Cantidad no puede superar el stock mensual disponible ({availableTons.toLocaleString()} t)
                  </p>
                )}
              </div>

              {/* Price breakdown */}
                <div className={`!rounded-xl !p-4 !space-y-3 ${isDark ? '!bg-gray-700/50' : '!bg-gray-50'}`}>
                  <div className="!flex !justify-between !text-sm">
                    <span className={isDark ? '!text-gray-400' : '!text-gray-500'}>Precio por tonelada</span>
                    <span className={isDark ? '!text-gray-200' : '!text-gray-700'}>
                      ${project.pricePerTonCLP.toLocaleString('es-CL')} CLP
                    </span>
                  </div>
                  <div className="!flex !justify-between !text-sm">
                    <span className={isDark ? '!text-gray-400' : '!text-gray-500'}>Cantidad</span>
                    <span className={isDark ? '!text-gray-200' : '!text-gray-700'}>{tons} tCO₂</span>
                  </div>
                  {physicalUnits !== null && project.impact_unit && (
                    <div className="!flex !justify-between !text-sm">
                      <span className={isDark ? '!text-gray-400' : '!text-gray-500'}>Unidades a reservar</span>
                      <span className="!font-medium !text-emerald-600">
                        {physicalUnits.toLocaleString()} {project.impact_unit}
                      </span>
                    </div>
                  )}
                  <div className={`!border-t !pt-3 !flex !justify-between !font-bold !text-lg ${isDark ? '!border-gray-600' : '!border-gray-200'}`}>
                    <span className={isDark ? '!text-gray-200' : '!text-gray-800'}>Total</span>
                    <span className="!text-green-600">${totalCLP.toLocaleString('es-CL')} CLP</span>
                  </div>
                </div>

              {error && (
                <div className="!flex !items-center !gap-2 !p-3 !rounded-xl !bg-red-50 !text-red-700 !text-sm">
                  <AlertCircle className="!w-4 !h-4 !flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || tons <= 0 || isOverLimit}
                className="!w-full !py-3.5 !rounded-xl !bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !font-semibold !text-base !border-0 !shadow-lg !shadow-green-500/30 hover:!shadow-green-500/50 !transition-all disabled:!opacity-50 disabled:!cursor-not-allowed !flex !items-center !justify-center !gap-2"
              >
                {isSubmitting ? (
                  <><Loader2 className="!w-5 !h-5 !animate-spin" /> Creando orden...</>
                ) : (
                  <><ShoppingCart className="!w-5 !h-5" /> Generar Orden de Compensación</>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Success state with bank details */}
              <div className="!text-center !py-2">
                <CheckCircle2 className="!w-16 !h-16 !text-green-500 !mx-auto !mb-3" />
                <p className={`!text-lg !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>
                  Orden #{orderCreated.id.slice(0, 8)}... creada
                </p>
                <p className={`!text-sm !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
                  Realiza la transferencia bancaria para completar la compensación
                </p>
              </div>

              {/* Amount to transfer */}
              <div className={`!rounded-xl !p-4 !text-center ${isDark ? '!bg-green-900/30 !border !border-green-700/50' : '!bg-green-50 !border !border-green-200'}`}>
                <p className={`!text-sm ${isDark ? '!text-green-400' : '!text-green-700'}`}>Monto a transferir</p>
                <p className="!text-3xl !font-bold !text-green-600 !mt-1">
                  ${orderCreated.amount.toLocaleString('es-CL')} CLP
                </p>
              </div>

              {/* Bank details */}
              {bankDetails && (
                <div className={`!rounded-xl !p-4 !space-y-3 ${isDark ? '!bg-gray-700/50' : '!bg-gray-50'}`}>
                  <h4 className={`!font-semibold !text-sm !mb-3 ${isDark ? '!text-gray-200' : '!text-gray-800'}`}>
                    Datos para Transferencia
                  </h4>
                  {[
                    { label: 'Banco', value: bankDetails.bankName },
                    { label: 'Tipo Cuenta', value: bankDetails.accountType },
                    { label: 'N° Cuenta', value: bankDetails.accountNumber },
                    { label: 'Titular', value: bankDetails.accountHolder },
                    { label: 'RUT', value: bankDetails.rut },
                    { label: 'Email', value: bankDetails.email },
                  ].filter(item => item.value).map((item, i) => (
                    <div key={i} className="!flex !justify-between !items-center !text-sm">
                      <span className={isDark ? '!text-gray-400' : '!text-gray-500'}>{item.label}</span>
                      <div className="!flex !items-center !gap-1">
                        <span className={`!font-medium ${isDark ? '!text-gray-200' : '!text-gray-700'}`}>{item.value}</span>
                        <button
                          onClick={() => copyToClipboard(item.value)}
                          className={`!p-1 !rounded !border-0 !bg-transparent ${isDark ? '!text-gray-400 hover:!text-gray-200' : '!text-gray-400 hover:!text-gray-600'}`}
                        >
                          {copied ? <CheckCircle2 className="!w-3.5 !h-3.5 !text-green-500" /> : <Copy className="!w-3.5 !h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  {bankDetails.message && (
                    <p className={`!text-xs !mt-2 !pt-2 !border-t ${isDark ? '!border-gray-600 !text-yellow-400' : '!border-gray-200 !text-yellow-700'}`}>
                      {bankDetails.message}
                    </p>
                  )}
                </div>
              )}

              <div className="!flex !gap-3">
                <button
                  onClick={onClose}
                  className={`!flex-1 !py-3 !rounded-xl !font-medium !border-0 !transition-all ${
                    isDark ? '!bg-gray-700 !text-gray-300 hover:!bg-gray-600' : '!bg-gray-100 !text-gray-700 hover:!bg-gray-200'
                  }`}
                >
                  Cerrar
                </button>
                <button
                  onClick={onSuccess}
                  className="!flex-1 !py-3 !rounded-xl !bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !font-medium !border-0 !shadow-lg !transition-all"
                >
                  Ver Mis Órdenes
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ===== MAIN VIEW =====

interface ProjectsViewProps {
  onNavigateToOrders?: () => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ onNavigateToOrders }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [checkoutProject, setCheckoutProject] = useState<Project | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const realProjects = await getProjects({ type: filterType, status: filterStatus, search: searchQuery });
        setProjects(realProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjects(getMockProjects());
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, [filterType, filterStatus, searchQuery]);

  const projectTypes = [
    { value: 'all', label: 'Todos', icon: Grid },
    { value: 'reforestation', label: 'Reforestación', icon: TreePine },
    { value: 'conservation', label: 'Conservación', icon: Mountain },
    { value: 'renewable', label: 'Energía', icon: Cloud },
    { value: 'ocean', label: 'Océanos', icon: Droplets }
  ];

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return <span className="!px-2.5 !py-1 !rounded-full !bg-green-100 !text-green-700 !text-xs !font-semibold">Activo</span>;
      case 'completed':
        return <span className="!px-2.5 !py-1 !rounded-full !bg-blue-100 !text-blue-700 !text-xs !font-semibold">Completado</span>;
      case 'pending':
        return <span className="!px-2.5 !py-1 !rounded-full !bg-yellow-100 !text-yellow-700 !text-xs !font-semibold">Próximamente</span>;
    }
  };

  const getTypeIcon = (type: Project['type']) => {
    switch (type) {
      case 'reforestation': return <TreePine className="!w-5 !h-5" />;
      case 'conservation': return <Bird className="!w-5 !h-5" />;
      case 'renewable': return <Cloud className="!w-5 !h-5" />;
      case 'ocean': return <Droplets className="!w-5 !h-5" />;
    }
  };

  const toggleFavorite = (projectId: string) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  const filteredProjects = filterMockProjects(projects, {
    search: searchQuery,
    type: filterType,
    status: filterStatus
  });

  const totalStats = {
    totalCO2: projects.reduce((acc, p) => acc + p.co2Offset, 0),
    totalTrees: projects.reduce((acc, p) => acc + (p.treesPlanted || 0), 0),
    totalContribution: projects.reduce((acc, p) => acc + p.contribution, 0)
  };

  if (isLoading) {
    return (
      <div className="!flex !items-center !justify-center !py-20">
        <div className="!text-center">
          <Loader2 className="!w-12 !h-12 !text-green-500 !animate-spin !mx-auto !mb-4" />
          <p className={isDark ? '!text-gray-400' : '!text-gray-500'}>Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="!space-y-6">
      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutProject && (
          <CheckoutModal
            project={checkoutProject}
            isDark={isDark}
            onClose={() => setCheckoutProject(null)}
            onSuccess={() => {
              setCheckoutProject(null);
              onNavigateToOrders?.();
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="!flex !flex-col lg:!flex-row !items-start lg:!items-center !justify-between !gap-4">
        <div>
          <h1 className={`!text-2xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Proyectos</h1>
          <p className={`!text-sm !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Explora proyectos y compensa tu huella de carbono</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="!flex !items-center !gap-2 !px-5 !py-2.5 !bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !rounded-xl !font-medium !text-sm !border-0 !shadow-lg !shadow-green-500/30 hover:!shadow-green-500/50 !transition-all"
        >
          <Leaf className="!w-4 !h-4" />
          Explorar Nuevos Proyectos
        </motion.button>
      </div>

      {/* Stats Summary */}
      <div className="!grid sm:!grid-cols-3 !gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`!rounded-2xl !p-5 !border ${
            isDark 
              ? '!bg-gradient-to-br !from-green-900/30 !to-emerald-900/30 !border-green-700/50' 
              : '!bg-gradient-to-br !from-green-50 !to-emerald-50 !border-green-200'
          }`}
        >
          <div className="!flex !items-center !gap-3">
            <div className="!w-12 !h-12 !rounded-xl !bg-gradient-to-br !from-green-500 !to-emerald-600 !flex !items-center !justify-center">
              <Cloud className="!w-6 !h-6 !text-white" />
            </div>
            <div>
              <p className={`!text-2xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>{totalStats.totalCO2.toFixed(1)} tCO₂</p>
              <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-600'}`}>Total compensado</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`!rounded-2xl !p-5 !border ${
            isDark 
              ? '!bg-gradient-to-br !from-teal-900/30 !to-cyan-900/30 !border-teal-700/50' 
              : '!bg-gradient-to-br !from-teal-50 !to-cyan-50 !border-teal-200'
          }`}
        >
          <div className="!flex !items-center !gap-3">
            <div className="!w-12 !h-12 !rounded-xl !bg-gradient-to-br !from-teal-500 !to-cyan-600 !flex !items-center !justify-center">
              <TreePine className="!w-6 !h-6 !text-white" />
            </div>
            <div>
              <p className={`!text-2xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>{totalStats.totalTrees.toLocaleString()}</p>
              <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-600'}`}>Árboles plantados</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`!rounded-2xl !p-5 !border ${
            isDark 
              ? '!bg-gradient-to-br !from-blue-900/30 !to-indigo-900/30 !border-blue-700/50' 
              : '!bg-gradient-to-br !from-blue-50 !to-indigo-50 !border-blue-200'
          }`}
        >
          <div className="!flex !items-center !gap-3">
            <div className="!w-12 !h-12 !rounded-xl !bg-gradient-to-br !from-blue-500 !to-indigo-600 !flex !items-center !justify-center">
              <Users className="!w-6 !h-6 !text-white" />
            </div>
            <div>
              <p className={`!text-2xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>{projects.length}</p>
              <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-600'}`}>Proyectos activos</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className={`!rounded-2xl !p-4 !border !shadow-sm ${
        isDark ? '!bg-gray-800/50 !border-gray-700' : '!bg-white !border-gray-200'
      }`}>
        <div className="!flex !flex-col lg:!flex-row !gap-4">
          {/* Search */}
          <div className="!relative !flex-1">
            <Search className={`!absolute !left-3 !top-1/2 !-translate-y-1/2 !w-5 !h-5 ${isDark ? '!text-gray-500' : '!text-gray-400'}`} />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`!w-full !pl-10 !pr-4 !py-2.5 !rounded-xl !border !outline-none !transition-all focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 ${
                isDark 
                  ? '!border-gray-600 !bg-gray-700 !text-gray-100 placeholder:!text-gray-500' 
                  : '!border-gray-200 !bg-gray-50 !text-gray-900 focus:!bg-white'
              }`}
            />
          </div>

          {/* Type Filter */}
          <div className="!flex !items-center !gap-2 !overflow-x-auto !pb-2 lg:!pb-0">
            {projectTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setFilterType(type.value)}
                className={`!flex !items-center !gap-2 !px-4 !py-2 !rounded-xl !text-sm !font-medium !whitespace-nowrap !transition-all !border-0 ${
                  filterType === type.value
                    ? '!bg-green-500 !text-white !shadow-lg !shadow-green-500/30'
                    : isDark 
                      ? '!bg-gray-700 !text-gray-300 hover:!bg-gray-600'
                      : '!bg-gray-100 !text-gray-600 hover:!bg-gray-200'
                }`}
              >
                <type.icon className="!w-4 !h-4" />
                {type.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className={`!flex !rounded-xl !p-1 ${isDark ? '!bg-gray-700' : '!bg-gray-100'}`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`!p-2 !rounded-lg !transition-all !border-0 ${
                viewMode === 'grid' 
                  ? isDark ? '!bg-gray-600 !shadow-sm' : '!bg-white !shadow-sm'
                  : '!bg-transparent'
              }`}
            >
              <Grid className={`!w-5 !h-5 ${isDark ? '!text-gray-300' : '!text-gray-600'}`} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`!p-2 !rounded-lg !transition-all !border-0 ${
                viewMode === 'list' 
                  ? isDark ? '!bg-gray-600 !shadow-sm' : '!bg-white !shadow-sm'
                  : '!bg-transparent'
              }`}
            >
              <List className={`!w-5 !h-5 ${isDark ? '!text-gray-300' : '!text-gray-600'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={viewMode === 'grid' ? '!grid md:!grid-cols-2 !gap-6' : '!space-y-4'}
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`!rounded-2xl !border !shadow-lg hover:!shadow-xl !transition-all !overflow-hidden group ${
                viewMode === 'list' ? '!flex' : ''
              } ${
                isDark ? '!bg-gray-800/50 !border-gray-700' : '!bg-white !border-gray-200'
              }`}
            >
              {/* Image */}
              <div className={`!relative !overflow-hidden ${viewMode === 'list' ? '!w-48 !flex-shrink-0' : '!h-48'}`}>
                <img
                  src={project.image}
                  alt={project.name}
                  className="!w-full !h-full !object-cover group-hover:!scale-110 !transition-transform !duration-500"
                />
                <div className="!absolute !top-3 !left-3">
                  {getStatusBadge(project.status)}
                </div>
                <button
                  onClick={() => toggleFavorite(project.id)}
                  className={`!absolute !top-3 !right-3 !w-9 !h-9 !rounded-full !backdrop-blur-sm !flex !items-center !justify-center !border-0 !transition-colors ${
                    isDark ? '!bg-gray-800/90 hover:!bg-gray-700' : '!bg-white/90 hover:!bg-white'
                  }`}
                >
                  <Heart className={`!w-5 !h-5 ${project.isFavorite ? '!fill-red-500 !text-red-500' : isDark ? '!text-gray-300' : '!text-gray-400'}`} />
                </button>
              </div>

              {/* Content */}
              <div className="!p-5 !flex-1">
                <div className="!flex !items-start !justify-between !gap-3 !mb-3">
                  <div>
                    <h3 className={`!text-lg !font-bold group-hover:!text-green-600 !transition-colors ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>{project.name}</h3>
                    <div className={`!flex !items-center !gap-2 !text-sm !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
                      <MapPin className="!w-4 !h-4" />
                      <span>{project.location}, {project.country}</span>
                    </div>
                  </div>
                  <div className={`!w-10 !h-10 !rounded-xl !flex !items-center !justify-center ${isDark ? '!bg-green-900/30 !text-green-400' : '!bg-green-100 !text-green-600'}`}>
                    {getTypeIcon(project.type)}
                  </div>
                </div>

                <p className={`!text-sm !mb-4 !line-clamp-2 ${isDark ? '!text-gray-400' : '!text-gray-600'}`}>{project.description}</p>

                {/* Stats */}
                <div className="!flex !items-center !gap-4 !mb-4">
                  {project.availableUnits !== undefined ? (
                    <div>
                      <p className="!text-lg !font-bold !text-green-600">{project.availableUnits} tCO₂</p>
                      <p className={`!text-xs ${isDark ? '!text-gray-500' : '!text-gray-500'}`}>Disponible mensual</p>
                    </div>
                  ) : (
                    <div>
                      <p className="!text-lg !font-bold !text-green-600">{project.co2Offset} tCO₂</p>
                      <p className={`!text-xs ${isDark ? '!text-gray-500' : '!text-gray-500'}`}>Compensado</p>
                    </div>
                  )}
                  {project.pricePerTonCLP > 0 && (
                    <div>
                      <p className="!text-lg !font-bold !text-emerald-600">${project.pricePerTonCLP.toLocaleString('es-CL')}</p>
                      <p className={`!text-xs ${isDark ? '!text-gray-500' : '!text-gray-500'}`}>CLP/tCO₂</p>
                    </div>
                  )}
                  {project.treesPlanted && (
                    <div>
                      <p className="!text-lg !font-bold !text-teal-600">{project.treesPlanted}</p>
                      <p className={`!text-xs ${isDark ? '!text-gray-500' : '!text-gray-500'}`}>Árboles</p>
                    </div>
                  )}
                </div>

                {project.progress !== undefined && project.progress >= 0 && (
                  <div className="!mb-4">
                    <div className="!flex !justify-between !text-xs !mb-1">
                      <span className={isDark ? '!text-gray-400' : '!text-gray-600'}>Progreso mensual</span>
                      <span className={`!font-medium ${isDark ? '!text-green-400' : '!text-green-600'}`}>{project.progress}%</span>
                    </div>
                    <div className={`!w-full !h-1.5 !rounded-full !overflow-hidden ${isDark ? '!bg-gray-700' : '!bg-gray-100'}`}>
                      <div 
                        className={`!h-full !rounded-full ${project.isSoldOut ? '!bg-gray-500' : '!bg-green-500'}`} 
                        style={{ width: `${project.progress}%` }} 
                      />
                    </div>
                  </div>
                )}

                {/* SDGs + Actions */}
                <div className="!flex !items-center !justify-between">
                  <div className="!flex !gap-1">
                    {project.sdgs.map(sdg => (
                      <span key={sdg} className="!w-7 !h-7 !rounded-md !bg-blue-600 !text-white !text-xs !font-bold !flex !items-center !justify-center">
                        {sdg}
                      </span>
                    ))}
                  </div>
                  {project.status === 'active' && project.pricePerTonCLP > 0 ? (
                    <button
                      onClick={() => setCheckoutProject(project)}
                      className="!flex !items-center !gap-1.5 !px-4 !py-2 !rounded-xl !bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !text-sm !font-medium !border-0 !shadow-md !shadow-green-500/20 hover:!shadow-green-500/40 !transition-all"
                    >
                      <ShoppingCart className="!w-4 !h-4" /> Compensar
                    </button>
                  ) : (
                    <button className="!flex !items-center !gap-1 !text-green-600 hover:!text-green-700 !text-sm !font-medium !bg-transparent !border-0">
                      Ver detalles <ChevronRight className="!w-4 !h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredProjects.length === 0 && (
        <div className="!text-center !py-12">
          <TreePine className={`!w-16 !h-16 !mx-auto !mb-4 ${isDark ? '!text-gray-600' : '!text-gray-300'}`} />
          <h3 className={`!text-lg !font-semibold ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>No se encontraron proyectos</h3>
          <p className={`!text-sm ${isDark ? '!text-gray-500' : '!text-gray-500'}`}>Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsView;
