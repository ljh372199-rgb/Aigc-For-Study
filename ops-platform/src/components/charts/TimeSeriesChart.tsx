import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export interface TimeSeriesConfig {
  key: string;
  name: string;
  color?: string;
}

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

interface CustomLegendProps {
  payload?: Array<{
    value: string;
    color: string;
  }>;
}

const CustomLegend = ({ payload }: CustomLegendProps) => {
  if (!payload) return null;
  return (
    <div className="flex justify-center gap-6 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[#86868b] text-sm">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

interface TimeSeriesChartProps {
  data: any[];
  series: TimeSeriesConfig[];
  xKey?: string;
  height?: number;
  title?: string;
  gridColor?: string;
  axisColor?: string;
}

export function TimeSeriesChart({
  data,
  series,
  xKey = 'time',
  height = 300,
  title,
  gridColor = '#3d3d3f',
  axisColor = '#86868b',
}: TimeSeriesChartProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
          <Legend content={<CustomLegend />} />
          {series.map((s, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color || '#0a84ff'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: s.color || '#0a84ff' }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
