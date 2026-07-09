import api, { normalizeApiError, unwrap } from './api';

const listFrom = (payload, key) => Array.isArray(payload) ? payload : payload?.[key] || payload?.items || [];
const normalizePaymentPayload = (payload = {}) => ({
  planCode: payload.planCode || payload.planId || payload.code || String(payload.planName || '').toLowerCase(),
  cycle: payload.cycle || 'monthly'
});

export async function getPlans() {
  try {
    return listFrom(unwrap(await api.get('/plans')), 'plans');
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tải gói dịch vụ');
  }
}

export async function getSubscription() {
  try {
    return unwrap(await api.get('/subscription'));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tải subscription');
  }
}

export async function updateSubscription(payload) {
  try {
    return unwrap(await api.post('/subscription', payload));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể cập nhật subscription');
  }
}

export async function createPayment(payload) {
  try {
    return unwrap(await api.post('/payments', normalizePaymentPayload(payload)));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tạo thanh toán');
  }
}

export async function getCurrentPayment() {
  try {
    return unwrap(await api.get('/payments/current'));
  } catch (error) {
    if (error?.response?.status === 404) return null;
    throw normalizeApiError(error, 'Không thể tải thanh toán hiện tại');
  }
}

export async function confirmPayment(orderCode) {
  try {
    return unwrap(await api.post(`/payments/${orderCode}/confirm`));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể xác nhận thanh toán');
  }
}

export async function getPaymentByOrderCode(orderCode) {
  try {
    return unwrap(await api.get(`/payments/${orderCode}`));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tải trạng thái thanh toán');
  }
}

export async function cancelPayment(orderCode) {
  try {
    return unwrap(await api.post(`/payments/${orderCode}/cancel`));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể hủy thanh toán');
  }
}

export async function getPaymentHistory() {
  try {
    return listFrom(unwrap(await api.get('/payment-history')), 'payments');
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tải lịch sử thanh toán');
  }
}
