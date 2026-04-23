// ============================================
// CREATE/EDIT PROJECT PAGE
// Formulario para crear o editar proyectos ESG
// 
// ARQUITECTURA DOBLE CANDADO:
// - Partner solo ingresa datos operativos (costos locales, capacidad)
// - Admin define campos financieros (precio CLP, captura CO2) en aprobación
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  EsgProject,
  ProjectType,
  CreateProjectRequest,
  UpdateProjectRequest,
  PROJECT_TYPE_LABELS
} from '../../../types/partner.types';
import { IMPACT_UNIT_TYPES } from '../../../types/evidence.types';
import {
  createProject,
  updateProject,
  getProjectById
} from '../services/partnerApi';
import { uploadProjectFiles } from '../services/evidenceApi';
import FileUploader from '../../../shared/components/FileUploader';

// ============================================
// FORM FIELD COMPONENT
// ============================================

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  help?: string;
}

const FormField: React.FC<FieldProps> = ({ label, required, error, children, help }) => (
  <div>
    <label className="!block !text-sm !font-medium !text-slate-700 dark:!text-slate-200 !mb-2">
      {label} {required && <span className="!text-red-500 dark:!text-red-400">*</span>}
    </label>
    {children}
    {help && !error && <p className="!text-sm !text-slate-500 dark:!text-slate-400 !mt-1">{help}</p>}
    {error && <p className="!text-sm !text-red-600 dark:!text-red-400 !mt-1">{error}</p>}
  </div>
);

// ============================================
// COUNTRY LIST
// ============================================

const COUNTRIES = [
  'Chile',
  'Argentina',
  'Bolivia',
  'Brasil',
  'Colombia',
  'Ecuador',
  'Paraguay',
  'Perú',
  'Uruguay',
  'Venezuela',
  'México',
  'Costa Rica',
  'Panamá',
  'Guatemala',
  'Estados Unidos',
  'Canadá',
  'España',
  'Otro'
];

const CHILE_REGIONS = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana',
  "O'Higgins",
  'Maule',
  'Ñuble',
  'Biobío',
  'Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes'
];

// ============================================
// MAIN FORM COMPONENT
// ============================================

