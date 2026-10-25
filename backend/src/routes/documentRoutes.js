import express from 'express';
import {
  getDocuments,
  getDocumentById,
  createDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  downloadDocument
} from '../controllers/documentController.js';
import {
  validateCreateDocument,
  validateUpdateDocument,
  validateDocumentId
} from '../validators/documentValidator.js';
import validate from '../middleware/validationMiddleware.js';
import { handleUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Upload document file route (Multer file handler)
router.post('/upload', handleUpload, uploadDocument);

// Document collection routes
router.route('/')
  .get(getDocuments)
  .post(validateCreateDocument, validate, createDocument);

// Secure file download route
router.get('/:id/download', validateDocumentId, validate, downloadDocument);

// Single document item routes
router.route('/:id')
  .get(validateDocumentId, validate, getDocumentById)
  .put(validateUpdateDocument, validate, updateDocument)
  .patch(validateUpdateDocument, validate, updateDocument)
  .delete(validateDocumentId, validate, deleteDocument);

export default router;
