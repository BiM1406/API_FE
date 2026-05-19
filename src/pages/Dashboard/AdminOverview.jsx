import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Users, DollarSign, Activity, Server } from 'lucide-react';
import { MY_PROJECTS_STORAGE_KEY } from '../Projects/MyProject';

export default function AdminOverview() {
  const [projectCount] = useState(() => {
    const saved = localStorage.getItem(MY_PROJECTS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).length;
      } catch (err) {
        return 0;
      }
    }
    return 0;
  });

  const stats = [
    { label: 'Tổng người dùng', value: (1000 + projectCount * 2).toString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Doanh thu tháng', value: `${(1399997 + projectCount * 150000).toLocaleString('vi-VN')}đ`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Lượt gọi API', value: `${(1.8 + projectCount * 0.1).toFixed(1)}M`, icon: Activity, color: 'text-violet-400', bg: 'bg-violet-400/10' },
    { label: 'Tải máy chủ', value: `${Math.min(45 + projectCount * 2, 98)}%`, icon: Server, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  ];

  return (
    <div className="p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white">Tổng quan Hệ thống</h1>
        <p className="text-slate-400">Giám sát hoạt động và thông số của AI Backend Builder</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-slate-900 border border-white/5 flex items-center gap-4"
          >
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-slate-900 border border-white/5 min-h-[300px] flex items-center justify-center"
        >
          <p className="text-slate-500">Biểu đồ người dùng đăng ký mới</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-slate-900 border border-white/5 min-h-[300px] flex items-center justify-center"
        >
          <p className="text-slate-500">Biểu đồ doanh thu theo gói cước</p>
        </motion.div>
      </div>
    </div>
  );
}
