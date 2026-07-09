import {
  cancelPayment as cancelPaymentApi,
  confirmPayment,
  createPayment,
  getPaymentByOrderCode,
  getCurrentPayment as getCurrentPaymentApi
} from '../../services/billing.service';

let currentPaymentCache = null;

export const createMockPayment = async (plan) => {
  currentPaymentCache = await createPayment(plan);
  return currentPaymentCache;
};

export const getCurrentPayment = () => currentPaymentCache;

export const fetchCurrentPayment = async () => {
  currentPaymentCache = await getCurrentPaymentApi();
  return currentPaymentCache;
};

export const saveCurrentPayment = (payment) => {
  currentPaymentCache = payment;
  return payment;
};

export const updatePaymentStatus = async (orderCode, status) => {
  if (status === 'PAID') return markPaymentPaid(orderCode);
  if (status === 'CANCELLED') return cancelPayment(orderCode);
  return currentPaymentCache;
};

export const markPaymentPaid = async (orderCode) => {
  currentPaymentCache = await confirmPayment(orderCode);
  return currentPaymentCache;
};

export const fetchPaymentByOrderCode = async (orderCode) => {
  currentPaymentCache = await getPaymentByOrderCode(orderCode);
  return currentPaymentCache;
};

export const cancelPayment = async (orderCode) => {
  currentPaymentCache = await cancelPaymentApi(orderCode);
  return currentPaymentCache;
};

export const expirePayment = async (orderCode) => {
  currentPaymentCache = await cancelPaymentApi(orderCode);
  return currentPaymentCache;
};

export const failPayment = async () => currentPaymentCache;

export const getPaymentHistory = async () => {
  const { getPaymentHistory: getHistory } = await import('../../services/billing.service');
  return getHistory();
};

export const savePaymentToHistory = async () => getPaymentHistory();

export const clearCurrentPayment = () => {
  currentPaymentCache = null;
};

export const createOrGetCurrentPayment = async (plan) => {
  const current = await getCurrentPaymentApi();
  if (current) {
    currentPaymentCache = current;
    return current;
  }
  return createMockPayment(plan);
};
