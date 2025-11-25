import React from 'react';
import { motion } from 'framer-motion';

/**
 * LoadingSpinner - Loading state moderno
 */
export const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const colors = {
    primary: 'border-primary-500',
    secondary: 'border-secondary-500',
    white: 'border-white',
  };

  return (
    <div className={`${sizes[size]} border-4 ${colors[color]} border-t-transparent rounded-full animate-spin`}></div>
  );
};

/**
 * SkeletonLoader - Skeleton para carga de contenido
 */
export const SkeletonLoader = ({ type = 'text', count = 1, className = '' }) => {
  const types = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    card: 'h-48 w-full',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-12 w-32',
  };

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`skeleton ${types[type]} ${className} mb-3`}
        ></div>
      ))}
    </>
  );
};

/**
 * LoadingOverlay - Overlay de carga fullscreen
 */
export const LoadingOverlay = ({ message = 'Cargando...' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="glass p-8 rounded-2xl text-center max-w-sm">
        <LoadingSpinner size="lg" color="primary" />
        <p className="mt-4 text-neutral-700 font-medium">{message}</p>
      </div>
    </motion.div>
  );
};

/**
 * ProgressBar - Barra de progreso animada
 */
export const ProgressBar = ({ progress = 0, color = 'primary', showLabel = true, className = '' }) => {
  const colors = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neutral-700">Progreso</span>
          <span className="text-sm font-bold text-neutral-900">{progress}%</span>
        </div>
      )}
      <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${colors[color]} rounded-full relative overflow-hidden`}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 shimmer opacity-30"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default {
  LoadingSpinner,
  SkeletonLoader,
  LoadingOverlay,
  ProgressBar,
};
