import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, CreditCard, RotateCcw, XCircle } from 'lucide-react';
import { PAYMENT_STATUS } from './paymentConstants';
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

const getStatusMessage = (status) => {
  const messages = {
    [PAYMENT_STATUS.CANCELLED]: 'Giao dịch đã bị hủy.',
    [PAYMENT_STATUS.EXPIRED]: 'Giao dịch đã hết hạn.',
    [PAYMENT_STATUS.FAILED]: 'Giao dịch thất bại.',
    [PAYMENT_STATUS.PENDING]: 'Giao dịch vẫn đang chờ thanh toán.'
  };
  return messages[status] || 'Không thể hoàn tất giao dịch thanh toán.';
};

export default function PaymentFailed() {
  const navigate = useNavigate();
  const [payment] = useState(() => getCurrentPayment());
  const statusMessage = useMemo(() => getStatusMessage(payment?.status), [payment?.status]);

  useEffect(() => {
    if (payment?.status === PAYMENT_STATUS.PAID) navigate('/payment/success');
  }, [navigate, payment]);

  const handleRetry = () => {
    clearCurrentPayment();
    navigate('/payment');
  };

  const handleBackToPlans = () => {
    clearCurrentPayment();
    navigate('/profile/edit?tab=subscription');
  };

  const handleBackToPricing = () => {
    clearCurrentPayment();
    navigate('/pricing');
  };

  if (!payment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
        <div className="max-w-md rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-2xl">
          <CreditCard className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <h1 className="text-2xl font-black">Không tìm thấy giao dịch</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">Giao dịch có thể đã bị xóa hoặc chưa được tạo.</p>
          <button type="button" onClick={handleBackToPlans} className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200">
            Quay lại hồ sơ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 px-6 py-10 text-white selection:bg-red-500/30">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40vw] w-[40vw] rounded-full bg-red-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40vw] w-[40vw] rounded-full bg-violet-600/20 blur-[120px]" />

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-3xl items-center">
        <MotionDiv initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.35 }} className="w-full rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-8">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-red-400/10 text-red-300 ring-1 ring-red-400/30">
              {payment.status === PAYMENT_STATUS.PENDING ? <AlertTriangle size={44} /> : <XCircle size={44} />}
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">Thanh toán chưa hoàn tất</h1>
            <p className="mt-3 text-slate-400">{statusMessage}</p>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5">
            <DetailRow label="Mã đơn hàng" value={payment.orderCode} />
            <DetailRow label="Tên gói" value={payment.planName} />
            <DetailRow label="Số tiền" value={formatCurrency(payment.amount)} />
            <DetailRow label="Nhà cung cấp" value={payment.provider} />
            <DetailRow label="Trạng thái" value={payment.status} />
            <DetailRow label="Thời gian tạo" value={formatDateTime(payment.createdAt)} />
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={handleRetry} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98]">
              <RotateCcw size={18} />
              Thử lại thanh toán
            </button>
            <button type="button" onClick={handleBackToPlans} className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-5 py-3 text-sm font-bold text-violet-100 transition hover:bg-violet-500/20 active:scale-[0.98]">
              Quay lại hồ sơ
            </button>
            <button type="button" onClick={handleBackToPricing} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10 active:scale-[0.98]">
              <ArrowLeft size={18} />
              Quay lại bảng giá
            </button>
          </div>
        </MotionDiv>
      </main>
    </div>
  );
}
