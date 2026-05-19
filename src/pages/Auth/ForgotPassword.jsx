import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, Send, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPassword, resetPassword } from '../../services/authService';

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function ForgotPasswordView({ onBack }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmail(email)) {
      toast.error('Email không hợp lệ');
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email);
      setIsSent(true);
      toast.success('Yêu cầu đã được gửi. Bạn có thể đặt lại mật khẩu bằng mock flow.');
    } catch (error) {
      toast.error(error.message || 'Không thể gửi yêu cầu');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Send className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Kiểm tra Email</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Yêu cầu đặt lại mật khẩu đã được tạo cho<br />
          <span className="text-white font-medium">{email}</span>.
        </p>
        <button onClick={onBack} className="text-violet-400 font-medium hover:text-violet-300 flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft className="w-4 h-4" /> Quay lại Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Quên Mật Khẩu?</h2>
        <p className="text-slate-400">Nhập email để tạo yêu cầu đặt lại mật khẩu mock.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Email của bạn</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-500"
              placeholder="Nhập email"
            />
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isLoading} type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 disabled:opacity-70">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Gửi yêu cầu</>}
        </motion.button>
        <button onClick={onBack} type="button" className="w-full text-slate-400 py-2 hover:text-white flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Quay lại Đăng nhập
        </button>
      </form>
    </div>
  );
}

export function ResetPasswordView() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Mật khẩu tối thiểu 6 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ password });
      setIsSuccess(true);
      toast.success('Đã cập nhật mật khẩu mới');
    } catch (error) {
      toast.error(error.message || 'Không thể đặt lại mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  const isStandalone = window.location.pathname === '/reset-password';

  return (
    <div className={!isSuccess ? '' : 'flex items-center justify-center'}>
      <div className={isStandalone ? 'min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden' : ''}>
        {isStandalone && (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-violet-600/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-600/30 rounded-full blur-[100px] pointer-events-none" />
          </>
        )}

        <div className={isStandalone ? 'relative w-full max-w-md mx-4 p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl z-10' : ''}>
          {isSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Thành Công!</h2>
              <p className="text-slate-400 mb-8">Mật khẩu đã được cập nhật. Bạn có thể đăng nhập ngay.</p>
              <button onClick={() => navigate('/auth')} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2">
                Đăng nhập ngay <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Mật Khẩu Mới</h2>
                <p className="text-slate-400">Thiết lập mật khẩu mới cho tài khoản của bạn.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <PasswordInput label="Mật khẩu mới" value={password} onChange={setPassword} />
                <PasswordInput label="Xác nhận mật khẩu" value={confirmPassword} onChange={setConfirmPassword} />
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isLoading} type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 disabled:opacity-70">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Cập nhật mật khẩu <CheckCircle2 className="w-4 h-4" /></>}
                </motion.button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordInput({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="password"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 outline-none focus:border-violet-500 transition-all placeholder:text-slate-500"
          placeholder="••••••••"
        />
      </div>
    </div>
  );
}

export default ForgotPasswordView;
