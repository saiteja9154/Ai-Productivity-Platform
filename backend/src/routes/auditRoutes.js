import express from 'express';
import { getAuditLogs, getAuditLogById } from '../controllers/auditController.js';
import { param } from 'express-validator';
import validate from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAuditLogs);

router.route('/:id')
  .get(
    param('id').isMongoId().withMessage('Invalid Audit Log ID format'),
    validate,
    getAuditLogById
  );

export default router;
