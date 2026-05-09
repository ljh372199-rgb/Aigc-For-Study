import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, Badge, Button, Modal, Tabs } from '@/components/ui';
import { TimeSeriesChart } from '@/components/charts';
import {
  Server,
  Activity,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  RefreshCw,
  Power,
  Eye,
  FileText,
  ChevronRight,
  Globe,
  Database,
  Shield,
  Mail,
  Layout,
  AlertCircle,
} from 'lucide-react';

type ServiceStatus = 'healthy' | 'warning' | 'critical';

interface Service {
  id: string;
  name: string;
  type: 'api' | 'database' | 'cache' | 'storage' | 'auth' | 'notification' | 'frontend';
  status: ServiceStatus;
  port: number;
  containerId: string;
  containerName: string;
  image: string;
  uptime: string;
  cpu: number;
  memory: number;
  memoryUsed: string;
  memoryTotal: string;
  disk: number;
  networkIn: number;
  networkOut: number;
  instances: number;
  version: string;
  endpoints: string[];
}

const mockServices: Service[] = [
  {
    id: '1',
    name: 'API Gateway',
    type: 'api',
    status: 'healthy',
    port: 8080,
    containerId: 'abc123def456',
    containerName: 'api-gateway-prod',
    image: 'registry.io/api-gateway:v2.1.0',
    uptime: '15 天 6 小时',
    cpu: 35,
    memory: 62,
    memoryUsed: '1.2 GB',
    memoryTotal: '2 GB',
    disk: 28,
    networkIn: 125,
    networkOut: 89,
    instances: 3,
    version: 'v2.1.0',
    endpoints: ['/api/v1/*', '/api/health'],
  },
  {
    id: '2',
    name: 'User Service',
    type: 'api',
    status: 'warning',
    port: 3001,
    containerId: 'def456ghi789',
    containerName: 'user-service-prod',
    image: 'registry.io/user-service:v1.5.2',
    uptime: '15 天 6 小时',
    cpu: 78,
    memory: 85,
    memoryUsed: '1.7 GB',
    memoryTotal: '2 GB',
    disk: 15,
    networkIn: 45,
    networkOut: 67,
    instances: 2,
    version: 'v1.5.2',
    endpoints: ['/api/users/*', '/api/auth/*'],
  },
  {
    id: '3',
    name: 'MySQL Primary',
    type: 'database',
    status: 'healthy',
    port: 3306,
    containerId: 'ghi789jkl012',
    containerName: 'mysql-primary',
    image: 'mysql:8.0',
    uptime: '45 天 12 小时',
    cpu: 25,
    memory: 78,
    memoryUsed: '6.2 GB',
    memoryTotal: '8 GB',
    disk: 65,
    networkIn: 234,
    networkOut: 456,
    instances: 1,
    version: '8.0.35',
    endpoints: ['mysql://:3306'],
  },
  {
    id: '4',
    name: 'Redis Cache',
    type: 'cache',
    status: 'healthy',
    port: 6379,
    containerId: 'jkl012mno345',
    containerName: 'redis-cache',
    image: 'redis:7.2-alpine',
    uptime: '30 天 8 小时',
    cpu: 12,
    memory: 45,
    memoryUsed: '3.6 GB',
    memoryTotal: '8 GB',
    disk: 8,
    networkIn: 567,
    networkOut: 567,
    instances: 2,
    version: '7.2.1',
    endpoints: ['redis://:6379'],
  },
  {
    id: '5',
    name: 'Auth Service',
    type: 'auth',
    status: 'healthy',
    port: 3002,
    containerId: 'mno345pqr678',
    containerName: 'auth-service-prod',
    image: 'registry.io/auth-service:v1.3.0',
    uptime: '20 天 4 小时',
    cpu: 18,
    memory: 42,
    memoryUsed: '840 MB',
    memoryTotal: '2 GB',
    disk: 12,
    networkIn: 89,
    networkOut: 123,
    instances: 2,
    version: 'v1.3.0',
    endpoints: ['/api/auth/*', '/oauth/*'],
  },
  {
    id: '6',
    name: 'Storage Service',
    type: 'storage',
    status: 'warning',
    port: 3003,
    containerId: 'pqr678stu901',
    containerName: 'storage-service',
    image: 'registry.io/storage-service:v2.0.1',
    uptime: '10 天 2 小时',
    cpu: 42,
    memory: 55,
    memoryUsed: '4.4 GB',
    memoryTotal: '8 GB',
    disk: 82,
    networkIn: 234,
    networkOut: 567,
    instances: 2,
    version: 'v2.0.1',
    endpoints: ['/api/storage/*'],
  },
];

