import React from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans flex flex-col">
      <header className="h-14 bg-[#141414] border-b border-[#262626] flex items-center px-4 gap-4 shrink-0">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-semibold text-white">Account Management</h1>
      </header>

      <div className="p-6 max-w-2xl mx-auto w-full space-y-8 overflow-y-auto custom-scrollbar flex-1">
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">Account Profile</h2>
        <div className="bg-[#141414] p-6 rounded-lg border border-[#262626] flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
            AD
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">Admin User</h3>
            <p className="text-gray-400 text-sm mb-3">admin@example.com</p>
            <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              Pro Plan
            </span>
          </div>
          <button className="px-4 py-2 bg-[#1a1a1a] border border-[#262626] hover:border-cyan-500 text-white rounded-md text-sm transition">
            Edit Profile
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Team Members</h3>
        <div className="bg-[#141414] border border-[#262626] rounded-lg overflow-hidden">
          <div className="p-4 border-b border-[#262626] flex justify-between items-center">
            <span className="text-sm text-gray-400">Manage your team access</span>
            <button className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              <Plus size={16} /> Invite Member
            </button>
          </div>
          <div className="divide-y divide-[#262626]">
            <div className="p-4 flex items-center justify-between hover:bg-[#1a1a1a] transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs text-white">AD</div>
                <div>
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs text-gray-500">admin@example.com</p>
                </div>
              </div>
              <span className="text-xs text-gray-400 bg-[#262626] px-2 py-1 rounded">Owner</span>
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-[#1a1a1a] transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-900 rounded-full flex items-center justify-center text-xs text-cyan-400">DV</div>
                <div>
                  <p className="text-sm font-medium text-white">Developer One</p>
                  <p className="text-xs text-gray-500">dev1@example.com</p>
                </div>
              </div>
              <select className="bg-transparent text-xs text-gray-400 border border-[#262626] rounded px-2 py-1 outline-none focus:border-cyan-500">
                <option>Editor</option>
                <option>Viewer</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
