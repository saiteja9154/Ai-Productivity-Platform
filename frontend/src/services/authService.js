const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TOKEN_KEY = 'ai_productivity_token';
const USER_KEY = 'ai_productivity_user';

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = () => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
};

export const setAuthData = (token, user) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const getHeaders = (withAuth = true) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (withAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

/**
 * Register a new user
 * @param {Object} userData - { name, email, password }
 */
export async function register(userData) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(userData)
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.message || (data.errors ? data.errors.map(e => e.message).join(', ') : 'Registration failed');
    const error = new Error(message);
    error.status = res.status;
    error.errors = data.errors;
    throw error;
  }

  return data;
}

/**
 * Log in with email and password
 * @param {Object} credentials - { email, password }
 */
export async function login(credentials) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(credentials)
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.message || 'Login failed. Please check your credentials.';
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
}

/**
 * Fetch authenticated user profile
 */
export async function getProfile() {
  const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
    method: 'GET',
    headers: getHeaders(true)
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.message || 'Failed to fetch user profile';
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data.data;
}

/**
 * Update authenticated user profile
 * @param {Object} updateData - { name, email }
 */
export async function updateProfile(updateData) {
  const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(updateData)
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.message || (data.errors ? data.errors.map(e => e.message).join(', ') : 'Failed to update profile');
    const error = new Error(message);
    error.status = res.status;
    error.errors = data.errors;
    throw error;
  }

  return data.data;
}

export default {
  getToken,
  getStoredUser,
  setAuthData,
  clearAuthData,
  register,
  login,
  getProfile,
  updateProfile
};
