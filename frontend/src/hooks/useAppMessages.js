import { useState, useCallback } from 'react';

const useAppMessages = () => {
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const handleError = useCallback((err) => {
    console.error("API Error:", err);
    setError(err.message || "An unexpected error occurred.");
    setTimeout(clearMessages, 5000);
  }, [clearMessages]);

  const handleSuccess = useCallback((message) => {
    setSuccessMessage(message);
    setTimeout(clearMessages, 3000);
  }, [clearMessages]);

  return { error, successMessage, handleError, handleSuccess, clearMessages };
};

export default useAppMessages;