import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import '../../auth/components/Register.css';

const OnboardingEdit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Regiones de Chile
  const regions = [
    'Región de Arica y Parinacota',
    'Región de Tarapacá',
    'Región de Antofagasta',
    'Región de Atacama',
    'Región de Coquimbo',
    'Región de Valparaíso',
    'Región Metropolitana de Santiago',
    'Región del Libertador General Bernardo O\'Higgins',
    'Región del Maule',
    'Región de Ñuble',
    'Región del Biobío',
    'Región de La Araucanía',
    'Región de Los Ríos',
    'Región de Los Lagos',
    'Región de Aysén del General Carlos Ibáñez del Campo',
    'Región de Magallanes y de la Antártica Chilena'
  ];

  const businessTypes = [
    'Empresa Individual',
    'Sociedad de Responsabilidad Limitada (SRL)',
    'Sociedad Anónima (SA)',
    'Sociedad por Acciones (SpA)',
    'Otro'
  ];

  const industries = [
    'Tecnología',
    'Salud',
    'Educación',
    'Manufactura',
    'Retail',
    'Servicios Financieros',
    'Construcción',
    'Turismo y Hospitalidad',
    'Transporte y Logística',
    'Agricultura',
    'Energía',
    'Telecomunicaciones',
    'Otro'
  ];

  const employeeRanges = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '500+'
  ];

  const revenueRanges = [
    'Menos de $50M',
    '$50M - $200M',
    '$200M - $1.000M',
    '$1.000M - $5.000M',
    'Más de $5.000M'
  ];

  const [formData, setFormData] = useState({
    // Paso 1: Información de la Empresa
    companyName: '',
    rut: '',
    businessType: '',
    tradeName: '',
    website: '',
    
    // Paso 2: Información de Contacto
    legalRepName: '',
    legalRepRut: '',
    contactEmail: '',
    phone: '',
    region: '',
    city: '',
    address: '',
    
    // Paso 3: Información Operacional
    industry: '',
    employeeCount: '',
    annualRevenue: '',
    description: '',
    interests: []
  });

  // Cargar datos existentes al montar el componente
  useEffect(() => {
    const savedData = localStorage.getItem(`onboarding_${user?.email}`);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prevData => ({
          ...prevData,
          ...parsedData
        }));
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    }
  }, [user]);

  // Formatear RUT chileno
  const formatRUT = (value) => {
    // Remover todo excepto números y k
    const cleaned = value.replace(/[^0-9kK]/g, '');
    
    if (cleaned.length <= 1) return cleaned;
    
    // Separar dígito verificador
    const dv = cleaned.slice(-1);
    const numbers = cleaned.slice(0, -1);
    
    // Formatear con puntos
    const formatted = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${formatted}-${dv}`;
  };

  const handleRUTChange = (e) => {
    const { name, value } = e.target;
    const formatted = formatRUT(value);
    setFormData(prev => ({
      ...prev,
      [name]: formatted
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'interests') {
      const interestValue = e.target.value;
      setFormData(prev => ({
        ...prev,
        interests: checked
          ? [...prev.interests, interestValue]
          : prev.interests.filter(i => i !== interestValue)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.companyName.trim()) newErrors.companyName = 'La razón social es requerida';
      if (!formData.rut.trim()) newErrors.rut = 'El RUT es requerido';
      if (!formData.businessType) newErrors.businessType = 'El tipo de empresa es requerido';
    }

    if (step === 2) {
      if (!formData.legalRepName.trim()) newErrors.legalRepName = 'El nombre del representante es requerido';
      if (!formData.legalRepRut.trim()) newErrors.legalRepRut = 'El RUT del representante es requerido';
      if (!formData.contactEmail.trim()) {
        newErrors.contactEmail = 'El email es requerido';
      } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Email inválido';
      }
      if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
      if (!formData.region) newErrors.region = 'La región es requerida';
      if (!formData.city.trim()) newErrors.city = 'La ciudad es requerida';
      if (!formData.address.trim()) newErrors.address = 'La dirección es requerida';
    }

    if (step === 3) {
      if (!formData.industry) newErrors.industry = 'La industria es requerida';
      if (!formData.employeeCount) newErrors.employeeCount = 'El rango de empleados es requerido';
      if (!formData.annualRevenue) newErrors.annualRevenue = 'La facturación anual es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);

    try {
      // Guardar en localStorage
      localStorage.setItem(`onboarding_${user?.email}`, JSON.stringify(formData));
      
      // Aquí iría la llamada al backend cuando esté listo
      // await axios.put('/api/onboarding/update', formData);

      alert('✅ Información actualizada correctamente');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert('❌ Error al actualizar la información');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="wizard-step">
      <h2>Información de la Empresa</h2>
      <p className="step-description">Actualiza los datos básicos de tu empresa</p>

      <div className="form-group">
        <label htmlFor="companyName">Razón Social *</label>
        <input
          type="text"
          id="companyName"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          className={errors.companyName ? 'error' : ''}
          placeholder="Ej: Compensa tu Viaje SpA"
        />
        {errors.companyName && <span className="error-message">{errors.companyName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="rut">RUT de la Empresa *</label>
        <input
          type="text"
          id="rut"
          name="rut"
          value={formData.rut}
          onChange={handleRUTChange}
          className={errors.rut ? 'error' : ''}
          placeholder="Ej: 12.345.678-9"
          maxLength="12"
        />
        {errors.rut && <span className="error-message">{errors.rut}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="businessType">Tipo de Empresa *</label>
        <select
          id="businessType"
          name="businessType"
          value={formData.businessType}
          onChange={handleChange}
          className={errors.businessType ? 'error' : ''}
        >
          <option value="">Selecciona un tipo</option>
          {businessTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {errors.businessType && <span className="error-message">{errors.businessType}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="tradeName">Nombre Comercial (opcional)</label>
        <input
          type="text"
          id="tradeName"
          name="tradeName"
          value={formData.tradeName}
          onChange={handleChange}
          placeholder="Ej: Compensa tu Viaje"
        />
      </div>

      <div className="form-group">
        <label htmlFor="website">Sitio Web (opcional)</label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://www.ejemplo.cl"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="wizard-step">
      <h2>Información de Contacto</h2>
      <p className="step-description">Actualiza los datos de contacto de tu empresa</p>

      <div className="form-group">
        <label htmlFor="legalRepName">Nombre del Representante Legal *</label>
        <input
          type="text"
          id="legalRepName"
          name="legalRepName"
          value={formData.legalRepName}
          onChange={handleChange}
          className={errors.legalRepName ? 'error' : ''}
          placeholder="Ej: Juan Pérez González"
        />
        {errors.legalRepName && <span className="error-message">{errors.legalRepName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="legalRepRut">RUT del Representante Legal *</label>
        <input
          type="text"
          id="legalRepRut"
          name="legalRepRut"
          value={formData.legalRepRut}
          onChange={handleRUTChange}
          className={errors.legalRepRut ? 'error' : ''}
          placeholder="Ej: 12.345.678-9"
          maxLength="12"
        />
        {errors.legalRepRut && <span className="error-message">{errors.legalRepRut}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="contactEmail">Email de Contacto *</label>
        <input
          type="email"
          id="contactEmail"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleChange}
          className={errors.contactEmail ? 'error' : ''}
          placeholder="contacto@empresa.cl"
        />
        {errors.contactEmail && <span className="error-message">{errors.contactEmail}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Teléfono *</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={errors.phone ? 'error' : ''}
          placeholder="+56 9 1234 5678"
        />
        {errors.phone && <span className="error-message">{errors.phone}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="region">Región *</label>
        <select
          id="region"
          name="region"
          value={formData.region}
          onChange={handleChange}
          className={errors.region ? 'error' : ''}
        >
          <option value="">Selecciona una región</option>
          {regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
        {errors.region && <span className="error-message">{errors.region}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="city">Ciudad *</label>
        <input
          type="text"
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          className={errors.city ? 'error' : ''}
          placeholder="Ej: Santiago"
        />
        {errors.city && <span className="error-message">{errors.city}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="address">Dirección *</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={errors.address ? 'error' : ''}
          placeholder="Ej: Av. Providencia 1234, Oficina 567"
        />
        {errors.address && <span className="error-message">{errors.address}</span>}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="wizard-step">
      <h2>Información Operacional</h2>
      <p className="step-description">Actualiza la información operativa de tu empresa</p>

      <div className="form-group">
        <label htmlFor="industry">Industria *</label>
        <select
          id="industry"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          className={errors.industry ? 'error' : ''}
        >
          <option value="">Selecciona una industria</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
        {errors.industry && <span className="error-message">{errors.industry}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="employeeCount">Número de Empleados *</label>
        <select
          id="employeeCount"
          name="employeeCount"
          value={formData.employeeCount}
          onChange={handleChange}
          className={errors.employeeCount ? 'error' : ''}
        >
          <option value="">Selecciona un rango</option>
          {employeeRanges.map(range => (
            <option key={range} value={range}>{range} empleados</option>
          ))}
        </select>
        {errors.employeeCount && <span className="error-message">{errors.employeeCount}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="annualRevenue">Facturación Anual *</label>
        <select
          id="annualRevenue"
          name="annualRevenue"
          value={formData.annualRevenue}
          onChange={handleChange}
          className={errors.annualRevenue ? 'error' : ''}
        >
          <option value="">Selecciona un rango</option>
          {revenueRanges.map(range => (
            <option key={range} value={range}>{range}</option>
          ))}
        </select>
        {errors.annualRevenue && <span className="error-message">{errors.annualRevenue}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción de la Empresa (opcional)</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          placeholder="Describe brevemente las actividades principales de tu empresa..."
          maxLength="500"
        />
        <span className="char-count">{formData.description.length}/500 caracteres</span>
      </div>

      <div className="form-group">
        <label>¿Qué tipo de compensaciones te interesan?</label>
        <div className="checkbox-group-list">
          {[
            { value: 'viajes_aereos', label: 'Viajes aéreos corporativos' },
            { value: 'flota_vehiculos', label: 'Flota de vehículos' },
            { value: 'eventos', label: 'Eventos y conferencias' },
            { value: 'logistica', label: 'Operaciones logísticas' },
            { value: 'energia', label: 'Consumo energético' },
            { value: 'otros', label: 'Otros' }
          ].map(interest => (
            <label key={interest.value} className="checkbox-label">
              <input
                type="checkbox"
                name="interests"
                value={interest.value}
                checked={formData.interests.includes(interest.value)}
                onChange={handleChange}
              />
              <span>{interest.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="register-container">
      <div className="register-wizard">
        <div className="wizard-header">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="back-to-home"
          >
            ← Volver al Dashboard
          </button>
          <h1>Editar Información</h1>
          <p>Paso {currentStep} de 3</p>
        </div>

        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div className="wizard-actions">
            <button
              type="button"
              onClick={handlePrevious}
              className="btn-previous"
              disabled={currentStep === 1}
            >
              ← Anterior
            </button>
            
            <div style={{ flex: 1 }}></div>
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-next"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios ✓'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingEdit;
