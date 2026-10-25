import taskService from '../services/taskService.js';

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getAllTasks(req.query);
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
      pagination: tasks.pagination || null
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskMetrics = async (req, res, next) => {
  try {
    const metrics = await taskService.getTaskMetrics(req.query);
    res.status(200).json({
      success: true,
      data: metrics
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
    const actorId = req.user?.userId || req.user?.id || req.user?._id || null;
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
    const actorId = req.user?.userId || req.user?.id || req.user?._id || null;
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

export const updateTaskStatus = async (req, res, next) => {
  try {
    const actorId = req.user?.userId || req.user?.id || req.user?._id || null;
    const { status } = req.body;
    const task = await taskService.updateTaskStatus(req.params.id, status, actorId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id: ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const actorId = req.user?.userId || req.user?.id || req.user?._id || null;
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
  getTaskMetrics,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};
