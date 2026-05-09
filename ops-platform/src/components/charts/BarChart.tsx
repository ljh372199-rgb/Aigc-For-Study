import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BarChartComponentProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  title?: string;
  height?: number;
}

export function BarChartComponent({
  data,
  xKey,
  yKey,
  color = '#0a84ff',
  title,
  height = 300,
}: BarChartComponentProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-text-primary mb-md">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
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
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
