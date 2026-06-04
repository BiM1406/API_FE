import React, { useEffect, useState } from 'react';
import { BookOpen, Download, Wand2, Search, FileText, LayoutTemplate, Code2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { exportMarkdown, generateDocumentationFromCollections, getDocumentation, saveDocumentation } from '../../services/documentationService';

const projectId = () => localStorage.getItem('api_fe_active_project_id') || 'default';

const METHOD_COLORS = {
  GET: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  POST: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  PUT: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  DELETE: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  PATCH: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
};

export default function Documentation() {
  const { t } = useTranslation();
  const [docs, setDocs] = useState({ endpoints: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const load = () => getDocumentation(projectId()).then(setDocs).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    try {
      const generated = await generateDocumentationFromCollections(projectId());
      if (!generated.endpoints || generated.endpoints.length === 0) {
        toast.error(t('documentation.toast_no_collection'));
        return;
      }
      setDocs(generated);
      toast.success(t('documentation.toast_generated'));
    } catch {
      toast.error(t('documentation.toast_error'));
    }
  };

  const handleExport = async () => {
    if (!docs.endpoints || docs.endpoints.length === 0) {
      toast.error(t('documentation.toast_no_docs'));
      return;
    }
    const markdown = await exportMarkdown(projectId());
    await navigator.clipboard.writeText(markdown);
    toast.success(t('documentation.toast_exported'));
  };

  const filteredEndpoints = (docs.endpoints || []).filter(ep =>
    ep.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ep.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full w-full bg-transparent p-4 sm:p-6 font-sans text-slate-300 relative overflow-hidden">
      <div className="mx-auto max-w-6xl space-y-6 relative z-10">

        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <BookOpen size={18} />
            </div>
            <h1 className="text-lg font-bold text-white">{t('documentation.title')}</h1>
          </div>

          <div className="flex shrink-0 gap-3 w-full sm:w-auto">
            <button
              onClick={handleExport}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/5 hover:border-white/20"
            >
              <Download size={16} /> {t('documentation.export_btn')}
            </button>
            <button
              onClick={handleGenerate}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-500 shadow-sm"
            >
              <Wand2 size={16} /> {t('documentation.generate_btn')}
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-[250px_minmax(0,1fr)] gap-6">

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-md p-4 shadow-sm">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('documentation.search_placeholder')}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 shadow-inner"
                />
              </div>

              <div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <FileText size={16} />
                    </div>
                    <span className="text-xs font-semibold text-slate-300">{t('documentation.total_api_label')}</span>
                  </div>
                  <span className="text-lg font-bold text-white">{(docs.endpoints || []).length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 min-h-[500px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10">
                <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3" />
                <p className="text-xs font-bold tracking-widest uppercase">{t('documentation.loading')}</p>
              </div>
            ) : (docs.endpoints || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <LayoutTemplate className="w-12 h-12 text-slate-600 mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-bold text-white mb-2">{t('documentation.empty_title')}</h3>
                <p className="text-sm text-slate-400 max-w-sm mb-6">{t('documentation.empty_desc')}</p>
                <button onClick={handleGenerate} className="px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all border border-white/10">
                  {t('documentation.generate_now_btn')}
                </button>
              </div>
            ) : filteredEndpoints.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">
                {t('documentation.no_results')}
              </div>
            ) : (
              <div className="space-y-8">
                {filteredEndpoints.map((endpoint, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.2 }}
                    key={endpoint.id}
                  >
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={`px-2.5 py-1 text-[10px] font-black tracking-widest rounded-md border ${METHOD_COLORS[endpoint.method] || METHOD_COLORS.GET}`}>
                        {endpoint.method}
                      </span>
                      <h3 className="font-mono text-sm font-bold text-white break-all">{endpoint.url}</h3>
                    </div>

                    <div className="relative rounded-xl border border-white/10 bg-slate-950/50 overflow-hidden focus-within:border-indigo-500/40 transition-colors shadow-inner">
                      <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-b border-white/5">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                          <Code2 size={12} /> {t('documentation.desc_label')}
                        </div>
                        <div className="opacity-0 focus-within:opacity-100 transition-opacity flex items-center gap-1.5">
                          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-widest">{t('documentation.auto_saving')}</span>
                        </div>
                      </div>
                      <textarea
                        defaultValue={endpoint.description}
                        onBlur={(event) => saveDocumentation(projectId(), { ...docs, endpoints: docs.endpoints.map((item) => item.id === endpoint.id ? { ...item, description: event.target.value } : item) }).then(load)}
                        className="w-full min-h-[100px] bg-transparent p-4 font-mono text-xs leading-relaxed text-slate-300 placeholder-slate-600 outline-none resize-y custom-scrollbar"
                        placeholder={t('documentation.desc_placeholder')}
                        spellCheck={false}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
