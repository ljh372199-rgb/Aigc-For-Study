import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, Badge, Button, Modal, Select, Input, Pagination } from '@/components/ui';
import {
  Search,
  Filter,
  FileText,
  Copy,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  Server,
} from 'lucide-react';

type LogLevel = 'ALL' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  id: string;
  timestamp: string;
  level: Exclude<LogLevel, 'ALL'>;
  service: string;
  message: string;
  traceId?: string;
  spanId?: string;
  userId?: string;
  ip?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-15 14:32:15.234',
    level: 'INFO',
    service: 'api-gateway',
    message: 'Request processed successfully',
    traceId: 'abc123def456',
    spanId: 'span001',
    method: 'GET',
    path: '/api/v1/users',
    statusCode: 200,
    duration: 45,
  },
  {
    id: '2',
    timestamp: '2024-01-15 14:31:42.156',
    level: 'WARN',
    service: 'user-service',
    message: 'High memory usage detected: 85%',
    traceId: 'def456ghi789',
    spanId: 'span002',
    metadata: { memoryUsage: 85, threshold: 80 },
  },
  {
    id: '3',
    timestamp: '2024-01-15 14:31:20.789',
    level: 'ERROR',
    service: 'payment-service',
    message: 'Payment processing failed: timeout',
    traceId: 'ghi789jkl012',
    spanId: 'span003',
    method: 'POST',
    path: '/api/v1/payments',
    statusCode: 500,
    duration: 30000,
    metadata: { errorCode: 'TIMEOUT', retryCount: 3 },
  },
  {
    id: '4',
    timestamp: '2024-01-15 14:30:58.321',
    level: 'INFO',
    service: 'auth-service',
    message: 'User authentication successful',
    traceId: 'jkl012mno345',
    spanId: 'span004',
    userId: 'user_12345',
    method: 'POST',
    path: '/api/v1/auth/login',
    statusCode: 200,
    duration: 120,
  },
  {
    id: '5',
    timestamp: '2024-01-15 14:30:45.567',
    level: 'INFO',
    service: 'api-gateway',
    message: 'Health check passed',
    traceId: 'mno345pqr678',
    spanId: 'span005',
  },
  {
    id: '6',
    timestamp: '2024-01-15 14:30:12.890',
    level: 'ERROR',
    service: 'db-replica',
    message: 'Replication lag exceeds threshold',
    traceId: 'pqr678stu901',
    spanId: 'span006',
    metadata: { lag: 5000, threshold: 1000 },
  },
  {
    id: '7',
    timestamp: '2024-01-15 14:29:33.234',
    level: 'WARN',
    service: 'cache-service',
    message: 'Cache miss rate increased',
    traceId: 'stu901vwx234',
    spanId: 'span007',
    metadata: { missRate: 0.35, hitRate: 0.65 },
  },
  {
    id: '8',
    timestamp: '2024-01-15 14:29:15.678',
    level: 'INFO',
    service: 'notification-service',
    message: 'Email sent successfully',
    traceId: 'vwx234yza567',
    spanId: 'span008',
    userId: 'user_67890',
    metadata: { emailType: 'verification', recipient: 'user@example.com' },
  },
  {
    id: '9',
    timestamp: '2024-01-15 14:28:52.123',
    level: 'INFO',
    service: 'api-gateway',
    message: 'New connection established',
    traceId: 'yza567bcd890',
    spanId: 'span009',
    ip: '192.168.1.100',
    method: 'GET',
    path: '/api/v1/products',
    statusCode: 200,
    duration: 78,
  },
  {
    id: '10',
    timestamp: '2024-01-15 14:28:30.456',
    level: 'WARN',
    service: 'storage-service',
    message: 'Disk I/O latency elevated',
    traceId: 'bcd890efg123',
    spanId: 'span010',
    metadata: { latency: 150, normalLatency: 50 },
  },
];

