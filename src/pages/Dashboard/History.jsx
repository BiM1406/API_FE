import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  CreditCard,
  Database,
  Eye,
  KeyRound,
  LayoutDashboard,
  Search,
  Terminal,
  Trash2,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { clearActivities, getActivities, removeActivity } from '../../services/activityService';

const modules = [
  { id: 'chatDmp', title: 'ChatDMP', icon: Terminal, color: 'text-violet-400' },
  { id: 'database', title: 'Database', icon: Database, color: 'text-indigo-400' },
  { id: 'api', aliases: ['apiTester', 'api tester'], title: 'API Tester', icon: Zap, color: 'text-amber-400' },
  { id: 'project', title: 'Project', icon: LayoutDashboard, color: 'text-emerald-400' },
  { id: 'payment', title: 'Payment', icon: CreditCard, color: 'text-cyan-400' },
  { id: 'auth', title: 'Auth', icon: KeyRound, color: 'text-rose-400' }
];

const timeFilters = [
  { id: 'all', label: 'Tất cả' },
  { id: 'today', label: 'Hôm nay' },
  { id: 'week', label: '7 ngày' },
  { id: 'month', label: '30 ngày' }
];

const getRelativeTime = (timestamp) => {
  const date = Number(timestamp) || new Date(timestamp).getTime() || Date.now();
  const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });
  const daysDifference = Math.round((date - Date.now()) / (1000 * 60 * 60 * 24));
  const hoursDifference = Math.round((date - Date.now()) / (1000 * 60 * 60));
  const minutesDifference = Math.round((date - Date.now()) / (1000 * 60));

  if (Math.abs(minutesDifference) < 1) return 'Vừa xong';
  if (Math.abs(hoursDifference) < 1) return rtf.format(minutesDifference, 'minute');
  if (Math.abs(daysDifference) < 1) return rtf.format(hoursDifference, 'hour');
  return rtf.format(daysDifference, 'day');
};

const getText = (activity) => {
  if (typeof activity.action === 'string') return activity.action;
  return activity.action?.title || activity.action?.description || activity.title || activity.description || 'Hoạt động mới';
};

const getCategory = (activity) => activity.category || activity.type || 'project';

const inTimeRange = (activity, filter) => {
  if (filter === 'all') return true;
  const timestamp = Number(activity.timestamp) || new Date(activity.timestamp).getTime();
  const age = Date.now() - timestamp;
  if (filter === 'today') return age <= 24 * 60 * 60 * 1000;
  if (filter === 'week') return age <= 7 * 24 * 60 * 60 * 1000;
  return age <= 30 * 24 * 60 * 60 * 1000;
};

