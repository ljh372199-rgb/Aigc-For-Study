import { Link } from 'react-router-dom';
import { FileText, Users, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function TeacherHomePage() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold text-zinc-900 mb-2">教师工作台</h1>
        <p className="text-zinc-500">欢迎回来，查看您的教学数据</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-500 mb-1">学生总数</p>
              <p className="text-xl lg:text-2xl font-semibold text-zinc-900">-</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-zinc-600" strokeWidth={1.5} />
            </div>
          </div>
        </Card>
        <Card className="p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-500 mb-1">待批改</p>
              <p className="text-xl lg:text-2xl font-semibold text-amber-600">-</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
            </div>
          </div>
        </Card>
        <Card className="p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-500 mb-1">今日提交</p>
              <p className="text-xl lg:text-2xl font-semibold text-green-600">-</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-green-600" strokeWidth={1.5} />
            </div>
          </div>
        </Card>
        <Card className="p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-500 mb-1">平均成绩</p>
              <p className="text-xl lg:text-2xl font-semibold text-zinc-900">-</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-zinc-600" strokeWidth={1.5} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900">待批改作业</h2>
            <Link to="/teacher/assignments" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
              查看全部 <ChevronRight className="h-4 w-4 inline" />
            </Link>
          </div>
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-xl bg-zinc-50 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-7 w-7 text-zinc-400" strokeWidth={1.5} />
            </div>
            <p className="text-zinc-500">暂无待批改作业</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">快捷操作</h2>
          <div className="space-y-3">
            <Link to="/teacher/assignments" className="block">
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-200 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-zinc-700" strokeWidth={1.5} />
                  </div>
                  <span className="font-medium text-zinc-900">发布作业</span>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-400" />
              </div>
            </Link>
            <Link to="/teacher/students" className="block">
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-200 flex items-center justify-center">
                    <Users className="h-5 w-5 text-zinc-700" strokeWidth={1.5} />
                  </div>
                  <span className="font-medium text-zinc-900">查看学生数据</span>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-400" />
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}