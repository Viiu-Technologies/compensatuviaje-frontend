import React, { useId } from 'react';
import { Button } from './Button';
import type { ButtonVariant } from './Button';
import { useModalDialog } from './useModalDialog';
import './ConfirmDialog.css';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** Explica la consecuencia de la acción, sobre todo si es irreversible. */
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `destructive` para acciones que no se pueden deshacer. */
  confirmVariant?: ButtonVariant;
  /** Bloquea los botones mientras la acción está en curso. */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo de confirmación.
 *
 * Sustituye a window.confirm(), que el proyecto usaba en 10 puntos — entre
 * ellos la liberación de pagos en escrow y la aprobación de certificaciones.
 * El diálogo nativo bloquea el hilo, no admite estilo, no puede mostrar el
 * estado de carga de la acción que dispara y su texto queda a merced del
 * navegador.
 *
 * Usa el elemento <dialog> nativo abierto con showModal(): el navegador pone
 * el resto de la página inerte, atrapa el foco, cierra con Escape, devuelve el
 * foco a quien lo abrió y expone la semántica de modal a lectores de pantalla.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmVariant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  // En una acción destructiva el foco inicial va a la opción segura (Cancelar).
  const modal = useModalDialog({
    open,
    onClose: onCancel,
    busy: loading,
    initialFocus: '[data-autofocus]',
  });

  const titleId = useId();
  const descId = useId();

  return (
    <dialog
      {...modal}
      className="ctvd__panel"
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
    >
      <h2 id={titleId} className="ctvd__title">
        {title}
      </h2>

      {description && (
        <div id={descId} className="ctvd__desc">
          {description}
        </div>
      )}

      <div className="ctvd__actions">
        <Button variant="ghost" data-autofocus={confirmVariant === 'destructive' ? '' : undefined} onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={confirmVariant}
          data-autofocus={confirmVariant === 'destructive' ? undefined : ''}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
};

export default ConfirmDialog;
