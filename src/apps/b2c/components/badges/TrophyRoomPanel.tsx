import { FaCheckCircle } from 'react-icons/fa';
import { Badge } from './Badge';
import { SproutSvg, GlobeSvg, TreeSvg } from './BadgeSvgs';
import { Card, CardHeader, Progress, fmtKgAuto } from '../../ui';
import type { B2CBadgeItem } from '../../services/b2cApi';

interface TrophyRoomPanelProps {
  totalCompensatedKg: number;
  badges?: B2CBadgeItem[];
}

export const BADGES = [
  { code: 'semilla', SvgComponent: SproutSvg, title: 'Semilla Climática', description: 'Tu primera compensación', threshold: 0.001 },
  { code: 'viajero', SvgComponent: GlobeSvg, title: 'Viajero Consciente', description: 'Compensa 1 t de CO₂e', threshold: 1000 },
  { code: 'guardian', SvgComponent: TreeSvg, title: 'Guardián del Clima', description: 'Compensa 5 t de CO₂e', threshold: 5000 },
];

export function TrophyRoomPanel({ totalCompensatedKg, badges }: TrophyRoomPanelProps) {
  const byCode = new Map((badges ?? []).map((b) => [b.code, b]));

  return (
    <Card>
      <CardHeader title="Insignias" subtitle="Se desbloquean según el CO₂e que compensas en total" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {BADGES.map((badge) => {
          const remote = byCode.get(badge.code);
          const isUnlocked = remote ? remote.unlocked : totalCompensatedKg >= badge.threshold;
          const remaining = remote ? remote.remainingKg : Math.max(0, badge.threshold - totalCompensatedKg);
          const progress = remote
            ? remote.progress
            : Math.min(100, (totalCompensatedKg / badge.threshold) * 100);
          return (
            <div key={badge.title} className="flex flex-col items-center text-center gap-2">
              <Badge SvgComponent={badge.SvgComponent} title={remote?.title ?? badge.title} isUnlocked={isUnlocked} size="lg" />
              <div className="text-sm font-semibold text-gray-900">{remote?.title ?? badge.title}</div>
              <div className="text-xs text-gray-500">{remote?.description ?? badge.description}</div>
              {isUnlocked ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                  <FaCheckCircle aria-hidden="true" /> Desbloqueada
                </span>
              ) : (
                <div className="w-full max-w-[180px]">
                  <Progress value={progress} label={`Avance hacia ${remote?.title ?? badge.title}`} className="h-1.5" />
                  <span className="mt-1 block text-xs text-gray-500">Faltan {fmtKgAuto(remaining)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
