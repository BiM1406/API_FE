import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lỗi ứng dụng:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans selection:bg-indigo-500/30">
          <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-black mb-3">Ôi không! Đã xảy ra lỗi.</h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Xin lỗi anh/chị, hệ thống vừa gặp một sự cố ngoài ý muốn. Vui lòng tải lại trang để tiếp tục.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition-colors active:scale-95"
            >
              <RefreshCcw size={18} /> Tải lại trang
            </button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-black/40 rounded-xl text-left overflow-x-auto text-xs text-red-300 font-mono border border-red-500/10">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
