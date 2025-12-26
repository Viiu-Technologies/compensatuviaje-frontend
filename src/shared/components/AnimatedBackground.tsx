import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * AnimatedBackground Component
 * Proporciona un fondo animado con gradientes y efectos visuales
 */
const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      {/* Animated orbs */}
      <motion.div
        className="absolute top-0 -left-4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        animate={{
          y: [0, 50, 0],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      <motion.div
        className="absolute top-0 -right-4 w-72 h-72 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        animate={{
          y: [0, -50, 0],
          x: [0, -50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      <motion.div
        className="absolute -bottom-8 left-20 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        animate={{
          y: [0, 50, 0],
          x: [0, -50, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default AnimatedBackground;
