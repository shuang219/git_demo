import type { DetectionItem } from '../../../../shared/types/api';

interface DetectionOverlayProps {
  items: DetectionItem[];
}

const riskColors: Record<DetectionItem['risk'], string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
  critical: '#EF4444',
};

const riskBg: Record<DetectionItem['risk'], string> = {
  low: 'bg-[#10B981]',
  medium: 'bg-[#F59E0B]',
  high: 'bg-[#EF4444]',
  critical: 'bg-[#EF4444]',
};

export default function DetectionOverlay({ items }: DetectionOverlayProps) {
  return (
    <>
      {items.map((item, idx) => {
        const positions = [
          { top: '30%', left: '28%' },
          { top: '15%', right: '22%' },
          { top: '55%', left: '55%' },
          { top: '20%', left: '45%' },
        ];
        const pos = positions[idx % positions.length];
        return (
          <div
            key={item.id}
            className="absolute"
            style={{ ...pos }}
          >
            <div
              className="border-4 rounded-lg p-2 w-16 h-16"
              style={{ borderColor: riskColors[item.risk] }}
            />
            <span
              className={`absolute -top-8 left-0 ${riskBg[item.risk]} text-white px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap`}
            >
              {item.label} ({item.distance})
            </span>
          </div>
        );
      })}
    </>
  );
}
