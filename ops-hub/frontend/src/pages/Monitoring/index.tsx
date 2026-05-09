import React from 'react';
import { Card, StatusBadge, Button } from '../../components';
import { Activity, Cpu, HardDrive, Wifi, Server, Clock, TrendingUp } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const networkData = [
  { time: '00:00', inbound: 120, outbound: 80 },
  { time: '01:00', inbound: 95, outbound: 65 },
  { time: '02:00', inbound: 85, outbound: 55 },
  { time: '03:00', inbound: 75, outbound: 45 },
  { time: '04:00', inbound: 70, outbound: 40 },
  { time: '05:00', inbound: 80, outbound: 50 },
  { time: '06:00', inbound: 110, outbound: 70 },
  { time: '07:00', inbound: 140, outbound: 90 },
  { time: '08:00', inbound: 180, outbound: 120 },
  { time: '09:00', inbound: 220, outbound: 150 },
  { time: '10:00', inbound: 200, outbound: 135 },
  { time: '11:00', inbound: 250, outbound: 170 },
];

const diskData = [
  { name: '/', used: 450, total: 512 },
  { name: '/var', used: 280, total: 256 },
  { name: '/home', used: 180, total: 1024 },
  { name: '/tmp', used: 45, total: 128 },
  { name: '/opt', used: 820, total: 1024 },
];

const metrics = [
  { name: 'api-server-01', cpu: 72, memory: 68, disk: 45, network: 120, status: 'success' as const },
  { name: 'api-server-02', cpu: 65, memory: 72, disk: 48, network: 95, status: 'success' as const },
  { name: 'db-primary', cpu: 85, memory: 88, disk: 78, network: 180, status: 'warning' as const },
  { name: 'db-replica', cpu: 42, memory: 55, disk: 76, network: 120, status: 'success' as const },
  { name: 'cache-01', cpu: 38, memory: 92, disk: 12, network: 320, status: 'warning' as const },
  { name: 'queue-01', cpu: 25, memory: 35, disk: 8, network: 560, status: 'success' as const },
];

export const Monitoring: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">监控中心</h2>
          <p className="text-text-secondary mt-1">实时监控系统性能和资源使用情况</p>
        </div>
        <Button variant="primary" icon={<Activity className="w-4 h-4" />}>
          刷新数据
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-lift">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">平均 CPU</p>
              <p className="text-2xl font-bold text-text-primary">72%</p>
            </div>
          </div>
        </Card>

        <Card className="hover-lift">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-status-success/10 rounded-lg">
              <HardDrive className="w-6 h-6 text-status-success" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">平均内存</p>
              <p className="text-2xl font-bold text-text-primary">68%</p>
            </div>
          </div>
        </Card>

        <Card className="hover-lift">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-status-info/10 rounded-lg">
              <Wifi className="w-6 h-6 text-status-info" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">网络 I/O</p>
              <p className="text-2xl font-bold text-text-primary">1.2Gbps</p>
            </div>
          </div>
        </Card>

        <Card className="hover-lift">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-status-warning/10 rounded-lg">
              <Server className="w-6 h-6 text-status-warning" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">活跃服务</p>
              <p className="text-2xl font-bold text-text-primary">24</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">网络流量</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-text-secondary">入站</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-success" />
                <span className="text-text-secondary">出站</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={networkData}>
              <defs>
                <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#007AFF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34C759" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#34C759" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="#8E8E93" fontSize={12} />
              <YAxis stroke="#8E8E93" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1C1C1E',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Area type="monotone" dataKey="inbound" stackId="1" stroke="#007AFF" fill="url(#colorInbound)" />
              <Area type="monotone" dataKey="outbound" stackId="2" stroke="#34C759" fill="url(#colorOutbound)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">磁盘使用</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={diskData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#8E8E93" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#8E8E93" fontSize={12} width={50} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1C1C1E',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value} GB`, '使用']}
              />
              <Bar dataKey="used" fill="#007AFF" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card padding="lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">主机监控</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-text-secondary font-medium">主机名</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">状态</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">CPU</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">内存</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">磁盘</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">网络</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => (
                <tr key={metric.name} className="border-b border-divider hover:bg-bg-tertiary transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-text-secondary" />
                      <span className="text-text-primary font-medium">{metric.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={metric.status} pulse={metric.status === 'danger'}>
                      {metric.status === 'success' && '正常'}
                      {metric.status === 'warning' && '警告'}
                      {metric.status === 'danger' && '危险'}
                    </StatusBadge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            metric.cpu > 80 ? 'bg-status-danger' : metric.cpu > 60 ? 'bg-status-warning' : 'bg-status-success'
                          }`}
                          style={{ width: `${metric.cpu}%` }}
                        />
                      </div>
                      <span className="text-text-primary text-sm">{metric.cpu}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            metric.memory > 80 ? 'bg-status-danger' : metric.memory > 60 ? 'bg-status-warning' : 'bg-status-success'
                          }`}
                          style={{ width: `${metric.memory}%` }}
                        />
                      </div>
                      <span className="text-text-primary text-sm">{metric.memory}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-text-primary">{metric.disk}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-text-primary">{metric.network} Mbps</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Monitoring;
