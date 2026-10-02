// ============================================
// PARTNER PROFILE PAGE
// Perfil, datos bancarios y contraseña del partner
// ============================================

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Building2, CreditCard, ImageIcon, Info, Lock, UserCircle } from 'lucide-react';
import {
  BankDetailsResponse,
  ChangePasswordRequest,
  OnboardingStatus,
  PARTNER_STATUS_LABELS,
  PartnerProfile as PartnerProfileType,
  PartnerStatus,
  UpdateBankDetailsRequest,
  UpdatePartnerProfileRequest,
} from '../../../types/partner.types';
import {
  changePassword,
  getBankDetails,
  getOnboardingStatus,
  getPartnerProfile,
  updateBankDetails,
  updatePartnerLogo,
  updatePartnerProfile,
} from '../services/partnerApi';
import { usePartnerContext } from '../context/PartnerContext';
import {
  Badge,
  btn,
  Card,
  CardHeader,
  cx,
  ErrorState,
  Field,
  fmtDate,
  inputCls,
  labelCls,
  PageHeader,
  Skeleton,
  type Tone,
} from '../ui';

const apiMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

const STATUS_TEXT: Record<PartnerStatus, string> = {
  onboarding: 'Cuenta en configuración',
  active: 'Cuenta activa',
  suspended: 'Cuenta suspendida',
  inactive: 'Cuenta inactiva',
};

const STATUS_TONES: Record<PartnerStatus, Tone> = {
  onboarding: 'warning',
  active: 'success',
  suspended: 'danger',
  inactive: 'neutral',
};

const Label: React.FC<{ htmlFor: string; required?: boolean; children: React.ReactNode }> = ({ htmlFor, required, children }) => (
  <label htmlFor={htmlFor} className={labelCls}>
    {children}
    {required && (
      <span className="text-rose-600 ml-0.5" aria-hidden="true">
        *
      </span>
    )}
  </label>
);

const FormError: React.FC<{ message: string | null }> = ({ message }) =>
  message ? (
    <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      {message}
    </div>
  ) : null;

// ============================================
// TABS
// ============================================

type TabType = 'profile' | 'bank' | 'security';

const Tabs: React.FC<{ active: TabType; onChange: (t: TabType) => void; onboarding?: OnboardingStatus }> = ({ active, onChange, onboarding }) => {
  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; attention?: boolean }[] = [
    { id: 'profile', label: 'Organización', icon: UserCircle, attention: !!onboarding && (!onboarding.steps.profile || !onboarding.steps.logo) },
    { id: 'bank', label: 'Datos bancarios', icon: CreditCard, attention: !!onboarding && !onboarding.steps.bank_details },
    { id: 'security', label: 'Seguridad', icon: Lock },
  ];
  return (
    <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto" role="tablist" aria-label="Secciones del perfil">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={cx(
            'relative flex items-center gap-2 px-4 py-3 -mb-px border-0 border-b-2 bg-transparent text-sm font-medium cursor-pointer whitespace-nowrap transition-colors',
            active === t.id ? 'border-brand-700 text-brand-800' : 'border-transparent text-gray-500 hover:text-gray-800',
          )}
        >
          <t.icon className="w-4 h-4" aria-hidden="true" />
          {t.label}
          {t.attention && <span className="w-2 h-2 rounded-full bg-amber-400" aria-label="Pendiente" />}
        </button>
      ))}
    </div>
  );
};

// ============================================
// ORGANIZACIÓN
// ============================================

