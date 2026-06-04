// src/pages/Dashboard/userManagement.helpers.js
// Tập hợp các helper functions để chuẩn hóa dữ liệu user trước khi render bảng.
// Không render dữ liệu raw hoặc hard-code logic trực tiếp trong JSX.

/**
 * Chuẩn hóa raw user object từ localStorage/API → dạng bảng hiển thị.
 * Không tự bịa dữ liệu, không fallback ngầm gây sai lệch.
 */
export function mapUserToTableRow(rawUser, apiHistory = [], projects = []) {
  const userApiHistory = Array.isArray(apiHistory) ? apiHistory.filter(h => {
    if (h.userId) {
      return h.userId === rawUser.id;
    }
    if (h.projectId) {
      const proj = projects.find(p => p.id === h.projectId);
      return proj && proj.ownerId === rawUser.id;
    }
    return false;
  }) : [];
  return {
    ...rawUser,
    id:          rawUser.id,
    displayName: rawUser.name || rawUser.username || '(Không tên)',
    email:       rawUser.email || '--',
    role:        rawUser.role || 'USER',
    plan:        rawUser.plan || null,       // null = chưa có gói, KHÔNG default 'Free'
    status:      rawUser.status || 'PENDING',
    createdAt:   rawUser.createdAt || null,
    lastLoginAt: rawUser.lastLoginAt || null,
    apiUsage:    rawUser.role === 'ADMIN' ? null : userApiHistory.length,
  };
}

/**
 * Trả về nhãn hiển thị gói cước.
 * ADMIN luôn hiển thị '--'.
 * User không có plan hiển thị 'Chưa có gói' thay vì giả 'Free'.
 */
export function getPlanLabel(user) {
  if (user.role === 'ADMIN') return '--';
  if (!user.plan) return 'Chưa có gói';
  return user.plan;
}

/**
 * Trả về Tailwind class cho badge Vai trò.
 */
export function getRoleBadgeClass(role) {
  if (role === 'ADMIN') return 'bg-violet-500/10 text-violet-400';
  return 'bg-slate-800 text-slate-300';
}

/**
 * Trả về Tailwind class cho badge Trạng thái.
 */
export function getStatusColor(status) {
  if (status === 'ACTIVE')    return 'text-emerald-400';
  if (status === 'BANNED' || status === 'INACTIVE') return 'text-rose-400';
  return 'text-amber-400'; // PENDING / unknown
}

export function getStatusDotClass(status) {
  if (status === 'ACTIVE')    return 'bg-emerald-400';
  if (status === 'BANNED' || status === 'INACTIVE') return 'bg-rose-400';
  return 'bg-amber-400';
}
