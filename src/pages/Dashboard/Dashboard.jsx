import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  KeyRound,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Rocket,
  Activity,
  Zap,
  Server,
  Plus,
  ChevronRight,
  BrainCircuit,
  Code2,
  Database,
  Terminal,
  LogOut,
  Cpu,
  Users,
  History,
  FlaskConical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SettingsView from './Settings';
import UserManagement from './UserManagement';
import AdminCharts from './AdminCharts';
import UserOverview from './UserOverview';
import DatabaseDesign from './DatabaseDesign';
import ApiTester from './ApiTester';
import HistoryPage from './HistoryPage';
import { useAuth } from '../../contexts/AuthContext.jsx';

// ─── Dummy Data ──────────────────────────────────────────────────────────
const ADMIN_SIDEBAR = [
  { icon: LayoutDashboard, label: 'Tổng quan', id: 'overview' },
  { icon: Users, label: 'Quản lý Users', id: 'users' },
  { icon: FolderKanban, label: 'Dự án hệ thống', id: 'projects' },
  { icon: Settings, label: 'Quản lý tài khoản', id: 'settings' },
];

const USER_SIDEBAR = [
  { icon: LayoutDashboard, label: 'Trang chủ', id: 'home' },
  { icon: Database, label: 'Thiết kế Database', id: 'database' },
  { icon: Terminal, label: 'AI Workspace', id: 'workspace', path: '/AiWorkspace' },
  { icon: FlaskConical, label: 'Kiểm thử API', id: 'apitester' },
  { icon: History, label: 'Lịch sử tra cứu', id: 'history' },
  { icon: Settings, label: 'Quản lý tài khoản', id: 'settings' },
];

