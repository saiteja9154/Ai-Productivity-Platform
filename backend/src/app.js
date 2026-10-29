import express from 'express';
import cors from 'cors';

// Middleware imports
import { authenticate } from './middleware/authMiddleware.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorMiddleware.js';

// Route imports
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
];

if (process.env.CLIENT_URL) {
  ALLOWED_ORIGINS.push(process.env.CLIENT_URL);
}
if (process.env.CORS_ORIGIN) {
  ALLOWED_ORIGINS.push(process.env.CORS_ORIGIN);
}

// Configure CORS for Frontend communication
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman, same-origin)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      // In development, allow any localhost or 127.0.0.1 port
      if (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-user-id']
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
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      users: '/api/users',
      userProfile: 'GET/PUT /api/users/profile',
      teams: '/api/teams',
      documents: '/api/documents',
      tasks: '/api/tasks',
      workflows: '/api/workflows',
      ai: '/api/ai',
      auditLogs: '/api/audit-logs'
    }
  });
});

// Mount Resource API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/audit-logs', auditRoutes);

// 404 Route Not Found Handler
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(globalErrorHandler);

export default app;
