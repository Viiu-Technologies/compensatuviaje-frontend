import api from '../../../shared/services/api';

// Tipos para la calculadora de emisiones
export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';
export type HaulType = 'Domestic' | 'Short-haul' | 'Long-haul';

export interface CalculationRequest {
  origin: string;
  destination: string;
  cabinCode: CabinClass;
  passengers: number;
  roundTrip: boolean;
  userId?: string;
}

export interface RouteInfo {
  origin: {
    code: string;
    city: string;
    country: string;
  };
  destination: {
    code: string;
    city: string;
    country: string;
  };
}

export interface EmissionsMeta {
  tripType: 'one_way' | 'round_trip';
  distanceKmOneWay: number;
  distanceKmTotal: number;
  haulType: HaulType;
  route: RouteInfo;
}

export interface EmissionsData {
  kgCO2e: number;
  tonCO2e: number;
  factorUsed: number;
  passengers: number;
}

export interface PricingData {
  currency: string;
  totalPriceCLP: number;
  pricePerTonCLP: number;
}

export interface Equivalencies {
  trees: number;
  waterLiters: number;
  housingM2: number;
  textileKg: number;
}

export interface CalculationResponse {
  status: 'success' | 'error';
  message?: string;
  meta: EmissionsMeta;
  emissions: EmissionsData;
  pricing: PricingData;
  equivalencies: Equivalencies;
}

// Factores de emisi├│n locales (fallback)
export const EMISSION_FACTORS = {
  'Domestic': {
    'economy': 0.22928,
    'premium_economy': 0.22928,
    'business': 0.22928,
    'first': 0.22928
  },
  'Short-haul': {
    'economy': 0.12576,
    'premium_economy': 0.18863,
    'business': 0.18863,
    'first': 0.18863
  },
  'Long-haul': {
    'economy': 0.11704,
    'premium_economy': 0.18726,
    'business': 0.33940,
    'first': 0.46814
  }
};

export const CABIN_LABELS: Record<CabinClass, string> = {
  'economy': 'Econ├│mica',
  'premium_economy': 'Premium Economy',
  'business': 'Ejecutiva',
  'first': 'Primera Clase'
};

export const CABIN_MULTIPLIERS: Record<CabinClass, number> = {
  'economy': 1,
  'premium_economy': 1.5,
  'business': 2.5,
  'first': 4
};

/**
 * Servicio de calculadora de emisiones de CO2
 * Conecta con: POST /api/public/calculator/estimate
 */
class CalculatorService {
  private lastCalculation: CalculationResponse | null = null;

  /**
   * Calcular emisiones de CO2 para un vuelo
   */
  async calculateEmissions(request: CalculationRequest): Promise<CalculationResponse> {
    try {
      const response = await api.post<any, CalculationResponse>('/public/calculator/estimate', {
        origin: request.origin.toUpperCase(),
        destination: request.destination.toUpperCase(),
        cabinCode: request.cabinCode,
        passengers: request.passengers,
        roundTrip: request.roundTrip,
        userId: request.userId
      });

      if (response.status === 'success') {
        this.lastCalculation = response;
      }

      return response;
    } catch (error: any) {
      console.error('Error calculando emisiones:', error);
      throw {
        status: 'error',
        message: error.message || 'Error al calcular emisiones'
      };
    }
  }

  /**
   * Obtener el ├║ltimo c├ílculo realizado
   */
  getLastCalculation(): CalculationResponse | null {
    return this.lastCalculation;
  }

  /**
   * Calcular emisiones localmente (fallback sin API)
   */
  calculateLocal(
    distanceKm: number, 
    cabinCode: CabinClass, 
    passengers: number = 1, 
    roundTrip: boolean = false
  ): { kgCO2: number; tonCO2: number; priceCLP: number } {
    const distance = roundTrip ? distanceKm * 2 : distanceKm;
    
    let haulType: HaulType;
    if (distanceKm <= 500) {
      haulType = 'Domestic';
    } else if (distanceKm <= 3700) {
      haulType = 'Short-haul';
    } else {
      haulType = 'Long-haul';
    }

    const factor = EMISSION_FACTORS[haulType][cabinCode];
    const kgCO2 = distance * factor * passengers;
    const tonCO2 = kgCO2 / 1000;
    
    const PRECIO_TONELADA_CLP = 15990;
    const priceCLP = Math.round(tonCO2 * PRECIO_TONELADA_CLP);

    return { kgCO2, tonCO2, priceCLP };
  }

  /**
   * Formatear cantidad de CO2
   */
  formatCO2(kg: number): string {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(2)} t`;
    }
    return `${kg.toFixed(1)} kg`;
  }

  /**
   * Formatear precio en CLP
   */
  formatPriceCLP(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  }
}

export const calculatorService = new CalculatorService();
export default calculatorService;
