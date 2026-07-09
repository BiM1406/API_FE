import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  Landmark,
  Loader2,
  ReceiptText,
  Smartphone,
  XCircle,
  Zap
} from 'lucide-react';
import { MOCK_PAYMENT_PLAN, MOCK_PAYMENT_PLANS, PAYMENT_STATUS, isPaidPaymentStatus } from './paymentConstants';
import {
  cancelPayment,
  createOrGetCurrentPayment,
  expirePayment,
  fetchPaymentByOrderCode,
  getCurrentPayment,
  markPaymentPaid
} from './paymentService';
import { copyToClipboard, formatCountdown, formatCurrency } from './paymentUtils';

const MotionHeader = motion.header;
const MotionSection = motion.section;

const finalStatuses = [
  PAYMENT_STATUS.PAID,
  PAYMENT_STATUS.SUCCESS,
  PAYMENT_STATUS.FAILED,
  PAYMENT_STATUS.CANCELLED,
  PAYMENT_STATUS.EXPIRED
];

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
};

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const config = {
    [PAYMENT_STATUS.PENDING]: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    [PAYMENT_STATUS.PAID]: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    [PAYMENT_STATUS.SUCCESS]: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    [PAYMENT_STATUS.FAILED]: 'border-red-400/30 bg-red-400/10 text-red-300',
    [PAYMENT_STATUS.CANCELLED]: 'border-slate-400/30 bg-slate-400/10 text-slate-300',
    [PAYMENT_STATUS.EXPIRED]: 'border-orange-400/30 bg-orange-400/10 text-orange-300'
  };

  const statusKey = `payment.status_${(status || PAYMENT_STATUS.PENDING).toLowerCase()}`;

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${config[status] || config[PAYMENT_STATUS.PENDING]}`}>
      {t(statusKey)}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 py-3 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="max-w-[62%] break-words text-right text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function CopyRow({ value, copyValue, translationKey }) {
  const { t } = useTranslation();
  const handleCopy = async () => {
    const copied = await copyToClipboard(copyValue ?? value);
    if (copied) {
      toast.success(t('payment.toasts.copied_success', { label: t(translationKey).toLowerCase() }));
    } else {
      toast.error(t('payment.toasts.copied_error'));
    }
  };

  return (
    <div className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-violet-400/40 hover:bg-slate-950/80">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{t(translationKey)}</p>
        <p className="mt-1 break-all font-mono text-sm font-semibold text-white">{value}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition group-hover:border-violet-400/50 group-hover:text-white active:scale-95"
        aria-label={`Sao chép ${t(translationKey)}`}
      >
        <Copy size={16} />
      </button>
    </div>
  );
}

function StepItem({ index, title, active }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-black ${
        active ? 'border-violet-400/40 bg-violet-500 text-white' : 'border-white/10 bg-white/5 text-slate-500'
      }`}>
        {index}
      </div>
      <span className={`truncate text-sm font-semibold ${active ? 'text-white' : 'text-slate-500'}`}>{title}</span>
    </div>
  );
}

