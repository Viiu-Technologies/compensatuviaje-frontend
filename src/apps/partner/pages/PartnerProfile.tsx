// ============================================
// PARTNER PROFILE PAGE
// Perfil y configuración del Partner
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PartnerProfile as PartnerProfileType,
  OnboardingStatus,
  BankDetailsResponse,
  UpdatePartnerProfileRequest,
  UpdateBankDetailsRequest,
  ChangePasswordRequest,
  PARTNER_STATUS_LABELS,
  PARTNER_STATUS_COLORS
} from '../../../types/partner.types';
import {
  getPartnerProfile,
  updatePartnerProfile,
  updatePartnerLogo,
  getOnboardingStatus,
  getBankDetails,
  updateBankDetails,
  changePassword
} from '../services/partnerApi';

// ============================================
// TAB NAVIGATION
// ============================================

type TabType = 'profile' | 'bank' | 'security';

interface TabProps {
  active: TabType;
  onChange: (tab: TabType) => void;
  onboardingStatus?: OnboardingStatus;
}

const TabNavigation: React.FC<TabProps> = ({ active, onChange, onboardingStatus }) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; needsAttention?: boolean }[] = [
    {
      id: 'profile',
      label: 'Perfil',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      needsAttention: onboardingStatus && (!onboardingStatus.steps.profile || !onboardingStatus.steps.logo)
    },
    {
      id: 'bank',
      label: 'Datos Bancarios',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      needsAttention: onboardingStatus && !onboardingStatus.steps.bank_details
    },
    {
      id: 'security',
      label: 'Seguridad',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex border-b border-gray-200 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors relative ${
            active === tab.id
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          {tab.icon}
          {tab.label}
          {tab.needsAttention && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
};

// ============================================
// PROFILE TAB CONTENT
// ============================================

interface ProfileTabProps {
  profile: PartnerProfileType | null;
  loading: boolean;
  onUpdate: () => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ profile, loading, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdatePartnerProfileRequest>({
    name: '',
    contact_email: '',
    website_url: ''
  });
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        contact_email: profile.contact_email,
        website_url: profile.website_url || ''
      });
      setLogoUrl(profile.logo_url || '');
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      await updatePartnerProfile(formData);
      setSuccess('Perfil actualizado correctamente');
      setEditing(false);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLogo = async () => {
    if (!logoUrl.trim()) return;
    
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      await updatePartnerLogo({ logo_url: logoUrl });
      setSuccess('Logo actualizado correctamente');
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el logo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-24 bg-gray-200 rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {profile && (
        <div className={`px-4 py-3 rounded-lg ${PARTNER_STATUS_COLORS[profile.status]}`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">
              Estado: {PARTNER_STATUS_LABELS[profile.status]}
            </span>
            {profile.status === 'onboarding' && (
              <span className="text-sm">
                Completa tu perfil para activar tu cuenta
              </span>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Logo Section */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Logo de la Organización</h3>
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            {profile?.logo_url ? (
              <img
                src={profile.logo_url}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL del Logo
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://ejemplo.com/logo.png"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button
                onClick={handleSaveLogo}
                disabled={saving || !logoUrl.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Ingresa la URL de tu logo (preferiblemente PNG o SVG)
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Información de la Organización</h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Editar
            </button>
          )}
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Organización *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editing}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de Contacto *
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                disabled={!editing}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sitio Web
              </label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                disabled={!editing}
                placeholder="https://www.ejemplo.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          {editing && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  if (profile) {
                    setFormData({
                      name: profile.name,
                      contact_email: profile.contact_email,
                      website_url: profile.website_url || ''
                    });
                  }
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// ============================================
// BANK DETAILS TAB CONTENT
// ============================================

interface BankTabProps {
  onUpdate: () => void;
}

const BankTab: React.FC<BankTabProps> = ({ onUpdate }) => {
  const [bankDetails, setBankDetails] = useState<BankDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateBankDetailsRequest>({
    bank_name: '',
    account_type: 'checking',
    account_number: '',
    account_holder_name: '',
    account_holder_rut: '',
    currency: 'CLP'
  });

  useEffect(() => {
    loadBankDetails();
  }, []);

  const loadBankDetails = async () => {
    try {
      setLoading(true);
      const data = await getBankDetails();
      setBankDetails(data);
      if (!data) {
        setEditing(true);
      }
    } catch (error) {
      console.error('Error loading bank details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      await updateBankDetails(formData);
      setSuccess('Datos bancarios actualizados correctamente');
      setEditing(false);
      loadBankDetails();
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar los datos bancarios');
    } finally {
      setSaving(false);
    }
  };

  const formatRut = (value: string): string => {
    const cleaned = value.replace(/[^0-9kK]/g, '');
    if (cleaned.length <= 1) return cleaned;
    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1).toUpperCase();
    const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formatted}-${dv}`;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-48 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  const banks = [
    'Banco de Chile',
    'Banco Estado',
    'Banco Santander Chile',
    'Banco BCI',
    'Banco Itaú Chile',
    'Banco Scotiabank Chile',
    'Banco BICE',
    'Banco Security',
    'Banco Falabella',
    'Banco Ripley',
    'Banco Consorcio',
    'Otro'
  ];

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium">
              Información importante
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Los datos bancarios son necesarios para recibir los pagos por compensaciones realizadas a través de tus proyectos ESG.
            </p>
          </div>
        </div>
      </div>

      {/* Current Bank Details or Form */}
      <div className="bg-white rounded-lg border p-6">
        {!editing && bankDetails ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Datos Bancarios Registrados</h3>
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Modificar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Banco</p>
                <p className="font-medium text-gray-800">{bankDetails.bank_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tipo de Cuenta</p>
                <p className="font-medium text-gray-800">
                  {bankDetails.account_type === 'checking' ? 'Cuenta Corriente' : 'Cuenta de Ahorro'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Número de Cuenta</p>
                <p className="font-medium text-gray-800">{bankDetails.account_number_masked}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Titular</p>
                <p className="font-medium text-gray-800">{bankDetails.account_holder_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">RUT Titular</p>
                <p className="font-medium text-gray-800">{bankDetails.account_holder_rut_masked}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Moneda</p>
                <p className="font-medium text-gray-800">{bankDetails.currency}</p>
              </div>
            </div>

            {bankDetails.last_updated && (
              <p className="text-sm text-gray-500 mt-6 pt-4 border-t">
                Última actualización: {new Date(bankDetails.last_updated).toLocaleDateString('es-CL')}
              </p>
            )}
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              {bankDetails ? 'Modificar Datos Bancarios' : 'Configurar Datos Bancarios'}
            </h3>

            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banco *
                  </label>
                  <select
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Seleccionar banco...</option>
                    {banks.map((bank) => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Cuenta *
                  </label>
                  <select
                    value={formData.account_type}
                    onChange={(e) => setFormData({ ...formData, account_type: e.target.value as 'checking' | 'savings' })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="checking">Cuenta Corriente</option>
                    <option value="savings">Cuenta de Ahorro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Cuenta *
                  </label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value.replace(/[^0-9]/g, '') })}
                    required
                    placeholder="Ej: 12345678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Titular *
                  </label>
                  <input
                    type="text"
                    value={formData.account_holder_name}
                    onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                    required
                    placeholder="Nombre completo"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RUT del Titular *
                  </label>
                  <input
                    type="text"
                    value={formData.account_holder_rut}
                    onChange={(e) => setFormData({ ...formData, account_holder_rut: formatRut(e.target.value) })}
                    required
                    placeholder="12.345.678-9"
                    maxLength={12}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moneda *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'CLP' | 'USD' })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="CLP">Peso Chileno (CLP)</option>
                    <option value="USD">Dólar Estadounidense (USD)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                {bankDetails && (
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Datos Bancarios'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================
// SECURITY TAB CONTENT
// ============================================

const SecurityTab: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<ChangePasswordRequest & { confirmPassword: string }>({
    current_password: '',
    new_password: '',
    confirmPassword: ''
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.new_password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.new_password.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    setSaving(true);

    try {
      await changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password
      });
      setSuccess('Contraseña actualizada correctamente');
      setFormData({
        current_password: '',
        new_password: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Change Password Form */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Cambiar Contraseña</h3>

        <form onSubmit={handleChangePassword} className="max-w-md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña Actual *
              </label>
              <input
                type="password"
                value={formData.current_password}
                onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña *
              </label>
              <input
                type="password"
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                required
                minLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-sm text-gray-500 mt-1">Mínimo 8 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nueva Contraseña *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ============================================
// MAIN PROFILE PAGE COMPONENT
// ============================================

const PartnerProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [profile, setProfile] = useState<PartnerProfileType | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingStatus | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, onboardingData] = await Promise.all([
        getPartnerProfile(),
        getOnboardingStatus()
      ]);
      setProfile(profileData);
      setOnboarding(onboardingData || undefined);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link
              to="/partner"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
              <p className="text-gray-500 mt-1">Configura tu cuenta y datos de la organización</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6">
            <TabNavigation
              active={activeTab}
              onChange={setActiveTab}
              onboardingStatus={onboarding}
            />

            {activeTab === 'profile' && (
              <ProfileTab
                profile={profile}
                loading={loading}
                onUpdate={loadData}
              />
            )}
            {activeTab === 'bank' && (
              <BankTab onUpdate={loadData} />
            )}
            {activeTab === 'security' && (
              <SecurityTab />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerProfilePage;
