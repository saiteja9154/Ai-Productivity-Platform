import { body, param } from 'express-validator';

export const validateDocumentId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Document ID format')
];

export const validateCreateDocument = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Document title is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('content')
    .notEmpty()
    .withMessage('Document content is required'),
  body('uploadedBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Uploader User ID format'),
  body('team')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Team ID format'),
  body('fileUrl')
    .optional()
    .isString()
    .withMessage('File URL must be a string')
];

export const validateUpdateDocument = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Document ID format'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Document title cannot be empty')
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('content')
    .optional()
    .notEmpty()
    .withMessage('Document content cannot be empty'),
  body('uploadedBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Uploader User ID format'),
  body('team')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Team ID format'),
  body('fileUrl')
    .optional()
    .isString()
    .withMessage('File URL must be a string')
];
