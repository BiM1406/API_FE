import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Globe, Bell, Lock, Key, Copy, Trash2, Edit2, Zap, RefreshCw, XCircle, X, CreditCard, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import { getSubscription, updateSubscription, PLANS } from '../../services/profileService';
import { getPaymentHistory } from '../Payment/paymentService';
import { getCurrentUser } from '../../services/authService';

const normalizePlan = (plan) => {
  const value = String(plan || 'FREE').toUpperCase();
  return ['FREE', 'PRO', 'ULTRA'].includes(value) ? value : 'FREE';
};

const AI_PLAN_CONFIG = {
  FREE: {
    label: 'FREE',
    model: 'gemini-2.5-flash',
    limitText: '5 req/phút',
    description: 'model cơ bản, giới hạn thấp'
  },
  PRO: {
    label: 'PRO',
    model: 'gemini-2.5-flash',
    limitText: '15 req/phút',
    description: 'giới hạn cao hơn'
  },
  ULTRA: {
    label: 'ULTRA',
    model: 'gemini-2.5-flash',
    limitText: '30 req/phút',
    description: 'giới hạn cao nhất'
  }
};

export default function Settings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  
  const [activeSection, setActiveSection] = useState('language');
  const [lang, setLang] = useState(() => localStorage.getItem('api_fe_language') || (i18n && i18n.language) || 'vi');

  const [notifs, setNotifs] = useState(() => {
    try {
      const saved = localStorage.getItem('api_fe_settings_notifs');
      return saved ? JSON.parse(saved) : { email: true, push: false, alerts: true };
    } catch {
      return { email: true, push: false, alerts: true };
    }
  });

  const [privacy, setPrivacy] = useState(() => {
    try {
      const saved = localStorage.getItem('api_fe_settings_privacy');
      return saved ? JSON.parse(saved) : { publicProfile: false, activityLog: true, shareStats: false };
    } catch {
      return { publicProfile: false, activityLog: true, shareStats: false };
    }
  });

  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('api_fe_settings_apikeys');
      return saved ? JSON.parse(saved) : [
        { id: 'key_1', name: 'Development Key', value: 'sk_live_51N_dev_key_8x9a7b2c', createdAt: Date.now() - 86400000 * 10 }
      ];
    } catch {
      return [
        { id: 'key_1', name: 'Development Key', value: 'sk_live_51N_dev_key_8x9a7b2c', createdAt: Date.now() - 86400000 * 10 }
      ];
    }
  });

  const [subscription, setSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [remoteError, setRemoteError] = useState('');
  const [remoteLoading, setRemoteLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadRemoteState = async () => {
      setRemoteLoading(true);
      setRemoteError('');

      const user = getCurrentUser();
      const [subscriptionResult, historyResult] = await Promise.allSettled([
        getSubscription(),
        getPaymentHistory()
      ]);

      if (cancelled) return;

      if (subscriptionResult.status === 'fulfilled') {
        setSubscription(subscriptionResult.value || null);
      } else {
        setSubscription(null);
      }

      const history = historyResult.status === 'fulfilled' && Array.isArray(historyResult.value)
        ? historyResult.value
        : [];

      const myHistory = user
        ? history.filter(item => item?.userId === user.id || item?.userId === null || !item?.userId)
        : history;

      setPaymentHistory(myHistory);

      if (subscriptionResult.status === 'rejected' || historyResult.status === 'rejected') {
        setRemoteError('Không thể tải cài đặt. Vui lòng thử lại sau.');
      }

      setRemoteLoading(false);
    };

    loadRemoteState();

    return () => {
      cancelled = true;
    };
  }, [activeSection]);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirmKey, setDeleteConfirmKey] = useState(null);
  const [cancelConfirmSub, setCancelConfirmSub] = useState(false);
  const [renewConfirmSub, setRenewConfirmSub] = useState(false);

  const formatDateModal = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    if (lang === 'vi') {
      const day = dateObj.getDate();
      const month = dateObj.getMonth() + 1;
      const year = dateObj.getFullYear();
      return `${day} thg ${month}, ${year}`;
    } else {
      return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(dateObj);
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const currentPlan = normalizePlan(
    currentUser?.plan ||
    currentUser?.planCode ||
    currentUser?.subscription?.plan?.code ||
    currentUser?.currentPlan ||
    subscription?.planId ||
    subscription?.planCode
  );
  const aiPlan = AI_PLAN_CONFIG[currentPlan] || AI_PLAN_CONFIG.FREE;

  const handleLangChange = (newLang) => {
    setLang(newLang);
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(newLang);
    }
    localStorage.setItem('api_fe_language', newLang);
    // toast.success(t('settings.language_section.saved'));
  };

  const handleToggleNotif = (key) => {
    const updated = { ...notifs, [key]: !notifs[key] };
    setNotifs(updated);
    localStorage.setItem('api_fe_settings_notifs', JSON.stringify(updated));
    // toast.success(t('settings.notifications_section.saved'));
  };

  const handleTogglePrivacy = (key) => {
    const updated = { ...privacy, [key]: !privacy[key] };
    setPrivacy(updated);
    localStorage.setItem('api_fe_settings_privacy', JSON.stringify(updated));
    // toast.success(t('settings.privacy_section.saved'));
  };

  const handleGenerateKey = () => {
    const baseName = t('settings.api_keys_section.new_key_base') || 'New Key';
    let defaultName = baseName;
    
    const existsBase = apiKeys.some(k => k.name === baseName);
    if (existsBase) {
      let i = 1;
      while (true) {
        const candidate = `${baseName} ${i}`;
        if (!apiKeys.some(k => k.name === candidate)) {
          defaultName = candidate;
          break;
        }
        i++;
      }
    }

    const newKey = {
      id: 'key_' + Math.random().toString(36).substr(2, 9),
      name: defaultName,
      value: 'sk_live_' + Math.random().toString(36).substr(2, 12) + Math.random().toString(36).substr(2, 12),
      createdAt: Date.now()
    };
    const updatedKeys = [...apiKeys, newKey];
    setApiKeys(updatedKeys);
    localStorage.setItem('api_fe_settings_apikeys', JSON.stringify(updatedKeys));
    // toast.success(t('settings.api_keys_section.created'));
    
    // Automatically focus and edit the newly created key inline
    setEditingId(newKey.id);
    setEditName(newKey.name);
  };

  const handleSaveEdit = (id) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    const updatedKeys = apiKeys.map(k => k.id === id ? { ...k, name: trimmed } : k);
    setApiKeys(updatedKeys);
    localStorage.setItem('api_fe_settings_apikeys', JSON.stringify(updatedKeys));
    setEditingId(null);
    // toast.success(t('settings.api_keys_section.saved_name'));
  };

  const handleDeleteKey = (id) => {
    const updatedKeys = apiKeys.filter(k => k.id !== id);
    setApiKeys(updatedKeys);
    localStorage.setItem('api_fe_settings_apikeys', JSON.stringify(updatedKeys));
    // toast.success(t('settings.api_keys_section.deleted'));
  };

  const sections = [
    { id: 'language', label: t('settings.menu.language'), desc: t('settings.menu.language_desc'), icon: Globe },
    { id: 'notifications', label: t('settings.menu.notifications'), desc: t('settings.menu.notifications_desc'), icon: Bell },
    { id: 'privacy', label: t('settings.menu.privacy'), desc: t('settings.menu.privacy_desc'), icon: Lock },
    { id: 'api_keys', label: t('settings.menu.api_keys'), desc: t('settings.menu.api_keys_desc'), icon: Key },
    { id: 'subscription', label: t('settings.menu.subscription'), desc: t('settings.menu.subscription_desc'), icon: Zap }
  ];

  return (
    <div className="min-h-full w-full bg-transparent p-4 sm:p-8 font-sans text-slate-300 relative">
      <div className="mx-auto max-w-5xl space-y-6 relative z-10 animate-in fade-in duration-200">
        
        {/* Header */}
        <header className="flex items-center gap-4 pb-6 border-b border-white/[0.05]">
          <button 
            onClick={() => navigate(-1)} 
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            title={t('settings.back') || 'Quay lại'}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{t('settings.title') || 'Cài đặt'}</h1>
            <p className="text-sm text-slate-400">{t('settings.description') || 'Quản lý tùy chọn ngôn ngữ, cấu hình bảo mật và khóa kết nối hệ thống'}</p>
          </div>
        </header>

        {/* Content Layout */}
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          
          {/* Left Column: Menu Items */}
          <div className="w-full md:w-80 shrink-0 space-y-2">
            {sections.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left border transition-all ${
                    isActive 
                      ? 'bg-indigo-500/10 border-indigo-500/20 text-white shadow-lg'
                      : 'bg-slate-900/40 border-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{section.label}</p>
                    <p className="text-[11px] opacity-70 truncate mt-0.5">{section.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Configuration Panel */}
          <div className="flex-1 w-full bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            {activeSection === 'language' && (
              <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="space-y-6 relative z-10 flex-1 flex flex-col justify-between h-full">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{t('settings.language_section.title')}</h3>
                    <p className="text-sm text-slate-400">{t('settings.language_section.desc')}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className={`flex-1 relative p-4 rounded-xl border cursor-pointer transition-all ${lang === 'vi' ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-slate-950/50 border-white/10 hover:border-white/20'}`}>
                      <input type="radio" name="lang" value="vi" checked={lang === 'vi'} onChange={() => handleLangChange('vi')} className="hidden" />
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${lang === 'vi' ? 'text-indigo-400' : 'text-slate-300'}`}>{t('settings.language_section.vi')}</span>
                        {lang === 'vi' && <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />}
                      </div>
                    </label>
                    <label className={`flex-1 relative p-4 rounded-xl border cursor-pointer transition-all ${lang === 'en' ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-slate-950/50 border-white/10 hover:border-white/20'}`}>
                      <input type="radio" name="lang" value="en" checked={lang === 'en'} onChange={() => handleLangChange('en')} className="hidden" />
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${lang === 'en' ? 'text-indigo-400' : 'text-slate-300'}`}>{t('settings.language_section.en')}</span>
                        {lang === 'en' && <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />}
                      </div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'notifications' && (
              <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="space-y-6 relative z-10 flex-1 flex flex-col justify-between h-full">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{t('settings.notifications_section.title')}</h3>
                    <p className="text-sm text-slate-400">{t('settings.notifications_section.desc')}</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'email', title: t('settings.notifications_section.email_title'), desc: t('settings.notifications_section.email_desc') },
                      { key: 'push', title: t('settings.notifications_section.push_title'), desc: t('settings.notifications_section.push_desc') },
                      { key: 'alerts', title: t('settings.notifications_section.alerts_title'), desc: t('settings.notifications_section.alerts_desc') }
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-950/30">
                        <div>
                          <p className="text-sm font-bold text-white">{item.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                        </div>
                        <button 
                          onClick={() => handleToggleNotif(item.key)}
                          className={`w-11 h-6 rounded-full transition-all relative ${notifs[item.key] ? 'bg-indigo-600' : 'bg-slate-800'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifs[item.key] ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'privacy' && (
              <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="space-y-6 relative z-10 flex-1 flex flex-col justify-between h-full">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{t('settings.privacy_section.title')}</h3>
                    <p className="text-sm text-slate-400">{t('settings.privacy_section.desc')}</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'publicProfile', title: t('settings.privacy_section.public_title'), desc: t('settings.privacy_section.public_desc') },
                      { key: 'activityLog', title: t('settings.privacy_section.activity_title'), desc: t('settings.privacy_section.activity_desc') },
                      { key: 'shareStats', title: t('settings.privacy_section.stats_title'), desc: t('settings.privacy_section.stats_desc') }
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-950/30">
                        <div>
                          <p className="text-sm font-bold text-white">{item.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                        </div>
                        <button 
                          onClick={() => handleTogglePrivacy(item.key)}
                          className={`w-11 h-6 rounded-full transition-all relative ${privacy[item.key] ? 'bg-indigo-600' : 'bg-slate-800'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${privacy[item.key] ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'api_keys' && (
              <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="space-y-6 relative z-10 flex-1 flex flex-col justify-between h-full">
                <div className="space-y-6">
                  <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{t('settings.api_keys_section.title')}</h3>
                      <p className="text-sm text-slate-400">{t('settings.api_keys_section.desc')}</p>
                    </div>
                    <button 
                      onClick={handleGenerateKey}
                      className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
                    >
                      {t('settings.api_keys_section.create_btn')}
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {apiKeys.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
                        {t('settings.api_keys_section.empty')}
                      </div>
                    ) : (
                      apiKeys.map(key => {
                        const isEditing = editingId === key.id;
                        return (
                          <div key={key.id} className="p-4 rounded-xl border border-white/5 bg-slate-950/30 flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              {isEditing ? (
                                <input 
                                  type="text" 
                                  value={editName} 
                                  onChange={e => setEditName(e.target.value)} 
                                  onBlur={() => handleSaveEdit(key.id)}
                                  onKeyDown={e => { 
                                    if (e.key === 'Enter') handleSaveEdit(key.id); 
                                    if (e.key === 'Escape') setEditingId(null); 
                                  }}
                                  className="bg-slate-900 border border-indigo-500/50 rounded-lg px-2.5 py-1 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-full max-w-xs"
                                  autoFocus
                                />
                              ) : (
                                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
                                  setEditingId(key.id);
                                  setEditName(key.name);
                                }}>
                                  <p className="text-sm font-bold text-white truncate">{key.name}</p>
                                  <Edit2 size={12} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              )}
                              <p className="text-xs font-mono text-indigo-400 mt-1.5 select-all truncate">{key.value}</p>
                              <p className="text-[10px] text-slate-500 mt-1">
                                {t('settings.api_keys_section.created_on')} {new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US').format(key.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(key.value);
                                  toast.success(t('settings.api_keys_section.copied'));
                                }}
                                className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                title={t('settings.api_keys_section.copy_key')}
                              >
                                  <Copy size={14} />
                              </button>
                              <button 
                                onClick={() => setDeleteConfirmKey(key)}
                                className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all"
                                title={t('settings.api_keys_section.delete_key')}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'subscription' && (
              <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="space-y-6 relative z-10 flex-1 flex flex-col justify-between h-full">
                {remoteLoading ? (
                  <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-white/5 bg-slate-950/20 text-slate-400">
                    <div className="flex items-center gap-3">
                      <RefreshCw size={16} className="animate-spin text-indigo-400" />
                      <span>Đang tải cài đặt...</span>
                    </div>
                  </div>
                ) : (
                <div className="space-y-6">
                  {remoteError && (
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                      {remoteError}
                    </div>
                  )}

                  {/* Current Plan Information */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{t('settings.subscription_section.title')}</h3>
                    <p className="text-sm text-slate-400">{t('settings.subscription_section.desc')}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500">Gói hiện tại</p>
                      <p className="mt-2 text-base font-bold text-white">{aiPlan.label}</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500">Model AI</p>
                      <p className="mt-2 text-base font-bold text-white">{aiPlan.model}</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500">Giới hạn</p>
                      <p className="mt-2 text-base font-bold text-white">{aiPlan.limitText}</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-950/20 to-slate-900/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Zap size={120} className="text-indigo-400" />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-2xl font-black text-white">
                            {t(`settings.plans.${subscription?.planId?.toLowerCase()}.name`) || subscription?.planName || aiPlan.label}
                          </h4>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                            subscription?.status === 'ACTIVE' 
                              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' 
                              : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
                          }`}>
                            {subscription?.status === 'ACTIVE' 
                              ? t('settings.subscription_section.status_active') 
                              : t('settings.subscription_section.status_cancelled')}
                          </span>
                        </div>
                        {subscription?.expiredAt && (
                          <p className="text-xs text-slate-400 mt-2">
                            {subscription?.status === 'ACTIVE'
                              ? t('settings.subscription_section.renew_at', { 
                                  date: new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'long' }).format(new Date(subscription.expiredAt)) 
                                })
                              : t('settings.subscription_section.expired_at', { 
                                  date: new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'long' }).format(new Date(subscription.expiredAt)) 
                                })
                            }
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        {subscription?.planId !== 'free' && (
                          <>
                            <button 
                              onClick={() => setRenewConfirmSub(true)}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/15 flex items-center gap-1.5 active:scale-95"
                            >
                              <RefreshCw size={14} /> {t('settings.subscription_section.btn_renew')}
                            </button>
                            {subscription?.status === 'ACTIVE' && (
                              <button 
                                onClick={() => setCancelConfirmSub(true)}
                                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                              >
                                <XCircle size={14} /> {t('settings.subscription_section.btn_cancel')}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment History */}
                  <div>
                    <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider pl-1">{t('settings.subscription_section.history_title')}</h4>
                    <div className="bg-slate-950/20 rounded-2xl border border-white/5 p-4 max-h-[220px] overflow-y-auto custom-scrollbar">
                      {paymentHistory.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl text-xs">
                          {t('settings.subscription_section.history_empty')}
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-left">
                            <thead>
                              <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="pb-3 pl-1">{t('settings.subscription_section.table_code')}</th>
                                <th className="pb-3">{t('settings.subscription_section.table_plan')}</th>
                                <th className="pb-3">{t('settings.subscription_section.table_amount')}</th>
                                <th className="pb-3">{t('settings.subscription_section.table_date')}</th>
                                <th className="pb-3 pr-1 text-right">{t('settings.subscription_section.table_status')}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                              {paymentHistory.map(item => (
                                <tr key={item.id} className="text-xs hover:bg-white/[0.01]">
                                  <td className="py-3 font-mono font-bold text-slate-400 select-all pl-1">{item.orderCode}</td>
                                  <td className="py-3 text-white font-medium">{item.planName}</td>
                                  <td className="py-3 text-indigo-400 font-bold">{formatPrice(item.amount)}</td>
                                  <td className="py-3 text-slate-500">
                                    {item.paidAt ? new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.paidAt)) : 'N/A'}
                                  </td>
                                  <td className="py-3 text-right pr-1">
                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                                      item.status === 'PAID' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' :
                                      item.status === 'PENDING' ? 'border-amber-500/20 bg-amber-500/10 text-amber-400' :
                                      'border-slate-500/20 bg-slate-500/10 text-slate-400'
                                    }`}>
                                      {item.status === 'PAID' 
                                        ? t('settings.subscription_section.status_paid') 
                                        : item.status === 'PENDING' 
                                          ? t('settings.subscription_section.status_pending') 
                                          : t('settings.subscription_section.status_other')}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                )}
              </motion.div>
            )}

          </div>

        </div>
      </div>

      {/* Custom Delete Confirm Modal */}
      {deleteConfirmKey && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center px-6 bg-black/35 backdrop-blur-[1px]"
          onClick={() => setDeleteConfirmKey(null)}
        >
          <div
            className="relative w-full max-w-[360px] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
            style={{ background: 'linear-gradient(135deg, rgba(30,30,60,0.95) 0%, rgba(15,15,35,0.98) 100%)', boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(239,68,68,0.08)' }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

            <div className="p-6">
              {/* Icon + title */}
              <div className="flex flex-col items-center text-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl scale-150" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20 flex items-center justify-center">
                    <Trash2 size={24} className="text-red-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight">{t('settings.api_keys_section.confirm_title')}</h3>
                  <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                    {t('settings.api_keys_section.confirm_desc', { name: deleteConfirmKey.name })}
                  </p>
                  <p className="text-slate-600 text-xs mt-2">{t('settings.api_keys_section.confirm_note')}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmKey(null)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-300 hover:text-white rounded-xl transition-all duration-200 border border-white/8 hover:border-white/15 hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  {t('settings.api_keys_section.btn_cancel')}
                </button>
                <button
                  onClick={() => {
                    handleDeleteKey(deleteConfirmKey.id);
                    setDeleteConfirmKey(null);
                  }}
                  className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:brightness-110 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 20px rgba(239,68,68,0.35)' }}
                >
                  {t('settings.api_keys_section.btn_delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Cancel Subscription Confirm Modal */}
      {cancelConfirmSub && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center px-6 bg-black/35 backdrop-blur-[1px]"
          onClick={() => setCancelConfirmSub(false)}
        >
          <div
            className="relative w-full max-w-[360px] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
            style={{ background: 'linear-gradient(135deg, rgba(30,30,60,0.95) 0%, rgba(15,15,35,0.98) 100%)', boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(239,68,68,0.08)' }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

            <div className="p-6">
              {/* Icon + title */}
              <div className="flex flex-col items-center text-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl scale-150" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20 flex items-center justify-center">
                    <XCircle size={24} className="text-red-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight">{t('settings.subscription_section.cancel_confirm_title')}</h3>
                  <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                    {t('settings.subscription_section.cancel_confirm_desc', { 
                      name: t(`settings.plans.${subscription?.planId?.toLowerCase()}.name`) || subscription?.planName 
                    })}
                  </p>
                  <p className="text-slate-600 text-xs mt-2">{t('settings.subscription_section.cancel_confirm_note')}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelConfirmSub(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-300 hover:text-white rounded-xl transition-all duration-200 border border-white/8 hover:border-white/15 hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  {t('settings.subscription_section.cancel_confirm_btn_no')}
                </button>
                <button
                  onClick={async () => {
                    setCancelConfirmSub(false);
                    try {
                      const updated = await updateSubscription({
                        ...subscription,
                        status: 'CANCELLED',
                      });
                      setSubscription(updated);
                      // toast.success(t('settings.subscription_section.cancel_success'));
                    } catch {
                      // ignore
                    }
                  }}
                  className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:brightness-110 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 20px rgba(239,68,68,0.35)' }}
                >
                  {t('settings.subscription_section.cancel_confirm_btn_yes')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Renew/Upgrade Modal */}
      {renewConfirmSub && subscription && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center px-6 bg-black/35 backdrop-blur-[1px]"
          onClick={() => setRenewConfirmSub(false)}
        >
          <div
            className="relative w-full max-w-[460px] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 text-left border border-white/10"
            onClick={e => e.stopPropagation()}
            style={{ 
              background: 'linear-gradient(135deg, rgba(20,20,25,0.98) 0%, rgba(10,10,15,0.99) 100%)', 
              boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 32px 64px rgba(0,0,0,0.6)' 
            }}
          >
            {/* Close button */}
            <button 
              onClick={() => setRenewConfirmSub(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} className="stroke-[1.5]" />
            </button>

            {/* Title */}
            <h3 className="text-white font-bold text-lg mb-4 tracking-tight">
              {t('settings.subscription_section.renew_modal.title')}
            </h3>

            {/* Subtitle / Description */}
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {t('settings.subscription_section.renew_modal.desc', {
                plan: subscription?.planName === 'Pro' ? 'Plus' : subscription?.planName,
                date: formatDateModal(subscription?.expiredAt)
              })}
            </p>

            {/* Dark Container Box */}
            <div className="bg-[#141416]/90 border border-white/5 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-bold text-sm">
                  {subscription?.planName === 'Pro' ? 'ChatDMP Pro' : subscription?.planName}
                </span>
                <span className="text-slate-400 text-xs font-semibold">
                  {formatPrice(subscription?.price || 0)}/{t('settings.subscription_section.renew_modal.cycle_unit')}
                </span>
              </div>
              <p className="text-slate-500 text-xs">
                {t('settings.subscription_section.renew_modal.box_desc', {
                  date: formatDateModal(subscription?.expiredAt)
                })}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRenewConfirmSub(false)}
                className="px-5 py-2 rounded-full text-xs font-bold text-white bg-slate-900 border border-white/10 hover:bg-slate-800 transition-all active:scale-95"
              >
                {t('settings.subscription_section.renew_modal.btn_cancel')}
              </button>
              <button
                onClick={async () => {
                  setRenewConfirmSub(false);
                  try {
                    const updated = await updateSubscription({
                      ...subscription,
                      status: 'ACTIVE',
                    });
                    setSubscription(updated);
                    toast.success(t('settings.subscription_section.renew_modal.toast_success'));
                  } catch (e) {
                    toast.error(e.message || 'Error');
                  }
                }}
                className="px-5 py-2 rounded-full text-xs font-bold bg-white text-black hover:bg-white/90 transition-all shadow-lg active:scale-95"
              >
                {t('settings.subscription_section.renew_modal.btn_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
