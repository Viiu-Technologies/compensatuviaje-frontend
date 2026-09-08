import React from 'react';
import './EmptyState.css';

export interface EmptyStateProps {
  /** Qué falta, en lenguaje del usuario: "Aún no tienes vuelos registrados". */
  title: string;
  /** Por qué está vacío o qué aparecerá aquí. */
  description?: React.ReactNode;
  icon?: React.ReactNode;
  /** Acción que resuelve el vacío. Un estado vacío sin salida es un callejón. */
  action?: React.ReactNode;
}

/**
 * Estado vacío.
 *
 * La auditoría encontró estados vacíos resueltos ad-hoc y sin acción: listas
 * que simplemente no mostraban nada. Un estado vacío es una oportunidad de
 * guiar al usuario, no un hueco.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => (
  <div className="ctve" role="status">
    {icon && (
      <div className="ctve__icon" aria-hidden="true">
        {icon}
      </div>
    )}
    <p className="ctve__title">{title}</p>
    {description && <p className="ctve__desc">{description}</p>}
    {action && <div className="ctve__action">{action}</div>}
  </div>
);

export default EmptyState;
