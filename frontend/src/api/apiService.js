const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; 


const getHeaders = (token) => {
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const handleResponse = async (response) => {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  let data;
  try {
    data = isJson ? await response.json() : await response.text();
  } catch (e) { 
    console.error("Error processing API response:", e);
    data = "Response was not valid JSON";
  }

  if (!response.ok) {
    const errorDetail = isJson && data && data.detail ? data.detail : (data || "An unknown error occurred.");
    const error = new Error(errorDetail);
    error.statusCode = response.status;
    throw error;
  }
  return data;
};

// --- Auth API Calls ---
export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const loginUser = async (username, password) => {
  const formBody = new URLSearchParams();
  formBody.append('username', username);
  formBody.append('password', password);

  const response = await fetch(`${API_BASE_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody.toString(),
  });
  return handleResponse(response);
};

export const fetchCurrentUserApi = async (token) => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

// --- Product API Calls ---
export const fetchProductsApi = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  return handleResponse(response);
};

// --- Cart API Calls ---
export const fetchCartApi = async (token) => {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

export const addCartItemApi = async (token, productId, quantity) => {
  const response = await fetch(`${API_BASE_URL}/cart/items`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ product_id: productId, quantity: quantity }),
  });
  return handleResponse(response);
};

export const updateCartItemApi = async (token, productId, quantity) => {
  const response = await fetch(`${API_BASE_URL}/cart/items/${productId}?quantity=${quantity}`, {
    method: 'PUT',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

export const removeCartItemApi = async (token, productId) => {
  const response = await fetch(`${API_BASE_URL}/cart/items/${productId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  if (response.status === 204) return null;
  return handleResponse(response);
};

// --- Order API Calls ---
export const fetchOrdersApi = async (token) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    headers: getHeaders(token),
  });
  return handleResponse(response);
};

export const createOrderApi = async (token) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  return handleResponse(response);
};