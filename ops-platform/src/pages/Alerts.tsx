import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, Badge, Button, Modal, Select, Input, Pagination } from '@/components/ui';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Server,
  XCircle,
} from 'lucide-react';

type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
type AlertStatus = 'active' | 'resolved' | 'all';

interface Alert {
  id: string;
  severity: AlertSeverity;
  status: 'active' | 'resolved';
  title: string;
  description: string;
  service: string;
  startTime: string;
  resolvedTime?: string;
  duration?: string;
  metric?: string;
  value?: string;
  threshold?: string;
  assignee?: string;
  notes?: string;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    severity: 'critical',
    status: 'active',
    title: 'CPU 使用率超过 95%',
    description: '服务器 CPU 使用率持续超过 95%，可能导致服务响应延迟',
    service: 'api-gateway',
    startTime: '2024-01-15 14:32:15',
    metric: 'cpu_usage',
    value: '97%',
    threshold: '90%',
    assignee: '张三',
    notes: '正在调查原因，可能与流量突增有关',
  },
  {
    id: '2',
    severity: 'high',
    status: 'active',
    title: '数据库连接池耗尽',
    description: 'MySQL 连接池已达到最大限制，新请求无法获取连接',
    service: 'db-primary',
    startTime: '2024-01-15 14:28:42',
    metric: 'db_connections',
    value: '100/100',
    threshold: '90/100',
    assignee: '李四',
  },
  {
    id: '3',
    severity: 'high',
    status: 'active',
    title: '响应时间超过 2 秒',
    description: 'API 平均响应时间超过设定的 2 秒阈值',
    service: 'user-service',
    startTime: '2024-01-15 14:25:00',
    metric: 'response_time',
    value: '2450ms',
    threshold: '2000ms',
  },
  {
    id: '4',
    severity: 'medium',
    status: 'active',
    title: '内存使用率接近阈值',
    description: '缓存服务内存使用率已达 85%，接近告警阈值',
    service: 'cache-service',
    startTime: '2024-01-15 14:20:15',
    metric: 'memory_usage',
    value: '85%',
    threshold: '80%',
  },
  {
    id: '5',
    severity: 'low',
    status: 'active',
    title: '磁盘空间不足警告',
    description: '日志磁盘使用率达到 75%，建议清理历史日志',
    service: 'storage-service',
    startTime: '2024-01-15 14:15:30',
    metric: 'disk_usage',
    value: '75%',
    threshold: '70%',
  },
  {
    id: '6',
    severity: 'critical',
    status: 'resolved',
    title: '服务不可用',
    description: '支付服务在 14:10-14:15 期间不可用',
    service: 'payment-service',
    startTime: '2024-01-15 14:10:00',
    resolvedTime: '2024-01-15 14:15:30',
    duration: '5 分 30 秒',
    assignee: '王五',
    notes: '已修复，系数据库连接超时导致',
  },
  {
    id: '7',
    severity: 'medium',
    status: 'resolved',
    title: '错误率升高',
    description: 'API 错误率从 0.1% 上升到 1.5%',
    service: 'api-gateway',
    startTime: '2024-01-15 13:45:00',
    resolvedTime: '2024-01-15 14:00:00',
    duration: '15 分钟',
  },
  {
    id: '8',
    severity: 'low',
    status: 'resolved',
    title: 'SSL 证书即将过期',
    description: '域名证书将在 30 天后过期',
    service: 'web-frontend',
    startTime: '2024-01-15 10:00:00',
    resolvedTime: '2024-01-15 10:30:00',
    duration: '30 分钟',
    notes: '已更新证书',
  },
];

