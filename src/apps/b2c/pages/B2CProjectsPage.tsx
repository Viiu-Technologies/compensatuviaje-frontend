import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formatCLP, formatCLPPerTon } from '../../../utils/currency';
import { calculateTonsFromUnits, calculateUnitsFromKg } from '../../../utils/carbon';
import {
  FaGlobeAmericas, FaLeaf, FaTimes, FaMapMarkerAlt, FaCertificate, FaCreditCard, FaSpinner, FaShieldAlt,
  FaExternalLinkAlt, FaExclamationTriangle,
} from 'react-icons/fa';
import B2CLayout from '../components/B2CLayout';
import b2cApi, { createPaymentTransaction, type B2CProject } from '../services/b2cApi';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import {
  Badge, Card, EmptyState, ErrorState, Progress, Skeleton, btn, cx, fmtInt, fmtNum, projectTypeLabel,
} from '../ui';

/**
 * Proyectos disponibles y pago de la compensación (Webpay).
 *
 * La lógica de pago, de stock y de aceptación de términos no cambió. Antes:
 * los filtros decían "Proyecto, Proyecto…" porque no reconocían los tipos
 * reales; la barra "Progreso mensual" usaba un porcentaje distinto al de su
 * propio texto (vendidas / aprobadas); y cada tarjeta mostraba un emoji en
 * vez de la foto del proyecto.
 */

/** Porcentaje del cupo del mes ya vendido, calculado con los mismos números que se muestran. */
const monthlySoldPct = (p: B2CProject) => {
  const approved = p.monthlyStockApproved || 0;
  const sold = Math.max(approved - (p.monthlyStockRemaining || 0), 0);
  return approved ? Math.round((sold / approved) * 100) : 0;
};

const unitName = (p: B2CProject) => p.impact_unit || 'unidades';

