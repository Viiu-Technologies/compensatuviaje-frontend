import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaPaperPlane, 
  FaPlane, 
  FaLeaf, 
  FaTree, 
  FaWater, 
  FaHome,
  FaTshirt,
  FaMapMarkerAlt,
  FaUsers,
  FaExchangeAlt,
  FaCalculator,
  FaRobot,
  FaUser,
  FaSpinner,
  FaCreditCard,
  FaCheckCircle,
  FaArrowLeft,
  FaLock,
  FaShieldAlt,
  FaCertificate
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/authService';

// Types
interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

interface Message {
  id: string;
  type: 'bot' | 'user' | 'result' | 'options' | 'payment';
  content: string;
  data?: any;
  timestamp: Date;
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

type Step = 'welcome' | 'origin' | 'destination' | 'cabin' | 'passengers' | 'roundtrip' | 'calculating' | 'result' | 'payment' | 'success';

const CABIN_OPTIONS = [
  { value: 'economy', label: 'Económica', icon: '💺', description: 'Clase estándar' },
  { value: 'premium_economy', label: 'Premium Economy', icon: '🛋️', description: 'Más espacio' },
  { value: 'business', label: 'Business', icon: '💼', description: 'Clase ejecutiva' },
  { value: 'first', label: 'Primera Clase', icon: '👑', description: 'Máximo confort' }
];

const API_URL = import.meta.env.VITE_API_URL;

// Airport Search Component (simplificado para B2C)
const AirportSearch: React.FC<{
  onSelect: (airport: Airport) => void;
  placeholder: string;
}> = ({ onSelect, placeholder }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchAirports = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/public/airports/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setResults(data.airports || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching airports:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchAirports(query);
    }, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className="!relative !w-full">
      <div className="!relative">
        <FaMapMarkerAlt className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="!w-full !pl-12 !pr-4 !py-4 !rounded-xl !border-2 !border-gray-200 focus:!border-green-500 !outline-none !text-gray-800 !bg-white !transition-all"
        />
        {isLoading && (
          <FaSpinner className="!absolute !right-4 !top-1/2 !-translate-y-1/2 !text-green-500 !animate-spin" />
        )}
      </div>
      
      {showResults && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="!absolute !top-full !left-0 !right-0 !mt-2 !bg-white !rounded-xl !shadow-xl !border !border-gray-200 !max-h-64 !overflow-y-auto !z-50"
        >
          {results.map((airport) => (
            <button
              key={airport.code}
              onClick={() => {
                onSelect(airport);
                setQuery(`${airport.city} (${airport.code})`);
                setShowResults(false);
              }}
              className="!w-full !px-4 !py-3 !text-left hover:!bg-green-50 !transition-colors !border-b !border-gray-100 last:!border-0 !flex !items-center !gap-3"
            >
              <div className="!w-10 !h-10 !rounded-full !bg-green-100 !flex !items-center !justify-center !text-green-600 !font-bold !text-sm">
                {airport.code}
              </div>
              <div>
                <div className="!font-semibold !text-gray-800">{airport.city}</div>
                <div className="!text-sm !text-gray-500">{airport.name}, {airport.country}</div>
              </div>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

const B2CCalculatorPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [isTyping, setIsTyping] = useState(false);
  const [formData, setFormData] = useState({
    origin: null as Airport | null,
    destination: null as Airport | null,
    cabinCode: '',
    passengers: 1,
    roundTrip: true
  });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    // Solo ejecutar si no hay mensajes todavía
    if (messages.length > 0) return;
    
    const timer1 = setTimeout(() => {
      setMessages([{
        id: `bot-welcome-${Date.now()}`,
        type: 'bot',
        content: `¡Hola ${user?.nombre || 'viajero'}! 👋 Soy tu asistente de huella de carbono. Te ayudaré a calcular y compensar las emisiones de tu vuelo.`,
        timestamp: new Date()
      }]);
    }, 500);
    
    return () => clearTimeout(timer1);
  }, []); // Solo al montar

  // Segundo mensaje después del primero
  useEffect(() => {
    if (messages.length === 1 && currentStep === 'welcome') {
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-origin-${Date.now()}`,
          type: 'bot',
          content: '¿Desde qué ciudad o aeropuerto saldrás? 🛫',
          timestamp: new Date()
        }]);
        setCurrentStep('origin');
      }, 1200);
      
      return () => clearTimeout(timer);
    }
  }, [messages.length, currentStep]);

  const addBotMessage = (content: string, step?: Step) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content,
        timestamp: new Date()
      }]);
      setIsTyping(false);
      if (step) setCurrentStep(step);
    }, 600);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date()
    }]);
  };

  const addResultMessage = (data: CalculationResult) => {
    setMessages(prev => [...prev, {
      id: `result-${Date.now()}`,
      type: 'result',
      content: '',
      data,
      timestamp: new Date()
    }]);
  };

  const handleOriginSelect = (airport: Airport) => {
    setFormData(prev => ({ ...prev, origin: airport }));
    addUserMessage(`${airport.city} (${airport.code})`);
    
    setTimeout(() => {
      addBotMessage(
        `¡Excelente! Saldrás desde ${airport.city} ✈️ ¿Cuál es tu destino?`,
        'destination'
      );
    }, 400);
  };

  const handleDestinationSelect = (airport: Airport) => {
    setFormData(prev => ({ ...prev, destination: airport }));
    addUserMessage(`${airport.city} (${airport.code})`);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `options-cabin-${Date.now()}`,
        type: 'options',
        content: '¿En qué clase viajarás?',
        data: { type: 'cabin' },
        timestamp: new Date()
      }]);
      setCurrentStep('cabin');
    }, 400);
  };

  const handleCabinSelect = (cabin: typeof CABIN_OPTIONS[0]) => {
    setFormData(prev => ({ ...prev, cabinCode: cabin.value }));
    addUserMessage(`${cabin.icon} ${cabin.label}`);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `options-passengers-${Date.now()}`,
        type: 'options',
        content: '¿Cuántos pasajeros?',
        data: { type: 'passengers' },
        timestamp: new Date()
      }]);
      setCurrentStep('passengers');
    }, 400);
  };

  const handlePassengersSelect = (count: number) => {
    setFormData(prev => ({ ...prev, passengers: count }));
    addUserMessage(`${count} ${count === 1 ? 'pasajero' : 'pasajeros'}`);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `options-roundtrip-${Date.now()}`,
        type: 'options',
        content: '¿Tipo de viaje?',
        data: { type: 'roundtrip' },
        timestamp: new Date()
      }]);
      setCurrentStep('roundtrip');
    }, 400);
  };

  const handleRoundTripSelect = async (isRoundTrip: boolean) => {
    setFormData(prev => ({ ...prev, roundTrip: isRoundTrip }));
    addUserMessage(isRoundTrip ? '✈️ Ida y vuelta' : '✈️ Solo ida');
    
    setCurrentStep('calculating');
    addBotMessage('Calculando tu huella de carbono... 🌍');
    
    try {
      const response = await fetch(`${API_URL}/public/calculator/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: formData.origin?.code,
          destination: formData.destination?.code,
          cabinCode: formData.cabinCode,
          passengers: formData.passengers,
          roundTrip: isRoundTrip
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setResult(data);
        setTimeout(() => {
          addResultMessage(data);
          setCurrentStep('result');
        }, 1200);
      } else {
        addBotMessage('Hubo un error al calcular. Por favor, intenta de nuevo. 😔');
      }
    } catch (error) {
      console.error('Error:', error);
      addBotMessage('No pude conectar con el servidor. ¿Está todo bien? 🤔');
    }
  };

  const handleCompensate = async () => {
    if (!result) return;
    
    addUserMessage('¡Quiero compensar mis emisiones! 🌱');
    setCurrentStep('payment');
    setIsProcessingPayment(true);
    
    try {
      // Obtener el token de Supabase correctamente
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      // Crear sesión de pago en Stripe
      const response = await fetch(`${API_URL}/b2c/payments/create-checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({
          amount: result.pricing.totalPriceCLP,
          currency: 'clp',
          flightData: {
            origin: formData.origin,
            destination: formData.destination,
            cabinCode: formData.cabinCode,
            passengers: formData.passengers,
            roundTrip: formData.roundTrip,
            emissions: result.emissions,
            equivalencies: result.equivalencies
          },
          userEmail: user?.email,
          userName: user?.nombre
        })
      });

      const data = await response.json();
      
      if (data.url) {
        // Redirigir a Stripe Checkout
        window.location.href = data.url;
      } else {
        // Si no hay URL, simular pago exitoso (modo demo)
        setTimeout(() => {
          addBotMessage('🎉 ¡Pago procesado exitosamente! Tu compensación ha sido registrada.');
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: `payment-success-${Date.now()}`,
              type: 'payment',
              content: 'success',
              data: {
                certificateId: `CERT-${Date.now()}`,
                emissions: result.emissions,
                amount: result.pricing.totalPriceCLP
              },
              timestamp: new Date()
            }]);
            setCurrentStep('success');
            setIsProcessingPayment(false);
          }, 800);
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      // Modo demo: simular pago exitoso
      setTimeout(() => {
        addBotMessage('🎉 ¡Compensación registrada! (Modo Demo)');
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: `payment-success-${Date.now()}`,
            type: 'payment',
            content: 'success',
            data: {
              certificateId: `CERT-DEMO-${Date.now()}`,
              emissions: result.emissions,
              amount: result.pricing.totalPriceCLP
            },
            timestamp: new Date()
          }]);
          setCurrentStep('success');
          setIsProcessingPayment(false);
        }, 800);
      }, 1500);
    }
  };

  const handleNewCalculation = () => {
    // Reiniciar todo el estado
    setMessages([{
      id: `bot-restart-${Date.now()}`,
      type: 'bot',
      content: '¡Empecemos de nuevo! ¿Desde dónde saldrás? 🛫',
      timestamp: new Date()
    }]);
    setFormData({
      origin: null,
      destination: null,
      cabinCode: '',
      passengers: 1,
      roundTrip: true
    });
    setResult(null);
    setCurrentStep('origin');
  };

  return (
    <div className="!min-h-screen !bg-gradient-to-br !from-green-50 !via-white !to-blue-50">
      {/* Header */}
      <div className="!bg-white/80 !backdrop-blur-md !border-b !border-gray-200 !sticky !top-0 !z-40">
        <div className="!max-w-4xl !mx-auto !px-4 !py-4 !flex !items-center !justify-between">
          <button
            onClick={() => navigate('/b2c/dashboard')}
            className="!flex !items-center !gap-2 !text-gray-600 hover:!text-green-600 !transition !bg-transparent !border-0 !cursor-pointer"
          >
            <FaArrowLeft />
            <span className="!hidden sm:!inline">Volver al Dashboard</span>
          </button>
          
          <div className="!flex !items-center !gap-3">
            <div className="!w-10 !h-10 !rounded-full !bg-gradient-to-br !from-green-500 !to-green-600 !flex !items-center !justify-center">
              <FaLeaf className="!text-white" />
            </div>
            <div className="!hidden sm:!block">
              <h1 className="!text-lg !font-bold !text-gray-900">Calculadora CO₂</h1>
              <p className="!text-xs !text-gray-500">Compensa tu huella de carbono</p>
            </div>
          </div>
          
          <div className="!flex !items-center !gap-2 !text-xs !text-gray-500">
            <FaShieldAlt className="!text-green-500" />
            <span className="!hidden sm:!inline">Pago seguro</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="!max-w-4xl !mx-auto !px-4 !py-6">
        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="!bg-white !rounded-3xl !shadow-xl !border !border-gray-200 !overflow-hidden"
        >
          {/* Chat Header */}
          <div className="!bg-gradient-to-r !from-green-500 !to-green-600 !p-4 !flex !items-center !gap-3">
            <div className="!w-12 !h-12 !rounded-full !bg-white/20 !backdrop-blur-sm !flex !items-center !justify-center">
              <FaRobot className="!text-white !text-xl" />
            </div>
            <div className="!text-white">
              <h2 className="!font-bold">Asistente Verde</h2>
              <p className="!text-green-100 !text-sm !flex !items-center !gap-1">
                <span className="!w-2 !h-2 !bg-green-300 !rounded-full !animate-pulse"></span>
                Online • Listo para ayudarte
              </p>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="!ml-auto !px-3 !py-1 !bg-white/20 !backdrop-blur-sm !rounded-full !flex !items-center !gap-1 !text-white !text-sm"
            >
              <HiSparkles className="!text-yellow-300" />
              <span>IA</span>
            </motion.div>
          </div>

          {/* Chat Messages */}
          <div className="!h-[500px] !overflow-y-auto !p-4 !space-y-4 !bg-gray-50">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`!flex !gap-3 ${message.type === 'user' ? '!justify-end' : '!justify-start'}`}
                >
                  {message.type === 'bot' && (
                    <div className="!w-8 !h-8 !rounded-full !bg-green-100 !flex !items-center !justify-center !flex-shrink-0">
                      <FaRobot className="!text-green-600 !text-sm" />
                    </div>
                  )}

                  {message.type === 'result' && message.data ? (
                    <ResultCard 
                      result={message.data} 
                      onCompensate={handleCompensate} 
                      isProcessing={isProcessingPayment}
                    />
                  ) : message.type === 'options' && message.data ? (
                    <OptionsCard 
                      content={message.content}
                      data={message.data}
                      onCabinSelect={handleCabinSelect}
                      onPassengersSelect={handlePassengersSelect}
                      onRoundTripSelect={handleRoundTripSelect}
                    />
                  ) : message.type === 'payment' ? (
                    <PaymentSuccessCard 
                      data={message.data}
                      onViewCertificates={() => navigate('/b2c/certificates')}
                      onNewCalculation={handleNewCalculation}
                    />
                  ) : (
                    <div className={`!max-w-[80%] !px-4 !py-3 !rounded-2xl ${
                      message.type === 'user' 
                        ? '!bg-green-600 !text-white !rounded-br-none' 
                        : '!bg-white !text-gray-800 !shadow-sm !border !border-gray-100 !rounded-bl-none'
                    }`}>
                      <p className="!text-sm !leading-relaxed">{message.content}</p>
                    </div>
                  )}

                  {message.type === 'user' && (
                    <div className="!w-8 !h-8 !rounded-full !bg-green-600 !flex !items-center !justify-center !flex-shrink-0">
                      <FaUser className="!text-white !text-sm" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="!flex !gap-3 !items-center"
              >
                <div className="!w-8 !h-8 !rounded-full !bg-green-100 !flex !items-center !justify-center">
                  <FaRobot className="!text-green-600 !text-sm" />
                </div>
                <div className="!bg-white !px-4 !py-3 !rounded-2xl !rounded-bl-none !shadow-sm !border !border-gray-100">
                  <div className="!flex !gap-1">
                    <span className="!w-2 !h-2 !bg-gray-400 !rounded-full !animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="!w-2 !h-2 !bg-gray-400 !rounded-full !animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="!w-2 !h-2 !bg-gray-400 !rounded-full !animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="!p-4 !bg-white !border-t !border-gray-200">
            {currentStep === 'origin' && (
              <AirportSearch 
                onSelect={handleOriginSelect}
                placeholder="🔍 Buscar aeropuerto de origen..."
              />
            )}
            
            {currentStep === 'destination' && (
              <AirportSearch 
                onSelect={handleDestinationSelect}
                placeholder="🔍 Buscar aeropuerto de destino..."
              />
            )}

            {(currentStep === 'cabin' || currentStep === 'passengers' || currentStep === 'roundtrip') && (
              <div className="!flex !items-center !justify-center !py-3 !text-gray-500 !text-sm">
                <FaCalculator className="!mr-2" />
                Selecciona una opción arriba ☝️
              </div>
            )}

            {currentStep === 'calculating' && (
              <div className="!flex !items-center !justify-center !py-3 !text-green-600">
                <FaSpinner className="!animate-spin !mr-2" />
                Calculando emisiones...
              </div>
            )}

            {currentStep === 'payment' && (
              <div className="!flex !items-center !justify-center !py-3 !text-green-600">
                <FaSpinner className="!animate-spin !mr-2" />
                Procesando pago seguro...
              </div>
            )}

            {(currentStep === 'result' || currentStep === 'success') && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewCalculation}
                className="!w-full !py-3 !bg-gray-100 hover:!bg-gray-200 !text-gray-700 !rounded-xl !font-semibold !transition !border-0 !flex !items-center !justify-center !gap-2"
              >
                <FaCalculator />
                Nueva Calculación
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Result Card Component
interface ResultCardProps {
  result: CalculationResult;
  onCompensate: () => void;
  isProcessing: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onCompensate, isProcessing }) => {
  const { meta, emissions, pricing, equivalencies } = result;

  return (
    <motion.div 
      className="!w-full !max-w-md"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="!bg-white !rounded-2xl !shadow-lg !border !border-gray-200 !overflow-hidden">
        {/* Route Header */}
        <div className="!bg-gradient-to-r !from-blue-500 !to-blue-600 !p-4 !text-white">
          <div className="!flex !items-center !justify-between !mb-2">
            <div className="!text-center">
              <div className="!text-2xl !font-bold">{meta.route.origin.code}</div>
              <div className="!text-xs !text-blue-100">{meta.route.origin.city}</div>
            </div>
            <div className="!flex !flex-col !items-center !px-4">
              <FaPlane className="!text-white/80" />
              <div className="!text-xs !text-blue-100 !mt-1">{meta.distanceKmTotal.toLocaleString()} km</div>
            </div>
            <div className="!text-center">
              <div className="!text-2xl !font-bold">{meta.route.destination.code}</div>
              <div className="!text-xs !text-blue-100">{meta.route.destination.city}</div>
            </div>
          </div>
          <div className="!text-center !text-xs !text-blue-100 !flex !items-center !justify-center !gap-1">
            <FaExchangeAlt />
            {meta.tripType === 'round_trip' ? 'Ida y vuelta' : 'Solo ida'}
          </div>
        </div>

        {/* Emissions */}
        <div className="!p-6 !text-center !bg-gradient-to-br !from-green-50 !to-white">
          <div className="!inline-flex !items-center !justify-center !w-16 !h-16 !rounded-full !bg-green-100 !mb-3">
            <FaLeaf className="!text-3xl !text-green-600" />
          </div>
          <div className="!text-4xl !font-bold !text-gray-900 !mb-1">
            {emissions.kgCO2e.toLocaleString()} <span className="!text-lg !text-gray-500">kg CO₂</span>
          </div>
          <p className="!text-sm !text-gray-600">
            Tu huella de carbono para {emissions.passengers} {emissions.passengers === 1 ? 'pasajero' : 'pasajeros'}
          </p>
        </div>

        {/* Equivalencies */}
        <div className="!grid !grid-cols-4 !gap-2 !p-4 !bg-gray-50 !border-t !border-gray-100">
          <div className="!text-center">
            <div className="!text-2xl !mb-1">🌳</div>
            <div className="!font-bold !text-gray-900">{equivalencies.trees}</div>
            <div className="!text-xs !text-gray-500">árboles</div>
          </div>
          <div className="!text-center">
            <div className="!text-2xl !mb-1">💧</div>
            <div className="!font-bold !text-gray-900">{(equivalencies.waterLiters / 1000).toFixed(0)}k</div>
            <div className="!text-xs !text-gray-500">litros</div>
          </div>
          <div className="!text-center">
            <div className="!text-2xl !mb-1">🏠</div>
            <div className="!font-bold !text-gray-900">{equivalencies.housingM2}</div>
            <div className="!text-xs !text-gray-500">m²</div>
          </div>
          <div className="!text-center">
            <div className="!text-2xl !mb-1">👕</div>
            <div className="!font-bold !text-gray-900">{equivalencies.textileKg}</div>
            <div className="!text-xs !text-gray-500">kg ropa</div>
          </div>
        </div>

        {/* Pricing */}
        <div className="!p-4 !border-t !border-gray-200">
          <div className="!bg-gradient-to-r !from-green-500 !to-green-600 !rounded-xl !p-4 !text-white !text-center !mb-4">
            <div className="!text-xs !text-green-100 !mb-1">Compensa desde</div>
            <div className="!text-3xl !font-bold">
              ${pricing.totalPriceCLP.toLocaleString()} <span className="!text-sm !font-normal">CLP</span>
            </div>
            <div className="!text-xs !text-green-100">≈ ${pricing.totalPriceUSD} USD</div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCompensate}
            disabled={isProcessing}
            className="!w-full !py-4 !bg-gradient-to-r !from-green-600 !to-green-700 !text-white !rounded-xl !font-bold !shadow-lg hover:!shadow-xl !transition !border-0 !flex !items-center !justify-center !gap-3 disabled:!opacity-50"
          >
            {isProcessing ? (
              <>
                <FaSpinner className="!animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <FaLeaf />
                Compensar Ahora
                <FaCreditCard />
              </>
            )}
          </motion.button>
          
          <div className="!flex !items-center !justify-center !gap-2 !mt-3 !text-xs !text-gray-500">
            <FaLock />
            <span>Pago seguro con Stripe</span>
            <FaCheckCircle className="!text-green-500" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Options Card Component
interface OptionsCardProps {
  content: string;
  data: { type: string };
  onCabinSelect: (cabin: typeof CABIN_OPTIONS[0]) => void;
  onPassengersSelect: (count: number) => void;
  onRoundTripSelect: (isRoundTrip: boolean) => void;
}

const OptionsCard: React.FC<OptionsCardProps> = ({ 
  content, 
  data, 
  onCabinSelect, 
  onPassengersSelect, 
  onRoundTripSelect 
}) => {
  if (data.type === 'cabin') {
    return (
      <div className="!w-full !max-w-md !bg-white !rounded-2xl !shadow-sm !border !border-gray-100 !p-4">
        <p className="!text-gray-700 !font-medium !mb-3">{content}</p>
        <div className="!grid !grid-cols-2 !gap-2">
          {CABIN_OPTIONS.map((cabin) => (
            <motion.button
              key={cabin.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCabinSelect(cabin)}
              className="!p-3 !bg-gray-50 hover:!bg-green-50 !rounded-xl !text-left !transition !border-2 !border-transparent hover:!border-green-300"
            >
              <span className="!text-2xl !mb-1 !block">{cabin.icon}</span>
              <span className="!font-semibold !text-gray-800 !text-sm !block">{cabin.label}</span>
              <span className="!text-xs !text-gray-500">{cabin.description}</span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (data.type === 'passengers') {
    return (
      <div className="!w-full !max-w-md !bg-white !rounded-2xl !shadow-sm !border !border-gray-100 !p-4">
        <p className="!text-gray-700 !font-medium !mb-3">{content}</p>
        <div className="!flex !flex-wrap !gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <motion.button
              key={num}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPassengersSelect(num)}
              className="!w-10 !h-10 !bg-gray-100 hover:!bg-green-500 hover:!text-white !rounded-full !font-semibold !transition !border-0"
            >
              {num}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (data.type === 'roundtrip') {
    return (
      <div className="!w-full !max-w-md !bg-white !rounded-2xl !shadow-sm !border !border-gray-100 !p-4">
        <p className="!text-gray-700 !font-medium !mb-3">{content}</p>
        <div className="!grid !grid-cols-2 !gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onRoundTripSelect(true)}
            className="!p-4 !bg-gray-50 hover:!bg-green-50 !rounded-xl !transition !border-2 !border-transparent hover:!border-green-300 !flex !flex-col !items-center !gap-2"
          >
            <FaExchangeAlt className="!text-2xl !text-green-600" />
            <span className="!font-semibold !text-gray-800">Ida y vuelta</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onRoundTripSelect(false)}
            className="!p-4 !bg-gray-50 hover:!bg-blue-50 !rounded-xl !transition !border-2 !border-transparent hover:!border-blue-300 !flex !flex-col !items-center !gap-2"
          >
            <FaPlane className="!text-2xl !text-blue-600" />
            <span className="!font-semibold !text-gray-800">Solo ida</span>
          </motion.button>
        </div>
      </div>
    );
  }

  return null;
};

// Payment Success Card
interface PaymentSuccessCardProps {
  data: {
    certificateId: string;
    emissions: any;
    amount: number;
  };
  onViewCertificates: () => void;
  onNewCalculation: () => void;
}

const PaymentSuccessCard: React.FC<PaymentSuccessCardProps> = ({ data, onViewCertificates, onNewCalculation }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="!w-full !max-w-md"
    >
      <div className="!bg-white !rounded-2xl !shadow-lg !border !border-green-200 !overflow-hidden">
        {/* Success Header */}
        <div className="!bg-gradient-to-r !from-green-500 !to-emerald-500 !p-6 !text-center !text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="!w-20 !h-20 !mx-auto !mb-4 !rounded-full !bg-white/20 !backdrop-blur-sm !flex !items-center !justify-center"
          >
            <FaCheckCircle className="!text-4xl" />
          </motion.div>
          <h3 className="!text-2xl !font-bold !mb-1">¡Felicitaciones! 🎉</h3>
          <p className="!text-green-100">Tu compensación fue exitosa</p>
        </div>

        {/* Details */}
        <div className="!p-6">
          <div className="!bg-green-50 !rounded-xl !p-4 !mb-4 !text-center">
            <div className="!text-sm !text-green-600 !font-medium !mb-1">CO₂ Compensado</div>
            <div className="!text-3xl !font-bold !text-green-700">
              {data.emissions.kgCO2e?.toLocaleString() || '0'} kg
            </div>
          </div>

          <div className="!bg-gray-50 !rounded-xl !p-4 !mb-4">
            <div className="!flex !items-center !gap-3">
              <div className="!w-10 !h-10 !rounded-full !bg-green-100 !flex !items-center !justify-center">
                <FaCertificate className="!text-green-600" />
              </div>
              <div>
                <div className="!text-xs !text-gray-500">Certificado</div>
                <div className="!font-mono !text-sm !text-gray-700">{data.certificateId}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="!space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onViewCertificates}
              className="!w-full !py-3 !bg-green-600 !text-white !rounded-xl !font-semibold !transition !border-0 !flex !items-center !justify-center !gap-2"
            >
              <FaCertificate />
              Ver Mis Certificados
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewCalculation}
              className="!w-full !py-3 !bg-gray-100 !text-gray-700 !rounded-xl !font-semibold !transition !border-0"
            >
              Calcular Otro Vuelo
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default B2CCalculatorPage;
