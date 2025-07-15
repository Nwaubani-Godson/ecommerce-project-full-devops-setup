import React from 'react';
import OrderList from '../components/Orders/OrderList';
import useAuth from '../hooks/useAuth';
import useOrders from '../hooks/useOrders';
import useProducts from '../hooks/useProducts'; // To get product names for order items

const OrdersPage = () => {
  const { token } = useAuth();
  const { orders, ordersLoading } = useOrders(token);
  const { products } = useProducts(); // Get all products to display details in orders

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Your Orders</h2>
      <OrderList orders={orders} productsList={products} loading={ordersLoading} />
    </div>
  );
};

export default OrdersPage;