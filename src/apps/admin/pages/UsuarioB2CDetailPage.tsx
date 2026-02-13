import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Globe,
  Calendar,
  MapPin,
  Activity,
  TrendingUp,
  Leaf,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
  User,
  Shield,
  Plane,
  Download
} from 'lucide-react';
import { getB2CUserDetail } from '../services/adminApi';

interface UserDetail {
  user: {
    id: string;
    email: string;
    nombre?: string;
    avatarUrl?: string;
    provider?: string;
    preferredCurrency?: string;
    preferredLanguage?: string;
    newsletterOptIn?: boolean;
    totalEmissionsKg?: number;
    totalCompensatedKg?: number;
    totalFlights?: number;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt?: string;
  };
  stats: {
    totalCalculations: number;
    compensatedCount: number;
    totalEmissionsKg: number;
    compensatedEmissionsKg: number;
    totalSpentCLP: number;
  };
  compensationHistory: Array<{
    id: string;
    type?: string;
    origin?: string;
    destination?: string;
    emissionsKg?: number;
    amountCLP?: number;
    isCompensated?: boolean;
    compensatedAt?: string;
    createdAt: string;
  }>;
  certificates: Array<{
    id: string;
    certificateNumber?: string;
    emissionsKg?: number;
    amountCLP?: number;
    status?: string;
    pdfUrl?: string;
    createdAt: string;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    entityId?: string;
    entityType?: string;
  }>;
}

const providerConfig: Record<string, { label: string; color: string }> = {
  email: { label: 'Email', color: '!bg-slate-100 !text-slate-700' },
  google: { label: 'Google', color: '!bg-rose-100 !text-rose-700' },
  supabase: { label: 'Supabase', color: '!bg-emerald-100 !text-emerald-700' },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `Hace ${diffD}d`;
  return new Date(dateStr).toLocaleDateString('es-CL');
}

