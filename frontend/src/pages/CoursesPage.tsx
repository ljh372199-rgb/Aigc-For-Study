import { useState, useEffect } from 'react';
import { BookOpen, Users, ChevronRight, Play } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { courseApi } from '@/services/api';

interface Course {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  teacher_id: string;
  teacher_name?: string;
  status: string;
  student_count?: number;
  lessons_count?: number;
}

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await courseApi.getAll();
      setCourses(res.data);
    } catch (error) {
      console.error('加载课程列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await courseApi.enroll(courseId);
      alert('报名成功！');
      loadCourses();
    } catch (error) {
      console.error('报名失败:', error);
      alert('报名失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">课程中心</h1>
          <p className="text-slate-500">发现优质课程资源，提升学习效率</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <Card variant="default" className="ceramic text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">暂无课程</h3>
          <p className="text-slate-500">敬请期待更多优质课程</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} variant="interactive" className="ceramic group overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                {course.cover_image ? (
                  <img src={course.cover_image} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="h-12 w-12 text-white/50" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-5 w-5 text-indigo-600 ml-1" />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                {course.teacher_name && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.teacher_name}
                  </div>
                )}
                {course.student_count !== undefined && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.student_count} 人学习
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="primary" size="sm" className="flex-1" onClick={() => handleEnroll(course.id)}>
                  立即报名
                </Button>
                <Button variant="secondary" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
