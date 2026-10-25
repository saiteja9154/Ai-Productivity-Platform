import express from 'express';
import {
  getTasks,
  getTaskMetrics,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} from '../controllers/taskController.js';
import {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
  validateTaskStatus
} from '../validators/taskValidator.js';
import validate from '../middleware/validationMiddleware.js';

const router = express.Router();

// Real-time task overview counts & metrics
router.get('/metrics', getTaskMetrics);

// Task collection routes
router.route('/')
  .get(getTasks)
  .post(validateCreateTask, validate, createTask);

// Task status transition route (for Kanban drag & drop)
router.patch('/:id/status', validateTaskStatus, validate, updateTaskStatus);

// Single task item routes
router.route('/:id')
  .get(validateTaskId, validate, getTaskById)
  .put(validateUpdateTask, validate, updateTask)
  .patch(validateUpdateTask, validate, updateTask)
  .delete(validateTaskId, validate, deleteTask);

export default router;
