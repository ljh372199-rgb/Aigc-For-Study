import { useState } from 'react';
import { Plus, Users, Trash2, Edit3 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  submissions: number;
  total: number;
  status: 'active' | 'completed';
}

export function TeacherAssignmentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    score: '',
    deadline: '',
  });

  const handleSubmit = () => {
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      title: form.title,
      subject: form.subject,
      deadline: form.deadline,
      submissions: 0,
      total: 50,
      status: 'active',
    };
    setAssignments([newAssignment, ...assignments]);
    setShowModal(false);
    setForm({ title: '', description: '', subject: '', score: '', deadline: '' });
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除这个作业吗？')) return;
    setAssignments(assignments.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-zinc-900 mb-2">作业管理</h1>
          <p className="text-zinc-500">发布和管理学生作业</p>
        </div>
        <Button variant="ios" size="lg" onClick={() => setShowModal(true)}>
          <Plus className="h-5 w-5" strokeWidth={1.5} />
          发布作业
        </Button>
      </div>

      {assignments.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 rounded-xl bg-zinc-50 mx-auto mb-6 flex items-center justify-center">
            <Users className="h-8 w-8 text-zinc-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 mb-2">暂无作业</h3>
          <p className="text-zinc-500 mb-6">点击上方按钮发布您的第一个作业</p>
          <Button variant="ios" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
            发布作业
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-600">作业标题</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-600">科目</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-600">截止日期</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-600">提交情况</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-600">状态</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-zinc-900 font-medium">{assignment.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="default">{assignment.subject}</Badge>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{assignment.deadline}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${(assignment.submissions / assignment.total) * 100}%` }} />
                      </div>
                      <span className="text-sm text-zinc-500">{assignment.submissions}/{assignment.total}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={assignment.status === 'active' ? 'success' : 'default'}>
                      {assignment.status === 'active' ? '进行中' : '已结束'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all" title="批改">
                        <Users className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                      <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all" title="编辑">
                        <Edit3 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                      <button className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" onClick={() => handleDelete(assignment.id)} title="删除">
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="发布作业" size="lg">
        <div className="space-y-6">
          <Input 
            label="作业标题" 
            placeholder="例如：JavaScript 基础练习题"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-2">作业描述</label>
            <textarea 
              className="w-full bg-white border border-zinc-100 rounded-lg px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:ring-1 focus:ring-zinc-300 focus:border-zinc-300 outline-none transition-all resize-none" 
              rows={3} 
              placeholder="描述作业要求..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="科目" 
              placeholder="例如：前端开发"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <Input 
              label="满分" 
              type="number" 
              placeholder="100"
              value={form.score}
              onChange={(e) => setForm({ ...form, score: e.target.value })}
            />
          </div>
          <Input 
            label="截止日期" 
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
          <div className="flex gap-4 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>取消</Button>
            <Button variant="ios" className="flex-1" onClick={handleSubmit}>发布</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}