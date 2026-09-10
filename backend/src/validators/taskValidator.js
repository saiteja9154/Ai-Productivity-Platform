import { body, param } from 'express-validator';

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
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be one of: pending, in-progress, completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO8601 date string'),
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
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be one of: pending, in-progress, completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO8601 date string'),
  body('relatedDocument')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Related Document ID format')
];
