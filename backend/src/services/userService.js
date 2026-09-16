import User from '../models/User.js';
import { logAuditAction } from './auditService.js';

export const getAllUsers = async (query = {}) => {
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.team) filter.team = query.team;
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

  const users = await User.find(filter)
    .populate('team', 'name description')
    .select('-password')
    .sort({ createdAt: -1 })
    .lean();

  return users;
};

export const getUserById = async (id) => {
  const user = await User.findById(id)
    .populate('team', 'name description')
    .select('-password')
    .lean();

  return user;
};

export const createUser = async (userData, actorId = null) => {
  const user = await User.create(userData);
  const userObject = user.toObject();
  delete userObject.password;

  await logAuditAction({
    user: actorId || user._id,
    action: 'USER_CREATED',
    entityType: 'User',
    entityId: user._id,
    details: { name: user.name, email: user.email, role: user.role }
  });

  return userObject;
};

export const updateUser = async (id, updateData, actorId = null) => {
  const user = await User.findByIdAndUpdate(id, updateData, {
    returnDocument: 'after',
    runValidators: true
  })
    .populate('team', 'name description')
    .select('-password')
    .lean();

  if (user) {
    await logAuditAction({
      user: actorId,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: id,
      details: { updatedFields: Object.keys(updateData) }
    });
  }

  return user;
};

export const deleteUser = async (id, actorId = null) => {
  const user = await User.findByIdAndDelete(id).select('-password').lean();

  if (user) {
    await logAuditAction({
      user: actorId,
      action: 'USER_DELETED',
      entityType: 'User',
      entityId: id,
      details: { name: user.name, email: user.email }
    });
  }

  return user;
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId)
    .populate('team', 'name description')
    .select('-password')
    .lean();

  if (!user) {
    const error = new Error('User profile not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    _id: user._id,
    userId: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    team: user.team,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

export const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const updatedFields = [];

  if (updateData.name !== undefined) {
    user.name = updateData.name.trim();
    updatedFields.push('name');
  }

  if (updateData.email !== undefined) {
    const normalizedEmail = updateData.email.toLowerCase().trim();
    if (normalizedEmail !== user.email) {
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } });
      if (existing) {
        const error = new Error('Email is already in use by another account');
        error.statusCode = 400;
        throw error;
      }
      user.email = normalizedEmail;
      updatedFields.push('email');
    }
  }

  await user.save();

  await logAuditAction({
    user: userId,
    action: 'USER_PROFILE_UPDATED',
    entityType: 'User',
    entityId: userId,
    details: { updatedFields }
  });

  return {
    _id: user._id,
    userId: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    team: user.team,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

export default {
  getAllUsers,
  getUserById,
  getUserProfile,
  createUser,
  updateUser,
  updateUserProfile,
  deleteUser
};

