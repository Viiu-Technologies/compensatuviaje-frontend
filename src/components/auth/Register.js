import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import onboardingService from '../../services/onboarding/onboardingService';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Paso 1: Datos personales
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    
    // Paso 2: Información de la Empresa
    companyName: '',
    rut: '',
    businessType: '',
    tradeName: '',
    website: '',
    
    // Paso 3: Información de Contacto
    legalRepName: '',
    legalRepRut: '',
    contactEmail: '',
    phone: '',
    region: '',
    city: '',
    address: '',
    
    // Paso 4: Información Operacional
    industry: '',
    employeeCount: '',
    annualRevenue: '',
    description: '',
    interests: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const totalSteps = 4;

  // Opciones para los select
  const businessTypes = [
    'Sociedad Anónima (S.A.)',
    'Sociedad de Responsabilidad Limitada (Ltda.)',
    'Empresa Individual de Responsabilidad Limitada (E.I.R.L.)',
    'Sociedad por Acciones (SpA)',
    'Otro'
  ];

  const industries = [
    'Agricultura y ganadería',
    'Minería',
    'Manufactura',
    'Construcción',
    'Comercio',
    'Transporte y logística',
    'Servicios financieros',
    'Tecnología y telecomunicaciones',
    'Turismo y hotelería',
    'Salud',
    'Educación',
    'Energía',
    'Otro'
  ];

  const employeeRanges = [
    '1-10 empleados (Microempresa)',
    '11-50 empleados (Pequeña)',
    '51-200 empleados (Mediana)',
    '201-1000 empleados (Grande)',
    'Más de 1000 empleados (Corporación)'
  ];

  const revenueRanges = [
    'Menos de 2.400 UF',
    '2.400 - 25.000 UF',
    '25.000 - 100.000 UF',
    '100.000 - 600.000 UF',
    'Más de 600.000 UF'
  ];

  const chileanRegions = [
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

  const interestOptions = [
    'Viajes corporativos',
    'Transporte de mercancías',
    'Consumo energético de oficinas',
    'Eventos empresariales',
    'Producción/manufactura',
    'Otros'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'interests') {
      setFormData(prev => ({
        ...prev,
        interests: checked
          ? [...prev.interests, value]
          : prev.interests.filter(i => i !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    clearError();
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatRUT = (value) => {
    const cleaned = value.replace(/[^0-9kK]/g, '');
    if (cleaned.length <= 1) return cleaned;
    
    const rut = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);
    
    const formatted = rut.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formatted}-${dv}`;
  };

  const handleRUTChange = (e) => {
    const { name, value } = e.target;
    const formatted = formatRUT(value);
    setFormData(prev => ({
      ...prev,
      [name]: formatted
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) errors.firstName = 'El nombre es requerido';
      if (!formData.lastName.trim()) errors.lastName = 'El apellido es requerido';
      if (!formData.email.trim()) {
        errors.email = 'El email es requerido';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Email inválido';
      }
      if (!formData.password) {
        errors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        errors.password = 'Mínimo 6 caracteres';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
      if (!formData.acceptTerms) {
        errors.acceptTerms = 'Debes aceptar los términos';
      }
    }

    if (step === 2) {
      if (!formData.companyName.trim()) errors.companyName = 'Razón social requerida';
      if (!formData.rut.trim()) errors.rut = 'RUT requerido';
      if (!formData.businessType) errors.businessType = 'Tipo de empresa requerido';
    }

    if (step === 3) {
      if (!formData.legalRepName.trim()) errors.legalRepName = 'Nombre del representante requerido';
      if (!formData.legalRepRut.trim()) errors.legalRepRut = 'RUT del representante requerido';
      if (!formData.contactEmail.trim()) {
        errors.contactEmail = 'Email de contacto requerido';
      } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
        errors.contactEmail = 'Email inválido';
      }
      if (!formData.phone.trim()) errors.phone = 'Teléfono requerido';
      if (!formData.region) errors.region = 'Región requerida';
      if (!formData.city.trim()) errors.city = 'Ciudad requerida';
      if (!formData.address.trim()) errors.address = 'Dirección requerida';
    }

    if (step === 4) {
      if (!formData.industry) errors.industry = 'Sector económico requerido';
      if (!formData.employeeCount) errors.employeeCount = 'Número de empleados requerido';
      if (!formData.annualRevenue) errors.annualRevenue = 'Facturación requerida';
      if (!formData.description.trim()) errors.description = 'Descripción requerida';
      if (formData.interests.length === 0) errors.interests = 'Selecciona al menos un interés';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);

    try {
      // Primero registrar el usuario
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      };
      
      await register(userData);
      
      // Luego guardar la información de onboarding
      const onboardingData = {
        companyInfo: {
          companyName: formData.companyName,
          rut: formData.rut,
          businessType: formData.businessType,
          tradeName: formData.tradeName,
          website: formData.website,
        },
        contactInfo: {
          legalRepName: formData.legalRepName,
          legalRepRut: formData.legalRepRut,
          email: formData.contactEmail,
          phone: formData.phone,
          region: formData.region,
          city: formData.city,
          address: formData.address,
        },
        operationalInfo: {
          industry: formData.industry,
          employeeCount: formData.employeeCount,
          annualRevenue: formData.annualRevenue,
          description: formData.description,
          interests: formData.interests,
        }
      };
      
      // Guardar en localStorage temporalmente (luego se enviará al backend)
      localStorage.setItem('pendingOnboarding', JSON.stringify(onboardingData));
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Error en registro:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const totalSteps = 4;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    clearError();
    // Limpiar error de validación específico
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleChange = (e) => {
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <Link to="/" className="back-to-home">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver al inicio
          </Link>
          <h1>Crear Cuenta</h1>
          <p>Únete a Compensa tu Viaje</p>
        </div>

        {error && (
          <div className="error-message">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Nombre</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Juan"
                disabled={isLoading}
                className={validationErrors.firstName ? 'error' : ''}
              />
              {validationErrors.firstName && (
                <span className="field-error">{validationErrors.firstName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Apellido</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Pérez"
                disabled={isLoading}
                className={validationErrors.lastName ? 'error' : ''}
              />
              {validationErrors.lastName && (
                <span className="field-error">{validationErrors.lastName}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              disabled={isLoading}
              className={validationErrors.email ? 'error' : ''}
            />
            {validationErrors.email && (
              <span className="field-error">{validationErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isLoading}
                className={validationErrors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            {validationErrors.password && (
              <span className="field-error">{validationErrors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isLoading}
              className={validationErrors.confirmPassword ? 'error' : ''}
            />
            {validationErrors.confirmPassword && (
              <span className="field-error">{validationErrors.confirmPassword}</span>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span>
                Acepto los{' '}
                <Link to="/terms" target="_blank">términos y condiciones</Link>
                {' '}y la{' '}
                <Link to="/privacy" target="_blank">política de privacidad</Link>
              </span>
            </label>
            {validationErrors.acceptTerms && (
              <span className="field-error">{validationErrors.acceptTerms}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn-register"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div className="register-footer">
          <p>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
