// src/pages/Dashboard/adminOverview.helpers.js
// Helpers and mappers for the Admin Overview Dashboard.
// Avoids raw data manipulations or complex calculations in JSX.

export const PLAN_PRICES = {
  Free: 0,
  Pro: 199999,
  Ultra: 999999,
};

/**
 * Formats a numeric currency value into a Vietnamese Dong string representation.
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(Number(amount || 0)) + 'đ';
};

/**
 * Calculates the total number of users.
 */
export const calculateTotalUsers = (users) => {
  return Array.isArray(users) ? users.length : 0;
};

/**
 * Calculates the total number of projects.
 */
export const calculateTotalProjects = (projects) => {
  return Array.isArray(projects) ? projects.length : 0;
};

/**
 * Resolves the accurate plan of a user.
 */
export const getUserPlan = (user) => {
  if (!user) return 'Free';
  if (user.role === 'ADMIN') return '--';
  return user.plan || 'Free';
};

/**
 * Resolves the price of a plan.
 */
export const getPlanPrice = (plan) => {
  if (!plan) return 0;
  return PLAN_PRICES[plan] || 0;
};

/**
 * Computes revenue from paid transactions, or falls back to active subscriptions if zero.
 */
export const calculateRevenue = (users = [], transactions = []) => {
  const paidPayments = transactions.filter((item) => ['PAID', 'SUCCESS'].includes(item.status));
  let total = paidPayments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  let isEstimated = false;

  if (total === 0) {
    const activeSubRevenue = users
      .filter(u => u.role !== 'ADMIN' && u.status === 'ACTIVE')
      .reduce((sum, u) => sum + getPlanPrice(u.plan), 0);
    
    if (activeSubRevenue > 0) {
      total = activeSubRevenue;
      isEstimated = true;
    }
  }

  return { total, isEstimated };
};

/**
 * Maps and normalizes raw transaction objects for display in the recent transaction list.
 */
export const mapRecentTransactions = (transactions = [], limit = 5) => {
  return (transactions || [])
    .slice(0, limit)
    .map(tx => ({
      id: tx.id,
      orderCode: tx.orderCode || tx.id || '--',
      planName: tx.planName === 'Pro Plan' ? 'Pro' : (tx.planName || 'Free'),
      amount: Number(tx.amount || 0),
      status: tx.status || 'PENDING',
      paidAt: tx.paidAt || tx.createdAt || null
    }));
};
