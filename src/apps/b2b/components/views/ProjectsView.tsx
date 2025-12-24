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
  Loader2
} from 'lucide-react';
import { 
  getMockProjects, 
  filterMockProjects,
  type Project 
} from '../../services/projectsService';

const ProjectsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  // Cargar proyectos al montar
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        // Por ahora usamos mock data, después conectar a API real
        const mockProjects = getMockProjects();
        setProjects(mockProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, []);

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
          <p className="!text-gray-500">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div className="!flex !flex-col lg:!flex-row !items-start lg:!items-center !justify-between !gap-4">
        <div>
          <h1 className="!text-2xl !font-bold !text-gray-900">Proyectos</h1>
          <p className="!text-gray-500 !text-sm !mt-1">Explora y gestiona tus proyectos de compensación</p>
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
          className="!bg-gradient-to-br !from-green-50 !to-emerald-50 !rounded-2xl !p-5 !border !border-green-200"
        >
          <div className="!flex !items-center !gap-3">
            <div className="!w-12 !h-12 !rounded-xl !bg-gradient-to-br !from-green-500 !to-emerald-600 !flex !items-center !justify-center">
              <Cloud className="!w-6 !h-6 !text-white" />
            </div>
            <div>
              <p className="!text-2xl !font-bold !text-gray-900">{totalStats.totalCO2.toFixed(1)} tCO₂</p>
              <p className="!text-sm !text-gray-600">Total compensado</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="!bg-gradient-to-br !from-teal-50 !to-cyan-50 !rounded-2xl !p-5 !border !border-teal-200"
        >
          <div className="!flex !items-center !gap-3">
            <div className="!w-12 !h-12 !rounded-xl !bg-gradient-to-br !from-teal-500 !to-cyan-600 !flex !items-center !justify-center">
              <TreePine className="!w-6 !h-6 !text-white" />
            </div>
            <div>
              <p className="!text-2xl !font-bold !text-gray-900">{totalStats.totalTrees.toLocaleString()}</p>
              <p className="!text-sm !text-gray-600">Árboles plantados</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="!bg-gradient-to-br !from-blue-50 !to-indigo-50 !rounded-2xl !p-5 !border !border-blue-200"
        >
          <div className="!flex !items-center !gap-3">
            <div className="!w-12 !h-12 !rounded-xl !bg-gradient-to-br !from-blue-500 !to-indigo-600 !flex !items-center !justify-center">
              <Users className="!w-6 !h-6 !text-white" />
            </div>
            <div>
              <p className="!text-2xl !font-bold !text-gray-900">{projects.length}</p>
              <p className="!text-sm !text-gray-600">Proyectos activos</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="!bg-white !rounded-2xl !p-4 !border !border-gray-200 !shadow-sm">
        <div className="!flex !flex-col lg:!flex-row !gap-4">
          {/* Search */}
          <div className="!relative !flex-1">
            <Search className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !w-5 !h-5 !text-gray-400" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="!w-full !pl-10 !pr-4 !py-2.5 !rounded-xl !border !border-gray-200 !bg-gray-50 focus:!bg-white focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !outline-none !transition-all"
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
                    : '!bg-gray-100 !text-gray-600 hover:!bg-gray-200'
                }`}
              >
                <type.icon className="!w-4 !h-4" />
                {type.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="!flex !bg-gray-100 !rounded-xl !p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`!p-2 !rounded-lg !transition-all !border-0 ${viewMode === 'grid' ? '!bg-white !shadow-sm' : '!bg-transparent'}`}
            >
              <Grid className="!w-5 !h-5 !text-gray-600" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`!p-2 !rounded-lg !transition-all !border-0 ${viewMode === 'list' ? '!bg-white !shadow-sm' : '!bg-transparent'}`}
            >
              <List className="!w-5 !h-5 !text-gray-600" />
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
              className={`!bg-white !rounded-2xl !border !border-gray-200 !shadow-lg hover:!shadow-xl !transition-all !overflow-hidden group ${
                viewMode === 'list' ? '!flex' : ''
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
                  className="!absolute !top-3 !right-3 !w-9 !h-9 !rounded-full !bg-white/90 !backdrop-blur-sm !flex !items-center !justify-center !border-0 hover:!bg-white !transition-colors"
                >
                  <Heart className={`!w-5 !h-5 ${project.isFavorite ? '!fill-red-500 !text-red-500' : '!text-gray-400'}`} />
                </button>
              </div>

              {/* Content */}
              <div className="!p-5 !flex-1">
                <div className="!flex !items-start !justify-between !gap-3 !mb-3">
                  <div>
                    <h3 className="!text-lg !font-bold !text-gray-900 group-hover:!text-green-600 !transition-colors">{project.name}</h3>
                    <div className="!flex !items-center !gap-2 !text-sm !text-gray-500 !mt-1">
                      <MapPin className="!w-4 !h-4" />
                      <span>{project.location}, {project.country}</span>
                    </div>
                  </div>
                  <div className="!w-10 !h-10 !rounded-xl !bg-green-100 !flex !items-center !justify-center !text-green-600">
                    {getTypeIcon(project.type)}
                  </div>
                </div>

                <p className="!text-sm !text-gray-600 !mb-4 !line-clamp-2">{project.description}</p>

                {/* Stats */}
                <div className="!flex !items-center !gap-4 !mb-4">
                  <div>
                    <p className="!text-lg !font-bold !text-green-600">{project.co2Offset} tCO₂</p>
                    <p className="!text-xs !text-gray-500">Compensado</p>
                  </div>
                  {project.treesPlanted && (
                    <div>
                      <p className="!text-lg !font-bold !text-teal-600">{project.treesPlanted}</p>
                      <p className="!text-xs !text-gray-500">Árboles</p>
                    </div>
                  )}
                  <div>
                    <p className="!text-lg !font-bold !text-blue-600">${(project.contribution / 1000).toFixed(0)}K</p>
                    <p className="!text-xs !text-gray-500">Aporte</p>
                  </div>
                </div>

                {/* SDGs */}
                <div className="!flex !items-center !justify-between">
                  <div className="!flex !gap-1">
                    {project.sdgs.map(sdg => (
                      <span key={sdg} className="!w-7 !h-7 !rounded-md !bg-blue-600 !text-white !text-xs !font-bold !flex !items-center !justify-center">
                        {sdg}
                      </span>
                    ))}
                  </div>
                  <button className="!flex !items-center !gap-1 !text-green-600 hover:!text-green-700 !text-sm !font-medium !bg-transparent !border-0">
                    Ver detalles <ChevronRight className="!w-4 !h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredProjects.length === 0 && (
        <div className="!text-center !py-12">
          <TreePine className="!w-16 !h-16 !text-gray-300 !mx-auto !mb-4" />
          <h3 className="!text-lg !font-semibold !text-gray-700">No se encontraron proyectos</h3>
          <p className="!text-gray-500 !text-sm">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsView;
