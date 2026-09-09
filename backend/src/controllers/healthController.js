import { checkDbConnection } from '../config/db.js';

export const getApiHealth = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'AI Productivity Platform API is running'
  });
};

export const getDbHealth = async (req, res) => {
  const dbStatus = await checkDbConnection();

  if (dbStatus.connected) {
    return res.status(200).json({
      status: 'success',
      connected: true,
      message: 'MySQL Database is connected',
      database: dbStatus.database
    });
  }

  return res.status(503).json({
    status: 'error',
    connected: false,
    message: 'MySQL Database is disconnected',
    error: dbStatus.message,
    code: dbStatus.code
  });
};
