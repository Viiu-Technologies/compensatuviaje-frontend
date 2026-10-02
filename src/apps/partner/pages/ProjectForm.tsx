// ============================================
// CREATE/EDIT PROJECT PAGE
// Formulario para crear o editar proyectos ESG
//
// ARQUITECTURA DOBLE CANDADO:
// - Partner solo ingresa datos operativos (costos locales, capacidad)
// - Admin define campos financieros (precio CLP, captura CO2) en aprobación
// ============================================

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Info, RefreshCw } from 'lucide-react';
import {
  CreateProjectRequest,
  EsgProject,
  PROJECT_TYPE_LABELS,
  ProjectType,
  UpdateProjectRequest,
} from '../../../types/partner.types';
import { IMPACT_UNIT_TYPES } from '../../../types/evidence.types';
import { createProject, getProjectById, updateProject } from '../services/partnerApi';
import { uploadProjectFiles } from '../services/evidenceApi';
import FileUploader from '../../../shared/components/FileUploader';
import { btn, Card, CardHeader, cx, ErrorState, inputCls, labelCls, PageHeader, Skeleton } from '../ui';

// ============================================
// FORM FIELD
// ============================================

const FormField: React.FC<{
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  help?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ label, htmlFor, required, error, help, className, children }) => (
  <div className={className}>
    <label htmlFor={htmlFor} className={labelCls}>
      {label}
      {required && (
        <span className="text-rose-600 ml-0.5" aria-hidden="true">
          *
        </span>
      )}
    </label>
    {children}
    {error ? (
      <p id={htmlFor ? `${htmlFor}-error` : undefined} className="m-0 mt-1.5 text-xs text-rose-700">
        {error}
      </p>
    ) : (
      help && <p className="m-0 mt-1.5 text-xs text-gray-500">{help}</p>
    )}
  </div>
);

