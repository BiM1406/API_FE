import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Database, Terminal, Settings, History, User } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  const tools = [
    { name: 'AI Workspace', path: '/workspace', icon: Terminal, color: 'text-violet-400', desc: 'Manage your AI projects and chats' },
    { name: 'Database Designer', path: '/database', icon: Database, color: 'text-indigo-400', desc: 'Design and visualize ER diagrams' },
    { name: 'API Tester', path: '/test-api', icon: Terminal, color: 'text-emerald-400', desc: 'Test and debug your API endpoints' },
    { name: 'History', path: '/history', icon: History, color: 'text-amber-400', desc: 'View your past activities' },
    { name: 'Account Profile', path: '/profile', icon: User, color: 'text-slate-400', desc: 'Manage your account settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <header className="h-16 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
          <h1 className="font-bold text-white tracking-tight uppercase text-sm tracking-[0.2em]">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={() => navigate('/profile')} className="p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-all text-slate-400 hover:text-white">
             <User size={20} />
           </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto w-full flex-1 z-10 overflow-y-auto custom-scrollbar">
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Welcome back, Admin</h2>
          <p className="text-slate-400 font-medium">Select a tool below to continue your work.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.name}
                onClick={() => navigate(tool.path)}
                className="group p-6 bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl hover:border-violet-500/50 transition-all text-left shadow-xl hover:shadow-violet-500/10"
              >
                <div className={`p-3 rounded-xl bg-slate-950/50 w-fit mb-4 ${tool.color} border border-slate-800 shadow-inner group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-violet-400 transition-colors">{tool.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{tool.desc}</p>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
