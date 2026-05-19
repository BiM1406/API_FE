import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, ArrowUpRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRevenue } from '../../services/adminService';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(Number(amount || 0)) + 'đ';
const formatDate = (value) => value ? new Intl.DateTimeFormat('vi-VN').format(new Date(value)) : '--';

export default function RevenueManagement() {
  const [revenue, setRevenue] = useState({ total: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    getRevenue()
      .then((data) => {
        if (mounted) {
          setRevenue(data);
          setError('');
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Không thể tải doanh thu');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleExportCSV = () => {
    if (!revenue.transactions || revenue.transactions.length === 0) {
      toast.error('Không có dữ liệu giao dịch để xuất!');
      return;
    }
    const headers = ['Mã GD', 'Khách hàng', 'Gói dịch vụ', 'Số tiền', 'Ngày giao dịch', 'Trạng thái'];
    const rows = revenue.transactions.map(t => [
      t.orderCode || t.id,
      t.accountName || 'API_FE Customer',
      t.planName || 'Gói dịch vụ',
      t.amount,
      t.paidAt || t.createdAt,
      t.status
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bao-cao-doanh-thu.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã xuất báo cáo doanh thu thành công!');
  };

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Doanh thu</h1>
          <p className="text-slate-400">Theo dõi dòng tiền và lịch sử giao dịch</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Xuất báo cáo
        </button>
      </motion.div>

      {loading && (
        <div className="rounded-2xl border border-white/5 bg-slate-900 p-8 text-center text-slate-400">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-violet-400" />
          Đang tải doanh thu...
        </div>
      )}

      {!loading && error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">{error}</div>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-white/80 text-sm font-medium">Doanh thu đã thanh toán</p>
                <h2 className="text-3xl font-bold mt-2">{formatCurrency(revenue.total)}</h2>
                <div className="flex items-center gap-1 mt-4 text-emerald-300 text-sm font-medium">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{revenue.transactions.length} giao dịch mock</span>
                </div>
              </div>
              <CreditCard className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-white/10 rotate-12" />
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
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
                  {revenue.transactions.map((trx) => (
                    <tr key={trx.orderCode || trx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{trx.orderCode || trx.id}</td>
                      <td className="px-6 py-4">{trx.accountName || 'API_FE Customer'}</td>
                      <td className="px-6 py-4">{trx.planName || 'Gói dịch vụ'}</td>
                      <td className="px-6 py-4 font-semibold text-emerald-400">{formatCurrency(trx.amount)}</td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(trx.paidAt || trx.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${trx.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {trx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {revenue.transactions.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-slate-500">Chưa có giao dịch thanh toán</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
