import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure backend/.env is loaded regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

/**
 * Sanitizes a MongoDB connection URI to mask credentials if present.
 * @param {string} uri 
 * @returns {string}
 */
export const sanitizeMongoUri = (uri) => {
  if (!uri) return '';
  return uri.replace(/\/\/(.*?)@/, '//***:***@');
};

/**
 * Connects to MongoDB using Mongoose.
 * Avoids duplicate connections if already connected or connecting.
 */
export const connectDB = async () => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connection is in progress, wait for completion
  if (mongoose.connection.readyState === 2) {
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', () => resolve(mongoose.connection));
      mongoose.connection.once('error', (err) => reject(err));
    });
  }

  const rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_productivity_platform';
  const sanitized = sanitizeMongoUri(rawUri);

  try {
    await mongoose.connect(rawUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return mongoose.connection;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error (${sanitized}): ${error.message}`);
    throw error;
  }
};

/**
 * Checks connection state and runs a harmless ping verification.
 */
export const checkDbConnection = async () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  const isConnected = state === 1;

  if (!isConnected || !mongoose.connection.db) {
    return {
      connected: false,
      status: states[state] || 'Unknown',
      readyState: state,
      database: null,
      host: null,
      message: 'MongoDB is not connected'
    };
  }

  // Execute harmless ping test query to verify responsiveness
  try {
    await mongoose.connection.db.command({ ping: 1 });
    return {
      connected: true,
      status: states[state] || 'Connected',
      readyState: state,
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      message: 'MongoDB connected and responsive'
    };
  } catch (pingError) {
    return {
      connected: false,
      status: 'Degraded',
      readyState: state,
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      message: `MongoDB connected but ping failed: ${pingError.message}`
    };
  }
};

/**
 * Disconnects from MongoDB gracefully.
 */
export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

// Register connection event listeners
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB connection lost.');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected.');
});

export default connectDB;

