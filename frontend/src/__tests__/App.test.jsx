import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App'; // Path relative to this test file

// --- Define the mock objects outside so they can be manipulated ---
const mockUseAuth = {
  token: null,
  currentUser: null,
  authLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

const mockUseCart = { cart: { items: [] }, cartLoading: false };
const mockUseOrders = { ordersLoading: false };
const mockUseProducts = { productsLoading: false };
const mockUseAppMessages = { error: null, successMessage: null };


// --- Mock all custom hooks for simplicity ---
// We provide the default values via the external mock objects.
// No need to import useAuth directly here. Vitest handles the mock.
vi.mock('../hooks/useAuth', () => ({
  default: () => mockUseAuth, // Return the mutable mock object
}));
vi.mock('../hooks/useCart', () => ({
  default: () => mockUseCart,
}));
vi.mock('../hooks/useOrders', () => ({
  default: () => mockUseOrders,
}));
vi.mock('../hooks/useProducts', () => ({
  default: () => mockUseProducts,
}));
vi.mock('../hooks/useAppMessages', () => ({
  default: () => mockUseAppMessages,
}));

// --- Mock all page components ---
vi.mock('../pages/RegisterPage', () => ({ default: () => <div data-testid="register-page-mock"></div> }));
vi.mock('../pages/LoginPage', () => ({ default: () => <div data-testid="login-page-mock"></div> }));
vi.mock('../pages/ProductsPage', () => ({ default: () => <div data-testid="products-page-mock"></div> }));
vi.mock('../pages/CartPage', () => ({ default: () => <div data-testid="cart-page-mock"></div> }));
vi.mock('../pages/OrdersPage', () => ({ default: () => <div data-testid="orders-page-mock"></div> }));

// --- Mock common components if they have complex rendering ---
vi.mock('../components/Common/Header', () => ({ default: () => <div data-testid="header-mock">Header</div> }));
vi.mock('../components/Common/Footer', () => ({ default: () => <div data-testid="footer-mock">Footer</div> }));
vi.mock('../components/Common/LoadingSpinner', () => ({ default: () => <div data-testid="loading-spinner"></div> }));
vi.mock('../components/Common/ErrorMessage', () => ({ default: () => <div data-testid="error-message"></div> }));
vi.mock('../components/Common/SuccessMessage', () => ({ default: () => <div data-testid="success-message"></div> }));


describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.token = null;
    mockUseAuth.currentUser = null;
    mockUseAuth.authLoading = false;

    mockUseCart.cart = { items: [] };
    mockUseCart.cartLoading = false;

    mockUseOrders.ordersLoading = false;
    mockUseProducts.productsLoading = false;
    mockUseAppMessages.error = null;
    mockUseAppMessages.successMessage = null;
  });


  it('renders the App component without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('header-mock')).toBeInTheDocument();
    expect(screen.getByTestId('footer-mock')).toBeInTheDocument();
    expect(screen.getByTestId('products-page-mock')).toBeInTheDocument();
  });

  it('shows loading spinner when a hook reports loading', () => {
    mockUseAuth.authLoading = true;
    const { rerender } = render(<App />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    mockUseAuth.authLoading = false;
    rerender(<App />);
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });
});