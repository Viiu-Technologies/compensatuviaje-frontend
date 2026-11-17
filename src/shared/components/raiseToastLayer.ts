export const TOAST_LAYER_ID = 'ctv-toast-layer';

/**
 * Sube la capa de toasts por encima de cualquier <dialog> modal abierto.
 *
 * Un modal nativo vive en la capa superior (top layer) del navegador y tapa todo
 * lo demás, también los toasts. Dentro de esa capa manda el orden de apertura
 * (el último queda encima), así que se reabre el popover de los toasts justo
 * después de abrir un modal. Sin soporte de Popover no hace nada: los toasts
 * se comportan como antes.
 */
export function raiseToastLayer(): void {
  const layer = document.getElementById(TOAST_LAYER_ID);
  if (!layer || typeof layer.showPopover !== 'function') return;
  if (layer.matches(':popover-open')) layer.hidePopover();
  layer.showPopover();
}
