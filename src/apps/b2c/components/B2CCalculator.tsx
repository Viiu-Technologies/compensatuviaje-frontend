import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  FaPlane, 
  FaLeaf, 
  FaTree, 
  FaWater, 
  FaHome,
  FaTshirt,
  FaMapMarkerAlt,
  FaUsers,
  FaExchangeAlt,
  FaCreditCard,
  FaCheckCircle,
  FaArrowLeft,
  FaLock,
  FaShieldAlt,
  FaCertificate,
  FaSpinner,
  FaGlobeAmericas,
  FaInfoCircle,
  FaDownload
} from 'react-icons/fa';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import CertificateGenerator from './CertificateGenerator';

// Types
interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  lat?: number;
  lon?: number;
}

interface CalculationResult {
  status: string;
  meta: {
    tripType: string;
    distanceKmOneWay: number;
    distanceKmTotal: number;
    haulType: string;
    route: {
      origin: { code: string; city: string; country: string };
      destination: { code: string; city: string; country: string };
    };
  };
  emissions: {
    kgCO2e: number;
    tonCO2e: number;
    factorUsed: number;
    passengers: number;
  };
  pricing: {
    currency: string;
    totalPriceCLP: number;
    totalPriceUSD: number;
    pricePerTonCLP: number;
  };
  equivalencies: {
    trees: number;
    waterLiters: number;
    housingM2: number;
    textileKg: number;
  };
}

type Step = 'form' | 'result' | 'payment' | 'success';

const CABIN_OPTIONS = [
  { value: 'economy', label: 'Económica', icon: '💺', description: 'Clase estándar' },
  { value: 'premium_economy', label: 'Premium', icon: '🛋️', description: 'Mayor espacio' },
  { value: 'business', label: 'Business', icon: '💼', description: 'Clase ejecutiva' },
  { value: 'first', label: 'Primera', icon: '👑', description: 'Máximo confort' }
];

