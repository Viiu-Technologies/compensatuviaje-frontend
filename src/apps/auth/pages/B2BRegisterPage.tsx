import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2, Mail, Lock, User, Phone, MapPin, FileText,
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

const API_URL = import.meta.env.VITE_APP_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-gray-900 bg-white placeholder-gray-400';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

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

  // ── Step validation ────────────────────────────────────────────────────────
  const canProceedStep1 = formData.companyType !== '';
  const canProceedStep2 = formData.razonSocial.trim() !== '' && formData.rut.trim() !== '' && formData.tamanoEmpresa !== '';

  const handleStep2 = () => {
    if (!canProceedStep2) { setError('Por favor completa los campos obligatorios (*)'); return; }
    setError('');
    setStep(3);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.adminPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (formData.adminPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

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

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    const typeLabel = COMPANY_TYPES.find((t) => t.id === formData.companyType)?.label || '';
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-lg w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cuenta creada con éxito!</h2>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            Tu empresa <span className="font-semibold text-gray-800">{formData.razonSocial}</span> ha sido registrada como{' '}
            <span className="font-semibold text-green-600">{typeLabel}</span>.
            <br /><br />
            Hemos recibido tus datos y un administrador revisará tu cuenta. Puedes iniciar sesión ahora.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-left bg-green-50 rounded-xl p-3 text-sm">
              <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-700">Empresa registrada: <strong>{formData.razonSocial}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-left bg-green-50 rounded-xl p-3 text-sm">
              <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-700">Cuenta admin: <strong>{formData.adminEmail}</strong></span>
            </div>
          </div>

          <button
            onClick={() => navigate('/auth/login')}
            className="mt-8 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all border-0"
          >
            Ir al inicio de sesión
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Progress indicator ─────────────────────────────────────────────────────
  const steps = ['Tipo de empresa', 'Datos de empresa', 'Cuenta admin'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => step === 1 ? navigate('/auth/register') : setStep(step - 1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6 text-sm border-0 bg-transparent cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 1 ? 'Volver a selección de cuenta' : 'Paso anterior'}
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-green-500/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Registro Empresarial</h1>
              <p className="text-sm text-gray-500">Crea tu cuenta corporativa de compensación</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            {steps.map((label, i) => {
              const n = i + 1;
              const active = step === n;
              const done = step > n;
              return (
                <React.Fragment key={n}>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      done  ? 'bg-green-500 text-white'
                      : active ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/30'
                      : 'bg-gray-200 text-gray-400'
                    }`}>
                      {done ? <Check className="w-4 h-4" /> : n}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${active ? 'text-green-600' : done ? 'text-gray-500' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-1 rounded-full transition-all ${step > n ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-6">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* ── STEP 1: Company type ────────────────────────────────────── */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">¿Qué tipo de empresa eres?</h2>
                <p className="text-sm text-gray-500 mb-6">Selecciona la categoría que mejor describe tu organización</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {COMPANY_TYPES.map(({ id, label, desc, icon: Icon }) => {
                    const selected = formData.companyType === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => { setFormData({ ...formData, companyType: id }); setError(''); }}
                        className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer bg-white ${
                          selected
                            ? 'border-green-500 bg-green-50 shadow-md shadow-green-500/20'
                            : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                          selected ? 'bg-green-500' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${selected ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <p className={`font-semibold text-sm ${selected ? 'text-green-700' : 'text-gray-800'}`}>{label}</p>
                        <p className={`text-xs mt-0.5 leading-tight ${selected ? 'text-green-600' : 'text-gray-400'}`}>{desc}</p>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={!canProceedStep1}
                  onClick={() => { setError(''); setStep(2); }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all border-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── STEP 2: Company data ────────────────────────────────────── */}
            {step === 2 && (
              <div>
                {(() => {
                  const ct = COMPANY_TYPES.find((t) => t.id === formData.companyType);
                  return ct ? (
                    <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-green-50 rounded-xl border border-green-200 text-sm">
                      <ct.icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-green-700 font-medium">{ct.label}</span>
                      <button type="button" onClick={() => setStep(1)} className="ml-auto text-xs text-green-600 underline border-0 bg-transparent cursor-pointer">Cambiar</button>
                    </div>
                  ) : null;
                })()}

                <h2 className="text-xl font-bold text-gray-900 mb-1">Datos de la empresa</h2>
                <p className="text-sm text-gray-500 mb-5">Los campos con <span className="text-red-500">*</span> son obligatorios</p>

                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Razón Social <span className="text-red-500">*</span></label>
                      <input type="text" name="razonSocial" value={formData.razonSocial} onChange={handleChange} required className={inputCls} placeholder="Ej: LATAM Airlines Group S.A." />
                    </div>
                    <div>
                      <label className={labelCls}>RUT <span className="text-red-500">*</span></label>
                      <input type="text" name="rut" value={formData.rut} onChange={handleChange} required className={inputCls} placeholder="XX.XXX.XXX-X" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Nombre Comercial</label>
                      <input type="text" name="nombreComercial" value={formData.nombreComercial} onChange={handleChange} className={inputCls} placeholder="Ej: LATAM" />
                    </div>
                    <div>
                      <label className={labelCls}>Tamaño de empresa <span className="text-red-500">*</span></label>
                      <select name="tamanoEmpresa" value={formData.tamanoEmpresa} onChange={handleChange} required className={inputCls}>
                        <option value="">Seleccionar...</option>
                        <option value="micro">Microempresa (1–9)</option>
                        <option value="pequena">Pequeña (10–49)</option>
                        <option value="mediana">Mediana (50–199)</option>
                        <option value="grande">Grande (200+)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Giro SII</label>
                    <input type="text" name="giroSii" value={formData.giroSii} onChange={handleChange} className={inputCls} placeholder="Ej: Transporte aéreo de pasajeros" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
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

                <button
                  type="button"
                  onClick={handleStep2}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all border-0"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── STEP 3: Admin account ───────────────────────────────────── */}
            {step === 3 && (
              <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Cuenta de administrador</h2>
                <p className="text-sm text-gray-500 mb-5">Esta será la cuenta principal para gestionar tu empresa</p>

                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Nombre completo <span className="text-red-500">*</span></label>
                    <input type="text" name="adminName" value={formData.adminName} onChange={handleChange} required className={inputCls} placeholder="Tu nombre completo" />
                  </div>
                  <div>
                    <label className={labelCls}>Email corporativo <span className="text-red-500">*</span></label>
                    <input type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} required className={inputCls} placeholder="admin@empresa.com" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Contraseña <span className="text-red-500">*</span></label>
                      <input type="password" name="adminPassword" value={formData.adminPassword} onChange={handleChange} required className={inputCls} placeholder="Mínimo 8 caracteres" />
                    </div>
                    <div>
                      <label className={labelCls}>Confirmar contraseña <span className="text-red-500">*</span></label>
                      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className={inputCls} placeholder="Repetir contraseña" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Registrando...</> : <>Crear cuenta empresarial</>}
                </button>

                <p className="text-center text-gray-500 text-sm mt-4">
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/auth/login" className="text-green-600 font-semibold hover:text-green-700">Iniciar sesión</Link>
                </p>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default B2BRegisterPage;
