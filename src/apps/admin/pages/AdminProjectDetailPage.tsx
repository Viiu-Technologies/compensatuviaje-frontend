/**
 * Admin Project Detail Page
 * 
 * Vista de solo lectura del detalle de un proyecto ESG para el Admin.
 * Accesible desde la tabla de "Proyectos ESG" (Inventario).
 * 
 * Muestra: fotos, documentos, evaluaciones IA, pricing, stock, certificados,
 * y acciones de inventario (pausar/reactivar).
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  TreePine,
  Droplets,
  Shirt,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  Activity,
  Pause,
  Play,
  ExternalLink,
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Clock,
  FileText,
  Award,
  BarChart3,
  Leaf,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatCLP } from '../../../utils/currency';
import {
  getProjectDetail,
  ProjectDetailData,
  ProjectDetailEvaluation,
  ProjectDetailPricing,
  ProjectDetailCertificate,
} from '../services/adminApi';
import api from '../../../shared/services/api';
import PhotoCarousel from '../../../shared/components/PhotoCarousel';
import DocumentViewer from '../../../shared/components/DocumentViewer';

// ── Config ────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Borrador', color: '!text-slate-600', bgColor: '!bg-slate-100' },
  pending_review: { label: 'En Revisión', color: '!text-amber-700', bgColor: '!bg-amber-100' },
  approved: { label: 'Aprobado', color: '!text-blue-700', bgColor: '!bg-blue-100' },
  rejected: { label: 'Rechazado', color: '!text-red-700', bgColor: '!bg-red-100' },
  active: { label: 'Activo', color: '!text-emerald-700', bgColor: '!bg-emerald-100' },
  paused: { label: 'Pausado', color: '!text-orange-700', bgColor: '!bg-orange-100' },
  completed: { label: 'Completado', color: '!text-indigo-700', bgColor: '!bg-indigo-100' },
};

const verticalIcons: Record<string, any> = {
  Bosque: TreePine,
  Agua: Droplets,
  Textil: Shirt,
  Social: Users,
};

const projectTypeConfig: Record<string, { label: string; vertical: string; color: string }> = {
  reforestation: { label: 'Reforestacion', vertical: 'Bosque', color: '!bg-emerald-100 !text-emerald-700' },
  conservation: { label: 'Conservacion', vertical: 'Bosque', color: '!bg-emerald-100 !text-emerald-700' },
  clean_water: { label: 'Agua Limpia', vertical: 'Agua', color: '!bg-blue-100 !text-blue-700' },
  water_security: { label: 'Seguridad Hidrica', vertical: 'Agua', color: '!bg-blue-100 !text-blue-700' },
  circular_economy: { label: 'Economia Circular', vertical: 'Textil', color: '!bg-purple-100 !text-purple-700' },
  waste_management: { label: 'Gestion de Residuos', vertical: 'Textil', color: '!bg-purple-100 !text-purple-700' },
  energy_efficiency: { label: 'Eficiencia Energetica', vertical: 'Social', color: '!bg-amber-100 !text-amber-700' },
  social_housing: { label: 'Vivienda Social', vertical: 'Social', color: '!bg-amber-100 !text-amber-700' },
  community_development: { label: 'Desarrollo Comunitario', vertical: 'Social', color: '!bg-amber-100 !text-amber-700' },
};

// ── Helpers ───────────────────────────────────────────────────────
function formatNumber(n?: number | null): string {
  if (n == null) return '-';
  return n.toLocaleString('es-CL');
}
function formatDate(d?: string | null): string {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}
function getStockPercent(remaining?: number | null, approved?: number | null): number {
  if (!approved || !remaining) return 0;
  return Math.min(100, Math.round((remaining / approved) * 100));
}

// ── Sub-components ────────────────────────────────────────────────

function InfoCard({ title, icon: Icon, children, className = '' }: {
  title: string;
  icon?: any;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`!bg-white dark:!bg-slate-800 !rounded-lg !border !border-slate-200 dark:!border-slate-700 !p-5 ${className}`}>
      <div className="!flex !items-center !gap-2 !mb-4">
        {Icon && <Icon className="!w-4 !h-4 !text-slate-500 dark:!text-slate-400" />}
        <h3 className="!text-sm !font-semibold !text-slate-700 dark:!text-slate-200 !uppercase !tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color = 'emerald' }: {
  label: string;
  value: string;
  sub?: string;
  icon: any;
  color?: string;
}) {
  const colors: Record<string, string> = {
    emerald: '!bg-emerald-50 dark:!bg-emerald-900/20 !text-emerald-600 dark:!text-emerald-400',
    blue: '!bg-blue-50 dark:!bg-blue-900/20 !text-blue-600 dark:!text-blue-400',
    amber: '!bg-amber-50 dark:!bg-amber-900/20 !text-amber-600 dark:!text-amber-400',
    purple: '!bg-purple-50 dark:!bg-purple-900/20 !text-purple-600 dark:!text-purple-400',
  };
  return (
    <div className="!bg-white dark:!bg-slate-800 !rounded-lg !border !border-slate-200 dark:!border-slate-700 !p-4">
      <div className="!flex !items-center !gap-3">
        <div className={`!p-2 !rounded-lg ${colors[color]}`}>
          <Icon className="!w-5 !h-5" />
        </div>
        <div>
          <p className="!text-xs !text-slate-500 dark:!text-slate-400">{label}</p>
          <p className="!text-lg !font-bold !text-slate-900 dark:!text-white">{value}</p>
          {sub && <p className="!text-xs !text-slate-400 dark:!text-slate-500">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="!flex !justify-between !items-start !py-2 !border-b !border-slate-100 dark:!border-slate-700/50 last:!border-0">
      <span className="!text-sm !text-slate-500 dark:!text-slate-400">{label}</span>
      <span className="!text-sm !font-medium !text-slate-900 dark:!text-white !text-right !max-w-[60%]">{value}</span>
    </div>
  );
}

function EvaluationBadge({ evaluation }: { evaluation: ProjectDetailEvaluation }) {
  const aiIcon = evaluation.ai_status === 'ai_approved' ? ShieldCheck
    : evaluation.ai_status === 'ai_rejected' ? ShieldX : ShieldAlert;
  const aiColor = evaluation.ai_status === 'ai_approved' ? '!text-emerald-600'
    : evaluation.ai_status === 'ai_rejected' ? '!text-red-600' : '!text-amber-600';
  const adminIcon = evaluation.admin_decision === 'approved' ? CheckCircle
    : evaluation.admin_decision === 'rejected' ? XCircle : Clock;
  const adminColor = evaluation.admin_decision === 'approved' ? '!text-emerald-600'
    : evaluation.admin_decision === 'rejected' ? '!text-red-600' : '!text-slate-400';

  return (
    <div className="!bg-slate-50 dark:!bg-slate-700/50 !rounded-lg !p-4 !space-y-3">
      <div className="!flex !items-center !justify-between">
        <div className="!flex !items-center !gap-2">
          <Shield className="!w-4 !h-4 !text-slate-400" />
          <span className="!text-xs !text-slate-500 dark:!text-slate-400">{formatDate(evaluation.createdAt)}</span>
        </div>
        {evaluation.final_score != null && (
          <span className="!text-sm !font-bold !text-slate-700 dark:!text-slate-200">
            Score: {evaluation.final_score}
          </span>
        )}
      </div>
      <div className="!flex !items-center !gap-4">
        <div className="!flex !items-center !gap-1.5">
          {(() => { const AiIcon = aiIcon; return <AiIcon className={`!w-4 !h-4 ${aiColor}`} />; })()}
          <span className="!text-xs !font-medium !text-slate-600 dark:!text-slate-300">
            IA: {evaluation.ai_status === 'ai_approved' ? 'Aprobada' : evaluation.ai_status === 'ai_rejected' ? 'Rechazada' : 'Pendiente'}
          </span>
        </div>
        <div className="!flex !items-center !gap-1.5">
          {(() => { const AdminIcon = adminIcon; return <AdminIcon className={`!w-4 !h-4 ${adminColor}`} />; })()}
          <span className="!text-xs !font-medium !text-slate-600 dark:!text-slate-300">
            Admin: {evaluation.admin_decision === 'approved' ? 'Aprobada' : evaluation.admin_decision === 'rejected' ? 'Rechazada' : 'Pendiente'}
          </span>
        </div>
      </div>
      {evaluation.level && (
        <span className="!inline-block !text-xs !px-2 !py-0.5 !rounded !bg-indigo-100 dark:!bg-indigo-900/30 !text-indigo-700 dark:!text-indigo-300">
          Nivel: {evaluation.level}
        </span>
      )}
      {evaluation.admin_reason && (
        <p className="!text-xs !text-slate-500 dark:!text-slate-400 !italic">"{evaluation.admin_reason}"</p>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

export default function AdminProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'evidence' | 'evaluations' | 'pricing' | 'certificates'>('evidence');
  const [showReportId, setShowReportId] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadProject();
  }, [id]);

  async function loadProject() {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjectDetail(id!);
      setProject(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el proyecto');
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeStatus(newStatus: 'paused' | 'active') {
    if (!project) return;
    const confirmMsg = newStatus === 'paused'
      ? 'Pausar este proyecto? Los compradores no podran adquirir creditos.'
      : 'Reactivar este proyecto?';
    if (!confirm(confirmMsg)) return;

    try {
      setStatusLoading(true);
      await (api as any).put(`/admin/projects/${project.id}/status`, { status: newStatus });
      await loadProject();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Error al cambiar estado');
    } finally {
      setStatusLoading(false);
    }
  }

  // ── Loading / Error ──
  if (loading) {
    return (
      <div className="!flex !items-center !justify-center !h-64">
        <div className="!animate-spin !rounded-full !h-8 !w-8 !border-b-2 !border-emerald-600" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="!max-w-4xl !mx-auto !p-6">
        <div className="!bg-red-50 dark:!bg-red-900/20 !border !border-red-200 dark:!border-red-800 !rounded-lg !p-6 !text-center">
          <AlertCircle className="!w-8 !h-8 !text-red-500 !mx-auto !mb-2" />
          <p className="!text-red-700 dark:!text-red-300">{error || 'Proyecto no encontrado'}</p>
          <Link to="/admin/proyectos" className="!text-sm !text-emerald-600 hover:!underline !mt-2 !inline-block">
            Volver al inventario
          </Link>
        </div>
      </div>
    );
  }

  // ── Derived data ──
  const typeInfo = projectTypeConfig[project.projectType];
  const statusInfo = statusConfig[project.status] || statusConfig.active;
  const VerticalIcon = typeInfo ? verticalIcons[typeInfo.vertical] || Leaf : Leaf;
  const stockPct = getStockPercent(project.monthly_stock_remaining, project.monthly_stock_approved);
  const stockBarColor = stockPct > 50 ? '!bg-emerald-500' : stockPct > 20 ? '!bg-amber-500' : '!bg-red-500';

  const photoProps = project.photos.map(p => ({
    url: p.storageUrl,
    thumbnailUrl: p.thumbnailUrl || null,
    fileName: p.fileName,
  }));

  const docProps = project.techDocs.map(d => ({
    fileName: d.fileName,
    fileType: d.fileType,
    storageUrl: d.storageUrl,
    signedUrl: null as string | null,
    mimeType: d.mimeType,
  }));

  const tabs = [
    { key: 'evidence' as const, label: 'Evidencia', count: (project.photos.length + project.techDocs.length) },
    { key: 'evaluations' as const, label: 'Evaluaciones IA', count: project.evaluations.length },
    { key: 'pricing' as const, label: 'Historial de Precios', count: project.pricingHistory.length },
    { key: 'certificates' as const, label: 'Certificados', count: project.recentCertificates.length },
  ];

  return (
    <div className="!max-w-7xl !mx-auto !space-y-6">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="!flex !items-center !justify-between !flex-wrap !gap-4">
        <div className="!flex !items-center !gap-3">
          <button
            onClick={() => navigate('/admin/proyectos')}
            className="!p-2 !rounded-lg !bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 hover:!bg-slate-50 dark:hover:!bg-slate-700 !transition-colors"
          >
            <ArrowLeft className="!w-4 !h-4 !text-slate-600 dark:!text-slate-300" />
          </button>
          <div>
            <div className="!flex !items-center !gap-2">
              <h1 className="!text-xl !font-bold !text-slate-900 dark:!text-white">{project.name}</h1>
              <span className={`!text-xs !px-2 !py-0.5 !rounded-full !font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              {project.is_sold_out && (
                <span className="!text-xs !px-2 !py-0.5 !rounded-full !font-bold !bg-red-100 !text-red-700">AGOTADO</span>
              )}
            </div>
            <div className="!flex !items-center !gap-3 !mt-1 !text-sm !text-slate-500 dark:!text-slate-400">
              <span className="!font-mono">{project.code}</span>
              {project.partner && (
                <>
                  <span>|</span>
                  <span>{project.partner.name}</span>
                </>
              )}
              {project.country && (
                <>
                  <span>|</span>
                  <MapPin className="!w-3 !h-3 !inline" /> {project.country}{project.region ? `, ${project.region}` : ''}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="!flex !items-center !gap-2">
          {project.status === 'active' && (
            <button
              onClick={() => handleChangeStatus('paused')}
              disabled={statusLoading}
              className="!inline-flex !items-center !gap-1.5 !px-3 !py-2 !text-sm !font-medium !rounded-lg !bg-orange-50 !text-orange-700 !border !border-orange-200 hover:!bg-orange-100 disabled:!opacity-50 !transition-colors"
            >
              <Pause className="!w-4 !h-4" /> Pausar
            </button>
          )}
          {project.status === 'paused' && (
            <button
              onClick={() => handleChangeStatus('active')}
              disabled={statusLoading}
              className="!inline-flex !items-center !gap-1.5 !px-3 !py-2 !text-sm !font-medium !rounded-lg !bg-emerald-50 !text-emerald-700 !border !border-emerald-200 hover:!bg-emerald-100 disabled:!opacity-50 !transition-colors"
            >
              <Play className="!w-4 !h-4" /> Reactivar
            </button>
          )}
          {project.transparencyUrl && (
            <a
              href={project.transparencyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="!inline-flex !items-center !gap-1.5 !px-3 !py-2 !text-sm !font-medium !rounded-lg !bg-white dark:!bg-slate-800 !text-slate-700 dark:!text-slate-300 !border !border-slate-200 dark:!border-slate-700 hover:!bg-slate-50 dark:hover:!bg-slate-700 !transition-colors"
            >
              <ExternalLink className="!w-4 !h-4" /> Transparencia
            </a>
          )}
        </div>
      </div>

      {/* ── Stats Row ────────────────────────────────────────── */}
      <div className="!grid !grid-cols-2 lg:!grid-cols-4 !gap-4">
        <StatCard
          label="Precio CLP/ton"
          value={formatCLP(project.currentPricing?.finalPriceClpPerTon || project.currentBasePriceClpPerTon)}
          sub={project.currentPricing?.marginPercent ? `Margen: ${project.currentPricing.marginPercent}%` : undefined}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          label="Stock Mensual"
          value={`${formatNumber(project.monthly_stock_remaining)} / ${formatNumber(project.monthly_stock_approved)}`}
          sub={project.monthly_stock_approved ? `${stockPct}% restante` : undefined}
          icon={Package}
          color="blue"
        />
        <StatCard
          label="Certificados Emitidos"
          value={formatNumber(project.stats.totalCertificates)}
          sub={`${formatNumber(project.stats.totalTonsAllocated)} tCO2e`}
          icon={Award}
          color="purple"
        />
        <StatCard
          label="Revenue Total"
          value={formatCLP(project.stats.totalRevenueClp)}
          sub={`${project.stats.evidenceCount} entregas de evidencia`}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* ── Main Content: 2-column layout ────────────────────── */}
      <div className="!grid !grid-cols-1 lg:!grid-cols-3 !gap-6">

        {/* LEFT COLUMN (2/3) */}
        <div className="lg:!col-span-2 !space-y-6">

          {/* Photos */}
          <InfoCard title="Fotos de Evidencia" icon={Activity}>
            <PhotoCarousel photos={photoProps} />
          </InfoCard>

          {/* Tabs section */}
          <div className="!bg-white dark:!bg-slate-800 !rounded-lg !border !border-slate-200 dark:!border-slate-700">
            {/* Tab headers */}
            <div className="!flex !border-b !border-slate-200 dark:!border-slate-700 !overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`!px-4 !py-3 !text-sm !font-medium !whitespace-nowrap !border-b-2 !transition-colors ${
                    activeTab === tab.key
                      ? '!border-emerald-500 !text-emerald-600 dark:!text-emerald-400'
                      : '!border-transparent !text-slate-500 dark:!text-slate-400 hover:!text-slate-700 dark:hover:!text-slate-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`!ml-1.5 !text-xs !px-1.5 !py-0.5 !rounded-full ${
                      activeTab === tab.key
                        ? '!bg-emerald-100 dark:!bg-emerald-900/30 !text-emerald-700 dark:!text-emerald-300'
                        : '!bg-slate-100 dark:!bg-slate-700 !text-slate-600 dark:!text-slate-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="!p-5">
              {/* Evidence tab */}
              {activeTab === 'evidence' && (
                <div className="!space-y-4">
                  <DocumentViewer documents={docProps} />
                  {project.evidences.length > 0 && (
                    <div className="!mt-4">
                      <h4 className="!text-sm !font-medium !text-slate-600 dark:!text-slate-300 !mb-2">Entregas de Evidencia</h4>
                      <div className="!space-y-2">
                        {project.evidences.map(ev => (
                          <div key={ev.id} className="!flex !items-center !justify-between !py-2 !px-3 !bg-slate-50 dark:!bg-slate-700/50 !rounded-lg">
                            <div>
                              <span className="!text-sm !font-medium !text-slate-700 dark:!text-slate-200">
                                {ev.periodMonth || 'Sin periodo'}
                              </span>
                              {ev.metricName && (
                                <span className="!ml-2 !text-xs !text-slate-500 dark:!text-slate-400">
                                  {ev.metricName}: {ev.metricValue}
                                </span>
                              )}
                            </div>
                            <div className="!flex !items-center !gap-2">
                              <span className="!text-xs !text-slate-400">{ev.filesCount} archivos</span>
                              <span className="!text-xs !text-slate-400">{formatDate(ev.createdAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {project.photos.length === 0 && project.techDocs.length === 0 && project.evidences.length === 0 && (
                    <p className="!text-sm !text-slate-400 !text-center !py-8">Sin evidencia registrada</p>
                  )}
                </div>
              )}

              {/* Evaluations tab */}
              {activeTab === 'evaluations' && (
                <div className="!space-y-3">
                  {project.evaluations.length === 0 ? (
                    <p className="!text-sm !text-slate-400 !text-center !py-8">Sin evaluaciones de IA</p>
                  ) : (
                    project.evaluations.map(ev => (
                      <div key={ev.id}>
                        <EvaluationBadge evaluation={ev} />
                        {ev.report_markdown && (
                          <div className="!mt-1">
                            <button
                              onClick={() => setShowReportId(showReportId === ev.id ? null : ev.id)}
                              className="!text-xs !text-emerald-600 dark:!text-emerald-400 hover:!underline !flex !items-center !gap-1"
                            >
                              {showReportId === ev.id ? <ChevronUp className="!w-3 !h-3" /> : <ChevronDown className="!w-3 !h-3" />}
                              {showReportId === ev.id ? 'Ocultar reporte' : 'Ver reporte completo'}
                            </button>
                            {showReportId === ev.id && (
                              <div className="!mt-2 !p-4 !bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 !rounded-lg !text-sm !text-slate-700 dark:!text-slate-300 !whitespace-pre-wrap !max-h-96 !overflow-y-auto">
                                {ev.report_markdown}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Pricing tab */}
              {activeTab === 'pricing' && (
                <div className="!space-y-3">
                  {project.pricingHistory.length === 0 ? (
                    <p className="!text-sm !text-slate-400 !text-center !py-8">Sin historial de precios</p>
                  ) : (
                    project.pricingHistory.map((pv, i) => (
                      <div
                        key={pv.id}
                        className={`!p-4 !rounded-lg !border ${
                          pv.status === 'active'
                            ? '!border-emerald-300 dark:!border-emerald-700 !bg-emerald-50 dark:!bg-emerald-900/20'
                            : '!border-slate-200 dark:!border-slate-700 !bg-slate-50 dark:!bg-slate-700/50'
                        }`}
                      >
                        <div className="!flex !items-center !justify-between !mb-2">
                          <div className="!flex !items-center !gap-2">
                            <span className="!text-sm !font-semibold !text-slate-700 dark:!text-slate-200">
                              {pv.version || `Version ${project.pricingHistory.length - i}`}
                            </span>
                            {pv.status === 'active' && (
                              <span className="!text-xs !px-1.5 !py-0.5 !rounded !bg-emerald-200 dark:!bg-emerald-800 !text-emerald-700 dark:!text-emerald-300 !font-medium">
                                Activa
                              </span>
                            )}
                          </div>
                          <span className="!text-xs !text-slate-400">{formatDate(pv.effectiveFrom)}</span>
                        </div>
                        <div className="!grid !grid-cols-3 !gap-4 !text-center">
                          <div>
                            <p className="!text-xs !text-slate-500 dark:!text-slate-400">Base CLP/ton</p>
                            <p className="!text-sm !font-bold !text-slate-700 dark:!text-slate-200">{formatCLP(pv.basePriceClpPerTon)}</p>
                          </div>
                          <div>
                            <p className="!text-xs !text-slate-500 dark:!text-slate-400">Margen</p>
                            <p className="!text-sm !font-bold !text-slate-700 dark:!text-slate-200">{pv.marginPercent}%</p>
                          </div>
                          <div>
                            <p className="!text-xs !text-slate-500 dark:!text-slate-400">Final CLP/ton</p>
                            <p className="!text-sm !font-bold !text-emerald-600 dark:!text-emerald-400">{formatCLP(pv.finalPriceClpPerTon)}</p>
                          </div>
                        </div>
                        {pv.reason && (
                          <p className="!text-xs !text-slate-500 dark:!text-slate-400 !mt-2 !italic">"{pv.reason}"</p>
                        )}
                        {pv.createdBy && (
                          <p className="!text-xs !text-slate-400 !mt-1">por {pv.createdBy.name || pv.createdBy.email}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Certificates tab */}
              {activeTab === 'certificates' && (
                <div className="!space-y-3">
                  {project.recentCertificates.length === 0 ? (
                    <p className="!text-sm !text-slate-400 !text-center !py-8">Sin certificados emitidos</p>
                  ) : (
                    <div className="!overflow-x-auto">
                      <table className="!w-full !text-sm">
                        <thead>
                          <tr className="!border-b !border-slate-200 dark:!border-slate-700">
                            <th className="!text-left !py-2 !px-2 !text-xs !font-medium !text-slate-500 dark:!text-slate-400">N Certificado</th>
                            <th className="!text-right !py-2 !px-2 !text-xs !font-medium !text-slate-500 dark:!text-slate-400">tCO2e</th>
                            <th className="!text-right !py-2 !px-2 !text-xs !font-medium !text-slate-500 dark:!text-slate-400">CLP</th>
                            <th className="!text-left !py-2 !px-2 !text-xs !font-medium !text-slate-500 dark:!text-slate-400">Comprador</th>
                            <th className="!text-left !py-2 !px-2 !text-xs !font-medium !text-slate-500 dark:!text-slate-400">Fecha</th>
                          </tr>
                        </thead>
                        <tbody>
                          {project.recentCertificates.map(cert => (
                            <tr key={cert.id} className="!border-b !border-slate-100 dark:!border-slate-700/50">
                              <td className="!py-2 !px-2 !font-mono !text-slate-700 dark:!text-slate-300">{cert.number}</td>
                              <td className="!py-2 !px-2 !text-right !text-slate-700 dark:!text-slate-300">{formatNumber(cert.tonsCompensated)}</td>
                              <td className="!py-2 !px-2 !text-right !text-slate-700 dark:!text-slate-300">{formatCLP(cert.amountClp)}</td>
                              <td className="!py-2 !px-2 !text-slate-600 dark:!text-slate-400 !text-xs">
                                {cert.purchaser
                                  ? cert.purchaser.type === 'b2b'
                                    ? (cert.purchaser as any).nombreComercial || (cert.purchaser as any).razonSocial
                                    : (cert.purchaser as any).nombre || (cert.purchaser as any).email
                                  : '-'}
                              </td>
                              <td className="!py-2 !px-2 !text-slate-500 dark:!text-slate-400 !text-xs">{formatDate(cert.issuedAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1/3) — Info panels */}
        <div className="!space-y-6">

          {/* Project Info */}
          <InfoCard title="Informacion General" icon={VerticalIcon}>
            <div className="!space-y-0">
              <DataRow label="Tipo" value={
                <span className={`!inline-flex !items-center !gap-1 !text-xs !px-2 !py-0.5 !rounded-full ${typeInfo?.color || '!bg-slate-100 !text-slate-600'}`}>
                  {typeInfo?.label || project.projectType}
                </span>
              } />
              <DataRow label="Vertical" value={typeInfo?.vertical || '-'} />
              <DataRow label="Pais" value={project.country || '-'} />
              <DataRow label="Region" value={project.region || '-'} />
              <DataRow label="Proveedor" value={project.providerOrganization || '-'} />
              <DataRow label="Certificacion" value={project.certification || '-'} />
              <DataRow label="Creado" value={formatDate(project.createdAt)} />
              <DataRow label="Actualizado" value={formatDate(project.updatedAt)} />
            </div>
            {project.description && (
              <p className="!text-sm !text-slate-600 dark:!text-slate-400 !mt-3 !pt-3 !border-t !border-slate-100 dark:!border-slate-700">
                {project.description}
              </p>
            )}
          </InfoCard>

          {/* Double-Lock Pricing */}
          <InfoCard title="Doble Candado" icon={DollarSign}>
            <div className="!space-y-0">
              <DataRow label="Costo Proveedor" value={project.provider_cost_unit_clp ? formatCLP(project.provider_cost_unit_clp) : '-'} />

              <DataRow label="CO2/unidad" value={project.carbon_capture_per_unit ? `${project.carbon_capture_per_unit} kg` : '-'} />
              <DataRow label="Unidad de Impacto" value={project.impact_unit || '-'} />
              <DataRow label="Margen Compensa" value={project.currentPricing?.marginPercent != null ? `${project.currentPricing.marginPercent}%` : '-'} />
              <DataRow label="Precio Final" value={
                <span className="!text-emerald-600 dark:!text-emerald-400 !font-bold">
                  {formatCLP(project.currentPricing?.finalPriceClpPerTon || project.currentBasePriceClpPerTon)} /ton
                </span>
              } />
            </div>
          </InfoCard>

          {/* Stock & Capacity */}
          <InfoCard title="Stock y Capacidad" icon={Package}>
            <div className="!space-y-0">
              <DataRow label="Capacidad Total" value={project.capacity_total ? `${formatNumber(project.capacity_total)} tCO2e` : '-'} />
              <DataRow label="Vendido" value={project.capacity_sold ? `${formatNumber(project.capacity_sold)} tCO2e` : '-'} />
              <DataRow label="Stock Mensual Aprobado" value={project.monthly_stock_approved ? `${formatNumber(project.monthly_stock_approved)} tCO2e` : '-'} />
              <DataRow label="Stock Mensual Restante" value={project.monthly_stock_remaining != null ? `${formatNumber(project.monthly_stock_remaining)} tCO2e` : '-'} />
            </div>
            {project.monthly_stock_approved != null && project.monthly_stock_approved > 0 && (
              <div className="!mt-3 !pt-3 !border-t !border-slate-100 dark:!border-slate-700">
                <div className="!flex !justify-between !text-xs !text-slate-500 dark:!text-slate-400 !mb-1">
                  <span>Stock mensual</span>
                  <span>{stockPct}%</span>
                </div>
                <div className="!w-full !bg-slate-200 dark:!bg-slate-700 !rounded-full !h-2.5">
                  <div className={`!h-2.5 !rounded-full !transition-all ${stockBarColor}`} style={{ width: `${stockPct}%` }} />
                </div>
              </div>
            )}
          </InfoCard>

          {/* Partner info */}
          {project.partner && (
            <InfoCard title="Impact Partner" icon={Users}>
              <div className="!flex !items-center !gap-3 !mb-3">
                {project.partner.logo_url ? (
                  <img src={project.partner.logo_url} alt="" className="!w-10 !h-10 !rounded-lg !object-cover !border !border-slate-200 dark:!border-slate-700" />
                ) : (
                  <div className="!w-10 !h-10 !rounded-lg !bg-slate-100 dark:!bg-slate-700 !flex !items-center !justify-center">
                    <Users className="!w-5 !h-5 !text-slate-400" />
                  </div>
                )}
                <div>
                  <p className="!text-sm !font-semibold !text-slate-700 dark:!text-slate-200">{project.partner.name}</p>
                  {project.partner.status && <p className="!text-xs !text-slate-400">{project.partner.status}</p>}
                </div>
              </div>
              <div className="!space-y-0">
                {project.partner.contact_email && <DataRow label="Email" value={project.partner.contact_email} />}
                {project.partner.website_url && <DataRow label="Web" value={project.partner.website_url} />}
              </div>
            </InfoCard>
          )}
        </div>
      </div>
    </div>
  );
}
