import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, Download, ArrowUpRight } from 'lucide-react';

export default function RevenueManagement() {
  const transactions = [
    { id: 'TRX-001', user: 'Nguyễn Văn A', plan: 'Gói Pro', amount: '199,999đ', date: '20/04/2026', status: 'Thành công' },
    { id: 'TRX-002', user: 'Lê Văn C', plan: 'Gói Ultra', amount: '999,999đ', date: '19/04/2026', status: 'Thành công' },
    { id: 'TRX-003', user: 'Trần Thị B', plan: 'Gói Pro', amount: '199,999đ', date: '18/04/2026', status: 'Đang xử lý' },
  ];

  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Doanh thu</h1>
          <p className="text-slate-400">Theo dõi dòng tiền và lịch sử giao dịch</p>
        </div>
        <button className="px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-all flex items-center gap-2">
          <Download className="w-4 h-4" />
          Xuất báo cáo
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium">Doanh thu tháng này</p>
            <h2 className="text-3xl font-bold mt-2">1,399,997</h2>
            <div className="flex items-center gap-1 mt-4 text-emerald-300 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" />
              <span>+36.18% so với tháng trước</span>
            </div>
          </div>
          <CreditCard className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-white/10 rotate-12" />
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-white">Giao dịch gần đây</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th className="px-6 py-4">Mã GD</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Gói dịch vụ</th>
                <th className="px-6 py-4">Số tiền</th>
                <th className="px-6 py-4">Ngày giao dịch</th>
                <th className="px-6 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((trx, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{trx.id}</td>
                  <td className="px-6 py-4">{trx.user}</td>
                  <td className="px-6 py-4">{trx.plan}</td>
                  <td className="px-6 py-4 font-semibold text-emerald-400">{trx.amount}</td>
                  <td className="px-6 py-4 text-slate-400">{trx.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${trx.status === 'Thành công' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
