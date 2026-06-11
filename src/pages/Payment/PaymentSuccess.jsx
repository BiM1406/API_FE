import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle2, CreditCard } from 'lucide-react';
import { PAYMENT_STATUS } from './paymentConstants';
import { getCurrentPayment } from './paymentService';
import { formatCurrency, formatDateTime } from './paymentUtils';
import { activateSubscription } from '../../services/profileService';

const MotionDiv = motion.div;

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 py-3 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="max-w-[60%] break-words text-right text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

export default function PaymentSuccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [payment] = useState(() => getCurrentPayment());

  useEffect(() => {
    if (payment?.status === PAYMENT_STATUS.PENDING) {
      navigate('/payment');
      return;
    }

    if (
      payment &&
      [PAYMENT_STATUS.FAILED, PAYMENT_STATUS.CANCELLED, PAYMENT_STATUS.EXPIRED].includes(payment.status)
    ) {
      navigate('/payment/failed');
      return;
    }

    if (payment?.status === PAYMENT_STATUS.PAID) {
      const planNameLower = payment.planName?.toLowerCase() || '';
      let planId = 'pro';
      if (planNameLower.includes('ultra')) {
        planId = 'ultra';
      }
      
      const planObj = {
        planId,
        planName: planId === 'pro' ? 'Pro' : 'Ultra',
        price: payment.amount,
        cycle: 'tháng'
      };
      
      activateSubscription(planObj, payment).catch(err => {
        console.error('Failed to activate subscription:', err);
      });
    }
  }, [navigate, payment]);

  if (!payment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
        <div className="max-w-md rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-2xl">
          <CreditCard className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <h1 className="text-2xl font-black">{t('payment.success.error_not_found')}</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">{t('payment.success.error_not_found_desc')}</p>
          <button
            type="button"
            onClick={() => navigate('/pricing')}
            className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
          >
            {t('payment.btn_pricing')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 px-6 py-6 text-white selection:bg-emerald-500/30">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40vw] w-[40vw] rounded-full bg-emerald-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40vw] w-[40vw] rounded-full bg-indigo-600/20 blur-[120px]" />

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-48px)] max-w-md items-center">
        <MotionDiv
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="w-full rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-6"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/30">
              <CheckCircle2 size={28} />
            </div>
            <h1 className="text-2xl font-black tracking-tight md:text-3xl">{t('payment.success.title')}</h1>
            <p className="mt-2 text-sm text-slate-400">
              {t('payment.success.subtitle', { name: payment.planName })}
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <DetailRow label={t('payment.success.order_code')} value={payment.orderCode} />
            <DetailRow label={t('payment.success.plan_name')} value={payment.planName} />
            <DetailRow label={t('payment.success.cycle')} value={(payment.cycle === 'Hàng tháng' || payment.cycle === 'tháng' || payment.cycle === 'month' || payment.cycle === 'Monthly') ? t('payment.cycle_monthly') : payment.cycle} />
            <DetailRow label={t('payment.success.amount')} value={formatCurrency(payment.amount)} />
            <DetailRow label={t('payment.success.provider')} value={payment.provider} />
            <DetailRow label={t('payment.success.paid_time')} value={formatDateTime(payment.paidAt)} />
            <DetailRow label={t('payment.success.status')} value={t('payment.status_paid')} />
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard', { replace: true })}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98]"
            >
              {t('payment.success.btn_dashboard')}
            </button>
          </div>
        </MotionDiv>
      </main>
    </div>
  );
}
