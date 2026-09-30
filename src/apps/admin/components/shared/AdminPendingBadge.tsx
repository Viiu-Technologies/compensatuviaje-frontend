import React from 'react';
import { StatusBadge, type StatusTone } from '../../ui';

interface AdminPendingBadgeProps {
  aiStatus: string;
  adminDecision: 'approved' | 'rejected' | null;
  /** Se conserva por compatibilidad; el badge tiene un solo tamaño. */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Estado de una evaluación de IA desde el punto de vista del admin.
 * Lo decidido va en verde/rojo; lo que espera la decisión del admin, en tono
 * de atención, con la recomendación de la IA en el texto.
 */
const AdminPendingBadge: React.FC<AdminPendingBadgeProps> = ({ aiStatus, adminDecision }) => {
  let tone: StatusTone;
  let label: string;

  if (adminDecision === 'approved') {
    tone = 'success';
    label = 'Aprobado';
  } else if (adminDecision === 'rejected') {
    tone = 'danger';
    label = 'Rechazado';
  } else {
    switch (aiStatus) {
      case 'ai_approved':
        tone = 'warning';
        label = 'IA recomienda aprobar';
        break;
      case 'ai_rejected':
        tone = 'warning';
        label = 'IA recomienda rechazar';
        break;
      case 'pending':
        tone = 'neutral';
        label = 'IA procesando';
        break;
      case 'error':
        tone = 'danger';
        label = 'Error en la evaluación de IA';
        break;
      default:
        tone = 'neutral';
        label = 'Sin estado';
    }
  }

  return <StatusBadge tone={tone}>{label}</StatusBadge>;
};

export default AdminPendingBadge;
