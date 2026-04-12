import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Users, Wrench, History, 
  TrendingUp, TrendingDown, Search, Eye, EyeOff, 
  Save, Key, Shield, Activity, Database, RefreshCw,
  MoreVertical, Check, X, UserX, UserCheck
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// --- MOCK DATA ---
const MOCK_USERS = [
  { id: 1, name: 'Alex Johnson', email: 'alex@example.com', avatar: 'https://i.pravatar.cc/150?u=1', plan: 'Enterprise', projects: 12, tokens: '2.4M', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Sarah Williams', email: 'sarah@example.com', avatar: 'https://i.pravatar.cc/150?u=2', plan: 'Pro', projects: 5, tokens: '850K', role: 'User', status: 'Active' },
  { id: 3, name: 'Michael Chen', email: 'michael@example.com', avatar: 'https://i.pravatar.cc/150?u=3', plan: 'Free', projects: 1, tokens: '12K', role: 'User', status: 'Banned' },
  { id: 4, name: 'Emily Davis', email: 'emily@example.com', avatar: 'https://i.pravatar.cc/150?u=4', plan: 'Pro', projects: 8, tokens: '1.2M', role: 'User', status: 'Active' },
  { id: 5, name: 'James Wilson', email: 'james@example.com', avatar: 'https://i.pravatar.cc/150?u=5', plan: 'Enterprise', projects: 24, tokens: '5.1M', role: 'Admin', status: 'Active' },
  { id: 6, name: 'Lisa Taylor', email: 'lisa@example.com', avatar: 'https://i.pravatar.cc/150?u=6', plan: 'Free', projects: 2, tokens: '45K', role: 'User', status: 'Active' },
  { id: 7, name: 'David Brown', email: 'david@example.com', avatar: 'https://i.pravatar.cc/150?u=7', plan: 'Pro', projects: 4, tokens: '420K', role: 'User', status: 'Active' },
  { id: 8, name: 'Emma Miller', email: 'emma@example.com', avatar: 'https://i.pravatar.cc/150?u=8', plan: 'Free', projects: 1, tokens: '8K', role: 'User', status: 'Banned' },
];

const MOCK_LOGS = [
  { id: 101, user: 'Alex Johnson', action: 'Change API key', target: 'System Settings', timestamp: '10 mins ago' },
  { id: 102, user: 'System', action: 'Ban user', target: 'Michael Chen', timestamp: '1 hour ago' },
  { id: 103, user: 'Sarah Williams', action: 'Upgrade plan', target: 'Pro Plan', timestamp: '3 hours ago' },
  { id: 104, user: 'James Wilson', action: 'Update Rate Limits', target: 'Enterprise Tier', timestamp: '1 day ago' },
  { id: 105, user: 'System', action: 'Ban user', target: 'Emma Miller', timestamp: '2 days ago' },
];

const generateLineData = () => {
  const data = [];
  let base = 5000;
  for (let i = 30; i >= 1; i--) {
    base = base + (Math.random() * 2000 - 800);
    data.push({
      day: `Day ${31 - i}`,
      calls: Math.floor(Math.max(1000, base))
    });
  }
  return data;
};
const MOCK_LINE_DATA = generateLineData();

const MOCK_PIE_DATA = [
  { name: 'Spring Boot', value: 45 },
  { name: 'Express.js', value: 35 },
  { name: 'NestJS', value: 20 },
];
const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6'];

// --- COMPONENTS ---

const Sidebar = ({ activeSection, setActiveSection }) => {
  const navItems = [
    { id: 'analytics', icon: LayoutDashboard, label: 'Analytics' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'settings', icon: Wrench, label: 'Settings' },
    { id: 'logs', icon: History, label: 'Logs' },
  ];

  return (
    <aside className="w-16 bg-[#141414] border-r border-white/5 flex flex-col items-center py-6 gap-8 z-10">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
        <Activity className="text-white w-6 h-6" />
      </div>
      <nav className="flex flex-col gap-4 w-full px-3">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`relative group flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-500/10 text-blue-400' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              {/* Tooltip */}
              <div className="absolute left-14 px-2 py-1 bg-gray-800 text-gray-200 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10">
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

const MetricCard = ({ title, value, growth, icon: Icon, isPositive }) => (
  <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30 hover:border-white/10 flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div className="p-3 bg-white/5 rounded-xl text-gray-400">
        <Icon className="w-6 h-6" />
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {growth}%
      </div>
    </div>
    <div>
      <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-100">{value}</h3>
    </div>
  </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
      checked ? 'bg-blue-500' : 'bg-gray-700'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const AnalyticsSection = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Users" value="12,450" growth="12.5" icon={Users} isPositive={true} />
        <MetricCard title="Active Projects" value="3,210" growth="8.2" icon={Database} isPositive={true} />
        <MetricCard title="AI Tokens Used" value="1.2B" growth="24.5" icon={Activity} isPositive={true} />
        <MetricCard title="API Calls" value="84.5M" growth="4.1" icon={RefreshCw} isPositive={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#141414] border border-white/5 rounded-2xl p-6 shadow-lg shadow-black/20">
          <h3 className="text-lg font-semibold text-gray-200 mb-6">API Calls (30 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_LINE_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="day" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', borderRadius: '8px', color: '#eee' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Line type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#0a0a0a', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 shadow-lg shadow-black/20 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-200 mb-6">Tech Stack Distribution</h3>
          <div className="flex-1 min-h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_PIE_DATA}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {MOCK_PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', borderRadius: '8px', color: '#eee' }}
                  itemStyle={{ color: '#eee' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', color: '#aaa' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserManagementSection = ({ users, setUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = filterRole === 'All' || user.role === filterRole;
      const matchStatus = filterStatus === 'All' || user.status === filterStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  const toggleUserStatus = (id) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'Active' ? 'Banned' : 'Active' };
      }
      return u;
    }));
  };

  const changeUserRole = (id, newRole) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141414] p-4 rounded-2xl border border-white/5 shadow-lg shadow-black/20">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-[#0a0a0a] border border-white/10 rounded-xl py-2 px-4 text-gray-300 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#0a0a0a] border border-white/10 rounded-xl py-2 px-4 text-gray-300 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Banned">Banned</option>
          </select>
        </div>
      </div>

      <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-lg shadow-black/20 flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-gray-400 text-sm">
                <th className="py-4 px-6 font-medium">User</th>
                <th className="py-4 px-6 font-medium">Plan</th>
                <th className="py-4 px-6 font-medium">Usage</th>
                <th className="py-4 px-6 font-medium">Role</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-gray-800" />
                        <div>
                          <div className="font-medium text-gray-200">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-300">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                        user.plan === 'Enterprise' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        user.plan === 'Pro' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-300">{user.tokens} tokens</div>
                      <div className="text-xs text-gray-500">{user.projects} projects</div>
                    </td>
                    <td className="py-4 px-6">
                      <select 
                        value={user.role}
                        onChange={(e) => changeUserRole(user.id, e.target.value)}
                        className="bg-transparent border border-white/10 rounded-lg py-1 px-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="Admin" className="bg-[#1f1f1f]">Admin</option>
                        <option value="User" className="bg-[#1f1f1f]">User</option>
                      </select>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                        user.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {user.status === 'Active' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => toggleUserStatus(user.id)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors tooltip-trigger"
                          title={user.status === 'Active' ? 'Ban User' : 'Activate User'}
                        >
                          {user.status === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button 
                          className="px-3 py-1.5 text-xs font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                        >
                          Reset Pass
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 opacity-50" />
                      <p>No users found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SystemSettingsSection = () => {
  const [apiKey, setApiKey] = useState('sk_live_51MabcD8xyz...');
  const [showApiKey, setShowApiKey] = useState(false);
  const [toast, setToast] = useState(null);
  const [rateLimits, setRateLimits] = useState({
    Free: '100000',
    Pro: '2000000',
    Enterprise: 'Unlimited'
  });

  const handleSaveKey = () => {
    console.log('Saving API Key:', apiKey);
    setToast('API Key saved successfully!');
    setTimeout(() => setToast(null), 3000);
  };

  const handleRateLimitChange = (plan, value) => {
    setRateLimits(prev => ({ ...prev, [plan]: value }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top-5 z-50">
          <Check className="w-5 h-5" />
          <p className="font-medium">{toast}</p>
        </div>
      )}

      <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-200">API Key Configuration</h3>
            <p className="text-sm text-gray-500">Manage your primary service API key</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-400">Secret Key</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input 
                type={showApiKey ? "text" : "password"} 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-4 pr-12 text-gray-300 focus:outline-none focus:border-blue-500 transition-colors font-mono"
              />
              <button 
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button 
              onClick={handleSaveKey}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Key
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-200">Rate Limits</h3>
            <p className="text-sm text-gray-500">Configure maximum tokens per month by plan</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-gray-400 text-sm border-b border-white/5">
                <th className="py-3 px-4 font-medium">Plan Tier</th>
                <th className="py-3 px-4 font-medium">Max Tokens / Month</th>
              </tr>
            </thead>
            <tbody>
              {['Free', 'Pro', 'Enterprise'].map((plan) => (
                <tr key={plan} className="border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-300">{plan}</td>
                  <td className="py-3 px-4">
                    <input 
                      type="text" 
                      value={rateLimits[plan]}
                      onChange={(e) => handleRateLimitChange(plan, e.target.value)}
                      className="bg-[#0a0a0a] border border-white/10 rounded-lg py-1.5 px-3 text-gray-300 focus:outline-none focus:border-purple-500 transition-colors w-full max-w-[200px]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AuditLogsSection = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-200">System Audit Logs</h2>
        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-lg shadow-black/20 flex-1">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-gray-400 text-sm">
                <th className="py-4 px-6 font-medium">User / System</th>
                <th className="py-4 px-6 font-medium">Action</th>
                <th className="py-4 px-6 font-medium">Target</th>
                <th className="py-4 px-6 font-medium text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LOGS.map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <span className={`font-medium ${log.user === 'System' ? 'text-purple-400' : 'text-gray-300'}`}>
                      {log.user}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-300">
                    <span className="bg-white/5 px-2 py-1 rounded text-sm border border-white/5">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-400">{log.target}</td>
                  <td className="py-4 px-6 text-right text-sm text-gray-500">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('analytics');
  const [usersData, setUsersData] = useState(MOCK_USERS);

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-gray-300 font-sans overflow-hidden">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto h-full">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-white capitalize">
              {activeSection === 'analytics' ? 'Dashboard Overview' : 
               activeSection === 'users' ? 'User Management' : 
               activeSection === 'settings' ? 'System Settings' : 'Audit Logs'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage your application and view system metrics.</p>
          </header>

          <div className="h-[calc(100%-5rem)]">
            {activeSection === 'analytics' && <AnalyticsSection />}
            {activeSection === 'users' && <UserManagementSection users={usersData} setUsers={setUsersData} />}
            {activeSection === 'settings' && <SystemSettingsSection />}
            {activeSection === 'logs' && <AuditLogsSection />}
          </div>
        </div>
      </main>
    </div>
  );
}
