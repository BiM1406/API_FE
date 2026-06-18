import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Camera, Save, ArrowLeft, Lock, Eye, EyeOff, CreditCard, Check, Zap, Bot, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCurrentUser, getUsers, saveUsers, saveAuth } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProfile, getSubscription, updateProfile, changePassword } from '../../services/profileService';

export default function EditProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = getCurrentUser();

  const [formData, setFormData] = useState({
    name: user?.name || 'User',
    email: user?.email || 'user@example.com'
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

  const savedPlan = user?.plan?.toLowerCase() || 'free';
  const [currentPlan, setCurrentPlan] = useState(savedPlan);
  const [activeTab, setActiveTab] = useState('profile');

  const isNewSameAsCurrent = passwords.newPassword && passwords.newPassword === passwords.currentPassword;

  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    let mounted = true;
    Promise.all([getProfile(), getSubscription()]).then(([profile, subscription]) => {
      if (!mounted) return;
      setFormData({
        name: profile?.name || profile?.username || '',
        email: profile?.email || ''
      });
      if (profile?.avatar) {
        setAvatarPreview(profile.avatar);
      }
      setCurrentPlan(String(subscription?.plan || profile?.plan || 'free').toLowerCase());
    });

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error(t('edit_profile.toast_fill_fields'));
      return;
    }
    await updateProfile({
      ...formData,
      avatar: avatarPreview
    });

    const currentUser = getCurrentUser();
    if (currentUser) {
      currentUser.plan = currentPlan;
      currentUser.avatar = avatarPreview;
      const users = getUsers().map((u) => u.id === currentUser.id ? { ...u, plan: currentPlan, avatar: avatarPreview } : u);
      saveUsers(users);
      saveAuth(currentUser, localStorage.getItem('token') || 'mock-token');
    }
    navigate('/profile');
  };

  const handleChangePassword = async () => {
    if (!passwords.currentPassword) {
      toast.error(t('edit_profile.toast_current_pwd_required'));
      return;
    }
    if (!passwords.newPassword || passwords.newPassword.length < 6) {
      toast.error(t('edit_profile.toast_new_pwd_min'));
      return;
    }
    if (passwords.newPassword === passwords.currentPassword) {
      toast.error(t('edit_profile.toast_new_pwd_same_as_old'));
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error(t('edit_profile.toast_confirm_pwd_mismatch'));
      return;
    }

    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const isNetworkError = err.message?.includes('fetch') || err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch');
      if (!isNetworkError) {
        if (err.message === 'Mật khẩu hiện tại không chính xác' || err.message?.includes('incorrect')) {
          toast.error(t('edit_profile.toast_current_pwd_incorrect'));
        } else {
          toast.error(err.message || 'Error');
        }
      }
    }
  };


  const tabs = [
    { id: 'profile', label: t('edit_profile.tab_profile') },
    { id: 'password', label: t('edit_profile.tab_password') },
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
            title={t('edit_profile.back_tooltip')}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-white tracking-tight">{t('edit_profile.title')}</h1>
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
                <button className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center pointer-events-none">
                  <Camera size={24} className="text-white" />
                </button>
              </div>
              <p
                onClick={handleAvatarClick}
                className="text-xs font-bold text-violet-400 cursor-pointer hover:text-violet-300 transition-colors"
              >
                {t('edit_profile.change_avatar')}
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">{t('edit_profile.display_name')}</label>
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">{t('edit_profile.email')}</label>
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
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-600/20 active:scale-[0.98] flex items-center justify-center"
                >
                  {t('edit_profile.btn_save')}
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700 active:scale-[0.98]"
                >
                  {t('edit_profile.btn_cancel')}
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
                <h2 className="text-lg font-bold text-white">{t('edit_profile.change_pwd_title')}</h2>
                <p className="text-xs text-slate-500">{t('edit_profile.change_pwd_desc')}</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">{t('edit_profile.current_pwd')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder={t('edit_profile.current_pwd_placeholder')}
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">{t('edit_profile.new_pwd')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    placeholder={t('edit_profile.new_pwd_placeholder')}
                    className={`w-full bg-slate-950/50 border rounded-xl py-3 pl-12 pr-12 text-white font-medium outline-none transition-all placeholder:text-slate-600 ${
                      isNewSameAsCurrent
                        ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
                        : 'border-slate-800 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {isNewSameAsCurrent && (
                  <p className="text-red-500 text-[11px] font-semibold mt-2 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    {t('edit_profile.pwd_same_as_old_error')}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">{t('edit_profile.confirm_pwd')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder={t('edit_profile.confirm_pwd_placeholder')}
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
                  <Lock size={18} /> {t('edit_profile.btn_change_pwd')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
