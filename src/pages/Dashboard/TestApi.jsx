import React, { useState, useEffect } from 'react';
import { Trash2, Plus, RefreshCw, Play, ArrowLeft, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { logActivity } from '../../utils/activityLogger';

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function TestApi() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('ai_projects');
    return saved ? JSON.parse(saved) : [{ id: generateId(), name: 'Dự án mặc định', envs: [], apiHistory: [] }];
  });
  const [activeId, setActiveId] = useState(projects[0]?.id);
  
  const project = projects.find(p => p.id === activeId) || projects[0];

  const updateProject = (id, updates) => {
    const newProjects = projects.map(p => p.id === id ? { ...p, ...updates } : p);
    setProjects(newProjects);
    localStorage.setItem('ai_projects', JSON.stringify(newProjects));
  };

  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState([{ id: generateId(), key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('body'); // body, headers, raw

  const handleSend = async () => {
    if (!url) return;
    setLoading(true);
    let finalUrl = url;
    let finalHeaders = {};
    let finalBody = body;

    project.envs.forEach(env => {
      if (!env.key) return;
      const regex = new RegExp(`{{${env.key}}}`, 'g');
      finalUrl = finalUrl.replace(regex, env.value);
      finalBody = finalBody.replace(regex, env.value);
    });

    headers.forEach(h => {
      if (h.key) {
        let val = h.value;
        project.envs.forEach(env => {
          if (env.key) val = val.replace(new RegExp(`{{${env.key}}}`, 'g'), env.value);
        });
        finalHeaders[h.key] = val;
      }
    });

    const startTime = Date.now();
    try {
      const res = await fetch(finalUrl, {
        method,
        headers: finalHeaders,
        body: ['GET', 'HEAD'].includes(method) ? undefined : finalBody || undefined
      });
      const time = Date.now() - startTime;
      const data = await res.text();
      let jsonData;
      try { jsonData = JSON.parse(data); } catch(e) { jsonData = data; }
      
      const size = new Blob([data]).size;
      const result = { status: res.status, statusText: res.statusText, time, size, data: jsonData, headers: Object.fromEntries(res.headers.entries()) };
      setResponse(result);
      
      const historyItem = { id: generateId(), method, url, timestamp: Date.now(), status: res.status };
      updateProject(project.id, { apiHistory: [historyItem, ...project.apiHistory] });
      logActivity('api', `Đã kiểm thử API [${method}] ${finalUrl} (Status: ${res.status})`);
    } catch (err) {
      setResponse({ status: 'Error', statusText: err.message, time: Date.now() - startTime, size: 0, data: err.message, headers: {} });
    }
    setLoading(false);
  };

  const addHeader = () => setHeaders([...headers, { id: generateId(), key: '', value: '' }]);
  const updateHeader = (id, field, val) => setHeaders(headers.map(h => h.id === id ? { ...h, [field]: val } : h));
  const removeHeader = (id) => setHeaders(headers.filter(h => h.id !== id));

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300 font-sans overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <header className="h-16 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
            <h1 className="font-bold text-white tracking-tight">Kiểm thử API</h1>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-950/50 p-1.5 rounded-xl border border-slate-800/50 group">
           <Server size={14} className="text-slate-500 group-hover:text-violet-400 transition-colors ml-1" />
           <select 
             value={activeId} 
             onChange={e => setActiveId(e.target.value)}
             className="bg-transparent border-none appearance-none rounded px-2 text-[11px] font-bold uppercase tracking-widest focus:outline-none text-slate-300 cursor-pointer pr-4"
           >
             {projects.map(p => <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.name}</option>)}
           </select>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden z-10">
        <div className="p-4 bg-slate-900/20 backdrop-blur-md border-b border-slate-800/50 flex gap-3 shrink-0">
          <select 
            value={method} 
            onChange={e => setMethod(e.target.value)} 
            className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-violet-400 focus:outline-none focus:border-violet-500/50 shadow-inner"
          >
            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => <option key={m} value={m} className="bg-slate-900">{m}</option>)}
          </select>
          <input 
            type="text" 
            value={url} 
            onChange={e => setUrl(e.target.value)} 
            placeholder="https://api.example.com/v1/users/{{USER_ID}}"
            className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 font-mono text-slate-200 placeholder-slate-600 transition-all shadow-inner"
          />
          <button 
            onClick={handleSend} 
            disabled={loading} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} />} Gửi
          </button>
        </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Request Panel */}
        <div className="flex-1 border-r border-slate-800/50 flex flex-col overflow-hidden">
          <div className="flex bg-slate-950/50 p-1 border-b border-slate-800/50">
            {['Headers', 'Body'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveSubTab(tab.toLowerCase())} 
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeSubTab === tab.toLowerCase() ? 'bg-indigo-600/10 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-900/10">
            {activeSubTab === 'headers' && (
              <div className="space-y-3">
                {headers.map(h => (
                  <div key={h.id} className="flex gap-2 group">
                    <input type="text" placeholder="Key" value={h.key} onChange={e => updateHeader(h.id, 'key', e.target.value)} className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:border-violet-500/30 outline-none text-violet-300 transition-all" />
                    <input type="text" placeholder="Value" value={h.value} onChange={e => updateHeader(h.id, 'value', e.target.value)} className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:border-violet-500/30 outline-none text-slate-300 transition-all" />
                    <button onClick={() => removeHeader(h.id)} className="p-2 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                  </div>
                ))}
                <button onClick={addHeader} className="text-[10px] font-bold uppercase tracking-widest text-violet-400 hover:text-violet-300 flex items-center gap-2 mt-4 px-2 transition-colors"><Plus size={14} /> Thêm Header</button>
              </div>
            )}
            {activeSubTab === 'body' && (
              <textarea 
                value={body} 
                onChange={e => setBody(e.target.value)} 
                placeholder="{\n  &quot;key&quot;: &quot;value&quot;\n}"
                className="w-full h-full min-h-[300px] bg-slate-950/40 border border-slate-800/50 rounded-2xl p-5 text-xs font-mono focus:outline-none focus:border-violet-500/30 resize-none custom-scrollbar shadow-inner text-slate-300"
              />
            )}
          </div>
        </div>

        {/* Response Panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/20 backdrop-blur-sm">
          <div className="p-3 border-b border-slate-800/50 bg-slate-900/50 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500 px-6">
            <span>Bảng kết quả</span>
            {response && (
              <div className="flex gap-6">
                <span className={response.status >= 200 && response.status < 300 ? 'text-emerald-400' : 'text-red-400'}>
                  {response.status} {response.statusText}
                </span>
                <span className="text-slate-400">{response.time}ms</span>
                <span className="text-slate-400">{(response.size / 1024).toFixed(2)} KB</span>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-auto p-8 custom-scrollbar relative">
            {response ? (
              <SyntaxHighlighter 
                language="json" 
                style={atomDark}
                customStyle={{ 
                  background: 'transparent', 
                  padding: 0, 
                  margin: 0, 
                  fontSize: '0.75rem',
                  lineHeight: '1.6'
                }}
                className="custom-scrollbar"
              >
                {typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data}
              </SyntaxHighlighter>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-40">
                <RefreshCw size={48} className="animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-[0.2em]">Sẵn sàng nhận kết quả</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
