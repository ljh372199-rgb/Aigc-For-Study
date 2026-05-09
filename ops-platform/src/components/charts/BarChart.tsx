import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

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

interface BarChartComponentProps {
  data: any[];
  xKey: string;
  yKey: string;
  name?: string;
  color?: string;
  colors?: string[];
  title?: string;
  height?: number;
  layout?: 'horizontal' | 'vertical';
  showLabel?: boolean;
  labelColor?: string;
  gridColor?: string;
  axisColor?: string;
}

export function BarChartComponent({
  data,
  xKey,
  yKey,
  name,
  color = '#0a84ff',
  colors,
  title,
  height = 300,
  layout = 'horizontal',
  showLabel = false,
  labelColor = '#f5f5f7',
  gridColor = '#3d3d3f',
  axisColor = '#86868b',
}: BarChartComponentProps) {
  const isHorizontal = layout === 'horizontal';

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} layout={isHorizontal ? 'vertical' : 'horizontal'} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          {isHorizontal ? (
            <>
              <XAxis type="number" stroke={axisColor} tick={{ fill: axisColor, fontSize: 12 }} />
              <YAxis dataKey={xKey} type="category" stroke={axisColor} tick={{ fill: axisColor, fontSize: 12 }} width={80} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} stroke={axisColor} tick={{ fill: axisColor, fontSize: 12 }} />
              <YAxis stroke={axisColor} tick={{ fill: axisColor, fontSize: 12 }} />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={yKey} name={name || yKey} radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors ? colors[index % colors.length] : (entry.color || color)}
              />
            ))}
            {showLabel && (
              <LabelList
                dataKey={yKey}
                position={isHorizontal ? 'right' : 'top'}
                style={{ fill: labelColor, fontSize: 12 }}
                formatter={(value: number) => value.toLocaleString()}
              />
            )}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
