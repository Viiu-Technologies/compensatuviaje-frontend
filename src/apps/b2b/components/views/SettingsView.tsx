import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Bell, Shield, CreditCard, Globe, Palette, HelpCircle, LogOut,
  ChevronRight, Moon, Sun, Mail, Smartphone, Eye, EyeOff, Check, X,
  AlertTriangle, Trash2, Building, FileText, Monitor, Loader2, Save
} from 'lucide-react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useAuth } from '../../../auth/context/AuthContext';
import api from '../../../../shared/services/api';

// ─── helpers ──────────────────────────────────────────────────────────────────
const splitName = (full: string) => {
  const parts = full.trim().split(' ');
  const last = parts.length > 1 ? parts.slice(1).join(' ') : '';
  return { first: parts[0] || '', last };
};

const inputCls = (isDark: boolean) =>
  `!w-full !px-4 !py-2.5 !border !rounded-xl focus:!ring-2 focus:!ring-green-500 focus:!border-transparent !outline-none !transition-colors ${
    isDark
      ? '!bg-gray-700/50 !border-gray-600 !text-gray-100'
      : '!bg-white !border-gray-200 !text-gray-900'
  }`;

const labelCls = (isDark: boolean) =>
  `!block !text-sm !font-medium !mb-1.5 ${isDark ? '!text-gray-300' : '!text-gray-700'}`;

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast: React.FC<{ msg: string; type: 'success' | 'error'; onClose: () => void }> = ({
  msg, type, onClose,
}) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className={`!flex !items-center !gap-2 !px-4 !py-3 !rounded-xl !mb-4 !text-sm !font-medium ${
      type === 'success'
        ? '!bg-green-100 !text-green-800 dark:!bg-green-900/40 dark:!text-green-300'
        : '!bg-red-100 !text-red-800 dark:!bg-red-900/40 dark:!text-red-300'
    }`}
  >
    {type === 'success' ? <Check className="!w-4 !h-4" /> : <AlertTriangle className="!w-4 !h-4" />}
    <span className="!flex-1">{msg}</span>
    <button onClick={onClose} className="!border-0 !bg-transparent !cursor-pointer !opacity-60 hover:!opacity-100">
      <X className="!w-4 !h-4" />
    </button>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const SettingsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('profile');
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, logout } = useAuth();
  const isDark = resolvedTheme === 'dark';

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Profile state ──────────────────────────────────────────────────────────
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const { first: initFirst, last: initLast } = splitName(user?.name || '');
  const [profileForm, setProfileForm] = useState({
    firstName: initFirst,
    lastName: initLast,
    phone: '',
    position: '',
  });

  useEffect(() => {
    const load = async () => {
      setProfileLoading(true);
      try {
        const res = await api.get('/b2b/profile') as any;
        if (res?.success && res?.data) {
          const { first, last } = splitName(res.data.name || user?.name || '');
          const saved = JSON.parse(localStorage.getItem('b2b_profile_extra') || '{}');
          setProfileForm({
            firstName: first,
            lastName: last,
            phone: saved.phone || '',
            position: saved.position || '',
          });
        }
      } catch {
        const saved = JSON.parse(localStorage.getItem('b2b_profile_extra') || '{}');
        setProfileForm((f) => ({ ...f, phone: saved.phone || '', position: saved.position || '' }));
      } finally {
        setProfileLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const fullName = `${profileForm.firstName.trim()} ${profileForm.lastName.trim()}`.trim();
      const res = await api.put('/b2b/profile', { name: fullName }) as any;
      if (res?.success) {
        localStorage.setItem('b2b_profile_extra', JSON.stringify({ phone: profileForm.phone, position: profileForm.position }));
        showToast('Perfil actualizado exitosamente');
      } else {
        showToast(res?.message || 'Error al guardar', 'error');
      }
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Error al guardar', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Password state ─────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, next: false });

  const handleSavePassword = async () => {
    if (pwForm.next !== pwForm.confirm) { showToast('Las contraseñas nuevas no coinciden', 'error'); return; }
    if (pwForm.next.length < 6) { showToast('La contraseña debe tener al menos 6 caracteres', 'error'); return; }
    setPwSaving(true);
    try {
      const res = await api.put('/b2b/profile/password', { currentPassword: pwForm.current, newPassword: pwForm.next }) as any;
      if (res?.success) {
        setPwForm({ current: '', next: '', confirm: '' });
        showToast('Contraseña actualizada exitosamente');
      } else {
        showToast(res?.message || 'Error al actualizar contraseña', 'error');
      }
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Contraseña actual incorrecta', 'error');
    } finally {
      setPwSaving(false);
    }
  };

  // ── Company state ──────────────────────────────────────────────────────────
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companySaving, setCompanySaving] = useState(false);
  const [companyForm, setCompanyForm] = useState({ razonSocial: '', nombreComercial: '', rut: '', giroSii: '', direccion: '', phone: '' });
  const [companyStatus, setCompanyStatus] = useState('');

  useEffect(() => {
    if (activeSection !== 'company') return;
    const load = async () => {
      setCompanyLoading(true);
      try {
        const res = await api.get('/b2b/company') as any;
        if (res?.success && res?.data) {
          const c = res.data;
          setCompanyForm({ razonSocial: c.razonSocial || '', nombreComercial: c.nombreComercial || '', rut: c.rut || '', giroSii: c.giroSii || '', direccion: c.direccion || '', phone: c.phone || '' });
          setCompanyStatus(c.status || '');
        }
      } catch { showToast('No se pudo cargar la información de empresa', 'error'); }
      finally { setCompanyLoading(false); }
    };
    load();
  }, [activeSection]);

  const handleSaveCompany = async () => {
    setCompanySaving(true);
    try {
      const res = await api.put('/b2b/company', { razonSocial: companyForm.razonSocial, nombreComercial: companyForm.nombreComercial, giroSii: companyForm.giroSii, direccion: companyForm.direccion, phone: companyForm.phone }) as any;
      if (res?.success) { showToast('Empresa actualizada exitosamente'); }
      else { showToast(res?.message || 'Error al guardar empresa', 'error'); }
    } catch (e: any) { showToast(e?.response?.data?.message || 'Error al guardar empresa', 'error'); }
    finally { setCompanySaving(false); }
  };

  // ── Sections ───────────────────────────────────────────────────────────────
  const sections = [
    { id: 'profile',       label: 'Perfil',         icon: User },
    { id: 'security',      label: 'Seguridad',       icon: Shield },
    { id: 'company',       label: 'Empresa',         icon: Building },
    { id: 'appearance',    label: 'Apariencia',      icon: Palette },
    { id: 'notifications', label: 'Notificaciones',  icon: Bell },
    { id: 'billing',       label: 'Facturación',     icon: CreditCard },
    { id: 'language',      label: 'Idioma y región', icon: Globe },
    { id: 'help',          label: 'Ayuda',           icon: HelpCircle },
  ];

  // ── Renders ────────────────────────────────────────────────────────────────
  const renderProfile = () => (
    <div className="!space-y-6">
      <h3 className={`!text-lg !font-semibold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Información personal</h3>
      {profileLoading ? (
        <div className="!flex !justify-center !py-8"><Loader2 className="!w-6 !h-6 !animate-spin !text-green-500" /></div>
      ) : (
        <div className="!space-y-4">
          <div className="!grid sm:!grid-cols-2 !gap-4">
            <div>
              <label className={labelCls(isDark)}>Nombre</label>
              <input type="text" value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} className={inputCls(isDark)} placeholder="Tu nombre" />
            </div>
            <div>
              <label className={labelCls(isDark)}>Apellido</label>
              <input type="text" value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} className={inputCls(isDark)} placeholder="Tu apellido" />
            </div>
          </div>
          <div>
            <label className={labelCls(isDark)}>Email</label>
            <div className="!flex !items-center !gap-2">
              <input type="email" value={user?.email || ''} readOnly className={`${inputCls(isDark)} !opacity-70 !cursor-not-allowed`} />
              <span className={`!px-3 !py-1 !text-xs !font-medium !rounded-full !whitespace-nowrap ${isDark ? '!bg-green-900/50 !text-green-300' : '!bg-green-100 !text-green-700'}`}>Verificado</span>
            </div>
            <p className={`!text-xs !mt-1 ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>El email no puede cambiarse desde aquí</p>
          </div>
          <div>
            <label className={labelCls(isDark)}>Teléfono</label>
            <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className={inputCls(isDark)} placeholder="+56 9 0000 0000" />
          </div>
          <div>
            <label className={labelCls(isDark)}>Cargo</label>
            <input type="text" value={profileForm.position} onChange={(e) => setProfileForm({ ...profileForm, position: e.target.value })} className={inputCls(isDark)} placeholder="Ej: Gerente de Sostenibilidad" />
          </div>
          <div className={`!pt-4 !border-t ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
            <button onClick={handleSaveProfile} disabled={profileSaving} className="!flex !items-center !gap-2 !px-6 !py-2.5 !bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !rounded-xl !font-medium hover:!shadow-lg !transition-all !border-0 disabled:!opacity-60 disabled:!cursor-not-allowed">
              {profileSaving ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : <Save className="!w-4 !h-4" />}
              {profileSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderSecurity = () => (
    <div className="!space-y-6">
      <div>
        <h3 className={`!text-lg !font-semibold !mb-4 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Cambiar contraseña</h3>
        <div className="!space-y-4">
          {(['current', 'next'] as const).map((field) => (
            <div key={field}>
              <label className={labelCls(isDark)}>{field === 'current' ? 'Contraseña actual' : 'Nueva contraseña'}</label>
              <div className="!relative">
                <input type={showPw[field] ? 'text' : 'password'} value={pwForm[field]} onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })} className={`${inputCls(isDark)} !pr-12`} placeholder={field === 'current' ? '••••••••' : 'Mínimo 6 caracteres'} />
                <button onClick={() => setShowPw({ ...showPw, [field]: !showPw[field] })} className={`!absolute !right-3 !top-1/2 !-translate-y-1/2 !border-0 !bg-transparent ${isDark ? '!text-gray-500 hover:!text-gray-400' : '!text-gray-400 hover:!text-gray-600'}`}>
                  {showPw[field] ? <EyeOff className="!w-5 !h-5" /> : <Eye className="!w-5 !h-5" />}
                </button>
              </div>
            </div>
          ))}
          <div>
            <label className={labelCls(isDark)}>Confirmar contraseña</label>
            <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} className={inputCls(isDark)} placeholder="Repite la nueva contraseña" />
          </div>
        </div>
        <button onClick={handleSavePassword} disabled={pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm} className="!mt-4 !flex !items-center !gap-2 !px-6 !py-2.5 !bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !rounded-xl !font-medium hover:!shadow-lg !transition-all !border-0 disabled:!opacity-50 disabled:!cursor-not-allowed">
          {pwSaving ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : <Shield className="!w-4 !h-4" />}
          {pwSaving ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>
      </div>
      <div className={`!pt-6 !border-t ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
        <h3 className={`!text-lg !font-semibold !mb-4 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Autenticación de dos factores</h3>
        <div className={`!flex !items-center !justify-between !p-4 !rounded-xl !border ${isDark ? '!bg-yellow-900/20 !border-yellow-800/30' : '!bg-yellow-50 !border-yellow-200'}`}>
          <div className="!flex !items-center !gap-3">
            <div className={`!w-10 !h-10 !rounded-xl !flex !items-center !justify-center ${isDark ? '!bg-yellow-900/30' : '!bg-yellow-100'}`}>
              <Shield className={`!w-5 !h-5 ${isDark ? '!text-yellow-400' : '!text-yellow-600'}`} />
            </div>
            <div>
              <p className={`!font-medium ${isDark ? '!text-yellow-300' : '!text-gray-900'}`}>Autenticación de 2 factores</p>
              <p className={`!text-sm ${isDark ? '!text-yellow-200/60' : '!text-gray-500'}`}>Añade una capa extra de seguridad a tu cuenta</p>
            </div>
          </div>
          <span className={`!px-3 !py-1 !text-xs !font-medium !rounded-full !whitespace-nowrap ${isDark ? '!bg-gray-700 !text-gray-400' : '!bg-gray-100 !text-gray-500'}`}>Próximamente</span>
        </div>
      </div>
    </div>
  );

  const renderCompany = () => (
    <div className="!space-y-6">
      <div className="!flex !items-center !justify-between">
        <h3 className={`!text-lg !font-semibold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Información de la empresa</h3>
        {companyStatus && (
          <span className={`!px-3 !py-1 !text-xs !font-semibold !rounded-full ${
            companyStatus === 'active' ? (isDark ? '!bg-green-900/50 !text-green-300' : '!bg-green-100 !text-green-700')
            : (isDark ? '!bg-yellow-900/50 !text-yellow-300' : '!bg-yellow-100 !text-yellow-700')
          }`}>
            {companyStatus === 'active' ? 'Activa' : companyStatus === 'registered' ? 'Pendiente de verificación' : companyStatus === 'pending_contract' ? 'Pendiente de contrato' : companyStatus}
          </span>
        )}
      </div>
      {companyLoading ? (
        <div className="!flex !justify-center !py-8"><Loader2 className="!w-6 !h-6 !animate-spin !text-green-500" /></div>
      ) : (
        <div className="!space-y-4">
          <div className="!grid sm:!grid-cols-2 !gap-4">
            <div>
              <label className={labelCls(isDark)}>Razón Social</label>
              <input type="text" value={companyForm.razonSocial} onChange={(e) => setCompanyForm({ ...companyForm, razonSocial: e.target.value })} className={inputCls(isDark)} placeholder="Nombre legal de la empresa" />
            </div>
            <div>
              <label className={labelCls(isDark)}>Nombre Comercial</label>
              <input type="text" value={companyForm.nombreComercial} onChange={(e) => setCompanyForm({ ...companyForm, nombreComercial: e.target.value })} className={inputCls(isDark)} placeholder="Nombre que aparece al público" />
            </div>
          </div>
          <div>
            <label className={labelCls(isDark)}>RUT</label>
            <input type="text" value={companyForm.rut} readOnly className={`${inputCls(isDark)} !opacity-70 !cursor-not-allowed`} />
            <p className={`!text-xs !mt-1 ${isDark ? '!text-gray-500' : '!text-gray-400'}`}>El RUT no puede modificarse. Contacta a soporte si hay un error.</p>
          </div>
          <div>
            <label className={labelCls(isDark)}>Giro SII</label>
            <input type="text" value={companyForm.giroSii} onChange={(e) => setCompanyForm({ ...companyForm, giroSii: e.target.value })} className={inputCls(isDark)} placeholder="Ej: Transporte aéreo de pasajeros" />
          </div>
          <div>
            <label className={labelCls(isDark)}>Dirección</label>
            <input type="text" value={companyForm.direccion} onChange={(e) => setCompanyForm({ ...companyForm, direccion: e.target.value })} className={inputCls(isDark)} placeholder="Dirección de la empresa" />
          </div>
          <div>
            <label className={labelCls(isDark)}>Teléfono de contacto</label>
            <input type="tel" value={companyForm.phone} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} className={inputCls(isDark)} placeholder="+56 2 0000 0000" />
          </div>
          <div className={`!pt-4 !border-t ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
            <button onClick={handleSaveCompany} disabled={companySaving} className="!flex !items-center !gap-2 !px-6 !py-2.5 !bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !rounded-xl !font-medium hover:!shadow-lg !transition-all !border-0 disabled:!opacity-60 disabled:!cursor-not-allowed">
              {companySaving ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : <Save className="!w-4 !h-4" />}
              {companySaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderAppearance = () => (
    <div className="!space-y-6">
      <h3 className={`!text-lg !font-semibold !mb-4 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Tema de la aplicación</h3>
      <div className="!grid !grid-cols-3 !gap-4">
        {([
          { id: 'light' as const, icon: Sun, label: 'Claro', color: '!text-yellow-500' },
          { id: 'dark' as const, icon: Moon, label: 'Oscuro', color: '!text-indigo-500' },
          { id: 'system' as const, icon: Monitor, label: 'Sistema', color: '!text-gray-500' },
        ]).map(({ id, icon: Icon, label, color }) => (
          <button key={id} onClick={() => setTheme(id)} className={`!p-4 !rounded-xl !border-2 !transition-all !bg-transparent ${theme === id ? (isDark ? '!border-green-500 !bg-green-900/30' : '!border-green-500 !bg-green-50') : (isDark ? '!border-gray-600 hover:!border-gray-500' : '!border-gray-200 hover:!border-gray-300')}`}>
            <Icon className={`!w-8 !h-8 !mx-auto !mb-2 ${color}`} />
            <p className={`!text-sm !font-medium !text-center ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>{label}</p>
          </button>
        ))}
      </div>
      <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
        {theme === 'system' ? `Usando el tema del sistema (${resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'})` : `Tema seleccionado: ${theme === 'dark' ? 'Oscuro' : 'Claro'}`}
      </p>
    </div>
  );

  const renderComingSoon = (icon: React.ReactNode) => (
    <div className="!flex !flex-col !items-center !justify-center !py-16 !text-center">
      <div className={`!w-16 !h-16 !rounded-2xl !flex !items-center !justify-center !mb-4 ${isDark ? '!bg-gray-700' : '!bg-gray-100'}`}>{icon}</div>
      <h3 className={`!text-lg !font-semibold !mb-2 ${isDark ? '!text-gray-200' : '!text-gray-700'}`}>Próximamente</h3>
      <p className={`!text-sm !max-w-xs ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Esta sección estará disponible pronto. Estamos trabajando en ella.</p>
    </div>
  );

  const renderHelp = () => (
    <div className="!space-y-4">
      <a href="mailto:soporte@compensatuviaje.com" className={`!p-6 !rounded-2xl !border !transition-colors !cursor-pointer hover:!shadow-md !no-underline !block ${isDark ? '!bg-green-900/20 !border-green-800/30' : '!bg-green-50 !border-green-200'}`}>
        <Mail className={`!w-8 !h-8 !mb-3 ${isDark ? '!text-green-400' : '!text-green-500'}`} />
        <h4 className={`!font-semibold !mb-1 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Contactar soporte</h4>
        <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-600'}`}>soporte@compensatuviaje.com</p>
      </a>
      <div className={`!p-6 !rounded-2xl !border ${isDark ? '!bg-blue-900/20 !border-blue-800/30' : '!bg-blue-50 !border-blue-200'}`}>
        <HelpCircle className={`!w-8 !h-8 !mb-3 ${isDark ? '!text-blue-400' : '!text-blue-500'}`} />
        <h4 className={`!font-semibold !mb-1 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Centro de ayuda</h4>
        <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-600'}`}>Guías y preguntas frecuentes — Próximamente</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':       return renderProfile();
      case 'security':      return renderSecurity();
      case 'company':       return renderCompany();
      case 'appearance':    return renderAppearance();
      case 'help':          return renderHelp();
      case 'notifications': return renderComingSoon(<Bell className={`!w-8 !h-8 ${isDark ? '!text-gray-400' : '!text-gray-400'}`} />);
      case 'billing':       return renderComingSoon(<CreditCard className={`!w-8 !h-8 ${isDark ? '!text-gray-400' : '!text-gray-400'}`} />);
      case 'language':      return renderComingSoon(<Globe className={`!w-8 !h-8 ${isDark ? '!text-gray-400' : '!text-gray-400'}`} />);
      default:              return renderProfile();
    }
  };

  return (
    <div className="!space-y-6">
      <div>
        <h1 className={`!text-2xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Configuración de cuenta</h1>
        <p className={`!text-sm !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Administra tu cuenta y preferencias</p>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="!grid lg:!grid-cols-4 !gap-6">
        <div className="lg:!col-span-1">
          <nav className={`!rounded-2xl !p-2 !border !transition-colors ${isDark ? '!bg-gray-800/50 !border-gray-700/50' : '!bg-white !border-gray-200 !shadow-sm'}`}>
            {sections.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveSection(id)} className={`!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !text-left !transition-all !border-0 ${activeSection === id ? '!bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white' : isDark ? '!bg-transparent !text-gray-400 hover:!bg-gray-700/50 hover:!text-gray-200' : '!bg-transparent !text-gray-600 hover:!bg-gray-100'}`}>
                <Icon className="!w-5 !h-5" />
                <span className="!font-medium">{label}</span>
                {activeSection === id && <ChevronRight className="!w-4 !h-4 !ml-auto" />}
              </button>
            ))}
            <div className={`!border-t !mt-2 !pt-2 ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
              <button onClick={logout} className={`!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !text-left !transition-all !border-0 !bg-transparent ${isDark ? '!text-red-400 hover:!bg-red-900/20' : '!text-red-600 hover:!bg-red-50'}`}>
                <LogOut className="!w-5 !h-5" />
                <span className="!font-medium">Cerrar sesión</span>
              </button>
            </div>
          </nav>
        </div>

        <div className="lg:!col-span-3">
          <motion.div key={activeSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className={`!rounded-2xl !p-6 !border !transition-colors ${isDark ? '!bg-gray-800/50 !border-gray-700/50' : '!bg-white !border-gray-200 !shadow-sm'}`}>
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
