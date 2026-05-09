import { BookOpen, Target, Calendar, PenTool, FileText, TrendingUp, Award, Zap, Clock, ChevronRight, Play, Star, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';

interface StudentStats {
  total_study_time: number;
  total_exercises: number;
  completed_exercises: number;
  total_assignments: number;
  completed_assignments: number;
  average_score: number;
  current_streak: number;
}

interface LearningPlan {
  id: string;
  title: string;
  career_goal_id: string;
  status: string;
  plan_data: {
    progress?: number;
    estimated_weeks?: number;
    completed_hours?: number;
  };
  created_at: string;
}

interface Checkin {
  id: string;
  check_in_date: string;
  duration_minutes: number;
  note: string;
  created_at: string;
}

interface RecentActivity {
  id: string;
  title: string;
  time: string;
  icon: typeof CheckCircle2;
  color: string;
}

interface LearningProgressItem {
  subject: string;
  progress: number;
  color: string;
}

interface DailyCheckinItem {
  day: string;
  completed: boolean;
}

const quickActions = [
  { icon: BookOpen, label: '继续学习', color: 'from-indigo-500 to-indigo-600' },
  { icon: PenTool, label: '开始练习', color: 'from-purple-500 to-purple-600' },
  { icon: FileText, label: '做作业', color: 'from-amber-500 to-amber-600' },
  { icon: Target, label: '设定目标', color: 'from-emerald-500 to-emerald-600' },
];

const defaultProgress: LearningProgressItem[] = [
  { subject: 'Python 基础', progress: 0, color: 'bg-indigo-500' },
  { subject: '机器学习入门', progress: 0, color: 'bg-purple-500' },
  { subject: '数据结构', progress: 0, color: 'bg-amber-500' },
];

const defaultDailyCheckins: DailyCheckinItem[] = [
  { day: '周一', completed: false },
  { day: '周二', completed: false },
  { day: '周三', completed: false },
  { day: '周四', completed: false },
  { day: '周五', completed: false },
  { day: '周六', completed: false },
  { day: '周日', completed: false },
];

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return '刚刚';
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN');
}

function formatActivityTitle(checkin: Checkin): string {
  if (checkin.note) return checkin.note;
  return `学习打卡 ${checkin.duration_minutes}分钟`;
}