function AlertIcon({ severity }: { severity: AlertSeverity }) {
  const config = {
    critical: { icon: <XCircle size={20} />, color: 'text-accent-red', bg: 'bg-accent-red/10' },
    high: { icon: <AlertCircle size={20} />, color: 'text-accent-orange', bg: 'bg-accent-orange/10' },
    medium: { icon: <AlertTriangle size={20} />, color: 'text-accent-yellow', bg: 'bg-accent-yellow/10' },
    low: { icon: <Info size={20} />, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
  };

  const { icon, color, bg } = config[severity];

  return <div className={`p-sm rounded-full ${bg} ${color}`}>{icon}</div>;
}

function AlertCard({ alert, onClick }: { alert: Alert; onClick: () => void }) {
  const severityLabels = {
    critical: '严重',
    high: '高',
    medium: '中',
    low: '低',
  };

  const getRelativeTime = (time: string) => {
    const now = new Date();
    const alertTime = new Date(time.replace(' ', 'T'));
    const diff = Math.floor((now.getTime() - alertTime.getTime()) / 1000);

    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
    return `${Math.floor(diff / 86400)} 天前`;
  };

  return (
    <div
      className="p-lg bg-background-secondary border border-border rounded-lg hover:border-border-hover transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-md">
        <AlertIcon severity={alert.severity} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-md mb-sm">
            <div className="flex-1">
              <h3 className="text-base font-medium text-text-primary mb-xs">{alert.title}</h3>
              <p className="text-sm text-text-secondary line-clamp-2">{alert.description}</p>
            </div>
            <div className="flex items-center gap-sm">
              <Badge
                variant={
                  alert.severity === 'critical' ? 'error' :
                  alert.severity === 'high' ? 'warning' :
                  alert.severity === 'medium' ? 'info' : 'default'
                }
                size="sm"
              >
                {severityLabels[alert.severity]}
              </Badge>
              <Badge variant={alert.status === 'active' ? 'error' : 'success'} size="sm">
                {alert.status === 'active' ? '进行中' : '已解决'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-md text-xs text-text-tertiary">
            <span className="flex items-center gap-xs">
              <Server size={14} />
              {alert.service}
            </span>
            <span className="flex items-center gap-xs">
              <Clock size={14} />
              {alert.status === 'active' ? getRelativeTime(alert.startTime) : alert.duration}
            </span>
            {alert.assignee && (
              <span>负责人: {alert.assignee}</span>
            )}
          </div>
        </div>
      </div>

      {alert.status === 'active' && (
        <div className="mt-md pt-md border-t border-border flex justify-end gap-sm">
          <Button variant="outline" size="sm">查看详情</Button>
          <Button variant="primary" size="sm">处理</Button>
        </div>
      )}
    </div>
  );
}

function AlertDetailModal({
  alert,
  isOpen,
  onClose,
}: {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!alert) return null;

  const severityLabels = {
    critical: '严重',
    high: '高',
    medium: '中',
    low: '低',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="告警详情" size="lg">
      <div className="space-y-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-md">
            <AlertIcon severity={alert.severity} />
            <div>
              <h3 className="text-lg font-semibold text-text-primary">{alert.title}</h3>
              <p className="text-sm text-text-secondary">{alert.description}</p>
            </div>
          </div>
          <div className="flex gap-sm">
            <Badge
              variant={
                alert.severity === 'critical' ? 'error' :
                alert.severity === 'high' ? 'warning' :
                alert.severity === 'medium' ? 'info' : 'default'
              }
            >
              {severityLabels[alert.severity]}
            </Badge>
            <Badge variant={alert.status === 'active' ? 'error' : 'success'}>
              {alert.status === 'active' ? '进行中' : '已解决'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-md">
          <div className="p-md bg-background-tertiary rounded-lg">
            <p className="text-xs text-text-tertiary mb-xs">服务</p>
            <p className="text-sm font-medium text-text-primary">{alert.service}</p>
          </div>
          <div className="p-md bg-background-tertiary rounded-lg">
            <p className="text-xs text-text-tertiary mb-xs">开始时间</p>
            <p className="text-sm font-medium text-text-primary">{alert.startTime}</p>
          </div>
          {alert.metric && (
            <div className="p-md bg-background-tertiary rounded-lg">
              <p className="text-xs text-text-tertiary mb-xs">指标</p>
              <p className="text-sm font-medium text-text-primary">{alert.metric}</p>
            </div>
          )}
          {alert.value && (
            <div className="p-md bg-background-tertiary rounded-lg">
              <p className="text-xs text-text-tertiary mb-xs">当前值 / 阈值</p>
              <p className="text-sm font-medium text-text-primary">
                {alert.value} / {alert.threshold}
              </p>
            </div>
          )}
          {alert.duration && (
            <div className="p-md bg-background-tertiary rounded-lg">
              <p className="text-xs text-text-tertiary mb-xs">持续时间</p>
              <p className="text-sm font-medium text-text-primary">{alert.duration}</p>
            </div>
          )}
          {alert.assignee && (
            <div className="p-md bg-background-tertiary rounded-lg">
              <p className="text-xs text-text-tertiary mb-xs">负责人</p>
              <p className="text-sm font-medium text-text-primary">{alert.assignee}</p>
            </div>
          )}
        </div>

        {alert.notes && (
          <div>
            <p className="text-sm font-medium text-text-secondary mb-sm">备注</p>
            <div className="p-md bg-background-tertiary rounded-lg">
              <p className="text-sm text-text-primary">{alert.notes}</p>
            </div>
          </div>
        )}

        {alert.status === 'active' && (
          <div className="flex justify-end gap-sm pt-md border-t border-border">
            <Button variant="outline" onClick={onClose}>
              关闭
            </Button>
            <Button variant="primary">
              <CheckCircle size={16} className="mr-xs" />
              标记已处理
            </Button>
          </div>
        )}
      </div>
    </Modal>
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

export function Alerts() {
  const [statusFilter, setStatusFilter] = useState<AlertStatus>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredAlerts = mockAlerts.filter((alert) => {
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (serviceFilter !== 'all' && alert.service !== serviceFilter) return false;
    if (searchQuery && !alert.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const pageSize = 10;
  const totalPages = Math.ceil(filteredAlerts.length / pageSize);
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const services = [
    { value: 'all', label: '全部服务' },
    { value: 'api-gateway', label: 'API Gateway' },
    { value: 'db-primary', label: '数据库主节点' },
    { value: 'user-service', label: '用户服务' },
    { value: 'cache-service', label: '缓存服务' },
    { value: 'storage-service', label: '存储服务' },
    { value: 'payment-service', label: '支付服务' },
  ];

  const severities = [
    { value: 'all', label: '全部级别' },
    { value: 'critical', label: '严重' },
    { value: 'high', label: '高' },
    { value: 'medium', label: '中' },
    { value: 'low', label: '低' },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-xl"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-text-primary mb-xs">告警中心</h1>
        <p className="text-text-secondary">集中管理所有系统告警和事件</p>
      </motion.div>

      <motion.div variants={item}>
        <div className="flex items-center gap-md mb-md">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-md py-sm rounded-lg font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-accent-blue text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            全部 ({mockAlerts.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-md py-sm rounded-lg font-medium transition-colors ${
              statusFilter === 'active'
                ? 'bg-accent-red text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            进行中 ({mockAlerts.filter((a) => a.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-md py-sm rounded-lg font-medium transition-colors ${
              statusFilter === 'resolved'
                ? 'bg-accent-green text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            已解决 ({mockAlerts.filter((a) => a.status === 'resolved').length})
          </button>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Card padding="md">
          <CardContent>
            <div className="flex flex-col md:flex-row gap-md">
              <div className="flex-1">
                <Input
                  placeholder="搜索告警..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-md">
                <Select
                  value={severityFilter}
                  onChange={setSeverityFilter}
                  options={severities}
                  className="w-40"
                />
                <Select
                  value={serviceFilter}
                  onChange={setServiceFilter}
                  options={services}
                  className="w-40"
                />
                <Button variant="outline">
                  <Filter size={16} className="mr-xs" />
                  筛选
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="space-y-md">
        {paginatedAlerts.length > 0 ? (
          paginatedAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onClick={() => handleAlertClick(alert)}
            />
          ))
        ) : (
          <Card padding="lg">
            <CardContent className="text-center py-xl">
              <AlertCircle size={48} className="mx-auto text-text-tertiary mb-md" />
              <p className="text-text-secondary">暂无告警记录</p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {totalPages > 1 && (
        <motion.div variants={item}>
          <Card padding="md">
            <CardContent>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredAlerts.length}
                onChange={handlePageChange}
                showTotal
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      <AlertDetailModal
        alert={selectedAlert}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </motion.div>
  );
}
