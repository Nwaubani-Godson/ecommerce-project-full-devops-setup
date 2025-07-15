import React from 'react';

const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded-lg shadow-xl flex items-center space-x-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p className="text-lg text-gray-700">Loading...</p>
    </div>
  </div>
);

export default LoadingSpinner;