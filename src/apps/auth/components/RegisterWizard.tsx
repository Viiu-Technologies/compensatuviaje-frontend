import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import './Register.css';

const RegisterWizard = () => {
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
  const [validationErrors, setValidationErrors] = useState({});
  
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
      // El backend espera: { adminUser: {...}, ...companyData }
      const companyData = {
        razonSocial: formData.companyName,
        rut: formData.rut,
        tipoEmpresa: formData.businessType,
        nombreComercial: formData.tradeName || formData.companyName,
        sitioWeb: formData.website || '',
        representanteLegal: {
          nombre: formData.legalRepName,
          rut: formData.legalRepRut
        },
        datosContacto: {
          email: formData.contactEmail || formData.email,
          telefono: formData.phone,
          region: formData.region,
          ciudad: formData.city,
          direccion: formData.address
        },
        datosOperacionales: {
          industria: formData.industry,
          numeroEmpleados: parseInt(formData.employeeCount) || 0,
          ingresosAnuales: parseInt(formData.annualRevenue) || 0,
          descripcion: formData.description || '',
          areasInteres: formData.interests || []
        }
      };

      const adminUser = {
        nombre: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password
      };

      // Registrar empresa con usuario admin
      const response = await register(companyData, adminUser);
      
      if (response.success) {
        // Mostrar mensaje de éxito y próximos pasos
        alert(`¡Registro exitoso! 
        
Empresa: ${response.data.company.razonSocial}
        
Próximos pasos:
${response.data.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Por favor, inicia sesión con tu email y contraseña.`);
        
        // Redirigir al login
        navigate('/login');
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      alert(`Error en el registro: ${errorMsg}`);
      console.error('Error en registro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizado por paso
  const renderStep1 = () => (
    <div className="wizard-step">
      <h2>Información Personal</h2>
      <p className="step-description">Ingresa tus datos básicos para crear tu cuenta</p>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">Nombre *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Juan"
            className={validationErrors.firstName ? 'error' : ''}
          />
          {validationErrors.firstName && (
            <span className="field-error">{validationErrors.firstName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Apellido *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Pérez"
            className={validationErrors.lastName ? 'error' : ''}
          />
          {validationErrors.lastName && (
            <span className="field-error">{validationErrors.lastName}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">Correo Electrónico *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="tu@email.com"
          className={validationErrors.email ? 'error' : ''}
        />
        {validationErrors.email && (
          <span className="field-error">{validationErrors.email}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="password">Contraseña *</label>
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={validationErrors.password ? 'error' : ''}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {validationErrors.password && (
            <span className="field-error">{validationErrors.password}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className={validationErrors.confirmPassword ? 'error' : ''}
          />
          {validationErrors.confirmPassword && (
            <span className="field-error">{validationErrors.confirmPassword}</span>
          )}
        </div>
      </div>

      <div className="form-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
          />
          <span>
            Acepto los{' '}
            <Link to="/terms" target="_blank">términos y condiciones</Link>
          </span>
        </label>
        {validationErrors.acceptTerms && (
          <span className="field-error">{validationErrors.acceptTerms}</span>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="wizard-step">
      <h2>Información de la Empresa</h2>
      <p className="step-description">Ingresa los datos de tu empresa</p>

      <div className="form-group">
        <label htmlFor="companyName">Razón Social *</label>
        <input
          type="text"
          id="companyName"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Empresa SpA"
          className={validationErrors.companyName ? 'error' : ''}
        />
        {validationErrors.companyName && (
          <span className="field-error">{validationErrors.companyName}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="rut">RUT Empresa *</label>
          <input
            type="text"
            id="rut"
            name="rut"
            value={formData.rut}
            onChange={handleRUTChange}
            placeholder="12.345.678-9"
            className={validationErrors.rut ? 'error' : ''}
          />
          {validationErrors.rut && (
            <span className="field-error">{validationErrors.rut}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="businessType">Tipo de Empresa *</label>
          <select
            id="businessType"
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            className={validationErrors.businessType ? 'error' : ''}
          >
            <option value="">Seleccione...</option>
            {businessTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
          {validationErrors.businessType && (
            <span className="field-error">{validationErrors.businessType}</span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="tradeName">Nombre de Fantasía (opcional)</label>
          <input
            type="text"
            id="tradeName"
            name="tradeName"
            value={formData.tradeName}
            onChange={handleChange}
            placeholder="Mi Empresa"
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
    </div>
  );

  const renderStep3 = () => (
    <div className="wizard-step">
      <h2>Información de Contacto</h2>
      <p className="step-description">Datos del representante legal y ubicación</p>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="legalRepName">Nombre Representante Legal *</label>
          <input
            type="text"
            id="legalRepName"
            name="legalRepName"
            value={formData.legalRepName}
            onChange={handleChange}
            placeholder="Juan Pérez"
            className={validationErrors.legalRepName ? 'error' : ''}
          />
          {validationErrors.legalRepName && (
            <span className="field-error">{validationErrors.legalRepName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="legalRepRut">RUT Representante *</label>
          <input
            type="text"
            id="legalRepRut"
            name="legalRepRut"
            value={formData.legalRepRut}
            onChange={handleRUTChange}
            placeholder="12.345.678-9"
            className={validationErrors.legalRepRut ? 'error' : ''}
          />
          {validationErrors.legalRepRut && (
            <span className="field-error">{validationErrors.legalRepRut}</span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="contactEmail">Email de Contacto *</label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="contacto@empresa.cl"
            className={validationErrors.contactEmail ? 'error' : ''}
          />
          {validationErrors.contactEmail && (
            <span className="field-error">{validationErrors.contactEmail}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Teléfono *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+56 9 1234 5678"
            className={validationErrors.phone ? 'error' : ''}
          />
          {validationErrors.phone && (
            <span className="field-error">{validationErrors.phone}</span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="region">Región *</label>
          <select
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            className={validationErrors.region ? 'error' : ''}
          >
            <option value="">Seleccione...</option>
            {chileanRegions.map((region, index) => (
              <option key={index} value={region}>{region}</option>
            ))}
          </select>
          {validationErrors.region && (
            <span className="field-error">{validationErrors.region}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="city">Ciudad *</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Santiago"
            className={validationErrors.city ? 'error' : ''}
          />
          {validationErrors.city && (
            <span className="field-error">{validationErrors.city}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="address">Dirección *</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Av. Providencia 1234, Oficina 567"
          className={validationErrors.address ? 'error' : ''}
        />
        {validationErrors.address && (
          <span className="field-error">{validationErrors.address}</span>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="wizard-step">
      <h2>Información Operacional</h2>
      <p className="step-description">Detalles sobre tu empresa</p>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="industry">Sector Económico *</label>
          <select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className={validationErrors.industry ? 'error' : ''}
          >
            <option value="">Seleccione...</option>
            {industries.map((ind, index) => (
              <option key={index} value={ind}>{ind}</option>
            ))}
          </select>
          {validationErrors.industry && (
            <span className="field-error">{validationErrors.industry}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="employeeCount">Número de Empleados *</label>
          <select
            id="employeeCount"
            name="employeeCount"
            value={formData.employeeCount}
            onChange={handleChange}
            className={validationErrors.employeeCount ? 'error' : ''}
          >
            <option value="">Seleccione...</option>
            {employeeRanges.map((range, index) => (
              <option key={index} value={range}>{range}</option>
            ))}
          </select>
          {validationErrors.employeeCount && (
            <span className="field-error">{validationErrors.employeeCount}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="annualRevenue">Facturación Anual (UF) *</label>
        <select
          id="annualRevenue"
          name="annualRevenue"
          value={formData.annualRevenue}
          onChange={handleChange}
          className={validationErrors.annualRevenue ? 'error' : ''}
        >
          <option value="">Seleccione...</option>
          {revenueRanges.map((range, index) => (
            <option key={index} value={range}>{range}</option>
          ))}
        </select>
        {validationErrors.annualRevenue && (
          <span className="field-error">{validationErrors.annualRevenue}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción de Actividades *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe brevemente las actividades principales de tu empresa..."
          rows={4}
          maxLength={500}
          className={validationErrors.description ? 'error' : ''}
        />
        <span className="char-count">{formData.description.length}/500</span>
        {validationErrors.description && (
          <span className="field-error">{validationErrors.description}</span>
        )}
      </div>

      <div className="form-group">
        <label>¿Qué te interesa compensar? *</label>
        <div className="checkbox-group-list">
          {interestOptions.map((interest, index) => (
            <label key={index} className="checkbox-label">
              <input
                type="checkbox"
                name="interests"
                value={interest}
                checked={formData.interests.includes(interest)}
                onChange={handleChange}
              />
              <span>{interest}</span>
            </label>
          ))}
        </div>
        {validationErrors.interests && (
          <span className="field-error">{validationErrors.interests}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="register-container">
      <div className="register-wizard">
        <div className="wizard-header">
          <Link to="/" className="back-to-home">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver al inicio
          </Link>
          <h1>Crear Cuenta</h1>
          <p>Paso {currentStep} de {totalSteps}</p>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {error && (
          <div className="error-message">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <div className="wizard-actions">
            {currentStep > 1 && (
              <button 
                type="button" 
                onClick={handlePrevious} 
                className="btn-previous"
                disabled={isLoading}
              >
                ← Anterior
              </button>
            )}
            
            <div style={{ flex: 1 }} />

            {currentStep < totalSteps ? (
              <button 
                type="submit" 
                className="btn-next"
                disabled={isLoading}
              >
                Siguiente →
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn-submit"
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
            )}
          </div>
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

export default RegisterWizard;