function MockQRCode({ orderCode }) {
  const cells = useMemo(() => {
    const source = orderCode || 'API_FE_PAYMENT';
    return Array.from({ length: 121 }, (_, index) => {
      const charCode = source.charCodeAt(index % source.length);
      const isAnchor = (
        (index < 33 && index % 11 < 3) ||
        (index % 11 > 7 && index < 33) ||
        (index > 87 && index % 11 < 3)
      );

      return isAnchor || ((charCode + index * 7) % 5 < 2);
    });
  }, [orderCode]);

  return (
    <div className="mx-auto w-full max-w-[260px] rounded-[2rem] border border-white/10 bg-white p-5 shadow-2xl shadow-violet-950/30">
      <div className="grid aspect-square grid-cols-11 gap-1 rounded-2xl bg-white">
        {cells.map((active, index) => (
          <div
            key={index}
            className={`rounded-[3px] ${active ? 'bg-slate-950' : 'bg-slate-100'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const mountedRef = useRef(false);
  const expiredToastRef = useRef(false);
  const [payment, setPayment] = useState(null);
  const [countdown, setCountdown] = useState('00:00');
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const selectedPlan = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return MOCK_PAYMENT_PLANS[params.get('plan')] || MOCK_PAYMENT_PLAN;
  }, [location.search]);

  useEffect(() => {
    mountedRef.current = true;

    const initPayment = async () => {
      try {
        const nextPayment = await createOrGetCurrentPayment(selectedPlan);
        if (!nextPayment) {
          toast.error(t('payment.toasts.create_error'));
          navigate('/pricing');
          return;
        }

        setPayment(nextPayment);
        setCountdown(formatCountdown(nextPayment.expiredAt));
      } catch {
        toast.error(t('payment.toasts.init_error'));
        navigate('/pricing');
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    initPayment();

    return () => {
      mountedRef.current = false;
    };
  }, [navigate, selectedPlan, t]);

  useEffect(() => {
    if (!payment?.orderCode) {
      return undefined;
    }

    const syncPayment = async () => {
      let currentPayment = getCurrentPayment();
      try {
        currentPayment = await fetchPaymentByOrderCode(payment.orderCode);
      } catch (error) {
        console.error('Failed to sync payment status:', error);
      }

      if (!mountedRef.current || !currentPayment) {
        return;
      }

      setPayment(currentPayment);

      if (isPaidPaymentStatus(currentPayment.status)) {
        navigate('/payment/success');
        return;
      }

      if ([PAYMENT_STATUS.FAILED, PAYMENT_STATUS.CANCELLED, PAYMENT_STATUS.EXPIRED].includes(currentPayment.status)) {
        navigate('/payment/failed');
      }
    };

    const intervalId = window.setInterval(syncPayment, 3000);
    return () => window.clearInterval(intervalId);
  }, [navigate, payment?.orderCode]);

  useEffect(() => {
    if (!payment?.expiredAt || payment.status !== PAYMENT_STATUS.PENDING) {
      return undefined;
    }

    const tick = async () => {
      const nextCountdown = formatCountdown(payment.expiredAt);
      setCountdown(nextCountdown);

      if (nextCountdown === '00:00' && !expiredToastRef.current) {
        expiredToastRef.current = true;
        const expiredPayment = await expirePayment(payment.orderCode);
        setPayment(expiredPayment);
        toast.error(t('payment.toasts.expired'));
        navigate('/payment/failed');
      }
    };

    const tickInterval = () => {
      tick();
    };

    tick();
    const intervalId = window.setInterval(tickInterval, 1000);
    return () => window.clearInterval(intervalId);
  }, [navigate, payment?.expiredAt, payment?.orderCode, payment?.status, t]);

  const handleConfirmPaid = async () => {
    if (!payment?.orderCode) {
      return;
    }

    setConfirming(true);
    try {
      const paidPayment = await markPaymentPaid(payment.orderCode);
      setPayment(paidPayment);
      toast.success(t('payment.toasts.confirmed'));
      navigate('/payment/success');
    } catch (error) {
      toast.error(error.message || t('payment.toasts.init_error'));
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!payment?.orderCode) {
      navigate('/payment/failed');
      return;
    }

    try {
      const cancelledPayment = await cancelPayment(payment.orderCode);
      setPayment(cancelledPayment);
      toast.error(t('payment.toasts.cancelled'));
      navigate('/payment/failed');
    } catch (error) {
      toast.error(error.message || t('payment.toasts.init_error'));
    }
  };

  useEffect(() => {
    if (!payment?.status || !finalStatuses.includes(payment.status)) {
      return;
    }

    if (isPaidPaymentStatus(payment.status)) {
      navigate('/payment/success');
    } else {
      navigate('/payment/failed');
    }
  }, [navigate, payment?.status]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="mr-3 h-6 w-6 animate-spin text-violet-400" />
        <span className="text-sm font-semibold text-slate-300">{t('payment.loading')}</span>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-8">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <h1 className="mb-3 text-2xl font-bold">{t('payment.error_create')}</h1>
          <button
            type="button"
            onClick={() => navigate('/pricing')}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
          >
            {t('payment.btn_pricing')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white selection:bg-violet-500/30">
      <div className="pointer-events-none absolute left-[-12%] top-[-16%] h-[42vw] w-[42vw] rounded-full bg-violet-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-18%] right-[-12%] h-[42vw] w-[42vw] rounded-full bg-indigo-600/20 blur-[130px]" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-5 flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-slate-900/50 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <button
            type="button"
            onClick={() => navigate('/pricing')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            {t('payment.btn_pricing')}
          </button>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[560px]">
            <StepItem index="1" title={t('payment.steps.choose_plan')} active />
            <StepItem index="2" title={t('payment.steps.transfer')} active />
            <StepItem index="3" title={t('payment.steps.activate')} />
          </div>
        </div>

        <MotionHeader
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.35 }}
          className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-300">
              <CreditCard size={14} />
              Sepay Mock Checkout
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">{t('payment.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
              {t('payment.subtitle')}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-left lg:min-w-[220px]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-200">
              <Clock3 size={15} />
              {t('payment.time_remaining')}
            </div>
            <div className="mt-1 font-mono text-3xl font-black text-white">{countdown}</div>
          </div>
        </MotionHeader>

        <MotionSection
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.08, duration: 0.35 }}
          className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5"
        >
          <div className="grid gap-5 xl:grid-cols-[320px_minmax(360px,1fr)_340px] xl:items-stretch">
            <section className="flex flex-col rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-5 text-center">
              <div className="mb-4 flex items-center justify-between gap-3 text-left">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('payment.qr_title')}</p>
                  <h2 className="mt-1 text-xl font-black text-white">{payment.bankName}</h2>
                </div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
                  <Smartphone size={20} />
                </div>
              </div>

              <div className="flex flex-1 items-center justify-center">
                <MockQRCode orderCode={payment.orderCode} />
              </div>

              <p className="mt-5 text-sm font-semibold text-slate-300">{t('payment.qr_scan_instruction')}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{t('payment.qr_demo_note')}</p>
            </section>

            <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/35 p-5">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('payment.info_title')}</p>
                  <h2 className="mt-1 text-2xl font-black text-white">{t('payment.info_bank_transfer')}</h2>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  {t('payment.info_pending')}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <Landmark size={15} />
                    {t('payment.bank_label')}
                  </div>
                  <p className="font-semibold text-white">{payment.bankName}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <ReceiptText size={15} />
                    {t('payment.account_name_label')}
                  </div>
                  <p className="font-semibold text-white">{payment.accountName}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <CopyRow label="Số tài khoản" value={payment.accountNumber} translationKey="payment.account_number_label" />
                <CopyRow label="Số tiền" value={formatCurrency(payment.amount)} copyValue={payment.amount} translationKey="payment.amount_label" />
                <CopyRow label="Nội dung chuyển khoản" value={payment.transferContent} translationKey="payment.content_label" />
              </div>

              <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-200">
                  <AlertTriangle size={18} />
                  {t('payment.note_title')}
                </div>
                <p className="text-sm leading-relaxed text-amber-50/85">
                  {t('payment.note_desc')}
                </p>
              </div>
            </section>

            <aside className="flex flex-col rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('payment.order_title')}</p>
                  <h2 className="mt-1 text-xl font-black leading-tight text-white">{payment.planName}</h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
                  <Zap size={22} />
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-violet-400/20 bg-violet-400/10 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-violet-300">{t('payment.amount_due')}</p>
                <p className="mt-2 text-4xl font-black tracking-tight text-white">{formatCurrency(payment.amount)}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {(payment.cycle === 'Hàng tháng' || payment.cycle === 'tháng' || payment.cycle === 'month' || payment.cycle === 'Monthly') ? t('payment.cycle_monthly') : payment.cycle} {t('payment.via')} {payment.provider}
                </p>
              </div>

              <div className="mt-4">
                <InfoRow label={t('payment.order_code')} value={payment.orderCode} />
                <InfoRow label={t('payment.status')} value={<StatusBadge status={payment.status} />} />
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                  <Banknote size={15} />
                  {t('payment.mock_confirm_title')}
                </div>
                <p className="text-sm leading-relaxed text-slate-400">
                  {t('payment.mock_confirm_desc')}
                </p>
              </div>

              <div className="mt-auto grid gap-3 pt-5">
                <button
                  type="button"
                  onClick={handleConfirmPaid}
                  disabled={confirming}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-70"
                >
                  {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={18} />}
                  {t('payment.btn_paid')}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200 active:scale-[0.98]"
                >
                  <XCircle size={18} />
                  {t('payment.btn_cancel')}
                </button>
              </div>
            </aside>
          </div>
        </MotionSection>
      </main>
    </div>
  );
}
