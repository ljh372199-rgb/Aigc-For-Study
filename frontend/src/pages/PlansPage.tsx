import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, Calendar, Target, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { planApi } from '@/services/api';

type FilterType = 'all' | 'active' | 'draft' | 'completed';

interface Plan {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'active' | 'draft' | 'completed';
  tasksCount: number;
  completedTasks: number;
  startDate: string;
  endDate: string;
  subject: string;
}

export function PlansPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [plans] = useState<Plan[]>([]);

  const filteredPlans = filter === 'all'
    ? plans
    : plans.filter((p) => p.status === filter);

  const handleCreate = async () => {
    if (!createForm.title) return;
    setCreating(true);
    try {
      await planApi.create({
        title: createForm.title,
        description: createForm.description,
        start_date: createForm.startDate,
        end_date: createForm.endDate,
      });
      setShowCreateModal(false);
      setCreateForm({ title: '', description: '', startDate: '', endDate: '' });
    } catch (error) {
      console.error('创建方案失败:', error);
    } finally {
      setCreating(false);
    }
  };

  const filterButtons: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: plans.length },
    { key: 'active', label: '进行中', count: plans.filter((p) => p.status === 'active').length },
    { key: 'draft', label: '未开始', count: plans.filter((p) => p.status === 'draft').length },
    { key: 'completed', label: '已完成', count: plans.filter((p) => p.status === 'completed').length },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">学习方案</h1>
          <p className="text-slate-500">管理和追踪您的学习计划</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-5 w-5" />
          创建方案
        </Button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {filterButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === btn.key
                ? 'bg-indigo-500 text-white'
                : 'ceramic text-slate-500 hover:text-slate-900'
            }`}
          >
            {btn.label} ({btn.count})
          </button>
        ))}
      </div>

      {filteredPlans.length === 0 ? (
        <Card variant="default" className="ceramic text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 mx-auto mb-4 flex items-center justify-center">
            <Target className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">暂无学习方案</h3>
          <p className="text-slate-500 mb-6">创建您的第一个学习方案，开启智能学习之旅</p>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-5 w-5" />
            创建方案
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredPlans.map((plan) => (
            <Link key={plan.id} to={`/plans/${plan.id}`}>
              <Card variant="interactive" className="ceramic h-full group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={plan.subject === '前端开发' ? 'primary' : plan.subject === 'AI' ? 'warning' : 'default'}>
                        {plan.subject}
                      </Badge>
                      <Badge variant={
                        plan.status === 'active' ? 'success' :
                        plan.status === 'draft' ? 'default' : 'primary'
                      }>
                        {plan.status === 'active' ? '进行中' : plan.status === 'draft' ? '未开始' : '已完成'}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                      {plan.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {plan.description}
                    </p>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-500">学习进度</span>
                    <span className="text-slate-900 font-medium">{plan.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        plan.status === 'completed'
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                      }`}
                      style={{ width: `${plan.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>{plan.tasksCount} 任务</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{plan.startDate.split('-').slice(1).join('/')} - {plan.endDate.split('-').slice(1).join('/')}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    已完成 {plan.completedTasks}/{plan.tasksCount} 个任务
                  </span>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建学习方案"
        size="lg"
      >
        <div className="space-y-6">
          <Input
            label="方案名称"
            placeholder="例如：前端工程师学习路径"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">方案描述</label>
            <textarea
              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-black placeholder-zinc-400 focus:outline-none focus:ring-zinc-900 focus:border-transparent"
              rows={3}
              placeholder="描述您的学习目标..."
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            />
          </div>
          <div className="flex gap-4">
            <Input
              label="开始日期"
              type="date"
              className="flex-1"
              value={createForm.startDate}
              onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
            />
            <Input
              label="结束日期"
              type="date"
              className="flex-1"
              value={createForm.endDate}
              onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowCreateModal(false)}
            >
              取消
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleCreate}
              disabled={creating || !createForm.title}
            >
              {creating ? '创建中...' : '创建方案'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
