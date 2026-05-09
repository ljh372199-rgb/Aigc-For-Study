import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface LineChartComponentProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  title?: string;
  height?: number;
}

export function LineChartComponent({
  data,
  xKey,
  yKey,
  color = '#0a84ff',
  title,
  height = 300,
}: LineChartComponentProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-text-primary mb-md">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${yKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#3d3d3f" />
          <XAxis dataKey={xKey} stroke="#86868b" />
          <YAxis stroke="#86868b" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1d1d1f',
              border: '1px solid #3d3d3f',
              borderRadius: '6px',
            }}
            labelStyle={{ color: '#f5f5f7' }}
          />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            fillOpacity={1}
            fill={`url(#gradient-${yKey})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
