import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Bell, Shield, Key, Moon, Sun, Monitor, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Settings() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
    marketing: false
  });

  const handleSave = () => {
    toast.success('Đã lưu cấu hình cài đặt!');
  };

  return (
    <div className="w-full min-h-full p-6 lg:p-10 relative">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} /> Quay lại
            </button>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              Cài đặt Hệ thống
            </h1>
            <p className="text-slate-400 text-base font-medium">
              Tùy chỉnh giao diện, bảo mật và thông báo của bạn.
            </p>
          </div>
          
          <button 
            onClick={handleSave}
            className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            <Save size={20} strokeWidth={3} />
            Lưu thay đổi
          </button>
        </header>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="col-span-1 space-y-2">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors">
              <Monitor size={20} className="text-indigo-400" />
              <span className="font-bold text-white">Giao diện</span>
            </div>
            <div className="p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors">
              <Bell size={20} className="text-slate-400" />
              <span className="font-bold text-slate-400">Thông báo</span>
            </div>
            <div className="p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors">
              <Shield size={20} className="text-slate-400" />
              <span className="font-bold text-slate-400">Quyền riêng tư</span>
            </div>
            <div className="p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors">
              <Key size={20} className="text-slate-400" />
              <span className="font-bold text-slate-400">Khóa API</span>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Giao diện</h3>
                <p className="text-sm text-slate-400">Tùy chỉnh màu sắc hệ thống.</p>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setTheme('dark')}
                  className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${theme === 'dark' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:bg-white/5'}`}
                >
                  <Moon size={24} className={theme === 'dark' ? 'text-indigo-400' : 'text-slate-400'} />
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`}>Chế độ tối</span>
                </button>
                <button 
                  onClick={() => setTheme('light')}
                  className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${theme === 'light' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 hover:bg-white/5'}`}
                >
                  <Sun size={24} className={theme === 'light' ? 'text-amber-400' : 'text-slate-400'} />
                  <span className={`font-bold ${theme === 'light' ? 'text-white' : 'text-slate-400'}`}>Chế độ sáng</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Xác thực 2 yếu tố (2FA)</h3>
                <p className="text-sm text-slate-400">Tăng cường bảo mật cho tài khoản của bạn.</p>
              </div>
              
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4">
                <Lock className="text-amber-400 shrink-0" />
                <div>
                  <p className="text-sm text-amber-100 font-medium">Tài khoản chưa bật 2FA</p>
                  <p className="text-xs text-amber-200/60 mt-1">Nên bật tính năng này để bảo vệ mã nguồn dự án của bạn.</p>
                  <button className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors">
                    Thiết lập ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
