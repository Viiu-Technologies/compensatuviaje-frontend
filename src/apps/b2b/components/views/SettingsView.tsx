import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Building, Eye, EyeOff, HelpCircle, Mail, Shield, User } from 'lucide-react';
import { useAuth } from '../../../auth/context/AuthContext';
import api from '../../../../shared/services/api';
import { LEGAL } from '../../../../shared/config/legal';
import { Badge, btn, Card, CardHeader, cx, inputCls, labelCls, PageHeader, Skeleton, type Tone } from '../../ui';

/**
 * Configuración de la cuenta.
 *
 * Cambios respecto de la versión anterior:
 *  - "Cargo" y el teléfono se guardaban solo en este navegador; el teléfono
 *    ahora va al servidor y "Cargo" se quitó (el backend no lo guarda).
 *  - Se quitaron Apariencia (el panel usa siempre el tema claro) y las
 *    secciones vacías "Próximamente" (notificaciones, facturación, idioma, 2FA).
 */

type Section = 'profile' | 'security' | 'company' | 'help';

const SECTIONS: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'security', label: 'Contraseña', icon: Shield },
  { id: 'company', label: 'Empresa', icon: Building },
  { id: 'help', label: 'Ayuda', icon: HelpCircle },
];

const COMPANY_STATUS: Record<string, { label: string; tone: Tone }> = {
  active: { label: 'Activa', tone: 'success' },
  registered: { label: 'Pendiente de verificación', tone: 'warning' },
  pending_contract: { label: 'Contrato pendiente', tone: 'warning' },
  signed: { label: 'Contrato firmado', tone: 'info' },
  suspended: { label: 'Suspendida', tone: 'danger' },
};

const apiMessage = (e: unknown, fallback: string) => (e as any)?.response?.data?.message || (e as any)?.message || fallback;

const Labeled: React.FC<{ id: string; label: string; hint?: string; children: React.ReactNode; className?: string }> = ({ id, label, hint, children, className }) => (
  <div className={className}>
    <label htmlFor={id} className={labelCls}>
      {label}
    </label>
    {children}
    {hint && <p className="m-0 mt-1.5 text-xs text-gray-500">{hint}</p>}
  </div>
);

