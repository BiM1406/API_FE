import React, { useEffect, useState } from 'react';
import { Copy, Trash2, Server, Terminal, Sparkles, CheckCircle2, Code2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { createMockEndpoint, deleteMockEndpoint, generateMockResponse, getMockEndpoints, updateMockEndpoint } from '../../services/mockServerService';

const projectId = () => localStorage.getItem('api_fe_active_project_id') || 'default';

const METHOD_COLORS = {
  GET: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  POST: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  PUT: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  DELETE: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  PATCH: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
};

export default function MockServer() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({ method: 'GET', path: '/api/mock', statusCode: 200, responseBody: '{\n  "success": true\n}' });
  const [isGenerating, setIsGenerating] = useState(false);

  const load = () => getMockEndpoints(projectId()).then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      if (!draft.path.startsWith('/')) {
        console.error(t('mock_server.toast_path_error'));
        return;
      }
      await createMockEndpoint(projectId(), draft);
      console.log(t('mock_server.toast_created'));
      load();
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleAi = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateMockResponse(draft);
      setDraft((current) => ({ ...current, ...generated }));
      console.log(t('mock_server.toast_ai_done'));
    } catch (error) {
      console.error(error.message || t('mock_server.toast_ai_error'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-full w-full bg-transparent p-4 sm:p-6 font-sans text-slate-300 relative overflow-hidden">
      <div className="mx-auto max-w-6xl space-y-6 relative z-10">

        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
              <Server size={18} />
            </div>
            <h1 className="text-lg font-bold text-white">{t('mock_server.title')}</h1>
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6">

          <section className="rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-md p-5 shadow-sm h-fit">
            <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
              <Terminal size={16} className="text-pink-400" /> {t('mock_server.create_section_title')}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-[100px_1fr] gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block tracking-widest">{t('mock_server.label_method')}</label>
                  <select
                    value={draft.method}
                    onChange={(event) => setDraft({ ...draft, method: event.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-sm font-bold text-white outline-none focus:border-pink-500/50 cursor-pointer shadow-inner appearance-none"
                  >
                    {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((method) => <option key={method}>{method}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block tracking-widest">{t('mock_server.label_path')}</label>
                  <input
                    value={draft.path}
                    onChange={(event) => setDraft({ ...draft, path: event.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-sm font-mono text-white outline-none focus:border-pink-500/50 placeholder-slate-600 shadow-inner"
                    placeholder="/api/v1/users"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block tracking-widest">{t('mock_server.label_status_code')}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={draft.statusCode}
                    onChange={(event) => setDraft({ ...draft, statusCode: Number(event.target.value) })}
                    className="w-24 rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-sm font-mono text-white outline-none focus:border-pink-500/50 shadow-inner"
                  />
                  {draft.statusCode >= 200 && draft.statusCode < 300 ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                      <CheckCircle2 size={12} /> {t('mock_server.status_success')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                      {t('mock_server.status_error')}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">{t('mock_server.label_response_body')}</label>
                  <button
                    onClick={handleAi}
                    disabled={isGenerating}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white bg-violet-600 hover:bg-violet-500 px-2 py-1.5 rounded-md transition-colors"
                  >
                    {isGenerating ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Sparkles size={12} />}
                    {isGenerating ? t('mock_server.ai_generating') : t('mock_server.ai_generate')}
                  </button>
                </div>

                <div className="relative rounded-xl border border-white/10 bg-slate-950/50 overflow-hidden shadow-inner">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.02] border-b border-white/5">
                    <Code2 size={12} className="text-slate-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('mock_server.label_json_payload')}</span>
                  </div>
                  <div className="relative">
                    <div className={`absolute inset-0 bg-violet-500/10 pointer-events-none transition-opacity duration-300 ${isGenerating ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
                    <textarea
                      value={draft.responseBody}
                      onChange={(event) => setDraft({ ...draft, responseBody: event.target.value })}
                      className={`w-full h-40 bg-transparent p-3 font-mono text-xs leading-relaxed text-slate-300 outline-none custom-scrollbar resize-y transition-colors ${isGenerating ? 'text-violet-300' : ''}`}
                      spellCheck={false}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreate}
                className="w-full flex justify-center items-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-pink-500"
              >
                {t('mock_server.create_btn')}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-md p-5 shadow-sm">
            <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
              <Server size={16} className="text-slate-400" /> {t('mock_server.list_section_title')}
            </h2>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                <div className="w-8 h-8 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mb-3" />
                <p className="text-xs font-bold tracking-widest uppercase">{t('mock_server.loading')}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                <Server className="w-12 h-12 text-slate-600 mb-3 opacity-50" strokeWidth={1.5} />
                <h3 className="text-sm font-bold text-slate-300 mb-1">{t('mock_server.empty_title')}</h3>
                <p className="text-xs text-slate-500 max-w-[200px]">{t('mock_server.empty_desc')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {items.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05, duration: 0.2 }}
                      className="group rounded-xl border border-white/5 bg-slate-950/40 overflow-hidden transition-all hover:border-pink-500/30"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 text-[9px] font-black tracking-widest rounded border ${METHOD_COLORS[item.method] || METHOD_COLORS.GET}`}>
                            {item.method}
                          </span>
                          <span className="font-mono text-sm font-bold text-white">{item.path}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-black tracking-widest rounded bg-slate-900 border ${item.statusCode >= 400 ? 'border-rose-500/30 text-rose-400' : 'border-emerald-500/30 text-emerald-400'}`}>
                            {item.statusCode}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { navigator.clipboard.writeText(`http://localhost:3000${item.path}`); console.log(t('mock_server.toast_url_copied')); }}
                            className="rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
                          >
                            {t('mock_server.btn_copy_url')}
                          </button>
                          <button
                            onClick={() => deleteMockEndpoint(item.id).then(load)}
                            className="rounded-lg px-2 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <textarea
                          defaultValue={item.responseBody}
                          onBlur={(event) => updateMockEndpoint(item.id, { responseBody: event.target.value }).then(load)}
                          className="w-full h-32 bg-transparent p-3 font-mono text-[11px] leading-relaxed text-slate-400 outline-none resize-y custom-scrollbar focus:text-slate-200"
                          spellCheck={false}
                        />
                        <button
                          onClick={() => { navigator.clipboard.writeText(item.responseBody); console.log(t('mock_server.toast_json_copied')); }}
                          className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 border border-white/10 rounded-md p-1.5 hover:bg-white/10 text-slate-300"
                        >
                          <Copy size={12} />
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
    </div>
  );
}
