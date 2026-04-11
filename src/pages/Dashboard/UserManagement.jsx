import React, { useState } from 'react';
import { Search, Edit, Trash2, Shield, ShieldOff, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_USERS = [
  { id: 1, name: 'Quản trị viên', email: 'admin@devai.com', role: 'admin', status: 'active', joined: '01/01/2026' },
  { id: 2, name: 'Người dùng Test', email: 'user@devai.com', role: 'user', status: 'active', joined: '15/02/2026' },
  { id: 3, name: 'Nguyễn Văn A', email: 'vana@example.com', role: 'user', status: 'inactive', joined: '10/03/2026' },
  { id: 4, name: 'Lê Thị B', email: 'lethib@example.com', role: 'user', status: 'active', joined: '12/03/2026' },
  { id: 5, name: 'Trần C', email: 'tranc@example.com', role: 'user', status: 'active', joined: '20/03/2026' }
];

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(MOCK_USERS);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý người dùng</h2>
          <p className="text-sm text-gray-400">Xem danh sách, phân quyền và quản lý tài khoản người dùng hệ thống.</p>
        </div>
        <button className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-violet-600/20">
          + Thêm User Mới
        </button>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm kiếm Email hoặc Tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:border-violet-500 transition-colors outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-gray-400 border-b border-white/5">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-lg">ID</th>
                <th className="px-4 py-3 font-medium">Người dùng</th>
                <th className="px-4 py-3 font-medium">Vai trò (Role)</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Ngày tham gia</th>
                <th className="px-4 py-3 font-medium rounded-tr-lg">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredUsers.map((user) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={user.id} 
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-4">{user.id}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/20' : 'bg-slate-800 text-gray-400 border border-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${
                      user.status === 'active' ? 'text-emerald-400' : 'text-gray-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                      {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-500">{user.joined}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-white transition-colors" title="Sửa">
                        <Edit className="w-4 h-4" />
                      </button>
                      {user.role !== 'admin' && (
                        <button className="p-1.5 text-red-400 hover:text-red-300 transition-colors" title="Khóa">
                          <ShieldOff className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Không tìm thấy người dùng nào!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination mock */}
        <div className="flex justify-between items-center mt-6 text-sm text-gray-400">
          <span>Hiển thị 1 - {filteredUsers.length} trong {users.length}</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50">Trước</button>
            <button className="px-3 py-1 bg-violet-600 text-white rounded hover:bg-violet-500">1</button>
            <button className="px-3 py-1 bg-white/5 rounded hover:bg-white/10">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
