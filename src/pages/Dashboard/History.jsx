import React, { useState, useEffect } from 'react';
import { Terminal, Database, Zap, Eye, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getActivities, hideActivity, clearAllActivities } from '../../utils/activityLogger';

const getRelativeTime = (timestamp, lang, t) => {
  const rtf = new Intl.RelativeTimeFormat(lang || 'vi', { numeric: 'auto' });
  const daysDifference = Math.round((timestamp - Date.now()) / (1000 * 60 * 60 * 24));
  const hoursDifference = Math.round((timestamp - Date.now()) / (1000 * 60 * 60));
  const minutesDifference = Math.round((timestamp - Date.now()) / (1000 * 60));

  if (Math.abs(minutesDifference) < 1) return t('history.just_now');
  if (Math.abs(hoursDifference) < 1) return rtf.format(minutesDifference, 'minute');
  if (Math.abs(daysDifference) < 1) return rtf.format(hoursDifference, 'hour');
  return rtf.format(daysDifference, 'day');
};

const translateAction = (action, t) => {
  if (!action) return '';
  if (action === 'Sent message in ChatDMP') {
    return t('history.actions.sent_message');
  }
  if (action === 'Created new chat thread') {
    return t('history.actions.created_thread');
  }

  const match = action.match(/(?:Đã kiểm thử API|Tested API)\s+\[(GET|POST|PUT|DELETE|PATCH)\]\s+(https?:\/\/[^\s]+)\s+\(Status:\s*(\d+|Error)\)/i);
  if (match) {
    const [, method, url, status] = match;
    return t('test_api.activity_log', { method, url, status });
  }

  return action;
};

export default function History() {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState({ chatDmp: true, database: true, api: true });
  const [categoriesData, setCategoriesData] = useState([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const toggleCategory = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const loadActivities = () => {
    const activities = getActivities();
    const lang = i18n.language;
    const categorized = { chatDmp: [], database: [], api: [] };

    activities.forEach(act => {
      const timeStr = getRelativeTime(act.timestamp, lang, t);
      const actionStr = translateAction(act.action, t);
      if (act.category === 'chatDmp') {
        categorized.chatDmp.push({ id: act.id, action: actionStr, time: timeStr, icon: Terminal, color: 'text-violet-400' });
      } else if (act.category === 'database') {
        categorized.database.push({ id: act.id, action: actionStr, time: timeStr, icon: Database, color: 'text-indigo-400' });
      } else if (act.category === 'api') {
        categorized.api.push({ id: act.id, action: actionStr, time: timeStr, icon: Zap, color: 'text-amber-400' });
      }
    });

    setCategoriesData([
      { id: 'chatDmp', title: t('history.cat_chatdmp'), icon: Terminal, color: 'text-violet-400', hoverBorderColor: 'hover:border-violet-500/30', shadowColor: 'shadow-violet-500/10', items: categorized.chatDmp },
      { id: 'database', title: t('history.cat_database'), icon: Database, color: 'text-indigo-400', hoverBorderColor: 'hover:border-indigo-500/30', shadowColor: 'shadow-indigo-500/10', items: categorized.database },
      { id: 'api', title: t('history.cat_api'), icon: Zap, color: 'text-amber-400', hoverBorderColor: 'hover:border-amber-500/30', shadowColor: 'shadow-amber-500/10', items: categorized.api }
    ]);
  };

  useEffect(() => {
    loadActivities();
    const handleActivityLogged = () => loadActivities();
    window.addEventListener('activityLogged', handleActivityLogged);
    const interval = setInterval(loadActivities, 60000);
    return () => {
      window.removeEventListener('activityLogged', handleActivityLogged);
      clearInterval(interval);
    };
  }, [i18n.language]);

  const handleHide = (_categoryId, itemId) => hideActivity(itemId);

  return (
    <div className="h-full bg-slate-950 text-slate-300 font-sans flex flex-col relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <header className="h-16 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <h1 className="font-bold text-white tracking-tight">{t('history.title')}</h1>
          </div>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl transition-all border border-rose-500/20 text-xs font-bold"
          >
            <Trash2 size={14} /> {t('history.clear_all')}
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
                      <p className="text-xs text-slate-500 font-medium mt-1">{t('history.activities_count', { count: category.items.length })}</p>
                    </div>
                  </div>
                  <div className="p-2 text-slate-400 group-hover:text-white bg-slate-950/50 rounded-lg border border-slate-800 transition-all">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                </button>

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
                                onClick={(e) => { e.stopPropagation(); handleHide(category.id, item.id); loadActivities(); }}
                                className="p-2 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 bg-slate-900 rounded-lg border border-slate-800 transition-all opacity-0 group-hover/item:opacity-100"
                                title={t('history.hide_item')}
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500 bg-slate-950/20 rounded-xl border border-slate-800/50 mt-2">
                        {t('history.no_activities')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Clear History Confirm Modal */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center px-6 bg-black/45 backdrop-blur-[6px] animate-in fade-in duration-200"
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="relative w-full max-w-[360px] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(30,30,60,0.95) 0%, rgba(15,15,35,0.98) 100%)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(239,68,68,0.08)'
            }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

            <div className="p-6">
              {/* Icon + title */}
              <div className="flex flex-col items-center text-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl scale-150" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20 flex items-center justify-center">
                    <Trash2 size={24} className="text-red-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight">{t('history.clear_modal.title')}</h3>
                  <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                    {t('history.clear_confirm')}
                  </p>
                  <p className="text-slate-600 text-xs mt-2">{t('history.clear_modal.warning')}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-300 hover:text-white rounded-xl transition-all duration-200 border border-white/8 hover:border-white/15 hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  {t('history.clear_modal.btn_cancel')}
                </button>
                <button
                  onClick={() => {
                    clearAllActivities();
                    setShowClearConfirm(false);
                    loadActivities();
                  }}
                  className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:brightness-110 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 20px rgba(239,68,68,0.35)' }}
                >
                  {t('history.clear_modal.btn_confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
