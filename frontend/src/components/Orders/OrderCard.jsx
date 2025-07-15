import React from 'react';

const OrderCard = ({ order, productsList }) => {
  const getProductDetails = (productId) => {
    return productsList.find(p => p.id === productId) || { name: 'Unknown Product', image_url: '' };
  };

  return (
    <div key={order.id} className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <h3 className="text-xl font-bold text-gray-900">Order #{order.id}</h3>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
          order.status === 'completed' ? 'bg-green-100 text-green-800' :
          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>
      <p className="text-gray-600 mb-2">Total Amount: <span className="font-semibold">${parseFloat(order.total_amount).toFixed(2)}</span></p>
      <p className="text-gray-600 mb-4">Ordered On: {new Date(order.created_at).toLocaleString()}</p>
      <h4 className="text-lg font-semibold text-gray-800 mb-3">Items:</h4>
      <div className="divide-y divide-gray-100">
        {order.items.map((item) => {
          const productInOrder = getProductDetails(item.product_id);
          return (
            <div key={item.id} className="flex items-center py-2">
              <img
                src={productInOrder.image_url || `https://placehold.co/60x60/f0f0f0/555555?text=${productInOrder.name.split(' ')[0]}`}
                alt={productInOrder.name}
                className="w-12 h-12 object-cover rounded-md mr-3"
                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/60x60/f0f0f0/555555?text=${productInOrder.name.split(' ')[0]}`; }}
              />
              <div className="flex-grow">
                <p className="text-gray-800 font-medium">{productInOrder.name}</p>
                <p className="text-gray-600 text-sm">Qty: {item.quantity} x ${parseFloat(item.price_at_purchase).toFixed(2)}</p>
              </div>
              <span className="font-semibold text-gray-900">
                {(parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderCard;