import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Edit, Trash2, X, Loader2, Copy, Key, ChevronUp, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { deleteUser, getAdminUsers, updateUserStatus, updateAdminUser, resetUserPassword } from '../../services/adminService';
import { getPlanLabel, getRoleBadgeClass, getStatusColor, getStatusDotClass, mapUserToTableRow } from './userManagement.helpers';
import { USER_TABLE_PAGE_SIZE } from '../../config/adminConfig';
import { readArrayStorage } from '../../utils/storage';

const SortHeader = ({ columnKey, label, sortConfig, onRequestSort }) => {
  const isSorted = sortConfig && sortConfig.key === columnKey;
  return (
    <th
      onClick={() => onRequestSort(columnKey)}
      className="px-6 py-4 cursor-pointer hover:text-white select-none transition-colors"
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {!isSorted ? (
          <span className="inline-flex flex-col gap-0.5 ml-1 opacity-20 group-hover:opacity-60 transition-opacity">
            <ChevronUp size={10} />
            <ChevronDown size={10} />
          </span>
        ) : sortConfig.direction === 'asc' ? (
          <ChevronUp size={12} className="text-violet-400" />
        ) : (
          <ChevronDown size={12} className="text-violet-400" />
        )}
      </div>
    </th>
  );
};

export default function UserManagement() {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState(() => readArrayStorage('api_fe_users', []));
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [statusConfirmUser, setStatusConfirmUser] = useState(null);
  const [resetConfirmUser, setResetConfirmUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Sort State
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = USER_TABLE_PAGE_SIZE;

  const formatDate = (value) => {
    if (!value) return '--';
    const locale = i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US';
    return new Intl.DateTimeFormat(locale).format(new Date(value));
  };

  useEffect(() => {
    let mounted = true;
    getAdminUsers()
      .then((items) => {
        if (mounted) {
          setUsers(items);
          setError('');
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || t('user_mgmt.error_loading'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [t]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleToggleStatus = async (user, targetStatus) => {
    const status = targetStatus || (user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE');
    try {
      const updated = await updateUserStatus(user.id, status);
      setUsers((current) => current.map((item) => item.id === user.id ? updated : item));
      const statusLabel = status === 'ACTIVE' ? t('user_mgmt.status_active') : t('user_mgmt.status_suspended');
      toast.success(t('user_mgmt.toast_status_updated', { status: statusLabel }));
    } catch (err) {
      const isNetworkError = err.message?.includes('fetch') || err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch');
      if (!isNetworkError) {
        toast.error(err.message || t('user_mgmt.toast_update_error'));
      }
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      await deleteUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      toast.success(t('user_mgmt.toast_delete_success'));
    } catch (err) {
      const isNetworkError = err.message?.includes('fetch') || err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch');
      if (!isNetworkError) {
        toast.error(err.message || t('user_mgmt.toast_delete_error'));
      }
    }
  };

  const handleResetPassword = async (user) => {
    try {
      const res = await resetUserPassword(user.id);
      toast.success(t('user_mgmt.toast_reset_success', { password: res.password }), { duration: 8000 });
    } catch (err) {
      const isNetworkError = err.message?.includes('fetch') || err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch');
      if (!isNetworkError) {
        toast.error(err.message || t('user_mgmt.toast_reset_error'));
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const updated = await updateAdminUser(editingUser.id, {
        name: editingUser.name,
        role: editingUser.role,
        plan: editingUser.plan
      });
      setUsers((current) => current.map((item) => item.id === editingUser.id ? updated : item));
      toast.success(t('user_mgmt.toast_update_success'));
      setEditingUser(null);
    } catch (err) {
      const isNetworkError = err.message?.includes('fetch') || err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch');
      if (!isNetworkError) {
        toast.error(err.message || t('user_mgmt.toast_update_error'));
      }
    }
  };

  const mappedUsers = useMemo(() => {
    const apiHistory = readArrayStorage('api_fe_api_test_history', []);
    const projects = readArrayStorage('api_fe_projects', []);
    return users.map(u => mapUserToTableRow(u, apiHistory, projects));
  }, [users]);

  const filteredUsers = useMemo(() => {
    let result = mappedUsers;
    const keyword = search.trim().toLowerCase();
    if (keyword) {
      result = result.filter((user) => (
        user.displayName?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.role?.toLowerCase().includes(keyword)
      ));
    }
    if (roleFilter !== 'ALL') {
      result = result.filter(user => user.role === roleFilter);
    }
    if (statusFilter !== 'ALL') {
      result = result.filter(user => user.status === statusFilter);
    }
    return result;
  }, [mappedUsers, search, roleFilter, statusFilter]);

  const sortedUsers = useMemo(() => {
    let result = [...filteredUsers];
    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'member') {
          aVal = a.displayName || a.email || '';
          bVal = b.displayName || b.email || '';
        }

        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return result;
  }, [filteredUsers, sortConfig]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('user_mgmt.title')}</h1>
          <p className="text-slate-400">{t('user_mgmt.desc')}</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('user_mgmt.search_placeholder')}
              className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`p-2 bg-slate-900 border rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all ${
                showFilterDropdown ? 'border-violet-500 text-white bg-white/5' : 'border-white/10'
              }`}
              title="Lọc thành viên"
            >
              <Filter className="w-4 h-4" />
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-4 z-20 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('user_mgmt.filter_label_role')}</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-xs text-white outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="ALL">{t('user_mgmt.filter_all')}</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="USER">USER</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('user_mgmt.filter_label_status')}</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-xs text-white outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="ALL">{t('user_mgmt.filter_all')}</option>
                    <option value="ACTIVE">{t('user_mgmt.status_active')}</option>
                    <option value="BANNED">{t('user_mgmt.status_suspended')}</option>
                    <option value="PENDING">{t('user_mgmt.status_pending')}</option>
                  </select>
                </div>
                
                {(roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
                  <button
                    onClick={() => { setRoleFilter('ALL'); setStatusFilter('ALL'); }}
                    className="w-full py-1 text-center text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    {t('user_mgmt.filter_reset')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {loading && (
        <div className="rounded-2xl border border-white/5 bg-slate-900 p-8 text-center text-slate-400">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-violet-400" />
          {t('user_mgmt.loading')}
        </div>
      )}

      {!loading && error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">{error}</div>}

      {!loading && !error && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 table-auto min-w-[1000px]">
              <thead className="bg-white/5 text-xs uppercase font-semibold text-slate-400 border-b border-white/5">
                <tr>
                  <SortHeader columnKey="id" label={t('user_mgmt.col_id')} sortConfig={sortConfig} onRequestSort={requestSort} />
                  <SortHeader columnKey="member" label={t('user_mgmt.col_member')} sortConfig={sortConfig} onRequestSort={requestSort} />
                  <SortHeader columnKey="role" label={t('user_mgmt.col_role')} sortConfig={sortConfig} onRequestSort={requestSort} />
                  <SortHeader columnKey="plan" label={t('user_mgmt.col_plan')} sortConfig={sortConfig} onRequestSort={requestSort} />
                  <th className="px-6 py-4">{t('user_mgmt.col_api_usage')}</th>
                  <SortHeader columnKey="status" label={t('user_mgmt.col_status')} sortConfig={sortConfig} onRequestSort={requestSort} />
                  <th className="px-6 py-4">{t('user_mgmt.col_last_login')}</th>
                  <SortHeader columnKey="createdAt" label={t('user_mgmt.col_date')} sortConfig={sortConfig} onRequestSort={requestSort} />
                  <th className="px-6 py-4 text-right">{t('user_mgmt.col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedUsers.map((user) => {
                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400 bg-slate-950/50 border border-white/5 px-2.5 py-1 rounded-lg w-fit">
                          <span>{user.id.substring(0, 8)}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(user.id);
                              toast.success(t('chat_dmp.chat_tab.copied_toast') || 'Copied!');
                            }}
                            className="p-1 hover:bg-white/10 text-slate-500 hover:text-white rounded transition-all"
                            title="Copy ID"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>

                      {/* Member */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-white truncate max-w-[150px]">{user.displayName}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[180px]">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                          {user.role || 'USER'}
                        </span>
                      </td>

                      {/* Plan */}
                      <td className="px-6 py-4">{getPlanLabel(user)}</td>

                      {/* API Usage */}
                      <td className="px-6 py-4">
                        <span className="text-slate-300 text-xs font-semibold">
                          {user.apiUsage !== null && user.apiUsage !== undefined ? user.apiUsage : '--'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`flex items-center gap-1.5 cursor-pointer ${getStatusColor(user.status)}`}
                          onClick={() => {
                            const next = user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
                            setStatusConfirmUser({ user, nextStatus: next });
                          }}
                          title="Nhấp để đổi trạng thái"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${getStatusDotClass(user.status)}`} />
                          {user.status === 'ACTIVE'
                            ? t('user_mgmt.status_active')
                            : user.status === 'BANNED' || user.status === 'INACTIVE'
                            ? t('user_mgmt.status_suspended')
                            : t('user_mgmt.status_pending')}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : '--'}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-slate-400">{formatDate(user.createdAt)}</td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setEditingUser({ ...user })}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setResetConfirmUser(user)}
                          className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmUser(user)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-white/5 rounded-lg transition-colors"
                          title="Xóa người dùng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan="9" className="px-6 py-10 text-center text-slate-500">{t('user_mgmt.no_users_matching')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-white/3 border-t border-white/5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 bg-white/5 hover:bg-white/10 rounded-xl transition-all disabled:cursor-not-allowed border border-white/5"
              >
                {t('user_mgmt.page_prev')}
              </button>
              <span className="text-xs font-semibold text-slate-400">
                {t('user_mgmt.page_info', { page: currentPage, totalPages })}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 bg-white/5 hover:bg-white/10 rounded-xl transition-all disabled:cursor-not-allowed border border-white/5"
              >
                {t('user_mgmt.page_next')}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setEditingUser(null)}></div>

          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Edit className="text-violet-400" size={18} />
                {t('user_mgmt.modal_edit_title')}
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('edit_profile.display_name')}</label>
                <input
                  type="text"
                  value={editingUser.name || editingUser.username || ''}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('user_mgmt.modal_role_label')}</label>
                  <select
                    value={editingUser.role || 'USER'}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setEditingUser({
                        ...editingUser,
                        role: newRole,
                        plan: newRole === 'ADMIN' ? '--' : (editingUser.plan === '--' ? 'Free' : editingUser.plan)
                      });
                    }}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm font-medium text-white appearance-none outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all cursor-pointer shadow-inner"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('user_mgmt.modal_plan_label')}</label>
                  <select
                    value={editingUser.role === 'ADMIN' ? '--' : (editingUser.plan || 'Free')}
                    onChange={(e) => setEditingUser({...editingUser, plan: e.target.value})}
                    disabled={editingUser.role === 'ADMIN'}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm font-medium text-white appearance-none outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all cursor-pointer shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingUser.role === 'ADMIN' ? (
                      <option value="--">--</option>
                    ) : (
                      <>
                        <option value="Free">Free</option>
                        <option value="Pro">Pro</option>
                        <option value="Ultra">Ultra</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setEditingUser(null)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  {t('user_mgmt.modal_btn_cancel')}
                </button>
                <button type="submit" className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-500/20 active:scale-95">
                  {t('user_mgmt.modal_btn_save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirm Modal */}
      {deleteConfirmUser && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center px-6 bg-black/35 backdrop-blur-[1px]"
          onClick={() => setDeleteConfirmUser(null)}
        >
          <div
            className="relative w-full max-w-[360px] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
            style={{ background: 'linear-gradient(135deg, rgba(30,30,60,0.95) 0%, rgba(15,15,35,0.98) 100%)', boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(239,68,68,0.08)' }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

            <div className="p-6">
              {/* Icon + title */}
              <div className="flex flex-col items-center text-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl scale-150" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20 flex items-center justify-center">
                    <Trash2 size={24} className="text-red-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight">{t('user_mgmt.delete_confirm_title')}</h3>
                  <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                    {t('user_mgmt.delete_confirm_desc', { name: deleteConfirmUser.name || deleteConfirmUser.username })}
                  </p>
                  <p className="text-slate-600 text-xs mt-2">{t('user_mgmt.delete_confirm_warning')}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmUser(null)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-300 hover:text-white rounded-xl transition-all duration-200 border border-white/8 hover:border-white/15 hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  {t('user_mgmt.delete_confirm_btn_cancel')}
                </button>
                <button
                  onClick={() => {
                    handleDeleteUser(deleteConfirmUser);
                    setDeleteConfirmUser(null);
                  }}
                  className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:brightness-110 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 20px rgba(239,68,68,0.35)' }}
                >
                  {t('user_mgmt.delete_confirm_btn_delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Status Confirm Modal */}
      {statusConfirmUser && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center px-6 bg-black/35 backdrop-blur-[1px]"
          onClick={() => setStatusConfirmUser(null)}
        >
          <div
            className="relative w-full max-w-[360px] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
            style={{ background: 'linear-gradient(135deg, rgba(30,30,60,0.95) 0%, rgba(15,15,35,0.98) 100%)', boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(99,102,241,0.08)' }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

            <div className="p-6">
              {/* Icon + title */}
              <div className="flex flex-col items-center text-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-xl scale-150" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                    <Filter size={24} className="text-violet-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight">{t('user_mgmt.status_confirm_title')}</h3>
                  <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                    {t('user_mgmt.status_confirm_desc', { 
                      name: statusConfirmUser.user.name || statusConfirmUser.user.username || statusConfirmUser.user.email,
                      status: statusConfirmUser.nextStatus === 'ACTIVE' ? t('user_mgmt.status_active') : t('user_mgmt.status_suspended')
                    })}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStatusConfirmUser(null)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-300 hover:text-white rounded-xl transition-all duration-200 border border-white/8 hover:border-white/15 hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  {t('user_mgmt.delete_confirm_btn_cancel')}
                </button>
                <button
                  onClick={() => {
                    handleToggleStatus(statusConfirmUser.user, statusConfirmUser.nextStatus);
                    setStatusConfirmUser(null);
                  }}
                  className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:brightness-110 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}
                >
                  {t('user_mgmt.status_confirm_btn_change')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Reset Password Modal */}
      {resetConfirmUser && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center px-6 bg-black/35 backdrop-blur-[1px]"
          onClick={() => setResetConfirmUser(null)}
        >
          <div
            className="relative w-full max-w-[360px] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
            style={{ background: 'linear-gradient(135deg, rgba(30,30,60,0.95) 0%, rgba(15,15,35,0.98) 100%)', boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(99,102,241,0.08)' }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

            <div className="p-6">
              {/* Icon + title */}
              <div className="flex flex-col items-center text-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl scale-150" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center">
                    <Key size={24} className="text-amber-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight">{t('user_mgmt.reset_confirm_title')}</h3>
                  <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                    {t('user_mgmt.reset_confirm_desc', { name: resetConfirmUser.name || resetConfirmUser.username || resetConfirmUser.email })}
                  </p>
                  <p className="text-slate-500 text-xs mt-2">{t('user_mgmt.reset_confirm_warning')}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setResetConfirmUser(null)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-300 hover:text-white rounded-xl transition-all duration-200 border border-white/8 hover:border-white/15 hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  {t('user_mgmt.reset_confirm_btn_cancel')}
                </button>
                <button
                  onClick={() => {
                    handleResetPassword(resetConfirmUser);
                    setResetConfirmUser(null);
                  }}
                  className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:brightness-110 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 20px rgba(245,158,11,0.35)' }}
                >
                  {t('user_mgmt.reset_confirm_btn_reset')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
