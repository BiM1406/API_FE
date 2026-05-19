import React, { useRef, useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { verifyOtp } from '../../services/authService';

export default function OtpVerification({ email, onBack, onVerified }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (Number.isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const newOtp = [...otp];
    pastedData.forEach((value, index) => {
      newOtp[index] = value;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      toast.error('Vui lòng nhập đủ 6 số OTP!');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp({ email, otp: otpCode });
      toast.success('Xác thực tài khoản thành công! Vui lòng đăng nhập.');
      onVerified();
    } catch (error) {
      toast.error(error.message || 'Xác thực thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Xác thực Email</h2>
        <p className="text-slate-400 text-sm">
          Chúng tôi đã gửi mã 6 số tới<br />
          <span className="font-semibold text-violet-400">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-between gap-2 sm:gap-3">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              name="otp"
              maxLength="1"
              ref={(el) => { inputRefs.current[index] = el; }}
              value={data}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-slate-800/50 border border-slate-700 text-white rounded-lg outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-600"
              placeholder="-"
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          type="submit"
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Xác nhận mã <ArrowRight className="w-4 h-4" /></>}
        </motion.button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-400 mb-2">
          Không nhận được mã?{' '}
          <button type="button" onClick={() => toast.success('Đã gửi lại mã mock: 123456')} className="text-violet-400 font-medium hover:text-violet-300 transition-colors">
            Gửi lại
          </button>
        </p>
        <button onClick={onBack} type="button" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
          Trở về trang đăng nhập
        </button>
      </div>
    </div>
  );
}
