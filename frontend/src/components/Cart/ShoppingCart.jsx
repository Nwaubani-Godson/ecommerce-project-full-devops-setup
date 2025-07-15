import React from 'react';
import CartItem from './CartItem';

const ShoppingCart = ({ cart, products, onUpdateCartItem, onRemoveFromCart, onCreateOrder, loading }) => {
  if (!cart || cart.items.length === 0) {
    return <p className="text-center text-gray-600">Your cart is empty. Go add some amazing products!</p>;
  }

  const calculateTotal = () => {
    return cart.items.reduce((sum, item) => {
      // Use price_at_add from cart item for historical accuracy
      return sum + (parseFloat(item.price_at_add) * item.quantity);
    }, 0).toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="divide-y divide-gray-200">
        {cart.items.map((item) => {
          const productInCart = products.find(p => p.id === item.product_id);
          if (!productInCart) return null; // Fallback for inconsistent data

          return (
            <CartItem
              key={item.id}
              item={item}
              product={productInCart}
              onUpdateQuantity={onUpdateCartItem}
              onRemove={onRemoveFromCart}
              loading={loading}
            />
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
        <span className="text-xl font-bold text-gray-900">
          Total: ${calculateTotal()}
        </span>
        <button
          onClick={onCreateOrder}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || cart.items.length === 0}
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default ShoppingCart;