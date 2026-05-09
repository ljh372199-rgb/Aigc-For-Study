import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { LineChartComponent } from '@/components/charts';
import { Cpu, MemoryStick, HardDrive, Activity } from 'lucide-react';

const mockMetrics = {
  cpu: 45,
  memory: 67,
  disk: 34,
  network: 12,
};

const mockChartData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  cpu: Math.random() * 100,
  memory: Math.random() * 100,
  network: Math.random() * 50,
}));

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
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
        <h1 className="text-3xl font-bold text-text-primary mb-sm">Dashboard</h1>
        <p className="text-text-secondary">Real-time monitoring and analytics</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        <Card className="hover:border-accent-blue transition-colors">
          <CardContent className="flex items-center justify-between p-lg">
            <div>
              <p className="text-text-secondary text-sm mb-xs">CPU Usage</p>
              <p className="text-3xl font-bold text-text-primary">{mockMetrics.cpu}%</p>
              <Badge variant={mockMetrics.cpu > 80 ? 'error' : 'success'} size="sm" className="mt-sm">
                <Activity size={12} className="mr-xs" />
                Active
              </Badge>
            </div>
            <div className="p-md bg-accent-blue/10 rounded-full">
              <Cpu size={32} className="text-accent-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-accent-green transition-colors">
          <CardContent className="flex items-center justify-between p-lg">
            <div>
              <p className="text-text-secondary text-sm mb-xs">Memory Usage</p>
              <p className="text-3xl font-bold text-text-primary">{mockMetrics.memory}%</p>
              <Badge variant={mockMetrics.memory > 80 ? 'warning' : 'info'} size="sm" className="mt-sm">
                <MemoryStick size={12} className="mr-xs" />
                16 GB
              </Badge>
            </div>
            <div className="p-md bg-accent-green/10 rounded-full">
              <MemoryStick size={32} className="text-accent-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-accent-yellow transition-colors">
          <CardContent className="flex items-center justify-between p-lg">
            <div>
              <p className="text-text-secondary text-sm mb-xs">Disk Usage</p>
              <p className="text-3xl font-bold text-text-primary">{mockMetrics.disk}%</p>
              <Badge variant="info" size="sm" className="mt-sm">
                <HardDrive size={12} className="mr-xs" />
                500 GB
              </Badge>
            </div>
            <div className="p-md bg-accent-yellow/10 rounded-full">
              <HardDrive size={32} className="text-accent-yellow" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-accent-purple transition-colors">
          <CardContent className="flex items-center justify-between p-lg">
            <div>
              <p className="text-text-secondary text-sm mb-xs">Network I/O</p>
              <p className="text-3xl font-bold text-text-primary">{mockMetrics.network} MB/s</p>
              <Badge variant="success" size="sm" className="mt-sm">
                <Activity size={12} className="mr-xs" />
                Stable
              </Badge>
            </div>
            <div className="p-md bg-accent-purple/10 rounded-full">
              <Activity size={32} className="text-accent-purple" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <Card padding="lg">
          <CardHeader>
            <CardTitle>CPU & Memory Usage (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartComponent
              data={mockChartData}
              xKey="time"
              yKey="cpu"
              color="#0a84ff"
              height={250}
            />
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <CardTitle>Network Traffic (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartComponent
              data={mockChartData}
              xKey="time"
              yKey="network"
              color="#30d158"
              height={250}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
