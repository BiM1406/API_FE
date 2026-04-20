import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Activity, 
  Database, 
  Cpu, 
  MoreVertical, 
  Clock, 
  Search, 
  FolderKanban, 
  Zap, 
  Code2, 
  MoreHorizontal,
  FolderPlus,
  UploadCloud
} from 'lucide-react';

const DEFAULT_PROJECTS = [
  { 
    id: 'mp-1',
    name: 'E-commerce API', 
    desc: 'Main microservice for the storefront', 
    updated: '2 giờ trước', 
    status: 'Hoạt động', 
    tech: ['Node', 'PostgreSQL', 'Redis'], 
    color: 'from-blue-500 to-indigo-500',
    activeColor: 'bg-emerald-500'
  },
  { 
    id: 'mp-2',
    name: 'Support AI Bot', 
    desc: 'RAG-based customer support assistant', 
    updated: '5 giờ trước', 
    status: 'Hoạt động', 
    tech: ['Python', 'Vector DB', 'LLM'], 
    color: 'from-violet-500 to-purple-500',
    activeColor: 'bg-emerald-500'
  },
  { 
    id: 'mp-3',
    name: 'Auth Service', 
    desc: 'Centralized SSO authentication', 
    updated: '2 ngày trước', 
    status: 'Tạm dừng', 
    tech: ['Go', 'MySQL'], 
    color: 'from-emerald-500 to-teal-500',
    activeColor: 'bg-amber-500'
  },
  { 
    id: 'mp-4',
    name: 'Analytics Engine', 
    desc: 'Data aggregation and reporting', 
    updated: '1 tuần trước', 
    status: 'Hoạt động', 
    tech: ['GraphQL', 'MongoDB'], 
    color: 'from-orange-500 to-amber-500',
    activeColor: 'bg-emerald-500'
  },
];

const STATS_DATA = [
  { label: 'Tổng dự án', value: '12', icon: FolderKanban, color: 'text-indigo-400', shadow: 'shadow-indigo-500/20' },
  { label: 'API hoạt động', value: '34', icon: Zap, color: 'text-amber-400', shadow: 'shadow-amber-500/20' },
  { label: 'Dung lượng DB', value: '1.2 GB', icon: Database, color: 'text-emerald-400', shadow: 'shadow-emerald-500/20' },
  { label: 'Tính toán AI', value: '8.4k', icon: Activity, color: 'text-violet-400', shadow: 'shadow-violet-500/20' },
];


export const MY_PROJECTS_STORAGE_KEY = 'my_dashboard_projects';

export default function MyProject() {
  const navigate = useNavigate();
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem(MY_PROJECTS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
  });

  useEffect(() => {
    localStorage.setItem(MY_PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);



  return (
    <div className="w-full min-h-full p-6 lg:p-10 relative">
      <div className="max-w-7xl mx-auto space-y-10">
        
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
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={20} strokeWidth={3} className={`transition-transform duration-300 ${isNewMenuOpen ? 'rotate-45' : ''}`} />
              Dự án mới
            </button>

            {/* Dropdown Menu */}
            {isNewMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsNewMenuOpen(false)}
                ></div>
                <div className="absolute right-0 mt-3 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-left group">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors shrink-0">
                        <FolderPlus size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight">Tạo dự án trống</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wide">Bắt đầu từ đầu</p>
                      </div>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-left group">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                        <UploadCloud size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight">Nhập dự án cục bộ</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wide">Tải lên thư mục hoặc .zip</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {STATS_DATA.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-lg flex items-center gap-4 group hover:bg-white/5 transition-colors cursor-default">
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
            
            {/* Search Bar */}
            <div className="relative group/search">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-500 group-focus-within/search:text-indigo-400 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Tìm kiếm dự án..." 
                className="w-full sm:w-64 bg-slate-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project, index) => {
              return (
                <div 
                  key={index}
                  className="group relative bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 transition-all duration-300 hover:bg-slate-800/60 hover:border-indigo-500/50 hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.2)] cursor-pointer overflow-hidden"
                >
                  {/* Magic Glow on Hover */}
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-indigo-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${project.color} flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
                      <Code2 size={24} className="text-white" />
                    </div>
                    <button className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors" aria-label="Project Actions">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">{project.name}</h3>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/50 border border-white/5">
                        <div className={`w-1.5 h-1.5 rounded-full ${project.activeColor}`}></div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{project.status}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 font-medium line-clamp-2">{project.desc}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 text-xs font-semibold text-slate-300 bg-white/5 border border-white/5 rounded-lg group-hover:border-indigo-500/20 transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      Cập nhật {project.updated}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
