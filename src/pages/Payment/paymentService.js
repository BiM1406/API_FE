import {
  MOCK_BANK_INFO,
  MOCK_PAYMENT_PLAN,
  PAYMENT_EXPIRE_MINUTES,
  PAYMENT_STATUS,
  PAYMENT_STORAGE_KEYS
} from './paymentConstants';
import { activateSubscription, clearSelectedPlan, getSelectedPlan } from '../../services/profileService';

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

const createPaymentId = () => {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `pay_${Date.now().toString(36)}_${random}`;
};

const createOrderCode = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(100000 + Math.random() * 900000);

  return `API_FE_${year}${month}${day}_${random}`;
};

const isFinalStatus = (status) => [
  PAYMENT_STATUS.PAID,
  PAYMENT_STATUS.CANCELLED,
  PAYMENT_STATUS.FAILED,
  PAYMENT_STATUS.EXPIRED
].includes(status);

const isPaymentExpired = (payment) => {
  if (!payment?.expiredAt) return true;
  return new Date(payment.expiredAt).getTime() <= Date.now();
};

const isSamePlan = (payment, plan) => (
  payment?.planId === plan?.planId &&
  payment?.planName === plan?.planName &&
  payment?.cycle === plan?.cycle &&
  Number(payment?.amount) === Number(plan?.amount ?? plan?.price)
);

export const createMockPayment = (plan = MOCK_PAYMENT_PLAN) => {
  if (!plan?.planId || plan.planId === 'free') {
    throw new Error('Vui lòng chọn gói dịch vụ cần thanh toán');
  }

  const createdAt = new Date();
  const expiredAt = new Date(createdAt.getTime() + PAYMENT_EXPIRE_MINUTES * 60 * 1000);
  const orderCode = createOrderCode();
  const amount = Number(plan.amount ?? plan.price ?? 0);
  const payment = {
    id: createPaymentId(),
    orderCode,
    planId: plan.planId,
    planName: plan.planName,
    cycle: plan.cycle,
    amount,
    price: amount,
    provider: plan.provider || 'Sepay',
    ...MOCK_BANK_INFO,
    transferContent: `${plan.planId}_${orderCode}`,
    status: PAYMENT_STATUS.PENDING,
    createdAt: createdAt.toISOString(),
    expiredAt: expiredAt.toISOString(),
    paidAt: null
  };

  return saveCurrentPayment(payment);
};

export const getCurrentPayment = () => {
  const rawPayment = safeGetItem(PAYMENT_STORAGE_KEYS.CURRENT_PAYMENT);
  if (!rawPayment) return null;

  const payment = parseJson(rawPayment, null);
  if (!payment) {
    safeRemoveItem(PAYMENT_STORAGE_KEYS.CURRENT_PAYMENT);
    return null;
  }

  return payment;
};

export const saveCurrentPayment = (payment) => {
  if (!payment) return null;
  safeSetItem(PAYMENT_STORAGE_KEYS.CURRENT_PAYMENT, JSON.stringify(payment));
  return payment;
};

export const getPaymentHistory = () => {
  const rawHistory = safeGetItem(PAYMENT_STORAGE_KEYS.PAYMENT_HISTORY);
  if (!rawHistory) return [];

  const history = parseJson(rawHistory, []);
  if (!Array.isArray(history)) {
    safeSetItem(PAYMENT_STORAGE_KEYS.PAYMENT_HISTORY, JSON.stringify([]));
    return [];
  }

  return history;
};

export const savePaymentToHistory = (payment) => {
  if (!payment?.orderCode) return getPaymentHistory();

  const history = getPaymentHistory();
  const filteredHistory = history.filter((item) => item.orderCode !== payment.orderCode);
  const nextHistory = [payment, ...filteredHistory];
  safeSetItem(PAYMENT_STORAGE_KEYS.PAYMENT_HISTORY, JSON.stringify(nextHistory));
  return nextHistory;
};

export const updatePaymentStatus = (orderCode, status) => {
  const currentPayment = getCurrentPayment();
  if (!currentPayment || currentPayment.orderCode !== orderCode) return currentPayment;

  const updatedPayment = {
    ...currentPayment,
    status,
    paidAt: status === PAYMENT_STATUS.PAID ? new Date().toISOString() : currentPayment.paidAt
  };

  saveCurrentPayment(updatedPayment);

  if (isFinalStatus(status)) {
    savePaymentToHistory(updatedPayment);
  }

  return updatedPayment;
};

export const markPaymentPaid = (orderCode) => updatePaymentStatus(orderCode, PAYMENT_STATUS.PAID);

export const cancelPayment = (orderCode) => updatePaymentStatus(orderCode, PAYMENT_STATUS.CANCELLED);

export const expirePayment = (orderCode) => updatePaymentStatus(orderCode, PAYMENT_STATUS.EXPIRED);

export const failPayment = (orderCode) => updatePaymentStatus(orderCode, PAYMENT_STATUS.FAILED);

export const clearCurrentPayment = () => {
  safeRemoveItem(PAYMENT_STORAGE_KEYS.CURRENT_PAYMENT);
};

export const getPlanForPayment = () => getSelectedPlan();

export const createOrGetCurrentPayment = (plan = MOCK_PAYMENT_PLAN) => {
  const currentPayment = getCurrentPayment();

  if (!currentPayment) return createMockPayment(plan);

  if (
    currentPayment.status === PAYMENT_STATUS.PENDING &&
    !isPaymentExpired(currentPayment) &&
    isSamePlan(currentPayment, plan)
  ) {
    return currentPayment;
  }

  if (currentPayment.status === PAYMENT_STATUS.PENDING && isPaymentExpired(currentPayment)) {
    expirePayment(currentPayment.orderCode);
  }

  return createMockPayment(plan);
};

export const activatePaidSubscription = async () => {
  const payment = getCurrentPayment();
  const selectedPlan = getSelectedPlan();

  if (!payment || payment.status !== PAYMENT_STATUS.PAID) {
    throw new Error('Chưa có giao dịch đã thanh toán');
  }

  const plan = selectedPlan?.planId === payment.planId ? selectedPlan : {
    planId: payment.planId,
    planName: payment.planName,
    price: payment.amount,
    cycle: payment.cycle
  };

  const subscription = await activateSubscription(plan, payment);
  savePaymentToHistory({ ...payment, subscriptionActivatedAt: subscription.activatedAt || new Date().toISOString() });
  clearSelectedPlan();
  return subscription;
};
