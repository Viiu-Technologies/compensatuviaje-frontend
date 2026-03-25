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
      <span className={`${baseClasses} !bg-green-100 dark:!bg-green-900/40 !text-green-800 dark:!text-green-300 !border !border-green-200 dark:!border-green-700`}>
        <CheckCircle className={iconClass} />
        Aprobado por Admin
      </span>
    );
  }

  if (adminDecision === 'rejected') {
    return (
      <span className={`${baseClasses} !bg-red-100 dark:!bg-red-900/40 !text-red-800 dark:!text-red-300 !border !border-red-200 dark:!border-red-700`}>
        <XCircle className={iconClass} />
        Rechazado por Admin
      </span>
    );
  }

  // Pendiente de decisión admin
  switch (aiStatus) {
    case 'ai_approved':
      return (
        <span className={`${baseClasses} !bg-amber-100 dark:!bg-amber-900/40 !text-amber-800 dark:!text-amber-300 !border !border-amber-200 dark:!border-amber-700`}>
          <Bot className={iconClass} />
          IA Aprobó (Requiere revisión)
        </span>
      );
    case 'ai_rejected':
      return (
        <span className={`${baseClasses} !bg-orange-100 dark:!bg-orange-900/40 !text-orange-800 dark:!text-orange-300 !border !border-orange-200 dark:!border-orange-700`}>
          <Bot className={iconClass} />
          IA Rechazó (Requiere revisión)
        </span>
      );
    case 'pending':
      return (
        <span className={`${baseClasses} !bg-blue-100 dark:!bg-blue-900/40 !text-blue-800 dark:!text-blue-300 !border !border-blue-200 dark:!border-blue-700`}>
          <Clock className={`${iconClass} !animate-pulse`} />
          IA Procesando...
        </span>
      );
    case 'error':
      return (
        <span className={`${baseClasses} !bg-red-100 dark:!bg-red-900/40 !text-red-800 dark:!text-red-300 !border !border-red-200 dark:!border-red-700`}>
          <AlertTriangle className={iconClass} />
          Error en IA
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} !bg-gray-100 dark:!bg-gray-800 !text-gray-800 dark:!text-gray-300 !border !border-gray-200 dark:!border-gray-700`}>
          Desconocido
        </span>
      );
  }
};

export default AdminPendingBadge;
