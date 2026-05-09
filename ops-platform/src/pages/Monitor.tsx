import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Tabs, Loading } from '@/components/ui';
import { TimeSeriesChart } from '@/components/charts';
import { useMetricsStore } from '@/stores/metricsStore';
import {
  Clock,
  TrendingUp,
  Activity,
  AlertCircle,
  Users,
  Filter,
} from 'lucide-react';

type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

interface ChartDataPoint {
  time: string;
  [key: string]: string | number;
}

function generateMockData(range: TimeRange): ChartDataPoint[] {
  const dataPoints = { '1h': 60, '6h': 72, '24h': 96, '7d': 168, '30d': 360 };
  const points = dataPoints[range];
  const data: ChartDataPoint[] = [];

  for (let i = 0; i < points; i++) {
    const date = new Date();
    if (range === '1h') date.setMinutes(date.getMinutes() - (points - i));
    else if (range === '6h') date.setMinutes(date.getMinutes() - (points - i) * 5);
    else if (range === '24h') date.setHours(date.getHours() - (points - i));
    else date.setHours(date.getHours() - (points - i) * 2);

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
            <tr key={index} className="border-b border-border/50 hover:bg-background-tertiary transition-colors">
              <td className="py-sm px-sm text-sm text-text-primary">{row.time}</td>
              <td className="py-sm px-sm text-sm text-text-primary text-right">{row.requests.toLocaleString()}</td>
              <td className="py-sm px-sm text-sm text-text-primary text-right">{row.latency}</td>
              <td className="py-sm px-sm text-sm text-text-primary text-right">{row.errors}</td>
              <td className="py-sm px-sm text-right">
                <Badge variant={Number(row.errors) > 20 ? 'error' : Number(row.errors) > 10 ? 'warning' : 'success'} size="sm">
                  {((Number(row.errors) / Number(row.requests)) * 100).toFixed(2)}%
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PercentileStats({ latencyData }: { latencyData: MetricData[] }) {
  if (!latencyData.length || !latencyData[0].points.length) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
        {['P50', 'P90', 'P95', 'P99'].map((label) => (
          <div key={label} className="p-md bg-background-tertiary rounded-lg">
            <p className="text-xs text-text-tertiary mb-xs">{label}</p>
            <p className="text-2xl font-bold text-text-secondary">-- ms</p>
          </div>
        ))}
      </div>
    );
  }

  const values = latencyData[0].points.map(p => p.value * 1000).sort((a, b) => a - b);
  const metrics = {
    p50: values[Math.floor(values.length * 0.5)] || 0,
    p90: values[Math.floor(values.length * 0.9)] || 0,
    p95: values[Math.floor(values.length * 0.95)] || 0,
    p99: values[Math.floor(values.length * 0.99)] || 0,
  };

  const percentiles = [
    { label: 'P50', value: Math.round(metrics.p50), color: 'text-accent-blue' },
    { label: 'P90', value: Math.round(metrics.p90), color: 'text-accent-green' },
    { label: 'P95', value: Math.round(metrics.p95), color: 'text-accent-yellow' },
    { label: 'P99', value: Math.round(metrics.p99), color: 'text-accent-red' },
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

interface MetricData {
  metric_name: string;
  labels: Record<string, string>;
  points: { timestamp: number; value: number }[];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Monitor() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const {
    requestsData,
    latencyData,
    errorData,
    loading,
    fetchMetrics,
    setTimeRange: setStoreTimeRange,
  } = useMetricsStore();

  useEffect(() => {
    fetchMetrics(timeRange);
    const interval = setInterval(() => fetchMetrics(timeRange), 30000);
    return () => clearInterval(interval);
  }, [timeRange, fetchMetrics]);

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    setStoreTimeRange(range);
  };

  const mockData = generateMockData(timeRange);

  const chartData = requestsData.length > 0 && requestsData[0].points.length > 0
    ? requestsData[0].points.map(p => {
        const latencyPoint = latencyData[0]?.points.find(lp =>
          Math.abs(lp.timestamp - p.timestamp) < 300
        );
        const errorPoint = errorData[0]?.points.find(ep =>
          Math.abs(ep.timestamp - p.timestamp) < 300
        );
        return {
          time: new Date(p.timestamp * 1000).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          requests: Math.round(p.value),
          latency: (latencyPoint?.value || 0) * 1000,
          errors: errorPoint?.value || 0,
          connections: Math.floor(Math.random() * 200) + 50,
        };
      })
    : mockData;

  const totalRequests = requestsData.length > 0
    ? requestsData[0].points.reduce((sum, p) => sum + p.value, 0)
    : 0;

  const avgLatency = latencyData.length > 0 && latencyData[0].points.length > 0
    ? latencyData[0].points.reduce((sum, p) => sum + p.value, 0) / latencyData[0].points.length * 1000
    : 0;

  const errorRate = totalRequests > 0 && errorData.length > 0
    ? (errorData[0].points.reduce((sum, p) => sum + p.value, 0) / totalRequests * 100)
    : 0;

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

  if (loading && requestsData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading size="lg" />
      </div>
    );
  }

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
                onClick={() => handleTimeRangeChange(range)}
              >
                {range === '1h' ? '1小时' : range === '6h' ? '6小时' : range === '24h' ? '24小时' : range === '7d' ? '7天' : '30天'}
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
                  <p className="text-xl font-bold text-text-primary">
                    {loading && requestsData.length === 0 ? '--' : Math.round(totalRequests).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-md">
                <div className="p-sm bg-accent-green/10 rounded-lg">
                  <TrendingUp size={24} className="text-accent-green" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">平均延迟</p>
                  <p className="text-xl font-bold text-text-primary">
                    {loading && latencyData.length === 0 ? '--' : `${Math.round(avgLatency)} ms`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-md">
                <div className="p-sm bg-accent-red/10 rounded-lg">
                  <AlertCircle size={24} className="text-accent-red" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">错误率</p>
                  <p className="text-xl font-bold text-text-primary">
                    {loading && errorData.length === 0 ? '--' : `${errorRate.toFixed(2)}%`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-md">
                <div className="p-sm bg-accent-purple/10 rounded-lg">
                  <Users size={24} className="text-accent-purple" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">活跃连接</p>
                  <p className="text-xl font-bold text-text-primary">--</p>
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
                {loading ? '加载中...' : '实时数据'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <PercentileStats latencyData={latencyData} />
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
