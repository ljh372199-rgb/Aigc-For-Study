import React from 'react';
import { Card, StatusBadge } from '../../components';
import { Server, Cpu, HardDrive, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const cpuData = [
  { time: '00:00', value: 45 },
  { time: '01:00', value: 52 },
  { time: '02:00', value: 48 },
  { time: '03:00', value: 41 },
  { time: '04:00', value: 39 },
  { time: '05:00', value: 42 },
  { time: '06:00', value: 55 },
  { time: '07:00', value: 68 },
  { time: '08:00', value: 72 },
  { time: '09:00', value: 78 },
  { time: '10:00', value: 75 },
  { time: '11:00', value: 82 },
];

const memoryData = [
  { time: '00:00', value: 62 },
  { time: '01:00', value: 64 },
  { time: '02:00', value: 61 },
  { time: '03:00', value: 59 },
  { time: '04:00', value: 58 },
  { time: '05:00', value: 60 },
  { time: '06:00', value: 65 },
  { time: '07:00', value: 71 },
  { time: '08:00', value: 76 },
  { time: '09:00', value: 80 },
  { time: '10:00', value: 78 },
  { time: '11:00', value: 85 },
];

const serviceData = [
  { name: 'API Server', status: 'success' as const, uptime: '99.98%', requests: '1.2M' },
  { name: 'Database', status: 'success' as const, uptime: '99.99%', requests: '890K' },
  { name: 'Cache', status: 'warning' as const, uptime: '98.50%', requests: '2.1M' },
  { name: 'Queue', status: 'success' as const, uptime: '99.95%', requests: '560K' },
  { name: 'Search', status: 'danger' as const, uptime: '95.20%', requests: '320K' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">服务器总数</p>
              <p className="text-3xl font-bold text-text-primary mt-2">24</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-status-success" />
                <span className="text-status-success text-sm">+2</span>
              </div>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Server className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">CPU 使用率</p>
              <p className="text-3xl font-bold text-text-primary mt-2">78%</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-status-warning" />
                <span className="text-status-warning text-sm">+12%</span>
              </div>
            </div>
            <div className="p-3 bg-status-warning/10 rounded-lg">
              <Cpu className="w-6 h-6 text-status-warning" />
            </div>
          </div>
        </Card>

        <Card className="hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">内存使用率</p>
              <p className="text-3xl font-bold text-text-primary mt-2">85%</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-status-danger" />
                <span className="text-status-danger text-sm">+8%</span>
              </div>
            </div>
            <div className="p-3 bg-status-danger/10 rounded-lg">
              <HardDrive className="w-6 h-6 text-status-danger" />
            </div>
          </div>
        </Card>

        <Card className="hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">网络带宽</p>
              <p className="text-3xl font-bold text-text-primary mt-2">1.2Gbps</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="w-4 h-4 text-status-success" />
                <span className="text-status-success text-sm">-5%</span>
              </div>
            </div>
            <div className="p-3 bg-status-info/10 rounded-lg">
              <Activity className="w-6 h-6 text-status-info" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">CPU 使用率趋势</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={cpuData}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#007AFF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
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
              <Area type="monotone" dataKey="value" stroke="#007AFF" fillOpacity={1} fill="url(#colorCpu)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">内存使用率趋势</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={memoryData}>
              <defs>
                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="value" stroke="#34C759" fillOpacity={1} fill="url(#colorMem)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card padding="lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">服务状态</h3>
        <div className="space-y-3">
          {serviceData.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg hover:bg-bg-elevated transition-colors"
            >
              <div className="flex items-center gap-4">
                <StatusBadge status={service.status} pulse={service.status === 'danger'}>
                  {service.status === 'success' && '在线'}
                  {service.status === 'warning' && '警告'}
                  {service.status === 'danger' && '离线'}
                </StatusBadge>
                <span className="font-medium text-text-primary">{service.name}</span>
              </div>
              <div className="flex items-center gap-8 text-sm">
                <div>
                  <span className="text-text-secondary">可用性: </span>
                  <span className="text-text-primary font-medium">{service.uptime}</span>
                </div>
                <div>
                  <span className="text-text-secondary">请求: </span>
                  <span className="text-text-primary font-medium">{service.requests}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
