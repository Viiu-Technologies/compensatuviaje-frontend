import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlane, FaCar, FaBus, FaTrain, FaLeaf, FaTree, 
  FaArrowRight, FaArrowLeft, FaCheckCircle, FaMapMarkerAlt 
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import CountUp from 'react-countup';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CarbonCalculatorNew = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    transportType: 'plane',
    from: '',
    to: '',
    distance: '',
    passengers: 1,
    flightClass: 'economy'
  });
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // Transport options
  const transports = [
    { id: 'plane', name: 'Avión', icon: FaPlane, color: 'primary', factor: 0.255 },
    { id: 'car', name: 'Auto', icon: FaCar, color: 'secondary', factor: 0.192 },
    { id: 'bus', name: 'Bus', icon: FaBus, color: 'accent', factor: 0.089 },
    { id: 'train', name: 'Tren', icon: FaTrain, color: 'success', factor: 0.041 },
  ];

  const flightClasses = [
    { id: 'economy', name: 'Económica', multiplier: 1 },
    { id: 'premium', name: 'Premium Economy', multiplier: 1.6 },
    { id: 'business', name: 'Business', multiplier: 2.6 },
    { id: 'first', name: 'Primera Clase', multiplier: 4 },
  ];

  const calculateEmissions = () => {
    setCalculating(true);
    
    // Simulate API call
    setTimeout(() => {
      const transport = transports.find(t => t.id === formData.transportType);
      const flightClass = flightClasses.find(f => f.id === formData.flightClass);
      
      let emissions = formData.distance * transport.factor;
      
      // Apply flight class multiplier for planes
      if (formData.transportType === 'plane') {
        emissions *= flightClass.multiplier;
      }
      
      // Divide by passengers
      emissions = emissions / formData.passengers;
      
      const cost = Math.round(emissions * 15990); // ~$15,990 CLP per ton CO2
      const trees = Math.round(emissions / 0.022); // 22kg CO2 per tree/year
      
      const comparison = transports.map(t => ({
        name: t.name,
        value: Math.round(formData.distance * t.factor),
      }));

      setResult({
        emissions: Math.round(emissions * 100) / 100,
        cost: Math.round(cost * 100) / 100,
        trees,
        comparison,
        transport: transport.name
      });
      
      setCalculating(false);
      setStep(4);
    }, 1500);
  };

  const resetCalculator = () => {
    setStep(1);
    setFormData({
      transportType: 'plane',
      from: '',
      to: '',
      distance: '',
      passengers: 1,
      flightClass: 'economy'
    });
    setResult(null);
  };

  if (!isOpen) return null;

  const COLORS = ['#22c55e', '#3b82f6', '#d97706', '#10b981'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="gradient-primary p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                  <FaLeaf className="text-4xl" />
                  Calculadora de Huella de Carbono
                </h2>
                <p className="text-white/90">Calcula el impacto de tu viaje en 3 simples pasos</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-6 flex items-center gap-2">
              {[1, 2, 3, 4].map((i) => (
                <React.Fragment key={i}>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ 
                      scale: step >= i ? 1 : 0.8,
                      backgroundColor: step >= i ? '#ffffff' : 'rgba(255,255,255,0.3)'
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                  >
                    {step > i ? <FaCheckCircle /> : i}
                  </motion.div>
                  {i < 4 && (
                    <div className={`flex-1 h-1 rounded-full ${step > i ? 'bg-white' : 'bg-white/30'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Transport Type */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                      ¿Qué medio de transporte usarás?
                    </h3>
                    <p className="text-neutral-600">Selecciona tu modo de viaje</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {transports.map((transport) => {
                      const Icon = transport.icon;
                      const isSelected = formData.transportType === transport.id;
                      
                      return (
                        <motion.button
                          key={transport.id}
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFormData({ ...formData, transportType: transport.id })}
                          className={`p-6 rounded-2xl border-2 transition-all ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50 shadow-glow'
                              : 'border-neutral-200 hover:border-neutral-300 bg-white'
                          }`}
                        >
                          <Icon className={`text-5xl mb-3 mx-auto ${
                            isSelected ? 'text-primary-500' : 'text-neutral-400'
                          }`} />
                          <p className={`font-semibold ${
                            isSelected ? 'text-primary-700' : 'text-neutral-700'
                          }`}>
                            {transport.name}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {transport.factor} kg CO₂/km
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full btn-primary text-lg py-4"
                  >
                    Continuar
                    <FaArrowRight />
                  </button>
                </motion.div>
              )}

              {/* Step 2: Route Details */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                      Detalles de tu viaje
                    </h3>
                    <p className="text-neutral-600">Completa la información de tu ruta</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-primary-500" />
                        Desde (Ciudad de origen)
                      </label>
                      <input
                        type="text"
                        value={formData.from}
                        onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                        placeholder="Ej: Santiago, Chile"
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-secondary-500" />
                        Hasta (Ciudad de destino)
                      </label>
                      <input
                        type="text"
                        value={formData.to}
                        onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                        placeholder="Ej: Buenos Aires, Argentina"
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Distancia (kilómetros)
                      </label>
                      <input
                        type="number"
                        value={formData.distance}
                        onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                        placeholder="1200"
                        className="input"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        Puedes usar Google Maps para calcular la distancia
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Número de pasajeros
                      </label>
                      <input
                        type="number"
                        value={formData.passengers}
                        onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                        min="1"
                        className="input"
                      />
                    </div>

                    {formData.transportType === 'plane' && (
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Clase de vuelo
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {flightClasses.map((fc) => (
                            <button
                              key={fc.id}
                              onClick={() => setFormData({ ...formData, flightClass: fc.id })}
                              className={`p-3 rounded-xl border-2 transition-all text-left ${
                                formData.flightClass === fc.id
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-neutral-200 hover:border-neutral-300'
                              }`}
                            >
                              <p className="font-semibold text-sm">{fc.name}</p>
                              <p className="text-xs text-neutral-500">{fc.multiplier}x emisiones</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 btn-outline">
                      <FaArrowLeft />
                      Atrás
                    </button>
                    <button
                      onClick={() => formData.distance ? setStep(3) : alert('Ingresa la distancia')}
                      className="flex-1 btn-primary"
                    >
                      Continuar
                      <FaArrowRight />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                      Revisa tu viaje
                    </h3>
                    <p className="text-neutral-600">Confirma que la información sea correcta</p>
                  </div>

                  <div className="card p-6 space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                      <span className="text-neutral-600">Transporte:</span>
                      <span className="font-semibold text-neutral-900">
                        {transports.find(t => t.id === formData.transportType)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                      <span className="text-neutral-600">Ruta:</span>
                      <span className="font-semibold text-neutral-900">
                        {formData.from} → {formData.to}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                      <span className="text-neutral-600">Distancia:</span>
                      <span className="font-semibold text-neutral-900">
                        {formData.distance} km
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                      <span className="text-neutral-600">Pasajeros:</span>
                      <span className="font-semibold text-neutral-900">
                        {formData.passengers}
                      </span>
                    </div>
                    {formData.transportType === 'plane' && (
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600">Clase:</span>
                        <span className="font-semibold text-neutral-900">
                          {flightClasses.find(f => f.id === formData.flightClass)?.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="flex-1 btn-outline">
                      <FaArrowLeft />
                      Editar
                    </button>
                    <button
                      onClick={calculateEmissions}
                      disabled={calculating}
                      className="flex-1 btn-primary relative overflow-hidden"
                    >
                      {calculating ? (
                        <>
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          Calculando...
                        </>
                      ) : (
                        <>
                          <HiSparkles />
                          Calcular Impacto
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Results */}
              {step === 4 && result && (
                <motion.div
                  key="step4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center"
                    >
                      <FaCheckCircle className="text-5xl text-primary-500" />
                    </motion.div>
                    <h3 className="text-3xl font-bold text-neutral-900 mb-2">
                      ¡Cálculo Completado!
                    </h3>
                    <p className="text-neutral-600">Aquí está el impacto de tu viaje</p>
                  </div>

                  {/* Main Stats */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="card-glass p-6 text-center">
                      <FaLeaf className="text-4xl text-primary-500 mx-auto mb-3" />
                      <div className="text-4xl font-bold text-primary-600 mb-1">
                        <CountUp end={result.emissions} decimals={2} duration={2} />
                      </div>
                      <p className="text-neutral-600 font-medium">kg CO₂</p>
                      <p className="text-xs text-neutral-500 mt-1">Emisiones totales</p>
                    </div>

                    <div className="card-glass p-6 text-center">
                      <FaTree className="text-4xl text-green-600 mx-auto mb-3" />
                      <div className="text-4xl font-bold text-green-600 mb-1">
                        <CountUp end={result.trees} duration={2} />
                      </div>
                      <p className="text-neutral-600 font-medium">Árboles</p>
                      <p className="text-xs text-neutral-500 mt-1">Para compensar</p>
                    </div>

                    <div className="card-glass p-6 text-center gradient-primary text-white">
                      <div className="text-sm mb-2 opacity-90">Costo de compensación</div>
                      <div className="text-4xl font-bold mb-1">
                        ${result.cost.toLocaleString('es-CL')}
                      </div>
                      <p className="text-sm opacity-90">CLP</p>
                    </div>
                  </div>

                  {/* Comparison Chart */}
                  <div className="card p-6">
                    <h4 className="font-bold text-xl text-neutral-900 mb-4">
                      Comparación con otros transportes
                    </h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={result.comparison}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}kg`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {result.comparison.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* CTAs */}
                  <div className="flex gap-3">
                    <button onClick={resetCalculator} className="flex-1 btn-outline">
                      Calcular Otro Viaje
                    </button>
                    <button className="flex-1 btn-primary">
                      Compensar Ahora →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CarbonCalculatorNew;
