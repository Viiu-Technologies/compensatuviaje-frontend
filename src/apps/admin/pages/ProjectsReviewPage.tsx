/**
 * Projects Review Page (Cabina de Control)
 * Proyectos ESG pendientes de revisión y aprobados por activar
 * Double-Lock Architecture: Admin sets financial fields during approval
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TreePine,
  Search,
  Eye,
  Check,
  X,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar,
  Building2,
  FileText,
  Leaf,
  MapPin,
  DollarSign,
  Filter,
  Zap,
  CheckCircle2,
  Calculator,
  Info,
  AlertCircle,
  ArrowLeft,
  Bot,
  XCircle
} from 'lucide-react';
import { 
  getProjectsPendingReview, 
  getProjectsApproved,
  approvePartnerProject, 
  rejectPartnerProject,
  activatePartnerProject,
  getSettings,
  approveProjectWithPricing,
  PlatformSettings
} from '../services/adminApi';

import PhotoCarousel from '../../../shared/components/PhotoCarousel';
import DocumentViewer from '../../../shared/components/DocumentViewer';
import { approveCertEvaluation, rejectCertEvaluation } from '../services/adminAIApi';
import RejectModal from '../components/shared/RejectModal';

interface PendingProject {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  country: string;
  region?: string;
  price_per_ton_usd?: number;
  // Partner-submitted operational data (Double-Lock)
  provider_cost_unit_clp?: number;
  monthly_stock_approved?: number;
  monthly_stock_remaining?: number;
  capacity_total?: number;
  impact_unit?: string;
  transparency_url?: string;
  status: string;
  submitted_at: string;
  created_at: string;
  approved_at?: string;
  partner: {
    id: string;
    name: string;
    logo_url?: string;
  };
  evidence?: any[];
  documents?: any[];
  evaluations?: any[];
}

interface ProjectsResponse {
  projects: PendingProject[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const projectTypeLabels: Record<string, string> = {
  // Bosque
  reforestation: 'Reforestación',
  conservation: 'Conservación',
  // Agua
  clean_water: 'Agua Limpia',
  water_security: 'Seguridad Hídrica',
  // Textil
  circular_economy: 'Economía Circular',
  waste_management: 'Gestión de Residuos',
  // Social
  energy_efficiency: 'Eficiencia Energética',
  social_housing: 'Vivienda Social',
  community_development: 'Desarrollo Comunitario',
  // Legacy
  renewable_energy: 'Energía Renovable',
  biodiversity: 'Biodiversidad',
  other: 'Otro',
};

type TabType = 'pending' | 'approved';

export default function ProjectsReviewPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  
  // Pending projects state
  const [pendingProjects, setPendingProjects] = useState<PendingProject[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);
  
  // Approved projects state
  const [approvedProjects, setApprovedProjects] = useState<PendingProject[]>([]);
  const [approvedLoading, setApprovedLoading] = useState(true);
  const [approvedPage, setApprovedPage] = useState(1);
  const [approvedTotalPages, setApprovedTotalPages] = useState(1);
  const [approvedTotal, setApprovedTotal] = useState(0);
  
  const [error, setError] = useState<string | null>(null);
  const limit = 10;

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // ====== CABINA DE CONTROL (3-COLUMNS) ======
  const [selectedProject, setSelectedProject] = useState<PendingProject | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState('');
  
  // Cert evaluation inline approve/reject
  const [certActionLoading, setCertActionLoading] = useState(false);
  const [showCertRejectModal, setShowCertRejectModal] = useState(false);
  
  // God Mode form
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  const [godModeForm, setGodModeForm] = useState({
    cost_clp: 0,
    monthly_stock: 0,
    carbon_capture_per_unit: 0,
    margin_percent: 30, // Default 30% or from settings
  });
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  const fetchPendingProjects = useCallback(async () => {
    try {
      setPendingLoading(true);
      const response: ProjectsResponse = await getProjectsPendingReview({ page: pendingPage, limit });
      setPendingProjects(response.projects);
      setPendingTotalPages(response.pagination.totalPages);
      setPendingTotal(response.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar proyectos pendientes');
    } finally {
      setPendingLoading(false);
    }
  }, [pendingPage]);

  const fetchApprovedProjects = useCallback(async () => {
    try {
      setApprovedLoading(true);
      const response: ProjectsResponse = await getProjectsApproved({ page: approvedPage, limit });
      setApprovedProjects(response.projects);
      setApprovedTotalPages(response.pagination.totalPages);
      setApprovedTotal(response.pagination.total);
    } catch (err: any) {
      console.warn('Could not fetch approved projects:', err);
      setApprovedProjects([]);
      setApprovedTotalPages(1);
      setApprovedTotal(0);
    } finally {
      setApprovedLoading(false);
    }
  }, [approvedPage]);

  useEffect(() => {
    fetchPendingProjects();
    fetchApprovedProjects();
  }, [fetchPendingProjects, fetchApprovedProjects]);

  // Load platform settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettings();
        setPlatformSettings(settings);
      } catch (err) {
        console.warn('Could not load platform settings:', err);
      }
    };
    loadSettings();
  }, []);

  // When selected project changes, initialize god mode form
  useEffect(() => {
    if (selectedProject) {
      setGodModeForm({
        cost_clp: selectedProject.provider_cost_unit_clp || 0,
        monthly_stock: selectedProject.monthly_stock_remaining || 0,
        carbon_capture_per_unit: 0, // Admin must enter this
        margin_percent: platformSettings?.default_margin_percent || 30
      });
    }
  }, [selectedProject, platformSettings]);

  // Calculate live price
  useEffect(() => {
    if (!platformSettings || !godModeForm.carbon_capture_per_unit || !godModeForm.cost_clp) {
      setCalculatedPrice(0);
      return;
    }
    
    const fxRate = platformSettings.clp_usd_rate;
    const costUsd = godModeForm.cost_clp / fxRate;
    const marginMultiplier = 1 + (godModeForm.margin_percent / 100);
    const pricePerKg = (costUsd * marginMultiplier) / godModeForm.carbon_capture_per_unit;
    const pricePerTon = pricePerKg * 1000;
    
    setCalculatedPrice(pricePerTon);
  }, [godModeForm, platformSettings]);

  const handleApproveWithPricing = async () => {
    if (!selectedProject || !calculatedPrice) return;
    
    if (platformSettings) {
      if (calculatedPrice < platformSettings.min_price_usd_per_ton) {
        alert(`El precio calculado ($${calculatedPrice.toFixed(2)}) es menor al mínimo permitido ($${platformSettings.min_price_usd_per_ton})`);
        return;
      }
      if (calculatedPrice > platformSettings.max_price_usd_per_ton) {
        alert(`El precio calculado ($${calculatedPrice.toFixed(2)}) es mayor al máximo permitido ($${platformSettings.max_price_usd_per_ton})`);
        return;
      }
    }

    if (!confirm(`¿Estás seguro de aprobar este proyecto con un precio final de $${calculatedPrice.toFixed(2)} USD/ton?`)) {
      return;
    }

    setActionLoading(selectedProject.id);
    try {
      await approveProjectWithPricing(selectedProject.id, {
        carbon_capture_per_unit: godModeForm.carbon_capture_per_unit,
        margin_percent: godModeForm.margin_percent,
        auto_activate: true,
        provider_cost_unit_clp: godModeForm.cost_clp,
        monthly_stock_approved: godModeForm.monthly_stock
      });
      setSelectedProject(null);
      fetchPendingProjects();
      fetchApprovedProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al aprobar proyecto');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedProject || !rejectReason.trim()) return;

    setActionLoading(selectedProject.id);
    try {
      await rejectPartnerProject(selectedProject.partner.id, selectedProject.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedProject(null);
      fetchPendingProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al rechazar proyecto');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (project: PendingProject) => {
    if (!confirm(`¿Activar el proyecto "${project.name}"? Una vez activo, estará disponible para certificación y compensaciones.`)) return;

    setActionLoading(project.id);
    try {
      await activatePartnerProject(project.id);
      fetchApprovedProjects();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Error al activar proyecto';
      alert(message);
    } finally {
      setActionLoading(null);
    }
  };

  // ====== CERT EVALUATION INLINE APPROVE/REJECT ======
  const refreshSelectedProject = async () => {
    // Re-fetch both lists and update the selected project in-place
    const isPending = activeTab === 'pending';
    const fetchFn = isPending ? getProjectsPendingReview : getProjectsApproved;
    const page = isPending ? pendingPage : approvedPage;
    const response = await fetchFn({ page, limit });
    if (isPending) {
      setPendingProjects(response.projects);
    } else {
      setApprovedProjects(response.projects);
    }
    const updated = response.projects.find((p: PendingProject) => p.id === selectedProject?.id);
    if (updated) setSelectedProject(updated);
  };

  const handleCertApprove = async () => {
    const evalId = selectedProject?.evaluations?.[0]?.id;
    if (!evalId || !window.confirm('¿Estás seguro de aprobar esta certificación de proyecto?')) return;
    try {
      setCertActionLoading(true);
      await approveCertEvaluation(evalId);
      await refreshSelectedProject();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al aprobar certificación');
    } finally {
      setCertActionLoading(false);
    }
  };

  const handleCertReject = async (reason: string) => {
    const evalId = selectedProject?.evaluations?.[0]?.id;
    if (!evalId) return;
    try {
      setCertActionLoading(true);
      await rejectCertEvaluation(evalId, reason);
      setShowCertRejectModal(false);
      await refreshSelectedProject();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al rechazar certificación');
    } finally {
      setCertActionLoading(false);
    }
  };

  // ======= RENDER CABINA DE CONTROL ========
  if (selectedProject) {
    const aiEvaluation = selectedProject.evaluations?.[0]; // Assume the latest AI evaluation is first
    const projectPhotos = (selectedProject.evidence?.[0]?.files?.filter((f: any) => f.mimeType?.startsWith('image/')) || [])
      .map((f: any) => ({ url: f.storageUrl, thumbnailUrl: f.thumbnailUrl, fileName: f.fileName }));
    const projectDocs = (selectedProject.evidence?.[0]?.files?.filter(
      (f: any) => !f.mimeType?.startsWith('image/')
    ) || []).map((f: any) => ({
      fileName: f.fileName,
      fileType: f.fileType || 'technical_doc',
      mimeType: f.mimeType,
      storageUrl: f.storageUrl,
      signedUrl: f.signedUrl,
    }));

    return (
      <div className="!space-y-6 !animate-in !fade-in !slide-in-from-bottom-4 !duration-500">
        {/* Header */}
        <div className="!flex !items-center !justify-between !bg-white dark:!bg-slate-800 !p-4 !rounded-2xl !shadow-sm !border !border-slate-100 dark:!border-slate-700">
          <div className="!flex !items-center !gap-4">
            <button
              onClick={() => setSelectedProject(null)}
              className="!p-2 !rounded-xl hover:!bg-slate-100 dark:hover:!bg-slate-700 !transition-colors !text-slate-500"
            >
              <ArrowLeft className="!w-6 !h-6" />
            </button>
            <div>
              <h2 className="!text-xl !font-bold !text-slate-800 dark:!text-slate-100">
                Cabina de Evaluación: {selectedProject.name}
              </h2>
              <p className="!text-sm !text-slate-500 dark:!text-slate-400">
                {selectedProject.partner.name} • {projectTypeLabels[selectedProject.type] || selectedProject.type}
              </p>
            </div>
          </div>
          <div className="!flex !gap-2">
            <button
              onClick={() => setShowRejectModal(true)}
              className="!flex !items-center !gap-2 !px-4 !py-2 !rounded-xl !bg-red-50 dark:!bg-red-900/20 !text-red-600 dark:!text-red-400 !font-medium hover:!bg-red-100 dark:hover:!bg-red-900/40 !transition-colors"
            >
              <X className="!w-4 !h-4" /> Rechazar
            </button>
          </div>
        </div>

        {/* 3-COLUMN LAYOUT */}
        <div className="!grid !grid-cols-1 lg:!grid-cols-3 !gap-6">
          
          {/* COLUMN 1: EVIDENCIA Y DATOS (Lo que mandó el partner) */}
          <div className="!space-y-6">
            <div className="!bg-white dark:!bg-slate-800 !rounded-2xl !shadow-sm !border !border-slate-100 dark:!border-slate-700 !overflow-hidden !flex !flex-col">
              <div className="!p-4 !border-b !border-slate-100 dark:!border-slate-700 !bg-slate-50 dark:!bg-slate-800/50">
                <h3 className="!font-bold !text-slate-800 dark:!text-slate-100 !flex !items-center !gap-2">
                  <Eye className="!w-5 !h-5 !text-emerald-600" />
                  Evidencia y Solicitud
                </h3>
              </div>
              <div className="!p-5 !flex-1 !overflow-y-auto !space-y-6">
                
                {/* Datos Solicitados */}
                <div className="!bg-blue-50 dark:!bg-blue-900/20 !p-4 !rounded-xl !border !border-blue-100 dark:!border-blue-800/50">
                  <h4 className="!text-sm !font-semibold !text-blue-800 dark:!text-blue-300 !mb-3">Datos Solicitados</h4>
                  <ul className="!space-y-2 !text-sm">
                    <li className="!flex !justify-between">
                      <span className="!text-slate-600 dark:!text-slate-400">Unidad Fija:</span>
                      <span className="!font-medium !text-slate-800 dark:!text-slate-200">1 {selectedProject.impact_unit === 'other' ? 'Unidad de Impacto' : 'Árbol'}</span>
                    </li>
                    <li className="!flex !justify-between">
                      <span className="!text-slate-600 dark:!text-slate-400">Costo Solicitado:</span>
                      <span className="!font-medium !text-slate-800 dark:!text-slate-200">${selectedProject.provider_cost_unit_clp?.toLocaleString('es-CL')} CLP</span>
                    </li>
                    <li className="!flex !justify-between">
                      <span className="!text-slate-600 dark:!text-slate-400">Stock Mensual (Max):</span>
                      <span className="!font-medium !text-slate-800 dark:!text-slate-200">{selectedProject.monthly_stock_remaining?.toLocaleString('es-CL')}</span>
                    </li>
                    <li className="!flex !justify-between">
                      <span className="!text-slate-600 dark:!text-slate-400">Capacidad Total:</span>
                      <span className="!font-medium !text-slate-800 dark:!text-slate-200">{selectedProject.capacity_total?.toLocaleString('es-CL')}</span>
                    </li>
                  </ul>
                </div>

                {/* Fotos */}
                <div>
                  <h4 className="!text-sm !font-semibold !text-slate-800 dark:!text-slate-200 !mb-3">Fotos Iniciales</h4>
                  {projectPhotos.length > 0 ? (
                    <div className="!bg-slate-100 dark:!bg-slate-900 !rounded-xl !p-2">
                       <PhotoCarousel photos={projectPhotos} />
                    </div>
                  ) : (
                    <div className="!bg-slate-50 dark:!bg-slate-800/50 !p-4 !rounded-xl !text-center !text-slate-500 !text-sm">
                      No hay fotos iniciales subidas.
                    </div>
                  )}
                </div>

                {/* Documentos */}
                <div>
                  <h4 className="!text-sm !font-semibold !text-slate-800 dark:!text-slate-200 !mb-3">Documentos PDF</h4>
                  {projectDocs.length > 0 ? (
                    <div className="!space-y-3">
                      {projectDocs.map((doc: any) => (
                        <DocumentViewer key={doc.id} documents={[doc]} />
                      ))}
                    </div>
                  ) : (
                    <div className="!bg-slate-50 dark:!bg-slate-800/50 !p-4 !rounded-xl !text-center !text-slate-500 !text-sm">
                      No hay documentos técnicos subidos.
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* COLUMN 2: ASISTENTE IA (n8n) */}
          <div className="!space-y-6">
            <div className="!bg-white dark:!bg-slate-800 !rounded-2xl !shadow-sm !border !border-slate-100 dark:!border-slate-700 !overflow-hidden !flex !flex-col !h-full">
              <div className="!p-4 !border-b !border-slate-100 dark:!border-slate-700 !bg-slate-50 dark:!bg-slate-800/50">
                <h3 className="!font-bold !text-slate-800 dark:!text-slate-100 !flex !items-center !gap-2">
                  <Bot className="!w-5 !h-5 !text-indigo-600" />
                  Evaluación IA
                </h3>
              </div>
              <div className="!p-5 !flex-1 !overflow-y-auto">
                {aiEvaluation ? (
                  <div className="!space-y-6">
                    {/* Resumen IA */}
                    <div className={`!p-4 !rounded-xl !border ${
                      aiEvaluation.ai_status === 'approved' 
                        ? '!bg-emerald-50 dark:!bg-emerald-900/20 !border-emerald-200' 
                        : aiEvaluation.ai_status === 'rejected'
                        ? '!bg-red-50 dark:!bg-red-900/20 !border-red-200'
                        : '!bg-amber-50 dark:!bg-amber-900/20 !border-amber-200'
                    }`}>
                      <h4 className="!text-sm !font-bold !mb-2 !flex !items-center !gap-2">
                        {aiEvaluation.ai_status === 'approved' ? (
                          <><CheckCircle2 className="!w-4 !h-4 !text-emerald-600" /> Veredicto Favorable</>
                        ) : aiEvaluation.ai_status === 'rejected' ? (
                          <><AlertTriangle className="!w-4 !h-4 !text-red-600" /> Veredicto Negativo</>
                        ) : (
                          <><Clock className="!w-4 !h-4 !text-amber-600" /> En Revisión</>
                        )}
                      </h4>
                      <p className="!text-sm !opacity-90">{aiEvaluation.reason || 'No hay detalle disponible.'}</p>
                    </div>

                    {/* Reporte Markdown */}
                    {aiEvaluation.report_markdown && (
                      <div>
                        <h4 className="!text-sm !font-semibold !text-slate-800 dark:!text-slate-200 !mb-3">Reporte Completo</h4>
                        <div className="!prose !prose-sm dark:!prose-invert !max-w-none !bg-slate-50 dark:!bg-slate-900/50 !p-4 !rounded-xl !border !border-slate-100 dark:!border-slate-700">
                           {/* Simply replace \n with br for basic markdown in MVP */}
                           {aiEvaluation.report_markdown.split('\n').map((line: string, i: number) => (
                             <p key={i} className="!mb-2">{line}</p>
                           ))}
                        </div>
                      </div>
                    )}

                    {/* Decisión Admin sobre Certificación */}
                    {aiEvaluation.admin_decision === null || aiEvaluation.admin_decision === undefined ? (
                      <div className="!border-t !border-slate-200 dark:!border-slate-700 !pt-4">
                        <h4 className="!text-sm !font-semibold !text-slate-800 dark:!text-slate-200 !mb-3">Decisión de Certificación</h4>
                        <div className="!flex !items-center !gap-3">
                          <button
                            onClick={() => setShowCertRejectModal(true)}
                            disabled={certActionLoading}
                            className="!px-4 !py-2 !bg-red-50 dark:!bg-red-900/30 !text-red-600 dark:!text-red-400 hover:!bg-red-100 dark:hover:!bg-red-900/50 !rounded-lg !font-medium !transition-colors disabled:!opacity-50"
                          >
                            Rechazar
                          </button>
                          <button
                            onClick={handleCertApprove}
                            disabled={certActionLoading}
                            className="!px-4 !py-2 !bg-green-600 !text-white hover:!bg-green-700 !rounded-lg !font-medium !transition-colors !flex !items-center !gap-2 disabled:!opacity-50"
                          >
                            {certActionLoading ? (
                              <RefreshCw className="!w-4 !h-4 !animate-spin" />
                            ) : (
                              <CheckCircle2 className="!w-4 !h-4" />
                            )}
                            Aprobar Certificación
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`!p-4 !rounded-xl !border ${
                        aiEvaluation.admin_decision === 'approved'
                          ? '!bg-green-50 dark:!bg-green-900/20 !border-green-200 dark:!border-green-800'
                          : '!bg-red-50 dark:!bg-red-900/20 !border-red-200 dark:!border-red-800'
                      }`}>
                        <div className="!flex !items-start !gap-3">
                          {aiEvaluation.admin_decision === 'approved' ? (
                            <CheckCircle2 className="!w-6 !h-6 !text-green-600 dark:!text-green-400 !mt-0.5" />
                          ) : (
                            <XCircle className="!w-6 !h-6 !text-red-600 dark:!text-red-400 !mt-0.5" />
                          )}
                          <div>
                            <h4 className={`!font-semibold ${
                              aiEvaluation.admin_decision === 'approved'
                                ? '!text-green-800 dark:!text-green-300'
                                : '!text-red-800 dark:!text-red-300'
                            }`}>
                              Decisión Final: {aiEvaluation.admin_decision === 'approved' ? 'Aprobado' : 'Rechazado'}
                            </h4>
                            {aiEvaluation.admin_decided_at && (
                              <p className={`!text-sm !mt-1 ${
                                aiEvaluation.admin_decision === 'approved'
                                  ? '!text-green-700 dark:!text-green-400'
                                  : '!text-red-700 dark:!text-red-400'
                              }`}>
                                {new Date(aiEvaluation.admin_decided_at).toLocaleDateString('es-CL')}
                              </p>
                            )}
                            {aiEvaluation.admin_reason && (
                              <div className="!mt-3 !p-3 !bg-white/60 dark:!bg-slate-800/60 !rounded-lg !text-sm !text-slate-700 dark:!text-slate-300">
                                <strong>Motivo:</strong> {aiEvaluation.admin_reason}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="!flex !flex-col !items-center !justify-center !h-full !text-slate-500 !gap-3 !py-12">
                    <Bot className="!w-12 !h-12 !text-slate-300 dark:!text-slate-600" />
                    <p className="!text-center">No hay evaluación de IA disponible para este proyecto.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 3: MODO DIOS EDITABLE (Calculadora) */}
          <div className="!space-y-6">
            <div className="!bg-white dark:!bg-slate-800 !rounded-2xl !shadow-sm !border !border-indigo-200 dark:!border-indigo-800 !overflow-hidden">
              <div className="!p-4 !border-b !border-indigo-100 dark:!border-indigo-800/50 !bg-gradient-to-r !from-indigo-50 !to-blue-50 dark:!from-indigo-900/40 dark:!to-blue-900/40">
                <h3 className="!font-bold !text-indigo-900 dark:!text-indigo-100 !flex !items-center !gap-2">
                  <Calculator className="!w-5 !h-5 !text-indigo-600 dark:!text-indigo-400" />
                  "Modo Dios" (Atributos Reales)
                </h3>
              </div>
              <div className="!p-5 !space-y-5">
                
                {/* Costo Modificable */}
                <div>
                  <label className="!block !text-sm !font-bold !text-slate-700 dark:!text-slate-300 !mb-1.5">
                    1. Costo Partner por Unidad (CLP)
                  </label>
                  <p className="!text-xs !text-slate-500 !mb-2">¿Negociaste un precio distinto? Cámbialo aquí.</p>
                  <div className="!relative">
                    <DollarSign className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !w-5 !h-5 !text-slate-400" />
                    <input
                      type="number"
                      value={godModeForm.cost_clp}
                      onChange={(e) => setGodModeForm({ ...godModeForm, cost_clp: parseInt(e.target.value) || 0 })}
                      className="!w-full !pl-10 !pr-4 !py-3 !border-2 !border-indigo-100 hover:!border-indigo-200 focus:!border-indigo-500 dark:!border-indigo-900 dark:hover:!border-indigo-700 !rounded-xl !bg-white dark:!bg-slate-700 !text-slate-800 dark:!text-slate-100 !font-bold !transition-colors !outline-none"
                    />
                  </div>
                </div>

                {/* Stock Mensual Aprobado */}
                <div>
                  <label className="!block !text-sm !font-bold !text-slate-700 dark:!text-slate-300 !mb-1.5">
                    2. Stock Mensual Aprobado
                  </label>
                  <p className="!text-xs !text-slate-500 !mb-2">Limita las ventas de este mes si es necesario.</p>
                  <div className="!relative">
                    <Building2 className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !w-5 !h-5 !text-slate-400" />
                    <input
                      type="number"
                      value={godModeForm.monthly_stock}
                      onChange={(e) => setGodModeForm({ ...godModeForm, monthly_stock: parseInt(e.target.value) || 0 })}
                      className="!w-full !pl-10 !pr-4 !py-3 !border-2 !border-indigo-100 hover:!border-indigo-200 focus:!border-indigo-500 dark:!border-indigo-900 dark:hover:!border-indigo-700 !rounded-xl !bg-white dark:!bg-slate-700 !text-slate-800 dark:!text-slate-100 !font-bold !transition-colors !outline-none"
                    />
                  </div>
                </div>

                {/* Captura CO2 */}
                <div>
                  <label className="!block !text-sm !font-bold !text-slate-700 dark:!text-slate-300 !mb-1.5">
                    3. Captura CO₂ por Unidad Asignada (KG)
                  </label>
                  <p className="!text-xs !text-amber-600 dark:!text-amber-500 !mb-2 !font-medium">Define la equivalencia científica real.</p>
                  <div className="!relative">
                    <Leaf className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !w-5 !h-5 !text-slate-400" />
                    <input
                      type="number"
                      value={godModeForm.carbon_capture_per_unit || ''}
                      onChange={(e) => setGodModeForm({ ...godModeForm, carbon_capture_per_unit: parseFloat(e.target.value) || 0 })}
                      className="!w-full !pl-10 !pr-4 !py-3 !border-2 !border-emerald-200 hover:!border-emerald-300 focus:!border-emerald-500 dark:!border-emerald-800/50 dark:hover:!border-emerald-700 !rounded-xl !bg-emerald-50 dark:!bg-emerald-900/10 !text-emerald-900 dark:!text-emerald-100 !font-bold !transition-colors !outline-none"
                      placeholder="Ej: 12"
                    />
                  </div>
                </div>

                {/* Resultado */}
                <div className="!bg-slate-900 !rounded-xl !p-5 !text-white !shadow-inner !mt-6">
                  <h4 className="!text-xs !font-semibold !text-slate-400 !uppercase !tracking-wider !mb-4">Calculadora En Vivo</h4>
                  
                  <div className="!space-y-3 !text-sm !mb-4 !pb-4 !border-b !border-slate-700">
                    <div className="!flex !justify-between">
                      <span className="!text-slate-400">Costo Partner:</span>
                      <span className="!font-mono !font-medium">${godModeForm.cost_clp.toLocaleString('es-CL')} CLP</span>
                    </div>
                    <div className="!flex !justify-between">
                      <span className="!text-slate-400">Margen Interno:</span>
                      <span className="!font-mono !font-medium">{godModeForm.margin_percent}%</span>
                    </div>
                    <div className="!flex !justify-between">
                      <span className="!text-slate-400">FX Rate Config:</span>
                      <span className="!font-mono !font-medium">{platformSettings?.clp_usd_rate || '---'} CLP/USD</span>
                    </div>
                  </div>

                  <div className="!text-center">
                    <span className="!text-sm !text-slate-400">Precio Final</span>
                    <div className="!text-4xl !font-bold !text-emerald-400 !mt-1">
                      ${calculatedPrice ? calculatedPrice.toFixed(2) : '0.00'} <span className="!text-lg">USD/Ton</span>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  onClick={handleApproveWithPricing}
                  disabled={actionLoading === selectedProject.id || !calculatedPrice}
                  className="!w-full !group !relative !flex !items-center !justify-center !gap-2 !py-4 !bg-gradient-to-r !from-emerald-500 !to-emerald-700 hover:!from-emerald-400 hover:!to-emerald-600 !text-white !rounded-xl !font-bold !text-lg !shadow-xl !shadow-emerald-500/20 disabled:!opacity-50 !transition-all"
                >
                  {actionLoading === selectedProject.id ? (
                    <RefreshCw className="!w-6 !h-6 !animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="!w-6 !h-6" /> Aprobar y Activar Proyecto
                    </>
                  )}
                </button>

              </div>
            </div>
          </div>

        </div>

        {/* Modal de Rechazo Superpuesto en Cabina */}
        {showRejectModal && (
          <div className="!fixed !inset-0 !bg-slate-900/50 !backdrop-blur-sm !flex !items-center !justify-center !z-50 !p-4">
            <div className="!bg-white dark:!bg-slate-800 !rounded-2xl !w-full !max-w-lg !p-6 !shadow-2xl">
              <h3 className="!text-xl !font-bold !text-slate-900 dark:!text-white !mb-2">¿Rechazar Evaluación?</h3>
              <p className="!text-slate-500 dark:!text-slate-400 !mb-4">Ingresa el motivo. Esta información será enviada al Partner.</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ej: Las fotos no coinciden con las coordinadas GPS..."
                className="!w-full !h-32 !p-4 !rounded-xl !border !border-slate-200 dark:!border-slate-700 !bg-slate-50 dark:!bg-slate-900 !resize-none focus:!ring-2 focus:!ring-red-500 !outline-none !mb-6"
              />
              <div className="!flex !gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="!flex-1 !py-3 !font-semibold !text-slate-600 dark:!text-slate-300 hover:!bg-slate-100 dark:hover:!bg-slate-700 !rounded-xl !transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="!flex-1 !py-3 !bg-red-600 !text-white !font-bold !rounded-xl hover:!bg-red-700 !transition-colors disabled:!opacity-50"
                >
                  Rechazar Definitivamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Rechazo de Certificación IA */}
        <RejectModal
          isOpen={showCertRejectModal}
          onClose={() => setShowCertRejectModal(false)}
          onConfirm={handleCertReject}
          title="Rechazar Certificación de Proyecto"
          itemName={selectedProject.name}
          loading={certActionLoading}
        />
      </div>
    );
  }

  // ======= RENDER LIST VIEW =======
  const currentProjects = activeTab === 'pending' ? pendingProjects : approvedProjects;
  const currentLoading = activeTab === 'pending' ? pendingLoading : approvedLoading;
  const currentPage = activeTab === 'pending' ? pendingPage : approvedPage;
  const currentTotalPages = activeTab === 'pending' ? pendingTotalPages : approvedTotalPages;
  const currentTotal = activeTab === 'pending' ? pendingTotal : approvedTotal;
  const setCurrentPage = activeTab === 'pending' ? setPendingPage : setApprovedPage;

  const filteredProjects = currentProjects.filter(p =>
    !search || 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.partner.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div className="!flex !flex-col md:!flex-row !justify-between !items-start md:!items-center !gap-4">
        <div>
          <h1 className="!text-3xl !font-bold !text-slate-800 dark:!text-slate-100 !flex !items-center !gap-3">
            <TreePine className="!w-8 !h-8 !text-emerald-600" />
            Control Misión: Aprobación
          </h1>
          <p className="!text-slate-500 dark:!text-slate-400 !mt-1">
            "Double-Lock": Audit y fijación de precios final de nuevos proyectos
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="!flex !gap-2 !bg-white dark:!bg-slate-800 !p-1.5 !rounded-xl !shadow-sm !border !border-slate-100 dark:!border-slate-700 !w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`!flex !items-center !gap-2 !px-5 !py-2.5 !rounded-lg !font-medium !transition-all ${
            activeTab === 'pending'
              ? '!bg-amber-100 dark:!bg-amber-900/30 !text-amber-700 dark:!text-amber-400'
              : '!text-slate-600 dark:!text-slate-400 hover:!bg-slate-100 dark:hover:!bg-slate-700'
          }`}
        >
          <Clock className="!w-4 !h-4" />
          Proyectos en Revisión
          {pendingTotal > 0 && (
            <span className="!bg-amber-600 !text-white !text-xs !px-2 !py-0.5 !rounded-full !font-bold">
              {pendingTotal}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`!flex !items-center !gap-2 !px-5 !py-2.5 !rounded-lg !font-medium !transition-all ${
            activeTab === 'approved'
              ? '!bg-emerald-100 dark:!bg-emerald-900/30 !text-emerald-700 dark:!text-emerald-400'
              : '!text-slate-600 dark:!text-slate-400 hover:!bg-slate-100 dark:hover:!bg-slate-700'
          }`}
        >
          <CheckCircle2 className="!w-4 !h-4" />
          Listos (Aprobados)
          {approvedTotal > 0 && (
            <span className="!bg-emerald-600 !text-white !text-xs !px-2 !py-0.5 !rounded-full !font-bold">
              {approvedTotal}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="!bg-white dark:!bg-slate-800 !rounded-2xl !p-4 !shadow-sm !border !border-slate-100 dark:!border-slate-700">
        <div className="!relative !max-w-md">
          <Search className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !w-5 !h-5 !text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o partner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!w-full !pl-10 !pr-4 !py-2.5 !border !border-slate-200 dark:!border-slate-600 !rounded-xl !bg-white dark:!bg-slate-700 !text-slate-800 dark:!text-slate-200 placeholder:!text-slate-400 focus:!ring-2 focus:!ring-emerald-500/20 focus:!border-emerald-500 !outline-none !transition-all"
          />
        </div>
      </div>

      {/* Projects List */}
      {currentLoading ? (
        <div className="!bg-white dark:!bg-slate-800 !rounded-2xl !p-12 !text-center !shadow-sm !border !border-slate-100 dark:!border-slate-700">
          <RefreshCw className="!w-8 !h-8 !animate-spin !text-emerald-600 !mx-auto" />
          <p className="!text-slate-500 dark:!text-slate-400 !mt-4">Cargando proyectos...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="!bg-white dark:!bg-slate-800 !rounded-2xl !p-12 !text-center !shadow-sm !border !border-slate-100 dark:!border-slate-700">
          <TreePine className="!w-16 !h-16 !text-slate-300 dark:!text-slate-600 !mx-auto" />
          <p className="!text-slate-500 dark:!text-slate-400 !mt-4 !text-lg">
            {activeTab === 'pending' 
              ? 'No hay proyectos vinculados a revisión'
              : 'No hay proyectos en el listado'
            }
          </p>
        </div>
      ) : (
        <div className="!space-y-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="!bg-white dark:!bg-slate-800 !rounded-2xl !p-6 !shadow-sm !border !border-slate-100 dark:!border-slate-700 hover:!shadow-md !transition-shadow"
            >
              <div className="!flex !flex-col lg:!flex-row !gap-6">
                {/* Project Info */}
                <div className="!flex-1">
                  <div className="!flex !items-start !gap-4">
                    <div className={`!w-14 !h-14 !rounded-2xl !flex !items-center !justify-center !flex-shrink-0 ${
                      activeTab === 'pending' 
                        ? '!bg-gradient-to-br !from-amber-400 !to-orange-600'
                        : '!bg-gradient-to-br !from-emerald-400 !to-green-600'
                    }`}>
                      <Leaf className="!w-7 !h-7 !text-white" />
                    </div>
                    <div className="!flex-1 !min-w-0">
                      <div className="!flex !items-center !gap-2 !flex-wrap">
                        <h3 className="!text-lg !font-bold !text-slate-800 dark:!text-slate-100">{project.name}</h3>
                        <span className={`!px-2 !py-0.5 !text-xs !font-medium !rounded-full !flex !items-center !gap-1 ${
                          activeTab === 'pending'
                            ? '!bg-amber-100 dark:!bg-amber-900/30 !text-amber-700 dark:!text-amber-400'
                            : '!bg-emerald-100 dark:!bg-emerald-900/30 !text-emerald-700 dark:!text-emerald-400'
                        }`}>
                          {activeTab === 'pending' ? (
                            <>
                              <Clock className="!w-3 !h-3" /> Pendiente IA y Aprobación
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="!w-3 !h-3" /> Aprobado Inactivo
                            </>
                          )}
                        </span>
                      </div>
                      <p className="!text-sm !text-slate-500 dark:!text-slate-400 !mt-1">Código: {project.code}</p>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="!flex !flex-wrap !gap-4 !mt-4 !text-sm">
                    <div className="!flex !items-center !gap-1.5 !text-slate-600 dark:!text-slate-400">
                      <FileText className="!w-4 !h-4 !text-slate-400" />
                      {projectTypeLabels[project.type] || project.type}
                    </div>
                    <div className="!flex !items-center !gap-1.5 !text-slate-600 dark:!text-slate-400">
                      <MapPin className="!w-4 !h-4 !text-slate-400" />
                      {project.country}{project.region ? `, ${project.region}` : ''}
                    </div>
                    {project.price_per_ton_usd && (
                      <div className="!flex !items-center !gap-1.5 !text-slate-600 dark:!text-slate-400">
                        <DollarSign className="!w-4 !h-4 !text-slate-400" />
                        ${project.price_per_ton_usd} USD/ton
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="!flex lg:!flex-col !gap-2 !flex-shrink-0">                  
                  {activeTab === 'pending' ? (
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="!flex !items-center !justify-center !gap-2 !px-4 !py-3 !bg-indigo-600 !text-white !rounded-xl !font-bold hover:!bg-indigo-700 !transition-colors !shadow-lg !shadow-indigo-500/30"
                    >
                      Entrar a Cabina de Control <ChevronRight className="!w-4 !h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(project)}
                      disabled={actionLoading === project.id}
                      className="!flex !items-center !justify-center !gap-2 !px-4 !py-2.5 !bg-gradient-to-r !from-emerald-500 !to-green-600 !text-white !rounded-xl !font-medium hover:!from-emerald-600 hover:!to-green-700 !transition-all !shadow-lg !shadow-emerald-500/30 disabled:!opacity-60"
                    >
                      {actionLoading === project.id ? (
                        <RefreshCw className="!w-4 !h-4 !animate-spin" />
                      ) : (
                        <Zap className="!w-4 !h-4" />
                      )}
                      Publicar Proyecto Activo
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
