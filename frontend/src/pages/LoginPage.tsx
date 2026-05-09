import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, GraduationCap, User, Briefcase, Sparkles, Target, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loginError, setLoginError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = '请输入用户名或邮箱';
    }

    if (!password) {
      newErrors.password = '请输入密码';
    } else if (password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!validateForm()) return;

    try {
      const result = await login(email, password);
      if (result.success && result.user) {
        const rolePath = result.user.role === 'student' ? '/student/dashboard' : '/teacher/home';
        navigate(rolePath);
      } else {
        setLoginError(result.error || '登录失败，请检查您的用户名/邮箱和密码');
      }
    } catch (error) {
      setLoginError('登录过程中发生错误，请稍后重试');
    }
  };

  return (
    <div className="min-h-screen flex ink-wash">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-200/30 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl ceramic flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-slate-700" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Aigc For Study</h1>
          </div>

          <h2 className="text-2xl font-semibold text-slate-700 mb-4">
            AI赋能学习<br />成就高效人生
          </h2>

          <p className="text-lg text-slate-500 max-w-md">
            开启您的智能学习之旅，让AI成为您的私人学习助手，制定个性化学习方案，提升学习效率。
          </p>

          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[GraduationCap, User, Briefcase, Sparkles].map((Icon, i) => (
                <div key={i} className="w-10 h-10 rounded-full ceramic flex items-center justify-center text-slate-600">
                  <Icon className="h-5 w-5" />
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-sm">
              <span className="text-slate-900 font-semibold">1000+</span> 学生正在使用
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-[#F8FAFC]">
        <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl ceramic flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-slate-700" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Aigc For Study</span>
          </div>

          <div className="ceramic p-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">欢迎回来</h2>
              <p className="text-slate-500">登录您的账户继续学习</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="邮箱 / 用户名"
                type="text"
                placeholder="请输入邮箱或用户名"
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

              {loginError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {loginError}
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-200 bg-white text-slate-600 focus:ring-slate-400"
                  />
                  <span className="text-slate-500">记住我</span>
                </label>
                <a href="#" className="text-slate-500 hover:text-slate-700 transition-colors">
                  忘记密码？
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                登录
              </Button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-slate-500">
                还没有账户？{' '}
                <Link to="/register" className="text-slate-700 hover:text-slate-900 font-medium transition-colors">
                  立即注册
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-5">
            {[
              { icon: Target, title: '智能方案', desc: 'AI生成学习计划' },
              { icon: Sparkles, title: '个性练习', desc: '定制化练习题' },
              { icon: BarChart3, title: '进度追踪', desc: '数据可视化' },
            ].map((item, i) => (
              <div key={i} className="ceramic p-5 text-center">
                <div className="w-8 h-8 mx-auto rounded-lg bg-slate-100 flex items-center justify-center mb-3">
                  <item.icon className="h-4 w-4 text-slate-600" />
                </div>
                <div className="text-sm font-medium text-slate-700">{item.title}</div>
                <div className="text-xs text-slate-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}