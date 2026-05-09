import { useState } from 'react';
import { Target, Sparkles, Code, Briefcase, Lightbulb, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const careers = [
  {
    id: 'frontend',
    title: '前端工程师',
    icon: Code,
    description: '设计和开发用户界面，创建交互式网页应用',
    skills: ['React', 'Vue', 'TypeScript', 'CSS'],
    salary: '15K-40K',
    demand: '高',
  },
  {
    id: 'backend',
    title: '后端工程师',
    icon: Briefcase,
    description: '构建服务器端系统，处理数据和业务逻辑',
    skills: ['Python', 'Java', 'Go', 'SQL'],
    salary: '18K-50K',
    demand: '高',
  },
  {
    id: 'ai',
    title: 'AI 工程师',
    icon: Lightbulb,
    description: '开发和部署机器学习模型，构建智能系统',
    skills: ['Python', 'TensorFlow', 'PyTorch'],
    salary: '25K-80K',
    demand: '极高',
  },
  {
    id: 'product',
    title: '产品经理',
    icon: BookOpen,
    description: '规划产品功能，协调团队推动产品落地',
    skills: ['需求分析', '数据分析', '项目管理'],
    salary: '20K-60K',
    demand: '高',
  },
];

export function CareerSelectPage() {
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const selected = careers.find((c) => c.id === selectedCareer);

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 space-y-8 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 text-sm font-medium mb-4">
          <Target className="h-4 w-4" />
          职业规划
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">选择您的职业目标</h1>
        <p className="text-slate-500">选择您想从事的职业，AI 将根据该职业所需技能为您生成个性化的学习路径</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {careers.map((career) => (
          <Card
            key={career.id}
            variant={selectedCareer === career.id ? 'highlighted' : 'interactive'}
            className="cursor-pointer group"
            onClick={() => setSelectedCareer(career.id)}
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                selectedCareer === career.id ? 'bg-gradient-to-br from-indigo-500 to-indigo-400' : 'bg-slate-100 group-hover:bg-indigo-50'
              }`}>
                <career.icon className={`h-7 w-7 ${selectedCareer === career.id ? 'text-white' : 'text-slate-500'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-slate-900">{career.title}</h3>
                  <Badge variant={career.demand === '极高' ? 'error' : 'primary'}>需求{career.demand}</Badge>
                </div>
                <p className="text-sm text-slate-500 mb-3">{career.description}</p>
                <div className="flex flex-wrap gap-2">
                  {career.skills.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-sm text-slate-500">平均薪资: <span className="text-emerald-600 font-medium">{career.salary}</span></span>
            </div>
          </Card>
        ))}
      </div>

      {selected && (
        <Card variant="default" className="ceramic border border-indigo-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">为您选择了: {selected.title}</h3>
                <p className="text-sm text-slate-500">AI 将根据技能需求生成定制化学习方案</p>
              </div>
            </div>
            <Button variant="primary" size="lg" className="gap-2 whitespace-nowrap">
              <Sparkles className="h-5 w-5" />
              生成学习方案
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
