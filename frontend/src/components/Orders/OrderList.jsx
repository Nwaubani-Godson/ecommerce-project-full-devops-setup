import React from 'react';
import OrderCard from './OrderCard';

const OrderList = ({ orders, productsList, loading }) => {
  if (orders.length === 0 && !loading) {
    return <p className="text-center text-gray-600">You haven't placed any orders yet.</p>;
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} productsList={productsList} />
      ))}
    </div>
  );
};

export default OrderList;