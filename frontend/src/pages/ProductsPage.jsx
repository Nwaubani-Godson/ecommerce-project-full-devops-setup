
// import React from 'react';
// import ProductList from '../components/Products/ProductList';
// import useProducts from '../hooks/useProducts';
// import useAuth from '../hooks/useAuth';
// import useCart from '../hooks/useCart';

// const ProductsPage = () => {
//   const { products, productsLoading } = useProducts();
//   const { token } = useAuth();
//   const { handleAddToCart, cartLoading } = useCart(token);

//   const totalLoading = productsLoading || cartLoading; // Combine any relevant loading states

//   return (
//     <div className="mt-8">
//       <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Our Products</h2>
//       <ProductList
//         products={products}
//         onAddToCart={handleAddToCart}
//         isAuthenticated={!!token}
//         loading={totalLoading}
//       />
//     </div>
//   );
// };

// export default ProductsPage;



// import React from 'react';
// import ProductList from '../components/Products/ProductList';
// import useProducts from '../hooks/useProducts';
// import useAuth from '../hooks/useAuth';
// import useCart from '../hooks/useCart';

// const ProductsPage = () => {
//   const { products, productsLoading } = useProducts();
//   const { token } = useAuth();
//   const { handleAddToCart, cartLoading } = useCart(token);

//   const totalLoading = productsLoading || cartLoading;

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//       paddingTop: '2rem',
//       paddingBottom: '4rem'
//     }}>
//       {/* Hero Section */}
//       <div style={{
//         textAlign: 'center',
//         padding: '3rem 1rem',
//         maxWidth: '1200px',
//         margin: '0 auto'
//       }}>
//         <h1 style={{
//           fontSize: '3.5rem',
//           fontWeight: '900',
//           color: 'white',
//           marginBottom: '1rem',
//           textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
//           letterSpacing: '-0.02em'
//         }}>
//           Discover Amazing Products
//         </h1>
//         <p style={{
//           fontSize: '1.25rem',
//           color: 'rgba(255,255,255,0.9)',
//           marginBottom: '2rem',
//           maxWidth: '600px',
//           margin: '0 auto 2rem auto',
//           lineHeight: '1.6'
//         }}>
//           Explore our curated collection of premium products designed to enhance your lifestyle
//         </p>
        
//         {/* Decorative Elements */}
//         <div style={{
//           display: 'flex',
//           justifyContent: 'center',
//           gap: '1rem',
//           marginBottom: '3rem'
//         }}>
//           <div style={{
//             width: '60px',
//             height: '4px',
//             backgroundColor: 'rgba(255,255,255,0.8)',
//             borderRadius: '2px'
//           }}></div>
//           <div style={{
//             width: '60px',
//             height: '4px',
//             backgroundColor: 'rgba(255,255,255,0.6)',
//             borderRadius: '2px'
//           }}></div>
//           <div style={{
//             width: '60px',
//             height: '4px',
//             backgroundColor: 'rgba(255,255,255,0.4)',
//             borderRadius: '2px'
//           }}></div>
//         </div>
//       </div>

//       {/* Products Section */}
//       <div style={{
//         backgroundColor: 'rgba(255,255,255,0.95)',
//         backdropFilter: 'blur(10px)',
//         borderRadius: '20px',
//         margin: '0 1rem',
//         maxWidth: '1400px',
//         marginLeft: 'auto',
//         marginRight: 'auto',
//         padding: '3rem 2rem',
//         boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
//         border: '1px solid rgba(255,255,255,0.2)'
//       }}>
//         <div style={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           marginBottom: '3rem'
//         }}>
//           <div style={{
//             width: '50px',
//             height: '2px',
//             backgroundColor: '#667eea',
//             marginRight: '1rem'
//           }}></div>
//           <h2 style={{
//             fontSize: '2.5rem',
//             fontWeight: '700',
//             color: '#1f2937',
//             margin: '0',
//             textAlign: 'center'
//           }}>
//             Our Products
//           </h2>
//           <div style={{
//             width: '50px',
//             height: '2px',
//             backgroundColor: '#667eea',
//             marginLeft: '1rem'
//           }}></div>
//         </div>

//         {/* Loading State */}
//         {totalLoading && (
//           <div style={{
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             padding: '4rem 0'
//           }}>
//             <div style={{
//               width: '60px',
//               height: '60px',
//               border: '4px solid #f3f4f6',
//               borderTop: '4px solid #667eea',
//               borderRadius: '50%',
//               animation: 'spin 1s linear infinite'
//             }}></div>
//           </div>
//         )}

//         {/* Products Grid */}
//         {!totalLoading && (
//           <div style={{
//             animation: 'fadeIn 0.6s ease-out'
//           }}>
//             <ProductList
//               products={products}
//               onAddToCart={handleAddToCart}
//               isAuthenticated={!!token}
//               loading={totalLoading}
//             />
//           </div>
//         )}

