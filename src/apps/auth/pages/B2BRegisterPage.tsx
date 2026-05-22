import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2, Mail, Lock, User,
  ArrowLeft, ArrowRight, Loader2, CheckCircle, AlertCircle,
  Plane, Truck, Package, Briefcase, Star, Globe, Check
} from 'lucide-react';

type CompanyType = 'TRAVEL_AGENCY' | 'TRANSPORT' | 'LOGISTICS' | 'CORPORATE' | 'EVENTS' | 'OTHER';

interface FormData {
  companyType: CompanyType | '';
  razonSocial: string;
  rut: string;
  nombreComercial: string;
  giroSii: string;
  tamanoEmpresa: 'micro' | 'pequena' | 'mediana' | 'grande' | '';
  direccion: string;
  phone: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  confirmPassword: string;
}

const COMPANY_TYPES: { id: CompanyType; label: string; desc: string; icon: React.FC<any> }[] = [
  { id: 'TRAVEL_AGENCY', label: 'Agencia de Viajes', desc: 'Gestión de viajes corporativos y turismo', icon: Plane },
  { id: 'TRANSPORT',     label: 'Transporte',         desc: 'Empresa de transporte de pasajeros o carga', icon: Truck },
  { id: 'LOGISTICS',     label: 'Logística',           desc: 'Cadena de suministro y distribución', icon: Package },
  { id: 'CORPORATE',     label: 'Corporativo',         desc: 'Empresa con viajes de negocios frecuentes', icon: Briefcase },
  { id: 'EVENTS',        label: 'Eventos',             desc: 'Organización de eventos y conferencias', icon: Star },
  { id: 'OTHER',         label: 'Otro',                desc: 'Otro tipo de organización', icon: Globe },
];

const API_URL = (import.meta as any).env?.VITE_APP_API_URL
  || (import.meta as any).env?.VITE_API_URL
  || 'http://localhost:3001/api';

