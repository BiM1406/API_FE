import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Terminal,
  Database,
  History,
  User,
  Menu,
  X,
  Zap,
  Bot,
  HelpCircle,
  LogOut,
  Settings,
  PanelLeft,
  Activity,
  Users,
  DollarSign
} from 'lucide-react';
import { PolicyModal } from '../HomePage/Footer';
import { getCurrentUser, logout } from '../../services/authService';
import { addActivity } from '../../services/activityService';

const userMenuItems = [
  { label: 'Dự án của tôi', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'ChatDMP', icon: Terminal, path: '/workspace' },
  { label: 'Thiết kế CSDL', icon: Database, path: '/database' },
  { label: 'Kiểm thử API', icon: Zap, path: '/test-api' },
  { label: 'Lịch sử hoạt động', icon: History, path: '/history' }
];

const adminMenuItems = [
  { label: 'Tổng quan hệ thống', icon: Activity, path: '/admin/overview' },
  { label: 'Quản lý người dùng', icon: Users, path: '/admin/users' },
  { label: 'Quản lý doanh thu', icon: DollarSign, path: '/admin/revenue' }
];

const SidebarItem = ({ icon, label, path, active, collapsed, onClick }) => (
  <Link
    to={path}
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`group relative flex items-center rounded-xl border transition-all ${
      collapsed ? 'justify-center gap-0 px-0 py-3' : 'justify-start gap-3 px-3 py-3'
    } ${
      active
        ? 'border-white/10 bg-white/10 text-white shadow-lg shadow-black/20'
        : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    {React.createElement(icon, {
      size: 20,
      strokeWidth: active ? 2.5 : 2,
      className: `shrink-0 transition-colors ${active ? 'text-indigo-400' : 'group-hover:text-indigo-300'}`
    })}
    <span className={`min-w-0 truncate text-sm font-semibold tracking-tight transition-all duration-200 ${
      collapsed ? 'hidden w-0 opacity-0' : 'block w-full opacity-100'
    }`}>
      {label}
    </span>
  </Link>
);

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  
  const profileMenuRef = useRef(null);

  const user = getCurrentUser();
  const userRole = user?.role === 'ADMIN' ? 'admin' : 'user';
  const menuItems = userRole === 'admin' ? adminMenuItems : userMenuItems;
  const currentPath = location.pathname;

  const handleNavigate = (path) => {
    setIsProfileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    addActivity({
      type: 'auth',
      title: 'Đăng xuất',
      description: `${userName} đăng xuất khỏi hệ thống`,
      status: 'success'
    });
    logout();
    setIsProfileMenuOpen(false);
    navigate('/');
  };

  const savedPlan = user?.plan?.toLowerCase() || 'free';
  const planDisplay = {
    free: 'Free',
    pro: 'Pro',
    ultra: 'Ultra'
  }[savedPlan] || 'Free';
  
  const userName = user?.name || 'Người dùng';
  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const initials = getInitials(userName);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Don't close if they click the sidebar toggle button
      if (e.target.closest('.sidebar-toggle')) return;
      
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-950 font-sans text-slate-300 selection:bg-indigo-500/30">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] z-0 h-[40%] w-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] z-0 h-[40%] w-[40%] rounded-full bg-violet-600/10 blur-[120px]" />

      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden md:flex flex-col border-r border-white/5 bg-slate-900/40 backdrop-blur-3xl z-40 transition-[width] duration-300 cubic-bezier(0.4, 0, 0.2, 1) relative overflow-visible group/sidebar flex-none ${
          collapsed ? 'w-20' : 'w-[260px]'
        }`}
      >
        <div className="h-20 shrink-0 overflow-hidden">
          <div className={`flex h-full items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-5'}`}>
            <button
              type="button"
              onClick={() => {
                if (collapsed) setCollapsed(false);
                else navigate('/');
              }}
              className="group/logo relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 shadow-xl shadow-indigo-600/20 transition-all hover:scale-95 hover:rotate-3"
              aria-label={collapsed ? 'Mở rộng sidebar' : 'Về trang chủ'}
            >
              <Bot size={22} className={`text-white transition-opacity ${collapsed ? 'group-hover/logo:opacity-10' : 'opacity-100'}`} />
              {collapsed && (
                <button 
                  className="sidebar-toggle absolute inset-0 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-all duration-200 scale-75 group-hover/logo:scale-100"
                  aria-label="Mở rộng thanh bên"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCollapsed(false);
                  }}
                >
                  <PanelLeft size={20} className="text-white rotate-180" />
                </button>
              )}
            </button>

            <div className={`ml-3 flex min-w-0 flex-1 items-center justify-between transition-all ${
              collapsed ? 'hidden w-0 opacity-0' : 'flex opacity-100'
            }`}>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="min-w-0 truncate text-sm font-bold tracking-tight text-white transition hover:text-indigo-300"
              >
                ChatDMP
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setCollapsed(true);
                }}
                className="sidebar-toggle p-2 ml-auto rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                aria-label="Thu nhỏ thanh bên"
              >
                <PanelLeft size={20} />
              </button>
            </div>
          </div>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col space-y-2 overflow-y-auto overflow-x-hidden px-3 py-4 hide-scrollbar">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.path}
              {...item}
              active={currentPath === item.path || (currentPath.startsWith(item.path) && item.path !== '/')}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* User Profile Footer section */}
        <div className="p-3 border-t border-white/5 overflow-visible relative" ref={profileMenuRef}>
          
          {/* Profile Menu Popup */}
          {isProfileMenuOpen && (
            <div className={`absolute bottom-full left-3 mb-2 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-[60] transition-all ${collapsed ? 'w-56' : 'w-[calc(100%-24px)]'}`}>
              <div className="p-4 border-b border-white/5 bg-slate-900/50">
                <p className="text-sm font-bold text-white whitespace-nowrap">{userName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{planDisplay}</p>
              </div>
              <div className="p-1.5">
                <button onClick={() => { handleNavigate('/profile'); }} className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-3">
                  <User size={16} className="text-indigo-400" />
                  Hồ sơ cá nhân
                </button>
                <button onClick={() => { handleNavigate('/profile/edit'); }} className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-3">
                  <Settings size={16} className="text-violet-400" />
                  Cài đặt
                </button>
                <button onClick={() => { setSupportModalOpen(true); setIsProfileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-3">
                  <HelpCircle size={16} className="text-emerald-400" />
                  Trợ giúp
                </button>
                <div className="h-px bg-white/5 my-1"></div>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all flex items-center gap-3">
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}

          <div 
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group/user relative z-[60]"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <div className={`rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 border border-white/10 flex items-center justify-center shrink-0 transition-all font-bold text-white shadow-lg shadow-indigo-500/20 ${collapsed ? 'w-10 h-10 text-sm' : 'w-9 h-9 text-xs'}`}>
              {initials}
            </div>
            
            <div className={`flex-1 flex items-center justify-between transition-all duration-300 ${collapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-full opacity-100'}`}>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-[12px] font-bold text-white whitespace-nowrap tracking-tight">{userName}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider">{planDisplay}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); navigate('/pricing'); }}
                className="ml-1 px-2 py-1 text-[9px] font-bold text-white bg-white/10 hover:bg-white/20 rounded-full border border-white/10 transition-colors shrink-0 uppercase tracking-wider"
              >
                Nâng cấp
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-md transition-opacity duration-500 md:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-[101] w-[280px] border-r border-white/10 bg-slate-900 shadow-2xl transition-transform duration-500 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between p-5">
          <button type="button" className="group flex items-center gap-4" onClick={() => { setMobileOpen(false); navigate('/'); }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg transition group-hover:scale-95 group-hover:rotate-3">
              <Bot size={22} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-widest text-white transition group-hover:text-indigo-300">ChatDMP</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-xl bg-white/5 p-2.5 text-slate-400 transition hover:text-white"
            aria-label="Đóng menu di động"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="space-y-2 p-4">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.path}
              {...item}
              active={currentPath === item.path || (currentPath.startsWith(item.path) && item.path !== '/')}
              collapsed={false}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
        <header className="flex h-16 items-center justify-between border-b border-white/5 px-6 md:hidden">
          <button type="button" className="group flex items-center gap-3" onClick={() => navigate('/')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 transition group-hover:scale-95 group-hover:rotate-3">
              <Bot size={18} className="text-white" />
            </div>
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white"
            aria-label="Mở menu di động"
          >
            <Menu size={20} />
          </button>
        </header>

        <main className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="pointer-events-none fixed inset-0 z-0 bg-indigo-500/[0.02]" />
          <Outlet />
        </main>
      </div>

      <PolicyModal item={supportModalOpen ? 'Hỗ trợ kỹ thuật' : null} onClose={() => setSupportModalOpen(false)} />
    </div>
  );
}
