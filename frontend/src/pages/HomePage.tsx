import { useNavigate } from 'react-router-dom';
import { 
  Target, Flame, Clock, TrendingUp, Sparkles, PenTool, Calendar, ArrowRight, Play
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const mockStats = [
  {
    icon: Clock,
    label: '学习时长',
    value: '0h',
    bgColor: 'bg-[#6366f1]/10',
    textColor: 'text-[#6366f1]',
  },
  {
    icon: Flame,
    label: '连续打卡',
    value: '0天',
    bgColor: 'bg-[#f59e0b]/10',
    textColor: 'text-[#f59e0b]',
  },
  {
    icon: Target,
    label: '完成任务',
    value: '0',
    bgColor: 'bg-[#10b981]/10',
    textColor: 'text-[#10b981]',
  },
  {
    icon: TrendingUp,
    label: '正确率',
    value: '0%',
    bgColor: 'bg-[#ec4899]/10',
    textColor: 'text-[#ec4899]',
  },
];

const categories = [
  { id: 'latest', label: '最新' },
  { id: 'math', label: '数学' },
  { id: 'english', label: '英语' },
  { id: 'science', label: '科学' },
  { id: 'tech', label: '技术' },
  { id: 'more', label: '更多' },
];

const learningContent = [
  {
    id: '1',
    title: '高等数学：极限与连续',
    category: 'math',
    duration: '45:30',
    views: '2,340',
    author: '王老师',
    date: '03-08',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mathematics%20formula%20on%20paper%20with%20blue%20background&image_size=landscape_16_9',
  },
  {
    id: '2',
    title: '英语口语：日常对话',
    category: 'english',
    duration: '30:15',
    views: '1,890',
    author: '李老师',
    date: '03-07',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=english%20conversation%20learning%20with%20people%20talking&image_size=landscape_16_9',
  },
  {
    id: '3',
    title: '人工智能基础入门',
    category: 'tech',
    duration: '52:00',
    views: '3,456',
    author: '张教授',
    date: '03-06',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=artificial%20intelligence%20neural%20network%20visualization&image_size=landscape_16_9',
  },
  {
    id: '4',
    title: '物理实验：力学基础',
    category: 'science',
    duration: '38:20',
    views: '1,567',
    author: '陈老师',
    date: '03-05',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=physics%20experiment%20mechanics%20lab%20equipment&image_size=landscape_16_9',
  },
  {
    id: '5',
    title: '线性代数：矩阵运算',
    category: 'math',
    duration: '42:10',
    views: '2,109',
    author: '王老师',
    date: '03-04',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=matrix%20mathematics%20calculation%20abstract&image_size=landscape_16_9',
  },
  {
    id: '6',
    title: '编程入门：Python基础',
    category: 'tech',
    duration: '55:45',
    views: '4,567',
    author: '赵老师',
    date: '03-03',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=python%20programming%20code%20on%20screen&image_size=landscape_16_9',
  },
  {
    id: '7',
    title: '化学实验：有机化学',
    category: 'science',
    duration: '35:00',
    views: '1,234',
    author: '孙老师',
    date: '03-02',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chemistry%20lab%20organic%20compounds%20colorful&image_size=landscape_16_9',
  },
  {
    id: '8',
    title: '商务英语：职场沟通',
    category: 'english',
    duration: '28:30',
    views: '987',
    author: '李老师',
    date: '03-01',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=business%20english%20meeting%20professional&image_size=landscape_16_9',
  },
];

export function HomePage() {
  const navigate = useNavigate();

  const goToLearning = () => {
    navigate('/student/plans');
  };

  const goToExercises = () => {
    navigate('/student/exercises');
  };

  const goToCheckins = () => {
    navigate('/student/checkins');
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat) => (
          <Card 
            key={stat.label} 
            className="ceramic p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Banner */}
      <Card className="ceramic overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-8 text-white">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-2">AI 智能学习推荐</h2>
            <p className="text-indigo-100 mb-4">根据您的学习进度，为您推荐最适合的学习内容</p>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={goToLearning}
              className="bg-white text-indigo-600 hover:bg-indigo-50"
            >
              <Sparkles className="h-5 w-5" />
              开始学习
            </Button>
          </div>
        </div>
      </Card>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              category.id === 'latest' 
                ? 'bg-indigo-500 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Learning Content Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {learningContent.map((content) => (
          <Card 
            key={content.id} 
            className="ceramic overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={goToLearning}
          >
            <div className="relative aspect-video">
              <img 
                src={content.thumbnail} 
                alt={content.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="h-6 w-6 text-indigo-500 ml-1" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                {content.duration}
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-medium text-slate-900 text-sm mb-2 line-clamp-2">{content.title}</h3>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{content.author}</span>
                <span>{content.date}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                <Play className="h-3 w-3" />
                <span>{content.views}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card 
          className="ceramic p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={goToLearning}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">AI 生成学习方案</h3>
              <p className="text-sm text-slate-500">根据职业目标定制</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={goToLearning}
            className="mt-4 bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            立即生成
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Card>
        <Card 
          className="ceramic p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={goToExercises}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">智能练习</h3>
              <p className="text-sm text-slate-500">AI 生成个性化练习题</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <PenTool className="h-6 w-6 text-white" />
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={goToExercises}
            className="mt-4 bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            开始练习
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Card>
        <Card 
          className="ceramic p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={goToCheckins}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">今日打卡</h3>
              <p className="text-sm text-slate-500">记录您的学习进度</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={goToCheckins}
            className="mt-4 bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            去打卡
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Card>
      </div>
    </div>
  );
}