//         {/* Empty State */}
//         {!totalLoading && (!products || products.length === 0) && (
//           <div style={{
//             textAlign: 'center',
//             padding: '4rem 2rem',
//             color: '#6b7280'
//           }}>
//             <div style={{
//               fontSize: '4rem',
//               marginBottom: '1rem',
//               opacity: '0.5'
//             }}>
//               📦
//             </div>
//             <h3 style={{
//               fontSize: '1.5rem',
//               fontWeight: '600',
//               marginBottom: '0.5rem',
//               color: '#374151'
//             }}>
//               No Products Available
//             </h3>
//             <p style={{
//               fontSize: '1rem',
//               color: '#6b7280'
//             }}>
//               We're working on adding amazing products. Check back soon!
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Floating Action Elements */}
//       <div style={{
//         position: 'fixed',
//         bottom: '2rem',
//         right: '2rem',
//         display: 'flex',
//         flexDirection: 'column',
//         gap: '1rem',
//         zIndex: 1000
//       }}>
//         <button style={{
//           width: '60px',
//           height: '60px',
//           borderRadius: '50%',
//           backgroundColor: '#667eea',
//           border: 'none',
//           color: 'white',
//           fontSize: '1.5rem',
//           cursor: 'pointer',
//           boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
//           transition: 'all 0.3s ease',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center'
//         }}
//         onMouseOver={(e) => {
//           e.target.style.transform = 'scale(1.1)';
//           e.target.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.6)';
//         }}
//         onMouseOut={(e) => {
//           e.target.style.transform = 'scale(1)';
//           e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
//         }}
//         onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
//         >
//           ↑
//         </button>
//       </div>

//       {/* CSS Animations */}
//       <style jsx>{`
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
        
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
        
//         @media (max-width: 768px) {
//           h1 {
//             font-size: 2.5rem !important;
//           }
          
//           p {
//             font-size: 1.1rem !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ProductsPage;


import React from 'react';
import useProducts from '../hooks/useProducts';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';

// Inline ProductCard component with the polished Tailwind styling
const ProductCard = ({ product, onAddToCart, isAuthenticated, loading }) => {
  const placeholderUrl = `https://placehold.co/400x300/e0e0e0/333333?text=${encodeURIComponent(product.name.split(' ')[0])}`;
  const imageUrl = product.image_url || placeholderUrl;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-transform duration-200 hover:scale-105 p-4 flex flex-col justify-between">
      <img
        src={imageUrl}
        alt={product.name}
        className="w-full h-44 object-cover rounded-lg mb-4"
        onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = placeholderUrl; }}
      />
      <div>
        <h3 className="text-lg font-bold mb-1 text-gray-900">{product.name}</h3>
        <p className="text-gray-600 mb-2 text-sm line-clamp-2">
          {product.description || 'No description available.'}
        </p>
        <div className="flex items-center justify-between mt-2 mb-2">
          <span className="text-blue-600 font-bold text-xl">${parseFloat(product.price).toFixed(2)}</span>
          <span className={product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}>
            {product.stock_quantity > 0 ? `Stock: ${product.stock_quantity}` : 'Out of Stock'}
          </span>
        </div>
        {isAuthenticated ? (
          <button
            onClick={() => onAddToCart(product.id)}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded py-2 mt-3 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={product.stock_quantity <= 0 || loading}
          >
            {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        ) : (
          <p className="text-center text-gray-400 text-xs mt-2">Login to add to cart</p>
        )}
      </div>
    </div>
  );
};

// ProductList renders a responsive grid of product cards
const ProductList = ({ products, onAddToCart, isAuthenticated, loading }) => {
  if ((!products || products.length === 0) && !loading) {
    return <p className="text-center text-gray-600 mt-12 text-lg">No products available.</p>;
  }

  return (
    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map(product => (
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

const ProductsPage = () => {
  const { products, productsLoading } = useProducts();
  const { token } = useAuth();
  const { handleAddToCart, cartLoading } = useCart(token);

  const totalLoading = productsLoading || cartLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 pt-12 pb-16 px-4 md:px-8">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-md mb-4">
          Discover Amazing Products
        </h1>
        <p className="text-xl text-indigo-200 max-w-xl mx-auto leading-relaxed">
          Explore our curated collection of premium products designed to enhance your lifestyle
        </p>
        <div className="flex justify-center gap-3 mt-8">
          <span className="w-20 h-1 bg-indigo-300 rounded"></span>
          <span className="w-14 h-1 bg-indigo-200 rounded opacity-70"></span>
          <span className="w-10 h-1 bg-indigo-100 rounded opacity-50"></span>
        </div>
      </div>

      {/* Products Container */}
      <div className="max-w-7xl mx-auto bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-xl border border-white border-opacity-30 px-6 py-10">
        {/* Loading State */}
        {totalLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Product List */}
        {!totalLoading && (
          <ProductList
            products={products}
            onAddToCart={handleAddToCart}
            isAuthenticated={!!token}
            loading={totalLoading}
          />
        )}

        {/* Empty State (redundant here since ProductList shows message, but kept for clarity) */}
        {!totalLoading && (!products || products.length === 0) && (
          <div className="text-center py-16 text-gray-700">
            <div className="text-6xl mb-4 opacity-40">📦</div>
            <h3 className="text-2xl font-semibold mb-2">No Products Available</h3>
            <p>We're working on adding amazing products. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Scroll to Top Floating Button */}
      <button
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-indigo-600 text-white text-2xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </div>
  );
};

export default ProductsPage;
