import React from 'react';

const CartItem = ({ item, product, onUpdateQuantity, onRemove, loading }) => {
  const imageUrl = product.image_url || `https://placehold.co/100x100/e0e0e0/333333?text=${product.name.split(' ')[0]}`;

  return (
    <div className="flex items-center py-4">
      <img
        src={imageUrl}
        alt={product.name}
        className="w-20 h-20 object-cover rounded-md mr-4"
        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/100x100/e0e0e0/333333?text=${product.name.split(' ')[0]}`; }}
      />
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        <p className="text-gray-600 text-sm">Price: ${parseFloat(item.price_at_add).toFixed(2)}</p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded-md transition duration-200"
          disabled={loading || item.quantity <= 1}
        >
          -
        </button>
        <span className="text-lg font-medium">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded-md transition duration-200"
          disabled={loading || product.stock_quantity <= item.quantity}
        >
          +
        </button>
        <button
          onClick={() => onRemove(item.product_id)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md transition duration-300 ml-4"
          disabled={loading}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;