import { checkDbConnection } from '../config/db.js';

export const getApiHealth = async (req, res) => {
  const dbStatus = await checkDbConnection();

  res.status(dbStatus.connected ? 200 : 503).json({
    success: dbStatus.connected,
    status: dbStatus.connected ? 'healthy' : 'degraded',
    message: 'AI Productivity Platform API is running',
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.connected,
      status: dbStatus.status
    }
  });
};

export const getDbHealth = async (req, res) => {
  const dbStatus = await checkDbConnection();

  if (dbStatus.connected) {
    return res.status(200).json({
      success: true,
      connected: true,
      status: dbStatus.status,
      message: dbStatus.message,
      database: dbStatus.database
    });
  }

  return res.status(503).json({
    success: false,
    connected: false,
    status: dbStatus.status,
    message: dbStatus.message
  });
};

export default {
  getApiHealth,
  getDbHealth
};

