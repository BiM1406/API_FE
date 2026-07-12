import React, { useRef, useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { verifyOtp } from '../../services/authService';

export default function OtpVerification({ email, onBack, onVerified }) {
  const { t } = useTranslation();
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

  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setErrors({ otp: t('auth.otp_toast_required') });
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      await verifyOtp({ email, otp: otpCode });
      onVerified();
    } catch (error) {
      const isNetworkError = error.message?.includes('fetch') || error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch');
      if (isNetworkError) {
        setErrors({ general: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.' });
      } else {
        setErrors({ otp: error.message || t('auth.otp_toast_failed') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">{t('auth.otp_title')}</h2>
        <p className="text-slate-400 text-sm">
          {t('auth.otp_subtitle')}<br />
          <span className="font-semibold text-violet-400">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {errors.general && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm flex items-center justify-center">
            {errors.general}
          </div>
        )}
        <div>
          <div className="flex justify-between gap-2 sm:gap-3">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                name="otp"
                maxLength="1"
                ref={(el) => { inputRefs.current[index] = el; }}
                value={data}
                onChange={(e) => { handleChange(index, e.target.value); setErrors({}); }}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={(e) => { handlePaste(e); setErrors({}); }}
                onFocus={(e) => e.target.select()}
                className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-slate-800/50 border ${errors.otp ? 'border-red-400' : 'border-slate-700'} text-white rounded-lg outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-600`}
                placeholder="-"
              />
            ))}
          </div>
          {errors.otp && <p className="text-red-400 text-xs mt-2 text-center">{errors.otp}</p>}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          type="submit"
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{t('auth.otp_resend')} <ArrowRight className="w-4 h-4" /></>}
        </motion.button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-400 mb-2">
          {t('auth.otp_not_received')}{' '}
          <button type="button" onClick={() => {}} className="text-violet-400 font-medium hover:text-violet-300 transition-colors">
            {t('auth.otp_resend')}
          </button>
        </p>
        <button onClick={onBack} type="button" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
          {t('auth.otp_back_to_login')}
        </button>
      </div>
    </div>
  );
}
