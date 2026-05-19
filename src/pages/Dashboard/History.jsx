import React, { useState, useEffect } from 'react';
import { Terminal, Database, Zap, Folder, Eye, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { getActivities, hideActivity, clearAllActivities } from '../../utils/activityLogger';

const getRelativeTime = (timestamp) => {
  const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });
  const daysDifference = Math.round((timestamp - Date.now()) / (1000 * 60 * 60 * 24));
  const hoursDifference = Math.round((timestamp - Date.now()) / (1000 * 60 * 60));
  const minutesDifference = Math.round((timestamp - Date.now()) / (1000 * 60));

  if (Math.abs(minutesDifference) < 1) return 'Vừa xong';
  if (Math.abs(hoursDifference) < 1) return rtf.format(minutesDifference, 'minute');
  if (Math.abs(daysDifference) < 1) return rtf.format(hoursDifference, 'hour');
  return rtf.format(daysDifference, 'day');
};

export default function History() {
  // State for accordions
  const [expanded, setExpanded] = useState({
    chatDmp: true,
    database: true,
    api: true,
  });

  const [categoriesData, setCategoriesData] = useState([]);

  const toggleCategory = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const loadActivities = () => {
    const activities = getActivities();
    
    const categorized = {
      chatDmp: [],
      database: [],
      api: []
    };

    activities.forEach(act => {
      const timeStr = getRelativeTime(act.timestamp);
      if (act.category === 'chatDmp') {
        categorized.chatDmp.push({ id: act.id, action: act.action, time: timeStr, icon: Terminal, color: 'text-violet-400' });
      } else if (act.category === 'database') {
        categorized.database.push({ id: act.id, action: act.action, time: timeStr, icon: Database, color: 'text-indigo-400' });
      } else if (act.category === 'api') {
        categorized.api.push({ id: act.id, action: act.action, time: timeStr, icon: Zap, color: 'text-amber-400' });
      }
    });

    setCategoriesData([
      {
        id: 'chatDmp',
        title: 'ChatDMP',
        icon: Terminal,
        color: 'text-violet-400',
        hoverBorderColor: 'hover:border-violet-500/30',
        shadowColor: 'shadow-violet-500/10',
        items: categorized.chatDmp
      },
      {
        id: 'database',
        title: 'Thiết kế CSDL',
        icon: Database,
        color: 'text-indigo-400',
        hoverBorderColor: 'hover:border-indigo-500/30',
        shadowColor: 'shadow-indigo-500/10',
        items: categorized.database
      },
      {
        id: 'api',
        title: 'Kiểm thử API',
        icon: Zap,
        color: 'text-amber-400',
        hoverBorderColor: 'hover:border-amber-500/30',
        shadowColor: 'shadow-amber-500/10',
        items: categorized.api
      }
    ]);
  };

  useEffect(() => {
    loadActivities();
    
    const handleActivityLogged = () => {
      loadActivities();
    };

    window.addEventListener('activityLogged', handleActivityLogged);
    
    // Refresh relative times every minute
    const interval = setInterval(loadActivities, 60000);

    return () => {
      window.removeEventListener('activityLogged', handleActivityLogged);
      clearInterval(interval);
    };
  }, []);

  const handleHide = (categoryId, itemId) => {
    hideActivity(itemId);
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
          <button 
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử hệ thống?')) {
                clearAllActivities();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl transition-all border border-rose-500/20 text-xs font-bold"
          >
            <Trash2 size={14} /> Xóa toàn bộ
          </button>
        </div>
      </header>

      <div className="p-8 max-w-4xl mx-auto w-full flex-1 overflow-y-auto custom-scrollbar z-10">
        <div className="space-y-6">
          {categoriesData.map(category => {
            const CategoryIcon = category.icon;
            const isExpanded = expanded[category.id];
            
            return (
              <div key={category.id} className={`bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg ${isExpanded ? category.shadowColor : ''}`}>
                {/* Accordion Header */}
                <button 
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-800/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 bg-slate-950/50 rounded-xl ${category.color} border border-slate-800 shadow-inner group-hover:scale-105 transition-transform`}>
                      <CategoryIcon size={20} />
                    </div>
                    <div className="text-left">
                      <h2 className="text-white font-bold text-lg tracking-tight group-hover:text-violet-400 transition-colors">{category.title}</h2>
                      <p className="text-xs text-slate-500 font-medium mt-1">{category.items.length} hoạt động</p>
                    </div>
                  </div>
                  <div className="p-2 text-slate-400 group-hover:text-white bg-slate-950/50 rounded-lg border border-slate-800 transition-all">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/50">
                    {category.items.length > 0 ? (
                      <div className="space-y-3 mt-2">
                        {category.items.map(item => {
                          const ItemIcon = item.icon;
                          return (
                            <div key={item.id} className={`group/item flex items-center gap-4 p-4 bg-slate-950/40 rounded-xl border border-slate-800 ${category.hoverBorderColor} transition-all`}>
                              <div className={`p-2 bg-slate-900 rounded-lg ${item.color}`}>
                                <ItemIcon size={16} />
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-medium text-sm tracking-wide group-hover/item:text-slate-200 transition-colors uppercase">{item.action}</p>
                                <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleHide(category.id, item.id);
                                }}
                                className="p-2 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 bg-slate-900 rounded-lg border border-slate-800 transition-all opacity-0 group-hover/item:opacity-100"
                                title="Ẩn mục này"
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500 bg-slate-950/20 rounded-xl border border-slate-800/50 mt-2">
                        Không có hoạt động nào trong mục này
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
