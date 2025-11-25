import React from 'react';
import { motion } from 'framer-motion';

/**
 * StatsCard - Tarjeta de estadística animada
 * Inspirado en Ecologi y TheCommons
 */
const StatsCard = ({ 
  icon: Icon, 
  value, 
  label, 
  suffix = '', 
  color = 'primary',
  delay = 0,
  trend = null, // { value: '+12%', direction: 'up' }
}) => {
  const colorVariants = {
    primary: {
      bg: 'from-primary-100 to-primary-200',
      icon: 'text-primary-500',
      text: 'text-primary-600',
      badge: 'bg-primary-500/10 text-primary-700'
    },
    secondary: {
      bg: 'from-secondary-100 to-secondary-200',
      icon: 'text-secondary-500',
      text: 'text-secondary-600',
      badge: 'bg-secondary-500/10 text-secondary-700'
    },
    accent: {
      bg: 'from-accent-100 to-accent-200',
      icon: 'text-accent-500',
      text: 'text-accent-600',
      badge: 'bg-accent-500/10 text-accent-700'
    },
    success: {
      bg: 'from-green-100 to-green-200',
      icon: 'text-green-600',
      text: 'text-green-600',
      badge: 'bg-green-500/10 text-green-700'
    },
  };

  const colors = colorVariants[color] || colorVariants.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.03, y: -5 }}
      className="card-glass p-6 flex items-center gap-6"
    >
      {/* Icon */}
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors.bg} flex-shrink-0`}>
        <Icon className={`text-4xl ${colors.icon}`} />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`text-4xl font-bold ${colors.text}`}>
            {value}
          </span>
          {suffix && (
            <span className={`text-2xl font-bold ${colors.text}`}>
              {suffix}
            </span>
          )}
          {trend && (
            <span className={`badge ${colors.badge} ml-2 text-xs`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
        <p className="text-neutral-600 font-medium">{label}</p>
      </div>
    </motion.div>
  );
};

export default StatsCard;
