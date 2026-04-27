import api from '../../../shared/services/api';

// ============ TYPES ============

export interface B2BOrder {
  id: string;
  tonsTco2: number;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  project: {
    id: string;
    name: string;
    type: string;
    country: string;
    region?: string;
  } | null;
  platformFee?: number;
  payoutAmount?: number;
  createdAt: string;
}

export interface CreateOrderRequest {
  projectId: string;
  tonsTco2: number;
  // Enfoque B: unidades físicas y kg a congelar en la BD
  physicalUnits?: number;   // Unidades calculadas con calculateUnitsFromTons
  co2KgToFreeze?: number;   // kg CO2 = tonsTco2 * 1000 (congelado en la orden)
}

export interface CreateOrderResponse {
  success: boolean;
  order: {
    id: string;
    tonsTco2: number;
    amount: number;
    currency: string;
    status: string;
    projectId: string;
    projectName: string;
    createdAt: string;
  };
}

export interface BankDetails {
  bankName: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
  rut: string;
  email: string;
  message: string;
}

// ============ API FUNCTIONS ============

/**
 * Create a new B2B compensation order (bank transfer)
 */
export const createOrder = async (data: CreateOrderRequest): Promise<CreateOrderResponse> => {
  const response = await api.post('/b2b/orders', data) as any;
  return response;
};

/**
 * List all orders for the current company
 */
export const getMyOrders = async (): Promise<{ orders: B2BOrder[]; total: number }> => {
  const response = await api.get('/b2b/orders') as any;
  return { orders: response.orders || [], total: response.total || 0 };
};

/**
 * Get order detail by ID
 */
export const getOrderDetail = async (orderId: string): Promise<B2BOrder> => {
  const response = await api.get(`/b2b/orders/${orderId}`) as any;
  return response.order;
};

/**
 * Get bank transfer details (public endpoint)
 */
export const getBankDetails = async (): Promise<BankDetails> => {
  const response = await api.get('/public/bank-details') as any;
  return response.bankDetails;
};
