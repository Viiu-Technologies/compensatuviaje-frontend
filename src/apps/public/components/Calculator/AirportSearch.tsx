import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaPlane, FaTimes, FaSpinner } from 'react-icons/fa';
import './AirportSearch.css';

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

interface AirportSearchProps {
  onSelect: (airport: Airport) => void;
  placeholder?: string;
}

const AirportSearch: React.FC<AirportSearchProps> = ({ 
  onSelect, 
  placeholder = "Buscar aeropuerto..." 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(
            `http://localhost:3001/api/public/airports/search?q=${encodeURIComponent(query)}`
          );
          
          if (!response.ok) {
            throw new Error('Error al buscar aeropuertos');
          }
          
          const data = await response.json();
          setResults(data.airports || data || []);
          setIsOpen(true);
        } catch (err) {
          console.error('Error searching airports:', err);
          setError('No se pudieron cargar los aeropuertos');
          // Fallback to common airports for demo
          setResults(getFallbackAirports(query));
          setIsOpen(true);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (airport: Airport) => {
    onSelect(airport);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="airport-search-container" ref={containerRef}>
      <div className="airport-search-input-wrapper">
        <FaSearch className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="airport-search-input"
          autoComplete="off"
        />
        {isLoading && <FaSpinner className="loading-spinner" />}
        {query && !isLoading && (
          <button className="clear-button" onClick={handleClear}>
            <FaTimes />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            className="airport-search-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {results.map((airport, index) => (
              <motion.button
                key={`${airport.code}-${index}`}
                className="airport-search-item"
                onClick={() => handleSelect(airport)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
              >
                <div className="airport-icon">
                  <FaPlane />
                </div>
                <div className="airport-info">
                  <div className="airport-main">
                    <span className="airport-code">{airport.code}</span>
                    <span className="airport-name">{airport.name}</span>
                  </div>
                  <div className="airport-location">
                    <FaMapMarkerAlt />
                    <span>{airport.city}, {airport.country}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {isOpen && results.length === 0 && query.length >= 2 && !isLoading && (
          <motion.div
            className="airport-search-dropdown no-results"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <p>No se encontraron aeropuertos para "{query}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Fallback airports for demo/testing when backend is unavailable
function getFallbackAirports(query: string): Airport[] {
  const allAirports: Airport[] = [
    { code: 'SCL', name: 'Arturo Merino Benítez', city: 'Santiago', country: 'Chile' },
    { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'Estados Unidos' },
    { code: 'JFK', name: 'John F. Kennedy', city: 'Nueva York', country: 'Estados Unidos' },
    { code: 'LAX', name: 'Los Angeles International', city: 'Los Ángeles', country: 'Estados Unidos' },
    { code: 'LHR', name: 'Heathrow', city: 'Londres', country: 'Reino Unido' },
    { code: 'CDG', name: 'Charles de Gaulle', city: 'París', country: 'Francia' },
    { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'España' },
    { code: 'BCN', name: 'El Prat', city: 'Barcelona', country: 'España' },
    { code: 'GRU', name: 'Guarulhos', city: 'São Paulo', country: 'Brasil' },
    { code: 'EZE', name: 'Ministro Pistarini', city: 'Buenos Aires', country: 'Argentina' },
    { code: 'BOG', name: 'El Dorado', city: 'Bogotá', country: 'Colombia' },
    { code: 'LIM', name: 'Jorge Chávez', city: 'Lima', country: 'Perú' },
    { code: 'MEX', name: 'Benito Juárez', city: 'Ciudad de México', country: 'México' },
    { code: 'CUN', name: 'Internacional de Cancún', city: 'Cancún', country: 'México' },
    { code: 'PTY', name: 'Tocumen', city: 'Ciudad de Panamá', country: 'Panamá' },
    { code: 'SYD', name: 'Kingsford Smith', city: 'Sídney', country: 'Australia' },
    { code: 'NRT', name: 'Narita', city: 'Tokio', country: 'Japón' },
    { code: 'DXB', name: 'Dubai International', city: 'Dubái', country: 'Emiratos Árabes' },
    { code: 'SIN', name: 'Changi', city: 'Singapur', country: 'Singapur' },
    { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Alemania' }
  ];

  const lowerQuery = query.toLowerCase();
  return allAirports.filter(airport =>
    airport.code.toLowerCase().includes(lowerQuery) ||
    airport.city.toLowerCase().includes(lowerQuery) ||
    airport.country.toLowerCase().includes(lowerQuery) ||
    airport.name.toLowerCase().includes(lowerQuery)
  ).slice(0, 6);
}

export default AirportSearch;
