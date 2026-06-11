import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Folder, Plus, Trash2, Copy, Edit2, Archive,
  MessageSquare, Terminal, Settings, Send, RefreshCw, Code2,
  Eye, EyeOff, Download, Menu, X, Database,
  Server, Bot, ChevronDown, MoreHorizontal, Pin, Zap, History as HistoryIcon
} from 'lucide-react';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';
import { logActivity } from '../../utils/activityLogger';
import { sendChatMessage } from '../../services/aiService';
import { readArrayStorage, readStorage, writeStorage } from '../../utils/storage';

const generateId = () => Math.random().toString(36).substr(2, 9);

// Sidebar component
const Sidebar = ({
  projects, activeId, setActiveId,
  activeProject, handleNewChat, setActiveChatId,
  sidebarOpen, setSidebarOpen, updateProject, updateChat, onConfirmDelete, setShowAddProject
}) => {
  const { t } = useTranslation();
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuType, setMenuType] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const activeChat = activeProject?.chats?.find(c => c.id === activeProject.activeChatId) || activeProject?.chats?.[0];
  const isActiveNewChat = activeChat && (!activeChat.messages || activeChat.messages.length === 0);

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

    const doPin = (e) => {
      e.stopPropagation();
      if (isProj) updateProject(id, { pinned: !isPinned });
      else updateChat(activeProject.id, id, { pinned: !isPinned });
      closeMenu();
    };
    const doRename = (e) => {
      e.stopPropagation();
      setMenuType(type);
      setEditingId(id);
      setEditName(isProj ? item.name : item.title || t('chat_dmp.sidebar.default_chat_title'));
      closeMenu();
    };
    const doArchive = (e) => {
      e.stopPropagation();
      if (isProj) updateProject(id, { archived: true });
      else updateChat(activeProject.id, id, { archived: true });
      if (activeId === id && isProj) setActiveId(projects.find(p => p.id !== id)?.id || projects[0]?.id);
      closeMenu();
    };
    const doDelete = (e) => {
      e.stopPropagation();
      onConfirmDelete(isProj ? 'project' : 'chat', id);
      closeMenu();
    };

    return ReactDOM.createPortal(
      <>
        <div className="fixed inset-0 z-[200]" onClick={(e) => { e.stopPropagation(); closeMenu(); }} />
        <div
          className="fixed z-[201] w-44 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl shadow-black/70 py-1 overflow-hidden"
          style={{ top: menuPos.top, left: menuPos.left }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={doPin} className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors">
            <Pin size={14} className={isPinned ? 'text-amber-400' : 'opacity-60'} /> {isPinned ? t('chat_dmp.sidebar.unpin_option') : (isProj ? t('chat_dmp.sidebar.pin_option') : t('chat_dmp.sidebar.pin_option'))}
          </button>
          <button onClick={doRename} className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors">
            <Edit2 size={14} className="opacity-60" /> {t('chat_dmp.sidebar.rename_option')}
          </button>
          <button onClick={doArchive} className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors">
            <Archive size={14} className="opacity-60" /> {t('chat_dmp.sidebar.archive_option')}
          </button>
          <div className="h-px bg-white/10 my-1 mx-2" />
          <button onClick={doDelete} className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors">
            <Trash2 size={14} className="opacity-80" /> {t('chat_dmp.sidebar.delete_option')}
          </button>
        </div>
      </>,
      document.body
    );
  };

  const getSortedItems = (list) => {
    if (!list) return [];
    return [...list].filter(i => !i.archived).sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt - a.createdAt;
    });
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/60 backdrop-blur-2xl border-r border-white/5 transform transition-transform duration-300 ease-in-out flex flex-col p-4 space-y-4 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
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
            <span className="font-bold text-white text-sm tracking-wide">{t('chat_dmp.sidebar.projects_title')}</span>
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
              <Plus size={14} /> {t('chat_dmp.sidebar.add_project_btn')}
            </button>
          </div>
        )}
      </div>

      {/* Box 2: New Chat */}
      <div className="shrink-0 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-2 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <button
          onClick={handleNewChat}
          className={`w-full flex items-center justify-center px-3 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 border ${
            isActiveNewChat
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-indigo-500/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)]'
              : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10 text-white'
          }`}
        >
          {t('chat_dmp.sidebar.new_chat_btn')}
        </button>
      </div>

      {/* Box 3: History */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 shrink-0 bg-black/20 shadow-inner">
          <HistoryIcon size={14} className="text-slate-400" />
          <span className="text-xs font-bold tracking-widest text-slate-300 uppercase">{t('chat_dmp.sidebar.history_title')}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {(!activeProject?.chats || activeProject.chats.filter(c => c.messages && c.messages.length > 0).length === 0) ? (
             <div className="text-center text-xs text-slate-500 p-4">{t('chat_dmp.sidebar.no_chats')}</div>
          ) : (
            getSortedItems(activeProject.chats.filter(c => c.messages && c.messages.length > 0)).map(chat => {
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
                      <span className="truncate text-xs font-medium">{(chat.title === 'Đoạn chat mới' || chat.title === 'New chat' || chat.title === 'New Chat' || !chat.title) ? t('chat_dmp.sidebar.default_chat_title') : chat.title}</span>
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

const ChatTab = ({ activeChat, updateChat, activeMode, setActiveMode }) => {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollContainerRef = useRef(null);

  const isVi = i18n.language.startsWith('vi');

  const aiModes = [
    { id: 'chat', label: isVi ? 'Chat thường' : 'General Chat', icon: MessageSquare },
    { id: 'code', label: isVi ? 'Sinh code' : 'Code Gen', icon: Code2 },
    { id: 'api', label: isVi ? 'Sinh API' : 'API Gen', icon: Zap },
    { id: 'debug', label: isVi ? 'Debug lỗi' : 'Debug Error', icon: Terminal },
    { id: 'database', label: isVi ? 'Thiết kế Database' : 'Database Design', icon: Database },
    { id: 'docs', label: isVi ? 'Viết tài liệu API' : 'API Docs', icon: Archive }
  ];

  const promptSuggestions = [
    { label: isVi ? 'Sinh API đăng nhập' : 'Gen Login API', prompt: isVi ? 'Sinh API đăng nhập JWT gồm request, response, validate và lỗi thường gặp.' : 'Generate a JWT login API with request, response, validation, and common errors.' },
    { label: isVi ? 'Tạo database cho hệ thống đặt vé' : 'Create Booking DB', prompt: isVi ? 'Tạo database schema cho hệ thống đặt vé gồm user, event, seat, booking và payment.' : 'Create a database schema for a booking system containing user, event, seat, booking, and payment.' },
    { label: isVi ? 'Viết code React gọi API' : 'React API Fetch Code', prompt: isVi ? 'Viết code React gọi API với loading, error state và token bearer.' : 'Write React code to call an API with loading, error states, and bearer token.' },
    { label: isVi ? 'Phân tích lỗi response API' : 'Analyze API Error', prompt: isVi ? 'Phân tích lỗi response API sau và đề xuất cách sửa.' : 'Analyze the following API error response and suggest a fix.' }
  ];

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
        <p>{t('chat_dmp.sidebar.no_chats')}</p>
      </div>
    );
  }

  const buildAssistantReply = (message) => {
    const modeLabel = aiModes.find((mode) => mode.id === activeMode)?.label || (isVi ? 'Chat thường' : 'General Chat');
    if (activeMode === 'api') {
      return isVi
        ? `Mình đề xuất API request sau cho yêu cầu: "${message}"\n\n\`\`\`http\nPOST {{baseUrl}}/auth/login\nContent-Type: application/json\n\n{\n  "email": "user@example.com",\n  "password": "secret123"\n}\n\`\`\`\n\nResponse nên trả về accessToken, refreshToken và thông tin user tối giản.`
        : `Here is a proposed API request for: "${message}"\n\n\`\`\`http\nPOST {{baseUrl}}/auth/login\nContent-Type: application/json\n\n{\n  "email": "user@example.com",\n  "password": "secret123"\n}\n\`\`\`\n\nResponse should return accessToken, refreshToken, and basic user info.`;
    }
    if (activeMode === 'database') {
      return isVi
        ? `Schema gợi ý cho yêu cầu: "${message}"\n\n\`\`\`sql\nCREATE TABLE users (\n  id UUID PRIMARY KEY,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  full_name VARCHAR(160),\n  created_at TIMESTAMP NOT NULL\n);\n\nCREATE TABLE bookings (\n  id UUID PRIMARY KEY,\n  user_id UUID NOT NULL,\n  status VARCHAR(32) NOT NULL,\n  created_at TIMESTAMP NOT NULL\n);\n\`\`\`\n\nBạn có thể áp dụng schema này vào Database Designer rồi tinh chỉnh cột/quan hệ.`
        : `Suggested schema for: "${message}"\n\n\`\`\`sql\nCREATE TABLE users (\n  id UUID PRIMARY KEY,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  full_name VARCHAR(160),\n  created_at TIMESTAMP NOT NULL\n);\n\nCREATE TABLE bookings (\n  id UUID PRIMARY KEY,\n  user_id UUID NOT NULL,\n  status VARCHAR(32) NOT NULL,\n  created_at TIMESTAMP NOT NULL\n);\n\`\`\`\n\nYou can apply this schema in the Database Designer.`;
    }
    if (activeMode === 'code') {
      return isVi
        ? `Đây là mẫu code cho yêu cầu: "${message}"\n\n\`\`\`javascript\nexport async function requestApi(path, token) {\n  const response = await fetch(\`{{baseUrl}}\${path}\`, {\n    headers: { Authorization: \`Bearer \${token}\` }\n  });\n\n  if (!response.ok) throw new Error(await response.text());\n  return response.json();\n}\n\`\`\``
        : `Sample code for: "${message}"\n\n\`\`\`javascript\nexport async function requestApi(path, token) {\n  const response = await fetch(\`{{baseUrl}}\${path}\`, {\n    headers: { Authorization: \`Bearer \${token}\` }\n  });\n\n  if (!response.ok) throw new Error(await response.text());\n  return response.json();\n}\n\`\`\``;
    }
    if (activeMode === 'debug') {
      return isVi
        ? `Mình sẽ debug theo các bước:\n\n1. Kiểm tra status code và response body.\n2. Đối chiếu headers, auth token và environment variables.\n3. Thử lại request trong API Tester.\n\n\`\`\`json\n{\n  "hint": "Dán response lỗi vào đây để phân tích chi tiết"\n}\n\`\`\``
        : `Debugging steps:\n\n1. Check status code and response body.\n2. Verify headers, auth token, and environment variables.\n3. Retry request in API Tester.\n\n\`\`\`json\n{\n  "hint": "Paste the error response here for detailed analysis"\n}\n\`\`\``;
    }
    if (activeMode === 'docs') {
      return isVi
        ? `Tài liệu API nháp:\n\n### Endpoint\n\`${message}\`\n\n### Mục tiêu\nMô tả request, authentication, response mẫu và lỗi phổ biến để team frontend/backend dùng chung.`
        : `Draft API Documentation:\n\n### Endpoint\n\`${message}\`\n\n### Objective\nDescribe requests, authentication, mock responses, and errors.`;
    }
    return isVi
      ? `Đang ở mode ${modeLabel}. Đây là phản hồi mẫu cho: "${message}"\n\n\`\`\`javascript\nconsole.log("ChatDMP ready");\n\`\`\``
      : `AI Mode: ${activeMode}. Echo: "${message}"\n\n\`\`\`javascript\nconsole.log("ChatDMP ready");\n\`\`\``;
  };

  const handleSend = (preset) => {
    const content = (typeof preset === 'string' ? preset : input).trim();
    if (!content) return;

    const isFirstMsg = activeChat.messages.length === 0;
    const newTitle = isFirstMsg ? (content.length > 28 ? `${content.substring(0, 28)}...` : content) : undefined;

    const newMsg = { id: generateId(), role: 'user', content, timestamp: Date.now(), mode: activeMode };
    const updatedMessages = [...activeChat.messages, newMsg];

    updateChat({ messages: updatedMessages, ...(newTitle && { title: newTitle }) });
    setInput('');
    setIsTyping(true);

    logActivity('chatDmp', 'Sent message in ChatDMP');

    setTimeout(async () => {
      let aiMsg;
      try {
        const aiResponse = await sendChatMessage({ message: newMsg.content, mode: activeMode });
        aiMsg = { id: aiResponse.id || generateId(), role: 'assistant', content: aiResponse.content || buildAssistantReply(newMsg.content), timestamp: Date.now(), mode: activeMode, metadata: aiResponse.metadata || {} };
      } catch {
        aiMsg = { id: generateId(), role: 'assistant', content: buildAssistantReply(newMsg.content), timestamp: Date.now(), mode: activeMode };
      }
      updateChat({ messages: [...updatedMessages, aiMsg] });
      setIsTyping(false);
    }, 1500);
  };

  const renderMessage = (msg) => {
    const isUser = msg.role === 'user';
    const hasApiRequest = !isUser && /POST|GET|PUT|PATCH|DELETE|{{baseUrl}}|Content-Type/i.test(msg.content);
    const hasSchema = !isUser && /CREATE TABLE|PRIMARY KEY|schema/i.test(msg.content);

    if (isUser) {
      return (
        <div key={msg.id} className="flex justify-end mb-6">
          <div className="bg-slate-800/80 border border-slate-700/30 rounded-2xl rounded-tr-none px-5 py-3.5 text-slate-200 text-sm max-w-[75%] md:max-w-[70%] shadow-lg leading-relaxed font-medium whitespace-pre-wrap">
            {msg.content}
          </div>
        </div>
      );
    }

    return (
      <div key={msg.id} className="flex justify-start mb-8 group/msg">
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between mb-1 h-6">
            <div />
            <button
              onClick={() => { navigator.clipboard.writeText(msg.content); toast.success(t('chat_dmp.chat_tab.copied_toast')); }}
              className="opacity-0 group-hover/msg:opacity-100 transition-opacity p-1.5 hover:bg-white/5 text-slate-500 hover:text-white rounded"
              title={isVi ? 'Sao chép tin nhắn' : 'Copy message'}
            >
              <Copy size={13} />
            </button>
          </div>
          <div className="text-slate-300 text-sm leading-relaxed font-medium space-y-4">
            {msg.content.split('```').map((part, i) => {
              if (i % 2 === 1) {
                const lines = part.split('\n');
                const lang = lines[0] || 'text';
                const code = lines.slice(1).join('\n');
                return (
                  <div key={i} className="my-4 bg-slate-950 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                    <div className="flex justify-between items-center px-4 py-2 bg-[#181824] border-b border-white/5 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      <span>{lang}</span>
                      <button onClick={() => { navigator.clipboard.writeText(code); toast.success(t('chat_dmp.chat_tab.copied_code_toast')); }} className="hover:text-white flex items-center gap-1 transition-colors"><Copy size={12} /> {isVi ? 'Sao chép' : 'Copy'}</button>
                    </div>
                    <SyntaxHighlighter
                      language={lang === 'text' ? 'javascript' : lang}
                      style={atomDark}
                      customStyle={{ background: 'transparent', padding: '1rem', margin: 0, fontSize: '0.8rem', lineHeight: '1.6' }}
                      className="custom-scrollbar"
                    >
                      {code}
                    </SyntaxHighlighter>
                  </div>
                );
              }
              return <span key={i} className="whitespace-pre-wrap">{part}</span>;
            })}
          </div>

          {(hasApiRequest || hasSchema) && (
            <div className="mt-4 flex flex-wrap gap-2 pt-2">
              {hasApiRequest && (
                <button onClick={() => {
                  localStorage.setItem('api_fe_pending_api_test_request', JSON.stringify(msg.metadata?.apiRequest || {
                    method: 'POST',
                    url: '{{baseUrl}}/auth/login',
                    headers: [{ key: 'Content-Type', value: 'application/json' }],
                    body: '{\n  "email": "user@example.com",\n  "password": "123456"\n}'
                  }));
                  toast.success(t('chat_dmp.chat_tab.sent_to_tester_toast'));
                }} className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-2 text-xs font-bold text-indigo-300 transition hover:bg-indigo-500/20">
                  {t('chat_dmp.chat_tab.use_tester_btn')}
                </button>
              )}
              {hasSchema && (
                <button onClick={() => {
                  localStorage.setItem('api_fe_pending_database_schema', JSON.stringify(msg.metadata?.databaseSchema || {
                    dbType: 'postgresql',
                    tables: [
                      {
                        name: 'users',
                        columns: [
                          { name: 'id', type: 'UUID', primaryKey: true, nullable: false, unique: true },
                          { name: 'email', type: 'VARCHAR(255)', primaryKey: false, nullable: false, unique: true }
                        ]
                      }
                    ]
                  }));
                  toast.success(t('chat_dmp.chat_tab.applied_schema_toast'));
                }} className="rounded-xl bg-violet-500/10 border border-violet-500/20 px-3.5 py-2 text-xs font-bold text-violet-300 transition hover:bg-violet-500/20">
                  {t('chat_dmp.chat_tab.apply_db_btn')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full relative">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        {activeChat.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 max-w-4xl mx-auto w-full px-4">
            <div className="w-16 h-16 bg-slate-900 rounded-3xl border border-white/5 flex items-center justify-center shadow-2xl mb-6 shadow-black/50 ring-1 ring-white/10">
              <Bot size={28} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight text-center">{t('chat_dmp.chat_tab.ready_title')}</h3>
            <p className="text-xs text-slate-400 text-center">{t('chat_dmp.chat_tab.ready_desc')}</p>
            <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
              {promptSuggestions.map((suggestion) => (
                <button
                  key={suggestion.label}
                  onClick={() => handleSend(suggestion.prompt)}
                  className="rounded-2xl border border-white/5 bg-slate-900/40 p-4 text-left transition hover:border-indigo-500/30 hover:bg-white/[0.02] group"
                >
                  <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{suggestion.label}</p>
                  <p className="mt-1.5 line-clamp-2 text-[11px] font-medium text-slate-500 leading-relaxed">{suggestion.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full">
            {activeChat.messages.map(renderMessage)}
            {isTyping && (
              <div className="flex justify-start mb-8">
                <div className="bg-slate-900/40 border border-white/5 rounded-2xl px-4 py-3 text-slate-400 text-xs flex items-center gap-2.5 shadow-md">
                  <RefreshCw size={14} className="animate-spin text-indigo-400" /> {t('chat_dmp.chat_tab.thinking')}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 border-t border-white/5 bg-slate-900/60 backdrop-blur-2xl shrink-0">
        <div className="mx-auto mb-3 flex max-w-4xl gap-2 overflow-x-auto hide-scrollbar">
          {aiModes.map((mode) => {
            const Icon = mode.icon;
            const active = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  active ? 'border-indigo-500/40 bg-indigo-500/15 text-white' : 'border-white/5 bg-slate-950/50 text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={14} />
                {mode.label}
              </button>
            );
          })}
        </div>
        <div className="relative max-w-4xl mx-auto flex items-end bg-slate-950/60 border border-white/10 rounded-2xl focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all pl-5 pr-2 py-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t('chat_dmp.chat_tab.placeholder')}
            className="flex-1 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 py-2.5 text-sm text-white placeholder-slate-500 resize-none custom-scrollbar"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '200px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="shrink-0 h-10 w-10 text-slate-400 hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors flex items-center justify-center ml-2 mb-0.5"
          >
            {isTyping ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <div className="max-w-4xl mx-auto text-center mt-3">
          <p className="text-[10px] text-slate-500 font-medium">{t('chat_dmp.chat_tab.disclaimer')}</p>
        </div>
      </div>
    </div>
  );
};

const EnvTab = ({ project, updateProject }) => {
  const { t } = useTranslation();
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
              <h2 className="text-xl font-bold text-white tracking-tight">{t('chat_dmp.env_tab.title')}</h2>
              <p className="text-xs text-slate-400 mt-1">{t('chat_dmp.env_tab.subtitle')}</p>
            </div>
          </div>
          <button onClick={addEnv} className="bg-white/5 hover:bg-white/10 border border-white/5 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all active:scale-95">
            <Plus size={18} /> {t('chat_dmp.env_tab.add_btn')}
          </button>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 gap-4 p-5 border-b border-white/5 bg-slate-950/40 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <div className="col-span-4 pl-2">{t('chat_dmp.env_tab.key_col')}</div>
            <div className="col-span-6">{t('chat_dmp.env_tab.val_col')}</div>
            <div className="col-span-2 text-right pr-2">{t('chat_dmp.env_tab.actions_col')}</div>
          </div>

          {project.envs.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 mb-4 shadow-inner">
                <Database size={24} className="text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium text-sm">{t('chat_dmp.env_tab.no_envs')}</p>
              <p className="text-slate-500 text-xs mt-1">{t('chat_dmp.env_tab.no_envs_desc')}</p>
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
                      placeholder={t('chat_dmp.env_tab.placeholder_key')}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-lg px-3 py-2 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none text-sm font-mono text-emerald-300 transition-all"
                    />
                  </div>
                  <div className="col-span-6 relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={env.hidden ? "password" : "text"}
                        value={env.value}
                        onChange={e => updateEnv(env.id, 'value', e.target.value)}
                        placeholder={t('chat_dmp.env_tab.placeholder_val')}
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
          <span>{t('chat_dmp.env_tab.syntax_tip')}</span>
        </div>
      </div>
    </div>
  );
};

const SettingsTab = ({ project, updateProject, handleDuplicate, handleDelete }) => {
  const { t } = useTranslation();
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
              {t('chat_dmp.settings_tab.title')}
            </h2>
            <p className="text-sm text-slate-400 ml-[52px]">{t('chat_dmp.settings_tab.subtitle')}</p>
          </div>

          <div className="space-y-6 bg-slate-900/40 backdrop-blur-2xl p-8 rounded-3xl border border-white/5 shadow-2xl">
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">{t('chat_dmp.settings_tab.proj_name')}</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-white font-medium placeholder-slate-600 shadow-inner"
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">{t('chat_dmp.settings_tab.desc')}</label>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                rows={4}
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-white font-medium resize-none placeholder-slate-600 shadow-inner"
              />
            </div>
            <button onClick={handleSave} className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl flex items-center justify-center font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
              {saved ? t('chat_dmp.settings_tab.toast_saved') : t('chat_dmp.settings_tab.update_btn')}
            </button>
          </div>
        </section>

        <section className="pt-4">
          <h3 className="text-lg font-bold text-white mb-6 tracking-tight pl-1">{t('chat_dmp.settings_tab.data_mgmt')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-5 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:bg-slate-800/40 transition-colors">
              <div>
                <p className="text-sm font-bold text-white tracking-tight">{t('chat_dmp.settings_tab.export_title')}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t('chat_dmp.settings_tab.export_desc')}</p>
              </div>
              <button onClick={handleExport} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95">
                <Download size={16} /> {t('chat_dmp.settings_tab.export_btn')}
              </button>
            </div>

            <div className="flex items-center justify-between p-5 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:bg-slate-800/40 transition-colors">
              <div>
                <p className="text-sm font-bold text-white tracking-tight">{t('chat_dmp.settings_tab.dup_title')}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t('chat_dmp.settings_tab.dup_desc')}</p>
              </div>
              <button onClick={handleDuplicate} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95">
                <Copy size={16} /> {t('chat_dmp.settings_tab.dup_btn')}
              </button>
            </div>

            <div className="flex items-center justify-between p-6 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-2xl transition-all">
              <div>
                <p className="text-sm font-bold text-red-400 tracking-tight">{t('chat_dmp.settings_tab.danger_zone')}</p>
                <p className="text-xs text-red-500/70 mt-0.5 font-medium">{t('chat_dmp.settings_tab.delete_desc')}</p>
              </div>
              <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-red-500/10">
                <Trash2 size={16} /> {t('chat_dmp.settings_tab.delete_btn')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default function ChatDMP() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const isVi = i18n.language.startsWith('vi');

  const initialChat = {
    id: generateId(),
    title: t('chat_dmp.sidebar.default_chat_title'),
    messages: [],
    createdAt: Date.now()
  };

  const initialProject = {
    id: generateId(),
    name: 'Project 1',
    description: isVi ? 'Dự án mặc định' : 'Default Project',
    status: 'active',
    envs: [],
    chats: [initialChat],
    activeChatId: initialChat.id,
    createdAt: Date.now()
  };

  const [projects, setProjects] = useState(() => {
    let list = readStorage('ai_projects_v2', null);
    if (!Array.isArray(list)) {
      const parsedOld = readStorage('ai_projects', null);
      if (Array.isArray(parsedOld)) {
        list = parsedOld.map(p => ({
          ...p,
          chats: p.chats || [{ id: generateId(), title: p.name + ' Chat', messages: p.messages || [], createdAt: p.createdAt || Date.now() }],
          activeChatId: p.activeChatId || null
        }));
      } else {
        list = [initialProject];
      }
    }
    return list.filter((p) => p.id !== 'mp-1' && p.id !== 'mp-2');
  });

  const [activeId, setActiveId] = useState(projects[0]?.id);
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'chat');
  const [activeMode, setActiveMode] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const [showAddProject, setShowAddProject] = useState(false);

  useEffect(() => {
    writeStorage('ai_projects_v2', projects);
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeId) || projects[0];

  const updateProject = (id, updates) => {
    setProjects(projs => projs.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // Automatically select a chat if none is selected
  useEffect(() => {
    if (activeProject && !activeProject.activeChatId && activeProject.chats && activeProject.chats.length > 0) {
       updateProject(activeProject.id, { activeChatId: activeProject.chats[0].id });
    }
  }, [activeProject]);

  const activeChat = activeProject?.chats?.find(c => c.id === activeProject.activeChatId) || activeProject?.chats?.[0];

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

  const handleAddFromMyProject = (mpProject) => {
    if (projects.some(p => p.mpId === mpProject.id)) return;
    const newChatId = generateId();
    const newProj = {
      id: generateId(),
      mpId: mpProject.id,
      name: mpProject.name,
      description: mpProject.desc || '',
      status: mpProject.status || 'active',
      envs: [],
      chats: [{ id: newChatId, title: t('chat_dmp.sidebar.default_chat_title'), messages: [], createdAt: Date.now() }],
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
    if (!activeProject) return;
    const cloneId = generateId();
    const suffix = isVi ? ' (Bản sao)' : ' (Copy)';
    const clone = { ...activeProject, id: cloneId, name: `${activeProject.name}${suffix}`, createdAt: Date.now() };
    setProjects([clone, ...projects]);
    setActiveId(cloneId);
  };

  const handleNewChat = () => {
    if (!activeProject) return;
    const newChat = { id: generateId(), title: t('chat_dmp.sidebar.default_chat_title'), messages: [], createdAt: Date.now() };
    const updatedChats = [newChat, ...(activeProject.chats || [])];
    updateProject(activeProject.id, { chats: updatedChats, activeChatId: newChat.id });
    logActivity('chatDmp', 'Created new chat thread');
  };

  const handleDeleteChat = (chatId) => {
    if (!activeProject) return;
    const updatedChats = (activeProject.chats || []).filter(c => c.id !== chatId);
    if (updatedChats.length === 0) {
      const freshChat = { id: generateId(), title: t('chat_dmp.sidebar.default_chat_title'), messages: [], createdAt: Date.now() };
      updateProject(activeProject.id, { chats: [freshChat], activeChatId: freshChat.id });
    } else {
      updateProject(activeProject.id, { chats: updatedChats, activeChatId: updatedChats[0].id });
    }
  };

  const tabs = [
    { id: 'chat', label: 'ChatDMP', icon: MessageSquare },
    { id: 'env', label: t('chat_dmp.env_tab.title'), icon: Server },
    { id: 'settings', label: t('chat_dmp.settings_tab.title') === 'Project Configuration' ? 'Settings' : 'Cài đặt', icon: Settings },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-slate-950 text-slate-300 font-sans overflow-hidden relative w-full">
      {/* Background Deep Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[0%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 shrink-0 relative z-40 bg-slate-900/60 backdrop-blur-3xl border-b border-white/5 shadow-sm">
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
          activeProject={activeProject}
          handleNewChat={handleNewChat}
          setActiveChatId={(id) => activeProject && updateProject(activeProject.id, { activeChatId: id })}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          updateProject={updateProject}
          updateChat={updateChat}
          setShowAddProject={setShowAddProject}
          onConfirmDelete={(type, id) => {
            const msg = type === 'project' ? t('chat_dmp.modals.delete_proj_confirm') : t('chat_dmp.modals.delete_chat_confirm');
            setConfirmState({ type, id, message: msg });
          }}
        />

        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative z-10 bg-black/20">
          {activeTab === 'chat' && (
            <ChatTab
              key={activeChat?.id}
              activeChat={activeChat}
              updateChat={updateCurrentChat}
              activeMode={activeMode}
              setActiveMode={setActiveMode}
              onClear={() => setConfirmState({ type: 'clear_chat', id: activeChat?.id, message: t('chat_dmp.modals.clear_chat_confirm') })}
            />
          )}
          {activeTab === 'env' && activeProject && <EnvTab project={activeProject} updateProject={updateCurrentProject} />}
          {activeTab === 'settings' && activeProject && <SettingsTab project={activeProject} updateProject={updateCurrentProject} handleDuplicate={handleDuplicateProject} handleDelete={() => setConfirmState({ type: 'project', id: activeProject.id, message: t('chat_dmp.modals.delete_proj_confirm') })} />}
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Add Project Picker Modal */}
      {showAddProject && (() => {
        const myProjects = readArrayStorage('my_dashboard_projects', []).filter(
          (p) => p.id !== 'mp-1' && p.id !== 'mp-2'
        );
        const alreadyAdded = new Set(projects.map(p => p.mpId).filter(Boolean));
        return (
          <div
            className="fixed inset-0 z-[300] flex items-center justify-center px-6 bg-black/35 backdrop-blur-[1px]"
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
                    <h3 className="text-white font-bold text-base">{t('chat_dmp.modals.add_modal_title')}</h3>
                  </div>
                  <button onClick={() => setShowAddProject(false)} className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                  {myProjects.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-6">{t('chat_dmp.modals.add_modal_no_projects')}</p>
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
                            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full shrink-0">{t('chat_dmp.modals.add_modal_added')}</span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 shrink-0">{t('chat_dmp.modals.add_modal_add')} →</span>
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
          className="fixed inset-0 z-[300] flex items-center justify-center px-6 bg-black/35 backdrop-blur-[1px]"
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
                    {confirmState.type === 'project' ? t('chat_dmp.modals.delete_proj_title') : confirmState.type === 'clear_chat' ? t('chat_dmp.modals.clear_chat_title') : t('chat_dmp.modals.delete_chat_title')}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                    {confirmState.message}
                  </p>
                  <p className="text-slate-600 text-xs mt-2">{t('chat_dmp.modals.confirm_warning')}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmState(null)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-300 hover:text-white rounded-xl transition-all duration-200 border border-white/8 hover:border-white/15 hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  {t('chat_dmp.modals.btn_cancel')}
                </button>
                <button
                  onClick={async () => {
                    if (confirmState.type === 'project') handleDeleteProject(confirmState.id);
                    else if (confirmState.type === 'chat') handleDeleteChat(confirmState.id);
                    else if (confirmState.type === 'clear_chat') updateCurrentChat({ messages: [] });
                    setConfirmState(null);
                  }}
                  className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:brightness-110 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 20px rgba(239,68,68,0.35)' }}
                >
                  {t('chat_dmp.modals.btn_delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
