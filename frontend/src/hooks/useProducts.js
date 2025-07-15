import { useState, useEffect, useCallback } from 'react';
import { fetchProductsApi } from '../api/apiService';
import useAppMessages from './useAppMessages';

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const { handleError, clearMessages } = useAppMessages();

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    clearMessages();
    try {
      const data = await fetchProductsApi();
      setProducts(data);
    } catch (err) {
      handleError(err);
    } finally {
      setProductsLoading(false);
    }
  }, [handleError, clearMessages]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, productsLoading, fetchProducts };
};

export default useProducts;