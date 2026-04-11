import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Database, Bot, Zap, History, User, Sparkles, RefreshCw } from 'lucide-react';

const FeatureCard = ({ title, description, icon: Icon, colorClass, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="p-6 rounded-2xl bg-[#141414] border border-white/10 hover:border-white/20 hover:-translate-y-2 transition-all duration-300 cursor-pointer group shadow-none hover:shadow-xl hover:shadow-black/50 flex flex-col h-full"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass.bg} ${colorClass.text} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 flex-1">{description}</p>
    </div>
  );
};

const AIAdvisor = () => {
  const advices = [
    "Gợi ý: Dựa trên dự án hiện tại, bạn nên tối ưu hóa Index cho bảng User để tăng tốc độ truy vấn.",
    "Gợi ý: Hãy thử tách các route API thành các module riêng biệt để dễ bảo trì hơn.",
    "Gợi ý: Thêm rate limiting vào API đăng nhập để chống brute-force attack.",
    "Gợi ý: Cân nhắc sử dụng Redis để cache các truy vấn database thường xuyên.",
    "Gợi ý: Đừng quên viết unit test cho các service quan trọng trước khi deploy."
  ];

  const [adviceIndex, setAdviceIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const generateNewAdvice = () => {
    setIsAnimating(true);
    setTimeout(() => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * advices.length);
      } while (newIndex === adviceIndex && advices.length > 1);
      setAdviceIndex(newIndex);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-r from-cyan-900/20 to-transparent p-6 rounded-2xl border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-4">
        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 shrink-0">
          <Sparkles size={24} />
        </div>
        <p className={`text-cyan-100 text-sm md:text-base transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          {advices[adviceIndex]}
        </p>
      </div>
      <button 
        onClick={generateNewAdvice}
        className="shrink-0 px-4 py-2 bg-[#141414] hover:bg-[#1a1a1a] border border-white/10 hover:border-cyan-500/50 text-cyan-400 text-sm rounded-lg transition-all flex items-center gap-2 active:scale-95"
      >
        <RefreshCw size={16} className={isAnimating ? 'animate-spin' : ''} />
        Tạo gợi ý mới
      </button>
    </div>
  );
};

export default function MenuHome() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Thiết kế Database',
      description: 'Phác thảo sơ đồ ERD, định nghĩa thực thể và sinh mã SQL tự động.',
      icon: Database,
      colorClass: { text: 'text-amber-500', bg: 'bg-amber-500/10' },
      tab: 'db-designer'
    },
    {
      title: 'AI Workspace',
      description: 'Lập trình Backend chuyên sâu. Chat trực tiếp với AI để sinh mã nguồn Controller và Service.',
      icon: Bot,
      colorClass: { text: 'text-cyan-500', bg: 'bg-cyan-500/10' },
      tab: 'chat'
    },
    {
      title: 'Kiểm thử API',
      description: 'Môi trường Test HTTP Request. Kiểm tra Response, Status Code và Time thực tế.',
      icon: Zap,
      colorClass: { text: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      tab: 'api-test'
    },
    {
      title: 'Lịch sử tra cứu',
      description: 'Xem lại nhật ký sinh code, các phiên bản sơ đồ DB và lịch sử hoạt động.',
      icon: History,
      colorClass: { text: 'text-purple-500', bg: 'bg-purple-500/10' },
      tab: 'history'
    },
    {
      title: 'Quản lý tài khoản',
      description: 'Cài đặt hồ sơ cá nhân, quản lý gói cước Pro và phân quyền đội ngũ.',
      icon: User,
      colorClass: { text: 'text-gray-400', bg: 'bg-gray-500/10' },
      tab: 'account'
    }
  ];

  const handleNavigate = (tab) => {
    const routes = {
      'db-designer': 'database',
      'chat': 'workspace',
      'api-test': 'test-api',
      'history': 'history',
      'account': 'profile'
    };
    navigate(routes[tab] || 'workspace');
  };

  return (
    <>
      {/* Dashboard */}
      <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-8 lg:p-12 font-sans">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Chào mừng trở lại
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141414] border border-white/10 text-sm text-gray-300 w-fit">
              Hệ thống: 
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span> 
                Hoạt động
              </span>
            </div>
          </header>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <AIAdvisor />

            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                colorClass={feature.colorClass}
                onClick={() => handleNavigate(feature.tab)}
              />
            ))}
          </div>
        </div>
      </div>

      <Outlet />
    </>
  );
}