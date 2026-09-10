import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_productivity_platform';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // In production we may exit, but for dev/testing resilience we propagate
    throw error;
  }
};

export const checkDbConnection = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };

    const isDbConnected = state === 1;

    return {
      connected: isDbConnected,
      status: states[state] || 'Unknown',
      database: mongoose.connection.name || 'ai_productivity_platform',
      host: mongoose.connection.host || 'localhost',
      message: isDbConnected ? 'MongoDB connected successfully' : 'MongoDB is not connected'
    };
  } catch (error) {
    return {
      connected: false,
      status: 'Disconnected',
      database: 'ai_productivity_platform',
      message: error.message || 'Failed to check MongoDB connection status'
    };
  }
};

export default connectDB;
