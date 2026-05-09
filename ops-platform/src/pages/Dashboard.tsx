import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { TimeSeriesChart } from '@/components/charts';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Server,
  Zap,
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  suffix?: string;
}

function MetricCard({ title, value, change, icon, color, suffix }: MetricCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className="hover:border-border-hover transition-all duration-200">
      <CardContent className="p-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-text-secondary mb-xs">{title}</p>
            <div className="flex items-baseline gap-sm">
              <p className="text-3xl font-bold text-text-primary">
                {typeof value === 'number' ? value.toLocaleString() : value}
                {suffix && <span className="text-lg text-text-secondary ml-xs">{suffix}</span>}
              </p>
              {change !== undefined && (
                <div className={`flex items-center gap-xs text-sm ${
                  isPositive ? 'text-accent-green' : isNegative ? 'text-accent-red' : 'text-text-tertiary'
                }`}>
                  {isPositive ? <TrendingUp size={16} /> : isNegative ? <TrendingDown size={16} /> : null}
                  <span>{Math.abs(change)}%</span>
                </div>
              )}
            </div>
          </div>
          <div className={`p-md rounded-full ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatusCardProps {
  status: 'healthy' | 'warning' | 'critical';
  title: string;
  description: string;
}

function StatusCard({ status, title, description }: StatusCardProps) {
  const statusConfig = {
    healthy: {
      icon: <CheckCircle size={24} />,
      color: 'text-accent-green',
      bg: 'bg-accent-green/10',
      border: 'border-accent-green/30',
    },
    warning: {
      icon: <AlertTriangle size={24} />,
      color: 'text-accent-yellow',
      bg: 'bg-accent-yellow/10',
      border: 'border-accent-yellow/30',
    },
    critical: {
      icon: <AlertCircle size={24} />,
      color: 'text-accent-red',
      bg: 'bg-accent-red/10',
      border: 'border-accent-red/30',
    },
  };

  const config = statusConfig[status];

  return (
    <Card className={`border ${config.border}`}>
      <CardContent className="p-md flex items-center gap-md">
        <div className={`p-sm rounded-full ${config.bg} ${config.color}`}>
          {config.icon}
        </div>
        <div className="flex-1">
          <p className="font-medium text-text-primary">{title}</p>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>
        <Badge variant={
          status === 'healthy' ? 'success' :
          status === 'warning' ? 'warning' : 'error'
        }>
          {status === 'healthy' ? '健康' : status === 'warning' ? '警告' : '异常'}
        </Badge>
      </CardContent>
    </Card>
  );
}

interface AlertItem {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  service: string;
  time: string;
}

interface LogItem {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  service: string;
  message: string;
  timestamp: string;
}

const mockAlerts: AlertItem[] = [
  { id: '1', severity: 'high', title: 'CPU 使用率超过 90%', service: 'api-gateway', time: '5 分钟前' },
  { id: '2', severity: 'medium', title: '响应时间超过阈值', service: 'user-service', time: '12 分钟前' },
  { id: '3', severity: 'low', title: '磁盘空间接近阈值', service: 'storage-service', time: '1 小时前' },
  { id: '4', severity: 'high', title: '数据库连接失败', service: 'db-primary', time: '2 小时前' },
  { id: '5', severity: 'medium', title: '内存使用率上升', service: 'cache-service', time: '3 小时前' },
];

const mockLogs: LogItem[] = [
  { id: '1', level: 'INFO', service: 'api-gateway', message: 'Request processed successfully', timestamp: '2024-01-15 14:32:15' },
  { id: '2', level: 'WARN', service: 'user-service', message: 'High memory usage detected: 85%', timestamp: '2024-01-15 14:31:42' },
  { id: '3', level: 'ERROR', service: 'payment-service', message: 'Payment processing failed: timeout', timestamp: '2024-01-15 14:31:20' },
  { id: '4', level: 'INFO', service: 'auth-service', message: 'User authentication successful', timestamp: '2024-01-15 14:30:58' },
  { id: '5', level: 'INFO', service: 'api-gateway', message: 'Health check passed', timestamp: '2024-01-15 14:30:45' },
  { id: '6', level: 'ERROR', service: 'db-replica', message: 'Replication lag exceeds threshold', timestamp: '2024-01-15 14:30:12' },
  { id: '7', level: 'WARN', service: 'cache-service', message: 'Cache miss rate increased', timestamp: '2024-01-15 14:29:33' },
  { id: '8', level: 'INFO', service: 'notification-service', message: 'Email sent successfully', timestamp: '2024-01-15 14:29:15' },
  { id: '9', level: 'INFO', service: 'api-gateway', message: 'New connection established', timestamp: '2024-01-15 14:28:52' },
  { id: '10', level: 'WARN', service: 'storage-service', message: 'Disk I/O latency elevated', timestamp: '2024-01-15 14:28:30' },
];

const mockChartData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i.toString().padStart(2, '0')}:00`,
  requests: Math.floor(Math.random() * 5000) + 2000,
  latency: Math.floor(Math.random() * 200) + 50,
  errors: Math.floor(Math.random() * 50),
}));

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

