import React from 'react';

interface BadgeProps {
  SvgComponent: React.FC<{ className?: string }>;
  title: string;
  isUnlocked: boolean;
  size: 'sm' | 'lg';
}

export function Badge({ SvgComponent, title, isUnlocked, size }: BadgeProps) {
  const dimension = size === 'sm' ? 'w-10 h-10' : 'w-24 h-24';
  const lockedClasses = 'grayscale opacity-40 transition-all duration-500';
  const unlockedClasses = 'drop-shadow-lg hover:scale-105 transition-all duration-500';

  return (
    <div
      className={`${dimension} ${isUnlocked ? unlockedClasses : lockedClasses}`}
      title={title}
    >
      <SvgComponent />
    </div>
  );
}