const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
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
    // Phase 2
    impact_unit_type: '',
    impact_unit_spec: '',
    monthly_stock: undefined,
  });

  // Phase 2: File upload state
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [techDocFiles, setTechDocFiles] = useState<File[]>([]);
  const [operationalDocFiles, setOperationalDocFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      loadProject();
    }
  }, [id, isEditing]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const project = await getProjectById(id!);
      if (project) {
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
          // Phase 2
          impact_unit_type: project.impact_unit_type || '',
          impact_unit_spec: project.impact_unit_spec || '',
          monthly_stock: project.monthly_stock_approved || undefined,
        });
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setError('Error al cargar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
    } else if (!/^[A-Z0-9-_]+$/i.test(formData.code)) {
      newErrors.code = 'El código solo puede contener letras, números, guiones y guiones bajos';
    }

    if (!formData.projectType) {
      newErrors.projectType = 'El tipo de proyecto es requerido';
    }

    if (!formData.country) {
      newErrors.country = 'El país es requerido';
    }

    // Validar costo operativo (recomendado pero no obligatorio)
    if (formData.provider_cost_unit_clp !== undefined && formData.provider_cost_unit_clp < 0) {
      newErrors.provider_cost_unit_clp = 'El costo debe ser un número positivo';
    }

    if (formData.transparencyUrl && !/^https?:\/\/.+/.test(formData.transparencyUrl)) {
      newErrors.transparencyUrl = 'La URL debe comenzar con http:// o https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

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
          capacity_total: formData.capacity_total
        };
        projectResult = await updateProject(id!, updateData);
      } else {
        projectResult = await createProject(formData);
      }

      // Phase 2: Upload files after project creation
      if (projectResult && !isEditing) {
        const projectId = projectResult.id;
        setUploadingFiles(true);

        try {
          if (photoFiles.length > 0) {
            await uploadProjectFiles(projectId, photoFiles, 'photo');
          }
          if (techDocFiles.length > 0) {
            await uploadProjectFiles(projectId, techDocFiles, 'technical_doc');
          }
          if (operationalDocFiles.length > 0) {
            await uploadProjectFiles(projectId, operationalDocFiles, 'operational_doc');
          }
        } catch (uploadErr) {
          console.warn('Some files failed to upload:', uploadErr);
          // Don't block navigation — project was created successfully
        } finally {
          setUploadingFiles(false);
        }

        navigate(`/partner/projects/${projectId}`);
      } else if (projectResult) {
        navigate(`/partner/projects/${id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el proyecto');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    field: keyof CreateProjectRequest,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const generateCode = () => {
    const prefix = formData.projectType?.substring(0, 3).toUpperCase() || 'PRJ';
    const timestamp = Date.now().toString(36).toUpperCase();
    handleChange('code', `${prefix}-${timestamp}`);
  };

  if (loading) {
    return (
      <div className="!min-h-screen !bg-slate-50 dark:!bg-slate-900 !p-6">
        <div className="!max-w-3xl !mx-auto">
          <div className="!animate-pulse">
            <div className="!h-8 !bg-slate-200 dark:!bg-slate-700 !rounded !w-1/3 !mb-4" />
            <div className="!h-4 !bg-slate-200 dark:!bg-slate-700 !rounded !w-1/2 !mb-8" />
            <div className="!bg-white dark:!bg-slate-800 !rounded-xl !p-6 !space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <div className="!h-4 !bg-slate-200 dark:!bg-slate-700 !rounded !w-1/4 !mb-2" />
                  <div className="!h-10 !bg-slate-200 dark:!bg-slate-700 !rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="!min-h-screen !bg-slate-50 dark:!bg-slate-900">
      {/* Header */}
      <div className="!bg-white dark:!bg-slate-800 !border-b !border-slate-200 dark:!border-slate-700">
        <div className="!max-w-3xl !mx-auto !px-6 !py-6">
          <div className="!flex !items-center !gap-4">
            <Link
              to="/partner/projects"
              className="!text-slate-400 dark:!text-slate-500 hover:!text-slate-600 dark:!text-slate-300 !transition-colors"
            >
              <svg className="!w-6 !h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="!text-2xl !font-bold !text-slate-800 dark:!text-slate-100">
                {isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto ESG'}
              </h1>
              <p className="!text-slate-500 dark:!text-slate-400 !mt-1">
                {isEditing
                  ? 'Actualiza la información de tu proyecto'
                  : 'Registra un nuevo proyecto de compensación ambiental'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="!max-w-3xl !mx-auto !px-6 !py-6">
        {error && (
          <div className="!bg-red-50 dark:!bg-red-900/30 !border !border-red-200 dark:!border-red-800 !text-red-700 dark:!text-red-300 !px-4 !py-3 !rounded-lg !mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Info Section */}
          <div className="!bg-white dark:!bg-slate-800 !rounded-xl !border !shadow-sm !p-6 !mb-6">
            <h2 className="!text-lg !font-semibold !text-slate-800 dark:!text-slate-100 !mb-6">Información Básica</h2>
            
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
              <FormField label="Nombre del Proyecto" required error={errors.name}>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ej: Reforestación Bosque Nativo Araucanía"
                  className={`!w-full !px-4 !py-2 !border !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-slate-100 ${
                    errors.name ? '!border-red-300 dark:!border-red-500/50' : '!border-slate-300 dark:!border-slate-600'
                  }`}
                />
              </FormField>

              <FormField label="Código del Proyecto" required error={errors.code}>
                <div className="!flex !gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                    placeholder="REF-ABC123"
                    disabled={isEditing}
                    className={`!flex-1 !px-4 !py-2 !border !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 disabled:!bg-slate-100 dark:disabled:!bg-slate-800 !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-slate-100 ${
                      errors.code ? '!border-red-300 dark:!border-red-500/50' : '!border-slate-300 dark:!border-slate-600'
                    }`}
                  />
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={generateCode}
                      className="!px-3 !py-2 !border !border-slate-300 dark:!border-slate-600 !text-slate-600 dark:!text-slate-300 !rounded-lg hover:!bg-slate-50 dark:!bg-slate-900"
                      title="Generar código"
                    >
                      <svg className="!w-5 !h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                </div>
              </FormField>

              <FormField label="Tipo de Proyecto" required error={errors.projectType}>
                <select
                  value={formData.projectType}
                  onChange={(e) => handleChange('projectType', e.target.value as ProjectType)}
                  disabled={isEditing}
                  className={`!w-full !px-4 !py-2 !border !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 disabled:!bg-slate-100 dark:disabled:!bg-slate-800 !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-slate-100 ${
                    errors.projectType ? '!border-red-300 dark:!border-red-500/50' : '!border-slate-300 dark:!border-slate-600'
                  }`}
                >
                  {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="País" required error={errors.country}>
                <select
                  value={formData.country}
                  onChange={(e) => {
                    handleChange('country', e.target.value);
                    if (e.target.value !== 'Chile') {
                      handleChange('region', '');
                    }
                  }}
                  className={`!w-full !px-4 !py-2 !border !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-slate-100 ${
                    errors.country ? '!border-red-300 dark:!border-red-500/50' : '!border-slate-300 dark:!border-slate-600'
                  }`}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </FormField>

              {formData.country === 'Chile' && (
                <FormField label="Región">
                  <select
                    value={formData.region}
                    onChange={(e) => handleChange('region', e.target.value)}
                    className="!w-full !px-4 !py-2 !border !border-slate-300 dark:!border-slate-600 !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-slate-100"
                  >
                    <option value="">Seleccionar región...</option>
                    {CHILE_REGIONS.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </FormField>
              )}

              <div className="md:!col-span-2">
                <FormField label="Descripción" help="Describe brevemente el proyecto y su impacto ambiental">
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    placeholder="Describe el proyecto, sus objetivos y el impacto ambiental esperado..."
                    className="!w-full !px-4 !py-2 !border !border-slate-300 dark:!border-slate-600 !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-slate-100"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Phase 2: Impact Unit Specification */}
          <div className="!bg-white dark:!bg-slate-800 !rounded-xl !border !shadow-sm !p-6 !mb-6">
            <h2 className="!text-lg !font-semibold !text-slate-800 dark:!text-slate-100 !mb-2">🌿 Unidad de Impacto</h2>
            <p className="!text-sm !text-slate-500 dark:!text-slate-400 !mb-6">
              Especifica exactamente qué unidad de impacto entregas y de qué especie o tipo.
            </p>
            
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
              <FormField label="Tipo de Unidad" required error={errors.impact_unit_type}>
                <select
                  value={formData.impact_unit_type}
                  onChange={(e) => handleChange('impact_unit_type' as any, e.target.value)}
                  className={`!w-full !px-4 !py-2 !border !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-slate-100 ${
                    errors.impact_unit_type ? '!border-red-300' : '!border-slate-300 dark:!border-slate-600'
                  }`}
                >
                  <option value="">Seleccionar...</option>
                  {IMPACT_UNIT_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </FormField>

              <FormField 
                label="Especificación" 
                required 
                error={errors.impact_unit_spec}
                help="Ej: Quillay nativo, Ropa textil recuperada, Agua potable"
              >
                <input
                  type="text"
                  value={formData.impact_unit_spec}
                  onChange={(e) => handleChange('impact_unit_spec' as any, e.target.value)}
                  placeholder="Ej: Quillay nativo"
                  className={`!w-full !px-4 !py-2 !border !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-slate-100 ${
                    errors.impact_unit_spec ? '!border-red-300' : '!border-slate-300 dark:!border-slate-600'
                  }`}
                />
              </FormField>
            </div>

            {formData.impact_unit_type && formData.impact_unit_spec && (
              <div className="!mt-4 !p-3 !bg-emerald-50 dark:!bg-emerald-900/20 !rounded-lg !border !border-emerald-200 dark:!border-emerald-800">
                <p className="!text-sm !text-emerald-700 dark:!text-emerald-300">
                  ✅ Tu unidad de impacto: <strong>1 {formData.impact_unit_type}</strong> de <strong>{formData.impact_unit_spec}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Technical Data Section - Partner Operational Data Only */}
          <div className="!bg-white dark:!bg-slate-800 !rounded-xl !border !shadow-sm !p-6 !mb-6">
            <h2 className="!text-lg !font-semibold !text-slate-800 dark:!text-slate-100 !mb-2">Datos Operativos</h2>
            <p className="!text-sm !text-slate-500 dark:!text-slate-400 !mb-6">
              Ingresa los costos y capacidad en pesos chilenos (CLP). El precio final por tonelada será calculado por nuestro equipo durante la revisión.
            </p>
            
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
              <FormField
                label={`Costo por ${formData.impact_unit_type || 'Unidad'} (CLP)`}
                help={formData.impact_unit_type ? `Costo en pesos chilenos por 1 ${formData.impact_unit_type} de ${formData.impact_unit_spec || '...'}` : 'Costo en pesos chilenos por cada unidad de impacto'}
                error={errors.provider_cost_unit_clp}
              >
                <input
                  type="number"
                  value={formData.provider_cost_unit_clp || ''}
                  onChange={(e) => handleChange(
                    'provider_cost_unit_clp',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )}
                  min="0"
                  placeholder="Ej: 432"
                  className={`!w-full !px-4 !py-2 !border !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-slate-100 ${
                    errors.provider_cost_unit_clp ? '!border-red-300 dark:!border-red-500/50' : '!border-slate-300 dark:!border-slate-600'
                  }`}
                />
              </FormField>

              <FormField
                label="📦 Stock Disponible para este MES (Unidades)"
                help="Cantidad de unidades que puedes entregar en los próximos 30 días"
                required
              >
                <input
                  type="number"
                  value={formData.monthly_stock || ''}
                  onChange={(e) => handleChange(
                    'monthly_stock' as any,
                    e.target.value ? parseInt(e.target.value) : undefined
                  )}
                  min="0"
                  placeholder="Ej: 5000"
                  className="!w-full !px-4 !py-2 !border !border-slate-300 dark:!border-slate-600 !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-slate-100"
                />
              </FormField>

              <FormField
                label="Capacidad Total (histórica)"
                help="Capacidad total del proyecto a lo largo de su vida"
              >
                <input
                  type="number"
                  value={formData.capacity_total || ''}
                  onChange={(e) => handleChange(
                    'capacity_total',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )}
                  min="0"
                  placeholder="Ej: 50000"
                  className="!w-full !px-4 !py-2 !border !border-slate-300 dark:!border-slate-600 !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-slate-100"
                />
              </FormField>

              <FormField
                label="URL de Transparencia"
                error={errors.transparencyUrl}
                help="Enlace a información pública del proyecto"
              >
                <input
                  type="url"
                  value={formData.transparencyUrl}
                  onChange={(e) => handleChange('transparencyUrl', e.target.value)}
                  placeholder="https://ejemplo.com/proyecto-info"
                  className={`!w-full !px-4 !py-2 !border !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-slate-100 ${
                    errors.transparencyUrl ? '!border-red-300 dark:!border-red-500/50' : '!border-slate-300 dark:!border-slate-600'
                  }`}
                />
              </FormField>
            </div>

            {/* Info Box about Admin-controlled fields */}
            <div className="!mt-6 !p-4 !bg-blue-50 dark:!bg-blue-900/20 !border !border-blue-200 dark:!border-blue-800 !rounded-lg">
              <div className="!flex !gap-3">
                <svg className="!w-5 !h-5 !text-blue-600 dark:!text-blue-400 !flex-shrink-0 !mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="!text-sm !font-medium !text-blue-800 dark:!text-blue-300">Precio y Captura de CO₂</h4>
                  <p className="!text-sm !text-blue-600 dark:!text-blue-400 !mt-1">
                    El precio por tonelada (CLP) y la captura de CO₂ por unidad serán definidos por nuestro equipo
                    durante el proceso de revisión, basándose en el dossier técnico y la documentación del proyecto.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 2: Evidence Upload Section */}
          {!isEditing && (
            <div className="!bg-white dark:!bg-slate-800 !rounded-xl !border !shadow-sm !p-6 !mb-6">
              <h2 className="!text-lg !font-semibold !text-slate-800 dark:!text-slate-100 !mb-2">📸 Evidencia Inicial</h2>
              <p className="!text-sm !text-slate-500 dark:!text-slate-400 !mb-6">
                Sube fotos reales de tu operación y documentación técnica para demostrar que tu proyecto existe.
              </p>
              
              <div className="!space-y-6">
                <FileUploader
                  label="Fotos de Operación"
                  description="Sube mínimo 3 fotos de tu operación actual (plantaciones, centro de reciclaje, etc.)"
                  accept="image/jpeg,image/png,image/webp"
                  maxFiles={10}
                  maxSizeMB={15}
                  required
                  files={photoFiles}
                  onFilesChange={setPhotoFiles}
                />

                <FileUploader
                  label="Documentación Técnica/Científica"
                  description="Sube al menos 1 documento técnico (PDF). Ej: Estudio de impacto, certificación forestal."
                  accept="application/pdf"
                  maxFiles={5}
                  maxSizeMB={15}
                  required
                  files={techDocFiles}
                  onFilesChange={setTechDocFiles}
                />

                <FileUploader
                  label="Documentación Operativa (Opcional)"
                  description="Guías de despacho, facturas, contratos. Opcional pero aumenta la confianza."
                  accept="application/pdf,image/jpeg,image/png"
                  maxFiles={5}
                  maxSizeMB={15}
                  files={operationalDocFiles}
                  onFilesChange={setOperationalDocFiles}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="!flex !items-center !justify-between">
            <Link
              to="/partner/projects"
              className="!px-4 !py-2 !text-slate-600 dark:!text-slate-300 hover:!text-slate-800 dark:!text-slate-100 !font-medium"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="!inline-flex !items-center !gap-2 !px-6 !py-2 !bg-green-600 !text-white !rounded-lg hover:!bg-green-700 disabled:!opacity-50 !font-medium !transition-colors"
            >
              {saving ? (
                <>
                  <svg className="!w-5 !h-5 !animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="!opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="!opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="!w-5 !h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {isEditing ? 'Guardar Cambios' : 'Crear Proyecto'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
