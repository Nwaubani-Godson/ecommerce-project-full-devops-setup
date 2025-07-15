
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



import React from 'react';
import ProductList from '../components/Products/ProductList';
import useProducts from '../hooks/useProducts';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';

const ProductsPage = () => {
  const { products, productsLoading } = useProducts();
  const { token } = useAuth();
  const { handleAddToCart, cartLoading } = useCart(token);

  const totalLoading = productsLoading || cartLoading;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paddingTop: '2rem',
      paddingBottom: '4rem'
    }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '3rem 1rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '900',
          color: 'white',
          marginBottom: '1rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          letterSpacing: '-0.02em'
        }}>
          Discover Amazing Products
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem auto',
          lineHeight: '1.6'
        }}>
          Explore our curated collection of premium products designed to enhance your lifestyle
        </p>
        
        {/* Decorative Elements */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '3rem'
        }}>
          <div style={{
            width: '60px',
            height: '4px',
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: '2px'
          }}></div>
          <div style={{
            width: '60px',
            height: '4px',
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: '2px'
          }}></div>
          <div style={{
            width: '60px',
            height: '4px',
            backgroundColor: 'rgba(255,255,255,0.4)',
            borderRadius: '2px'
          }}></div>
        </div>
      </div>

      {/* Products Section */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        margin: '0 1rem',
        maxWidth: '1400px',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: '3rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '3rem'
        }}>
          <div style={{
            width: '50px',
            height: '2px',
            backgroundColor: '#667eea',
            marginRight: '1rem'
          }}></div>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0',
            textAlign: 'center'
          }}>
            Our Products
          </h2>
          <div style={{
            width: '50px',
            height: '2px',
            backgroundColor: '#667eea',
            marginLeft: '1rem'
          }}></div>
        </div>

        {/* Loading State */}
        {totalLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4rem 0'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        )}

        {/* Products Grid */}
        {!totalLoading && (
          <div style={{
            animation: 'fadeIn 0.6s ease-out'
          }}>
            <ProductList
              products={products}
              onAddToCart={handleAddToCart}
              isAuthenticated={!!token}
              loading={totalLoading}
            />
          </div>
        )}

        {/* Empty State */}
        {!totalLoading && (!products || products.length === 0) && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: '#6b7280'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '1rem',
              opacity: '0.5'
            }}>
              📦
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#374151'
            }}>
              No Products Available
            </h3>
            <p style={{
              fontSize: '1rem',
              color: '#6b7280'
            }}>
              We're working on adding amazing products. Check back soon!
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Elements */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        zIndex: 1000
      }}>
        <button style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#667eea',
          border: 'none',
          color: 'white',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.6)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ↑
        </button>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
          h1 {
            font-size: 2.5rem !important;
          }
          
          p {
            font-size: 1.1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductsPage;