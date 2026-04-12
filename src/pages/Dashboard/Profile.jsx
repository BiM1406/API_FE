import React from 'react';
import { Plus, User, Zap, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  return (
    <div className="h-full bg-slate-950 text-slate-300 font-sans flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <header className="h-16 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
            <h1 className="font-bold text-white tracking-tight">Account Management</h1>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-3xl mx-auto w-full space-y-10 overflow-y-auto custom-scrollbar flex-1 z-10">
        <section>
          <h2 className="text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-3 px-1">
            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
              <User size={18} />
            </div>
            Account Profile
          </h2>
          <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-2xl border border-slate-800/50 shadow-xl flex items-center gap-8 relative group overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-indigo-500/30 shrink-0 relative z-10">
              AD
            </div>
            <div className="flex-1 relative z-10">
              <h3 className="text-2xl font-bold text-white tracking-tight">Admin User</h3>
              <p className="text-slate-400 text-sm mb-4 font-medium">admin@example.com</p>
              <span className="px-4 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
                Pro Plan
              </span>
            </div>
            <button className="px-5 py-2.5 bg-slate-950/50 border border-slate-800 hover:border-violet-500/50 text-white rounded-xl text-xs font-bold transition-all active:scale-95 relative z-10">
              Edit Profile
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold text-white mb-6 tracking-tight flex items-center gap-3 px-1">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Zap size={18} />
            </div>
            Team Members
          </h3>
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/40">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Workspace Access</span>
              <button className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-2 transition-colors">
                <Plus size={16} /> Invite Member
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
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full uppercase tracking-tighter">Owner</span>
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
                  <option>Editor</option>
                  <option>Viewer</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
