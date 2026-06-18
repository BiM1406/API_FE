import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';
import { addActivity } from '../../services/activityService';

export default function Login({ onSwitch, onForgot }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email.trim()) newErrors.email = t('auth.toast_login_email_required');
    if (!password) newErrors.password = t('auth.toast_login_pwd_required');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t('auth.toast_login_fields_required'));
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      const response = await login({ email, password });
      const user = response.user;

      addActivity({
        type: 'auth',
        title: t('auth.login_title'),
        description: `${user.name || user.email} ${t('auth.login_title').toLowerCase()}`,
        status: 'success'
      });

      // Chuyển hướng
      if (user.role === 'ADMIN') {
        navigate('/admin/overview');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const isNetworkError = error.message?.includes('fetch') || error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch');
      if (!isNetworkError) {
        toast.error(error.message || t('auth.toast_login_failed'));
      }
      setErrors({ email: error.message || t('auth.toast_login_incorrect_credential') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">{t('auth.login_title')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
        {/* Hidden inputs to trick browser autofill */}
        <input type="text" name="fakeusernameremembered" style={{ display: 'none' }} />
        <input type="password" name="fakepasswordremembered" style={{ display: 'none' }} />
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">{t('auth.email_username_label')}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                autoComplete="off"
                value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: '' })); }}
              className={`w-full bg-slate-800/50 border ${errors.email ? 'border-red-400' : 'border-slate-700'} text-white rounded-lg py-2.5 pl-10 pr-4 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-500`}
              placeholder={t('auth.email_username_placeholder')}
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
              placeholder={t('auth.password_placeholder')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between mt-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 bg-slate-800 border-slate-700 rounded text-violet-500 focus:ring-violet-500 focus:ring-offset-slate-900" />
            <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{t('auth.remember_me')}</span>
          </label>
          <button
            type="button"
            onClick={onForgot}
            className="text-sm text-violet-400 font-medium hover:text-violet-300 transition-colors"
          >
            {t('auth.forgot_password_link')}
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          type="submit"
          className="w-full mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {t('auth.login_title')}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>

        {/* Divider */}
        <div className="relative my-4 flex items-center gap-3">
          <div className="flex-1 border-t border-slate-700" />
          <span className="text-xs text-slate-500">hoặc</span>
          <div className="flex-1 border-t border-slate-700" />
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={() => {
            // Redirect to BE Google OAuth endpoint
            const oauthUrl = import.meta.env.VITE_GOOGLE_AUTH_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/google`;
            window.location.href = oauthUrl;
          }}
          className="w-full flex items-center justify-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-700/60 active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Đăng nhập với Google
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-400">
        {t('auth.no_account_text')}{' '}
        <button onClick={onSwitch} type="button" className="text-violet-400 font-medium hover:text-violet-300 transition-colors">
          {t('auth.register_now')}
        </button>
      </p>
    </div>
  );
}
