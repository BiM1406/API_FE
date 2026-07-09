import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ArrowLeft, CreditCard, RotateCcw, XCircle } from 'lucide-react';
import { PAYMENT_STATUS, isPaidPaymentStatus } from './paymentConstants';
import { clearCurrentPayment, getCurrentPayment } from './paymentService';
import { formatCurrency, formatDateTime } from './paymentUtils';

const MotionDiv = motion.div;

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 py-3 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="max-w-[60%] break-words text-right text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

const getStatusMessage = (status, t) => {
  const messages = {
    [PAYMENT_STATUS.CANCELLED]: t('payment.failed.status_cancelled'),
    [PAYMENT_STATUS.EXPIRED]: t('payment.failed.status_expired'),
    [PAYMENT_STATUS.FAILED]: t('payment.failed.status_failed'),
    [PAYMENT_STATUS.PENDING]: t('payment.failed.status_pending')
  };

  return messages[status] || t('payment.failed.status_fallback');
};

export default function PaymentFailed() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [payment] = useState(() => getCurrentPayment());
  const statusMessage = useMemo(() => getStatusMessage(payment?.status, t), [payment?.status, t]);

  useEffect(() => {
    if (isPaidPaymentStatus(payment?.status)) {
      navigate('/payment/success');
    }
  }, [navigate, payment]);

  const handleRetry = () => {
    clearCurrentPayment();
    navigate('/payment', { replace: true });
  };

  const handleBackToPricing = () => {
    clearCurrentPayment();
    navigate('/pricing', { replace: true });
  };

  if (!payment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
        <div className="max-w-md rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl">
          <CreditCard className="mx-auto mb-4 h-10 w-10 text-slate-400" />
          <h1 className="text-xl font-bold">{t('payment.failed.error_not_found')}</h1>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">{t('payment.failed.error_not_found_desc')}</p>
          <button
            type="button"
            onClick={handleBackToPricing}
            className="mt-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-slate-200"
          >
            {t('payment.btn_pricing')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 px-6 py-6 text-white selection:bg-red-500/30">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40vw] w-[40vw] rounded-full bg-red-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40vw] w-[40vw] rounded-full bg-violet-600/20 blur-[120px]" />

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-48px)] max-w-md items-center">
        <MotionDiv
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="w-full rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-6"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-400/10 text-red-300 ring-1 ring-red-400/30">
              {payment.status === PAYMENT_STATUS.PENDING ? <AlertTriangle size={28} /> : <XCircle size={28} />}
            </div>
            <h1 className="text-2xl font-black tracking-tight md:text-3xl">{t('payment.failed.title')}</h1>
            <p className="mt-2 text-sm text-slate-400">{statusMessage}</p>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <DetailRow label={t('payment.failed.order_code')} value={payment.orderCode} />
            <DetailRow label={t('payment.failed.plan_name')} value={payment.planName} />
            <DetailRow label={t('payment.failed.amount')} value={formatCurrency(payment.amount)} />
            <DetailRow label={t('payment.failed.provider')} value={payment.provider} />
            <DetailRow label={t('payment.failed.status')} value={t(`payment.status_${payment.status.toLowerCase()}`)} />
            <DetailRow label={t('payment.failed.created_time')} value={formatDateTime(payment.createdAt)} />
          </div>

          <div className="mt-6 grid gap-2.5">
            <button
              type="button"
              onClick={handleRetry}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98]"
            >
              <RotateCcw size={16} />
              {t('payment.failed.btn_retry')}
            </button>
            <button
              type="button"
              onClick={() => {
                clearCurrentPayment();
                navigate('/dashboard', { replace: true });
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10 active:scale-[0.98]"
            >
              {t('payment.failed.btn_dashboard')}
            </button>
          </div>
        </MotionDiv>
      </main>
    </div>
  );
}
