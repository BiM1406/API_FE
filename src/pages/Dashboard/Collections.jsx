import React, { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Search, Zap, Layers, FolderOpen, Boxes } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { createCollection, deleteCollection, getCollections, saveRequest } from '../../services/collectionService';

const projectId = () => localStorage.getItem('api_fe_active_project_id') || 'default';

export default function Collections() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const load = () => {
    getCollections(projectId())
      .then(data => {
        if (isMountedRef.current) setItems(data);
      })
      .finally(() => {
        if (isMountedRef.current) setLoading(false);
      });
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) return console.error(t('collections.toast_name_required'));
    await createCollection(projectId(), { name });
    setName('');
    load();
  };

  const handleSaveSample = async (collectionId) => {
    await saveRequest(collectionId, null, { method: 'GET', url: '{{baseUrl}}/users', headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }], body: '' });
    load();
  };

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-full w-full bg-transparent p-4 sm:p-6 font-sans text-slate-300 relative overflow-hidden">
      <div className="mx-auto max-w-6xl space-y-6 relative z-10">

        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Boxes size={18} />
            </div>
            <h1 className="text-lg font-bold text-white">{t('collections.title')}</h1>
          </div>

          <div className="flex shrink-0 flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative group w-full sm:w-56">
              <div className="relative flex items-center bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2">
                <Search className="text-slate-500 w-4 h-4 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('collections.search_placeholder')}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder-slate-600"
                />
              </div>
            </div>

            <div className="relative group w-full sm:w-auto">
              <div className="relative flex items-center bg-slate-900/50 rounded-lg p-1 border border-white/10">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  className="w-full sm:w-48 bg-transparent px-3 py-1.5 text-sm text-white outline-none placeholder-slate-600"
                  placeholder={t('collections.new_folder_placeholder')}
                />
                <button
                  onClick={handleCreate}
                  className="flex items-center justify-center rounded-md bg-emerald-500 text-white p-1.5 hover:bg-emerald-400 transition-colors"
                >
                  <Plus size={16} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-3" />
              <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">{t('collections.loading')}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-white/10 bg-slate-900/20">
              <Layers className="w-12 h-12 text-slate-600 mb-4" strokeWidth={1.5} />
              <h3 className="text-base font-bold text-white mb-2">{t('collections.empty_title')}</h3>
              <p className="text-sm text-slate-500 font-medium text-center max-w-sm">{t('collections.empty_desc')}</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48">
              <Search className="w-10 h-10 text-slate-600 mb-3" strokeWidth={1.5} />
              <p className="text-sm text-slate-500 font-medium">{t('collections.no_results', { query: searchQuery })}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence>
                {filteredItems.map((item, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05, duration: 0.2 }}
                    key={item.id}
                    className="group flex flex-col h-full rounded-xl border border-white/5 bg-slate-900/60 backdrop-blur-md p-4 transition-all hover:border-emerald-500/30 hover:bg-slate-900/80"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400">
                          <FolderOpen size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-white truncate mb-0.5" title={item.name}>{item.name}</h3>
                          <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1"><Layers size={10} /> {(item.requests || []).length} API</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { deleteCollection(item.id).then(load); }}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="mt-auto pt-3 border-t border-white/5">
                      <button
                        onClick={() => handleSaveSample(item.id)}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 transition-all hover:bg-emerald-500/20 hover:text-emerald-400"
                      >
                        <Zap size={14} /> {t('collections.sample_request_btn')}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
