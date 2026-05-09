import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, Badge, Button, Modal, Select, Input, Pagination, Loading } from '@/components/ui';
import { useLogsStore } from '@/stores/logsStore';
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

type LogLevel = 'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogEntry {
  id?: string;
  timestamp: string;
  level?: string;
  service?: string;
  message: string;
  stream?: Record<string, string>;
  labels?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

function LogLevelIcon({ level }: { level: string }) {
  const config: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    INFO: { icon: <Info size={16} />, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
    WARN: { icon: <AlertTriangle size={16} />, color: 'text-accent-yellow', bg: 'bg-accent-yellow/10' },
    WARNING: { icon: <AlertTriangle size={16} />, color: 'text-accent-yellow', bg: 'bg-accent-yellow/10' },
    ERROR: { icon: <AlertCircle size={16} />, color: 'text-accent-red', bg: 'bg-accent-red/10' },
    DEBUG: { icon: <Info size={16} />, color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
  };

  const { icon, color, bg } = config[level] || config.INFO;
  return <div className={`p-xs rounded ${bg} ${color}`}>{icon}</div>;
}

function LogRow({ log, onClick }: { log: LogEntry; onClick: () => void }) {
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div
      className="flex items-start gap-md p-md hover:bg-background-tertiary transition-colors cursor-pointer border-b border-border/50 last:border-0"
      onClick={onClick}
    >
      <LogLevelIcon level={log.level || 'INFO'} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-md mb-xs">
          <span className="text-xs text-text-tertiary font-mono">{formatTimestamp(log.timestamp)}</span>
          <Badge variant="default" size="sm">{log.service || log.stream?.service || 'system'}</Badge>
        </div>
        <p className="text-sm text-text-primary truncate">{log.message}</p>
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
            <LogLevelIcon level={log.level || 'INFO'} />
            <div>
              <p className="font-medium text-text-primary">{log.service || log.stream?.service || 'system'}</p>
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
            <p className="text-sm font-medium text-text-primary font-mono">
              {new Date(log.timestamp).toLocaleString('zh-CN')}
            </p>
          </div>
          <div className="p-md bg-background-tertiary rounded-lg">
            <p className="text-xs text-text-tertiary mb-xs">级别</p>
            <Badge
              variant={
                log.level === 'ERROR' ? 'error' :
                log.level === 'WARN' || log.level === 'WARNING' ? 'warning' : 'info'
              }
            >
              {log.level || 'INFO'}
            </Badge>
          </div>
          <div className="p-md bg-background-tertiary rounded-lg">
            <p className="text-xs text-text-tertiary mb-xs">服务</p>
            <p className="text-sm font-medium text-text-primary">{log.service || log.stream?.service || 'N/A'}</p>
          </div>
          {log.stream && (
            <div className="p-md bg-background-tertiary rounded-lg">
              <p className="text-xs text-text-tertiary mb-xs">标签</p>
              <p className="text-sm font-medium text-text-primary font-mono">
                {Object.entries(log.stream).map(([k, v]) => `${k}="${v}"`).join(', ')}
              </p>
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
          <Button variant="outline" onClick={onClose}>关闭</Button>
        </div>
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

export function Logs() {
  const [levelFilter, setLevelFilter] = useState<LogLevel>('ALL');
  const [timeRange, setTimeRange] = useState<string>('1h');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { logs, loading, error, fetchLogs, setLevel } = useLogsStore();

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = () => {
    fetchLogs({ query: searchQuery || '*' });
  };

  const handleLevelChange = (newLevel: LogLevel) => {
    setLevel(newLevel);
    setCurrentPage(1);
  };

  const handleServiceChange = (newService: string) => {
    setService(newService);
    setCurrentPage(1);
  };

  const filteredLogs = logs.filter((log) => {
    if (levelFilter !== 'ALL' && log.level !== levelFilter) return false;
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
  ];

  const logLevels = [
    { value: 'ALL', label: '全部级别' },
    { value: 'INFO', label: 'INFO' },
    { value: 'WARN', label: 'WARN' },
    { value: 'ERROR', label: 'ERROR' },
    { value: 'DEBUG', label: 'DEBUG' },
  ];

  const timeRanges = [
    { value: '15m', label: '15 分钟' },
    { value: '1h', label: '1 小时' },
    { value: '6h', label: '6 小时' },
    { value: '24h', label: '24 小时' },
    { value: '7d', label: '7 天' },
  ];

  const levelCounts = {
    ALL: filteredLogs.length,
    INFO: filteredLogs.filter((l) => l.level === 'INFO').length,
    WARN: filteredLogs.filter((l) => l.level === 'WARN').length,
    ERROR: filteredLogs.filter((l) => l.level === 'ERROR').length,
  };

  if (loading && logs.length === 0) {
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full"
                />
              </div>
              <div className="flex flex-wrap gap-md">
                <Select
                  value={levelFilter}
                  onChange={(v) => handleLevelChange(v as LogLevel)}
                  options={logLevels}
                  className="w-32"
                />
                <Select
                  value={serviceFilter}
                  onChange={handleServiceChange}
                  options={services}
                  className="w-40"
                />
                <Select
                  value={timeRange}
                  onChange={setTimeRange}
                  options={timeRanges}
                  className="w-32"
                />
                <Button variant="primary" onClick={handleSearch}>
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
            onClick={() => handleLevelChange('ALL')}
            className={`px-md py-sm rounded-lg font-medium transition-colors ${
              levelFilter === 'ALL'
                ? 'bg-accent-blue text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            全部 ({levelCounts.ALL})
          </button>
          <button
            onClick={() => handleLevelChange('INFO')}
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
            onClick={() => handleLevelChange('WARN')}
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
            onClick={() => handleLevelChange('ERROR')}
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
              paginatedLogs.map((log, index) => (
                <LogRow
                  key={log.id || `${log.timestamp}-${index}`}
                  log={log}
                  onClick={() => handleLogClick(log)}
                />
              ))
            ) : (
              <div className="text-center py-xl">
                <FileText size={48} className="mx-auto text-text-tertiary mb-md" />
                <p className="text-text-secondary">暂无日志记录</p>
                {error && <p className="text-text-tertiary text-sm mt-sm">错误: {error}</p>}
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