function LogLevelIcon({ level }: { level: Exclude<LogLevel, 'ALL'> }) {
  const config = {
    INFO: { icon: <Info size={16} />, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
    WARN: { icon: <AlertTriangle size={16} />, color: 'text-accent-yellow', bg: 'bg-accent-yellow/10' },
    ERROR: { icon: <AlertCircle size={16} />, color: 'text-accent-red', bg: 'bg-accent-red/10' },
  };

  const { icon, color, bg } = config[level];

  return (
    <div className={`p-xs rounded ${bg} ${color}`}>
      {icon}
    </div>
  );
}

function LogRow({ log, onClick }: { log: LogEntry; onClick: () => void }) {
  return (
    <div
      className="flex items-start gap-md p-md hover:bg-background-tertiary transition-colors cursor-pointer border-b border-border/50 last:border-0"
      onClick={onClick}
    >
      <LogLevelIcon level={log.level} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-md mb-xs">
          <span className="text-xs text-text-tertiary font-mono">{log.timestamp}</span>
          <Badge variant="default" size="sm">{log.service}</Badge>
          {log.traceId && (
            <span className="text-xs text-text-tertiary font-mono">
              ID: {log.traceId.slice(0, 8)}...
            </span>
          )}
        </div>
        <p className="text-sm text-text-primary truncate">{log.message}</p>
        {log.method && log.path && (
          <div className="flex items-center gap-sm mt-xs text-xs text-text-tertiary">
            <Badge variant={log.statusCode && log.statusCode >= 400 ? 'error' : 'success'} size="sm">
              {log.method}
            </Badge>
            <span>{log.path}</span>
            {log.statusCode && (
              <span>→ {log.statusCode}</span>
            )}
            {log.duration && (
              <span>• {log.duration}ms</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LogDetailModal({
  log,
  isOpen,
  onClose,
}: {
  log: LogEntry | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (log) {
      navigator.clipboard.writeText(JSON.stringify(log, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!log) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="日志详情" size="xl">
      <div className="space-y-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-md">
            <LogLevelIcon level={log.level} />
            <div>
              <p className="font-medium text-text-primary">{log.service}</p>
              <p className="text-sm text-text-secondary">{log.message}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <CheckCircle size={16} className="mr-xs text-accent-green" />
                已复制
              </>
            ) : (
              <>
                <Copy size={16} className="mr-xs" />
                复制
              </>
            )}
          </Button>
        </div>

        <div className="bg-background-tertiary rounded-lg p-md">
          <pre className="text-sm text-text-primary font-mono overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(log, null, 2)}
          </pre>
        </div>

        <div className="grid grid-cols-2 gap-md">
          <div className="p-md bg-background-tertiary rounded-lg">
            <p className="text-xs text-text-tertiary mb-xs">时间戳</p>
            <p className="text-sm font-medium text-text-primary font-mono">{log.timestamp}</p>
          </div>
          <div className="p-md bg-background-tertiary rounded-lg">
            <p className="text-xs text-text-tertiary mb-xs">级别</p>
            <Badge
              variant={
                log.level === 'ERROR' ? 'error' :
                log.level === 'WARN' ? 'warning' : 'info'
              }
            >
              {log.level}
            </Badge>
          </div>
          {log.traceId && (
            <div className="p-md bg-background-tertiary rounded-lg">
              <p className="text-xs text-text-tertiary mb-xs">Trace ID</p>
              <p className="text-sm font-medium text-text-primary font-mono">{log.traceId}</p>
            </div>
          )}
          {log.spanId && (
            <div className="p-md bg-background-tertiary rounded-lg">
              <p className="text-xs text-text-tertiary mb-xs">Span ID</p>
              <p className="text-sm font-medium text-text-primary font-mono">{log.spanId}</p>
            </div>
          )}
          {log.userId && (
            <div className="p-md bg-background-tertiary rounded-lg">
              <p className="text-xs text-text-tertiary mb-xs">用户 ID</p>
              <p className="text-sm font-medium text-text-primary font-mono">{log.userId}</p>
            </div>
          )}
          {log.ip && (
            <div className="p-md bg-background-tertiary rounded-lg">
              <p className="text-xs text-text-tertiary mb-xs">IP 地址</p>
              <p className="text-sm font-medium text-text-primary font-mono">{log.ip}</p>
            </div>
          )}
          {log.method && log.path && (
            <>
              <div className="p-md bg-background-tertiary rounded-lg">
                <p className="text-xs text-text-tertiary mb-xs">请求方法</p>
                <p className="text-sm font-medium text-text-primary">{log.method}</p>
              </div>
              <div className="p-md bg-background-tertiary rounded-lg">
                <p className="text-xs text-text-tertiary mb-xs">请求路径</p>
                <p className="text-sm font-medium text-text-primary font-mono">{log.path}</p>
              </div>
            </>
          )}
          {log.statusCode && (
            <div className="p-md bg-background-tertiary rounded-lg">
              <p className="text-xs text-text-tertiary mb-xs">状态码</p>
              <Badge variant={log.statusCode >= 400 ? 'error' : 'success'}>
                {log.statusCode}
              </Badge>
            </div>
          )}
          {log.duration && (
            <div className="p-md bg-background-tertiary rounded-lg">
              <p className="text-xs text-text-tertiary mb-xs">响应时间</p>
              <p className="text-sm font-medium text-text-primary">{log.duration} ms</p>
            </div>
          )}
        </div>

        {log.metadata && (
          <div>
            <p className="text-sm font-medium text-text-secondary mb-sm">元数据</p>
            <div className="bg-background-tertiary rounded-lg p-md">
              <pre className="text-sm text-text-primary font-mono overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-md border-t border-border">
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
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

export function Logs() {
  const [levelFilter, setLevelFilter] = useState<LogLevel>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('1h');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredLogs = mockLogs.filter((log) => {
    if (levelFilter !== 'ALL' && log.level !== levelFilter) return false;
    if (serviceFilter !== 'all' && log.service !== serviceFilter) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const pageSize = 10;
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleLogClick = (log: LogEntry) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const services = [
    { value: 'all', label: '全部服务' },
    { value: 'api-gateway', label: 'API Gateway' },
    { value: 'user-service', label: '用户服务' },
    { value: 'auth-service', label: '认证服务' },
    { value: 'payment-service', label: '支付服务' },
    { value: 'cache-service', label: '缓存服务' },
    { value: 'storage-service', label: '存储服务' },
    { value: 'notification-service', label: '通知服务' },
    { value: 'db-replica', label: '数据库副本' },
  ];

  const logLevels = [
    { value: 'ALL', label: '全部级别' },
    { value: 'INFO', label: 'INFO' },
    { value: 'WARN', label: 'WARN' },
    { value: 'ERROR', label: 'ERROR' },
  ];

  const timeRanges = [
    { value: '15m', label: '15 分钟' },
    { value: '1h', label: '1 小时' },
    { value: '6h', label: '6 小时' },
    { value: '24h', label: '24 小时' },
    { value: '7d', label: '7 天' },
  ];

  const levelCounts = {
    ALL: mockLogs.length,
    INFO: mockLogs.filter((l) => l.level === 'INFO').length,
    WARN: mockLogs.filter((l) => l.level === 'WARN').length,
    ERROR: mockLogs.filter((l) => l.level === 'ERROR').length,
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-xl"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-text-primary mb-xs">日志查询</h1>
        <p className="text-text-secondary">搜索和分析系统日志</p>
      </motion.div>

      <motion.div variants={item}>
        <Card padding="lg">
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-md">
              <div className="flex-1">
                <Input
                  placeholder="搜索日志内容..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex flex-wrap gap-md">
                <Select
                  value={levelFilter}
                  onChange={(v) => setLevelFilter(v as LogLevel)}
                  options={logLevels}
                  className="w-32"
                />
                <Select
                  value={serviceFilter}
                  onChange={setServiceFilter}
                  options={services}
                  className="w-40"
                />
                <Select
                  value={timeRange}
                  onChange={setTimeRange}
                  options={timeRanges}
                  className="w-32"
                />
                <Button variant="primary">
                  <Search size={16} className="mr-xs" />
                  查询
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <div className="flex items-center gap-md">
          <button
            onClick={() => setLevelFilter('ALL')}
            className={`px-md py-sm rounded-lg font-medium transition-colors ${
              levelFilter === 'ALL'
                ? 'bg-accent-blue text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            全部 ({levelCounts.ALL})
          </button>
          <button
            onClick={() => setLevelFilter('INFO')}
            className={`px-md py-sm rounded-lg font-medium transition-colors ${
              levelFilter === 'INFO'
                ? 'bg-accent-blue text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            <Info size={16} className="inline mr-xs" />
            INFO ({levelCounts.INFO})
          </button>
          <button
            onClick={() => setLevelFilter('WARN')}
            className={`px-md py-sm rounded-lg font-medium transition-colors ${
              levelFilter === 'WARN'
                ? 'bg-accent-yellow text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            <AlertTriangle size={16} className="inline mr-xs" />
            WARN ({levelCounts.WARN})
          </button>
          <button
            onClick={() => setLevelFilter('ERROR')}
            className={`px-md py-sm rounded-lg font-medium transition-colors ${
              levelFilter === 'ERROR'
                ? 'bg-accent-red text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            <AlertCircle size={16} className="inline mr-xs" />
            ERROR ({levelCounts.ERROR})
          </button>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Card padding="none">
          <CardContent className="p-none">
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <LogRow
                  key={log.id}
                  log={log}
                  onClick={() => handleLogClick(log)}
                />
              ))
            ) : (
              <div className="text-center py-xl">
                <FileText size={48} className="mx-auto text-text-tertiary mb-md" />
                <p className="text-text-secondary">暂无日志记录</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {totalPages > 1 && (
        <motion.div variants={item}>
          <Card padding="md">
            <CardContent>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredLogs.length}
                onChange={handlePageChange}
                showTotal
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      <LogDetailModal
        log={selectedLog}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </motion.div>
  );
}
