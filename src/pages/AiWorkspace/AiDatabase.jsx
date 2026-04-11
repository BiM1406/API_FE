import React from 'react';
import { Plus, Play, ArrowLeft, Database, Code, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function AiDatabase() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-slate-950 text-slate-300 font-sans flex flex-col overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <header className="h-16 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all active:scale-95"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
            <h1 className="font-bold text-white tracking-tight">Database Designer</h1>
          </div>
        </div>

        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
          <Play size={16} /> Run SQL
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden z-10">
        {/* Sidebar - Table List */}
        <div className="w-80 border-r border-slate-800/50 bg-slate-900/30 backdrop-blur-md p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Shield size={16} className="text-violet-400" /> Tables
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">2 Total</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
            {/* User Table */}
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-violet-500/50 transition-all group cursor-pointer">
              <div className="flex justify-between items-center mb-3">
                <span className="text-violet-400 font-bold group-hover:text-violet-300 transition-colors">users</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">id</span>
                  <span className="text-amber-500/80 font-mono">PK, UUID</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">email</span>
                  <span className="text-indigo-400 font-mono">VARCHAR</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">password</span>
                  <span className="text-indigo-400 font-mono">VARCHAR</span>
                </div>
              </div>
            </div>

            {/* Posts Table */}
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-violet-500/50 transition-all group cursor-pointer">
              <div className="flex justify-between items-center mb-3">
                <span className="text-violet-400 font-bold group-hover:text-violet-300 transition-colors">posts</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">id</span>
                  <span className="text-amber-500/80 font-mono">PK, UUID</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">user_id</span>
                  <span className="text-emerald-400 font-mono">FK</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">content</span>
                  <span className="text-indigo-400 font-mono">TEXT</span>
                </div>
              </div>
            </div>
          </div>

          <button className="mt-6 w-full py-3 bg-slate-900/50 border border-slate-800 hover:border-violet-500/50 text-violet-400 rounded-xl transition-all flex justify-center items-center gap-2 group active:scale-[0.98]">
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> 
            <span className="font-semibold text-sm">Add New Table</span>
          </button>
        </div>

        {/* Content Area - SQL Preview */}
        <div className="flex-1 bg-slate-950/20 p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Code size={18} />
              </div>
              <h3 className="text-white font-semibold">Generated SQL Schema</h3>
            </div>
            <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 font-semibold text-sm">
              <Play size={16} /> Execute Schema
            </button>
          </div>

          <div className="flex-1 relative group overflow-hidden bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl">
            <div className="absolute inset-0 bg-indigo-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <SyntaxHighlighter 
              language="sql" 
              style={atomDark}
              customStyle={{
                background: 'transparent',
                padding: '1.5rem',
                fontSize: '0.875rem',
                lineHeight: '1.625',
                margin: 0,
                height: '100%',
              }}
              className="custom-scrollbar"
            >
{`-- SQL for User Authentication & Posts
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
}
