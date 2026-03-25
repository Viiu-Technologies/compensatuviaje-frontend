// ============================================
// CREATE/EDIT PROJECT PAGE
// Formulario para crear o editar proyectos ESG
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
import {
  createProject,
  updateProject,
  getProjectById
} from '../services/partnerApi';

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
    <label className="!block !text-sm !font-medium !text-gray-700 !mb-2">
      {label} {required && <span className="!text-red-500">*</span>}
    </label>
    {children}
    {help && !error && <p className="!text-sm !text-gray-500 !mt-1">{help}</p>}
    {error && <p className="!text-sm !text-red-600 !mt-1">{error}</p>}
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
    carbon_capture_per_unit: undefined,
    capacity_total: undefined,
    currentBasePriceUsdPerTon: undefined
  });

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
          carbon_capture_per_unit: project.carbon_capture_per_unit,
          capacity_total: project.capacity_total,
          currentBasePriceUsdPerTon: project.base_price_usd_per_ton
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

    if (!formData.currentBasePriceUsdPerTon) {
      newErrors.currentBasePriceUsdPerTon = 'El precio base es requerido para su validación';
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
      if (isEditing) {
        const updateData: UpdateProjectRequest = {
          name: formData.name,
          description: formData.description,
          country: formData.country,
          region: formData.region,
          transparency_url: formData.transparencyUrl,
          provider_cost_unit_clp: formData.provider_cost_unit_clp,
          carbon_capture_per_unit: formData.carbon_capture_per_unit,
          capacity_total: formData.capacity_total,
          currentBasePriceUsdPerTon: formData.currentBasePriceUsdPerTon
        };
        const result = await updateProject(id!, updateData);
        if (result) {
          navigate(`/partner/projects/${id}`);
        }
      } else {
        const result = await createProject(formData);
        if (result) {
          navigate(`/partner/projects/${result.id}`);
        }
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
      <div className="!min-h-screen !bg-gray-50 !p-6">
        <div className="!max-w-3xl !mx-auto">
          <div className="!animate-pulse">
            <div className="!h-8 !bg-gray-200 !rounded !w-1/3 !mb-4" />
            <div className="!h-4 !bg-gray-200 !rounded !w-1/2 !mb-8" />
            <div className="!bg-white !rounded-xl !p-6 !space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <div className="!h-4 !bg-gray-200 !rounded !w-1/4 !mb-2" />
                  <div className="!h-10 !bg-gray-200 !rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="!min-h-screen !bg-gray-50">
      {/* Header */}
      <div className="!bg-white !border-b">
        <div className="!max-w-3xl !mx-auto !px-6 !py-6">
          <div className="!flex !items-center !gap-4">
            <Link
              to="/partner/projects"
              className="!text-gray-400 hover:!text-gray-600 !transition-colors"
            >
              <svg className="!w-6 !h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="!text-2xl !font-bold !text-gray-800">
                {isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto ESG'}
              </h1>
              <p className="!text-gray-500 !mt-1">
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
          <div className="!bg-red-50 !border !border-red-200 !text-red-700 !px-4 !py-3 !rounded-lg !mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Info Section */}
          <div className="!bg-white !rounded-xl !border !shadow-sm !p-6 !mb-6">
            <h2 className="!text-lg !font-semibold !text-gray-800 !mb-6">Información Básica</h2>
            
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
              <FormField label="Nombre del Proyecto" required error={errors.name}>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ej: Reforestación Bosque Nativo Araucanía"
                  className={`!w-full !px-4 !py-2 !border !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white !text-gray-900 ${
                    errors.name ? '!border-red-300' : '!border-gray-300'
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
                    className={`!flex-1 !px-4 !py-2 !border !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 disabled:!bg-gray-100 !bg-white !text-gray-900 ${
                      errors.code ? '!border-red-300' : '!border-gray-300'
                    }`}
                  />
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={generateCode}
                      className="!px-3 !py-2 !border !border-gray-300 !text-gray-600 !rounded-lg hover:!bg-gray-50"
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
                  className={`!w-full !px-4 !py-2 !border !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 disabled:!bg-gray-100 !bg-white !text-gray-900 ${
                    errors.projectType ? '!border-red-300' : '!border-gray-300'
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
                  className={`!w-full !px-4 !py-2 !border !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white !text-gray-900 ${
                    errors.country ? '!border-red-300' : '!border-gray-300'
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
                    className="!w-full !px-4 !py-2 !border !border-gray-300 !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white !text-gray-900"
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
                    className="!w-full !px-4 !py-2 !border !border-gray-300 !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white !text-gray-900"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Technical Data Section */}
          <div className="!bg-white !rounded-xl !border !shadow-sm !p-6 !mb-6">
            <h2 className="!text-lg !font-semibold !text-gray-800 !mb-6">Datos Técnicos</h2>
            
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
              <FormField
                label="Precio Base (USD por Tonelada)"
                help="Precio referencial internacional en dólares (USD)"
                required
                error={errors.currentBasePriceUsdPerTon}
              >
                <input
                  type="number"
                  value={formData.currentBasePriceUsdPerTon || ''}
                  onChange={(e) => handleChange(
                    'currentBasePriceUsdPerTon',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )}
                  min="0"
                  step="0.01"
                  placeholder="Ej: 12.5"
                  className={`!w-full !px-4 !py-2 !border !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white !text-gray-900 ${
                    errors.currentBasePriceUsdPerTon ? '!border-red-300' : '!border-gray-300'
                  }`}
                />
              </FormField>

              <FormField
                label="Costo por Unidad (CLP)"
                help="Costo en pesos chilenos por cada unidad de compensación"
              >
                <input
                  type="number"
                  value={formData.provider_cost_unit_clp || ''}
                  onChange={(e) => handleChange(
                    'provider_cost_unit_clp',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )}
                  min="0"
                  placeholder="Ej: 5000"
                  className="!w-full !px-4 !py-2 !border !border-gray-300 !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white !text-gray-900"
                />
              </FormField>

              <FormField
                label="Captura CO₂ por Unidad (kg)"
                help="Cantidad de CO₂ capturado por cada unidad vendida"
              >
                <input
                  type="number"
                  value={formData.carbon_capture_per_unit || ''}
                  onChange={(e) => handleChange(
                    'carbon_capture_per_unit',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )}
                  min="0"
                  step="0.01"
                  placeholder="Ej: 100"
                  className="!w-full !px-4 !py-2 !border !border-gray-300 !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white !text-gray-900"
                />
              </FormField>

              <FormField
                label="Capacidad Total (unidades)"
                help="Cantidad total de unidades disponibles para venta"
              >
                <input
                  type="number"
                  value={formData.capacity_total || ''}
                  onChange={(e) => handleChange(
                    'capacity_total',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )}
                  min="0"
                  placeholder="Ej: 10000"
                  className="!w-full !px-4 !py-2 !border !border-gray-300 !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white !text-gray-900"
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
                  className={`!w-full !px-4 !py-2 !border !rounded-lg focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !bg-white !text-gray-900 ${
                    errors.transparencyUrl ? '!border-red-300' : '!border-gray-300'
                  }`}
                />
              </FormField>
            </div>
          </div>

          {/* Actions */}
          <div className="!flex !items-center !justify-between">
            <Link
              to="/partner/projects"
              className="!px-4 !py-2 !text-gray-600 hover:!text-gray-800 !font-medium"
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
