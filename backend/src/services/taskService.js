import Task from '../models/Task.js';
import { logAuditAction } from './auditService.js';

/**
 * Retrieve tasks with server-side search, filtering, sorting, and pagination
 */
export const getAllTasks = async (query = {}) => {
  const filter = {};

  // Status filter (flexible for todo/pending, in-progress, completed)
  if (query.status) {
    const raw = query.status.toLowerCase().replace('_', '-');
    if (raw === 'todo' || raw === 'pending') {
      filter.status = { $in: ['todo', 'pending', 'TODO'] };
    } else if (raw === 'in-progress' || raw === 'in_progress') {
      filter.status = { $in: ['in-progress', 'IN_PROGRESS'] };
    } else if (raw === 'completed') {
      filter.status = { $in: ['completed', 'COMPLETED'] };
    } else {
      filter.status = query.status;
    }
  }

  // Priority filter
  if (query.priority) {
    filter.priority = query.priority.toLowerCase();
  }

  // Team filter
  if (query.team) {
    filter.team = query.team;
  }

  // Assignee filter (supports assignedTo and assignee aliases)
  if (query.assignedTo || query.assignee) {
    const userId = query.assignedTo || query.assignee;
    filter.$or = [{ assignedTo: userId }, { assignee: userId }];
  }

  // Creator filter
  if (query.createdBy) {
    filter.createdBy = query.createdBy;
  }

  // Server-side text search (title or description)
  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    const searchCond = [{ title: searchRegex }, { description: searchRegex }];
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: searchCond }];
      delete filter.$or;
    } else {
      filter.$or = searchCond;
    }
  }

  // Sorting
  let sortOptions = { createdAt: -1 };
  if (query.sortBy) {
    const field = query.sortBy === 'deadline' ? 'dueDate' : query.sortBy;
    const order = query.sortOrder === 'asc' || query.sortOrder === '1' ? 1 : -1;
    sortOptions = { [field]: order };
  }

  // Pagination
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 50, 1), 100);
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('assignedTo', 'name email role')
      .populate('assignee', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('team', 'name')
      .populate('relatedDocument', 'title fileUrl')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    Task.countDocuments(filter)
  ]);

  tasks.pagination = {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1
  };

  return tasks;
};

/**
 * Compute real-time task metrics and overview counts
 */
export const getTaskMetrics = async (query = {}) => {
  const baseFilter = {};
  if (query.team) baseFilter.team = query.team;
  if (query.assignedTo || query.assignee) {
    const userId = query.assignedTo || query.assignee;
    baseFilter.$or = [{ assignedTo: userId }, { assignee: userId }];
  }

  const now = new Date();

  const [total, todo, inProgress, completed, overdue] = await Promise.all([
    Task.countDocuments(baseFilter),
    Task.countDocuments({ ...baseFilter, status: { $in: ['todo', 'pending', 'TODO'] } }),
    Task.countDocuments({ ...baseFilter, status: { $in: ['in-progress', 'IN_PROGRESS'] } }),
    Task.countDocuments({ ...baseFilter, status: { $in: ['completed', 'COMPLETED'] } }),
    Task.countDocuments({
      ...baseFilter,
      dueDate: { $lt: now, $ne: null },
      status: { $nin: ['completed', 'COMPLETED'] }
    })
  ]);

  return {
    total,
    todo,
    inProgress,
    completed,
    overdue
  };
};

/**
 * Retrieve single task by ID
 */
export const getTaskById = async (id) => {
  const task = await Task.findById(id)
    .populate('assignedTo', 'name email role')
    .populate('assignee', 'name email role')
    .populate('createdBy', 'name email role')
    .populate('team', 'name')
    .populate('relatedDocument', 'title fileUrl')
    .lean();

  return task;
};

/**
 * Create a new task
 */
export const createTask = async (taskData, actorId = null) => {
  const payload = {
    ...taskData,
    createdBy: taskData.createdBy || actorId,
    assignedTo: taskData.assignedTo || taskData.assignee || null,
    assignee: taskData.assignee || taskData.assignedTo || null,
    dueDate: taskData.dueDate || taskData.deadline || null,
    deadline: taskData.deadline || taskData.dueDate || null
  };

  const task = await Task.create(payload);
  const populatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email role')
    .populate('assignee', 'name email role')
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

/**
 * Update task details
 */
export const updateTask = async (id, updateData, actorId = null) => {
  const safeData = { ...updateData };

  // Sync deadline and dueDate in updates
  if (safeData.deadline && !safeData.dueDate) safeData.dueDate = safeData.deadline;
  if (safeData.dueDate && !safeData.deadline) safeData.deadline = safeData.dueDate;

  // Sync assignee and assignedTo in updates
  if (safeData.assignee && !safeData.assignedTo) safeData.assignedTo = safeData.assignee;
  if (safeData.assignedTo && !safeData.assignee) safeData.assignee = safeData.assignedTo;

  // Normalize status if present
  if (safeData.status) {
    const s = safeData.status.toLowerCase().replace('_', '-');
    safeData.status = s === 'pending' ? 'todo' : s;
  }

  // Normalize priority if present
  if (safeData.priority) {
    safeData.priority = safeData.priority.toLowerCase();
  }

  const task = await Task.findByIdAndUpdate(id, safeData, {
    returnDocument: 'after',
    runValidators: true
  })
    .populate('assignedTo', 'name email role')
    .populate('assignee', 'name email role')
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
      details: { updatedFields: Object.keys(safeData) }
    });
  }

  return task;
};

/**
 * Update task status specifically (for Kanban drag & drop transitions)
 */
export const updateTaskStatus = async (id, newStatus, actorId = null) => {
  const normalized = newStatus.toLowerCase().replace('_', '-');
  const targetStatus = normalized === 'pending' ? 'todo' : normalized;

  const task = await Task.findByIdAndUpdate(
    id,
    { status: targetStatus },
    { returnDocument: 'after', runValidators: true }
  )
    .populate('assignedTo', 'name email role')
    .populate('assignee', 'name email role')
    .populate('createdBy', 'name email role')
    .populate('team', 'name')
    .populate('relatedDocument', 'title fileUrl')
    .lean();

  if (task) {
    await logAuditAction({
      user: actorId,
      action: 'TASK_STATUS_CHANGED',
      entityType: 'Task',
      entityId: id,
      details: { newStatus: targetStatus }
    });
  }

  return task;
};

/**
 * Delete task
 */
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
  getTaskMetrics,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};
