import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plane, Wind, Users, CreditCard, Loader2, AlertCircle } from "lucide-react";
import type { FlightStepProps } from "../types";
import airportService, { Airport } from "../../../services/airportService";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const FlightStep: React.FC<FlightStepProps> = ({ register, watch, errors, setValue, onNext }) => {
  const origin = watch("origin");
  const destination = watch("destination");
  const aircraftType = watch("aircraftType");
  
  // States para búsqueda de aeropuertos
  const [originSearch, setOriginSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [originSuggestions, setOriginSuggestions] = useState<Airport[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Airport[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [loadingOrigin, setLoadingOrigin] = useState(false);
  const [loadingDestination, setLoadingDestination] = useState(false);
  
  // Selecciones de aeropuertos
  const [selectedOrigin, setSelectedOrigin] = useState<Airport | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Airport | null>(null);
  const [distance, setDistance] = useState(0);

  // Debounced search terms
  const debouncedOrigin = useDebounce(originSearch, 300);
  const debouncedDestination = useDebounce(destinationSearch, 300);

  // Buscar aeropuertos de origen
  useEffect(() => {
    if (debouncedOrigin.length >= 2 && !selectedOrigin) {
      setLoadingOrigin(true);
      airportService.searchAirports(debouncedOrigin, 8)
        .then(results => {
          setOriginSuggestions(results);
          setShowOriginSuggestions(true);
        })
        .finally(() => setLoadingOrigin(false));
    } else if (debouncedOrigin.length < 2) {
      setOriginSuggestions([]);
    }
  }, [debouncedOrigin, selectedOrigin]);

  // Buscar aeropuertos de destino
  useEffect(() => {
    if (debouncedDestination.length >= 2 && !selectedDestination) {
      setLoadingDestination(true);
      airportService.searchAirports(debouncedDestination, 8)
        .then(results => {
          setDestinationSuggestions(results);
          setShowDestinationSuggestions(true);
        })
        .finally(() => setLoadingDestination(false));
    } else if (debouncedDestination.length < 2) {
      setDestinationSuggestions([]);
    }
  }, [debouncedDestination, selectedDestination]);

  // Calcular distancia cuando se seleccionan ambos aeropuertos
  useEffect(() => {
    if (selectedOrigin && selectedDestination) {
      const R = 6371; // Radio de la Tierra en km
      const dLat = (selectedDestination.lat - selectedOrigin.lat) * Math.PI / 180;
      const dLon = (selectedDestination.lon - selectedOrigin.lon) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(selectedOrigin.lat * Math.PI / 180) * Math.cos(selectedDestination.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const calculatedDistance = R * c;
      
      // Animación de distancia
      let start = 0;
      const end = Math.round(calculatedDistance);
      const duration = 800;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        setDistance(Math.floor(start + (end - start) * ease));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [selectedOrigin, selectedDestination]);

  const handleSelectOrigin = (airport: Airport) => {
    setSelectedOrigin(airport);
    setOriginSearch(airport.label || `${airport.city} (${airport.code})`);
    setValue("origin", airport.code, { shouldValidate: true });
    setShowOriginSuggestions(false);
  };

  const handleSelectDestination = (airport: Airport) => {
    setSelectedDestination(airport);
    setDestinationSearch(airport.label || `${airport.city} (${airport.code})`);
    setValue("destination", airport.code, { shouldValidate: true });
    setShowDestinationSuggestions(false);
  };

  const handleOriginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOriginSearch(value);
    if (selectedOrigin && value !== (selectedOrigin.label || `${selectedOrigin.city} (${selectedOrigin.code})`)) {
      setSelectedOrigin(null);
      setValue("origin", "", { shouldValidate: false });
    }
  };

  const handleDestinationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestinationSearch(value);
    if (selectedDestination && value !== (selectedDestination.label || `${selectedDestination.city} (${selectedDestination.code})`)) {
      setSelectedDestination(null);
      setValue("destination", "", { shouldValidate: false });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="!space-y-8"
    >
      <div className="!grid md:!grid-cols-2 !gap-6">
        <div className="!space-y-6">
          {/* Origin Input */}
          <div className="!relative !group">
            <label className="!block !text-sm !font-medium !text-gray-700 !mb-2 !flex !items-center !gap-2">
              <MapPin size={16} className="!text-green-600" /> Origen
            </label>
            <div className="!relative">
              <input
                type="text"
                value={originSearch}
                onChange={handleOriginInputChange}
                onFocus={() => originSuggestions.length > 0 && setShowOriginSuggestions(true)}
                onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
                className={`!w-full !px-4 !py-3 !rounded-xl !border-2 !bg-white/50 !backdrop-blur-sm !transition-all !duration-300 !outline-none ${
                  errors.origin 
                    ? "!border-red-400 !bg-red-50" 
                    : selectedOrigin
                      ? "!border-green-500 !bg-green-50/50"
                      : "!border-gray-200 focus:!border-emerald-500 focus:!ring-4 focus:!ring-emerald-500/10"
                }`}
                placeholder="Buscar ciudad o código IATA..."
                autoComplete="off"
              />
              {loadingOrigin && (
                <Loader2 className="!absolute !right-3 !top-1/2 !-translate-y-1/2 !w-5 !h-5 !text-gray-400 !animate-spin" />
              )}
            </div>
            {/* Hidden input for form */}
            <input type="hidden" {...register("origin", { required: "El origen es requerido" })} />

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {showOriginSuggestions && originSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  className="!absolute !top-full !left-0 !right-0 !mt-2 !bg-white !rounded-xl !shadow-xl !border !border-gray-100 !overflow-hidden !z-20 !max-h-64 !overflow-y-auto"
                >
                  {originSuggestions.map((airport) => (
                    <div
                      key={airport.id || airport.code}
                      onClick={() => handleSelectOrigin(airport)}
                      className="!p-3 !text-sm !text-gray-600 hover:!bg-green-50 !cursor-pointer !transition-colors !flex !items-center !gap-3 !border-b !border-gray-50 last:!border-0"
                    >
                      <div className="!w-10 !h-10 !rounded-lg !bg-green-100 !flex !items-center !justify-center !text-green-600 !font-bold !text-xs">
                        {airport.code}
                      </div>
                      <div>
                        <p className="!font-medium !text-gray-800">{airport.city}</p>
                        <p className="!text-xs !text-gray-500">{airport.country} • {airport.name}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {errors.origin && (
              <p className="!text-red-500 !text-xs !mt-1 !flex !items-center !gap-1">
                <AlertCircle size={12} /> {errors.origin.message as string}
              </p>
            )}
          </div>

          {/* Destination Input */}
          <div className="!relative">
            <label className="!block !text-sm !font-medium !text-gray-700 !mb-2 !flex !items-center !gap-2">
              <MapPin size={16} className="!text-orange-500" /> Destino
            </label>
            <div className="!relative">
              <input
                type="text"
                value={destinationSearch}
                onChange={handleDestinationInputChange}
                onFocus={() => destinationSuggestions.length > 0 && setShowDestinationSuggestions(true)}
                onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
                className={`!w-full !px-4 !py-3 !rounded-xl !border-2 !bg-white/50 !backdrop-blur-sm !transition-all !duration-300 !outline-none ${
                  errors.destination 
                    ? "!border-red-400 !bg-red-50" 
                    : selectedDestination
                      ? "!border-green-500 !bg-green-50/50"
                      : "!border-gray-200 focus:!border-emerald-500 focus:!ring-4 focus:!ring-emerald-500/10"
                }`}
                placeholder="Buscar ciudad o código IATA..."
                autoComplete="off"
              />
              {loadingDestination && (
                <Loader2 className="!absolute !right-3 !top-1/2 !-translate-y-1/2 !w-5 !h-5 !text-gray-400 !animate-spin" />
              )}
            </div>
            {/* Hidden input for form */}
            <input type="hidden" {...register("destination", { required: "El destino es requerido" })} />

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  className="!absolute !top-full !left-0 !right-0 !mt-2 !bg-white !rounded-xl !shadow-xl !border !border-gray-100 !overflow-hidden !z-20 !max-h-64 !overflow-y-auto"
                >
                  {destinationSuggestions.map((airport) => (
                    <div
                      key={airport.id || airport.code}
                      onClick={() => handleSelectDestination(airport)}
                      className="!p-3 !text-sm !text-gray-600 hover:!bg-orange-50 !cursor-pointer !transition-colors !flex !items-center !gap-3 !border-b !border-gray-50 last:!border-0"
                    >
                      <div className="!w-10 !h-10 !rounded-lg !bg-orange-100 !flex !items-center !justify-center !text-orange-600 !font-bold !text-xs">
                        {airport.code}
                      </div>
                      <div>
                        <p className="!font-medium !text-gray-800">{airport.city}</p>
                        <p className="!text-xs !text-gray-500">{airport.country} • {airport.name}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {errors.destination && (
              <p className="!text-red-500 !text-xs !mt-1 !flex !items-center !gap-1">
                <AlertCircle size={12} /> {errors.destination.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Visual Map Representation */}
        <div className="!relative !h-48 md:!h-auto !bg-emerald-50/50 !rounded-2xl !border !border-emerald-200/50 !flex !items-center !justify-center !overflow-hidden">
          {selectedOrigin && selectedDestination ? (
            <div className="!text-center !p-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="!mb-2"
              >
                <Plane className="!w-12 !h-12 !text-green-600 !mx-auto" />
              </motion.div>
              <div className="!text-3xl !font-bold !text-gray-900">
                {distance.toLocaleString()} <span className="!text-sm !font-normal !text-gray-500">km</span>
              </div>
              <p className="!text-xs !text-green-600 !mt-1">Distancia calculada</p>
              <div className="!mt-3 !flex !items-center !justify-center !gap-2 !text-xs !text-gray-500">
                <span className="!font-bold !text-green-600">{selectedOrigin.code}</span>
                <span>→</span>
                <span className="!font-bold !text-orange-600">{selectedDestination.code}</span>
              </div>
            </div>
          ) : (
            <div className="!text-gray-400 !text-sm !flex !flex-col !items-center">
              <Wind className="!mb-2 !opacity-50" />
              Selecciona origen y destino
            </div>
          )}
          
          {/* Decorative dashed line */}
          <svg className="!absolute !inset-0 !w-full !h-full !pointer-events-none !opacity-20">
            <path d="M 20 100 Q 150 20 280 100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" className="!text-gray-600" />
          </svg>
        </div>
      </div>

      {/* Flight Class Selection */}
      <div className="!space-y-4">
        <label className="!block !text-sm !font-medium !text-gray-700">Clase de Vuelo</label>
        <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-4">
          {[
            { id: "economy", label: "Económica", icon: Users, factor: "1x", desc: "Menor huella" },
            { id: "business", label: "Business", icon: CreditCard, factor: "2.5x", desc: "Mayor espacio" },
            { id: "first", label: "Primera", icon: Plane, factor: "4x", desc: "Máximo confort" },
          ].map((type) => (
            <label
              key={type.id}
              className={`!relative !flex !flex-col !items-center !p-4 !rounded-xl !border-2 !cursor-pointer !transition-all !duration-300 hover:!shadow-lg hover:!-translate-y-1 ${
                aircraftType === type.id 
                  ? "!border-green-500 !bg-green-50" 
                  : "!border-gray-100 !bg-white hover:!border-green-300"
              }`}
            >
              <input
                type="radio"
                value={type.id}
                {...register("aircraftType")}
                className="!sr-only"
              />
              <type.icon className={`!w-8 !h-8 !mb-3 !transition-colors ${
                aircraftType === type.id ? "!text-green-600" : "!text-gray-400"
              }`} />
              <span className="!font-medium !text-gray-800">{type.label}</span>
              <span className="!text-xs !text-gray-500 !mt-1">Emisiones {type.factor}</span>
              
              {aircraftType === type.id && (
                <motion.div
                  className="!absolute !inset-0 !border-2 !border-green-500 !rounded-xl !pointer-events-none"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Continue Button */}
      <motion.button
        type="button"
        onClick={onNext}
        disabled={!selectedOrigin || !selectedDestination}
        className={`!w-full !py-4 !rounded-xl !font-semibold !text-lg !transition-all !duration-300 !border-0 !flex !items-center !justify-center !gap-2 ${
          selectedOrigin && selectedDestination
            ? "!bg-gradient-to-r !from-green-500 !to-emerald-600 hover:!from-green-600 hover:!to-emerald-700 !text-white !shadow-lg !shadow-green-500/30"
            : "!bg-gray-200 !text-gray-400 !cursor-not-allowed"
        }`}
        whileHover={selectedOrigin && selectedDestination ? { scale: 1.02 } : {}}
        whileTap={selectedOrigin && selectedDestination ? { scale: 0.98 } : {}}
      >
        Continuar al Proyecto
        <Plane className="!w-5 !h-5" />
      </motion.button>
    </motion.div>
  );
};
