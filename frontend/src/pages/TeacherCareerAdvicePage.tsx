import { useState, useEffect } from 'react';
import { Plus, Target, Users, FileText, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { careerAdviceApi } from '@/services/api/careerAdvice';
import type { CareerAdvice, GenerateCareerAdviceParams, Student, Class } from '@/services/api/careerAdviceTypes';

export function TeacherCareerAdvicePage() {
  const [adviceList, setAdviceList] = useState<CareerAdvice[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [selectedAdvice, setSelectedAdvice] = useState<CareerAdvice | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewAdvice, setPreviewAdvice] = useState<CareerAdvice | null>(null);

  useEffect(() => {
    loadAdviceList();
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadClassStudents(selectedClass);
    }
  }, [selectedClass]);

  const loadAdviceList = async () => {
    try {
      const response = await careerAdviceApi.list({ limit: 20 });
      setAdviceList(response.items);
    } catch (error) {
      console.error('Failed to load advice list:', error);
    }
  };

  const loadClasses = async () => {
    try {
      const data = await careerAdviceApi.getClasses();
      setClasses(data);
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  };

  const loadClassStudents = async (classId: string) => {
    try {
      const data = await careerAdviceApi.getClassStudents(classId);
      setStudents(data);
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const handleGenerate = async (params: GenerateCareerAdviceParams) => {
    try {
      setGenerating(true);
      const advice = await careerAdviceApi.generate(params);
      setPreviewAdvice(advice);
      setShowGenerator(false);
    } catch (error) {
      console.error('Failed to generate advice:', error);
      alert('生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedAdvice || selectedStudents.length === 0) return;
    
    try {
      await careerAdviceApi.assign({
        advice_id: selectedAdvice.id,
        student_ids: selectedStudents
      });
      alert('下发成功！');
      setShowStudentSelector(false);
      setSelectedAdvice(null);
      setSelectedStudents([]);
      loadAdviceList();
    } catch (error) {
      console.error('Failed to assign advice:', error);
      alert('下发失败，请重试');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个职业规划建议吗？')) return;
    
    try {
      await careerAdviceApi.delete(id);
      loadAdviceList();
    } catch (error) {
      console.error('Failed to delete advice:', error);
      alert('删除失败，请重试');
    }
  };

  const filteredStudents = students.filter(student =>
    student.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-zinc-900 mb-2">职业规划</h1>
          <p className="text-zinc-500">为学生制定个性化职业发展建议</p>
        </div>
        <Button variant="ios" size="lg" onClick={() => setShowGenerator(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          生成建议
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-500 mb-1">已生成建议</p>
              <p className="text-xl lg:text-2xl font-semibold text-zinc-900">{adviceList.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
              <Target className="h-5 w-5 text-zinc-600" strokeWidth={1.5} />
            </div>
          </div>
        </Card>
        <Card className="p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-500 mb-1">已下发</p>
              <p className="text-xl lg:text-2xl font-semibold text-green-600">
                {adviceList.filter(a => a.status === 'published').length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" strokeWidth={1.5} />
            </div>
          </div>
        </Card>
        <Card className="p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-500 mb-1">草稿</p>
              <p className="text-xl lg:text-2xl font-semibold text-amber-600">
                {adviceList.filter(a => a.status === 'draft').length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
            </div>
          </div>
        </Card>
      </div>

      {adviceList.length === 0 ? (
        <Card className="p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-zinc-50 mx-auto mb-6 flex items-center justify-center">
            <Target className="h-10 w-10 text-zinc-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 mb-2">暂无职业规划建议</h3>
          <p className="text-zinc-500 mb-6">点击上方按钮生成您的第一个职业规划建议</p>
          <Button variant="ios" onClick={() => setShowGenerator(true)}>
            <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
            生成建议
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adviceList.map((advice) => (
            <Card key={advice.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4 px-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">{advice.career_direction}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={advice.status === 'published' ? 'success' : 'default'}>
                        {advice.status === 'published' ? '已下发' : '草稿'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4 px-4">
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <FileText className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                  <span>{advice.content.skills?.length || 0} 项技能</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Users className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                  <span>已分配学生</span>
                </div>
                <div className="text-xs text-zinc-400">
                  {new Date(advice.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 pb-4">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex-1" 
                  onClick={() => {
                    setPreviewAdvice(advice);
                  }}
                >
                  <FileText className="h-4 w-4 mr-1" strokeWidth={1.5} />
                  预览
                </Button>
                {advice.status === 'draft' && (
                  <Button 
                    variant="ios" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedAdvice(advice);
                      setShowStudentSelector(true);
                    }}
                  >
                    <Users className="h-4 w-4 mr-1" strokeWidth={1.5} />
                    下发
                  </Button>
                )}
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleDelete(advice.id)}
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        title="生成职业规划建议"
        size="lg"
      >
        <CareerAdviceGenerator onGenerate={handleGenerate} generating={generating} />
      </Modal>

      <Modal
        isOpen={showStudentSelector}
        onClose={() => {
          setShowStudentSelector(false);
          setSelectedStudents([]);
          setSelectedClass('');
        }}
        title="选择学生"
        size="lg"
      >
        <StudentSelector
          classes={classes}
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
          students={filteredStudents}
          selectedStudents={selectedStudents}
          onToggleStudent={toggleStudent}
          onToggleSelectAll={toggleSelectAll}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAssign={handleAssign}
        />
      </Modal>

      <Modal
        isOpen={!!previewAdvice}
        onClose={() => setPreviewAdvice(null)}
        title="建议预览"
        size="xl"
      >
        {previewAdvice && (
          <AdvicePreview 
            advice={previewAdvice} 
            onAssign={() => {
              setSelectedAdvice(previewAdvice);
              setPreviewAdvice(null);
              setShowStudentSelector(true);
            }}
            onClose={() => setPreviewAdvice(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function CareerAdviceGenerator({ 
  onGenerate, 
  generating 
}: { 
  onGenerate: (params: GenerateCareerAdviceParams) => void; 
  generating: boolean;
}) {
  const [careerDirection, setCareerDirection] = useState('');
  const [studentLevel, setStudentLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [timePeriod, setTimePeriod] = useState<'3个月' | '6个月' | '1年'>('6个月');
  const [includeResources, setIncludeResources] = useState(true);

  const handleSubmit = () => {
    if (!careerDirection.trim()) {
      alert('请输入职业方向');
      return;
    }
    onGenerate({
      career_direction: careerDirection,
      student_level: studentLevel,
      time_period: timePeriod,
      include_resources: includeResources
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-zinc-700 mb-2 block">职业方向</label>
        <input
          type="text"
          value={careerDirection}
          onChange={(e) => setCareerDirection(e.target.value)}
          placeholder="如：前端开发、数据分析师、UI设计师"
          className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-700 mb-2 block">学生水平</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'beginner', label: '初级', desc: '零基础入门' },
            { value: 'intermediate', label: '中级', desc: '有一定基础' },
            { value: 'advanced', label: '高级', desc: '深入进阶' }
          ].map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setStudentLevel(level.value as any)}
              className={`p-3 rounded-xl border-2 transition-all ${
                studentLevel === level.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className={`text-sm font-medium ${studentLevel === level.value ? 'text-indigo-600' : 'text-zinc-600'}`}>
                {level.label}
              </div>
              <div className="text-xs text-zinc-400 mt-1">{level.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-700 mb-2 block">时间周期</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '3个月', label: '3个月', desc: '短期目标' },
            { value: '6个月', label: '6个月', desc: '中期规划' },
            { value: '1年', label: '1年', desc: '长期发展' }
          ].map((period) => (
            <button
              key={period.value}
              type="button"
              onClick={() => setTimePeriod(period.value as any)}
              className={`p-3 rounded-xl border-2 transition-all ${
                timePeriod === period.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className={`text-sm font-medium ${timePeriod === period.value ? 'text-indigo-600' : 'text-zinc-600'}`}>
                {period.label}
              </div>
              <div className="text-xs text-zinc-400 mt-1">{period.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeResources}
            onChange={(e) => setIncludeResources(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-zinc-600">包含推荐学习资源</span>
        </label>
      </div>

      <div className="flex gap-4 pt-4">
        <Button variant="secondary" className="flex-1" onClick={() => {}}>
          取消
        </Button>
        <Button variant="ios" className="flex-1" onClick={handleSubmit} loading={generating}>
          生成
        </Button>
      </div>
    </div>
  );
}

function StudentSelector({
  classes,
  selectedClass,
  onSelectClass,
  students,
  selectedStudents,
  onToggleStudent,
  onToggleSelectAll,
  searchTerm,
  onSearchChange,
  onAssign
}: {
  classes: Class[];
  selectedClass: string;
  onSelectClass: (classId: string) => void;
  students: Student[];
  selectedStudents: string[];
  onToggleStudent: (studentId: string) => void;
  onToggleSelectAll: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAssign: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-zinc-700 mb-2 block">选择班级</label>
        <select
          value={selectedClass}
          onChange={(e) => onSelectClass(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
        >
          <option value="">请选择班级</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name} {cls.student_count ? `(${cls.student_count}人)` : ''}
            </option>
          ))}
        </select>
      </div>

      {selectedClass && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="搜索学生姓名..."
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              />
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className="text-sm text-zinc-500">已选 {selectedStudents.length} 人</span>
              <Button variant="secondary" size="sm" onClick={onToggleSelectAll}>
                {selectedStudents.length === students.length ? '取消全选' : '全选'}
              </Button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto border border-zinc-200 rounded-xl">
            {students.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">该班级暂无学生</div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {students.map((student) => (
                  <label
                    key={student.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => onToggleStudent(student.id)}
                      className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-zinc-900">{student.username}</div>
                      {student.class_name && (
                        <div className="text-xs text-zinc-500">{student.class_name}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {selectedStudents.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-zinc-50 rounded-xl">
              {selectedStudents.map((id) => {
                const student = students.find(s => s.id === id);
                return student ? (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-zinc-200 rounded-full text-sm text-zinc-600"
                  >
                    {student.username}
                    <button
                      onClick={() => onToggleStudent(id)}
                      className="text-zinc-400 hover:text-zinc-600"
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => {}}>
              取消
            </Button>
            <Button 
              variant="ios" 
              className="flex-1" 
              onClick={onAssign}
              disabled={selectedStudents.length === 0}
            >
              下发给 {selectedStudents.length} 名学生
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function AdvicePreview({ 
  advice, 
  onAssign,
  onClose 
}: { 
  advice: CareerAdvice; 
  onAssign: () => void;
  onClose: () => void;
}) {
  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{advice.career_direction}</h3>
        <Badge variant={advice.status === 'published' ? 'success' : 'default'}>
          {advice.status === 'published' ? '已下发' : '草稿'}
        </Badge>
      </div>

      <div className="bg-zinc-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-zinc-700 mb-2">职业概述</h4>
        <p className="text-sm text-zinc-600 whitespace-pre-wrap">{advice.content.summary}</p>
      </div>

      <div className="bg-zinc-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-zinc-700 mb-2">必备技能</h4>
        <div className="flex flex-wrap gap-2">
          {advice.content.skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-zinc-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-zinc-700 mb-2">学习路径</h4>
        <div className="space-y-3">
          {advice.content.learning_path.map((phase, index) => (
            <div key={index} className="border-l-2 border-indigo-200 pl-4">
              <div className="text-sm font-medium text-zinc-900">
                {phase.phase} <span className="text-zinc-500">({phase.duration})</span>
              </div>
              <p className="text-sm text-zinc-600 mt-1">{phase.content}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-zinc-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-zinc-700 mb-2">时间规划</h4>
        <div className="space-y-2">
          {advice.content.timeline.map((milestone, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-sm font-medium text-indigo-600">第{milestone.week}周</span>
              <div>
                <div className="text-sm font-medium text-zinc-900">{milestone.milestone}</div>
                <div className="text-xs text-zinc-500">{milestone.deliverable}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-zinc-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-zinc-700 mb-2">能力评估</h4>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-zinc-500 mb-1">当前能力</div>
            <div className="flex flex-wrap gap-1">
              {advice.content.ability_assessment?.current?.technical?.map((skill, i) => (
                <span key={i} className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-1">差距分析</div>
            <div className="flex flex-wrap gap-1">
              {advice.content.ability_assessment?.gap?.critical?.map((skill, i) => (
                <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {advice.content.resources && advice.content.resources.length > 0 && (
        <div className="bg-zinc-50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-zinc-700 mb-2">推荐资源</h4>
          <div className="space-y-2">
            {advice.content.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded">
                  {resource.type}
                </span>
                <span className="text-sm text-zinc-900 flex-1">{resource.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          关闭
        </Button>
        {advice.status === 'draft' && (
          <Button variant="ios" className="flex-1" onClick={onAssign}>
            下发给学生
          </Button>
        )}
      </div>
    </div>
  );
}
