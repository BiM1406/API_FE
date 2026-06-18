import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Bot, Zap, Crown, ArrowLeft, ArrowDownCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Footer from './Footer';
import { isAuthenticated, getCurrentUser } from '../../services/authService';
import { updateSubscription } from '../../services/profileService';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const user = getCurrentUser();
  
  const [activePlan, setActivePlan] = useState(() => user?.plan?.toLowerCase() || 'free');
  const [downgradeTarget, setDowngradeTarget] = useState(null);

  const handleConfirmDowngrade = async () => {
    if (!downgradeTarget) return;
    try {
      const price = downgradeTarget.planKey === 'free' ? 0 : 199999;
      await updateSubscription({
        planId: downgradeTarget.planKey,
        planName: downgradeTarget.name,
        price: price,
        status: 'ACTIVE'
      });
      setActivePlan(downgradeTarget.planKey);
    } catch {
      toast.error(t('pricing.downgrade_error'));
    } finally {
      setDowngradeTarget(null);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '0',
      description: t('pricing.free.desc'),
      planKey: 'free',
      features: [
        t('pricing.free.feat1'),
        t('pricing.free.feat2'),
        t('pricing.free.feat3'),
        t('pricing.free.feat4'),
        t('pricing.free.feat5'),
        t('pricing.free.feat6')
      ],
      icon: Bot
    },
    {
      name: 'Pro',
      price: '199.000',
      description: t('pricing.pro.desc'),
      buttonText: t('pricing.pro.btn'),
      isPopular: true,
      planKey: 'pro',
      paymentPlanKey: 'pro',
      features: [
        t('pricing.pro.feat1'),
        t('pricing.pro.feat2'),
        t('pricing.pro.feat3'),
        t('pricing.pro.feat4'),
        t('pricing.pro.feat5'),
        t('pricing.pro.feat6'),
        t('pricing.pro.feat7')
      ],
      icon: Zap
    },
    {
      name: 'Ultra',
      price: '999.999',
      description: t('pricing.ultra.desc'),
      buttonText: t('pricing.ultra.btn'),
      planKey: 'ultra',
      paymentPlanKey: 'ultra',
      features: [
        t('pricing.ultra.feat1'),
        t('pricing.ultra.feat2'),
        t('pricing.ultra.feat3'),
        t('pricing.ultra.feat4'),
        t('pricing.ultra.feat5'),
        t('pricing.ultra.feat6'),
        t('pricing.ultra.feat7')
      ],
      icon: Crown
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-violet-500/30 relative">
      {!loggedIn && <Header />}

      <main className={`${loggedIn ? 'pt-12 pb-12' : 'pt-32 pb-20'}`}>
        <section className="max-w-6xl mx-auto px-6 relative">
          
          {/* Back Button for logged in users */}
          {loggedIn && (
            <button 
              onClick={() => navigate(-1)} 
              className="absolute left-6 top-0 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all z-20 border border-white/5 active:scale-95"
              title={t('settings.back') || 'Quay lại'}
            >
              <ArrowLeft size={16} />
            </button>
          )}

          {/* Header Title */}
          <div className={`text-center ${loggedIn ? 'mb-10 pt-0' : 'mb-16 pt-2'}`}>
            <h1 className={`font-bold ${loggedIn ? 'text-3xl mb-3' : 'text-4xl md:text-5xl mb-6'}`}>{t('pricing.title')}</h1>
            <p className={`text-gray-400 mx-auto ${loggedIn ? 'text-sm max-w-xl' : 'text-sm md:text-base max-w-2xl'}`}>
              {t('pricing.subtitle')}
            </p>
          </div>
          {/* Pricing Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-3 ${loggedIn ? 'gap-6' : 'gap-8'}`}>
            {plans.map((plan) => {
              const isCurrentPlan = loggedIn && activePlan === plan.planKey;
              
              let btnText = plan.buttonText || 'Chọn gói';
              let isButtonDisabled = false;
              let btnStyle = 'bg-white text-black hover:bg-gray-200';
              let btnOnClick = () => {
                if (!loggedIn) {
                  navigate('/auth?mode=register');
                  return;
                }
                if (plan.paymentPlanKey) {
                  navigate(`/payment?plan=${plan.paymentPlanKey}`);
                }
              };

              if (loggedIn) {
                if (isCurrentPlan) {
                  btnText = t('pricing.active_plan_btn');
                  isButtonDisabled = true;
                  btnStyle = 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-default';
                  btnOnClick = null;
                } else {
                  if (plan.planKey === 'free') {
                    btnText = t('pricing.free_plan_btn');
                    btnStyle = 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10';
                    btnOnClick = () => setDowngradeTarget(plan);
                  } else {
                    if (activePlan === 'ultra') {
                      btnText = t('pricing.pro_plan_btn');
                      btnStyle = 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10';
                      btnOnClick = () => setDowngradeTarget(plan);
                    } else {
                      btnText = plan.planKey === 'pro' ? t('pricing.pro.btn') : t('pricing.ultra.btn');
                      if (plan.isPopular) {
                        btnStyle = 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 shadow-lg shadow-violet-500/20';
                      } else if (plan.planKey === 'ultra') {
                        btnStyle = 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-90 shadow-lg shadow-amber-500/20';
                      } else {
                        btnStyle = 'bg-white text-black hover:bg-gray-200';
                      }
                    }
                  }
                }
              } else {
                if (plan.planKey === 'free') {
                  btnText = t('pricing.start_free') || 'Bắt đầu miễn phí';
                }
              }

              return (
              <div
                key={plan.name}
                id={`plan-card-${plan.planKey}`}
                className={`relative border transition-all flex flex-col ${
                  loggedIn ? 'p-6 rounded-3xl' : 'p-8 rounded-[2rem]'
                } ${
                  isCurrentPlan 
                    ? 'bg-slate-900 border-emerald-500/60 shadow-2xl shadow-emerald-950/40 ring-1 ring-emerald-500/50' 
                    : plan.isPopular 
                      ? 'bg-slate-900 border-violet-500/50 shadow-2xl shadow-violet-900/20 ring-1 ring-violet-500/50' 
                      : plan.planKey === 'ultra'
                        ? 'bg-slate-900/50 border-amber-500/30 hover:border-amber-500/50 shadow-2xl shadow-amber-950/10 hover:shadow-amber-950/20'
                        : 'bg-slate-900/40 border-white/10 hover:border-white/20'
                }`}
              >
                {isCurrentPlan ? (
                  <div className="absolute right-4 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center gap-1.5 top-4">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest leading-none">{t('pricing.active_plan_badge')}</span>
                  </div>
                ) : plan.isPopular ? (
                  <div className="absolute right-4 px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full top-4">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest leading-none">{t('pricing.popular')}</span>
                  </div>
                ) : plan.planKey === 'ultra' ? (
                  <div className="absolute right-4 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full top-4">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest leading-none">{t('pricing.most_premium_badge')}</span>
                  </div>
                ) : null}

                <div className={`${loggedIn ? 'min-h-[170px]' : 'min-h-[220px]'} flex flex-col`}>
                  <div className={`flex items-center gap-3.5 ${loggedIn ? 'mb-5' : 'mb-6'}`}>
                    <div className={`rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-lg ${
                      loggedIn ? 'w-9 h-9 rounded-xl' : 'w-10 h-10 rounded-xl'
                    } ${
                      isCurrentPlan 
                        ? 'from-emerald-500 to-teal-600 shadow-emerald-500/20'
                        : plan.isPopular 
                          ? 'from-violet-500 to-indigo-600 shadow-violet-500/20' 
                          : plan.planKey === 'ultra'
                            ? 'from-amber-500 to-orange-600 shadow-amber-500/20'
                            : 'from-slate-700 to-slate-800'
                    }`}>
                      <plan.icon className={loggedIn ? 'w-4.5 h-4.5 text-white' : 'w-5 h-5 text-white'} />
                    </div>
                    <h3 className={`font-extrabold tracking-tight text-white leading-none ${loggedIn ? 'text-xl' : 'text-2xl'}`}>{plan.name}</h3>
                  </div>

                  <div className={`flex items-baseline gap-1 ${loggedIn ? 'mt-3' : 'mt-4'}`}>
                    <span className={`font-bold ${loggedIn ? 'text-3xl' : 'text-3xl'}`}>
                      {plan.price}đ
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {t('pricing.price_unit')}
                    </span>
                  </div>
                  <p className={`text-gray-400 leading-relaxed ${loggedIn ? 'mt-3 text-sm' : 'mt-4 text-sm'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className={loggedIn ? 'mt-5' : 'mt-6'}>
                  <button
                    type="button"
                    onClick={btnOnClick}
                    disabled={isButtonDisabled}
                    className={`w-full font-bold transition-all rounded-full ${
                      loggedIn ? 'py-2.5 mb-5 text-sm' : 'py-3 mb-8 text-sm'
                    } ${btnStyle}`}
                  >
                    {btnText}
                  </button>

                  {isCurrentPlan && loggedIn && (
                    <div className="text-center -mt-3 mb-5">
                      {plan.planKey === 'free' ? (
                        <p className="text-xs text-slate-500">
                          {t('pricing.want_upgrade')}{' '}
                          <button
                            type="button"
                            onClick={() => {
                              const target = document.getElementById('plan-card-pro') || document.getElementById('plan-card-ultra');
                              target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              const pro = document.getElementById('plan-card-pro');
                              pro?.classList.add('ring-2', 'ring-violet-500/50', 'scale-[1.02]');
                              setTimeout(() => pro?.classList.remove('ring-2', 'ring-violet-500/50', 'scale-[1.02]'), 1500);
                            }}
                            className="text-violet-400 hover:text-violet-300 font-semibold hover:underline"
                          >
                            {t('pricing.choose_pro_ultra')}
                          </button>
                        </p>
                      ) : plan.planKey === 'pro' ? (
                        <p className="text-xs text-slate-500">
                          {t('pricing.want_more_features')}{' '}
                          <button
                            type="button"
                            onClick={() => {
                              const target = document.getElementById('plan-card-ultra');
                              target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              target?.classList.add('ring-2', 'ring-amber-500/50', 'scale-[1.02]');
                              setTimeout(() => target?.classList.remove('ring-2', 'ring-amber-500/50', 'scale-[1.02]'), 1500);
                            }}
                            className="text-amber-400 hover:text-amber-300 font-semibold hover:underline"
                          >
                            {t('pricing.upgrade_to_ultra')}
                          </button>
                        </p>
                      ) : null}
                    </div>
                  )}

                  <div className={loggedIn ? 'space-y-3' : 'space-y-4'}>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className={`mt-0.5 shrink-0 ${
                          loggedIn ? 'w-4 h-4' : 'w-4 h-4'
                        } ${
                          isCurrentPlan 
                            ? 'text-emerald-400' 
                            : plan.isPopular 
                              ? 'text-violet-400' 
                              : plan.planKey === 'ultra'
                                ? 'text-amber-400'
                                : 'text-gray-500'
                        }`} />
                        <span className={`leading-tight text-gray-400 ${loggedIn ? 'text-[13px]' : 'text-[13px]'}`}>
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

      {!loggedIn && <Footer />}

      {/* Custom Downgrade Confirmation Modal */}
      {downgradeTarget && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center px-6 bg-black/45 backdrop-blur-[6px] animate-in fade-in duration-200"
          onClick={() => setDowngradeTarget(null)}
        >
          <div
            className="relative w-full max-w-[380px] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(30,30,50,0.95) 0%, rgba(15,15,30,0.98) 100%)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(139,92,246,0.05)'
            }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

            <div className="p-6">
              {/* Icon + title */}
              <div className="flex flex-col items-center text-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-violet-500/15 blur-xl scale-150" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-white/10 flex items-center justify-center text-violet-400">
                    <ArrowDownCircle size={28} />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-lg tracking-tight">{t('pricing.downgrade_modal.title')}</h3>
                  <p className="text-slate-300 text-xs leading-relaxed mt-2.5">
                    {t('pricing.downgrade_modal.desc_from')}<span className="font-extrabold text-violet-400 uppercase">{activePlan}</span>{t('pricing.downgrade_modal.desc_to')}<span className="font-extrabold text-emerald-400 uppercase">{downgradeTarget?.name}</span>{t('pricing.downgrade_modal.desc_end')}
                  </p>
                  <p className="text-slate-500 text-[11px] leading-relaxed mt-2">
                    {t('pricing.downgrade_modal.note')}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDowngradeTarget(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all duration-200 border border-white/8 hover:border-white/15 hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  {t('pricing.downgrade_modal.btn_cancel')}
                </button>
                <button
                  onClick={handleConfirmDowngrade}
                  className="flex-1 py-2.5 text-xs font-bold text-white rounded-xl transition-all duration-200 hover:brightness-110 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 20px rgba(239,68,68,0.35)' }}
                >
                  {t('pricing.downgrade_modal.btn_confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
