import React, { useState, useEffect } from 'react';
import { Trash2, Plus, RefreshCw, Play, ArrowLeft, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function TestApi() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('ai_projects');
    return saved ? JSON.parse(saved) : [{ id: generateId(), name: 'Default Project', envs: [], apiHistory: [] }];
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
    } catch (err) {
      setResponse({ status: 'Error', statusText: err.message, time: Date.now() - startTime, size: 0, data: err.message, headers: {} });
    }
    setLoading(false);
  };

  const addHeader = () => setHeaders([...headers, { id: generateId(), key: '', value: '' }]);
  const updateHeader = (id, field, val) => setHeaders(headers.map(h => h.id === id ? { ...h, [field]: val } : h));
  const removeHeader = (id) => setHeaders(headers.filter(h => h.id !== id));

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-gray-300 font-sans overflow-hidden">
      <header className="h-14 bg-[#141414] border-b border-[#262626] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-semibold text-white">API Tester</h1>
        </div>
        <div className="flex items-center gap-2">
           <Server size={16} className="text-gray-500" />
           <select 
             value={activeId} 
             onChange={e => setActiveId(e.target.value)}
             className="bg-[#0a0a0a] border border-[#262626] rounded px-2 py-1 text-sm focus:outline-none focus:border-cyan-500 text-white"
           >
             {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
           </select>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#262626] flex gap-2 shrink-0">
        <select value={method} onChange={e => setMethod(e.target.value)} className="bg-[#141414] border border-[#262626] rounded-md px-3 py-2 text-sm text-cyan-400 font-bold focus:outline-none focus:border-cyan-500">
          {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input 
          type="text" 
          value={url} 
          onChange={e => setUrl(e.target.value)} 
          placeholder="https://api.example.com/v1/users/{{USER_ID}}"
          className="flex-1 bg-[#0a0a0a] border border-[#262626] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 font-mono"
        />
        <button onClick={handleSend} disabled={loading} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-md flex items-center gap-2 transition active:scale-95 disabled:opacity-50">
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />} Send
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Request Panel */}
        <div className="flex-1 border-r border-[#262626] flex flex-col overflow-hidden">
          <div className="flex border-b border-[#262626] bg-[#141414]">
            {['Headers', 'Body'].map(tab => (
              <button key={tab} onClick={() => setActiveSubTab(tab.toLowerCase())} className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeSubTab === tab.toLowerCase() ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {activeSubTab === 'headers' && (
              <div className="space-y-2">
                {headers.map(h => (
                  <div key={h.id} className="flex gap-2">
                    <input type="text" placeholder="Key" value={h.key} onChange={e => updateHeader(h.id, 'key', e.target.value)} className="flex-1 bg-[#0a0a0a] border border-[#262626] rounded px-2 py-1 text-sm font-mono focus:border-cyan-500 outline-none" />
                    <input type="text" placeholder="Value" value={h.value} onChange={e => updateHeader(h.id, 'value', e.target.value)} className="flex-1 bg-[#0a0a0a] border border-[#262626] rounded px-2 py-1 text-sm font-mono focus:border-cyan-500 outline-none" />
                    <button onClick={() => removeHeader(h.id)} className="p-1 text-gray-500 hover:text-red-400"><Trash2 size={16} /></button>
                  </div>
                ))}
                <button onClick={addHeader} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-2"><Plus size={14} /> Add Header</button>
              </div>
            )}
            {activeSubTab === 'body' && (
              <textarea 
                value={body} 
                onChange={e => setBody(e.target.value)} 
                placeholder="{\n  &quot;key&quot;: &quot;value&quot;\n}"
                className="w-full h-full min-h-[200px] bg-[#0a0a0a] border border-[#262626] rounded-md p-3 text-sm font-mono focus:outline-none focus:border-cyan-500 resize-none custom-scrollbar"
              />
            )}
          </div>
        </div>

        {/* Response Panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">
          <div className="p-2 border-b border-[#262626] bg-[#141414] flex justify-between items-center text-xs text-gray-400">
            <span>Response</span>
            {response && (
              <div className="flex gap-4">
                <span className={response.status >= 200 && response.status < 300 ? 'text-green-400' : 'text-red-400'}>Status: {response.status} {response.statusText}</span>
                <span>Time: {response.time}ms</span>
                <span>Size: {(response.size / 1024).toFixed(2)} KB</span>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            {response ? (
              <pre className="text-sm font-mono text-cyan-100">
                {typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-600 text-sm">Hit Send to get a response</div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
