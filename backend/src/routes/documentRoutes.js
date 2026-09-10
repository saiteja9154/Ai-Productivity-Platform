import express from 'express';
import {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument
} from '../controllers/documentController.js';
import {
  validateCreateDocument,
  validateUpdateDocument,
  validateDocumentId
} from '../validators/documentValidator.js';
import validate from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getDocuments)
  .post(validateCreateDocument, validate, createDocument);

router.route('/:id')
  .get(validateDocumentId, validate, getDocumentById)
  .put(validateUpdateDocument, validate, updateDocument)
  .delete(validateDocumentId, validate, deleteDocument);

export default router;
