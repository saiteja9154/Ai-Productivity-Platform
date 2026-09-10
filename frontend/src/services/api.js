const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function checkApiHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    const data = await res.json();
    return {
      success: res.ok,
      status: data.status,
      message: data.message || 'API is reachable',
      statusCode: res.status
    };
  } catch (err) {
    return {
      success: false,
      status: 'error',
      message: err.message || 'Backend is unreachable',
      statusCode: 0
    };
  }
}

export async function checkDbHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health/db`);
    const data = await res.json();
    return {
      success: res.ok && data.connected,
      connected: data.connected,
      status: data.status,
      message: data.message || (data.connected ? 'MongoDB is connected' : 'MongoDB is disconnected'),
      database: data.database,
      error: data.error,
      statusCode: res.status
    };
  } catch (err) {
    return {
      success: false,
      connected: false,
      status: 'error',
      message: 'Unable to query database health endpoint',
      error: err.message,
      statusCode: 0
    };
  }
}

export default {
  API_BASE_URL,
  checkApiHealth,
  checkDbHealth
};
