import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TrendingUp, Target, Clock, Flame } from 'lucide-react';

const students = [
  { id: '1', name: '张三', totalHours: 45, tasksCompleted: 28, avgScore: 85, streak: 7 },
  { id: '2', name: '李四', totalHours: 38, tasksCompleted: 22, avgScore: 78, streak: 5 },
  { id: '3', name: '王五', totalHours: 52, tasksCompleted: 35, avgScore: 92, streak: 12 },
  { id: '4', name: '赵六', totalHours: 30, tasksCompleted: 18, avgScore: 72, streak: 3 },
];

export function StudentStatsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">学生学习数据</h1>
        <p className="text-slate-500">查看所有学生的学习进度和表现</p>
      </div>

      <Card variant="default" className="ceramic overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">学生</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">学习时长</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">完成任务</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">平均成绩</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">连续打卡</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">学习趋势</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-slate-900 font-medium">{student.name}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="h-4 w-4" />
                    {student.totalHours}h
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Target className="h-4 w-4" />
                    {student.tasksCompleted}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={student.avgScore >= 85 ? 'success' : student.avgScore >= 70 ? 'warning' : 'error'}>
                    {student.avgScore}分
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Flame className="h-4 w-4" />
                    {student.streak}天
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-emerald-500">
                    <TrendingUp className="h-4 w-4" />
                    <span>+{Math.floor(Math.random() * 10 + 5)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
