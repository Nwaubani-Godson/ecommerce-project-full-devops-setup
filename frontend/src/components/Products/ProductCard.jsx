import React from 'react';

const ProductCard = ({ product, onAddToCart, isAuthenticated, loading }) => {
  const imageUrl = product.image_url || `https://placehold.co/400x300/e0e0e0/333333?text=${product.name.split(' ')[0]}`;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
      <img
        src={imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover"
        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/e0e0e0/333333?text=${product.name.split(' ')[0]}`; }}
      />
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description || 'No description available.'}</p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-blue-600">${parseFloat(product.price).toFixed(2)}</span>
          <span className={`text-sm font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
            Stock: {product.stock_quantity}
          </span>
        </div>
        {isAuthenticated ? (
          <button
            onClick={() => onAddToCart(product.id)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={product.stock_quantity <= 0 || loading}
          >
            {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        ) : (
          <p className="text-center text-gray-500 text-sm">Login to add to cart</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;