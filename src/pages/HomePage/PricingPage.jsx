import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, Bot, Zap, Crown } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { getSubscription, PLANS, saveSelectedPlan } from '../../services/profileService';
import { isAuthenticated } from '../../services/authService';

const planMeta = {
  free: {
    icon: Bot,
    features: [
      '100 request / ngày',
      '1 dự án Workspace',
      'Sinh code AI cơ bản',
      'Hỗ trợ qua cộng đồng',
      'Tốc độ sinh code tiêu chuẩn',
      'Lưu lịch sử 7 ngày'
    ]
  },
  pro: {
    icon: Zap,
    features: [
      '5.000 request / ngày',
      '10 dự án Workspace',
      'Truy cập mô hình AI nâng cao',
      'Quyền truy cập API có giới hạn',
      'Ưu tiên hỗ trợ kỹ thuật',
      'Lưu lịch sử không giới hạn'
    ]
  },
  ultra: {
    icon: Crown,
    features: [
      'Không giới hạn request theo ngày',
      'Không giới hạn dự án Workspace',
      'Quyền truy cập API unlimited',
      'Hỗ trợ trực tiếp từ đội kỹ thuật',
      'Ưu tiên tốc độ sinh code và phản hồi AI',
      'Đầy đủ tính năng API_FE'
    ]
  }
};

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

export default function PricingPage() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!loggedIn) return undefined;

    getSubscription().then((current) => {
      if (mounted) setSubscription(current);
    });

    return () => {
      mounted = false;
    };
  }, [loggedIn]);

  const cards = useMemo(() => PLANS.map((plan) => ({
    ...plan,
    icon: planMeta[plan.planId]?.icon || Bot,
    features: planMeta[plan.planId]?.features || []
  })), []);

  const handleSelectPlan = (plan) => {
    if (!loggedIn) {
      navigate(plan.planId === 'free' ? '/auth?mode=register' : '/auth');
      return;
    }

    if (plan.planId === 'free') {
      if (subscription?.planId === 'free') {
        toast('Bạn đang sử dụng gói Miễn Phí');
      } else {
        toast('Chức năng hạ cấp gói sẽ được xử lý sau');
      }
      return;
    }

    saveSelectedPlan({
      planId: plan.planId,
      planName: plan.planName,
      price: plan.price,
      cycle: plan.cycle
    });
    navigate('/payment');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-violet-500/30">
      <Header />

      <main className="pt-32 pb-20">
        <section className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Lựa chọn gói dịch vụ phù hợp</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Tối ưu hóa workflow API, AI Workspace và kiểm thử backend/frontend bằng một nền tảng thống nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map((plan) => {
              const Icon = plan.icon;
              const isCurrent = loggedIn && subscription?.planId === plan.planId;
              const isPopular = plan.planId === 'pro';

              return (
                <div
                  key={plan.planId}
                  className={`relative p-8 rounded-[2rem] border transition-all flex flex-col ${
                    isCurrent
                      ? 'bg-slate-900 border-violet-400 shadow-2xl shadow-violet-900/25 ring-1 ring-violet-400/60'
                      : isPopular
                      ? 'bg-slate-900 border-violet-500/50 shadow-2xl shadow-violet-900/20 ring-1 ring-violet-500/50'
                      : 'bg-slate-900/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  {(plan.badge || isCurrent) && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full">
                      <span className="text-[10px] font-bold text-violet-300 uppercase tracking-widest leading-none">
                        {isCurrent ? 'Gói hiện tại' : plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="min-h-[220px] flex flex-col">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-lg ${
                        isPopular ? 'from-violet-500 to-indigo-600 shadow-violet-500/20' : 'from-slate-700 to-slate-800'
                      }`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-extrabold tracking-tight text-white leading-none">{plan.planName}</h3>
                    </div>

                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                      <span className="text-xs text-gray-500 font-medium">
                        VND / {plan.cycle}
                        <br />
                        (bao gồm VAT)
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-gray-400 leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-3 rounded-full text-sm font-bold transition-all mb-8 ${
                        isCurrent
                          ? 'bg-white/5 border border-violet-400/40 text-violet-200'
                          : isPopular
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 shadow-lg shadow-violet-500/20'
                          : 'bg-white text-black hover:bg-gray-200'
                      }`}
                    >
                      {isCurrent ? 'Gói hiện tại của bạn' : plan.planId === 'free' ? 'Bắt đầu miễn phí' : `Thanh toán ${plan.planName}`}
                    </button>

                    <div className="space-y-4">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isPopular ? 'text-violet-400' : 'text-gray-500'}`} />
                          <span className="text-[13px] leading-tight text-gray-400">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
