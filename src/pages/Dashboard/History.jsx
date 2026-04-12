import React from 'react';
import { Terminal, Database, Zap, Folder, Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const navigate = useNavigate();
  const historyItems = [
    { id: 1, action: 'Generated User Controller', time: '10 mins ago', type: 'code', icon: Terminal, color: 'text-violet-400' },
    { id: 2, action: 'Updated ERD: Added posts table', time: '1 hour ago', type: 'db', icon: Database, color: 'text-indigo-400' },
    { id: 3, action: 'Tested Login API (Status: 200)', time: '2 hours ago', type: 'api', icon: Zap, color: 'text-amber-400' },
    { id: 4, action: 'Created new project', time: '1 day ago', type: 'system', icon: Folder, color: 'text-emerald-400' },
  ];

  return (
    <div className="h-full bg-slate-950 text-slate-300 font-sans flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <header className="h-16 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
            <h1 className="font-bold text-white tracking-tight">Activity History</h1>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-4xl mx-auto w-full flex-1 overflow-y-auto custom-scrollbar z-10">
        <div className="space-y-4">
        {historyItems.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="group flex items-center gap-5 p-5 bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl hover:border-violet-500/30 transition-all shadow-lg hover:shadow-violet-500/5">
              <div className={`p-4 bg-slate-950/50 rounded-xl ${item.color} border border-slate-800 shadow-inner`}>
                <Icon size={22} />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-lg tracking-tight group-hover:text-violet-400 transition-colors uppercase text-sm">{item.action}</p>
                <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">{item.time}</p>
              </div>
              <button className="p-2 text-slate-500 hover:text-violet-400 bg-slate-950/50 rounded-lg border border-slate-800 transition-all opacity-0 group-hover:opacity-100">
                <Eye size={18} />
              </button>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
