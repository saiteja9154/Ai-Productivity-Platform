import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile
} from '../controllers/userController.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validateUserId
} from '../validators/userValidator.js';
import { validateUpdateProfile } from '../validators/authValidator.js';
import validate from '../middleware/validationMiddleware.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Current Authenticated User Profile
router.route('/profile')
  .get(requireAuth, getProfile)
  .put(requireAuth, validateUpdateProfile, validate, updateProfile);

// Admin-Only Route Example for Role Verification
router.get('/admin/overview', requireAuth, authorizeRoles('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin access granted',
    user: req.user
  });
});

// User Resource CRUD Routes
router.route('/')
  .get(getUsers)
  .post(validateCreateUser, validate, createUser);

router.route('/:id')
  .get(validateUserId, validate, getUserById)
  .put(validateUpdateUser, validate, updateUser)
  .delete(validateUserId, validate, deleteUser);

export default router;

