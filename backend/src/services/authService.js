import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { logAuditAction } from './auditService.js';

/**
 * Registers a new user
 * @param {Object} userData - { name, email, password, role }
 * @returns {Promise<Object>} Safe created user object
 */
export const registerUser = async (userData) => {
  const normalizedEmail = userData.email ? userData.email.toLowerCase().trim() : '';

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('Email is already registered. Please login or use a different email.');
    error.statusCode = 400;
    throw error;
  }

  // Create new user (pre-save hook hashes the password)
  const newUser = await User.create({
    name: userData.name.trim(),
    email: normalizedEmail,
    password: userData.password,
    role: userData.role || 'user'
  });

  const safeUser = {
    _id: newUser._id,
    userId: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    isActive: newUser.isActive,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt
  };

  await logAuditAction({
    user: newUser._id,
    action: 'USER_REGISTERED',
    entityType: 'User',
    entityId: newUser._id,
    details: { name: newUser.name, email: newUser.email, role: newUser.role }
  });

  return safeUser;
};

/**
 * Authenticates user credentials and generates a JWT
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} { token, user }
 */
export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email ? email.toLowerCase().trim() : '';

  // Find user by normalized email
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (user.isActive === false) {
    const error = new Error('Account is deactivated. Please contact an administrator.');
    error.statusCode = 403;
    throw error;
  }

  // Compare candidate password against stored bcrypt hash
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  });

  const safeUser = {
    _id: user._id,
    userId: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  await logAuditAction({
    user: user._id,
    action: 'USER_LOGIN',
    entityType: 'User',
    entityId: user._id,
    details: { email: user.email, role: user.role }
  });

  return {
    token,
    user: safeUser
  };
};

export default {
  registerUser,
  loginUser
};
