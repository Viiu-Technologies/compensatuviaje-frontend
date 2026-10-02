import React, { useEffect, useState } from 'react';
import { Building2, Leaf, Package, Settings, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../../auth/context/AuthContext';
import api from '../../../../shared/services/api';
import { getUserProfile, type UserProfile } from '../../services/profileService';
import { getMyCertificates, type B2BCertificate } from '../../services/certificatesService';
import { getMyOrders, type B2BOrder } from '../../services/ordersService';
import { btn, Card, CardHeader, ErrorState, Field, fmtDate, fmtInt, fmtTons, PageHeader, Skeleton, StatCard } from '../../ui';

/**
 * Tu perfil: datos de la persona y de la empresa, con cifras reales.
 *
 * Antes mostraba siempre "3 proyectos · 12 compensaciones · nivel Oro"
 * (texto fijo), guardaba teléfono, cargo y ubicación solo en este navegador
 * y, si el guardado fallaba, decía "Perfil actualizado exitosamente". La
 * edición vive ahora en Configuración, que sí guarda en el servidor.
 */

interface Company {
  razonSocial?: string;
  nombreComercial?: string;
  rut?: string;
  giroSii?: string;
  direccion?: string;
  phone?: string;
}

const ROLE_LABEL: Record<string, string> = {
  COMPANY_ADMIN: 'Administrador',
  COMPANY_USER: 'Usuario',
  COMPANY_VIEWER: 'Solo lectura',
};

const ProfileView: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [certificates, setCertificates] = useState<B2BCertificate[] | null>(null);
  const [orders, setOrders] = useState<B2BOrder[] | null>(null);

  const load = async () => {
    setLoading(true);
    setFailed(false);
    const [p, c, ce, o] = await Promise.allSettled([
      getUserProfile(),
      api.get('/b2b/company') as Promise<any>,
      getMyCertificates(),
      getMyOrders(),
    ]);
    const prof = p.status === 'fulfilled' ? p.value : null;
    setProfile(prof);
    setCompany(c.status === 'fulfilled' && c.value?.success ? c.value.data : null);
    setCertificates(ce.status === 'fulfilled' ? ce.value.certificates : null);
    setOrders(o.status === 'fulfilled' ? o.value.orders : null);
    setFailed(!prof && !user);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-1/2" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[118px]" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (failed) return <ErrorState title="No pudimos cargar tu perfil" onRetry={load} />;

  const name = profile?.name || user?.name || '';
  const email = profile?.email || user?.email || '';
  const companyName = company?.nombreComercial || company?.razonSocial || profile?.company?.razonSocial || user?.companyName || '';
  const tons = (certificates ?? []).filter((c) => c.status === 'issued').reduce((acc, c) => acc + (Number(c.tonsCompensated) || 0), 0);
  const approvedOrders = (orders ?? []).filter((o) => o.status === 'approved').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tu perfil"
        subtitle="Tus datos y los de tu empresa."
        actions={
          onNavigate ? (
            <button type="button" onClick={() => onNavigate('cuenta')} className={btn.secondary}>
              <Settings className="w-4 h-4" aria-hidden="true" />
              Editar en Configuración
            </button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Toneladas compensadas" icon={Leaf} value={certificates ? fmtTons(tons) : '—'} tone="good" hint="Según tus certificados" />
        <StatCard label="Certificados" icon={ShieldCheck} value={certificates ? fmtInt(certificates.length) : '—'} hint="Emitidos a tu empresa" />
        <StatCard
          label="Órdenes aprobadas"
          icon={Package}
          value={orders ? fmtInt(approvedOrders) : '—'}
          hint={orders ? `${fmtInt(orders.length)} en total` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card>
          <CardHeader title="Datos personales" icon={User} />
          <div className="flex items-center gap-4 mb-6">
            <span className="w-14 h-14 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xl font-semibold uppercase flex-shrink-0" aria-hidden="true">
              {(name || email || 'U').charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="m-0 text-base font-semibold text-gray-900 truncate">{name || 'Sin nombre'}</p>
              <p className="m-0 text-sm text-gray-500 truncate">{email}</p>
            </div>
          </div>
          <dl className="m-0 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <Field label="Teléfono">{profile?.phone || <span className="text-gray-500">Sin teléfono</span>}</Field>
            <Field label="Rol">{ROLE_LABEL[profile?.role || user?.role || ''] || profile?.role || user?.role || '—'}</Field>
            {profile?.createdAt && <Field label="Miembro desde">{fmtDate(profile.createdAt, 'long')}</Field>}
          </dl>
        </Card>

        <Card>
          <CardHeader title="Empresa" icon={Building2} />
          {company || companyName ? (
            <dl className="m-0 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <Field label="Razón social">{company?.razonSocial || companyName || '—'}</Field>
              {company?.nombreComercial && <Field label="Nombre comercial">{company.nombreComercial}</Field>}
              <Field label="RUT">{company?.rut || profile?.company?.rut || '—'}</Field>
              {company?.giroSii && <Field label="Giro">{company.giroSii}</Field>}
              {company?.direccion && (
                <Field label="Dirección" className="sm:col-span-2">
                  {company.direccion}
                </Field>
              )}
              {company?.phone && <Field label="Teléfono">{company.phone}</Field>}
            </dl>
          ) : (
            <p className="m-0 text-sm text-gray-500">No pudimos cargar los datos de la empresa.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfileView;
