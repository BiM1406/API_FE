import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  MessageSquare,
  Zap,
  Database,
  Boxes,
  CreditCard,
  Loader2,
  FolderPlus,
  Bot,
  TrendingUp,
  Clock,
  FileText,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { getCurrentUser, isAdmin } from '../../services/authService';
import { getProjects } from '../../services/projectService';
import { getRequestHistory } from '../../services/testService';
import { getSchema } from '../../services/databaseService';
import { getSubscription } from '../../services/profileService';
import { getActivities } from '../../services/activityService';

const quickActionCards = [
  {
    id: 'dashboard',
    title: 'Mở Dashboard',
    description: 'Quản lý dự án',
    icon: LayoutGrid,
    color: 'from-indigo-500 to-indigo-600',
    path: '/dashboard'
  },
  {
    id: 'chat',
    title: 'Chat với AI',
    description: 'ChatDMP Workspace',
    icon: MessageSquare,
    color: 'from-violet-500 to-violet-600',
    path: '/workspace'
  },
  {
    id: 'api-test',
    title: 'Kiểm thử API',
    description: 'API Tester',
    icon: Zap,
    color: 'from-amber-500 to-amber-600',
    path: '/test-api'
  },
  {
    id: 'database',
    title: 'Thiết kế CSDL',
    description: 'Database Designer',
    icon: Database,
    color: 'from-emerald-500 to-emerald-600',
    path: '/database'
  },
  {
    id: 'collections',
    title: 'Collections',
    description: 'Lưu trữ request',
    icon: Boxes,
    color: 'from-cyan-500 to-cyan-600',
    path: '/collections'
  },
  {
    id: 'subscription',
    title: 'Gói dịch vụ',
    description: 'Nâng cấp/Quản lý',
    icon: CreditCard,
    color: 'from-pink-500 to-pink-600',
    path: '/profile/edit?tab=subscription'
  }
];

const aiPromptSuggestions = [
  {
    label: 'Sinh API đăng nhập',
    prompt: 'Sinh API đăng nhập JWT gồm request, response, validate và lỗi thường gặp.'
  },
  {
    label: 'Tạo database cho hệ thống đặt vé',
    prompt: 'Tạo database schema cho hệ thống đặt vé gồm user, event, seat, booking và payment.'
  },
  {
    label: 'Viết code React gọi API',
    prompt: 'Viết code React gọi API với loading, error state và token bearer.'
  },
  {
    label: 'Phân tích lỗi response API',
    prompt: 'Phân tích lỗi response API sau và đề xuất cách sửa:'
  }
];

const getDisplayName = (user) => {
  if (!user) return 'Khách Hàng';
  return user.name || user.username || user.email?.split('@')[0] || 'Khách Hàng';
};

const formatSubscriptionStatus = (subscription) => {
  if (!subscription) return 'Miễn Phí';
  return subscription.planName || 'Miễn Phí';
};

