export * from './billing.service';

export function calculateRevenue(payments = []) {
  const paidPayments = payments.filter((item) => ['PAID', 'SUCCESS'].includes(item.status));
  return {
    total: paidPayments.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    isEstimated: false,
    transactions: payments
  };
}

export function calculateDailyRevenue(payments = []) {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recent = payments.filter((payment) => (
    ['PAID', 'SUCCESS'].includes(payment.status) &&
    new Date(payment.createdAt || payment.paidAt || 0).getTime() >= oneDayAgo
  ));

  return {
    revenue: recent.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    count: recent.length
  };
}

export async function readPaymentHistory() {
  const { getPaymentHistory } = await import('./billing.service');
  return getPaymentHistory();
}

export async function writePaymentHistory(payments) {
  return payments;
}

export async function addPayment(payment) {
  const { createPayment } = await import('./billing.service');
  return createPayment(payment);
}
