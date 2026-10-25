import { body, param } from 'express-validator';

const STATUS_VALUES = ['todo', 'in-progress', 'completed', 'pending', 'TODO', 'IN_PROGRESS', 'COMPLETED'];
const PRIORITY_VALUES = ['low', 'medium', 'high', 'urgent', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const validateTaskId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Task ID format')
];

export const validateCreateTask = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('assignedTo')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Assigned User ID format'),
  body('assignee')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Assignee User ID format'),
  body('createdBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Creator User ID format'),
  body('team')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Team ID format'),
  body('status')
    .optional()
    .isIn(STATUS_VALUES)
    .withMessage('Status must be one of: todo, in-progress, completed (or pending)'),
  body('priority')
    .optional()
    .isIn(PRIORITY_VALUES)
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO8601 date string'),
  body('deadline')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Deadline must be a valid ISO8601 date string'),
  body('relatedDocument')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Related Document ID format')
];

export const validateUpdateTask = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Task ID format'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('assignedTo')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Assigned User ID format'),
  body('assignee')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Assignee User ID format'),
  body('createdBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Creator User ID format'),
  body('team')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Team ID format'),
  body('status')
    .optional()
    .isIn(STATUS_VALUES)
    .withMessage('Status must be one of: todo, in-progress, completed (or pending)'),
  body('priority')
    .optional()
    .isIn(PRIORITY_VALUES)
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO8601 date string'),
  body('deadline')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Deadline must be a valid ISO8601 date string'),
  body('relatedDocument')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Related Document ID format')
];

export const validateTaskStatus = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Task ID format'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(STATUS_VALUES)
    .withMessage('Status must be one of: todo, in-progress, completed (or pending)')
];

export default {
  validateTaskId,
  validateCreateTask,
  validateUpdateTask,
  validateTaskStatus
};
