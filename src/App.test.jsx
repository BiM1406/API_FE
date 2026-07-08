import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('should render the app without crashing', () => {
    // Red: Viết test cho component (nếu fail thì mình sẽ fix)
    render(<App />);
    
    // Test xem có element nào đó không, hoặc chỉ đơn giản xem hàm render có chạy không.
    // Mình có thể query một text nào đó chắc chắn sẽ xuất hiện trên màn hình
    // expect(screen.getByText(/some text/i)).toBeInTheDocument();
  });
});
