import { useState } from 'react';
import { FileText, Plus, Edit, Trash2, Clock, User, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface Ticket {
  id: string;
  task_name: string;
  hours: number;
  class_name: string;
  student_name: string;
  group_members: string;
  tools: string;
  learning_location: string;
  date: string;
  task_requirement: string;
  task_objective: string;
  reference_materials: string;
  plan_decision: string;
  created_at: string;
}

export function TeacherTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    task_name: '',
    hours: '',
    class_name: '',
    student_name: '',
    group_members: '',
    tools: '',
    learning_location: '',
    date: '',
    task_requirement: '',
    task_objective: '',
    reference_materials: '',
    plan_decision: '',
  });

  const handleCreate = () => {
    const newTicket: Ticket = {
      id: Date.now().toString(),
      ...form,
      hours: parseInt(form.hours) || 2,
      created_at: new Date().toISOString().split('T')[0],
    };
    setTickets([newTicket, ...tickets]);
    setShowCreateModal(false);
    setForm({
      task_name: '',
      hours: '',
      class_name: '',
      student_name: '',
      group_members: '',
      tools: '',
      learning_location: '',
      date: '',
      task_requirement: '',
      task_objective: '',
      reference_materials: '',
      plan_decision: '',
    });
  };

  const handleUpdate = () => {
    if (!selectedTicket) return;
    setTickets(tickets.map(t => 
      t.id === selectedTicket.id 
        ? { ...t, ...form, hours: parseInt(form.hours) || 2 }
        : t
    ));
    setShowDetailModal(false);
    setSelectedTicket(null);
    setForm({
      task_name: '',
      hours: '',
      class_name: '',
      student_name: '',
      group_members: '',
      tools: '',
      learning_location: '',
      date: '',
      task_requirement: '',
      task_objective: '',
      reference_materials: '',
      plan_decision: '',
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除这个工单吗？')) return;
    setTickets(tickets.filter(t => t.id !== id));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setForm({
      ...form,
      tools: '文心一言、KIMI',
      learning_location: '实训机房',
      task_requirement: '使用 Anaconda 和 PyCharm 搭建 Python 开发环境，并完成编程环境配置与深度学习框架整合。',
      task_objective: '1. 掌握 Anaconda、PyCharm 的安装与配置，学会创建 Python 项目并验证程序运行结果，深入理解环境搭建与框架部署的核心技术。\n\n2. 独立搭建完整的 Python 开发环境，还能熟练配置深度学习工具链，为后续人工智能项目开发夯实基础',
      reference_materials: 'Python语言；Python编程工具；Python扩展库\n\nPython编程环境安装；Python深度学习框架配置；Python编程测试',
      plan_decision: '1. 分段演示：\n\n• 使用录屏软件分步演示安装过程（0.5倍速）\n\n• 重点标注：\n\n- Anaconda PATH配置选项\n\n- PyCharm解释器选择界面\n\n2. 分组指导：\n\n• 将学生按3人分组，每组配备：\n\n- Windows/macOS操作指南\n\n- 常见错误代码手册\n\n3. 实时答疑：\n\n• 使用电子教室软件监控进度\n\n• 对共性问题进行广播指导',
    });
    setGenerating(false);
  };

  const openDetailModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setForm({
      task_name: ticket.task_name,
      hours: ticket.hours.toString(),
      class_name: ticket.class_name,
      student_name: ticket.student_name,
      group_members: ticket.group_members,
      tools: ticket.tools,
      learning_location: ticket.learning_location,
      date: ticket.date,
      task_requirement: ticket.task_requirement,
      task_objective: ticket.task_objective,
      reference_materials: ticket.reference_materials,
      plan_decision: ticket.plan_decision,
    });
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-zinc-900 mb-2">任务工单管理</h1>
          <p className="text-zinc-500">管理和创建教学任务工单</p>
        </div>
        <Button variant="ios" size="lg" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          创建工单
        </Button>
      </div>

      {tickets.length === 0 ? (
        <Card className="p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-zinc-50 mx-auto mb-6 flex items-center justify-center">
            <FileText className="h-10 w-10 text-zinc-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 mb-2">暂无工单</h3>
          <p className="text-zinc-500 mb-6">点击上方按钮创建您的第一个任务工单</p>
          <Button variant="ios" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
            创建工单
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="group hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4 px-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 line-clamp-1">{ticket.task_name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" strokeWidth={1.5} />
                        {ticket.hours} 学时
                      </span>
                      <span>{ticket.class_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4 px-4">
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <User className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                  <span>{ticket.student_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <BookOpen className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                  <span className="line-clamp-2">{ticket.task_requirement}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 pb-4">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => openDetailModal(ticket)}>
                  <Edit className="h-4 w-4 mr-1" strokeWidth={1.5} />
                  编辑
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(ticket.id)}>
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
        title="创建任务工单"
        size="xl"
      >
        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">任务名称</label>
              <Input
                value={form.task_name}
                onChange={(e) => setForm({ ...form, task_name: e.target.value })}
                placeholder="如：安装 Python 编程环境"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">学时</label>
              <Input
                type="number"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                placeholder="2"
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">班级</label>
              <Input
                value={form.class_name}
                onChange={(e) => setForm({ ...form, class_name: e.target.value })}
                placeholder="如：高一(1)班"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">学生姓名</label>
              <Input
                value={form.student_name}
                onChange={(e) => setForm({ ...form, student_name: e.target.value })}
                placeholder="学生姓名"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">小组成员</label>
              <Input
                value={form.group_members}
                onChange={(e) => setForm({ ...form, group_members: e.target.value })}
                placeholder="成员姓名，用逗号分隔"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">使用工具</label>
              <Input
                value={form.tools}
                onChange={(e) => setForm({ ...form, tools: e.target.value })}
                placeholder="如：文心一言、KIMI"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">学习场地</label>
              <Input
                value={form.learning_location}
                onChange={(e) => setForm({ ...form, learning_location: e.target.value })}
                placeholder="如：实训机房"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">日期</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 mb-2 block">任务需求</label>
            <Textarea
              value={form.task_requirement}
              onChange={(e) => setForm({ ...form, task_requirement: e.target.value })}
              placeholder="描述任务的具体要求..."
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 mb-2 block">任务目的</label>
            <Textarea
              value={form.task_objective}
              onChange={(e) => setForm({ ...form, task_objective: e.target.value })}
              placeholder="描述任务的教学目标..."
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 mb-2 block">查阅资料</label>
            <Textarea
              value={form.reference_materials}
              onChange={(e) => setForm({ ...form, reference_materials: e.target.value })}
              placeholder="列出相关参考资料..."
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-zinc-700">计划与决策</label>
              <Button
                variant="ios"
                size="sm"
                onClick={handleGenerate}
                disabled={generating}
              >
                <Sparkles className="h-4 w-4 mr-2" strokeWidth={1.5} />
                {generating ? '生成中...' : 'AI生成'}
              </Button>
            </div>
            <Textarea
              value={form.plan_decision}
              onChange={(e) => setForm({ ...form, plan_decision: e.target.value })}
              placeholder="描述教学计划和决策..."
              rows={6}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCreateModal(false)}>
              取消
            </Button>
            <Button variant="ios" className="flex-1" onClick={handleCreate}>
              创建
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedTicket(null); }}
        title="工单详情"
        size="xl"
      >
        {selectedTicket && (
          <div className="space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">{selectedTicket.task_name}</h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-zinc-500">
                  <span>{selectedTicket.hours} 学时</span>
                  <span>{selectedTicket.class_name}</span>
                  <span>{selectedTicket.date}</span>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(selectedTicket.id)}
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                删除
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-zinc-50 rounded-xl p-4">
                <div className="text-sm font-medium text-zinc-700 mb-2">学生信息</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                    <span className="text-sm text-zinc-600">{selectedTicket.student_name}</span>
                  </div>
                  <div className="text-sm text-zinc-600">
                    <span className="text-zinc-400">小组成员：</span>{selectedTicket.group_members}
                  </div>
                </div>
              </div>
              <div className="bg-zinc-50 rounded-xl p-4">
                <div className="text-sm font-medium text-zinc-700 mb-2">学习环境</div>
                <div className="space-y-2">
                  <div className="text-sm text-zinc-600">
                    <span className="text-zinc-400">使用工具：</span>{selectedTicket.tools}
                  </div>
                  <div className="text-sm text-zinc-600">
                    <span className="text-zinc-400">学习场地：</span>{selectedTicket.learning_location}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 rounded-xl p-4">
              <div className="text-sm font-medium text-zinc-700 mb-2">任务需求</div>
              <p className="text-zinc-600 whitespace-pre-wrap">{selectedTicket.task_requirement}</p>
            </div>

            <div className="bg-zinc-50 rounded-xl p-4">
              <div className="text-sm font-medium text-zinc-700 mb-2">任务目的</div>
              <p className="text-zinc-600 whitespace-pre-wrap">{selectedTicket.task_objective}</p>
            </div>

            <div className="bg-zinc-50 rounded-xl p-4">
              <div className="text-sm font-medium text-zinc-700 mb-2">查阅资料</div>
              <p className="text-zinc-600 whitespace-pre-wrap">{selectedTicket.reference_materials}</p>
            </div>

            <div className="bg-zinc-50 rounded-xl p-4">
              <div className="text-sm font-medium text-zinc-700 mb-2">计划与决策</div>
              <p className="text-zinc-600 whitespace-pre-wrap">{selectedTicket.plan_decision}</p>
            </div>

            <div className="border-t border-zinc-200 pt-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-zinc-700 mb-2 block">任务名称</label>
                  <Input
                    value={form.task_name}
                    onChange={(e) => setForm({ ...form, task_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 mb-2 block">学时</label>
                  <Input
                    type="number"
                    value={form.hours}
                    onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 mb-2 block">班级</label>
                  <Input
                    value={form.class_name}
                    onChange={(e) => setForm({ ...form, class_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <Button variant="secondary" className="flex-1" onClick={() => { setShowDetailModal(false); setSelectedTicket(null); }}>
                  取消
                </Button>
                <Button variant="ios" className="flex-1" onClick={handleUpdate}>
                  保存修改
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}