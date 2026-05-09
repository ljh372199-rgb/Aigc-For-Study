import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1d1d1f] border border-[#3d3d3f] rounded-lg p-3 shadow-lg">
        <p className="text-[#f5f5f7] font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface AreaChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  name?: string;
  color?: string;
  height?: number;
  title?: string;
  gridColor?: string;
  axisColor?: string;
}

export function AreaChart({
  data,
  xKey,
  yKey,
  name,
  color = '#0a84ff',
  height = 300,
  title,
  gridColor = '#3d3d3f',
  axisColor = '#86868b',
}: AreaChartProps) {
  const gradientId = `areaGradient-${yKey}`;

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey={xKey}
            stroke={axisColor}
            tick={{ fill: axisColor, fontSize: 12 }}
            tickLine={{ stroke: axisColor }}
          />
          <YAxis
            stroke={axisColor}
            tick={{ fill: axisColor, fontSize: 12 }}
            tickLine={{ stroke: axisColor }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={yKey}
            name={name || yKey}
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