const B2CProjectsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<B2CProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedProject, setSelectedProject] = useState<B2CProject | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [payingProjectId, setPayingProjectId] = useState<string | null>(null);
  // Aceptación explícita de términos y de la exclusión del retracto (Ley 19.496 art. 3 bis):
  // sin ella la exclusión no es oponible al consumidor.
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Contexto que llega desde la calculadora
  const calcId = searchParams.get('calcId');
  const tonsParam = searchParams.get('tons');
  const kgParam = searchParams.get('kg');
  const emissionsKg = kgParam ? parseFloat(kgParam) : tonsParam ? parseFloat(tonsParam) * 1000 : null;
  const hasCalculation = Boolean(calcId && emissionsKg && emissionsKg > 0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const data = await b2cApi.getPublicProjects();
        setProjects(data);
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setLoadError(getErrorMessage(err, 'No pudimos cargar los proyectos. Vuelve a intentarlo en unos momentos.'));
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [reloadKey]);

  useEffect(() => {
    if (!selectedProject) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !payingProjectId) setSelectedProject(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedProject, payingProjectId]);

  /** Total en CLP de compensar la huella del usuario con un proyecto. */
  const getProjectTotalCLP = (project: B2CProject): number | null => {
    if (!emissionsKg || project.pricePerTonCLP <= 0) return null;
    return Math.round(emissionsKg * (project.pricePerTonCLP / 1000));
  };

  /** Inicia el pago en Webpay para un proyecto. */
  const handlePayProject = async (project: B2CProject) => {
    if (!calcId) return;
    setPayingProjectId(project.id);
    setError(null);
    try {
      const physicalUnits =
        project.carbon_capture_per_unit && emissionsKg
          ? calculateUnitsFromKg(emissionsKg, project.carbon_capture_per_unit)
          : undefined;

      const data = await createPaymentTransaction({
        calculationId: calcId,
        projectId: project.id,
        physicalUnits,
        co2KgToFreeze: emissionsKg ?? undefined,
      });

      if (data.success && data.url && data.token) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.url;
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'token_ws';
        input.value = data.token;
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        return;
      }
    } catch (err: any) {
      console.error('Error creating payment:', err);
      setError(getErrorMessage(err, 'No pudimos iniciar el pago. Vuelve a intentarlo o prueba con otro método.'));
    } finally {
      setPayingProjectId(null);
    }
  };

  const uniqueTypes = [...new Set(projects.map((p) => p.projectType))];
  const filters = [{ id: 'all', label: 'Todos' }, ...uniqueTypes.map((t) => ({ id: t, label: projectTypeLabel(t) }))];
  const filteredProjects = filter === 'all' ? projects : projects.filter((p) => p.projectType === filter);

  const layout = (content: React.ReactNode) => (
    <B2CLayout
      title="Proyectos"
      subtitle={hasCalculation ? 'Elige con qué proyecto compensar tu viaje' : 'Los proyectos con los que puedes compensar tu huella'}
    >
      {content}
    </B2CLayout>
  );

  if (loading) {
    return layout(
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" aria-busy="true">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-96" />)}
      </div>,
    );
  }

  if (loadError) {
    return layout(<ErrorState title="No pudimos cargar los proyectos" text={loadError} onRetry={() => setReloadKey((k) => k + 1)} />);
  }

  return layout(
    <div className="space-y-6">
      {hasCalculation && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 flex items-start gap-4">
          <span className="w-10 h-10 rounded-full bg-white text-brand-700 flex items-center justify-center flex-shrink-0">
            <FaLeaf aria-hidden="true" />
          </span>
          <div>
            <p className="m-0 font-semibold text-brand-800">
              Tu huella: {fmtInt(emissionsKg)} kg CO₂e ({fmtNum(emissionsKg! / 1000, 3)} t)
            </p>
            <p className="m-0 mt-0.5 text-sm text-brand-800">Elige un proyecto: el precio se calcula según tu huella.</p>
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {filters.length > 2 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo de proyecto">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={cx(
                'rounded-full border px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors',
                filter === f.id ? 'bg-brand-700 border-brand-700 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <Card>
          <EmptyState
            icon={FaGlobeAmericas}
            title="No hay proyectos disponibles"
            text={filter !== 'all' ? 'No hay proyectos de este tipo por ahora.' : 'Vuelve pronto: estamos incorporando nuevos proyectos.'}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const soldOut = project.isSoldOut;
            const photo = project.photos?.[0]?.thumbnailUrl || project.photos?.[0]?.url || null;
            const approved = project.monthlyStockApproved || 0;
            const sold = Math.max(approved - (project.monthlyStockRemaining || 0), 0);
            const total = hasCalculation ? getProjectTotalCLP(project) : null;
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => { setSelectedProject(project); setAcceptedTerms(false); }}
                className={cx(
                  'text-left bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col cursor-pointer p-0 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand-700',
                  soldOut && 'opacity-70',
                )}
              >
                <div className="h-40 bg-gray-100 relative">
                  {photo ? (
                    <img src={photo} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <FaLeaf className="text-4xl" aria-hidden="true" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3">
                    <Badge tone="neutral" className="bg-white/95">{projectTypeLabel(project.projectType)}</Badge>
                  </span>
                  {soldOut && (
                    <span className="absolute top-3 right-3"><Badge tone="neutral" className="bg-white/95">Agotado este mes</Badge></span>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-semibold text-gray-900 m-0 leading-snug">{project.name}</h3>
                  <div className="mt-1 text-sm text-gray-500 flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-xs flex-shrink-0" aria-hidden="true" />
                    {[project.region, project.country].filter(Boolean).join(', ')}
                  </div>
                  {project.partner?.name && <div className="mt-0.5 text-sm text-gray-500">{project.partner.name}</div>}

                  <dl className="mt-4 space-y-1.5 text-sm m-0">
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Precio</dt>
                      <dd className="m-0 font-semibold text-gray-900">{formatCLPPerTon(project.pricePerTonCLP)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Disponible este mes</dt>
                      <dd className="m-0 font-semibold text-gray-900 text-right">
                        {fmtInt(project.availableUnits)} {unitName(project)}
                        {project.carbon_capture_per_unit && project.availableUnits > 0 ? (
                          <span className="block text-xs font-normal text-gray-500">
                            {fmtNum(calculateTonsFromUnits(project.availableUnits, project.carbon_capture_per_unit), 2)} t CO₂e
                          </span>
                        ) : null}
                      </dd>
                    </div>
                    {total ? (
                      <div className="flex justify-between gap-3 pt-2 border-t border-gray-100">
                        <dt className="text-brand-800 font-medium">Tu compensación</dt>
                        <dd className="m-0 font-bold text-brand-800">{formatCLP(total)}</dd>
                      </div>
                    ) : null}
                  </dl>

                  <div className="mt-auto pt-4">
                    <Progress value={monthlySoldPct(project)} label="Cupo del mes vendido" />
                    <div className="mt-1.5 text-xs text-gray-500">
                      {fmtInt(sold)} de {fmtInt(approved)} {unitName(project)} del cupo mensual ya compensados
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedProject && (() => {
        const p = selectedProject;
        const soldOut = p.isSoldOut;
        const approved = p.monthlyStockApproved || 0;
        const sold = Math.max(approved - (p.monthlyStockRemaining || 0), 0);
        const heroPhoto = p.photos?.[0]?.url ?? null;
        const veritas = p.veritasAI;
        const veritasLabel = veritas?.level
          ? `${veritas.level}${veritas.finalScore !== null ? ` · ${veritas.finalScore} de 100` : ''}`
          : null;

        // Validación de stock
        const neededUnits =
          hasCalculation && emissionsKg && p.carbon_capture_per_unit ? calculateUnitsFromKg(emissionsKg, p.carbon_capture_per_unit) : null;
        const availableStock = p.monthlyStockRemaining ?? 0;
        const hasInsufficientStock = neededUnits !== null && neededUnits > availableStock;
        const isCtaDisabled = soldOut || hasInsufficientStock || payingProjectId === p.id || (hasCalculation && !acceptedTerms);

        // Co-beneficios: arreglo de textos u objeto { clave: true }
        const raw = p.coBenefits;
        const coBenefits: string[] = Array.isArray(raw)
          ? raw.map(String)
          : raw && typeof raw === 'object'
          ? Object.entries(raw).filter(([, v]) => v).map(([k]) => k)
          : [];

        const total = hasCalculation ? getProjectTotalCLP(p) : null;
        const tons = tonsParam ? parseFloat(tonsParam) : (emissionsKg ?? 0) / 1000;

        return (
          <div
            className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4"
            onMouseDown={(e) => { if (e.target === e.currentTarget && !payingProjectId) setSelectedProject(null); }}
          >
            <div role="dialog" aria-modal="true" aria-label={p.name} className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-xl">
              <div className="relative h-48 bg-gray-100">
                {heroPhoto ? (
                  <img src={heroPhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><FaLeaf className="text-5xl" aria-hidden="true" /></div>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 text-gray-700 flex items-center justify-center border-0 cursor-pointer"
                  aria-label="Cerrar"
                >
                  <FaTimes aria-hidden="true" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge tone="neutral">{projectTypeLabel(p.projectType)}</Badge>
                    {soldOut && <Badge tone="neutral">Agotado este mes</Badge>}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 m-0 leading-snug">{p.name}</h2>
                  <div className="mt-1 text-sm text-gray-500">
                    {[p.region, p.country].filter(Boolean).join(', ')}
                    {p.partner?.name && ` · ${p.partner.name}`}
                  </div>
                </div>

                {(veritasLabel || p.certification) && (
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                    <FaShieldAlt className="text-brand-700 flex-shrink-0" aria-hidden="true" />
                    <div className="text-sm">
                      {veritasLabel ? (
                        <>
                          <span className="text-gray-500">Evaluado por Verita AI · </span>
                          <span className="font-semibold text-gray-900">{veritasLabel}</span>
                        </>
                      ) : (
                        <span className="font-semibold text-gray-900">{p.certification}</span>
                      )}
                    </div>
                    {veritasLabel && p.certification && (
                      <span className="ml-auto text-xs text-gray-500 flex items-center gap-1">
                        <FaCertificate aria-hidden="true" /> {p.certification}
                      </span>
                    )}
                  </div>
                )}

                {p.description && <p className="text-sm text-gray-600 leading-relaxed m-0">{p.description}</p>}

                {coBenefits.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {coBenefits.map((c) => <Badge key={c} tone="success">{c}</Badge>)}
                  </div>
                )}

                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">Cupo del mes</span>
                    <span className="text-gray-600">{fmtInt(sold)} de {fmtInt(approved)} {unitName(p)} compensados</span>
                  </div>
                  <Progress value={monthlySoldPct(p)} label="Cupo del mes vendido" />
                  <div className="mt-2 text-xs text-gray-500">Precio: {formatCLPPerTon(p.pricePerTonCLP)}</div>
                </div>

                {total ? (
                  <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
                    <div className="text-sm text-brand-800">Vas a compensar {fmtNum(tons, 3)} t CO₂e</div>
                    {neededUnits !== null && p.impact_unit && (
                      <div className="text-sm text-brand-800 mt-0.5">
                        Tu aporte: <b>{fmtInt(neededUnits)} {p.impact_unit}</b>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-brand-100">
                      <div className="text-xs text-brand-800">Total a pagar</div>
                      <div className="text-3xl font-bold text-brand-800 tabular-nums">{formatCLP(total)}</div>
                    </div>
                  </div>
                ) : null}

                {hasInsufficientStock && neededUnits !== null && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2 text-sm text-amber-900">
                    <FaExclamationTriangle className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <p className="m-0">
                      <b>Stock insuficiente.</b> Tu huella necesita {fmtInt(neededUnits)} {unitName(p)} y este proyecto tiene{' '}
                      {fmtInt(availableStock)} disponibles este mes.
                    </p>
                  </div>
                )}

                {hasCalculation && !soldOut && !hasInsufficientStock && (
                  <label className="flex items-start gap-2.5 text-sm text-gray-600 cursor-pointer leading-relaxed">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 flex-shrink-0 accent-brand-700"
                    />
                    <span>
                      Acepto los{' '}
                      <Link to="/terminos" target="_blank" className="text-brand-700 underline">Términos y Condiciones</Link>{' '}
                      y entiendo que, al confirmarse el pago, la compensación se asigna de inmediato y{' '}
                      <Link to="/reembolsos" target="_blank" className="text-brand-700 underline">no aplica el derecho de retracto</Link>.
                    </span>
                  </label>
                )}

                <button
                  type="button"
                  className={cx(btn.primary, 'w-full py-3 text-base')}
                  disabled={isCtaDisabled}
                  onClick={() => {
                    if (isCtaDisabled) return;
                    if (hasCalculation) handlePayProject(p);
                    else { setSelectedProject(null); window.location.href = '/b2c/calculator'; }
                  }}
                >
                  {payingProjectId === p.id ? (
                    <><FaSpinner className="animate-spin" aria-hidden="true" /> Procesando pago…</>
                  ) : soldOut ? (
                    'Agotado este mes'
                  ) : hasInsufficientStock ? (
                    'Stock insuficiente este mes'
                  ) : hasCalculation ? (
                    <><FaCreditCard aria-hidden="true" /> Pagar y compensar con este proyecto</>
                  ) : (
                    <><FaLeaf aria-hidden="true" /> Primero calcula tu huella</>
                  )}
                </button>

                <div className="text-center text-sm">
                  {p.transparencyUrl ? (
                    <a href={p.transparencyUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-800 inline-flex items-center gap-1.5">
                      Ver evidencia y auditoría del proyecto <FaExternalLinkAlt className="text-xs" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-gray-400">La página de transparencia estará disponible pronto</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>,
  );
};

export default B2CProjectsPage;
