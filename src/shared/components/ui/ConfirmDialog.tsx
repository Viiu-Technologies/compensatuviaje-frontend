import React, { useEffect, useRef } from 'react';
import { Button } from './Button';
import type { ButtonVariant } from './Button';
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
 * Implementa lo que window.confirm no puede: foco atrapado dentro del diálogo,
 * cierre con Escape, devolución del foco al elemento que lo abrió y semántica
 * de modal para lectores de pantalla.
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
  const panelRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Guardar el foco de origen y devolverlo al cerrar: sin esto, quien navega
  // con teclado queda al principio de la página tras confirmar.
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement;
    confirmRef.current?.focus();

    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  // Escape cierra; Tab no sale del diálogo.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        e.stopPropagation();
        onCancel();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const titleId = 'ctvd-title';
  const descId = description ? 'ctvd-desc' : undefined;

  return (
    <div
      className="ctvd__overlay"
      // El clic fuera cancela, pero nunca mientras la acción está en curso:
      // cerrar a media petición dejaría al usuario sin saber en qué quedó.
      onClick={() => !loading && onCancel()}
    >
      <div
        ref={panelRef}
        className="ctvd__panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(e) => e.stopPropagation()}
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
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
