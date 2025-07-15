import { useState, useEffect, useCallback } from 'react';
import { fetchCartApi, addCartItemApi, updateCartItemApi, removeCartItemApi } from '../api/apiService';
import useAppMessages from './useAppMessages';

const useCart = (token) => {
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const { handleError, handleSuccess, clearMessages } = useAppMessages();

  const fetchCart = useCallback(async () => {
    if (!token) {
      setCart(null);
      return;
    }
    setCartLoading(true);
    clearMessages();
    try {
      const data = await fetchCartApi(token);
      setCart(data);
    } catch (err) {
      handleError(err);
    } finally {
      setCartLoading(false);
    }
  }, [token, handleError, clearMessages]);

  const handleAddToCart = useCallback(async (productId, quantity = 1) => {
    if (!token) {
      handleError({ message: "Please log in to add items to your cart." });
      return false; // Indicate failure
    }
    setCartLoading(true);
    clearMessages();
    try {
      const data = await addCartItemApi(token, productId, quantity);
      setCart(data);
      handleSuccess("Item added to cart!");
      return true; // Indicate success
    } catch (err) {
      handleError(err);
      return false; // Indicate failure
    } finally {
      setCartLoading(false);
    }
  }, [token, handleError, handleSuccess, clearMessages]);

  const handleUpdateCartItem = useCallback(async (productId, quantity) => {
    if (!token) return;
    setCartLoading(true);
    clearMessages();
    try {
      const data = await updateCartItemApi(token, productId, quantity);
      setCart(data);
      handleSuccess("Cart updated!");
      return true;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setCartLoading(false);
    }
  }, [token, handleError, handleSuccess, clearMessages]);

  const handleRemoveFromCart = useCallback(async (productId) => {
    if (!token) return;
    setCartLoading(true);
    clearMessages();
    try {
      await removeCartItemApi(token, productId); // This API call returns 204 No Content
      await fetchCart(); // Refetch cart to get updated state
      handleSuccess("Item removed from cart.");
      return true;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setCartLoading(false);
    }
  }, [token, fetchCart, handleError, handleSuccess, clearMessages]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return { cart, cartLoading, fetchCart, handleAddToCart, handleUpdateCartItem, handleRemoveFromCart };
};

export default useCart;