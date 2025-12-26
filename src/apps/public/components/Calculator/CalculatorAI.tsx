import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FaCheckCircle
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import AirportSearch from './AirportSearch';
import './CalculatorAI.css';

// Types
interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

interface Message {
  id: string;
  type: 'bot' | 'user' | 'result' | 'options';
  content: string;
  data?: any;
  timestamp: Date;
}

const API_URL = import.meta.env.VITE_API_URL;

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

type Step = 'welcome' | 'origin' | 'destination' | 'cabin' | 'passengers' | 'roundtrip' | 'calculating' | 'result';

const CABIN_OPTIONS = [
  { value: 'economy', label: 'Económica', icon: '💺', description: 'Clase estándar' },
  { value: 'premium_economy', label: 'Premium Economy', icon: '🛋️', description: 'Más espacio' },
  { value: 'business', label: 'Business', icon: '💼', description: 'Clase ejecutiva' },
  { value: 'first', label: 'Primera Clase', icon: '👑', description: 'Máximo confort' }
];

const CalculatorAI: React.FC = () => {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    setTimeout(() => {
      addBotMessage(
        '¡Hola! 👋 Soy tu asistente de huella de carbono. Te ayudaré a calcular las emisiones de CO₂ de tu vuelo y cómo puedes compensarlas.',
        'welcome'
      );
      setTimeout(() => {
        addBotMessage(
          '¿Desde qué ciudad o aeropuerto saldrás? Puedes escribir el nombre de la ciudad o el código IATA (ej: SCL, Santiago, Miami).',
          'origin'
        );
        setCurrentStep('origin');
      }, 1500);
    }, 500);
  }, []);

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
    }, 800);
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
        `Perfecto, saldrás desde ${airport.city}, ${airport.country} ✈️. ¿Cuál es tu destino?`,
        'destination'
      );
    }, 500);
  };

  const handleDestinationSelect = (airport: Airport) => {
    setFormData(prev => ({ ...prev, destination: airport }));
    addUserMessage(`${airport.city} (${airport.code})`);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `options-cabin-${Date.now()}`,
        type: 'options',
        content: '¿En qué clase de cabina viajarás?',
        data: { type: 'cabin' },
        timestamp: new Date()
      }]);
      setCurrentStep('cabin');
    }, 500);
  };

  const handleCabinSelect = (cabin: typeof CABIN_OPTIONS[0]) => {
    setFormData(prev => ({ ...prev, cabinCode: cabin.value }));
    addUserMessage(`${cabin.icon} ${cabin.label}`);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `options-passengers-${Date.now()}`,
        type: 'options',
        content: '¿Cuántos pasajeros viajan?',
        data: { type: 'passengers' },
        timestamp: new Date()
      }]);
      setCurrentStep('passengers');
    }, 500);
  };

  const handlePassengersSelect = (count: number) => {
    setFormData(prev => ({ ...prev, passengers: count }));
    addUserMessage(`${count} ${count === 1 ? 'pasajero' : 'pasajeros'}`);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `options-roundtrip-${Date.now()}`,
        type: 'options',
        content: '¿Es un viaje de ida y vuelta?',
        data: { type: 'roundtrip' },
        timestamp: new Date()
      }]);
      setCurrentStep('roundtrip');
    }, 500);
  };

  const handleRoundTripSelect = async (isRoundTrip: boolean) => {
    setFormData(prev => ({ ...prev, roundTrip: isRoundTrip }));
    addUserMessage(isRoundTrip ? '✈️ Ida y vuelta' : '✈️ Solo ida');
    
    // Calculate emissions
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
        }, 1500);
      } else {
        addBotMessage('Hubo un error al calcular. Por favor, intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error:', error);
      addBotMessage('No pude conectar con el servidor. ¿Está corriendo el backend?');
    }
  };

  const handleCompensate = () => {
    addUserMessage('Quiero compensar mis emisiones 🌱');
    setTimeout(() => {
      addBotMessage(
        '¡Excelente decisión! 🌿 Te redirigiremos al proceso de pago seguro para compensar tus emisiones con proyectos certificados en Chile y América Latina.'
      );
    }, 500);
  };

  const handleNewCalculation = () => {
    setMessages([]);
    setFormData({
      origin: null,
      destination: null,
      cabinCode: '',
      passengers: 1,
      roundTrip: true
    });
    setResult(null);
    setCurrentStep('welcome');
    
    setTimeout(() => {
      addBotMessage(
        '¡Perfecto! Empecemos de nuevo. ¿Desde qué ciudad o aeropuerto saldrás?',
        'origin'
      );
    }, 500);
  };

  return (
    <div className="calculator-ai-container">
      {/* Header */}
      <div className="calculator-ai-header">
        <div className="ai-avatar">
          <FaRobot className="ai-icon" />
          <span className="ai-status"></span>
        </div>
        <div className="ai-info">
          <h3>Asistente de Huella de Carbono</h3>
          <p>Siempre disponible para ayudarte</p>
        </div>
        <motion.div 
          className="ai-badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <HiSparkles />
          <span>IA</span>
        </motion.div>
      </div>

      {/* Chat Messages */}
      <div className="calculator-ai-chat" ref={chatContainerRef}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`message ${message.type}`}
            >
              {message.type === 'bot' && (
                <div className="message-avatar bot-avatar">
                  <FaRobot />
                </div>
              )}
              
              {message.type === 'user' && (
                <div className="message-avatar user-avatar">
                  <FaUser />
                </div>
              )}

              {message.type === 'result' && message.data ? (
                <ResultCard result={message.data} onCompensate={handleCompensate} onNewCalculation={handleNewCalculation} />
              ) : message.type === 'options' && message.data ? (
                <OptionsCard 
                  content={message.content}
                  data={message.data}
                  onCabinSelect={handleCabinSelect}
                  onPassengersSelect={handlePassengersSelect}
                  onRoundTripSelect={handleRoundTripSelect}
                />
              ) : (
                <div className="message-content">
                  <p>{message.content}</p>
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
            className="message bot typing"
          >
            <div className="message-avatar bot-avatar">
              <FaRobot />
            </div>
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="calculator-ai-input">
        {currentStep === 'origin' && (
          <AirportSearch 
            onSelect={handleOriginSelect}
            placeholder="Buscar aeropuerto de origen..."
          />
        )}
        
        {currentStep === 'destination' && (
          <AirportSearch 
            onSelect={handleDestinationSelect}
            placeholder="Buscar aeropuerto de destino..."
          />
        )}

        {(currentStep === 'cabin' || currentStep === 'passengers' || currentStep === 'roundtrip') && (
          <div className="input-disabled">
            <FaCalculator />
            <span>Selecciona una opción arriba</span>
          </div>
        )}

        {currentStep === 'calculating' && (
          <div className="input-disabled calculating">
            <FaSpinner className="spin" />
            <span>Calculando emisiones...</span>
          </div>
        )}

        {currentStep === 'result' && (
          <div className="input-actions">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-new-calc"
              onClick={handleNewCalculation}
            >
              <FaCalculator />
              Nueva Calculación
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

// Result Card Component
interface ResultCardProps {
  result: CalculationResult;
  onCompensate: () => void;
  onNewCalculation: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onCompensate, onNewCalculation }) => {
  const { meta, emissions, pricing, equivalencies } = result;

  return (
    <motion.div 
      className="result-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Route Header */}
      <div className="result-header">
        <div className="route-display">
          <div className="airport">
            <span className="code">{meta.route.origin.code}</span>
            <span className="city">{meta.route.origin.city}</span>
          </div>
          <div className="route-line">
            <FaPlane className="plane-icon" />
            <span className="distance">{meta.distanceKmTotal.toLocaleString()} km</span>
          </div>
          <div className="airport">
            <span className="code">{meta.route.destination.code}</span>
            <span className="city">{meta.route.destination.city}</span>
          </div>
        </div>
        <div className="trip-type">
          <FaExchangeAlt />
          <span>{meta.tripType === 'round_trip' ? 'Ida y vuelta' : 'Solo ida'}</span>
        </div>
      </div>

      {/* Emissions Display */}
      <div className="emissions-display">
        <div className="emissions-main">
          <FaLeaf className="leaf-icon" />
          <div className="emissions-value">
            <span className="number">{emissions.kgCO2e.toLocaleString()}</span>
            <span className="unit">kg CO₂</span>
          </div>
        </div>
        <p className="emissions-subtitle">
          Tu huella de carbono para {emissions.passengers} {emissions.passengers === 1 ? 'pasajero' : 'pasajeros'}
        </p>
      </div>

      {/* Equivalencies */}
      <div className="equivalencies-grid">
        <div className="equiv-item">
          <FaTree className="equiv-icon trees" />
          <span className="equiv-value">{equivalencies.trees}</span>
          <span className="equiv-label">árboles/año</span>
        </div>
        <div className="equiv-item">
          <FaWater className="equiv-icon water" />
          <span className="equiv-value">{equivalencies.waterLiters.toLocaleString()}</span>
          <span className="equiv-label">litros agua</span>
        </div>
        <div className="equiv-item">
          <FaHome className="equiv-icon home" />
          <span className="equiv-value">{equivalencies.housingM2}</span>
          <span className="equiv-label">m² vivienda</span>
        </div>
        <div className="equiv-item">
          <FaTshirt className="equiv-icon textile" />
          <span className="equiv-value">{equivalencies.textileKg}</span>
          <span className="equiv-label">kg textil</span>
        </div>
      </div>

      {/* Pricing */}
      <div className="pricing-section">
        <div className="price-card">
          <span className="price-label">Compensar desde</span>
          <div className="price-value">
            <span className="currency">$</span>
            <span className="amount">{pricing.totalPriceCLP.toLocaleString()}</span>
            <span className="currency-code">CLP</span>
          </div>
          <span className="price-usd">≈ ${pricing.totalPriceUSD} USD</span>
        </div>
      </div>

      {/* CTA */}
      <motion.button
        className="compensate-btn"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCompensate}
      >
        <FaLeaf />
        Compensar Ahora
        <FaCreditCard />
      </motion.button>

      <p className="cta-subtitle">
        <FaCheckCircle /> Proyectos certificados Gold Standard y VCS
      </p>
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
      <div className="options-card">
        <p className="options-question">{content}</p>
        <div className="cabin-options">
          {CABIN_OPTIONS.map((cabin) => (
            <motion.button
              key={cabin.value}
              className="cabin-option"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCabinSelect(cabin)}
            >
              <span className="cabin-icon">{cabin.icon}</span>
              <span className="cabin-label">{cabin.label}</span>
              <span className="cabin-desc">{cabin.description}</span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (data.type === 'passengers') {
    return (
      <div className="options-card">
        <p className="options-question">{content}</p>
        <div className="passengers-options">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <motion.button
              key={num}
              className="passenger-option"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPassengersSelect(num)}
            >
              {num}
            </motion.button>
          ))}
        </div>
        <p className="options-hint">
          <FaUsers /> Más de 10 pasajeros? <a href="#contacto">Contáctanos</a>
        </p>
      </div>
    );
  }

  if (data.type === 'roundtrip') {
    return (
      <div className="options-card">
        <p className="options-question">{content}</p>
        <div className="roundtrip-options">
          <motion.button
            className="roundtrip-option"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onRoundTripSelect(true)}
          >
            <FaExchangeAlt />
            <span>Ida y vuelta</span>
          </motion.button>
          <motion.button
            className="roundtrip-option"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onRoundTripSelect(false)}
          >
            <FaPlane />
            <span>Solo ida</span>
          </motion.button>
        </div>
      </div>
    );
  }

  return null;
};

export default CalculatorAI;
