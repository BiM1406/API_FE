import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Plus,
  Activity,
  Database,
  Clock,
  Search,
  FolderKanban,
  Zap,
  Code2,
  MoreHorizontal,
  FolderPlus,
  UploadCloud,
  Trash2,
  ExternalLink,
  Loader2,
  Edit2,
  Copy,
  X,
  Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createProject, deleteProject, getProjects, updateProject } from '../../services/projectService';
import { addActivity } from '../../services/activityService';

const STATS_DATA = [
  { label: 'Tổng dự án', key: 'projects', icon: FolderKanban, color: 'text-indigo-400' },
  { label: 'API hoạt động', key: 'active', icon: Zap, color: 'text-amber-400' },
  { label: 'Dung lượng DB', value: '1.2 GB', icon: Database, color: 'text-emerald-400' },
  { label: 'Tính toán AI', value: '8.4k', icon: Activity, color: 'text-violet-400' }
];

const formatUpdated = (value) => {
  if (!value) return 'vừa xong';
  const diffMs = Date.now() - new Date(value).getTime();
  const diffHours = Math.max(0, Math.floor(diffMs / 3600000));
  if (diffHours < 1) return 'vừa xong';
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${Math.floor(diffHours / 24)} ngày trước`;
};

export default function MyProject() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [activeProjectMenu, setActiveProjectMenu] = useState(null);
  const [renameState, setRenameState] = useState({ isOpen: false, id: null, value: '' });

  // Click outside to close dropdown action menu
  useEffect(() => {
    const handleClickOutside = () => setActiveProjectMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadProjects = () => {
    let mounted = true;
    setLoading(true);
    getProjects()
      .then((items) => {
        if (mounted) {
          setProjects(items);
          setError('');
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Không thể tải danh sách dự án');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return projects;
    return projects.filter((project) => (
      project.name.toLowerCase().includes(keyword) ||
      (project.description && project.description.toLowerCase().includes(keyword)) ||
      (project.type && project.type.toLowerCase().includes(keyword))
    ));
  }, [projects, search]);

  const stats = useMemo(() => {
    return STATS_DATA.map((stat) => {
      if (stat.key === 'projects') return { ...stat, value: projects.length.toString() };
      if (stat.key === 'active') return { ...stat, value: projects.filter((item) => item.status === 'Active').length.toString() };
      return { ...stat, value: stat.value || (projects.length * 2.1).toFixed(1) + 'k' };
    });
  }, [projects]);

  const handleCreateProject = async (type = 'API', nameInput = '', descInput = '', techInput = null) => {
    setCreating(true);
    try {
      const colors = [
        'from-blue-500 to-indigo-500',
        'from-violet-500 to-purple-500',
        'from-emerald-500 to-teal-500',
        'from-orange-500 to-amber-500',
        'from-pink-500 to-rose-500'
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const project = await createProject({
        name: nameInput || (type === 'IMPORT' ? 'Imported Project' : 'Dự án API mới'),
        description: descInput || (type === 'IMPORT' ? 'Dự án được nhập cục bộ' : 'Thiết kế API, database và workspace ChatDMP mới'),
        type: type,
        tech: techInput || (type === 'IMPORT' ? ['OpenAPI', 'REST'] : ['API', 'Database', 'ChatDMP']),
        color: randomColor
      });

      setProjects((current) => [project, ...current]);
      setIsNewMenuOpen(false);

      addActivity({
        type: 'project',
        title: 'Tạo dự án',
        description: `Đã tạo dự án ${project.name}`,
        status: 'success'
      });
      toast.success('Đã tạo dự án mới');
    } catch (err) {
      toast.error(err.message || 'Không thể tạo dự án');
    } finally {
      setCreating(false);
    }
  };

  const handleImportLocalClick = () => {
    setIsNewMenuOpen(false);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const pathParts = files[0].webkitRelativePath.split('/');
    const folderName = pathParts[0] || 'Dự án Cục bộ';
    
    await handleCreateProject('IMPORT', folderName, `Dự án cục bộ (${files.length} tệp)`, ['Local']);
    e.target.value = null;
  };

  const handleDeleteProjectClick = async (event, project) => {
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

  const handleDuplicateProject = async (event, project) => {
    event.stopPropagation();
    setCreating(true);
    try {
      const duplicated = await createProject({
        name: `${project.name} (Copy)`,
        description: project.description || 'Bản sao dự án',
        type: project.type || 'API',
        tech: project.tech || ['API'],
        color: project.color
      });
      setProjects((current) => [duplicated, ...current]);
      addActivity({
        type: 'project',
        title: 'Nhân bản dự án',
        description: `Đã nhân bản dự án ${project.name}`,
        status: 'success'
      });
      toast.success('Đã nhân bản dự án');
    } catch (err) {
      toast.error(err.message || 'Không thể nhân bản dự án');
    } finally {
      setCreating(false);
    }
  };

  const openRenameModal = (event, project) => {
    event.stopPropagation();
    setActiveProjectMenu(null);
    setRenameState({ isOpen: true, id: project.id, value: project.name });
  };

  const submitRename = async (e) => {
    e.preventDefault();
    if (!renameState.value.trim()) return;
    try {
      await updateProject(renameState.id, { name: renameState.value });
      setProjects((current) => current.map((p) => p.id === renameState.id ? { ...p, name: renameState.value } : p));
      toast.success('Đã đổi tên dự án');
      setRenameState({ isOpen: false, id: null, value: '' });
    } catch (err) {
      toast.error(err.message || 'Không thể đổi tên dự án');
    }
  };

  const handleOpenProject = (project) => {
    localStorage.setItem('api_fe_active_project_id', project.id);
    navigate('/workspace', { state: { projectId: project.id } });
  };

  return (
    <div className="w-full min-h-full p-6 lg:p-10 relative">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Hidden Directory Input */}
        <input 
          type="file" 
          ref={fileInputRef}
          webkitdirectory="true" 
          directory="true" 
          multiple 
          onChange={handleFileSelect}
          style={{ display: 'none' }} 
        />

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              Dự án của tôi
            </h1>
            <p className="text-slate-400 text-base font-medium max-w-xl">
              Quản lý triển khai, giám sát API và cấu hình không gian làm việc AI từ một trung tâm điều khiển hợp nhất.
            </p>
          </div>

          <div className="relative z-50 shrink-0">
            <button
              onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
              disabled={creating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
            >
              {creating ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} strokeWidth={3} className={`transition-transform duration-300 ${isNewMenuOpen ? 'rotate-45' : ''}`} />}
              Dự án mới
            </button>

            {isNewMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNewMenuOpen(false)} />
                <div className="absolute right-0 mt-3 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 space-y-1">
                    <button onClick={() => handleCreateProject('API')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-left group">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors shrink-0">
                        <FolderPlus size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight">Tạo dự án trống</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wide">Bắt đầu từ đầu</p>
                      </div>
                    </button>
                    <button onClick={handleImportLocalClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-left group">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                        <UploadCloud size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight">Nhập dự án cục bộ</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wide">Tải folder dự án lên</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-lg flex items-center gap-4 group hover:bg-white/5 transition-colors cursor-default">
                <div className={`w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center border border-white/5 shadow-inner ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Projects Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FolderKanban size={20} className="text-indigo-400" />
              Dự án gần đây
            </h2>

            <div className="relative group/search">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-500 group-focus-within/search:text-indigo-400 transition-colors" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm kiếm dự án..."
                className="w-full sm:w-64 bg-slate-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
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
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">{error}</div>
          )}

          {!loading && !error && filteredProjects.length === 0 && (
            <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-10 text-center">
              <FolderKanban className="mx-auto mb-4 h-10 w-10 text-slate-500" />
              <h3 className="text-lg font-bold text-white">Chưa có dự án phù hợp</h3>
              <p className="mt-2 text-sm text-slate-400">Tạo dự án mới hoặc thay đổi từ khóa tìm kiếm.</p>
            </div>
          )}

          {!loading && !error && filteredProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const activeColor = project.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500';
                return (
                  <div
                    key={project.id}
                    onClick={() => handleOpenProject(project)}
                    className="group relative bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 transition-all duration-300 hover:bg-slate-800/60 hover:border-indigo-500/50 hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.2)] cursor-pointer overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-indigo-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${project.color || 'from-indigo-500 to-violet-500'} flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
                        <Code2 size={24} className="text-white" />
                      </div>
                      <div className="flex items-center gap-1 relative">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenProject(project);
                          }}
                          className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                          aria-label="Mở dự án"
                        >
                          <ExternalLink size={18} />
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setActiveProjectMenu(activeProjectMenu === project.id ? null : project.id);
                          }}
                          className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                          aria-label="Thao tác nhanh"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {activeProjectMenu === project.id && (
                          <div className="absolute right-0 top-10 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                            <div className="p-1 space-y-0.5">
                              <button
                                onClick={(event) => openRenameModal(event, project)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 rounded-lg transition-colors text-left"
                              >
                                <Edit2 size={16} /> Đổi tên
                              </button>
                              <button
                                onClick={(event) => handleDuplicateProject(event, project)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 rounded-lg transition-colors text-left"
                              >
                                <Copy size={16} /> Nhân bản
                              </button>
                              <div className="h-px bg-white/5 my-1" />
                              <button
                                onClick={(event) => handleDeleteProjectClick(event, project)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                              >
                                <Trash2 size={16} /> Xóa dự án
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-3">
                        <h3 className="min-w-0 truncate text-xl font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">{project.name}</h3>
                        <div className="flex shrink-0 items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/50 border border-white/5">
                          <div className={`w-1.5 h-1.5 rounded-full ${activeColor}`} />
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{project.status}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 font-medium line-clamp-2">{project.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {(project.tech || ['API']).map((tag) => (
                        <span key={tag} className="px-2.5 py-1 text-xs font-semibold text-slate-300 bg-white/5 border border-white/5 rounded-lg group-hover:border-indigo-500/20 transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        Cập nhật {formatUpdated(project.updatedAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Rename Modal */}
      {renameState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setRenameState({ isOpen: false, id: null, value: '' })} />
          
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Edit2 size={18} className="text-indigo-400" />
                Đổi tên Dự án
              </h3>
              <button onClick={() => setRenameState({ isOpen: false, id: null, value: '' })} className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitRename} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tên mới</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={renameState.value}
                  onChange={(e) => setRenameState({ ...renameState, value: e.target.value })}
                  placeholder="Nhập tên dự án..."
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setRenameState({ isOpen: false, id: null, value: '' })} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  Huỷ
                </button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                  <Save size={16} /> Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
