import AuditLog from '../models/AuditLog.js';

/**
 * Record an audit log entry
 */
export const logAuditAction = async ({ user = null, action, entityType, entityId, details = {} }) => {
  try {
    const log = await AuditLog.create({
      user,
      action,
      entityType,
      entityId,
      details
    });
    return log;
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
    return null;
  }
};

/**
 * Retrieve paginated audit logs with optional filtering
 */
export const getAuditLogs = async (query = {}) => {
  const filter = {};

  if (query.entityType) {
    filter.entityType = query.entityType;
  }
  if (query.action) {
    filter.action = query.action;
  }
  if (query.user) {
    filter.user = query.user;
  }
  if (query.entityId) {
    filter.entityId = query.entityId;
  }

  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 50, 1), 100);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(filter)
  ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Retrieve a single audit log entry by ID
 */
export const getAuditLogById = async (id) => {
  const log = await AuditLog.findById(id).populate('user', 'name email role').lean();
  return log;
};

export default {
  logAuditAction,
  getAuditLogs,
  getAuditLogById
};
