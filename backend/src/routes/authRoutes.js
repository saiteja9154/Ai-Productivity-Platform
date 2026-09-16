import express from 'express';
import { register, login } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../validators/authValidator.js';
import validate from '../middleware/validationMiddleware.js';

const router = express.Router();

// Register a new user
router.post('/register', validateRegister, validate, register);

// Login and acquire JWT
router.post('/login', validateLogin, validate, login);

export default router;
