import React, { useState } from 'react';
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
  PanelLeft,
  Settings,
  LogOut,
  HelpCircle,
  ChevronUp,
  Activity,
  Users,
  DollarSign
} from 'lucide-react';
import { PolicyModal } from '../HomePage/Footer';

// Menu dành cho User
const userMenuItems = [
  { label: 'Dự án của tôi', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'ChatDMP', icon: Terminal, path: '/workspace' },
  { label: 'Thiết kế CSDL', icon: Database, path: '/database' },
  { label: 'Kiểm thử API', icon: Zap, path: '/test-api' },
  { label: 'Lịch sử hoạt động', icon: History, path: '/history' },
];

// Menu dành cho Admin
const adminMenuItems = [
  { label: 'Tổng quan hệ thống', icon: Activity, path: '/admin/overview' },
  { label: 'Quản lý người dùng', icon: Users, path: '/admin/users' },
  { label: 'Quản lý doanh thu', icon: DollarSign, path: '/admin/revenue' },
];

const SidebarItem = ({ icon: Icon, label, path, active, collapsed, onClick }) => {
  return (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative overflow-hidden ${
        active 
          ? 'bg-white/10 text-white border border-white/10 shadow-lg shadow-black/20' 
          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className={`shrink-0 transition-all duration-300 ${active ? 'text-indigo-400' : 'group-hover:text-indigo-300'}`}>
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      </div>
      
      {/* 1. KHÔNG dùng {!collapsed &&}, thay vào đó dùng w-0 và opacity-0 */}
      <span className={`text-sm font-semibold tracking-tight transition-all duration-300 whitespace-nowrap ${
        collapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-full opacity-100'
      }`}>
        {label}
      </span>
      
      {/* Tooltip (Giữ nguyên) */}
      {collapsed && (
        <div className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl border border-slate-700 uppercase tracking-widest">
          {label}
        </div>
      )}
    </Link>
  );
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  const userRole = localStorage.getItem('userRole') || 'user';
  const menuItems = userRole === 'admin' ? adminMenuItems : userMenuItems;

  const currentPath = location.pathname;

  return (
    <div className="h-screen bg-slate-950 text-slate-300 font-sans flex overflow-hidden relative selection:bg-indigo-500/30">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden md:flex flex-col border-r border-white/5 bg-slate-900/40 backdrop-blur-3xl z-40 transition-[width] duration-300 cubic-bezier(0.4, 0, 0.2, 1) relative overflow-x-hidden group/sidebar flex-none ${
          collapsed ? 'w-20' : 'w-[260px]'
        }`}
      >
        {/* Masked Header - Contents are FIXED 260px width */}
        <div className="h-20 shrink-0 relative overflow-hidden">
          <div className="w-[260px] h-full relative">
            {/* Anchored Logo - Fixed at Left-5 (20px) of the 260px container */}
            <div 
              className="absolute left-5 top-1/2 -translate-y-1/2 z-20 group/logo cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-600/20 border border-white/10 transition-all duration-200 group-hover/logo:scale-95 group-hover/logo:rotate-3">
                <Bot 
                  size={22} 
                  className={`text-white transition-opacity duration-200 ${collapsed ? 'group-hover/logo:opacity-10' : 'opacity-100'}`} 
                />
              </div>
              
              {/* Overlaid Toggle Button (Only active in Slim state) */}
              {collapsed && (
                <button 
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-all duration-200 scale-75 group-hover/logo:scale-100"
                  aria-label="Mở rộng thanh bên"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCollapsed(false);
                  }}
                >
                  <PanelLeft size={20} className="text-white rotate-180" />
                </button>
              )}
            </div>

            {/* 3. Sửa lại Header - Không cho chữ trượt sang phải nữa */}
            <div className={`absolute left-16 right-5 top-1/2 -translate-y-1/2 transition-all duration-300 flex items-center justify-between ${
              collapsed ? 'opacity-0 pointer-events-none -translate-x-2' : 'opacity-100 translate-x-0'
            }`}>
              <span 
                className="font-bold text-white tracking-tight text-sm truncate whitespace-nowrap ml-2 cursor-pointer hover:text-indigo-300 transition-colors"
                onClick={() => navigate('/')}
              >
                ChatDMP
              </span>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setCollapsed(true);
                }}
                className="p-2 ml-auto rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                aria-label="Thu nhỏ thanh bên"
              >
                <PanelLeft size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Bỏ class nhảy Layout đột ngột ở thẻ <nav> */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto overflow-x-hidden hide-scrollbar flex flex-col">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.path}
              {...item}
              active={currentPath === item.path || (currentPath.startsWith(item.path) && item.path !== '/')}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* 4. Sửa lại khối User Profile ở dưới cùng */}
        <div className="p-3 border-t border-white/5 overflow-visible relative">
          
          {/* Profile Menu Popup */}
          {isProfileMenuOpen && (
            <div className={`absolute bottom-full left-3 mb-2 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-[60] transition-all ${collapsed ? 'w-56' : 'w-[calc(100%-24px)]'}`}>
              <div className="p-4 border-b border-white/5 bg-slate-900/50">
                <p className="text-sm font-bold text-white truncate">{userRole === 'admin' ? 'Admin User' : 'Khách Hàng'}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{userRole === 'admin' ? 'admin@example.com' : 'user@example.com'}</p>
              </div>
              <div className="p-1.5">
                <button onClick={() => { navigate('/profile'); setIsProfileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-3">
                  <User size={16} className="text-indigo-400" />
                  Hồ sơ cá nhân
                </button>
                <button onClick={() => { navigate('/profile/edit'); setIsProfileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-3">
                  <Settings size={16} className="text-violet-400" />
                  Cài đặt
                </button>
                <button onClick={() => { setSupportModalOpen(true); setIsProfileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-3">
                  <HelpCircle size={16} className="text-emerald-400" />
                  Trợ giúp
                </button>
                <div className="h-px bg-white/5 my-1"></div>
                <button onClick={() => navigate('/auth')} className="w-full text-left px-3 py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all flex items-center gap-3">
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}

          {/* Transparent overlay to close menu when clicking outside */}
          {isProfileMenuOpen && (
            <div className="fixed inset-0 z-50" onClick={() => setIsProfileMenuOpen(false)}></div>
          )}

          <div 
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group/user relative z-[60]"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <div className={`rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 group-hover/user:text-white group-hover/user:bg-white/10 shadow-inner group-hover/user:border-white/20 transition-all shrink-0 ${collapsed ? 'w-10 h-10' : 'w-9 h-9'}`}>
              <Settings size={collapsed ? 20 : 18} className={`transition-transform duration-500 ${isProfileMenuOpen ? 'rotate-90' : ''}`} />
            </div>
            
            <div className={`flex-1 flex items-center justify-between overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}`}>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">Cài đặt & Tài khoản</p>
                <p className="text-[10px] text-slate-500 truncate uppercase tracking-widest">{userRole === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
              </div>
              <ChevronUp size={14} className={`text-slate-600 group-hover/user:text-white transition-transform duration-300 shrink-0 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile (unchanged structure but updated visuals) */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-[100] transition-opacity duration-500 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <aside 
        className={`md:hidden fixed inset-y-0 left-0 w-[280px] bg-slate-900 z-[101] border-r border-white/10 shadow-2xl transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 flex items-center justify-between h-20">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => { setMobileOpen(false); navigate('/'); }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-95 group-hover:rotate-3">
              <Bot size={22} className="text-white" />
            </div>
            <span className="font-bold text-white tracking-widest text-lg group-hover:text-indigo-300 transition-colors">ChatDMP</span>
          </div>
          <button 
            onClick={() => setMobileOpen(false)} 
            className="p-2.5 text-slate-400 hover:text-white bg-white/5 rounded-xl transition-all"
            aria-label="Đóng menu di động"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.path}
              {...item}
              active={currentPath === item.path || (currentPath.startsWith(item.path) && item.path !== '/')}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 md:hidden">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center transition-transform duration-200 group-hover:scale-95 group-hover:rotate-3">
              <Bot size={18} className="text-white" />
            </div>
          </div>
          <button 
            onClick={() => setMobileOpen(true)} 
            className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg border border-white/10"
            aria-label="Mở menu di động"
          >
            <Menu size={20} />
          </button>
        </header>

        <main className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto relative custom-scrollbar">
          {/* Subtle vignette effect for main content area */}
          <div className="absolute inset-0 bg-indigo-500/[0.02] pointer-events-none z-0 fixed"></div>
          <Outlet />
        </main>
      </div>

      {/* Support Modal */}
      <PolicyModal item={supportModalOpen ? 'Hỗ trợ kỹ thuật' : null} onClose={() => setSupportModalOpen(false)} />
    </div>
  );
}
