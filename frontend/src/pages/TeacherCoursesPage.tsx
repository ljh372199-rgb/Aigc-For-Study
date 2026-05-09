import { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, ChevronRight, Search, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
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

export function TeacherCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({ title: '', description: '', cover_image: '' });

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

  const handleCreate = async () => {
    try {
      await courseApi.create({
        title: form.title,
        description: form.description,
        cover_image: form.cover_image || undefined,
      });
      setShowCreateModal(false);
      setForm({ title: '', description: '', cover_image: '' });
      loadCourses();
    } catch (error) {
      console.error('创建课程失败:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editingCourse) return;
    try {
      await courseApi.update(editingCourse.id, {
        title: form.title,
        description: form.description,
        cover_image: form.cover_image,
      });
      setShowEditModal(false);
      setEditingCourse(null);
      setForm({ title: '', description: '', cover_image: '' });
      loadCourses();
    } catch (error) {
      console.error('更新课程失败:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个课程吗？')) return;
    try {
      await courseApi.delete(id);
      loadCourses();
    } catch (error) {
      console.error('删除课程失败:', error);
    }
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setForm({
      title: course.title,
      description: course.description,
      cover_image: course.cover_image || '',
    });
    setShowEditModal(true);
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    course.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-zinc-900 mb-2">课程管理</h1>
          <p className="text-zinc-500">管理您的课程资源</p>
        </div>
        <Button variant="ios" size="lg" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          创建课程
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="搜索课程..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-100 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:ring-1 focus:ring-zinc-300 focus:border-zinc-300 outline-none transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-14 h-14 rounded-xl bg-zinc-50 mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="h-7 w-7 text-zinc-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">暂无课程</h3>
          <p className="text-zinc-500">点击上方按钮创建您的第一门课程</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden group hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                {course.cover_image ? (
                  <img src={course.cover_image} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="h-12 w-12 text-zinc-300" strokeWidth={1.5} />
                )}
              </div>

              <div className="flex items-start justify-between mb-3 px-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-zinc-900 line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-zinc-500 line-clamp-2 mt-1">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4 px-4">
                {course.student_count !== undefined && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" strokeWidth={1.5} />
                    {course.student_count} 人学习
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 px-4 pb-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditModal(course)}
                >
                  <Edit className="h-4 w-4" strokeWidth={1.5} />
                  编辑
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(course.id)}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </Button>
                <Button variant="secondary" size="sm">
                  <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建课程"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-600 mb-2 block">课程名称</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="请输入课程名称"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-600 mb-2 block">课程描述</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="请输入课程描述"
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-600 mb-2 block">封面图片 URL（可选）</label>
            <Input
              value={form.cover_image}
              onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
              placeholder="请输入图片链接"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCreateModal(false)}>
              取消
            </Button>
            <Button variant="ios" className="flex-1" onClick={handleCreate}>
              创建
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingCourse(null); }}
        title="编辑课程"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-600 mb-2 block">课程名称</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="请输入课程名称"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-600 mb-2 block">课程描述</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="请输入课程描述"
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-600 mb-2 block">封面图片 URL（可选）</label>
            <Input
              value={form.cover_image}
              onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
              placeholder="请输入图片链接"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => { setShowEditModal(false); setEditingCourse(null); }}>
              取消
            </Button>
            <Button variant="ios" className="flex-1" onClick={handleUpdate}>
              更新
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}