export default function UsuarioB2CDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'certificates' | 'activity'>('history');

  useEffect(() => {
    if (id) loadUser();
  }, [id]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const result = await getB2CUserDetail(id!);
      setData(result);
    } catch (error) {
      console.error('Error loading user detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className="!flex !items-center !justify-center !h-[60vh]">
        <div className="!relative !w-20 !h-20">
          <div className="!absolute !inset-0 !border-4 !border-indigo-100 !rounded-full"></div>
          <div className="!absolute !inset-0 !border-4 !border-indigo-600 !border-t-transparent !rounded-full !animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="!flex !flex-col !items-center !justify-center !h-[60vh] !gap-4">
        <XCircle className="!w-16 !h-16 !text-slate-200" />
        <p className="!text-slate-500 !font-bold">Usuario no encontrado</p>
        <button onClick={() => navigate('/admin/usuarios-b2c')} className="!text-indigo-600 !font-bold hover:!underline">
          Volver a la lista
        </button>
      </div>
    );
  }

  const { user, stats, compensationHistory, certificates, recentActivity } = data;
  const provider = providerConfig[user.provider || 'email'] || providerConfig.email;

  return (
    <div className="!space-y-8 !animate-in !fade-in !slide-in-from-bottom-4 !duration-700">
      {/* Back button */}
      <button
        onClick={() => navigate('/admin/usuarios-b2c')}
        className="!flex !items-center !gap-2 !text-slate-500 hover:!text-slate-900 !font-bold !transition-colors !bg-transparent !border-0"
      >
        <ArrowLeft className="!w-5 !h-5" />
        Volver a Usuarios B2C
      </button>

      {/* User Header */}
      <div className="!bg-gradient-to-r !from-slate-900 !to-indigo-900 !rounded-3xl !p-8 !text-white !relative !overflow-hidden">
        <div className="!absolute !top-0 !right-0 !w-64 !h-64 !bg-indigo-500/10 !rounded-full !-mr-32 !-mt-32 !blur-3xl" />
        <div className="!relative !flex !flex-col md:!flex-row !items-start md:!items-center !gap-6">
          <div className="!w-20 !h-20 !rounded-3xl !bg-white/10 !backdrop-blur-md !flex !items-center !justify-center !border !border-white/20 !text-3xl !font-black">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="!w-full !h-full !rounded-3xl !object-cover" />
            ) : (
              user.nombre?.charAt(0) || user.email.charAt(0).toUpperCase()
            )}
          </div>
          <div className="!flex-1">
            <h1 className="!text-3xl !font-black !tracking-tight">{user.nombre || 'Usuario B2C'}</h1>
            <div className="!flex !flex-wrap !gap-4 !mt-2 !text-slate-300 !text-sm">
              <span className="!flex !items-center !gap-1.5"><Mail className="!w-4 !h-4" /> {user.email}</span>
              <span className={`!inline-flex !items-center !gap-1.5 !px-3 !py-0.5 !rounded-full !text-xs !font-black ${provider.color}`}>
                <Shield className="!w-3 !h-3" /> {provider.label}
              </span>
              <span className="!flex !items-center !gap-1.5">
                <Calendar className="!w-4 !h-4" /> Registrado: {new Date(user.createdAt).toLocaleDateString('es-CL')}
              </span>
              {user.lastLoginAt && (
                <span className="!flex !items-center !gap-1.5">
                  <Clock className="!w-4 !h-4" /> Último acceso: {timeAgo(user.lastLoginAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-5 !gap-4">
        <div className="!bg-white !p-5 !rounded-2xl !shadow-sm !border !border-slate-100">
          <div className="!flex !items-center !gap-3 !mb-3">
            <div className="!p-2 !rounded-xl !bg-indigo-50 !text-indigo-600"><Activity className="!w-5 !h-5" /></div>
          </div>
          <p className="!text-xs !font-bold !text-slate-400 !uppercase !tracking-wider">Cálculos</p>
          <h3 className="!text-2xl !font-black !text-slate-900">{stats?.totalCalculations ?? 0}</h3>
        </div>
        <div className="!bg-white !p-5 !rounded-2xl !shadow-sm !border !border-slate-100">
          <div className="!flex !items-center !gap-3 !mb-3">
            <div className="!p-2 !rounded-xl !bg-emerald-50 !text-emerald-600"><CheckCircle2 className="!w-5 !h-5" /></div>
          </div>
          <p className="!text-xs !font-bold !text-slate-400 !uppercase !tracking-wider">Compensaciones</p>
          <h3 className="!text-2xl !font-black !text-slate-900">{stats?.compensatedCount ?? 0}</h3>
        </div>
        <div className="!bg-white !p-5 !rounded-2xl !shadow-sm !border !border-slate-100">
          <div className="!flex !items-center !gap-3 !mb-3">
            <div className="!p-2 !rounded-xl !bg-rose-50 !text-rose-600"><Leaf className="!w-5 !h-5" /></div>
          </div>
          <p className="!text-xs !font-bold !text-slate-400 !uppercase !tracking-wider">Emisiones (kg)</p>
          <h3 className="!text-2xl !font-black !text-slate-900">{((stats?.totalEmissionsKg ?? 0) / 1000).toFixed(1)}t</h3>
        </div>
        <div className="!bg-white !p-5 !rounded-2xl !shadow-sm !border !border-slate-100">
          <div className="!flex !items-center !gap-3 !mb-3">
            <div className="!p-2 !rounded-xl !bg-teal-50 !text-teal-600"><TrendingUp className="!w-5 !h-5" /></div>
          </div>
          <p className="!text-xs !font-bold !text-slate-400 !uppercase !tracking-wider">Compensado (kg)</p>
          <h3 className="!text-2xl !font-black !text-slate-900">{((stats?.compensatedEmissionsKg ?? 0) / 1000).toFixed(1)}t</h3>
        </div>
        <div className="!bg-white !p-5 !rounded-2xl !shadow-sm !border !border-slate-100">
          <div className="!flex !items-center !gap-3 !mb-3">
            <div className="!p-2 !rounded-xl !bg-amber-50 !text-amber-600"><DollarSign className="!w-5 !h-5" /></div>
          </div>
          <p className="!text-xs !font-bold !text-slate-400 !uppercase !tracking-wider">Total Gastado</p>
          <h3 className="!text-2xl !font-black !text-slate-900">{formatCurrency(stats?.totalSpentCLP ?? 0)}</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="!bg-white !p-2 !rounded-2xl !shadow-sm !border !border-slate-100 !flex !gap-2">
        {([
          { id: 'history' as const, label: 'Historial de Cálculos', icon: Plane },
          { id: 'certificates' as const, label: 'Certificados', icon: FileText },
          { id: 'activity' as const, label: 'Actividad Reciente', icon: Clock },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`!flex !items-center !gap-2 !px-5 !py-2.5 !rounded-xl !font-bold !text-sm !transition-all ${
              activeTab === tab.id
                ? '!bg-indigo-600 !text-white !shadow-lg'
                : '!text-slate-500 hover:!bg-slate-50'
            }`}
          >
            <tab.icon className="!w-4 !h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="!bg-white !rounded-3xl !shadow-sm !border !border-slate-100 !overflow-hidden">
        {activeTab === 'history' && (
          <>
            <div className="!p-6 !border-b !border-slate-100">
              <h3 className="!text-lg !font-black !text-slate-900">Historial de Cálculos y Compensaciones</h3>
            </div>
            {(compensationHistory?.length ?? 0) > 0 ? (
              <div className="!overflow-x-auto">
                <table className="!w-full !text-left">
                  <thead>
                    <tr className="!bg-slate-50/50">
                      <th className="!px-6 !py-4 !text-xs !font-black !text-slate-400 !uppercase !tracking-widest">Tipo</th>
                      <th className="!px-6 !py-4 !text-xs !font-black !text-slate-400 !uppercase !tracking-widest">Ruta</th>
                      <th className="!px-6 !py-4 !text-xs !font-black !text-slate-400 !uppercase !tracking-widest !text-right">Emisiones (kg)</th>
                      <th className="!px-6 !py-4 !text-xs !font-black !text-slate-400 !uppercase !tracking-widest !text-right">Monto</th>
                      <th className="!px-6 !py-4 !text-xs !font-black !text-slate-400 !uppercase !tracking-widest">Estado</th>
                      <th className="!px-6 !py-4 !text-xs !font-black !text-slate-400 !uppercase !tracking-widest">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="!divide-y !divide-slate-50">
                    {compensationHistory.map((item) => (
                      <tr key={item.id} className="hover:!bg-slate-50/50 !transition-colors">
                        <td className="!px-6 !py-4">
                          <span className="!inline-flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !text-xs !font-bold !bg-indigo-50 !text-indigo-700">
                            <Plane className="!w-3 !h-3" />
                            {item.type || 'Vuelo'}
                          </span>
                        </td>
                        <td className="!px-6 !py-4 !text-sm !font-medium !text-slate-700">
                          {item.origin && item.destination ? `${item.origin} → ${item.destination}` : '—'}
                        </td>
                        <td className="!px-6 !py-4 !text-right !font-bold !text-slate-900">
                          {(item.emissionsKg ?? 0).toLocaleString('es-CL', { maximumFractionDigits: 1 })}
                        </td>
                        <td className="!px-6 !py-4 !text-right !font-bold !text-slate-700">
                          {item.amountCLP ? formatCurrency(item.amountCLP) : '—'}
                        </td>
                        <td className="!px-6 !py-4">
                          {item.isCompensated ? (
                            <span className="!inline-flex !items-center !gap-1 !text-xs !font-bold !text-emerald-600">
                              <CheckCircle2 className="!w-3.5 !h-3.5" /> Compensado
                            </span>
                          ) : (
                            <span className="!inline-flex !items-center !gap-1 !text-xs !font-bold !text-slate-400">
                              <Clock className="!w-3.5 !h-3.5" /> Pendiente
                            </span>
                          )}
                        </td>
                        <td className="!px-6 !py-4 !text-sm !text-slate-500">
                          {new Date(item.createdAt).toLocaleDateString('es-CL')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="!flex !flex-col !items-center !justify-center !py-16 !gap-3">
                <Inbox className="!w-14 !h-14 !text-slate-200" />
                <p className="!text-slate-400 !font-medium">Sin historial de cálculos</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'certificates' && (
          <>
            <div className="!p-6 !border-b !border-slate-100">
              <h3 className="!text-lg !font-black !text-slate-900">Certificados de Compensación</h3>
            </div>
            {(certificates?.length ?? 0) > 0 ? (
              <div className="!p-6 !grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="!p-5 !rounded-2xl !border !border-slate-100 !bg-slate-50/50 !flex !items-start !justify-between !gap-4">
                    <div className="!flex !items-start !gap-4">
                      <div className="!p-3 !rounded-xl !bg-emerald-100 !text-emerald-600">
                        <FileText className="!w-6 !h-6" />
                      </div>
                      <div>
                        <p className="!font-black !text-slate-900 !text-sm">#{cert.certificateNumber || cert.id.slice(0, 8)}</p>
                        <p className="!text-xs !text-slate-500 !mt-1">{(cert.emissionsKg ?? 0).toFixed(1)} kg CO₂</p>
                        <p className="!text-xs !text-slate-500">{cert.amountCLP ? formatCurrency(cert.amountCLP) : '—'}</p>
                        <p className="!text-xs !text-slate-400 !mt-1">{new Date(cert.createdAt).toLocaleDateString('es-CL')}</p>
                      </div>
                    </div>
                    <div className="!flex !flex-col !items-end !gap-2">
                      <span className={`!inline-flex !items-center !gap-1 !px-2.5 !py-1 !rounded-full !text-[10px] !font-black !uppercase ${
                        cert.status === 'issued' || cert.status === 'active' 
                          ? '!bg-emerald-100 !text-emerald-700' 
                          : '!bg-slate-100 !text-slate-600'
                      }`}>
                        {cert.status === 'issued' || cert.status === 'active' ? 'Emitido' : cert.status || 'Pendiente'}
                      </span>
                      {cert.pdfUrl && (
                        <a href={cert.pdfUrl} target="_blank" rel="noreferrer" className="!p-1.5 !rounded-lg !bg-white !text-slate-500 hover:!text-indigo-600 !transition-colors !shadow-sm">
                          <Download className="!w-4 !h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="!flex !flex-col !items-center !justify-center !py-16 !gap-3">
                <Inbox className="!w-14 !h-14 !text-slate-200" />
                <p className="!text-slate-400 !font-medium">Sin certificados emitidos</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'activity' && (
          <>
            <div className="!p-6 !border-b !border-slate-100">
              <h3 className="!text-lg !font-black !text-slate-900">Actividad Reciente</h3>
            </div>
            {(recentActivity?.length ?? 0) > 0 ? (
              <div className="!p-6 !space-y-4">
                {recentActivity.map((item, i) => (
                  <div key={i} className="!flex !items-center !gap-4 !p-4 !rounded-2xl !bg-slate-50/50">
                    <div className="!p-2.5 !rounded-xl !bg-indigo-100 !text-indigo-600">
                      <Activity className="!w-5 !h-5" />
                    </div>
                    <div className="!flex-1">
                      <p className="!text-sm !font-bold !text-slate-900">{item.description}</p>
                      <p className="!text-xs !text-slate-400">{item.entityType}</p>
                    </div>
                    <span className="!text-xs !text-slate-400">{timeAgo(item.timestamp)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="!flex !flex-col !items-center !justify-center !py-16 !gap-3">
                <Inbox className="!w-14 !h-14 !text-slate-200" />
                <p className="!text-slate-400 !font-medium">Sin actividad reciente</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
