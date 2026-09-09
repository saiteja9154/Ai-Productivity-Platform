import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/healthRoutes.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Configure CORS for Frontend communication
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base Route
app.get('/', (req, res) => {
  res.json({
    name: 'AI Productivity Platform API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      dbHealth: '/api/health/db'
    }
  });
});

// Mount Routes
app.use('/api/health', healthRoutes);

// 404 Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(globalErrorHandler);

export default app;
