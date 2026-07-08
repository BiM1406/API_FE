import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as paymentService from './paymentService';
import { api } from './api';
import * as authService from './authService';

vi.mock('./api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn()
  },
  mockDelay: vi.fn((val) => Promise.resolve(val))
}));

vi.mock('./authService', () => ({
  getCurrentUser: vi.fn()
}));

// Mock process.env / import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_USE_MOCK_PAYMENT: 'false',
      VITE_API_BASE_URL: 'http://localhost:8080/api'
    }
  }
});

describe('Payment Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    authService.getCurrentUser.mockReturnValue({ id: 'u1' });
  });

  describe('Payment Creation', () => {
    it('should create payment via API', async () => {
      const mockPlan = { planName: 'Pro', cycle: 'monthly' };
      const apiResponse = { id: 'p1', orderCode: 'ORDER123', status: 'PENDING' };
      
      api.post.mockResolvedValueOnce({ success: true, data: apiResponse });

      const result = await paymentService.createPayment(mockPlan);

      expect(api.post).toHaveBeenCalledWith('/payments', { planCode: 'pro', cycle: 'monthly' });
      expect(result).toEqual(apiResponse);
    });

    it('should fallback to local mock payment if API fails', async () => {
      const mockPlan = { planName: 'Pro', cycle: 'monthly' };
      api.post.mockRejectedValueOnce(new Error('API Down'));

      const result = await paymentService.createPayment(mockPlan);

      expect(result.status).toBe('PENDING');
      expect(result.id).toMatch(/^pay_/);
      expect(result.orderCode).toMatch(/^PAY/);
    });
  });

  describe('Payment Status Updates', () => {
    it('should confirm payment via API', async () => {
      const mockPayment = { id: 'p1', orderCode: 'ORDER123', status: 'PAID' };
      api.post.mockResolvedValueOnce({ success: true, data: mockPayment });

      const result = await paymentService.confirmPayment('ORDER123');

      expect(api.post).toHaveBeenCalledWith('/payments/ORDER123/confirm');
      expect(result.status).toBe('PAID');
    });

    it('should cancel payment via API', async () => {
      const mockPayment = { id: 'p1', orderCode: 'ORDER123', status: 'CANCELLED' };
      api.post.mockResolvedValueOnce({ success: true, data: mockPayment });

      const result = await paymentService.cancelPayment('ORDER123');

      expect(api.post).toHaveBeenCalledWith('/payments/ORDER123/cancel');
      expect(result.status).toBe('CANCELLED');
    });
  });

  describe('Payment History', () => {
    it('should get payment history from API', async () => {
      const mockHistory = [{ id: 'p1', amount: 1000 }];
      api.get.mockResolvedValueOnce({ success: true, data: mockHistory });

      const result = await paymentService.getPaymentHistory();

      expect(api.get).toHaveBeenCalledWith('/payment-history');
      expect(result).toEqual(mockHistory);
    });

    it('should fallback to local storage if API fails', async () => {
      api.get.mockRejectedValueOnce(new Error('Network Error'));
      // Pre-populate local storage
      paymentService.writePaymentHistory([{ id: 'local1', amount: 500 }]);

      const result = await paymentService.getPaymentHistory();
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('local1');
    });
  });

  describe('Revenue Calculation', () => {
    it('should calculate correct revenue from paid payments', () => {
      const payments = [
        { status: 'PAID', amount: 100 },
        { status: 'PENDING', amount: 50 },
        { status: 'SUCCESSFUL', amount: 200 }
      ];

      const { total, isEstimated } = paymentService.calculateRevenue(payments, []);
      
      expect(total).toBe(300);
      expect(isEstimated).toBe(false);
    });
  });
});
