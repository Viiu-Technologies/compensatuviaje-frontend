import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Trophy,
  Star,
  Lock,
  CheckCircle,
  TreePine,
  Cloud,
  Droplets,
  Users,
  Target,
  Zap,
  Crown,
  Medal,
  Flame,
  Heart,
  Globe,
  Leaf,
  Sparkles,
  Share2
} from 'lucide-react';
import { useTheme } from '../../../../shared/context/ThemeContext';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'impact' | 'milestone' | 'special' | 'community';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedDate?: string;
  points: number;
}

const BadgesView: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'impact', label: 'Impacto' },
    { id: 'milestone', label: 'Hitos' },
    { id: 'special', label: 'Especiales' },
    { id: 'community', label: 'Comunidad' }
  ];

  const badges: Badge[] = [
    {
      id: '1',
      name: 'Primer Árbol',
      description: 'Plantaste tu primer árbol en un proyecto de reforestación.',
      icon: TreePine,
      category: 'impact',
      rarity: 'common',
      progress: 1,
      maxProgress: 1,
      isUnlocked: true,
      unlockedDate: '2024-03-15',
      points: 100
    },
    {
      id: '2',
      name: 'Guardián del Bosque',
      description: 'Planta 100 árboles y conviértete en guardián del bosque.',
      icon: Leaf,
      category: 'milestone',
      rarity: 'rare',
      progress: 67,
      maxProgress: 100,
      isUnlocked: false,
      points: 500
    },
    {
      id: '3',
      name: 'Neutralizador',
      description: 'Compensa tu primera tonelada de CO₂.',
      icon: Cloud,
      category: 'impact',
      rarity: 'common',
      progress: 1,
      maxProgress: 1,
      isUnlocked: true,
      unlockedDate: '2024-04-20',
      points: 150
    },
    {
      id: '4',
      name: 'Héroe Climático',
      description: 'Compensa 10 toneladas de CO₂ equivalente.',
      icon: Globe,
      category: 'milestone',
      rarity: 'epic',
      progress: 4.5,
      maxProgress: 10,
      isUnlocked: false,
      points: 1000
    },
    {
      id: '5',
      name: 'Protector del Agua',
      description: 'Contribuye a proteger fuentes de agua dulce.',
      icon: Droplets,
      category: 'impact',
      rarity: 'rare',
      progress: 1,
      maxProgress: 1,
      isUnlocked: true,
      unlockedDate: '2024-06-10',
      points: 300
    },
    {
      id: '6',
      name: 'Equipo Verde',
      description: 'Invita a 5 miembros de tu equipo a la plataforma.',
      icon: Users,
      category: 'community',
      rarity: 'rare',
      progress: 3,
      maxProgress: 5,
      isUnlocked: false,
      points: 400
    },
    {
      id: '7',
      name: 'Embajador Ambiental',
      description: 'Comparte tu impacto en redes sociales 10 veces.',
      icon: Share2,
      category: 'community',
      rarity: 'common',
      progress: 7,
      maxProgress: 10,
      isUnlocked: false,
      points: 200
    },
    {
      id: '8',
      name: 'Leyenda Verde',
      description: 'Alcanza el nivel máximo de impacto ambiental.',
      icon: Crown,
      category: 'special',
      rarity: 'legendary',
      progress: 0,
      maxProgress: 1,
      isUnlocked: false,
      points: 5000
    },
    {
      id: '9',
      name: 'Racha de Impacto',
      description: 'Realiza compensaciones durante 30 días seguidos.',
      icon: Flame,
      category: 'special',
      rarity: 'epic',
      progress: 12,
      maxProgress: 30,
      isUnlocked: false,
      points: 750
    },
    {
      id: '10',
      name: 'Pionero',
      description: 'Te uniste durante el primer año de la plataforma.',
      icon: Star,
      category: 'special',
      rarity: 'legendary',
      progress: 1,
      maxProgress: 1,
      isUnlocked: true,
      unlockedDate: '2024-01-01',
      points: 1000
    },
    {
      id: '11',
      name: 'Meta Cumplida',
      description: 'Cumple tu primera meta anual de compensación.',
      icon: Target,
      category: 'milestone',
      rarity: 'epic',
      progress: 67,
      maxProgress: 100,
      isUnlocked: false,
      points: 800
    },
    {
      id: '12',
      name: 'Corazón Verde',
      description: 'Dona a 3 proyectos diferentes de conservación.',
      icon: Heart,
      category: 'community',
      rarity: 'rare',
      progress: 2,
      maxProgress: 3,
      isUnlocked: false,
      points: 350
    }
  ];

  const getRarityColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common': return { bg: 'from-gray-400 to-gray-500', border: 'border-gray-300', text: 'text-gray-600' };
      case 'rare': return { bg: 'from-blue-400 to-blue-600', border: 'border-blue-300', text: 'text-blue-600' };
      case 'epic': return { bg: 'from-purple-400 to-purple-600', border: 'border-purple-300', text: 'text-purple-600' };
      case 'legendary': return { bg: 'from-yellow-400 to-orange-500', border: 'border-yellow-300', text: 'text-yellow-600' };
    }
  };

  const getRarityLabel = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common': return 'Común';
      case 'rare': return 'Raro';
      case 'epic': return 'Épico';
      case 'legendary': return 'Legendario';
    }
  };

  const filteredBadges = badges.filter(
    badge => selectedCategory === 'all' || badge.category === selectedCategory
  );

  const totalPoints = badges.filter(b => b.isUnlocked).reduce((acc, b) => acc + b.points, 0);
  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div className="!flex !flex-col lg:!flex-row !items-start lg:!items-center !justify-between !gap-4">
        <div>
          <h1 className={`!text-2xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Insignias</h1>
          <p className={`!text-sm !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Colecciona logros y demuestra tu compromiso ambiental</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="!grid sm:!grid-cols-3 !gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`!rounded-2xl !p-5 !border ${isDark ? '!bg-gradient-to-br !from-yellow-900/30 !to-orange-900/30 !border-yellow-700/50' : '!bg-gradient-to-br !from-yellow-50 !to-orange-50 !border-yellow-200'}`}
        >
          <div className="!flex !items-center !gap-3">
            <div className="!w-14 !h-14 !rounded-xl !bg-gradient-to-br !from-yellow-400 !to-orange-500 !flex !items-center !justify-center !shadow-lg !shadow-yellow-500/30">
              <Trophy className="!w-7 !h-7 !text-white" />
            </div>
            <div>
              <p className={`!text-3xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>{totalPoints.toLocaleString()}</p>
              <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-600'}`}>Puntos totales</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`!rounded-2xl !p-5 !border ${isDark ? '!bg-gradient-to-br !from-green-900/30 !to-emerald-900/30 !border-green-700/50' : '!bg-gradient-to-br !from-green-50 !to-emerald-50 !border-green-200'}`}
        >
          <div className="!flex !items-center !gap-3">
            <div className="!w-14 !h-14 !rounded-xl !bg-gradient-to-br !from-green-400 !to-emerald-500 !flex !items-center !justify-center !shadow-lg !shadow-green-500/30">
              <Award className="!w-7 !h-7 !text-white" />
            </div>
            <div>
              <p className={`!text-3xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>{unlockedCount}/{badges.length}</p>
              <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-600'}`}>Insignias desbloqueadas</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`!rounded-2xl !p-5 !border ${isDark ? '!bg-gradient-to-br !from-purple-900/30 !to-violet-900/30 !border-purple-700/50' : '!bg-gradient-to-br !from-purple-50 !to-violet-50 !border-purple-200'}`}
        >
          <div className="!flex !items-center !gap-3">
            <div className="!w-14 !h-14 !rounded-xl !bg-gradient-to-br !from-purple-400 !to-violet-500 !flex !items-center !justify-center !shadow-lg !shadow-purple-500/30">
              <Zap className="!w-7 !h-7 !text-white" />
            </div>
            <div>
              <p className={`!text-3xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Nivel 5</p>
              <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-600'}`}>Rango actual</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Category Tabs */}
      <div className="!flex !items-center !gap-2 !overflow-x-auto !pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`!px-5 !py-2.5 !rounded-xl !text-sm !font-medium !whitespace-nowrap !transition-all !border-0 ${
              selectedCategory === cat.id
                ? '!bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !shadow-lg !shadow-green-500/30'
                : isDark
                  ? '!bg-gray-700 !text-gray-300 hover:!bg-gray-600'
                  : '!bg-gray-100 !text-gray-600 hover:!bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="!grid sm:!grid-cols-2 lg:!grid-cols-3 xl:!grid-cols-4 !gap-4">
        {filteredBadges.map((badge, index) => {
          const rarityColors = getRarityColor(badge.rarity);
          const progressPercent = (badge.progress / badge.maxProgress) * 100;

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedBadge(badge)}
              className={`!relative !rounded-2xl !p-5 !border ${rarityColors.border} !shadow-lg hover:!shadow-xl !transition-all !cursor-pointer group ${
                !badge.isUnlocked ? '!opacity-75' : ''
              } ${isDark ? '!bg-gray-800/50' : '!bg-white'}`}
            >
              {/* Rarity Badge */}
              <span className={`!absolute !top-3 !right-3 !px-2 !py-0.5 !rounded-full !text-xs !font-semibold ${rarityColors.text} !bg-white !border ${rarityColors.border}`}>
                {getRarityLabel(badge.rarity)}
              </span>

              {/* Icon */}
              <div className={`!relative !w-20 !h-20 !mx-auto !mb-4 !rounded-2xl !bg-gradient-to-br ${rarityColors.bg} !flex !items-center !justify-center !shadow-lg`}>
                <badge.icon className="!w-10 !h-10 !text-white" />
                {!badge.isUnlocked && (
                  <div className="!absolute !inset-0 !bg-black/40 !rounded-2xl !flex !items-center !justify-center">
                    <Lock className="!w-8 !h-8 !text-white" />
                  </div>
                )}
                {badge.isUnlocked && (
                  <div className="!absolute !-bottom-1 !-right-1 !w-7 !h-7 !bg-green-500 !rounded-full !flex !items-center !justify-center !border-2 !border-white">
                    <CheckCircle className="!w-5 !h-5 !text-white" />
                  </div>
                )}
              </div>

              {/* Name */}
              <h3 className={`!text-center !font-bold !mb-1 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>{badge.name}</h3>
              <p className={`!text-center !text-xs !mb-3 !line-clamp-2 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>{badge.description}</p>

              {/* Progress */}
              {!badge.isUnlocked && (
                <div className="!mb-2">
                  <div className={`!flex !justify-between !text-xs !mb-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
                    <span>Progreso</span>
                    <span>{badge.progress}/{badge.maxProgress}</span>
                  </div>
                  <div className={`!h-2 !rounded-full !overflow-hidden ${isDark ? '!bg-gray-700' : '!bg-gray-100'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      className={`!h-full !bg-gradient-to-r ${rarityColors.bg} !rounded-full`}
                    />
                  </div>
                </div>
              )}

              {/* Points */}
              <div className="!flex !items-center !justify-center !gap-1 !mt-3">
                <Star className={`!w-4 !h-4 ${badge.isUnlocked ? '!text-yellow-500 !fill-yellow-500' : '!text-gray-300'}`} />
                <span className={`!text-sm !font-semibold ${badge.isUnlocked ? '!text-yellow-600' : '!text-gray-400'}`}>
                  {badge.points} pts
                </span>
              </div>

              {badge.isUnlocked && badge.unlockedDate && (
                <p className="!text-center !text-xs !text-gray-400 !mt-2">
                  Desbloqueado: {new Date(badge.unlockedDate).toLocaleDateString('es-CL')}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="!fixed !inset-0 !bg-black/50 !backdrop-blur-sm !z-50 !flex !items-center !justify-center !p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="!bg-white !rounded-2xl !p-6 !max-w-md !w-full !shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`!w-24 !h-24 !mx-auto !mb-4 !rounded-2xl !bg-gradient-to-br ${getRarityColor(selectedBadge.rarity).bg} !flex !items-center !justify-center !shadow-lg`}>
              <selectedBadge.icon className="!w-12 !h-12 !text-white" />
            </div>
            <h3 className="!text-xl !font-bold !text-center !text-gray-900 !mb-2">{selectedBadge.name}</h3>
            <p className="!text-center !text-gray-600 !mb-4">{selectedBadge.description}</p>
            
            <div className="!flex !justify-center !gap-4 !mb-4">
              <div className="!text-center">
                <p className={`!text-lg !font-bold ${getRarityColor(selectedBadge.rarity).text}`}>
                  {getRarityLabel(selectedBadge.rarity)}
                </p>
                <p className="!text-xs !text-gray-500">Rareza</p>
              </div>
              <div className="!text-center">
                <p className="!text-lg !font-bold !text-yellow-600">{selectedBadge.points}</p>
                <p className="!text-xs !text-gray-500">Puntos</p>
              </div>
            </div>

            {!selectedBadge.isUnlocked && (
              <div className="!bg-gray-50 !rounded-xl !p-4 !mb-4">
                <div className="!flex !justify-between !text-sm !mb-2">
                  <span className="!text-gray-600">Progreso</span>
                  <span className="!font-semibold">{selectedBadge.progress}/{selectedBadge.maxProgress}</span>
                </div>
                <div className="!h-3 !bg-gray-200 !rounded-full !overflow-hidden">
                  <div
                    className={`!h-full !bg-gradient-to-r ${getRarityColor(selectedBadge.rarity).bg}`}
                    style={{ width: `${(selectedBadge.progress / selectedBadge.maxProgress) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedBadge(null)}
              className="!w-full !py-3 !bg-gray-100 hover:!bg-gray-200 !text-gray-700 !rounded-xl !font-medium !transition-colors !border-0"
            >
              Cerrar
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BadgesView;
