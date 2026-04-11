import React from 'react';
import { Plus, Play, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AiDatabase() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-[#0a0a0a] text-gray-300 font-sans flex flex-col overflow-hidden">
      <header className="h-14 bg-[#141414] border-b border-[#262626] flex items-center px-4 gap-4 shrink-0">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-semibold text-white">Database Designer</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
      <div className="w-1/3 border-r border-[#262626] p-4 flex flex-col">
        <h3 className="text-white font-semibold mb-4">Tables</h3>
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
          <div className="p-3 bg-[#141414] border border-[#262626] rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-cyan-400 font-bold">users</span>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex justify-between"><span>id</span><span className="text-amber-500">PK, UUID</span></div>
              <div className="flex justify-between"><span>email</span><span className="text-blue-400">VARCHAR</span></div>
              <div className="flex justify-between"><span>password</span><span className="text-blue-400">VARCHAR</span></div>
            </div>
          </div>
          <div className="p-3 bg-[#141414] border border-[#262626] rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-cyan-400 font-bold">posts</span>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex justify-between"><span>id</span><span className="text-amber-500">PK, UUID</span></div>
              <div className="flex justify-between"><span>user_id</span><span className="text-emerald-500">FK</span></div>
              <div className="flex justify-between"><span>content</span><span className="text-blue-400">TEXT</span></div>
            </div>
          </div>
        </div>
        <button className="mt-4 bg-[#141414] border border-[#262626] hover:border-cyan-500 text-cyan-400 py-2 rounded-md transition flex justify-center items-center gap-2">
          <Plus size={16} /> Add Table
        </button>
      </div>
      <div className="flex-1 bg-[#0a0a0a] p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold">Generated SQL</h3>
          <button className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded flex items-center gap-2 transition">
            <Play size={14} /> Execute
          </button>
        </div>
        <pre className="flex-1 bg-[#141414] border border-[#262626] rounded-lg p-4 text-sm text-cyan-300 font-mono overflow-auto custom-scrollbar">
{`CREATE TABLE users (
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
        </pre>
      </div>
      </div>
    </div>
  );
}
