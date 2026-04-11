import React from 'react';
import { Terminal, Database, Zap, Folder, Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const navigate = useNavigate();
  const historyItems = [
    { id: 1, action: 'Generated User Controller', time: '10 mins ago', type: 'code', icon: Terminal },
    { id: 2, action: 'Updated ERD: Added posts table', time: '1 hour ago', type: 'db', icon: Database },
    { id: 3, action: 'Tested Login API (Status: 200)', time: '2 hours ago', type: 'api', icon: Zap },
    { id: 4, action: 'Created new project', time: '1 day ago', type: 'system', icon: Folder },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans flex flex-col">
      <header className="h-14 bg-[#141414] border-b border-[#262626] flex items-center px-4 gap-4 shrink-0">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-semibold text-white">Activity History</h1>
      </header>

      <div className="p-6 max-w-4xl mx-auto w-full flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
        {historyItems.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-center gap-4 p-4 bg-[#141414] border border-[#262626] rounded-lg hover:border-white/20 transition">
              <div className="p-3 bg-[#1a1a1a] rounded-full text-cyan-400">
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{item.action}</p>
                <p className="text-sm text-gray-500">{item.time}</p>
              </div>
              <button className="text-gray-500 hover:text-cyan-400 transition">
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
