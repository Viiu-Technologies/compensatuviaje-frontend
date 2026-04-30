import { Badge } from './Badge';
import { SproutSvg, GlobeSvg, TreeSvg } from './BadgeSvgs';

interface MiniBadgesPanelProps {
  totalCompensatedKg: number;
}

const BADGES = [
  {
    SvgComponent: SproutSvg,
    title: 'Semilla Climática',
    threshold: 0.001, // any compensation > 0
  },
  {
    SvgComponent: GlobeSvg,
    title: 'Viajero Consciente',
    threshold: 1000, // 1 tonelada
  },
  {
    SvgComponent: TreeSvg,
    title: 'Guardián del Clima',
    threshold: 5000, // 5 toneladas
  },
];

export function MiniBadgesPanel({ totalCompensatedKg }: MiniBadgesPanelProps) {
  return (
    <div className="!mx-4 !mb-4 !flex !gap-3 !justify-center !items-center !px-4 !py-3 !bg-gray-50 !rounded-xl !border !border-gray-100">
      {BADGES.map((badge) => (
        <Badge
          key={badge.title}
          SvgComponent={badge.SvgComponent}
          title={badge.title}
          isUnlocked={totalCompensatedKg >= badge.threshold}
          size="sm"
        />
      ))}
    </div>
  );
}