// Backend API URL - Puerto 3001
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Debounce Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Airport Search Component - Mejorado
const AirportSearchInput: React.FC<{
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
  placeholder: string;
  label: string;
  colorScheme: 'green' | 'orange';
}> = ({ value, onChange, placeholder, label, colorScheme }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const colors = {
    green: {
      icon: '!text-emerald-600',
      bg: '!bg-emerald-50',
      border: '!border-emerald-500',
      ring: '!ring-emerald-500/20',
      label: '!text-emerald-700'
    },
    orange: {
      icon: '!text-orange-500',
      bg: '!bg-orange-50',
      border: '!border-orange-500',
      ring: '!ring-orange-500/20',
      label: '!text-orange-600'
    }
  };

  const scheme = colors[colorScheme];

  useEffect(() => {
    if (debouncedQuery.length >= 2 && !value) {
      setIsLoading(true);
      fetch(`${API_URL}/public/airports/search?q=${encodeURIComponent(debouncedQuery)}`)
        .then(res => res.json())
        .then(data => {
          // Backend retorna { success: true, data: airports[] }
          const airports = data.success ? data.data : (data.airports || []);
          setResults(airports);
          setShowResults(airports.length > 0);
        })
        .catch((err) => {
          console.error('Error buscando aeropuertos:', err);
          setResults([]);
        })
        .finally(() => setIsLoading(false));
    } else if (debouncedQuery.length < 2) {
      setResults([]);
      setShowResults(false);
    }
  }, [debouncedQuery, value]);

  const handleSelect = (airport: Airport) => {
    onChange(airport);
    setQuery(`${airport.city} (${airport.code})`);
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (value && val !== `${value.city} (${value.code})`) {
      onChange(null);
    }
  };

  return (
    <div className="!relative">
      <label className={`!flex !items-center !gap-2 !text-sm !font-semibold !mb-2 ${scheme.label}`}>
        <FaMapMarkerAlt className={scheme.icon} />
        {label}
      </label>
      <div className="!relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { setIsFocused(true); results.length > 0 && setShowResults(true); }}
          onBlur={() => { setIsFocused(false); setTimeout(() => setShowResults(false), 200); }}
          placeholder={placeholder}
          className={`!w-full !px-4 !py-4 !rounded-xl !border-2 !transition-all !duration-300 !outline-none !text-gray-800 !font-medium !placeholder-gray-400 ${
            value 
              ? `${scheme.border} ${scheme.bg}` 
              : isFocused
                ? `${scheme.border} !bg-white !ring-4 ${scheme.ring}`
                : '!border-gray-200 !bg-white hover:!border-gray-300'
          }`}
        />
        <div className="!absolute !right-4 !top-1/2 !-translate-y-1/2 !flex !items-center !gap-2">
          {isLoading && (
            <FaSpinner className={`${scheme.icon} !animate-spin !text-lg`} />
          )}
          {value && !isLoading && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`!w-7 !h-7 !rounded-full !bg-gradient-to-br !from-emerald-400 !to-emerald-600 !flex !items-center !justify-center !shadow-lg`}
            >
              <FaCheckCircle className="!text-white !text-sm" />
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showResults && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="!absolute !top-full !left-0 !right-0 !mt-2 !bg-white !rounded-2xl !shadow-2xl !border !border-gray-100 !max-h-72 !overflow-y-auto !z-50 !backdrop-blur-xl"
          >
            {results.map((airport, idx) => (
              <motion.button
                key={airport.code}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleSelect(airport)}
                className="!w-full !px-4 !py-3 !text-left hover:!bg-gradient-to-r hover:!from-emerald-50 hover:!to-green-50 !transition-all !duration-200 !border-b !border-gray-50 last:!border-0 !flex !items-center !gap-4 !cursor-pointer !bg-transparent"
              >
                <div className="!w-12 !h-12 !rounded-xl !bg-gradient-to-br !from-emerald-100 !to-green-100 !flex !items-center !justify-center !text-emerald-700 !font-bold !text-sm !shadow-sm">
                  {airport.code}
                </div>
                <div className="!flex-1">
                  <div className="!font-semibold !text-gray-800">{airport.city}</div>
                  <div className="!text-sm !text-gray-500">{airport.name}</div>
                </div>
                <div className="!text-xs !text-gray-400 !bg-gray-100 !px-2 !py-1 !rounded-full">
                  {airport.country}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const B2CCalculator: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<Step>('form');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  
  const [formData, setFormData] = useState({
    origin: null as Airport | null,
    destination: null as Airport | null,
    cabinCode: 'economy',
    passengers: 1,
    roundTrip: true
  });
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [calculationId, setCalculationId] = useState<string | null>(null);
  const [distance, setDistance] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);

  // Precarga de datos desde query params (cuando viene desde "Mis Viajes")
  useEffect(() => {
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const cabin = searchParams.get('cabin');
    const passengers = searchParams.get('passengers');
    const roundTrip = searchParams.get('roundTrip');
    const calcId = searchParams.get('calculationId');

    if (origin && destination) {
      // Actualizar campos básicos de forma
      setFormData(prev => ({
        ...prev,
        cabinCode: cabin || 'economy',
        passengers: passengers ? parseInt(passengers) : 1,
        roundTrip: roundTrip === 'true'
      }));
      
      if (calcId) {
        setCalculationId(calcId);
      }

      // Buscar los aeropuertos por código
      const fetchAirports = async () => {
        try {
          const [originRes, destRes] = await Promise.all([
            fetch(`${API_URL}/public/airports/search?q=${encodeURIComponent(origin)}`),
            fetch(`${API_URL}/public/airports/search?q=${encodeURIComponent(destination)}`)
          ]);

          const originData = await originRes.json();
          const destData = await destRes.json();

          const originAirports = originData.success ? originData.data : (originData.airports || []);
          const destAirports = destData.success ? destData.data : (destData.airports || []);

          // Seleccionar el primer resultado o exacta matchdel código
          const originAirport = originAirports.find((a: any) => a.code === origin) || originAirports[0];
          const destAirport = destAirports.find((a: any) => a.code === destination) || destAirports[0];

          if (originAirport) {
            setFormData(prev => ({ ...prev, origin: originAirport }));
          }
          if (destAirport) {
            setFormData(prev => ({ ...prev, destination: destAirport }));
          }
        } catch (err) {
          console.error('Error precargando aeropuertos:', err);
        }
      };

      fetchAirports();
    }
  }, [searchParams]);

  // Calcular distancia cuando se seleccionan ambos aeropuertos
  useEffect(() => {
    if (formData.origin?.lat && formData.destination?.lat) {
      const R = 6371;
      const dLat = ((formData.destination.lat || 0) - (formData.origin.lat || 0)) * Math.PI / 180;
      const dLon = ((formData.destination.lon || 0) - (formData.origin.lon || 0)) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((formData.origin.lat || 0) * Math.PI / 180) * 
        Math.cos((formData.destination.lat || 0) * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      setDistance(Math.round(R * c));
    }
  }, [formData.origin, formData.destination]);

  const handleCalculate = async () => {
    if (!formData.origin || !formData.destination) return;

    setIsCalculating(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/public/calculator/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: formData.origin.code,
          destination: formData.destination.code,
          cabinCode: formData.cabinCode,
          passengers: formData.passengers,
          roundTrip: formData.roundTrip,
          userId: user?.id // Enviar userId si está autenticado
        })
      });

      const data = await response.json();
      
      // El backend retorna directamente el resultado con status: 'success'
      if (data.status === 'success') {
        setResult(data);
        if (data.calculationId) {
          setCalculationId(data.calculationId);
        }
        setCurrentStep('result');
      } else {
        setError(data.message || 'Error al calcular emisiones');
      }
    } catch (err) {
      console.error('Error calculating:', err);
      setError('Error de conexión. Verifica que el servidor esté corriendo.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePayment = async () => {
    if (!result) return;

    setIsProcessingPayment(true);
    try {
      // Obtener token de Supabase para autenticación
      const session = await authService.getSession();
      const token = session?.access_token;
      
      if (!token) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }

      const headers: Record<string, string> = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Crear transacción de pago (Webpay / modo directo)
      const response = await fetch(`${API_URL}/b2c/payments/create-transaction`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: result.pricing.totalPriceCLP,
          calculationId: calculationId,
          flightData: {
            origin: result.meta.route.origin,
            destination: result.meta.route.destination,
            emissions: result.emissions,
            pricing: result.pricing,
            meta: result.meta
          }
        })
      });

      const data = await response.json();
      
      if (data.success && data.url && data.token) {
        // Redirigir al formulario de pago de Webpay (Transbank)
        // El usuario será redirigido al portal de Transbank para pagar
        // Después Transbank redirige al backend, que procesa y redirige al frontend
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
        // El usuario sale de la SPA aquí — al volver, llegará a /b2c/payment-result
        return;
      } else {
        setError(data.message || 'Error al crear transacción de pago');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Error de conexión al procesar el pago. Intenta nuevamente.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const resetCalculator = () => {
    setFormData({
      origin: null,
      destination: null,
      cabinCode: 'economy',
      passengers: 1,
      roundTrip: true
    });
    setResult(null);
    setCalculationId(null);
    setPaymentSuccess(null);
    setCurrentStep('form');
    setError(null);
  };

  const canCalculate = formData.origin && formData.destination;

  return (
    <div className="!min-h-screen !bg-gradient-to-br !from-slate-50 !via-emerald-50/40 !to-teal-50/30">
      {/* Header Mejorado */}
      <header className="!bg-white/70 !backdrop-blur-xl !border-b !border-gray-200/50 !sticky !top-0 !z-50">
        <div className="!max-w-6xl !mx-auto !px-4 sm:!px-6 !py-4 !flex !items-center !justify-between">
          <motion.button 
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/b2c/dashboard')}
            className="!flex !items-center !gap-2 !text-gray-600 hover:!text-emerald-700 !transition-colors !bg-transparent !border-0 !cursor-pointer !font-medium"
          >
            <FaArrowLeft className="!text-lg" />
            <span className="!hidden sm:!inline">Volver al Dashboard</span>
          </motion.button>
          
          <div className="!flex !items-center !gap-3">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="!w-11 !h-11 !rounded-xl !bg-gradient-to-br !from-emerald-500 !to-teal-600 !flex !items-center !justify-center !shadow-lg !shadow-emerald-500/30"
            >
              <FaLeaf className="!text-white !text-xl" />
            </motion.div>
            <div className="!hidden sm:!block">
              <h1 className="!font-bold !text-gray-900 !text-lg !m-0 !leading-tight">Calculadora CO₂</h1>
              <p className="!text-xs !text-gray-500 !m-0">Compensa tu huella de carbono</p>
            </div>
          </div>
          
          <div className="!flex !items-center !gap-2 !px-3 !py-1.5 !rounded-full !bg-emerald-50 !text-emerald-700">
            <FaShieldAlt className="!text-sm" />
            <span className="!text-sm !font-medium !hidden sm:!inline">Pago seguro</span>
          </div>
        </div>
      </header>

      <main className="!max-w-6xl !mx-auto !px-4 sm:!px-6 !py-6 sm:!py-10">
        <AnimatePresence mode="wait">
          {/* ============= STEP: FORM ============= */}
          {currentStep === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hero Section */}
              <div className="!text-center !mb-8">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="!inline-flex !items-center !gap-2 !px-4 !py-2 !rounded-full !bg-emerald-100 !text-emerald-700 !text-sm !font-medium !mb-4"
                >
                  <HiSparkles className="!text-lg" />
                  Calcula y compensa en minutos
                </motion.div>
                <h2 className="!text-2xl sm:!text-3xl !font-bold !text-gray-900 !mb-2">
                  ¿Cuánto CO₂ genera tu vuelo?
                </h2>
                <p className="!text-gray-600 !max-w-xl !mx-auto">
                  Ingresa los datos de tu viaje y calcula tu huella de carbono al instante
                </p>
              </div>

              <div className="!grid lg:!grid-cols-5 !gap-6 lg:!gap-8">
                {/* Left Column - Form (3 cols) */}
                <div className="lg:!col-span-3">
                  <div className="!bg-white !rounded-3xl !shadow-xl !shadow-gray-200/50 !border !border-gray-100/80 !p-6 sm:!p-8 !relative !overflow-hidden">
                    {/* Decorative gradient */}
                    <div className="!absolute !top-0 !right-0 !w-40 !h-40 !bg-gradient-to-br !from-emerald-100/50 !to-transparent !rounded-full !blur-3xl !-translate-y-1/2 !translate-x-1/2" />
                    
                    <div className="!relative !z-10">
                      {/* Section Header */}
                      <div className="!flex !items-center !gap-4 !mb-8">
                        <div className="!w-14 !h-14 !rounded-2xl !bg-gradient-to-br !from-emerald-500 !to-teal-600 !flex !items-center !justify-center !shadow-lg !shadow-emerald-500/25">
                          <FaPlane className="!text-white !text-2xl" />
                        </div>
                        <div>
                          <h3 className="!text-xl !font-bold !text-gray-900 !m-0">Datos del Vuelo</h3>
                          <p className="!text-sm !text-gray-500 !m-0">Ingresa la información de tu viaje</p>
                        </div>
                      </div>

                      <div className="!space-y-6">
                        {/* Origin & Destination */}
                        <div className="!grid sm:!grid-cols-2 !gap-4">
                          <AirportSearchInput
                            value={formData.origin}
                            onChange={(airport) => setFormData(prev => ({ ...prev, origin: airport }))}
                            placeholder="Ciudad o código IATA..."
                            label="Origen"
                            colorScheme="green"
                          />
                          <AirportSearchInput
                            value={formData.destination}
                            onChange={(airport) => setFormData(prev => ({ ...prev, destination: airport }))}
                            placeholder="Ciudad o código IATA..."
                            label="Destino"
                            colorScheme="orange"
                          />
                        </div>

                        {/* Distance Preview */}
                        <AnimatePresence>
                          {distance > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="!overflow-hidden"
                            >
                              <div className="!bg-gradient-to-r !from-blue-50 !via-indigo-50 !to-purple-50 !rounded-2xl !p-4 !border !border-blue-100">
                                <div className="!flex !items-center !justify-between">
                                  <div className="!flex !items-center !gap-3">
                                    <div className="!w-10 !h-10 !rounded-xl !bg-white !shadow-sm !flex !items-center !justify-center">
                                      <FaPlane className="!text-blue-600 !transform !rotate-45" />
                                    </div>
                                    <div>
                                      <div className="!text-xs !text-blue-600 !font-semibold !uppercase !tracking-wide">Distancia</div>
                                      <div className="!text-xl !font-bold !text-gray-900">{distance.toLocaleString()} km</div>
                                    </div>
                                  </div>
                                  <div className="!text-right">
                                    <div className="!text-xs !text-gray-500">Total del viaje</div>
                                    <div className="!text-lg !font-semibold !text-blue-700">
                                      {formData.roundTrip ? `${(distance * 2).toLocaleString()} km` : `${distance.toLocaleString()} km`}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Cabin Class */}
                        <div>
                          <label className="!block !text-sm !font-semibold !text-gray-700 !mb-3">
                            Clase de Cabina
                          </label>
                          <div className="!grid !grid-cols-2 sm:!grid-cols-4 !gap-3">
                            {CABIN_OPTIONS.map((cabin) => (
                              <motion.button
                                key={cabin.value}
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setFormData(prev => ({ ...prev, cabinCode: cabin.value }))}
                                className={`!p-4 !rounded-xl !border-2 !transition-all !duration-200 !text-center !cursor-pointer !relative !overflow-hidden ${
                                  formData.cabinCode === cabin.value
                                    ? '!border-emerald-500 !bg-gradient-to-br !from-emerald-50 !to-teal-50 !shadow-lg !shadow-emerald-500/20'
                                    : '!border-gray-200 !bg-white hover:!border-gray-300 hover:!shadow-md'
                                }`}
                              >
                                {formData.cabinCode === cabin.value && (
                                  <motion.div
                                    layoutId="cabin-selected"
                                    className="!absolute !top-1 !right-1 !w-5 !h-5 !rounded-full !bg-emerald-500 !flex !items-center !justify-center"
                                  >
                                    <FaCheckCircle className="!text-white !text-xs" />
                                  </motion.div>
                                )}
                                <span className="!text-2xl !block !mb-1">{cabin.icon}</span>
                                <span className={`!text-sm !font-semibold !block ${
                                  formData.cabinCode === cabin.value ? '!text-emerald-700' : '!text-gray-700'
                                }`}>{cabin.label}</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Passengers & Trip Type */}
                        <div className="!grid sm:!grid-cols-2 !gap-6">
                          {/* Passengers */}
                          <div>
                            <label className="!flex !items-center !gap-2 !text-sm !font-semibold !text-gray-700 !mb-3">
                              <FaUsers className="!text-purple-500" />
                              Pasajeros
                            </label>
                            <div className="!flex !items-center !gap-2">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setFormData(prev => ({ ...prev, passengers: Math.max(1, prev.passengers - 1) }))}
                                className="!w-14 !h-14 !rounded-xl !border-2 !border-gray-200 !bg-white hover:!bg-gray-50 !text-2xl !font-bold !text-gray-600 hover:!border-gray-300 !transition !cursor-pointer !shadow-sm"
                              >
                                −
                              </motion.button>
                              <div className="!flex-1 !h-14 !rounded-xl !bg-gradient-to-br !from-gray-50 !to-gray-100 !border-2 !border-gray-200 !flex !items-center !justify-center !font-bold !text-2xl !text-gray-800">
                                {formData.passengers}
                              </div>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setFormData(prev => ({ ...prev, passengers: Math.min(10, prev.passengers + 1) }))}
                                className="!w-14 !h-14 !rounded-xl !border-2 !border-gray-200 !bg-white hover:!bg-gray-50 !text-2xl !font-bold !text-gray-600 hover:!border-gray-300 !transition !cursor-pointer !shadow-sm"
                              >
                                +
                              </motion.button>
                            </div>
                          </div>

                          {/* Trip Type */}
                          <div>
                            <label className="!flex !items-center !gap-2 !text-sm !font-semibold !text-gray-700 !mb-3">
                              <FaExchangeAlt className="!text-indigo-500" />
                              Tipo de Viaje
                            </label>
                            <div className="!grid !grid-cols-2 !gap-2">
                              <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setFormData(prev => ({ ...prev, roundTrip: true }))}
                                className={`!p-4 !rounded-xl !border-2 !transition-all !duration-200 !flex !flex-col !items-center !justify-center !gap-1 !cursor-pointer ${
                                  formData.roundTrip
                                    ? '!border-emerald-500 !bg-emerald-50 !text-emerald-700 !shadow-lg !shadow-emerald-500/20'
                                    : '!border-gray-200 !bg-white !text-gray-600 hover:!border-gray-300'
                                }`}
                              >
                                <FaExchangeAlt className="!text-lg" />
                                <span className="!font-semibold !text-sm">Ida y Vuelta</span>
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setFormData(prev => ({ ...prev, roundTrip: false }))}
                                className={`!p-4 !rounded-xl !border-2 !transition-all !duration-200 !flex !flex-col !items-center !justify-center !gap-1 !cursor-pointer ${
                                  !formData.roundTrip
                                    ? '!border-blue-500 !bg-blue-50 !text-blue-700 !shadow-lg !shadow-blue-500/20'
                                    : '!border-gray-200 !bg-white !text-gray-600 hover:!border-gray-300'
                                }`}
                              >
                                <FaPlane className="!text-lg" />
                                <span className="!font-semibold !text-sm">Solo Ida</span>
                              </motion.button>
                            </div>
                          </div>
                        </div>

                        {/* Error Message */}
                        <AnimatePresence>
                          {error && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="!bg-red-50 !border !border-red-200 !rounded-xl !p-4 !flex !items-center !gap-3"
                            >
                              <FaInfoCircle className="!text-red-500 !text-lg !flex-shrink-0" />
                              <p className="!text-red-700 !text-sm !m-0">{error}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Calculate Button */}
                        <motion.button
                          whileHover={{ scale: canCalculate ? 1.02 : 1 }}
                          whileTap={{ scale: canCalculate ? 0.98 : 1 }}
                          onClick={handleCalculate}
                          disabled={!canCalculate || isCalculating}
                          className={`!w-full !py-5 !rounded-2xl !font-bold !text-lg !transition-all !duration-300 !flex !items-center !justify-center !gap-3 !cursor-pointer !border-0 ${
                            canCalculate
                              ? '!bg-gradient-to-r !from-emerald-500 !via-emerald-600 !to-teal-600 !text-white !shadow-xl !shadow-emerald-500/30 hover:!shadow-2xl hover:!shadow-emerald-500/40'
                              : '!bg-gray-200 !text-gray-500 !cursor-not-allowed'
                          }`}
                        >
                          {isCalculating ? (
                            <>
                              <FaSpinner className="!animate-spin !text-xl" />
                              Calculando emisiones...
                            </>
                          ) : (
                            <>
                              <HiSparkles className="!text-xl" />
                              Calcular Huella de Carbono
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Info (2 cols) */}
                <div className="lg:!col-span-2 !space-y-5">
                  {/* Impact Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="!bg-gradient-to-br !from-emerald-600 !via-emerald-600 !to-teal-700 !rounded-3xl !p-6 !text-white !shadow-xl !shadow-emerald-600/30 !relative !overflow-hidden"
                  >
                    <div className="!absolute !top-0 !right-0 !w-32 !h-32 !bg-white/10 !rounded-full !blur-2xl !-translate-y-1/2 !translate-x-1/2" />
                    <div className="!absolute !bottom-0 !left-0 !w-24 !h-24 !bg-teal-400/20 !rounded-full !blur-2xl !translate-y-1/2 !-translate-x-1/2" />
                    
                    <div className="!relative !z-10">
                      <div className="!flex !items-center !gap-3 !mb-4">
                        <div className="!w-12 !h-12 !rounded-xl !bg-white/20 !backdrop-blur-sm !flex !items-center !justify-center">
                          <FaGlobeAmericas className="!text-2xl" />
                        </div>
                        <div>
                          <h3 className="!font-bold !text-lg !m-0">Compensa tu Impacto</h3>
                          <p className="!text-emerald-200 !text-sm !m-0">Apoya proyectos verificados</p>
                        </div>
                      </div>
                      <p className="!text-emerald-100 !text-sm !leading-relaxed !m-0">
                        Tu compensación financia proyectos de reforestación, energías renovables 
                        y conservación certificados internacionalmente.
                      </p>
                    </div>
                  </motion.div>

                  {/* What We Compensate */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="!bg-white !rounded-3xl !p-6 !shadow-lg !shadow-gray-200/50 !border !border-gray-100"
                  >
                    <h4 className="!font-bold !text-gray-900 !mb-4 !flex !items-center !gap-2 !text-base">
                      <div className="!w-8 !h-8 !rounded-lg !bg-emerald-100 !flex !items-center !justify-center">
                        <FaLeaf className="!text-emerald-600" />
                      </div>
                      ¿Qué compensamos?
                    </h4>
                    <div className="!space-y-3">
                      {[
                        { icon: FaTree, text: 'Plantación de árboles nativos', color: 'emerald' },
                        { icon: FaWater, text: 'Conservación de ecosistemas', color: 'blue' },
                        { icon: HiLightningBolt, text: 'Energías renovables', color: 'amber' }
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + idx * 0.1 }}
                          className={`!flex !items-center !gap-3 !p-3 !rounded-xl ${
                            item.color === 'emerald' ? '!bg-emerald-50' :
                            item.color === 'blue' ? '!bg-blue-50' : '!bg-amber-50'
                          }`}
                        >
                          <item.icon className={`!text-lg ${
                            item.color === 'emerald' ? '!text-emerald-600' :
                            item.color === 'blue' ? '!text-blue-600' : '!text-amber-600'
                          }`} />
                          <span className="!text-sm !font-medium !text-gray-700">{item.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Trust Badges */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="!grid !grid-cols-3 !gap-3"
                  >
                    {[
                      { icon: FaLock, label: 'Pago Seguro', color: 'emerald' },
                      { icon: FaCertificate, label: 'Certificado', color: 'blue' },
                      { icon: FaShieldAlt, label: 'Verificado', color: 'purple' }
                    ].map((badge, idx) => (
                      <div key={idx} className="!bg-white !rounded-2xl !p-4 !text-center !shadow-md !shadow-gray-100 !border !border-gray-100">
                        <badge.icon className={`!text-2xl !mx-auto !mb-2 ${
                          badge.color === 'emerald' ? '!text-emerald-600' :
                          badge.color === 'blue' ? '!text-blue-600' : '!text-purple-600'
                        }`} />
                        <span className="!text-xs !font-semibold !text-gray-600">{badge.label}</span>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============= STEP: RESULT ============= */}
          {currentStep === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="!max-w-4xl !mx-auto"
            >
              {/* Route Summary */}
              <div className="!bg-white !rounded-3xl !shadow-xl !shadow-gray-200/50 !border !border-gray-100 !p-6 sm:!p-8 !mb-6">
                <div className="!flex !items-center !justify-between !mb-6">
                  <h3 className="!font-bold !text-gray-900 !text-xl !m-0">Tu Ruta</h3>
                  <span className="!px-4 !py-1.5 !rounded-full !bg-emerald-100 !text-emerald-700 !text-sm !font-semibold">
                    {result.meta.tripType === 'round_trip' ? '↔️ Ida y Vuelta' : '→ Solo Ida'}
                  </span>
                </div>
                <div className="!flex !items-center !justify-center !gap-4 sm:!gap-8 !py-6">
                  <div className="!text-center">
                    <div className="!text-4xl sm:!text-5xl !font-bold !text-gray-900">{result.meta.route.origin.code}</div>
                    <div className="!text-sm !text-gray-500 !mt-1">{result.meta.route.origin.city}</div>
                  </div>
                  <div className="!flex-1 !flex !items-center !justify-center !max-w-xs">
                    <div className="!h-0.5 !bg-gradient-to-r !from-emerald-200 !to-emerald-400 !flex-1"></div>
                    <div className="!w-12 !h-12 !rounded-full !bg-emerald-100 !flex !items-center !justify-center !mx-3 !shadow-lg !shadow-emerald-200">
                      <FaPlane className="!text-emerald-600 !text-lg" />
                    </div>
                    <div className="!h-0.5 !bg-gradient-to-r !from-emerald-400 !to-emerald-200 !flex-1"></div>
                  </div>
                  <div className="!text-center">
                    <div className="!text-4xl sm:!text-5xl !font-bold !text-gray-900">{result.meta.route.destination.code}</div>
                    <div className="!text-sm !text-gray-500 !mt-1">{result.meta.route.destination.city}</div>
                  </div>
                </div>
                <div className="!text-center !text-sm !text-gray-500 !pt-4 !border-t !border-gray-100">
                  <span className="!font-semibold !text-gray-700">{result.meta.distanceKmTotal.toLocaleString()} km</span> totales • 
                  <span className="!font-semibold !text-gray-700"> {result.emissions.passengers}</span> pasajero(s)
                </div>
              </div>

              {/* Emissions Card */}
              <div className="!bg-gradient-to-br !from-emerald-500 !via-emerald-600 !to-teal-600 !rounded-3xl !shadow-2xl !shadow-emerald-500/30 !p-8 sm:!p-10 !text-white !text-center !mb-6 !relative !overflow-hidden">
                <div className="!absolute !top-0 !right-0 !w-48 !h-48 !bg-white/10 !rounded-full !blur-3xl !-translate-y-1/2 !translate-x-1/2"></div>
                
                <div className="!relative !z-10">
                  <div className="!text-sm !font-semibold !text-emerald-200 !mb-3 !uppercase !tracking-wider">Tu Huella de Carbono</div>
                  <div className="!text-7xl sm:!text-8xl !font-bold !mb-2">{result.emissions.kgCO2e.toLocaleString()}</div>
                  <div className="!text-2xl !text-emerald-200 !font-medium">kg CO₂e</div>
                  <div className="!mt-6 !text-emerald-100 !text-sm !bg-white/10 !rounded-full !px-4 !py-2 !inline-block">
                    ≈ {result.emissions.tonCO2e.toFixed(2)} toneladas de CO₂
                  </div>
                </div>
              </div>

              {/* Equivalencies */}
              <div className="!bg-white !rounded-3xl !shadow-xl !shadow-gray-200/50 !border !border-gray-100 !p-6 sm:!p-8 !mb-6">
                <h3 className="!font-bold !text-gray-900 !mb-6 !text-lg">Equivalencias de Impacto</h3>
                <div className="!grid !grid-cols-2 lg:!grid-cols-4 !gap-4">
                  {[
                    { icon: FaTree, value: result.equivalencies.trees, label: 'Árboles plantados', color: 'emerald' },
                    { icon: FaWater, value: `${(result.equivalencies.waterLiters / 1000).toFixed(0)}K`, label: 'Litros de agua', color: 'blue' },
                    { icon: FaHome, value: result.equivalencies.housingM2, label: 'm² de vivienda', color: 'amber' },
                    { icon: FaTshirt, value: result.equivalencies.textileKg, label: 'kg de textiles', color: 'purple' }
                  ].map((eq, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`!rounded-2xl !p-5 !text-center ${
                        eq.color === 'emerald' ? '!bg-emerald-50' :
                        eq.color === 'blue' ? '!bg-blue-50' :
                        eq.color === 'amber' ? '!bg-amber-50' : '!bg-purple-50'
                      }`}
                    >
                      <eq.icon className={`!text-3xl !mx-auto !mb-3 ${
                        eq.color === 'emerald' ? '!text-emerald-600' :
                        eq.color === 'blue' ? '!text-blue-600' :
                        eq.color === 'amber' ? '!text-amber-600' : '!text-purple-600'
                      }`} />
                      <div className="!text-3xl !font-bold !text-gray-900">{eq.value}</div>
                      <div className="!text-xs !text-gray-600 !mt-1 !font-medium">{eq.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Pricing & Actions */}
              <div className="!bg-white !rounded-3xl !shadow-xl !shadow-gray-200/50 !border !border-gray-100 !p-6 sm:!p-8">
                <div className="!flex !flex-col sm:!flex-row !items-start sm:!items-center !justify-between !mb-8 !gap-4">
                  <div>
                    <div className="!text-sm !text-gray-500 !font-medium">Total a compensar</div>
                    <div className="!text-4xl !font-bold !text-gray-900">
                      ${result.pricing.totalPriceCLP.toLocaleString()} <span className="!text-xl !font-normal !text-gray-500">CLP</span>
                    </div>
                    <div className="!text-sm !text-gray-500">≈ ${result.pricing.totalPriceUSD.toFixed(2)} USD</div>
                  </div>
                  <div className="!text-left sm:!text-right !bg-gray-50 !rounded-xl !px-4 !py-3">
                    <div className="!text-xs !text-gray-500 !font-medium">Precio por tonelada</div>
                    <div className="!text-lg !font-bold !text-gray-700">
                      ${result.pricing.pricePerTonCLP.toLocaleString()} CLP
                    </div>
                  </div>
                </div>

                <div className="!flex !flex-col sm:!flex-row !gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep('form')}
                    className="!flex-1 !py-4 !rounded-xl !border-2 !border-gray-200 !bg-white !text-gray-700 !font-semibold !transition hover:!border-gray-300 hover:!bg-gray-50 !cursor-pointer !flex !items-center !justify-center !gap-2"
                  >
                    <FaArrowLeft />
                    Modificar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePayment}
                    disabled={isProcessingPayment}
                    className="!flex-[2] !py-4 !rounded-xl !bg-gradient-to-r !from-emerald-500 !to-teal-600 !text-white !font-bold !shadow-xl !shadow-emerald-500/30 hover:!shadow-2xl !transition !flex !items-center !justify-center !gap-3 !cursor-pointer !border-0"
                  >
                    {isProcessingPayment ? (
                      <>
                        <FaSpinner className="!animate-spin !text-xl" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <FaCreditCard className="!text-xl" />
                        Compensar Ahora
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============= STEP: SUCCESS ============= */}
          {currentStep === 'success' && paymentSuccess && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="!max-w-lg !mx-auto"
            >
              <div className="!bg-white !rounded-3xl !shadow-2xl !shadow-gray-200/50 !border !border-emerald-100 !overflow-hidden">
                {/* Success Header */}
                <div className="!bg-gradient-to-br !from-emerald-500 !via-emerald-600 !to-teal-600 !p-10 !text-center !text-white !relative !overflow-hidden">
                  <div className="!absolute !top-0 !right-0 !w-40 !h-40 !bg-white/10 !rounded-full !blur-3xl"></div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="!w-24 !h-24 !mx-auto !mb-5 !rounded-full !bg-white/20 !backdrop-blur-sm !flex !items-center !justify-center !shadow-xl"
                  >
                    <FaCheckCircle className="!text-5xl" />
                  </motion.div>
                  <h3 className="!text-3xl !font-bold !mb-2 !m-0">¡Felicitaciones! 🎉</h3>
                  <p className="!text-emerald-100 !text-lg !m-0">Tu compensación fue exitosa</p>
                </div>

                {/* Details */}
                <div className="!p-8">
                  <div className="!bg-gradient-to-br !from-emerald-50 !to-teal-50 !rounded-2xl !p-6 !mb-6 !text-center !border !border-emerald-100">
                    <div className="!text-sm !text-emerald-600 !font-semibold !mb-1">CO₂ Compensado</div>
                    <div className="!text-5xl !font-bold !text-emerald-700">
                      {paymentSuccess.emissions.kgCO2e?.toLocaleString()} kg
                    </div>
                  </div>

                  <div className="!bg-gray-50 !rounded-2xl !p-5 !mb-6">
                    <div className="!flex !items-center !gap-4">
                      <div className="!w-16 !h-16 !rounded-xl !bg-emerald-100 !flex !items-center !justify-center">
                        <FaCertificate className="!text-emerald-600 !text-3xl" />
                      </div>
                      <div>
                        <div className="!text-xs !text-gray-500 !mb-1 !font-medium">Tu Certificado</div>
                        <div className="!font-mono !text-xl !text-gray-800 !font-bold">{paymentSuccess.certificateId}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="!space-y-3">
                    {/* Botón principal: Descargar Certificado PDF */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCertificate(true)}
                      className="!w-full !py-4 !bg-gradient-to-r !from-emerald-500 !to-teal-600 !text-white !rounded-xl !font-bold !transition !border-0 !flex !items-center !justify-center !gap-2 !shadow-xl !shadow-emerald-500/30 hover:!shadow-2xl !cursor-pointer"
                    >
                      <FaDownload />
                      Descargar Certificado PDF
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/b2c/certificates')}
                      className="!w-full !py-4 !bg-emerald-50 !text-emerald-700 !rounded-xl !font-semibold !transition !border-2 !border-emerald-200 !flex !items-center !justify-center !gap-2 !cursor-pointer hover:!bg-emerald-100"
                    >
                      <FaCertificate />
                      Ver Mis Certificados
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetCalculator}
                      className="!w-full !py-4 !bg-gray-100 !text-gray-700 !rounded-xl !font-semibold !transition !border-0 !cursor-pointer hover:!bg-gray-200"
                    >
                      Calcular Otro Vuelo
                    </motion.button>
                    <Link to="/b2c/dashboard" className="!block">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="!w-full !py-3 !bg-transparent !text-gray-500 !rounded-xl !font-medium !transition !border-0 !text-sm !cursor-pointer hover:!text-gray-700"
                      >
                        Volver al Dashboard
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal del Certificado */}
      <AnimatePresence>
        {showCertificate && paymentSuccess && result && formData.origin && formData.destination && (
          <CertificateGenerator
            data={{
              certificateId: paymentSuccess.certificateId,
              userName: user?.nombre || user?.email?.split('@')[0] || 'Usuario',
              userEmail: user?.email,
              emissionsTons: result.emissions.tonCO2e,
              emissionsKg: result.emissions.kgCO2e,
              origin: `${formData.origin.city} (${formData.origin.code})`,
              destination: `${formData.destination.city} (${formData.destination.code})`,
              compensationDate: new Date().toISOString(),
              projectName: 'Proyecto de Reforestación Nativa',
              projectType: 'Reforestación y Conservación',
              equivalences: result.equivalencies ? {
                treesPlanted: result.equivalencies.trees,
                carKmAvoided: Math.round(result.emissions.kgCO2e * 5.5),
              } : undefined,
              amountPaid: result.pricing.totalPriceCLP,
              currency: 'CLP'
            }}
            onClose={() => setShowCertificate(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default B2CCalculator;
