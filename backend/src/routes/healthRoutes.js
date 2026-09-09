import express from 'express';
import { getApiHealth, getDbHealth } from '../controllers/healthController.js';

const router = express.Router();

// GET /api/health
router.get('/', getApiHealth);

// GET /api/health/db
router.get('/db', getDbHealth);

export default router;
