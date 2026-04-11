import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, Plus, Search, Trash2, Copy, Edit2, Archive, 
  MessageSquare, Terminal, Settings, LogOut, Send, RefreshCw, 
  Play, Save, History, Eye, EyeOff, Download, Upload, Menu, X, Check, Database
} from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialProject = {
  id: generateId(),
  name: 'Project 1',
  description: 'Default project',
  status: 'active',
  envs: [],
  messages: [],
  apiHistory: [],
  createdAt: Date.now()
};

// --- Subcomponents ---

const Sidebar = ({ projects, activeId, setActiveId, handleNew, handleDelete, handleDuplicate, handleArchive, search, setSearch, sidebarOpen, setSidebarOpen }) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#141414] border-r border-[#262626] transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
      <div className="p-4 border-b border-[#262626] flex items-center justify-between">
        <h1 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
          <Database size={24} /> Workspace
        </h1>
        <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
          <X size={20} />
        </button>
      </div>
      
      <div className="p-4">
        <button onClick={handleNew} className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-md transition hover:opacity-80 active:scale-95">
          <Plus size={18} /> New Project
        </button>
      </div>

      <div className="px-4 pb-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-cyan-500 transition"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {filtered.map(p => (
          <div 
            key={p.id} 
            className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition ${activeId === p.id ? 'bg-[#262626] text-white' : 'text-gray-400 hover:bg-[#262626] hover:text-white'} ${p.status === 'archived' ? 'opacity-50' : ''}`}
            onClick={() => setActiveId(p.id)}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <Folder size={16} className={activeId === p.id ? 'text-cyan-400' : ''} />
              {editingId === p.id ? (
                <input 
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => {
                    handleDuplicate(p.id, { name: editName }, true);
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleDuplicate(p.id, { name: editName }, true);
                      setEditingId(null);
                    }
                  }}
                  className="bg-[#0a0a0a] text-white px-1 outline-none w-full text-sm"
                />
              ) : (
                <span className="truncate text-sm">{p.name}</span>
              )}
            </div>
            
            <div className="hidden group-hover:flex items-center gap-1">
              <button onClick={(e) => { e.stopPropagation(); setEditingId(p.id); setEditName(p.name); }} className="p-1 hover:text-cyan-400"><Edit2 size={14} /></button>
              <button onClick={(e) => { e.stopPropagation(); handleDuplicate(p.id); }} className="p-1 hover:text-cyan-400"><Copy size={14} /></button>
              <button onClick={(e) => { e.stopPropagation(); handleArchive(p.id); }} className="p-1 hover:text-yellow-400"><Archive size={14} /></button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="p-1 hover:text-red-400"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[#262626]">
        <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition w-full p-2 rounded-md hover:bg-[#262626]">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

const ChatTab = ({ project, updateProject }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [project.messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { id: generateId(), role: 'user', content: input, timestamp: Date.now() };
    const updatedMessages = [...project.messages, newMsg];
    updateProject(project.id, { messages: updatedMessages });
    setInput('');
    setIsTyping(true);
    
    setTimeout(() => {
      const aiMsg = { id: generateId(), role: 'assistant', content: `Here is a mock response to: "${newMsg.content}"\n\n\`\`\`javascript\nconsole.log("Hello World");\n\`\`\``, timestamp: Date.now() };
      updateProject(project.id, { messages: [...updatedMessages, aiMsg] });
      setIsTyping(false);
    }, 1500);
  };

  const handleClear = () => {
    if (window.confirm('Clear all messages?')) {
      updateProject(project.id, { messages: [] });
    }
  };

  const renderMessage = (msg) => {
    const isUser = msg.role === 'user';
    return (
      <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[80%] rounded-lg p-4 ${isUser ? 'bg-cyan-900/40 border border-cyan-800/50 text-cyan-50' : 'bg-[#141414] border border-[#262626] text-gray-300'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold opacity-50 uppercase">{msg.role}</span>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(msg.content)} className="opacity-50 hover:opacity-100"><Copy size={14} /></button>
            </div>
          </div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {msg.content.split('```').map((part, i) => {
              if (i % 2 === 1) {
                const lines = part.split('\n');
                const lang = lines[0];
                const code = lines.slice(1).join('\n');
                return (
                  <div key={i} className="my-2 bg-[#0a0a0a] rounded-md border border-[#262626] overflow-hidden">
                    <div className="flex justify-between items-center px-3 py-1 bg-[#1a1a1a] border-b border-[#262626] text-xs text-gray-400">
                      <span>{lang || 'code'}</span>
                      <button onClick={() => navigator.clipboard.writeText(code)} className="hover:text-white"><Copy size={12} /></button>
                    </div>
                    <pre className="p-3 overflow-x-auto custom-scrollbar text-xs text-cyan-300"><code>{code}</code></pre>
                  </div>
                );
              }
              return <span key={i}>{part}</span>;
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b border-[#262626]">
        <h2 className="text-lg font-semibold text-white">AI Chat</h2>
        <div className="flex gap-2">
          <button onClick={handleClear} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 px-2 py-1 rounded border border-[#262626] hover:border-red-400 transition">
            <Trash2 size={14} /> Clear Chat
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {project.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p>Start a conversation with AI</p>
          </div>
        ) : (
          project.messages.map(renderMessage)
        )}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-[#141414] border border-[#262626] rounded-lg p-4 text-gray-400 text-sm flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin" /> AI is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[#262626] bg-[#141414]">
        <div className="relative">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message... (Shift+Enter for new line)"
            className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-cyan-500 transition resize-none custom-scrollbar"
            rows={3}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-3 bottom-3 p-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ApiTab = ({ project, updateProject }) => {
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
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-[#262626] flex gap-2">
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
  );
};

const EnvTab = ({ project, updateProject }) => {
  const addEnv = () => {
    updateProject(project.id, { envs: [...project.envs, { id: generateId(), key: '', value: '', hidden: false }] });
  };

  const updateEnv = (id, field, val) => {
    updateProject(project.id, { envs: project.envs.map(e => e.id === id ? { ...e, [field]: val } : e) });
  };

  const removeEnv = (id) => {
    updateProject(project.id, { envs: project.envs.filter(e => e.id !== id) });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Environment Variables</h2>
        <button onClick={addEnv} className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-md flex items-center gap-2 text-sm transition active:scale-95">
          <Plus size={16} /> Add Variable
        </button>
      </div>

      <div className="bg-[#141414] border border-[#262626] rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-3 border-b border-[#262626] bg-[#1a1a1a] text-xs font-semibold text-gray-400 uppercase">
          <div className="col-span-4">Key</div>
          <div className="col-span-6">Value</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        
        {project.envs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No environment variables defined.</div>
        ) : (
          <div className="divide-y divide-[#262626]">
            {project.envs.map(env => (
              <div key={env.id} className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-[#1a1a1a] transition">
                <div className="col-span-4">
                  <input 
                    type="text" 
                    value={env.key} 
                    onChange={e => updateEnv(env.id, 'key', e.target.value)} 
                    placeholder="API_KEY"
                    className="w-full bg-transparent border-b border-transparent focus:border-cyan-500 outline-none text-sm font-mono text-cyan-300"
                  />
                </div>
                <div className="col-span-6 relative">
                  <input 
                    type={env.hidden ? "password" : "text"} 
                    value={env.value} 
                    onChange={e => updateEnv(env.id, 'value', e.target.value)} 
                    placeholder="value"
                    className="w-full bg-transparent border-b border-transparent focus:border-cyan-500 outline-none text-sm font-mono pr-8"
                  />
                  <button onClick={() => updateEnv(env.id, 'hidden', !env.hidden)} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {env.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div className="col-span-2 flex justify-end">
                  <button onClick={() => removeEnv(env.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-4">Use variables in API requests with <code className="text-cyan-400 bg-[#141414] px-1 rounded">{`{{KEY}}`}</code> syntax.</p>
    </div>
  );
};

const SettingsTab = ({ project, updateProject, handleDuplicate, handleDelete }) => {
  const [name, setName] = useState(project.name);
  const [desc, setDesc] = useState(project.description);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProject(project.id, { name, description: desc });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `${project.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto w-full space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Project Settings</h2>
        <div className="space-y-4 bg-[#141414] p-6 rounded-lg border border-[#262626]">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Project Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea 
              value={desc} 
              onChange={e => setDesc(e.target.value)} 
              rows={3}
              className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 text-white resize-none"
            />
          </div>
          <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm transition active:scale-95">
            {saved ? <Check size={16} /> : <Save size={16} />} {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Advanced Actions</h3>
        <div className="space-y-3 bg-[#141414] p-6 rounded-lg border border-[#262626]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Export Project</p>
              <p className="text-xs text-gray-500">Download project data as JSON</p>
            </div>
            <button onClick={handleExport} className="px-3 py-1.5 border border-[#262626] hover:border-cyan-500 text-gray-300 hover:text-cyan-400 rounded-md text-sm transition flex items-center gap-2">
              <Download size={14} /> Export
            </button>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
            <div>
              <p className="text-sm font-medium text-white">Duplicate Project</p>
              <p className="text-xs text-gray-500">Create a copy of this project</p>
            </div>
            <button onClick={() => handleDuplicate(project.id)} className="px-3 py-1.5 border border-[#262626] hover:border-cyan-500 text-gray-300 hover:text-cyan-400 rounded-md text-sm transition flex items-center gap-2">
              <Copy size={14} /> Duplicate
            </button>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
            <div>
              <p className="text-sm font-medium text-red-400">Delete Project</p>
              <p className="text-xs text-gray-500">Permanently remove this project</p>
            </div>
            <button onClick={() => handleDelete(project.id)} className="px-3 py-1.5 border border-red-900/50 hover:border-red-500 text-red-400 hover:bg-red-500/10 rounded-md text-sm transition flex items-center gap-2">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

export default function AiWorkspace() {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('ai_projects');
    return saved ? JSON.parse(saved) : [initialProject];
  });
  const [activeId, setActiveId] = useState(projects[0]?.id);
  const [activeTab, setActiveTab] = useState('chat'); // chat, api, env, settings
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('ai_projects', JSON.stringify(projects));
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeId) || projects[0];

  const updateProject = (id, updates) => {
    setProjects(projs => projs.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleNewProject = () => {
    const newProj = { ...initialProject, id: generateId(), name: `Project ${projects.length + 1}` };
    setProjects([...projects, newProj]);
    setActiveId(newProj.id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleDeleteProject = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const newProjects = projects.filter(p => p.id !== id);
      if (newProjects.length === 0) {
        const newProj = { ...initialProject, id: generateId() };
        setProjects([newProj]);
        setActiveId(newProj.id);
      } else {
        setProjects(newProjects);
        if (activeId === id) setActiveId(newProjects[0].id);
      }
    }
  };

  const handleDuplicateProject = (id, overrides = {}, inlineEdit = false) => {
    const projToCopy = projects.find(p => p.id === id);
    if (inlineEdit) {
      updateProject(id, overrides);
      return;
    }
    const newProj = { ...projToCopy, id: generateId(), name: `${projToCopy.name} (Copy)`, createdAt: Date.now(), ...overrides };
    setProjects([...projects, newProj]);
    setActiveId(newProj.id);
  };

  const handleArchiveProject = (id) => {
    const proj = projects.find(p => p.id === id);
    updateProject(id, { status: proj.status === 'active' ? 'archived' : 'active' });
  };

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'api', label: 'API Tester', icon: Terminal },
    { id: 'env', label: 'Environments', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-300 font-sans overflow-hidden">
      <Sidebar 
        projects={projects} 
        activeId={activeId} 
        setActiveId={setActiveId}
        handleNew={handleNewProject}
        handleDelete={handleDeleteProject}
        handleDuplicate={handleDuplicateProject}
        handleArchive={handleArchiveProject}
        search={search}
        setSearch={setSearch}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-[#141414] border-b border-[#262626] flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h2 className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs">{activeProject.name}</h2>
            {activeProject.status === 'archived' && <span className="text-[10px] uppercase bg-yellow-900/30 text-yellow-500 px-2 py-0.5 rounded border border-yellow-700/50">Archived</span>}
          </div>
          
          <div className="flex bg-[#0a0a0a] rounded-lg p-1 border border-[#262626] overflow-x-auto hide-scrollbar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition whitespace-nowrap ${isActive ? 'bg-[#262626] text-cyan-400 shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'}`}
                >
                  <Icon size={16} /> <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden bg-[#0a0a0a]">
          {activeTab === 'chat' && <ChatTab project={activeProject} updateProject={updateProject} />}
          {activeTab === 'api' && <ApiTab project={activeProject} updateProject={updateProject} />}
          {activeTab === 'env' && <EnvTab project={activeProject} updateProject={updateProject} />}
          {activeTab === 'settings' && <SettingsTab project={activeProject} updateProject={updateProject} handleDuplicate={handleDuplicateProject} handleDelete={handleDeleteProject} />}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
