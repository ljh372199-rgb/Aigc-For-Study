import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Tabs } from '@/components/ui';
import { TimeSeriesChart } from '@/components/charts';
import {
  Clock,
  TrendingUp,
  Activity,
  AlertCircle,
  Users,
  Filter,
} from 'lucide-react';

type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

interface MetricData {
  requests: number;
  avgLatency: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  errorRate: number;
  activeConnections: number;
}

interface ChartDataPoint {
  time: string;
  [key: string]: string | number;
}

function generateChartData(range: TimeRange): ChartDataPoint[] {
  const dataPoints = {
    '1h': 60,
    '6h': 72,
    '24h': 96,
    '7d': 168,
    '30d': 360,
  };

  const points = dataPoints[range];
  const data: ChartDataPoint[] = [];

  for (let i = 0; i < points; i++) {
    const date = new Date();
    if (range === '1h') {
      date.setMinutes(date.getMinutes() - (points - i));
    } else if (range === '6h') {
      date.setMinutes(date.getMinutes() - (points - i) * 5);
    } else if (range === '24h') {
      date.setHours(date.getHours() - (points - i));
    } else if (range === '7d') {
      date.setHours(date.getHours() - (points - i) * 1);
    } else {
      date.setHours(date.getHours() - (points - i) * 2);
    }

    data.push({
      time: range === '30d'
        ? `${date.getMonth() + 1}/${date.getDate()}`
        : `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`,
      requests: Math.floor(Math.random() * 3000) + 1000,
      latency: Math.floor(Math.random() * 150) + 50,
      errors: Math.floor(Math.random() * 30),
      connections: Math.floor(Math.random() * 200) + 50,
    });
  }

  return data;
}

function generateMetrics(): MetricData {
  return {
    requests: Math.floor(Math.random() * 10000) + 5000,
    avgLatency: Math.floor(Math.random() * 100) + 100,
    p50: Math.floor(Math.random() * 50) + 50,
    p90: Math.floor(Math.random() * 100) + 100,
    p95: Math.floor(Math.random() * 150) + 150,
    p99: Math.floor(Math.random() * 300) + 300,
    errorRate: Math.random() * 2,
    activeConnections: Math.floor(Math.random() * 150) + 50,
  };
}

