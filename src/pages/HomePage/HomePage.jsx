import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Bot, Terminal, Rocket, CheckCircle2, ChevronRight, Code2, Zap, Database, Shield, Cloud, Globe, Cpu } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

// ─── Dữ liệu danh sách tính năng ──────────────────────────────────────────
const featureList = [
  {
    title: 'Tạo API Thần Tốc',
    description: 'Chỉ cần mô tả ý tưởng bằng ngôn ngữ tự nhiên, AI sẽ sinh ra toàn bộ mã nguồn API hoàn chỉnh (Node.js, Python, Go) trong tích tắc.',
    icon: Zap,
    color: 'from-violet-500 to-purple-600'
  },
  {
    title: 'Kiến Trúc Dữ Liệu Thông Minh',
    description: 'Tự động thiết kế Database Schema tối ưu, thiết lập các mối quan hệ phức tạp và tạo các câu truy vấn hiệu quả nhất.',
    icon: Database,
    color: 'from-blue-500 to-cyan-600'
  },
  {
    title: 'Bảo Mật Đa Tầng',
    description: 'Mọi dòng code tạo ra đều được AI kiểm tra lỗ hổng bảo mật tự động, đảm bảo tuân thủ các tiêu chuẩn OWASP và mã hóa dữ liệu.',
    icon: Shield,
    color: 'from-emerald-500 to-teal-600'
  },
  {
    title: 'Deploy Một Chạm',
    description: 'Kết nối trực tiếp với AWS, Google Cloud hoặc Vercel. Triển khai ứng dụng của bạn lên môi trường production chỉ với 1 cú nhấp chuột.',
    icon: Cloud,
    color: 'from-orange-500 to-pink-600'
  },
  {
    title: 'Đa Ngôn Ngữ & Framework',
    description: 'Hỗ trợ xuất mã nguồn theo nhiều ngôn ngữ và framework phổ biến nhất hiện nay, phù hợp với mọi dự án của bạn.',
    icon: Globe,
    color: 'from-indigo-500 to-blue-600'
  },
  {
    title: 'Tối Ưu Hiệu Năng',
    description: 'AI không chỉ viết code mà còn tối ưu hóa tài nguyên hệ thống, giúp Backend của bạn chịu tải hàng triệu request mỗi ngày.',
    icon: Cpu,
    color: 'from-rose-500 to-orange-600'
  }
];

// ─── Dữ liệu các bước hướng dẫn ──────────────────────────────────────────
const guideSteps = [
  {
    number: '01',
    title: 'Khơi nguồn ý tưởng',
    description: 'Nhập yêu cầu của bạn bằng ngôn ngữ tự nhiên (Tiếng Việt/Anh). AI sẽ bóc tách yêu cầu và lên kịch bản hệ thống sơ bộ.',
    icon: Bot,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    number: '02',
    title: 'AI Kiến tạo & Sinh mã',
    description: 'Hệ thống tự động thiết kế Database Schema, API Endpoints và viết code xử lý nghiệp vụ chuẩn xác theo yêu cầu.',
    icon: Code2,
    color: 'from-violet-500 to-purple-600'
  },
  {
    number: '03',
    title: 'Sẵn sàng cất cánh',
    description: 'Kiểm thử các Endpoint ngay trên trình duyệt, sau đó tải mã nguồn về hoặc Deploy trực tiếp lên Cloud chỉ với 1-click.',
    icon: Rocket,
    color: 'from-indigo-600 to-indigo-800'
  }
];

