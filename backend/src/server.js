import dotenv from 'dotenv';
import app from './app.js';
import { checkDbConnection } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`=========================================`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  DB Check:     http://localhost:${PORT}/api/health/db`);
  console.log(`=========================================`);

  // Check database connectivity on boot
  const dbStatus = await checkDbConnection();
  if (dbStatus.connected) {
    console.log(`✅ Database connected: ${dbStatus.database}`);
  } else {
    console.warn(`⚠️  Database Warning: ${dbStatus.message}`);
    console.warn(`💡 Ensure MySQL is running and credentials in backend/.env are configured.`);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});
