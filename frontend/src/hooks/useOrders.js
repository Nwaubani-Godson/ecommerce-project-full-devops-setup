import { useState, useEffect, useCallback } from 'react';
import { fetchOrdersApi, createOrderApi } from '../api/apiService';
import useAppMessages from './useAppMessages';

const useOrders = (token) => {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const { handleError, handleSuccess, clearMessages } = useAppMessages();

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setOrders([]);
      return;
    }
    setOrdersLoading(true);
    clearMessages();
    try {
      const data = await fetchOrdersApi(token);
      setOrders(data);
    } catch (err) {
      handleError(err);
    } finally {
      setOrdersLoading(false);
    }
  }, [token, handleError, clearMessages]);

  const handleCreateOrder = useCallback(async (cartItemsCount) => {
    if (!token) {
      handleError({ message: "Please log in to create an order." });
      return false;
    }
    if (cartItemsCount === 0) {
      handleError({ message: "Your cart is empty. Add items before creating an order." });
      return false;
    }

    setOrdersLoading(true);
    clearMessages();
    try {
      const data = await createOrderApi(token);
      handleSuccess(`Order #${data.id} created successfully!`);
      await fetchOrders(); // Refresh orders list
      return true; // Indicate success
    } catch (err) {
      handleError(err);
      return false; // Indicate failure
    } finally {
      setOrdersLoading(false);
    }
  }, [token, fetchOrders, handleError, handleSuccess, clearMessages]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, ordersLoading, fetchOrders, handleCreateOrder };
};

export default useOrders;