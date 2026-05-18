import React, { useEffect, useState } from 'react';
import { Plus, User, Zap, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProfile, getSubscription } from '../../services/profileService';

const initials = (name = 'User') => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([getProfile(), getSubscription()])
      .then(([profileData, subscriptionData]) => {
        if (mounted) {
          setProfile(profileData);
          setSubscription(subscriptionData);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="h-full bg-slate-950 text-slate-300 font-sans flex flex-col relative overflow-hidden">
      <header className="h-16 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <h1 className="font-bold text-white tracking-tight">Quản lý tài khoản</h1>
        </div>
      </header>

      <div className="p-8 max-w-3xl mx-auto w-full space-y-10 overflow-y-auto custom-scrollbar flex-1 z-10">
        {loading ? (
          <div className="rounded-2xl border border-slate-800/50 bg-slate-900/40 p-10 text-center text-slate-400">
            <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-violet-400" />
            Đang tải hồ sơ...
          </div>
        ) : (
          <>
            <section>
              <h2 className="text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-3 px-1">
                <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                  <User size={18} />
                </div>
                Hồ sơ cá nhân
              </h2>
              <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-2xl border border-slate-800/50 shadow-xl flex flex-col sm:flex-row sm:items-center gap-8 relative group overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-indigo-500/30 shrink-0 relative z-10">
                  {initials(profile?.name || profile?.email)}
                </div>
                <div className="flex-1 min-w-0 relative z-10">
                  <h3 className="text-2xl font-bold text-white tracking-tight truncate">{profile?.name || profile?.username}</h3>
                  <p className="text-slate-400 text-sm mb-4 font-medium truncate">{profile?.email}</p>
                  <span className="px-4 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
                    Gói {subscription?.plan || profile?.plan || 'Free'}
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
                  <button className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-2 transition-colors">
                    <Plus size={16} /> Mời thành viên
                  </button>
                </div>
                <div className="p-5 flex items-center justify-between hover:bg-slate-800/20 transition-all">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-slate-800/80 rounded-xl flex items-center justify-center text-xs font-bold text-white border border-slate-700">{initials(profile?.name || profile?.email)}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{profile?.name || profile?.username}</p>
                      <p className="text-[11px] text-slate-500 font-medium truncate">{profile?.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full uppercase tracking-tighter">Chủ sở hữu</span>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
