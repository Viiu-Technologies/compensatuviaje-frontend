import React from 'react';
import './Card.css';

export type CardVariant = 'flat' | 'elevated' | 'outlined';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Aplica hover y foco visibles. Úsalo solo si la tarjeta entera actúa. */
  interactive?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  /** Etiqueta `as="li"` cuando la tarjeta vive dentro de una lista. */
  as?: 'div' | 'li' | 'article' | 'section';
  children?: React.ReactNode;
}

/**
 * Tarjeta del sistema de diseño.
 *
 * El CSS acumulaba 105 clases de tarjeta sin estructura común: cada una
 * inventaba sus propios slots, su radio y su sombra. Aquí header, body y
 * footer son siempre los mismos y la elevación sale de la escala.
 *
 * `interactive` añade :focus-within además de :hover. Las tarjetas clicables
 * del proyecto solo tenían hover, así que quien navegaba con teclado no veía
 * cuál estaba enfocada.
 */
export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  interactive = false,
  header,
  footer,
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}) => {
  const classes = [
    'ctvc',
    `ctvc--${variant}`,
    interactive ? 'ctvc--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} {...rest}>
      {header && <div className="ctvc__header">{header}</div>}
      <div className="ctvc__body">{children}</div>
      {footer && <div className="ctvc__footer">{footer}</div>}
    </Tag>
  );
};

export default Card;
