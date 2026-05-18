import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, Edit, Trash2, X, Save } from 'lucide-react';

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', role: 'User', plan: 'Pro', status: 'Active', joinDate: '20/04/2026' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@gmail.com', role: 'User', plan: 'Free', status: 'Active', joinDate: '19/04/2026' },
    { id: 3, name: 'Lê Văn C', email: 'levanc@gmail.com', role: 'User', plan: 'Ultra', status: 'Suspended', joinDate: '15/04/2026' },
    { id: 4, name: 'Phạm Thị D', email: 'phamthid@gmail.com', role: 'User', plan: 'Pro', status: 'Active', joinDate: '01/01/2026' },
  ]);

  const [editingUser, setEditingUser] = useState(null);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
    // Usually we would use toast here, but we didn't import it. We can just update state.
  };

  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Người dùng</h1>
          <p className="text-slate-400">Xem và quản lý tài khoản thành viên trong hệ thống</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm người dùng..." 
              className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => alert('Chức năng lọc đang được phát triển')}
            className="p-2 bg-slate-900 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th className="px-6 py-4">Thành viên</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Gói cước</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tham gia</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'Admin' ? 'bg-violet-500/10 text-violet-400' : 'bg-slate-800 text-slate-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">{user.plan}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 ${user.status === 'Active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                      {user.status === 'Active' ? 'Hoạt động' : 'Đình chỉ'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{user.joinDate}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setEditingUser({ ...user })} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setEditingUser(null)}></div>
          
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Edit className="text-violet-400" size={18} />
                Chỉnh sửa Người dùng
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
              setEditingUser(null);
            }} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tên hiển thị</label>
                <input 
                  type="text" 
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vai trò</label>
                  <select 
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm font-medium text-white appearance-none outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all cursor-pointer shadow-inner"
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gói cước</label>
                  <select 
                    value={editingUser.plan}
                    onChange={(e) => setEditingUser({...editingUser, plan: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm font-medium text-white appearance-none outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all cursor-pointer shadow-inner"
                  >
                    <option value="Free">Free</option>
                    <option value="Pro">Pro</option>
                    <option value="Ultra">Ultra</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setEditingUser(null)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  Huỷ
                </button>
                <button type="submit" className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-violet-500/20 active:scale-95">
                  <Save size={16} /> Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
