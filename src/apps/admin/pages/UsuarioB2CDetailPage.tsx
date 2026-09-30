import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Inbox, UserX, Plane, FileText, Clock } from 'lucide-react';
import { getB2CUserDetail } from '../services/adminApi';
import {
  EmptyState, KpiCard, PageHeader, Panel, Segmented, Skeleton, StatusBadge,
  authProviderLabel, formatCLP, formatInt, kgToTonnes, timeAgo,
} from '../ui';

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

type Tab = 'history' | 'certificates' | 'activity';

const TYPE_LABELS: Record<string, string> = { flight: 'Vuelo', vuelo: 'Vuelo', car: 'Auto', bus: 'Bus', train: 'Tren' };

const kg = (n?: number) => `${(n ?? 0).toLocaleString('es-CL', { maximumFractionDigits: 1 })} kg`;

export default function UsuarioB2CDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('history');

  useEffect(() => {
    if (id) loadUser();
  }, [id]);

  const loadUser = async () => {
    setLoading(true);
    try {
      setData(await getB2CUserDetail(id!));
    } catch (error) {
      console.error('Error loading user detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const back = (
    <Link to="/admin/usuarios-b2c" className="adm-back">
      <ArrowLeft aria-hidden="true" /> Volver a Usuarios B2C
    </Link>
  );

  if (loading) {
    return (
      <div className="adm-page" aria-busy="true">
        {back}
        <Skeleton height={64} />
        <div className="adm-kpis">{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={104} />)}</div>
        <Skeleton height={280} />
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="adm-page">
        {back}
        <section className="adm-panel">
          <EmptyState icon={UserX} title="Usuario no encontrado" text="Puede que se haya eliminado o que el enlace esté incompleto." />
        </section>
      </div>
    );
  }

  const { user, stats, compensationHistory = [], certificates = [], recentActivity = [] } = data;
  const compensatedPct = stats?.totalEmissionsKg ? Math.round((stats.compensatedEmissionsKg / stats.totalEmissionsKg) * 100) : null;

  const meta = [
    user.nombre ? user.email : null,
    `Acceso con ${authProviderLabel(user.provider || 'email')}`,
    `Registrado el ${new Date(user.createdAt).toLocaleDateString('es-CL')}`,
    user.lastLoginAt ? `Último ingreso ${timeAgo(user.lastLoginAt).toLowerCase()}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="adm-page">
      {back}

      <PageHeader title={user.nombre || user.email} description={meta} />

      {/* Antes la tarjeta decía "Emisiones (kg)" y mostraba toneladas. */}
      <div className="adm-kpis">
        <KpiCard label="Cálculos" value={formatInt(stats?.totalCalculations)} context={`${formatInt(stats?.compensatedCount)} compensados`} />
        <KpiCard label="Emisiones calculadas" value={kgToTonnes(stats?.totalEmissionsKg)} unit="t" context="CO₂e de todos sus cálculos" />
        <KpiCard
          label="Emisiones compensadas"
          value={kgToTonnes(stats?.compensatedEmissionsKg)}
          unit="t"
          context={compensatedPct !== null ? `${compensatedPct} % de lo calculado` : 'Sin emisiones calculadas'}
        />
        <KpiCard label="Total pagado" value={formatCLP(stats?.totalSpentCLP)} context="En compensaciones" />
      </div>

      <Segmented
        label="Sección"
        options={[
          { value: 'history', label: `Cálculos · ${formatInt(compensationHistory.length)}` },
          { value: 'certificates', label: `Certificados · ${formatInt(certificates.length)}` },
          { value: 'activity', label: 'Actividad' },
        ]}
        value={activeTab}
        onChange={(v) => setActiveTab(v as Tab)}
      />

      {activeTab === 'history' && (
        <section className="adm-table-card">
          <div className="adm-table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th scope="col">Tipo</th>
                  <th scope="col">Ruta</th>
                  <th scope="col" className="adm-col-num">Emisiones</th>
                  <th scope="col" className="adm-col-num">Monto</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {compensationHistory.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState icon={Plane} title="Sin cálculos" /></td></tr>
                ) : (
                  compensationHistory.map((item) => (
                    <tr key={item.id}>
                      <td>{TYPE_LABELS[(item.type || 'vuelo').toLowerCase()] ?? item.type}</td>
                      <td>{item.origin && item.destination ? `${item.origin} → ${item.destination}` : <span className="adm-cell-mute">—</span>}</td>
                      <td className="adm-col-num">{kg(item.emissionsKg)}</td>
                      <td className="adm-col-num">{item.amountCLP ? formatCLP(item.amountCLP) : '—'}</td>
                      <td>
                        <StatusBadge tone={item.isCompensated ? 'success' : 'neutral'}>{item.isCompensated ? 'Compensado' : 'Sin compensar'}</StatusBadge>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleDateString('es-CL')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'certificates' && (
        <section className="adm-table-card">
          <div className="adm-table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th scope="col">Certificado</th>
                  <th scope="col" className="adm-col-num">Emisiones</th>
                  <th scope="col" className="adm-col-num">Monto</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Fecha</th>
                  <th scope="col" className="adm-col-actions"><span className="sr-only">Descargar</span></th>
                </tr>
              </thead>
              <tbody>
                {certificates.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState icon={FileText} title="Sin certificados" /></td></tr>
                ) : (
                  certificates.map((cert) => {
                    const issued = cert.status === 'issued' || cert.status === 'active';
                    const num = cert.certificateNumber || cert.id.slice(0, 8);
                    return (
                      <tr key={cert.id}>
                        <td className="adm-mono">{num}</td>
                        <td className="adm-col-num">{kg(cert.emissionsKg)}</td>
                        <td className="adm-col-num">{cert.amountCLP ? formatCLP(cert.amountCLP) : '—'}</td>
                        <td><StatusBadge tone={issued ? 'success' : 'neutral'}>{issued ? 'Emitido' : 'Pendiente'}</StatusBadge></td>
                        <td>{new Date(cert.createdAt).toLocaleDateString('es-CL')}</td>
                        <td className="adm-col-actions">
                          {cert.pdfUrl && (
                            <a href={cert.pdfUrl} target="_blank" rel="noreferrer" className="adm-icon-btn" title="Descargar PDF" aria-label={`Descargar certificado ${num}`}>
                              <Download aria-hidden="true" />
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'activity' && (
        <Panel title="Actividad reciente">
          {recentActivity.length === 0 ? (
            <EmptyState icon={Clock} title="Sin actividad reciente" />
          ) : (
            <ol className="adm-timeline">
              {recentActivity.map((item, i) => (
                <li key={i} className="adm-timeline__item">
                  <p className="adm-timeline__note" style={{ marginTop: 0 }}>{item.description}</p>
                  <p className="adm-timeline__meta">{timeAgo(item.timestamp)}</p>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      )}
    </div>
  );
}