export function Dashboard() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-xl"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-text-primary mb-xs">仪表盘</h1>
        <p className="text-text-secondary">实时监控系统状态和关键指标</p>
      </motion.div>

      <motion.div variants={item}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <StatusCard
            status="healthy"
            title="系统状态"
            description="所有服务运行正常"
          />
          <StatusCard
            status="warning"
            title="性能警告"
            description="部分指标接近阈值"
          />
          <StatusCard
            status="healthy"
            title="服务可用性"
            description="12/12 服务在线"
          />
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        <MetricCard
          title="API 请求量"
          value={12847}
          change={12.5}
          suffix="次/日"
          icon={<Activity size={28} className="text-accent-blue" />}
          color="bg-accent-blue/10"
        />
        <MetricCard
          title="平均响应时间"
          value={145}
          change={-8.3}
          suffix="ms"
          icon={<Zap size={28} className="text-accent-green" />}
          color="bg-accent-green/10"
        />
        <MetricCard
          title="错误率"
          value={0.8}
          suffix="%"
          icon={<AlertCircle size={28} className="text-accent-yellow" />}
          color="bg-accent-yellow/10"
        />
        <MetricCard
          title="资源使用率"
          value={67}
          suffix="%"
          icon={<Server size={28} className="text-accent-purple" />}
          color="bg-accent-purple/10"
        />
      </motion.div>

      <motion.div variants={item}>
        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>请求趋势（24小时）</CardTitle>
              <div className="flex gap-sm">
                <Button variant="outline" size="sm">1小时</Button>
                <Button variant="secondary" size="sm">24小时</Button>
                <Button variant="ghost" size="sm">7天</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TimeSeriesChart
              data={mockChartData}
              series={[
                { key: 'requests', name: '请求量', color: '#0a84ff' },
                { key: 'latency', name: '延迟(ms)', color: '#30d158' },
              ]}
              xKey="time"
              height={300}
            />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>活跃告警</CardTitle>
              <Button variant="ghost" size="sm">查看全部</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-sm">
            {mockAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center gap-md p-sm rounded-md hover:bg-background-tertiary transition-colors cursor-pointer"
              >
                <Badge variant={
                  alert.severity === 'critical' ? 'error' :
                  alert.severity === 'high' ? 'warning' :
                  alert.severity === 'medium' ? 'info' : 'default'
                } size="sm">
                  {alert.severity === 'critical' ? '严重' :
                   alert.severity === 'high' ? '高' :
                   alert.severity === 'medium' ? '中' : '低'}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{alert.title}</p>
                  <div className="flex items-center gap-sm text-xs text-text-tertiary">
                    <span>{alert.service}</span>
                    <span>•</span>
                    <span className="flex items-center gap-xs">
                      <Clock size={12} />
                      {alert.time}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">处理</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>最近日志</CardTitle>
              <Button variant="ghost" size="sm">查看全部</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-sm">
            {mockLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-md p-sm rounded-md hover:bg-background-tertiary transition-colors cursor-pointer"
              >
                <Badge
                  variant={
                    log.level === 'ERROR' ? 'error' :
                    log.level === 'WARN' ? 'warning' : 'info'
                  }
                  size="sm"
                  className="mt-xs"
                >
                  {log.level}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{log.message}</p>
                  <div className="flex items-center gap-sm text-xs text-text-tertiary">
                    <span className="flex items-center gap-xs">
                      <Server size={12} />
                      {log.service}
                    </span>
                    <span>•</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
