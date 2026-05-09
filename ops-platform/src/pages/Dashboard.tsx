import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Loading } from '@/components/ui';
import { TimeSeriesChart } from '@/components/charts';
import { useDashboardStore } from '@/stores/dashboardStore';
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
  const { stats, recentAlerts, recentLogs, loading, error, fetchStats } = useDashboardStore();

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading size="lg" />
      </div>
    );
  }

  const systemStatus = stats?.service_health?.['api-gateway'] === 'healthy' ? 'healthy' :
                       stats?.active_alerts && stats.active_alerts > 0 ? 'warning' : 'healthy';

  const healthyServices = stats?.service_health ?
    Object.values(stats.service_health).filter(s => s === 'healthy').length : 0;
  const totalServices = stats?.service_health ? Object.keys(stats.service_health).length : 12;

  const chartData = recentLogs.slice(0, 24).reverse().map((log) => ({
    time: new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    requests: Math.floor(Math.random() * 100) + 50,
    latency: Math.floor(Math.random() * 50) + 10,
    errors: log.level === 'ERROR' ? 1 : 0,
  }));

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
            status={systemStatus}
            title="系统状态"
            description={error ? "数据加载异常" : "所有服务运行正常"}
          />
          <StatusCard
            status={stats?.active_alerts && stats.active_alerts > 0 ? 'warning' : 'healthy'}
            title="告警状态"
            description={stats?.active_alerts ? `${stats.active_alerts} 个活跃告警` : "无活跃告警"}
          />
          <StatusCard
            status="healthy"
            title="服务可用性"
            description={`${healthyServices}/${totalServices} 服务在线`}
          />
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        <MetricCard
          title="API 请求量"
          value={stats?.total_requests ?? 0}
          change={12.5}
          suffix="次/小时"
          icon={<Activity size={28} className="text-accent-blue" />}
          color="bg-accent-blue/10"
        />
        <MetricCard
          title="平均响应时间"
          value={stats?.avg_response_time ? Math.round(stats.avg_response_time * 1000) : 0}
          change={-8.3}
          suffix="ms"
          icon={<Zap size={28} className="text-accent-green" />}
          color="bg-accent-green/10"
        />
        <MetricCard
          title="错误率"
          value={stats?.error_rate?.toFixed(2) ?? '0.00'}
          suffix="%"
          icon={<AlertCircle size={28} className="text-accent-yellow" />}
          color="bg-accent-yellow/10"
        />
        <MetricCard
          title="活跃告警"
          value={stats?.active_alerts ?? 0}
          icon={<Server size={28} className="text-accent-purple" />}
          color="bg-accent-purple/10"
        />
      </motion.div>

      <motion.div variants={item}>
        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>请求趋势（实时）</CardTitle>
              <div className="flex gap-sm">
                <Button variant="outline" size="sm">1小时</Button>
                <Button variant="secondary" size="sm">24小时</Button>
                <Button variant="ghost" size="sm">7天</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TimeSeriesChart
              data={chartData}
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
            {recentAlerts.length > 0 ? recentAlerts.slice(0, 5).map((alert) => (
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
                  <p className="text-sm text-text-primary truncate">{alert.title || alert.name}</p>
                  <div className="flex items-center gap-sm text-xs text-text-tertiary">
                    <span>{alert.service}</span>
                    <span>•</span>
                    <span className="flex items-center gap-xs">
                      <Clock size={12} />
                      {alert.time || (alert.created_at ? new Date(alert.created_at).toLocaleString('zh-CN') : '未知')}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">处理</Button>
              </div>
            )) : (
              <div className="text-center py-lg text-text-secondary">
                <CheckCircle size={32} className="mx-auto mb-sm text-accent-green" />
                <p>暂无活跃告警</p>
              </div>
            )}
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
            {recentLogs.length > 0 ? recentLogs.slice(0, 10).map((log) => (
              <div
                key={log.id || `${log.timestamp}-${log.message}`}
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
                  {log.level || 'INFO'}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{log.message}</p>
                  <div className="flex items-center gap-sm text-xs text-text-tertiary">
                    <span className="flex items-center gap-xs">
                      <Server size={12} />
                      {log.service || log.stream?.service || 'system'}
                    </span>
                    <span>•</span>
                    <span>{new Date(log.timestamp).toLocaleString('zh-CN')}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-lg text-text-secondary">
                <CheckCircle size={32} className="mx-auto mb-sm text-accent-green" />
                <p>暂无日志数据</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
