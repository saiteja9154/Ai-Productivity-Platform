import { body, param } from 'express-validator';

export const validateTeamId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Team ID format')
];

export const validateCreateTeam = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Team name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Team name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('createdBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Creator User ID format')
];

export const validateUpdateTeam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Team ID format'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Team name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Team name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('createdBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Creator User ID format')
];
