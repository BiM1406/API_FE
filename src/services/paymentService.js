/**
 * paymentService.js
 * 
 * Hợp nhất toàn bộ logic API thanh toán, lịch sử giao dịch và doanh thu cho cả Client và Admin.
 * Hỗ trợ chuyển đổi (switch) động qua biến môi trường VITE_USE_MOCK_PAYMENT.
 */

import { api, mockDelay } from './api';
import { getCurrentUser } from './authService';
import { readArrayStorage, writeStorage } from '../utils/storage';
import { OVERVIEW_REVENUE_WINDOW_HOURS } from '../config/adminConfig';
import {
  MOCK_BANK_INFO,
  MOCK_PAYMENT_PLAN,
  PAYMENT_EXPIRE_MINUTES,
  PAYMENT_STATUS,
  PAYMENT_STORAGE_KEYS,
  PLAN_PRICES
} from '../pages/Payment/paymentConstants';

// Kiểm tra biến môi trường để switch logic Mock / API
const USE_MOCK_PAYMENT = import.meta.env.VITE_USE_MOCK_PAYMENT === 'true' || !import.meta.env.VITE_API_BASE_URL;

const PAYMENT_KEY = PAYMENT_STORAGE_KEYS.PAYMENT_HISTORY || 'api_fe_payment_history';

// ----------------------------------------------------
// STORAGE UTILITIES
// ----------------------------------------------------
const getCurrentPaymentKey = () => {
  const user = getCurrentUser();
  return user ? `${PAYMENT_STORAGE_KEYS.CURRENT_PAYMENT || 'api_fe_current_payment'}_${user.id}` : (PAYMENT_STORAGE_KEYS.CURRENT_PAYMENT || 'api_fe_current_payment');
};

