import { Badge } from './Badge';
import { SproutSvg, GlobeSvg, TreeSvg } from './BadgeSvgs';

interface TrophyRoomPanelProps {
  totalCompensatedKg: number;
}

const BADGES = [
  {
    SvgComponent: SproutSvg,
    title: 'Semilla Climática',
    description: 'Tu primera compensación de carbono',
    threshold: 0.001,
  },
  {
    SvgComponent: GlobeSvg,
    title: 'Viajero Consciente',
    description: 'Compensaste 1 tonelada de CO₂',
    threshold: 1000,
  },
  {
    SvgComponent: TreeSvg,
    title: 'Guardián del Clima',
    description: 'Compensaste 5 toneladas de CO₂',
    threshold: 5000,
  },
];

export function TrophyRoomPanel({ totalCompensatedKg }: TrophyRoomPanelProps) {
  return (
    <div className="!bg-white !rounded-2xl !p-6 !shadow-sm !border !border-gray-100">
      <div className="!flex !items-center !gap-2 !mb-6">
        <span className="!text-xl">🏆</span>
        <div>
          <h3 className="!text-lg !font-bold !text-gray-800 !mb-0">Tus Logros Climáticos</h3>
          <p className="!text-sm !text-gray-500">Desbloquea insignias compensando CO₂</p>
        </div>
      </div>

      <div className="!grid !grid-cols-3 !gap-4">
        {BADGES.map((badge) => {
          const isUnlocked = totalCompensatedKg >= badge.threshold;
          const remaining = Math.max(0, badge.threshold - totalCompensatedKg);
          const progress = badge.threshold <= 0.001
            ? 100
            : Math.min(100, (totalCompensatedKg / badge.threshold) * 100);

          return (
            <div
              key={badge.title}
              className="!flex !flex-col !items-center !text-center !gap-2"
            >
              <Badge
                SvgComponent={badge.SvgComponent}
                title={badge.title}
                isUnlocked={isUnlocked}
                size="lg"
              />
              <div className="!text-sm !font-semibold !text-gray-800 !leading-tight">
                {badge.title}
              </div>
              <div className="!text-xs !text-gray-500 !leading-tight">
                {badge.description}
              </div>
              {isUnlocked ? (
                <span className="!text-xs !font-bold !text-green-600">
                  ✅ ¡Desbloqueado!
                </span>
              ) : (
                <div className="!w-full">
                  <div className="!w-full !h-1.5 !bg-gray-100 !rounded-full !overflow-hidden !mb-1">
                    <div
                      className="!h-1.5 !bg-green-400 !rounded-full !transition-all !duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="!text-xs !text-gray-400">
                    Faltan {remaining >= 1000 ? `${(remaining / 1000).toFixed(1)} t` : `${Math.ceil(remaining)} kg`}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
