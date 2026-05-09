import { useState } from 'react';
import { Plus, Edit, Trash2, Download, Link2, FileText, Image, Video, ChevronRight, Search, Upload } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface Resource {
  id: string;
  title: string;
  type: 'document' | 'image' | 'video' | 'link';
  category: string;
  description: string;
  url?: string;
  size?: string;
  uploaded_at: string;
  downloads: number;
}

const typeIcons = {
  document: FileText,
  image: Image,
  video: Video,
  link: Link2,
};

const typeColors = {
  document: 'from-blue-500 to-cyan-500',
  image: 'from-pink-500 to-rose-500',
  video: 'from-green-500 to-emerald-500',
  link: 'from-purple-500 to-violet-500',
};

export function TeacherResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [form, setForm] = useState({
    title: '',
    type: 'document' as Resource['type'],
    category: '',
    description: '',
    url: '',
  });

  const handleCreate = () => {
    const newResource: Resource = {
      id: Date.now().toString(),
      ...form,
      uploaded_at: new Date().toISOString().split('T')[0],
      downloads: 0,
    };
    setResources([...resources, newResource]);
    setShowCreateModal(false);
    setForm({ title: '', type: 'document', category: '', description: '', url: '' });
  };

  const handleUpdate = () => {
    if (!editingResource) return;
    setResources(resources.map(r => r.id === editingResource.id ? { ...r, ...form } : r));
    setShowEditModal(false);
    setEditingResource(null);
    setForm({ title: '', type: 'document', category: '', description: '', url: '' });
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除这个资源吗？')) return;
    setResources(resources.filter(r => r.id !== id));
  };

  const openEditModal = (resource: Resource) => {
    setEditingResource(resource);
    setForm({
      title: resource.title,
      type: resource.type,
      category: resource.category,
      description: resource.description,
      url: resource.url || '',
    });
    setShowEditModal(true);
  };

  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(search.toLowerCase()) ||
    resource.description.toLowerCase().includes(search.toLowerCase()) ||
    resource.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">学习资源管理</h1>
          <p className="text-slate-500">管理和分享教学资源</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          上传资源
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="搜索资源..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-black placeholder-zinc-400 focus:outline-none focus:ring-zinc-900 focus:border-transparent"
        />
      </div>

      {filteredResources.length === 0 ? (
      <Card variant="default" className="ceramic text-center py-16">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 mx-auto mb-6 flex items-center justify-center">
          <FileText className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">暂无资源</h3>
        <p className="text-slate-500 mb-6">点击上方按钮上传您的第一个资源</p>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          上传资源
        </Button>
      </Card>
    ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const TypeIcon = typeIcons[resource.type];
          return (
            <Card key={resource.id} variant="interactive" className="ceramic group overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeColors[resource.type]} flex items-center justify-center`}>
                  <TypeIcon className="h-6 w-6 text-white" />
                </div>
                <Badge variant="default">{resource.category}</Badge>
              </div>

              <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1">{resource.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4">{resource.description}</p>

              <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                <span>{resource.uploaded_at}</span>
                {resource.size && <span>{resource.size}</span>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <Download className="h-4 w-4" />
                  <span>{resource.downloads} 下载</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openEditModal(resource)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(resource.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="上传资源"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">资源名称</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="请输入资源名称"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">资源类型</label>
            <div className="flex gap-2">
              {(['document', 'image', 'video', 'link'] as const).map((type) => {
                const TypeIcon = typeIcons[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, type })}
                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      form.type === type
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <TypeIcon className={`h-5 w-5 ${form.type === type ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className={`text-xs font-medium ${form.type === type ? 'text-indigo-600' : 'text-slate-600'}`}>
                      {type === 'document' ? '文档' : type === 'image' ? '图片' : type === 'video' ? '视频' : '链接'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">分类</label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="如：课件、视频、图片"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">描述</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="请输入资源描述"
              rows={3}
            />
          </div>
          {form.type === 'link' && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">链接地址</label>
              <Input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="请输入链接地址"
              />
            </div>
          )}
          {form.type !== 'link' && (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
              <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 mb-2">点击或拖拽文件到此处上传</p>
              <p className="text-sm text-slate-400">支持 PDF, DOC, PNG, JPG, MP4 等格式</p>
            </div>
          )}
          <div className="flex gap-4 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCreateModal(false)}>
              取消
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleCreate}>
              上传
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingResource(null); }}
        title="编辑资源"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">资源名称</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="请输入资源名称"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">分类</label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="如：课件、视频、图片"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">描述</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="请输入资源描述"
              rows={3}
            />
          </div>
          {editingResource?.type === 'link' && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">链接地址</label>
              <Input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="请输入链接地址"
              />
            </div>
          )}
          <div className="flex gap-4 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => { setShowEditModal(false); setEditingResource(null); }}>
              取消
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleUpdate}>
              更新
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}