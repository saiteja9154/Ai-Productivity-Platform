import auditService from '../services/auditService.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const result = await auditService.getAuditLogs(req.query);
    res.status(200).json({
      success: true,
      count: result.logs.length,
      pagination: result.pagination,
      data: result.logs
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogById = async (req, res, next) => {
  try {
    const log = await auditService.getAuditLogById(req.params.id);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: `Audit log not found with id: ${req.params.id}`
      });
    }
    res.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAuditLogs,
  getAuditLogById
};
