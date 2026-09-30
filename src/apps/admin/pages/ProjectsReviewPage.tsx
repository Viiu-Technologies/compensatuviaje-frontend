/**
 * Proyectos en revisión
 * Proyectos ESG que envían los partners: el admin revisa evidencia y la
 * evaluación de Veritas AI, fija precio y stock (segundo candado del modelo
 * "double-lock") y aprueba, o publica los ya aprobados.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  TreePine,
  Zap,
} from 'lucide-react';
import {
  getProjectsPendingReview,
  getProjectsApproved,
  rejectPartnerProject,
  activatePartnerProject,
  getSettings,
  approveProjectWithPricing,
  PlatformSettings,
} from '../services/adminApi';

import { approveCertEvaluation, rejectCertEvaluation } from '../services/adminAIApi';
import RejectModal from '../components/shared/RejectModal';
import { toast } from 'sonner';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import {
  EmptyState,
  PageHeader,
  Pagination,
  Panel,
  SearchField,
  Segmented,
  StatusBadge,
  TableSkeletonRows,
  formatCLP,
  formatInt,
  projectTypeLabel,
  unitLabel,
  useAdminConfirm, DocumentList, PhotoGallery,
} from '../ui';

interface PendingProject {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  country: string;
  region?: string;
  price_per_ton_clp?: number;
  // Datos operativos enviados por el partner (double-lock)
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

// Antes se mostraba "1 Árbol" para toda unidad distinta de "other".
const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString('es-CL') : '—');

/**
 * Render mínimo del informe de Veritas AI: títulos (#), listas (- / *) y
 * párrafos. Antes se mostraba el markdown crudo ("## Resumen").
 */
