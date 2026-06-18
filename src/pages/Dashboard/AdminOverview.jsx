import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, Activity, Server, FolderKanban, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getOverviewStats, calculateOverviewStats } from '../../services/adminService';
import { formatCurrency, mapRecentTransactions } from './adminOverview.helpers';

export default function AdminOverview() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(() => {
    try {
      return calculateOverviewStats();
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getOverviewStats()
      .then((data) => { if (mounted) { setStats(data); setError(''); } })
      .catch((err) => { if (mounted) setError(err.message || t('admin.error_loading')); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [t]);

  const cards = stats ? (() => {
    const serverLoadValue = stats.serverLoad !== null && stats.serverLoad !== undefined
      ? `${stats.serverLoad}%`
      : '--';

    const revenueSubtitle = stats.revenueSource === 'transactions'
      ? t('admin.recent_tx_count', { count: stats.paidCount })
      : stats.revenueSource === 'subscriptions'
      ? t('admin.estimated_desc')
      : null;

    return [
      { label: t('admin.card_users'), value: stats.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
      { label: t('admin.card_projects'), value: stats.totalProjects || 0, icon: FolderKanban, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
      { label: t('admin.card_revenue'), value: formatCurrency(stats.revenue), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10', isEstimated: stats.isRevenueEstimated, subtitle: revenueSubtitle },
      { label: t('admin.card_server'), value: serverLoadValue, icon: Server, color: 'text-rose-400', bg: 'bg-rose-400/10', subtitle: stats.serverLoad === null ? t('admin.no_data') : null }
    ];
  })() : [];

  return (
    <div className="p-4 sm:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('admin.overview_title')}</h1>
        <p className="text-slate-400">{t('admin.overview_desc')}</p>
      </motion.div>

      {loading && (
        <div className="rounded-2xl border border-white/5 bg-slate-900 p-8 text-center text-slate-400">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-violet-400" />
          {t('admin.loading')}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-slate-900 border border-white/5 flex items-center gap-4"
              >
                <div className={`p-4 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                    {stat.isEstimated && (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-md font-medium select-none" title="Doanh thu ước tính dựa trên các gói cước đang hoạt động">
                        {t('admin.estimated') || 'Ước tính'}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{stat.subtitle}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-2xl bg-slate-900 border border-white/5 min-h-[260px]">
              <div className="mb-5 flex items-center gap-2 text-white font-semibold">
                <Activity className="h-5 w-5 text-violet-400" />
                {t('admin.activity_title')}
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm">
                  <span className="text-slate-400">{t('admin.api_calls')}</span>
                  <span className="font-bold text-white">{stats.apiCalls !== null ? stats.apiCalls : '--'}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm">
                  <span className="text-slate-400">{t('admin.ai_usage') || 'Hội thoại AI'}</span>
                  <span className="font-bold text-white">{stats.aiUsage !== null ? stats.aiUsage : '--'}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm">
                  <span className="text-slate-400">{t('admin.recent_transactions')}</span>
                  <span className="font-bold text-white">{stats.recentTransactions?.length || 0}</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-2xl bg-slate-900 border border-white/5 min-h-[260px]">
              <h3 className="mb-5 font-semibold text-white">{t('admin.recent_tx_title')}</h3>
              {stats.recentTransactions?.length ? (
                <div className="space-y-3">
                  {mapRecentTransactions(stats.recentTransactions).map((item) => (
                    <div key={item.orderCode || item.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm">
                      <div>
                        <p className="font-semibold text-white">{item.planName || t('admin.payment_label')}</p>
                        <p className="text-xs text-slate-500">{item.orderCode}</p>
                      </div>
                      <span className="font-bold text-emerald-400">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-sm text-slate-500">{t('admin.no_transactions')}</div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
