import express from 'express';
import cors from 'cors';

// Middleware imports
import { authenticate } from './middleware/authMiddleware.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorMiddleware.js';

// Route imports
import healthRoutes from './routes/healthRoutes.js';
import userRoutes from './routes/userRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

const app = express();

// Configure CORS for Frontend communication
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach authentication context if present
app.use(authenticate);

// Base API Welcome Route
app.get('/', (req, res) => {
  res.json({
    name: 'AI Productivity Platform API',
    version: '1.0.0',
    architecture: 'MongoDB + Mongoose Layered Pattern',
    status: 'online',
    endpoints: {
      health: '/api/health',
      dbHealth: '/api/health/db',
      users: '/api/users',
      teams: '/api/teams',
      documents: '/api/documents',
      tasks: '/api/tasks',
      workflows: '/api/workflows',
      auditLogs: '/api/audit-logs'
    }
  });
});

// Mount Resource API Routes
app.use('/api/health', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/audit-logs', auditRoutes);

// 404 Route Not Found Handler
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(globalErrorHandler);

export default app;
