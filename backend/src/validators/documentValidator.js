import { body, param, query } from 'express-validator';

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
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('content')
    .optional()
    .isString()
    .withMessage('Document content must be a string'),
  body('documentType')
    .optional()
    .isIn(['TEXT', 'FILE', 'text', 'file'])
    .withMessage('Document type must be TEXT or FILE'),
  body('owner')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Owner User ID format'),
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
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('content')
    .optional()
    .isString()
    .withMessage('Document content must be a string'),
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

export default {
  validateDocumentId,
  validateCreateDocument,
  validateUpdateDocument
};
