import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';
import { addActivity } from '../../services/activityService';

export default function Login({ onSwitch, onForgot }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Vui lòng nhập tên tài khoản hoặc email';
    if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Vui lòng điền đủ thông tin hợp lệ!');
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const { user } = await login({ email, password });
      addActivity({
        type: 'auth',
        title: 'Đăng nhập',
        description: `${user.name || user.email} đăng nhập hệ thống`,
        status: 'success'
      });
      toast.success(`Đăng nhập thành công với quyền ${user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}!`);
      navigate(user.role === 'ADMIN' ? '/admin/overview' : '/dashboard');
    } catch (error) {
      setErrors({ password: error.message });
      toast.error(error.message || 'Đăng nhập thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Đăng Nhập</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Tên tài khoản / Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: '' })); }}
              className={`w-full bg-slate-800/50 border ${errors.email ? 'border-red-400' : 'border-slate-700'} text-white rounded-lg py-2.5 pl-10 pr-4 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-500`}
              placeholder="Nhập tên tài khoản hoặc email"
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Mật khẩu</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: '' })); }}
              className={`w-full bg-slate-800/50 border ${errors.password ? 'border-red-400' : 'border-slate-700'} text-white rounded-lg py-2.5 pl-10 pr-10 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-500`}
              placeholder="••••••••"
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
            <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Ghi nhớ đăng nhập</span>
          </label>
          <button
            type="button"
            onClick={onForgot}
            className="text-sm text-violet-400 font-medium hover:text-violet-300 transition-colors"
          >
            Quên mật khẩu?
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
              Đăng Nhập
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-400">
        Chưa có tài khoản?{' '}
        <button onClick={onSwitch} type="button" className="text-violet-400 font-medium hover:text-violet-300 transition-colors">
          Đăng ký ngay
        </button>
      </p>
    </div>
  );
}
