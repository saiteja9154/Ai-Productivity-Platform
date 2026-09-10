import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB before accepting traffic
    await connectDB();

    // 2. Start Express Server
    const server = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  DB Check:     http://localhost:${PORT}/api/health/db`);
      console.log(`📊 API Docs:     http://localhost:${PORT}/`);
      console.log(`=========================================`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
    console.warn(`💡 Ensure MongoDB is running and MONGODB_URI is configured in backend/.env`);
    // Start server in degraded mode to allow health checks to report DB status
    app.listen(PORT, () => {
      console.log(`⚠️ Server running in degraded mode on http://localhost:${PORT} (Database offline)`);
    });
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});
