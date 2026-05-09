import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Brain, FileText, CalendarCheck, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function RoleModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-card relative w-full max-w-md p-8 animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5 text-slate-500" />
        </button>
        <h2 className="text-2xl font-semibold text-slate-900 text-center mb-2">
          选择您的角色
        </h2>
        <p className="text-slate-500 text-center mb-8">
          开启您的 AI 驱动学习之旅
        </p>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/student')}
            className="w-full p-4 glass rounded-2xl hover:bg-white/80 transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900">Login as Student</div>
                <div className="text-sm text-slate-500">探索个性化学习路径</div>
              </div>
            </div>
          </button>
          <button
            onClick={() => navigate('/teacher')}
            className="w-full p-4 glass rounded-2xl hover:bg-white/80 transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900">Login as Teacher</div>
                <div className="text-sm text-slate-500">管理学生与作业</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroSection({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center px-6 pt-20">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span className="text-sm text-slate-600">AI驱动的智能学习平台</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight animate-fade-in-up">
          AI Driven Learning
        </h1>
        <p className="text-xl text-slate-600 max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in-up stagger-1">
          基于人工智能技术，为您打造个性化学习路径，让每一次学习都充满成就感
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-2">
          <Button variant="primary" size="lg" onClick={onOpenModal} className="px-8">
            开始探索
          </Button>
          <Button variant="secondary" size="lg" className="px-8">
            了解更多
          </Button>
        </div>
      </div>
      <div className="mt-20 grid grid-cols-3 gap-8 text-center">
        <div className="animate-fade-in-up stagger-1">
          <div className="text-3xl md:text-4xl font-bold text-slate-900">10,000+</div>
          <div className="text-sm text-slate-500 mt-1">活跃用户</div>
        </div>
        <div className="animate-fade-in-up stagger-2">
          <div className="text-3xl md:text-4xl font-bold text-slate-900">50,000+</div>
          <div className="text-sm text-slate-500 mt-1">学习方案</div>
        </div>
        <div className="animate-fade-in-up stagger-3">
          <div className="text-3xl md:text-4xl font-bold text-slate-900">98%</div>
          <div className="text-sm text-slate-500 mt-1">好评率</div>
        </div>
      </div>
    </section>
  );
}

function FeatureBentoGrid() {
  const features = [
    {
      icon: Brain,
      title: 'AI个性化学习路径',
      description: '智能分析您的学习目标与能力水平，生成专属学习路线图',
      gradient: 'from-indigo-500 to-purple-500',
      span: 'bento-span-2',
    },
    {
      icon: FileText,
      title: '智能练习系统',
      description: 'AI 生成个性化练习题，实时评估学习效果',
      gradient: 'from-emerald-500 to-teal-500',
      span: 'bento-span-1',
    },
    {
      icon: CalendarCheck,
      title: '打卡追踪',
      description: '养成良好学习习惯，记录每一步成长',
      gradient: 'from-orange-500 to-rose-500',
      span: 'bento-span-1',
    },
    {
      icon: Trophy,
      title: '作业管理',
      description: '便捷的作业提交与批改系统',
      gradient: 'from-amber-500 to-yellow-500',
      span: 'bento-span-2',
    },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            核心功能
          </h2>
          <p className="text-slate-500 text-lg">
            强大的 AI 功能，全方位提升学习体验
          </p>
        </div>
        <div className="grid-bento">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`${feature.span} glass-card p-6 md:p-8 hover:scale-[1.02] transition-all duration-300 cursor-default group`}
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="fixed top-0 left-0 right-0 z-40 glass py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-500" />
            <span className="font-semibold text-slate-900">Aigc For Study</span>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            登录
          </Button>
        </div>
      </header>

      <main>
        <HeroSection onOpenModal={() => setIsModalOpen(true)} />
        <FeatureBentoGrid />
      </main>

      <footer className="py-8 px-6 border-t border-slate-200/50">
        <div className="max-w-6xl mx-auto text-center text-sm text-slate-500">
          © 2026 Aigc For Study. All rights reserved.
        </div>
      </footer>

      <RoleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
