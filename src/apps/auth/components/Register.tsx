import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuth as useB2CAuth } from '../../b2c/context/AuthContext';
import { 
  User, Mail, Lock, Building, Phone, MapPin, 
  Briefcase, FileText, ArrowRight, ArrowLeft, 
  Check, Loader2, AlertCircle, Eye, EyeOff 
} from 'lucide-react';
import { BsGoogle } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, error: authError, clearError } = useAuth();
  const { login: loginWithGoogle, loading: googleLoading } = useB2CAuth();
  
  // Paso 0: selección de tipo de cuenta, Pasos 1-4: formulario B2B
  const [accountType, setAccountType] = useState<'none' | 'b2b' | 'b2c'>('none');
  const [currentStep, setCurrentStep] = useState(0); // 0 = selección de cuenta
  const totalSteps = 2;
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    interests: [] as string[],
  });

  // Opciones
  const businessTypes = ['Sociedad Anónima (S.A.)', 'Sociedad de Responsabilidad Limitada (Ltda.)', 'Empresa Individual de Responsabilidad Limitada (E.I.R.L.)', 'Sociedad por Acciones (SpA)', 'Otro'];
  const industries = ['Agricultura y ganadería', 'Minería', 'Manufactura', 'Construcción', 'Comercio', 'Transporte y logística', 'Servicios financieros', 'Tecnología y telecomunicaciones', 'Turismo y hotelería', 'Salud', 'Educación', 'Energía', 'Otro'];
  const employeeRanges = ['1-10 empleados (Microempresa)', '11-50 empleados (Pequeña)', '51-200 empleados (Mediana)', '201-1000 empleados (Grande)', 'Más de 1000 empleados (Corporación)'];
  const revenueRanges = ['Menos de 2.400 UF', '2.400 - 25.000 UF', '25.000 - 100.000 UF', '100.000 - 600.000 UF', 'Más de 600.000 UF'];
  const chileanRegions = ['Región de Arica y Parinacota', 'Región de Tarapacá', 'Región de Antofagasta', 'Región de Atacama', 'Región de Coquimbo', 'Región de Valparaíso', 'Región Metropolitana de Santiago', 'Región del Libertador General Bernardo O\'Higgins', 'Región del Maule', 'Región de Ñuble', 'Región del Biobío', 'Región de La Araucanía', 'Región de Los Ríos', 'Región de Los Lagos', 'Región de Aysén del General Carlos Ibáñez del Campo', 'Región de Magallanes y de la Antártica Chilena'];
  const interestOptions = ['Viajes corporativos', 'Transporte de mercancías', 'Consumo energético de oficinas', 'Eventos empresariales', 'Producción/manufactura', 'Otros'];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
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
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatRUT = (value: string) => {
    const cleaned = value.replace(/[^0-9kK]/g, '');
    if (cleaned.length <= 1) return cleaned;
    const rut = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);
    const formatted = rut.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formatted}-${dv}`;
  };

  const handleRUTChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formatted = formatRUT(value);
    setFormData(prev => ({ ...prev, [name]: formatted }));
    if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) errors.firstName = 'El nombre es requerido';
      if (!formData.lastName.trim()) errors.lastName = 'El apellido es requerido';
      if (!formData.email.trim()) errors.email = 'El email es requerido';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email inválido';
      if (!formData.password) errors.password = 'La contraseña es requerida';
      else if (formData.password.length < 6) errors.password = 'Mínimo 6 caracteres';
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden';
      if (!formData.acceptTerms) errors.acceptTerms = 'Debes aceptar los términos';
    }

    // Paso 2: documento opcional — sin validaciones obligatorias

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      // Si eligió B2B, avanza al paso 1 del formulario
      if (accountType === 'b2b') {
        setCurrentStep(1);
      }
      return;
    }
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    if (currentStep === 1) {
      // Volver al selector de tipo de cuenta
      setCurrentStep(0);
      setAccountType('none');
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    }
  };

  const handleSelectAccountType = (type: 'b2b' | 'b2c') => {
    setAccountType(type);
    if (type === 'b2c') {
      // Para B2C mostramos directamente la opción de Google
      setCurrentStep(0);
    } else if (type === 'b2b') {
      // Para B2B avanzamos directamente al paso 1 del formulario
      setCurrentStep(1);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Error al registrarse con Google:', error);
    }
  };

  const handleFileSelect = (file: File) => {
    const allowed = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!allowed.includes(ext)) {
      setApiError('Solo se permiten PDF, imágenes o documentos Word');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setApiError('El archivo no puede superar 15 MB');
      return;
    }
    setDocFile(file);
    setApiError('');
  };

  const API_URL = (import.meta as any).env?.VITE_APP_API_URL
    || (import.meta as any).env?.VITE_API_URL
    || 'http://localhost:3001/api';

  const handleSubmit = async (e: FormEvent) => {
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
      if (!res.ok) throw new Error(data.message || 'Error al crear la cuenta');

      navigate('/auth/login');
    } catch (err: any) {
      setApiError(err.message || 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const formVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.6, delay: 0.2, ease: "easeOut" } }
  };

  const treeVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: (custom: number) => ({
      y: 0, opacity: 1, transition: { duration: 0.8, delay: custom * 0.2, type: "spring", bounce: 0.4 }
    })
  };

  const renderInput = (label: string, name: string, type: string = 'text', placeholder: string = '', icon?: React.ReactNode, fullWidth: boolean = false) => (
    <div className={`!space-y-2 ${fullWidth ? '!col-span-2' : ''}`}>
      <label htmlFor={name} className="!text-sm !font-medium !text-emerald-100 !ml-1">{label}</label>
      <div className="!relative !group">
        <input
          type={type}
          id={name}
          name={name}
          value={(formData as any)[name]}
          onChange={name.includes('rut') || name.includes('Rut') ? handleRUTChange : handleChange}
          placeholder={placeholder}
          className={`!w-full !px-6 !py-4 ${icon ? '!pl-12' : ''} !rounded-full !bg-emerald-800/50 !border ${validationErrors[name] ? '!border-red-400' : '!border-emerald-700'} !text-white !placeholder-emerald-500/50 focus:!ring-2 focus:!ring-emerald-400 focus:!border-transparent !transition-all !outline-none group-hover:!bg-emerald-800/70`}
        />
        {icon && <div className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !text-emerald-400">{icon}</div>}
      </div>
      {validationErrors[name] && <span className="!text-xs !text-red-300 !ml-2">{validationErrors[name]}</span>}
    </div>
  );

  const renderSelect = (label: string, name: string, options: string[]) => (
    <div className="!space-y-2 !col-span-2">
      <label htmlFor={name} className="!text-sm !font-medium !text-emerald-100 !ml-1">{label}</label>
      <div className="!relative !group">
        <select
          id={name}
          name={name}
          value={(formData as any)[name]}
          onChange={handleChange}
          className={`!w-full !px-6 !py-4 !rounded-full !bg-emerald-800/50 !border ${validationErrors[name] ? '!border-red-400' : '!border-emerald-700'} !text-white focus:!ring-2 focus:!ring-emerald-400 focus:!border-transparent !transition-all !outline-none group-hover:!bg-emerald-800/70 appearance-none`}
        >
          <option value="">Seleccionar...</option>
          {options.map(opt => <option key={opt} value={opt} className="!bg-emerald-900">{opt}</option>)}
        </select>
        <div className="!absolute !right-6 !top-1/2 !-translate-y-1/2 !pointer-events-none !text-emerald-400">
          <svg className="!w-4 !h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
      {validationErrors[name] && <span className="!text-xs !text-red-300 !ml-2">{validationErrors[name]}</span>}
    </div>
  );

  return (
    <div className="!min-h-screen !w-full !flex !overflow-hidden !bg-emerald-50">
      
      {/* LEFT PANEL - Illustration */}
      <motion.div 
        className="!hidden lg:!flex !w-[45%] !relative !bg-gradient-to-b !from-emerald-100 !via-emerald-200 !to-emerald-300 !flex-col !justify-center !items-center !p-12 !overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="!absolute !top-20 !right-20 !w-40 !h-40 !rounded-full !bg-yellow-100/50 !blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <div className="!relative !z-10 !max-w-lg !w-full !text-center">
          <motion.h2 
            className="!text-5xl !font-extrabold !text-emerald-900 !mb-6 !tracking-tight"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Únete a Nosotros
          </motion.h2>
          <motion.p 
            className="!text-xl !text-emerald-800/80 !mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Comienza tu viaje hacia un futuro más sostenible hoy mismo.
          </motion.p>
        </div>

        {/* Trees Illustration */}
        <div className="!absolute !bottom-0 !left-0 !right-0 !h-1/3 !z-0 !pointer-events-none">
          <div className="!absolute !bottom-0 !left-0 !w-full !h-full !bg-emerald-400/20 !rounded-tr-[100%] !transform !translate-y-10"></div>
          <motion.div custom={1} variants={treeVariants} className="!absolute !bottom-0 !left-[15%] !text-emerald-800/20">
            <svg width="120" height="200" viewBox="0 0 100 180" fill="currentColor"><path d="M50 0 L90 120 L60 120 L60 180 L40 180 L40 120 L10 120 Z" /></svg>
          </motion.div>
          <motion.div custom={2} variants={treeVariants} className="!absolute !bottom-0 !right-[20%] !text-emerald-700/30 !transform !scale-110">
            <svg width="140" height="220" viewBox="0 0 100 180" fill="currentColor"><path d="M50 0 L90 120 L60 120 L60 180 L40 180 L40 120 L10 120 Z" /></svg>
          </motion.div>
        </div>
      </motion.div>

      {/* RIGHT PANEL - Form */}
      <div className="!w-full lg:!w-[55%] !relative !bg-emerald-900 !flex !items-center !justify-center !p-4 lg:!p-12 !overflow-y-auto">
        
        {/* Wave Separator */}
        <div className="!hidden lg:!block !absolute !top-0 !-left-[100px] !w-[101px] !h-full !overflow-hidden !z-20">
           <svg className="!h-full !w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="#064e3b">
             <path d="M100 0 C 20 20 20 80 100 100 V 0 Z" />
           </svg>
        </div>

        <motion.div 
          className="!w-full !max-w-2xl !relative !z-30 !py-8"
          initial="hidden"
          animate="visible"
          variants={formVariants}
        >
          <div className="!mb-8">
            <Link to="/" className="!inline-flex !items-center !gap-2 !text-sm !text-emerald-200 hover:!text-white !transition-colors !mb-6">
              <ArrowLeft className="!w-4 !h-4" /> <span>Volver al inicio</span>
            </Link>
            
            {/* Header dinámico según el paso */}
            {currentStep === 0 && accountType === 'none' && (
              <>
                <h1 className="!text-3xl !font-bold !text-white !mb-2">¿Qué tipo de cuenta necesitas?</h1>
                <p className="!text-emerald-200/80">Elige la opción que mejor se adapte a ti</p>
              </>
            )}
            {currentStep === 0 && accountType === 'b2c' && (
              <>
                <button
                  onClick={() => setAccountType('none')}
                  className="!inline-flex !items-center !gap-2 !text-sm !text-emerald-200 hover:!text-white !transition-colors !mb-4"
                >
                  <ArrowLeft className="!w-4 !h-4" /> <span>Cambiar tipo de cuenta</span>
                </button>
                <div className="!flex !justify-center !mb-4">
                  <div className="!w-16 !h-16 !bg-emerald-700 !rounded-2xl !flex !items-center !justify-center">
                    <User className="!w-8 !h-8 !text-emerald-300" />
                  </div>
                </div>
                <h1 className="!text-3xl !font-bold !text-white !text-center !mb-2">Crear Cuenta Personal</h1>
                <p className="!text-emerald-200/80 !text-center">Regístrate con tu cuenta de Google</p>
              </>
            )}
            {currentStep >= 1 && (
              <>
                <div className="!flex !items-end !justify-between !mb-2">
                  <h1 className="!text-3xl !font-bold !text-white">Crear Cuenta</h1>
                  <span className="!text-emerald-400 !font-medium">Paso {currentStep} de {totalSteps}</span>
                </div>
                <div className="!h-2 !w-full !bg-emerald-800 !rounded-full !overflow-hidden">
                  <motion.div 
                    className="!h-full !bg-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </>
            )}
          </div>

          {authError && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="!mb-6 !p-4 !bg-red-500/10 !border !border-red-500/20 !rounded-xl !flex !items-start !gap-3 !text-red-200"
            >
              <AlertCircle className="!w-5 !h-5 !flex-shrink-0 !mt-0.5" />
              <span className="!text-sm">{authError}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="!space-y-6">
              <div
                className={currentStep === 0 ? '' : '!grid !grid-cols-1 md:!grid-cols-2 !gap-6'}
              >
                {/* Paso 0: Selección de tipo de cuenta */}
                {currentStep === 0 && accountType === 'none' && (
                  <div className="!space-y-4">
                    {/* Opción Empresarial */}
                    <button
                      type="button"
                      onClick={() => handleSelectAccountType('b2b')}
                      className="!w-full !p-6 !bg-emerald-800/50 !border !border-emerald-700 !rounded-2xl !text-left hover:!bg-emerald-800/70 !transition-all !group"
                    >
                      <div className="!flex !items-start !gap-4">
                        <div className="!w-12 !h-12 !bg-blue-500/20 !rounded-xl !flex !items-center !justify-center !flex-shrink-0">
                          <Building className="!w-6 !h-6 !text-blue-400" />
                        </div>
                        <div className="!flex-1">
                          <h3 className="!text-lg !font-bold !text-white !mb-1">Cuenta Empresarial</h3>
                          <p className="!text-emerald-200/70 !text-sm !mb-3">Para empresas y organizaciones que desean gestionar sus emisiones corporativas.</p>
                          <div className="!space-y-1">
                            <div className="!flex !items-center !gap-2 !text-emerald-300 !text-sm">
                              <Check className="!w-4 !h-4" /> Dashboard empresarial
                            </div>
                            <div className="!flex !items-center !gap-2 !text-emerald-300 !text-sm">
                              <Check className="!w-4 !h-4" /> Reportes avanzados
                            </div>
                            <div className="!flex !items-center !gap-2 !text-emerald-300 !text-sm">
                              <Check className="!w-4 !h-4" /> Múltiples usuarios
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="!w-5 !h-5 !text-emerald-400 group-hover:!translate-x-1 !transition-transform" />
                      </div>
                    </button>

                    {/* Opción Personal */}
                    <button
                      type="button"
                      onClick={() => handleSelectAccountType('b2c')}
                      className="!w-full !p-6 !bg-emerald-800/50 !border !border-emerald-700 !rounded-2xl !text-left hover:!bg-emerald-800/70 !transition-all !group"
                    >
                      <div className="!flex !items-start !gap-4">
                        <div className="!w-12 !h-12 !bg-emerald-500/20 !rounded-xl !flex !items-center !justify-center !flex-shrink-0">
                          <User className="!w-6 !h-6 !text-emerald-400" />
                        </div>
                        <div className="!flex-1">
                          <h3 className="!text-lg !font-bold !text-white !mb-1">Cuenta Personal</h3>
                          <p className="!text-emerald-200/70 !text-sm !mb-3">Para viajeros individuales que quieren compensar sus emisiones personales.</p>
                          <div className="!space-y-1">
                            <div className="!flex !items-center !gap-2 !text-emerald-300 !text-sm">
                              <Check className="!w-4 !h-4" /> Registro rápido con Google
                            </div>
                            <div className="!flex !items-center !gap-2 !text-emerald-300 !text-sm">
                              <Check className="!w-4 !h-4" /> Calculadora personal
                            </div>
                            <div className="!flex !items-center !gap-2 !text-emerald-300 !text-sm">
                              <Check className="!w-4 !h-4" /> Badges y certificados
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="!w-5 !h-5 !text-emerald-400 group-hover:!translate-x-1 !transition-transform" />
                      </div>
                    </button>
                  </div>
                )}

                {/* Paso 0 con B2C seleccionado: Mostrar botón de Google */}
                {currentStep === 0 && accountType === 'b2c' && (
                  <div className="!space-y-6">
                    <button
                      type="button"
                      onClick={handleGoogleRegister}
                      disabled={googleLoading}
                      className="!w-full !py-4 !px-6 !bg-white !text-gray-800 !font-semibold !rounded-full !shadow-lg hover:!shadow-xl !transition-all !flex !items-center !justify-center !gap-3 disabled:!opacity-50 disabled:!cursor-not-allowed"
                    >
                      {googleLoading ? (
                        <Loader2 className="!w-6 !h-6 !animate-spin !text-emerald-600" />
                      ) : (
                        <BsGoogle className="!w-5 !h-5 !text-red-500" />
                      )}
                      {googleLoading ? 'Conectando...' : 'Continuar con Google'}
                    </button>

                    <div className="!space-y-4">
                      <div className="!flex !items-start !gap-3 !p-4 !bg-emerald-800/30 !rounded-xl">
                        <Check className="!w-5 !h-5 !text-emerald-400 !flex-shrink-0 !mt-0.5" />
                        <div>
                          <p className="!font-medium !text-white">Calcula tu huella de carbono</p>
                          <p className="!text-sm !text-emerald-200/70">Mide el impacto de tus viajes</p>
                        </div>
                      </div>
                      <div className="!flex !items-start !gap-3 !p-4 !bg-emerald-800/30 !rounded-xl">
                        <Check className="!w-5 !h-5 !text-emerald-400 !flex-shrink-0 !mt-0.5" />
                        <div>
                          <p className="!font-medium !text-white">Compensa tus emisiones</p>
                          <p className="!text-sm !text-emerald-200/70">Proyectos certificados</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <>
                    {renderInput('Nombre', 'firstName', 'text', 'Juan', <User className="!w-5 !h-5" />)}
                    {renderInput('Apellido', 'lastName', 'text', 'Pérez', <User className="!w-5 !h-5" />)}
                    {renderInput('Correo Electrónico', 'email', 'email', 'tu@email.com', <Mail className="!w-5 !h-5" />, true)}
                    
                    <div className="!space-y-2 !col-span-2">
                      <label className="!text-sm !font-medium !text-emerald-100 !ml-1">Contraseña</label>
                      <div className="!relative !group">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className={`!w-full !px-6 !py-4 !pl-12 !pr-12 !rounded-full !bg-emerald-800/50 !border ${validationErrors.password ? '!border-red-400' : '!border-emerald-700'} !text-white !placeholder-emerald-500/50 focus:!ring-2 focus:!ring-emerald-400 focus:!border-transparent !transition-all !outline-none group-hover:!bg-emerald-800/70`}
                        />
                        <div className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !text-emerald-400"><Lock className="!w-5 !h-5" /></div>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="!absolute !right-4 !top-1/2 !-translate-y-1/2 !text-emerald-400 hover:!text-white">
                          {showPassword ? <EyeOff className="!w-5 !h-5" /> : <Eye className="!w-5 !h-5" />}
                        </button>
                      </div>
                      {validationErrors.password && <span className="!text-xs !text-red-300 !ml-2">{validationErrors.password}</span>}
                    </div>

                    <div className="!space-y-2 !col-span-2">
                      <label className="!text-sm !font-medium !text-emerald-100 !ml-1">Confirmar Contraseña</label>
                      <div className="!relative !group">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className={`!w-full !px-6 !py-4 !pl-12 !rounded-full !bg-emerald-800/50 !border ${validationErrors.confirmPassword ? '!border-red-400' : '!border-emerald-700'} !text-white !placeholder-emerald-500/50 focus:!ring-2 focus:!ring-emerald-400 focus:!border-transparent !transition-all !outline-none group-hover:!bg-emerald-800/70`}
                        />
                        <div className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !text-emerald-400"><Lock className="!w-5 !h-5" /></div>
                      </div>
                      {validationErrors.confirmPassword && <span className="!text-xs !text-red-300 !ml-2">{validationErrors.confirmPassword}</span>}
                    </div>

                    <div className="!col-span-2 !mt-2">
                      <label className="!flex !items-center !gap-3 !cursor-pointer !group">
                        <div className="!relative !flex !items-center">
                          <input
                            type="checkbox"
                            name="acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={handleChange}
                            className="!peer !appearance-none !w-5 !h-5 !border-2 !border-emerald-600 !rounded !bg-transparent checked:!bg-emerald-500 checked:!border-emerald-500 !transition-all"
                          />
                          <Check className="!absolute !w-3.5 !h-3.5 !text-white !pointer-events-none !opacity-0 peer-checked:!opacity-100 !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2" />
                        </div>
                        <span className="!text-emerald-200 group-hover:!text-white !transition-colors !text-sm">
                          Acepto los <Link to="/terms" className="!text-emerald-400 hover:!underline">términos y condiciones</Link>
                        </span>
                      </label>
                      {validationErrors.acceptTerms && <span className="!text-xs !text-red-300 !ml-2 !block !mt-1">{validationErrors.acceptTerms}</span>}
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <div className="!col-span-2 !space-y-4">
                    <div>
                      <p className="!text-sm !text-emerald-200/80 !mb-1">
                        Sube un documento con los datos de tu empresa (RUT, escritura, representante).
                        <strong className="!text-emerald-300"> Este paso es opcional</strong> — puedes
                        continuar sin él y adjuntarlo más adelante desde tu panel.
                      </p>
                      <p className="!text-xs !text-emerald-400/70">PDF · JPG · PNG · DOCX — máx. 15 MB</p>
                    </div>

                    {/* Dropzone */}
                    <div
                      className={`!border-2 !border-dashed !rounded-2xl !p-8 !text-center !transition-all
                        ${isDragging ? '!border-emerald-300 !bg-emerald-700/30' : '!border-emerald-600 !bg-emerald-800/30'}
                        ${docFile ? '!border-solid !border-emerald-400 !bg-emerald-800/50 !cursor-default' : '!cursor-pointer hover:!border-emerald-400 hover:!bg-emerald-800/40'}`}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault(); setIsDragging(false);
                        const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f);
                      }}
                      onClick={() => !docFile && fileInputRef.current?.click()}
                    >
                      {docFile ? (
                        <div className="!flex !items-center !justify-center !gap-4">
                          <FileText className="!w-8 !h-8 !text-emerald-400 !flex-shrink-0" />
                          <div className="!text-left">
                            <p className="!font-semibold !text-emerald-300">{docFile.name}</p>
                            <p className="!text-xs !text-emerald-500">{(docFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setDocFile(null); }}
                            className="!ml-auto !text-red-400 hover:!text-red-300 !text-sm !bg-red-900/30 !px-3 !py-1 !rounded-full !transition-colors"
                          >
                            Quitar
                          </button>
                        </div>
                      ) : (
                        <div className="!space-y-2">
                          <div className="!w-12 !h-12 !mx-auto !bg-emerald-700/50 !rounded-full !flex !items-center !justify-center">
                            <Briefcase className="!w-6 !h-6 !text-emerald-400" />
                          </div>
                          <p className="!font-semibold !text-white">Arrastra tu documento aquí</p>
                          <p className="!text-sm !text-emerald-400">
                            o <span className="!underline">haz clic para seleccionar</span>
                          </p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="!hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]; if (f) handleFileSelect(f);
                          e.target.value = '';
                        }}
                      />
                    </div>

                    {apiError && (
                      <p className="!text-xs !text-red-300">{apiError}</p>
                    )}

                    <div className="!flex !items-start !gap-3 !p-4 !bg-emerald-800/30 !border !border-emerald-700/50 !rounded-xl">
                      <AlertCircle className="!w-5 !h-5 !text-emerald-400 !flex-shrink-0 !mt-0.5" />
                      <p className="!text-sm !text-emerald-200/80">
                        Nuestro equipo revisará tu solicitud en 1–2 días hábiles y te notificará
                        por correo al activar tu cuenta.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            {/* Botones de navegación solo para pasos B2B */}
            {currentStep >= 1 && (
              <div className="!flex !gap-4 !pt-6">
                {currentStep >= 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="!flex-1 !py-4 !px-6 !bg-emerald-800 !text-emerald-200 !font-bold !rounded-full hover:!bg-emerald-700 !transition-all"
                  >
                    Atrás
                  </button>
                )}
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="!flex-1 !py-4 !px-6 !bg-gradient-to-r !from-emerald-400 !to-teal-400 !text-emerald-900 !font-bold !rounded-full !shadow-lg !shadow-emerald-900/50 hover:!shadow-emerald-500/30 !transition-all !flex !items-center !justify-center !gap-2"
                  >
                    Siguiente <ArrowRight className="!w-5 !h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="!flex-1 !py-4 !px-6 !bg-gradient-to-r !from-emerald-400 !to-teal-400 !text-emerald-900 !font-bold !rounded-full !shadow-lg !shadow-emerald-900/50 hover:!shadow-emerald-500/30 !transition-all disabled:!opacity-70 disabled:!cursor-not-allowed !flex !items-center !justify-center !gap-2"
                  >
                    {isLoading ? <Loader2 className="!w-5 !h-5 !animate-spin" /> : 'Crear Cuenta'}
                  </button>
                )}
              </div>
            )}
          </form>

          <div className="!mt-8 !text-center">
            <span className="!text-emerald-200/80">¿Ya tienes cuenta? </span>
            <Link to="/login" className="!text-white !font-bold hover:!text-emerald-300 !underline !decoration-2 !underline-offset-4 !transition-colors">
              Iniciar sesión
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
