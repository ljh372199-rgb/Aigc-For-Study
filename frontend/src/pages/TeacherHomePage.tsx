import { Link } from 'react-router-dom';
import { FileText, Users, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function TeacherHomePage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">教师工作台</h1>
        <p className="text-slate-500">欢迎回来，查看您的教学数据</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" className="ceramic">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">学生总数</p>
              <p className="text-2xl font-bold text-slate-900">-</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-indigo-500" />
            </div>
          </div>
        </Card>
        <Card variant="default" className="ceramic">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">待批改</p>
              <p className="text-2xl font-bold text-amber-500">-</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </Card>
        <Card variant="default" className="ceramic">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">今日提交</p>
              <p className="text-2xl font-bold text-emerald-500">-</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FileText className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </Card>
        <Card variant="default" className="ceramic">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">平均成绩</p>
              <p className="text-2xl font-bold text-slate-900">-</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-pink-500" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card variant="default" className="ceramic">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">待批改作业</h2>
            <Link to="/teacher/assignments" className="text-sm text-indigo-600 hover:text-indigo-700">
              查看全部 <ChevronRight className="h-4 w-4 inline" />
            </Link>
          </div>
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500">暂无待批改作业</p>
          </div>
        </Card>

        <Card variant="default" className="ceramic">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">快捷操作</h2>
          <div className="space-y-3">
            <Link to="/teacher/assignments">
              <Card variant="interactive" className="ceramic group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-indigo-500" />
                    </div>
                    <span className="text-slate-900 group-hover:text-indigo-600 transition-colors">发布作业</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </Link>
            <Link to="/teacher/students">
              <Card variant="interactive" className="ceramic group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Users className="h-5 w-5 text-emerald-500" />
                    </div>
                    <span className="text-slate-900 group-hover:text-indigo-600 transition-colors">查看学生数据</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}