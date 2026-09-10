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
    new: true,
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

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
