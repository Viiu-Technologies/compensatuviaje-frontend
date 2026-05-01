import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

const API_URL = (import.meta as any).env?.VITE_APP_API_URL
  || (import.meta as any).env?.VITE_API_URL
  || 'http://localhost:3001/api';

const RegisterWizard = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');

  // Paso 2 — documento opcional
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 2;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setApiError('');
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};

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
    // Paso 2: doc es opcional — no hay validaciones requeridas

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

  // ── Dropzone handlers ──────────────────────────────────────────────────────
  const handleFileSelect = (file: File) => {
    const allowed = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!allowed.includes(ext)) {
      setApiError('Solo se permiten PDF, imágenes o documentos Word/Excel');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setApiError('El archivo no puede superar 15 MB');
      return;
    }
    setDocFile(file);
    setApiError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    setApiError('');

    try {
      const body = new FormData();
      body.append('firstName', formData.firstName.trim());
      body.append('lastName',  formData.lastName.trim());
      body.append('email',     formData.email.trim().toLowerCase());
      body.append('password',  formData.password);
      if (docFile) body.append('document', docFile);

      const res = await fetch(`${API_URL}/public/companies/register-simple`, {
        method: 'POST',
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al crear la cuenta');
      }
        
        // Redirigir al login
        navigate('/auth/login');
    } catch (err: any) {
      setApiError(err.message || 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Paso 1: Datos personales ───────────────────────────────────────────────
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

  // ── Paso 2: Documento de empresa (opcional) ───────────────────────────────
  const renderStep2 = () => (
    <div className="wizard-step">
      <h2>Información de tu Empresa</h2>
      <p className="step-description">
        Adjunta un documento con los datos de tu empresa para que nuestro equipo
        pueda verificarla. Puede ser una cédula RUT, escritura, o cualquier
        documento oficial. <strong>Este paso es opcional</strong>: puedes continuar
        sin él y adjuntar el documento más adelante desde tu panel.
      </p>

      <div
        className={`dropzone ${isDragging ? 'dropzone--active' : ''} ${docFile ? 'dropzone--has-file' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFileSelect(f);
        }}
        onClick={() => !docFile && fileInputRef.current?.click()}
      >
        {docFile ? (
          <div className="dropzone__file">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <div>
              <p className="dropzone__filename">{docFile.name}</p>
              <p className="dropzone__filesize">
                {(docFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              type="button"
              className="dropzone__remove"
              onClick={(e) => { e.stopPropagation(); setDocFile(null); }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="dropzone__placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
            </svg>
            <p className="dropzone__title">Arrastra tu documento aquí</p>
            <p className="dropzone__subtitle">o <span>haz clic para seleccionar</span></p>
            <p className="dropzone__hint">PDF · JPG · PNG · DOCX — máx. 15 MB</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
            e.target.value = '';
          }}
        />
      </div>

      <div className="step2-hint">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
        </svg>
        <p>
          El equipo revisará tu solicitud en un plazo de 1–2 días hábiles y te
          notificará por correo electrónico al activar tu empresa.
        </p>
      </div>
    </div>
  );

  // ── Layout principal ───────────────────────────────────────────────────────
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

        {apiError && (
          <div className="error-message">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}

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
            <Link to="/auth/login">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterWizard;

