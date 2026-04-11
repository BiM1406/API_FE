import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext.jsx';
import {
  User, Shield, CreditCard, Bell, Camera,
  Save, Key, Smartphone, ExternalLink, Zap
} from 'lucide-react';

const SETTING_TABS = [
  { id: 'profile', label: 'Hồ sơ', icon: User },
  { id: 'security', label: 'Bảo mật', icon: Shield },
  { id: 'billing', label: 'Gói dịch vụ', icon: CreditCard },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
];

export default function SettingsView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const tabs = user?.role === 'admin'
    ? SETTING_TABS.filter(t => t.id !== 'billing')
    : SETTING_TABS;

  const [name, setName] = useState('Admin');
  const [username, setUsername] = useState('@admin_devai');

  const handleSaveChanges = () => {
    toast.success('Đã lưu thông tin tài khoản!');
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Kích thước tệp quá lớn! Vui lòng tải ảnh lên dưới 2MB.");
        return;
      }
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Quản lý tài khoản
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Quản lý thông tin cá nhân, bảo mật và gói dịch vụ của bạn.
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Nav for Settings */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${isActive
                    ? 'text-white bg-slate-900 border border-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
              >
                <tab.icon className={`w-5 h-5 ${isActive ? 'text-violet-400' : 'text-gray-500'}`} />
                <span className="font-medium text-sm">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="settings-active-tab"
                    className="absolute inset-0 rounded-xl border border-violet-500/50 pointer-events-none"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-slate-900 border border-white/5 rounded-2xl p-6 md:p-8 min-h-[500px]">
          <AnimatePresence mode="wait">

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-6">Thông tin cá nhân</h3>

                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/png, image/jpeg, image/gif"
                      onChange={handleFileChange}
                    />
                    <div className="relative group cursor-pointer" onClick={handleFileClick}>
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 p-1">
                        <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center overflow-hidden">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl font-bold text-violet-400">AD</span>
                          )}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex gap-3">
                        <button
                          onClick={handleFileClick}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Thay đổi ảnh
                        </button>
                        <button
                          onClick={handleRemoveAvatar}
                          className="px-4 py-2 bg-transparent text-gray-400 hover:text-white text-sm font-medium rounded-lg transition-colors border border-transparent hover:border-white/10"
                        >
                          Xóa
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Định dạng hỗ trợ: JPG, PNG hoặc GIF. Tối đa 2MB.</p>
                    </div>
                  </div>
                </div>

                <hr className="border-white/5" />

                {/* Form Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Họ và tên</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Tên người dùng (Username)</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-400">Địa chỉ Email</label>
                    <input
                      type="email"
                      defaultValue="admin@devai.com"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-gray-400 focus:outline-none cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email được sử dụng để đăng nhập và không thể thay đổi.</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveChanges}
                    className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-violet-600/20 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    Lưu thay đổi
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Đổi mật khẩu</h3>
                  <p className="text-sm text-gray-400 mb-6">Đảm bảo tài khoản của bạn đang sử dụng mật khẩu dài, ngẫu nhiên để an toàn.</p>

                  <div className="max-w-md space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Mật khẩu mới</label>
                      <input
                        type="password"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                      />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all text-sm mt-4">
                      <Key className="w-4 h-4" />
                      Cập nhật mật khẩu
                    </button>
                  </div>
                </div>

                <hr className="border-white/5" />

                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Xác thực 2 yếu tố (2FA)</h3>
                  <p className="text-sm text-gray-400 mb-6">Tăng cường an ninh cho tài khoản bằng cách yêu cầu mã phụ ngoài mật khẩu.</p>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-950/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Ứng dụng xác thực (Authenticator App)</p>
                        <p className="text-xs text-gray-400 mt-0.5">Chưa được cấu hình</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors">
                      Thiết lập
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="relative overflow-hidden rounded-2xl p-6 border border-violet-500/30 bg-gradient-to-br from-violet-900/20 to-slate-900">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/20 blur-3xl rounded-full"></div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">Gói Pro (Tháng)</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">Bạn đang sử dụng toàn bộ tính năng cao cấp của DevAI.</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-3xl font-black text-white">đ199.999<span className="text-base text-gray-500 font-medium"> / tháng</span></p>
                      <p className="text-xs text-gray-400 mt-1">Bao gồm VAT • Gia hạn vào 12/05/2026</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8 relative z-10 w-full sm:w-auto">
                    <button
                      onClick={() => navigate('/pricing')}
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-violet-600/20 text-sm"
                    >
                      Đổi gói
                    </button>
                    <button className="flex-1 sm:flex-none px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/5 text-sm">
                      Hủy gói
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Lịch sử giao dịch</h3>
                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/50">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-white/5 text-gray-400">
                        <tr>
                          <th className="px-4 py-3 font-medium">Giao dịch</th>
                          <th className="px-4 py-3 font-medium">Ngày</th>
                          <th className="px-4 py-3 font-medium">Số tiền</th>
                          <th className="px-4 py-3 font-medium">Trạng thái</th>
                          <th className="px-4 py-3 font-medium">Hóa đơn</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-gray-300">
                        <tr>
                          <td className="px-4 py-3">DevAI Pro - 1 Tháng</td>
                          <td className="px-4 py-3 text-gray-500">12/04/2026</td>
                          <td className="px-4 py-3 font-medium text-white">199.999 đ</td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Thành công
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                              PDF <ExternalLink className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8 flex items-center justify-center p-8 min-h-[300px]"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Tùy chỉnh thông báo</h3>
                  <p className="text-sm text-gray-400 max-w-sm">
                    Tính năng quản lý thông báo đang được nâng cấp để hỗ trợ Telegram, Slack và Email tùy biến. Nhận thông báo lỗi API, deploy thành công và hơn thế nữa.
                  </p>
                  <button className="mt-6 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors border border-white/10 text-sm">
                    Sắp ra mắt
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
