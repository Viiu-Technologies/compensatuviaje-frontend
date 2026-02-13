import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FaCertificate
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import B2CLayout from '../components/B2CLayout';

interface Project {
  id: string;
  name: string;
  type: 'reforestation' | 'wind' | 'ocean' | 'solar';
  location: string;
  country: string;
  capacity: string;
  investment: string;
  progress: number;
  description: string;
  benefits: string[];
  image: string;
  color: {
    from: string;
    to: string;
    badge: string;
    badgeText: string;
  };
}

const B2CProjectsPage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const projects: Project[] = [
    {
      id: '1',
      name: 'Reforestación Amazonía',
      type: 'reforestation',
      location: 'Amazonas',
      country: 'Brasil',
      capacity: '12,500 t/año',
      investment: '$45,200',
      progress: 78,
      description: 'Proyecto de restauración forestal en la selva amazónica, plantando especies nativas para recuperar áreas deforestadas y proteger la biodiversidad.',
      benefits: [
        'Absorción de 12,500 toneladas de CO₂ anuales',
        'Restauración de 450 hectáreas de bosque',
        'Protección de 120+ especies animales',
        'Generación de 85 empleos locales'
      ],
      image: '🌳',
      color: {
        from: 'green-50',
        to: 'green-100',
        badge: 'green-100',
        badgeText: 'green-700'
      }
    },
    {
      id: '2',
      name: 'Eólica Marina',
      type: 'wind',
      location: 'Costa Atlántica',
      country: 'España',
      capacity: '8,200 t/año',
      investment: '$28,100',
      progress: 64,
      description: 'Parque eólico marino que aprovecha los vientos constantes del océano para generar energía limpia y reducir la dependencia de combustibles fósiles.',
      benefits: [
        'Generación de 45 MW de energía limpia',
        'Reducción de 8,200 toneladas de CO₂ anuales',
        'Energía para 12,000 hogares',
        'Tecnología de última generación'
      ],
      image: '💨',
      color: {
        from: 'blue-50',
        to: 'blue-100',
        badge: 'blue-100',
        badgeText: 'blue-700'
      }
    },
    {
      id: '3',
      name: 'Conservación Azul',
      type: 'ocean',
      location: 'Algarve',
      country: 'Portugal',
      capacity: '5,600 t/año',
      investment: '$11,092',
      progress: 45,
      description: 'Programa de conservación marina que protege ecosistemas oceánicos y fomenta la captura de carbono azul mediante la restauración de praderas marinas.',
      benefits: [
        'Protección de 280 hectáreas marinas',
        'Captura de 5,600 toneladas de CO₂ anuales',
        'Restauración de praderas de posidonia',
        'Conservación de vida marina'
      ],
      image: '🌊',
      color: {
        from: 'cyan-50',
        to: 'cyan-100',
        badge: 'cyan-100',
        badgeText: 'cyan-700'
      }
    },
    {
      id: '4',
      name: 'Energía Solar Comunitaria',
      type: 'solar',
      location: 'Atacama',
      country: 'Chile',
      capacity: '15,000 t/año',
      investment: '$52,300',
      progress: 82,
      description: 'Planta solar fotovoltaica que proporciona energía renovable a comunidades locales, reduciendo emisiones y fomentando el desarrollo sostenible.',
      benefits: [
        'Generación de 60 MW de energía solar',
        'Reducción de 15,000 toneladas de CO₂ anuales',
        'Energía para 18,000 hogares',
        'Beneficia a 5 comunidades locales'
      ],
      image: '☀️',
      color: {
        from: 'yellow-50',
        to: 'yellow-100',
        badge: 'yellow-100',
        badgeText: 'yellow-700'
      }
    }
  ];

  const projectTypes = [
    { id: 'all', label: 'Todos', icon: FaGlobeAmericas },
    { id: 'reforestation', label: 'Reforestación', icon: FaTree },
    { id: 'wind', label: 'Eólica', icon: FaWind },
    { id: 'ocean', label: 'Océanos', icon: FaWater },
    { id: 'solar', label: 'Solar', icon: FaSolarPanel }
  ];

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.type === filter);

  return (
    <B2CLayout title="Proyectos Ambientales" subtitle="Conoce los proyectos que estás apoyando con tus compensaciones">
      <div className="!space-y-6">
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
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              onClick={() => setSelectedProject(project)}
              className={`!rounded-2xl !border !border-gray-200 !bg-gradient-to-br !from-${project.color.from} !to-${project.color.to} !p-6 !flex !flex-col !shadow-sm !transition-all !cursor-pointer group`}
            >
              {/* Project Header */}
              <div className="!flex !items-start !justify-between !mb-4">
                <div className="!text-5xl">{project.image}</div>
                <span className={`!inline-block !px-3 !py-1 !rounded-full !bg-${project.color.badge} !text-${project.color.badgeText} !text-xs !font-semibold`}>
                  {project.type === 'reforestation' && 'Reforestación'}
                  {project.type === 'wind' && 'Eólica'}
                  {project.type === 'ocean' && 'Océanos'}
                  {project.type === 'solar' && 'Solar'}
                </span>
              </div>

              {/* Project Info */}
              <h3 className="!text-lg !font-bold !text-gray-800 !mb-2 group-hover:!text-green-700 !transition-colors">
                {project.name}
              </h3>
              <div className="!flex !items-center !gap-1 !text-sm !text-gray-600 !mb-4">
                <FaMapMarkerAlt className="!text-xs" />
                {project.location}, {project.country}
              </div>

              {/* Stats */}
              <div className="!space-y-2 !mb-4">
                <div className="!flex !justify-between !text-sm">
                  <span className="!text-gray-600">Capacidad:</span>
                  <span className="!font-semibold !text-gray-800">{project.capacity}</span>
                </div>
                <div className="!flex !justify-between !text-sm">
                  <span className="!text-gray-600">Inversión:</span>
                  <span className="!font-semibold !text-gray-800">{project.investment}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="!mt-auto">
                <div className="!flex !justify-between !text-xs !text-gray-600 !mb-2">
                  <span>Progreso</span>
                  <span className="!font-semibold">{project.progress}%</span>
                </div>
                <div className="!w-full !h-2 !bg-white/50 !rounded-full !overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${project.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="!h-2 !bg-green-500 !rounded-full"
                  />
                </div>
              </div>

              {/* Hover Indicator */}
              <div className="!mt-4 !text-sm !text-green-600 !font-semibold !opacity-0 group-hover:!opacity-100 !transition-opacity !flex !items-center !gap-1">
                Ver detalles <span>→</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Project Detail Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="!fixed !inset-0 !bg-black/50 !backdrop-blur-sm !z-50 !flex !items-center !justify-center !p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="!bg-white !rounded-3xl !max-w-2xl !w-full !max-h-[90vh] !overflow-y-auto !shadow-2xl"
              >
                {/* Modal Header */}
                <div className={`!bg-gradient-to-br !from-${selectedProject.color.from} !to-${selectedProject.color.to} !p-8 !relative`}>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="!absolute !top-4 !right-4 !w-10 !h-10 !bg-white/90 !rounded-full !flex !items-center !justify-center !text-gray-600 hover:!bg-white !transition !border-0"
                  >
                    <FaTimes />
                  </button>
                  
                  <div className="!text-6xl !mb-4">{selectedProject.image}</div>
                  <h2 className="!text-3xl !font-bold !text-gray-900 !mb-2">{selectedProject.name}</h2>
                  <div className="!flex !items-center !gap-2 !text-gray-700">
                    <FaMapMarkerAlt />
                    <span>{selectedProject.location}, {selectedProject.country}</span>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="!p-8">
                  {/* Description */}
                  <div className="!mb-6">
                    <h3 className="!text-lg !font-bold !text-gray-900 !mb-3">Sobre el Proyecto</h3>
                    <p className="!text-gray-700 !leading-relaxed">{selectedProject.description}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="!grid !grid-cols-2 !gap-4 !mb-6">
                    <div className="!bg-gray-50 !rounded-xl !p-4">
                      <div className="!text-sm !text-gray-600 !mb-1">Capacidad Anual</div>
                      <div className="!text-xl !font-bold !text-gray-900">{selectedProject.capacity}</div>
                    </div>
                    <div className="!bg-gray-50 !rounded-xl !p-4">
                      <div className="!text-sm !text-gray-600 !mb-1">Inversión Total</div>
                      <div className="!text-xl !font-bold !text-gray-900">{selectedProject.investment}</div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="!mb-6">
                    <h3 className="!text-lg !font-bold !text-gray-900 !mb-3">Beneficios e Impacto</h3>
                    <ul className="!space-y-3">
                      {selectedProject.benefits.map((benefit, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="!flex !items-start !gap-3"
                        >
                          <FaCheckCircle className="!text-green-600 !mt-1 !flex-shrink-0" />
                          <span className="!text-gray-700">{benefit}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Progress */}
                  <div className="!bg-gradient-to-br !from-green-50 !to-white !rounded-xl !p-6">
                    <div className="!flex !items-center !justify-between !mb-3">
                      <h3 className="!text-lg !font-bold !text-gray-900">Progreso del Proyecto</h3>
                      <span className="!text-2xl !font-bold !text-green-600">{selectedProject.progress}%</span>
                    </div>
                    <div className="!w-full !h-4 !bg-white !rounded-full !overflow-hidden !shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedProject.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="!h-4 !bg-gradient-to-r !from-green-500 !to-green-600 !rounded-full"
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="!w-full !mt-6 !px-6 !py-4 !bg-gradient-to-r !from-green-600 !to-green-700 !text-white !rounded-xl !font-bold !shadow-lg hover:!shadow-xl !transition !border-0 !flex !items-center !justify-center !gap-2"
                    onClick={() => {
                      setSelectedProject(null);
                      // Navigate to calculator
                      window.location.href = '/b2c/calculator';
                    }}
                  >
                    <FaLeaf /> Apoyar Este Proyecto
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </B2CLayout>
  );
};

export default B2CProjectsPage;
