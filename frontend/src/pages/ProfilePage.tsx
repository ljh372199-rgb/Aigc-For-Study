import { useState } from 'react';
import { User, Mail, Lock, Camera, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const userData = {
  username: '测试用户',
  email: 'test@example.com',
  role: 'student',
  joinDate: '2024-01-01',
  avatar: null,
};

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ username: userData.username, email: userData.email });

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">个人中心</h1>
        <p className="text-slate-500">管理您的个人信息和账户设置</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="default" className="ceramic">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">基本信息</h2>
              <Button variant={isEditing ? 'primary' : 'secondary'} size="sm" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? <CheckCircle className="h-4 w-4" /> : '编辑'}
              </Button>
            </div>
            <div className="space-y-6">
              <Input
                label="用户名"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                disabled={!isEditing}
                leftIcon={<User className="h-5 w-5" />}
              />
              <Input
                label="邮箱"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={!isEditing}
                leftIcon={<Mail className="h-5 w-5" />}
              />
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">账户类型</label>
                <Badge variant="primary">{userData.role === 'teacher' ? '教师' : '学生'}</Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">注册时间</label>
                <p className="text-slate-900">{userData.joinDate}</p>
              </div>
            </div>
          </Card>

          <Card variant="default" className="ceramic">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">修改密码</h2>
            <div className="space-y-4">
              <Input label="当前密码" type="password" placeholder="输入当前密码" leftIcon={<Lock className="h-5 w-5" />} />
              <Input label="新密码" type="password" placeholder="输入新密码" leftIcon={<Lock className="h-5 w-5" />} />
              <Input label="确认新密码" type="password" placeholder="再次输入新密码" leftIcon={<Lock className="h-5 w-5" />} />
              <Button variant="primary">更新密码</Button>
            </div>
          </Card>
        </div>

        <div>
          <Card variant="default" className="ceramic text-center">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">头像</h2>
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center text-4xl text-white font-bold">
                {userData.username.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                <Camera className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500">点击更换头像</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
