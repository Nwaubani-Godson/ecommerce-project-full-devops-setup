import React from 'react';

const SuccessMessage = ({ message }) => (
  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-4 shadow-sm" role="alert">
    <strong className="font-bold">Success:</strong>
    <span className="block sm:inline ml-2">{message}</span>
  </div>
);

export default SuccessMessage;