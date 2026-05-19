import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, Clock3, Copy, CreditCard, Landmark, Loader2, ReceiptText, Smartphone, XCircle, Zap } from 'lucide-react';
import { PAYMENT_STATUS } from './paymentConstants';
import { cancelPayment, createOrGetCurrentPayment, expirePayment, getCurrentPayment, getPlanForPayment, markPaymentPaid } from './paymentService';
import { copyToClipboard, formatCountdown, formatCurrency } from './paymentUtils';

const MotionHeader = motion.header;
const MotionSection = motion.section;

function CopyRow({ label, value, copyValue }) {
  const handleCopy = async () => {
    const copied = await copyToClipboard(copyValue ?? value);
    toast[copied ? 'success' : 'error'](copied ? `Đã sao chép ${label.toLowerCase()}` : 'Không thể sao chép');
  };

  return (
    <div className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-violet-400/40 hover:bg-slate-950/80">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
        <p className="mt-1 break-all font-mono text-sm font-semibold text-white">{value}</p>
      </div>
      <button type="button" onClick={handleCopy} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition group-hover:border-violet-400/50 group-hover:text-white active:scale-95">
        <Copy size={16} />
      </button>
    </div>
  );
}

function MockQRCode({ orderCode }) {
  const source = orderCode || 'API_FE_PAYMENT';
  const cells = Array.from({ length: 121 }, (_, index) => {
    const charCode = source.charCodeAt(index % source.length);
    const isAnchor = (index < 33 && index % 11 < 3) || (index % 11 > 7 && index < 33) || (index > 87 && index % 11 < 3);
    return isAnchor || ((charCode + index * 7) % 5 < 2);
  });

  return (
    <div className="mx-auto w-full max-w-[260px] rounded-[2rem] border border-white/10 bg-white p-5 shadow-2xl shadow-violet-950/30">
      <div className="grid aspect-square grid-cols-11 gap-1 rounded-2xl bg-white">
        {cells.map((active, index) => (
          <div key={index} className={`rounded-[3px] ${active ? 'bg-slate-950' : 'bg-slate-100'}`} />
        ))}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const mountedRef = useRef(false);
  const expiredToastRef = useRef(false);
  const [payment, setPayment] = useState(null);
  const [countdown, setCountdown] = useState('00:00');
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    try {
      const selectedPlan = getPlanForPayment();
      if (!selectedPlan) {
        toast.error('Vui lòng chọn gói dịch vụ trước');
        navigate('/profile/edit?tab=subscription');
        return;
      }

      const nextPayment = createOrGetCurrentPayment(selectedPlan);
      setPayment(nextPayment);
      setCountdown(formatCountdown(nextPayment.expiredAt));
    } catch (error) {
      toast.error(error.message || 'Không thể khởi tạo thanh toán');
      navigate('/profile/edit?tab=subscription');
    } finally {
      if (mountedRef.current) setLoading(false);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!payment?.orderCode) return undefined;

    const intervalId = window.setInterval(() => {
      const currentPayment = getCurrentPayment();
      if (!mountedRef.current || !currentPayment) return;
      setPayment(currentPayment);
      if (currentPayment.status === PAYMENT_STATUS.PAID) navigate('/payment/success');
      if ([PAYMENT_STATUS.FAILED, PAYMENT_STATUS.CANCELLED, PAYMENT_STATUS.EXPIRED].includes(currentPayment.status)) navigate('/payment/failed');
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [navigate, payment?.orderCode]);

  useEffect(() => {
    if (!payment?.expiredAt || payment.status !== PAYMENT_STATUS.PENDING) return undefined;

    const tick = () => {
      const nextCountdown = formatCountdown(payment.expiredAt);
      setCountdown(nextCountdown);
      if (nextCountdown === '00:00' && !expiredToastRef.current) {
        expiredToastRef.current = true;
        const expiredPayment = expirePayment(payment.orderCode);
        setPayment(expiredPayment);
        toast.error('Giao dịch đã hết hạn');
        navigate('/payment/failed');
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [navigate, payment?.expiredAt, payment?.orderCode, payment?.status]);

  const handleConfirmPaid = () => {
    if (!payment?.orderCode) return;
    setConfirming(true);
    const paidPayment = markPaymentPaid(payment.orderCode);
    setPayment(paidPayment);
    toast.success('Thanh toán đã được xác nhận');
    navigate('/payment/success');
  };

  const handleCancel = () => {
    if (!payment?.orderCode) {
      navigate('/payment/failed');
      return;
    }

    const cancelledPayment = cancelPayment(payment.orderCode);
    setPayment(cancelledPayment);
    toast.error('Đã hủy thanh toán');
    navigate('/payment/failed');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="mr-3 h-6 w-6 animate-spin text-violet-400" />
        <span className="text-sm font-semibold text-slate-300">Đang khởi tạo thanh toán...</span>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-8">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <h1 className="mb-3 text-2xl font-bold">Không thể tạo thanh toán</h1>
          <button type="button" onClick={() => navigate('/profile/edit?tab=subscription')} className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-slate-200">
            Quay lại hồ sơ
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
          <button type="button" onClick={() => navigate('/profile/edit?tab=subscription')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white">
            <ArrowLeft size={18} />
            Quay lại hồ sơ
          </button>
          <div className="text-sm font-semibold text-slate-400">Sepay Mock Checkout</div>
        </div>

        <MotionHeader initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-300">
              <CreditCard size={14} />
              Thanh toán
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">Thanh toán chuyển khoản</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
              Quét QR, kiểm tra thông tin chuyển khoản, sau đó xác nhận thanh toán mock.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-left lg:min-w-[220px]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-200">
              <Clock3 size={15} />
              Thời gian còn lại
            </div>
            <div className="mt-1 font-mono text-3xl font-black text-white">{countdown}</div>
          </div>
        </MotionHeader>

        <MotionSection initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.35 }} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5">
          <div className="grid gap-5 xl:grid-cols-[320px_minmax(360px,1fr)_340px] xl:items-stretch">
            <section className="flex flex-col rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-5 text-center">
              <div className="mb-4 flex items-center justify-between gap-3 text-left">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">QR thanh toán</p>
                  <h2 className="mt-1 text-xl font-black text-white">{payment.bankName}</h2>
                </div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
                  <Smartphone size={20} />
                </div>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <MockQRCode orderCode={payment.orderCode} />
              </div>
              <p className="mt-5 text-sm font-semibold text-slate-300">Quét bằng ứng dụng ngân hàng</p>
            </section>

            <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/35 p-5">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Thông tin chuyển khoản</p>
                <h2 className="mt-1 text-2xl font-black text-white">Chuyển khoản ngân hàng</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <Landmark size={15} /> Ngân hàng
                  </div>
                  <p className="font-semibold text-white">{payment.bankName}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <ReceiptText size={15} /> Chủ tài khoản
                  </div>
                  <p className="font-semibold text-white">{payment.accountName}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                <CopyRow label="Số tài khoản" value={payment.accountNumber} />
                <CopyRow label="Số tiền" value={formatCurrency(payment.amount)} copyValue={payment.amount} />
                <CopyRow label="Nội dung chuyển khoản" value={payment.transferContent} />
              </div>
            </section>

            <aside className="flex flex-col rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Đơn hàng</p>
                  <h2 className="mt-1 text-xl font-black leading-tight text-white">{payment.planName}</h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
                  <Zap size={22} />
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-violet-400/20 bg-violet-400/10 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-violet-300">Cần thanh toán</p>
                <p className="mt-2 text-4xl font-black tracking-tight text-white">{formatCurrency(payment.amount)}</p>
                <p className="mt-2 text-sm text-slate-400">{payment.cycle} qua {payment.provider}</p>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-white/5 py-3">
                  <span className="text-slate-400">Mã đơn hàng</span>
                  <span className="text-right font-semibold text-white">{payment.orderCode}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-white/5 py-3">
                  <span className="text-slate-400">Trạng thái</span>
                  <span className="font-semibold text-amber-300">{payment.status}</span>
                </div>
              </div>
              <div className="mt-auto grid gap-3 pt-5">
                <button type="button" onClick={handleConfirmPaid} disabled={confirming} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-70">
                  {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={18} />}
                  Tôi đã thanh toán
                </button>
                <button type="button" onClick={handleCancel} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200 active:scale-[0.98]">
                  <XCircle size={18} />
                  Hủy thanh toán
                </button>
              </div>
            </aside>
          </div>
        </MotionSection>
      </main>
    </div>
  );
}
