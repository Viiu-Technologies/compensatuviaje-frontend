import api from '../../../shared/services/api';

// Tipos para la respuesta del backend
export interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  label: string;
}

export interface AirportSearchResponse {
  success: boolean;
  count: number;
  query: string;
  data: Airport[];
}

export interface AirportByCodeResponse {
  success: boolean;
  data: Airport;
}

/**
 * Servicio para b├║squeda de aeropuertos
 * Conecta con: GET /api/public/airports/search?q=...
 */
class AirportService {
  private cache: Map<string, Airport[]> = new Map();

  /**
   * Buscar aeropuertos por query (fuzzy search)
   * Soporta: c├│digo IATA, ciudad, pa├¡s
   */
  async searchAirports(query: string, limit: number = 15): Promise<Airport[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const cacheKey = `${query.toLowerCase()}_${limit}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await api.get<any, AirportSearchResponse>('/public/airports/search', {
        params: { q: query, limit }
      });

      if (response.success && response.data) {
        this.cache.set(cacheKey, response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error buscando aeropuertos:', error);
      return [];
    }
  }

  /**
   * Obtener aeropuerto por c├│digo IATA exacto
   */
  async getAirportByCode(code: string): Promise<Airport | null> {
    if (!code || code.length !== 3) return null;

    try {
      const response = await api.get<any, AirportByCodeResponse>(`/public/airports/${code.toUpperCase()}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`Error obteniendo aeropuerto ${code}:`, error);
      return null;
    }
  }

  /**
   * Limpiar cach├® de aeropuertos
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const airportService = new AirportService();
export default airportService;
