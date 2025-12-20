// ============================================
// API GENERIC TYPES
// ============================================

// Response base exitosa
export interface SuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data: T;
}

// Response base error
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  error_code?: string;
  details?: Array<{ field: string; message: string }>;
}

// Response con paginación
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic API Response
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Validación de aeropuerto
export interface AirportValidationResponse {
  success: boolean;
  message: string;
  data?: {
    iataCode: string;
    name: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
}

// Validación de dominio
export interface DomainInfoResponse {
  success: boolean;
  data: {
    domain: string;
    exists: boolean;
    message: string;
  };
}

// Query params genéricos
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