function ServiceIcon({ type }: { type: Service['type'] }) {
  const config = {
    api: { icon: <Globe size={24} />, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
    database: { icon: <Database size={24} />, color: 'text-accent-green', bg: 'bg-accent-green/10' },
    cache: { icon: <MemoryStick size={24} />, color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
    storage: { icon: <HardDrive size={24} />, color: 'text-accent-yellow', bg: 'bg-accent-yellow/10' },
    auth: { icon: <Shield size={24} />, color: 'text-accent-red', bg: 'bg-accent-red/10' },
    notification: { icon: <Mail size={24} />, color: 'text-accent-orange', bg: 'bg-accent-orange/10' },
    frontend: { icon: <Layout size={24} />, color: 'text-accent-pink', bg: 'bg-accent-pink/10' },
  };

  const { icon, color, bg } = config[type];

  return (
    <div className={`p-md rounded-full ${bg} ${color}`}>
      {icon}
    </div>
  );
}

function StatusIndicator({ status }: { status: ServiceStatus }) {
  const config = {
    healthy: { color: 'bg-accent-green', label: '健康' },
    warning: { color: 'bg-accent-yellow', label: '警告' },
    critical: { color: 'bg-accent-red', label: '异常' },
  };

  const { color, label } = config[status];

  return (
    <div className="flex items-center gap-sm">
      <div className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
      <span className="text-sm text-text-secondary">{label}</span>
    </div>
  );
}

function ServiceCard({ service, onClick }: { service: Service; onClick: () => void }) {
  return (
    <Card
      className="hover:border-border-hover transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-lg">
        <div className="flex items-start justify-between mb-md">
          <div className="flex items-center gap-md">
            <ServiceIcon type={service.type} />
            <div>
              <h3 className="text-lg font-semibold text-text-primary">{service.name}</h3>
              <p className="text-sm text-text-secondary">端口: {service.port}</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-text-tertiary" />
        </div>

        <StatusIndicator status={service.status} />

        <div className="mt-md pt-md border-t border-border">
          <div className="grid grid-cols-3 gap-md mb-md">
            <div className="text-center">
              <div className="flex items-center justify-center mb-xs">
                <Cpu size={16} className="text-text-tertiary mr-xs" />
                <span className="text-lg font-semibold text-text-primary">{service.cpu}%</span>
              </div>
              <p className="text-xs text-text-tertiary">CPU</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-xs">
                <MemoryStick size={16} className="text-text-tertiary mr-xs" />
                <span className="text-lg font-semibold text-text-primary">{service.memory}%</span>
              </div>
              <p className="text-xs text-text-tertiary">内存</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-xs">
                <Activity size={16} className="text-text-tertiary mr-xs" />
                <span className="text-lg font-semibold text-text-primary">{service.instances}</span>
              </div>
              <p className="text-xs text-text-tertiary">实例</p>
            </div>
          </div>

          <div className="flex gap-sm">
            <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); }}>
              <Eye size={14} className="mr-xs" />
              监控
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); }}>
              <FileText size={14} className="mr-xs" />
              日志
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceDetailModal({
  service,
  isOpen,
  onClose,
}: {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!service) return null;

  const chartData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
  }));

  const tabsItems = [
    {
      key: 'overview',
      label: '概览',
      content: (
        <div className="space-y-lg">
          <div className="grid grid-cols-2 gap-md">
            <div className="p-md bg-background-tertiary rounded-lg">
              <p className="text-xs text-text-tertiary mb-xs">容器 ID</p>
              <p className="text-sm font-medium text-text-primary font-mono truncate">
                {service.containerId}
              </p>
            </div>
            <div className="p-md bg-background-tertiary rounded-lg">
              <p className="text-xs text-text-tertiary mb-xs">容器名称</p>
              <p className="text-sm font-medium text-text-primary">{service.containerName}</p>
            </div>
            <div className="p-md bg-background-tertiary rounded-lg">
              <p className="text-xs text-text-tertiary mb-xs">镜像版本</p>
              <p className="text-sm font-medium text-text-primary">{service.image}</p>
            </div>
            <div className="p-md bg-background-tertiary rounded-lg">
              <p className="text-xs text-text-tertiary mb-xs">运行时间</p>
              <p className="text-sm font-medium text-text-primary">{service.uptime}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-text-secondary mb-md">资源使用</p>
            <div className="space-y-md">
              <div>
                <div className="flex items-center justify-between mb-sm">
                  <div className="flex items-center gap-sm">
                    <Cpu size={16} className="text-text-tertiary" />
                    <span className="text-sm text-text-primary">CPU 使用率</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">{service.cpu}%</span>
                </div>
                <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      service.cpu > 80 ? 'bg-accent-red' :
                      service.cpu > 60 ? 'bg-accent-yellow' : 'bg-accent-green'
                    }`}
                    style={{ width: `${service.cpu}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-sm">
                  <div className="flex items-center gap-sm">
                    <MemoryStick size={16} className="text-text-tertiary" />
                    <span className="text-sm text-text-primary">内存使用率</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    {service.memoryUsed} / {service.memoryTotal}
                  </span>
                </div>
                <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      service.memory > 80 ? 'bg-accent-red' :
                      service.memory > 60 ? 'bg-accent-yellow' : 'bg-accent-green'
                    }`}
                    style={{ width: `${service.memory}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-sm">
                  <div className="flex items-center gap-sm">
                    <HardDrive size={16} className="text-text-tertiary" />
                    <span className="text-sm text-text-primary">磁盘使用率</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">{service.disk}%</span>
                </div>
                <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      service.disk > 80 ? 'bg-accent-red' :
                      service.disk > 60 ? 'bg-accent-yellow' : 'bg-accent-green'
                    }`}
                    style={{ width: `${service.disk}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'metrics',
      label: '指标',
      content: (
        <div className="space-y-lg">
          <TimeSeriesChart
            data={chartData}
            series={[
              { key: 'cpu', name: 'CPU %', color: '#0a84ff' },
              { key: 'memory', name: 'Memory %', color: '#30d158' },
            ]}
            xKey="time"
            height={250}
          />
          <div className="grid grid-cols-2 gap-md">
            <div className="p-md bg-background-tertiary rounded-lg">
              <div className="flex items-center gap-sm mb-xs">
                <Network size={16} className="text-text-tertiary" />
                <p className="text-xs text-text-tertiary">入站流量</p>
              </div>
              <p className="text-xl font-bold text-text-primary">{service.networkIn} MB/s</p>
            </div>
            <div className="p-md bg-background-tertiary rounded-lg">
              <div className="flex items-center gap-sm mb-xs">
                <Network size={16} className="text-text-tertiary rotate-180" />
                <p className="text-xs text-text-tertiary">出站流量</p>
              </div>
              <p className="text-xl font-bold text-text-primary">{service.networkOut} MB/s</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'endpoints',
      label: '端点',
      content: (
        <div className="space-y-md">
          {service.endpoints.map((endpoint, index) => (
            <div
              key={index}
              className="p-md bg-background-tertiary rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-md">
                <Badge variant="info" size="sm">HTTP</Badge>
                <code className="text-sm text-text-primary font-mono">{endpoint}</code>
              </div>
              <Button variant="ghost" size="sm">
                <Eye size={14} />
              </Button>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={service.name} size="xl">
      <div className="space-y-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-md">
            <ServiceIcon type={service.type} />
            <div>
              <p className="text-sm text-text-secondary">
                {service.type === 'api' ? 'API 服务' :
                 service.type === 'database' ? '数据库' :
                 service.type === 'cache' ? '缓存服务' :
                 service.type === 'storage' ? '存储服务' :
                 service.type === 'auth' ? '认证服务' :
                 service.type === 'notification' ? '通知服务' : '前端服务'}
              </p>
              <p className="text-xs text-text-tertiary">端口: {service.port} | 实例: {service.instances}</p>
            </div>
          </div>
          <StatusIndicator status={service.status} />
        </div>

        <Tabs items={tabsItems} variant="line" />

        <div className="flex justify-between pt-md border-t border-border">
          <div className="flex gap-sm">
            <Button variant="outline" size="sm">
              <Eye size={14} className="mr-xs" />
              监控
            </Button>
            <Button variant="outline" size="sm">
              <FileText size={14} className="mr-xs" />
              日志
            </Button>
          </div>
          <div className="flex gap-sm">
            <Button variant="outline" size="sm">
              <RefreshCw size={14} className="mr-xs" />
              重启
            </Button>
            <Button variant="primary" size="sm">
              <Power size={14} className="mr-xs" />
              停止
            </Button>
          </div>
        </div>
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

export function Services() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const stats = {
    total: mockServices.length,
    healthy: mockServices.filter((s) => s.status === 'healthy').length,
    warning: mockServices.filter((s) => s.status === 'warning').length,
    critical: mockServices.filter((s) => s.status === 'critical').length,
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-xl"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-text-primary mb-xs">服务管理</h1>
        <p className="text-text-secondary">管理所有微服务和容器实例</p>
      </motion.div>

      <motion.div variants={item}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
          <Card>
            <CardContent className="p-lg">
              <div className="flex items-center gap-md">
                <div className="p-sm bg-accent-blue/10 rounded-lg">
                  <Server size={24} className="text-accent-blue" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">服务总数</p>
                  <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-lg">
              <div className="flex items-center gap-md">
                <div className="p-sm bg-accent-green/10 rounded-lg">
                  <Activity size={24} className="text-accent-green" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">健康</p>
                  <p className="text-2xl font-bold text-text-primary">{stats.healthy}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-lg">
              <div className="flex items-center gap-md">
                <div className="p-sm bg-accent-yellow/10 rounded-lg">
                  <AlertCircle size={24} className="text-accent-yellow" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">警告</p>
                  <p className="text-2xl font-bold text-text-primary">{stats.warning}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-lg">
              <div className="flex items-center gap-md">
                <div className="p-sm bg-accent-red/10 rounded-lg">
                  <Power size={24} className="text-accent-red" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">异常</p>
                  <p className="text-2xl font-bold text-text-primary">{stats.critical}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {mockServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={() => handleServiceClick(service)}
            />
          ))}
        </div>
      </motion.div>

      <ServiceDetailModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </motion.div>
  );
}
