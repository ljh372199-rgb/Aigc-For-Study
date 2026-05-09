import { useState, useEffect } from 'react';
import { Briefcase, Target, Search, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { careerApi } from '@/services/api';

interface Career {
  id: string;
  name: string;
  description: string;
  skills_required: string[];
}

export function CareersPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

  useEffect(() => {
    loadCareers();
  }, []);

  const loadCareers = async () => {
    setLoading(true);
    try {
      const res = await careerApi.getAll();
      setCareers(res.data);
    } catch (error) {
      console.error('加载职业列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCareers = careers.filter((career) =>
    career.name.toLowerCase().includes(search.toLowerCase()) ||
    career.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewDetail = (career: Career) => {
    setSelectedCareer(career);
    setShowDetailModal(true);
  };

  const handleCreatePlan = (career: Career) => {
    window.location.href = `/student/plans?career_id=${career.id}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">职业规划</h1>
          <p className="text-slate-500">探索职业发展路径，制定学习目标</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="搜索职业..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-black placeholder-zinc-400 focus:outline-none focus:ring-zinc-900 focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : filteredCareers.length === 0 ? (
        <Card variant="default" className="ceramic text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 mx-auto mb-4 flex items-center justify-center">
            <Target className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">暂无职业目标</h3>
          <p className="text-slate-500">探索不同的职业发展方向</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map((career) => (
            <Card key={career.id} variant="interactive" className="ceramic group">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-6 w-6 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {career.name}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                    {career.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {career.skills_required.slice(0, 3).map((skill, i) => (
                  <Badge key={i} variant="default" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {career.skills_required.length > 3 && (
                  <Badge variant="default" className="text-xs">
                    +{career.skills_required.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewDetail(career)}
                >
                  查看详情
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleCreatePlan(career)}
                >
                  <Sparkles className="h-4 w-4" />
                  制定方案
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedCareer?.name || ''}
        size="lg"
      >
        {selectedCareer && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">职业描述</h3>
              <p className="text-slate-900">{selectedCareer.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3">所需技能</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCareer.skills_required.map((skill, i) => (
                  <Badge key={i} variant="primary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowDetailModal(false)}
              >
                关闭
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  handleCreatePlan(selectedCareer);
                  setShowDetailModal(false);
                }}
              >
                <Sparkles className="h-4 w-4" />
                基于此职业制定学习方案
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
