import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Bot, Zap, Crown } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { isAuthenticated, getCurrentUser } from '../../services/authService';


const plans = [
  {
    name: 'Miễn Phí',
    price: '0',
    description: 'Xem AI có thể làm gì cho bạn',
    planKey: 'free',

    features: [
      '50 request / ngày',
      '1 dự án Workspace duy nhất',
      'Mã nguồn AI tự sinh (Cơ bản)',
      'Hỗ trợ qua cộng đồng',
      'Tốc độ sinh code tiêu chuẩn',
      'Lưu giữ lịch sử 7 ngày'
    ],
    icon: Bot
  },
  {
    name: 'Pro',
    price: '199.000',
    description: 'Tiếp tục trò chuyện với quyền truy cập mở rộng',
    buttonText: 'Nâng cấp lên Pro',
    isPopular: true,
    planKey: 'pro',
    paymentPlanKey: 'pro',
    features: [
      '200 request / ngày',
      '10 dự án Workspace đồng thời',
      'Truy cập mô hình AI nâng cao',
      'Quyền truy cập API (Giới hạn)',
      'Ưu tiên hỗ trợ kỹ thuật',
      'Tốc độ sinh code nhanh gấp 2 lần',
      'Lưu giữ lịch sử không giới hạn'
    ],
    icon: Zap
  },
  {
    name: 'Ultra',
    price: '999.999',
    description: 'Vượt xa mọi sức tưởng tượng của bạn về nhân sinh',
    buttonText: 'Nâng cấp lên Ultra',
    planKey: 'ultra',
    paymentPlanKey: 'ultra',
    features: [
      '1000 request / ngày',
      'Quyền sở hữu mã nguồn AI tạo ra 100%',
      'Hỗ trợ trực tiếp từ Đội kỹ thuật (DMP)',
      'Quyền truy cập API Unlimited',
      'Mô hình Frontier Pro (Vượt mọi tưởng tượng)',
      'Ưu tiên tốc độ sinh code & tạo ảnh nhanh nhất',
      'Không giới hạn dự án và không có Watermark'
    ],
    icon: Crown
  }
];

export default function PricingPage() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const user = getCurrentUser();
  const userPlan = user?.plan?.toLowerCase() || 'free';

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-violet-500/30">
      <Header />

      <main className="pt-32 pb-20">
        <section className="max-w-7xl mx-auto px-6">
          {/* Header Title */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Lựa chọn gói dịch vụ phù hợp</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Tối ưu hóa quy trình xây dựng Backend của bạn với sức mạnh AI không giới hạn.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const isCurrentPlan = loggedIn && userPlan === plan.planKey;
              
              let btnText = plan.buttonText;
              let isButtonDisabled = false;
              let btnStyle = 'bg-white text-black hover:bg-gray-200';

              if (plan.planKey === 'free') {
                if (loggedIn) {
                  btnText = isCurrentPlan ? 'Gói hiện tại của bạn' : 'Gói hiện tại của bạn'; // Assuming we only upgrade, not downgrade yet
                  isButtonDisabled = isCurrentPlan;
                  btnStyle = isCurrentPlan ? 'bg-white/5 border border-white/10 text-gray-400 cursor-default' : 'bg-white text-black hover:bg-gray-200';
                } else {
                  btnText = 'Bắt đầu miễn phí';
                  btnStyle = 'bg-white text-black hover:bg-gray-200';
                }
              } else {
                if (isCurrentPlan) {
                  btnText = 'Gói hiện tại của bạn';
                  isButtonDisabled = true;
                  btnStyle = 'bg-white/5 border border-white/10 text-gray-400 cursor-default';
                } else if (plan.isPopular) {
                  btnStyle = 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 shadow-lg shadow-violet-500/20';
                }
              }

              return (
              <div
                key={plan.name}
                className={`relative p-8 rounded-[2rem] border transition-all flex flex-col ${
                  plan.isPopular 
                    ? 'bg-slate-900 border-violet-500/50 shadow-2xl shadow-violet-900/20 ring-1 ring-violet-500/50' 
                    : 'bg-slate-900/40 border-white/10 hover:border-white/20'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest leading-none">Phổ biến</span>
                  </div>
                )}

                <div className="min-h-[220px] flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-lg ${
                      plan.isPopular ? 'from-violet-500 to-indigo-600 shadow-violet-500/20' : 'from-slate-700 to-slate-800'
                    }`}>
                      <plan.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-extrabold tracking-tight text-white leading-none">{plan.name}</h3>
                  </div>

                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-3xl font-bold">
                      {plan.price}đ
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      VND / tháng (bao gồm VAT)
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      if (isButtonDisabled) return;
                      
                      if (!loggedIn) {
                        navigate('/auth?mode=register');
                        return;
                      }
                      
                      if (plan.paymentPlanKey) {
                        navigate(`/payment?plan=${plan.paymentPlanKey}`);
                      }
                    }}
                    className={`w-full py-3 rounded-full text-sm font-bold transition-all mb-8 ${btnStyle}`}
                  >
                    {btnText}
                  </button>

                  <div className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${
                          plan.isPopular ? 'text-violet-400' : 'text-gray-500'
                        }`} />
                        <span className="text-[13px] leading-tight text-gray-400">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )})}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
