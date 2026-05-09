interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  title?: string;
  unit?: string;
  size?: number;
  greenThreshold?: number;
  yellowThreshold?: number;
}

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  title,
  unit = '',
  size = 200,
  greenThreshold = 60,
  yellowThreshold = 80,
}: GaugeChartProps) {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const angle = (percentage / 100) * 180 - 90;
  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;

  const getColor = (percent: number) => {
    if (percent <= greenThreshold) return '#30d158';
    if (percent <= yellowThreshold) return '#ffd60a';
    return '#ff453a';
  };

  const needleAngle = (percentage / 100) * 180;
  const needleLength = radius - 10;
  const needleX = centerX + needleLength * Math.cos((needleAngle * Math.PI) / 180);
  const needleY = centerY + needleLength * Math.sin((needleAngle * Math.PI) / 180);

  const createArc = (startPercent: number, endPercent: number, color: string) => {
    const startAngle = (startPercent / 100) * 180 - 90;
    const endAngle = (endPercent / 100) * 180 - 90;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  return (
    <div className="flex flex-col items-center">
      {title && <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">{title}</h3>}
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
        <path
          d={createArc(0, greenThreshold, '#30d158')}
          fill="none"
          stroke="#30d158"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d={createArc(greenThreshold, yellowThreshold, '#ffd60a')}
          fill="none"
          stroke="#ffd60a"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d={createArc(yellowThreshold, 100, '#ff453a')}
          fill="none"
          stroke="#ff453a"
          strokeWidth="12"
          strokeLinecap="round"
        />

        <circle cx={centerX} cy={centerY} r="6" fill="#1d1d1f" stroke="#86868b" strokeWidth="2" />

        <line
          x1={centerX}
          y1={centerY}
          x2={needleX}
          y2={needleY}
          stroke="#f5f5f7"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <text
          x={centerX}
          y={centerY + 30}
          textAnchor="middle"
          className="text-2xl font-bold"
          fill="#f5f5f7"
        >
          {value.toLocaleString()}{unit}
        </text>

        <text x={20} y={size * 0.65 - 10} className="text-xs" fill="#86868b">
          {min}
        </text>
        <text x={size - 20} y={size * 0.65 - 10} className="text-xs" fill="#86868b" textAnchor="end">
          {max}
        </text>
      </svg>

      <div className="flex gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#30d158]" />
          <span className="text-xs text-[#86868b]">0-{greenThreshold}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ffd60a]" />
          <span className="text-xs text-[#86868b]">{greenThreshold}-{yellowThreshold}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff453a]" />
          <span className="text-xs text-[#86868b]">{yellowThreshold}+</span>
        </div>
      </div>
    </div>
  );
}
