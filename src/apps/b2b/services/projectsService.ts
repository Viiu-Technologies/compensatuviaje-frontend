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
  treesPlanted?: number;
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
 * Obtener todos los proyectos disponibles
 */
export const getProjects = async (filters?: ProjectFilters): Promise<Project[]> => {
  try {
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
    
    const response = await api.get(`/public/projects?${params.toString()}`);
    if (response.data.success) {
      return response.data.data;
    }
    return getMockProjects(); // Fallback a datos mock
  } catch (error) {
    console.error('Error fetching projects:', error);
    return getMockProjects(); // Fallback
  }
};

/**
 * Obtener proyecto por ID
 */
export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    const response = await api.get(`/public/projects/${id}`);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
};

/**
 * Obtener proyectos favoritos del usuario
 */
export const getUserFavoriteProjects = async (): Promise<Project[]> => {
  try {
    const response = await api.get('/b2b/projects/favorites');
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching favorite projects:', error);
    return [];
  }
};

/**
 * Agregar proyecto a favoritos
 */
export const addToFavorites = async (projectId: string): Promise<boolean> => {
  try {
    const response = await api.post(`/b2b/projects/${projectId}/favorite`);
    return response.data.success;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
};

/**
 * Remover proyecto de favoritos
 */
export const removeFromFavorites = async (projectId: string): Promise<boolean> => {
  try {
    const response = await api.delete(`/b2b/projects/${projectId}/favorite`);
    return response.data.success;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

// ============ MOCK DATA ============

/**
 * Proyectos simulados para demo
 */
export const getMockProjects = (): Project[] => {
  return [
    {
      id: '1',
      name: 'Reforestación Parque Torres del Paine',
      location: 'Magallanes',
      country: 'Chile',
      type: 'reforestation',
      status: 'active',
      contribution: 15000,
      co2Offset: 45.2,
      treesPlanted: 1200,
      startDate: '2024-03-15',
      image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400',
      description: 'Restauración de bosque nativo en la Patagonia chilena con especies autóctonas.',
      sdgs: [13, 15],
      isFavorite: true
    },
    {
      id: '2',
      name: 'Conservación Bosque Valdiviano',
      location: 'Los Ríos',
      country: 'Chile',
      type: 'conservation',
      status: 'active',
      contribution: 8500,
      co2Offset: 28.7,
      startDate: '2024-06-01',
      image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=400',
      description: 'Protección de uno de los últimos bosques templados lluviosos del planeta.',
      sdgs: [14, 15],
      isFavorite: false
    },
    {
      id: '3',
      name: 'Energía Solar Atacama',
      location: 'Antofagasta',
      country: 'Chile',
      type: 'renewable',
      status: 'completed',
      contribution: 25000,
      co2Offset: 120.5,
      startDate: '2023-01-10',
      endDate: '2024-01-10',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
      description: 'Planta solar que genera energía limpia para comunidades rurales.',
      sdgs: [7, 13],
      isFavorite: true
    },
    {
      id: '4',
      name: 'Protección Marina Juan Fernández',
      location: 'Valparaíso',
      country: 'Chile',
      type: 'ocean',
      status: 'pending',
      contribution: 5000,
      co2Offset: 15.3,
      startDate: '2025-02-01',
      image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400',
      description: 'Conservación del ecosistema marino único del archipiélago Juan Fernández.',
      sdgs: [14],
      isFavorite: false
    },
    {
      id: '5',
      name: 'Restauración Humedal El Yali',
      location: 'Valparaíso',
      country: 'Chile',
      type: 'conservation',
      status: 'active',
      contribution: 12000,
      co2Offset: 35.8,
      startDate: '2024-04-20',
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
      description: 'Rehabilitación del humedal costero y protección de aves migratorias.',
      sdgs: [6, 14, 15],
      isFavorite: false
    },
    {
      id: '6',
      name: 'Parque Eólico Chiloé',
      location: 'Los Lagos',
      country: 'Chile',
      type: 'renewable',
      status: 'active',
      contribution: 30000,
      co2Offset: 185.2,
      startDate: '2024-01-15',
      image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400',
      description: 'Generación de energía eólica en el sur de Chile.',
      sdgs: [7, 13],
      isFavorite: true
    }
  ];
};

/**
 * Filtrar proyectos mock por criterios
 */
export const filterMockProjects = (
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
