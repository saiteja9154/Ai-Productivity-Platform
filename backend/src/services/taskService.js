import Task from '../models/Task.js';
import { logAuditAction } from './auditService.js';

export const getAllTasks = async (query = {}) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.team) filter.team = query.team;
  if (query.assignedTo) filter.assignedTo = query.assignedTo;
  if (query.createdBy) filter.createdBy = query.createdBy;

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role')
    .populate('team', 'name')
    .populate('relatedDocument', 'title fileUrl')
    .sort({ createdAt: -1 })
    .lean();

  return tasks;
};

export const getTaskById = async (id) => {
  const task = await Task.findById(id)
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role')
    .populate('team', 'name')
    .populate('relatedDocument', 'title fileUrl')
    .lean();

  return task;
};

export const createTask = async (taskData, actorId = null) => {
  const payload = {
    ...taskData,
    createdBy: taskData.createdBy || actorId
  };

  const task = await Task.create(payload);
  const populatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role')
    .populate('team', 'name')
    .populate('relatedDocument', 'title fileUrl')
    .lean();

  await logAuditAction({
    user: actorId || task.createdBy,
    action: 'TASK_CREATED',
    entityType: 'Task',
    entityId: task._id,
    details: { title: task.title, status: task.status, priority: task.priority }
  });

  return populatedTask;
};

export const updateTask = async (id, updateData, actorId = null) => {
  const task = await Task.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  })
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role')
    .populate('team', 'name')
    .populate('relatedDocument', 'title fileUrl')
    .lean();

  if (task) {
    await logAuditAction({
      user: actorId,
      action: 'TASK_UPDATED',
      entityType: 'Task',
      entityId: id,
      details: { updatedFields: Object.keys(updateData) }
    });
  }

  return task;
};

export const deleteTask = async (id, actorId = null) => {
  const task = await Task.findByIdAndDelete(id).lean();

  if (task) {
    await logAuditAction({
      user: actorId,
      action: 'TASK_DELETED',
      entityType: 'Task',
      entityId: id,
      details: { title: task.title }
    });
  }

  return task;
};

export default {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
