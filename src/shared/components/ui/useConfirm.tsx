import React, { useCallback, useRef, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import type { ButtonVariant } from './Button';

export interface ConfirmOptions {
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
}

/**
 * Confirmación con la ergonomía de window.confirm, pero accesible.
 *
 * Migrar cada `if (!confirm(...)) return;` a un diálogo obliga a partir el
 * handler en dos (validar/ejecutar) y a sostener el estado del diálogo a mano.
 * Repetido en ocho puntos, ese trabajo es donde se cuelan los errores.
 *
 * Este hook devuelve una promesa, así que el handler conserva su forma
 * original y solo cambia una línea:
 *
 *   if (!(await confirm({ title: '¿Eliminar?' }))) return;
 *
 * @example
 *   const { confirm, dialog } = useConfirm();
 *   // ...
 *   return <>{contenido}{dialog}</>;
 */
export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [busy, setBusy] = useState(false);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setOptions(null);
    setBusy(false);
  }, []);

  const dialog = (
    <ConfirmDialog
      open={options !== null}
      loading={busy}
      title={options?.title ?? ''}
      description={options?.description}
      confirmLabel={options?.confirmLabel}
      cancelLabel={options?.cancelLabel}
      confirmVariant={options?.confirmVariant}
      onConfirm={() => {
        // El diálogo se cierra al confirmar: quien llama ya gestiona su propio
        // estado de carga en la vista, que es donde el usuario lo espera.
        close(true);
      }}
      onCancel={() => close(false)}
    />
  );

  return { confirm, dialog, setConfirmBusy: setBusy };
}

export default useConfirm;
