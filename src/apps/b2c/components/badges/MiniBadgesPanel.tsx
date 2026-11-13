import { Badge } from './Badge';
import { SproutSvg, GlobeSvg, TreeSvg } from './BadgeSvgs';
import type { B2CBadgeItem } from '../../services/b2cApi';

interface MiniBadgesPanelProps {
  totalCompensatedKg: number;
  badges?: B2CBadgeItem[];
}

const BADGES = [
  {
    code: 'semilla',
    SvgComponent: SproutSvg,
    title: 'Semilla Climática',
    threshold: 0.001, // any compensation > 0
  },
  {
    code: 'viajero',
    SvgComponent: GlobeSvg,
    title: 'Viajero Consciente',
    threshold: 1000, // 1 tonelada
  },
  {
    code: 'guardian',
    SvgComponent: TreeSvg,
    title: 'Guardián del Clima',
    threshold: 5000, // 5 toneladas
  },
];

export function MiniBadgesPanel({ totalCompensatedKg, badges }: MiniBadgesPanelProps) {
  const byCode = new Map((badges ?? []).map((b) => [b.code, b]));

  return (
    <div className="!mx-4 !mb-4 !flex !gap-3 !justify-center !items-center !px-4 !py-3 !bg-gray-50 !rounded-xl !border !border-gray-100">
      {BADGES.map((badge) => {
        const remote = byCode.get(badge.code);
        const isUnlocked = remote ? remote.unlocked : totalCompensatedKg >= badge.threshold;
        return (
          <Badge
            key={badge.title}
            SvgComponent={badge.SvgComponent}
            title={remote?.title ?? badge.title}
            isUnlocked={isUnlocked}
            size="sm"
          />
        );
      })}
    </div>
  );
}
