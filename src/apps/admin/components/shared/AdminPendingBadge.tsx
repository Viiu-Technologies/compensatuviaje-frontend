import React from 'react';
import { Bot, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface AdminPendingBadgeProps {
  aiStatus: string;
  adminDecision: 'approved' | 'rejected' | null;
  size?: 'sm' | 'md' | 'lg';
}

const AdminPendingBadge: React.FC<AdminPendingBadgeProps> = ({ aiStatus, adminDecision, size = 'md' }) => {
  const sizeClasses = {
    sm: '!text-xs !px-2 !py-0.5 !gap-1',
    md: '!text-sm !px-2.5 !py-1 !gap-1.5',
    lg: '!text-base !px-3 !py-1.5 !gap-2'
  };

  const iconSizes = {
    sm: '!w-3 !h-3',
    md: '!w-4 !h-4',
    lg: '!w-5 !h-5'
  };

  const baseClasses = `!inline-flex !items-center !font-medium !rounded-full ${sizeClasses[size]}`;
  const iconClass = iconSizes[size];

  // Ya tiene decisión del admin
  if (adminDecision === 'approved') {
    return (
      <span className={`${baseClasses} !bg-green-100 !text-green-800 !border !border-green-200`}>
        <CheckCircle className={iconClass} />
        Aprobado por Admin
      </span>
    );
  }

  if (adminDecision === 'rejected') {
    return (
      <span className={`${baseClasses} !bg-red-100 !text-red-800 !border !border-red-200`}>
        <XCircle className={iconClass} />
        Rechazado por Admin
      </span>
    );
  }

  // Pendiente de decisión admin
  switch (aiStatus) {
    case 'ai_approved':
      return (
        <span className={`${baseClasses} !bg-amber-100 !text-amber-800 !border !border-amber-200`}>
          <Bot className={iconClass} />
          IA Aprobó (Requiere revisión)
        </span>
      );
    case 'ai_rejected':
      return (
        <span className={`${baseClasses} !bg-orange-100 !text-orange-800 !border !border-orange-200`}>
          <Bot className={iconClass} />
          IA Rechazó (Requiere revisión)
        </span>
      );
    case 'pending':
      return (
        <span className={`${baseClasses} !bg-blue-100 !text-blue-800 !border !border-blue-200`}>
          <Clock className={`${iconClass} !animate-pulse`} />
          IA Procesando...
        </span>
      );
    case 'error':
      return (
        <span className={`${baseClasses} !bg-red-100 !text-red-800 !border !border-red-200`}>
          <AlertTriangle className={iconClass} />
          Error en IA
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} !bg-gray-100 !text-gray-800 !border !border-gray-200`}>
          Desconocido
        </span>
      );
  }
};

export default AdminPendingBadge;
