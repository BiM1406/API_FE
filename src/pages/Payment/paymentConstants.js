export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

export const PAYMENT_STORAGE_KEYS = {
  SELECTED_PLAN: 'api_fe_selected_plan',
  CURRENT_PAYMENT: 'api_fe_current_payment',
  PAYMENT_HISTORY: 'api_fe_payment_history'
};

export const PAYMENT_PLANS = [
  {
    planId: 'free',
    planName: 'Miễn Phí',
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

export const MOCK_PAYMENT_PLAN = {
  ...PAYMENT_PLANS[1],
  amount: PAYMENT_PLANS[1].price,
  provider: 'Sepay'
};

export const MOCK_PAYMENT_PLANS = {
  pro: { ...PAYMENT_PLANS[1], amount: PAYMENT_PLANS[1].price, provider: 'Sepay' },
  ultra: { ...PAYMENT_PLANS[2], amount: PAYMENT_PLANS[2].price, provider: 'Sepay' }
};

export const MOCK_BANK_INFO = {
  bankName: 'MB Bank',
  accountName: 'API FE COMPANY',
  accountNumber: '123456789'
};

export const PAYMENT_EXPIRE_MINUTES = 15;
