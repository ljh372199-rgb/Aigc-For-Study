import { useState, useEffect } from 'react';
import {
  Users, AlertCircle, X, Sparkles, Wand2, Plus, Copy, Check, Building2, ClipboardList
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { classApi } from '@/services/api';

interface Class {
  id: string;
  name: string;
  description?: string;
  teacher_id: string;
  invite_code: string;
  status: string;
  created_at: string;
  updated_at: string;
  studentCount?: number;
}

interface Student {
  id: string;
  name: string;
  className: string;
  email: string;
  status: 'active' | 'pending';
}

export function TeacherControlCenter() {
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showClassCodeModal, setShowClassCodeModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);

  const [students] = useState<Student[]>([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const [form, setForm] = useState({
    className: '',
    classDescription: '',
  });

  const fetchClasses = async () => {
    try {
      const response = await classApi.getAll();
      const classesWithCount = await Promise.all(
        response.data.map(async (cls: Class) => {
          try {
            const studentsRes = await classApi.getStudents(cls.id);
            return { ...cls, studentCount: studentsRes.data.length || 0 };
          } catch {
            return { ...cls, studentCount: 0 };
          }
        })
      );
      setClasses(classesWithCount);
    } catch (error) {
      console.error('获取班级列表失败:', error);
    }
  };

  const handleCreateClass = async () => {
    setLoading(true);
    try {
      const response = await classApi.create({
        name: form.className || '新班级',
        description: form.classDescription,
      });
      setClasses([response.data, ...classes]);
      setShowClassModal(false);
      setForm({ className: '', classDescription: '' });
    } catch (error) {
      console.error('创建班级失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (selectedClass) {
      navigator.clipboard.writeText(selectedClass.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openClassCodeModal = (cls: Class) => {
    setSelectedClass(cls);
    setShowClassCodeModal(true);
  };

  const filteredStudents = selectedClass 
    ? students.filter(s => s.className === selectedClass.name)
    : students;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">学生管理</h1>
        <p className="text-slate-500">管理班级和学生信息</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" className="ceramic">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">班级总数</p>
              <p className="text-3xl font-bold text-slate-900">{classes.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-indigo-500" />
            </div>
          </div>
        </Card>

        <Card variant="default" className="ceramic">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">学生总数</p>
              <p className="text-3xl font-bold text-slate-900">{students.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </Card>

        <Card variant="default" className="ceramic">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">待审核</p>
              <p className="text-3xl font-bold text-amber-500">
                {students.filter(s => s.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </Card>

        <Card variant="default" className="ceramic">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">活跃学生</p>
              <p className="text-3xl font-bold text-green-500">
                {students.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <Wand2 className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <Card variant="default" className="ceramic">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-900">班级管理</h2>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setShowClassModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                创建班级
              </Button>
            </div>
            <div className="space-y-3">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedClass?.id === cls.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedClass(selectedClass?.id === cls.id ? null : cls)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{cls.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{cls.studentCount} 名学生</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openClassCodeModal(cls); }}>
                      <ClipboardList className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {classes.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Building2 className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">暂无班级</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="xl:col-span-2">
          <Card variant="default" className="ceramic overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedClass ? `${selectedClass.name} - 学生列表` : '所有学生'}
                </h2>
                {selectedClass && (
                  <Badge variant="primary">{selectedClass.studentCount} 人</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedClass && (
                  <Button variant="secondary" size="sm" onClick={() => openClassCodeModal(selectedClass)}>
                    <ClipboardList className="h-4 w-4 mr-1" />
                    邀请学生
                  </Button>
                )}
                <Button variant="primary" size="sm" onClick={() => setShowInviteModal(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  批量导入
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              {filteredStudents.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">姓名</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">班级</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">邮箱</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm font-medium">
                              {student.name[0]}
                            </div>
                            <span className="text-sm font-medium text-slate-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{student.className}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{student.email}</td>
                        <td className="px-6 py-4">
                          <Badge variant={student.status === 'active' ? 'success' : 'warning'}>
                            {student.status === 'active' ? '已激活' : '待审核'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {student.status === 'pending' && (
                            <Button variant="primary" size="sm">
                              通过审核
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex items-center justify-center py-12 text-slate-500">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-8 w-8 text-slate-400" />
                    </div>
                    <p>{selectedClass ? '该班级暂无学生' : '暂无学生数据'}</p>
                    {selectedClass && (
                      <Button variant="secondary" size="sm" className="mt-4" onClick={() => openClassCodeModal(selectedClass)}>
                        <ClipboardList className="h-4 w-4 mr-1" />
                        生成邀请码
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={showClassModal} onClose={() => setShowClassModal(false)} title="创建班级" size="lg">
        <div className="space-y-4">
          <Input
            label="班级名称"
            placeholder="如：高一(1)班"
            value={form.className}
            onChange={(e) => setForm({ ...form, className: e.target.value })}
          />
          <Textarea
            label="班级描述（可选）"
            placeholder="描述班级特点..."
            rows={3}
            value={form.classDescription}
            onChange={(e) => setForm({ ...form, classDescription: e.target.value })}
          />
          <div className="flex gap-4 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowClassModal(false)} disabled={loading}>取消</Button>
            <Button variant="primary" className="flex-1" onClick={handleCreateClass} loading={loading}>创建</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="批量导入学生" size="lg">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 mb-2">上传 CSV 文件导入学生</p>
            <p className="text-sm text-slate-400">支持 .csv 格式文件</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm font-medium text-slate-700 mb-2">CSV 格式说明：</p>
            <p className="text-xs text-slate-500">姓名,邮箱,班级名称</p>
            <p className="text-xs text-slate-400 mt-1">例如：张三,zhangsan@example.com,高一(1)班</p>
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowInviteModal(false)}>取消</Button>
            <Button variant="primary" className="flex-1">上传文件</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showClassCodeModal} onClose={() => setShowClassCodeModal(false)} title="邀请学生" size="lg">
        {selectedClass && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 text-center">
              <p className="text-sm text-slate-600 mb-4">班级邀请码</p>
              <div className="flex items-center justify-center gap-3 mb-4">
                <code className="text-3xl font-bold text-indigo-600 tracking-widest">
                  {selectedClass.invite_code}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyCode}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? '已复制' : '复制'}
                </Button>
              </div>
              <p className="text-sm text-slate-500">学生可使用此邀请码加入班级 {selectedClass.name}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm font-medium text-slate-700 mb-2">邀请链接</p>
              <p className="text-sm text-slate-500 break-all">
                http://localhost:5173/register?code={selectedClass.invite_code}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm font-medium text-slate-700 mb-2">使用说明：</p>
              <ul className="text-xs text-slate-500 space-y-1">
                <li>1. 学生注册账号时输入邀请码</li>
                <li>2. 或通过邀请链接直接注册</li>
                <li>3. 注册后自动加入该班级</li>
              </ul>
            </div>
            <Button variant="primary" className="w-full" onClick={() => setShowClassCodeModal(false)}>
              关闭
            </Button>
          </div>
        )}
      </Modal>

      <div>
        {copilotOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-300"
              onClick={() => setCopilotOpen(false)}
            />
            <div
              className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">AI 批改助手</h2>
                    <p className="text-sm text-slate-500">智能辅助作业批改</p>
                  </div>
                </div>
                <button
                  onClick={() => setCopilotOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">选择一个作业提交以使用 AI 批改功能</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Wand2 className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-semibold text-indigo-900">AI 分析结果</span>
                    </div>
                    <p className="text-sm text-slate-600">选择作业后，AI 将分析学生提交内容并提供批改建议</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => setCopilotOpen(false)}>
                    取消
                  </Button>
                  <Button variant="primary" className="flex-1" disabled>
                    选择作业
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}