const isBrowserStorageAvailable = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const safeGetItem = (key) => {
  if (!isBrowserStorageAvailable()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key, value) => {
  if (!isBrowserStorageAvailable()) return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const safeRemoveItem = (key) => {
  if (!isBrowserStorageAvailable()) return false;
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

const parseJson = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

// ----------------------------------------------------
// HELPER LOGIC FOR DURATION / MATCHING
// ----------------------------------------------------
const isPaymentExpired = (payment) => {
  if (!payment?.expiredAt) return true;
  return new Date(payment.expiredAt).getTime() <= Date.now();
};

const isSamePlan = (payment, plan) => {
  const planCode = (plan?.planName || '').toLowerCase();
  const paymentPlanCode = (payment?.planName || '').toLowerCase();
  let cycle = 'monthly';
  const cycleLower = String(plan?.cycle || '').toLowerCase();
  if (cycleLower.includes('year') || cycleLower.includes('năm') || cycleLower.includes('yearly')) {
    cycle = 'yearly';
  }
  const paymentCycle = String(payment?.cycle || '').toLowerCase();
  return paymentPlanCode === planCode && paymentCycle === cycle;
};

// ----------------------------------------------------
// LOCAL MOCK UTILITIES (For fallback or mock mode)
// ----------------------------------------------------
const createLocalMockPayment = (plan, planCode, cycle) => {
  const user = getCurrentUser();
  const createdAt = new Date();
  const expiredAt = new Date(createdAt.getTime() + PAYMENT_EXPIRE_MINUTES * 60 * 1000);
  const orderCode = `PAY${Date.now()}`;
  const fallbackPayment = {
    id: `pay_${Date.now()}`,
    userId: user?.id || null,
    orderCode,
    planName: plan.planName || 'Pro',
    cycle,
    amount: plan.amount || (planCode === 'ultra' ? 999999 : 199999),
    provider: 'BANK_TRANSFER',
    bankName: MOCK_BANK_INFO.bankName,
    accountName: MOCK_BANK_INFO.accountName,
    accountNumber: MOCK_BANK_INFO.accountNumber,
    transferContent: orderCode,
    status: PAYMENT_STATUS.PENDING,
    createdAt: createdAt.toISOString(),
    expiredAt: expiredAt.toISOString(),
    paidAt: null
  };
  saveCurrentPayment(fallbackPayment);
  return fallbackPayment;
};

// ----------------------------------------------------
// CORE PAYMENT API & FLOW
// ----------------------------------------------------

export const createPayment = async (plan = MOCK_PAYMENT_PLAN) => {
  const planCode = (plan?.planName || 'Pro').toLowerCase();
  let cycle = 'monthly';
  const cycleLower = String(plan?.cycle || '').toLowerCase();
  if (cycleLower.includes('year') || cycleLower.includes('năm') || cycleLower.includes('yearly')) {
    cycle = 'yearly';
  }

  if (USE_MOCK_PAYMENT) {
    console.log('Using mock payment creation (VITE_USE_MOCK_PAYMENT mode)');
    return createLocalMockPayment(plan, planCode, cycle);
  }

  try {
    const response = await api.post('/payments', { planCode, cycle });
    if (response && response.success && response.data) {
      const payment = response.data;
      saveCurrentPayment(payment);
      return payment;
    }
    throw new Error(response?.message || 'Failed to create payment from API');
  } catch (err) {
    console.error('Failed to create payment from API, using fallback:', err);
    return createLocalMockPayment(plan, planCode, cycle);
  }
};

export const createMockPayment = createPayment;

export const getCurrentPayment = () => {
  const rawPayment = safeGetItem(getCurrentPaymentKey());
  if (!rawPayment) return null;
  const payment = parseJson(rawPayment, null);
  if (!payment) {
    safeRemoveItem(getCurrentPaymentKey());
    return null;
  }
  return payment;
};

export const saveCurrentPayment = (payment) => {
  if (!payment) return null;
  safeSetItem(getCurrentPaymentKey(), JSON.stringify(payment));
  return payment;
};

export const clearCurrentPayment = () => {
  safeRemoveItem(getCurrentPaymentKey());
};

export const getPaymentByOrderCode = async (orderCode) => {
  if (USE_MOCK_PAYMENT) {
    return getCurrentPayment();
  }

  try {
    const response = await api.get(`/payments/${orderCode}`);
    if (response && response.success && response.data) {
      return response.data;
    }
  } catch (err) {
    // Fallback: search in full history
    try {
      const historyResponse = await api.get('/payment-history');
      if (historyResponse && historyResponse.success && Array.isArray(historyResponse.data)) {
        return historyResponse.data.find((p) => p.orderCode === orderCode) || null;
      }
    } catch {
      // ignore
    }
    console.error('Failed to get payment by order code:', err);
  }
  return null;
};

export const confirmPayment = async (orderCode) => {
  if (USE_MOCK_PAYMENT) {
    console.log('Using mock payment confirmation (VITE_USE_MOCK_PAYMENT mode)');
    return updatePaymentStatus(orderCode, PAYMENT_STATUS.PAID);
  }

  try {
    const response = await api.post(`/payments/${orderCode}/confirm`);
    if (response && response.success && response.data) {
      const payment = response.data;
      saveCurrentPayment(payment);
      savePaymentToHistory(payment);
      return payment;
    }
    throw new Error(response?.message || 'Failed to confirm payment from API');
  } catch (err) {
    console.error('Failed to confirm payment on API, using fallback:', err);
    return updatePaymentStatus(orderCode, PAYMENT_STATUS.PAID);
  }
};

export const cancelPayment = async (orderCode) => {
  if (USE_MOCK_PAYMENT) {
    console.log('Using mock payment cancellation (VITE_USE_MOCK_PAYMENT mode)');
    return updatePaymentStatus(orderCode, PAYMENT_STATUS.CANCELLED);
  }

  try {
    const response = await api.post(`/payments/${orderCode}/cancel`);
    if (response && response.success && response.data) {
      const payment = response.data;
      saveCurrentPayment(payment);
      savePaymentToHistory(payment);
      return payment;
    }
    throw new Error(response?.message || 'Failed to cancel payment from API');
  } catch (err) {
    console.error('Failed to cancel payment on API, using fallback:', err);
    return updatePaymentStatus(orderCode, PAYMENT_STATUS.CANCELLED);
  }
};

export const expirePayment = async (orderCode) => {
  try {
    return await cancelPayment(orderCode);
  } catch {
    return updatePaymentStatus(orderCode, PAYMENT_STATUS.EXPIRED);
  }
};

export const failPayment = async (orderCode) => {
  return updatePaymentStatus(orderCode, PAYMENT_STATUS.FAILED);
};

export const updatePaymentStatus = (orderCode, status) => {
  const currentPayment = getCurrentPayment();
  if (!currentPayment || currentPayment.orderCode !== orderCode) {
    return currentPayment;
  }

  const updatedPayment = {
    ...currentPayment,
    status,
    paidAt: status === PAYMENT_STATUS.PAID ? new Date().toISOString() : currentPayment.paidAt
  };

  saveCurrentPayment(updatedPayment);
  savePaymentToHistory(updatedPayment);
  return updatedPayment;
};

export const markPaymentPaid = confirmPayment;

// ----------------------------------------------------
// HISTORY & REVENUE LOGIC (Client & Admin)
// ----------------------------------------------------

export const readPaymentHistory = () => readArrayStorage(PAYMENT_KEY, []);

export const writePaymentHistory = (payments) => writeStorage(PAYMENT_KEY, payments);

export const getPaymentHistory = async () => {
  if (USE_MOCK_PAYMENT) {
    const rawHistory = safeGetItem(PAYMENT_KEY);
    return mockDelay(parseJson(rawHistory, []));
  }

  try {
    const response = await api.get('/payment-history');
    if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    }
  } catch (err) {
    console.error('Failed to get payment history from API:', err);
  }
  
  const rawHistory = safeGetItem(PAYMENT_KEY);
  return parseJson(rawHistory, []);
};

export const savePaymentToHistory = (payment) => {
  if (!payment?.orderCode) return;
  try {
    const history = parseJson(safeGetItem(PAYMENT_KEY), []);
    const filtered = history.filter((item) => item.orderCode !== payment.orderCode);
    const nextHistory = [payment, ...filtered];
    safeSetItem(PAYMENT_KEY, JSON.stringify(nextHistory));
  } catch (e) {
    console.error('Failed to save payment to local history:', e);
  }
};

export async function addPayment(payment) {
  const payments = readPaymentHistory();
  const newPayment = {
    id: `PAY_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'PAID',
    ...payment,
  };
  writePaymentHistory([newPayment, ...payments]);
  return mockDelay(newPayment);
}

export const createOrGetCurrentPayment = async (plan = MOCK_PAYMENT_PLAN) => {
  const currentPayment = getCurrentPayment();

  if (!currentPayment) {
    return await createPayment(plan);
  }

  if (
    currentPayment.status === PAYMENT_STATUS.PENDING &&
    !isPaymentExpired(currentPayment) &&
    isSamePlan(currentPayment, plan)
  ) {
    const latest = await getPaymentByOrderCode(currentPayment.orderCode);
    if (latest) {
      saveCurrentPayment(latest);
      return latest;
    }
    return currentPayment;
  }

  if (currentPayment.status === PAYMENT_STATUS.PENDING && isPaymentExpired(currentPayment)) {
    await expirePayment(currentPayment.orderCode);
  }

  return await createPayment(plan);
};

export function calculateRevenue(payments, users = []) {
  const txList = payments ?? readPaymentHistory();
  const paidPayments = txList.filter((item) =>
    ['PAID', 'SUCCESS', 'SUCCESSFUL'].includes(item.status)
  );
  let total = paidPayments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  let isEstimated = false;

  // Nếu chưa có giao dịch thật, ước tính từ gói cước active của users
  if (total === 0 && users.length > 0) {
    const activeSubRevenue = users
      .filter((u) => u.role !== 'ADMIN' && u.status === 'ACTIVE')
      .reduce((sum, u) => sum + (PLAN_PRICES[u.plan] || 0), 0);

    if (activeSubRevenue > 0) {
      total = activeSubRevenue;
      isEstimated = true;
    }
  }

  return { total, isEstimated, transactions: txList };
}

export function calculateDailyRevenue(payments) {
  const txList = payments ?? readPaymentHistory();
  const oneDayAgo = Date.now() - OVERVIEW_REVENUE_WINDOW_HOURS * 60 * 60 * 1000;
  const recent = txList.filter((p) =>
    ['PAID', 'SUCCESS', 'SUCCESSFUL'].includes(p.status) &&
    new Date(p.createdAt || p.paidAt || 0).getTime() >= oneDayAgo
  );
  return {
    revenue: recent.reduce((sum, p) => sum + Number(p.amount || 0), 0),
    count: recent.length,
  };
}
