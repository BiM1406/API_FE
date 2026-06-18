import React, { useEffect, useState, useRef } from 'react';
import { Network, Trash2, Plus, Sliders, ShieldAlert, Key, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { addVariable, createEnvironment, deleteVariable, getActiveEnvironment, getEnvironments, setActiveEnvironment, updateVariable } from '../../services/environmentService';

const projectId = () => localStorage.getItem('api_fe_active_project_id') || 'default';

export default function Environments() {
  const { t } = useTranslation();
  const [envs, setEnvs] = useState([]);
  const [active, setActive] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const load = async () => {
    try {
      const data = await getEnvironments(projectId());
      const activeEnv = await getActiveEnvironment(projectId());
      if (isMountedRef.current) {
        setEnvs(data);
        setActive(activeEnv);
      }
    } catch (e) {
      console.error('Failed to load environments:', e);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) return toast.error(t('environments.toast_name_required'));
    await createEnvironment(projectId(), { name });
    setName('');
    load();
  };

  const handleAddVar = async () => {
    if (!active) return;
    await addVariable(active.id, { key: 'new_variable', currentValue: 'value', type: 'text' });
    load();
  };

  return (
    <div className="min-h-full w-full bg-transparent p-4 sm:p-6 font-sans text-slate-300 relative overflow-hidden">
      <div className="mx-auto max-w-6xl space-y-6 relative z-10">

        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Network size={18} />
            </div>
            <h1 className="text-lg font-bold text-white">{t('environments.title')}</h1>
          </div>

          <div className="flex shrink-0 w-full sm:w-auto">
            <div className="relative group w-full">
              <div className="relative flex items-center bg-slate-900/50 rounded-lg p-1 border border-white/10">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  className="w-full sm:w-48 bg-transparent px-3 py-1.5 text-sm text-white outline-none placeholder-slate-600"
                  placeholder={t('environments.env_name_placeholder')}
                />
                <button
                  onClick={handleCreate}
                  className="flex items-center justify-center rounded-md bg-cyan-600 text-white p-1.5 hover:bg-cyan-500 transition-colors"
                >
                  <Plus size={16} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-[250px_minmax(0,1fr)] gap-6 h-fit min-h-[500px]">

          <div className="flex flex-col rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-md overflow-hidden h-full">
            <div className="p-4 border-b border-white/5 flex items-center gap-2 text-slate-400 font-bold text-[11px] uppercase tracking-widest bg-white/[0.01]">
              <Sliders size={14} className="text-cyan-400" /> {t('environments.title_list')}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {loading ? (
                <div className="flex justify-center p-6"><div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : envs.length === 0 ? (
                <p className="text-center text-xs text-slate-600 p-4 font-medium">{t('environments.no_envs')}</p>
              ) : (
                envs.map((env) => {
                  const isActive = active?.id === env.id;
                  return (
                    <button
                      key={env.id}
                      onClick={async () => { await setActiveEnvironment(projectId(), env.id); load(); }}
                      className={`w-full group relative flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                      }`}
                    >
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-cyan-500 rounded-r-full" />}
                      <span className="truncate pr-4 flex items-center gap-2 text-sm">
                        {isActive ? <Zap size={14} className="text-cyan-400" /> : <Network size={14} className="opacity-50" />}
                        {env.name}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-col rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-md overflow-hidden h-full">
            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/5">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                <Network size={14} className="text-cyan-400" /> {t('environments.system_variables')}
              </div>
              {active && (
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500 bg-black/40 px-2 py-1 rounded uppercase tracking-wider">
                  <span className="text-cyan-500/70">ENV:</span>
                  <span className="text-slate-300 font-bold">{active.name}</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              {!active ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10">
                  <Key className="w-12 h-12 text-slate-600 mb-4" strokeWidth={1} />
                  <p className="text-base font-bold text-slate-400 mb-1">{t('environments.no_env_selected_title')}</p>
                  <p className="text-sm text-slate-500">{t('environments.no_env_selected_desc')}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white">{t('environments.variables_title', { name: active.name })}</h2>
                      <p className="text-xs text-slate-400 mt-1">{t('environments.syntax_hint')} <code className="text-cyan-400 font-mono bg-cyan-500/10 px-1 py-0.5 rounded">{'{{variable_name}}'}</code></p>
                    </div>
                    <button
                      onClick={handleAddVar}
                      className="flex items-center gap-1.5 rounded-lg bg-cyan-600/10 text-cyan-400 hover:bg-cyan-600/20 px-3 py-2 text-sm font-semibold transition-all border border-cyan-500/30"
                    >
                      <Plus size={16} /> {t('environments.add_variable_btn')}
                    </button>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-slate-900/40 overflow-hidden shadow-inner">
                    <div className="grid grid-cols-[1.5fr_2fr_1fr_40px] gap-3 p-3 border-b border-white/5 bg-white/[0.02]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('environments.col_key')}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('environments.col_value')}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('environments.col_type')}</span>
                      <span />
                    </div>

                    <div className="p-2 space-y-1">
                      <AnimatePresence>
                        {(active.variables || []).map((variable) => (
                          <motion.div
                            key={variable.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-[1.5fr_2fr_1fr_40px] gap-3 items-center p-2 rounded-lg hover:bg-white/[0.03] transition-colors group focus-within:bg-cyan-500/[0.05] border border-transparent focus-within:border-cyan-500/20"
                          >
                            <input
                              value={variable.key}
                              onChange={(e) => updateVariable(active.id, variable.id, { key: e.target.value }).then(load)}
                              className="w-full bg-slate-950/50 border border-white/5 rounded-md px-3 py-2 text-sm font-mono text-cyan-400 focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
                              placeholder={t('environments.placeholder_key')}
                            />
                            <div className="relative flex items-center">
                              {variable.type === 'secret' && <ShieldAlert size={14} className="absolute left-3 text-slate-500 z-10" />}
                              <input
                                type={variable.type === 'secret' ? 'password' : 'text'}
                                value={variable.currentValue}
                                onChange={(e) => updateVariable(active.id, variable.id, { currentValue: e.target.value }).then(load)}
                                className={`w-full bg-slate-950/50 border border-white/5 rounded-md py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 transition-all shadow-inner ${variable.type === 'secret' ? 'pl-9 font-mono tracking-widest' : 'px-3'}`}
                                placeholder={t('environments.placeholder_value')}
                              />
                            </div>
                            <select
                              value={variable.type}
                              onChange={(e) => updateVariable(active.id, variable.id, { type: e.target.value }).then(load)}
                              className="bg-slate-950/50 border border-white/5 rounded-md px-3 py-2 text-sm text-slate-400 outline-none focus:border-cyan-500 cursor-pointer shadow-inner"
                            >
                              <option value="text">Text</option>
                              <option value="secret">Secret</option>
                            </select>
                            <button
                              onClick={() => deleteVariable(active.id, variable.id).then(load)}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {(active.variables || []).length === 0 && (
                        <div className="p-6 text-center text-slate-500 text-sm">{t('environments.no_variables')}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
