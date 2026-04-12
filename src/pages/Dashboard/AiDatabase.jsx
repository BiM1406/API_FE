import React, { useState } from 'react';
import { Plus, Play, Database, Code, Shield, Table2, Key, Search, MoreVertical, Copy, Hash, Type, Link as LinkIcon, Edit3, Trash2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function AiDatabase() {
  const [activeTable, setActiveTable] = useState('users');
  const [searchTable, setSearchTable] = useState('');

  const tables = [
    {
      name: 'users',
      rows: 1542,
      columns: [
        { name: 'id', type: 'UUID', meta: 'PK', icon: Key, color: 'text-amber-400' },
        { name: 'email', type: 'VARCHAR', meta: 'UNIQUE', icon: Type, color: 'text-indigo-400' },
        { name: 'password', type: 'VARCHAR', meta: '', icon: Type, color: 'text-indigo-400' },
        { name: 'created_at', type: 'TIMESTAMP', meta: 'DEFAULT NOW', icon: Hash, color: 'text-emerald-400' }
      ]
    },
    {
      name: 'posts',
      rows: 8930,
      columns: [
        { name: 'id', type: 'UUID', meta: 'PK', icon: Key, color: 'text-amber-400' },
        { name: 'user_id', type: 'UUID', meta: 'FK (users)', icon: LinkIcon, color: 'text-rose-400' },
        { name: 'content', type: 'TEXT', meta: '', icon: Type, color: 'text-indigo-400' },
        { name: 'created_at', type: 'TIMESTAMP', meta: 'DEFAULT NOW', icon: Hash, color: 'text-emerald-400' }
      ]
    }
  ];

  const filteredTables = tables.filter(t => t.name.toLowerCase().includes(searchTable.toLowerCase()));

  const generateSQL = () => {
    return `-- SQL Schema for ChatDMP App
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
);

-- Index optimization
CREATE INDEX idx_posts_user_id ON posts(user_id);`;
  };

  return (
    <div className="flex-1 min-h-0 w-full bg-slate-950 text-slate-300 font-sans flex flex-col overflow-hidden relative">
      {/* Background Deep Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[0%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 shrink-0 relative z-40 bg-slate-900/60 backdrop-blur-3xl border-b border-white/5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <Database size={16} />
          </div>
          <h2 className="font-black text-white tracking-tight">Database Designer</h2>
        </div>

        <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95 group overflow-hidden relative">
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <Play size={16} className="relative z-10" />
          <span className="relative z-10">Run SQL</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden z-10 relative">
        
        {/* Sidebar - Table Drawer */}
        <div className="w-80 border-r border-white/5 bg-slate-900/60 backdrop-blur-2xl flex flex-col relative z-20">
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold tracking-tight text-sm flex items-center gap-2">
                <Table2 size={16} className="text-emerald-400" /> Tables
              </h3>
              <span className="text-[10px] bg-slate-950 font-bold text-slate-400 px-2.5 py-1 rounded-md border border-white/5 shadow-inner">2 Total</span>
            </div>
            
            <div className="relative group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Find tables..." 
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-slate-200 placeholder-slate-500 shadow-inner"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {filteredTables.map((table) => (
              <div 
                key={table.name}
                onClick={() => setActiveTable(table.name)}
                className={`p-4 rounded-xl border transition-all cursor-pointer group shadow-xl ${activeTable === table.name ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950/40 border-white/5 hover:border-white/10 hover:bg-slate-900/80'}`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${activeTable === table.name ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-700'}`}></div>
                    <span className={`font-bold transition-colors text-sm ${activeTable === table.name ? 'text-emerald-400' : 'text-slate-300 group-hover:text-white'}`}>{table.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}><Edit3 size={14}/></button>
                  </div>
                </div>
                <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-white/5">
                  {table.columns.map((col, idx) => {
                    const ColIcon = col.icon;
                    return (
                      <div key={idx} className="flex justify-between items-center text-[11px] group/col">
                        <div className="flex items-center gap-2">
                           <ColIcon size={12} className={`${col.color} opacity-70 group-hover/col:opacity-100 transition-opacity`} />
                           <span className="text-slate-300 font-medium">{col.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           {col.meta && <span className="bg-slate-800 text-[9px] px-1.5 py-0.5 rounded font-mono text-slate-400 tracking-wider hidden group-hover/col:block">{col.meta}</span>}
                           <span className={`font-mono font-bold ${col.color}`}>{col.type}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-3 flex justify-between items-center px-1">
                   <span>{table.rows.toLocaleString()} records</span>
                   <button className="hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}><Trash2 size={12}/></button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/5 bg-slate-900/80 backdrop-blur-xl">
             <button className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-all flex justify-center items-center gap-2 font-bold text-sm active:scale-95 group outline-none focus:ring-2 focus:ring-emerald-500/50">
               <Plus size={18} className="text-emerald-400 group-hover:rotate-90 transition-transform duration-300" /> 
               New Table
             </button>
          </div>
        </div>

        {/* Content Area - SQL Preview */}
        <div className="flex-1 p-8 flex flex-col relative z-10 bg-black/20">
          <div className="flex justify-between items-center mb-6 bg-slate-900/60 backdrop-blur-xl p-4 rounded-2xl border border-white/5 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 shadow-inner">
                <Code size={18} />
              </div>
              <div>
                <h3 className="text-white font-bold tracking-tight text-sm">Generated SQL Schema</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">PostgreSQL dialect optimized for ChatDMP</p>
              </div>
            </div>
            <div className="flex gap-2">
               <button className="px-4 py-2 bg-slate-950 border border-white/5 hover:bg-white/5 text-slate-300 rounded-lg flex items-center gap-2 transition-all font-bold text-xs shadow-inner focus:outline-none focus:ring-1 focus:ring-white/20 active:scale-95" onClick={() => navigator.clipboard.writeText(generateSQL())}>
                 <Copy size={14} className="text-slate-400" /> Copy to Clipboard
               </button>
            </div>
          </div>

          <div className="flex-1 relative group overflow-hidden bg-[#1e1e1e] rounded-2xl shadow-2xl border border-white/10 flex flex-col">
            <div className="h-10 bg-[#2d2d2d] border-b border-black/40 flex items-center px-4 gap-2 shrink-0">
               <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80 border border-black/20"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-black/20"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-black/20"></div>
               </div>
               <div className="mx-auto bg-black/20 px-4 py-1 rounded-md border border-white/5 text-[10px] font-medium text-slate-400 tracking-wider font-mono">ChatDMP_Schema.sql</div>
               <div className="w-10"></div> {/* Spacer for symmetry */}
            </div>
            
            <div className="flex-1 relative overflow-auto custom-scrollbar p-2">
               {/* Background subtle glow inside code block to make it look premium */}
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none mix-blend-screen opacity-50 block group-hover:opacity-100 transition-opacity duration-700"></div>
               
               <SyntaxHighlighter 
                 language="sql" 
                 style={atomDark}
                 showLineNumbers={true}
                 lineNumberStyle={{ minWidth: '3.5em', paddingRight: '1.5em', color: '#6e7681', textAlign: 'right' }}
                 customStyle={{
                   background: 'transparent',
                   padding: '1rem',
                   fontSize: '0.875rem',
                   lineHeight: '1.7',
                   margin: 0,
                   height: '100%',
                 }}
                 className="custom-scrollbar relative z-10"
               >
                 {generateSQL()}
               </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
