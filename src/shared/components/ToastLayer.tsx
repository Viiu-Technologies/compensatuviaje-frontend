import React, { useEffect, useRef } from 'react';
import { Toaster } from 'sonner';
import { TOAST_LAYER_ID } from './raiseToastLayer';
import './ToastLayer.css';

/**
 * Notificaciones globales. richColors da los tonos semánticos de éxito/error;
 * closeButton permite descartarlas con teclado, y sonner ya las publica en una
 * región aria-live.
 *
 * Van dentro de un popover manual para estar en la capa superior del navegador:
 * así se ven también cuando hay un <dialog> modal abierto (ver raiseToastLayer).
 */
export const ToastLayer: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    if (!layer || typeof layer.showPopover !== 'function') return;
    if (!layer.matches(':popover-open')) layer.showPopover();
    return () => {
      if (layer.matches(':popover-open')) layer.hidePopover();
    };
  }, []);

  return (
    <div ref={ref} id={TOAST_LAYER_ID} popover="manual" className="ctv-toast-layer">
      <Toaster
        position="top-center"
        richColors
        closeButton
        duration={5000}
        toastOptions={{
          style: {
            fontFamily: "'Inter', system-ui, sans-serif",
            borderRadius: '12px',
          },
        }}
      />
    </div>
  );
};

export default ToastLayer;