const fieldCls = (hasError?: boolean) => cx(inputCls, hasError && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15');

// ============================================
// LISTAS
// ============================================

const COUNTRIES = [
  'Chile', 'Argentina', 'Bolivia', 'Brasil', 'Colombia', 'Ecuador', 'Paraguay', 'Perú', 'Uruguay', 'Venezuela',
  'México', 'Costa Rica', 'Panamá', 'Guatemala', 'Estados Unidos', 'Canadá', 'España', 'Otro',
];

const CHILE_REGIONS = [
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Metropolitana', "O'Higgins",
  'Maule', 'Ñuble', 'Biobío', 'Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes',
];

const MIN_PHOTOS = 3;

// ============================================
// MAIN FORM COMPONENT
// ============================================

const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: '',
    code: '',
    projectType: 'reforestation',
    description: '',
    country: 'Chile',
    region: '',
    providerOrganization: '',
    transparencyUrl: '',
    provider_cost_unit_clp: undefined,
    capacity_total: undefined,
    impact_unit_type: '',
    impact_unit_spec: '',
    monthly_stock: undefined,
  });

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [techDocFiles, setTechDocFiles] = useState<File[]>([]);
  const [operationalDocFiles, setOperationalDocFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const loadProject = async () => {
    try {
      setLoading(true);
      setLoadFailed(false);
      const project = await getProjectById(id!);
      if (!project) throw new Error('sin proyecto');
      setFormData({
        name: project.name,
        code: project.code,
        projectType: project.type,
        description: project.description || '',
        country: project.location_country,
        region: project.location_region || '',
        providerOrganization: '',
        transparencyUrl: project.transparency_url || '',
        provider_cost_unit_clp: project.provider_cost_unit_clp,
        capacity_total: project.capacity_total,
        impact_unit_type: project.impact_unit_type || '',
        impact_unit_spec: project.impact_unit_spec || '',
        monthly_stock: project.monthly_stock_approved || undefined,
      });
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditing && id) loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

  // Antes varios campos marcados con * no se validaban y el error llegaba
  // recién desde el servidor (o el proyecto se creaba incompleto).
  const validateForm = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = 'Escribe el nombre del proyecto';
    if (!formData.code.trim()) e.code = 'Escribe un código o genera uno';
    else if (!/^[A-Z0-9-_]+$/i.test(formData.code)) e.code = 'Solo letras, números, guiones y guiones bajos';
    if (!formData.projectType) e.projectType = 'Elige el tipo de proyecto';
    if (!formData.country) e.country = 'Elige el país';
    if (!isEditing) {
      if (!formData.impact_unit_type) e.impact_unit_type = 'Elige la unidad de impacto';
      if (!formData.impact_unit_spec?.trim()) e.impact_unit_spec = 'Indica la especie o el tipo';
      if (!formData.monthly_stock || formData.monthly_stock <= 0) e.monthly_stock = 'Indica cuántas unidades puedes entregar este mes';
      if (photoFiles.length < MIN_PHOTOS) e.photos = `Sube al menos ${MIN_PHOTOS} fotos (llevas ${photoFiles.length})`;
      if (techDocFiles.length < 1) e.techDocs = 'Sube al menos un documento técnico en PDF';
    }
    if (formData.provider_cost_unit_clp !== undefined && formData.provider_cost_unit_clp < 0) {
      e.provider_cost_unit_clp = 'El costo no puede ser negativo';
    }
    if (formData.transparencyUrl && !/^https?:\/\/.+/.test(formData.transparencyUrl)) {
      e.transparencyUrl = 'La dirección debe comenzar con http:// o https://';
    }
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const found = validateForm();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Lleva al primer campo con error
      const first = Object.keys(found)[0];
      document.getElementById(`f-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setError(null);
    setSaving(true);
    try {
      let projectResult: EsgProject | null = null;
      if (isEditing) {
        const updateData: UpdateProjectRequest = {
          name: formData.name,
          description: formData.description,
          country: formData.country,
          region: formData.region,
          transparency_url: formData.transparencyUrl,
          provider_cost_unit_clp: formData.provider_cost_unit_clp,
          capacity_total: formData.capacity_total,
        };
        projectResult = await updateProject(id!, updateData);
      } else {
        projectResult = await createProject(formData);
      }

      if (projectResult && !isEditing) {
        const projectId = projectResult.id;
        setUploadingFiles(true);
        let uploadWarning: string | undefined;
        try {
          if (photoFiles.length > 0) await uploadProjectFiles(projectId, photoFiles, 'photo');
          if (techDocFiles.length > 0) await uploadProjectFiles(projectId, techDocFiles, 'technical_doc');
          if (operationalDocFiles.length > 0) await uploadProjectFiles(projectId, operationalDocFiles, 'operational_doc');
        } catch (uploadErr: any) {
          // El proyecto ya se creó: no se bloquea la navegación, pero se avisa.
          uploadWarning =
            uploadErr?.code === 'ECONNABORTED'
              ? 'El proyecto se creó, pero la subida de archivos tardó demasiado y no se completó. Puedes agregarlos luego desde el detalle del proyecto.'
              : 'El proyecto se creó, pero algunos archivos no se pudieron subir. Puedes intentarlo de nuevo desde el detalle del proyecto.';
        } finally {
          setUploadingFiles(false);
        }
        navigate(`/partner/projects/${projectId}`, { state: uploadWarning ? { fileUploadWarning: uploadWarning } : undefined });
      } else if (projectResult) {
        navigate(`/partner/projects/${id}`);
      }
    } catch (err: any) {
      setError(
        err?.code === 'ECONNABORTED'
          ? 'La operación tardó demasiado. Revisa tu conexión e inténtalo de nuevo.'
          : err?.response?.data?.message || 'No pudimos guardar el proyecto. Inténtalo de nuevo.',
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const clearError = (key: string) => {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleChange = (field: keyof CreateProjectRequest, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const generateCode = () => {
    const prefix = formData.projectType?.substring(0, 3).toUpperCase() || 'PRJ';
    handleChange('code', `${prefix}-${Date.now().toString(36).toUpperCase()}`);
  };

  const numberValue = (v?: number) => (v === undefined || Number.isNaN(v) ? '' : v);
  const parseNum = (s: string) => (s === '' ? undefined : parseInt(s, 10));
  const aria = (key: string) => ({ 'aria-invalid': !!errors[key] || undefined, 'aria-describedby': errors[key] ? `f-${key}-error` : undefined });

  const back = isEditing ? { to: `/partner/projects/${id}`, label: 'Volver al proyecto' } : { to: '/partner/projects', label: 'Mis proyectos' };

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-16 w-1/2" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="max-w-3xl">
        <PageHeader back={back} title="Editar proyecto" />
        <ErrorState title="No pudimos cargar el proyecto" onRetry={loadProject} />
      </div>
    );
  }

  const unitName = formData.impact_unit_type || 'unidad';

  return (
    <div className="max-w-3xl">
      <PageHeader
        back={back}
        title={isEditing ? 'Editar proyecto' : 'Nuevo proyecto'}
        subtitle={
          isEditing
            ? 'Actualiza la información de tu proyecto.'
            : 'Registra un proyecto de compensación. Nuestro equipo lo revisará antes de publicarlo.'
        }
      />

      {error && (
        <div role="alert" className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Card>
          <CardHeader title="Información básica" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Nombre del proyecto" htmlFor="f-name" required error={errors.name}>
              <input
                id="f-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ej.: Reforestación bosque nativo Araucanía"
                className={fieldCls(!!errors.name)}
                {...aria('name')}
              />
            </FormField>

            <FormField
              label="Código del proyecto"
              htmlFor="f-code"
              required
              error={errors.code}
              help={isEditing ? 'El código no se puede cambiar.' : 'Identificador interno. Puedes generarlo.'}
            >
              <div className="flex gap-2">
                <input
                  id="f-code"
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                  placeholder="REF-ABC123"
                  disabled={isEditing}
                  className={cx(fieldCls(!!errors.code), 'flex-1 min-w-0')}
                  {...aria('code')}
                />
                {!isEditing && (
                  <button type="button" onClick={generateCode} className={cx(btn.icon, 'w-11 h-auto rounded-xl')} aria-label="Generar código" title="Generar código">
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </FormField>

            <FormField label="Tipo de proyecto" htmlFor="f-projectType" required error={errors.projectType} help={isEditing ? 'El tipo no se puede cambiar.' : undefined}>
              <select
                id="f-projectType"
                value={formData.projectType}
                onChange={(e) => handleChange('projectType', e.target.value as ProjectType)}
                disabled={isEditing}
                className={fieldCls(!!errors.projectType)}
              >
                {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="País" htmlFor="f-country" required error={errors.country}>
              <select
                id="f-country"
                value={formData.country}
                onChange={(e) => {
                  handleChange('country', e.target.value);
                  if (e.target.value !== 'Chile') handleChange('region', '');
                }}
                className={fieldCls(!!errors.country)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>

            {formData.country === 'Chile' && (
              <FormField label="Región" htmlFor="f-region">
                <select id="f-region" value={formData.region} onChange={(e) => handleChange('region', e.target.value)} className={inputCls}>
                  <option value="">Selecciona una región</option>
                  {CHILE_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </FormField>
            )}

            <FormField label="Descripción" htmlFor="f-description" help="Qué hace el proyecto y qué impacto ambiental genera." className="sm:col-span-2">
              <textarea
                id="f-description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                placeholder="Describe el proyecto, sus objetivos y el impacto esperado"
                className={cx(inputCls, 'resize-y')}
              />
            </FormField>
          </div>
        </Card>

        <Card>
          <CardHeader title="Unidad de impacto" subtitle="Qué entregas exactamente por cada unidad que se compensa." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Tipo de unidad" htmlFor="f-impact_unit_type" required={!isEditing} error={errors.impact_unit_type}>
              <select
                id="f-impact_unit_type"
                value={formData.impact_unit_type}
                onChange={(e) => handleChange('impact_unit_type', e.target.value)}
                disabled={isEditing}
                className={fieldCls(!!errors.impact_unit_type)}
                {...aria('impact_unit_type')}
              >
                <option value="">Selecciona</option>
                {IMPACT_UNIT_TYPES.map(({ value }) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Especificación"
              htmlFor="f-impact_unit_spec"
              required={!isEditing}
              error={errors.impact_unit_spec}
              help="Ej.: quillay nativo, ropa textil recuperada, agua potable."
            >
              <input
                id="f-impact_unit_spec"
                type="text"
                value={formData.impact_unit_spec}
                onChange={(e) => handleChange('impact_unit_spec', e.target.value)}
                placeholder="Ej.: quillay nativo"
                disabled={isEditing}
                className={fieldCls(!!errors.impact_unit_spec)}
                {...aria('impact_unit_spec')}
              />
            </FormField>
          </div>
          {formData.impact_unit_type && formData.impact_unit_spec && (
            <p className="m-0 mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
              Cada unidad será: <strong>1 {formData.impact_unit_type.toLowerCase()}</strong> de <strong>{formData.impact_unit_spec}</strong>
            </p>
          )}
        </Card>

        <Card>
          <CardHeader title="Datos operativos" subtitle="Montos en pesos chilenos (CLP)." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label={`Costo por ${unitName.toLowerCase()}`}
              htmlFor="f-provider_cost_unit_clp"
              error={errors.provider_cost_unit_clp}
              help="Lo que te cuesta entregar una unidad."
            >
              <input
                id="f-provider_cost_unit_clp"
                type="number"
                inputMode="numeric"
                min="0"
                value={numberValue(formData.provider_cost_unit_clp)}
                onChange={(e) => handleChange('provider_cost_unit_clp', parseNum(e.target.value))}
                placeholder="Ej.: 432"
                className={fieldCls(!!errors.provider_cost_unit_clp)}
                {...aria('provider_cost_unit_clp')}
              />
            </FormField>

            <FormField
              label="Stock disponible este mes"
              htmlFor="f-monthly_stock"
              required={!isEditing}
              error={errors.monthly_stock}
              help={isEditing ? 'Se actualiza con la evidencia mensual.' : 'Unidades que puedes entregar en los próximos 30 días.'}
            >
              <input
                id="f-monthly_stock"
                type="number"
                inputMode="numeric"
                min="0"
                value={numberValue(formData.monthly_stock)}
                onChange={(e) => handleChange('monthly_stock', parseNum(e.target.value))}
                placeholder="Ej.: 5000"
                disabled={isEditing}
                className={fieldCls(!!errors.monthly_stock)}
                {...aria('monthly_stock')}
              />
            </FormField>

            <FormField label="Capacidad total" htmlFor="f-capacity_total" help="Unidades que el proyecto puede entregar en toda su vida.">
              <input
                id="f-capacity_total"
                type="number"
                inputMode="numeric"
                min="0"
                value={numberValue(formData.capacity_total)}
                onChange={(e) => handleChange('capacity_total', parseNum(e.target.value))}
                placeholder="Ej.: 50000"
                className={inputCls}
              />
            </FormField>

            <FormField label="Página de transparencia" htmlFor="f-transparencyUrl" error={errors.transparencyUrl} help="Enlace público con información del proyecto.">
              <input
                id="f-transparencyUrl"
                type="url"
                value={formData.transparencyUrl}
                onChange={(e) => handleChange('transparencyUrl', e.target.value)}
                placeholder="https://"
                className={fieldCls(!!errors.transparencyUrl)}
                {...aria('transparencyUrl')}
              />
            </FormField>
          </div>

          <div className="mt-5 flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <Info className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="m-0 text-sm text-gray-600">
              <strong className="text-gray-800">El precio por tonelada y la captura de CO₂</strong> los define nuestro equipo durante la revisión,
              a partir del dossier técnico y los documentos del proyecto.
            </p>
          </div>
        </Card>

        {!isEditing && (
          <Card>
            <CardHeader title="Evidencia inicial" subtitle="Fotos reales y documentos técnicos que demuestren que el proyecto existe." />
            <div className="space-y-6">
              <div id="f-photos">
                <FileUploader
                  label="Fotos de la operación"
                  description={`Sube al menos ${MIN_PHOTOS} fotos de tu operación actual (plantaciones, centro de reciclaje, etc.)`}
                  accept="image/jpeg,image/png,image/webp"
                  maxFiles={10}
                  maxSizeMB={15}
                  required
                  files={photoFiles}
                  onFilesChange={(f) => {
                    setPhotoFiles(f);
                    if (f.length >= MIN_PHOTOS) clearError('photos');
                  }}
                />
                {errors.photos && <p className="m-0 mt-1.5 text-xs text-rose-700">{errors.photos}</p>}
              </div>
              <div id="f-techDocs">
                <FileUploader
                  label="Documentación técnica o científica"
                  description="Al menos un PDF. Ej.: estudio de impacto, certificación forestal."
                  accept="application/pdf"
                  maxFiles={5}
                  maxSizeMB={15}
                  required
                  files={techDocFiles}
                  onFilesChange={(f) => {
                    setTechDocFiles(f);
                    if (f.length > 0) clearError('techDocs');
                  }}
                />
                {errors.techDocs && <p className="m-0 mt-1.5 text-xs text-rose-700">{errors.techDocs}</p>}
              </div>
              <FileUploader
                label="Documentación operativa (opcional)"
                description="Guías de despacho, facturas, contratos. Aumenta la confianza en la revisión."
                accept="application/pdf,image/jpeg,image/png"
                maxFiles={5}
                maxSizeMB={15}
                files={operationalDocFiles}
                onFilesChange={setOperationalDocFiles}
              />
            </div>
          </Card>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to={back.to} className={btn.secondary}>
            Cancelar
          </Link>
          <button type="submit" disabled={saving} className={btn.primary}>
            {saving ? (uploadingFiles ? 'Subiendo archivos…' : 'Guardando…') : isEditing ? 'Guardar cambios' : 'Crear proyecto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
