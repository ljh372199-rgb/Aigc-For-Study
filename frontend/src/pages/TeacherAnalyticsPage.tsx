import { BarChart3, TrendingUp, Users, FileText, Calendar, Target } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function TeacherAnalyticsPage() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold text-zinc-900 mb-2">数据统计</h1>
        <p className="text-zinc-500">查看教学数据和统计信息</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-500 mb-1">总提交数</p>
              <p className="text-xl lg:text-2xl font-semibold text-zinc-900">-</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-zinc-600" strokeWidth={1.5} />
            </div>
          </div>
        </Card>
        <Card className="p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-500 mb-1">活跃学生</p>
              <p className="text-xl lg:text-2xl font-semibold text-green-600">-</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" strokeWidth={1.5} />
            </div>
          </div>
        </Card>
        <Card className="p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-500 mb-1">平均完成率</p>
              <p className="text-xl lg:text-2xl font-semibold text-amber-600">-</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Target className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
            </div>
          </div>
        </Card>
        <Card className="p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-500 mb-1">本周提交</p>
              <p className="text-xl lg:text-2xl font-semibold text-zinc-900">-</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-zinc-600" strokeWidth={1.5} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-5 w-5 text-zinc-500" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold text-zinc-900">成绩分布</h2>
          </div>
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-xl bg-zinc-50 mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-zinc-400" strokeWidth={1.5} />
            </div>
            <p className="text-zinc-500">暂无数据</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 text-zinc-500" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold text-zinc-900">学习趋势</h2>
          </div>
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-xl bg-zinc-50 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-zinc-400" strokeWidth={1.5} />
            </div>
            <p className="text-zinc-500">暂无数据</p>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">学科分布</h2>
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-xl bg-zinc-50 mx-auto mb-3 flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-zinc-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-zinc-500">暂无数据</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">提交趋势</h2>
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-xl bg-zinc-50 mx-auto mb-3 flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-zinc-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-zinc-500">暂无数据</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">学生活跃度</h2>
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-xl bg-zinc-50 mx-auto mb-3 flex items-center justify-center">
              <Users className="h-7 w-7 text-zinc-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-zinc-500">暂无数据</p>
          </div>
        </Card>
      </div>
    </div>
  );
}