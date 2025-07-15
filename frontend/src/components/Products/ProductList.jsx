import React from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ products, onAddToCart, isAuthenticated, loading }) => {
  if (products.length === 0 && !loading) {
    return <p className="text-center text-gray-600">No products available.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          isAuthenticated={isAuthenticated}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default ProductList;