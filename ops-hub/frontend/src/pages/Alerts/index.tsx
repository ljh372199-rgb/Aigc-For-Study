import React, { useState } from 'react';
import { Card, StatusBadge, Button } from '../../components';
import { AlertTriangle, AlertCircle, Bell, CheckCircle, XCircle, Filter, Search } from 'lucide-react';

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  source: string;
  time: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

const alerts: Alert[] = [
  {
    id: '1',
    severity: 'critical',
    title: 'CPU 使用率过高',
    message: '服务器 api-server-01 的 CPU 使用率超过 90%，持续时间超过 5 分钟',
    source: 'api-server-01',
    time: '2 分钟前',
    status: 'active',
  },
  {
    id: '2',
    severity: 'warning',
    title: '内存使用警告',
    message: '数据库服务器内存使用率达到 85%',
    source: 'db-primary',
    time: '15 分钟前',
    status: 'acknowledged',
  },
  {
    id: '3',
    severity: 'critical',
    title: '服务无响应',
    message: '搜索服务连续 3 次健康检查失败',
    source: 'search-01',
    time: '23 分钟前',
    status: 'active',
  },
  {
    id: '4',
    severity: 'warning',
    title: '磁盘空间不足',
    message: '/var 分区使用率达到 78%',
    source: 'queue-01',
    time: '1 小时前',
    status: 'resolved',
  },
  {
    id: '5',
    severity: 'info',
    title: '证书即将过期',
    message: 'SSL 证书将在 7 天后过期',
    source: 'api-gateway',
    time: '2 小时前',
    status: 'acknowledged',
  },
  {
    id: '6',
    severity: 'warning',
    title: '网络延迟增加',
    message: '检测到到香港节点的延迟增加到 250ms',
    source: 'cdn-node-hk',
    time: '3 小时前',
    status: 'resolved',
  },
];

export const Alerts: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlerts = alerts.filter((alert) => {
    const matchesFilter = filter === 'all' || alert.status === filter;
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-status-danger" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-status-warning" />;
      case 'info':
        return <Bell className="w-5 h-5 text-status-info" />;
    }
  };

  const getStatusIcon = (status: Alert['status']) => {
    switch (status) {
      case 'active':
        return <AlertCircle className="w-4 h-4" />;
      case 'acknowledged':
        return <CheckCircle className="w-4 h-4" />;
      case 'resolved':
        return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">告警中心</h2>
          <p className="text-text-secondary mt-1">管理和监控所有系统告警</p>
        </div>
        <Button variant="primary" icon={<Bell className="w-4 h-4" />}>
          配置告警规则
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-lift cursor-pointer" onClick={() => setFilter('all')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">全部告警</p>
              <p className="text-3xl font-bold text-text-primary mt-2">{alerts.length}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Bell className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="hover-lift cursor-pointer" onClick={() => setFilter('active')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">活跃</p>
              <p className="text-3xl font-bold text-status-danger mt-2">
                {alerts.filter((a) => a.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-status-danger/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-status-danger" />
            </div>
          </div>
        </Card>

        <Card className="hover-lift cursor-pointer" onClick={() => setFilter('acknowledged')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">已确认</p>
              <p className="text-3xl font-bold text-status-warning mt-2">
                {alerts.filter((a) => a.status === 'acknowledged').length}
              </p>
            </div>
            <div className="p-3 bg-status-warning/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-status-warning" />
            </div>
          </div>
        </Card>

        <Card className="hover-lift cursor-pointer" onClick={() => setFilter('resolved')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">已解决</p>
              <p className="text-3xl font-bold text-status-success mt-2">
                {alerts.filter((a) => a.status === 'resolved').length}
              </p>
            </div>
            <div className="p-3 bg-status-success/10 rounded-lg">
              <XCircle className="w-6 h-6 text-status-success" />
            </div>
          </div>
        </Card>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="搜索告警..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-bg-tertiary border border-border rounded-lg text-text-primary placeholder-text-tertiary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            </div>
            <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>
              筛选
            </Button>
          </div>
        </div>

        <div className="divide-y divide-border">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="p-4 hover:bg-bg-tertiary transition-colors">
              <div className="flex items-start gap-4">
                <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-text-primary">{alert.title}</h3>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={
                        alert.status === 'active' ? 'danger' :
                        alert.status === 'acknowledged' ? 'warning' : 'success'
                      } size="sm">
                        {alert.status === 'active' && '活跃'}
                        {alert.status === 'acknowledged' && '已确认'}
                        {alert.status === 'resolved' && '已解决'}
                      </StatusBadge>
                      <span className="text-sm text-text-tertiary">{alert.time}</span>
                    </div>
                  </div>
                  <p className="text-text-secondary text-sm mb-3">{alert.message}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-text-tertiary">来源:</span>
                      <span className="text-text-primary font-medium">{alert.source}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-text-tertiary">严重性:</span>
                      <StatusBadge status={
                        alert.severity === 'critical' ? 'danger' :
                        alert.severity === 'warning' ? 'warning' : 'info'
                      } size="sm">
                        {alert.severity === 'critical' && '严重'}
                        {alert.severity === 'warning' && '警告'}
                        {alert.severity === 'info' && '信息'}
                      </StatusBadge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {alert.status === 'active' && (
                    <Button size="sm" variant="secondary">
                      确认
                    </Button>
                  )}
                  {alert.status !== 'resolved' && (
                    <Button size="sm" variant="primary">
                      解决
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Alerts;