const ProfileSection: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: '' });

  useEffect(() => {
    (async () => {
      try {
        const res = (await api.get('/b2b/profile')) as any;
        if (res?.success && res.data) setForm({ name: res.data.name || user?.name || '', phone: res.data.phone || '' });
      } catch {
        /* se muestran los datos de la sesión */
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Escribe tu nombre');
    setSaving(true);
    try {
      const res = (await api.put('/b2b/profile', { name: form.name.trim(), phone: form.phone.trim() || undefined })) as any;
      if (!res?.success) throw new Error(res?.message);
      toast.success('Perfil guardado');
    } catch (err) {
      toast.error(apiMessage(err, 'No pudimos guardar tu perfil'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton className="h-64" />;
  return (
    <form onSubmit={save} className="space-y-5">
      <Labeled id="s-name" label="Nombre completo">
        <input id="s-name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} autoComplete="name" />
      </Labeled>
      <Labeled id="s-email" label="Email" hint="El email no se puede cambiar desde aquí. Escríbenos si necesitas hacerlo.">
        <input id="s-email" type="email" value={user?.email || ''} disabled className={inputCls} />
      </Labeled>
      <Labeled id="s-phone" label="Teléfono">
        <input
          id="s-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+56 9 0000 0000"
          className={inputCls}
          autoComplete="tel"
        />
      </Labeled>
      <div className="pt-2">
        <button type="submit" disabled={saving} className={btn.primary}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
};

const SecuritySection: React.FC = () => {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.next.length < 6) return setError('La nueva contraseña debe tener al menos 6 caracteres.');
    if (form.next !== form.confirm) return setError('Las contraseñas nuevas no coinciden.');
    setSaving(true);
    try {
      const res = (await api.put('/b2b/profile/password', { currentPassword: form.current, newPassword: form.next })) as any;
      if (!res?.success) throw new Error(res?.message);
      setForm({ current: '', next: '', confirm: '' });
      toast.success('Contraseña actualizada');
    } catch (err) {
      setError(apiMessage(err, 'No pudimos cambiar la contraseña. Revisa la contraseña actual.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-5 max-w-md">
      {error && (
        <p role="alert" className="m-0 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}
      <Labeled id="p-current" label="Contraseña actual">
        <input id="p-current" type={show ? 'text' : 'password'} value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} className={inputCls} autoComplete="current-password" required />
      </Labeled>
      <Labeled id="p-next" label="Nueva contraseña" hint="Mínimo 6 caracteres.">
        <div className="relative">
          <input id="p-next" type={show ? 'text' : 'password'} value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} className={cx(inputCls, 'pr-11')} autoComplete="new-password" required />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center border-0 bg-transparent text-gray-400 hover:text-gray-700 cursor-pointer"
          >
            {show ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>
      </Labeled>
      <Labeled id="p-confirm" label="Repite la nueva contraseña">
        <input id="p-confirm" type={show ? 'text' : 'password'} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className={inputCls} autoComplete="new-password" required />
      </Labeled>
      <button type="submit" disabled={saving || !form.current || !form.next || !form.confirm} className={btn.primary}>
        {saving ? 'Actualizando…' : 'Cambiar contraseña'}
      </button>
    </form>
  );
};

const CompanySection: React.FC<{ onStatus: (s: string) => void }> = ({ onStatus }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ razonSocial: '', nombreComercial: '', rut: '', giroSii: '', direccion: '', phone: '' });

  useEffect(() => {
    (async () => {
      try {
        const res = (await api.get('/b2b/company')) as any;
        if (res?.success && res.data) {
          const c = res.data;
          setForm({ razonSocial: c.razonSocial || '', nombreComercial: c.nombreComercial || '', rut: c.rut || '', giroSii: c.giroSii || '', direccion: c.direccion || '', phone: c.phone || '' });
          onStatus(c.status || '');
        }
      } catch {
        toast.error('No pudimos cargar los datos de la empresa');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { rut: _rut, ...payload } = form;
      const res = (await api.put('/b2b/company', payload)) as any;
      if (!res?.success) throw new Error(res?.message);
      toast.success('Datos de la empresa guardados');
    } catch (err) {
      toast.error(apiMessage(err, 'No pudimos guardar los datos de la empresa'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton className="h-80" />;
  return (
    <form onSubmit={save} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Labeled id="c-razon" label="Razón social">
          <input id="c-razon" type="text" value={form.razonSocial} onChange={(e) => setForm({ ...form, razonSocial: e.target.value })} className={inputCls} />
        </Labeled>
        <Labeled id="c-comercial" label="Nombre comercial">
          <input id="c-comercial" type="text" value={form.nombreComercial} onChange={(e) => setForm({ ...form, nombreComercial: e.target.value })} className={inputCls} />
        </Labeled>
        <Labeled id="c-rut" label="RUT" hint="No se puede cambiar. Escríbenos si hay un error.">
          <input id="c-rut" type="text" value={form.rut} disabled className={inputCls} />
        </Labeled>
        <Labeled id="c-giro" label="Giro">
          <input id="c-giro" type="text" value={form.giroSii} onChange={(e) => setForm({ ...form, giroSii: e.target.value })} placeholder="Ej.: transporte aéreo de pasajeros" className={inputCls} />
        </Labeled>
        <Labeled id="c-dir" label="Dirección" className="sm:col-span-2">
          <input id="c-dir" type="text" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} className={inputCls} />
        </Labeled>
        <Labeled id="c-phone" label="Teléfono de contacto">
          <input id="c-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+56 2 0000 0000" className={inputCls} />
        </Labeled>
      </div>
      <button type="submit" disabled={saving} className={btn.primary}>
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  );
};

const HelpSection: React.FC = () => (
  <div className="space-y-4">
    <a href={`mailto:${LEGAL.emails.support}`} className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 no-underline hover:border-brand-600 hover:bg-brand-50/40 transition-colors">
      <Mail className="w-5 h-5 text-brand-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <span>
        <span className="block text-sm font-semibold text-gray-900">Escribir a soporte</span>
        <span className="block text-sm text-gray-500">{LEGAL.emails.support}</span>
      </span>
    </a>
  </div>
);

const SettingsView: React.FC = () => {
  const [active, setActive] = useState<Section>('profile');
  const [companyStatus, setCompanyStatus] = useState('');
  const current = SECTIONS.find((s) => s.id === active)!;
  const status = COMPANY_STATUS[companyStatus];

  return (
    <div className="space-y-6">
      <PageHeader title="Configuración" subtitle="Tus datos, tu contraseña y los datos de la empresa." />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-2" aria-label="Secciones de configuración">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              aria-current={active === id ? 'page' : undefined}
              className={cx(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium border-0 cursor-pointer whitespace-nowrap transition-colors',
                active === id ? 'bg-brand-50 text-brand-800' : 'bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>

        <Card className="p-6 lg:col-span-3">
          <CardHeader
            title={current.id === 'security' ? 'Cambiar contraseña' : current.id === 'company' ? 'Datos de la empresa' : current.id === 'help' ? 'Ayuda' : 'Datos personales'}
            icon={current.icon}
            action={current.id === 'company' && status ? <Badge tone={status.tone}>{status.label}</Badge> : undefined}
          />
          {active === 'profile' && <ProfileSection />}
          {active === 'security' && <SecuritySection />}
          {active === 'company' && <CompanySection onStatus={setCompanyStatus} />}
          {active === 'help' && <HelpSection />}
        </Card>
      </div>
    </div>
  );
};

export default SettingsView;
