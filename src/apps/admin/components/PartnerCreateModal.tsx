/**
 * Alta de un Impact Partner desde el SuperAdmin: crea la organización y su
 * usuario administrador, que recibe las credenciales por correo.
 */

import { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { createPartner } from '../services/adminApi';
import { Modal } from '../ui';

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

type FormErrors = Partial<Record<keyof FormData, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [apiError, setApiError] = useState<string | null>(null);
  const [createdData, setCreatedData] = useState<any>(null);

  const validateForm = (): boolean => {
    const e: FormErrors = {};

    if (!formData.partnerName.trim()) e.partnerName = 'Escribe el nombre del partner';
    else if (formData.partnerName.trim().length < 3) e.partnerName = 'Debe tener al menos 3 caracteres';

    if (!formData.contactEmail.trim()) e.contactEmail = 'Escribe el correo de contacto';
    else if (!EMAIL_RE.test(formData.contactEmail.trim())) e.contactEmail = 'El correo no es válido';

    if (formData.websiteUrl && !/^https?:\/\/.+\..+/.test(formData.websiteUrl.trim())) {
      e.websiteUrl = 'Debe comenzar con http:// o https://';
    }

    if (!formData.adminName.trim()) e.adminName = 'Escribe el nombre del administrador';
    else if (formData.adminName.trim().length < 3) e.adminName = 'Debe tener al menos 3 caracteres';

    if (!formData.adminEmail.trim()) e.adminEmail = 'Escribe el correo del administrador';
    else if (!EMAIL_RE.test(formData.adminEmail.trim())) e.adminEmail = 'El correo no es válido';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
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
      // Ya no se cierra solo a los 3 segundos: el aviso dice a qué correo
      // llegaron las credenciales, y hay que alcanzar a leerlo.
      setCreatedData(response.data ?? {});
    } catch (err: any) {
      // El interceptor de API devuelve { message, status, data, error_code }
      let errorMessage = 'No se pudo crear el partner';
      if (err.status === 409) {
        if (err.data?.code === 'DUPLICATE_EMAIL') errorMessage = 'Ya existe un usuario con ese correo de administrador';
        else if (err.data?.code === 'DUPLICATE_PARTNER') errorMessage = 'Ya existe un partner con ese nombre o correo de contacto';
        else errorMessage = err.message || 'El correo ya está registrado';
      } else {
        errorMessage = err.message || errorMessage;
      }
      setApiError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (createdData) {
    return (
      <Modal
        open
        title="Partner creado"
        onClose={onCreated}
        footer={<button type="button" className="adm-btn adm-btn--primary" onClick={onCreated}>Continuar</button>}
      >
        <div className="adm-alert adm-alert--success">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <b>{createdData.partner?.name || formData.partnerName}</b> quedó creado en estado «En incorporación».
          </div>
        </div>
        <p>
          Las credenciales se enviaron a <b>{createdData.admin?.email || formData.adminEmail}</b>, con una contraseña
          temporal.
        </p>
      </Modal>
    );
  }

  const field = (
    key: keyof FormData,
    label: string,
    opts: { type?: string; placeholder?: string; optional?: boolean; hint?: string } = {},
  ) => {
    const id = `pc-${key}`;
    const describedBy = [errors[key] ? `${id}-err` : '', opts.hint ? `${id}-hint` : ''].filter(Boolean).join(' ') || undefined;
    return (
      <div className="adm-field">
        <label className="adm-field__label" htmlFor={id}>
          {label} {opts.optional && <span className="adm-cell-mute">(opcional)</span>}
        </label>
        <input
          id={id}
          type={opts.type ?? 'text'}
          className="adm-input"
          value={formData[key]}
          onChange={(e) => handleChange(key, e.target.value)}
          placeholder={opts.placeholder}
          aria-invalid={!!errors[key]}
          aria-describedby={describedBy}
        />
        {errors[key] && <span id={`${id}-err`} className="adm-field__error">{errors[key]}</span>}
        {opts.hint && <span id={`${id}-hint`} className="adm-field__hint">{opts.hint}</span>}
      </div>
    );
  };

  return (
    <Modal
      open
      title="Nuevo Impact Partner"
      onClose={onClose}
      busy={submitting}
      footer={
        <>
          <button type="button" className="adm-btn" onClick={onClose} disabled={submitting}>Cancelar</button>
          <button type="submit" form="partner-create" className="adm-btn adm-btn--primary" disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear partner'}
          </button>
        </>
      }
    >
      <form id="partner-create" onSubmit={handleSubmit} noValidate className="adm-stack-v">
        {apiError && (
          <div role="alert" className="adm-alert adm-alert--danger">
            <AlertTriangle aria-hidden="true" />
            <div>{apiError}</div>
          </div>
        )}

        <h3 className="adm-subhead">Organización</h3>
        {field('partnerName', 'Nombre', { placeholder: 'EcoForest Chile SpA' })}
        {field('contactEmail', 'Correo de contacto', { type: 'email', placeholder: 'contacto@empresa.cl' })}
        {field('websiteUrl', 'Sitio web', { type: 'url', placeholder: 'https://www.empresa.cl', optional: true })}

        <h3 className="adm-subhead">Usuario administrador</h3>
        {field('adminName', 'Nombre completo', { placeholder: 'Juan Pérez González' })}
        {field('adminEmail', 'Correo', {
          type: 'email',
          placeholder: 'admin@empresa.cl',
          hint: 'Recibirá una contraseña temporal por correo y podrá completar el perfil y subir proyectos.',
        })}
      </form>
    </Modal>
  );
}
