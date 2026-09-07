import React, { useId } from 'react';
import './Input.css';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Etiqueta visible. Siempre se asocia al campo por htmlFor/id. */
  label: string;
  /** Texto de ayuda bajo el campo. */
  hint?: string;
  /** Mensaje de error. Su presencia marca el campo como inválido. */
  error?: string;
  /** Oculta la etiqueta visualmente, pero la mantiene para lectores de pantalla. */
  hideLabel?: boolean;
  iconLeft?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Campo de texto del sistema de diseño.
 *
 * La auditoría encontró que sólo 9 de 179 componentes asociaban su etiqueta al
 * campo, de modo que un lector de pantalla no podía anunciar qué campo estaba
 * enfocado. Aquí la asociación no es opcional: `label` es obligatorio y el id
 * se genera con useId cuando no se pasa uno.
 *
 * El error se enlaza con aria-describedby y se anuncia con role="alert", así
 * que también se percibe sin ver el color rojo.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      hideLabel = false,
      iconLeft,
      fullWidth = true,
      id,
      className = '',
      disabled,
      required,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = id ?? `ctvi-${autoId}`;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div
        className={[
          'ctvi',
          fullWidth ? 'ctvi--full' : '',
          error ? 'ctvi--invalid' : '',
          disabled ? 'ctvi--disabled' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <label
          htmlFor={inputId}
          className={hideLabel ? 'sr-only' : 'ctvi__label'}
        >
          {label}
          {required && (
            <span className="ctvi__required" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>

        <div className="ctvi__field">
          {iconLeft && (
            <span className="ctvi__icon" aria-hidden="true">
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className="ctvi__input"
            disabled={disabled}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            {...rest}
          />
        </div>

        {hint && !error && (
          <p id={hintId} className="ctvi__hint">
            {hint}
          </p>
        )}

        {error && (
          <p id={errorId} className="ctvi__error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
