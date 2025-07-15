// src/components/Common/Header.jsx
import React from 'react';

const Header = ({ token, currentUser, activeView, setActiveView, handleLogout, cartItemCount }) => {
  return (
    <header className="bg-white text-gray-800 p-4 shadow-sm border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Shopnetic</h1>
        <nav className="space-x-4">
          <button
            onClick={() => setActiveView('products')}
            className={`py-2 px-4 rounded-md transition duration-300 ${activeView === 'products' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Products
          </button>
          {token && (
            <>
              <button
                onClick={() => setActiveView('cart')}
                className={`py-2 px-4 rounded-md transition duration-300 ${activeView === 'cart' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Cart ({cartItemCount})
              </button>
              <button
                onClick={() => setActiveView('orders')}
                className={`py-2 px-4 rounded-md transition duration-300 ${activeView === 'orders' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Orders
              </button>
            </>
          )}
          {token ? (
            <button
              onClick={handleLogout}
              className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-300 shadow-md"
            >
              Logout ({currentUser?.username})
            </button>
          ) : (
            <>
              <button
                onClick={() => setActiveView('login')}
                className={`py-2 px-4 rounded-md transition duration-300 ${activeView === 'login' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveView('register')}
                className={`py-2 px-4 rounded-md transition duration-300 ${activeView === 'register' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Register
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;