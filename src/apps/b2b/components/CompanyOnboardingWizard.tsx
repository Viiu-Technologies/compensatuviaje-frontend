import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import onboardingService from '../services/onboardingService';
import './CompanyOnboardingWizard.css';

const CompanyOnboardingWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    // Paso 1: Información de la Empresa
    companyName: '',
    rut: '',
    businessType: '',
    industry: '',
    employeeCount: '',
    
    // Paso 2: Información de Contacto
    contactName: '',
    contactPosition: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    region: '',
    
    // Paso 3: Información Operacional
    annualRevenue: '',
    travelFrequency: '',
    estimatedCO2: '',
    sustainabilityGoals: '',
    
    // Paso 4: Documentos
    documents: {
      businessLicense: null,
      taxId: null,
      powerOfAttorney: null,
    }
  });

  const steps = [
    { number: 1, title: 'Información Empresa', icon: '🏢' },
    { number: 2, title: 'Contacto', icon: '👤' },
    { number: 3, title: 'Operaciones', icon: '📊' },
    { number: 4, title: 'Documentos', icon: '📄' },
    { number: 5, title: 'Revisión', icon: '✓' },
  ];

  const businessTypes = [
    'Sociedad Anónima',
    'Sociedad de Responsabilidad Limitada',
    'Empresa Individual',
    'Cooperativa',
    'Corporación',
    'Fundación',
    'Otro'
  ];

  const industries = [
    'Aerolíneas y Aviación',
    'Transporte Marítimo',
    'Transporte Terrestre y Logística',
    'Minería y Energía',
    'Tecnología y SaaS',
    'Retail y E-commerce',
    'Manufactura e Industria',
    'Construcción e Inmobiliaria',
    'Hotelería y Turismo',
    'Servicios Financieros',
    'Salud y Farmacéutica',
    'Educación',
    'Alimentación y Agricultura',
    'Telecomunicaciones',
    'Gobierno y Sector Público',
    'Consultoría y Servicios Profesionales',
    'Otra'
  ];

  const employeeRanges = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+'
  ];

  const revenueRanges = [
    'Menos de $10M',
    '$10M - $50M',
    '$50M - $100M',
    '$100M - $500M',
    'Más de $500M'
  ];

  const travelFrequencies = [
    'Diaria',
    'Semanal',
    'Mensual',
    'Trimestral',
    'Anual',
    'Ocasional'
  ];

  const chileanRegions = [
    'Región de Arica y Parinacota',
    'Región de Tarapacá',
    'Región de Antofagasta',
    'Región de Atacama',
    'Región de Coquimbo',
    'Región de Valparaíso',
    'Región Metropolitana',
    'Región del Libertador General Bernardo O\'Higgins',
    'Región del Maule',
    'Región de Ñuble',
    'Región del Biobío',
    'Región de La Araucanía',
    'Región de Los Ríos',
    'Región de Los Lagos',
    'Región de Aysén',
    'Región de Magallanes'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRUTChange = (e) => {
    const value = e.target.value;
    const formatted = onboardingService.formatRUT(value);
    setFormData(prev => ({
      ...prev,
      rut: formatted
    }));
    // Limpiar error
    if (errors.rut) {
      setErrors(prev => ({
        ...prev,
        rut: ''
      }));
    }
  };

  const handleFileChange = (e, documentType) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [documentType]: 'El archivo no debe superar los 5MB'
        }));
        return;
      }
      
      // Validar tipo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [documentType]: 'Solo se permiten archivos PDF, JPG o PNG'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentType]: file
        }
      }));

      // Limpiar error
      if (errors[documentType]) {
        setErrors(prev => ({
          ...prev,
          [documentType]: ''
        }));
      }
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.companyName.trim()) {
          newErrors.companyName = 'El nombre de la empresa es requerido';
        }
        if (!formData.rut.trim()) {
          newErrors.rut = 'El RUT es requerido';
        } else if (!onboardingService.validateRUT(formData.rut)) {
          newErrors.rut = 'RUT inválido';
        }
        if (!formData.businessType) {
          newErrors.businessType = 'Seleccione el tipo de empresa';
        }
        if (!formData.industry) {
          newErrors.industry = 'Seleccione la industria';
        }
        if (!formData.employeeCount) {
          newErrors.employeeCount = 'Seleccione el número de empleados';
        }
        break;

      case 2:
        if (!formData.contactName.trim()) {
          newErrors.contactName = 'El nombre del contacto es requerido';
        }
        if (!formData.contactPosition.trim()) {
          newErrors.contactPosition = 'El cargo es requerido';
        }
        if (!formData.contactEmail.trim()) {
          newErrors.contactEmail = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
          newErrors.contactEmail = 'Email inválido';
        }
        if (!formData.contactPhone.trim()) {
          newErrors.contactPhone = 'El teléfono es requerido';
        }
        if (!formData.address.trim()) {
          newErrors.address = 'La dirección es requerida';
        }
        if (!formData.city.trim()) {
          newErrors.city = 'La ciudad es requerida';
        }
        if (!formData.region) {
          newErrors.region = 'Seleccione la región';
        }
        break;

      case 3:
        if (!formData.annualRevenue) {
          newErrors.annualRevenue = 'Seleccione el rango de ingresos';
        }
        if (!formData.travelFrequency) {
          newErrors.travelFrequency = 'Seleccione la frecuencia de viajes';
        }
        if (!formData.sustainabilityGoals.trim()) {
          newErrors.sustainabilityGoals = 'Describa sus objetivos de sustentabilidad';
        }
        break;

      case 4:
        if (!formData.documents.businessLicense) {
          newErrors.businessLicense = 'La licencia comercial es requerida';
        }
        if (!formData.documents.taxId) {
          newErrors.taxId = 'El certificado de RUT es requerido';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Aquí se enviaría la información al backend
      const result = await onboardingService.createCompanyOnboarding(formData);
      console.log('Onboarding creado:', result);
      
      // Redirigir al dashboard de onboarding
      navigate('/onboarding/status');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2>Información de la Empresa</h2>
            <p className="step-description">Ingrese la información básica de su empresa</p>

            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="companyName">
                  Razón Social <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Empresa SpA"
                  className={errors.companyName ? 'error' : ''}
                />
                {errors.companyName && <span className="field-error">{errors.companyName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="rut">
                  RUT Empresa <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="rut"
                  name="rut"
                  value={formData.rut}
                  onChange={handleRUTChange}
                  placeholder="12.345.678-9"
                  maxLength="12"
                  className={errors.rut ? 'error' : ''}
                />
                {errors.rut && <span className="field-error">{errors.rut}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="businessType">
                  Tipo de Empresa <span className="required">*</span>
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className={errors.businessType ? 'error' : ''}
                >
                  <option value="">Seleccione...</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.businessType && <span className="field-error">{errors.businessType}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="industry">
                  Industria <span className="required">*</span>
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className={errors.industry ? 'error' : ''}
                >
                  <option value="">Seleccione...</option>
                  {industries.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                {errors.industry && <span className="field-error">{errors.industry}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="employeeCount">
                  Número de Empleados <span className="required">*</span>
                </label>
                <select
                  id="employeeCount"
                  name="employeeCount"
                  value={formData.employeeCount}
                  onChange={handleChange}
                  className={errors.employeeCount ? 'error' : ''}
                >
                  <option value="">Seleccione...</option>
                  {employeeRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
                {errors.employeeCount && <span className="field-error">{errors.employeeCount}</span>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2>Información de Contacto</h2>
            <p className="step-description">Datos del representante legal o contacto principal</p>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="contactName">
                  Nombre Completo <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  className={errors.contactName ? 'error' : ''}
                />
                {errors.contactName && <span className="field-error">{errors.contactName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="contactPosition">
                  Cargo <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="contactPosition"
                  name="contactPosition"
                  value={formData.contactPosition}
                  onChange={handleChange}
                  placeholder="Gerente General"
                  className={errors.contactPosition ? 'error' : ''}
                />
                {errors.contactPosition && <span className="field-error">{errors.contactPosition}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="contactEmail">
                  Email Corporativo <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="contacto@empresa.cl"
                  className={errors.contactEmail ? 'error' : ''}
                />
                {errors.contactEmail && <span className="field-error">{errors.contactEmail}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="contactPhone">
                  Teléfono <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="+56 9 1234 5678"
                  className={errors.contactPhone ? 'error' : ''}
                />
                {errors.contactPhone && <span className="field-error">{errors.contactPhone}</span>}
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">
                  Dirección <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Av. Principal 123, Oficina 456"
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="field-error">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="city">
                  Ciudad <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Santiago"
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="field-error">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="region">
                  Región <span className="required">*</span>
                </label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className={errors.region ? 'error' : ''}
                >
                  <option value="">Seleccione...</option>
                  {chileanRegions.map(reg => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
                {errors.region && <span className="field-error">{errors.region}</span>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2>Información Operacional</h2>
            <p className="step-description">Datos sobre las operaciones y objetivos de sustentabilidad</p>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="annualRevenue">
                  Ingresos Anuales <span className="required">*</span>
                </label>
                <select
                  id="annualRevenue"
                  name="annualRevenue"
                  value={formData.annualRevenue}
                  onChange={handleChange}
                  className={errors.annualRevenue ? 'error' : ''}
                >
                  <option value="">Seleccione...</option>
                  {revenueRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
                {errors.annualRevenue && <span className="field-error">{errors.annualRevenue}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="travelFrequency">
                  Frecuencia de Viajes Corporativos <span className="required">*</span>
                </label>
                <select
                  id="travelFrequency"
                  name="travelFrequency"
                  value={formData.travelFrequency}
                  onChange={handleChange}
                  className={errors.travelFrequency ? 'error' : ''}
                >
                  <option value="">Seleccione...</option>
                  {travelFrequencies.map(freq => (
                    <option key={freq} value={freq}>{freq}</option>
                  ))}
                </select>
                {errors.travelFrequency && <span className="field-error">{errors.travelFrequency}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="estimatedCO2">
                  CO₂ Anual Estimado (toneladas)
                </label>
                <input
                  type="number"
                  id="estimatedCO2"
                  name="estimatedCO2"
                  value={formData.estimatedCO2}
                  onChange={handleChange}
                  placeholder="100"
                  min="0"
                />
                <small className="field-hint">Opcional - Estimación aproximada</small>
              </div>

              <div className="form-group full-width">
                <label htmlFor="sustainabilityGoals">
                  Objetivos de Sustentabilidad <span className="required">*</span>
                </label>
                <textarea
                  id="sustainabilityGoals"
                  name="sustainabilityGoals"
                  value={formData.sustainabilityGoals}
                  onChange={handleChange}
                  placeholder="Describa los objetivos de sustentabilidad de su empresa..."
                  rows="4"
                  className={errors.sustainabilityGoals ? 'error' : ''}
                />
                {errors.sustainabilityGoals && <span className="field-error">{errors.sustainabilityGoals}</span>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2>Documentos Requeridos</h2>
            <p className="step-description">Suba los documentos legales de su empresa</p>

            <div className="documents-grid">
              <div className="document-upload">
                <div className="document-header">
                  <div className="document-icon">📄</div>
                  <div>
                    <h3>Licencia Comercial <span className="required">*</span></h3>
                    <p>Patente municipal o documento equivalente</p>
                  </div>
                </div>
                <input
                  type="file"
                  id="businessLicense"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'businessLicense')}
                  className="file-input"
                />
                <label htmlFor="businessLicense" className="file-label">
                  {formData.documents.businessLicense ? (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {formData.documents.businessLicense.name}
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      Seleccionar archivo
                    </>
                  )}
                </label>
                {errors.businessLicense && <span className="field-error">{errors.businessLicense}</span>}
              </div>

              <div className="document-upload">
                <div className="document-header">
                  <div className="document-icon">📋</div>
                  <div>
                    <h3>Certificado de RUT <span className="required">*</span></h3>
                    <p>Certificado del Servicio de Impuestos Internos</p>
                  </div>
                </div>
                <input
                  type="file"
                  id="taxId"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'taxId')}
                  className="file-input"
                />
                <label htmlFor="taxId" className="file-label">
                  {formData.documents.taxId ? (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {formData.documents.taxId.name}
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      Seleccionar archivo
                    </>
                  )}
                </label>
                {errors.taxId && <span className="field-error">{errors.taxId}</span>}
              </div>

              <div className="document-upload">
                <div className="document-header">
                  <div className="document-icon">✍️</div>
                  <div>
                    <h3>Poder Notarial</h3>
                    <p>Solo si el firmante no es el representante legal</p>
                  </div>
                </div>
                <input
                  type="file"
                  id="powerOfAttorney"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'powerOfAttorney')}
                  className="file-input"
                />
                <label htmlFor="powerOfAttorney" className="file-label">
                  {formData.documents.powerOfAttorney ? (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {formData.documents.powerOfAttorney.name}
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      Seleccionar archivo
                    </>
                  )}
                </label>
                {errors.powerOfAttorney && <span className="field-error">{errors.powerOfAttorney}</span>}
              </div>
            </div>

            <div className="document-info">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <strong>Formatos aceptados:</strong> PDF, JPG, PNG
                <br />
                <strong>Tamaño máximo:</strong> 5MB por archivo
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content review-step">
            <h2>Revisión Final</h2>
            <p className="step-description">Verifique que toda la información sea correcta</p>

            <div className="review-sections">
              <div className="review-section">
                <div className="review-header">
                  <h3>🏢 Información de la Empresa</h3>
                  <button onClick={() => setCurrentStep(1)} className="edit-button">Editar</button>
                </div>
                <div className="review-content">
                  <div className="review-item">
                    <span className="label">Razón Social:</span>
                    <span className="value">{formData.companyName}</span>
                  </div>
                  <div className="review-item">
                    <span className="label">RUT:</span>
                    <span className="value">{formData.rut}</span>
                  </div>
                  <div className="review-item">
                    <span className="label">Tipo de Empresa:</span>
                    <span className="value">{formData.businessType}</span>
                  </div>
                  <div className="review-item">
                    <span className="label">Industria:</span>
                    <span className="value">{formData.industry}</span>
                  </div>
                  <div className="review-item">
                    <span className="label">Empleados:</span>
                    <span className="value">{formData.employeeCount}</span>
                  </div>
                </div>
              </div>

              <div className="review-section">
                <div className="review-header">
                  <h3>👤 Información de Contacto</h3>
                  <button onClick={() => setCurrentStep(2)} className="edit-button">Editar</button>
                </div>
                <div className="review-content">
                  <div className="review-item">
                    <span className="label">Contacto:</span>
                    <span className="value">{formData.contactName}</span>
                  </div>
                  <div className="review-item">
                    <span className="label">Cargo:</span>
                    <span className="value">{formData.contactPosition}</span>
                  </div>
                  <div className="review-item">
                    <span className="label">Email:</span>
                    <span className="value">{formData.contactEmail}</span>
                  </div>
                  <div className="review-item">
                    <span className="label">Teléfono:</span>
                    <span className="value">{formData.contactPhone}</span>
                  </div>
                  <div className="review-item">
                    <span className="label">Dirección:</span>
                    <span className="value">{formData.address}, {formData.city}</span>
                  </div>
                  <div className="review-item">
                    <span className="label">Región:</span>
                    <span className="value">{formData.region}</span>
                  </div>
                </div>
              </div>

              <div className="review-section">
                <div className="review-header">
                  <h3>📊 Información Operacional</h3>
                  <button onClick={() => setCurrentStep(3)} className="edit-button">Editar</button>
                </div>
                <div className="review-content">
                  <div className="review-item">
                    <span className="label">Ingresos Anuales:</span>
                    <span className="value">{formData.annualRevenue}</span>
                  </div>
                  <div className="review-item">
                    <span className="label">Frecuencia de Viajes:</span>
                    <span className="value">{formData.travelFrequency}</span>
                  </div>
                  {formData.estimatedCO2 && (
                    <div className="review-item">
                      <span className="label">CO₂ Estimado:</span>
                      <span className="value">{formData.estimatedCO2} toneladas/año</span>
                    </div>
                  )}
                  <div className="review-item full">
                    <span className="label">Objetivos de Sustentabilidad:</span>
                    <span className="value">{formData.sustainabilityGoals}</span>
                  </div>
                </div>
              </div>

              <div className="review-section">
                <div className="review-header">
                  <h3>📄 Documentos</h3>
                  <button onClick={() => setCurrentStep(4)} className="edit-button">Editar</button>
                </div>
                <div className="review-content">
                  <div className="review-item">
                    <span className="label">Licencia Comercial:</span>
                    <span className="value success">
                      {formData.documents.businessLicense ? '✓ ' + formData.documents.businessLicense.name : '✗ No subido'}
                    </span>
                  </div>
                  <div className="review-item">
                    <span className="label">Certificado RUT:</span>
                    <span className="value success">
                      {formData.documents.taxId ? '✓ ' + formData.documents.taxId.name : '✗ No subido'}
                    </span>
                  </div>
                  <div className="review-item">
                    <span className="label">Poder Notarial:</span>
                    <span className="value">
                      {formData.documents.powerOfAttorney ? '✓ ' + formData.documents.powerOfAttorney.name : 'Opcional'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="error-message">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{errors.submit}</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="wizard-container">
      <div className="wizard-card">
        {/* Progress Stepper */}
        <div className="wizard-stepper">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`step ${currentStep === step.number ? 'active' : ''} ${
                currentStep > step.number ? 'completed' : ''
              }`}
            >
              <div className="step-number">
                {currentStep > step.number ? (
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>
              <div className="step-info">
                <span className="step-title">{step.title}</span>
              </div>
              {index < steps.length - 1 && <div className="step-line"></div>}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="wizard-actions">
          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              className="btn-secondary"
              disabled={isLoading}
            >
              Anterior
            </button>
          )}
          <div className="spacer"></div>
          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="btn-primary"
              disabled={isLoading}
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="btn-primary btn-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Enviando...
                </>
              ) : (
                'Enviar Solicitud'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyOnboardingWizard;
