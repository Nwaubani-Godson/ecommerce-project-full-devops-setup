import { useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, fetchCurrentUserApi } from '../api/apiService';
import useAppMessages from './useAppMessages';

const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const { handleError, handleSuccess, clearMessages } = useAppMessages();

  const fetchCurrentUser = useCallback(async () => {
    if (!token) {
      setCurrentUser(null);
      return;
    }
    setAuthLoading(true);
    clearMessages();
    try {
      const data = await fetchCurrentUserApi(token);
      setCurrentUser(data);
    } catch (err) {
      if (err.statusCode === 401) {
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
        handleError({ message: "Session expired. Please log in again." });
      } else {
        handleError(err);
      }
    } finally {
      setAuthLoading(false);
    }
  }, [token, handleError, clearMessages]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = useCallback(async (username, password) => {
    setAuthLoading(true);
    clearMessages();
    try {
      const data = await loginUser(username, password);
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      handleSuccess("Logged in successfully!");
      return true; // Indicate success
    } catch (err) {
      handleError(err);
      return false; // Indicate failure
    } finally {
      setAuthLoading(false);
    }
  }, [handleError, handleSuccess, clearMessages]);

  const register = useCallback(async (userData) => {
    setAuthLoading(true);
    clearMessages();
    try {
      await registerUser(userData);
      handleSuccess("Registration successful! Please log in.");
      return true; // Indicate success
    } catch (err) {
      handleError(err);
      return false; // Indicate failure
    } finally {
      setAuthLoading(false);
    }
  }, [handleError, handleSuccess, clearMessages]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    handleSuccess("Logged out successfully.");
  }, [handleSuccess]);

  return { token, currentUser, authLoading, login, register, logout };
};

export default useAuth;