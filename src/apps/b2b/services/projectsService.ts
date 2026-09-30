import api from '../../../shared/services/api';

// ============ TYPES ============
export interface Project {
  id: string;
  name: string;
  location: string;
  country: string;
  type: 'reforestation' | 'conservation' | 'renewable' | 'ocean';
  status: 'active' | 'completed' | 'pending';
  contribution: number;
  co2Offset: number;
  pricePerTonCLP: number;
  capacityTotal?: number;
  capacitySold?: number;
  monthlyStockApproved?: number;
  monthlyStockRemaining?: number;
  availableUnits?: number;
  isSoldOut?: boolean;
  progress?: number;
  treesPlanted?: number;
  // Unidades físicas (Enfoque B)
  impact_unit?: string | null;           // Ej: "árboles", "paneles", "m3"
  carbon_capture_per_unit?: number | null; // kg CO2 capturado por unidad
  startDate: string;
  endDate?: string;
  image: string;
  description: string;
  sdgs: number[];
  isFavorite: boolean;
}

export interface ProjectFilters {
  type?: string;
  status?: string;
  search?: string;
}

export interface ProjectsResponse {
  success: boolean;
  data?: Project[];
  total?: number;
  message?: string;
}

// ============ PROJECTS SERVICE ============

/**
 * Obtener todos los proyectos disponibles.
 *
 * Si la API falla, el error sube y la vista lo muestra con reintento. Antes
 * devolvía proyectos de ejemplo, y se podía iniciar una compra sobre ellos.
 */
export const getProjects = async (filters?: ProjectFilters): Promise<Project[]> => {
  const params = new URLSearchParams();
  if (filters?.type && filters.type !== 'all') {
    params.append('type', filters.type);
  }
  if (filters?.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }
  
  const response = await api.get(`/public/projects?${params.toString()}`) as any;
  if (!response.success) {
    throw new Error(response.message || 'No se pudieron obtener los proyectos');
  }
  // Mapear campos del backend al formato frontend
  return (response.projects ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    location: p.region || p.country || 'Sin ubicación',
    country: p.country || 'Chile',
    type: mapProjectType(p.projectType),
    status: mapProjectStatus(p.status),
    contribution: p.pricePerTonCLP || p.pricePerTon || 0,
    co2Offset: p.capacitySold || 0,
    pricePerTonCLP: p.pricePerTonCLP || 0,
    capacityTotal: p.capacityTotal || 0,
    capacitySold: p.capacitySold || 0,
    monthlyStockApproved: p.monthlyStockApproved || 0,
    monthlyStockRemaining: p.monthlyStockRemaining || 0,
    availableUnits: p.availableUnits || 0,
    isSoldOut: Boolean(p.isSoldOut),
    progress: p.progress || 0,
    treesPlanted: undefined,
    impact_unit: p.impact_unit || null,
    carbon_capture_per_unit: p.carbon_capture_per_unit || null,
    startDate: p.createdAt,
    endDate: undefined,
    image: getProjectImage(p.projectType),
    description: p.description || '',
    sdgs: p.coBenefits ? extractSDGs(p.coBenefits) : [],
    isFavorite: false
  }));
};

// Helpers para mapear datos del backend
const mapProjectType = (type: string): Project['type'] => {
  const typeMap: Record<string, Project['type']> = {
    reforestation: 'reforestation',
    conservation: 'conservation',
    renewable_energy: 'renewable',
    ocean_cleanup: 'ocean',
    blue_carbon: 'ocean',
    avoided_deforestation: 'conservation'
  };
  return typeMap[type] || 'conservation';
};

const mapProjectStatus = (status: string): Project['status'] => {
  const statusMap: Record<string, Project['status']> = {
    active: 'active',
    approved: 'active',
    completed: 'completed',
    pending: 'pending',
    draft: 'pending'
  };
  return statusMap[status] || 'active';
};

const getProjectImage = (type: string): string => {
  const images: Record<string, string> = {
    reforestation: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400',
    conservation: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=400',
    renewable_energy: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
    ocean_cleanup: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400',
    blue_carbon: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400',
    avoided_deforestation: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400'
  };
  return images[type] || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400';
};

const extractSDGs = (coBenefits: any): number[] => {
  if (Array.isArray(coBenefits)) {
    return coBenefits.filter((b: any) => typeof b === 'number').slice(0, 5);
  }
  // Default SDGs for carbon projects
  return [13];
};

/**
 * Obtener proyecto por ID
 */
export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    const response = await api.get(`/public/projects/${id}`) as any;
    if (response.success) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
};

/**
 * Filtrar proyectos por criterios (en el cliente)
 */
export const filterProjects = (
  projects: Project[],
  filters: ProjectFilters
): Project[] => {
  return projects.filter(project => {
    const matchesSearch = !filters.search || 
      project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.location.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = !filters.type || filters.type === 'all' || project.type === filters.type;
    const matchesStatus = !filters.status || filters.status === 'all' || project.status === filters.status;
    
    return matchesSearch && matchesType && matchesStatus;
  });
};
