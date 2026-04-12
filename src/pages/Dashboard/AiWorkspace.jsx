import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Folder, Plus, Search, Trash2, Copy, Edit2, Archive, 
  MessageSquare, Terminal, Settings, LogOut, Send, RefreshCw, 
  Play, Save, History as HistoryIcon, Eye, EyeOff, Download, Upload, Menu, X, Check, Database,
  Server, User, Zap, ArrowLeft, Bot, ChevronDown, MoreHorizontal, Pin
} from 'lucide-react';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialChat = {
  id: generateId(),
  title: 'New Chat',
  messages: [],
  createdAt: Date.now()
};

const initialProject = {
  id: generateId(),
  name: 'Project 1',
  description: 'Default project',
  status: 'active',
  envs: [],
  chats: [initialChat],
  activeChatId: initialChat.id,
  createdAt: Date.now()
};

// --- Subcomponents ---

const Sidebar = ({ 
  projects, activeId, setActiveId, handleNewProject, handleDeleteProject, 
  activeProject, handleNewChat, handleDeleteChat, setActiveChatId,
  sidebarOpen, setSidebarOpen, updateProject, updateChat, onConfirmDelete
}) => {
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuType, setMenuType] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const openMenu = (e, id, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (menuOpenId === id) { setMenuOpenId(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 176;
    let left = rect.right - menuWidth;
    if (left < 4) left = 4;
    if (left + menuWidth > window.innerWidth - 4) left = window.innerWidth - menuWidth - 4;
    let top = rect.bottom + 4;
    if (top + 180 > window.innerHeight) top = rect.top - 184;
    setMenuPos({ top, left });
    setMenuOpenId(id);
    setMenuType(type);
  };

  const closeMenu = () => setMenuOpenId(null);

  const handleRenameSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editName.trim()) return setEditingId(null);
    if (menuType === 'project') updateProject(editingId, { name: editName });
    if (menuType === 'chat') updateChat(activeProject.id, editingId, { title: editName });
    setEditingId(null);
    setMenuType(null);
  };

  // Portal-based dropdown: renders into document.body so it's never clipped
  const PortalMenu = ({ id, type, item }) => {
    if (menuOpenId !== id) return null;
    const isPinned = item.pinned;
    const isProj = type === 'project';

    const doPin = (e) => { e.stopPropagation(); if (isProj) updateProject(id, { pinned: !isPinned }); else updateChat(activeProject.id, id, { pinned: !isPinned }); closeMenu(); };
    const doRename = (e) => { e.stopPropagation(); setMenuType(type); setEditingId(id); setEditName(isProj ? item.name : item.title || 'New Chat'); closeMenu(); };
    const doArchive = (e) => { e.stopPropagation(); if (isProj) updateProject(id, { archived: true }); else updateChat(activeProject.id, id, { archived: true }); if (activeId === id && isProj) setActiveId(projects.find(p => p.id !== id)?.id || projects[0]?.id); closeMenu(); };
    const doDelete = (e) => { e.stopPropagation(); onConfirmDelete(isProj ? 'project' : 'chat', id); closeMenu(); };

    return ReactDOM.createPortal(
      <>
        <div className="fixed inset-0 z-[200]" onClick={(e) => { e.stopPropagation(); closeMenu(); }} />
        <div
          className="fixed z-[201] w-44 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl shadow-black/70 py-1 overflow-hidden"
          style={{ top: menuPos.top, left: menuPos.left }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={doPin} className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors">
            <Pin size={14} className={isPinned ? 'text-amber-400' : 'opacity-60'} /> {isPinned ? 'Bỏ ghim' : isProj ? 'Ghim dự án' : 'Ghim đoạn chat'}
          </button>
          <button onClick={doRename} className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors">
            <Edit2 size={14} className="opacity-60" /> Đổi tên
          </button>
          <button onClick={doArchive} className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors">
            <Archive size={14} className="opacity-60" /> Lưu trữ
          </button>
          <div className="h-px bg-white/10 my-1 mx-2" />
          <button onClick={doDelete} className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors">
            <Trash2 size={14} className="opacity-80" /> Xóa
          </button>
        </div>
      </>,
      document.body
    );
  };

  const getSortedItems = (list) => {
    return [...list].filter(i => !i.archived).sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt - a.createdAt;
    });
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900/60 backdrop-blur-2xl border-r border-white/5 transform transition-transform duration-300 ease-in-out flex flex-col p-4 space-y-4 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
      <button className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all z-10" onClick={() => setSidebarOpen(false)}>
        <X size={20} />
      </button>

      {/* Render single portal menu for whichever item is open */}
      {menuOpenId && (() => {
        const isProj = menuType === 'project';
        const item = isProj ? projects.find(p => p.id === menuOpenId) : activeProject?.chats?.find(c => c.id === menuOpenId);
        return item ? <PortalMenu id={menuOpenId} type={menuType} item={item} /> : null;
      })()}

      {/* Box 1: My Projects */}
      <div className="shrink-0 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setIsProjectsOpen(!isProjectsOpen)}>
          <div className="flex items-center gap-2">
            <Folder size={16} className="text-indigo-400"/> 
            <span className="font-bold text-white text-sm tracking-wide">My Projects</span>
          </div>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProjectsOpen ? 'rotate-180' : ''}`} />
        </div>
        
        {isProjectsOpen && (
          <div className="p-2 space-y-1 border-t border-white/5 bg-black/20 max-h-48 overflow-y-auto custom-scrollbar">
            {getSortedItems(projects).map(p => {
              const isEditing = editingId === p.id && menuType === 'project';
              return (
                <div key={p.id} onClick={() => !isEditing && setActiveId(p.id)} className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all duration-200 ${activeId === p.id ? 'bg-indigo-500/20 text-white border border-indigo-500/10' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}>
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {p.pinned ? <Pin size={12} className="text-amber-400 shrink-0" fill="currentColor" /> : <Folder size={14} className={activeId === p.id ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-300'} />}
                    {isEditing ? (
                      <form onSubmit={handleRenameSubmit} className="flex-1 w-full" onClick={e => e.stopPropagation()}>
                        <input autoFocus value={editName} onChange={e => setEditName(e.target.value)} onBlur={handleRenameSubmit} className="w-full bg-slate-950 text-white text-xs px-2 py-0.5 rounded outline-none border border-indigo-500/50" />
                      </form>
                    ) : (
                      <span className="truncate text-xs font-semibold">{p.name}</span>
                    )}
                  </div>
                  {!isEditing && (
                    <button onClick={(e) => openMenu(e, p.id, 'project')} className={`p-1 text-slate-500 hover:text-white hover:bg-white/10 rounded-md transition-all ${activeId === p.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <MoreHorizontal size={14} />
                    </button>
                  )}
                </div>
              );
            })}
            <button onClick={() => setShowAddProject(true)} className="w-full mt-2 py-2 text-xs font-bold flex items-center justify-center gap-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-all border border-dashed border-indigo-500/30 active:scale-95">
              <Plus size={14} /> Add Project
            </button>
          </div>
        )}
      </div>

      {/* Box 2: New Chat */}
      <div className="shrink-0 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-2 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <button onClick={handleNewChat} className="w-full flex items-center justify-start gap-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white px-3 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 group">
          <div className="bg-white/10 text-white p-1.5 rounded-lg group-hover:bg-white/15 transition-colors">
            <Plus size={16} strokeWidth={3} />
          </div>
          New Chat
        </button>
      </div>

      {/* Box 3: History */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 shrink-0 bg-black/20 shadow-inner">
          <HistoryIcon size={14} className="text-slate-400" />
          <span className="text-xs font-bold tracking-widest text-slate-300 uppercase">History</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {(!activeProject?.chats || activeProject.chats.length === 0) ? (
             <div className="text-center text-xs text-slate-500 p-4">No chats yet</div>
          ) : (
            getSortedItems(activeProject.chats).map(chat => {
              const isActive = activeProject.activeChatId === chat.id;
              const isEditing = editingId === chat.id && menuType === 'chat';
              return (
                <div key={chat.id} onClick={() => !isEditing && setActiveChatId(chat.id)} className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${isActive ? 'bg-white/10 text-white border border-white/5' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}>
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {chat.pinned ? <Pin size={12} className="text-amber-400 shrink-0" fill="currentColor" /> : <MessageSquare size={14} className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} />}
                    {isEditing ? (
                      <form onSubmit={handleRenameSubmit} className="flex-1 w-full" onClick={e => e.stopPropagation()}>
                        <input autoFocus value={editName} onChange={e => setEditName(e.target.value)} onBlur={handleRenameSubmit} className="w-full bg-slate-950 text-white text-xs px-2 py-0.5 rounded outline-none border border-indigo-500/50" />
                      </form>
                    ) : (
                      <span className="truncate text-xs font-medium">{chat.title || 'New Chat'}</span>
                    )}
                  </div>
                  {!isEditing && (
                    <button onClick={(e) => openMenu(e, chat.id, 'chat')} className={`p-1 text-slate-500 hover:text-white hover:bg-white/10 rounded-md transition-all ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <MoreHorizontal size={14} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};




const ChatTab = ({ activeChat, updateChat }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
       scrollContainerRef.current.scrollTo({
         top: scrollContainerRef.current.scrollHeight,
         behavior: 'smooth'
       });
    }
  };
  useEffect(scrollToBottom, [activeChat?.messages, isTyping]);

  if (!activeChat) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center text-slate-500">
        <Bot size={32} className="text-indigo-400 mb-4 opacity-50" />
        <p>Select or create a chat to begin</p>
      </div>
    );
  }

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Automatically set title based on first message if title is default
    const isFirstMsg = activeChat.messages.length === 0;
    const newTitle = isFirstMsg ? (input.length > 20 ? input.substring(0, 20) + '...' : input) : undefined;
    
    const newMsg = { id: generateId(), role: 'user', content: input, timestamp: Date.now() };
    const updatedMessages = [...activeChat.messages, newMsg];
    
    updateChat({ messages: updatedMessages, ...(newTitle && { title: newTitle }) });
    setInput('');
    setIsTyping(true);
    
    setTimeout(() => {
      const aiMsg = { id: generateId(), role: 'assistant', content: `Here is a mock response to: "${newMsg.content}"\n\n\`\`\`javascript\nconsole.log("Hello, World!");\n\`\`\``, timestamp: Date.now() };
      updateChat({ messages: [...updatedMessages, aiMsg] });
      setIsTyping(false);
    }, 1500);
  };

  const handleClear = () => {
    if (window.confirm('Clear all messages for this chat?')) {
      updateChat({ messages: [] });
    }
  };

  const renderMessage = (msg) => {
    const isUser = msg.role === 'user';
    return (
      <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-8`}>
        <div className={`flex gap-4 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${isUser ? 'bg-gradient-to-br from-violet-600 to-indigo-600 shadow-indigo-500/20' : 'bg-slate-800 border border-white/10 shadow-black/20'}`}>
            {isUser ? <User size={16} className="text-white" /> : <Bot size={18} className="text-indigo-400" />}
          </div>
          
          <div className={`rounded-2xl p-5 shadow-xl border ${isUser ? 'bg-gradient-to-br from-indigo-500/90 to-violet-600/90 border-indigo-400/20 text-white rounded-tr-sm' : 'bg-slate-900/60 backdrop-blur-xl border-white/5 text-slate-200 rounded-tl-sm shadow-black/20'}`}>
            <div className="flex justify-between items-center mb-3">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isUser ? 'text-indigo-200' : 'text-slate-500'}`}>{msg.role === 'assistant' ? 'ChatDMP' : msg.role}</span>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(msg.content)} className="opacity-50 hover:opacity-100 transition-opacity p-1 hover:bg-black/20 rounded"><Copy size={14} /></button>
              </div>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed font-medium">
              {msg.content.split('```').map((part, i) => {
                if (i % 2 === 1) {
                  const lines = part.split('\n');
                  const lang = lines[0] || 'text';
                  const code = lines.slice(1).join('\n');
                  return (
                    <div key={i} className="my-4 bg-slate-950/80 rounded-xl border border-white/5 overflow-hidden shadow-2xl">
                      <div className="flex justify-between items-center px-4 py-2 bg-[#1e1e1e] border-b border-white/5 text-xs text-slate-400 uppercase tracking-widest font-bold">
                        <span>{lang}</span>
                        <button onClick={() => navigator.clipboard.writeText(code)} className="hover:text-white flex items-center gap-1.5 transition-colors"><Copy size={12} /> Copy</button>
                      </div>
                      <SyntaxHighlighter 
                        language={lang === 'text' ? 'javascript' : lang} 
                        style={atomDark}
                        customStyle={{ background: 'transparent', padding: '1.25rem', margin: 0, fontSize: '0.8rem', lineHeight: '1.6' }}
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
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full relative">
      <div className="flex justify-between items-center p-5 border-b border-white/5 bg-slate-900/40 backdrop-blur-xl shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
            <MessageSquare size={18} />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">{activeChat.title || 'ChatDMP'}</h2>
        </div>
        <button onClick={handleClear} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-400 px-3 py-1.5 rounded-lg border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 transition-all">
          <Trash2 size={14} /> Clear Messages
        </button>
      </div>
      
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        {activeChat.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl border border-white/5 flex items-center justify-center shadow-2xl mb-6 shadow-black/50 ring-1 ring-white/10">
              <Bot size={32} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">How can ChatDMP help you?</h3>
            <p className="text-sm">Start by typing your prompt or paste some code.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full">
            {activeChat.messages.map(renderMessage)}
            {isTyping && (
              <div className="flex justify-start mb-8">
                 <div className="flex gap-4 max-w-[85%]">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg bg-slate-800 border border-white/10 shadow-black/20">
                      <Bot size={18} className="text-indigo-400" />
                    </div>
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 text-slate-400 text-sm flex items-center gap-3 shadow-xl">
                      <RefreshCw size={16} className="animate-spin text-indigo-400" /> ChatDMP is thinking...
                    </div>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 p-pb-8 border-t border-white/5 bg-slate-900/60 backdrop-blur-2xl shrink-0">
        <div className="relative max-w-4xl mx-auto flex items-end gap-3">
          <div className="relative flex-1">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask ChatDMP..."
              className="w-full bg-slate-950/60 border border-white/10 rounded-2xl pl-5 pr-5 py-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none custom-scrollbar shadow-inner text-white placeholder-slate-500"
              rows={1}
              style={{ minHeight: '56px', maxHeight: '200px' }}
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="shrink-0 h-[56px] w-[56px] bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            <Send size={20} className="relative z-10" />
          </button>
        </div>
        <div className="max-w-4xl mx-auto text-center mt-3">
          <p className="text-[10px] text-slate-500 font-medium">ChatDMP can make mistakes. Consider verifying critical information.</p>
        </div>
      </div>
    </div>
  );
};


const EnvTab = ({ project, updateProject }) => {
  const addEnv = () => updateProject({ envs: [...project.envs, { id: generateId(), key: '', value: '', hidden: false }] });
  const updateEnv = (id, field, val) => updateProject({ envs: project.envs.map(e => e.id === id ? { ...e, [field]: val } : e) });
  const removeEnv = (id) => updateProject({ envs: project.envs.filter(e => e.id !== id) });

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Server size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Environment Variables</h2>
              <p className="text-xs text-slate-400 mt-1">Manage secrets and keys for this workspace.</p>
            </div>
          </div>
          <button onClick={addEnv} className="bg-white/5 hover:bg-white/10 border border-white/5 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all active:scale-95">
            <Plus size={18} /> Add Variable
          </button>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 gap-4 p-5 border-b border-white/5 bg-slate-950/40 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <div className="col-span-4 pl-2">Key</div>
            <div className="col-span-6">Value</div>
            <div className="col-span-2 text-right pr-2">Actions</div>
          </div>
          
          {project.envs.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 mb-4 shadow-inner">
                <Database size={24} className="text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium text-sm">No environment variables defined yet.</p>
              <p className="text-slate-500 text-xs mt-1">Click "Add Variable" to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {project.envs.map(env => (
                <div key={env.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors group">
                  <div className="col-span-4">
                    <input 
                      type="text" 
                      value={env.key} 
                      onChange={e => updateEnv(env.id, 'key', e.target.value)} 
                      placeholder="e.g. API_KEY"
                      className="w-full bg-slate-950/50 border border-white/5 rounded-lg px-3 py-2 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none text-sm font-mono text-emerald-300 transition-all"
                    />
                  </div>
                  <div className="col-span-6 relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <input 
                        type={env.hidden ? "password" : "text"} 
                        value={env.value} 
                        onChange={e => updateEnv(env.id, 'value', e.target.value)} 
                        placeholder="Enter value..."
                        className="w-full bg-slate-950/50 border border-white/5 rounded-lg px-3 py-2 pr-10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none text-sm font-mono text-slate-300 transition-all"
                      />
                      <button onClick={() => updateEnv(env.id, 'hidden', !env.hidden)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                        {env.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button onClick={() => removeEnv(env.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
          <Zap size={16} className="text-amber-500 shrink-0" />
          <span>Use variables in API requests with <code className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono font-bold tracking-wider">{`{{KEY}}`}</code> syntax.</span>
        </div>
      </div>
    </div>
  );
};

const SettingsTab = ({ project, updateProject, handleDuplicate, handleDelete }) => {
  const [name, setName] = useState(project.name);
  const [desc, setDesc] = useState(project.description);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProject({ name, description: desc });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${project.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-8 max-w-3xl mx-auto w-full space-y-10">
        <section>
          <div className="flex flex-col mb-8">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                <Settings size={20} />
              </div>
              Project Configuration
            </h2>
            <p className="text-sm text-slate-400 ml-[52px]">Update naming and export functions.</p>
          </div>

          <div className="space-y-6 bg-slate-900/40 backdrop-blur-2xl p-8 rounded-3xl border border-white/5 shadow-2xl">
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Project Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-white font-medium placeholder-slate-600 shadow-inner"
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Description</label>
              <textarea 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
                rows={4}
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-white font-medium resize-none placeholder-slate-600 shadow-inner"
              />
            </div>
            <button onClick={handleSave} className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
              {saved ? <Check size={18} className="text-emerald-300" /> : <Save size={18} />} 
              {saved ? 'Settings Saved' : 'Update Configuration'}
            </button>
          </div>
        </section>

        <section className="pt-4">
          <h3 className="text-lg font-bold text-white mb-6 tracking-tight pl-1">Data Management</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-5 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:bg-slate-800/40 transition-colors">
              <div>
                <p className="text-sm font-bold text-white tracking-tight">Export Project</p>
                <p className="text-xs text-slate-400 mt-0.5">Download all chats, environments as JSON</p>
              </div>
              <button onClick={handleExport} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95">
                <Download size={16} /> Export
              </button>
            </div>
            
            <div className="flex items-center justify-between p-5 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:bg-slate-800/40 transition-colors">
              <div>
                <p className="text-sm font-bold text-white tracking-tight">Duplicate Project</p>
                <p className="text-xs text-slate-400 mt-0.5">Create an exact clone of this project</p>
              </div>
              <button onClick={handleDuplicate} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95">
                <Copy size={16} /> Clone
              </button>
            </div>

            <div className="flex items-center justify-between p-6 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-2xl transition-all">
              <div>
                <p className="text-sm font-bold text-red-400 tracking-tight">Danger Zone</p>
                <p className="text-xs text-red-500/70 mt-0.5 font-medium">Permanently delete this project and all its data</p>
              </div>
              <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-red-500/10">
                <Trash2 size={16} /> Delete Project
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};


// --- Main Component ---

export default function AiWorkspace() {
  const location = useLocation();
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('ai_projects_v2');
    if (saved) {
      return JSON.parse(saved);
    }
    // Migration from old schema v1 to v2:
    const oldSaved = localStorage.getItem('ai_projects');
    if (oldSaved) {
      const parsedOld = JSON.parse(oldSaved);
      return parsedOld.map(p => ({
        ...p,
        chats: p.chats || [{ id: generateId(), title: p.name + ' Chat', messages: p.messages || [], createdAt: p.createdAt || Date.now() }],
        activeChatId: p.activeChatId || null
      }));
    }
    return [initialProject];
  });
  
  const [activeId, setActiveId] = useState(projects[0]?.id);
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const [showAddProject, setShowAddProject] = useState(false);

  useEffect(() => {
    localStorage.setItem('ai_projects_v2', JSON.stringify(projects));
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeId) || projects[0];

  // Automatically select a chat if none is selected
  useEffect(() => {
    if (activeProject && !activeProject.activeChatId && activeProject.chats && activeProject.chats.length > 0) {
       updateProject(activeProject.id, { activeChatId: activeProject.chats[0].id });
    }
  }, [activeProject]);

  const activeChat = activeProject?.chats?.find(c => c.id === activeProject.activeChatId) || activeProject?.chats?.[0];

  const updateProject = (id, updates) => {
    setProjects(projs => projs.map(p => p.id === id ? { ...p, ...updates } : p));
  };
  
  const updateCurrentProject = (updates) => {
    updateProject(activeProject.id, updates);
  };

  const updateChat = (projectId, chatId, updates) => {
    setProjects(projs => projs.map(p => {
      if (p.id === projectId) {
        return { ...p, chats: p.chats.map(c => c.id === chatId ? { ...c, ...updates } : c) };
      }
      return p;
    }));
  };

  const updateCurrentChat = (updates) => {
    setProjects(projs => projs.map(p => {
      if (p.id === activeId) {
        const updatedChats = p.chats.map(chat => chat.id === p.activeChatId ? { ...chat, ...updates } : chat);
        return { ...p, chats: updatedChats };
      }
      return p;
    }));
  };

  const handleNewProject = () => {
    const newChatId = generateId();
    const newProj = { 
      ...initialProject, 
      id: generateId(), 
      name: `Project ${projects.length + 1}`,
      chats: [{ id: newChatId, title: 'New Chat', messages: [], createdAt: Date.now() }],
      activeChatId: newChatId,
      createdAt: Date.now()
    };
    setProjects([newProj, ...projects]);
    setActiveId(newProj.id);
  };

  const handleAddFromMyProject = (mpProject) => {
    // Check if already added (match by mpId to avoid duplicates)
    if (projects.some(p => p.mpId === mpProject.id)) return;
    const newChatId = generateId();
    const newProj = {
      id: generateId(),
      mpId: mpProject.id,
      name: mpProject.name,
      description: mpProject.desc || '',
      status: mpProject.status || 'active',
      envs: [],
      chats: [{ id: newChatId, title: 'New Chat', messages: [], createdAt: Date.now() }],
      activeChatId: newChatId,
      createdAt: Date.now()
    };
    setProjects(prev => [newProj, ...prev]);
    setActiveId(newProj.id);
    setShowAddProject(false);
  };

  const handleDeleteProject = (id) => {
    const newProjects = projects.filter(p => p.id !== id);
    if (newProjects.length === 0) setProjects([{ ...initialProject, id: generateId(), createdAt: Date.now() }]);
    else setProjects(newProjects);
    if (activeId === id) setActiveId(newProjects.length > 0 ? newProjects[0].id : null);
  };

  const handleDuplicateProject = () => {
    const cloneId = generateId();
    const clone = { ...activeProject, id: cloneId, name: `${activeProject.name} (Copy)`, createdAt: Date.now() };
    setProjects([clone, ...projects]);
    setActiveId(cloneId);
  };

  const handleNewChat = () => {
    const newChat = { id: generateId(), title: 'New Chat', messages: [], createdAt: Date.now() };
    const updatedChats = [newChat, ...activeProject.chats];
    updateProject(activeProject.id, { chats: updatedChats, activeChatId: newChat.id });
  };

  const handleDeleteChat = (chatId) => {
    const updatedChats = activeProject.chats.filter(c => c.id !== chatId);
    if (updatedChats.length === 0) {
      const freshChat = { id: generateId(), title: 'New Chat', messages: [], createdAt: Date.now() };
      updateProject(activeProject.id, { chats: [freshChat], activeChatId: freshChat.id });
    } else {
      updateProject(activeProject.id, { chats: updatedChats, activeChatId: updatedChats[0].id });
    }
  };

  const tabs = [
    { id: 'chat', label: 'ChatDMP', icon: MessageSquare },
    { id: 'env', label: 'Environments', icon: Server },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-slate-950 text-slate-300 font-sans overflow-hidden relative w-full">
      {/* Background Deep Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[0%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 shrink-0 relative z-40 bg-slate-900/60 backdrop-blur-3xl border-b border-white/5 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg border border-white/5" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Terminal size={16} />
              </div>
              <h2 className="font-black text-white tracking-tight hidden sm:block">ChatDMP</h2>
            </div>
          </div>
        </div>
        
        <div className="flex bg-slate-950/50 rounded-xl p-1 border border-white/5 overflow-x-auto hide-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${isActive ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
              >
                <Icon size={14} className={isActive ? 'text-indigo-400' : ''} /> 
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden min-h-0 relative z-10 w-full">
        <Sidebar 
          projects={projects} 
          activeId={activeId} 
          setActiveId={setActiveId}
          handleNewProject={handleNewProject}
          handleDeleteProject={handleDeleteProject}
          activeProject={activeProject}
          handleNewChat={handleNewChat}
          handleDeleteChat={handleDeleteChat}
          setActiveChatId={(id) => updateProject(activeProject.id, { activeChatId: id })}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          updateProject={updateProject}
          updateChat={updateChat}
          onConfirmDelete={(type, id) => {
            const msg = type === 'project' ? 'Bạn có muốn xóa dự án này không?' : 'Bạn có muốn xóa đoạn chat này không?';
            setConfirmState({ type, id, message: msg });
          }}
        />

        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative z-10 bg-black/20">
          {activeTab === 'chat' && <ChatTab activeChat={activeChat} updateChat={updateCurrentChat} />}
          {activeTab === 'env' && <EnvTab project={activeProject} updateProject={updateCurrentProject} />}
          {activeTab === 'settings' && <SettingsTab project={activeProject} updateProject={updateCurrentProject} handleDuplicate={handleDuplicateProject} handleDelete={() => handleDeleteProject(activeProject.id)} />}
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Add Project Picker Modal */}
      {showAddProject && (() => {
        const myProjects = JSON.parse(localStorage.getItem('my_dashboard_projects') || '[]');
        const alreadyAdded = new Set(projects.map(p => p.mpId).filter(Boolean));
        return (
          <div
            className="fixed inset-0 z-[300] flex items-center justify-center px-6 bg-black/60 backdrop-blur-md"
            onClick={() => setShowAddProject(false)}
          >
            <div
              className="relative w-full max-w-md rounded-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
              style={{ background: 'linear-gradient(135deg, rgba(25,25,55,0.97) 0%, rgba(12,12,30,0.99) 100%)', boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(99,102,241,0.08)' }}
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Folder size={16} className="text-indigo-400" />
                    <h3 className="text-white font-bold text-base">Thêm từ My Projects</h3>
                  </div>
                  <button onClick={() => setShowAddProject(false)} className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                  {myProjects.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-6">Chưa có project nào trong My Projects</p>
                  ) : (
                    myProjects.map(p => {
                      const added = alreadyAdded.has(p.id);
                      return (
                        <button
                          key={p.id}
                          disabled={added}
                          onClick={() => handleAddFromMyProject(p)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all border ${
                            added
                              ? 'opacity-40 cursor-not-allowed border-transparent bg-white/3'
                              : 'hover:bg-white/5 border-transparent hover:border-indigo-500/20 cursor-pointer'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.color || 'from-indigo-500 to-violet-500'} flex items-center justify-center shrink-0`}>
                            <Folder size={16} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{p.name}</p>
                            <p className="text-xs text-slate-400 truncate">{p.desc}</p>
                          </div>
                          {added ? (
                            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full shrink-0">Đã thêm</span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 shrink-0">Thêm →</span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Custom Delete Confirm Modal */}
      {confirmState && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center px-6 bg-black/60 backdrop-blur-md"
          onClick={() => setConfirmState(null)}
        >
          <div
            className="relative w-full max-w-[360px] rounded-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
            style={{ background: 'linear-gradient(135deg, rgba(30,30,60,0.95) 0%, rgba(15,15,35,0.98) 100%)', boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(239,68,68,0.08)' }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

            <div className="p-6">
              {/* Icon + title */}
              <div className="flex flex-col items-center text-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl scale-150" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20 flex items-center justify-center">
                    <Trash2 size={24} className="text-red-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight">
                    {confirmState.type === 'project' ? 'Xóa dự án?' : 'Xóa đoạn chat?'}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                    {confirmState.message}
                  </p>
                  <p className="text-slate-600 text-xs mt-2">Hành động này không thể hoàn tác.</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmState(null)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-300 hover:text-white rounded-xl transition-all duration-200 border border-white/8 hover:border-white/15 hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    if (confirmState.type === 'project') handleDeleteProject(confirmState.id);
                    else handleDeleteChat(confirmState.id);
                    setConfirmState(null);
                  }}
                  className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:brightness-110 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 20px rgba(239,68,68,0.35)' }}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
