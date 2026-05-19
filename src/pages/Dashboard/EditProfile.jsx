import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bot, Camera, Check, CreditCard, Crown, Eye, EyeOff, Lock, Mail, Save, User, Zap } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { changePassword, getProfile, getSubscription, PLANS, saveSelectedPlan, updateProfile } from '../../services/profileService';

const plans = [
  { ...PLANS[0], icon: Bot, color: 'from-slate-700 to-slate-800' },
  { ...PLANS[1], icon: Zap, color: 'from-violet-500 to-indigo-600' },
  { ...PLANS[2], icon: Crown, color: 'from-amber-500 to-orange-600' }
];

const initials = (name = 'User') => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

export default function EditProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [currentPlan, setCurrentPlan] = useState('free');
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    if (tab === 'subscription') return 'plan';
    if (tab === 'password') return 'password';
    return 'profile';
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([getProfile(), getSubscription()]).then(([profile, subscription]) => {
      if (!mounted) return;
      setFormData({
        name: profile?.name || profile?.username || '',
        email: profile?.email || ''
      });
      setCurrentPlan(subscription?.planId || 'free');
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'subscription') setActiveTab('plan');
    if (tab === 'password') setActiveTab('password');
    if (tab === 'profile') setActiveTab('profile');
  }, [searchParams]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handlePasswordChange = (event) => {
    setPasswords({ ...passwords, [event.target.name]: event.target.value });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Vui lòng nhập đủ tên và email');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(formData);
      toast.success('Đã lưu thông tin hồ sơ');
      navigate('/profile');
    } catch (error) {
      toast.error(error.message || 'Không thể lưu hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      await changePassword(passwords);
      toast.success('Đổi mật khẩu thành công');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message || 'Không thể đổi mật khẩu');
    }
  };

  const handleChangePlan = (planId) => {
    const plan = plans.find((item) => item.planId === planId);
    if (!plan) return;

    if (planId === 'free') {
      toast(currentPlan === 'free' ? 'Bạn đang sử dụng gói Miễn Phí' : 'Chức năng hạ cấp sẽ được xử lý sau');
      return;
    }

    saveSelectedPlan({
      planId: plan.planId,
      planName: plan.planName,
      price: plan.price,
      cycle: plan.cycle
    });
    toast.success(`Đã chọn gói ${plan.planName}. Vui lòng thanh toán để kích hoạt.`);
    navigate('/payment');
  };

  const tabs = [
    { id: 'profile', label: 'Hồ sơ' },
    { id: 'password', label: 'Mật khẩu' },
    { id: 'plan', label: 'Gói dịch vụ' }
  ];

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-950 font-sans text-slate-300">
      <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[20%] left-[10%] h-[30%] w-[30%] rounded-full bg-violet-600/10 blur-[100px]" />

      <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-800/50 bg-slate-900/40 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="rounded-lg bg-slate-800/50 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            title="Quay lại"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-bold tracking-tight text-white">Chỉnh sửa hồ sơ</h1>
        </div>
      </header>

      <main className="z-10 mx-auto flex-1 w-full max-w-2xl space-y-6 overflow-y-auto p-8 custom-scrollbar">
        <div className="flex gap-1 rounded-xl border border-slate-800/50 bg-slate-900/60 p-1 backdrop-blur-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
                activeTab === tab.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <section className="rounded-2xl border border-slate-800/50 bg-slate-900/40 p-8 shadow-xl backdrop-blur-md">
            <div className="mb-8 flex flex-col items-center">
              <div className="group relative mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-3xl font-bold text-white shadow-2xl shadow-indigo-500/30">
                {initials(formData.name || formData.email)}
                <button className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera size={24} className="text-white" />
                </button>
              </div>
              <p className="cursor-pointer text-xs font-bold text-violet-400 transition hover:text-violet-300">Thay đổi ảnh đại diện</p>
            </div>

            <div className="space-y-6">
              <Field label="Tên hiển thị" icon={User}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-12 pr-4 font-medium text-white outline-none transition-all placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50"
                />
              </Field>

              <Field label="Email" icon={Mail}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-12 pr-4 font-medium text-white outline-none transition-all placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50"
                />
              </Field>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 active:scale-[0.98] disabled:opacity-60"
                >
                  <Save size={18} /> Lưu thay đổi
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-3 font-bold text-white transition hover:bg-slate-700 active:scale-[0.98]"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'password' && (
          <section className="rounded-2xl border border-slate-800/50 bg-slate-900/40 p-8 shadow-xl backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-violet-500/10 p-3">
                <Lock size={20} className="text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Đổi mật khẩu</h2>
                <p className="text-xs text-slate-500">Cập nhật mật khẩu để bảo vệ tài khoản của bạn</p>
              </div>
            </div>

            <div className="space-y-5">
              <PasswordField
                label="Mật khẩu hiện tại"
                name="currentPassword"
                value={passwords.currentPassword}
                visible={showPasswords.current}
                onToggle={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                onChange={handlePasswordChange}
                placeholder="Nhập mật khẩu hiện tại"
              />
              <PasswordField
                label="Mật khẩu mới"
                name="newPassword"
                value={passwords.newPassword}
                visible={showPasswords.new}
                onToggle={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                onChange={handlePasswordChange}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              />
              <PasswordField
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                value={passwords.confirmPassword}
                visible={showPasswords.confirm}
                onToggle={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                onChange={handlePasswordChange}
                placeholder="Nhập lại mật khẩu mới"
              />

              <button
                onClick={handleChangePassword}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 active:scale-[0.98]"
              >
                <Lock size={18} /> Đổi mật khẩu
              </button>
            </div>
          </section>
        )}

        {activeTab === 'plan' && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-800/50 bg-slate-900/40 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/10 p-3">
                  <CreditCard size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Gói dịch vụ</h2>
                  <p className="text-xs text-slate-500">Chọn gói phù hợp với nhu cầu của bạn</p>
                </div>
              </div>
            </div>

            {plans.map((plan) => {
              const isActive = currentPlan === plan.planId;
              const Icon = plan.icon;
              return (
                <button
                  type="button"
                  key={plan.planId}
                  onClick={() => handleChangePlan(plan.planId)}
                  className={`w-full cursor-pointer rounded-2xl border p-6 text-left transition-all ${
                    isActive ? 'border-violet-500/50 bg-slate-900/60 shadow-lg shadow-violet-900/10 ring-1 ring-violet-500/30' : 'border-slate-800/50 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${plan.color} shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">{plan.planName}</h3>
                          {plan.badge && (
                            <span className="rounded-full border border-violet-500/30 bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-400">
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-slate-400">
                          <span className="font-bold text-white">{new Intl.NumberFormat('vi-VN').format(plan.price)} VND</span> / {plan.cycle}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{plan.description}</p>
                      </div>
                    </div>

                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${isActive ? 'border-violet-500 bg-violet-500' : 'border-slate-600'}`}>
                      {isActive && <Check size={14} className="text-white" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

function Field({ label, icon, children }) {
  const FieldIcon = icon;
  return (
    <div>
      <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-widest text-slate-400">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
          <FieldIcon size={18} />
        </div>
        {children}
      </div>
    </div>
  );
}

function PasswordField({ label, name, value, visible, onToggle, onChange, placeholder }) {
  return (
    <Field label={label} icon={Lock}>
      <input
        type={visible ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-12 pr-12 font-medium text-white outline-none transition-all placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50"
      />
      <button type="button" onClick={onToggle} className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 transition hover:text-slate-300">
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </Field>
  );
}
