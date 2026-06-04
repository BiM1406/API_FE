export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

export const PAYMENT_STORAGE_KEYS = {
  CURRENT_PAYMENT: 'api_fe_current_payment',
  PAYMENT_HISTORY: 'api_fe_payment_history'
};

export const MOCK_PAYMENT_PLAN = {
  planName: 'Pro',
  cycle: 'monthly',
  amount: 199000,
  provider: 'Sepay'
};

export const MOCK_PAYMENT_PLANS = {
  pro: MOCK_PAYMENT_PLAN,
  ultra: {
    planName: 'Ultra',
    cycle: 'monthly',
    amount: 999999,
    provider: 'Sepay'
  }
};

export const MOCK_BANK_INFO = {
  bankName: 'MB Bank',
  accountName: 'API FE COMPANY',
  accountNumber: '123456789'
};

export const PAYMENT_EXPIRE_MINUTES = 15;