function DataTable({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-md px-sm text-sm font-medium text-text-secondary">时间</th>
            <th className="text-right py-md px-sm text-sm font-medium text-text-secondary">请求量</th>
            <th className="text-right py-md px-sm text-sm font-medium text-text-secondary">延迟 (ms)</th>
            <th className="text-right py-md px-sm text-sm font-medium text-text-secondary">错误数</th>
            <th className="text-right py-md px-sm text-sm font-medium text-text-secondary">错误率</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(-10).reverse().map((row, index) => (
            <tr
              key={index}
              className="border-b border-border/50 hover:bg-background-tertiary transition-colors"
            >
              <td className="py-sm px-sm text-sm text-text-primary">{row.time}</td>
              <td className="py-sm px-sm text-sm text-text-primary text-right">{row.requests.toLocaleString()}</td>
              <td className="py-sm px-sm text-sm text-text-primary text-right">{row.latency}</td>
              <td className="py-sm px-sm text-sm text-text-primary text-right">{row.errors}</td>
              <td className="py-sm px-sm text-right">
                <Badge variant={row.errors > 20 ? 'error' : row.errors > 10 ? 'warning' : 'success'} size="sm">
                  {((row.errors / row.requests) * 100).toFixed(2)}%
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PercentileStats({ metrics }: { metrics: MetricData }) {
  const percentiles = [
    { label: 'P50', value: metrics.p50, color: 'text-accent-blue' },
    { label: 'P90', value: metrics.p90, color: 'text-accent-green' },
    { label: 'P95', value: metrics.p95, color: 'text-accent-yellow' },
    { label: 'P99', value: metrics.p99, color: 'text-accent-red' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
      {percentiles.map((p) => (
        <div key={p.label} className="p-md bg-background-tertiary rounded-lg">
          <p className="text-xs text-text-tertiary mb-xs">{p.label}</p>
          <p className={`text-2xl font-bold ${p.color}`}>{p.value} ms</p>
        </div>
      ))}
    </div>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Monitor() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedMetric, setSelectedMetric] = useState<string>('requests');

  const chartData = generateChartData(timeRange);
  const metrics = generateMetrics();

  const metricLabels = [
    { key: 'requests', label: '请求量', color: '#0a84ff' },
    { key: 'latency', label: '响应时间', color: '#30d158' },
    { key: 'errors', label: '错误率', color: '#ff453a' },
    { key: 'connections', label: '活跃连接', color: '#bf5af2' },
  ];

  const tabsItems = [
    {
      key: 'requests',
      label: '请求量',
      content: (
        <TimeSeriesChart
          data={chartData}
          series={[{ key: 'requests', name: '请求量', color: '#0a84ff' }]}
          xKey="time"
          height={350}
        />
      ),
    },
    {
      key: 'latency',
      label: '响应时间',
      content: (
        <TimeSeriesChart
          data={chartData}
          series={[{ key: 'latency', name: '延迟 (ms)', color: '#30d158' }]}
          xKey="time"
          height={350}
        />
      ),
    },
    {
      key: 'error',
      label: '错误率',
      content: (
        <TimeSeriesChart
          data={chartData}
          series={[{ key: 'errors', name: '错误数', color: '#ff453a' }]}
          xKey="time"
          height={350}
        />
      ),
    },
    {
      key: 'connections',
      label: '活跃连接',
      content: (
        <TimeSeriesChart
          data={chartData}
          series={[{ key: 'connections', name: '连接数', color: '#bf5af2' }]}
          xKey="time"
          height={350}
        />
      ),
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-xl"
    >
      <motion.div variants={item}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-xs">监控详情</h1>
            <p className="text-text-secondary">实时性能指标和趋势分析</p>
          </div>
          <div className="flex items-center gap-sm">
            {(['1h', '6h', '24h', '7d', '30d'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === '1h' ? '1小时' :
                 range === '6h' ? '6小时' :
                 range === '24h' ? '24小时' :
                 range === '7d' ? '7天' : '30天'}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Card padding="lg">
          <CardHeader>
            <CardTitle>性能概览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
              <div className="flex items-center gap-md">
                <div className="p-sm bg-accent-blue/10 rounded-lg">
                  <Activity size={24} className="text-accent-blue" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">总请求量</p>
                  <p className="text-xl font-bold text-text-primary">{metrics.requests.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-md">
                <div className="p-sm bg-accent-green/10 rounded-lg">
                  <TrendingUp size={24} className="text-accent-green" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">平均延迟</p>
                  <p className="text-xl font-bold text-text-primary">{metrics.avgLatency} ms</p>
                </div>
              </div>
              <div className="flex items-center gap-md">
                <div className="p-sm bg-accent-red/10 rounded-lg">
                  <AlertCircle size={24} className="text-accent-red" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">错误率</p>
                  <p className="text-xl font-bold text-text-primary">{metrics.errorRate.toFixed(2)}%</p>
                </div>
              </div>
              <div className="flex items-center gap-md">
                <div className="p-sm bg-accent-purple/10 rounded-lg">
                  <Users size={24} className="text-accent-purple" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">活跃连接</p>
                  <p className="text-xl font-bold text-text-primary">{metrics.activeConnections}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>延迟百分位数</CardTitle>
              <Badge variant="info">
                <Clock size={14} className="mr-xs" />
                实时数据
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <PercentileStats metrics={metrics} />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card padding="lg">
          <CardHeader>
            <CardTitle>指标趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs items={tabsItems} variant="pill" />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>详细数据</CardTitle>
              <Button variant="outline" size="sm">
                <Filter size={16} className="mr-xs" />
                导出
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable data={chartData} />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
