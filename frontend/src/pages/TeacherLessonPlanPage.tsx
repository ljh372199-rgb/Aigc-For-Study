import { useState } from 'react';
import { FileText, Plus, Edit, Trash2, Clock, BookOpen, Target, ChevronRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: string;
  objectives: string;
  content: string;
  teaching_method: string;
  created_at: string;
  status: 'draft' | 'published';
}

export function TeacherLessonPlanPage() {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    subject: '',
    grade: '',
    duration: '',
    objectives: '',
    content: '',
    teaching_method: '',
  });

  const handleCreate = () => {
    const newPlan: LessonPlan = {
      id: Date.now().toString(),
      ...form,
      created_at: new Date().toISOString().split('T')[0],
      status: 'draft',
    };
    setLessonPlans([...lessonPlans, newPlan]);
    setShowCreateModal(false);
    setForm({ title: '', subject: '', grade: '', duration: '', objectives: '', content: '', teaching_method: '' });
  };

  const handleUpdate = () => {
    if (!editingPlan) return;
    setLessonPlans(lessonPlans.map(p => p.id === editingPlan.id ? { ...p, ...form, status: 'draft' as const } : p));
    setShowEditModal(false);
    setEditingPlan(null);
    setForm({ title: '', subject: '', grade: '', duration: '', objectives: '', content: '', teaching_method: '' });
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除这个教案吗？')) return;
    setLessonPlans(lessonPlans.filter(p => p.id !== id));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setForm({
      ...form,
      objectives: '通过本节课学习，学生将能够：\n1. 理解核心概念\n2. 掌握基本技能\n3. 应用知识解决实际问题',
      content: '【教学环节】\n\n一、导入（5分钟）\n- 展示相关案例\n- 引发学生兴趣\n\n二、知识讲解（20分钟）\n- 核心概念讲解\n- 重点难点分析\n\n三、实践操作（15分钟）\n- 分组活动\n- 动手实践\n\n四、总结（5分钟）\n- 课堂总结\n- 作业布置',
      teaching_method: '启发式教学+小组协作',
    });
    setGenerating(false);
  };

  const openEditModal = (plan: LessonPlan) => {
    setEditingPlan(plan);
    setForm({
      title: plan.title,
      subject: plan.subject,
      grade: plan.grade,
      duration: plan.duration,
      objectives: plan.objectives,
      content: plan.content,
      teaching_method: plan.teaching_method,
    });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-zinc-900 mb-2">教案设计</h1>
          <p className="text-zinc-500">设计和管理您的教学方案</p>
        </div>
        <Button variant="ios" size="lg" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          创建教案
        </Button>
      </div>

      {lessonPlans.length === 0 ? (
        <Card className="p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-zinc-50 mx-auto mb-6 flex items-center justify-center">
            <FileText className="h-10 w-10 text-zinc-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 mb-2">暂无教案</h3>
          <p className="text-zinc-500 mb-6">点击上方按钮创建您的第一个教案</p>
          <Button variant="ios" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
            创建教案
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessonPlans.map((plan) => (
            <Card key={plan.id} className="overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4 px-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">{plan.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={plan.status === 'published' ? 'success' : 'default'}>
                        {plan.status === 'published' ? '已发布' : '草稿'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4 px-4">
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <BookOpen className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                  <span>{plan.subject} - {plan.grade}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Clock className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                  <span>{plan.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Target className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                  <span className="line-clamp-2">{plan.objectives}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 pb-4">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEditModal(plan)}>
                  <Edit className="h-4 w-4" strokeWidth={1.5} />
                  编辑
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(plan.id)}>
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </Button>
                <Button variant="secondary" size="sm">
                  <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建教案"
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">教案标题</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="请输入教案标题"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">学科</label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="如：信息技术"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">年级</label>
              <Input
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                placeholder="如：高一"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">课时时长</label>
              <Input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="如：45分钟"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-2 block">教学目标</label>
            <Textarea
              value={form.objectives}
              onChange={(e) => setForm({ ...form, objectives: e.target.value })}
              placeholder="请输入教学目标"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-2 block">教学方法</label>
            <Input
              value={form.teaching_method}
              onChange={(e) => setForm({ ...form, teaching_method: e.target.value })}
              placeholder="如：讲授+实践"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-zinc-700">教学内容</label>
              <Button
                variant="ios"
                size="sm"
                onClick={handleGenerate}
                disabled={!form.title || generating}
              >
                <Sparkles className="h-4 w-4 mr-2" strokeWidth={1.5} />
                {generating ? '生成中...' : 'AI生成'}
              </Button>
            </div>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="请输入教学内容"
              rows={8}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCreateModal(false)}>
              取消
            </Button>
            <Button variant="ios" className="flex-1" onClick={handleCreate}>
              保存
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingPlan(null); }}
        title="编辑教案"
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">教案标题</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="请输入教案标题"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">学科</label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="如：信息技术"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">年级</label>
              <Input
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                placeholder="如：高一"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">课时时长</label>
              <Input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="如：45分钟"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-2 block">教学目标</label>
            <Textarea
              value={form.objectives}
              onChange={(e) => setForm({ ...form, objectives: e.target.value })}
              placeholder="请输入教学目标"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-2 block">教学方法</label>
            <Input
              value={form.teaching_method}
              onChange={(e) => setForm({ ...form, teaching_method: e.target.value })}
              placeholder="如：讲授+实践"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-2 block">教学内容</label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="请输入教学内容"
              rows={8}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => { setShowEditModal(false); setEditingPlan(null); }}>
              取消
            </Button>
            <Button variant="ios" className="flex-1" onClick={handleUpdate}>
              更新
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}