import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  AlertCircle,
  Wand2,
  Plus,
  ClipboardList,
  X,
  Eye,
  Mail,
  Calendar,
  BookOpen,
  Upload,
  Sparkles,
  FileText,
  HelpCircle,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
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
  email: string;
  className: string;
  status: 'active' | 'pending';
  createdAt?: string;
}

export function TeacherControlCenter() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showClassCodeModal, setShowClassCodeModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  const [showLargeStudentListModal, setShowLargeStudentListModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [form, setForm] = useState({ className: '', classDescription: '' });

  const fetchClasses = async () => {
    try {
      const response = await classApi.getAll();
      setClasses(response.data);
      if (response.data.length > 0 && !selectedClass) {
        setSelectedClass(response.data[0]);
      }
    } catch (error) {
      console.error('获取班级列表失败:', error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const mockStudents: Student[] = [];
      setStudents(mockStudents);
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

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

  const openClassCodeModal = (cls: Class) => {
    setSelectedClass(cls);
    setShowClassCodeModal(true);
  };

  const handleCopyCode = () => {
    if (selectedClass) {
      navigator.clipboard.writeText(selectedClass.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewStudentDetail = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentDetailModal(true);
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <Card variant="default" className="ceramic h-[calc(100vh-320px)] flex flex-col">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-900">班级管理</h2>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setShowClassModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                创建班级
              </Button>
            </div>
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
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
                      <p className="text-xs text-slate-500 mt-1">{cls.studentCount && cls.studentCount > 0 ? `当前有 ${cls.studentCount} 名学生` : '当前还没有学生'}</p>
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

        <div>
          <Card variant="default" className="ceramic h-[calc(100vh-320px)] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedClass ? `${selectedClass.name} - 学生列表` : '所有学生'}
                </h2>
                {selectedClass && (
                  <Badge variant="primary">{selectedClass.studentCount || 0} 人</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedClass && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => openClassCodeModal(selectedClass)}>
                      <ClipboardList className="h-4 w-4 mr-1" />
                      邀请学生
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowLargeStudentListModal(true)}>
                      <Eye className="h-4 w-4 mr-1" />
                      全屏查看
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {filteredStudents.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-slate-50/50 sticky top-0">
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
                          <Button variant="secondary" size="sm" onClick={() => handleViewStudentDetail(student)}>
                            <Eye className="h-4 w-4 mr-1" />
                            详情
                          </Button>
                          {student.status === 'pending' && (
                            <Button variant="primary" size="sm" className="ml-2">
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

      <Modal isOpen={showClassCodeModal} onClose={() => setShowClassCodeModal(false)} title="邀请学生" size="lg">
        {selectedClass && (
          <div className="space-y-4">
            <div className="bg-indigo-50 rounded-xl p-6 text-center">
              <p className="text-sm text-slate-500 mb-2">班级邀请码</p>
              <p className="text-3xl font-bold text-indigo-600 mb-2">{selectedClass.invite_code}</p>
              <p className="text-sm text-slate-500">学生可使用此邀请码加入班级 {selectedClass.name}</p>
              <Button variant="primary" size="sm" className="mt-4" onClick={handleCopyCode}>
                {copied ? '已复制!' : '复制邀请码'}
              </Button>
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
                <li>1. 学生注册账号时输入邀请码加入班级</li>
                <li>2. 或通过邀请链接直接注册并加入班级</li>
                <li>3. 注册后也可在"我的班级"页面输入邀请码加入</li>
              </ul>
            </div>
            <Button variant="primary" className="w-full" onClick={() => setShowClassCodeModal(false)}>
              关闭
            </Button>
          </div>
        )}
      </Modal>

      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="批量导入学生" size="lg">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">拖拽 Excel 文件到此处上传</p>
            <p className="text-xs text-slate-400 mt-1">支持 .xlsx, .xls 格式</p>
          </div>
          <Button variant="primary" className="w-full">
            选择文件
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showStudentDetailModal} onClose={() => setShowStudentDetailModal(false)} title="学生详情" size="md">
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xl font-bold">
                {selectedStudent.name[0]}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{selectedStudent.name}</h3>
                <Badge variant={selectedStudent.status === 'active' ? 'success' : 'warning'}>
                  {selectedStudent.status === 'active' ? '已激活' : '待审核'}
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">{selectedStudent.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">{selectedStudent.className}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">{selectedStudent.createdAt || '未知'}</span>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                学习进度
              </h4>
              <p className="text-sm text-slate-500">暂无学习数据</p>
            </div>
            <div className="flex gap-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowStudentDetailModal(false)}>关闭</Button>
              {selectedStudent.status === 'pending' && (
                <Button variant="primary" className="flex-1">通过审核</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showLargeStudentListModal} onClose={() => setShowLargeStudentListModal(false)} title={`${selectedClass?.name || '所有学生'} - 学生列表`} size="xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="primary">{filteredStudents.length} 名学生</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm">导出列表</Button>
              <Button variant="primary" size="sm" onClick={() => setShowInviteModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                批量导入
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
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
                      <Button variant="secondary" size="sm" onClick={() => { handleViewStudentDetail(student); setShowLargeStudentListModal(false); }}>
                        <Eye className="h-4 w-4 mr-1" />
                        详情
                      </Button>
                      {student.status === 'pending' && (
                        <Button variant="primary" size="sm" className="ml-2">
                          通过审核
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="flex items-center justify-center py-12 text-slate-500">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-slate-400" />
                  </div>
                  <p>暂无学生数据</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <div>
        {copilotOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-300"
              onClick={() => setCopilotOpen(false)}
            />
            <div className="fixed bottom-6 right-6 z-50">
              <div className="w-80 ceramic p-4 shadow-2xl rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-500" />
                    <span className="font-medium text-slate-900">智能助手</span>
                  </div>
                  <button
                    onClick={() => setCopilotOpen(false)}
                    className="p-1 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
                <div className="space-y-3">
                  <Button variant="secondary" className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    生成教案
                  </Button>
                  <Button variant="secondary" className="w-full justify-start gap-2">
                    <HelpCircle className="h-4 w-4" />
                    问题解答
                  </Button>
                  <Button variant="secondary" className="w-full justify-start gap-2">
                    <BarChart3 className="h-4 w-4" />
                    数据分析
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
