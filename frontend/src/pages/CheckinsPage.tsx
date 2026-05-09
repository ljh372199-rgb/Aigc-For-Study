import { useState } from 'react';
import { Clock, CheckCircle, Flame, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { checkinApi } from '@/services/api';

interface Checkin {
  date: string;
  hours: number;
  tasks: number;
  notes: string;
}

export function CheckinsPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ hours: 0, tasks: 0, notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [checkins] = useState<Checkin[]>([]);
  const [checkedDates] = useState<string[]>([]);

  const today = new Date();
  const currentMonth = `${today.getFullYear()}年${today.getMonth() + 1}月`;

  const stats = {
    totalHours: checkins.reduce((sum, c) => sum + c.hours, 0),
    totalTasks: checkins.reduce((sum, c) => sum + c.tasks, 0),
    currentStreak: 0,
    longestStreak: 0,
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await checkinApi.checkin({
        duration_minutes: Math.round(form.hours * 60),
        content: form.notes,
      });
      setShowModal(false);
      setForm({ hours: 0, tasks: 0, notes: '' });
    } catch (error) {
      console.error('打卡失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">学习打卡</h1>
          <p className="text-slate-500">记录每一天的学习成果</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
          <CheckCircle className="h-5 w-5" />
          今日打卡
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" className="ceramic text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 mx-auto mb-3 flex items-center justify-center">
            <Clock className="h-6 w-6 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalHours}h</div>
          <div className="text-sm text-slate-500">本周学习</div>
        </Card>
        <Card variant="default" className="ceramic text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 mx-auto mb-3 flex items-center justify-center">
            <Target className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalTasks}</div>
          <div className="text-sm text-slate-500">完成任务</div>
        </Card>
        <Card variant="default" className="ceramic text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-50 mx-auto mb-3 flex items-center justify-center">
            <Flame className="h-6 w-6 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.currentStreak}天</div>
          <div className="text-sm text-slate-500">当前连续</div>
        </Card>
        <Card variant="default" className="ceramic text-center">
          <div className="w-12 h-12 rounded-xl bg-pink-50 mx-auto mb-3 flex items-center justify-center">
            <Flame className="h-6 w-6 text-pink-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.longestStreak}天</div>
          <div className="text-sm text-slate-500">最长连续</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card variant="default" className="ceramic">
            <div className="flex items-center justify-between mb-6">
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-semibold text-slate-900">{currentMonth}</h3>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <div key={day} className="text-center text-sm text-slate-500 py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                const isChecked = checkedDates.includes(day.toString());
                return (
                  <div key={day} className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                    isChecked ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-100'
                  }`}>
                    {day}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">最近打卡</h3>
          <div className="space-y-4">
            {checkins.length === 0 ? (
              <Card variant="default" className="ceramic text-center py-8">
                <CheckCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">暂无打卡记录</p>
              </Card>
            ) : (
              checkins.map((checkin, i) => (
                <Card key={i} variant="default" className="ceramic">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900">{checkin.date}</span>
                    {i === 0 && <Badge variant="success">今日</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{checkin.hours}h</span>
                    <span className="flex items-center gap-1"><Target className="h-3 w-3" />{checkin.tasks} 任务</span>
                  </div>
                  {checkin.notes && <p className="text-xs text-slate-500">{checkin.notes}</p>}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="今日打卡">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">学习时长（小时）</label>
            <input type="number" step="0.5" min="0" max="24" value={form.hours}
              onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-black placeholder-zinc-400 focus:outline-none focus:ring-zinc-900 focus:border-transparent"
              placeholder="输入学习时长" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">完成任务数</label>
            <input type="number" min="0" value={form.tasks}
              onChange={(e) => setForm({ ...form, tasks: Number(e.target.value) })}
              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-black placeholder-zinc-400 focus:outline-none focus:ring-zinc-900 focus:border-transparent"
              placeholder="输入完成任务数" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">学习笔记</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-black placeholder-zinc-400 focus:outline-none focus:ring-zinc-900 focus:border-transparent"
              rows={3} placeholder="记录今天的学习收获..." />
          </div>
          <div className="flex gap-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>取消</Button>
            <Button variant="primary" className="flex-1" onClick={handleSubmit} disabled={submitting}>
              {submitting ? '提交中...' : '确认打卡'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
