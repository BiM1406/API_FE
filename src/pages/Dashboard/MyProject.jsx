import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bot,
  Clock,
  Code2,
  Database,
  ExternalLink,
  FolderKanban,
  FolderPlus,
  Layers3,
  Loader2,
  MessageSquareCode,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createProject, deleteProject, getProjects } from '../../services/projectService';
import { getActivities, addActivity } from '../../services/activityService';
import { getRequestHistory } from '../../services/testService';

const STATS_DATA = [
  { label: 'Dự án', key: 'projects', icon: FolderKanban, color: 'text-indigo-400' },
  { label: 'API active', key: 'active', icon: Zap, color: 'text-amber-400' },
  { label: 'Database', value: '1.2 GB', icon: Database, color: 'text-emerald-400' },
  { label: 'AI tokens', value: '8.4k', icon: Activity, color: 'text-violet-400' }
];

const quickActions = [
  { label: 'Tạo dự án mới', icon: FolderPlus, type: 'create' },
  { label: 'Chat với AI', icon: Bot, path: '/workspace' },
  { label: 'Test API', icon: Zap, path: '/test-api' },
  { label: 'Thiết kế Database', icon: Database, path: '/database' },
  { label: 'Tạo Collection', icon: Layers3, type: 'collection' }
];

const projectActions = [
  { label: 'Workspace', icon: ExternalLink, path: '/workspace' },
  { label: 'ChatDMP', icon: Bot, path: '/workspace' },
  { label: 'Test API', icon: Zap, path: '/test-api' },
  { label: 'Database', icon: Database, path: '/database' }
];

