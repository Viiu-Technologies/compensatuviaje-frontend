import React, { useState } from 'react';
import './CarbonCalculatorModal.css';

const CarbonCalculatorModal = ({ isOpen, onClose }) => {
  const [carbonData, setCarbonData] = useState({
    transportType: 'plane',
    distance: '',
    passengers: 1
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCarbonData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateCarbon = async () => {
    if (!carbonData.distance) {
      alert('Por favor ingresa la distancia del viaje');
      return;
    }

    setLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/calculate-carbon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carbonData)
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        alert('Error al calcular la huella de carbono');
      }
    } catch (error) {
      // Fallback calculation for demo
      const emissionFactors = {
        plane: 0.255,
        car: 0.192,
        bus: 0.089,
        train: 0.041
      };
      
      const factor = emissionFactors[carbonData.transportType] || 0.2;
      const totalEmissions = (carbonData.distance * factor) / carbonData.passengers;
      const compensationCost = totalEmissions * 25;
      
      setResult({
        emissions: Math.round(totalEmissions * 100) / 100,
        cost: Math.round(compensationCost * 100) / 100,
        trees: Math.round(totalEmissions / 22),
        transportType: carbonData.transportType,
        distance: carbonData.distance,
        passengers: carbonData.passengers
      });
    }
    
    setLoading(false);
  };

  const resetCalculator = () => {
    setCarbonData({
      transportType: 'plane',
      distance: '',
      passengers: 1
    });
    setResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🌱 Calculadora de Huella de Carbono</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="calculator-intro">
            <p>Calcula el impacto ambiental de tu viaje y descubre cómo compensarlo</p>
          </div>

          <div className="calculator-form">
            <div className="form-row">
              <div className="form-group">
                <label>🚀 Tipo de transporte:</label>
                <select 
                  name="transportType" 
                  value={carbonData.transportType}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="plane">✈️ Avión</option>
                  <option value="car">🚗 Automóvil</option>
                  <option value="bus">🚌 Autobús</option>
                  <option value="train">🚆 Tren</option>
                </select>
              </div>

              <div className="form-group">
                <label>📏 Distancia (km):</label>
                <input
                  type="number"
                  name="distance"
                  value={carbonData.distance}
                  onChange={handleInputChange}
                  placeholder="Ej: 500"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>👥 Número de pasajeros:</label>
                <input
                  type="number"
                  name="passengers"
                  value={carbonData.passengers}
                  onChange={handleInputChange}
                  min="1"
                  className="form-input"
                />
              </div>
            </div>

            <div className="calculator-actions">
              <button 
                className="btn btn-primary calculator-btn"
                onClick={calculateCarbon}
                disabled={loading}
              >
                {loading ? '⏳ Calculando...' : '🧮 Calcular Huella de Carbono'}
              </button>
              
              <button 
                className="btn btn-outline reset-btn"
                onClick={resetCalculator}
              >
                🔄 Limpiar
              </button>
            </div>
          </div>

          {result && (
            <div className="calculation-result">
              <h3>📊 Resultado de tu huella de carbono:</h3>
              
              <div className="result-summary">
                <div className="result-main">
                  <span className="result-number">{result.emissions}</span>
                  <span className="result-unit">kg CO₂</span>
                  <span className="result-label">Emisiones generadas</span>
                </div>
              </div>

              <div className="result-stats">
                <div className="stat">
                  <span className="stat-icon">💰</span>
                  <span className="stat-number">${result.cost}</span>
                  <span className="stat-label">Costo compensación</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">🌳</span>
                  <span className="stat-number">{result.trees}</span>
                  <span className="stat-label">Árboles equivalentes</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">🚀</span>
                  <span className="stat-number">{result.distance}</span>
                  <span className="stat-label">km viajados</span>
                </div>
              </div>

              <div className="compensation-actions">
                <button className="btn btn-primary compensation-btn">
                  🌍 Compensar Ahora
                </button>
                <button className="btn btn-outline share-btn">
                  📤 Compartir Resultado
                </button>
              </div>

              <div className="result-info">
                <p>💡 <strong>¿Sabías que?</strong> Compensar tu huella de carbono ayuda a financiar proyectos de reforestación y energías renovables que contribuyen a un planeta más sostenible.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarbonCalculatorModal;