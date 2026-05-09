import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function RootLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError('请填写用户名/邮箱和密码');
      return;
    }

    setLoginError('');

    try {
      const result = await login(email, password);
      if (result.success && result.user) {
        const rolePath = result.user.role === 'student' ? '/student/dashboard' : '/teacher/home';
        navigate(rolePath);
      } else {
        setLoginError(result.error || '登录失败，请检查用户名/邮箱和密码');
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setLoginError(detail);
      } else if (Array.isArray(detail)) {
        setLoginError(detail.map((e: any) => e.msg || e.message).join(', '));
      } else {
        setLoginError('登录失败，请检查用户名/邮箱和密码');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-sm">
        <div className="p-12">
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 rounded-xl bg-zinc-900 flex items-center justify-center mb-5">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900">Aigc For Study</h1>
            <p className="text-zinc-500 mt-2">欢迎回来</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">邮箱 / 用户名</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱或用户名"
                  autoComplete="username"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-12 pr-12 py-3 bg-white border border-zinc-200 rounded-xl text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-zinc-900 text-white font-medium rounded-xl hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-zinc-500">还没有账号？</span>
            <button onClick={() => navigate('/register')} className="ml-1 text-zinc-900 font-medium hover:underline">立即注册</button>
          </div>

          <div className="mt-10 pt-6 border-t border-zinc-100">
            <div className="flex items-center justify-center gap-4 text-sm text-zinc-400">
              <span>© 2026</span>
              <span>·</span>
              <span>隐私政策</span>
              <span>·</span>
              <span>服务条款</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}