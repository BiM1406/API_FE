import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, ArrowUpRight, Loader2, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getRevenue } from '../../services/adminService';
import { readArrayStorage } from '../../utils/storage';

function CustomDatePicker({ value, onChange, placeholder, t }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('days');
  const [yearInput, setYearInput] = useState('');
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  useEffect(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        setCurrentDate(parsed);
      }
    }
  }, [value]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day) => {
    const selected = new Date(year, month, day);
    const yStr = selected.getFullYear();
    const mStr = String(selected.getMonth() + 1).padStart(2, '0');
    const dStr = String(selected.getDate()).padStart(2, '0');
    onChange(`${yStr}-${mStr}-${dStr}`);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
    setView('days');
  };

  const handleHeaderClick = (e) => {
    e.stopPropagation();
    setYearInput(String(year));
    setView(view === 'days' ? 'monthYear' : 'days');
  };

  const handleSelectMonth = (mIdx) => {
    setCurrentDate(new Date(year, mIdx, 1));
    setView('days');
  };

  const handleYearInputChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 4);
    setYearInput(v);
    if (v.length === 4) {
      const y = parseInt(v, 10);
      if (y >= 1900 && y <= 2100) {
        setCurrentDate(new Date(y, month, 1));
      }
    }
  };

  const weekdays = t('revenue.dp_weekdays').split(',');
  const monthNames = t('revenue.dp_months').split(',');
  const days = [];
  const prevMonthDays = new Date(year, month, 0).getDate();

  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }
  const totalSlots = 42;
  const remaining = totalSlots - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, isCurrentMonth: false });
  }

  const displayValue = value ? (() => {
    const parts = value.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return value;
  })() : '';

  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setView('days');
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div
        onClick={() => { setIsOpen(!isOpen); setView('days'); }}
        className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none cursor-pointer hover:border-white/20 transition-all select-none min-w-[120px]"
      >
        <span className={displayValue ? 'text-white font-medium' : 'text-slate-500'}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon size={13} className="text-slate-400 shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-[268px] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 select-none">
          <div className="flex items-center justify-between mb-3">
            {view === 'days' && (
              <button type="button" onClick={handlePrevMonth}
                className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                <ChevronLeft size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={handleHeaderClick}
              className={`flex-1 text-xs font-bold text-white hover:text-violet-400 transition-colors uppercase tracking-wider text-center rounded-lg py-0.5 hover:bg-white/5 ${view === 'days' ? '' : 'text-violet-400'}`}
            >
              {t('revenue.dp_header', { month: month + 1, year })}
              <span className="ml-1 text-slate-500 normal-case tracking-normal font-normal">
                {view === 'monthYear' ? '▲' : '▼'}
              </span>
            </button>
            {view === 'days' && (
              <button type="button" onClick={handleNextMonth}
                className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {view === 'monthYear' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] text-slate-500 shrink-0">{t('revenue.dp_year_label')}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={yearInput}
                  onChange={handleYearInputChange}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={t('revenue.dp_year_placeholder')}
                  className="flex-1 rounded-lg border border-white/10 bg-slate-950 px-3 py-1 text-xs text-white outline-none focus:border-violet-500/50 text-center tracking-widest"
                  maxLength={4}
                />
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {monthNames.map((name, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectMonth(idx)}
                    className={`py-1.5 text-[11px] rounded-lg font-medium transition-all ${
                      idx === month
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === 'days' && (
            <>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-500 uppercase mb-2">
                {weekdays.map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((item, idx) => {
                  const isSelected = value && item.isCurrentMonth && (() => {
                    const parts = value.split('-').map(Number);
                    return parts[0] === year && parts[1] === (month + 1) && parts[2] === item.day;
                  })();
                  const isToday = (() => {
                    const now = new Date();
                    return now.getFullYear() === year && now.getMonth() === month && now.getDate() === item.day && item.isCurrentMonth;
                  })();
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => item.isCurrentMonth && handleSelectDay(item.day)}
                      className={`h-7 text-xs rounded-lg flex items-center justify-center transition-all ${
                        !item.isCurrentMonth
                          ? 'text-slate-700 cursor-default'
                          : isSelected
                          ? 'bg-violet-600 font-bold text-white shadow-lg shadow-violet-500/20'
                          : isToday
                          ? 'text-violet-400 border border-violet-500/30 hover:bg-white/5 font-semibold'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[11px]">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const y = now.getFullYear();
                const m = String(now.getMonth() + 1).padStart(2, '0');
                const d = String(now.getDate()).padStart(2, '0');
                onChange(`${y}-${m}-${d}`);
                setIsOpen(false);
                setView('days');
              }}
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              {t('revenue.dp_today')}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-500 hover:text-slate-400 font-medium transition-colors"
            >
              {t('revenue.dp_clear')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(Number(amount || 0)) + 'đ';
const formatDate = (value) => value ? new Intl.DateTimeFormat('vi-VN').format(new Date(value)) : '--';

export default function RevenueManagement() {
  const { t } = useTranslation();
  const [revenue, setRevenue] = useState(() => {
    const tx = readArrayStorage('api_fe_payment_history', []);
    const paid = tx.filter(item => ['PAID', 'SUCCESS'].includes(item.status));
    const total = paid.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return { total, transactions: tx };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');

  useEffect(() => {
    let mounted = true;
    getRevenue()
      .then((data) => { if (mounted) { setRevenue(data); setError(''); } })
      .catch((err) => { if (mounted) setError(err.message || t('revenue.error_loading')); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [t]);

  const handleTimeRangeChange = (e) => {
    const val = e.target.value;
    setTimeRange(val);

    const now = new Date();
    const formatYMD = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    React.startTransition(() => {
      if (val === 'all') {
        setCustomStartDate('');
        setCustomEndDate('');
        setStartDateInput('');
        setEndDateInput('');
      } else if (val === 'today') {
        const todayStr = formatYMD(now);
        setCustomStartDate(todayStr);
        setCustomEndDate(todayStr);
        setStartDateInput(todayStr);
        setEndDateInput(todayStr);
      } else if (val === 'month') {
        const startStr = formatYMD(new Date(now.getFullYear(), now.getMonth(), 1));
        const endStr = formatYMD(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        setCustomStartDate(startStr);
        setCustomEndDate(endStr);
        setStartDateInput(startStr);
        setEndDateInput(endStr);
      } else if (val === 'year') {
        const startStr = formatYMD(new Date(now.getFullYear(), 0, 1));
        const endStr = formatYMD(new Date(now.getFullYear(), 11, 31));
        setCustomStartDate(startStr);
        setCustomEndDate(endStr);
        setStartDateInput(startStr);
        setEndDateInput(endStr);
      }
    });
  };

  const filteredTransactions = useMemo(() => {
    if (!revenue.transactions) return [];
    
    return revenue.transactions.filter((tx) => {
      const txTime = new Date(tx.paidAt || tx.createdAt).getTime();
      let match = true;
      if (customStartDate) {
        const startLimit = new Date(customStartDate);
        startLimit.setHours(0, 0, 0, 0);
        match = match && (txTime >= startLimit.getTime());
      }
      if (customEndDate) {
        const endLimit = new Date(customEndDate);
        endLimit.setHours(23, 59, 59, 999);
        match = match && (txTime <= endLimit.getTime());
      }
      return match;
    });
  }, [revenue.transactions, customStartDate, customEndDate]);



  const totalPaid = useMemo(() => {
    return filteredTransactions
      .filter((tx) => ['PAID', 'SUCCESS'].includes(tx.status))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [filteredTransactions]);

  const handleExportCSV = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      toast.error(t('revenue.csv_no_data'));
      return;
    }
    const headers = [t('revenue.col_code'), t('revenue.col_customer'), t('revenue.col_plan'), t('revenue.col_amount'), t('revenue.col_date'), t('revenue.col_status')];
    const rows = filteredTransactions.map(tx => [
      tx.orderCode || tx.id,
      tx.accountName || t('revenue.default_customer'),
      tx.planName || t('revenue.default_plan'),
      tx.amount,
      tx.paidAt || tx.createdAt,
      tx.status
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
    toast.success(t('revenue.csv_exported'));
  };

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('revenue.title')}</h1>
          <p className="text-slate-400">{t('revenue.desc')}</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {t('revenue.export_btn')}
        </button>
      </motion.div>

      {loading && (
        <div className="rounded-2xl border border-white/5 bg-slate-900 p-8 text-center text-slate-400">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-violet-400" />
          {t('revenue.loading')}
        </div>
      )}

      {!loading && error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">{error}</div>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-white/80 text-sm font-medium">{t('revenue.paid_revenue')}</p>
                <h2 className="text-3xl font-bold mt-2">{formatCurrency(totalPaid)}</h2>
                <div className="flex items-center gap-1 mt-4 text-emerald-300 text-sm font-medium">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{t('revenue.mock_transactions', { count: filteredTransactions.length })}</span>
                </div>
              </div>
              <CreditCard className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-white/10 rotate-12" />
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-white/5 rounded-2xl relative z-10">
            <div className="p-5 border-b border-white/5">
              <h3 className="font-semibold text-white">{t('revenue.recent_title')}</h3>
              
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{t('revenue.filter_label')}:</span>
                    <select
                      value={timeRange}
                      onChange={handleTimeRangeChange}
                      className="rounded-lg border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none focus:border-violet-500/50 cursor-pointer shadow-inner appearance-none pr-8 relative"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        backgroundSize: '12px'
                      }}
                    >
                      <option value="all">{t('revenue.filter_all')}</option>
                      <option value="today">{t('revenue.filter_today')}</option>
                      <option value="month">{t('revenue.filter_1month')}</option>
                      <option value="year">{t('revenue.filter_1year')}</option>
                      {timeRange === 'custom' && (
                        <option value="custom" disabled hidden>{t('revenue.filter_custom')}</option>
                      )}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{t('revenue.filter_from')}:</span>
                    <CustomDatePicker
                      value={startDateInput}
                      t={t}
                      onChange={(val) => {
                        setStartDateInput(val);
                        React.startTransition(() => {
                          setCustomStartDate(val);
                          setTimeRange('custom');
                        });
                      }}
                      placeholder="dd/mm/yyyy"
                    />
                    <span className="text-xs text-slate-500">{t('revenue.filter_to')}:</span>
                    <CustomDatePicker
                      value={endDateInput}
                      t={t}
                      onChange={(val) => {
                        setEndDateInput(val);
                        React.startTransition(() => {
                          setCustomEndDate(val);
                          setTimeRange('custom');
                        });
                      }}
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                </div>

              </div>
            </div>
            <div className="overflow-x-auto rounded-b-2xl">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-white/5 text-xs uppercase font-semibold text-slate-400">
                  <tr>
                    <th className="px-6 py-4">{t('revenue.col_code')}</th>
                    <th className="px-6 py-4">{t('revenue.col_customer')}</th>
                    <th className="px-6 py-4">{t('revenue.col_plan')}</th>
                    <th className="px-6 py-4">{t('revenue.col_amount')}</th>
                    <th className="px-6 py-4">{t('revenue.col_date')}</th>
                    <th className="px-6 py-4">{t('revenue.col_status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTransactions.map((trx) => (
                    <tr key={trx.orderCode || trx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{trx.orderCode || trx.id}</td>
                      <td className="px-6 py-4">{trx.accountName || t('revenue.default_customer')}</td>
                      <td className="px-6 py-4">{trx.planName === 'Pro Plan' ? 'Pro' : (trx.planName || t('revenue.default_plan'))}</td>
                      <td className="px-6 py-4 font-semibold text-emerald-400">{formatCurrency(trx.amount)}</td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(trx.paidAt || trx.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${trx.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {trx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-slate-500">{t('revenue.no_transactions')}</td>
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