const B2BRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    companyType: '',
    razonSocial: '',
    rut: '',
    nombreComercial: '',
    giroSii: '',
    tamanoEmpresa: '',
    direccion: '',
    phone: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const canProceedStep1 = formData.companyType !== '';
  const canProceedStep2 = formData.razonSocial.trim() !== '' && formData.rut.trim() !== '' && formData.tamanoEmpresa !== '';

  const handleStep2 = () => {
    if (!canProceedStep2) { setError('Por favor completa los campos obligatorios (*)'); return; }
    setError('');
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.adminPassword !== formData.confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    if (formData.adminPassword.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/public/companies/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razonSocial: formData.razonSocial,
          rut: formData.rut,
          nombreComercial: formData.nombreComercial,
          giroSii: formData.giroSii,
          tamanoEmpresa: formData.tamanoEmpresa,
          companyType: formData.companyType || undefined,
          direccion: formData.direccion,
          phone: formData.phone,
          adminUser: {
            name: formData.adminName,
            email: formData.adminEmail,
            password: formData.adminPassword,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || 'Error al registrar empresa');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al registrar empresa');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: 'easeOut' as const } },
  };
  const formVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.6, delay: 0.2, ease: 'easeOut' as const } },
  };
  const treeVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: (custom: number) => ({
      y: 0, opacity: 1,
      transition: { duration: 0.8, delay: custom * 0.2, type: 'spring' as const, bounce: 0.4 },
    }),
  };

  const inputCls = '!w-full !px-6 !py-4 !rounded-full !bg-emerald-800/50 !border !border-emerald-700 !text-white !placeholder-emerald-500/50 focus:!ring-2 focus:!ring-emerald-400 focus:!border-transparent !transition-all !outline-none hover:!bg-emerald-800/70';
  const labelCls = '!text-sm !font-medium !text-emerald-100 !ml-1 !block !mb-1';
  const selectCls = '!w-full !px-6 !py-4 !rounded-full !bg-emerald-800/50 !border !border-emerald-700 !text-white focus:!ring-2 focus:!ring-emerald-400 focus:!border-transparent !transition-all !outline-none hover:!bg-emerald-800/70 appearance-none';

  const steps = ['Tipo de empresa', 'Datos de empresa', 'Cuenta admin'];

  if (success) {
    const typeLabel = COMPANY_TYPES.find((t) => t.id === formData.companyType)?.label || '';
    return (
      <div className="!min-h-screen !w-full !flex !overflow-hidden !bg-emerald-50">
        <motion.div className="!hidden lg:!flex !w-[45%] !relative !bg-gradient-to-b !from-emerald-100 !via-emerald-200 !to-emerald-300 !flex-col !justify-center !items-center !p-12 !overflow-hidden" initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div className="!absolute !top-20 !right-20 !w-40 !h-40 !rounded-full !bg-yellow-100/50 !blur-3xl" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 8, repeat: Infinity }} />
          <div className="!relative !z-10 !max-w-lg !w-full !text-center">
            <motion.h2 className="!text-5xl !font-extrabold !text-emerald-900 !mb-6 !tracking-tight" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>¡Bienvenido!</motion.h2>
            <motion.p className="!text-xl !text-emerald-800/80 !mb-8" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>Tu empresa ya forma parte de la red de compensación carbono.</motion.p>
          </div>
          <div className="!absolute !bottom-0 !left-0 !right-0 !h-1/3 !z-0 !pointer-events-none">
            <div className="!absolute !bottom-0 !left-0 !w-full !h-full !bg-emerald-400/20 !rounded-tr-[100%] !transform !translate-y-10" />
            <motion.div custom={1} variants={treeVariants} initial="hidden" animate="visible" className="!absolute !bottom-0 !left-[15%] !text-emerald-800/20"><svg width="120" height="200" viewBox="0 0 100 180" fill="currentColor"><path d="M50 0 L90 120 L60 120 L60 180 L40 180 L40 120 L10 120 Z" /></svg></motion.div>
            <motion.div custom={2} variants={treeVariants} initial="hidden" animate="visible" className="!absolute !bottom-0 !right-[20%] !text-emerald-700/30 !transform !scale-110"><svg width="140" height="220" viewBox="0 0 100 180" fill="currentColor"><path d="M50 0 L90 120 L60 120 L60 180 L40 180 L40 120 L10 120 Z" /></svg></motion.div>
          </div>
        </motion.div>
        <div className="!w-full lg:!w-[55%] !relative !bg-emerald-900 !flex !items-center !justify-center !p-4 lg:!p-12">
          <div className="!hidden lg:!block !absolute !top-0 !-left-[100px] !w-[101px] !h-full !overflow-hidden !z-20"><svg className="!h-full !w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="#064e3b"><path d="M100 0 C 20 20 20 80 100 100 V 0 Z" /></svg></div>
          <motion.div className="!w-full !max-w-lg !relative !z-30 !text-center" initial="hidden" animate="visible" variants={formVariants}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 300 }} className="!w-24 !h-24 !bg-gradient-to-br !from-emerald-400 !to-emerald-600 !rounded-full !flex !items-center !justify-center !mx-auto !mb-6 !shadow-lg">
              <CheckCircle className="!w-12 !h-12 !text-white" />
            </motion.div>
            <h2 className="!text-3xl !font-bold !text-white !mb-3">¡Cuenta creada con éxito!</h2>
            <p className="!text-emerald-200/80 !mb-8 !leading-relaxed">
              Tu empresa <span className="!font-semibold !text-white">{formData.razonSocial}</span> ha sido registrada como{' '}
              <span className="!font-semibold !text-emerald-300">{typeLabel}</span>.
              <br /><br />
              Hemos recibido tus datos. Un administrador revisará tu cuenta pronto.
            </p>
            <div className="!space-y-3 !mb-8 !text-left">
              {[{ label: 'Empresa registrada', value: formData.razonSocial }, { label: 'Cuenta admin', value: formData.adminEmail }].map(({ label, value }) => (
                <div key={label} className="!flex !items-center !gap-3 !bg-emerald-800/50 !rounded-2xl !p-4 !text-sm">
                  <div className="!w-7 !h-7 !rounded-full !bg-emerald-500 !flex !items-center !justify-center !flex-shrink-0"><Check className="!w-4 !h-4 !text-white" /></div>
                  <span className="!text-emerald-200">{label}: <strong className="!text-white">{value}</strong></span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/auth/login')} className="!w-full !flex !items-center !justify-center !gap-2 !bg-gradient-to-r !from-emerald-400 !to-emerald-500 !text-emerald-900 !font-bold !py-4 !px-8 !rounded-full hover:!shadow-lg !transition-all !border-0 !cursor-pointer">
              Ir al inicio de sesión <ArrowRight className="!w-5 !h-5" />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="!min-h-screen !w-full !flex !overflow-hidden !bg-emerald-50">

      {/* LEFT PANEL */}
      <motion.div className="!hidden lg:!flex !w-[45%] !relative !bg-gradient-to-b !from-emerald-100 !via-emerald-200 !to-emerald-300 !flex-col !justify-center !items-center !p-12 !overflow-hidden" initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div className="!absolute !top-20 !right-20 !w-40 !h-40 !rounded-full !bg-yellow-100/50 !blur-3xl" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 8, repeat: Infinity }} />
        <div className="!relative !z-10 !max-w-lg !w-full !text-center">
          <motion.h2 className="!text-5xl !font-extrabold !text-emerald-900 !mb-6 !tracking-tight" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>Registro Empresarial</motion.h2>
          <motion.p className="!text-xl !text-emerald-800/80 !mb-8" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>Crea tu cuenta corporativa y comienza a compensar las emisiones de tu empresa.</motion.p>
          <motion.div className="!space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            {steps.map((label, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <div key={n} className={`!flex !items-center !gap-3 !rounded-2xl !p-3 !transition-all ${active ? '!bg-emerald-700/30' : '!bg-transparent'}`}>
                  <div className={`!w-8 !h-8 !rounded-full !flex !items-center !justify-center !text-sm !font-bold !flex-shrink-0 !transition-all ${done ? '!bg-emerald-600 !text-white' : active ? '!bg-emerald-800 !text-white !shadow-md' : '!bg-emerald-200 !text-emerald-600'}`}>
                    {done ? <Check className="!w-4 !h-4" /> : n}
                  </div>
                  <span className={`!text-sm !font-medium ${active ? '!text-emerald-900' : done ? '!text-emerald-700' : '!text-emerald-600/60'}`}>{label}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
        <div className="!absolute !bottom-0 !left-0 !right-0 !h-1/3 !z-0 !pointer-events-none">
          <div className="!absolute !bottom-0 !left-0 !w-full !h-full !bg-emerald-400/20 !rounded-tr-[100%] !transform !translate-y-10" />
          <motion.div custom={1} variants={treeVariants} initial="hidden" animate="visible" className="!absolute !bottom-0 !left-[15%] !text-emerald-800/20"><svg width="120" height="200" viewBox="0 0 100 180" fill="currentColor"><path d="M50 0 L90 120 L60 120 L60 180 L40 180 L40 120 L10 120 Z" /></svg></motion.div>
          <motion.div custom={2} variants={treeVariants} initial="hidden" animate="visible" className="!absolute !bottom-0 !right-[20%] !text-emerald-700/30 !transform !scale-110"><svg width="140" height="220" viewBox="0 0 100 180" fill="currentColor"><path d="M50 0 L90 120 L60 120 L60 180 L40 180 L40 120 L10 120 Z" /></svg></motion.div>
        </div>
      </motion.div>

      {/* RIGHT PANEL */}
      <div className="!w-full lg:!w-[55%] !relative !bg-emerald-900 !flex !items-center !justify-center !p-4 lg:!p-12 !overflow-y-auto">
        <div className="!hidden lg:!block !absolute !top-0 !-left-[100px] !w-[101px] !h-full !overflow-hidden !z-20"><svg className="!h-full !w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="#064e3b"><path d="M100 0 C 20 20 20 80 100 100 V 0 Z" /></svg></div>

        <motion.div className="!w-full !max-w-2xl !relative !z-30 !py-8" initial="hidden" animate="visible" variants={formVariants}>

          <button onClick={() => step === 1 ? navigate('/register') : setStep(step - 1)} className="!inline-flex !items-center !gap-2 !text-sm !text-emerald-200 hover:!text-white !transition-colors !mb-6 !bg-transparent !border-0 !cursor-pointer">
            <ArrowLeft className="!w-4 !h-4" />
            {step === 1 ? 'Volver a selección de cuenta' : 'Paso anterior'}
          </button>

          {/* Mobile progress bar */}
          <div className="!flex lg:!hidden !items-center !gap-2 !mb-6">
            {steps.map((label, i) => {
              const n = i + 1;
              const active = step === n;
              const done = step > n;
              return (
                <React.Fragment key={n}>
                  <div className="!flex !flex-col !items-center !gap-1 !flex-shrink-0">
                    <div className={`!w-8 !h-8 !rounded-full !flex !items-center !justify-center !text-sm !font-bold !transition-all ${done ? '!bg-emerald-500 !text-white' : active ? '!bg-emerald-400 !text-emerald-900' : '!bg-emerald-800 !text-emerald-500'}`}>
                      {done ? <Check className="!w-4 !h-4" /> : n}
                    </div>
                    <span className={`!text-xs !font-medium ${active ? '!text-emerald-300' : done ? '!text-emerald-500' : '!text-emerald-700'}`}>{label}</span>
                  </div>
                  {i < steps.length - 1 && <div className={`!flex-1 !h-1 !rounded-full !transition-all ${step > n ? '!bg-emerald-500' : '!bg-emerald-800'}`} />}
                </React.Fragment>
              );
            })}
          </div>

          {error && (
            <div className="!bg-red-900/40 !border !border-red-500/50 !rounded-2xl !p-4 !flex !items-start !gap-3 !mb-6">
              <AlertCircle className="!w-5 !h-5 !text-red-400 !flex-shrink-0 !mt-0.5" />
              <p className="!text-sm !text-red-300">{error}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>

              {/* STEP 1 */}
              {step === 1 && (
                <div>
                  <h2 className="!text-2xl !font-bold !text-white !mb-1">¿Qué tipo de empresa eres?</h2>
                  <p className="!text-sm !text-emerald-200/70 !mb-6">Selecciona la categoría que mejor describe tu organización</p>
                  <div className="!grid !grid-cols-2 sm:!grid-cols-3 !gap-3 !mb-8">
                    {COMPANY_TYPES.map(({ id, label, desc, icon: Icon }) => {
                      const selected = formData.companyType === id;
                      return (
                        <button key={id} type="button" onClick={() => { setFormData({ ...formData, companyType: id }); setError(''); }}
                          className={`!p-4 !rounded-2xl !border-2 !text-left !transition-all !cursor-pointer !bg-transparent ${selected ? '!border-emerald-400 !bg-emerald-700/50' : '!border-emerald-700/50 hover:!border-emerald-500 hover:!bg-emerald-800/50'}`}>
                          <div className={`!w-10 !h-10 !rounded-xl !flex !items-center !justify-center !mb-3 !transition-all ${selected ? '!bg-emerald-400' : '!bg-emerald-800'}`}>
                            <Icon className={`!w-5 !h-5 ${selected ? '!text-emerald-900' : '!text-emerald-400'}`} />
                          </div>
                          <p className={`!font-semibold !text-sm ${selected ? '!text-white' : '!text-emerald-200'}`}>{label}</p>
                          <p className={`!text-xs !mt-0.5 !leading-tight ${selected ? '!text-emerald-300' : '!text-emerald-500'}`}>{desc}</p>
                        </button>
                      );
                    })}
                  </div>
                  <button type="button" disabled={!canProceedStep1} onClick={() => { setError(''); setStep(2); }}
                    className="!w-full !flex !items-center !justify-center !gap-2 !bg-gradient-to-r !from-emerald-400 !to-emerald-500 !text-emerald-900 !font-bold !py-4 !px-8 !rounded-full hover:!shadow-lg !transition-all !border-0 !cursor-pointer disabled:!opacity-40 disabled:!cursor-not-allowed">
                    Continuar <ArrowRight className="!w-4 !h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div>
                  {(() => {
                    const ct = COMPANY_TYPES.find((t) => t.id === formData.companyType);
                    return ct ? (
                      <div className="!flex !items-center !gap-2 !mb-5 !px-4 !py-2 !bg-emerald-800/50 !rounded-full !border !border-emerald-700 !text-sm">
                        <ct.icon className="!w-4 !h-4 !text-emerald-400 !flex-shrink-0" />
                        <span className="!text-emerald-300 !font-medium">{ct.label}</span>
                        <button type="button" onClick={() => setStep(1)} className="!ml-auto !text-xs !text-emerald-400 !underline !border-0 !bg-transparent !cursor-pointer">Cambiar</button>
                      </div>
                    ) : null;
                  })()}
                  <h2 className="!text-2xl !font-bold !text-white !mb-1">Datos de la empresa</h2>
                  <p className="!text-sm !text-emerald-200/70 !mb-6">Los campos con <span className="!text-red-400">*</span> son obligatorios</p>
                  <div className="!space-y-5">
                    <div className="!grid sm:!grid-cols-2 !gap-5">
                      <div>
                        <label className={labelCls}>Razón Social <span className="!text-red-400">*</span></label>
                        <input type="text" name="razonSocial" value={formData.razonSocial} onChange={handleChange} className={inputCls} placeholder="Ej: LATAM Airlines Group S.A." />
                      </div>
                      <div>
                        <label className={labelCls}>RUT <span className="!text-red-400">*</span></label>
                        <input type="text" name="rut" value={formData.rut} onChange={handleChange} className={inputCls} placeholder="XX.XXX.XXX-X" />
                      </div>
                    </div>
                    <div className="!grid sm:!grid-cols-2 !gap-5">
                      <div>
                        <label className={labelCls}>Nombre Comercial</label>
                        <input type="text" name="nombreComercial" value={formData.nombreComercial} onChange={handleChange} className={inputCls} placeholder="Ej: LATAM" />
                      </div>
                      <div className="!relative">
                        <label className={labelCls}>Tamaño de empresa <span className="!text-red-400">*</span></label>
                        <select name="tamanoEmpresa" value={formData.tamanoEmpresa} onChange={handleChange} className={selectCls}>
                          <option value="" className="!bg-emerald-900">Seleccionar...</option>
                          <option value="micro" className="!bg-emerald-900">Microempresa (1–9)</option>
                          <option value="pequena" className="!bg-emerald-900">Pequeña (10–49)</option>
                          <option value="mediana" className="!bg-emerald-900">Mediana (50–199)</option>
                          <option value="grande" className="!bg-emerald-900">Grande (200+)</option>
                        </select>
                        <div className="!absolute !right-6 !bottom-4 !pointer-events-none !text-emerald-400"><svg className="!w-4 !h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></div>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Giro SII</label>
                      <input type="text" name="giroSii" value={formData.giroSii} onChange={handleChange} className={inputCls} placeholder="Ej: Transporte aéreo de pasajeros" />
                    </div>
                    <div className="!grid sm:!grid-cols-2 !gap-5">
                      <div>
                        <label className={labelCls}>Dirección</label>
                        <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className={inputCls} placeholder="Dirección de la empresa" />
                      </div>
                      <div>
                        <label className={labelCls}>Teléfono</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputCls} placeholder="+56 9 XXXX XXXX" />
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={handleStep2} className="!mt-8 !w-full !flex !items-center !justify-center !gap-2 !bg-gradient-to-r !from-emerald-400 !to-emerald-500 !text-emerald-900 !font-bold !py-4 !px-8 !rounded-full hover:!shadow-lg !transition-all !border-0 !cursor-pointer">
                    Continuar <ArrowRight className="!w-4 !h-4" />
                  </button>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <form onSubmit={handleSubmit}>
                  <h2 className="!text-2xl !font-bold !text-white !mb-1">Cuenta de administrador</h2>
                  <p className="!text-sm !text-emerald-200/70 !mb-6">Esta será la cuenta principal para gestionar tu empresa</p>
                  <div className="!space-y-5">
                    <div>
                      <label className={labelCls}><User className="!w-4 !h-4 !inline !mr-1" />Nombre completo <span className="!text-red-400">*</span></label>
                      <input type="text" name="adminName" value={formData.adminName} onChange={handleChange} required className={inputCls} placeholder="Tu nombre completo" />
                    </div>
                    <div>
                      <label className={labelCls}><Mail className="!w-4 !h-4 !inline !mr-1" />Email corporativo <span className="!text-red-400">*</span></label>
                      <input type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} required className={inputCls} placeholder="admin@empresa.com" />
                    </div>
                    <div className="!grid sm:!grid-cols-2 !gap-5">
                      <div>
                        <label className={labelCls}><Lock className="!w-4 !h-4 !inline !mr-1" />Contraseña <span className="!text-red-400">*</span></label>
                        <input type="password" name="adminPassword" value={formData.adminPassword} onChange={handleChange} required className={inputCls} placeholder="Mínimo 8 caracteres" />
                      </div>
                      <div>
                        <label className={labelCls}><Lock className="!w-4 !h-4 !inline !mr-1" />Confirmar contraseña <span className="!text-red-400">*</span></label>
                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className={inputCls} placeholder="Repetir contraseña" />
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="!mt-8 !w-full !flex !items-center !justify-center !gap-2 !bg-gradient-to-r !from-emerald-400 !to-emerald-500 !text-emerald-900 !font-bold !py-4 !px-8 !rounded-full hover:!shadow-lg !transition-all !border-0 !cursor-pointer disabled:!opacity-50 disabled:!cursor-not-allowed">
                    {isLoading ? <><Loader2 className="!w-5 !h-5 !animate-spin" /> Registrando...</> : <>Crear cuenta empresarial <ArrowRight className="!w-4 !h-4" /></>}
                  </button>
                  <p className="!text-center !text-emerald-400/70 !text-sm !mt-4">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/auth/login" className="!text-emerald-300 !font-semibold hover:!text-white !transition-colors">Iniciar sesión</Link>
                  </p>
                </form>
              )}

            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default B2BRegisterPage;