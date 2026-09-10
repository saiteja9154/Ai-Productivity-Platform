import { body, param } from 'express-validator';

export const validateWorkflowId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Workflow ID format')
];

export const validateStepId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Workflow ID format'),
  param('stepId')
    .isMongoId()
    .withMessage('Invalid Workflow Step ID format')
];

export const validateCreateWorkflow = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Workflow name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Workflow name must be between 2 and 150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
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
    .isIn(['draft', 'active', 'paused', 'completed', 'archived'])
    .withMessage('Status must be one of: draft, active, paused, completed, archived')
];

export const validateUpdateWorkflow = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Workflow ID format'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Workflow name cannot be empty')
    .isLength({ min: 2, max: 150 })
    .withMessage('Workflow name must be between 2 and 150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
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
    .isIn(['draft', 'active', 'paused', 'completed', 'archived'])
    .withMessage('Status must be one of: draft, active, paused, completed, archived')
];

export const validateCreateWorkflowStep = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Workflow ID format'),
  body('stepName')
    .trim()
    .notEmpty()
    .withMessage('Step name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Step name must be between 2 and 150 characters'),
  body('stepOrder')
    .notEmpty()
    .withMessage('Step order is required')
    .isInt({ min: 1 })
    .withMessage('Step order must be an integer >= 1'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'skipped'])
    .withMessage('Status must be one of: pending, in-progress, completed, skipped')
];

export const validateUpdateWorkflowStep = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Workflow ID format'),
  param('stepId')
    .isMongoId()
    .withMessage('Invalid Workflow Step ID format'),
  body('stepName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Step name cannot be empty')
    .isLength({ min: 2, max: 150 }),
  body('stepOrder')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Step order must be an integer >= 1'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'skipped'])
    .withMessage('Status must be one of: pending, in-progress, completed, skipped')
];
