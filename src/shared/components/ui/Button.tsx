import React from 'react';
import './Button.css';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Muestra el spinner y bloquea el botón. El texto se mantiene para que no salte el ancho. */
  loading?: boolean;
  /** Texto anunciado a lectores de pantalla mientras carga. */
  loadingLabel?: string;
  /** Ocupa todo el ancho del contenedor. */
  fullWidth?: boolean;
  /** Icono a la izquierda del texto. Decorativo: se marca aria-hidden. */
  iconLeft?: React.ReactNode;
  /** Icono a la derecha del texto. */
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Botón del sistema de diseño.
 *
 * Sustituye a las 56 clases de botón que convivían en el CSS, cada una con su
 * propio conjunto incompleto de estados. Aquí los seis estados existen siempre:
 * default, hover, active, focus-visible, disabled y loading.
 *
 * El estado de carga era el que más se repetía a mano — 56 componentes hacían
 * su propio `disabled={loading}` más un spinner — y es el que este componente
 * absorbe: además de bloquear el botón, marca aria-busy y anuncia el cambio.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingLabel = 'Procesando…',
      fullWidth = false,
      iconLeft,
      iconRight,
      children,
      className = '',
      disabled,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const classes = [
      'ctvb',
      `ctvb--${variant}`,
      `ctvb--${size}`,
      fullWidth ? 'ctvb--full' : '',
      loading ? 'ctvb--loading' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading && (
          <>
            <span className="ctvb__spinner" aria-hidden="true" />
            <span className="sr-only">{loadingLabel}</span>
          </>
        )}
        {!loading && iconLeft && (
          <span className="ctvb__icon" aria-hidden="true">
            {iconLeft}
          </span>
        )}
        {children != null && <span className="ctvb__label">{children}</span>}
        {!loading && iconRight && (
          <span className="ctvb__icon" aria-hidden="true">
            {iconRight}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
