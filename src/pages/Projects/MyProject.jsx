import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
import { useTranslation } from 'react-i18next';
import { createProject, deleteProject, getProjects, updateProject } from '../../services/projectService';
import { addActivity } from '../../services/activityService';

const STATS_DATA = [
  { key: 'total', icon: FolderKanban, color: 'text-indigo-400' },
  { key: 'active', icon: Zap, color: 'text-amber-400' },
  { key: 'db', icon: Database, color: 'text-emerald-400' },
  { key: 'ai', icon: Activity, color: 'text-violet-400' }
];

const formatUpdated = (value, t) => {
  if (!value) return t('projects.updated_now');
  const diffMs = Date.now() - new Date(value).getTime();
  const diffHours = Math.max(0, Math.floor(diffMs / 3600000));
  if (diffHours < 1) return t('projects.updated_now');
  if (diffHours < 24) return t('projects.updated_hours', { count: diffHours });
  return t('projects.updated_days', { count: Math.floor(diffHours / 24) });
};

export default function MyProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [activeProjectMenu, setActiveProjectMenu] = useState(null);
  const [renameState, setRenameState] = useState({ isOpen: false, id: null, value: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, project: null });

  // Click outside to close dropdown action menu
  useEffect(() => {
    const handleClickOutside = () => setActiveProjectMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadProjects = useCallback(() => {
    let mounted = true;
    setLoading(true);
    getProjects()
      .then((items) => {
        if (mounted) {
          const filtered = (items || []).filter(
            (p) => p.id !== 'mp-1' && p.id !== 'mp-2'
          );
          setProjects(filtered);
          setError('');
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || t('projects.error_loading'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [t]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

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
      if (stat.key === 'total') return { ...stat, value: projects.length.toString() };
      if (stat.key === 'active') {
        const totalApis = projects.reduce((sum, p) => sum + (p.apiCount || 0), 0);
        return { ...stat, value: totalApis.toString() };
      }
      if (stat.key === 'db') {
        const totalTables = projects.reduce((sum, p) => sum + (p.databaseTableCount || 0), 0);
        return { ...stat, value: t('projects.stats.db_value', { count: totalTables }) };
      }
      if (stat.key === 'ai') {
        const totalChats = projects.reduce((sum, p) => sum + (p.aiChatCount || 0), 0);
        return { ...stat, value: totalChats.toString() };
      }
      return { ...stat, value: '0' };
    });
  }, [projects, t]);

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
        name: nameInput || (type === 'IMPORT' ? 'Imported Project' : t('projects.new_project_api')),
        description: descInput || (type === 'IMPORT' ? t('projects.new_project_import_desc') : t('projects.new_project_api_desc')),
        type: type,
        tech: techInput || (type === 'IMPORT' ? ['OpenAPI', 'REST'] : ['API', 'Database', 'ChatDMP']),
        color: randomColor
      });

      setProjects((current) => [project, ...current]);
      setIsNewMenuOpen(false);

      addActivity({
        type: 'project',
        title: t('projects.add_activity_create_title'),
        description: t('projects.add_activity_create_desc', { name: project.name }),
        status: 'success'
      });
    } catch {
      // toast.error('Không thể tạo dự án');
    } finally {
      setCreating(false);
    }
  };


  const handleDeleteProjectClick = (event, project) => {
    event.stopPropagation();
    setActiveProjectMenu(null);
    setDeleteConfirm({ isOpen: true, project });
  };

  const submitDeleteProject = async () => {
    const project = deleteConfirm.project;
    if (!project) return;
    try {
      await deleteProject(project.id);
      setProjects((current) => current.filter((item) => item.id !== project.id));
      addActivity({
        type: 'project',
        title: t('projects.add_activity_delete_title'),
        description: t('projects.add_activity_delete_desc', { name: project.name }),
        status: 'warning'
      });
    } catch (err) {
      const isNetworkError = err.message?.includes('fetch') || err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch');
      if (!isNetworkError) {
        toast.error(err.message || 'Không thể xóa dự án');
      }
    } finally {
      setDeleteConfirm({ isOpen: false, project: null });
    }
  };

  const handleDuplicateProject = async (event, project) => {
    event.stopPropagation();
    setCreating(true);
    try {
      const duplicated = await createProject({
        name: `${project.name} (Copy)`,
        description: project.description || t('projects.duplicate_desc'),
        type: project.type || 'API',
        tech: project.tech || ['API'],
        color: project.color
      });
      setProjects((current) => [duplicated, ...current]);
      addActivity({
        type: 'project',
        title: t('projects.add_activity_duplicate_title'),
        description: t('projects.add_activity_duplicate_desc', { name: project.name }),
        status: 'success'
      });
    } catch {
      // toast.error('Không thể nhân bản dự án');
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
      setRenameState({ isOpen: false, id: null, value: '' });
    } catch {
      // toast.error('Không thể đổi tên dự án');
    }
  };

  const handleOpenProject = (project) => {
    localStorage.setItem('api_fe_active_project_id', project.id);
    navigate('/workspace', { state: { projectId: project.id } });
  };

  return (
    <div className="w-full min-h-full p-6 lg:p-10 relative">
      <div className="max-w-7xl mx-auto space-y-10">
        

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              {t('projects.title')}
            </h1>
            <p className="text-slate-400 text-base font-medium max-w-xl">
              {t('projects.desc')}
            </p>
          </div>

          <div className="relative z-50 shrink-0">
            <button
              onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
              disabled={creating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
            >
              {creating ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} strokeWidth={3} className={`transition-transform duration-300 ${isNewMenuOpen ? 'rotate-45' : ''}`} />}
              {t('projects.new_project_btn')}
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
                        <p className="text-sm font-bold text-white tracking-tight">{t('projects.create_blank')}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wide">{t('projects.start_from_scratch')}</p>
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
              <div key={stat.key} className="bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-lg flex items-center gap-4 group hover:bg-white/5 transition-colors cursor-default">
                <div className={`w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center border border-white/5 shadow-inner ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">{t('projects.stats.' + stat.key)}</p>
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
              {t('projects.recent_projects')}
            </h2>

            <div className="relative group/search">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-500 group-focus-within/search:text-indigo-400 transition-colors" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('projects.search_placeholder')}
                className="w-full sm:w-64 bg-slate-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          {loading && (
            <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-10 text-center text-slate-400">
              <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-indigo-400" />
              {t('projects.loading_projects')}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">{error}</div>
          )}

          {!loading && !error && filteredProjects.length === 0 && (
            <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-10 text-center">
              <FolderKanban className="mx-auto mb-4 h-10 w-10 text-slate-500" />
              <h3 className="text-lg font-bold text-white">{t('projects.no_projects_found')}</h3>
              <p className="mt-2 text-sm text-slate-400">{t('projects.no_projects_desc')}</p>
            </div>
          )}

          {!loading && !error && filteredProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const activeColor = project.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500';
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
                          aria-label={t('projects.open_project')}
                        >
                          <ExternalLink size={18} />
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setActiveProjectMenu(activeProjectMenu === project.id ? null : project.id);
                          }}
                          className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                          aria-label={t('projects.quick_actions')}
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
                                <Edit2 size={16} /> {t('projects.rename')}
                              </button>
                              <button
                                onClick={(event) => handleDuplicateProject(event, project)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 rounded-lg transition-colors text-left"
                              >
                                <Copy size={16} /> {t('projects.duplicate')}
                              </button>
                              <div className="h-px bg-white/5 my-1" />
                              <button
                                onClick={(event) => handleDeleteProjectClick(event, project)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                              >
                                <Trash2 size={16} /> {t('projects.delete')}
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
                        {t('projects.updated_at_prefix')} {formatUpdated(project.updatedAt, t)}
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
                {t('projects.rename_title')}
              </h3>
              <button onClick={() => setRenameState({ isOpen: false, id: null, value: '' })} className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitRename} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('projects.new_name_label')}</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={renameState.value}
                  onChange={(e) => setRenameState({ ...renameState, value: e.target.value })}
                  placeholder={t('projects.rename_placeholder')}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setRenameState({ isOpen: false, id: null, value: '' })} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  {t('projects.btn_cancel')}
                </button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                  {t('projects.btn_save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && deleteConfirm.project && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/35 backdrop-blur-[1px] animate-in fade-in duration-200"
          onClick={() => setDeleteConfirm({ isOpen: false, project: null })}
        >
          <div 
            className="relative w-full max-w-[360px] rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
            style={{ background: 'linear-gradient(135deg, rgba(30,30,60,0.95) 0%, rgba(15,15,35,0.98) 100%)', boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(239,68,68,0.08)' }}
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            
            <div className="p-6">
              <div className="flex flex-col items-center text-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl scale-150" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20 flex items-center justify-center">
                    <Trash2 size={24} className="text-red-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight">
                    {t('projects.delete_title') || 'Xóa dự án?'}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1.5 leading-relaxed px-2">
                    {t('projects.confirm_delete', { name: deleteConfirm.project.name }) || `Bạn có chắc chắn muốn xóa dự án "${deleteConfirm.project.name}" không?`}
                  </p>
                  <p className="text-slate-600 text-xs mt-2">{t('projects.confirm_warning') || 'Hành động này không thể hoàn tác.'}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm({ isOpen: false, project: null })}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-300 hover:text-white rounded-xl transition-all duration-200 border border-white/8 hover:border-white/15 hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  {t('projects.btn_cancel') || 'Hủy'}
                </button>
                <button
                  type="button"
                  onClick={submitDeleteProject}
                  className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:brightness-110 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 20px rgba(239,68,68,0.35)' }}
                >
                  {t('projects.btn_delete') || 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