export function StudentDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case '继续学习':
        navigate('/student/plans');
        break;
      case '开始练习':
        navigate('/student/exercises');
        break;
      case '做作业':
        navigate('/student/assignments');
        break;
      case '设定目标':
        navigate('/student/plans');
        break;
    }
  };

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, plansRes, checkinsRes] = await Promise.all([
        api.get<StudentStats>('/analytics/students/me'),
        api.get<LearningPlan[]>('/learning-plans/'),
        api.get<Checkin[]>('/check-ins/'),
      ]);

      setStats(statsRes.data);

      const plansData = Array.isArray(plansRes.data) ? plansRes.data : (plansRes.data as any)?.data || [];
      const activePlan = plansData.find((p: LearningPlan) => p.status === 'active') || plansData[0] || null;
      setLearningPlan(activePlan);

      const checkinsData = Array.isArray(checkinsRes.data) ? checkinsRes.data : (checkinsRes.data as any)?.data || [];
      const sortedCheckins = checkinsData.sort((a: Checkin, b: Checkin) => 
        new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime()
      );
      setCheckins(sortedCheckins);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const dailyCheckins: DailyCheckinItem[] = (() => {
    if (checkins.length === 0) return defaultDailyCheckins;
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const result: DailyCheckinItem[] = [];
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const hasCheckin = checkins.some(c => c.check_in_date.startsWith(dateStr));
      result.push({ day: days[i], completed: hasCheckin });
    }
    return result;
  })();

  const weekCompletedCount = dailyCheckins.filter(d => d.completed).length;

  const recentActivities: RecentActivity[] = checkins.slice(0, 3).map((checkin, index) => ({
    id: checkin.id,
    title: formatActivityTitle(checkin),
    time: getRelativeTime(checkin.created_at),
    icon: index === 0 ? CheckCircle2 : index === 1 ? Play : FileText,
    color: index === 0 ? 'text-emerald-500' : index === 1 ? 'text-indigo-500' : 'text-amber-500',
  }));

  const learningProgress: LearningProgressItem[] = (() => {
    if (learningPlan?.plan_data) {
      const progress = learningPlan.plan_data.progress || 0;
      return [
        { subject: learningPlan.title || '当前学习计划', progress, color: 'bg-indigo-500' },
        { subject: 'Python 基础', progress: Math.max(0, progress - 20), color: 'bg-purple-500' },
        { subject: '机器学习入门', progress: Math.max(0, progress - 40), color: 'bg-amber-500' },
      ].filter(item => item.progress > 0);
    }
    return defaultProgress;
  })();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-slate-500">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-slate-600">{error}</p>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  const progressPercent = learningPlan?.plan_data?.progress || (stats?.current_streak ? Math.min(stats.current_streak * 10, 100) : 0);
  const estimatedWeeks = learningPlan?.plan_data?.estimated_weeks || 12;
  const completedHours = learningPlan?.plan_data?.completed_hours || stats?.total_study_time || 0;
  const streak = stats?.current_streak || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">欢迎回来</h1>
          <p className="text-slate-500 mt-1">继续你的 AI 学习之旅</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl">
          <Star className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-semibold text-amber-700">连续学习 {streak} 天</span>
        </div>
      </div>

      <div className="grid-bento">
        <div className="bento-span-2 ceramic p-8 relative overflow-hidden glow">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">当前 AI 学习路径</h2>
                <p className="text-sm text-slate-500">{learningPlan?.title || 'Python 机器学习工程师'}</p>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">学习进度</span>
                <span className="font-semibold text-slate-900">{progressPercent}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-[{progressPercent}%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="h-4 w-4" />
                <span>预计 {estimatedWeeks} 周完成</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>已学习 {completedHours} 小时</span>
              </div>
            </div>

            <button className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
              继续学习
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="ceramic p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h2 className="font-bold text-slate-900">每日打卡</h2>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-500">本周进度</span>
            <span className="text-sm font-semibold text-emerald-600">{weekCompletedCount}/7</span>
          </div>
          
          <div className="flex gap-1.5">
            {dailyCheckins.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1.5">
                <div className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
                  day.completed 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20' 
                    : 'bg-slate-100'
                }`}>
                  {day.completed && <CheckCircle2 className="h-4 w-4 text-white" />}
                </div>
                <span className="text-xs text-slate-500">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ceramic p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Award className="h-5 w-5 text-white" />
            </div>
            <h2 className="font-bold text-slate-900">学习成就</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-slate-700">初学者</span>
              </div>
              <span className="text-xs text-amber-600 font-semibold">已解锁</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-500">持续进步</span>
              </div>
              <span className="text-xs text-slate-400">{streak}/7天</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-500">知识探索者</span>
              </div>
              <span className="text-xs text-slate-400">0/10</span>
            </div>
          </div>
        </div>

        <div className="bento-span-2 ceramic p-6">
          <h2 className="font-bold text-slate-900 mb-4">学习进度</h2>
          <div className="space-y-5">
            {learningProgress.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{item.subject}</span>
                  <span className="text-sm font-semibold text-slate-900">{item.progress}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bento-span-2 ceramic p-6">
          <h2 className="font-bold text-slate-900 mb-4">快捷操作</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.label)}
                className="flex flex-col items-center gap-3 p-4 bg-white border border-slate-200/60 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="ceramic p-6">
          <h2 className="font-bold text-slate-900 mb-4">最近活动</h2>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl">
                  <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm`}>
                    <activity.icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{activity.title}</p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">暂无最近活动</p>
            )}
          </div>
        </div>

        <div className="ceramic p-6">
          <h2 className="font-bold text-slate-900 mb-4">学习统计</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-indigo-50/50 rounded-xl">
              <div className="text-2xl font-bold text-indigo-600">{completedHours}</div>
              <div className="text-xs text-slate-500 mt-1">学习小时</div>
            </div>
            <div className="text-center p-4 bg-purple-50/50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">{stats?.completed_exercises || 0}/{stats?.total_exercises || 0}</div>
              <div className="text-xs text-slate-500 mt-1">完成课程</div>
            </div>
            <div className="text-center p-4 bg-emerald-50/50 rounded-xl">
              <div className="text-2xl font-bold text-emerald-600">{streak}</div>
              <div className="text-xs text-slate-500 mt-1">获得徽章</div>
            </div>
            <div className="text-center p-4 bg-amber-50/50 rounded-xl">
              <div className="text-2xl font-bold text-amber-600">{stats?.average_score?.toFixed(0) || 0}</div>
              <div className="text-xs text-slate-500 mt-1">平均分数</div>
            </div>
          </div>
        </div>
      </div>

      <button className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 transition-all z-40">
        <Zap className="h-6 w-6" />
      </button>
    </div>
  );
}
