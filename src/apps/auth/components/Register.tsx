import React, { useState, ChangeEvent, FormEvent } from 'react';
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
  const totalSteps = 4;
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>();

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

    if (step === 2) {
      if (!formData.companyName.trim()) errors.companyName = 'Razón social requerida';
      if (!formData.rut.trim()) errors.rut = 'RUT requerido';
      if (!formData.businessType) errors.businessType = 'Tipo de empresa requerido';
    }

    if (step === 3) {
      if (!formData.legalRepName.trim()) errors.legalRepName = 'Nombre del representante requerido';
      if (!formData.legalRepRut.trim()) errors.legalRepRut = 'RUT del representante requerido';
      if (!formData.contactEmail.trim()) errors.contactEmail = 'Email de contacto requerido';
      else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) errors.contactEmail = 'Email inválido';
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
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Error al registrarse con Google:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      };
      
      await register(userData);
      
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
      
      localStorage.setItem('pendingOnboarding', JSON.stringify(onboardingData));
      navigate('/dashboard');
    } catch (err) {
      console.error('Error en registro:', err);
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
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentStep}-${accountType}`}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
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
                  <>
                    {renderInput('Razón Social', 'companyName', 'text', 'Mi Empresa SpA', <Building className="!w-5 !h-5" />, true)}
                    {renderInput('RUT Empresa', 'rut', 'text', '76.123.456-7', <FileText className="!w-5 !h-5" />)}
                    {renderSelect('Tipo de Empresa', 'businessType', businessTypes)}
                    {renderInput('Nombre de Fantasía', 'tradeName', 'text', 'Mi Marca', <Building className="!w-5 !h-5" />)}
                    {renderInput('Sitio Web', 'website', 'url', 'https://...', <Building className="!w-5 !h-5" />)}
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    {renderInput('Nombre Representante', 'legalRepName', 'text', 'Juan Pérez', <User className="!w-5 !h-5" />, true)}
                    {renderInput('RUT Representante', 'legalRepRut', 'text', '12.345.678-9', <FileText className="!w-5 !h-5" />)}
                    {renderInput('Email Contacto', 'contactEmail', 'email', 'contacto@empresa.com', <Mail className="!w-5 !h-5" />)}
                    {renderInput('Teléfono', 'phone', 'tel', '+56 9 1234 5678', <Phone className="!w-5 !h-5" />)}
                    {renderSelect('Región', 'region', chileanRegions)}
                    {renderInput('Ciudad', 'city', 'text', 'Santiago', <MapPin className="!w-5 !h-5" />)}
                    {renderInput('Dirección', 'address', 'text', 'Av. Siempre Viva 123', <MapPin className="!w-5 !h-5" />, true)}
                  </>
                )}

                {currentStep === 4 && (
                  <>
                    {renderSelect('Sector Económico', 'industry', industries)}
                    {renderSelect('Número de Empleados', 'employeeCount', employeeRanges)}
                    {renderSelect('Facturación Anual', 'annualRevenue', revenueRanges)}
                    
                    <div className="!space-y-2 !col-span-2">
                      <label className="!text-sm !font-medium !text-emerald-100 !ml-1">Descripción de la Empresa</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className={`!w-full !px-6 !py-4 !rounded-2xl !bg-emerald-800/50 !border ${validationErrors.description ? '!border-red-400' : '!border-emerald-700'} !text-white !placeholder-emerald-500/50 focus:!ring-2 focus:!ring-emerald-400 focus:!border-transparent !transition-all !outline-none`}
                        placeholder="Breve descripción de lo que hace tu empresa..."
                      />
                      {validationErrors.description && <span className="!text-xs !text-red-300 !ml-2">{validationErrors.description}</span>}
                    </div>

                    <div className="!col-span-2 !space-y-3">
                      <label className="!text-sm !font-medium !text-emerald-100 !ml-1">Intereses (Selecciona al menos uno)</label>
                      <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-3">
                        {interestOptions.map(interest => (
                          <label key={interest} className="!flex !items-center !gap-3 !p-3 !rounded-xl !bg-emerald-800/30 !border !border-emerald-700/50 !cursor-pointer hover:!bg-emerald-800/50 !transition-all">
                            <div className="!relative !flex !items-center">
                              <input
                                type="checkbox"
                                name="interests"
                                value={interest}
                                checked={formData.interests.includes(interest)}
                                onChange={handleChange}
                                className="!peer !appearance-none !w-4 !h-4 !border-2 !border-emerald-500 !rounded !bg-transparent checked:!bg-emerald-500"
                              />
                              <Check className="!absolute !w-3 !h-3 !text-white !pointer-events-none !opacity-0 peer-checked:!opacity-100 !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2" />
                            </div>
                            <span className="!text-sm !text-emerald-100">{interest}</span>
                          </label>
                        ))}
                      </div>
                      {validationErrors.interests && <span className="!text-xs !text-red-300 !ml-2">{validationErrors.interests}</span>}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

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
