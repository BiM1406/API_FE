import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, Send, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ─── COMPONENT 1: YÊU CẦU KHÔI PHỤC (Gửi email) ──────────────────────────
export function ForgotPasswordView({ onBack }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error(t('auth.forgot_pwd_toast_email_required'));
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      toast.success(t('auth.forgot_pwd_toast_request_sent'));
    }, 1500);
  };

  if (isSent) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Send className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">{t('auth.forgot_pwd_sent_title')}</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          {t('auth.forgot_pwd_sent_desc')} <br/>
          <span className="text-white font-medium">{email}</span>.
        </p>
        <button onClick={onBack} className="text-violet-400 font-medium hover:text-violet-300 flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft className="w-4 h-4" /> {t('auth.forgot_pwd_back_btn')}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">{t('auth.forgot_pwd_title')}</h2>
        <p className="text-slate-400">{t('auth.forgot_pwd_subtitle')}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">{t('auth.forgot_pwd_email_label')}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-500"
              placeholder={t('auth.forgot_pwd_email_placeholder')}
            />
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isLoading} type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> {t('auth.forgot_pwd_title')}</>}
        </motion.button>
        <button onClick={onBack} type="button" className="w-full text-slate-400 py-2 hover:text-white flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {t('auth.forgot_pwd_back_btn')}
        </button>
      </form>
    </div>
  );
}

// ─── COMPONENT 2: ĐẶT LẠI MẬT KHẨU (Reset Form) ──────────────────────────
export function ResetPasswordView() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error(t('auth.reset_pwd_toast_mismatch')); return; }
    if (password.length < 6) { toast.error(t('auth.reset_pwd_toast_min')); return; }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      toast.success(t('auth.reset_pwd_toast_success'));
    }, 1500);
  };

  return (
    <div className={!isSuccess ? "" : "flex items-center justify-center"}>
      {/* Nếu dùng làm trang riêng biệt, sẽ cần bọc Layer Glassmorphism.
          Ở đây tôi thiết kế để nó linh hoạt dùng được cả trong AuthPage hoặc trang /reset-password */}
      <div className={window.location.pathname === '/reset-password' ? "min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden" : ""}>
        {window.location.pathname === '/reset-password' && (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-violet-600/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-600/30 rounded-full blur-[100px] pointer-events-none" />
          </>
        )}

        <div className={window.location.pathname === '/reset-password' ? "relative w-full max-w-md mx-4 p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl z-10" : ""}>
          {isSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">{t('auth.reset_pwd_success_title')}</h2>
              <p className="text-slate-400 mb-8">{t('auth.reset_pwd_success_desc')}</p>
              <button onClick={() => navigate('/auth')} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2">
                {t('auth.reset_pwd_login_btn')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">{t('auth.reset_pwd_title')}</h2>
                <p className="text-slate-400">{t('auth.reset_pwd_subtitle')}</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">{t('auth.reset_pwd_new_pwd_label')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 outline-none focus:border-violet-500 transition-all placeholder:text-slate-500" placeholder="••••••••" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">{t('auth.reset_pwd_confirm_pwd_label')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 outline-none focus:border-violet-500 transition-all placeholder:text-slate-500" placeholder="••••••••" />
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isLoading} type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{t('auth.reset_pwd_title')} <CheckCircle2 className="w-4 h-4" /></>}
                </motion.button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mặc định xuất ForgotPasswordView để giữ tương thích với AuthPage
export default ForgotPasswordView;
