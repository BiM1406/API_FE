import React, { useState } from 'react';
import { Terminal, Database, Zap, Folder, Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState([
    { id: 1, action: 'Đã tạo User Controller', time: '10 phút trước', type: 'code', icon: Terminal, color: 'text-violet-400' },
    { id: 2, action: 'Đã cập nhật ERD: Thêm bảng posts', time: '1 giờ trước', type: 'db', icon: Database, color: 'text-indigo-400' },
    { id: 3, action: 'Đã kiểm thử API Login (Status: 200)', time: '2 giờ trước', type: 'api', icon: Zap, color: 'text-amber-400' },
    { id: 4, action: 'Đã tạo dự án mới', time: '1 ngày trước', type: 'system', icon: Folder, color: 'text-emerald-400' },
  ]);

  const handleHide = (id) => {
    setHistoryItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="h-full bg-slate-950 text-slate-300 font-sans flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <header className="h-16 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
            <h1 className="font-bold text-white tracking-tight">Lịch sử hoạt động</h1>
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
              <button 
                onClick={() => handleHide(item.id)}
                className="p-2 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 bg-slate-950/50 rounded-lg border border-slate-800 transition-all opacity-0 group-hover:opacity-100"
                title="Ẩn mục này"
              >
                <Eye size={18} />
              </button>
            </div>
          );
        })}
        {historyItems.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            Không có lịch sử hoạt động nào
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