export default function History() {
  const [expanded, setExpanded] = useState(Object.fromEntries(modules.map((item) => [item.id, true])));
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  const loadActivities = () => setActivities(getActivities());

  useEffect(() => {
    loadActivities();
    window.addEventListener('activityLogged', loadActivities);
    const interval = setInterval(loadActivities, 60000);
    return () => {
      window.removeEventListener('activityLogged', loadActivities);
      clearInterval(interval);
    };
  }, []);

  const filteredActivities = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return activities.filter((activity) => {
      const category = getCategory(activity);
      const moduleMatch = moduleFilter === 'all' || category === moduleFilter;
      const keywordMatch = !keyword || getText(activity).toLowerCase().includes(keyword) || category.toLowerCase().includes(keyword);
      return moduleMatch && keywordMatch && inTimeRange(activity, timeFilter);
    });
  }, [activities, search, moduleFilter, timeFilter]);

  const categorized = useMemo(() => modules.map((module) => ({
    ...module,
    items: filteredActivities.filter((activity) => {
      const category = getCategory(activity);
      return category === module.id || module.aliases?.includes(category);
    })
  })), [filteredActivities]);

  const totalToday = activities.filter((activity) => inTimeRange(activity, 'today')).length;
  const activeModules = modules.filter((module) => activities.some((activity) => getCategory(activity) === module.id || module.aliases?.includes(getCategory(activity)))).length;

  const handleHide = (itemId) => {
    removeActivity(itemId);
    loadActivities();
  };

  const handleClear = () => {
    clearActivities();
    setActivities([]);
    toast.success('Đã xóa lịch sử hoạt động');
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-950 text-slate-300">
      <header className="z-20 flex min-h-16 shrink-0 flex-col gap-3 border-b border-white/5 bg-slate-900/50 px-4 py-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-300">Audit trail</p>
          <h1 className="mt-1 text-xl font-black tracking-tight text-white">Lịch sử hoạt động</h1>
        </div>
        <button onClick={handleClear} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/20">
          <Trash2 size={16} /> Clear history
        </button>
      </header>

      <main className="z-10 min-h-0 flex-1 overflow-y-auto p-4 custom-scrollbar lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Tổng hoạt động" value={activities.length} />
            <SummaryCard label="Hôm nay" value={totalToday} />
            <SummaryCard label="Module active" value={activeModules} />
          </div>

          <section className="rounded-2xl border border-white/5 bg-slate-900/45 p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search activity..."
                  className="w-full rounded-xl border border-white/5 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-violet-500/50"
                />
              </div>
              <select value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)} className="rounded-xl border border-white/5 bg-slate-950/60 px-3 py-3 text-sm text-slate-200 outline-none focus:border-violet-500/50">
                <option value="all" className="bg-slate-900">Tất cả module</option>
                {modules.map((module) => <option key={module.id} value={module.id} className="bg-slate-900">{module.title}</option>)}
              </select>
              <select value={timeFilter} onChange={(event) => setTimeFilter(event.target.value)} className="rounded-xl border border-white/5 bg-slate-950/60 px-3 py-3 text-sm text-slate-200 outline-none focus:border-violet-500/50">
                {timeFilters.map((filter) => <option key={filter.id} value={filter.id} className="bg-slate-900">{filter.label}</option>)}
              </select>
            </div>
          </section>

          {filteredActivities.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/35 p-10 text-center">
              <Terminal size={42} className="mx-auto mb-4 text-slate-500" />
              <h2 className="text-xl font-black text-white">Chưa có hoạt động phù hợp</h2>
              <p className="mt-2 text-sm text-slate-500">Thay đổi bộ lọc hoặc bắt đầu thao tác trong ChatDMP, Database, API Tester.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categorized.filter((category) => moduleFilter === 'all' || category.id === moduleFilter).map((category) => {
                const CategoryIcon = category.icon;
                const isExpanded = expanded[category.id];
                return (
                  <section key={category.id} className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40">
                    <button
                      onClick={() => setExpanded((current) => ({ ...current, [category.id]: !current[category.id] }))}
                      className="flex w-full items-center justify-between p-5 text-left transition hover:bg-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`rounded-xl border border-white/5 bg-slate-950/60 p-3 ${category.color}`}>
                          <CategoryIcon size={20} />
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-white">{category.title}</h2>
                          <p className="text-xs font-medium text-slate-500">{category.items.length} hoạt động</p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-white/5 p-4">
                        {category.items.length === 0 ? (
                          <div className="rounded-xl border border-white/5 bg-slate-950/30 p-5 text-center text-sm text-slate-500">Không có hoạt động nào trong mục này</div>
                        ) : (
                          <div className="space-y-2">
                            {category.items.map((item) => (
                              <div key={item.id} className="group flex items-center gap-4 rounded-xl border border-white/5 bg-slate-950/40 p-4 transition hover:border-violet-500/25">
                                <div className={`rounded-lg bg-slate-900 p-2 ${category.color}`}>
                                  <CategoryIcon size={16} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-white">{getText(item)}</p>
                                  <p className="mt-1 text-xs text-slate-500">{getRelativeTime(item.timestamp)}</p>
                                </div>
                                <button onClick={() => handleHide(item.id)} className="rounded-lg border border-white/5 bg-slate-900 p-2 text-slate-500 opacity-100 transition hover:bg-violet-500/10 hover:text-violet-300 md:opacity-0 md:group-hover:opacity-100" title="Ẩn mục này">
                                  <Eye size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/45 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  );
}
