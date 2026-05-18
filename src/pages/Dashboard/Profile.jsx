import React, { useState } from 'react';
import { Plus, User, Zap, ArrowLeft, X, Mail, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast.error('Vui lòng nhập địa chỉ email hợp lệ!');
      return;
    }
    toast.success(`Đã gửi lời mời thành công đến ${inviteEmail}`);
    setIsInviteOpen(false);
    setInviteEmail('');
  };

  const userRole = localStorage.getItem('userRole') || 'user';
  const savedPlan = localStorage.getItem('userPlan') || (userRole === 'admin' ? 'pro' : 'free');
  const defaultName = userRole === 'admin' ? 'Admin User' : 'Nguyễn Tuấn Đạt';
  const userName = localStorage.getItem('userName') || defaultName;
  const userEmail = userRole === 'admin' ? 'admin@example.com' : 'user@example.com';
  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const initials = getInitials(userName);

  const planStyles = {
    free: { label: 'Gói Free', style: 'bg-slate-500/10 text-slate-300 border-slate-500/20' },
    pro: { label: 'Gói Pro', style: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    ultra: { label: 'Gói Ultra', style: 'bg-violet-500/10 text-violet-400 border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]' }
  };
  
  const currentPlanInfo = planStyles[savedPlan] || planStyles['free'];

  return (
    <div className="h-full bg-slate-950 text-slate-300 font-sans flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <header className="h-16 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
            <h1 className="font-bold text-white tracking-tight">Quản lý tài khoản</h1>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-3xl mx-auto w-full space-y-10 overflow-y-auto custom-scrollbar flex-1 z-10">
        <section>
          <h2 className="text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-3 px-1">
            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
              <User size={18} />
            </div>
            Hồ sơ cá nhân
          </h2>
          <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-2xl border border-slate-800/50 shadow-xl flex items-center gap-8 relative group overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-indigo-500/30 shrink-0 relative z-10 overflow-hidden">
               {initials}
            </div>
            <div className="flex-1 relative z-10">
              <h3 className="text-2xl font-bold text-white tracking-tight">{userName}</h3>
              <p className="text-slate-400 text-sm mb-4 font-medium">{userEmail}</p>
              <span className={`px-4 py-1.5 border rounded-full text-[10px] font-bold uppercase tracking-[0.2em] ${currentPlanInfo.style}`}>
                {currentPlanInfo.label}
              </span>
            </div>
            <button 
              onClick={() => navigate('/profile/edit')}
              className="px-5 py-2.5 bg-slate-950/50 border border-slate-800 hover:border-violet-500/50 text-white rounded-xl text-xs font-bold transition-all active:scale-95 relative z-10"
            >
              Chỉnh sửa hồ sơ
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold text-white mb-6 tracking-tight flex items-center gap-3 px-1">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Zap size={18} />
            </div>
            Thành viên nhóm
          </h3>
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/40">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Quyền truy cập</span>
              <button onClick={() => setIsInviteOpen(true)} className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-2 transition-colors">
                <Plus size={16} /> Mời thành viên
              </button>
            </div>
            <div className="divide-y divide-slate-800/50">
              <div className="p-5 flex items-center justify-between hover:bg-slate-800/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-800/80 rounded-xl flex items-center justify-center text-xs font-bold text-white border border-slate-700">AD</div>
                  <div>
                    <p className="text-sm font-bold text-white">Admin User</p>
                    <p className="text-[11px] text-slate-500 font-medium">admin@example.com</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full uppercase tracking-tighter">Chủ sở hữu</span>
              </div>
              <div className="p-5 flex items-center justify-between hover:bg-slate-800/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-xs font-bold text-indigo-400 border border-indigo-500/20">DV</div>
                  <div>
                    <p className="text-sm font-bold text-white">Developer One</p>
                    <p className="text-[11px] text-slate-500 font-medium">dev1@example.com</p>
                  </div>
                </div>
                <select className="bg-slate-950/50 text-[11px] font-bold text-slate-400 border border-slate-800 rounded-lg px-3 py-1.5 outline-none focus:border-violet-500/50 transition-all cursor-pointer">
                  <option>Chỉnh sửa</option>
                  <option>Chỉ xem</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsInviteOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <User size={18} className="text-violet-400" />
                Mời thành viên mới
              </h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleInvite} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email người nhận</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                  <input 
                    type="email" 
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="vd: colab@example.com"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cấp quyền ban đầu</label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm font-medium text-white appearance-none outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all cursor-pointer shadow-inner"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '0.65em auto' }}
                >
                  <option value="viewer">Chỉ xem (Viewer)</option>
                  <option value="editor">Chỉnh sửa (Editor)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsInviteOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  Huỷ
                </button>
                <button type="submit" className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-violet-500/20 active:scale-95">
                  <Send size={16} /> Gửi lời mời
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
