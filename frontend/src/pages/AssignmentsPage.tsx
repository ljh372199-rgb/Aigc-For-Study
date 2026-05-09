import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { submissionApi } from '@/services/api';

type TabType = 'pending' | 'submitted' | 'graded';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  deadline: string;
  status: 'pending' | 'submitted' | 'graded';
  maxScore: number;
  submittedAt?: string;
  score?: number;
  feedback?: string;
}

export function AssignmentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submitForm, setSubmitForm] = useState({
    content: '',
  });
  const [assignments] = useState<Assignment[]>([]);

  const tabs: { key: TabType; label: string; icon: typeof Clock; count: number }[] = [
    { key: 'pending', label: '待提交', icon: Clock, count: assignments.filter((a) => a.status === 'pending').length },
    { key: 'submitted', label: '已提交', icon: AlertCircle, count: assignments.filter((a) => a.status === 'submitted').length },
    { key: 'graded', label: '已批改', icon: CheckCircle, count: assignments.filter((a) => a.status === 'graded').length },
  ];

  const filteredAssignments = assignments.filter((a) => {
    if (activeTab === 'pending') return a.status === 'pending';
    if (activeTab === 'submitted') return a.status === 'submitted';
    if (activeTab === 'graded') return a.status === 'graded';
    return true;
  });

  const handleOpenSubmit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmitModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || !submitForm.content) return;
    setSubmitting(true);
    try {
      await submissionApi.create(selectedAssignment.id, submitForm.content);
      setShowSubmitModal(false);
      setSubmitForm({ content: '' });
      setSelectedAssignment(null);
    } catch (error) {
      console.error('提交作业失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">作业中心</h1>
          <p className="text-slate-500">查看和提交您的作业</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-indigo-500 text-white'
                  : 'ceramic text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                activeTab === tab.key ? 'bg-white/20' : 'bg-slate-100'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {filteredAssignments.length === 0 ? (
        <Card variant="default" className="ceramic text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 mx-auto mb-4 flex items-center justify-center">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {activeTab === 'pending' ? '暂无待提交作业' :
             activeTab === 'submitted' ? '暂无已提交作业' : '暂无已批改作业'}
          </h3>
          <p className="text-slate-500">完成作业后在这里查看</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <Link key={assignment.id} to={`/assignments/${assignment.id}`}>
              <Card variant="interactive" className="ceramic group">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    assignment.status === 'pending' ? 'bg-amber-50' :
                    assignment.status === 'submitted' ? 'bg-indigo-50' :
                    'bg-emerald-50'
                  }`}>
                    <FileText className={`h-6 w-6 ${
                      assignment.status === 'pending' ? 'text-amber-500' :
                      assignment.status === 'submitted' ? 'text-indigo-500' :
                      'text-emerald-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {assignment.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <Badge variant="primary">{assignment.subject}</Badge>
                      <span>发布人: {assignment.teacher}</span>
                      <span>截止: {assignment.deadline}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {assignment.status === 'graded' && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">{assignment.score}</div>
                        <div className="text-xs text-slate-500">/{assignment.maxScore}分</div>
                      </div>
                    )}
                    {assignment.status === 'pending' && (
                      <Button variant="primary" size="sm" onClick={(e) => { e.preventDefault(); handleOpenSubmit(assignment); }}>
                        提交作业
                      </Button>
                    )}
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
                {assignment.feedback && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-500">
                      <span className="text-slate-700 font-medium">老师点评:</span> {assignment.feedback}
                    </p>
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="提交作业"
        size="lg"
      >
        {selectedAssignment && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl">
              <h3 className="font-medium text-slate-900 mb-2">{selectedAssignment.title}</h3>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Badge variant="primary">{selectedAssignment.subject}</Badge>
                <span>截止: {selectedAssignment.deadline}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">作业内容</label>
              <textarea
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-black placeholder-zinc-400 focus:outline-none focus:ring-zinc-900 focus:border-transparent"
                rows={8}
                placeholder="请输入您的作业内容..."
                value={submitForm.content}
                onChange={(e) => setSubmitForm({ content: e.target.value })}
              />
            </div>
            <div className="flex gap-4 pt-4">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowSubmitModal(false)}
              >
                取消
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSubmit}
                disabled={submitting || !submitForm.content}
              >
                {submitting ? '提交中...' : '确认提交'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
