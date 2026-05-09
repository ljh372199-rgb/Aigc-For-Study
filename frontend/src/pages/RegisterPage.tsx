import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, User, UserCheck, UserCircle, Sparkles, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getErrorMessage(err: any): string {
  const detail = err.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(', ');
  }
  if (typeof detail === 'string') {
    return detail;
  }
  return err.message || '注册失败，请稍后重试';
}

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!username || username.length < 2) {
      newErrors.username = '用户名至少需要2个字符';
    }

    if (!email) {
      newErrors.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!password) {
      newErrors.password = '请输入密码';
    } else if (password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      await axios.post(`${API_BASE_URL}/auth/register`, { username, email, password, role });
      setSuccessMessage('注册成功！正在跳转到登录页面...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      const message = getErrorMessage(err);
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC] relative overflow-hidden ink-wash">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366f1]/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#818cf8]/6 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#4f46e5]/4 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg animate-fade-in-up">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl ceramic flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-slate-700" />
          </div>
          <span className="text-2xl font-bold text-slate-900">Aigc For Study</span>
        </div>

        <div className="ceramic p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">创建账户</h2>
            <p className="text-slate-500">开启您的智能学习之旅</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="用户名"
              type="text"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              leftIcon={<User className="h-5 w-5" />}
            />

            <Input
              label="邮箱"
              type="email"
              placeholder="请输入邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail className="h-5 w-5" />}
            />

            <Input
              label="密码"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              leftIcon={<Lock className="h-5 w-5" />}
            />

            <Input
              label="确认密码"
              type="password"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              leftIcon={<Lock className="h-5 w-5" />}
            />

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-3">
                选择您的身份
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    role === 'student'
                      ? 'ceramic border-slate-200 ring-2 ring-[#6366f1]/20'
                      : 'bg-white border border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      role === 'student' ? 'bg-indigo-50' : 'bg-slate-100'
                    }`}>
                      <UserCircle className={`h-6 w-6 ${role === 'student' ? 'text-indigo-500' : 'text-slate-500'}`} />
                    </div>
                    <span className={`font-medium ${role === 'student' ? 'text-slate-900' : 'text-slate-600'}`}>
                      学生
                    </span>
                    <span className="text-xs text-slate-500">
                      获取AI辅助学习
                    </span>
                  </div>
                  {role === 'student' && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    role === 'teacher'
                      ? 'ceramic border-slate-200 ring-2 ring-[#6366f1]/20'
                      : 'bg-white border border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      role === 'teacher' ? 'bg-indigo-50' : 'bg-slate-100'
                    }`}>
                      <UserCheck className={`h-6 w-6 ${role === 'teacher' ? 'text-indigo-500' : 'text-slate-500'}`} />
                    </div>
                    <span className={`font-medium ${role === 'teacher' ? 'text-slate-900' : 'text-slate-600'}`}>
                      教师
                    </span>
                    <span className="text-xs text-slate-500">
                      AI辅助教学管理
                    </span>
                  </div>
                  {role === 'teacher' && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            )}

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-500 text-center">{errors.submit}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              创建账户
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500">
              已有账户？{' '}
              <Link to="/login" className="text-slate-700 hover:text-slate-900 font-medium transition-colors">
                立即登录
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          注册即表示您同意我们的{' '}
          <a href="#" className="text-slate-600 hover:text-slate-700">服务条款</a>
          {' '}和{' '}
          <a href="#" className="text-slate-600 hover:text-slate-700">隐私政策</a>
        </p>
      </div>
    </div>
  );
}