const ProfileTab: React.FC<{ profile: PartnerProfileType | null; onUpdate: () => void }> = ({ profile, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingLogo, setSavingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdatePartnerProfileRequest>({ name: '', contact_email: '', website_url: '' });
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoMode, setLogoMode] = useState<'url' | 'file'>('file');

  const reset = () => {
    if (!profile) return;
    setFormData({ name: profile.name, contact_email: profile.contact_email, website_url: profile.website_url || '' });
  };

  useEffect(() => {
    reset();
    if (profile) {
      setLogoUrl(profile.logo_url || '');
      setLogoMode(profile.logo_url ? 'url' : 'file');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updatePartnerProfile(formData);
      toast.success('Datos de la organización guardados');
      setEditing(false);
      onUpdate();
    } catch (err) {
      setError(apiMessage(err, 'No pudimos guardar los datos. Inténtalo de nuevo.'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLogo = async () => {
    if (logoMode === 'url' && !logoUrl.trim()) return;
    if (logoMode === 'file' && !logoFile) return;
    setSavingLogo(true);
    try {
      await updatePartnerLogo({
        logo_url: logoMode === 'url' ? logoUrl.trim() : undefined,
        logo_file: logoMode === 'file' ? logoFile : undefined,
      });
      toast.success('Logo actualizado');
      setLogoFile(null);
      onUpdate();
    } catch (err) {
      toast.error(apiMessage(err, 'No pudimos actualizar el logo'));
    } finally {
      setSavingLogo(false);
    }
  };

  const preview = logoMode === 'file' && logoFile ? URL.createObjectURL(logoFile) : profile?.logo_url;

  return (
    <div className="space-y-6">
      <Card className="p-6 border-gray-200">
        <CardHeader title="Logo" subtitle="Se muestra en tus proyectos y en los certificados." icon={ImageIcon} />
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-28 h-28 rounded-xl border border-gray-200 bg-white flex items-center justify-center p-2 flex-shrink-0">
            {preview ? (
              <img src={preview} alt="Logo de la organización" className="max-w-full max-h-full object-contain" />
            ) : (
              <Building2 className="w-8 h-8 text-gray-300" aria-hidden="true" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex rounded-full bg-gray-100 p-1 mb-3" role="group" aria-label="Origen del logo">
              {(['file', 'url'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={logoMode === m}
                  onClick={() => setLogoMode(m)}
                  className={cx(
                    'rounded-full border-0 px-3.5 py-1 text-xs font-semibold cursor-pointer',
                    logoMode === m ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-800',
                  )}
                >
                  {m === 'file' ? 'Subir archivo' : 'Usar una URL'}
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {logoMode === 'url' ? (
                <input
                  type="url"
                  aria-label="URL del logo"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://ejemplo.com/logo.png"
                  className={cx(inputCls, 'flex-1 min-w-0')}
                />
              ) : (
                <input
                  type="file"
                  aria-label="Archivo del logo"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                  className={cx(
                    inputCls,
                    'flex-1 min-w-0 py-2 file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-brand-800',
                  )}
                />
              )}
              <button
                type="button"
                onClick={handleSaveLogo}
                disabled={savingLogo || (logoMode === 'url' ? !logoUrl.trim() || logoUrl.trim() === profile?.logo_url : !logoFile)}
                className={btn.primary}
              >
                {savingLogo ? 'Guardando…' : 'Guardar logo'}
              </button>
            </div>
            <p className="m-0 mt-1.5 text-xs text-gray-500">PNG, JPG, WEBP o SVG. Mejor con fondo transparente.</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Datos de la organización"
          icon={Building2}
          action={
            !editing ? (
              <button type="button" onClick={() => setEditing(true)} className={cx(btn.secondary, btn.sm)}>
                Editar
              </button>
            ) : undefined
          }
        />
        {!editing ? (
          <dl className="m-0 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <Field label="Nombre">{profile?.name || '—'}</Field>
            <Field label="Email de contacto">{profile?.contact_email || '—'}</Field>
            <Field label="Sitio web" className="sm:col-span-2">
              {profile?.website_url ? (
                <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:text-brand-800 break-all">
                  {profile.website_url}
                </a>
              ) : (
                <span className="text-gray-500">Sin sitio web</span>
              )}
            </Field>
          </dl>
        ) : (
          <form onSubmit={handleSaveProfile}>
            <FormError message={error} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="p-name" required>
                  Nombre de la organización
                </Label>
                <input
                  id="p-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <Label htmlFor="p-email" required>
                  Email de contacto
                </Label>
                <input
                  id="p-email"
                  type="email"
                  required
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="p-web">Sitio web</Label>
                <input
                  id="p-web"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://www.ejemplo.cl"
                  className={inputCls}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-5 border-t border-gray-100">
              <button
                type="button"
                className={btn.secondary}
                onClick={() => {
                  setEditing(false);
                  setError(null);
                  reset();
                }}
              >
                Cancelar
              </button>
              <button type="submit" disabled={saving} className={btn.primary}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

// ============================================
// DATOS BANCARIOS
// ============================================

const BANKS = [
  'Banco de Chile', 'Banco Estado', 'Banco Santander Chile', 'Banco BCI', 'Banco Itaú Chile', 'Banco Scotiabank Chile',
  'Banco BICE', 'Banco Security', 'Banco Falabella', 'Banco Ripley', 'Banco Consorcio', 'Otro',
];

const EMPTY_BANK: UpdateBankDetailsRequest = {
  bank_name: '',
  account_type: 'checking',
  account_number: '',
  account_holder_name: '',
  account_holder_rut: '',
  currency: 'CLP',
};

const formatRut = (value: string): string => {
  const cleaned = value.replace(/[^0-9kK]/g, '');
  if (cleaned.length <= 1) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1).toUpperCase();
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
};

const BankTab: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
  const [bankDetails, setBankDetails] = useState<BankDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateBankDetailsRequest>(EMPTY_BANK);

  const loadBankDetails = async () => {
    try {
      setLoading(true);
      setLoadFailed(false);
      const data = await getBankDetails();
      setBankDetails(data);
      if (!data) setEditing(true);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBankDetails();
  }, []);

  // Antes "Modificar" abría el formulario vacío y había que reescribir todo.
  const startEditing = () => {
    if (bankDetails) {
      setFormData({
        bank_name: bankDetails.bank_name,
        account_type: bankDetails.account_type === 'savings' ? 'savings' : 'checking',
        account_number: bankDetails.account_number,
        account_holder_name: bankDetails.account_holder_name,
        account_holder_rut: bankDetails.account_holder_rut,
        currency: 'CLP',
      });
    }
    setError(null);
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateBankDetails(formData);
      toast.success('Datos bancarios guardados');
      setEditing(false);
      loadBankDetails();
      onUpdate();
    } catch (err) {
      setError(apiMessage(err, 'No pudimos guardar los datos bancarios. Inténtalo de nuevo.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton className="h-72" />;
  if (loadFailed) return <ErrorState title="No pudimos cargar tus datos bancarios" onRetry={loadBankDetails} />;

  return (
    <div className="space-y-6">
      <div className="flex gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <Info className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="m-0 text-sm text-gray-600">
          Los usamos para transferirte los pagos por las compensaciones de tus proyectos.
        </p>
      </div>

      <Card>
        {!editing && bankDetails ? (
          <>
            <CardHeader
              title="Cuenta registrada"
              icon={CreditCard}
              action={
                <button type="button" onClick={startEditing} className={cx(btn.secondary, btn.sm)}>
                  Modificar
                </button>
              }
            />
            <dl className="m-0 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <Field label="Banco">{bankDetails.bank_name}</Field>
              <Field label="Tipo de cuenta">{bankDetails.account_type === 'savings' ? 'Cuenta de ahorro' : 'Cuenta corriente'}</Field>
              <Field label="Número de cuenta">
                <span className="tabular-nums">{bankDetails.account_number}</span>
              </Field>
              <Field label="Titular">{bankDetails.account_holder_name}</Field>
              <Field label="RUT del titular">
                <span className="tabular-nums">{bankDetails.account_holder_rut}</span>
              </Field>
              <Field label="Moneda">{bankDetails.currency}</Field>
            </dl>
            {bankDetails.updated_at && (
              <p className="m-0 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
                Actualizado el {fmtDate(bankDetails.updated_at, 'long')}
              </p>
            )}
          </>
        ) : (
          <>
            <CardHeader title={bankDetails ? 'Modificar cuenta' : 'Agrega tu cuenta bancaria'} icon={CreditCard} />
            <form onSubmit={handleSave}>
              <FormError message={error} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="b-bank" required>
                    Banco
                  </Label>
                  <select
                    id="b-bank"
                    required
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">Selecciona un banco</option>
                    {BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="b-type" required>
                    Tipo de cuenta
                  </Label>
                  <select
                    id="b-type"
                    required
                    value={formData.account_type}
                    onChange={(e) => setFormData({ ...formData, account_type: e.target.value as 'checking' | 'savings' })}
                    className={inputCls}
                  >
                    <option value="checking">Cuenta corriente</option>
                    <option value="savings">Cuenta de ahorro</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="b-number" required>
                    Número de cuenta
                  </Label>
                  <input
                    id="b-number"
                    type="text"
                    inputMode="numeric"
                    required
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="Ej.: 12345678"
                    className={inputCls}
                  />
                </div>
                <div>
                  <Label htmlFor="b-holder" required>
                    Nombre del titular
                  </Label>
                  <input
                    id="b-holder"
                    type="text"
                    required
                    value={formData.account_holder_name}
                    onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                    placeholder="Nombre completo o razón social"
                    className={inputCls}
                  />
                </div>
                <div>
                  <Label htmlFor="b-rut" required>
                    RUT del titular
                  </Label>
                  <input
                    id="b-rut"
                    type="text"
                    required
                    maxLength={12}
                    value={formData.account_holder_rut}
                    onChange={(e) => setFormData({ ...formData, account_holder_rut: formatRut(e.target.value) })}
                    placeholder="12.345.678-9"
                    className={inputCls}
                  />
                </div>
                <div>
                  <Label htmlFor="b-currency">Moneda</Label>
                  <select id="b-currency" value="CLP" disabled className={inputCls}>
                    <option value="CLP">Peso chileno (CLP)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6 pt-5 border-t border-gray-100">
                {bankDetails && (
                  <button type="button" onClick={() => setEditing(false)} className={btn.secondary}>
                    Cancelar
                  </button>
                )}
                <button type="submit" disabled={saving} className={btn.primary}>
                  {saving ? 'Guardando…' : 'Guardar datos bancarios'}
                </button>
              </div>
            </form>
          </>
        )}
      </Card>
    </div>
  );
};

// ============================================
// SEGURIDAD
// ============================================

const SecurityTab: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ChangePasswordRequest & { confirmPassword: string }>({
    current_password: '',
    new_password: '',
    confirmPassword: '',
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.new_password.length < 8) return setError('La nueva contraseña debe tener al menos 8 caracteres.');
    if (formData.new_password !== formData.confirmPassword) return setError('Las contraseñas nuevas no coinciden.');
    setSaving(true);
    try {
      await changePassword({ current_password: formData.current_password, new_password: formData.new_password });
      toast.success('Contraseña actualizada');
      setFormData({ current_password: '', new_password: '', confirmPassword: '' });
    } catch (err) {
      setError(apiMessage(err, 'No pudimos cambiar la contraseña. Revisa la contraseña actual.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Cambiar contraseña" icon={Lock} />
      <form onSubmit={handleChangePassword} className="max-w-md">
        <FormError message={error} />
        <div className="space-y-5">
          <div>
            <Label htmlFor="s-current" required>
              Contraseña actual
            </Label>
            <input
              id="s-current"
              type="password"
              autoComplete="current-password"
              required
              value={formData.current_password}
              onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <Label htmlFor="s-new" required>
              Nueva contraseña
            </Label>
            <input
              id="s-new"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={formData.new_password}
              onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              className={inputCls}
            />
            <p className="m-0 mt-1.5 text-xs text-gray-500">Mínimo 8 caracteres.</p>
          </div>
          <div>
            <Label htmlFor="s-confirm" required>
              Repite la nueva contraseña
            </Label>
            <input
              id="s-confirm"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
        <button type="submit" disabled={saving} className={cx(btn.primary, 'mt-6')}>
          {saving ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
      </form>
    </Card>
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
  const { refetch: refetchPartnerContext } = usePartnerContext();

  const loadData = async () => {
    try {
      const [p, o] = await Promise.allSettled([getPartnerProfile(), getOnboardingStatus()]);
      if (p.status === 'fulfilled') setProfile(p.value);
      if (o.status === 'fulfilled') setOnboarding(o.value || undefined);
      // Avisar al PartnerLayout (y cualquier otra pantalla) del cambio,
      // para que el "doble candado" de navegación se actualice sin F5.
      refetchPartnerContext();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Mi perfil"
        subtitle="Datos de tu organización, cuenta bancaria y acceso."
        meta={
          profile ? (
            <Badge tone={STATUS_TONES[profile.status] ?? 'neutral'}>{STATUS_TEXT[profile.status] ?? PARTNER_STATUS_LABELS[profile.status] ?? profile.status}</Badge>
          ) : undefined
        }
      />

      {profile?.status === 'onboarding' && (
        <div className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="m-0 text-sm text-amber-900">Completa los datos de tu organización, el logo y la cuenta bancaria para activar tu cuenta.</p>
        </div>
      )}

      <Tabs active={activeTab} onChange={setActiveTab} onboarding={onboarding} />

      {activeTab === 'profile' && (loading ? <Skeleton className="h-96" /> : <ProfileTab profile={profile} onUpdate={loadData} />)}
      {activeTab === 'bank' && <BankTab onUpdate={loadData} />}
      {activeTab === 'security' && <SecurityTab />}
    </div>
  );
};

export default PartnerProfilePage;
