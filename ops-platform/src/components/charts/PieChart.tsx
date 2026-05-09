import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: any;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1d1d1f] border border-[#3d3d3f] rounded-lg p-3 shadow-lg">
        <p className="text-[#f5f5f7] font-medium">{data.name}</p>
        <p className="text-[#86868b] text-sm">{data.value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

interface PieChartComponentProps {
  data: any[];
  nameKey: string;
  valueKey: string;
  colors?: string[];
  title?: string;
  height?: number;
  centerValue?: number;
  centerLabel?: string;
  outerRadius?: number;
  innerRadius?: number;
}

const defaultColors = ['#0a84ff', '#30d158', '#ffd60a', '#ff453a', '#bf5af2', '#ff9f0a', '#64d2ff'];

export function PieChartComponent({
  data,
  nameKey,
  valueKey,
  colors = defaultColors,
  title,
  height = 300,
  centerValue,
  centerLabel,
  outerRadius = 80,
  innerRadius = 0,
}: PieChartComponentProps) {
  const totalValue = centerValue ?? data.reduce((sum, item) => sum + item[valueKey], 0);
  const hasCenterLabel = centerValue !== undefined || centerLabel !== undefined;

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy } = props;
    return (
      <>
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-3xl font-bold"
          fill="#f5f5f7"
        >
          {totalValue.toLocaleString()}
        </text>
        {centerLabel && (
          <text
            x={cx}
            y={cy + 20}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm"
            fill="#86868b"
          >
            {centerLabel}
          </text>
        )}
      </>
    );
  };

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy={hasCenterLabel ? '45%' : '50%'}
            labelLine={false}
            label={!hasCenterLabel ? ({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%` : false}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey={valueKey}
            nameKey={nameKey}
            paddingAngle={2}
            label={hasCenterLabel ? renderCustomizedLabel : false}
          >
            {data.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              color: '#86868b',
              fontSize: '12px',
            }}
            formatter={(value) => <span style={{ color: '#f5f5f7' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
