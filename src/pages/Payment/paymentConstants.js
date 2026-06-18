export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

export const PAYMENT_STORAGE_KEYS = {
  CURRENT_PAYMENT: 'api_fe_current_payment',
  PAYMENT_HISTORY: 'api_fe_payment_history'
};

export const PLAN_PRICES = {
  Free: 0,
  Pro: 199999,
  Ultra: 999999,
};

export const PLANS = [
  {
    planId: 'free',
    planName: 'Free',
    price: 0,
    cycle: 'tháng',
    description: 'Gói miễn phí cho người dùng mới'
  },
  {
    planId: 'pro',
    planName: 'Pro',
    price: 199999,
    cycle: 'tháng',
    badge: 'PHỔ BIẾN',
    description: 'Gói nâng cao cho người dùng chuyên nghiệp'
  },
  {
    planId: 'ultra',
    planName: 'Ultra',
    price: 999999,
    cycle: 'tháng',
    description: 'Gói cao cấp với đầy đủ tính năng'
  }
];

export const PLAN_LIMITS = {
  free: {
    projects: 1,
    apiRequestsPerDay: 100,
    aiMessagesPerMonth: 100,
    storageMb: 100
  },
  pro: {
    projects: 10,
    apiRequestsPerDay: 5000,
    aiMessagesPerMonth: 5000,
    storageMb: 2048
  },
  ultra: {
    projects: -1,
    apiRequestsPerDay: -1,
    aiMessagesPerMonth: -1,
    storageMb: 10240
  }
};

export const MOCK_PAYMENT_PLAN = {
  planName: 'Pro',
  cycle: 'monthly',
  amount: 199999,
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

