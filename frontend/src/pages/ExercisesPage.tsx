import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { exerciseApi } from '@/services/api';

type Difficulty = 'easy' | 'medium' | 'hard';
type ExerciseStatus = 'pending' | 'submitted' | 'graded';
type FilterType = 'all' | ExerciseStatus;

interface Exercise {
  id: string;
  title: string;
  subject: string;
  difficulty: Difficulty;
  status: ExerciseStatus;
  score?: number;
}

const difficultyConfig: Record<Difficulty, { label: string; color: string; bg: string }> = {
  easy: { label: '简单', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  medium: { label: '中等', color: 'text-amber-600', bg: 'bg-amber-50' },
  hard: { label: '困难', color: 'text-red-600', bg: 'bg-red-50' },
};

const statusConfig: Record<ExerciseStatus, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: '待作答', icon: Clock, color: 'text-amber-500' },
  submitted: { label: '待批改', icon: AlertCircle, color: 'text-indigo-500' },
  graded: { label: '已批改', icon: CheckCircle, color: 'text-emerald-500' },
};

export function ExercisesPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    subject: '',
    difficulty: 'medium' as Difficulty,
    count: 5,
  });
  const [exercises] = useState<Exercise[]>([]);

  const filteredExercises = filter === 'all'
    ? exercises
    : exercises.filter((ex) => ex.status === filter);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await exerciseApi.generate(
        generateForm.subject,
        generateForm.difficulty,
        generateForm.count
      );
      setShowGenerateModal(false);
      setGenerateForm({ subject: '', difficulty: 'medium', count: 5 });
    } catch (error) {
      console.error('生成练习题失败:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">练习中心</h1>
          <p className="text-slate-500">AI 生成的个性化练习题</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowGenerateModal(true)}>
          <Sparkles className="h-5 w-5" />
          AI 生成练习
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'pending', 'submitted', 'graded'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f ? 'bg-indigo-500 text-white' : 'ceramic text-slate-500 hover:text-slate-900'
            }`}
          >
            {f === 'all' ? '全部' : statusConfig[f].label}
          </button>
        ))}
      </div>

      {filteredExercises.length === 0 ? (
        <Card variant="default" className="ceramic text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 mx-auto mb-4 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">暂无练习题</h3>
          <p className="text-slate-500 mb-6">点击上方按钮生成 AI 练习题</p>
          <Button variant="primary" onClick={() => setShowGenerateModal(true)}>
            <Sparkles className="h-5 w-5" />
            AI 生成练习
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredExercises.map((exercise) => {
            const diff = difficultyConfig[exercise.difficulty];
            const stat = statusConfig[exercise.status];
            const StatusIcon = stat.icon;
            return (
              <Link key={exercise.id} to={`/exercises/${exercise.id}`}>
                <Card variant="interactive" className="ceramic group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      <StatusIcon className="h-6 w-6" style={{ color: stat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{exercise.title}</h3>
                      <div className="flex items-center gap-3 text-sm">
                        <Badge variant="primary">{exercise.subject}</Badge>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${diff.bg} ${diff.color}`}>{diff.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {exercise.status === 'graded' && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900">{exercise.score}</div>
                          <div className="text-xs text-slate-500">分</div>
                        </div>
                      )}
                      <div className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="AI 生成练习题"
        size="lg"
      >
        <div className="space-y-6">
          <Input
            label="科目"
            placeholder="例如：JavaScript、Python、前端开发"
            value={generateForm.subject}
            onChange={(e) => setGenerateForm({ ...generateForm, subject: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">难度</label>
            <div className="flex gap-3">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setGenerateForm({ ...generateForm, difficulty: level })}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    generateForm.difficulty === level
                      ? difficultyConfig[level].bg + ' ' + difficultyConfig[level].color + ' ring-2 ring-offset-2 ring-' + (level === 'easy' ? 'emerald' : level === 'medium' ? 'amber' : 'red') + '-400'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {difficultyConfig[level].label}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="题目数量"
            type="number"
            min={1}
            max={50}
            value={generateForm.count}
            onChange={(e) => setGenerateForm({ ...generateForm, count: parseInt(e.target.value) || 5 })}
          />
          <div className="flex gap-4 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowGenerateModal(false)}
            >
              取消
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleGenerate}
              disabled={generating || !generateForm.subject}
            >
              {generating ? '生成中...' : '开始生成'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