export default function AuthenticatedHome() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isAdminUser = isAdmin();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [activities, setActivities] = useState([]);
  const [schema, setSchema] = useState(null);

  // Fetch data safely
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [proj, hist, sub, acts] = await Promise.allSettled([
          getProjects(),
          Promise.resolve(getRequestHistory()),
          getSubscription(),
          Promise.resolve(getActivities())
        ]);

        setProjects(proj.status === 'fulfilled' ? proj.value : []);
        setRequestHistory(hist.status === 'fulfilled' ? hist.value : []);
        setSubscription(sub.status === 'fulfilled' ? sub.value : null);
        setActivities(acts.status === 'fulfilled' ? acts.value : []);

        // Fetch schema for first project
        const projectId = proj.status === 'fulfilled' && proj.value[0] ? proj.value[0].id : 'default';
        getSchema(projectId)
          .then((schemaData) => setSchema(schemaData))
          .catch(() => setSchema(null));
      } catch (error) {
        console.error('Error fetching authenticated home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(
    () => [
      {
        label: 'Tổng dự án',
        value: projects.length,
        icon: FolderPlus,
        color: 'text-indigo-400'
      },
      {
        label: 'API requests',
        value: requestHistory.length,
        icon: Zap,
        color: 'text-amber-400'
      },
      {
        label: 'Database tables',
        value: schema?.tables?.length || 0,
        icon: Database,
        color: 'text-emerald-400'
      },
      {
        label: 'Hoạt động gần đây',
        value: activities.length,
        icon: Clock,
        color: 'text-violet-400'
      }
    ],
    [projects, requestHistory, schema, activities]
  );

  const recentProject = useMemo(() => projects[0] || null, [projects]);
  const recentRequest = useMemo(() => requestHistory[0] || null, [requestHistory]);
  const recentActivity = useMemo(() => activities[0] || null, [activities]);

  const handleQuickAction = (path) => {
    navigate(path);
  };

  const handlePromptClick = (prompt) => {
    localStorage.setItem('api_fe_pending_ai_prompt', prompt);
    navigate('/workspace');
  };

  const handleCreateProject = async () => {
    navigate('/dashboard');
    toast.success('Đi tới Dashboard để tạo dự án mới');
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
          <span className="text-slate-300 font-medium">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-300 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Chào mừng trở lại, {getDisplayName(user)}
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Tiếp tục quản lý API, thiết kế cơ sở dữ liệu và làm việc với ChatDMP AI trong workspace của bạn.
          </p>
        </motion.section>

        {/* Quick Actions Grid */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {quickActionCards.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                variants={itemVariants}
                onClick={() => handleQuickAction(action.path)}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 hover:bg-slate-900/60 p-6 transition-all duration-300 text-left"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-white font-bold text-lg group-hover:text-violet-300 transition-colors mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-slate-400">{action.description}</p>

                <ChevronRight className="absolute right-4 bottom-4 w-5 h-5 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
              </motion.button>
            );
          })}
        </motion.section>

        {/* Stats Overview */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="rounded-xl border border-white/10 bg-slate-900/40 p-5 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </motion.div>
            );
          })}
        </motion.section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Continue Working */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-6"
          >
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-400" />
                Tiếp tục làm việc
              </h2>

              {!recentProject && !recentRequest && (
                <div className="rounded-xl border border-dashed border-white/20 bg-slate-900/20 p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
                  <p className="text-slate-400 mb-4">Bạn chưa có hoạt động nào</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleCreateProject}
                      className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Tạo dự án mới
                    </button>
                    <button
                      onClick={() => navigate('/workspace')}
                      className="px-5 py-2.5 border border-white/20 hover:bg-white/5 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Chat với AI
                    </button>
                  </div>
                </div>
              )}

              {recentProject && (
                <div
                  onClick={() => navigate(`/workspace/${recentProject.id}`)}
                  className="group rounded-xl border border-white/10 hover:border-indigo-500/50 bg-slate-900/40 hover:bg-slate-900/60 p-5 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                        📁 {recentProject.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">{recentProject.description}</p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">
                      {recentProject.status}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap text-xs">
                    {(recentProject.tech || []).slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-slate-800 text-slate-300 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {recentRequest && (
                <div
                  onClick={() => navigate('/test-api')}
                  className="group rounded-xl border border-white/10 hover:border-amber-500/50 bg-slate-900/40 hover:bg-slate-900/60 p-5 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded">
                          {recentRequest.method || 'GET'}
                        </span>
                        <h3 className="font-bold text-white text-sm truncate group-hover:text-amber-300 transition-colors">
                          {recentRequest.url || 'API Request'}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400">
                        Status: <span className={recentRequest.status === 200 ? 'text-green-400' : 'text-red-400'}>
                          {recentRequest.status || 'N/A'}
                        </span>
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {recentRequest.duration ? `${recentRequest.duration}ms` : ''}
                    </span>
                  </div>
                </div>
              )}

              {recentActivity && (
                <div className="group rounded-xl border border-white/10 hover:border-violet-500/50 bg-slate-900/40 hover:bg-slate-900/60 p-5 cursor-pointer transition-all">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm">
                        {typeof recentActivity.action === 'string' ? recentActivity.action : recentActivity.action?.title || 'Hoạt động'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {recentActivity.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.section>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Current Subscription */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-pink-400" />
                Gói hiện tại
              </h3>
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {formatSubscriptionStatus(subscription)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {subscription?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Chưa kích hoạt'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/profile/edit?tab=subscription')}
                  className="w-full px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {subscription?.planId === 'free' ? 'Nâng cấp gói' : 'Quản lý gói'}
                </button>
              </div>
            </section>

            {/* AI Suggestions */}
            <section>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Bot className="w-5 h-5 text-violet-400" />
                ChatDMP gợi ý
              </h3>
              <div className="space-y-2">
                {aiPromptSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(suggestion.prompt)}
                    className="w-full text-left px-4 py-3 rounded-lg border border-white/10 bg-slate-900/40 hover:bg-slate-900/60 hover:border-violet-500/50 transition-all group"
                  >
                    <p className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors line-clamp-2">
                      {suggestion.label}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          </motion.div>
        </div>

        {/* Footer CTA */}
        {isAdminUser && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Quản trị hệ thống</h2>
            <p className="text-slate-400 mb-6">Xem thống kê, quản lý người dùng và doanh thu</p>
            <button
              onClick={() => navigate('/admin/overview')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white rounded-lg font-medium transition-opacity"
            >
              Tới Admin Dashboard
            </button>
          </motion.section>
        )}
      </div>
    </main>
  );
}
