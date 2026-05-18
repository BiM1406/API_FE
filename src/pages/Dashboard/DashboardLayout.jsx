import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bot,
  ChevronUp,
  Database,
  DollarSign,
  HelpCircle,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeft,
  Settings,
  Terminal,
  User,
  Users,
  X,
  Zap
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

  const currentUser = getCurrentUser();
  const userRole = currentUser?.role === 'ADMIN' ? 'admin' : 'user';
  const menuItems = userRole === 'admin' ? adminMenuItems : userMenuItems;
  const currentPath = location.pathname;
  const displayName = userRole === 'admin' ? 'Admin User' : 'Khách Hàng';
  const displayEmail = userRole === 'admin' ? 'admin@example.com' : 'user@example.com';

  const handleNavigate = (path) => {
    setIsProfileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    addActivity({
      type: 'auth',
      title: 'Dang xuat',
      description: `${displayName} dang xuat khoi he thong`,
      status: 'success'
    });
    logout();
    setIsProfileMenuOpen(false);
    navigate('/auth');
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-950 font-sans text-slate-300 selection:bg-indigo-500/30">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] z-0 h-[40%] w-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] z-0 h-[40%] w-[40%] rounded-full bg-violet-600/10 blur-[120px]" />

      <aside
        className={`relative z-40 hidden flex-none flex-col overflow-hidden border-r border-white/5 bg-slate-900/40 backdrop-blur-3xl transition-[width] duration-300 md:flex ${
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
                <PanelLeft size={20} className="absolute text-white opacity-0 transition-opacity group-hover/logo:opacity-100 rotate-180" />
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
                className="ml-3 rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-white active:scale-90"
                aria-label="Thu nhỏ sidebar"
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

        <div className={`relative shrink-0 border-t border-white/5 ${collapsed ? 'overflow-hidden p-2' : 'overflow-visible p-3'}`}>
          {isProfileMenuOpen && (
            <>
              <div className="fixed inset-0 z-50" onClick={() => setIsProfileMenuOpen(false)} />
              <div
                className={`absolute bottom-full z-[60] mb-2 overflow-hidden rounded-xl border border-white/10 bg-slate-800/95 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all ${
                  collapsed ? 'left-2 w-16' : 'left-3 w-[calc(100%-24px)]'
                }`}
              >
                {!collapsed && (
                  <div className="border-b border-white/5 bg-slate-900/50 p-4">
                    <p className="truncate text-sm font-bold text-white">{displayName}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">{displayEmail}</p>
                  </div>
                )}
                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={() => handleNavigate('/profile')}
                    title="Hồ sơ cá nhân"
                    className={`flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white ${
                      collapsed ? 'justify-center gap-0' : 'justify-start gap-3 text-left'
                    }`}
                  >
                    <User size={16} className="shrink-0 text-indigo-400" />
                    <span className={collapsed ? 'hidden' : 'truncate'}>Hồ sơ cá nhân</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/profile/edit')}
                    title="Cài đặt"
                    className={`flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white ${
                      collapsed ? 'justify-center gap-0' : 'justify-start gap-3 text-left'
                    }`}
                  >
                    <Settings size={16} className="shrink-0 text-violet-400" />
                    <span className={collapsed ? 'hidden' : 'truncate'}>Cài đặt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSupportModalOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    title="Trợ giúp"
                    className={`flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white ${
                      collapsed ? 'justify-center gap-0' : 'justify-start gap-3 text-left'
                    }`}
                  >
                    <HelpCircle size={16} className="shrink-0 text-emerald-400" />
                    <span className={collapsed ? 'hidden' : 'truncate'}>Trợ giúp</span>
                  </button>
                  <div className="my-1 h-px bg-white/5" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Đăng xuất"
                    className={`flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300 ${
                      collapsed ? 'justify-center gap-0' : 'justify-start gap-3 text-left'
                    }`}
                  >
                    <LogOut size={16} className="shrink-0" />
                    <span className={collapsed ? 'hidden' : 'truncate'}>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="button"
            title={collapsed ? 'Cài đặt & tài khoản' : undefined}
            className={`relative z-[60] flex w-full items-center overflow-hidden rounded-xl p-2 transition hover:bg-white/5 ${
              collapsed ? 'justify-center gap-0' : 'justify-start gap-3'
            }`}
            onClick={() => setIsProfileMenuOpen((open) => !open)}
          >
            <div className={`flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-800 text-slate-400 shadow-inner transition group-hover/user:bg-white/10 ${
              collapsed ? 'h-10 w-10' : 'h-9 w-9'
            }`}>
              <Settings size={collapsed ? 20 : 18} className={`transition-transform duration-500 ${isProfileMenuOpen ? 'rotate-90' : ''}`} />
            </div>

            <div className={`min-w-0 flex-1 items-center justify-between overflow-hidden transition-all duration-200 ${
              collapsed ? 'hidden w-0 opacity-0' : 'flex w-full opacity-100'
            }`}>
              <div className="min-w-0 text-left">
                <p className="truncate text-xs font-bold text-white">Cài đặt & Tài khoản</p>
                <p className="truncate text-[10px] uppercase tracking-widest text-slate-500">{userRole === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
              </div>
              <ChevronUp size={14} className={`shrink-0 text-slate-600 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>
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
