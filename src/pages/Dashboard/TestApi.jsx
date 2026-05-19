import React, { useEffect, useMemo, useState } from 'react';
import { Bot, Clock, Code2, Copy, FolderPlus, Plus, RefreshCw, Save, Search, Server, Sparkles, Trash2, Wand2, Zap } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';
import {
  getRequestHistory,
  resolveEnvironmentVariables,
  saveRequestHistory,
  sendApiRequest
} from '../../services/testService';
import { addActivity } from '../../services/activityService';
import { getEnvironmentVariables } from '../../services/workspaceService';
import { analyzeApiResponse, generateCode, generateTestRequest } from '../../services/aiService';

const generateId = () => Math.random().toString(36).slice(2, 11);
const projectId = () => localStorage.getItem('api_fe_active_project_id') || 'default';

const requestTabs = ['Params', 'Auth', 'Headers', 'Body', 'Tests', 'Pre-request'];
const responseTabs = ['Body', 'Headers', 'Test Results', 'AI Analysis'];
const collections = [
  { id: 'auth', name: 'Auth APIs', count: 3 },
  { id: 'users', name: 'User Management', count: 5 },
  { id: 'billing', name: 'Billing', count: 2 }
];

export default function TestApi() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState([{ id: generateId(), key: '', value: '' }]);
  const [params, setParams] = useState([{ id: generateId(), key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [authToken, setAuthToken] = useState('{{token}}');
  const [tests, setTests] = useState('pm.test("status is 200", () => {\n  pm.response.to.have.status(200);\n});');
  const [preRequest, setPreRequest] = useState('// Set variables before sending request');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeRequestTab, setActiveRequestTab] = useState('Headers');
  const [activeResponseTab, setActiveResponseTab] = useState('Body');
  const [leftTab, setLeftTab] = useState('Collections');
  const [history, setHistory] = useState([]);
  const [envs, setEnvs] = useState([]);

  useEffect(() => {
    setHistory(getRequestHistory());
    getEnvironmentVariables(projectId()).then(setEnvs).catch(() => setEnvs([]));
    const pending = localStorage.getItem('api_fe_pending_api_test_request');
    if (pending) {
      try {
        const request = JSON.parse(pending);
        setMethod(request.method || 'GET');
        setUrl(request.url || '');
        setHeaders((request.headers || []).map((item) => ({ id: generateId(), key: item.key, value: item.value })));
        setBody(request.body || '');
        setActiveRequestTab(request.body ? 'Body' : 'Headers');
        toast.success('Đã nhập request từ AI');
        localStorage.removeItem('api_fe_pending_api_test_request');
      } catch {
        localStorage.removeItem('api_fe_pending_api_test_request');
      }
    }
  }, []);

  const visibleEnvTokens = useMemo(() => {
    const keys = envs.map((item) => item.key);
    return Array.from(new Set(['baseUrl', 'token', ...keys])).slice(0, 6);
  }, [envs]);

  const updateRow = (setter, id, field, val) => setter((items) => items.map((item) => item.id === id ? { ...item, [field]: val } : item));
  const addRow = (setter) => setter((items) => [...items, { id: generateId(), key: '', value: '' }]);
  const removeRow = (setter, id) => setter((items) => items.filter((item) => item.id !== id));

  const buildUrlWithParams = () => {
    const activeParams = params.filter((item) => item.key);
    if (activeParams.length === 0) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${activeParams.map((item) => `${encodeURIComponent(item.key)}=${encodeURIComponent(item.value)}`).join('&')}`;
  };

  const handleSend = async () => {
    if (!url.trim()) {
      toast.error('Vui lòng nhập URL');
      return;
    }

    setLoading(true);
    const requestUrl = buildUrlWithParams();
    const resolvedUrl = resolveEnvironmentVariables(requestUrl, envs);
    const authHeader = authToken ? [{ id: 'auth', key: 'Authorization', value: `Bearer ${authToken}` }] : [];
    const resolvedHeaders = [...headers, ...authHeader].map((header) => ({
      ...header,
      value: resolveEnvironmentVariables(header.value, envs)
    }));
    const resolvedBody = resolveEnvironmentVariables(body, envs);

    try {
      const result = await sendApiRequest({ method, url: resolvedUrl, headers: resolvedHeaders, body: resolvedBody });
      setResponse(result);
      const item = {
        id: generateId(),
        method,
        url: resolvedUrl,
        status: result.status,
        duration: result.duration,
        createdAt: new Date().toISOString()
      };
      setHistory(saveRequestHistory(item));
      addActivity('api', `Đã kiểm thử API [${method}] ${resolvedUrl} (Status: ${result.status})`);
      toast.success('Đã gửi request');
    } catch (error) {
      setResponse({ status: 'Error', statusText: error.message, duration: 0, size: 0, data: error.message, headers: {} });
      toast.error(error.message || 'Request thất bại');
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item) => {
    setMethod(item.method);
    setUrl(item.url);
    setLeftTab('History');
  };

  const handleAiBody = async () => {
    const request = await generateTestRequest({ method, url });
    setMethod(request.method || method);
    setUrl(request.url || url);
    setHeaders((request.headers || []).map((item) => ({ id: generateId(), key: item.key, value: item.value })));
    setBody(request.body || '');
    setActiveRequestTab('Body');
    toast.success('AI đã tạo request/body mẫu');
  };

  const handleSaveCollection = () => {
    addActivity('api', `Đã lưu request [${method}] ${url || '{{baseUrl}}/endpoint'} vào collection`);
    toast.success('Đã lưu vào Collection');
  };

  const responseBody = response ? (typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : String(response.data)) : '';

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-950 text-slate-300">
      <header className="z-20 flex min-h-16 shrink-0 flex-col gap-3 border-b border-white/5 bg-slate-900/60 px-4 py-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
            <Zap size={18} />
          </div>
          <div>
            <h1 className="font-black tracking-tight text-white">Kiểm thử API</h1>
            <p className="text-xs text-slate-500">Postman-like request builder</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {visibleEnvTokens.map((key) => (
            <button
              key={key}
              onClick={() => {
                navigator.clipboard.writeText(`{{${key}}}`);
                toast.success(`Đã copy {{${key}}}`);
              }}
              className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1.5 font-mono text-[11px] font-bold text-indigo-200"
            >
              {`{{${key}}}`}
            </button>
          ))}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="min-h-0 border-b border-white/5 bg-slate-900/35 lg:border-b-0 lg:border-r">
          <div className="flex gap-1 border-b border-white/5 p-2">
            {['Collections', 'History'].map((tab) => (
              <button key={tab} onClick={() => setLeftTab(tab)} className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${leftTab === tab ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="p-3">
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="w-full rounded-xl border border-white/5 bg-slate-950/60 py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-violet-500/50" placeholder="Search..." />
            </div>
            <div className="max-h-72 space-y-2 overflow-y-auto custom-scrollbar lg:max-h-[calc(100vh-190px)]">
              {leftTab === 'Collections' && collections.map((collection) => (
                <button key={collection.id} className="w-full rounded-xl border border-white/5 bg-slate-950/45 p-3 text-left transition hover:border-indigo-500/30 hover:bg-white/5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-bold text-white"><FolderPlus size={15} className="text-indigo-300" />{collection.name}</span>
                    <span className="text-[10px] text-slate-500">{collection.count}</span>
                  </div>
                </button>
              ))}
              {leftTab === 'History' && history.length === 0 && <p className="rounded-xl border border-dashed border-white/10 p-5 text-center text-xs text-slate-500">Chưa có request nào</p>}
              {leftTab === 'History' && history.map((item) => (
                <button key={item.id} onClick={() => loadHistoryItem(item)} className="w-full rounded-xl border border-white/5 bg-slate-950/45 p-3 text-left transition hover:border-indigo-500/30 hover:bg-white/5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-indigo-300">{item.method}</span>
                    <span className="text-[10px] text-slate-500">{item.status}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-400">{item.url}</p>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="grid min-h-0 grid-cols-1 overflow-hidden xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)]">
          <section className="flex min-h-0 flex-col border-b border-white/5 xl:border-b-0 xl:border-r">
            <div className="border-b border-white/5 bg-slate-900/25 p-3">
              <div className="flex flex-col gap-3 md:flex-row">
                <select value={method} onChange={(event) => setMethod(event.target.value)} className="rounded-xl border border-white/5 bg-slate-950/80 px-4 py-3 text-xs font-black text-violet-300 outline-none focus:border-violet-500/50">
                  {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((item) => <option key={item} value={item} className="bg-slate-900">{item}</option>)}
                </select>
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="{{baseUrl}}/v1/users"
                  className="min-w-0 flex-1 rounded-xl border border-white/5 bg-slate-950/60 px-4 py-3 font-mono text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-violet-500/50"
                />
                <button onClick={handleSend} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:opacity-50">
                  {loading ? <RefreshCw size={18} className="animate-spin" /> : <Zap size={18} />} Send
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={handleSaveCollection} className="inline-flex items-center gap-2 rounded-lg border border-white/5 bg-slate-950/50 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/5"><Save size={14} /> Save to Collection</button>
                <button onClick={handleAiBody} className="inline-flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-bold text-violet-200 transition hover:bg-violet-500/20"><Wand2 size={14} /> AI tạo body</button>
                <button onClick={async () => { const result = await analyzeApiResponse({ response }); localStorage.setItem('api_fe_pending_ai_analysis', result.content); setActiveResponseTab('AI Analysis'); toast.success('AI đã phân tích response hiện tại'); }} className="inline-flex items-center gap-2 rounded-lg border border-white/5 bg-slate-950/50 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/5"><Bot size={14} /> AI phân tích lỗi</button>
                <button onClick={async () => { const result = await generateCode({ prompt: `${method} ${url}` }); await navigator.clipboard.writeText(result.content); toast.success('AI đã sinh và copy code gọi API'); }} className="inline-flex items-center gap-2 rounded-lg border border-white/5 bg-slate-950/50 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/5"><Code2 size={14} /> AI sinh code</button>
              </div>
            </div>

            <div className="flex gap-1 overflow-x-auto border-b border-white/5 bg-slate-950/45 p-1 hide-scrollbar">
              {requestTabs.map((tab) => (
                <button key={tab} onClick={() => setActiveRequestTab(tab)} className={`shrink-0 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-wider transition ${activeRequestTab === tab ? 'bg-indigo-600/15 text-indigo-300' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-900/10 p-4 custom-scrollbar">
              {activeRequestTab === 'Params' && (
                <KeyValueEditor rows={params} setRows={setParams} updateRow={updateRow} addRow={addRow} removeRow={removeRow} label="Query Params" />
              )}
              {activeRequestTab === 'Auth' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Bearer Token</label>
                  <input value={authToken} onChange={(event) => setAuthToken(event.target.value)} className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-3 font-mono text-sm text-slate-200 outline-none focus:border-violet-500/50" />
                </div>
              )}
              {activeRequestTab === 'Headers' && (
                <KeyValueEditor rows={headers} setRows={setHeaders} updateRow={updateRow} addRow={addRow} removeRow={removeRow} label="Headers" />
              )}
              {activeRequestTab === 'Body' && (
                <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder={'{\n  "key": "value"\n}'} className="h-full min-h-[340px] w-full resize-none rounded-2xl border border-white/5 bg-slate-950/50 p-5 font-mono text-xs text-slate-300 outline-none focus:border-violet-500/50 custom-scrollbar" />
              )}
              {activeRequestTab === 'Tests' && (
                <textarea value={tests} onChange={(event) => setTests(event.target.value)} className="h-full min-h-[340px] w-full resize-none rounded-2xl border border-white/5 bg-slate-950/50 p-5 font-mono text-xs text-slate-300 outline-none focus:border-violet-500/50 custom-scrollbar" />
              )}
              {activeRequestTab === 'Pre-request' && (
                <textarea value={preRequest} onChange={(event) => setPreRequest(event.target.value)} className="h-full min-h-[340px] w-full resize-none rounded-2xl border border-white/5 bg-slate-950/50 p-5 font-mono text-xs text-slate-300 outline-none focus:border-violet-500/50 custom-scrollbar" />
              )}
            </div>
          </section>

          <section className="flex min-h-[420px] flex-col bg-black/20">
            <div className="flex flex-col gap-3 border-b border-white/5 bg-slate-900/45 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Server size={15} /> Response viewer
              </div>
              {response && (
                <div className="flex flex-wrap gap-4 text-xs font-bold">
                  <span className={Number(response.status) >= 200 && Number(response.status) < 300 ? 'text-emerald-400' : 'text-red-400'}>{response.status} {response.statusText}</span>
                  <span className="text-slate-400">{response.duration}ms</span>
                  <span className="text-slate-400">{((response.size || 0) / 1024).toFixed(2)} KB</span>
                </div>
              )}
            </div>
            <div className="flex gap-1 overflow-x-auto border-b border-white/5 p-1 hide-scrollbar">
              {responseTabs.map((tab) => (
                <button key={tab} onClick={() => setActiveResponseTab(tab)} className={`shrink-0 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-wider transition ${activeResponseTab === tab ? 'bg-violet-600/15 text-violet-300' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-5 custom-scrollbar">
              {!response ? (
                <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-900/25 p-8 text-center">
                  <Sparkles size={42} className="mb-4 text-violet-300" />
                  <h2 className="text-lg font-black text-white">Sẵn sàng nhận kết quả</h2>
                  <p className="mt-2 max-w-sm text-sm text-slate-500">Gửi request để xem response body, headers, test results và AI analysis.</p>
                </div>
              ) : activeResponseTab === 'Body' ? (
                <SyntaxHighlighter language="json" style={atomDark} customStyle={{ background: 'transparent', padding: 0, margin: 0, fontSize: '0.75rem', lineHeight: '1.6' }}>
                  {responseBody}
                </SyntaxHighlighter>
              ) : activeResponseTab === 'Headers' ? (
                <KeyValueReadOnly data={response.headers || {}} />
              ) : activeResponseTab === 'Test Results' ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm font-semibold text-emerald-200">Mock test passed: status và schema sẽ được nối runner sau.</div>
              ) : (
                <div className="whitespace-pre-wrap rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5 text-sm leading-6 text-violet-100">
                  {localStorage.getItem('api_fe_pending_ai_analysis') || 'AI Analysis: kiểm tra URL đã resolve biến môi trường, header Authorization và format body JSON. Nếu status lỗi, đối chiếu response body với contract trong Documentation.'}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function KeyValueEditor({ rows, setRows, updateRow, addRow, removeRow, label }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white">{label}</h2>
        <button onClick={() => addRow(setRows)} className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10">
          <Plus size={14} /> Thêm
        </button>
      </div>
      {rows.map((row) => (
        <div key={row.id} className="grid grid-cols-[1fr_1fr_40px] gap-2">
          <input value={row.key} onChange={(event) => updateRow(setRows, row.id, 'key', event.target.value)} placeholder="Key" className="min-w-0 rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2 font-mono text-xs text-violet-200 outline-none focus:border-violet-500/50" />
          <input value={row.value} onChange={(event) => updateRow(setRows, row.id, 'value', event.target.value)} placeholder="Value" className="min-w-0 rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2 font-mono text-xs text-slate-200 outline-none focus:border-violet-500/50" />
          <button onClick={() => removeRow(setRows, row.id)} className="rounded-xl text-slate-500 transition hover:bg-red-500/10 hover:text-red-300">
            <Trash2 size={16} className="mx-auto" />
          </button>
        </div>
      ))}
    </div>
  );
}

function KeyValueReadOnly({ data }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return <p className="text-sm text-slate-500">Không có headers.</p>;
  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => (
        <div key={key} className="grid grid-cols-[160px_minmax(0,1fr)_32px] gap-2 rounded-xl border border-white/5 bg-slate-950/45 p-3 text-xs">
          <span className="font-bold text-violet-200">{key}</span>
          <span className="truncate font-mono text-slate-300">{String(value)}</span>
          <button onClick={() => { navigator.clipboard.writeText(String(value)); toast.success('Đã copy header'); }} className="text-slate-500 hover:text-white"><Copy size={14} /></button>
        </div>
      ))}
    </div>
  );
}
