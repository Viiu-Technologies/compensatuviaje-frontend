/**
 * Partner Create Modal
 * Modal para crear nuevo Impact Partner desde SuperAdmin
 */

import { useState } from 'react';
import {
  X,
  Building2,
  Mail,
  Globe,
  User,
  Send,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Handshake
} from 'lucide-react';
import { createPartner } from '../services/adminApi';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

interface FormData {
  partnerName: string;
  contactEmail: string;
  websiteUrl: string;
  adminName: string;
  adminEmail: string;
}

interface FormErrors {
  partnerName?: string;
  contactEmail?: string;
  websiteUrl?: string;
  adminName?: string;
  adminEmail?: string;
}

export default function PartnerCreateModal({ onClose, onCreated }: Props) {
  const [formData, setFormData] = useState<FormData>({
    partnerName: '',
    contactEmail: '',
    websiteUrl: '',
    adminName: '',
    adminEmail: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [createdData, setCreatedData] = useState<any>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.partnerName.trim()) {
      newErrors.partnerName = 'El nombre del partner es requerido';
    } else if (formData.partnerName.length < 3) {
      newErrors.partnerName = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'El email de contacto es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Email de contacto inválido';
    }

    if (formData.websiteUrl && !/^https?:\/\/.+\..+/.test(formData.websiteUrl)) {
      newErrors.websiteUrl = 'URL inválida (debe comenzar con http:// o https://)';
    }

    if (!formData.adminName.trim()) {
      newErrors.adminName = 'El nombre del administrador es requerido';
    } else if (formData.adminName.length < 3) {
      newErrors.adminName = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = 'El email del administrador es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Email del administrador inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    setApiError(null);

    try {
      const response = await createPartner({
        partnerName: formData.partnerName.trim(),
        contactEmail: formData.contactEmail.trim().toLowerCase(),
        websiteUrl: formData.websiteUrl.trim() || undefined,
        adminName: formData.adminName.trim(),
        adminEmail: formData.adminEmail.trim().toLowerCase(),
      });

      setCreatedData(response.data);
      setSuccess(true);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        onCreated();
      }, 3000);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Error al crear el partner');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="!fixed !inset-0 !bg-black/50 !backdrop-blur-sm !flex !items-center !justify-center !z-50 !p-4">
        <div className="!bg-white !rounded-2xl !shadow-2xl !max-w-md !w-full !p-8 !text-center">
          <div className="!w-20 !h-20 !mx-auto !rounded-full !bg-emerald-100 !flex !items-center !justify-center !mb-6">
            <CheckCircle className="!w-10 !h-10 !text-emerald-600" />
          </div>
          <h3 className="!text-2xl !font-bold !text-slate-800 !mb-2">
            ¡Partner Creado!
          </h3>
          <p className="!text-slate-600 !mb-6">
            Se ha creado el partner <strong>{createdData?.partner?.name}</strong> exitosamente.
          </p>
          <div className="!bg-slate-50 !rounded-xl !p-4 !mb-6 !text-left">
            <p className="!text-sm !text-slate-500 !mb-2">Credenciales enviadas a:</p>
            <p className="!font-medium !text-slate-800">{createdData?.admin?.email}</p>
            <p className="!text-xs !text-amber-600 !mt-2 !flex !items-center !gap-1">
              <Mail className="!w-3 !h-3" />
              El usuario recibirá un email con su contraseña temporal
            </p>
          </div>
          <button
            onClick={onCreated}
            className="!w-full !py-3 !bg-indigo-600 !text-white !rounded-xl !font-medium hover:!bg-indigo-700 !transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="!fixed !inset-0 !bg-black/50 !backdrop-blur-sm !flex !items-center !justify-center !z-50 !p-4">
      <div className="!bg-white !rounded-2xl !shadow-2xl !max-w-lg !w-full !max-h-[90vh] !overflow-y-auto">
        {/* Header */}
        <div className="!sticky !top-0 !bg-white !px-6 !py-4 !border-b !border-slate-100 !flex !items-center !justify-between !rounded-t-2xl">
          <div className="!flex !items-center !gap-3">
            <div className="!w-10 !h-10 !rounded-xl !bg-gradient-to-br !from-indigo-500 !to-purple-600 !flex !items-center !justify-center">
              <Handshake className="!w-5 !h-5 !text-white" />
            </div>
            <div>
              <h2 className="!text-lg !font-bold !text-slate-800">Nuevo Impact Partner</h2>
              <p className="!text-sm !text-slate-500">Crear organización y usuario admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="!p-2 !rounded-lg hover:!bg-slate-100 !transition-colors"
          >
            <X className="!w-5 !h-5 !text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="!p-6 !space-y-6">
          {/* API Error */}
          {apiError && (
            <div className="!bg-red-50 !text-red-700 !px-4 !py-3 !rounded-xl !flex !items-center !gap-2 !text-sm">
              <AlertTriangle className="!w-5 !h-5 !flex-shrink-0" />
              {apiError}
            </div>
          )}

          {/* Partner Info Section */}
          <div className="!space-y-4">
            <h3 className="!text-sm !font-semibold !text-slate-700 !uppercase !tracking-wider !flex !items-center !gap-2">
              <Building2 className="!w-4 !h-4" />
              Información del Partner
            </h3>

            {/* Partner Name */}
            <div>
              <label className="!block !text-sm !font-medium !text-slate-700 !mb-1.5">
                Nombre del Partner <span className="!text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.partnerName}
                onChange={(e) => handleChange('partnerName', e.target.value)}
                placeholder="Ej: EcoForest Chile SpA"
                className={`!w-full !px-4 !py-2.5 !border !rounded-xl !bg-white !text-slate-800 placeholder:!text-slate-400 focus:!ring-2 focus:!ring-indigo-500/20 focus:!border-indigo-500 !outline-none !transition-all ${
                  errors.partnerName ? '!border-red-500' : '!border-slate-200'
                }`}
              />
              {errors.partnerName && (
                <p className="!text-red-500 !text-xs !mt-1">{errors.partnerName}</p>
              )}
            </div>

            {/* Contact Email */}
            <div>
              <label className="!block !text-sm !font-medium !text-slate-700 !mb-1.5">
                Email de Contacto <span className="!text-red-500">*</span>
              </label>
              <div className="!relative">
                <Mail className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !w-5 !h-5 !text-slate-400" />
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  placeholder="contacto@empresa.cl"
                  className={`!w-full !pl-10 !pr-4 !py-2.5 !border !rounded-xl !bg-white !text-slate-800 placeholder:!text-slate-400 focus:!ring-2 focus:!ring-indigo-500/20 focus:!border-indigo-500 !outline-none !transition-all ${
                    errors.contactEmail ? '!border-red-500' : '!border-slate-200'
                  }`}
                />
              </div>
              {errors.contactEmail && (
                <p className="!text-red-500 !text-xs !mt-1">{errors.contactEmail}</p>
              )}
            </div>

            {/* Website URL */}
            <div>
              <label className="!block !text-sm !font-medium !text-slate-700 !mb-1.5">
                Sitio Web <span className="!text-slate-400">(opcional)</span>
              </label>
              <div className="!relative">
                <Globe className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !w-5 !h-5 !text-slate-400" />
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => handleChange('websiteUrl', e.target.value)}
                  placeholder="https://www.empresa.cl"
                  className={`!w-full !pl-10 !pr-4 !py-2.5 !border !rounded-xl !bg-white !text-slate-800 placeholder:!text-slate-400 focus:!ring-2 focus:!ring-indigo-500/20 focus:!border-indigo-500 !outline-none !transition-all ${
                    errors.websiteUrl ? '!border-red-500' : '!border-slate-200'
                  }`}
                />
              </div>
              {errors.websiteUrl && (
                <p className="!text-red-500 !text-xs !mt-1">{errors.websiteUrl}</p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="!border-t !border-slate-200"></div>

          {/* Admin User Section */}
          <div className="!space-y-4">
            <h3 className="!text-sm !font-semibold !text-slate-700 !uppercase !tracking-wider !flex !items-center !gap-2">
              <User className="!w-4 !h-4" />
              Usuario Administrador
            </h3>
            <p className="!text-xs !text-slate-500 !-mt-2">
              Se creará un usuario con rol PARTNER_ADMIN y se enviarán las credenciales por email.
            </p>

            {/* Admin Name */}
            <div>
              <label className="!block !text-sm !font-medium !text-slate-700 !mb-1.5">
                Nombre Completo <span className="!text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.adminName}
                onChange={(e) => handleChange('adminName', e.target.value)}
                placeholder="Ej: Juan Pérez González"
                className={`!w-full !px-4 !py-2.5 !border !rounded-xl !bg-white !text-slate-800 placeholder:!text-slate-400 focus:!ring-2 focus:!ring-indigo-500/20 focus:!border-indigo-500 !outline-none !transition-all ${
                  errors.adminName ? '!border-red-500' : '!border-slate-200'
                }`}
              />
              {errors.adminName && (
                <p className="!text-red-500 !text-xs !mt-1">{errors.adminName}</p>
              )}
            </div>

            {/* Admin Email */}
            <div>
              <label className="!block !text-sm !font-medium !text-slate-700 !mb-1.5">
                Email del Administrador <span className="!text-red-500">*</span>
              </label>
              <div className="!relative">
                <Mail className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !w-5 !h-5 !text-slate-400" />
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => handleChange('adminEmail', e.target.value)}
                  placeholder="admin@empresa.cl"
                  className={`!w-full !pl-10 !pr-4 !py-2.5 !border !rounded-xl !bg-white !text-slate-800 placeholder:!text-slate-400 focus:!ring-2 focus:!ring-indigo-500/20 focus:!border-indigo-500 !outline-none !transition-all ${
                    errors.adminEmail ? '!border-red-500' : '!border-slate-200'
                  }`}
                />
              </div>
              {errors.adminEmail && (
                <p className="!text-red-500 !text-xs !mt-1">{errors.adminEmail}</p>
              )}
              <p className="!text-xs !text-slate-500 !mt-1">
                Se enviará un email con las credenciales de acceso
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="!bg-indigo-50 !rounded-xl !p-4">
            <p className="!text-sm !text-indigo-800">
              <strong>¿Qué sucederá?</strong>
            </p>
            <ul className="!text-sm !text-indigo-700 !mt-2 !space-y-1 !list-disc !list-inside">
              <li>Se creará el Partner en estado "Onboarding"</li>
              <li>Se generará un usuario con contraseña temporal</li>
              <li>El usuario recibirá un email con sus credenciales</li>
              <li>El Partner podrá completar su perfil y subir proyectos</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="!flex !gap-3 !pt-4">
            <button
              type="button"
              onClick={onClose}
              className="!flex-1 !py-3 !border !border-slate-200 !text-slate-700 !rounded-xl !font-medium hover:!bg-slate-50 !transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="!flex-1 !py-3 !bg-gradient-to-r !from-indigo-600 !to-purple-600 !text-white !rounded-xl !font-medium hover:!shadow-lg hover:!shadow-indigo-500/30 !transition-all disabled:!opacity-60 disabled:!cursor-not-allowed !flex !items-center !justify-center !gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="!w-5 !h-5 !animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Send className="!w-5 !h-5" />
                  Crear Partner
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
