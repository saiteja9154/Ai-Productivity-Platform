import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validateUserId
} from '../validators/userValidator.js';
import validate from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getUsers)
  .post(validateCreateUser, validate, createUser);

router.route('/:id')
  .get(validateUserId, validate, getUserById)
  .put(validateUpdateUser, validate, updateUser)
  .delete(validateUserId, validate, deleteUser);

export default router;
