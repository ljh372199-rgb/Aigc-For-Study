import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, Badge, Button, Modal, Select, Input, Pagination, Loading } from '@/components/ui';
import { useAlertsStore } from '@/stores/alertsStore';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Filter,
  CheckCircle,
  Clock,
  Server,
  XCircle,
} from 'lucide-react';

type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'warning' | 'info';
type AlertStatus = 'active' | 'resolved' | 'firing' | 'pending' | 'inhibited';

interface Alert {
  id: string;
  name?: string;
  title?: string;
  severity: AlertSeverity;
  status: AlertStatus;
  description?: string;
  service?: string;
  created_at: string;
  updated_at?: string;
}

function AlertIcon({ severity }: { severity: AlertSeverity }) {
  const config: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    critical: { icon: <XCircle size={20} />, color: 'text-accent-red', bg: 'bg-accent-red/10' },
    high: { icon: <AlertCircle size={20} />, color: 'text-accent-orange', bg: 'bg-accent-orange/10' },
    medium: { icon: <AlertTriangle size={20} />, color: 'text-accent-yellow', bg: 'bg-accent-yellow/10' },
    low: { icon: <Info size={20} />, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
    warning: { icon: <AlertTriangle size={20} />, color: 'text-accent-yellow', bg: 'bg-accent-yellow/10' },
    info: { icon: <Info size={20} />, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
  };

  const { icon, color, bg } = config[severity] || config.info;
  return <div className={`p-sm rounded-full ${bg} ${color}`}>{icon}</div>;
}

function AlertCard({ alert, onClick }: { alert: Alert; onClick: () => void }) {
  const severityLabels: Record<string, string> = {
    critical: '严重',
    high: '高',
    medium: '中',
    low: '低',
    warning: '警告',
    info: '信息',
  };

  const getRelativeTime = (time: string) => {
    try {
      const now = new Date();
      const alertTime = new Date(time);
      const diff = Math.floor((now.getTime() - alertTime.getTime()) / 1000);

      if (diff < 60) return '刚刚';
      if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
      return `${Math.floor(diff / 86400)} 天前`;
    } catch {
      return time;
    }
  };

  const isActive = alert.status === 'firing' || alert.status === 'active' || alert.status === 'pending';

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
              <h3 className="text-base font-medium text-text-primary mb-xs">{alert.title || alert.name || 'Unknown Alert'}</h3>
              <p className="text-sm text-text-secondary line-clamp-2">{alert.description || 'No description'}</p>
            </div>
            <div className="flex items-center gap-sm">
              <Badge
                variant={
                  alert.severity === 'critical' ? 'error' :
                  alert.severity === 'high' ? 'warning' :
                  alert.severity === 'medium' || alert.severity === 'warning' ? 'info' : 'default'
                }
                size="sm"
              >
                {severityLabels[alert.severity] || alert.severity}
              </Badge>
              <Badge variant={isActive ? 'error' : 'success'} size="sm">
                {isActive ? '进行中' : '已解决'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-md text-xs text-text-tertiary">
            <span className="flex items-center gap-xs">
              <Server size={14} />
              {alert.service || 'unknown'}
            </span>
            <span className="flex items-center gap-xs">
              <Clock size={14} />
              {getRelativeTime(alert.created_at)}
            </span>
          </div>
        </div>
      </div>

      {isActive && (
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

  const severityLabels: Record<string, string> = {
    critical: '严重',
    high: '高',
    medium: '中',
    low: '低',
    warning: '警告',
    info: '信息',
  };

  const isActive = alert.status === 'firing' || alert.status === 'active' || alert.status === 'pending';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="告警详情" size="lg">
      <div className="space-y-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-md">
            <AlertIcon severity={alert.severity} />
            <div>
              <h3 className="text-lg font-semibold text-text-primary">{alert.title || alert.name}</h3>
              <p className="text-sm text-text-secondary">{alert.description}</p>
            </div>
          </div>
          <div className="flex gap-sm">
            <Badge
              variant={
                alert.severity === 'critical' ? 'error' :
                alert.severity === 'high' ? 'warning' :
                alert.severity === 'medium' || alert.severity === 'warning' ? 'info' : 'default'
              }
            >
              {severityLabels[alert.severity] || alert.severity}
            </Badge>
            <Badge variant={isActive ? 'error' : 'success'}>
              {isActive ? '进行中' : '已解决'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-md">
          <div className="p-md bg-background-tertiary rounded-lg">
            <p className="text-xs text-text-tertiary mb-xs">服务</p>
            <p className="text-sm font-medium text-text-primary">{alert.service || 'N/A'}</p>
          </div>
          <div className="p-md bg-background-tertiary rounded-lg">
            <p className="text-xs text-text-tertiary mb-xs">创建时间</p>
            <p className="text-sm font-medium text-text-primary">
              {new Date(alert.created_at).toLocaleString('zh-CN')}
            </p>
          </div>
          {alert.updated_at && (
            <div className="p-md bg-background-tertiary rounded-lg">
              <p className="text-xs text-text-tertiary mb-xs">更新时间</p>
              <p className="text-sm font-medium text-text-primary">
                {new Date(alert.updated_at).toLocaleString('zh-CN')}
              </p>
            </div>
          )}
        </div>

        {isActive && (
          <div className="flex justify-end gap-sm pt-md border-t border-border">
            <Button variant="outline" onClick={onClose}>关闭</Button>
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
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Alerts() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { alerts, loading, pageSize, fetchAlerts } = useAlertsStore();

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const filteredAlerts = alerts.filter((alert) => {
    if (statusFilter !== 'all') {
      const isActive = alert.status === 'firing' || alert.status === 'active' || alert.status === 'pending';
      if (statusFilter === 'active' && !isActive) return false;
      if (statusFilter === 'resolved' && isActive) return false;
    }
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const title = (alert.title || alert.name || '').toLowerCase();
      const desc = (alert.description || '').toLowerCase();
      if (!title.includes(query) && !desc.includes(query)) return false;
    }
    return true;
  });

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

  const activeCount = alerts.filter(a =>
    a.status === 'firing' || a.status === 'active' || a.status === 'pending'
  ).length;
  const resolvedCount = alerts.length - activeCount;

  const severities = [
    { value: 'all', label: '全部级别' },
    { value: 'critical', label: '严重' },
    { value: 'high', label: '高' },
    { value: 'medium', label: '中' },
    { value: 'low', label: '低' },
  ];

  if (loading && alerts.length === 0) {
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
            全部 ({alerts.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-md py-sm rounded-lg font-medium transition-colors ${
              statusFilter === 'active'
                ? 'bg-accent-red text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            进行中 ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-md py-sm rounded-lg font-medium transition-colors ${
              statusFilter === 'resolved'
                ? 'bg-accent-green text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            已解决 ({resolvedCount})
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
              <CheckCircle size={48} className="mx-auto text-accent-green mb-md" />
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
