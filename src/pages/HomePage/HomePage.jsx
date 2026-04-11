import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Terminal, Rocket, CheckCircle2, ChevronRight, Menu, X, Code2 } from 'lucide-react';

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Hàm hỗ trợ chuyển trang và đóng menu mobile (nếu đang mở)
  const handleNavigation = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">AI Backend Builder</span>
          </div>

          {/* Center: Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">Tính năng</a>
            <a href="#guide" className="hover:text-white transition-colors">Hướng dẫn</a>
            <a href="#pricing" className="hover:text-white transition-colors">Bảng giá</a>
          </nav>

          {/* Right: Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => handleNavigation('/auth')}
              className="px-5 py-2.5 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors"
            >
              Đăng nhập
            </button>
            <button 
              onClick={() => handleNavigation('/auth?mode=register')}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              Bắt đầu miễn phí
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0a0a0a] px-6 py-4 space-y-4">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">Tính năng</a>
            <a href="#guide" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">Hướng dẫn</a>
            <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-300 hover:text-white py-2">Bảng giá</a>
            <div className="pt-4 flex flex-col gap-3 border-t border-white/10">
              <button
                onClick={() => handleNavigation('/auth')}
                className="w-full px-5 py-2.5 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors"
              >
                Đăng nhập
              </button>
              <button 
                onClick={() => handleNavigation('/auth?mode=register')}
                className="w-full px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full hover:opacity-90 transition-opacity"
              >
                Bắt đầu miễn phí
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Tự động hóa Backend với <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                sức mạnh AI.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-3xl mx-auto">
              Nền tảng giúp bạn sinh mã nguồn chuẩn xác từ ngôn ngữ tự nhiên và kiểm thử API ngay lập tức mà không cần rời khỏi trình duyệt.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-8 py-4 text-base font-medium text-white bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-all flex items-center justify-center gap-2 group">
                Xem Demo
              </button>
              <button 
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto px-8 py-4 text-base font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full hover:opacity-90 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 group"
              >
                Tạo dự án ngay
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Split Screen Illustration */}
          <div className="relative rounded-2xl md:rounded-[2rem] border border-white/10 bg-[#141414] overflow-hidden shadow-2xl shadow-cyan-900/20">
            {/* Top Bar */}
            <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-[#0a0a0a]/50">
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
              <div className="p-6 bg-[#0f0f0f]">
                <div className="flex items-center gap-3 mb-6 text-sm font-medium text-gray-400">
                  <Bot className="w-4 h-4 text-cyan-400" />
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
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                      <Bot className="w-3 h-3 text-cyan-400" />
                    </div>
                    <div className="bg-cyan-500/5 rounded-lg p-4 text-gray-300 border border-cyan-500/20 w-full">
                      <p className="mb-3 text-cyan-200">Đã tạo xong cấu trúc dự án. Đang sinh mã nguồn...</p>
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
              <div className="p-6 bg-[#141414]">
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
                    <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-500 transition-colors">
                      Send
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded border border-white/10 bg-[#0a0a0a] overflow-hidden">
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
                    <div className="rounded border border-green-500/20 bg-[#0a0a0a] overflow-hidden relative">
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

        {/* Core Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tính năng cốt lõi</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Mọi công cụ bạn cần để xây dựng và kiểm thử Backend trong một nền tảng duy nhất.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-opacity group-hover:opacity-100 opacity-50"></div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mb-6 relative z-10">
                <Code2 className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 relative z-10">AI Sinh Code Thông Minh</h3>
              <p className="text-gray-400 leading-relaxed relative z-10">
                Nhập yêu cầu (prompt), hệ thống tự động bóc tách và tạo ra cấu trúc thư mục, Controller, Service, Database chuẩn xác. Tiết kiệm hàng giờ code boilerplate.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-opacity group-hover:opacity-100 opacity-50"></div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center mb-6 relative z-10">
                <Rocket className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 relative z-10">Kiểm thử API Tích hợp</h3>
              <p className="text-gray-400 leading-relaxed relative z-10">
                Chạy thử các endpoint vừa được AI tạo ra với giao diện tương tự Postman, lưu lịch sử test và debug dễ dàng ngay trên trình duyệt của bạn.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050505] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">AI Backend Builder</span>
          </div>
          
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-white transition-colors">Liên hệ</a>
          </div>

          <div className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} AI Backend Builder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}