const STATS = [
  { title: 'API Requests (Tháng)', value: '1,245,000', change: '+12.5%', isPositive: true, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  { title: 'Dự án đang chạy', value: '8', change: '+2', isPositive: true, icon: Rocket, color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20' },
  { title: 'Mức tải CPU/RAM', value: '42%', change: '-5.2%', isPositive: true, icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { title: 'Tỉ lệ lỗi (Error Rate)', value: '0.01%', change: '-0.05%', isPositive: true, icon: Server, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
];

const RECENT_PROJECTS = [
  { id: 1, name: 'E-commerce Core API', frameworks: ['Node.js', 'Express', 'MongoDB'], status: 'Running', time: '2 giờ trước', icon: Code2, color: 'text-green-400' },
  { id: 2, name: 'AI NLP Gateway', frameworks: ['FastAPI', 'Python', 'Redis'], status: 'Running', time: '5 giờ trước', icon: BrainCircuit, color: 'text-blue-400' },
  { id: 3, name: 'Auth Microservice', frameworks: ['Go', 'Gin', 'PostgreSQL'], status: 'Stopped', time: '1 ngày trước', icon: Database, color: 'text-gray-400' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const SIDEBAR_ITEMS = user?.role === 'admin' ? ADMIN_SIDEBAR : USER_SIDEBAR;

  const handleNavigation = (item) => {
    if (item.path) {
      navigate(item.path);
    } else {
      setActiveTab(item.id);
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex selection:bg-violet-500/30 overflow-hidden font-sans">
      {/* ─── SIDEBAR MOBILE OVERLAY ─── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ─── SIDEBAR ─── */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:static lg:block`}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/5 justify-between lg:justify-start">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              DevAI
            </span>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Menu</div>
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                    ? 'bg-violet-500/10 text-violet-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-violet-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && (
                  <motion.div layoutId="sidebar-activeIndicator" className="absolute left-0 w-1 h-6 bg-violet-500 rounded-r-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Đăng xuất</span>
          </button>
        </div>
      </motion.aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-16 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-white hidden sm:block capitalize">
              {SIDEBAR_ITEMS.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4 border border-white/10 bg-black/20 rounded-full px-4 py-1.5 focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/50 transition-all w-full max-w-sm hidden md:flex">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm dự án, API..."
              className="bg-transparent border-none outline-none text-sm text-gray-200 w-full placeholder:text-gray-600"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 p-0.5 cursor-pointer">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                <span className="text-sm font-bold text-violet-400">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE VIEW */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeTab === 'settings' && <SettingsView />}
            {activeTab === 'users' && user?.role === 'admin' && <UserManagement />}
            {activeTab === 'database' && <DatabaseDesign />}
            {activeTab === 'apitester' && <ApiTester />}
            {activeTab === 'history' && <HistoryPage />}

            {/* USER HOME */}
            {activeTab === 'home' && user?.role === 'user' && (
              <UserOverview onNavigateTab={(tab) => { setActiveTab(tab); }} />
            )}

            {/* USER OVERVIEW (backward compat) */}
            {activeTab === 'overview' && user?.role === 'user' && (
              <UserOverview onNavigateTab={(tab) => { setActiveTab(tab); }} />
            )}

            {/* ADMIN OVERVIEW */}
            {activeTab === 'overview' && user?.role === 'admin' && (
              <>
                {/* WELCOME SECTION */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                      Chào mừng trở lại, {user?.name || 'Bạn'}! 👋
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Hệ thống của bạn đang hoạt động ổn định. Dưới đây là tổng quan hiệu suất.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/AiWorkspace')}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-600/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Tạo API mới với AI
                  </button>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {STATS.map((stat, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i}
                      className={`p-5 rounded-2xl bg-slate-900 border ${stat.border} hover:border-white/20 transition-colors relative overflow-hidden group`}
                    >
                      <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 opacity-50`}></div>

                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stat.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {stat.change}
                        </span>
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
                        <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {user?.role === 'admin' && <AdminCharts />}

                {/* CHARTS / PROJECTS SPLIT */}
                <div className={`grid grid-cols-1 ${user?.role === 'admin' ? '' : 'lg:grid-cols-3'} gap-8`}>

                  {/* RECENT PROJECTS */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 rounded-2xl bg-slate-900 border border-white/5 p-6 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-white">Dự án hoạt động gần đây</h3>
                      <button className="text-sm font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1 group">
                        Xem tất cả <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-4">
                      {RECENT_PROJECTS.map((project) => (
                        <div key={project.id} className="group p-4 rounded-xl border border-white/5 hover:border-violet-500/30 bg-slate-950/50 hover:bg-slate-900 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-violet-500/30 transition-colors">
                              <project.icon className={`w-6 h-6 ${project.color}`} />
                            </div>
                            <div>
                              <h4 className="text-[15px] font-bold text-gray-200 group-hover:text-white transition-colors">{project.name}</h4>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {project.frameworks.map(fw => (
                                  <span key={fw} className="text-[10px] px-2 py-0.5 rounded border border-white/10 bg-white/5 text-gray-400">
                                    {fw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center px-2 sm:px-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`relative flex h-2 w-2`}>
                                {project.status === 'Running' && (
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                )}
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${project.status === 'Running' ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                              </span>
                              <span className={`text-xs font-medium ${project.status === 'Running' ? 'text-emerald-400' : 'text-gray-500'}`}>
                                {project.status}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-500 mt-1">{project.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* QUICK ACTIONS / SIDE CONTENT */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl flex flex-col gap-6"
                  >
                    {/* AI Assistant Mini */}
                    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group">
                      <div className="absolute -right-6 -top-6 w-32 h-32 bg-violet-500/20 blur-3xl rounded-full"></div>

                      <div className="relative z-10 w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4 border border-indigo-500/30 text-indigo-300">
                        <Terminal className="w-6 h-6" />
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2 relative z-10">Mở AI Workspace</h3>
                      <p className="text-sm text-indigo-200/70 mb-6 relative z-10 leading-relaxed">
                        Khởi tạo kiến trúc dự án, sinh mã backend và thiết kế database bằng ngôn ngữ tự nhiên ngay bây giờ.
                      </p>

                      <button
                        onClick={() => navigate('/AiWorkspace')}
                        className="w-full relative z-10 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2"
                      >
                        Bắt đầu phiên AI <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* System Status Mini */}
                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-white mb-4">Trạng thái hệ thống</h3>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">AWS Region (ap-southeast-1)</span>
                            <span className="text-emerald-400">Operational</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-1.5 border border-white/5">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Vercel Edge Network</span>
                            <span className="text-emerald-400">Operational</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-1.5 border border-white/5">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Database Cluster Load</span>
                            <span className="text-yellow-400">Warning (78%)</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-1.5 border border-white/5 overflow-hidden">
                            <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '78%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                </div>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
