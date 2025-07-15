import React from 'react';
import ShoppingCart from '../components/Cart/ShoppingCart';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import useOrders from '../hooks/useOrders';
import useProducts from '../hooks/useProducts'; // To get product details for cart items

const CartPage = () => {
  const { token } = useAuth(); // Just check if logged in
  const { cart, cartLoading, handleUpdateCartItem, handleRemoveFromCart, fetchCart } = useCart(token);
  const { handleCreateOrder, ordersLoading } = useOrders(token);
  const { products } = useProducts(); // Get all products to display details in cart

  const handlePlaceOrder = async () => {
    // Pass the actual count of cart items to the order handler
    const success = await handleCreateOrder(cart?.items.length || 0);
    if (success) {
      fetchCart(); // Refresh cart after order is placed
    }
  };

  const totalLoading = cartLoading || ordersLoading;

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Your Shopping Cart</h2>
      <ShoppingCart
        cart={cart}
        products={products} // Pass products to Cart for displaying details
        onUpdateCartItem={handleUpdateCartItem}
        onRemoveFromCart={handleRemoveFromCart}
        onCreateOrder={handlePlaceOrder}
        loading={totalLoading}
      />
    </div>
  );
};

export default CartPage;