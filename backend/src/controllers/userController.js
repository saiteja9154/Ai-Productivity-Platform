import userService from '../services/userService.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers(req.query);
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id: ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const user = await userService.createUser(req.body, actorId);
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const user = await userService.updateUser(req.params.id, req.body, actorId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id: ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const user = await userService.deleteUser(req.params.id, actorId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id: ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