function ReportText({ markdown }: { markdown: string }) {
  return (
    <>
      {markdown.split('\n').map((raw, i) => {
        const line = raw.trim();
        if (!line) return null;
        const heading = line.match(/^#{1,6}\s+(.*)$/);
        if (heading) return <p key={i} className="adm-report__heading">{heading[1]}</p>;
        const item = line.match(/^[-*]\s+(.*)$/);
        if (item) return <p key={i} className="adm-report__item">{item[1]}</p>;
        return <p key={i}>{line.replace(/\*\*(.+?)\*\*/g, '$1')}</p>;
      })}
    </>
  );
}

type TabType = 'pending' | 'approved';

export default function ProjectsReviewPage() {
  const { confirm, dialog } = useAdminConfirm();
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  const [pendingProjects, setPendingProjects] = useState<PendingProject[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);

  const [approvedProjects, setApprovedProjects] = useState<PendingProject[]>([]);
  const [approvedLoading, setApprovedLoading] = useState(true);
  const [approvedPage, setApprovedPage] = useState(1);
  const [approvedTotalPages, setApprovedTotalPages] = useState(1);
  const [approvedTotal, setApprovedTotal] = useState(0);

  // Antes se guardaba pero no se mostraba en ningún lado
  const [error, setError] = useState<string | null>(null);
  const limit = 10;

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [selectedProject, setSelectedProject] = useState<PendingProject | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [certActionLoading, setCertActionLoading] = useState(false);
  const [showCertRejectModal, setShowCertRejectModal] = useState(false);

  // Precio y stock que fija el admin al aprobar
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  const [pricingForm, setPricingForm] = useState({
    cost_clp: 0,
    monthly_stock: 0,
    carbon_capture_per_unit: 0,
    margin_percent: 30,
  });
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  const fetchPendingProjects = useCallback(async () => {
    try {
      setPendingLoading(true);
      const response: ProjectsResponse = await getProjectsPendingReview({ page: pendingPage, limit });
      setPendingProjects(response.projects);
      setPendingTotalPages(response.pagination.totalPages);
      setPendingTotal(response.pagination.total);
      setError(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'No se pudieron cargar los proyectos en revisión.'));
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

  useEffect(() => {
    getSettings()
      .then(setPlatformSettings)
      .catch((err) => console.warn('Could not load platform settings:', err));
  }, []);

  useEffect(() => {
    if (selectedProject) {
      setPricingForm({
        cost_clp: selectedProject.provider_cost_unit_clp || 0,
        monthly_stock: selectedProject.monthly_stock_remaining || 0,
        carbon_capture_per_unit: 0, // el admin define la equivalencia
        margin_percent: platformSettings?.default_margin_percent || 30,
      });
    }
  }, [selectedProject, platformSettings]);

  useEffect(() => {
    if (!platformSettings || !pricingForm.carbon_capture_per_unit || !pricingForm.cost_clp) {
      setCalculatedPrice(0);
      return;
    }
    const marginMultiplier = 1 + pricingForm.margin_percent / 100;
    const pricePerKg = (pricingForm.cost_clp * marginMultiplier) / pricingForm.carbon_capture_per_unit;
    setCalculatedPrice(pricePerKg * 1000);
  }, [pricingForm, platformSettings]);

  const handleApproveWithPricing = async () => {
    if (!selectedProject || !calculatedPrice) return;

    if (platformSettings) {
      if (calculatedPrice < platformSettings.min_price_clp_per_ton) {
        toast.error(`El precio calculado (${formatCLP(calculatedPrice)}/t) está bajo el mínimo permitido (${formatCLP(platformSettings.min_price_clp_per_ton)}/t).`);
        return;
      }
      if (calculatedPrice > platformSettings.max_price_clp_per_ton) {
        toast.error(`El precio calculado (${formatCLP(calculatedPrice)}/t) supera el máximo permitido (${formatCLP(platformSettings.max_price_clp_per_ton)}/t).`);
        return;
      }
    }

    const ok = await confirm({
      title: '¿Aprobar este proyecto?',
      description: `Se fijará un precio final de ${formatCLP(calculatedPrice)} por tonelada y el proyecto quedará activo.`,
      confirmLabel: 'Aprobar proyecto',
    });
    if (!ok) return;

    setActionLoading(selectedProject.id);
    try {
      await approveProjectWithPricing(selectedProject.id, {
        carbon_capture_per_unit: pricingForm.carbon_capture_per_unit,
        margin_percent: pricingForm.margin_percent,
        auto_activate: true,
        provider_cost_unit_clp: pricingForm.cost_clp,
        monthly_stock_approved: pricingForm.monthly_stock,
      });
      toast.success(`${selectedProject.name} aprobado`);
      setSelectedProject(null);
      fetchPendingProjects();
      fetchApprovedProjects();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'No se pudo aprobar el proyecto.'));
    } finally {
      setActionLoading(null);
    }
  };

  // Antes usaba un modal propio que aceptaba cualquier texto; ahora el mismo
  // RejectModal (mínimo 10 caracteres) que el rechazo de certificación.
  const handleReject = async (reason: string) => {
    if (!selectedProject) return;
    setActionLoading(selectedProject.id);
    try {
      await rejectPartnerProject(selectedProject.partner.id, selectedProject.id, reason);
      toast.success(`${selectedProject.name} rechazado`);
      setShowRejectModal(false);
      setSelectedProject(null);
      fetchPendingProjects();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'No se pudo rechazar el proyecto.'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (project: PendingProject) => {
    const ok = await confirm({
      title: `¿Publicar "${project.name}"?`,
      description: 'Quedará disponible para certificación y compensaciones.',
      confirmLabel: 'Publicar proyecto',
    });
    if (!ok) return;

    setActionLoading(project.id);
    try {
      await activatePartnerProject(project.id);
      toast.success(`${project.name} publicado`);
      fetchApprovedProjects();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'No se pudo publicar el proyecto.'));
    } finally {
      setActionLoading(null);
    }
  };

  const refreshSelectedProject = async () => {
    const isPending = activeTab === 'pending';
    const fetchFn = isPending ? getProjectsPendingReview : getProjectsApproved;
    const response = await fetchFn({ page: isPending ? pendingPage : approvedPage, limit });
    if (isPending) setPendingProjects(response.projects);
    else setApprovedProjects(response.projects);
    const updated = response.projects.find((p: PendingProject) => p.id === selectedProject?.id);
    if (updated) setSelectedProject(updated);
  };

  const handleCertApprove = async () => {
    const evalId = selectedProject?.evaluations?.[0]?.id;
    if (!evalId) return;
    const ok = await confirm({
      title: '¿Aprobar esta certificación?',
      description: 'El proyecto quedará certificado y disponible para compensaciones. Esta acción no se puede deshacer.',
      confirmLabel: 'Aprobar certificación',
    });
    if (!ok) return;
    try {
      setCertActionLoading(true);
      await approveCertEvaluation(evalId);
      toast.success('Certificación aprobada');
      await refreshSelectedProject();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'No se pudo aprobar la certificación.'));
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
      toast.success('Certificación rechazada');
      setShowCertRejectModal(false);
      await refreshSelectedProject();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'No se pudo rechazar la certificación.'));
    } finally {
      setCertActionLoading(false);
    }
  };

  const setNumber = (key: keyof typeof pricingForm, parse: (v: string) => number) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPricingForm({ ...pricingForm, [key]: parse(e.target.value) || 0 });

  // ======= Revisión de un proyecto =======
  if (selectedProject) {
    const aiEvaluation = selectedProject.evaluations?.[0];
    const files = selectedProject.evidence?.[0]?.files ?? [];
    const projectPhotos = files
      .filter((f: any) => f.mimeType?.startsWith('image/'))
      .map((f: any) => ({ url: f.storageUrl, thumbnailUrl: f.thumbnailUrl, fileName: f.fileName }));
    const projectDocs = files
      .filter((f: any) => !f.mimeType?.startsWith('image/'))
      .map((f: any) => ({
        fileName: f.fileName,
        fileType: f.fileType || 'technical_doc',
        mimeType: f.mimeType,
        storageUrl: f.storageUrl,
        signedUrl: f.signedUrl,
      }));
    const unit = unitLabel(selectedProject.impact_unit);
    const verdict =
      aiEvaluation?.ai_status === 'approved'
        ? { tone: 'success' as const, label: 'Recomienda aprobar' }
        : aiEvaluation?.ai_status === 'rejected'
        ? { tone: 'danger' as const, label: 'Recomienda rechazar' }
        : { tone: 'neutral' as const, label: 'En evaluación' };

    return (
      <div className="adm-page">
        <button type="button" className="adm-back" onClick={() => setSelectedProject(null)}>
          <ArrowLeft aria-hidden="true" /> Volver a la lista
        </button>

        <PageHeader
          title={selectedProject.name}
          description={`${selectedProject.partner.name} · ${projectTypeLabel(selectedProject.type)} · Código ${selectedProject.code}`}
          actions={
            <button type="button" className="adm-btn" onClick={() => setShowRejectModal(true)}>
              Rechazar proyecto
            </button>
          }
        />

        <div className="adm-grid adm-grid--3">
          {/* 1. Lo que envió el partner */}
          <Panel title="Solicitud del partner" description="Datos, fotos y documentos enviados">
            <h3 className="adm-subhead">Datos solicitados</h3>
            <dl className="adm-dl">
              <dt>Unidad de impacto</dt>
              <dd>1 {unit}</dd>
              <dt>Costo por unidad</dt>
              <dd>{selectedProject.provider_cost_unit_clp != null ? formatCLP(selectedProject.provider_cost_unit_clp) : '—'}</dd>
              <dt>Stock mensual máximo</dt>
              <dd>{selectedProject.monthly_stock_remaining != null ? formatInt(selectedProject.monthly_stock_remaining) : '—'}</dd>
              <dt>Capacidad total</dt>
              <dd>{selectedProject.capacity_total != null ? formatInt(selectedProject.capacity_total) : '—'}</dd>
            </dl>

            <h3 className="adm-subhead">Fotos iniciales</h3>
            {projectPhotos.length > 0 ? (
              <PhotoGallery photos={projectPhotos} />
            ) : (
              <p className="adm-note">El partner no subió fotos.</p>
            )}

            <h3 className="adm-subhead">Documentos</h3>
            {projectDocs.length > 0 ? (
              <div className="adm-stack-v">
                {projectDocs.map((doc: any, i: number) => (
                  <DocumentList key={`${doc.fileName}-${i}`} documents={[doc]} />
                ))}
              </div>
            ) : (
              <p className="adm-note">El partner no subió documentos técnicos.</p>
            )}
          </Panel>

          {/* 2. Evaluación de Veritas AI */}
          <Panel
            title="Evaluación de Veritas AI"
            aside={aiEvaluation ? <StatusBadge tone={verdict.tone}>{verdict.label}</StatusBadge> : undefined}
          >
            {aiEvaluation ? (
              <div className="adm-stack-v">
                <p>{aiEvaluation.reason || 'La evaluación no incluye un resumen.'}</p>

                {aiEvaluation.report_markdown && (
                  <div>
                    <h3 className="adm-subhead">Informe completo</h3>
                    <div className="adm-report"><ReportText markdown={aiEvaluation.report_markdown} /></div>
                  </div>
                )}

                <div>
                  <h3 className="adm-subhead">Decisión sobre la certificación</h3>
                  {aiEvaluation.admin_decision == null ? (
                    <div className="adm-actions-row">
                      <button type="button" className="adm-btn" onClick={() => setShowCertRejectModal(true)} disabled={certActionLoading}>
                        Rechazar
                      </button>
                      <button type="button" className="adm-btn adm-btn--primary" onClick={handleCertApprove} disabled={certActionLoading}>
                        {certActionLoading ? 'Guardando…' : 'Aprobar certificación'}
                      </button>
                    </div>
                  ) : (
                    <div className="adm-decision">
                      <StatusBadge tone={aiEvaluation.admin_decision === 'approved' ? 'success' : 'danger'}>
                        {aiEvaluation.admin_decision === 'approved' ? 'Aprobada' : 'Rechazada'}
                        {aiEvaluation.admin_decided_at && ` el ${formatDate(aiEvaluation.admin_decided_at)}`}
                      </StatusBadge>
                      {aiEvaluation.admin_reason && <p><b>Motivo:</b> {aiEvaluation.admin_reason}</p>}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState icon={Bot} title="Sin evaluación" text="Veritas AI aún no evalúa este proyecto." />
            )}
          </Panel>

          {/* 3. Precio y stock que fija el admin */}
          <Panel title="Precio y stock" description="Lo que fijas aquí es lo que se vende">
            <div className="adm-stack-v">
              <div className="adm-field">
                <label className="adm-field__label" htmlFor="pr-cost">Costo del partner por {unit} (CLP)</label>
                <span className="adm-field__hint">Cámbialo si negociaste otro precio.</span>
                <input id="pr-cost" type="number" min={0} className="adm-input num" value={pricingForm.cost_clp} onChange={setNumber('cost_clp', (v) => parseInt(v))} />
              </div>
              <div className="adm-field">
                <label className="adm-field__label" htmlFor="pr-stock">Stock mensual aprobado</label>
                <span className="adm-field__hint">Limita las ventas del mes si hace falta.</span>
                <input id="pr-stock" type="number" min={0} className="adm-input num" value={pricingForm.monthly_stock} onChange={setNumber('monthly_stock', (v) => parseInt(v))} />
              </div>
              <div className="adm-field">
                <label className="adm-field__label" htmlFor="pr-capture">CO₂ capturado por {unit} (kg)</label>
                <span className="adm-field__hint">La equivalencia que respalda el cálculo. Obligatorio para aprobar.</span>
                <input id="pr-capture" type="number" min={0} step="any" className="adm-input num" placeholder="Ej.: 12" value={pricingForm.carbon_capture_per_unit || ''} onChange={setNumber('carbon_capture_per_unit', parseFloat)} />
              </div>

              <div className="adm-calc">
                <dl className="adm-dl">
                  <dt>Costo del partner</dt>
                  <dd>{formatCLP(pricingForm.cost_clp)}</dd>
                  <dt>Margen de la plataforma</dt>
                  <dd>{pricingForm.margin_percent} %</dd>
                </dl>
                <span className="adm-field__hint">Precio = costo × (1 + margen) ÷ kg de CO₂ × 1.000</span>
                <div className="adm-calc__price">
                  Precio final por tonelada
                  <b>{calculatedPrice ? formatCLP(calculatedPrice) : '—'}</b>
                </div>
              </div>

              <button
                type="button"
                className="adm-btn adm-btn--primary adm-btn--block"
                onClick={handleApproveWithPricing}
                disabled={actionLoading === selectedProject.id || !calculatedPrice}
              >
                {actionLoading === selectedProject.id ? 'Aprobando…' : 'Aprobar y activar proyecto'}
              </button>
            </div>
          </Panel>
        </div>

        <RejectModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleReject}
          title="Rechazar proyecto"
          itemName={selectedProject.name}
          loading={actionLoading === selectedProject.id}
        />
        <RejectModal
          isOpen={showCertRejectModal}
          onClose={() => setShowCertRejectModal(false)}
          onConfirm={handleCertReject}
          title="Rechazar certificación"
          itemName={selectedProject.name}
          loading={certActionLoading}
        />
        {dialog}
      </div>
    );
  }

  // ======= Lista =======
  const isPendingTab = activeTab === 'pending';
  const currentProjects = isPendingTab ? pendingProjects : approvedProjects;
  const currentLoading = isPendingTab ? pendingLoading : approvedLoading;
  const currentPage = isPendingTab ? pendingPage : approvedPage;
  const currentTotalPages = isPendingTab ? pendingTotalPages : approvedTotalPages;
  const currentTotal = isPendingTab ? pendingTotal : approvedTotal;
  const setCurrentPage = isPendingTab ? setPendingPage : setApprovedPage;

  const q = search.trim().toLowerCase();
  const filteredProjects = currentProjects.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || p.partner.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
  );

  return (
    <div className="adm-page">
      <PageHeader
        title="Proyectos en revisión"
        description="Revisa la evidencia y la evaluación de Veritas AI, fija precio y stock, y aprueba los proyectos que envían los partners."
      />

      {error && (
        <div role="alert" className="adm-alert adm-alert--danger">
          <AlertTriangle aria-hidden="true" />
          <div><b>{error}</b> Vuelve a intentarlo en unos minutos.</div>
        </div>
      )}

      <section className="adm-table-card">
        <div className="adm-toolbar">
          <Segmented
            label="Listado"
            options={[
              { value: 'pending', label: `Por revisar (${formatInt(pendingTotal)})` },
              { value: 'approved', label: `Aprobados sin publicar (${formatInt(approvedTotal)})` },
            ]}
            value={activeTab}
            onChange={(v) => { setActiveTab(v as TabType); setSearch(''); }}
          />
          <SearchField
            label="Filtrar proyectos de esta página"
            placeholder="Filtrar por nombre, código o partner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="adm-table-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Proyecto</th>
                <th scope="col">Partner</th>
                <th scope="col">Tipo</th>
                <th scope="col">Ubicación</th>
                {isPendingTab ? <th scope="col">Enviado</th> : <th scope="col" className="adm-col-num">Precio por t</th>}
                <th scope="col" className="adm-col-actions"><span className="sr-only">Acción</span></th>
              </tr>
            </thead>
            <tbody>
              {currentLoading ? (
                <TableSkeletonRows columns={6} />
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={TreePine}
                      title={q ? 'Sin coincidencias en esta página' : isPendingTab ? 'No hay proyectos por revisar' : 'No hay proyectos esperando publicación'}
                      text={q ? 'Prueba con otro texto o revisa las demás páginas.' : undefined}
                    />
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <span className="adm-cell-title">{project.name}</span>
                      <span className="adm-cell-sub">{project.code}</span>
                    </td>
                    <td>{project.partner.name}</td>
                    <td>{projectTypeLabel(project.type)}</td>
                    <td>{project.region ? `${project.region}, ${project.country}` : project.country}</td>
                    {isPendingTab ? (
                      <td>{formatDate(project.submitted_at || project.created_at)}</td>
                    ) : (
                      <td className="adm-col-num">{project.price_per_ton_clp ? formatCLP(project.price_per_ton_clp) : '—'}</td>
                    )}
                    <td className="adm-col-actions">
                      {isPendingTab ? (
                        <button type="button" className="adm-btn adm-btn--sm" onClick={() => setSelectedProject(project)}>
                          Revisar <ArrowRight aria-hidden="true" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="adm-btn adm-btn--sm adm-btn--primary"
                          onClick={() => handleActivate(project)}
                          disabled={actionLoading === project.id}
                        >
                          <Zap aria-hidden="true" />
                          {actionLoading === project.id ? 'Publicando…' : 'Publicar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Antes no había controles de página: solo se veían los primeros 10 */}
        {!currentLoading && currentTotal > 0 && (
          <Pagination
            page={currentPage}
            totalPages={currentTotalPages}
            total={currentTotal}
            shown={currentProjects.length}
            noun="proyectos"
            onPage={setCurrentPage}
          />
        )}
      </section>
      {dialog}
    </div>
  );
}
