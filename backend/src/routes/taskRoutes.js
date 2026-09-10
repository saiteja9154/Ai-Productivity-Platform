import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId
} from '../validators/taskValidator.js';
import validate from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getTasks)
  .post(validateCreateTask, validate, createTask);

router.route('/:id')
  .get(validateTaskId, validate, getTaskById)
  .put(validateUpdateTask, validate, updateTask)
  .delete(validateTaskId, validate, deleteTask);

export default router;
