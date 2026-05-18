import React, { useState, useRef } from 'react';
import { User, Mail, Camera, Save, ArrowLeft, Lock, Eye, EyeOff, CreditCard, Check, Zap, Bot, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const plans = [
  { id: 'free', name: 'Miễn Phí', price: '0', icon: Bot, color: 'from-slate-700 to-slate-800' },
  { id: 'pro', name: 'Pro', price: '199.999', icon: Zap, color: 'from-violet-500 to-indigo-600', popular: true },
  { id: 'ultra', name: 'Ultra', price: '999.999', icon: Crown, color: 'from-amber-500 to-orange-600' },
];

export default function EditProfile() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'user';

  const [formData, setFormData] = useState({
    name: userRole === 'admin' ? 'Admin User' : 'Nguyễn Tuấn Đạt',
    email: userRole === 'admin' ? 'admin@example.com' : 'user@example.com'
  });

  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const initials = getInitials(formData.name);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const savedPlan = localStorage.getItem('userPlan') || (userRole === 'admin' ? 'pro' : 'free');
  const [currentPlan, setCurrentPlan] = useState(savedPlan);
  const [activeTab, setActiveTab] = useState('profile');
  
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      toast.success('Ảnh đại diện đã được hiển thị (Local Preview)!');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    localStorage.setItem('userName', formData.name);
    localStorage.setItem('userPlan', currentPlan);
    toast.success('Đã lưu thông tin hồ sơ!');
    navigate('/profile');
  };

  const handleChangePassword = () => {
    if (!passwords.currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }
    if (passwords.currentPassword !== '123456') {
      toast.error('Mật khẩu hiện tại không chính xác!');
      return;
    }
    if (!passwords.newPassword || passwords.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    toast.success('Đổi mật khẩu thành công!');
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleChangePlan = (planId) => {
    if (planId === currentPlan) return;
    setCurrentPlan(planId);
    const plan = plans.find(p => p.id === planId);
    toast.success(`Đã chuyển sang gói ${plan.name}!`);
  };

  const tabs = [
    { id: 'profile', label: 'Hồ sơ' },
    { id: 'password', label: 'Mật khẩu' },
    { id: 'plan', label: 'Gói dịch vụ' },
  ];

  return (
    <div className="h-full bg-slate-950 text-slate-300 font-sans flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <header className="h-16 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/profile')}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all"
            title="Quay lại"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-white tracking-tight">Chỉnh sửa hồ sơ</h1>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-2xl mx-auto w-full space-y-6 overflow-y-auto custom-scrollbar flex-1 z-10">
        
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900/60 backdrop-blur-md p-1 rounded-xl border border-slate-800/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === tab.id 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Tab: Profile ─── */}
        {activeTab === 'profile' && (
          <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-2xl border border-slate-800/50 shadow-xl">
            <div className="flex flex-col items-center mb-8">
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleFileChange} 
              />
              <div 
                className="w-24 h-24 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-indigo-500/30 relative group mb-4 cursor-pointer overflow-hidden"
                onClick={handleAvatarClick}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
                <button className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <Camera size={24} className="text-white" />
                </button>
              </div>
              <p 
                onClick={handleAvatarClick}
                className="text-xs font-bold text-violet-400 cursor-pointer hover:text-violet-300 transition-colors"
              >
                Thay đổi ảnh đại diện
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Tên hiển thị</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white font-medium focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white font-medium focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-4">
                <button 
                  onClick={handleSave}
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Lưu thay đổi
                </button>
                <button 
                  onClick={() => navigate('/profile')}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700 active:scale-[0.98]"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Password ─── */}
        {activeTab === 'password' && (
          <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-2xl border border-slate-800/50 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-violet-500/10 rounded-xl">
                <Lock size={20} className="text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Đổi mật khẩu</h2>
                <p className="text-xs text-slate-500">Cập nhật mật khẩu để bảo vệ tài khoản của bạn</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Mật khẩu hiện tại</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showPasswords.current ? "text" : "password"}
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-12 text-white font-medium focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all placeholder:text-slate-600"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Mật khẩu mới</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-12 text-white font-medium focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all placeholder:text-slate-600"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-12 text-white font-medium focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all placeholder:text-slate-600"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleChangePassword}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Lock size={18} /> Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Plan ─── */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/50 shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <CreditCard size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Gói dịch vụ</h2>
                  <p className="text-xs text-slate-500">Chọn gói phù hợp với nhu cầu của bạn</p>
                </div>
              </div>
            </div>

            {plans.map((plan) => {
              const isActive = currentPlan === plan.id;
              return (
                <div 
                  key={plan.id}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900/60 border-violet-500/50 ring-1 ring-violet-500/30 shadow-lg shadow-violet-900/10' 
                      : 'bg-slate-900/40 border-slate-800/50 hover:border-slate-700'
                  }`}
                  onClick={() => handleChangePlan(plan.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}>
                        <plan.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">{plan.name}</h3>
                          {plan.popular && (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-400 rounded-full border border-violet-500/30">Phổ biến</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mt-0.5">
                          <span className="font-bold text-white">đ{plan.price}</span> VND / tháng
                        </p>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isActive 
                        ? 'border-violet-500 bg-violet-500' 
                        : 'border-slate-600'
                    }`}>
                      {isActive && <Check size={14} className="text-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
