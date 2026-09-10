import { checkDbConnection } from '../config/db.js';

export const getApiHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Productivity Platform API is running',
    timestamp: new Date().toISOString()
  });
};

export const getDbHealth = async (req, res) => {
  const dbStatus = await checkDbConnection();

  if (dbStatus.connected) {
    return res.status(200).json({
      success: true,
      connected: true,
      message: 'MongoDB Database is connected',
      database: dbStatus.database,
      host: dbStatus.host
    });
  }

  return res.status(503).json({
    success: false,
    connected: false,
    message: 'MongoDB Database is disconnected',
    status: dbStatus.status,
    database: dbStatus.database
  });
};

export default {
  getApiHealth,
  getDbHealth
};
