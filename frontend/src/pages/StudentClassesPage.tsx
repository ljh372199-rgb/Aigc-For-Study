import { useState, useEffect } from 'react';
import { Users, Plus, Search, Building2, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
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

export function StudentClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMyClasses = async () => {
    try {
      const response = await classApi.getAll();
      setClasses(response.data);
    } catch (err) {
      console.error('获取班级列表失败:', err);
    }
  };

  useEffect(() => {
    fetchMyClasses();
  }, []);

  const handleJoinClass = async () => {
    if (!inviteCode.trim()) {
      setError('请输入邀请码');
      return;
    }

    setLoading(true);
    try {
      await classApi.join(inviteCode.toUpperCase());
      setSuccess('成功加入班级！');
      setInviteCode('');
      setError('');
      await fetchMyClasses();
      setTimeout(() => {
        setShowJoinModal(false);
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      const message = err.response?.data?.detail || '加入班级失败';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveClass = async (classId: string) => {
    if (!confirm('确定要退出该班级吗？')) return;
    try {
      await classApi.delete(classId);
      setClasses(classes.filter(c => c.id !== classId));
    } catch (err) {
      console.error('退出班级失败:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-6 lg:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">我的班级</h1>
          <p className="text-slate-500">查看和管理已加入的班级</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowJoinModal(true)}>
          <Plus className="h-5 w-5" />
          加入班级
        </Button>
      </div>

      {classes.length === 0 ? (
        <Card variant="default" className="ceramic text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 mx-auto mb-6 flex items-center justify-center">
            <Building2 className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">暂无加入的班级</h3>
          <p className="text-slate-500 mb-6">点击上方按钮输入邀请码加入班级</p>
          <Button variant="primary" onClick={() => setShowJoinModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            加入班级
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card key={cls.id} variant="default" className="ceramic overflow-hidden p-0">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="success">{cls.status === 'active' ? '已加入' : cls.status}</Badge>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{cls.name}</h3>
                {cls.description && <p className="text-sm text-slate-500 mb-4">{cls.description}</p>}
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  {cls.studentCount !== undefined && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{cls.studentCount} 名学生</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <code className="text-xs text-slate-400">邀请码：{cls.invite_code}</code>
                <Button variant="ghost" size="sm" onClick={() => handleLeaveClass(cls.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showJoinModal} onClose={() => { setShowJoinModal(false); setInviteCode(''); setError(''); }} title="加入班级" size="lg">
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 mx-auto mb-4 flex items-center justify-center">
              <Search className="h-8 w-8 text-indigo-500" />
            </div>
            <p className="text-slate-600">请输入班级邀请码</p>
          </div>
          <Input
            label="邀请码"
            placeholder="请输入8位邀请码"
            value={inviteCode}
            onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setError(''); }}
            maxLength={8}
            className="text-center text-xl tracking-widest font-mono"
          />
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <X className="h-4 w-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-emerald-500 text-sm">
              <Check className="h-4 w-4" />
              {success}
            </div>
          )}
          <div className="flex gap-4 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => { setShowJoinModal(false); setInviteCode(''); setError(''); }} disabled={loading}>
              取消
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleJoinClass} loading={loading}>
              加入
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}