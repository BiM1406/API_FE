import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Folder, Plus, Search, Trash2, Copy, Edit2, Archive, 
  MessageSquare, Terminal, Settings, LogOut, Send, RefreshCw, 
  Play, Save, History as HistoryIcon, Eye, EyeOff, Download, Upload, Menu, X, Check, Database,
  Server, User, Zap, ArrowLeft, Bot
} from 'lucide-react';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/40 backdrop-blur-xl border-r border-slate-800/50 transform transition-transform duration-300 ease-in-out flex flex-col pt-4 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
      {/* Mobile Close Button */}
      <button 
        className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-lg transition-all"
        onClick={() => setSidebarOpen(false)}
      >
        <X size={20} />
      </button>

      <div className="p-4 border-b border-slate-800/50">
        <button 
          onClick={handleNew}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95 mb-2"
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      <div className="px-4 pb-4">
        <div className="relative group">
          <Search size={16} className="absolute left-3 top-3 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500/50 transition-all text-slate-200"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-2">
        {filtered.map(p => (
          <div 
            key={p.id} 
            className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${activeId === p.id ? 'bg-violet-500/10 border border-violet-500/20 text-white' : 'text-slate-400 hover:bg-slate-800/30 border border-transparent hover:border-slate-800/50'} ${p.status === 'archived' ? 'opacity-50' : ''}`}
            onClick={() => setActiveId(p.id)}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <Folder size={18} className={activeId === p.id ? 'text-violet-400' : 'text-slate-500'} />
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
                  className="bg-slate-950 text-white px-2 py-0.5 rounded outline-none border border-violet-500/50 w-full text-sm font-medium"
                />
              ) : (
                <span className="truncate text-sm font-medium">{p.name}</span>
              )}
            </div>
            
            <div className="hidden group-hover:flex items-center gap-1.5">
              <button onClick={(e) => { e.stopPropagation(); setEditingId(p.id); setEditName(p.name); }} className="p-1.5 hover:text-violet-400 transition-colors"><Edit2 size={14} /></button>
              <button onClick={(e) => { e.stopPropagation(); handleDuplicate(p.id); }} className="p-1.5 hover:text-violet-400 transition-colors"><Copy size={14} /></button>
              <button onClick={(e) => { e.stopPropagation(); handleArchive(p.id); }} className="p-1.5 hover:text-amber-400 transition-colors"><Archive size={14} /></button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="p-1.5 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-slate-800/50">
        <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-all w-full p-2.5 rounded-xl hover:bg-red-400/5 font-medium text-sm">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
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
      <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
        <div className={`max-w-[85%] rounded-2xl p-5 shadow-lg ${isUser ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-50' : 'bg-slate-900/60 backdrop-blur-md border border-slate-800 text-slate-300'}`}>
          <div className="flex justify-between items-center mb-3">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isUser ? 'text-indigo-400' : 'text-violet-400'}`}>{msg.role}</span>
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
                    <SyntaxHighlighter 
                      language={lang || 'javascript'} 
                      style={atomDark}
                      customStyle={{ 
                        background: 'transparent', 
                        padding: '1rem', 
                        margin: 0, 
                        fontSize: '0.75rem' 
                      }}
                      className="custom-scrollbar"
                    >
                      {code}
                    </SyntaxHighlighter>
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
        <h2 className="text-lg font-semibold text-white">Chat</h2>
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

      <div className="p-4 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-xl">
        <div className="relative max-w-4xl mx-auto">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Talk with AI Assistant..."
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:border-violet-500/50 transition-all resize-none custom-scrollbar shadow-inner"
            rows={2}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-3 bottom-3 p-3 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Send size={18} />
          </button>
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
    <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
            <Server size={20} />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Environment Variables</h2>
        </div>
        <button onClick={addEnv} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
          <Plus size={18} /> Add Variable
        </button>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800/50 bg-slate-900/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
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
      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-4 px-2">
        <Zap size={14} className="text-amber-500" />
        <span>Use variables in API requests with <code className="text-violet-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 font-mono">{`{{KEY}}`}</code> syntax.</span>
      </div>
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
    <div className="p-8 max-w-3xl mx-auto w-full space-y-10">
      <section>
        <h2 className="text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
            <Settings size={18} />
          </div>
          Project Configuration
        </h2>
        <div className="space-y-6 bg-slate-900/40 backdrop-blur-md p-8 rounded-2xl border border-slate-800/50 shadow-xl">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Project Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-all text-white placeholder-slate-600"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Description</label>
            <textarea 
              value={desc} 
              onChange={e => setDesc(e.target.value)} 
              rows={4}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-all text-white resize-none placeholder-slate-600"
            />
          </div>
          <button onClick={handleSave} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]">
            {saved ? <Check size={18} className="text-emerald-400" /> : <Save size={18} />} {saved ? 'Settings Saved' : 'Update Project'}
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-white mb-6 tracking-tight px-1">Management Actions</h3>
        <div className="space-y-2 bg-slate-950/30 rounded-2xl border border-slate-800/30 overflow-hidden">
          <div className="flex items-center justify-between p-6 hover:bg-slate-900/20 transition-colors">
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-tight">Export Project</p>
              <p className="text-xs text-slate-500">Download all project data as JSON</p>
            </div>
            <button onClick={handleExport} className="px-4 py-2 border border-slate-800 hover:border-violet-500/50 text-slate-400 hover:text-violet-400 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
              <Download size={14} /> Export
            </button>
          </div>
          <div className="flex items-center justify-between p-6 hover:bg-slate-900/20 transition-colors border-t border-slate-900/50">
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-tight">Duplicate Project</p>
              <p className="text-xs text-slate-500">Create an identical copy of this workspace</p>
            </div>
            <button onClick={() => handleDuplicate(project.id)} className="px-4 py-2 border border-slate-800 hover:border-violet-500/50 text-slate-400 hover:text-violet-400 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
              <Copy size={14} /> Clone
            </button>
          </div>
          <div className="flex items-center justify-between p-6 bg-red-500/5 hover:bg-red-500/10 transition-colors border-t border-slate-900/50">
            <div>
              <p className="text-sm font-bold text-red-400 uppercase tracking-tight">Zone of Danger</p>
              <p className="text-xs text-red-900/80 uppercase font-bold tracking-widest text-[9px]">Permanently remove this project</p>
            </div>
            <button onClick={() => handleDelete(project.id)} className="px-4 py-2 border border-red-900/50 hover:border-red-500 text-red-500 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-red-500/5 shadow-lg shadow-red-500/5">
              <Trash2 size={14} /> Delete 
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};


// --- Main Component ---

export default function AiWorkspace() {
  const location = useLocation();
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('ai_projects');
    return saved ? JSON.parse(saved) : [initialProject];
  });
  const [activeId, setActiveId] = useState(projects[0]?.id);
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'chat'); // chat, api-test, env, settings, db-designer, history, account
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
    { id: 'env', label: 'Environments', icon: Server },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-300 font-sans overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Full-width Header */}
      <header className="h-16 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 shrink-0 z-[999]">
        <div className="flex items-center gap-6">
          <Link 
            to="/dashboard" 
            className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all active:scale-95 inline-flex"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-lg" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
              <h2 className="font-bold text-white tracking-tight">AI Workspace</h2>
            </div>
          </div>
        </div>
        
        <div className="flex bg-slate-950/50 rounded-xl p-1 border border-slate-800/50 overflow-x-auto hide-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'}`}
              >
                <Icon size={14} /> <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
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

        <main className="flex-1 overflow-hidden relative z-10">
          {activeTab === 'chat' && <ChatTab project={activeProject} updateProject={updateProject} />}
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
