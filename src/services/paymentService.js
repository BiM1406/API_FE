/**
 * paymentService.js
 * 
 * Tập trung toàn bộ logic đọc/ghi lịch sử giao dịch và tính doanh thu.
 * 
 * Cách dùng hiện tại: dùng localStorage làm mock database.
 * Khi có Backend thật: thay các hàm bên dưới bằng API calls tương ứng.
 *   - getPaymentHistory()  → GET /api/payments
 *   - addPayment()         → POST /api/payments
 *   - calculateRevenue()   → tính từ data trả về GET /api/payments
 */
import { mockDelay } from './api';
import { readStorage, writeStorage } from '../utils/storage';
import { PLAN_PRICES } from '../pages/Payment/paymentConstants';
import { OVERVIEW_REVENUE_WINDOW_HOURS } from '../config/adminConfig';

const PAYMENT_KEY = 'api_fe_payment_history';

/**
 * Đọc toàn bộ lịch sử giao dịch.
 * @returns {Array} Mảng payment objects
 */
export const readPaymentHistory = () => readStorage(PAYMENT_KEY, []);

/**
 * Ghi lại toàn bộ lịch sử giao dịch (dùng nội bộ hoặc khi cần seed data).
 * @param {Array} payments
 */
export const writePaymentHistory = (payments) => writeStorage(PAYMENT_KEY, payments);

/**
 * Lấy lịch sử giao dịch (async — dễ thay bằng API call).
 * @returns {Promise<Array>}
 */
export async function getPaymentHistory() {
  return mockDelay(readPaymentHistory());
}

/**
 * Thêm một giao dịch mới vào lịch sử.
 * @param {Object} payment - Object giao dịch (amount, status, planName, ...)
 * @returns {Promise<Object>} payment vừa thêm
 */
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

/**
 * Tính tổng doanh thu từ danh sách giao dịch PAID/SUCCESS.
 * @param {Array} [payments] - Nếu không truyền, tự đọc từ storage
 * @param {Array} [users] - Dùng để ước tính nếu không có giao dịch
 * @returns {{ total: number, isEstimated: boolean, transactions: Array }}
 */
export function calculateRevenue(payments, users = []) {
  const txList = payments ?? readPaymentHistory();
  const paidPayments = txList.filter((item) =>
    ['PAID', 'SUCCESS'].includes(item.status)
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

/**
 * Tính doanh thu trong 24h gần nhất.
 * @param {Array} [payments]
 * @returns {{ revenue: number, count: number }}
 */
export function calculateDailyRevenue(payments) {
  const txList = payments ?? readPaymentHistory();
  const oneDayAgo = Date.now() - OVERVIEW_REVENUE_WINDOW_HOURS * 60 * 60 * 1000;
  const recent = txList.filter((p) =>
    ['PAID', 'SUCCESS'].includes(p.status) &&
    new Date(p.createdAt || p.paidAt || 0).getTime() >= oneDayAgo
  );
  return {
    revenue: recent.reduce((sum, p) => sum + Number(p.amount || 0), 0),
    count: recent.length,
  };
}
