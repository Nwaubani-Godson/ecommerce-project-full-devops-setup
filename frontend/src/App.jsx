// src/App.js
import React, { useState } from 'react';
import Header from './components/Common/Header';
import Footer from './components/Common/Footer';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorMessage from './components/Common/ErrorMessage';
import SuccessMessage from './components/Common/SuccessMessage';

// Import Page Components
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';

// Import Hooks
import useAuth from './hooks/useAuth';
import useCart from './hooks/useCart';
import useOrders from './hooks/useOrders';
import useProducts from './hooks/useProducts';
import useAppMessages from './hooks/useAppMessages';

const App = () => {
  const [activeView, setActiveView] = useState('products');

  const { token, currentUser, authLoading, login, register, logout } = useAuth();
  const { cart, cartLoading } = useCart(token);
  const { ordersLoading } = useOrders(token);
  const { productsLoading } = useProducts();
  const { error, successMessage } = useAppMessages();

  const totalLoading = authLoading || cartLoading || ordersLoading || productsLoading;

  const handleRegisterSubmit = async (formData) => {
    const success = await register(formData);
    if (success) {
      setActiveView('login');
    }
  };

  const handleLoginSubmit = async (username, password) => {
    const success = await login(username, password);
    if (success) {
      setActiveView('products');
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'register':
        return (
          <RegisterPage
            onRegister={handleRegisterSubmit}
            loading={authLoading}
            onSwitchToLogin={() => setActiveView('login')}
          />
        );
      case 'login':
        return (
          <LoginPage
            onLogin={handleLoginSubmit}
            loading={authLoading}
            onSwitchToRegister={() => setActiveView('register')}
          />
        );
      case 'products':
        return <ProductsPage />;
      case 'cart':
        return token ? <CartPage /> : <p className="text-center text-gray-600 mt-12 text-lg">Please log in to view your cart.</p>;
      case 'orders':
        return token ? <OrdersPage /> : <p className="text-center text-gray-600 mt-12 text-lg">Please log in to view your orders.</p>;
      default:
        return <ProductsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased flex flex-col">
      <Header
        token={token}
        currentUser={currentUser}
        activeView={activeView}
        setActiveView={setActiveView}
        handleLogout={logout}
        cartItemCount={cart?.items.length || 0}
      />

      <main className="container mx-auto p-6 flex-grow">
        {totalLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}
        {successMessage && <SuccessMessage message={successMessage} />}

        {renderActiveView()}

        {!token && (activeView !== 'login' && activeView !== 'register' && activeView !== 'products') && (
            <p className="text-center text-gray-600 mt-12 text-lg">Please login or register to access full features.</p>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;