const formatUpdated = (value) => {
  if (!value) return 'vừa xong';
  const diffMs = Date.now() - new Date(value).getTime();
  const diffHours = Math.max(0, Math.floor(diffMs / 3600000));
  if (diffHours < 1) return 'vừa xong';
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${Math.floor(diffHours / 24)} ngày trước`;
};

const recentLabel = (activity) => {
  if (!activity) return '';
  if (typeof activity.action === 'string') return activity.action;
  return activity.action?.title || activity.action?.description || activity.title || 'Hoạt động mới';
};

export default function MyProject() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [activities, setActivities] = useState([]);
  const [requests, setRequests] = useState([]);

  const filteredProjects = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return projects;
    return projects.filter((project) => (
      project.name.toLowerCase().includes(keyword) ||
      project.description.toLowerCase().includes(keyword) ||
      project.type.toLowerCase().includes(keyword) ||
      (project.tech || []).some((tag) => tag.toLowerCase().includes(keyword))
    ));
  }, [projects, search]);

  const stats = STATS_DATA.map((stat) => {
    if (stat.key === 'projects') return { ...stat, value: projects.length };
    if (stat.key === 'active') return { ...stat, value: projects.filter((item) => item.status === 'Active').length };
    return stat;
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getProjects()
      .then((items) => {
        if (!mounted) return;
        setProjects(items);
        setError('');
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Không thể tải danh sách dự án');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    setActivities(getActivities().slice(0, 5));
    setRequests(getRequestHistory().slice(0, 4));

    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateProject = async (source = 'quick') => {
    setCreating(true);
    try {
      const project = await createProject({
        name: 'Dự án API mới',
        description: 'Workspace API, ChatDMP, API Tester và Database Designer',
        type: 'API',
        tech: ['API', 'Database', 'ChatDMP']
      });
      setProjects((current) => [project, ...current]);
      addActivity({
        type: 'project',
        title: 'Tạo dự án',
        description: `Đã tạo dự án ${project.name}`,
        status: 'success'
      });
      toast.success(source === 'empty' ? 'Đã tạo dự án đầu tiên' : 'Đã tạo dự án mới');
    } catch (err) {
      toast.error(err.message || 'Không thể tạo dự án');
    } finally {
      setCreating(false);
    }
  };

  const handleQuickAction = (action) => {
    if (action.type === 'create') {
      handleCreateProject();
      return;
    }
    if (action.type === 'collection') {
      addActivity('project', 'Đã tạo collection nháp');
      toast.success('Đã tạo collection nháp');
      return;
    }
    navigate(action.path);
  };

  const handleDeleteProject = async (event, project) => {
    event.stopPropagation();
    try {
      await deleteProject(project.id);
      setProjects((current) => current.filter((item) => item.id !== project.id));
      addActivity({
        type: 'project',
        title: 'Xóa dự án',
        description: `Đã xóa dự án ${project.name}`,
        status: 'warning'
      });
      toast.success('Đã xóa dự án');
    } catch (err) {
      toast.error(err.message || 'Không thể xóa dự án');
    }
  };

  const openProject = (project, path = '/workspace') => {
    localStorage.setItem('api_fe_active_project_id', project.id);
    navigate(path === '/workspace' ? `/workspace/${project.id}` : path, { state: { projectId: project.id } });
  };

  return (
    <div className="relative min-h-full w-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid max-w-[1500px] gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 space-y-6">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">API_FE Platform</p>
              <h1 className="text-3xl font-black tracking-tight text-white lg:text-4xl">Dự án của tôi</h1>
              <p className="max-w-2xl text-sm font-medium leading-6 text-slate-400">
                Quản lý API, ChatDMP, database schema và collection trong một workspace thống nhất.
              </p>
            </div>
            <button
              onClick={() => handleCreateProject()}
              disabled={creating}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60"
            >
              {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              Dự án mới
            </button>
          </header>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-2xl border border-white/5 bg-slate-900/50 p-4 shadow-lg shadow-black/20">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-slate-950 ${stat.color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-500">{stat.label}</p>
                      <p className="text-xl font-black text-white">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-violet-300" />
              <h2 className="text-sm font-bold text-white">Quick Actions</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action)}
                    className="flex min-h-24 flex-col items-start justify-between rounded-xl border border-white/5 bg-slate-950/50 p-4 text-left transition hover:border-indigo-500/40 hover:bg-white/5"
                  >
                    <Icon size={20} className="text-indigo-300" />
                    <span className="text-sm font-bold text-white">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <FolderKanban size={19} className="text-indigo-400" />
                Workspace gần đây
              </h2>
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm project, tech, loại..."
                  className="w-full rounded-xl border border-white/5 bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500/50"
                />
              </div>
            </div>

            {loading && (
              <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-10 text-center text-slate-400">
                <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-indigo-400" />
                Đang tải danh sách dự án...
              </div>
            )}

            {!loading && error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">{error}</div>
            )}

            {!loading && !error && filteredProjects.length === 0 && (
              <div className="rounded-3xl border border-dashed border-indigo-500/30 bg-slate-900/40 p-10 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-slate-950 text-indigo-300">
                  <FolderPlus size={30} />
                </div>
                <h3 className="text-xl font-black text-white">{projects.length === 0 ? 'Chưa có project nào' : 'Không tìm thấy project phù hợp'}</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                  {projects.length === 0 ? 'Tạo project đầu tiên để bắt đầu quản lý API, database và AI workspace.' : 'Thử đổi từ khóa hoặc xóa bộ lọc tìm kiếm.'}
                </p>
                <button
                  onClick={() => handleCreateProject('empty')}
                  disabled={creating}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:opacity-60"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Tạo dự án đầu tiên
                </button>
              </div>
            )}

            {!loading && !error && filteredProjects.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {filteredProjects.map((project) => {
                  const activeColor = project.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500';
                  return (
                    <article
                      key={project.id}
                      onClick={() => openProject(project)}
                      className="group cursor-pointer rounded-2xl border border-white/5 bg-slate-900/45 p-5 shadow-xl shadow-black/20 transition hover:border-indigo-500/40 hover:bg-slate-800/70"
                    >
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${project.color || 'from-indigo-500 to-violet-500'} shadow-lg shadow-indigo-600/20`}>
                          <Code2 size={23} className="text-white" />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="flex items-center gap-1.5 rounded-full border border-white/5 bg-slate-950/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <span className={`h-1.5 w-1.5 rounded-full ${activeColor}`} />
                            {project.status}
                          </span>
                          <button
                            onClick={(event) => handleDeleteProject(event, project)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
                            aria-label="Xóa dự án"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <h3 className="truncate text-lg font-black text-white transition group-hover:text-indigo-300">{project.name}</h3>
                      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-400">{project.description}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(project.tech || ['API']).map((tag) => (
                          <span key={tag} className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/5 pt-4">
                        {projectActions.map((action) => {
                          const Icon = action.icon;
                          return (
                            <button
                              key={action.label}
                              onClick={(event) => {
                                event.stopPropagation();
                                openProject(project, action.path);
                              }}
                              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/5 bg-slate-950/50 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-white"
                            >
                              <Icon size={14} />
                              {action.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Clock size={14} />
                        Cập nhật {formatUpdated(project.updatedAt)}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Gói hiện tại</p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-xl font-black text-white">Pro Workspace</p>
                <p className="mt-1 text-sm text-slate-400">API, AI, Database</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">Active</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">AI Usage</h3>
              <MessageSquareCode size={16} className="text-violet-300" />
            </div>
            <div className="h-2 rounded-full bg-slate-950">
              <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
            </div>
            <p className="mt-3 text-xs text-slate-400">8.4k / 13.5k tokens trong tháng</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-5">
            <h3 className="mb-3 text-sm font-bold text-white">Request gần đây</h3>
            <div className="space-y-2">
              {requests.length === 0 && <p className="rounded-xl bg-slate-950/50 p-4 text-xs text-slate-500">Chưa có request nào từ API Tester.</p>}
              {requests.map((item) => (
                <button key={item.id} onClick={() => navigate('/test-api')} className="w-full rounded-xl border border-white/5 bg-slate-950/45 p-3 text-left transition hover:border-indigo-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-300">{item.method}</span>
                    <span className="text-[10px] font-bold text-slate-500">{item.status}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-400">{item.url}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-5">
            <h3 className="mb-3 text-sm font-bold text-white">Activity gần đây</h3>
            <div className="space-y-2">
              {activities.length === 0 && <p className="rounded-xl bg-slate-950/50 p-4 text-xs text-slate-500">Chưa có hoạt động nào.</p>}
              {activities.map((item) => (
                <div key={item.id} className="rounded-xl border border-white/5 bg-slate-950/45 p-3">
                  <p className="line-clamp-2 text-xs font-semibold text-slate-300">{recentLabel(item)}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">{item.category || item.type || 'system'}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
