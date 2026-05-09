import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PieChartComponentProps {
  data: any[];
  nameKey: string;
  valueKey: string;
  colors?: string[];
  title?: string;
  height?: number;
}

const defaultColors = ['#0a84ff', '#30d158', '#ffd60a', '#ff453a', '#bf5af2', '#ff9f0a', '#64d2ff'];

export function PieChartComponent({
  data,
  nameKey,
  valueKey,
  colors = defaultColors,
  title,
  height = 300,
}: PieChartComponentProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-text-primary mb-md">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={valueKey}
            nameKey={nameKey}
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1d1d1f',
              border: '1px solid #3d3d3f',
              borderRadius: '6px',
            }}
            labelStyle={{ color: '#f5f5f7' }}
          />
          <Legend
            wrapperStyle={{
              color: '#f5f5f7',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
