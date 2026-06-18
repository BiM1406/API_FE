import React, { useState } from 'react';
import { Mail, Lock, User, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { register } from '../../services/authService';

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function Register({ onSwitch, onRegisterSuccess }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!name.trim()) newErrors.name = t('auth.toast_register_username_required');
    if (!email.trim()) newErrors.email = t('auth.toast_register_email_required');
    else if (!isEmail(email)) newErrors.email = t('auth.toast_register_email_invalid');
    if (!password) newErrors.password = t('auth.toast_register_pwd_required');
    else if (password.length < 6) newErrors.password = t('auth.toast_register_pwd_min');
    if (!confirmPassword) newErrors.confirmPassword = t('auth.toast_register_confirm_pwd_required');
    else if (password !== confirmPassword) newErrors.confirmPassword = t('auth.toast_register_confirm_pwd_mismatch');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t('auth.toast_register_check_info'));
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      await register({ name, email, password });
      toast.success(t('auth.toast_register_success'));
      onRegisterSuccess(email);
    } catch (error) {
      const isNetworkError = error.message?.includes('fetch') || error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch');
      if (!isNetworkError) {
        toast.error(error.message || t('auth.toast_register_failed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">{t('auth.register_title')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
        {/* Hidden inputs to trick browser autofill */}
        <input type="text" name="fakeusernameremembered" style={{ display: 'none' }} />
        <input type="password" name="fakepasswordremembered" style={{ display: 'none' }} />
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">{t('auth.register_username_label')}</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              autoComplete="off"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: '' })); }}
              className={`w-full bg-slate-800/50 border ${errors.name ? 'border-red-400' : 'border-slate-700'} text-white rounded-lg py-2.5 pl-10 pr-4 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-500`}
              placeholder={t('auth.register_username_placeholder')}
            />
          </div>
          {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">{t('auth.register_email_label')}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: '' })); }}
              className={`w-full bg-slate-800/50 border ${errors.email ? 'border-red-400' : 'border-slate-700'} text-white rounded-lg py-2.5 pl-10 pr-4 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-500`}
              placeholder={t('auth.register_email_placeholder')}
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">{t('auth.password_label')}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: '' })); }}
              className={`w-full bg-slate-800/50 border ${errors.password ? 'border-red-400' : 'border-slate-700'} text-white rounded-lg py-2.5 pl-10 pr-10 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-500`}
              placeholder={t('auth.register_pwd_placeholder')}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">{t('auth.register_confirm_pwd_label')}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors((prev) => ({ ...prev, confirmPassword: '' })); }}
              className={`w-full bg-slate-800/50 border ${errors.confirmPassword ? 'border-red-400' : 'border-slate-700'} text-white rounded-lg py-2.5 pl-10 pr-10 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-500`}
              placeholder={t('auth.register_confirm_pwd_placeholder')}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors">
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword}</p>}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          type="submit"
          className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{t('auth.register_title')} <ArrowRight className="w-4 h-4" /></>}
        </motion.button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-400">
        {t('auth.already_has_account')}{' '}
        <button onClick={onSwitch} type="button" className="text-violet-400 font-medium hover:text-violet-300 transition-colors">
          {t('auth.login_now')}
        </button>
      </p>
    </div>
  );
}
