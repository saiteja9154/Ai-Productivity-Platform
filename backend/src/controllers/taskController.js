import taskService from '../services/taskService.js';

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getAllTasks(req.query);
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id: ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const task = await taskService.createTask(req.body, actorId);
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const task = await taskService.updateTask(req.params.id, req.body, actorId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id: ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const actorId = req.user?.id || null;
    const task = await taskService.deleteTask(req.params.id, actorId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id: ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
