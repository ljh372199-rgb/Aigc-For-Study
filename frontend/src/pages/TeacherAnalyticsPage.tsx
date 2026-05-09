import { BarChart3, TrendingUp, Users, FileText, Calendar, Target } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function TeacherAnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">数据统计</h1>
        <p className="text-slate-500">查看教学数据和统计信息</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" className="ceramic">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">总提交数</p>
              <p className="text-2xl font-bold text-slate-900">-</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <FileText className="h-6 w-6 text-indigo-500" />
            </div>
          </div>
        </Card>
        <Card variant="default" className="ceramic">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">活跃学生</p>
              <p className="text-2xl font-bold text-slate-900">-</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </Card>
        <Card variant="default" className="ceramic">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">平均完成率</p>
              <p className="text-2xl font-bold text-slate-900">-</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Target className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </Card>
        <Card variant="default" className="ceramic">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">本周提交</p>
              <p className="text-2xl font-bold text-slate-900">-</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-pink-500" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card variant="default" className="ceramic">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">成绩分布</h2>
          </div>
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="h-10 w-10 text-slate-400" />
            </div>
            <p className="text-slate-500">暂无数据</p>
          </div>
        </Card>

        <Card variant="default" className="ceramic">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">学习趋势</h2>
          </div>
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="h-10 w-10 text-slate-400" />
            </div>
            <p className="text-slate-500">暂无数据</p>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card variant="default" className="ceramic">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">学科分布</h2>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 mx-auto mb-3 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">暂无数据</p>
          </div>
        </Card>

        <Card variant="default" className="ceramic">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">提交趋势</h2>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 mx-auto mb-3 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">暂无数据</p>
          </div>
        </Card>

        <Card variant="default" className="ceramic">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">学生活跃度</h2>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 mx-auto mb-3 flex items-center justify-center">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">暂无数据</p>
          </div>
        </Card>
      </div>
    </div>
  );
}