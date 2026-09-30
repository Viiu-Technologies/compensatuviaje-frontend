import React, { useEffect, useState } from 'react';
import { Modal } from '../../ui';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  title: string;
  itemName: string;
  loading?: boolean;
  /** Cuando es false, se omite el campo de motivo y se pide solo confirmación (para acciones tipo "aprobar"). Default: true. */
  requireReason?: boolean;
  /** Texto de la pregunta de confirmación cuando requireReason es false. */
  confirmMessage?: string;
  /** Texto del botón de confirmar. Default: "Confirmar rechazo" / "Confirmar". */
  confirmLabel?: string;
  /** Estilo del botón de confirmar. Default: 'danger' (rechazar). 'primary' para aprobar/confirmar. */
  variant?: 'danger' | 'primary';
}

const MIN_REASON = 10;

/**
 * Confirmación de aprobar/rechazar del admin, sobre el Modal del sistema de
 * diseño (Escape, foco y estilos comunes). Mantiene la API anterior.
 */
const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  loading = false,
  requireReason = true,
  confirmMessage,
  confirmLabel,
  variant = 'danger',
}) => {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  // Cada apertura empieza con el campo vacío
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setTouched(false);
    }
  }, [isOpen]);

  const tooShort = requireReason && reason.trim().length < MIN_REASON;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (tooShort) return;
    await onConfirm(reason);
  };

  const formId = 'adm-reject-form';

  return (
    <Modal
      open={isOpen}
      title={title}
      onClose={onClose}
      busy={loading}
      footer={
        <>
          <button type="button" className="adm-btn" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            type="submit"
            form={formId}
            className={`adm-btn ${variant === 'primary' ? 'adm-btn--primary' : 'adm-btn--danger'}`}
            disabled={loading || tooShort}
          >
            {loading
              ? requireReason ? 'Rechazando…' : 'Procesando…'
              : confirmLabel || (requireReason ? 'Confirmar rechazo' : 'Confirmar')}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} style={{ display: 'contents' }}>
        <p>
          {requireReason ? 'Vas a rechazar ' : confirmMessage ? `${confirmMessage} ` : 'Vas a confirmar esta acción para '}
          <b>{itemName}</b>.
        </p>

        {requireReason && (
          <div className="adm-field">
            <label className="adm-field__label" htmlFor="adm-reject-reason">Motivo del rechazo</label>
            <span className="adm-field__hint">Se enviará al partner para que pueda corregir el problema.</span>
            <textarea
              id="adm-reject-reason"
              className="adm-textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="Explica qué hay que corregir"
              disabled={loading}
              aria-invalid={touched && tooShort}
              aria-describedby="adm-reject-count"
            />
            <span id="adm-reject-count" className={touched && tooShort ? 'adm-field__error' : 'adm-field__hint'}>
              {touched && tooShort
                ? `Escribe al menos ${MIN_REASON} caracteres (${reason.trim().length}/${MIN_REASON}).`
                : `Mínimo ${MIN_REASON} caracteres.`}
            </span>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default RejectModal;
