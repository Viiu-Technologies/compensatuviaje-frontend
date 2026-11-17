import { useEffect, useRef } from 'react';
import type { MouseEvent, SyntheticEvent } from 'react';
import { raiseToastLayer } from '../raiseToastLayer';

interface UseModalDialogOptions {
  open: boolean;
  /** Se llama al pedir el cierre (Esc, clic fuera). El padre baja `open`. */
  onClose: () => void;
  /** Mientras es true no se puede cerrar (acción en curso). */
  busy?: boolean;
  /** Selector del elemento que recibe el foco al abrir; por defecto, el primer enfocable. */
  initialFocus?: string;
}

/**
 * Convierte un <dialog> nativo en modal controlado por `open`.
 *
 * El navegador aporta la capa superior, la página inerte, la trampa de foco,
 * Escape y la devolución del foco al elemento de origen. Aquí solo se sincroniza
 * con el estado de React y se bloquea el cierre mientras `busy`.
 *
 * El <dialog> debe estar siempre montado (renderizar su contenido solo con
 * `open`): así close() corre antes de ocultarlo y el foco vuelve a su origen.
 *
 * @example
 *   const modal = useModalDialog({ open, onClose, busy });
 *   <dialog {...modal} aria-labelledby={id}>{open && contenido}</dialog>
 */
export function useModalDialog({ open, onClose, busy = false, initialFocus }: UseModalDialogOptions) {
  const ref = useRef<HTMLDialogElement>(null);
  const latest = useRef({ open, onClose, busy });
  latest.current = { open, onClose, busy };

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      // Los toasts van por encima del modal; si no, un error quedaría tapado.
      raiseToastLayer();
      if (initialFocus) dialog.querySelector<HTMLElement>(initialFocus)?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocus]);

  return {
    ref,
    // `closedby` aún no está en los tipos de React: any = Esc + clic fuera.
    ...({ closedby: busy ? 'none' : 'any' } as object),
    // Esc y clic fuera (donde hay `closedby`) llegan como `cancel`. El cierre lo
    // decide el padre vía `open`, para que el estado no se desincronice.
    onCancel: (e: SyntheticEvent<HTMLDialogElement>) => {
      e.preventDefault();
      if (!latest.current.busy) latest.current.onClose();
    },
    // Chrome cierra un modal con un segundo Esc aunque se haya hecho
    // preventDefault: si seguía abierto por prop, se reabre.
    onClose: () => {
      const dialog = ref.current;
      if (latest.current.open && dialog && !dialog.open) {
        dialog.showModal();
        raiseToastLayer();
      }
    },
    // Fallback del clic fuera para navegadores sin `closedby` (Safari). El clic
    // sobre el fondo llega con el propio <dialog> como target; se compara la
    // posición para no cerrar al pulsar su padding.
    onClick: (e: MouseEvent<HTMLDialogElement>) => {
      if ('closedBy' in HTMLDialogElement.prototype) return;
      if (e.target !== e.currentTarget || latest.current.busy) return;
      const r = e.currentTarget.getBoundingClientRect();
      const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (outside) latest.current.onClose();
    },
  };
}
