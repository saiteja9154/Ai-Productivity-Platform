import express from 'express';
import { getApiHealth, getDbHealth } from '../controllers/healthController.js';

const router = express.Router();

router.get('/', getApiHealth);
router.get('/db', getDbHealth);

export default router;