// ─── Animation Variants ──────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function HomePage() {
  const navigate = useNavigate();

  // Xử lý cuộn trang khi có hash trên URL (ví dụ: #features)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  // Nút "Tạo dự án ngay": nếu đã login → workspace, chưa → login
  const handleGetStarted = () => {
    const isLoggedIn = !!localStorage.getItem('token');
    navigate(isLoggedIn ? '/workspace' : '/auth');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-violet-500/30">
      <Header />

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Tự động hóa Backend với <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-500">
                sức mạnh AI.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-3xl mx-auto">
              Nền tảng giúp bạn sinh mã nguồn chuẩn xác từ ngôn ngữ tự nhiên và kiểm thử API ngay lập tức mà không cần rời khỏi trình duyệt.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              
            </div>
          </div>

          {/* Split Screen Illustration */}
          <div className="relative rounded-2xl md:rounded-[2rem] border border-white/10 bg-slate-900 overflow-hidden shadow-2xl shadow-violet-900/20">
            {/* Top Bar */}
            <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-slate-950/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="mx-auto px-4 py-1 rounded-md bg-white/5 text-xs text-gray-400 font-mono flex items-center gap-2">
                <Code2 className="w-3 h-3" />
                workspace/project
              </div>
            </div>

            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
              {/* Left: AI Chat */}
              <div className="p-6 bg-slate-900">
                <div className="flex items-center gap-3 mb-6 text-sm font-medium text-gray-400">
                  <Bot className="w-4 h-4 text-violet-400" />
                  AI Assistant
                </div>
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0">
                      <span className="text-xs text-blue-400">U</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-gray-300 border border-white/5">
                      Tạo một REST API cho ứng dụng quản lý công việc (Todo app) với Node.js và Express. Bao gồm các CRUD endpoints và kết nối MongoDB.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                      <Bot className="w-3 h-3 text-violet-400" />
                    </div>
                    <div className="bg-violet-500/5 rounded-lg p-4 text-gray-300 border border-violet-500/20 w-full">
                      <p className="mb-3 text-violet-300">Đã tạo xong cấu trúc dự án. Đang sinh mã nguồn...</p>
                      <div className="space-y-2 text-xs text-gray-400">
                        <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-400"/> src/controllers/todo.controller.js</div>
                        <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-400"/> src/routes/todo.routes.js</div>
                        <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-400"/> src/models/todo.model.js</div>
                        <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-400"/> src/config/db.js</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: API Test */}
              <div className="p-6 bg-slate-900/60">
                <div className="flex items-center gap-3 mb-6 text-sm font-medium text-gray-400">
                  <Terminal className="w-4 h-4 text-green-400" />
                  API Tester
                </div>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="px-3 py-2 bg-green-500/10 text-green-400 font-mono text-xs rounded border border-green-500/20 flex items-center font-bold">
                      POST
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white/5 text-gray-300 font-mono text-xs rounded border border-white/10 flex items-center truncate">
                      https://api.local/v1/todos
                    </div>
                    <button className="px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded hover:bg-violet-500 transition-colors">
                      Send
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded border border-white/10 bg-slate-950 overflow-hidden">
                      <div className="px-3 py-1.5 border-b border-white/10 text-xs text-gray-500 font-medium bg-white/5">
                        Body (JSON)
                      </div>
                      <div className="p-3 font-mono text-xs text-gray-300">
                        <span className="text-blue-400">{'{'}</span><br/>
                        &nbsp;&nbsp;<span className="text-cyan-300">"title"</span>: <span className="text-yellow-300">"Hoàn thành UI Landing Page"</span>,<br/>
                        &nbsp;&nbsp;<span className="text-cyan-300">"status"</span>: <span className="text-yellow-300">"pending"</span><br/>
                        <span className="text-blue-400">{'}'}</span>
                      </div>
                    </div>
                    <div className="rounded border border-green-500/20 bg-slate-950 overflow-hidden relative">
                      <div className="px-3 py-1.5 border-b border-white/10 text-xs text-gray-500 font-medium bg-white/5 flex justify-between items-center">
                        <span>Response</span>
                        <span className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> 200 OK</span>
                      </div>
                      <div className="p-3 font-mono text-xs text-gray-300">
                        <span className="text-blue-400">{'{'}</span><br/>
                        &nbsp;&nbsp;<span className="text-cyan-300">"success"</span>: <span className="text-purple-400">true</span>,<br/>
                        &nbsp;&nbsp;<span className="text-cyan-300">"data"</span>: <span className="text-blue-400">{'{'}</span><br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-300">"id"</span>: <span className="text-yellow-300">"64a1b2c3..."</span>,<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-300">"title"</span>: <span className="text-yellow-300">"Hoàn thành UI..."</span><br/>
                        &nbsp;&nbsp;<span className="text-blue-400">{'}'}</span><br/>
                        <span className="text-blue-400">{'}'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── PHẦN TÍNH NĂNG (FEATURES SECTION) ───────────────────────── */}
        <section id="features" className="py-24 bg-slate-950 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-1.5 mb-4 rounded-full bg-violet-500/10 border border-violet-500/20"
              >
                <span className="text-sm font-bold text-violet-400 uppercase tracking-widest">Tính năng nổi bật</span>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-bold text-white mb-6"
              >
                Sức mạnh AI định nghĩa lại <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-500">Quy trình Backend</span>
              </motion.h2>
              
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Cung cấp mọi công cụ bạn cần để xây dựng, quản lý và vận hành hệ thống Backend mạnh mẽ mà không cần viết hàng ngàn dòng code thủ công.
              </p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {featureList.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                  className="group relative p-8 rounded-[2rem] bg-slate-900/40 border border-white/5 hover:border-violet-500/30 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/0 to-indigo-600/0 group-hover:from-violet-600/5 group-hover:to-indigo-600/5 rounded-[2rem] transition-all duration-300" />
                  
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-violet-400 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── PHẦN HƯỚNG DẪN (GUIDE SECTION) ───────────────────────────── */}
        <section id="guide" className="py-24 bg-slate-950 relative">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-1.5 mb-4 rounded-full bg-indigo-500/10 border border-indigo-500/20"
              >
                <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Quy trình làm việc</span>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-bold text-white mb-6"
              >
                Xây dựng Backend <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">Dễ như ăn kẹo</span>
              </motion.h2>
            </div>

            <div className="relative">
              {/* Connecting line (Desktop) */}
              <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent -translate-y-1/2 z-0" />

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10"
              >
                {guideSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex flex-col items-center text-center group"
                  >
                    <div className="relative mb-8">
                      {/* Step Number Background */}
                      <div className="absolute -top-4 -left-4 text-7xl font-black text-white/[0.03] select-none group-hover:text-indigo-500/10 transition-colors">
                        {step.number}
                      </div>
                      
                      {/* Icon Circle */}
                      <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center relative z-10 shadow-xl shadow-indigo-900/20 group-hover:scale-110 transition-transform duration-500`}>
                        <step.icon className="w-10 h-10 text-white" />
                      </div>

                      {/* Connector dot */}
                      <div className="hidden lg:block absolute top-1/2 -right-6 w-3 h-3 rounded-full bg-indigo-500/30 border border-indigo-500/50 -translate-y-1/2 z-20" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-400 leading-relaxed max-w-sm">
                      {featureList.find(f => f.title === step.title)?.description || step.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* CTA in Guide */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mt-20 p-12 rounded-[3rem] bg-gradient-to-b from-white/5 to-transparent border border-white/10 text-center"
            >
              <h4 className="text-2xl font-bold text-white mb-6">Bạn đã sẵn sàng tạo Backend đầu tiên?</h4>
              <button
                onClick={handleGetStarted}
                className="px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] transition-all flex items-center gap-3 mx-auto"
              >
                Tạo dự án ngay
                <Rocket className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}