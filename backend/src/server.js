import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load backend/.env before importing app or config
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import app from './app.js';
import { connectDB, disconnectDB, sanitizeMongoUri } from './config/db.js';
import { startScheduler, stopScheduler } from './services/workflowScheduler.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB before listening for HTTP requests
    console.log('⏳ Connecting to MongoDB...');
    await connectDB();

    // 2. Start lightweight workflow scheduler for scheduled triggers
    startScheduler();

    // 3. Start Express Server
    const server = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  DB Check:     http://localhost:${PORT}/api/health/db`);
      console.log(`📊 API Docs:     http://localhost:${PORT}/`);
      console.log(`⚙️  Workflows:   Scheduler active (single-instance safe)`);
      console.log(`=========================================`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      stopScheduler();
      server.close(async () => {
        console.log('HTTP server closed.');
        try {
          await disconnectDB();
        } catch (dbErr) {
          console.error('Error during DB disconnect:', dbErr.message);
        }
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    const rawUri = process.env.MONGODB_URI || '';
    const sanitized = sanitizeMongoUri(rawUri);
    console.error(`❌ Failed to start server: MongoDB connection error (${sanitized}) - ${error.message}`);
    console.error(`💡 Ensure MongoDB service is running and MONGODB_URI is correctly configured in backend/.env`);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

